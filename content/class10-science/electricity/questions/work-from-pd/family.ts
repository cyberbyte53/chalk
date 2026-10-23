import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = { Work: "work", Volts: "volts", Charge: "charge" } as const;

/** V = W/Q, in all three directions (NCERT Example 12.2, in-text Q3). */
export const workFromPd = family({
  level: Level.Easy,
  tests: [Concept.PotentialDifference],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      volts: z.number().positive().optional(),
      coulombs: z.number().positive().optional(),
      joules: z.number().positive().optional(),
    })
    .strict(),
  build: ({ ask, volts, coulombs, joules }, b) => {
    const seed = seedOf(`${ask}${volts}${coulombs}${joules}`);
    if (ask === Ask.Work) {
      const v = volts ?? 1;
      const q = coulombs ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `How much work is done in moving ${q} C of charge across a potential difference of ${v} V?`,
            `${v} V विभवांतर से होकर ${q} C आवेश ले जाने में कितना कार्य होता है?`,
          ),
          unit: "J",
          right: v * q,
          wrong: [
            { value: v / q, feedback: t("W = V × Q, not V ÷ Q.", "W = V × Q, V ÷ Q नहीं।") },
            {
              value: v + q,
              feedback: t("Multiply, don't add: W = VQ.", "जोड़ो मत, गुणा करो: W = VQ।"),
            },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Volts) {
      const w = joules ?? 1;
      const q = coulombs ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `It takes ${w} J of work to move ${q} C of charge between two points. What is the potential difference between them?`,
            `दो बिंदुओं के बीच ${q} C आवेश ले जाने में ${w} J कार्य लगता है। उनके बीच विभवांतर कितना है?`,
          ),
          unit: "V",
          right: w / q,
          wrong: [
            {
              value: w * q,
              feedback: t(
                "V = W/Q: divide the work by the charge.",
                "V = W/Q: कार्य को आवेश से भाग दो।",
              ),
            },
            {
              value: q / w,
              feedback: t("That's upside down: joules per coulomb.", "यह उलटा है: जूल प्रति कूलॉम।"),
            },
          ],
        },
        seed,
      );
    }
    const w = joules ?? 1;
    const v = volts ?? 1;
    return numericBoard(
      b,
      {
        prompt: t(
          `A ${v} V battery does ${w} J of work. How much charge has it moved round the circuit?`,
          `${v} V की बैटरी ${w} J कार्य करती है। उसने परिपथ में कितना आवेश घुमाया?`,
        ),
        unit: "C",
        right: w / v,
        wrong: [
          { value: w * v, feedback: t("Q = W/V: divide.", "Q = W/V: भाग दो।") },
          { value: v / w, feedback: t("That's upside down: Q = W ÷ V.", "यह उलटा है: Q = W ÷ V।") },
        ],
      },
      seed,
    );
  },
});
