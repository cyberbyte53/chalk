import { z } from "zod";
import { itemRefSchema } from "./board";

/**
 * Events (see docs/events.md). Everything with behaviour is a state machine; an event is one
 * input applied to one machine, plus the machine's state right after. Only commits are logged.
 * Until the first learner, shapes change freely at version 1. After that: add optional fields
 * freely; anything else bumps EVENT_SCHEMA_VERSION.
 */
export const EVENT_SCHEMA_VERSION = 1;

/** Who supplied the input. Only the learner's own commits are evidence. */
export const Actor = { Learner: "learner", Lesson: "lesson", App: "app", Jugnu: "jugnu" } as const;
export type Actor = (typeof Actor)[keyof typeof Actor];

export const MachineType = {
  Lesson: "lesson",
  Board: "board",
  Question: "question",
  Line: "line",
  Jugnu: "jugnu",
} as const;
export type MachineType = (typeof MachineType)[keyof typeof MachineType];

/** The same on every event. */
export const eventEnvelopeSchema = z
  .object({
    id: z.string().min(1),
    schemaVersion: z.literal(EVENT_SCHEMA_VERSION),
    sessionId: z.string().min(1),
    /** Order within the session; phone clocks can't be trusted for order. */
    seq: z.number().int().min(0),
    /** Unix ms when the phone produced it. */
    producedAt: z.number().int().positive(),
    actor: z.nativeEnum(Actor),
    lessonId: z.string().nullable(),
    /** The built page or question the board was made from (and so its code version); none for a board made by hand. */
    item: itemRefSchema.nullable(),
  })
  .strict();
export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

/** A node's stored facts as they were at the commit. */
const factsSchema = z.record(z.string(), z.unknown());

/**
 * One node of a saved board: its prop type and the shape of its facts (`type@hash`: facts are read
 * back only by a prop with the same key), its facts, and whether the learner touched it.
 */
export const savedNodeSchema = z
  .object({ type: z.string().min(1), facts: factsSchema, isTouched: z.boolean() })
  .strict();
export type SavedNode = z.infer<typeof savedNodeSchema>;

/** A board as saved: each placed node by its address. Written and read by one function each (the player's). */
export const savedBoardSchema = z.record(z.string(), savedNodeSchema);
export type SavedBoard = z.infer<typeof savedBoardSchema>;

/** One thing the learner did on the board: the node by address, the action, its arguments, when (board clock, s). */
export const loggedActionSchema = z
  .object({
    node: z.string().min(1),
    action: z.string().min(1),
    args: z.record(z.string(), z.unknown()),
    t: z.number().min(0),
  })
  .strict();
export type LoggedAction = z.infer<typeof loggedActionSchema>;

/** What a part on screen showed: its address, its value, its words. */
const seenPartSchema = z
  .object({ path: z.string(), value: z.unknown().optional(), words: z.string().optional() })
  .strict();

/**
 * A machine on a board is named by the board's item id and the node's address in it
 * (`<item id>#<address>`); a board made by hand by its name.
 */
export const nodeMachineId = (board: string, path: string): string => `${board}#${path}`;

// ---- lesson ----

export const LessonStatus = { Playing: "playing", Completed: "completed", Left: "left" } as const;
export type LessonStatus = (typeof LessonStatus)[keyof typeof LessonStatus];

const lessonEventSchema = z
  .object({
    envelope: eventEnvelopeSchema,
    machine: z.object({ type: z.literal(MachineType.Lesson), id: z.string() }).strict(),
    input: z.discriminatedUnion("type", [
      z.object({ type: z.literal("start") }).strict(),
      z.object({ type: z.literal("complete") }).strict(),
      z.object({ type: z.literal("leave") }).strict(),
      /** The learner went back a board; `boardIndex` is the one they went back to. */
      z
        .object({ type: z.literal("back") })
        .strict(),
    ]),
    state: z
      .object({ status: z.nativeEnum(LessonStatus), boardIndex: z.number().int().min(0) })
      .strict(),
  })
  .strict();

// ---- board ----

const boardEventSchema = z
  .object({
    envelope: eventEnvelopeSchema,
    /** The board's item id (its name, for a board made by hand). */
    machine: z.object({ type: z.literal(MachineType.Board), id: z.string().min(1) }).strict(),
    input: z.discriminatedUnion("type", [
      z
        .object({
          type: z.literal("continue"),
          /**
           * Every node on the board as it was when the learner pressed Continue, by address, so the
           * event stands on its own (Jugnu, analysis). A prop placed with `isInEvents: false` is left out.
           */
          nodes: savedBoardSchema,
          /** Everything the learner did on the board, in order: the session replays from it. */
          actions: z.array(loggedActionSchema),
        })
        .strict(),
    ]),
    state: z.object({ phase: z.literal("passed") }).strict(),
  })
  .strict();

// ---- question ----

export const QuestionStatus = { Correct: "correct", Wrong: "wrong" } as const;
export type QuestionStatus = (typeof QuestionStatus)[keyof typeof QuestionStatus];

export const SubmittedKind = { Choice: "choice", Choices: "choices", Prop: "prop" } as const;
export type SubmittedKind = (typeof SubmittedKind)[keyof typeof SubmittedKind];

/** What the learner submitted when pressing Check. */
export const submittedSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal(SubmittedKind.Choice), optionId: z.string() }).strict(),
  /** A multi-choice question: every option picked. */
  z
    .object({ kind: z.literal(SubmittedKind.Choices), optionIds: z.array(z.string()) })
    .strict(),
  z
    .object({ kind: z.literal(SubmittedKind.Prop), node: z.string().min(1), facts: factsSchema })
    .strict(),
]);
export type Submitted = z.infer<typeof submittedSchema>;

const questionEventSchema = z
  .object({
    envelope: eventEnvelopeSchema,
    /** `<item id>#<address>` (nodeMachineId). */
    machine: z.object({ type: z.literal(MachineType.Question), id: z.string().min(1) }).strict(),
    input: z.discriminatedUnion("type", [
      z
        .object({
          type: z.literal("check"),
          submitted: submittedSchema,
          /**
           * What the learner saw when they checked: the question's parts and those of the node it is
           * about, as drawn. With the item's version, history never depends on recomputing it.
           */
          saw: z.array(seenPartSchema),
        })
        .strict(),
    ]),
    state: z
      .object({
        status: z.nativeEnum(QuestionStatus),
        /** 1 on the first try at this question. */
        attempts: z.number().int().min(1),
        /** Whether this check counts towards mastery (a bank question), or only teaches (a page's). */
        isGraded: z.boolean(),
      })
      .strict(),
  })
  .strict();

// ---- line (anything read aloud) ----

const lineEventSchema = z
  .object({
    envelope: eventEnvelopeSchema,
    /** `<item id>#<address>` of the prop that spoke (nodeMachineId). */
    machine: z.object({ type: z.literal(MachineType.Line), id: z.string().min(1) }).strict(),
    input: z.discriminatedUnion("type", [
      /** The line's audio couldn't play (missing, failed to load, or blocked); the text stayed on screen. */
      z
        .object({ type: z.literal("audioFailed"), reason: z.string() })
        .strict(),
    ]),
    state: z.object({ audio: z.literal("failed") }).strict(),
  })
  .strict();

// ---- jugnu (one turn: the learner asked; what he said and did) ----

/**
 * One thing Jugnu did in a turn: acted on a prop, pointed, calculated. Kept as he
 * reported it (`kind` plus its own fields); the shapes live in @chalk/jugnu.
 */
const jugnuStepSchema = z.object({ kind: z.string() }).passthrough();

const jugnuEventSchema = z
  .object({
    envelope: eventEnvelopeSchema,
    /** Jugnu's chat on one board: the board's item id (its name, for a board made by hand). */
    machine: z.object({ type: z.literal(MachineType.Jugnu), id: z.string().min(1) }).strict(),
    input: z.discriminatedUnion("type", [
      z
        .object({
          type: z.literal("ask"),
          text: z.string(),
          /** What they held on the board to ask about. */
          about: z
            .array(
              z
                .object({
                  prop: z.string(),
                  part: z.string().optional(),
                  text: z.string().optional(),
                })
                .strict(),
            )
            .optional(),
        })
        .strict(),
      /** Older events only: he used to hand the board back and go on when the learner moved. */
      z
        .object({ type: z.literal("moved"), props: z.array(z.string()) })
        .strict(),
    ]),
    state: z
      .object({
        reply: z.string(),
        /** What he did, in order, including what he tried and wasn't allowed to do (`refused`). */
        steps: z.array(jugnuStepSchema),
        /** Older events only: props he was waiting on the learner to act on. */
        watching: z.array(z.string()).optional(),
        /** Which model answered (e.g. "openai-compatible:deepseek-chat"), to compare answers later. */
        model: z.string(),
      })
      .strict(),
  })
  .strict();

// ---- all events ----

export const eventSchema = z.union([
  lessonEventSchema,
  boardEventSchema,
  questionEventSchema,
  lineEventSchema,
  jugnuEventSchema,
]);
export type ChalkEvent = z.infer<typeof eventSchema>;

/** An event before the backbone adds its envelope: what a widget raises. */
export type MachineEvent = ChalkEvent extends infer E
  ? E extends ChalkEvent
    ? Omit<E, "envelope">
    : never
  : never;

/** The event shape for one machine type. */
export type EventFor<T extends MachineType> = Extract<ChalkEvent, { machine: { type: T } }>;

/** Narrows an event to one machine type. */
export function isEventFor<T extends MachineType>(
  event: ChalkEvent,
  type: T,
): event is EventFor<T> {
  return event.machine.type === type;
}

/** The lesson and board an event happened in; supplied by the player. */
export type EventPlace = Pick<EventEnvelope, "lessonId" | "item">;
