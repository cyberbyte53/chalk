import { dirname, join } from "node:path";
import { FILES, readChapters } from "./pipeline";

/**
 * `pnpm check`'s pipeline step: every chapter's planning files (pipeline.ts). It fails where an
 * approved file's checks fail; what changed since it was approved, and what is to be checked again,
 * it lists (they are resolved by the person approving again, after a commit).
 */
const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
let failed = 0;
const chapters = readChapters(root);
for (const c of chapters) {
  console.log(`  ${c.dir}`);
  for (const f of c.files) {
    if (f.status === "missing") continue;
    const spec = FILES.find((x) => x.step === f.step);
    const isHeld = f.status !== "draft" || spec?.isApproved === false;
    const mark = f.problems.length > 0 ? (isHeld ? "✗" : "·") : "✓";
    console.log(`    ${mark} ${f.file}: ${f.status}${f.approvedAt ? ` at ${f.approvedAt}` : ""}`);
    for (const p of f.problems) console.log(`        ${p.text}`);
    for (const n of f.notes) console.log(`        note: ${n}`);
    if (f.recheck.length > 0)
      console.log(`        to check again: ${f.recheck.join(", ")} changed since it was approved`);
    if (isHeld && f.problems.length > 0) failed += 1;
  }
  // Not a failure (lessons change while they're built); a lesson isn't shown to the person like this.
  for (const l of c.lessons)
    console.log(
      l.isToSelfReview
        ? `    · ${l.slug}: to self-review (${l.why})`
        : `    ✓ ${l.slug}: self-reviewed`,
    );
}
if (chapters.length === 0) console.log("  no chapter has planning files yet");
if (failed > 0) {
  console.error(`✗ ${failed} approved planning file${failed === 1 ? "" : "s"} fail their checks`);
  process.exit(1);
}
console.log("✓ every approved planning file holds");
