import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { propDefs } from "@chalk/library";
import { loadReadings } from "./pronunciations";
import { validateLesson } from "./validate";

function lessonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return lessonFiles(path);
    return path.includes(`${join("lessons", "")}`) && name.endsWith(".json") ? [path] : [];
  });
}

const root = process.argv[2] ?? "content";
const files = lessonFiles(root);
const readings = loadReadings(join(root, "pronunciations.json"));
let problemCount = 0;
for (const file of files) {
  const problems = validateLesson(JSON.parse(readFileSync(file, "utf8")), propDefs, readings);
  problemCount += problems.length;
  const name = relative(root, file);
  if (problems.length === 0) console.log(`✓ ${name}`);
  else {
    console.log(`✗ ${name}`);
    for (const p of problems) console.log(`    ${p.where}: ${p.message}`);
  }
}
console.log(`${files.length} lesson(s), ${problemCount} problem(s)`);
process.exitCode = problemCount === 0 ? 0 : 1;
