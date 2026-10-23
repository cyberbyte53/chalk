import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, frac, settle } from "@chalk/patterns";
import { terminatingDecimal } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Moves the decimal point `by` places (right when positive), as text. */
function shift(decimal: string, by: number): string {
  const [whole = "0", part = ""] = decimal.split(".");
  const digits = whole + part;
  let point = whole.length + by;
  let padded = digits;
  while (point <= 0) {
    padded = `0${padded}`;
    point += 1;
  }
  while (point > padded.length) padded = `${padded}0`;
  const left = padded.slice(0, point).replace(/^0+(?=\d)/, "");
  const right = padded.slice(point).replace(/0+$/, "");
  return right === "" ? left : `${left}.${right}`;
}

/** Write a terminating p/q as a decimal (NCERT Ex 1.4 Q2), against a point one place out. */
export const theDecimal = family({
  level: Level.Medium,
  tests: [Concept.WhichFractionsEnd],
  params: z.object({ p: z.number().int().min(1), q: z.number().int().min(2) }).strict(),
  build: ({ p, q }, b) => {
    const decimal = terminatingDecimal(p, q);
    if (decimal === null) throw new Error(`${p}/${q} doesn't terminate`);
    const places = (decimal.split(".")[1] ?? "").length;
    const options: Option[] = [{ id: "right", label: t(decimal, decimal) }];
    const used = new Set([decimal]);
    const offer = (id: string, value: string) => {
      if (used.has(value)) return;
      used.add(value);
      options.push({
        id,
        label: t(value, value),
        feedback: t(
          r`Count the places: the denominator becomes $10^{${places}}$, so there are ${places} digits after the point.`,
          r`अंक गिनो: हर $10^{${places}}$ बनता है, इसलिए दशमलव के बाद ${places} अंक होंगे।`,
        ),
      });
    };
    offer("left", shift(decimal, -1));
    offer("right1", shift(decimal, 1));
    const ask = choiceQuestion(b, {
      prompt: t(r`Write $${frac(p, q)}$ as a decimal.`, r`$${frac(p, q)}$ को दशमलव में लिखो।`),
      options: settle(options, p * 17 + q),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
