import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

type Fact = { en: string; hi: string; clue: { en: string; hi: string }; isMetal: boolean };

/** Elements, each with the observation the learner is given. The exceptions are the hard rows. */
const ELEMENTS = {
  iron: {
    en: "iron",
    hi: "लोहा",
    clue: {
      en: "it shines when rubbed, flattens under a hammer and conducts electricity",
      hi: "रगड़ने पर चमकता है, हथौड़े से चपटा होता है और विद्युत का चालन करता है",
    },
    isMetal: true,
  },
  copper: {
    en: "copper",
    hi: "ताँबा",
    clue: {
      en: "it can be drawn into wires and is one of the best conductors of heat",
      hi: "इसके तार खींचे जा सकते हैं और यह ऊष्मा के सबसे अच्छे चालकों में से है",
    },
    isMetal: true,
  },
  sodium: {
    en: "sodium",
    hi: "सोडियम",
    clue: {
      en: "it is so soft that it can be cut with a knife, and its oxide turns red litmus blue",
      hi: "यह इतना नरम है कि चाकू से कट जाता है, और इसका ऑक्साइड लाल लिटमस को नीला करता है",
    },
    isMetal: true,
  },
  mercury: {
    en: "mercury",
    hi: "पारा",
    clue: {
      en: "it is a liquid at room temperature, shiny, and conducts electricity",
      hi: "यह कमरे के ताप पर द्रव है, चमकीला है, और विद्युत का चालन करता है",
    },
    isMetal: true,
  },
  gallium: {
    en: "gallium",
    hi: "गैलियम",
    clue: {
      en: "it melts on your palm, yet it is lustrous and conducts electricity",
      hi: "यह हथेली पर पिघल जाता है, फिर भी चमकीला है और विद्युत का चालन करता है",
    },
    isMetal: true,
  },
  sulphur: {
    en: "sulphur",
    hi: "सल्फ़र",
    clue: {
      en: "a yellow solid that breaks into powder when hammered; its oxide turns blue litmus red",
      hi: "एक पीला ठोस जो हथौड़ा मारने पर चूरा हो जाता है; इसका ऑक्साइड नीले लिटमस को लाल करता है",
    },
    isMetal: false,
  },
  iodine: {
    en: "iodine",
    hi: "आयोडीन",
    clue: {
      en: "it is lustrous, but brittle and does not conduct electricity",
      hi: "यह चमकीला है, पर भंगुर है और विद्युत का चालन नहीं करता",
    },
    isMetal: false,
  },
  graphite: {
    en: "graphite (a form of carbon)",
    hi: "ग्रेफ़ाइट (कार्बन का एक रूप)",
    clue: {
      en: "it conducts electricity, but it is not malleable and burns to an acidic oxide",
      hi: "यह विद्युत का चालन करता है, पर आघातवर्ध्य नहीं है और जलकर अम्लीय ऑक्साइड बनाता है",
    },
    isMetal: false,
  },
  diamond: {
    en: "diamond (a form of carbon)",
    hi: "हीरा (कार्बन का एक रूप)",
    clue: {
      en: "it is the hardest natural substance, but it is not malleable and does not conduct electricity",
      hi: "यह सबसे कठोर प्राकृतिक पदार्थ है, पर आघातवर्ध्य नहीं है और विद्युत का चालन नहीं करता",
    },
    isMetal: false,
  },
  bromine: {
    en: "bromine",
    hi: "ब्रोमीन",
    clue: {
      en: "it is a liquid at room temperature and does not conduct electricity",
      hi: "यह कमरे के ताप पर द्रव है और विद्युत का चालन नहीं करता",
    },
    isMetal: false,
  },
} as const satisfies Record<string, Fact>;
type Element = keyof typeof ELEMENTS;

/** Metal or non-metal, from what is observed about an element. */
export const metalOrNonMetal = family({
  level: Level.Easy,
  tests: [Concept.PhysicalProperties],
  params: z.object({ element: z.enum(Object.keys(ELEMENTS) as [Element, ...Element[]]) }).strict(),
  build: ({ element }, b) => {
    const e: Fact = ELEMENTS[element];
    const metal = t("A metal", "एक धातु");
    const nonMetal = t("A non-metal", "एक अधातु");
    const ask = pickOne(b, {
      prompt: t(
        `About ${e.en}: ${e.clue.en}. Is it a metal or a non-metal?`,
        `${e.hi} के बारे में: ${e.clue.hi}। यह धातु है या अधातु?`,
      ),
      right: e.isMetal ? metal : nonMetal,
      wrong: [
        {
          label: e.isMetal ? nonMetal : metal,
          why: e.isMetal
            ? t(
                `${e.en[0]?.toUpperCase()}${e.en.slice(1)} is a metal, even if one property looks unusual.`,
                `${e.hi} एक धातु है, भले ही कोई एक गुण असामान्य लगे।`,
              )
            : t(
                `${e.en[0]?.toUpperCase()}${e.en.slice(1)} is a non-metal: one metal-like property isn't enough.`,
                `${e.hi} एक अधातु है: धातु जैसा एक गुण काफ़ी नहीं है।`,
              ),
        },
      ],
      seed: seedOf(element),
    });
    return column([ask, space()]);
  },
});
