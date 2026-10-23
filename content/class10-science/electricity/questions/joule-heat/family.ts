import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = {
  Heat: "heat",
  HeatFromCharge: "heatFromCharge",
  Rate: "rate",
  Volts: "volts",
} as const;

/** Joule's law of heating (NCERT Examples 12.10, 12.11; 12.7 in-text Q2, Q3; Exercise 17). */
export const jouleHeat = family({
  level: Level.Medium,
  tests: [Concept.HeatingEffect],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      amps: z.number().positive().optional(),
      ohms: z.number().positive().optional(),
      seconds: z.number().positive().optional(),
      coulombs: z.number().positive().optional(),
      volts: z.number().positive().optional(),
      /** For volts: heat made each second, J. */
      joules: z.number().positive().optional(),
    })
    .strict(),
  build: ({ ask, amps, ohms, seconds, coulombs, volts, joules }, b) => {
    const seed = seedOf(`${ask}${amps}${ohms}${seconds}${coulombs}${volts}${joules}`);
    const i = amps ?? 1;
    const r = ohms ?? 1;
    const s = seconds ?? 1;
    const square = t("The current is squared: H = I²Rt.", "धारा का वर्ग होता है: H = I²Rt।");
    if (ask === Ask.Heat) {
      return numericBoard(
        b,
        {
          prompt: t(
            `A ${r} Ω resistor carries ${i} A for ${s} s. How much heat is produced?`,
            `${r} Ω का प्रतिरोधक ${s} s तक ${i} A धारा ले जाता है। कितनी गर्मी बनती है?`,
          ),
          unit: "J",
          right: i * i * r * s,
          wrong: [
            { value: i * r * s, feedback: square },
            {
              value: i * i * r,
              feedback: t(
                "That's the heat in one second. Multiply by the time too.",
                "यह एक सेकंड की गर्मी है। समय से भी गुणा करो।",
              ),
            },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.HeatFromCharge) {
      const q = coulombs ?? 1;
      const v = volts ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `${q} C of charge is moved through a potential difference of ${v} V. How much heat is generated?`,
            `${q} C आवेश को ${v} V विभवांतर से होकर ले जाया जाता है। कितनी गर्मी बनती है?`,
          ),
          unit: "J",
          right: q * v,
          wrong: [
            {
              value: (q * v) / 3600,
              feedback: t(
                "No time is needed: H = VIt = VQ, since It = Q.",
                "समय नहीं चाहिए: H = VIt = VQ, क्योंकि It = Q।",
              ),
            },
            { value: q / v, feedback: t("Multiply: H = VQ.", "गुणा करो: H = VQ।") },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Rate) {
      return numericBoard(
        b,
        {
          prompt: t(
            `A heater of resistance ${r} Ω draws ${i} A. At what rate (joules per second) is heat developed?`,
            `${r} Ω प्रतिरोध का हीटर ${i} A लेता है। गर्मी किस दर से (जूल प्रति सेकंड) बनती है?`,
          ),
          unit: "W",
          right: i * i * r,
          wrong: [
            { value: i * r, feedback: square },
            {
              value: i * i * r * (seconds ?? 7200),
              feedback: t(
                "That's a total over time. The rate is per second: I²R.",
                "यह समय में कुल है। दर प्रति सेकंड है: I²R।",
              ),
            },
          ],
        },
        seed,
      );
    }
    const h = joules ?? 1;
    return numericBoard(
      b,
      {
        prompt: t(
          `${h} J of heat is produced each second in a ${r} Ω resistance. What is the potential difference across it?`,
          `${r} Ω के प्रतिरोध में हर सेकंड ${h} J गर्मी बनती है। उसके सिरों पर विभवांतर कितना है?`,
        ),
        unit: "V",
        right: Math.sqrt(h / r) * r,
        wrong: [
          {
            value: Math.sqrt(h / r),
            feedback: t(
              "That's the current, I = √(H/Rt). Then V = IR.",
              "यह धारा है, I = √(H/Rt)। फिर V = IR।",
            ),
          },
          {
            value: h / r,
            feedback: t(
              "H/R is I², not V. Take the square root, then multiply by R.",
              "H/R, I² है, V नहीं। वर्गमूल लो, फिर R से गुणा करो।",
            ),
          },
        ],
      },
      seed,
    );
  },
});
