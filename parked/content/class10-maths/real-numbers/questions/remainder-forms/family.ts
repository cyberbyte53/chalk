import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choice } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;
const WORD = ["", "", "square", "cube"];
const HI_WORD = ["", "", "वर्ग", "घन"];

/** The remainders nᵖ can leave on dividing by b: n only matters through its own remainder. */
function reachable(divisor: number, power: number): number[] {
  const out = new Set<number>();
  for (let n = 0; n < divisor; n++) out.add(n ** power % divisor);
  return [...out].sort((x, y) => x - y);
}

/** "$bm$, $bm + 1$, …": each form its own bit of maths, so a long list wraps. */
const forms = (divisor: number, rems: readonly number[], letter: string) =>
  rems.map((k) => (k === 0 ? `$${divisor}${letter}$` : `$${divisor}${letter} + ${k}$`)).join(", ");

/** "The square of any positive integer is of the form …": which remainders can nᵖ leave? */
export const remainderForms = family({
  level: Level.Medium,
  tests: [Concept.DivisionLemma],
  params: z
    .object({ divisor: z.number().int().min(3).max(12), power: z.number().int().min(2).max(3) })
    .strict(),
  build: ({ divisor, power }, b) => {
    const right = reachable(divisor, power);
    const all = Array.from({ length: divisor }, (_, k) => k);
    const missing = all.filter((k) => !right.includes(k));
    if (missing.length === 0) throw new Error("every remainder is reachable: nothing to ask");
    const word = WORD[power] ?? "";
    const hiWord = HI_WORD[power] ?? "";
    const tryIt = t(
      r`Write $n = ${divisor}q + k$ for $k = 0, 1, \dots, ${divisor - 1}$ and expand $n^{${power}}$: only the $k^{${power}}$ part can leave a remainder.`,
      r`$k = 0, 1, \dots, ${divisor - 1}$ के लिए $n = ${divisor}q + k$ लिखो और $n^{${power}}$ को खोलो: केवल $k^{${power}}$ वाला भाग शेषफल छोड़ सकता है।`,
    );
    const options: Option[] = [
      {
        id: "all",
        label: t(forms(divisor, all, "m"), forms(divisor, all, "m")),
        feedback: t(
          r`Every number is one of these, but a ${word} can't be all of them. ${tryIt.en}`,
          r`हर संख्या इनमें से एक है, पर ${hiWord} इन सब रूपों का नहीं हो सकता। ${tryIt.hi}`,
        ),
      },
    ];
    if (right.length > 1) {
      const fewer = right.slice(0, -1);
      options.push({
        id: "fewer",
        label: t(forms(divisor, fewer, "m"), forms(divisor, fewer, "m")),
        feedback: t(
          r`One is missing. $${right.at(-1)}$ is reachable: try more values of $n$.`,
          r`एक छूट गया। $${right.at(-1)}$ भी आ सकता है: $n$ के और मान लेकर देखो।`,
        ),
      });
    }
    const extra = [...right, missing[0] ?? 0].sort((x, y) => x - y);
    // With one remainder missing, "one too many" is every remainder: already the "all" option.
    if (extra.length < divisor)
      options.push({
        id: "extra",
        label: t(forms(divisor, extra, "m"), forms(divisor, extra, "m")),
        feedback: t(
          r`No ${word} leaves remainder ${missing[0]} on dividing by ${divisor}. ${tryIt.en}`,
          r`कोई भी ${hiWord}, ${divisor} से भाग देने पर ${missing[0]} शेष नहीं छोड़ता। ${tryIt.hi}`,
        ),
      });
    const ask = choice(b, {
      prompt: t(
        r`The ${word} of any positive integer is of exactly these forms… (for some integer $m$)`,
        r`किसी भी धनात्मक पूर्णांक का ${hiWord} ठीक-ठीक किन रूपों का होता है? (किसी पूर्णांक $m$ के लिए)`,
      ),
      right: t(forms(divisor, right, "m"), forms(divisor, right, "m")),
      wrong: Object.fromEntries(options.map(({ id, ...o }) => [id, o])),
    });
    return [ask];
  },
});
