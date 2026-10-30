import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * The nearest file with this name, looking up from `from`: beside it, or in an authoring/ folder
 * beside it (the repo keeps its authoring files there).
 */
export function findUp(name: string, from: string): string {
  let dir = from;
  while (dirname(dir) !== dir) {
    for (const candidate of [join(dir, name), join(dir, "authoring", name)])
      if (existsSync(candidate)) return candidate;
    dir = dirname(dir);
  }
  throw new Error(`No ${name} found above ${from}`);
}
