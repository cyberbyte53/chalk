import { type Step, StepKind } from "@chalk/author";
import { Actor, type Board, type Localized, PieceKind } from "@chalk/content";
import { BoardRuntime, type RuntimeServices } from "@chalk/player";
import { AnswerStatus, type AnyPropDef, BOARD, PropRole, compileExpression } from "@chalk/prop";

type Defs = Readonly<Record<string, AnyPropDef>>;

/** A board running on fake time: nothing moves unless `advance` moves it. */
function startOnFakeTime(board: Board, defs: Defs) {
  let now = 0;
  let pending: ((now: number) => void)[] = [];
  const errors: string[] = [];
  const services: RuntimeServices = {
    now: () => now,
    frame: (callback) => {
      pending.push(callback);
      return () => {
        pending = pending.filter((c) => c !== callback);
      };
    },
    speak: async () => {},
    onError: (message, error) =>
      errors.push(error instanceof Error ? `${message}: ${error.message}` : message),
  };
  const runtime = new BoardRuntime(board, (type) => defs[type], services);
  const refused: string[] = [];
  runtime.onAction((record) => {
    if (record.refused !== undefined && record.actor === Actor.Learner) {
      refused.push(`${record.prop}.${record.action} was refused: ${record.refused}`);
    }
  });
  const advance = async (seconds: number): Promise<void> => {
    for (let t = 0; t < seconds * 1000; t += 16) {
      now += 16;
      const due = pending;
      pending = [];
      for (const callback of due) callback(now);
      for (let i = 0; i < 5; i++) await Promise.resolve();
    }
  };
  return { runtime, advance, errors, refused };
}

/** The board's question props (choice, goal, …), in layout order: a board may ask any number. */
export function questionsOf(board: Board, defs: Defs): string[] {
  const out: string[] = [];
  const visit = (piece: Board["root"]): void => {
    if (piece.kind === PieceKind.Prop && defs[piece.prop]?.role === PropRole.Question)
      out.push(piece.name);
    if ("children" in piece) for (const child of piece.children) visit(child);
  };
  visit(board.root);
  return out;
}

export type Played = {
  failures: string[];
  view: (prop: string) => Readonly<Record<string, unknown>>;
};

/** Plays a learner's steps on the real props, as a student would, and reports what went wrong. */
export async function play(board: Board, defs: Defs, steps: readonly Step[]): Promise<Played> {
  const { runtime, advance, errors, refused } = startOnFakeTime(board, defs);
  const failures: string[] = [];
  runtime.start();
  await advance(1);
  for (const step of steps) {
    switch (step.kind) {
      case StepKind.Act:
        void runtime.call(step.prop, step.action, step.args, Actor.Learner);
        await advance(0.05);
        break;
      case StepKind.Wait:
        await advance(step.seconds);
        break;
      case StepKind.Expect: {
        const value = compileExpression(step.that.source).evaluate((name) => runtime.getView(name));
        if (value !== true)
          failures.push(`expected ${step.says} (${step.that.source} was ${String(value)})`);
        break;
      }
    }
  }
  await advance(6);
  failures.push(...refused, ...errors);
  const views = new Map<string, Readonly<Record<string, unknown>>>();
  for (const name of [...runtime.propNames(), BOARD]) views.set(name, runtime.getView(name));
  runtime.dispose();
  return { failures, view: (prop) => views.get(prop) ?? {} };
}

/** Does a learner doing the witness get Continue (and a right answer, on a question)? */
export async function checkWitness(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
): Promise<string[]> {
  const played = await play(board, defs, steps);
  const failures = [...played.failures];
  for (const question of questionsOf(board, defs)) {
    if (played.view(question).status !== AnswerStatus.Correct)
      failures.push(
        `the witness doesn't answer "${question}" correctly (status ${String(played.view(question).status)})`,
      );
  }
  if (played.view(BOARD).isPassed !== true)
    failures.push("a learner doing the witness never gets Continue");
  return failures;
}

/** Does this wrong answer get its note (and not Continue)? */
export async function checkNote(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
  feedback: Localized,
): Promise<string[]> {
  const played = await play(board, defs, steps);
  const failures = [...played.failures];
  const questions = questionsOf(board, defs);
  if (questions.length === 0) return [...failures, "a note check needs a question on the board"];
  // The note shows on whichever question the wrong answer was given to.
  const shown = questions.map((q) => played.view(q).feedback as Localized | null | undefined);
  if (!shown.some((note) => note?.en === feedback.en)) {
    const got = shown.flatMap((note) =>
      note === null || note === undefined ? [] : [`"${note.en}"`],
    );
    failures.push(
      `expected the note "${feedback.en}", got ${got.length === 0 ? "no note" : got.join(", ")}`,
    );
  }
  if (played.view(BOARD).isPassed === true) failures.push("a wrong answer got Continue");
  return failures;
}
