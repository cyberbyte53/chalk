import { join } from "node:path";
import { findUp } from "./find-up";
import { checkSources } from "./source/pipeline";

/**
 * `pnpm check`'s sources step: every language's extract of a chapter's book (source/<lang>/ with a
 * book.yaml) passes its checks (platform/studio/src/source/checks.ts).
 */
const root = join(findUp("pnpm-workspace.yaml", import.meta.dirname), "..");
let failed = 0;
const extracts = checkSources(root);
for (const x of extracts) {
  const { problems, items, terms } = x.report;
  if (problems.length === 0) {
    console.log(`  ✓ ${x.rel}: ${items.length} items, ${terms.length} terms`);
    continue;
  }
  failed += 1;
  console.log(`  ✗ ${x.rel}`);
  for (const p of problems) console.log(`      ${p}`);
}
if (extracts.length === 0) console.log("  no book extracted yet");
if (failed > 0) {
  console.error(
    `✗ ${failed} extract${failed === 1 ? "" : "s"} fail their checks (fix them, then pnpm source <book>/<chapter> <lang>)`,
  );
  process.exit(1);
}
console.log("✓ every extract holds");
