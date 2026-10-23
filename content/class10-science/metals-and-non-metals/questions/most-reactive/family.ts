import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const SERIES = ["K", "Na", "Ca", "Mg", "Al", "Zn", "Fe", "Pb", "Cu", "Hg", "Ag", "Au"] as const;
type Metal = (typeof SERIES)[number];

const NAMES: Record<Metal, { en: string; hi: string }> = {
  K: { en: "potassium", hi: "पोटैशियम" },
  Na: { en: "sodium", hi: "सोडियम" },
  Ca: { en: "calcium", hi: "कैल्शियम" },
  Mg: { en: "magnesium", hi: "मैग्नीशियम" },
  Al: { en: "aluminium", hi: "ऐलुमिनियम" },
  Zn: { en: "zinc", hi: "ज़िंक" },
  Fe: { en: "iron", hi: "लोहा" },
  Pb: { en: "lead", hi: "लेड" },
  Cu: { en: "copper", hi: "ताँबा" },
  Hg: { en: "mercury", hi: "पारा" },
  Ag: { en: "silver", hi: "चाँदी" },
  Au: { en: "gold", hi: "सोना" },
};

/** Three metals: which is the most (or least) reactive? */
export const mostReactive = family({
  level: Level.Easy,
  tests: [Concept.ReactivitySeries],
  params: z
    .object({
      a: z.enum(SERIES),
      b: z.enum(SERIES),
      c: z.enum(SERIES),
      ask: z.enum(["most", "least"]),
    })
    .strict(),
  build: ({ a, b: second, c, ask }, b) => {
    const metals = [a, second, c];
    if (new Set(metals).size !== 3) throw new Error("mostReactive: three different metals");
    const sorted = [...metals].sort((x, y) => SERIES.indexOf(x) - SERIES.indexOf(y));
    const answer = (ask === "most" ? sorted[0] : sorted[2]) as Metal;
    const label = (m: Metal) => t(`${NAMES[m].en} (${m})`, `${NAMES[m].hi} (${m})`);
    const q = pickOne(b, {
      prompt:
        ask === "most"
          ? t(
              "Which of these metals is the most reactive?",
              "इनमें से कौन-सी धातु सबसे अधिक क्रियाशील है?",
            )
          : t(
              "Which of these metals is the least reactive?",
              "इनमें से कौन-सी धातु सबसे कम क्रियाशील है?",
            ),
      right: label(answer),
      wrong: metals
        .filter((m) => m !== answer)
        .map((m) => ({
          label: label(m),
          why: t(
            "Find each one in the series K, Na, Ca, Mg, Al, Zn, Fe, Pb, [H], Cu, Hg, Ag, Au.",
            "हर एक को श्रेणी K, Na, Ca, Mg, Al, Zn, Fe, Pb, [H], Cu, Hg, Ag, Au में ढूँढो।",
          ),
        })),
      seed: seedOf(...metals, ask),
    });
    return column([q, space()]);
  },
});
