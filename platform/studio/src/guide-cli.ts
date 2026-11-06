// How we make lessons, for a book or a chapter: every guide that applies, top first, and the settings
// they add up to, each value with the guide it came from.
//
//   pnpm guide                                  the top guide
//   pnpm guide class9-maths/coordinate-geometry  the top, the book's and the chapter's
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { findUp } from "./find-up";
import { guideAt, settingSources } from "./guide";

const root = join(findUp("pnpm-workspace.yaml", import.meta.dirname), "..");
const authoring = join(root, "authoring");
const path = process.argv[2] ?? "";

const { levels } = guideAt(authoring, path);
if (levels.length === 0) {
  console.error(`no guide.md applies to "${path}" (the top one is authoring/guide.md)`);
  process.exit(1);
}
for (const level of levels) {
  console.log(`\n═══ ${relative(root, level.file)} ═══\n`);
  console.log(readFileSync(level.file, "utf8").trim());
}
console.log("\n═══ Settings, as they apply here ═══\n");
for (const [key, from] of settingSources(authoring, path)) {
  const value = key
    .split(".")
    .reduce<unknown>(
      (v, k) => (v as Record<string, unknown> | undefined)?.[k],
      guideAt(authoring, path).settings,
    );
  console.log(`${key}: ${String(value)}    (${from})`);
}
