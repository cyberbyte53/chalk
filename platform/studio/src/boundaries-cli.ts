import { dirname, join } from "node:path";
import { boundaryBreaks } from "./boundaries";

const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
const breaks = boundaryBreaks(root);
if (breaks.length === 0) {
  console.log("✓ layers import one way: content → library → core");
} else {
  console.error(`${breaks.length} boundary break(s):`);
  for (const line of breaks) console.error(`  ${line}`);
  process.exit(1);
}
