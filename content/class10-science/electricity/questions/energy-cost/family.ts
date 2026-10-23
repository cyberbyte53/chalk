import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = { Units: "units", Cost: "cost", Joules: "joules" } as const;

/** Energy in kW h and its cost (NCERT Example 12.13; 12.8 in-text Q2; Exercise 16). */
export const energyCost = family({
  level: Level.Medium,
  tests: [Concept.ElectricPower],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      watts: z.number().positive(),
      hoursPerDay: z.number().positive(),
      days: z.number().int().positive(),
      /** ₹ per kW h (for cost). */
      rate: z.number().positive().optional(),
    })
    .strict(),
  build: ({ ask, watts, hoursPerDay, days, rate }, b) => {
    const kwh = (watts * hoursPerDay * days) / 1000;
    const seed = seedOf(`${ask}${watts}${hoursPerDay}${days}${rate}`);
    const when =
      days === 1
        ? t(`for ${hoursPerDay} hours`, `${hoursPerDay} घंटे`)
        : t(`${hoursPerDay} hours a day for ${days} days`, `रोज़ ${hoursPerDay} घंटे, ${days} दिन`);
    const thousand = t(
      "Change watt hours into kilowatt hours: divide by 1000.",
      "वाट घंटे को किलोवाट घंटे में बदलो: 1000 से भाग दो।",
    );
    if (ask === Ask.Units) {
      return numericBoard(
        b,
        {
          prompt: t(
            `A ${watts} W appliance runs ${when.en}. How many units (kW h) does it use?`,
            `${watts} W का उपकरण ${when.hi} चलता है। वह कितनी यूनिट (kW h) लेता है?`,
          ),
          unit: "kW h",
          right: kwh,
          wrong: [
            { value: kwh * 1000, feedback: thousand },
            {
              value: (watts * hoursPerDay) / 1000,
              feedback: t(
                "That's one day. Multiply by the number of days.",
                "यह एक दिन है। दिनों की संख्या से गुणा करो।",
              ),
            },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Cost) {
      const price = rate ?? 6;
      return numericBoard(
        b,
        {
          prompt: t(
            `A ${watts} W appliance runs ${when.en}. At ₹${price} per kW h, what does it cost? (Answer in ₹.)`,
            `${watts} W का उपकरण ${when.hi} चलता है। ₹${price} प्रति kW h की दर से ख़र्च कितना है? (₹ में उत्तर।)`,
          ),
          unit: "",
          right: kwh * price,
          wrong: [
            { value: kwh * 1000 * price, feedback: thousand },
            {
              value: kwh,
              feedback: t(
                "That's the units. Multiply by the price of a unit.",
                "ये यूनिट हैं। एक यूनिट के दाम से गुणा करो।",
              ),
            },
          ],
        },
        seed,
      );
    }
    return numericBoard(
      b,
      {
        prompt: t(
          `A ${watts} W appliance runs ${when.en}. How much energy is that in joules?`,
          `${watts} W का उपकरण ${when.hi} चलता है। जूल में यह कितनी ऊर्जा है?`,
        ),
        unit: "J",
        right: kwh * 3.6e6,
        wrong: [
          {
            value: watts * hoursPerDay * days,
            feedback: t(
              "Watts × hours gives watt hours. For joules use seconds: 1 kW h = 3.6 × 10⁶ J.",
              "वाट × घंटे से वाट घंटे मिलते हैं। जूल के लिए सेकंड लो: 1 kW h = 3.6 × 10⁶ J।",
            ),
          },
          {
            value: kwh * 3600,
            feedback: t(
              "1 kW h = 1000 W × 3600 s = 3.6 × 10⁶ J.",
              "1 kW h = 1000 W × 3600 s = 3.6 × 10⁶ J।",
            ),
          },
        ],
      },
      seed,
    );
  },
});
