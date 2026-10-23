import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { propPackages } from "@chalk/library";
import { catalogueMarkdown, catalogueRows } from "./catalogue";

const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
const file = join(root, "library/catalogue.md");
const check = process.argv.includes("--check");

const page = catalogueMarkdown(catalogueRows(root, propPackages));

if (check) {
  let current = "";
  try {
    current = readFileSync(file, "utf8");
  } catch {}
  if (current !== page) {
    console.error("library/catalogue.md is stale: run `pnpm catalogue` and commit it.");
    process.exit(1);
  }
  console.log("✓ library/catalogue.md is current");
} else {
  writeFileSync(file, page);
  console.log(`wrote library/catalogue.md (${propPackages.size} packages)`);
}
