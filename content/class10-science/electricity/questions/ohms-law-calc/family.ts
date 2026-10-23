import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = {
  Current: "current",
  Resistance: "resistance",
  Volts: "volts",
  NewCurrent: "newCurrent",
} as const;

/** Ohm's law calculations (NCERT Examples 12.3, 12.4; Exercise 8). */
export const ohmsLawCalc = family({
  level: Level.Easy,
  tests: [Concept.OhmsLaw],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      volts: z.number().positive().optional(),
      amps: z.number().positive().optional(),
      ohms: z.number().positive().optional(),
      /** For newCurrent: the new potential difference. */
      newVolts: z.number().positive().optional(),
    })
    .strict(),
  build: ({ ask, volts, amps, ohms, newVolts }, b) => {
    const seed = seedOf(`${ask}${volts}${amps}${ohms}${newVolts}`);
    const upside = t("That's the formula upside down.", "यह सूत्र उलटा है।");
    if (ask === Ask.Current) {
      const v = volts ?? 1;
      const r = ohms ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `A ${r} Ω resistor is connected across ${v} V. What current flows?`,
            `${r} Ω का प्रतिरोधक ${v} V से जुड़ा है। कितनी धारा बहती है?`,
          ),
          unit: "A",
          right: v / r,
          wrong: [
            { value: v * r, feedback: t("I = V/R: divide.", "I = V/R: भाग दो।") },
            { value: r / v, feedback: upside },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Resistance) {
      const v = volts ?? 1;
      const i = amps ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `A potential difference of ${v} V drives a current of ${i} A through a resistor. What is its resistance?`,
            `${v} V का विभवांतर एक प्रतिरोधक में ${i} A धारा बहाता है। उसका प्रतिरोध कितना है?`,
          ),
          unit: "Ω",
          right: v / i,
          wrong: [
            { value: v * i, feedback: t("R = V/I: divide.", "R = V/I: भाग दो।") },
            { value: i / v, feedback: upside },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Volts) {
      const i = amps ?? 1;
      const r = ohms ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `A current of ${i} A flows through a ${r} Ω resistor. What is the potential difference across it?`,
            `${r} Ω के प्रतिरोधक में ${i} A धारा बहती है। उसके सिरों पर विभवांतर कितना है?`,
          ),
          unit: "V",
          right: i * r,
          wrong: [
            { value: r / i, feedback: t("V = IR: multiply.", "V = IR: गुणा करो।") },
            { value: i / r, feedback: t("V = IR: multiply.", "V = IR: गुणा करो।") },
          ],
        },
        seed,
      );
    }
    const v = volts ?? 1;
    const i = amps ?? 1;
    const nv = newVolts ?? 1;
    return numericBoard(
      b,
      {
        prompt: t(
          `A heater draws ${i} A when the potential difference across it is ${v} V. What current does it draw at ${nv} V?`,
          `एक हीटर ${v} V विभवांतर पर ${i} A लेता है। ${nv} V पर वह कितनी धारा लेगा?`,
        ),
        unit: "A",
        right: (i * nv) / v,
        wrong: [
          {
            value: i,
            feedback: t(
              "Its resistance stays the same, so a bigger push drives a bigger current.",
              "उसका प्रतिरोध वही रहता है, इसलिए बड़ा धक्का बड़ी धारा बहाता है।",
            ),
          },
          {
            value: (i * v) / nv,
            feedback: t(
              "Current goes up with the voltage, not down. Find R = V/I first.",
              "धारा वोल्टेज के साथ बढ़ती है, घटती नहीं। पहले R = V/I निकालो।",
            ),
          },
        ],
      },
      seed,
    );
  },
});
