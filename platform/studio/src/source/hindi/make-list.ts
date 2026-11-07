import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

/**
 * Makes `words.txt.gz`, the Hindi word list (platform/docs/plans/sources.md, "The Hindi word list"):
 * LibreOffice's hi_IN Hunspell dictionary, its stems and their affix rules written out once as a
 * flat sorted list, one word a line. Run it again only to take a newer dictionary:
 * `npx tsx platform/studio/src/source/hindi/make-list.ts`.
 *
 * The dictionary is GPL (COPYING and Copyright, beside this file). It is used only by the authoring
 * tools, never shipped in the app.
 */

/** LibreOffice's dictionaries, at the commit the list was made from (its GitHub mirror). */
const COMMIT = "2bb5f4cd04b2a0a3cba85ce9879c99ace1b10221";
const UPSTREAM = `https://raw.githubusercontent.com/LibreOffice/dictionaries/${COMMIT}/hi_IN`;

/** Where a rule changes a word. */
const End = { Prefix: "PFX", Suffix: "SFX" } as const;
type End = (typeof End)[keyof typeof End];

/**
 * One affix rule: on a word whose start (a prefix) or end (a suffix) matches `condition`, take
 * `strip` off there and put `add` on, then apply `then`'s rules to what it made.
 */
type Rule = { end: End; strip: string; add: string; then: string; condition: RegExp };

/** The `.aff` file's rules by flag (this dictionary has no compounds). */
function affixRules(aff: string): Map<string, Rule[]> {
  const rules = new Map<string, Rule[]>();
  for (const line of aff.split("\n")) {
    const f = line.trim().split(/\s+/);
    const end = f[0] === End.Prefix ? End.Prefix : f[0] === End.Suffix ? End.Suffix : undefined;
    if (end === undefined || f.length < 5) continue;
    const [, flag = "", strip = "", added = "", condition = "."] = f;
    const [add = "", then = ""] = added.split("/");
    const list = rules.get(flag) ?? [];
    list.push({
      end,
      strip: strip === "0" ? "" : strip,
      add: add === "0" ? "" : add,
      then,
      condition: new RegExp(end === End.Prefix ? `^${condition}` : `${condition}$`, "u"),
    });
    rules.set(flag, list);
  }
  return rules;
}

/** One rule applied to a word, or undefined when it doesn't fit. */
function applyRule(word: string, r: Rule): string | undefined {
  if (!r.condition.test(word)) return undefined;
  if (r.end === End.Suffix)
    return word.endsWith(r.strip) ? word.slice(0, word.length - r.strip.length) + r.add : undefined;
  return word.startsWith(r.strip) ? r.add + word.slice(r.strip.length) : undefined;
}

/**
 * A stem and every word its flags make: its suffixes (a suffix's own flags applied to what it made,
 * two suffixes at most), and its prefixes on each of those.
 */
function expandStem(stem: string, flags: string, rules: Map<string, Rule[]>): string[] {
  const rulesOf = (fs: string, end: End) =>
    [...fs].flatMap((flag) => rules.get(flag) ?? []).filter((r) => r.end === end);
  const suffixed = [stem];
  const suffix = (word: string, fs: string, depth: number) => {
    for (const r of rulesOf(fs, End.Suffix)) {
      const made = applyRule(word, r);
      if (made === undefined) continue;
      suffixed.push(made);
      if (r.then !== "" && depth < 2) suffix(made, r.then, depth + 1);
    }
  };
  suffix(stem, flags, 1);
  const prefixes = rulesOf(flags, End.Prefix);
  const prefixed = suffixed.flatMap((w) =>
    prefixes.map((r) => applyRule(w, r)).filter((m): m is string => m !== undefined),
  );
  return [...suffixed, ...prefixed];
}

async function fetchText(name: string): Promise<string> {
  const response = await fetch(`${UPSTREAM}/${name}`);
  if (!response.ok) throw new Error(`${name}: ${response.status} from ${UPSTREAM}`);
  return (await response.text()).replace(/^\uFEFF/, "");
}

async function main() {
  const rules = affixRules(await fetchText("hi_IN.aff"));
  const dic = (await fetchText("hi_IN.dic"))
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const words = new Set<string>();
  for (const entry of dic) {
    const [stem = "", flags = ""] = entry.split("/");
    for (const w of expandStem(stem, flags, rules)) words.add(w.normalize("NFC"));
  }
  const sorted = [...words].sort();
  writeFileSync(
    join(import.meta.dirname, "words.txt.gz"),
    gzipSync(`${sorted.join("\n")}\n`, { level: 9 }),
  );
  console.log(`${dic.length} stems → ${sorted.length} words`);
}

if (process.argv[1] === import.meta.filename) await main();
