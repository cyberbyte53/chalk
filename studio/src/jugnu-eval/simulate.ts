import { Actor } from "@chalk/content";
import {
  type ChatRequest,
  JugnuSession,
  type JugnuStep,
  type JugnuTurn,
  type LlmProvider,
  type ToolSpec,
  boardJson,
  jsonSchemaOf,
  readable,
} from "@chalk/jugnu";
import type { BoardRuntime } from "@chalk/player";
import { PropRole, viewOf } from "@chalk/prop";
import type { z } from "zod";
import { type ConversationVerdict, judgeConversation } from "./judge";
import { openBoard, stepText } from "./run";
import type { Student } from "./students";

/** Something that happened in a conversation, in order. */
export type ConversationEvent =
  | { who: "student"; kind: "said"; text: string }
  | { who: "student"; kind: "did"; call: string; args: unknown; result: string }
  | { who: "student"; kind: "gaveUp" }
  | { who: "jugnu"; turn: JugnuTurn; seconds: number; isContinued: boolean };

export const Outcome = {
  /** The student pressed Check and was right. */
  Solved: "solved",
  GaveUp: "gaveUp",
  /** Used every round without getting there. */
  OutOfRounds: "outOfRounds",
  /** Did nothing twice in a row. */
  Stalled: "stalled",
  Error: "error",
} as const;
export type Outcome = (typeof Outcome)[keyof typeof Outcome];

export type ConversationMetrics = {
  isSolved: boolean;
  /** The round the student got it right in, if they did. */
  solvedInRound: number | undefined;
  checks: number;
  wrongChecks: number;
  jugnuTurns: number;
  /** Words per Jugnu turn, mean and most. */
  wordsPerTurn: { mean: number; max: number };
  /** Separate things he said per turn (more than one is chatter). */
  messagesPerTurn: number;
  tools: { act: number; point: number; calculate: number; wait: number };
  refusals: number;
  /** Times a move of his was put back because it answered the question. */
  undone: number;
  seconds: number;
};

export type Conversation = {
  student: Student;
  run: number;
  withJugnu: boolean;
  events: ConversationEvent[];
  rounds: number;
  outcome: Outcome;
  error: string | undefined;
  /** At the end the student explains the answer in their own words. */
  explanation: string;
  metrics: ConversationMetrics;
  verdict: ConversationVerdict | undefined;
};

const MAX_ROUNDS = 8;
const GIVE_UP = "give_up";
const SEPARATOR = "__";

const words = (text: string) => text.split(/\s+/).filter((w) => w.length > 0).length;

/** What the student sees: the shown props' state, without the fields that aren't on screen. */
export function studentView(runtime: BoardRuntime, locale: "en" | "hi"): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const name of runtime.propNames()) {
    if (runtime.isHidden(name)) continue;
    const def = runtime.getDef(name);
    const hidden = new Set(def.offScreen ?? []);
    const view = viewOf(def, runtime.getStored(name));
    props[name] = {
      type: def.type,
      state: readable(
        Object.fromEntries(Object.entries(view).filter(([field]) => !hidden.has(field))),
        locale,
      ),
    };
  }
  return props;
}

/** What the student's finger can do now: every action marked `byLearner` on a shown prop. */
export function studentTools(runtime: BoardRuntime): ToolSpec[] {
  const tools: ToolSpec[] = [];
  for (const name of runtime.propNames()) {
    if (runtime.isHidden(name)) continue;
    const def = runtime.getDef(name);
    for (const [action, spec] of Object.entries(def.actions)) {
      if (spec.byLearner !== true) continue;
      const parameters = jsonSchemaOf(spec.args as z.ZodTypeAny);
      tools.push({
        name: `${name}${SEPARATOR}${action}`,
        description: `${name} (${def.type}): ${spec.describe}${def.role === PropRole.Question && action === "check" ? ". This is the Check button: press it when you think you have the answer." : ""}`,
        parameters: parameters.type === "object" ? parameters : { type: "object", properties: {} },
      });
    }
  }
  tools.push({
    name: GIVE_UP,
    description: "Stop trying: you're fed up or completely stuck.",
    parameters: { type: "object", properties: {} },
  });
  return tools;
}

function persona(student: Student, withJugnu: boolean): string {
  const language =
    student.locale === "hi" ? (student.writes ?? "Hindi in Devanagari") : "simple English";
  return `You are playing a school student in India using a maths and science learning app on a phone. Stay in character the whole time.

Who you are: ${student.who}
What you believe right now: ${student.belief} You really believe this. Change your mind only when what you see on the board, or what you are shown, actually convinces you; then change it naturally, the way a real student would.
How you behave: ${student.temperament}
How you write: ${language}. Like a real student typing on a phone: short, casual, sometimes lowercase, the odd typo. Never more than two short sentences.

You don't know the answer and never look anything up. You can only see what's on your screen (below) and only do what your finger can do (the tools). The question on the board has a Check button (its check tool): press it when you think you have the answer.
${
  withJugnu
    ? "Jugnu is a tutor inside the app. To talk to him, write your message as your reply text; leave it empty when you just want to do things on the board. You see what he says, what he does on the board, and what he makes glow."
    : "There is no tutor in this app: nobody reads what you write, so just work on the board."
}

Each turn, do what a real student like you would do next: try something on the board, answer and press Check${withJugnu ? ", or ask Jugnu" : ""}. If you have tried many times and you're fed up, call give_up.`;
}

/** What the student remembers: what they and Jugnu said and did, as they saw it. */
function studentLog(events: readonly ConversationEvent[]): string {
  const lines: string[] = [];
  for (const event of events) {
    if (event.who === "student") {
      if (event.kind === "said") lines.push(`You said: ${event.text}`);
      if (event.kind === "did")
        lines.push(
          `You did: ${event.call} ${JSON.stringify(event.args)}${event.result ? ` → ${event.result}` : ""}`,
        );
      continue;
    }
    for (const e of event.turn.events) {
      if (e.kind === "say") lines.push(`Jugnu: ${e.text}`);
      if (e.kind === "act" && e.refused === undefined)
        lines.push(`Jugnu did on the board: ${e.prop}.${e.action} ${JSON.stringify(e.args)}`);
      if (e.kind === "point" && e.refused === undefined)
        lines.push(`Jugnu made ${e.part === undefined ? e.prop : `${e.prop} (${e.part})`} glow`);
      if (e.kind === "wait") lines.push("Jugnu is waiting for you to try.");
    }
  }
  return lines.length === 0 ? "Nothing yet: you just opened this board." : lines.join("\n");
}

/** The whole conversation, everything included, for the judge and the report. */
export function conversationText(events: readonly ConversationEvent[]): string {
  const lines: string[] = [];
  for (const event of events) {
    if (event.who === "student") {
      if (event.kind === "said") lines.push(`Student: ${event.text}`);
      if (event.kind === "did")
        lines.push(
          `Student did: ${event.call} ${JSON.stringify(event.args)}${event.result ? ` → ${event.result}` : ""}`,
        );
      if (event.kind === "gaveUp") lines.push("Student gave up.");
      continue;
    }
    if (event.isContinued) lines.push("(Jugnu saw the student's move and went on.)");
    for (const e of event.turn.events)
      lines.push(e.kind === "say" ? `Jugnu: ${e.text}` : `Jugnu ${stepText(e)}`);
  }
  return lines.join("\n");
}

function metricsOf(
  events: readonly ConversationEvent[],
  solvedInRound: number | undefined,
): ConversationMetrics {
  const turns = events.flatMap((e) => (e.who === "jugnu" ? [e.turn] : []));
  const steps = turns.flatMap((t) => t.events.filter((e): e is JugnuStep => e.kind !== "say"));
  const turnWords = turns.map((t) => words(t.reply));
  const checks = events.filter(
    (e) => e.who === "student" && e.kind === "did" && e.call.endsWith(".check"),
  );
  const count = (kind: JugnuStep["kind"]) => steps.filter((s) => s.kind === kind).length;
  return {
    isSolved: solvedInRound !== undefined,
    solvedInRound,
    checks: checks.length,
    wrongChecks: checks.filter(
      (e) => e.who === "student" && e.kind === "did" && e.result.startsWith("wrong"),
    ).length,
    jugnuTurns: turns.length,
    wordsPerTurn: {
      mean: turnWords.length === 0 ? 0 : turnWords.reduce((a, b) => a + b, 0) / turnWords.length,
      max: Math.max(0, ...turnWords),
    },
    messagesPerTurn:
      turns.length === 0
        ? 0
        : turns.reduce((n, t) => n + t.events.filter((e) => e.kind === "say").length, 0) /
          turns.length,
    tools: {
      act: steps.filter((s) => s.kind === "act" && s.refused === undefined).length,
      point: count("point"),
      calculate: count("calculate"),
      wait: count("wait"),
    },
    refusals: steps.filter((s) => "refused" in s && s.refused !== undefined).length,
    undone: steps.filter((s) => s.kind === "act" && s.isUndone === true).length,
    seconds: events.reduce((n, e) => n + (e.who === "jugnu" ? e.seconds : 0), 0),
  };
}

/**
 * One conversation: a simulated student works on a real question board, with Jugnu (or without, as
 * a baseline), for up to 8 rounds. Each round the student acts on the board and/or writes to Jugnu;
 * Jugnu answers, or goes on after a move he was watching for. At the end the student explains the
 * answer in their own words, and the judge grades the whole thing.
 */
export async function simulate(options: {
  root: string;
  student: Student;
  run: number;
  withJugnu: boolean;
  jugnu: LlmProvider;
  studentModel: LlmProvider;
  judgeModel: LlmProvider | undefined;
}): Promise<Conversation> {
  const { root, student, run, withJugnu, jugnu, studentModel, judgeModel } = options;
  const { runtime, place, settle, stop } = openBoard(
    root,
    student.lesson,
    student.board,
    student.locale,
  );
  const session = withJugnu ? new JugnuSession(runtime, jugnu, place) : undefined;
  const question = runtime.propNames().find((n) => runtime.getDef(n).role === PropRole.Question);
  if (question === undefined)
    throw new Error(`${student.id}: board "${student.board}" has no question`);
  runtime.start();
  await settle();
  const boardAtStart = JSON.stringify(boardJson(runtime, place, []), null, 1);
  const system = persona(student, withJugnu);
  const events: ConversationEvent[] = [];
  let outcome: Outcome = Outcome.OutOfRounds;
  let solvedInRound: number | undefined;
  let error: string | undefined;
  let rounds = 0;
  let idle = 0;
  let movedWatched = false;
  const stopHearing = session?.onStudentMove(() => {
    movedWatched = true;
  });
  const isSolved = () => runtime.getStored(question).status === "correct";

  try {
    for (let round = 1; round <= MAX_ROUNDS; round++) {
      rounds = round;
      const request: ChatRequest = {
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Your screen now:\n${JSON.stringify(studentView(runtime, student.locale), null, 1)}\n\nSo far:\n${studentLog(events)}\n\nWhat do you do now? (turn ${round} of at most ${MAX_ROUNDS})`,
          },
        ],
        tools: studentTools(runtime),
      };
      const reply = await studentModel.chat(request);
      const said = reply.content.trim();
      movedWatched = false;
      let gaveUp = false;
      for (const call of reply.toolCalls) {
        if (call.name === GIVE_UP) {
          gaveUp = true;
          break;
        }
        const at = call.name.indexOf(SEPARATOR);
        const prop = call.name.slice(0, at);
        const action = call.name.slice(at + SEPARATOR.length);
        let refused: string | undefined;
        const stopListening = runtime.onAction((heard) => {
          if (heard.actor === Actor.Learner && heard.refused !== undefined) refused = heard.refused;
        });
        await runtime.call(prop, action, call.args ?? {}, Actor.Learner);
        stopListening();
        await settle();
        let result = refused === undefined ? "" : `didn't work: ${refused}`;
        if (prop === question && action === "check" && refused === undefined) {
          const stored = runtime.getStored(question);
          const feedback = stored.feedback as Record<string, string> | null;
          result = `${String(stored.status)}${feedback ? `: "${feedback[student.locale] ?? feedback.en}"` : ""}`;
        }
        events.push({
          who: "student",
          kind: "did",
          call: `${prop}.${action}`,
          args: call.args ?? {},
          result,
        });
        if (isSolved()) break;
      }
      if (said !== "") events.push({ who: "student", kind: "said", text: said });
      if (isSolved()) {
        outcome = Outcome.Solved;
        solvedInRound = round;
        break;
      }
      if (gaveUp) {
        events.push({ who: "student", kind: "gaveUp" });
        outcome = Outcome.GaveUp;
        break;
      }
      idle = said === "" && reply.toolCalls.length === 0 ? idle + 1 : 0;
      if (idle >= 2) {
        outcome = Outcome.Stalled;
        break;
      }
      if (session === undefined) continue;
      const started = Date.now();
      let turn: JugnuTurn | undefined;
      let isContinued = false;
      if (said !== "") turn = await session.ask(said);
      else if (movedWatched && session.watchedProps.length > 0) {
        isContinued = true;
        turn = await session.continue();
      }
      if (turn !== undefined) {
        events.push({ who: "jugnu", turn, seconds: (Date.now() - started) / 1000, isContinued });
        await settle();
      }
    }
  } catch (e) {
    outcome = Outcome.Error;
    error = e instanceof Error ? e.message : String(e);
  }
  stopHearing?.();
  session?.close();

  let explanation = "";
  if (outcome !== Outcome.Error) {
    explanation = (
      await studentModel
        .chat({
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `So far:\n${studentLog(events)}\n\nThat's the end of this board. Your teacher asks you: what is the answer to the question on the board, and why? Answer honestly, as you understand it now, in your own words, in one or two sentences.`,
            },
          ],
          tools: [],
        })
        .catch(() => ({ content: "" }))
    ).content.trim();
  }
  runtime.dispose();
  stop();
  const metrics = metricsOf(events, solvedInRound);
  const verdict =
    judgeModel === undefined || outcome === Outcome.Error
      ? undefined
      : await judgeConversation(judgeModel, {
          student,
          withJugnu,
          board: boardAtStart,
          conversation: conversationText(events),
          outcome,
          explanation,
        }).catch(() => undefined);
  return { student, run, withJugnu, events, rounds, outcome, error, explanation, metrics, verdict };
}
