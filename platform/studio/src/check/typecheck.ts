import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { dirname, join, resolve } from "node:path";
import { workspaceDirs } from "../boundaries";
import { filesUnder, fingerprint } from "../content/deps";
import { rootFiles } from "./shared";

/**
 * Type-checks every workspace package, skipping the ones nothing has changed for. After a package
 * passes, the files TypeScript actually read for it (its program, from its .tsbuildinfo: its own
 * sources and every other package's it imports, by any path) are stamped with their hashes. Next
 * time, if every stamped file, the package's own folder and the repo's root files are byte-for-byte
 * the same, the package is skipped; otherwise TypeScript runs again (incrementally). Nothing is
 * declared by hand.
 */

const BUILD_INFO = join("node_modules", ".cache", "typecheck.tsbuildinfo");

type Stamp = { key: string; files: string[] };

/**
 * The package's own files that could join its program: everything its tsconfig includes (a new
 * file there changes the key), plus its tsconfig and package.json.
 */
function ownFiles(dir: string): string[] {
  let include: string[] | undefined;
  try {
    include = (
      JSON.parse(readFileSync(join(dir, "tsconfig.json"), "utf8")) as { include?: string[] }
    ).include;
  } catch {
    include = undefined; // unreadable: take the whole folder
  }
  const listed = (include ?? ["."]).flatMap((entry) => {
    const path = join(dir, entry.split("*")[0] ?? "");
    return existsSync(path) && statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
  return [...listed, join(dir, "tsconfig.json"), join(dir, "package.json")];
}

/** The files TypeScript read for this package, from its build info (outside node_modules). */
function programFiles(dir: string): string[] | undefined {
  const file = join(dir, BUILD_INFO);
  if (!existsSync(file)) return undefined;
  try {
    const info = JSON.parse(readFileSync(file, "utf8")) as {
      program?: { fileNames?: string[] };
      fileNames?: string[];
    };
    const names = info.program?.fileNames ?? info.fileNames ?? [];
    return names.map((n) => resolve(dirname(file), n)).filter((f) => !f.includes("/node_modules/"));
  } catch {
    return undefined;
  }
}

function run(cmd: string, args: string[], cwd: string): Promise<{ code: number; out: string }> {
  return new Promise((done) => {
    const child = spawn(cmd, args, { cwd, env: process.env });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.stderr.on("data", (d) => {
      out += d;
    });
    child.on("close", (code) => done({ code: code ?? 1, out }));
    child.on("error", (e) => done({ code: 1, out: e.message }));
  });
}

export async function typecheck(root: string, options: { force: boolean }): Promise<boolean> {
  const stamps = join(root, "node_modules", ".cache", "chalk-check", "typecheck");
  if (options.force) rmSync(stamps, { recursive: true, force: true });
  mkdirSync(stamps, { recursive: true });
  const shared = rootFiles(root);
  const tsc = join(root, "node_modules", "typescript", "bin", "tsc");
  const packages = workspaceDirs(root).filter((d) => existsSync(join(root, d, "tsconfig.json")));
  const stale: string[] = [];
  for (const rel of packages) {
    const dir = join(root, rel);
    const stampFile = join(stamps, `${rel.replace(/\//g, "__")}.json`);
    let stamp: Stamp | undefined;
    try {
      stamp = existsSync(stampFile)
        ? (JSON.parse(readFileSync(stampFile, "utf8")) as Stamp)
        : undefined;
    } catch {
      stamp = undefined;
    }
    const isFresh =
      stamp !== undefined &&
      fingerprint([...stamp.files, ...ownFiles(dir), ...shared]) === stamp.key;
    if (!isFresh) stale.push(rel);
  }
  const skipped = packages.length - stale.length;
  console.log(`typecheck: ${stale.length} to check, ${skipped} unchanged`);
  let ok = true;
  const queue = [...stale];
  const workers = Math.max(1, Math.min(queue.length, Math.ceil(cpus().length / 2)));
  await Promise.all(
    Array.from({ length: workers }, async () => {
      for (let rel = queue.shift(); rel !== undefined; rel = queue.shift()) {
        const dir = join(root, rel);
        const result = await run(
          process.execPath,
          [tsc, "-p", "tsconfig.json", "--incremental", "--tsBuildInfoFile", BUILD_INFO],
          dir,
        );
        if (result.code !== 0) {
          ok = false;
          console.error(`✗ ${rel}\n${result.out.trim()}`);
          continue;
        }
        const program = programFiles(dir);
        if (program === undefined) continue; // no build info: check it again next time
        const files = [...new Set(program)];
        const stamp: Stamp = { key: fingerprint([...files, ...ownFiles(dir), ...shared]), files };
        writeFileSync(join(stamps, `${rel.replace(/\//g, "__")}.json`), JSON.stringify(stamp));
        console.log(`  ✓ ${rel}`);
      }
    }),
  );
  return ok;
}
