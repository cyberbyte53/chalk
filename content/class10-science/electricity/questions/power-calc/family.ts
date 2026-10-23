import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = {
  FromVI: "fromVI",
  Current: "current",
  AtLowerVolts: "atLowerVolts",
  Resistance: "resistance",
} as const;

/** Electric power: P = VI = I²R = V²/R (NCERT Examples 12.10, 12.12; Exercises 3, 15). */
export const powerCalc = family({
  level: Level.Medium,
  tests: [Concept.ElectricPower],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      volts: z.number().positive().optional(),
      amps: z.number().positive().optional(),
      watts: z.number().positive().optional(),
      /** For atLowerVolts: the voltage actually used. */
      usedVolts: z.number().positive().optional(),
    })
    .strict(),
  build: ({ ask, volts, amps, watts, usedVolts }, b) => {
    const seed = seedOf(`${ask}${volts}${amps}${watts}${usedVolts}`);
    const v = volts ?? 220;
    if (ask === Ask.FromVI) {
      const i = amps ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `A device on ${v} V draws ${i} A. What is its power?`,
            `${v} V पर एक युक्ति ${i} A लेती है। उसकी शक्ति कितनी है?`,
          ),
          unit: "W",
          right: v * i,
          wrong: [
            { value: v / i, feedback: t("P = V × I: multiply.", "P = V × I: गुणा करो।") },
            { value: i / v, feedback: t("P = V × I: multiply.", "P = V × I: गुणा करो।") },
          ],
        },
        seed,
      );
    }
    const p = watts ?? 100;
    if (ask === Ask.Current) {
      return numericBoard(
        b,
        {
          prompt: t(
            `An appliance rated ${p} W works on ${v} V. What current does it draw?`,
            `${p} W रेटिंग का एक उपकरण ${v} V पर चलता है। वह कितनी धारा लेता है?`,
          ),
          unit: "A",
          right: p / v,
          wrong: [
            { value: p * v, feedback: t("I = P/V: divide.", "I = P/V: भाग दो।") },
            {
              value: v / p,
              feedback: t("That's upside down: I = P ÷ V.", "यह उलटा है: I = P ÷ V।"),
            },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Resistance) {
      return numericBoard(
        b,
        {
          prompt: t(
            `A ${p} W appliance works on ${v} V. What is its resistance?`,
            `${p} W का उपकरण ${v} V पर चलता है। उसका प्रतिरोध कितना है?`,
          ),
          unit: "Ω",
          right: (v * v) / p,
          wrong: [
            {
              value: v / p,
              feedback: t("Use P = V²/R, so R = V²/P.", "P = V²/R लगाओ, इसलिए R = V²/P।"),
            },
            {
              value: p / v,
              feedback: t("That's the current. R = V²/P.", "यह धारा है। R = V²/P।"),
            },
          ],
        },
        seed,
      );
    }
    const u = usedVolts ?? v / 2;
    return numericBoard(
      b,
      {
        prompt: t(
          `A bulb is rated ${v} V, ${p} W. What power does it use on ${u} V?`,
          `एक बल्ब की रेटिंग ${v} V, ${p} W है। ${u} V पर वह कितनी शक्ति लेता है?`,
        ),
        unit: "W",
        right: p * (u / v) ** 2,
        wrong: [
          {
            value: (p * u) / v,
            feedback: t(
              "Its resistance stays fixed and P = V²/R, so the power goes with the voltage squared.",
              "उसका प्रतिरोध स्थिर रहता है और P = V²/R, इसलिए शक्ति वोल्टेज के वर्ग के साथ चलती है।",
            ),
          },
          {
            value: p,
            feedback: t(
              "The rating is the power at its rated voltage. On less, it uses less.",
              "रेटिंग अपने रेटेड वोल्टेज पर शक्ति है। कम पर, यह कम लेता है।",
            ),
          },
        ],
      },
      seed,
    );
  },
});
