import { z } from "zod";
import { boardSchema } from "./board";
import { localizedSchema } from "./localized";
import { permanentIdSchema } from "./piece";
import { walkPieces } from "./walk";

/** An ordered run of boards. Story, walkthrough, practice and quiz are all lessons. */
export const lessonSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  title: localizedSchema,
  concepts: z.array(z.string()).default([]),
  /** The next board id publish will hand out. */
  nextBoardId: permanentIdSchema.optional(),
  /** Ids of deleted boards; never handed out again. */
  retiredBoardIds: z.array(permanentIdSchema).optional(),
  boards: z.array(boardSchema).min(1),
});
export type Lesson = z.infer<typeof lessonSchema>;

/** Throws unless every board and piece has a permanent id (i.e. the lesson went through publish). */
export function assertPublished(lesson: Lesson): void {
  for (const board of lesson.boards) {
    if (board.id === undefined)
      throw new Error(`Lesson ${lesson.id}: board "${board.name}" has no id; run publish-lesson`);
    for (const piece of walkPieces(board.root)) {
      if (piece.id === undefined) {
        throw new Error(
          `Lesson ${lesson.id}, board "${board.name}": piece "${piece.name}" has no id; run publish-lesson`,
        );
      }
    }
  }
}

export function parseLesson(input: unknown): Lesson {
  return lessonSchema.parse(input);
}
