import { z } from "zod";
import { boardSchema } from "./board";
import { localizedSchema } from "./localized";

/** An ordered run of boards. Story, walkthrough, practice and quiz are all lessons. */
export const lessonSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  title: localizedSchema,
  concepts: z.array(z.string()).default([]),
  boards: z.array(boardSchema).min(1),
});
export type Lesson = z.infer<typeof lessonSchema>;

export function parseLesson(input: unknown): Lesson {
  return lessonSchema.parse(input);
}
