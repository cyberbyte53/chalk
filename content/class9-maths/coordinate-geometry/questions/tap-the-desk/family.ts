import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { bareClassroom, check, isChosen } from "@chalk/patterns";
import { coordinatePlaneDef } from "@chalk/prop-coordinates";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Activity 1: a desk is (column, row), column first. Tap it by its pair. */
export const tapTheDesk = family({
  level: Level.Easy,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({ column: z.number().int().min(1).max(7), row: z.number().int().min(1).max(7) })
    .strict()
    .refine((p) => p.column !== p.row, "the column and the row differ, so the order shows"),
  build: ({ column, row }, b) => {
    const room = b.prop(coordinatePlaneDef, "room", bareClassroom());
    const ask = check(b, {
      about: room,
      prompt: t(
        `Tap the desk **(${column}, ${row})**, then press Check.`,
        `डेस्क **(${column}, ${row})** दबाओ, फिर जाँचो दबाओ।`,
      ),
      isRight: isChosen(room, column, row),
      solve: [room.learner.chooseTarget({ x: column, y: row })],
      notes: [
        {
          when: isChosen(room, row, column),
          say: t(
            `That desk is (${row}, ${column}): column ${row}, row ${column}. The column comes first.`,
            `वह डेस्क (${row}, ${column}) है: स्तंभ ${row}, पंक्ति ${column}। स्तंभ पहले आता है।`,
          ),
          reach: [room.learner.chooseTarget({ x: row, y: column })],
        },
      ],
    });
    return [room, ask];
  },
});
