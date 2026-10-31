import type { Step } from "@chalk/author";
import { Actor, type Board, LOCALES, type Locale, type Localized, PieceKind } from "@chalk/content";
import { type PropModule, type RuntimeServices, SceneRuntime } from "@chalk/player";
import { AnswerStatus, BOARD, PropRole } from "@chalk/prop";

type Defs = Readonly<Record<string, PropModule>>;

/** The board's question props (choice, goal, …), in layout order: a board may ask any number. */
export function questionsOf(board: Board, defs: Defs): string[] {
  const out: string[] = [];
  const visit = (piece: Board["root"]): void => {
    if (piece.kind === PieceKind.Prop && defs[piece.prop]?.def.role === PropRole.Question)
      out.push(piece.name);
    if ("children" in piece) for (const child of piece.children) visit(child);
  };
  visit(board.root);
  return out;
}

/**
 * Something that went wrong on a run: which check (the same words in every language: what was
 * expected, which question), and what was seen (which may differ by language).
 */
export type Failure = { check: string; seen?: string };

const failureText = (f: Failure): string =>
  f.seen === undefined ? f.check : `${f.check} (${f.seen})`;

export type Played = {
  failures: Failure[];
  view: (prop: string) => Readonly<Record<string, unknown>>;
};

/**
 * A scene (a board on the event model) played the same way, with no waiting at all: after each
 * step, what it set off plays out on the board's clock (moves, waits, lines said), jumping.
 */
function playScene(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
  onHeard: ((line: string) => void) | undefined,
  locale: Locale,
): Played {
  const errors: string[] = [];
  const runtime = new SceneRuntime(board, (type) => defs[type], {
    locale,
    now: () => 0,
    frame: () => () => undefined,
    speak: async () => {},
    onError: (message, error) =>
      errors.push(
        error instanceof Error && !message.includes(error.message)
          ? `${message}: ${error.message}`
          : message,
      ),
  });
  const failures: Failure[] = [];
  runtime.start();
  runtime.settle();
  for (const step of steps) {
    if ("wait" in step) {
      runtime.settle(step.wait, true);
      continue;
    }
    void runtime.call(step.prop, step.action, step.args, Actor.Learner);
    runtime.settle();
  }
  runtime.settle();
  for (const heard of runtime.heard()) if ("line" in heard) onHeard?.(heard.line);
  failures.push(...errors.map((check) => ({ check })));
  const views = new Map<string, Readonly<Record<string, unknown>>>();
  for (const name of [...runtime.propNames(), BOARD]) views.set(name, runtime.getView(name));
  runtime.dispose();
  return { failures, view: (prop) => views.get(prop) ?? {} };
}

/**
 * Plays a learner's steps on the real props, as a student would, and reports what went wrong. A
 * scene is played in one language (`locale`): its lines take different times in each.
 */
export async function play(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
  locale?: Locale,
  /** Each line heard on the way (a scene's). */
  onHeard?: (line: string) => void,
): Promise<Played> {
  if (locale === undefined) throw new Error(`Board ${board.name}: a board plays in a language`);
  return playScene(board, defs, steps, onHeard, locale);
}

/** The languages a board is checked in: each (its lines take different times in each). */
const runsOf = (_board: Board): readonly (Locale | undefined)[] => LOCALES;

/**
 * One check, run in each language its board is checked in. Failures are matched by their check, not
 * their words: a check failing in every language is said once (with what each saw, when that
 * differs); one failing in some only says which ("in hi: …"). What each passing run was heard to
 * say is handed on, by language.
 */
async function inEveryLanguage(
  board: Board,
  check: (locale: Locale | undefined, onHeard: (line: string) => void) => Promise<Failure[]>,
  onHeard?: (line: string, locale: Locale) => void,
): Promise<string[]> {
  const byRun: { locale: Locale | undefined; failures: Failure[] }[] = [];
  for (const locale of runsOf(board)) {
    const heard: string[] = [];
    const failures = await check(locale, (line) => void heard.push(line));
    byRun.push({ locale, failures });
    if (failures.length === 0 && locale !== undefined)
      for (const line of heard) onHeard?.(line, locale);
  }
  const checks = [...new Set(byRun.flatMap((r) => r.failures.map((f) => f.check)))];
  return checks.map((check) => {
    const inRuns = byRun.flatMap((r) => {
      const f = r.failures.find((x) => x.check === check);
      return f === undefined ? [] : [{ locale: r.locale, seen: f.seen }];
    });
    const seens = new Set(inRuns.map((r) => r.seen));
    const seen =
      seens.size <= 1
        ? inRuns[0]?.seen
        : inRuns.map((r) => `${r.locale}: ${r.seen ?? "—"}`).join("; ");
    const text = failureText({ check, ...(seen === undefined ? {} : { seen }) });
    return inRuns.length === byRun.length
      ? text
      : `in ${inRuns.map((r) => r.locale).join(", ")}: ${text}`;
  });
}

/** Whether two notes are the same in every language. */
const isSameNote = (a: Localized | null | undefined, b: Localized): boolean =>
  a !== null &&
  a !== undefined &&
  Object.keys(b).every((l) => a[l as keyof Localized] === b[l as keyof Localized]);

/** A note in words, every language. */
const noteWords = (note: Localized): string =>
  Object.entries(note)
    .map(([l, words]) => `${l} "${words}"`)
    .join(", ");

/** Does a learner doing the witness get Continue (and a right answer, on a question)? */
export function checkWitness(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
  onHeard?: (line: string, locale: Locale) => void,
): Promise<string[]> {
  return inEveryLanguage(
    board,
    async (locale, heard) => {
      const played = await play(board, defs, steps, locale, heard);
      const failures = [...played.failures];
      for (const question of questionsOf(board, defs))
        if (played.view(question).status !== AnswerStatus.Correct)
          failures.push({
            check: `the witness doesn't answer "${question}" correctly`,
            seen: `status ${String(played.view(question).status)}`,
          });
      if (played.view(BOARD).isPassed !== true)
        failures.push({ check: "a learner doing the witness never gets Continue" });
      return failures;
    },
    onHeard,
  );
}

/** Does this wrong answer get its note, in every language (and not Continue)? */
export function checkNote(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
  feedback: Localized,
  onHeard?: (line: string, locale: Locale) => void,
): Promise<string[]> {
  return inEveryLanguage(
    board,
    async (locale, heard) => {
      const played = await play(board, defs, steps, locale, heard);
      const failures = [...played.failures];
      const questions = questionsOf(board, defs);
      if (questions.length === 0)
        return [...failures, { check: "a note check needs a question on the board" }];
      // The note shows on whichever question the wrong answer was given to, the same in every
      // language.
      const shown = questions.map((q) => played.view(q).feedback as Localized | null | undefined);
      if (!shown.some((note) => isSameNote(note, feedback))) {
        const got = shown.flatMap((note) =>
          note === null || note === undefined ? [] : [noteWords(note)],
        );
        failures.push({
          check: `expected the note ${noteWords(feedback)}`,
          seen: `got ${got.length === 0 ? "no note" : got.join("; ")}`,
        });
      }
      if (played.view(BOARD).isPassed === true)
        failures.push({ check: "a wrong answer got Continue" });
      return failures;
    },
    onHeard,
  );
}
