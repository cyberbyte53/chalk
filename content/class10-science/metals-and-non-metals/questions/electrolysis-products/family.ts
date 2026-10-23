import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const CHLORIDES = {
  NaCl: { metal: { en: "sodium", hi: "सोडियम" } },
  MgCl2: { metal: { en: "magnesium", hi: "मैग्नीशियम" } },
  CaCl2: { metal: { en: "calcium", hi: "कैल्शियम" } },
} as const;
type Chloride = keyof typeof CHLORIDES;

/** Electrolysis of a molten chloride: what comes out at the cathode, or at the anode? */
export const electrolysisProducts = family({
  level: Level.Medium,
  tests: [Concept.ElectrolysisAndRefining],
  params: z
    .object({
      chloride: z.enum(Object.keys(CHLORIDES) as [Chloride, ...Chloride[]]),
      at: z.enum(["cathode", "anode"]),
    })
    .strict(),
  build: ({ chloride, at }, b) => {
    const m = CHLORIDES[chloride].metal;
    const metal = t(`${m.en[0]?.toUpperCase()}${m.en.slice(1)} metal`, `${m.hi} धातु`);
    const chlorine = t("Chlorine gas", "क्लोरीन गैस");
    const ask = pickOne(b, {
      prompt:
        at === "cathode"
          ? t(
              `Molten $\\ce{${chloride}}$ is electrolysed. What is deposited at the cathode (the negative electrode)?`,
              `पिघले $\\ce{${chloride}}$ का विद्युत अपघटन होता है। कैथोड (ऋण इलेक्ट्रोड) पर क्या जमा होता है?`,
            )
          : t(
              `Molten $\\ce{${chloride}}$ is electrolysed. What is given off at the anode (the positive electrode)?`,
              `पिघले $\\ce{${chloride}}$ का विद्युत अपघटन होता है। ऐनोड (धन इलेक्ट्रोड) पर क्या निकलता है?`,
            ),
      right: at === "cathode" ? metal : chlorine,
      wrong: [
        {
          label: at === "cathode" ? chlorine : metal,
          why: t(
            "The positive metal ions go to the negative cathode and become metal; chloride ions give chlorine at the anode.",
            "धनात्मक धातु आयन ऋण कैथोड पर जाकर धातु बनते हैं; क्लोराइड आयन ऐनोड पर क्लोरीन देते हैं।",
          ),
        },
        {
          label: t("Hydrogen gas", "हाइड्रोजन गैस"),
          why: t(
            "There is no water in a molten chloride, so no hydrogen.",
            "पिघले क्लोराइड में पानी नहीं है, इसलिए हाइड्रोजन नहीं।",
          ),
        },
      ],
      seed: seedOf(chloride, at),
    });
    return column([ask, space()]);
  },
});
