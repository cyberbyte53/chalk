import type { Step } from "@chalk/author";
import { Actor, type Board, LOCALES, type Locale, type Localized, PieceKind } from "@chalk/content";
import {
  BoardRuntime,
  type PropModule,
  type RuntimeServices,
  type RuntimeState,
} from "@chalk/player";
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
 * A board played the same way, with no waiting at all: after each
 * step, what it set off plays out on the board's clock (moves, waits, lines said), jumping.
 */
function playScene(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
  onHeard: ((line: string) => void) | undefined,
  locale: Locale,
  onCalled?: Called,
): Played {
  const errors: string[] = [];
  const services = {
    locale,
    now: () => 0,
    frame: () => () => undefined,
    speak: async () => false,
    onError: (message: string, error?: unknown) =>
      errors.push(
        error instanceof Error && !message.includes(error.message)
          ? `${message}: ${error.message}`
          : message,
      ),
  };
  const runtime = new BoardRuntime(board, (type) => defs[type], services);
  if (onCalled !== undefined)
    runtime.onAction((r) => {
      if (r.isLessons === true) onCalled(r.prop, r.action);
    });
  const failures: Failure[] = [];
  /** One step of the witness, played out on the board's clock. */
  const doStep = (on: BoardRuntime, step: Step) => {
    if ("wait" in step) on.settle(step.wait, true);
    else {
      void on.call(step.prop, step.action, step.args, Actor.Learner);
      on.settle();
    }
  };
  runtime.start();
  runtime.settle();
  // The board's state before each step: a copy made from one must go on exactly as the board did
  // (its state is all of it: platform/docs/plans/jugnu.md, "what it stands on").
  const states: RuntimeState[] = [runtime.state()];
  for (const step of steps) {
    doStep(runtime, step);
    states.push(runtime.state());
  }
  runtime.settle();
  const end = JSON.stringify(runtime.state());
  states.forEach((state, k) => {
    // Through JSON, as it is sent: what a phone sends Jugnu is what is restored.
    const sent = JSON.parse(JSON.stringify(state)) as RuntimeState;
    const copy = new BoardRuntime(board, (type) => defs[type], { ...services, from: sent });
    copy.start();
    const fail = (seen: string) =>
      failures.push({
        check: `restored from its state ${whenOf(k)}, the board goes on differently`,
        seen,
      });
    if (JSON.stringify(copy.state()) !== JSON.stringify(state))
      fail(`at once, ${firstDifference(state, copy.state())}`);
    else {
      let isSame = true;
      // Step by step beside the original: the first step after which they differ, and where.
      for (let j = k; j < steps.length && isSame; j++) {
        doStep(copy, steps[j] as Step);
        const was = states[j + 1] as RuntimeState;
        if (JSON.stringify(copy.state()) !== JSON.stringify(was)) {
          fail(`after step ${j + 1}, ${firstDifference(was, copy.state())}`);
          isSame = false;
        }
      }
      copy.settle();
      if (isSame && JSON.stringify(copy.state()) !== end)
        fail(`at its end, ${firstDifference(JSON.parse(end), copy.state())}`);
    }
    copy.dispose();
  });
  for (const heard of runtime.heard()) if ("line" in heard) onHeard?.(heard.line);
  failures.push(...errors.map((check) => ({ check })));
  const views = new Map<string, Readonly<Record<string, unknown>>>();
  for (const name of [...runtime.propNames(), BOARD]) views.set(name, runtime.getView(name));
  runtime.dispose();
  return { failures, view: (prop) => views.get(prop) ?? {} };
}

/** A moment of a witness, in words. */
const whenOf = (k: number): string => (k === 0 ? "at its start" : `after step ${k}`);

/** Where two states first differ ("core.nodes.town/walker.vars.at: …"), for a failure to name. */
function firstDifference(a: unknown, b: unknown, path = ""): string {
  if (JSON.stringify(a) === JSON.stringify(b)) return "";
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null)
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const inner = firstDifference(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        path === "" ? key : `${path}.${key}`,
      );
      if (inner !== "") return inner;
    }
  return `${path}: ${JSON.stringify(a)?.slice(0, 80)} → ${JSON.stringify(b)?.slice(0, 80)}`;
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
  /** Each action the lesson's own rules did on the way. */
  onCalled?: Called,
): Promise<Played> {
  if (locale === undefined) throw new Error(`Board ${board.name}: a board plays in a language`);
  return playScene(board, defs, steps, onHeard, locale, onCalled);
}

/** An action the lesson's own rules did: on which piece, and its name there ("plane.raiseUpLine"). */
export type Called = (piece: string, action: string) => void;

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
  check: (
    locale: Locale | undefined,
    onHeard: (line: string) => void,
    onCalled: Called,
  ) => Promise<Failure[]>,
  onHeard?: (line: string, locale: Locale) => void,
  onCalled?: Called,
): Promise<string[]> {
  const byRun: { locale: Locale | undefined; failures: Failure[] }[] = [];
  for (const locale of runsOf(board)) {
    const heard: string[] = [];
    const called: [string, string][] = [];
    const failures = await check(
      locale,
      (line) => void heard.push(line),
      (piece, action) => void called.push([piece, action]),
    );
    byRun.push({ locale, failures });
    if (failures.length === 0 && locale !== undefined) {
      for (const line of heard) onHeard?.(line, locale);
      for (const [piece, action] of called) onCalled?.(piece, action);
    }
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
  onCalled?: Called,
): Promise<string[]> {
  return inEveryLanguage(
    board,
    async (locale, heard, called) => {
      const played = await play(board, defs, steps, locale, heard, called);
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
    onCalled,
  );
}

/** Does this wrong answer get its note, in every language (and not Continue)? */
export function checkNote(
  board: Board,
  defs: Defs,
  steps: readonly Step[],
  feedback: Localized,
  onHeard?: (line: string, locale: Locale) => void,
  onCalled?: Called,
): Promise<string[]> {
  return inEveryLanguage(
    board,
    async (locale, heard, called) => {
      const played = await play(board, defs, steps, locale, heard, called);
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
    onCalled,
  );
}
