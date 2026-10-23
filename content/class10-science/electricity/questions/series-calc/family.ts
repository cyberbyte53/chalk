import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = { Total: "total", Current: "current", VoltsAcross: "voltsAcross" } as const;

/** Resistors in series on a battery (NCERT Example 12.7, 12.6.1 in-text Q2, Exercise 9). */
export const seriesCalc = family({
  level: Level.Medium,
  tests: [Concept.ResistorsInSeries],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      /** The resistors, Ω, as a list: "20, 4". */
      ohms: z.string().regex(/^\d+(\.\d+)?(, \d+(\.\d+)?)+$/),
      volts: z.number().positive(),
      /** For voltsAcross: which resistor (0-based). */
      across: z.number().int().min(0).optional(),
    })
    .strict(),
  build: ({ ask, ohms: written, volts, across }, b) => {
    const ohms = written.split(", ").map(Number);
    const total = ohms.reduce((s, r) => s + r, 0);
    const list = ohms.map((r) => `${r} Ω`).join(", ");
    const current = volts / total;
    const seed = seedOf(`${ask}${list}${volts}${across}`);
    const parallelSlip = 1 / ohms.reduce((s, r) => s + 1 / r, 0);
    if (ask === Ask.Total) {
      return numericBoard(
        b,
        {
          prompt: t(
            `Resistors of ${list} are joined in series. What is the total resistance?`,
            `${list} के प्रतिरोधक श्रेणीक्रम में जुड़े हैं। कुल प्रतिरोध कितना है?`,
          ),
          unit: "Ω",
          right: total,
          wrong: [
            {
              value: parallelSlip,
              feedback: t(
                "That's the parallel rule. In series, add them.",
                "यह पार्श्वक्रम का नियम है। श्रेणीक्रम में जोड़ो।",
              ),
            },
            {
              value: Math.max(...ohms),
              feedback: t(
                "Every resistor is in the path, so they all add.",
                "हर प्रतिरोधक रास्ते में है, इसलिए सब जुड़ते हैं।",
              ),
            },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Current) {
      return numericBoard(
        b,
        {
          prompt: t(
            `Resistors of ${list} are in series with a ${volts} V battery. What current flows through each?`,
            `${list} के प्रतिरोधक ${volts} V की बैटरी के साथ श्रेणीक्रम में हैं। हर एक में कितनी धारा बहती है?`,
          ),
          unit: "A",
          right: current,
          wrong: [
            {
              value: volts / (ohms[ohms.length - 1] ?? 1),
              feedback: t(
                "That uses one resistor alone. Add them all first.",
                "इसमें अकेला एक प्रतिरोधक लिया। पहले सब जोड़ो।",
              ),
            },
            {
              value: volts / parallelSlip,
              feedback: t("In series the resistances add.", "श्रेणीक्रम में प्रतिरोध जुड़ते हैं।"),
            },
          ],
        },
        seed,
      );
    }
    const k = Math.min(across ?? 0, ohms.length - 1);
    const r = ohms[k] ?? 1;
    return numericBoard(
      b,
      {
        prompt: t(
          `Resistors of ${list} are in series with a ${volts} V battery. What is the potential difference across the ${r} Ω resistor?`,
          `${list} के प्रतिरोधक ${volts} V की बैटरी के साथ श्रेणीक्रम में हैं। ${r} Ω के प्रतिरोधक के सिरों पर विभवांतर कितना है?`,
        ),
        unit: "V",
        right: current * r,
        wrong: [
          {
            value: volts,
            feedback: t(
              "The full voltage is across all of them together; in series it is shared. V = IR for this one.",
              "पूरा वोल्टेज सबके सिरों पर मिलाकर है; श्रेणीक्रम में यह बँटता है। इसके लिए V = IR।",
            ),
          },
          {
            value: volts / ohms.length,
            feedback: t(
              "It isn't shared equally: a bigger resistor gets a bigger share. Use V = IR.",
              "यह बराबर नहीं बँटता: बड़े प्रतिरोधक को बड़ा हिस्सा मिलता है। V = IR लगाओ।",
            ),
          },
        ],
      },
      seed,
    );
  },
});
