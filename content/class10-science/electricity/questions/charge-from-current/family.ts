import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = { Charge: "charge", Current: "current", Electrons: "electrons" } as const;
const Unit = { Second: "s", Minute: "min", Hour: "h" } as const;
const SECONDS = { s: 1, min: 60, h: 3600 } as const;
const ELECTRON = 1.6e-19;

/** Q = It, both ways, and how many electrons a charge is (NCERT 12.1, Example 12.1, in-text Q3). */
export const chargeFromCurrent = family({
  level: Level.Medium,
  tests: [Concept.CurrentAndCircuit],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      /** Current, A (for charge) or charge, C (for current / electrons). */
      amps: z.number().positive().optional(),
      coulombs: z.number().positive().optional(),
      time: z.number().positive().optional(),
      unit: z.nativeEnum(Unit).optional(),
    })
    .strict(),
  build: ({ ask, amps, coulombs, time, unit }, b) => {
    const u = unit ?? Unit.Second;
    const secs = (time ?? 1) * SECONDS[u];
    const seed = seedOf(`${ask}${amps}${coulombs}${time}${u}`);
    const timeEn = `${time} ${u === "s" ? "s" : u === "min" ? "minutes" : "hours"}`;
    const timeHi = `${time} ${u === "s" ? "s" : u === "min" ? "मिनट" : "घंटे"}`;
    const noSeconds = t(
      "Change the time into seconds first: the ampere is coulombs per second.",
      "पहले समय को सेकंड में बदलो: ऐम्पियर कूलॉम प्रति सेकंड है।",
    );
    if (ask === Ask.Charge) {
      const a = amps ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `A current of ${a} A flows for ${timeEn}. How much charge flows?`,
            `${a} A की धारा ${timeHi} तक बहती है। कितना आवेश बहता है?`,
          ),
          unit: "C",
          right: a * secs,
          wrong: [
            { value: a * (time ?? 1), feedback: noSeconds },
            {
              value: secs / a,
              feedback: t(
                "Charge is current × time, not time ÷ current.",
                "आवेश = धारा × समय, समय ÷ धारा नहीं।",
              ),
            },
          ],
        },
        seed,
      );
    }
    if (ask === Ask.Current) {
      const q = coulombs ?? 1;
      return numericBoard(
        b,
        {
          prompt: t(
            `${q} C of charge flows through a wire in ${timeEn}. What is the current?`,
            `एक तार में से ${timeHi} में ${q} C आवेश बहता है। धारा कितनी है?`,
          ),
          unit: "A",
          right: q / secs,
          wrong: [
            { value: q / (time ?? 1), feedback: noSeconds },
            {
              value: q * secs,
              feedback: t("Current is charge ÷ time: I = Q/t.", "धारा = आवेश ÷ समय: I = Q/t।"),
            },
          ],
        },
        seed,
      );
    }
    const q = coulombs ?? 1;
    return numericBoard(
      b,
      {
        prompt: t(
          `How many electrons make up a charge of ${q} C? (One electron carries 1.6 × 10⁻¹⁹ C.)`,
          `${q} C आवेश में कितने इलेक्ट्रॉन होते हैं? (एक इलेक्ट्रॉन पर 1.6 × 10⁻¹⁹ C होता है।)`,
        ),
        unit: "",
        right: q / ELECTRON,
        wrong: [
          {
            value: q * ELECTRON,
            feedback: t(
              "Divide the charge by the charge on one electron, don't multiply.",
              "आवेश को एक इलेक्ट्रॉन के आवेश से भाग दो, गुणा नहीं।",
            ),
          },
          {
            value: (q / ELECTRON) * 10,
            feedback: t(
              "Check the power of ten: 1 ÷ 1.6 × 10¹⁹.",
              "दस की घात जाँचो: 1 ÷ 1.6 × 10¹⁹।",
            ),
          },
        ],
      },
      seed,
    );
  },
});
