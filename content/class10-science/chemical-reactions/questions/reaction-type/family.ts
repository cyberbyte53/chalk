import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { type EquationName, equationState } from "@chalk/prop-chemistry";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Type = {
  Combination: "combination",
  Decomposition: "decomposition",
  Displacement: "displacement",
  Double: "double",
} as const;
type Type = (typeof Type)[keyof typeof Type];

const typeWords: Record<Type, { en: string; hi: string }> = {
  combination: { en: "Combination reaction", hi: "संयोजन अभिक्रिया" },
  decomposition: { en: "Decomposition reaction", hi: "वियोजन अभिक्रिया" },
  displacement: { en: "Displacement reaction", hi: "विस्थापन अभिक्रिया" },
  double: { en: "Double displacement", hi: "द्विविस्थापन" },
};

/** Why a wrong pick is wrong, by what the learner chose. */
const because: Record<Type, { en: string; hi: string }> = {
  combination: {
    en: "A combination ends with a single product. Count the products.",
    hi: "संयोजन का अंत एक ही उत्पाद पर होता है। उत्पाद गिनो।",
  },
  decomposition: {
    en: "A decomposition starts from a single reactant. Count the reactants.",
    hi: "वियोजन एक ही अभिकारक से शुरू होता है। अभिकारक गिनो।",
  },
  displacement: {
    en: "A displacement has an element on its own taking another's place in a compound.",
    hi: "विस्थापन में एक अकेला तत्व किसी यौगिक में दूसरे की जगह लेता है।",
  },
  double: {
    en: "A double displacement has two compounds swapping partners.",
    hi: "द्विविस्थापन में दो यौगिक साथी बदलते हैं।",
  },
};

const EQUATION_TYPES = {
  quickLimeWater: Type.Combination,
  coalBurns: Type.Combination,
  waterFormation: Type.Combination,
  magnesiumBurns: Type.Combination,
  hydrogenChlorine: Type.Combination,
  ammonia: Type.Combination,
  limestoneHeat: Type.Decomposition,
  ferrousSulphateHeat: Type.Decomposition,
  leadNitrateHeat: Type.Decomposition,
  electrolysisOfWater: Type.Decomposition,
  silverChlorideLight: Type.Decomposition,
  zincCarbonateHeat: Type.Decomposition,
  ironCopperSulphate: Type.Displacement,
  zincCopperSulphate: Type.Displacement,
  leadCopperChloride: Type.Displacement,
  thermite: Type.Displacement,
  zincSilverNitrate: Type.Displacement,
  magnesiumHydrochloricAcid: Type.Displacement,
  sodiumSulphateBariumChloride: Type.Double,
  leadNitratePotassiumIodide: Type.Double,
  bariumChloridePotassiumSulphate: Type.Double,
  sodiumChlorideSilverNitrate: Type.Double,
} as const satisfies Partial<Record<EquationName, Type>>;
type Named = keyof typeof EQUATION_TYPES;
const NAMES = Object.keys(EQUATION_TYPES) as [Named, ...Named[]];

/** The balanced equation as $\ce{…}$. */
function ce(name: Named): string {
  const s = equationState(name, { balanced: true });
  const side = (list: readonly { formula: string }[], k: readonly number[]) =>
    list.map((sp, i) => `${(k[i] ?? 1) === 1 ? "" : k[i]}${sp.formula}`).join(" + ");
  return `${side(s.left, s.leftCoefficients)} -> ${side(s.right, s.rightCoefficients)}`;
}

/** Name the type of a reaction from its equation. */
export const reactionType = family({
  level: Level.Medium,
  tests: [
    Concept.CombinationReactions,
    Concept.DecompositionReactions,
    Concept.DisplacementReactions,
  ],
  params: z.object({ equation: z.enum(NAMES) }).strict(),
  build: ({ equation }, b) => {
    const right = EQUATION_TYPES[equation];
    const options: Option[] = (Object.values(Type) as Type[]).map((ty) =>
      ty === right
        ? { id: ty, label: typeWords[ty] }
        : { id: ty, label: typeWords[ty], feedback: because[ty] },
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        `What type of reaction is $\\ce{${ce(equation)}}$?`,
        `$\\ce{${ce(equation)}}$ किस प्रकार की अभिक्रिया है?`,
      ),
      options: settle(options, equation.length * 7),
      answer: right,
    });
    return column([ask, space()]);
  },
});
