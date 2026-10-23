import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Three numbers, one irrational: the others only look irrational until worked out. */
const SETS = {
  /** √16 = 4; √2 × √8 = √16 = 4; 3 + √5 is rational + irrational. */
  sums: {
    right: r`3 + \sqrt{5}`,
    decoys: [
      {
        tex: r`\sqrt{16}`,
        en: r`$\sqrt{16} = 4$, an integer.`,
        hi: r`$\sqrt{16} = 4$, एक पूर्णांक।`,
      },
      {
        tex: r`\sqrt{2} \times \sqrt{8}`,
        en: r`$\sqrt{2} \times \sqrt{8} = \sqrt{16} = 4$. Two irrationals can multiply to a rational.`,
        hi: r`$\sqrt{2} \times \sqrt{8} = \sqrt{16} = 4$। दो अपरिमेय का गुणनफल परिमेय हो सकता है।`,
      },
    ],
  },
  /** (√3)² = 3; √18 / √2 = √9 = 3; 2√7 is a non-zero rational times an irrational. */
  products: {
    right: r`2\sqrt{7}`,
    decoys: [
      {
        tex: r`(\sqrt{3})^2`,
        en: r`$(\sqrt{3})^2 = 3$: squaring undoes the root.`,
        hi: r`$(\sqrt{3})^2 = 3$: वर्ग करने से मूल हट जाता है।`,
      },
      {
        tex: r`\frac{\sqrt{18}}{\sqrt{2}}`,
        en: r`$\frac{\sqrt{18}}{\sqrt{2}} = \sqrt{9} = 3$.`,
        hi: r`$\frac{\sqrt{18}}{\sqrt{2}} = \sqrt{9} = 3$।`,
      },
    ],
  },
} as const;

/** Which of three numbers is irrational? Two decoys turn out rational once worked out. */
export const whichIsIrrational = family({
  level: Level.Medium,
  tests: [Concept.RootTwoIrrational],
  params: z.object({ set: z.enum(["sums", "products"]) }).strict(),
  build: ({ set }, b) => {
    const { right, decoys } = SETS[set];
    const options: Option[] = [
      { id: "right", label: t(`$${right}$`, `$${right}$`) },
      ...decoys.map((d, i) => ({
        id: `decoy${i}`,
        label: t(`$${d.tex}$`, `$${d.tex}$`),
        feedback: t(d.en, d.hi),
      })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t("Which of these is irrational?", "इनमें से कौन-सा अपरिमेय है?"),
      options: settle(options, set.length * 13),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
