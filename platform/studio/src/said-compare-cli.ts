// Every line of a chapter, as shown and as said, before and after a change to how it is written:
// the same words on screen (marks resolved) and the same spoken words and phrases, so the same clips.
//
//   pnpm said-compare <before script.json> <after script.json>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { shownOf } from "@chalk/content";

type Line = {
  line: string;
  shown?: Record<string, string>;
  said?: Record<string, { words?: string; needs?: string } | undefined>;
  phrases?: Record<string, string[]>;
};
type Script = { boards: { path: string; lines: Line[] }[] };

const [beforeFile, afterFile] = process.argv
  .slice(2)
  .map((a) => resolve(process.env.INIT_CWD ?? process.cwd(), a));
if (beforeFile === undefined || afterFile === undefined) {
  console.error("pnpm said-compare <before script.json> <after script.json>");
  process.exit(2);
}
const read = (f: string) => JSON.parse(readFileSync(f, "utf8")) as Script;
const linesOf = (s: Script) =>
  new Map(s.boards.flatMap((b) => b.lines.map((l) => [`${b.path} › ${l.line}`, l] as const)));
const before = linesOf(read(beforeFile));
const after = linesOf(read(afterFile));
const view = (l: Line | undefined) =>
  l === undefined
    ? "missing"
    : JSON.stringify({
        shown: Object.fromEntries(Object.entries(l.shown ?? {}).map(([k, v]) => [k, shownOf(v)])),
        said: Object.fromEntries(
          Object.entries(l.said ?? {}).map(([k, v]) => [k, v?.words ?? `needs: ${v?.needs}`]),
        ),
        phrases: l.phrases,
      });
let differ = 0;
for (const key of [...new Set([...before.keys(), ...after.keys()])].sort()) {
  const [b, a] = [view(before.get(key)), view(after.get(key))];
  if (b === a) continue;
  differ += 1;
  if (differ <= 15)
    console.log(`  ${key}\n    before ${b.slice(0, 300)}\n    after  ${a.slice(0, 300)}`);
}
console.log(`${before.size} lines, ${differ} shown or said differently`);
process.exitCode = differ === 0 ? 0 : 1;
