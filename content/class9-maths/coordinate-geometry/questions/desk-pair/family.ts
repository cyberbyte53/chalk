import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Activity 1: a desk is (column, row), column first. */
export const deskPair = family({
  level: Level.Easy,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({ column: z.number().int().min(1).max(10), row: z.number().int().min(1).max(7) })
    .strict()
    .refine((p) => p.column !== p.row, "the column and the row differ, so the order shows"),
  build: ({ column, row }, b) => {
    const ask = choiceQuestion(b, {
      prompt: t(
        `In a classroom seating plan, each desk is written as (column, row): the column counted from the left, then the row counted from the front. Rahul sits in **row ${row}, column ${column}**. How is his desk written?`,
        `कक्षा की बैठक योजना में हर डेस्क (स्तंभ, पंक्ति) लिखी जाती है: पहले बाईं ओर से गिना स्तंभ, फिर आगे से गिनी पंक्ति। राहुल **पंक्ति ${row}, स्तंभ ${column}** में बैठता है। उसकी डेस्क कैसे लिखी जाती है?`,
      ),
      options: [
        { id: "right", label: t(`(${column}, ${row})`, `(${column}, ${row})`) },
        { id: "swapped", label: t(`(${row}, ${column})`, `(${row}, ${column})`) },
      ],
      answer: "right",
    });
    return [ask];
  },
});
