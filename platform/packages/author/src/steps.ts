import type { Board, Localized } from "@chalk/content";

/**
 * How a board shows it works: a witness, the steps a learner takes to get it right, played on the
 * real props at publish (a question whose witness fails is not published).
 */
export const StepKind = { Act: "act" } as const;
export type StepKind = (typeof StepKind)[keyof typeof StepKind];

/** A pause on the board's clock. */
export type Wait = { wait: number };

/** What a learner does (`tap`), or a pause. */
export type Step =
  | {
      kind: typeof StepKind.Act;
      prop: string;
      action: string;
      args: Readonly<Record<string, unknown>>;
    }
  | Wait;

/** A wrong answer that should get a particular note: how to reach it, and what should show. */
export type NoteCheck = { steps: readonly Step[]; feedback: Localized };

/** What building a board gives: the board itself, and the witnesses that show it works. */
export type BuiltBoard = {
  board: Board;
  witness: readonly Step[];
  noteChecks: readonly NoteCheck[];
};
