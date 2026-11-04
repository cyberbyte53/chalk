import { z } from "zod";

/**
 * A point of a learner update (platform/docs/plans/teacher-view.md): what a finished set shows
 * about the child, judged by a model, in a teacher's words. Its kind is how much it needs the
 * teacher: a mistake they keep making (`needsYou`), one they are getting past (`gettingThere`), or
 * nothing to worry about (`onTrack`). Kept as JSON in `learner_updates.points`.
 */
export const PointKind = {
  NeedsYou: "needsYou",
  GettingThere: "gettingThere",
  OnTrack: "onTrack",
} as const;
export type PointKind = (typeof PointKind)[keyof typeof PointKind];

export const updatePointSchema = z.object({
  /** One short sentence about the idea ("Looks like they read the numbers the wrong way round"). */
  text: z.string(),
  kind: z.nativeEnum(PointKind),
  /** The mistake, as a few words a teacher would use, or null when it is no mistake. */
  mistake: z.string().nullable(),
  /** One next step for the teacher, or null. */
  next: z.string().nullable(),
  /** What it rests on: the questions (board ids) and Jugnu's reflections (ids) it cites. */
  questions: z.array(z.string()),
  reflections: z.array(z.string()),
});
export type UpdatePoint = z.infer<typeof updatePointSchema>;
