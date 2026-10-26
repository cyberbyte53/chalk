import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type Readings, compileReadings } from "@chalk/content";

/** Where the pronunciation rules live: authoring/pronunciations.json. */
export const PRONUNCIATIONS_FILE = "pronunciations.json";

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

/** authoring/pronunciations.json, compiled: how screen text is said aloud. */
export function loadReadings(file: string): Readings {
  return compileReadings(JSON.parse(readFileSync(file, "utf8")));
}
