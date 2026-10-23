import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const ORES = {
  ZnS: { en: "zinc sulphide", hi: "ज़िंक सल्फ़ाइड", roast: true },
  ZnCO3: { en: "zinc carbonate", hi: "ज़िंक कार्बोनेट", roast: false },
  PbS: { en: "lead sulphide", hi: "लेड सल्फ़ाइड", roast: true },
  PbCO3: { en: "lead carbonate", hi: "लेड कार्बोनेट", roast: false },
  FeCO3: { en: "iron carbonate", hi: "आयरन कार्बोनेट", roast: false },
  Cu2S: { en: "copper sulphide", hi: "कॉपर सल्फ़ाइड", roast: true },
} as const;
type Ore = keyof typeof ORES;

/** Roasting (sulphide, excess air) or calcination (carbonate, limited air)? */
export const oreToOxide = family({
  level: Level.Medium,
  tests: [Concept.ExtractionOfMetals],
  params: z.object({ ore: z.enum(Object.keys(ORES) as [Ore, ...Ore[]]) }).strict(),
  build: ({ ore }, b) => {
    const o = ORES[ore];
    const roast = t("Roasting: heating strongly in excess air", "भर्जन: अधिक हवा में तेज़ गर्म करना");
    const calcine = t(
      "Calcination: heating strongly in limited air",
      "निस्तापन: सीमित हवा में तेज़ गर्म करना",
    );
    const ask = pickOne(b, {
      prompt: t(
        `An ore of ${o.en}, $\\ce{${ore}}$, must be turned into the oxide before reduction. Which process is used?`,
        `${o.hi}, $\\ce{${ore}}$, के अयस्क को अपचयन से पहले ऑक्साइड में बदलना है। कौन-सा प्रक्रम उपयोग होता है?`,
      ),
      right: o.roast ? roast : calcine,
      wrong: [
        {
          label: o.roast ? calcine : roast,
          why: t(
            "Sulphide ores are roasted; carbonate ores are calcined.",
            "सल्फ़ाइड अयस्कों का भर्जन होता है; कार्बोनेट अयस्कों का निस्तापन।",
          ),
        },
        {
          label: t("Electrolysis of the molten ore", "पिघले अयस्क का विद्युत अपघटन"),
          why: t(
            "Electrolysis is for the most reactive metals. This step only turns the ore into an oxide.",
            "विद्युत अपघटन सबसे क्रियाशील धातुओं के लिए है। यह क़दम केवल अयस्क को ऑक्साइड में बदलता है।",
          ),
        },
      ],
      seed: seedOf(ore),
    });
    return column([ask, space()]);
  },
});
