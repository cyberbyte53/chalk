import { dirname, join } from "node:path";
import { impureLines } from "./purity";

const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
const found = impureLines(root);
if (found.length === 0) {
  console.log("✓ prop and lesson code is pure: a board's state is all of it");
} else {
  console.error(
    `${found.length} impure line(s) (a board restored from its state would go another way):`,
  );
  for (const line of found) console.error(`  ${line}`);
  process.exit(1);
}
