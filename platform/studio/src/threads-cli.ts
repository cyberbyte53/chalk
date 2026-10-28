import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readComments } from "./comments";
import type { Reach } from "./content/build";
import { goneThreads } from "./thread-places";

/** `pnpm check`'s threads step, after the content build: no open thread points at nothing. */
const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
const file = join(root, "build", "reach.json");
const reach: Reach = existsSync(file)
  ? (JSON.parse(readFileSync(file, "utf8")) as Reach)
  : { boards: {}, modules: {} };
const { threads, problems } = readComments(root);
for (const p of problems) console.error(`  ${p}`);
const gone = goneThreads(root, threads, reach);
for (const g of gone) console.error(`  ${g}`);
if (problems.length > 0 || gone.length > 0) {
  if (gone.length > 0)
    console.error(
      `✗ ${gone.length} open thread${gone.length === 1 ? "" : "s"} point at what is gone: re-point each (comment with its id and the new address) or answer it (ready, saying what happened)`,
    );
  process.exit(1);
}
console.log(`✓ every open thread points at something (${threads.length} threads)`);
