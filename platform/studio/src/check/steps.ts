import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { ReadKind } from "./reads";
import { rootFiles } from "./shared";

/**
 * A `pnpm check` step that runs only when something it depends on changed. The step runs under
 * trace-step.ts, which notes every module it imported and every file it read (its bytes, its
 * listing, or just whether it is there). When it passes, those are stamped; next time, if each is
 * the same (and the repo's root files, Node, and the step's own command), it is skipped. Nothing is
 * declared by hand. `force` runs it regardless.
 */

type Reads = Record<string, ReadKind>;
type Stamp = { key: string; reads: Reads };

function state(path: string, kind: ReadKind): string {
  if (!existsSync(path)) return "missing";
  const s = statSync(path);
  if (kind === "presence") return s.isDirectory() ? "dir" : "file";
  if (s.isDirectory()) return `dir:${readdirSync(path).sort().join("\n")}`;
  if (kind === "listing") return "file";
  return createHash("sha1").update(readFileSync(path)).digest("hex");
}

function keyOf(root: string, reads: Reads, command: string): string {
  const h = createHash("sha1");
  const all: Reads = { ...reads };
  for (const file of rootFiles(root)) all[file] = "content";
  for (const path of Object.keys(all).sort()) {
    const kind = all[path] as ReadKind;
    h.update(`${path}\0${kind}\0${state(path, kind)}\n`);
  }
  h.update(`${process.version}\n${command}\n`);
  return h.digest("hex");
}

export async function stampedStep(
  root: string,
  name: string,
  { cwd, tsx, args, force }: { cwd: string; tsx: string[]; args: string[]; force: boolean },
): Promise<boolean> {
  const dir = join(root, "node_modules", ".cache", "chalk-check", "steps");
  const stampFile = join(dir, `${name.replace(/\W+/g, "-")}.json`);
  const command = [...tsx, ...args].join(" ");
  if (!force && existsSync(stampFile)) {
    try {
      const stamp = JSON.parse(readFileSync(stampFile, "utf8")) as Stamp;
      if (keyOf(root, stamp.reads, command) === stamp.key) {
        console.log("  · unchanged");
        return true;
      }
    } catch {}
  }
  mkdirSync(dir, { recursive: true });
  const trace = join(dir, `${name.replace(/\W+/g, "-")}.trace.json`);
  rmSync(trace, { force: true });
  const started = Date.now();
  const ok = await new Promise<boolean>((done) => {
    const child = spawn(
      tsx[0] as string,
      [...tsx.slice(1), "--import", join(root, "platform/studio/src/check/trace-step.ts"), ...args],
      { cwd, stdio: "inherit", env: { ...process.env, CHALK_TRACE_OUT: trace } },
    );
    child.on("close", (code) => done(code === 0));
    child.on("error", () => done(false));
  });
  const reads = ok && existsSync(trace) ? (JSON.parse(readFileSync(trace, "utf8")) as Reads) : null;
  // Stamped only if nothing it read changed while it ran: else the stamp would vouch for files
  // the step never saw.
  const isSteady =
    reads !== null &&
    Object.keys(reads).every((path) => !existsSync(path) || statSync(path).mtimeMs < started);
  if (reads !== null && isSteady)
    writeFileSync(stampFile, JSON.stringify({ key: keyOf(root, reads, command), reads }));
  else rmSync(stampFile, { force: true });
  rmSync(trace, { force: true });
  return ok;
}
