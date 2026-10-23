import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Each redox reaction of the chapter: the substance oxidised, the one reduced, and why. */
const REACTIONS = {
  copperHydrogen: {
    ce: "CuO + H2 -> Cu + H2O",
    oxidised: { ce: "H2", en: "hydrogen gains oxygen", hi: "हाइड्रोजन ऑक्सीजन पाता है" },
    reduced: {
      ce: "CuO",
      en: "copper(II) oxide loses oxygen",
      hi: "कॉपर (II) ऑक्साइड ऑक्सीजन खोता है",
    },
  },
  zincOxideCarbon: {
    ce: "ZnO + C -> Zn + CO",
    oxidised: { ce: "C", en: "carbon gains oxygen", hi: "कार्बन ऑक्सीजन पाता है" },
    reduced: { ce: "ZnO", en: "zinc oxide loses oxygen", hi: "जिंक ऑक्साइड ऑक्सीजन खोता है" },
  },
  manganese: {
    ce: "MnO2 + 4HCl -> MnCl2 + 2H2O + Cl2",
    oxidised: {
      ce: "HCl",
      en: "HCl loses hydrogen and becomes Cl₂",
      hi: "HCl हाइड्रोजन खोकर Cl₂ बनता है",
    },
    reduced: { ce: "MnO2", en: "MnO₂ loses oxygen", hi: "MnO₂ ऑक्सीजन खोता है" },
  },
  leadOxide: {
    ce: "2PbO + C -> 2Pb + CO2",
    oxidised: { ce: "C", en: "carbon gains oxygen", hi: "कार्बन ऑक्सीजन पाता है" },
    reduced: { ce: "PbO", en: "lead oxide loses oxygen", hi: "लेड ऑक्साइड ऑक्सीजन खोता है" },
  },
  thermite: {
    ce: "Fe2O3 + 2Al -> Al2O3 + 2Fe",
    oxidised: { ce: "Al", en: "aluminium gains oxygen", hi: "ऐलुमिनियम ऑक्सीजन पाता है" },
    reduced: { ce: "Fe2O3", en: "iron oxide loses oxygen", hi: "आयरन ऑक्साइड ऑक्सीजन खोता है" },
  },
} as const;
type Name = keyof typeof REACTIONS;
const NAMES = Object.keys(REACTIONS) as [Name, ...Name[]];

/** In a redox reaction, which substance is oxidised, or which is reduced? */
export const oxidisedOrReduced = family({
  level: Level.Medium,
  tests: [Concept.OxidationAndReduction],
  params: z.object({ reaction: z.enum(NAMES), ask: z.enum(["oxidised", "reduced"]) }).strict(),
  build: ({ reaction, ask }, b) => {
    const r = REACTIONS[reaction];
    const right = r[ask];
    const other = ask === "oxidised" ? r.reduced : r.oxidised;
    const product = r.ce.split(" -> ")[1]?.split(" + ")[0]?.replace(/^\d+/, "") ?? "";
    const options: Option[] = [
      { id: "right", label: t(`$\\ce{${right.ce}}$`, `$\\ce{${right.ce}}$`) },
      {
        id: "other",
        label: t(`$\\ce{${other.ce}}$`, `$\\ce{${other.ce}}$`),
        feedback: t(
          `In this reaction ${other.en}, so it is ${ask === "oxidised" ? "reduced" : "oxidised"}.`,
          `इस अभिक्रिया में ${other.hi}, इसलिए वह ${ask === "oxidised" ? "अपचयित" : "उपचयित"} होता है।`,
        ),
      },
      {
        id: "product",
        label: t(`$\\ce{${product}}$`, `$\\ce{${product}}$`),
        feedback: t(
          "That's a product. Oxidised and reduced describe what happens to the reactants.",
          "वह उत्पाद है। उपचयित और अपचयित अभिकारकों के साथ होने वाली बात बताते हैं।",
        ),
      },
    ];
    const q = choiceQuestion(b, {
      prompt: t(
        `$\\ce{${r.ce}}$. Which substance is ${ask === "oxidised" ? "oxidised" : "reduced"}?`,
        `$\\ce{${r.ce}}$। किसका ${ask === "oxidised" ? "उपचयन" : "अपचयन"} होता है?`,
      ),
      options: settle(options, reaction.length + (ask === "oxidised" ? 3 : 5)),
      answer: "right",
    });
    return column([q, space()]);
  },
});
