import { join } from "node:path";
import { findUp } from "./find-up";
import { checkMatches } from "./source/match";
import { checkSources } from "./source/pipeline";

/**
 * `pnpm check`'s sources step: every language's extract of a chapter's book (source/<lang>/ with a
 * book.yaml) is built again from its page files and holds (platform/studio/src/source/check.ts):
 * no unanswered issue, and its items.yaml and terms.yaml are what the page files build. Each
 * chapter's match.yaml holds too (source/match.ts).
 */
const root = join(findUp("pnpm-workspace.yaml", import.meta.dirname), "..");
let failed = 0;
const extracts = checkSources(root);
for (const x of extracts) {
  const { problems, notes, issues, items, terms } = x.report;
  const answered = issues.filter((i) => i.answer !== undefined).length;
  const counts = `${items.length} items, ${terms.length} terms${answered > 0 ? `, ${answered} issues answered` : ""}`;
  if (problems.length === 0) {
    console.log(`  ✓ ${x.rel}: ${counts}${notes.length > 0 ? ` (${notes.join("; ")})` : ""}`);
    continue;
  }
  failed += 1;
  console.log(`  ✗ ${x.rel}`);
  for (const p of problems) console.log(`      ${p}`);
}
if (extracts.length === 0) console.log("  no book extracted yet");
for (const m of checkMatches(root)) {
  if (m.problems.length === 0) {
    const answered = m.answered > 0 ? `, ${m.answered} differences answered` : "";
    console.log(`  ✓ ${m.rel}: ${m.pairs} pairs${answered}`);
    continue;
  }
  failed += 1;
  console.log(`  ✗ ${m.rel}`);
  for (const p of m.problems) console.log(`      ${p}`);
}
if (failed > 0) {
  console.error(
    `✗ ${failed} extract${failed === 1 ? "" : "s"} fail their checks (fix them, then pnpm source <book>/<chapter> <lang>)`,
  );
  process.exit(1);
}
console.log("✓ every extract holds");
