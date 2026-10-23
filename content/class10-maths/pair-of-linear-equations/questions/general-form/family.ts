import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { eqTex, lineOf } from "../../kit";

const Letter = { A: "a", B: "b", C: "c" } as const;

/** Read a, b or c off an equation once it is in the general form a x + b y + c = 0. */
export const generalForm = family({
  level: Level.Easy,
  tests: [Concept.PairOfEquations],
  params: z
    .object({
      a: z.number().int(),
      b: z.number().int(),
      k: z.number().int(),
      ask: z.nativeEnum(Letter),
    })
    .strict(),
  build: ({ a, b, k, ask }, bk) => {
    const line = lineOf({ a, b, k });
    const value = { a, b, c: -k + 0 }[ask];
    const m = (n: number) => `$${n}$`;
    const wrong =
      ask === Letter.C
        ? [
            {
              id: "sign",
              label: t(m(k), m(k)),
              feedback: t(
                `To get $= 0$, ${k} moves to the left side and changes sign: $${eqTex(line, true)}$.`,
                `$= 0$ लाने के लिए ${k} बाईं ओर जाता है और चिह्न बदलता है: $${eqTex(line, true)}$।`,
              ),
            },
            {
              id: "other",
              label: t(m(a), m(a)),
              feedback: t(
                "That's $a$, the number with $x$. $c$ is the number on its own.",
                "यह $a$ है, $x$ वाली संख्या। $c$ अकेली संख्या है।",
              ),
            },
          ]
        : [
            {
              id: "other",
              label: t(m(ask === Letter.A ? b : a), m(ask === Letter.A ? b : a)),
              feedback: t(
                `$a$ goes with $x$ and $b$ with $y$.`,
                `$a$, $x$ के साथ है और $b$, $y$ के साथ।`,
              ),
            },
            {
              id: "c",
              label: t(m(-k), m(-k)),
              feedback: t("That's $c$, the number on its own.", "यह $c$ है, अकेली संख्या।"),
            },
          ];
    const options = distinctOptions(
      { id: "right", label: t(m(value), m(value)) },
      wrong.filter((w) => w.label.en !== m(value)),
    );
    const q = choiceQuestion(bk, {
      prompt: t(
        `Write $${eqTex(line)}$ in the form $ax + by + c = 0$. What is $${ask}$?`,
        `$${eqTex(line)}$ को $ax + by + c = 0$ रूप में लिखो। $${ask}$ क्या है?`,
      ),
      options: settle(options, a * 5 + b * 3 + k),
      answer: "right",
    });
    return column([q, space()]);
  },
});
