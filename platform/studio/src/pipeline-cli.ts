import { dirname, join } from "node:path";
import { pipelineLines, readChapters, stampProblems } from "./pipeline";

/**
 * `pnpm check`'s pipeline step: every chapter's planning files (pipeline.ts). It fails where an
 * approved file's checks fail; what changed since it was approved, what is to be checked again and
 * what blocks an approval, it lists (they are resolved by the person, after a commit). It fails
 * too where an approval was committed together with an edit to the file (stampProblems).
 */
const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
const chapters = readChapters(root);
const { lines, failed } = pipelineLines(chapters);
for (const line of lines) console.log(line);
if (failed > 0) {
  console.error(`✗ ${failed} approved planning file${failed === 1 ? "" : "s"} fail their checks`);
  process.exit(1);
}
const stamps = stampProblems(root, chapters);
if (stamps.length > 0) {
  for (const line of stamps) console.error(`✗ ${line}`);
  process.exit(1);
}
console.log("✓ every approved planning file holds");
