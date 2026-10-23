import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { EQUATIONS, EQUATION_NAMES, type EquationName } from "@chalk/prop-chemistry";

const NAMES = EQUATION_NAMES as [EquationName, ...EquationName[]];
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The word equation's two sides, split back into names. */
function sides(name: EquationName) {
  const eq = EQUATIONS[name];
  const split = (s: string) => s.split(" + ").map((x) => x.trim());
  const [l = "", r = ""] = eq.words.en.split(" → ");
  const [lh = "", rh = ""] = eq.words.hi.split(" → ");
  return {
    left: split(l),
    right: split(r),
    leftHi: split(lh),
    rightHi: split(rh),
    words: eq.words,
  };
}

/** In a word equation, which substances are the reactants, or which are the products? */
export const reactantOrProduct = family({
  level: Level.Easy,
  tests: [Concept.WritingEquations],
  params: z.object({ equation: z.enum(NAMES), ask: z.enum(["reactants", "products"]) }).strict(),
  build: ({ equation, ask }, b) => {
    const s = sides(equation);
    const both = (en: string[], hi: string[]) => t(en.join(" and "), hi.join(" और "));
    const right = ask === "reactants" ? both(s.left, s.leftHi) : both(s.right, s.rightHi);
    const other = ask === "reactants" ? both(s.right, s.rightHi) : both(s.left, s.leftHi);
    const options: Option[] = [
      { id: "right", label: right },
      {
        id: "other",
        label: other,
        feedback:
          ask === "reactants"
            ? t(
                "Those are on the right of the arrow, the side it points to: the products.",
                "ये तीर के दाईं ओर हैं, जिधर वह इशारा करता है: उत्पाद।",
              )
            : t(
                "Those are on the left of the arrow: the reactants, which are used up.",
                "ये तीर के बाईं ओर हैं: अभिकारक, जो ख़र्च होते हैं।",
              ),
      },
    ];
    const askQ = choiceQuestion(b, {
      prompt: t(
        `${s.words.en}. Which are the ${ask === "reactants" ? "reactants" : "products"}?`,
        `${s.words.hi}। ${ask === "reactants" ? "अभिकारक" : "उत्पाद"} कौन-से हैं?`,
      ),
      options: settle(options, equation.length + (ask === "reactants" ? 1 : 2)),
      answer: "right",
    });
    return column([askQ, space()]);
  },
});
