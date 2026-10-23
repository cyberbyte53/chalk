import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { atomsOf } from "@chalk/prop-chemistry";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Formulae from the chapter worth counting, with brackets and without. */
const FORMULAE = [
  "H2SO4",
  "Fe3O4",
  "Ca(OH)2",
  "Pb(NO3)2",
  "Al2(SO4)3",
  "CaCO3",
  "C6H12O6",
  "FeSO4",
  "Na2SO4",
] as const;

/** How many atoms of one element there are in one unit of a formula. */
export const atomsInFormula = family({
  level: Level.Easy,
  tests: [Concept.WritingEquations],
  params: z
    .object({ formula: z.enum(FORMULAE), element: z.string().regex(/^[A-Z][a-z]?$/) })
    .strict(),
  build: ({ formula, element }, b) => {
    const counts = atomsOf(formula);
    const right = counts[element];
    if (right === undefined) throw new Error(`atomsInFormula: ${element} is not in ${formula}`);
    const total = Object.values(counts).reduce((a, n) => a + n, 0);
    // The usual slip: reading the number inside a bracket and forgetting the one outside it.
    const inside = formula.includes("(")
      ? Number(
          (formula.match(/\(([^)]*)\)/)?.[1] ?? "").match(new RegExp(`${element}(\\d*)`))?.[1] || 1,
        )
      : 1;
    const wrong: Option[] = [];
    const seen = new Set([right]);
    const add = (n: number, en: string, hi: string) => {
      if (seen.has(n) || n < 1) return;
      seen.add(n);
      wrong.push({ id: `n${n}`, label: t(`${n}`, `${n}`), feedback: t(en, hi) });
    };
    add(
      inside,
      "A number after a bracket multiplies everything inside it.",
      "कोष्ठक के बाद की संख्या उसके अंदर की हर चीज़ को गुणा करती है।",
    );
    add(
      total,
      `${total} is every atom in the formula. Count only ${element}.`,
      `${total} सूत्र के सारे परमाणु हैं। केवल ${element} गिनो।`,
    );
    add(
      1,
      `The number after ${element} counts its atoms; check for brackets too.`,
      `${element} के बाद की संख्या उसके परमाणु गिनती है; कोष्ठक भी देखो।`,
    );
    add(right + 1, "Count again, symbol by symbol.", "फिर से गिनो, प्रतीक-दर-प्रतीक।");
    const ask = choiceQuestion(b, {
      prompt: t(
        `How many atoms of ${element} are there in one unit of $\\ce{${formula}}$?`,
        `$\\ce{${formula}}$ की एक इकाई में ${element} के कितने परमाणु हैं?`,
      ),
      options: settle(
        [{ id: "right", label: t(`${right}`, `${right}`) }, ...wrong.slice(0, 2)],
        formula.length * 5 + element.length,
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
