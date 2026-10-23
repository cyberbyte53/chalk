import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** (x + h)² − k written as TeX, with h possibly negative or a half. */
function squareTex(h: number, k: number, sign: "-" | "+"): string {
  const hTex = Number.isInteger(h) ? String(Math.abs(h)) : `\\tfrac{${Math.abs(h * 2)}}{2}`;
  const kTex = Number.isInteger(k) ? String(k) : `\\tfrac{${k * 4}}{4}`;
  return `\\left(x ${h < 0 ? "-" : "+"} ${hTex}\\right)^2 ${sign} ${kTex}`;
}

/** Complete the square: x² + bx = (x + b/2)² − (b/2)². */
export const completeTheSquare = family({
  level: Level.Easy,
  tests: [Concept.CompletingTheSquare],
  params: z
    .object({
      b: z
        .number()
        .int()
        .refine((n) => n !== 0, "b can't be 0"),
    })
    .strict(),
  build: ({ b: k }, b) => {
    const half = k / 2;
    const corner = half * half;
    const bTex = k < 0 ? `- ${Math.abs(k)}x` : `+ ${k}x`;
    const options: Option[] = [
      {
        id: "right",
        label: t(`$${squareTex(half, corner, "-")}$`, `$${squareTex(half, corner, "-")}$`),
      },
      {
        id: "whole",
        label: t(`$${squareTex(k, k * k, "-")}$`, `$${squareTex(k, k * k, "-")}$`),
        feedback: t(
          `Use **half** of ${k}. The square of $(x ${k < 0 ? "-" : "+"} ${Math.abs(k)})$ has ${2 * Math.abs(k)}x in it, twice too many.`,
          `${k} का **आधा** लो। $(x ${k < 0 ? "-" : "+"} ${Math.abs(k)})$ के वर्ग में ${2 * Math.abs(k)}x आता है, दुगुना।`,
        ),
      },
      {
        id: "plus",
        label: t(`$${squareTex(half, corner, "+")}$`, `$${squareTex(half, corner, "+")}$`),
        feedback: t(
          "The square brings in the corner as an extra; subtract it to get back what you started with.",
          "वर्ग कोने को अतिरिक्त जोड़ देता है; जो शुरू में था वह वापस पाने के लिए उसे घटाओ।",
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(`Complete the square: $x^2 ${bTex} = \;?$`, `पूर्ण वर्ग बनाओ: $x^2 ${bTex} = \;?$`),
      options: settle(options, Math.abs(k) * 7 + 2),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
