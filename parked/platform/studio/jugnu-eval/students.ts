import { Locale } from "@chalk/content";
import { z } from "zod";

/**
 * A simulated student: a second model plays them on a real question board, with a belief they hold
 * until something convinces them, a way of behaving, and a language.
 */
export const studentSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** The lesson file, relative to the repo root. */
    lesson: z.string(),
    /** A board with a question. */
    board: z.string(),
    locale: z.nativeEnum(Locale),
    /** Who they are, in a sentence (class, how they feel about the subject). */
    who: z.string(),
    /** What they believe about this question at the start: the misconception. */
    belief: z.string(),
    /** How they behave: patience, how much they ask, how they write. */
    temperament: z.string(),
    /** For a Hindi student: how they write (Devanagari, Hinglish in Latin letters). */
    writes: z.string().optional(),
    /** What the right understanding is, for the judge (the student never sees it). */
    understanding: z.string(),
  })
  .strict();
export type Student = z.infer<typeof studentSchema>;

export const studentsSchema = z.object({ students: z.array(studentSchema).min(1) }).strict();
