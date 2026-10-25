import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, matchesGlob, relative } from "node:path";
import { rootFiles } from "./shared";

/**
 * Biome on the files that changed since they last passed, and only those. Biome checks each file
 * on its own (formatting and lint rules look at one file), so a file that passed and hasn't changed
 * byte for byte, under the same biome.json and Biome (both root files), passes again. Every file
 * Biome could check is a candidate; Biome itself applies biome.json's ignores to the ones passed,
 * so the set checked is exactly Biome's. Folders biome.json ignores whole are not walked.
 */

const CHECKED = /\.(?:[cm]?[jt]sx?|jsonc?|css|graphql|gql|grit|astro|vue|svelte)$/;

type Stamp = { key: string; files: Record<string, string> };

function ignoredFolders(root: string): string[] {
  try {
    const config = JSON.parse(readFileSync(join(root, "biome.json"), "utf8")) as {
      files?: { ignore?: string[] };
    };
    return (config.files?.ignore ?? []).filter((g) => g.endsWith("/**")).map((g) => g.slice(0, -3));
  } catch {
    return [];
  }
}

function candidates(root: string): string[] {
  const skip = ignoredFolders(root);
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const full = join(dir, entry.name);
      const rel = relative(root, full);
      if (entry.isDirectory()) {
        if (!skip.some((g) => matchesGlob(rel, g))) walk(full);
      } else if (entry.isFile() && CHECKED.test(entry.name)) out.push(rel);
    }
  };
  walk(root);
  return out.sort();
}

const hashOf = (file: string) => createHash("sha1").update(readFileSync(file)).digest("hex");

function biome(root: string, files: string[]): Promise<boolean> {
  return new Promise((done) => {
    const child = spawn(
      join(root, "node_modules", ".bin", "biome"),
      ["check", "--no-errors-on-unmatched", "--files-ignore-unknown=true", ...files],
      { cwd: root, stdio: "inherit" },
    );
    child.on("close", (code) => done(code === 0));
    child.on("error", () => done(false));
  });
}

export async function lint(root: string, options: { force: boolean }): Promise<boolean> {
  const dir = join(root, "node_modules", ".cache", "chalk-check");
  const stampFile = join(dir, "lint.json");
  const key = createHash("sha1")
    .update(
      rootFiles(root)
        .map((f) => `${f}\0${hashOf(f)}`)
        .join("\n"),
    )
    .digest("hex");
  let stamp: Stamp = { key, files: {} };
  if (!options.force && existsSync(stampFile)) {
    try {
      const was = JSON.parse(readFileSync(stampFile, "utf8")) as Stamp;
      if (was.key === key) stamp = was;
    } catch {}
  }
  // Hashed before Biome runs, so an edit made meanwhile is checked next time.
  const now = new Map(candidates(root).map((f) => [f, hashOf(join(root, f))]));
  const stale = [...now].filter(([f, h]) => stamp.files[f] !== h).map(([f]) => f);
  console.log(`lint: ${stale.length} to check, ${now.size - stale.length} unchanged`);
  let ok = true;
  // In chunks: a command line has a length limit.
  for (let i = 0; i < stale.length && ok; i += 400) ok = await biome(root, stale.slice(i, i + 400));
  if (!ok) return false;
  const files: Record<string, string> = {};
  for (const [f, h] of now) files[f] = h;
  mkdirSync(dir, { recursive: true });
  if (stale.length > 0 || stamp.key !== key)
    writeFileSync(stampFile, JSON.stringify({ key, files }));
  return true;
}
