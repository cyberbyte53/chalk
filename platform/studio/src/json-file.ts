import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { findUp } from "./find-up";

const biome = createRequire(import.meta.url).resolve("@biomejs/biome/bin/biome");

/**
 * Writes `value` as JSON laid out the way `biome format` would (with the repo's biome.json), so files
 * the tools write pass `pnpm check` as they are. Paths biome.json ignores are written as
 * `JSON.stringify` lays them out.
 */
export function writeJsonFile(file: string, value: unknown): void {
  const json = `${JSON.stringify(value, null, 2)}\n`;
  writeFileSync(file, formatJson(json, file));
}

function formatJson(json: string, file: string): string {
  const args = [
    biome,
    "format",
    `--config-path=${dirname(findUp("biome.json", dirname(file)))}`,
    `--stdin-file-path=${file}`,
  ];
  try {
    return execFileSync(process.execPath, args, { input: json, encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    // For an ignored path biome exits 1 and echoes the input: keep it as it is. Check the message, not
    // the echo: biome 1.9.4's echo drops Devanagari vowel signs (पूर्ण comes back as पर).
    if (error instanceof Error && "stdout" in error && error.stdout === json) return json;
    if (error instanceof Error && /formatter is currently disabled|ignored/.test(error.message)) {
      return json;
    }
    throw error;
  }
}
