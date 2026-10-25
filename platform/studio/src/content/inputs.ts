import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Everything a content build could read, as one hash: every file under content/, library/ and
 * platform/ (paths and bytes) and the repo's root files. A superset of what any build reads, so
 * when it is unchanged since the last good build, build/ is already what a build would write and
 * the build can be skipped (render_board does). Never cached between calls: a long-lived process
 * (the MCP server) must see edits.
 */

/** Never read by a build: dependencies, outputs, and a chapter's comments, runs and source. */
const SKIP = new Set(["node_modules", ".git", "dist", "out", ".comments", "runs", "source"]);

export function buildInputsKey(root: string): string {
  const h = createHash("sha1");
  const add = (file: string) => {
    h.update(file.slice(root.length));
    h.update("\0");
    h.update(readFileSync(file));
    h.update("\n");
  };
  const walk = (dir: string) => {
    for (const name of readdirSync(dir).sort()) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (s.isFile()) add(full);
    }
  };
  for (const name of readdirSync(root).sort()) {
    const full = join(root, name);
    if (statSync(full).isFile()) add(full);
  }
  for (const top of ["content", "library", "platform"])
    if (existsSync(join(root, top))) walk(join(root, top));
  h.update(process.version);
  return h.digest("hex");
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
