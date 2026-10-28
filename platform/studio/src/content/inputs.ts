import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Everything a content build could read, as one hash: every file under content/, library/ and
 * platform/ (paths and bytes) and the repo's root files. A superset of what any build reads, so
 * when it is unchanged since the last good build, build/ is already what a build would write and
 * the build can be skipped (look and play do). A long-lived process (the MCP server) asks often:
 * the files are hashed again only when one's time or size moved (an edit moves both, so edits are
 * always seen); otherwise the last hash stands.
 */

/** Never read by a build: dependencies, outputs, and a chapter's comments, runs and source. */
const SKIP = new Set(["node_modules", ".git", "dist", "out", "comments.yaml", "runs", "source"]);

/** The last hash, and the files' times and sizes it was made from. */
let last: { root: string; stamp: string; key: string } | undefined;

export function buildInputsKey(root: string): string {
  const files: string[] = [];
  const stamps: string[] = [];
  const add = (file: string, s: { mtimeMs: number; size: number }) => {
    files.push(file);
    stamps.push(`${file}:${s.mtimeMs}:${s.size}`);
  };
  const walk = (dir: string) => {
    for (const name of readdirSync(dir).sort()) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (s.isFile()) add(full, s);
    }
  };
  for (const name of readdirSync(root).sort()) {
    const full = join(root, name);
    const s = statSync(full);
    if (s.isFile()) add(full, s);
  }
  for (const top of ["content", "library", "platform"])
    if (existsSync(join(root, top))) walk(join(root, top));
  const stamp = stamps.join("\n");
  if (last !== undefined && last.root === root && last.stamp === stamp) return last.key;
  const h = createHash("sha1");
  for (const file of files) {
    h.update(file.slice(root.length));
    h.update("\0");
    h.update(readFileSync(file));
    h.update("\n");
  }
  h.update(process.version);
  const key = h.digest("hex");
  last = { root, stamp, key };
  return key;
}

/** Where the inputs key of the last build that passed is kept. */
export const inputsKeyFile = (root: string): string =>
  join(root, "node_modules", ".cache", "chalk-content", "inputs.key");

/** Whether build/ is the last good build of exactly what is on disk now. */
export function isBuildCurrent(root: string): boolean {
  const file = inputsKeyFile(root);
  if (!existsSync(file) || !existsSync(join(root, "build", "index.json"))) return false;
  return readFileSync(file, "utf8").trim() === buildInputsKey(root);
}
