import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { EQUATIONS, EQUATION_NAMES, type EquationName } from "@chalk/prop-chemistry";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { balanceGoal } from "../../kit";

const NAMES = EQUATION_NAMES as [EquationName, ...EquationName[]];

/** Balance one of the chapter's skeletal equations with the coefficient steppers. */
export const balanceEquation = family({
  level: Level.Medium,
  tests: [Concept.BalancingEquations],
  params: z.object({ equation: z.enum(NAMES) }).strict(),
  build: ({ equation }, b) => {
    const words = EQUATIONS[equation].words;
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      equation,
      t(`Balance: ${words.en}.`, `संतुलित करो: ${words.hi}।`),
    );
    return column([eq, goal, space()]);
  },
});
