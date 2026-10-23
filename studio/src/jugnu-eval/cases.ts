import { Locale } from "@chalk/content";
import { z } from "zod";

const stepSchema = z
  .object({ call: z.string(), args: z.record(z.string(), z.unknown()).optional() })
  .strict();

/**
 * One thing that happens in a case, in order: the student asks something, or acts on the board
 * (as their own actions). If Jugnu handed the board back and the student acts on a prop he watches,
 * he goes on from it, as in the app.
 */
const turnSchema = z.union([
  z.object({ ask: z.string().min(1) }).strict(),
  z.object({ student: z.array(stepSchema).min(1) }).strict(),
]);
export type EvalTurn = z.infer<typeof turnSchema>;

/** A real board in a given state, what the student does and asks, and what good help does. */
export const evalCaseSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** The lesson file, relative to the repo root (a published lesson, or a test board). */
    lesson: z.string(),
    /** Board name in that lesson. */
    board: z.string(),
    locale: z.nativeEnum(Locale),
    /** What the student did before first asking, as their own actions. */
    setup: z.array(stepSchema).optional(),
    /** The conversation: at least one ask. */
    turns: z.array(turnSchema).min(1),
    expect: z
      .object({
        /** Patterns no reply may contain (giving the answer away). Case-insensitive. */
        notSay: z.array(z.string()).optional(),
        /** At least one of these should appear in some reply (a fact it should get right). */
        say: z.array(z.string()).optional(),
        /** Whether he should act on the board (true), must not (false), or either (absent). */
        act: z.boolean().optional(),
        /** Actions he must not take here, as "prop.action" (one that would show the answer). */
        notDo: z.array(z.string()).optional(),
        /** He should use the calculate tool (a number has to be worked out). */
        calculates: z.boolean().optional(),
        /**
         * He should point at one of these: "prop" (anywhere on it) or "prop.part". Empty list: he
         * shouldn't point at all.
         */
        points: z.array(z.string()).optional(),
        /**
         * Conditions on the board when the case ends, in the lesson's expression language
         * (`line.marker * line.marker > 2.02`, `circuit.brightness.bulbB > 0`): where his showing
         * should, or must not, have left it.
         */
        boardAfter: z.array(z.string()).optional(),
        /**
         * He should look ahead with `try` on at least one of these, as "prop.action" or "prop":
         * what a good tutor checks before deciding what to show or say.
         */
        tries: z.array(z.string()).optional(),
        /** His reply should show (do on the board) at least one of these, as "prop.action" or "prop". */
        shows: z.array(z.string()).optional(),
        /** Everything he shows, he tried first in the same turn (he checked it before showing). */
        triesFirst: z.boolean().optional(),
        /** How his last turn should end: a question with options (ask), or quiet (nothing). */
        ends: z.enum(["ask", "nothing"]).optional(),
        /** Longest acceptable reply, in words. Default 30. */
        maxWords: z.number().int().positive().optional(),
      })
      .strict(),
    /** What good help does, in words: for the judge and for people reading the report. */
    good: z.string(),
  })
  .strict();
export type EvalCase = z.infer<typeof evalCaseSchema>;

export const evalCasesSchema = z.object({ cases: z.array(evalCaseSchema).min(1) }).strict();
