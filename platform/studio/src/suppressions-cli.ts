import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";

/**
 * `pnpm check`'s suppressions step: a lint rule is met, never skipped line by line. Any
 * `biome-ignore` in the code fails it; a rule that is wrong for our code is turned off once in
 * biome.json, with its reason in platform/docs/code-conventions.md. Parked code (library/props-later)
 * is outside the build and meets the rules when it comes back.
 */
const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
let found = "";
try {
  found = execFileSync(
    "git",
    [
      "grep",
      "-n",
      "-E",
      // A suppression comment, not the word written about.
      "(//|/\\*)[[:space:]]*biome-ignore",
      "--",
      "platform",
      "library",
      "content",
      ":!library/props-later",
      ":!platform/docs",
    ],
    { cwd: root, encoding: "utf8" },
  );
} catch {
  // git grep exits 1 when nothing matches: that is the pass.
}
const lines = found.split("\n").filter(Boolean);
for (const line of lines) console.error(`  ✗ ${line}`);
if (lines.length > 0) {
  console.error(
    `✗ ${lines.length} lint rule${lines.length === 1 ? " is" : "s are"} skipped: meet ${lines.length === 1 ? "it" : "them"}, or turn the rule off once in biome.json with its reason`,
  );
  process.exit(1);
}
console.log("✓ no lint rule is skipped");
