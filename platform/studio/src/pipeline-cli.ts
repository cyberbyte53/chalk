import { dirname, join } from "node:path";
import { pipelineLines, readChapters } from "./pipeline";

/**
 * `pnpm check`'s pipeline step: every chapter's planning files (pipeline.ts). It fails where an
 * approved file's checks fail; what changed since it was approved, what is to be checked again and
 * what blocks an approval, it lists (they are resolved by the person, after a commit).
 */
const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
const { lines, failed } = pipelineLines(readChapters(root));
for (const line of lines) console.log(line);
if (failed > 0) {
  console.error(`✗ ${failed} approved planning file${failed === 1 ? "" : "s"} fail their checks`);
  process.exit(1);
}
console.log("✓ every approved planning file holds");
