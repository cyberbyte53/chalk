import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Actor, type Locale, lessonSchema, splitTarget } from "@chalk/content";
import {
  type JugnuPlace,
  JugnuSession,
  type JugnuTurn,
  type LlmProvider,
  boardJson,
} from "@chalk/jugnu";
import { propDefs } from "@chalk/library";
import { BoardRuntime, type RuntimeServices } from "@chalk/player";
import { BOARD, PropRole, compileExpression } from "@chalk/prop";
import type { EvalCase } from "./cases";
import { type CheckResult, runChecks } from "./checks";
import { type Verdict, judge } from "./judge";

/** One turn of a case as it happened. */
export type TurnRecord =
  | {
      kind: "ask";
      text: string;
      turn: JugnuTurn;
      seconds: number;
      /**
       * What he did that was the student's part: goal questions open before his turn and met after
       * it, and actions the board leaves to the student that he showed.
       */
      overreach: string[];
    }
  | { kind: "student"; did: string[] };

export type CaseResult = {
  testCase: EvalCase;
  turns: TurnRecord[];
  /** A model call failed (server down, timeout); the case stopped there. */
  error: string | undefined;
  /** Seconds spent waiting on Jugnu, all turns together. */
  seconds: number;
  /** How the board ended: the question's status and whether the board passed. */
  end: {
    questionStatus: string | undefined;
    isPassed: boolean;
    /** Each `boardAfter` condition of the case, and whether it held at the end. */
    conditions: { expression: string; holds: boolean | string }[];
  };
  checks: CheckResult[];
  verdict: Verdict | undefined;
};

/** Board time runs fast: every frame is 50 ms, so a 2 s zoom finishes at once. */
export function fastServices(errors: string[]): {
  services: RuntimeServices;
  settle: () => Promise<void>;
  stop: () => void;
} {
  let now = 0;
  let pending: ((now: number) => void)[] = [];
  const services: RuntimeServices = {
    now: () => now,
    frame: (callback) => {
      pending.push(callback);
      return () => {
        pending = pending.filter((c) => c !== callback);
      };
    },
    speak: async () => {},
    onError: (message) => errors.push(message),
  };
  const tick = async () => {
    now += 50;
    const due = pending;
    pending = [];
    for (const callback of due) callback(now);
    await new Promise((resolve) => setImmediate(resolve));
  };
  // Scripts, timers and tweens run to the end before the next thing happens.
  const settle = async () => {
    for (let i = 0; i < 600; i++) await tick();
  };
  // Keep time moving while Jugnu acts, so his timed actions finish.
  const timer = setInterval(() => void tick(), 5);
  return { services, settle, stop: () => clearInterval(timer) };
}

/** A real board, live, on fast time: the board, where it sits in its lesson, and time controls. */
export function openBoard(root: string, lessonPath: string, boardName: string, locale: Locale) {
  const lesson = lessonSchema.parse(JSON.parse(readFileSync(join(root, lessonPath), "utf8")));
  const index = lesson.boards.findIndex((b) => b.name === boardName);
  const board = lesson.boards[index];
  if (board === undefined) throw new Error(`${lessonPath}: no board "${boardName}"`);
  const errors: string[] = [];
  const { services, settle, stop } = fastServices(errors);
  const runtime = new BoardRuntime(board, (type) => propDefs[type], services);
  const place: JugnuPlace = {
    lessonTitle: lesson.title[locale],
    boardNumber: index + 1,
    boardCount: lesson.boards.length,
    locale,
  };
  return { runtime, place, settle, stop, errors };
}

const describeStep = (step: { call: string; args?: Record<string, unknown> | undefined }) =>
  `${step.call}${step.args === undefined ? "" : ` ${JSON.stringify(step.args)}`}`;

/** Goal questions not yet met or answered: the ones he must not put into their answer. */
function openGoals(runtime: BoardRuntime): string[] {
  return runtime.propNames().filter((name) => {
    if (runtime.getDef(name).role !== PropRole.Question) return false;
    const view = runtime.getView(name);
    return view.isMet === false && view.status !== "correct";
  });
}

/** Plays one case on its real board: set it up, play the turns, check, and have the judge grade. */
export async function runCase(
  testCase: EvalCase,
  root: string,
  model: LlmProvider,
  judgeModel: LlmProvider | undefined,
): Promise<CaseResult> {
  const { runtime, place, settle, stop } = openBoard(
    root,
    testCase.lesson,
    testCase.board,
    testCase.locale,
  );
  const session = new JugnuSession(runtime, model, place);
  const act = async (steps: EvalCase["setup"]) => {
    for (const step of steps ?? []) {
      const { prop, member } = splitTarget(step.call);
      await runtime.call(prop, member, step.args ?? {}, Actor.Learner);
      await settle();
    }
  };
  runtime.start();
  await settle();
  await act(testCase.setup);
  const boardAtStart = JSON.stringify(boardJson(runtime, place), null, 1);

  const turns: TurnRecord[] = [];
  let error: string | undefined;
  let seconds = 0;
  const timed = async (run: () => Promise<JugnuTurn>) => {
    const started = Date.now();
    const turn = await run();
    const took = (Date.now() - started) / 1000;
    seconds += took;
    await settle();
    return { turn, seconds: took };
  };
  try {
    for (const step of testCase.turns) {
      if ("ask" in step) {
        const before = openGoals(runtime);
        const played = await timed(() => session.ask(step.ask));
        const solved = before.filter((name) => runtime.getView(name).isMet === true);
        const leftToStudent = played.turn.cues.flatMap((cue) =>
          cue.kind === "act" && runtime.board.studentOnly.includes(`${cue.prop}.${cue.action}`)
            ? [`${cue.prop}.${cue.action}`]
            : [],
        );
        turns.push({
          kind: "ask",
          text: step.ask,
          ...played,
          overreach: [...solved.map((name) => `${name} met`), ...leftToStudent],
        });
        continue;
      }
      await act(step.student);
      turns.push({ kind: "student", did: step.student.map(describeStep) });
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  const question = runtime
    .propNames()
    .find((name) => runtime.getDef(name).role === PropRole.Question);
  const end = {
    questionStatus: question === undefined ? undefined : String(runtime.getStored(question).status),
    isPassed: runtime.getView(BOARD).isPassed === true,
    conditions: (testCase.expect.boardAfter ?? []).map((expression) => {
      try {
        const value = compileExpression(expression).evaluate((name) => runtime.getView(name));
        return { expression, holds: value === true };
      } catch (e) {
        return { expression, holds: e instanceof Error ? e.message : String(e) };
      }
    }),
  };
  session.close();
  runtime.dispose();
  stop();
  const checks = error === undefined ? runChecks(testCase, turns, end.conditions) : [];
  let verdict: Verdict | undefined;
  if (judgeModel !== undefined && error === undefined) {
    verdict = await judge(judgeModel, testCase, boardAtStart, transcript(turns)).catch(
      () => undefined,
    );
  }
  return { testCase, turns, error, seconds, end, checks, verdict };
}

/** The conversation as plain lines, for the judge. */
export function transcript(turns: readonly TurnRecord[]): string {
  const lines: string[] = [];
  for (const record of turns) {
    if (record.kind === "ask") lines.push(`Student: ${record.text}`);
    if (record.kind === "student") lines.push(`Student did on the board: ${record.did.join("; ")}`);
    if (record.kind === "student") continue;
    for (const event of record.turn.events) {
      if (event.kind === "say") lines.push(`Jugnu: ${event.text}`);
      // His tries and sums happen out of sight: the student never sees them.
      else if (event.kind === "try" || event.kind === "calculate" || event.kind === "reply")
        lines.push(`(Jugnu, thinking, not seen by the student: ${stepText(event)})`);
      else lines.push(`Jugnu ${stepText(event)}`);
    }
  }
  return lines.join("\n");
}

/** One of Jugnu's steps in a line. */
export function stepText(event: Exclude<JugnuTurn["events"][number], { kind: "say" }>): string {
  const refused =
    "refused" in event && event.refused !== undefined ? ` — refused: ${event.refused}` : "";
  switch (event.kind) {
    case "act":
      return `did ${event.prop}.${event.action} ${JSON.stringify(event.args)}${event.changed !== undefined && refused === "" ? ` → changed ${JSON.stringify(event.changed)}` : ""}${refused}`;
    case "point":
      return `pointed at ${event.prop}${event.part === undefined ? "" : `.${event.part}`}${refused}`;
    case "calculate":
      return `calculated ${event.expression}${event.result === undefined ? "" : ` = ${event.result}`}${refused}`;
    case "try":
      return `tried ${event.calls.map((c) => `${c.call} ${JSON.stringify(c.args)}`).join("; ")} (unseen)${event.changed !== undefined ? ` → would change ${JSON.stringify(event.changed)}` : ""}${refused}`;
    case "reply":
      return `wrote a reply that was sent back: ${event.refused}`;
    case "ask":
      return `asked "${event.question}" with options ${event.options.map((o) => `"${o}"`).join(", ")}${refused}`;
    case "lesson":
      return `looked up the lesson for ${event.concept}${refused}`;
    case "unknown":
      return `called ${event.name}${refused}`;
  }
}
