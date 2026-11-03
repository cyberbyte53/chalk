import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * `pnpm check`'s purity step: what decides a board's state is pure, so a board restored from its
 * state goes on exactly as it did (platform/docs/plans/jugnu.md, "what it stands on"). A prop's
 * definition and a lesson's code (their rules, facts and setup: the .ts files) may not read
 * chance, the wall clock or a value kept outside the board: everything they know is the board's
 * state and the event. Views (.tsx) only draw and ask; a chance a view passes to an action
 * (a die's roll) is the student's input, recorded with it, so it is theirs to use.
 */

/** What breaks it, each with why. */
const IMPURE: readonly { test: RegExp; why: string }[] = [
  { test: /\bMath\.random\b/, why: "chance: a copy would roll differently" },
  { test: /\bcrypto\.\w+/, why: "chance: a copy would roll differently" },
  { test: /\bDate\.now\b|\bnew Date\b/, why: "the wall clock: time is only the board's clock" },
  { test: /\bperformance\.now\b/, why: "the wall clock: time is only the board's clock" },
  {
    test: /^(?:export\s+)?(?:let|var)\s/,
    why: "a value kept outside the board: its state is its variables",
  },
];

/** Where prop definitions and lesson code live. */
const ROOTS = ["library/props", "library/patterns", "content"];

function sourcesUnder(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    if (name === "node_modules" || name.startsWith(".")) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourcesUnder(path);
    const isCode = name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.endsWith(".gen.ts");
    return isCode ? [path] : [];
  });
}

/** Each impure line in prop and lesson code: `path:line: why: the line`. */
export function impureLines(root: string): string[] {
  const out: string[] = [];
  for (const file of ROOTS.flatMap((r) => sourcesUnder(join(root, r)))) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
        for (const { test, why } of IMPURE)
          if (test.test(line)) out.push(`${relative(root, file)}:${i + 1}: ${why}: ${line.trim()}`);
      });
  }
  return out;
}
