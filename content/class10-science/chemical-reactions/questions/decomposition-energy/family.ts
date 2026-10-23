import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Energy = { Heat: "heat", Light: "light", Electricity: "electricity" } as const;
type Energy = (typeof Energy)[keyof typeof Energy];

const energyWords: Record<Energy, { en: string; hi: string }> = {
  heat: { en: "Heat", hi: "ऊष्मा" },
  light: { en: "Light", hi: "प्रकाश" },
  electricity: { en: "Electricity", hi: "विद्युत" },
};

const REACTIONS = {
  limestone: { ce: "CaCO3 -> CaO + CO2", energy: Energy.Heat },
  ferrousSulphate: { ce: "2FeSO4 -> Fe2O3 + SO2 + SO3", energy: Energy.Heat },
  leadNitrate: { ce: "2Pb(NO3)2 -> 2PbO + 4NO2 + O2", energy: Energy.Heat },
  water: { ce: "2H2O -> 2H2 + O2", energy: Energy.Electricity },
  silverChloride: { ce: "2AgCl -> 2Ag + Cl2", energy: Energy.Light },
  silverBromide: { ce: "2AgBr -> 2Ag + Br2", energy: Energy.Light },
} as const;
type Name = keyof typeof REACTIONS;
const NAMES = Object.keys(REACTIONS) as [Name, ...Name[]];

/** Which form of energy NCERT uses for each decomposition. */
export const decompositionEnergy = family({
  level: Level.Easy,
  tests: [Concept.DecompositionReactions],
  params: z.object({ reaction: z.enum(NAMES) }).strict(),
  build: ({ reaction }, b) => {
    const r = REACTIONS[reaction];
    const options: Option[] = (Object.values(Energy) as Energy[]).map((e) =>
      e === r.energy
        ? { id: e, label: energyWords[e] }
        : {
            id: e,
            label: energyWords[e],
            feedback: t(
              "Recall the activity: was it heated in a flame, left in sunlight, or connected to a battery?",
              "क्रियाकलाप याद करो: इसे लौ में गर्म किया, धूप में रखा, या बैटरी से जोड़ा?",
            ),
          },
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        `$\\ce{${r.ce}}$. Which form of energy breaks the reactant apart?`,
        `$\\ce{${r.ce}}$। अभिकारक को कौन-सी ऊर्जा तोड़ती है?`,
      ),
      options: settle(options, reaction.length * 3),
      answer: r.energy,
    });
    return column([ask, space()]);
  },
});
