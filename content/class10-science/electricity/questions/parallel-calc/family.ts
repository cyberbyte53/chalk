import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

const Ask = { Total: "total", Current: "current", Branch: "branch" } as const;

/** Resistors in parallel on a battery (NCERT Example 12.8, 12.6.2 in-text Q2, Exercise 13). */
export const parallelCalc = family({
  level: Level.Medium,
  tests: [Concept.ResistorsInParallel],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      /** The resistors, Ω, as a list: "20, 4". */
      ohms: z.string().regex(/^\d+(\.\d+)?(, \d+(\.\d+)?)+$/),
      volts: z.number().positive().optional(),
      /** For branch: which resistor (0-based). */
      branch: z.number().int().min(0).optional(),
    })
    .strict(),
  build: ({ ask, ohms: written, volts, branch }, b) => {
    const ohms = written.split(", ").map(Number);
    const rp = 1 / ohms.reduce((s, r) => s + 1 / r, 0);
    const sum = ohms.reduce((s, r) => s + r, 0);
    const list = ohms.map((r) => `${r} Ω`).join(", ");
    const v = volts ?? 1;
    const seed = seedOf(`${ask}${list}${volts}${branch}`);
    const seriesSlip = t(
      "That adds them as if in series. In parallel the reciprocals add.",
      "इसमें उन्हें श्रेणीक्रम मानकर जोड़ा। पार्श्वक्रम में व्युत्क्रम जुड़ते हैं।",
    );
    if (ask === Ask.Total) {
      return numericBoard(
        b,
        {
          prompt: t(
            `Resistors of ${list} are joined in parallel. What is the equivalent resistance?`,
            `${list} के प्रतिरोधक पार्श्वक्रम में जुड़े हैं। तुल्य प्रतिरोध कितना है?`,
          ),
          unit: "Ω",
          right: rp,
          wrong: [
            { value: sum, feedback: seriesSlip },
            {
              value: 1 / rp,
              feedback: t(
                "That's 1/Rp. Turn it over at the end to get Rp.",
                "यह 1/Rp है। Rp पाने के लिए अंत में उलटो।",
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
            `Resistors of ${list} are in parallel on ${v} V. What is the total current from the source?`,
            `${list} के प्रतिरोधक ${v} V पर पार्श्वक्रम में हैं। स्रोत से कुल धारा कितनी है?`,
          ),
          unit: "A",
          right: v / rp,
          wrong: [
            { value: v / sum, feedback: seriesSlip },
            {
              value: v / (ohms[0] ?? 1),
              feedback: t(
                "That's one branch only. The branch currents add up.",
                "यह केवल एक शाखा है। शाखाओं की धाराएँ जुड़ती हैं।",
              ),
            },
          ],
        },
        seed,
      );
    }
    const k = Math.min(branch ?? 0, ohms.length - 1);
    const r = ohms[k] ?? 1;
    return numericBoard(
      b,
      {
        prompt: t(
          `Resistors of ${list} are in parallel on ${v} V. What current flows through the ${r} Ω resistor?`,
          `${list} के प्रतिरोधक ${v} V पर पार्श्वक्रम में हैं। ${r} Ω के प्रतिरोधक में कितनी धारा बहती है?`,
        ),
        unit: "A",
        right: v / r,
        wrong: [
          {
            value: v / rp,
            feedback: t(
              "That's the total current. Each branch has the full voltage: I = V/R for this one.",
              "यह कुल धारा है। हर शाखा पर पूरा वोल्टेज है: इसके लिए I = V/R।",
            ),
          },
          {
            value: v / sum,
            feedback: t(
              "In parallel each resistor gets the full voltage on its own.",
              "पार्श्वक्रम में हर प्रतिरोधक को अपने आप पूरा वोल्टेज मिलता है।",
            ),
          },
        ],
      },
      seed,
    );
  },
});
