import { column, family, space, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Item = {
  UniqueP: "uniqueP",
  InfiniteK: "infiniteK",
  NoSolutionK: "noSolutionK",
  InfiniteAB: "infiniteAB",
  ParallelPartner: "parallelPartner",
} as const;
type Item = (typeof Item)[keyof typeof Item];

const items: Record<
  Item,
  { prompt: Localized; right: string; wrong: { tex: string; why: Localized }[] }
> = {
  uniqueP: {
    prompt: t(
      "For which values of $p$ does $4x + py + 8 = 0$, $2x + 2y + 2 = 0$ have a unique solution?",
      "$p$ के किन मानों के लिए $4x + py + 8 = 0$, $2x + 2y + 2 = 0$ का अद्वितीय हल है?",
    ),
    right: "p \\neq 4",
    wrong: [
      {
        tex: "p = 4",
        why: t(
          "At $p = 4$, $\\tfrac{4}{2} = \\tfrac{p}{2}$: no unique solution.",
          "$p = 4$ पर $\\tfrac{4}{2} = \\tfrac{p}{2}$: अद्वितीय हल नहीं।",
        ),
      },
      {
        tex: "p \\neq 2",
        why: t(
          "Solve $\\tfrac{4}{2} = \\tfrac{p}{2}$ for $p$.",
          "$\\tfrac{4}{2} = \\tfrac{p}{2}$ से $p$ निकालो।",
        ),
      },
    ],
  },
  infiniteK: {
    prompt: t(
      "For what value of $k$ do $kx + 3y - (k - 3) = 0$ and $12x + ky - k = 0$ have infinitely many solutions?",
      "$k$ के किस मान के लिए $kx + 3y - (k - 3) = 0$ और $12x + ky - k = 0$ के अपरिमित हल हैं?",
    ),
    right: "k = 6",
    wrong: [
      {
        tex: "k = \\pm 6",
        why: t(
          "$k = -6$ fails $\\tfrac{3}{k} = \\tfrac{k - 3}{k}$.",
          "$k = -6$ शर्त $\\tfrac{3}{k} = \\tfrac{k - 3}{k}$ पर खरा नहीं उतरता।",
        ),
      },
      {
        tex: "k = 0",
        why: t(
          "At $k = 0$ the ratios $\\tfrac{3}{k}$ aren't even defined.",
          "$k = 0$ पर अनुपात $\\tfrac{3}{k}$ परिभाषित ही नहीं।",
        ),
      },
    ],
  },
  noSolutionK: {
    prompt: t(
      "For which value of $k$ do $3x + y = 1$ and $(2k - 1)x + (k - 1)y = 2k + 1$ have no solution?",
      "$k$ के किस मान के लिए $3x + y = 1$ और $(2k - 1)x + (k - 1)y = 2k + 1$ का कोई हल नहीं है?",
    ),
    right: "k = 2",
    wrong: [
      {
        tex: "k = 1",
        why: t(
          "Set $\\tfrac{3}{2k - 1} = \\tfrac{1}{k - 1}$: $3k - 3 = 2k - 1$.",
          "$\\tfrac{3}{2k - 1} = \\tfrac{1}{k - 1}$ रखो: $3k - 3 = 2k - 1$।",
        ),
      },
      {
        tex: "k = \\tfrac{1}{2}",
        why: t(
          "At $k = \\tfrac{1}{2}$ the second equation is $-\\tfrac{1}{2}y = 2$, a line that crosses the first.",
          "$k = \\tfrac{1}{2}$ पर दूसरा समीकरण $-\\tfrac{1}{2}y = 2$ है, एक रेखा जो पहली को काटती है।",
        ),
      },
    ],
  },
  infiniteAB: {
    prompt: t(
      "For which $a$ and $b$ do $2x + 3y = 7$ and $(a - b)x + (a + b)y = 3a + b - 2$ have infinitely many solutions?",
      "$a$ और $b$ के किन मानों के लिए $2x + 3y = 7$ और $(a - b)x + (a + b)y = 3a + b - 2$ के अपरिमित हल हैं?",
    ),
    right: "a = 5,\\ b = 1",
    wrong: [
      {
        tex: "a = 1,\\ b = 5",
        why: t(
          "Then $a - b = -4$, which doesn't match the 2 in the same ratio.",
          "तब $a - b = -4$, जो उसी अनुपात में 2 से मेल नहीं खाता।",
        ),
      },
      {
        tex: "a = 3,\\ b = 1",
        why: t(
          "Equal ratios: $\\tfrac{2}{a - b} = \\tfrac{3}{a + b} = \\tfrac{7}{3a + b - 2}$. These give $a = 5b$, then $b = 1$.",
          "बराबर अनुपात: $\\tfrac{2}{a - b} = \\tfrac{3}{a + b} = \\tfrac{7}{3a + b - 2}$। इनसे $a = 5b$, फिर $b = 1$।",
        ),
      },
    ],
  },
  parallelPartner: {
    prompt: t(
      "Which equation makes a pair of parallel lines with $2x + 3y - 8 = 0$?",
      "कौन-सा समीकरण $2x + 3y - 8 = 0$ के साथ समांतर रेखाओं का युग्म बनाता है?",
    ),
    right: "4x + 6y - 9 = 0",
    wrong: [
      {
        tex: "4x + 6y - 16 = 0",
        why: t(
          "That's the same equation times 2: the lines coincide.",
          "यह वही समीकरण गुणा 2 है: रेखाएँ संपाती हैं।",
        ),
      },
      {
        tex: "3x + 2y - 7 = 0",
        why: t(
          "$\\tfrac{2}{3} \\neq \\tfrac{3}{2}$, so these lines intersect.",
          "$\\tfrac{2}{3} \\neq \\tfrac{3}{2}$, इसलिए ये रेखाएँ प्रतिच्छेद करती हैं।",
        ),
      },
    ],
  },
};

/** Find a constant from the ratio conditions (NCERT Examples 15–16, Exercises 3.2 Q6 and 3.5 Q2). */
export const findTheConstant = family({
  level: Level.Hard,
  tests: [Concept.CrossMultiplication, Concept.GraphicalMethod],
  params: z.object({ item: z.nativeEnum(Item) }).strict(),
  build: ({ item }, bk) => {
    const it = items[item as Item];
    const options: Option[] = [
      { id: "right", label: t(`$${it.right}$`, `$${it.right}$`) },
      ...it.wrong.map((w, i) => ({
        id: `w${i}`,
        label: t(`$${w.tex}$`, `$${w.tex}$`),
        feedback: w.why,
      })),
    ];
    const ask = choiceQuestion(bk, {
      prompt: it.prompt,
      options: settle(options, item.length * 11),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
