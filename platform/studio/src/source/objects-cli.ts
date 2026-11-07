// A PDF's drawn objects read into its pages' cache: pdf.js's reading is asynchronous, and the checks
// that build an extract run in step, so they wait for this as a process of its own (suggest.ts).
import { writeObjects } from "./suggest";

const [pdf, cache] = process.argv.slice(2);
if (pdf === undefined || cache === undefined) {
  console.error("usage: objects-cli <pdf> <cache>");
  process.exit(2);
}
await writeObjects(pdf, cache);
