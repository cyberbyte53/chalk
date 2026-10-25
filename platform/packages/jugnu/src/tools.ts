import { Actor, type Cue, CueKind, MAX_OPTIONS, OPTION_MAX, splitTarget } from "@chalk/content";
import { PropRole, SAY, compileExpression, observationOfView } from "@chalk/prop";
import type { z } from "zod";
import type { HeardAction, HeardSignal, JugnuBoard, JugnuPlace } from "./board";
import type { LessonLibrary } from "./lessons";
import type { ToolSpec } from "./provider";
import { fromStrict, jsonSchemaOf, schemaSize, strictSchemaOf } from "./schema";

/**
 * Jugnu's tools. Two to think with, out of sight (`try`, `calculate`); one to answer (`reply`): his
 * words, what he shows and points at, and then a question with options, or nothing (quiet).
 * Only a reply reaches the student.
 */
export const JugnuTool = {
  Try: "try",
  Calculate: "calculate",
  Reply: "reply",
  Lesson: "lesson",
} as const;

/** One action, as a script writes it: `{ call: "line.magnify", args: { value: 1.41 } }`. */
export type Call = { call: string; args: Record<string, unknown> };

/** One thing in his reply, as he wrote it. */
type ReplyStep =
  | { say: string }
  | { show: Call }
  | { point: { prop: string; part: string | null | undefined } };

/** What one tool call did, or what his reply showed: for the logs, flags and the test bench. */
export type JugnuStep =
  | {
      kind: "try";
      calls: Call[];
      changed?: Record<string, Record<string, unknown>>;
      /** Signals the board raised, as "prop.signal". */
      signals?: string[];
      refused?: string;
    }
  | { kind: "calculate"; expression: string; result?: number | string | boolean; refused?: string }
  /** Something his reply showed on the board (or tried to: `refused`, and then the reply wasn't sent). */
  | {
      kind: "act";
      prop: string;
      action: string;
      args: unknown;
      refused?: string;
      changed?: Record<string, Record<string, unknown>>;
    }
  | { kind: "point"; prop: string; part?: string; refused?: string }
  | { kind: "ask"; question: string; options: string[]; refused?: string }
  /** A reply he had to write again, and why. */
  | { kind: "reply"; refused: string }
  /** He read how a concept was taught. */
  | { kind: "lesson"; concept: string }
  | { kind: "unknown"; name: string; refused: string };

/** Something Jugnu said or did during a turn, in order. */
export type JugnuEvent = { kind: "say"; text: string } | JugnuStep;

/** One action Jugnu could use on this board. */
type ActionInfo = { call: string; prop: string; action: string; args: z.ZodTypeAny };

/** Actions Jugnu can never use on this board, whatever happens. */
function isNeverHis(board: JugnuBoard, prop: string, action: string): boolean {
  return (
    board.getDef(prop).role === PropRole.Question ||
    action === SAY ||
    board.getDef(prop).actions[action]?.internal === true
  );
}

function actionsOf(board: JugnuBoard): ActionInfo[] {
  return board.propNames().flatMap((prop) =>
    Object.entries(board.getDef(prop).actions)
      .filter(([action]) => !isNeverHis(board, prop, action))
      .map(([action, spec]) => ({
        call: `${prop}.${action}`,
        prop,
        action,
        args: spec.args as z.ZodTypeAny,
      })),
  );
}

/** Foundry's limits on one strict schema. */
const STRICT_MAX_PROPERTIES = 100;
const STRICT_MAX_DEPTH = 5;

const object = (
  properties: Record<string, unknown>,
  isStrict: boolean,
  optional: string[] = [],
) => ({
  type: "object",
  properties,
  required: isStrict
    ? Object.keys(properties)
    : Object.keys(properties).filter((k) => !optional.includes(k)),
  additionalProperties: false,
});

/** Jugnu's tools on one board, and how to read what the model writes into them. */
export type JugnuTools = {
  /** The same for the whole board, so the model can cache them. */
  specs: ToolSpec[];
  /** Whether they are strict (the model can't write arguments of the wrong shape). */
  isStrict: boolean;
  /** Whether a reply may end with options to tap. */
  canAsk: boolean;
  actions: ReadonlyMap<string, ActionInfo>;
};

/**
 * His tools on this board. Every action he could ever use is a typed choice inside `try` and
 * `reply.show`, its arguments the action's own schema; strict where the board allows it (every
 * action's schema has a strict form and the whole stays within the model server's limits).
 * Whether an action is allowed right now (a hidden prop, an answer that would show) is checked
 * when it runs.
 */
export function jugnuTools(
  board: JugnuBoard,
  lessonIds: readonly string[] = [],
  /** Whether his reply may end with options to tap. Off for now: the student types. */
  canAsk = false,
): JugnuTools {
  const actions = actionsOf(board);
  const strictArgs = actions.map((a) => strictSchemaOf(a.args));
  const canBeStrict = strictArgs.every((schema) => schema !== undefined);
  const build = (isStrict: boolean): ToolSpec[] => {
    const callSchema = {
      anyOf: actions.map((a, i) =>
        object(
          {
            call: { type: "string", enum: [a.call] },
            args: isStrict ? strictArgs[i] : objectOrEmpty(jsonSchemaOf(a.args)),
          },
          isStrict,
        ),
      ),
    };
    const names = board.propNames();
    const nullable = (schema: Record<string, unknown>) =>
      isStrict ? { anyOf: [schema, { type: "null" }] } : schema;
    const steps = {
      type: "array",
      items: {
        anyOf: [
          object({ say: { type: "string", description: "Words to the student" } }, isStrict),
          ...(actions.length > 0 ? [object({ show: callSchema }, isStrict)] : []),
          object(
            {
              point: object(
                {
                  prop: { type: "string", enum: names },
                  part: nullable({ type: "string", description: "One of the prop's parts" }),
                },
                isStrict,
                ["part"],
              ),
            },
            isStrict,
          ),
        ],
      },
    };
    const end = {
      anyOf: [
        object(
          {
            ask: object(
              {
                question: { type: "string" },
                options: {
                  type: "array",
                  items: { type: "string" },
                  description: `2 to ${MAX_OPTIONS} short options to tap, each under ${OPTION_MAX} characters`,
                },
              },
              isStrict,
            ),
          },
          isStrict,
        ),
        { type: "null" },
      ],
      description:
        "How your turn ends: null, usually (you showed or pointed or said what to look at; now be quiet, the board is theirs); ask (one question with options to tap)",
    };
    const specs: ToolSpec[] = [];
    if (actions.length > 0)
      specs.push({
        name: JugnuTool.Try,
        description:
          "Out of sight: run these actions, in order, on a scratch copy of the board and see what the student would see change (and any signals). The board is left as it was; the student sees nothing.",
        parameters: object({ calls: { type: "array", items: callSchema } }, isStrict),
        ...(isStrict ? { strict: true } : {}),
      });
    specs.push(
      {
        name: JugnuTool.Calculate,
        description:
          "Out of sight: work out an exact number. Operators + - * / ^ and brackets; functions sqrt, abs, round, floor, ceil, min, max; comparisons < <= > >= == !=. Board values by name, e.g. line.marker * line.marker. Use it for every number you didn't read off the board.",
        parameters: object({ expression: { type: "string" } }, isStrict),
        ...(isStrict ? { strict: true } : {}),
      },
      ...(lessonIds.length > 0
        ? [
            {
              name: JugnuTool.Lesson,
              description:
                "Out of sight: read how a concept was taught to the student, page by page (its lesson). For a concept this board builds on, when the student is stuck on it.",
              parameters: object({ concept: { type: "string", enum: [...lessonIds] } }, isStrict),
              ...(isStrict ? { strict: true } : {}),
            },
          ]
        : []),
      {
        name: JugnuTool.Reply,
        description: `Your answer to the student, the only thing they see, played in order: say (words), show (do an action on their board, for them to watch), point (make a prop or a part glow gently).${canAsk ? " Then end: how your turn ends." : " They answer by typing."} Call it once, last. If something in it isn't allowed, you'll be told and can reply again.`,
        parameters: canAsk ? object({ steps, end }, isStrict) : object({ steps }, isStrict),
        ...(isStrict ? { strict: true } : {}),
      },
    );
    return specs;
  };
  let isStrict = canBeStrict;
  let specs = build(isStrict);
  if (
    isStrict &&
    specs.some((spec) => {
      const size = schemaSize(spec.parameters);
      return size.properties > STRICT_MAX_PROPERTIES || size.depth > STRICT_MAX_DEPTH;
    })
  ) {
    isStrict = false;
    specs = build(false);
  }
  return { specs, isStrict, canAsk, actions: new Map(actions.map((a) => [a.call, a])) };
}

const objectOrEmpty = (schema: Record<string, unknown>) =>
  schema.type === "object" ? schema : { type: "object", properties: {} };

/** The tool specs alone (for tests and the bench). */
export const toolsFor = (board: JugnuBoard): ToolSpec[] => jugnuTools(board).specs;

/** Every prop's elements right now, as the student sees them: id → value. */
const seenOf = (board: JugnuBoard, names: readonly string[]) =>
  new Map(
    names.map((name) => {
      const seen = observationOfView(board.getDef(name), board.getView(name));
      return [
        name,
        new Map(
          seen.elements.map((e) => [e.id, e.words ?? (e.value === undefined ? true : e.value)]),
        ),
      ];
    }),
  );

/**
 * What the student would see change between two moments, prop by prop: elements whose value
 * differs, ones that appeared, and ones that went ("gone").
 */
function changes(
  before: Map<string, Map<string, unknown>>,
  after: Map<string, Map<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [name, now] of after) {
    const old = before.get(name) ?? new Map<string, unknown>();
    for (const [id, value] of now) {
      if (old.has(id) && JSON.stringify(old.get(id)) === JSON.stringify(value)) continue;
      out[name] ??= {};
      (out[name] as Record<string, unknown>)[id] =
        typeof value === "number" ? Number(value.toPrecision(10)) : value;
    }
    for (const id of old.keys()) {
      if (now.has(id)) continue;
      out[name] ??= {};
      (out[name] as Record<string, unknown>)[id] = "gone";
    }
  }
  return out;
}

/** Why he can't run this now, before trying: no such action, a hidden prop, a hard limit. */
function whyNot(board: JugnuBoard, prop: string, action: string): string | undefined {
  if (!board.propNames().includes(prop)) return `there is no prop "${prop}" on this board`;
  if (board.getDef(prop).actions[action] === undefined) return `${prop} has no action "${action}"`;
  if (board.isHidden(prop)) return `${prop} isn't shown`;
  return board.whyNotJugnu(prop, action);
}

/** Per turn: how to wait until what an action set off has run (a board with no screen jumps there). */
export type TurnWork = {
  settle?: () => Promise<boolean>;
  /** Where lessons are, for the `lesson` tool. */
  lessons?: { library: LessonLibrary; locale: JugnuPlace["locale"] };
};

/**
 * Runs calls as Jugnu, through the one door, and reports what changed, what was refused, the
 * signals raised and which questions it would answer. The board is left changed.
 */
async function run(
  board: JugnuBoard,
  calls: readonly Call[],
  work: TurnWork,
): Promise<{
  changed: Record<string, Record<string, unknown>>;
  refused: string[];
  signals: string[];
  /** The index of the first call that was itself refused (not just something it set off). */
  firstRefused: number | undefined;
}> {
  const names = board.propNames();
  const before = seenOf(board, names);
  const refused: string[] = [];
  const signals: string[] = [];
  let firstRefused: number | undefined;
  const stopActions = board.onAction((heard: HeardAction) => {
    if (heard.actor === Actor.Jugnu && heard.refused !== undefined)
      refused.push(`${heard.prop}.${heard.action}: ${heard.refused}`);
  });
  const stopSignals = board.onSignal((heard: HeardSignal) => {
    signals.push(`${heard.prop}.${heard.signal}`);
  });
  try {
    for (const [i, { call, args }] of calls.entries()) {
      const { prop, member } = splitTarget(call);
      const why = whyNot(board, prop, member);
      if (why !== undefined) {
        refused.push(`${call}: ${why}`);
        firstRefused ??= i;
        continue;
      }
      const count = refused.length;
      await board.perform({ call, args }, Actor.Jugnu);
      if (refused.slice(count).some((r) => r.startsWith(`${call}:`))) firstRefused ??= i;
      await work.settle?.();
    }
  } finally {
    stopActions();
    stopSignals();
  }
  return { changed: changes(before, seenOf(board, names)), refused, signals, firstRefused };
}

const isPlain = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** A call as the model wrote it, as the prop expects it (strict nulls dropped); undefined if malformed. */
function readCall(value: unknown, tools: JugnuTools): Call | undefined {
  if (!isPlain(value) || typeof value.call !== "string") return undefined;
  const args = isPlain(value.args) ? value.args : {};
  const info = tools.actions.get(value.call);
  const read = info !== undefined && tools.isStrict ? fromStrict(info.args, args) : args;
  return { call: value.call, args: isPlain(read) ? read : {} };
}

/** The outcome of one tool call: what to log, what the model hears, and his reply if it went out. */
export type ToolOutcome = { steps: JugnuEvent[]; result: string; cues?: Cue[] };

const answer = (steps: JugnuEvent[], result: unknown, cues?: Cue[]): ToolOutcome => ({
  steps,
  result: JSON.stringify(result),
  ...(cues !== undefined ? { cues } : {}),
});

/** `try`: runs the calls on the board, reports, and puts the board back. */
async function tryCalls(
  board: JugnuBoard,
  args: Record<string, unknown>,
  tools: JugnuTools,
  work: TurnWork,
): Promise<ToolOutcome> {
  const raw = Array.isArray(args.calls) ? args.calls : [];
  const calls = raw.map((item) => readCall(item, tools));
  if (calls.length === 0 || calls.some((c) => c === undefined)) {
    const refused = 'calls must be a list like [{ "call": "line.magnify", "args": {...} }]';
    return answer([{ kind: "try", calls: [], refused }], { error: refused });
  }
  const valid = calls as Call[];
  const before = board.snapshot();
  const done = await run(board, valid, work);
  board.restore(before);
  await work.settle?.();
  const step: JugnuStep = {
    kind: "try",
    calls: valid,
    changed: done.changed,
    ...(done.signals.length > 0 ? { signals: done.signals } : {}),
    ...(done.refused.length > 0 ? { refused: done.refused.join(" | ") } : {}),
  };
  return answer([step], {
    changed: done.changed,
    ...(done.signals.length > 0 ? { signals: done.signals } : {}),
    ...(done.refused.length > 0 ? { refused: done.refused } : {}),
    board: "left as it was",
  });
}

function calculate(board: JugnuBoard, args: Record<string, unknown>): ToolOutcome {
  const expression = String(args.expression ?? "");
  try {
    const value = compileExpression(expression).evaluate((prop) => board.getView(prop));
    if (typeof value !== "number" && typeof value !== "boolean" && typeof value !== "string")
      throw new Error("that isn't a number");
    const result = typeof value === "number" ? Number(value.toPrecision(12)) : value;
    return answer([{ kind: "calculate", expression, result }], { result });
  } catch (error) {
    const refused = error instanceof Error ? error.message : String(error);
    return answer([{ kind: "calculate", expression, refused }], { error: refused });
  }
}

/**
 * `reply`: checks it on the board (each thing shown runs, in order; nothing refused, points at
 * what's there, options that are options) and turns it into cues. If
 * something isn't allowed, the board is put back and he hears why, to reply again.
 */
async function reply(
  board: JugnuBoard,
  args: Record<string, unknown>,
  tools: JugnuTools,
  work: TurnWork,
): Promise<ToolOutcome> {
  const before = board.snapshot();
  const steps: JugnuEvent[] = [];
  const cues: Cue[] = [];
  const refuse = async (why: string, step?: JugnuStep): Promise<ToolOutcome> => {
    board.restore(before);
    await work.settle?.();
    return answer([...(step !== undefined ? [step] : [{ kind: "reply" as const, refused: why }])], {
      error: `${why}. Nothing was sent; reply again.`,
    });
  };
  const written = (Array.isArray(args.steps) ? args.steps : []) as unknown[];
  for (const [i, raw] of written.entries()) {
    const at = `step ${i + 1}`;
    if (!isPlain(raw)) return refuse(`${at} isn't say, show or point`);
    const item = raw as Partial<ReplyStep> & Record<string, unknown>;
    if (typeof item.say === "string") {
      const text = item.say.trim();
      if (text !== "") {
        cues.push({ kind: CueKind.Say, text });
        steps.push({ kind: "say", text });
      }
      continue;
    }
    if (item.show !== undefined && item.show !== null) {
      const call = readCall(item.show, tools);
      if (call === undefined) return refuse(`${at}: show needs { call, args }`);
      const { prop, member: action } = splitTarget(call.call);
      const done = await run(board, [call], work);
      if (done.firstRefused !== undefined) {
        const why = done.refused.join(" | ");
        return refuse(`${at}: ${call.call} was refused: ${why}`, {
          kind: "act",
          prop,
          action,
          args: call.args,
          refused: why,
        });
      }
      cues.push({ kind: CueKind.Act, prop, action, args: call.args });
      steps.push({
        kind: "act",
        prop,
        action,
        args: call.args,
        changed: done.changed,
        ...(done.refused.length > 0 ? { refused: done.refused.join(" | ") } : {}),
      });
      continue;
    }
    if (isPlain(item.point)) {
      const prop = String(item.point.prop ?? "");
      const part =
        typeof item.point.part === "string" && item.point.part !== "" ? item.point.part : undefined;
      if (!board.propNames().includes(prop) || board.isHidden(prop))
        return refuse(`${at}: no prop "${prop}" is shown to point at`, {
          kind: "point",
          prop,
          refused: `no prop "${prop}" is shown`,
        });
      if (part !== undefined) {
        const seen = observationOfView(board.getDef(prop), board.getView(prop));
        const parts = seen.elements.map((e) => e.id);
        if (!parts.includes(part)) {
          const why = `${prop} has nothing called "${part}" (it shows: ${parts.join(", ") || "nothing"})`;
          return refuse(`${at}: ${why}`, { kind: "point", prop, part, refused: why });
        }
      }
      cues.push({ kind: CueKind.Point, prop, ...(part !== undefined ? { part } : {}) });
      steps.push({ kind: "point", prop, ...(part !== undefined ? { part } : {}) });
      continue;
    }
    return refuse(`${at} isn't say, show or point`);
  }
  const end = isPlain(args.end) ? args.end : undefined;
  // Options aren't offered: a question he wrote there anyway is just his words.
  if (!tools.canAsk && end !== undefined && isPlain(end.ask)) {
    const question = String(end.ask.question ?? "").trim();
    if (question !== "") {
      cues.push({ kind: CueKind.Say, text: question });
      steps.push({ kind: "say", text: question });
    }
  } else if (end !== undefined && isPlain(end.ask)) {
    const question = String(end.ask.question ?? "").trim();
    const options = (Array.isArray(end.ask.options) ? end.ask.options : [])
      .map((option) => String(option).trim())
      .filter((option) => option !== "");
    const why =
      question === ""
        ? "the question is empty"
        : options.length < 2 || options.length > MAX_OPTIONS
          ? `give 2 to ${MAX_OPTIONS} options`
          : options.some((option) => option.length > OPTION_MAX)
            ? `keep each option under ${OPTION_MAX} characters`
            : undefined;
    if (why !== undefined)
      return refuse(`ask: ${why}`, { kind: "ask", question, options, refused: why });
    cues.push({ kind: CueKind.Ask, question, options });
    steps.push({ kind: "ask", question, options });
  }
  if (cues.length === 0) return refuse("the reply is empty");
  // A picture alone leaves the student guessing what to look at: a word goes with it.
  if (!cues.some((cue) => cue.kind === CueKind.Say || cue.kind === CueKind.Ask))
    return refuse("say what to notice: a show or point needs one short sentence with it");
  // Words straight after words are one bubble: a reply shows at most one bubble per picture.
  for (let i = cues.length - 1; i > 0; i--) {
    const a = cues[i - 1];
    const b = cues[i];
    if (a?.kind === CueKind.Say && b?.kind === CueKind.Say) {
      cues.splice(i - 1, 2, { kind: CueKind.Say, text: `${a.text} ${b.text}` });
    }
  }
  return answer(steps, { ok: "Sent. Your turn ends here." }, cues);
}

/** Runs one tool call. A `reply` that went out comes back with its cues: the turn ends. */
export async function runTool(
  board: JugnuBoard,
  tools: JugnuTools,
  name: string,
  args: Record<string, unknown> | undefined,
  work: TurnWork = {},
): Promise<ToolOutcome> {
  if (args === undefined) {
    const refused = "arguments weren't valid JSON";
    return answer([{ kind: "unknown", name, refused }], { error: refused });
  }
  switch (name) {
    case JugnuTool.Try:
      return tryCalls(board, args, tools, work);
    case JugnuTool.Calculate:
      return calculate(board, args);
    case JugnuTool.Reply:
      return reply(board, args, tools, work);
    case JugnuTool.Lesson: {
      const concept = typeof args.concept === "string" ? args.concept : "";
      const text =
        work.lessons === undefined
          ? undefined
          : await work.lessons.library.lesson(concept, work.lessons.locale);
      return text === undefined
        ? answer([{ kind: "unknown", name, refused: `no lesson for "${concept}"` }], {
            error: `no lesson for "${concept}"`,
          })
        : answer([{ kind: "lesson", concept }], { lesson: text });
    }
  }
  const refused = `there is no tool "${name}" (try, calculate, reply${work.lessons !== undefined ? ", lesson" : ""})`;
  return answer([{ kind: "unknown", name, refused }], { error: refused });
}
