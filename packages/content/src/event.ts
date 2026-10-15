import { z } from "zod";
import { permanentIdSchema } from "./piece";

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
    contentVersion: z.string().nullable(),
    boardId: permanentIdSchema.nullable(),
  })
  .strict();
export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

/** A prop's stored state as it was at the commit. */
const propStateSchema = z.record(z.string(), z.unknown());

/** One prop in a board's Continue event: its state then, and whether the learner touched it. */
const propRecordSchema = z.object({ isTouched: z.boolean(), state: propStateSchema }).strict();
export type PropRecord = z.infer<typeof propRecordSchema>;

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
    machine: z.object({ type: z.literal(MachineType.Board), id: permanentIdSchema }).strict(),
    input: z.discriminatedUnion("type", [
      z
        .object({
          type: z.literal("continue"),
          /**
           * Every prop on the board as it was when the learner pressed Continue, by piece id, so the
           * event stands on its own (Jugnu, analysis). A prop placed with `isInEvents: false` is left out.
           */
          props: z.record(z.string(), propRecordSchema),
        })
        .strict(),
    ]),
    state: z.object({ phase: z.literal("passed") }).strict(),
  })
  .strict();

// ---- question ----

export const QuestionStatus = { Correct: "correct", Wrong: "wrong" } as const;
export type QuestionStatus = (typeof QuestionStatus)[keyof typeof QuestionStatus];

export const SubmittedKind = { Choice: "choice", Prop: "prop" } as const;
export type SubmittedKind = (typeof SubmittedKind)[keyof typeof SubmittedKind];

/** What the learner submitted when pressing Check. */
export const submittedSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal(SubmittedKind.Choice), optionId: z.string() }).strict(),
  z
    .object({
      kind: z.literal(SubmittedKind.Prop),
      propId: permanentIdSchema,
      state: propStateSchema,
    })
    .strict(),
]);
export type Submitted = z.infer<typeof submittedSchema>;

const questionEventSchema = z
  .object({
    envelope: eventEnvelopeSchema,
    machine: z.object({ type: z.literal(MachineType.Question), id: permanentIdSchema }).strict(),
    input: z.discriminatedUnion("type", [
      z.object({ type: z.literal("check"), submitted: submittedSchema }).strict(),
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
    machine: z.object({ type: z.literal(MachineType.Line), id: permanentIdSchema }).strict(),
    input: z.discriminatedUnion("type", [
      /** The line's audio couldn't play (missing, failed to load, or blocked); the text stayed on screen. */
      z
        .object({ type: z.literal("audioFailed"), reason: z.string() })
        .strict(),
    ]),
    state: z.object({ audio: z.literal("failed") }).strict(),
  })
  .strict();

// ---- jugnu (one turn: the learner asked, or moved after he handed back; what he said and did) ----

/**
 * One thing Jugnu did in a turn: acted on a prop, pointed, calculated, handed back. Kept as he
 * reported it (`kind` plus its own fields); the shapes live in @chalk/jugnu.
 */
const jugnuStepSchema = z.object({ kind: z.string() }).passthrough();

const jugnuEventSchema = z
  .object({
    envelope: eventEnvelopeSchema,
    /** Jugnu's chat on one board: the board's permanent id. */
    machine: z.object({ type: z.literal(MachineType.Jugnu), id: permanentIdSchema }).strict(),
    input: z.discriminatedUnion("type", [
      z.object({ type: z.literal("ask"), text: z.string() }).strict(),
      /** He had handed the board back, and the learner acted on these props. */
      z
        .object({ type: z.literal("moved"), props: z.array(z.string()) })
        .strict(),
    ]),
    state: z
      .object({
        reply: z.string(),
        /** What he did, in order, including what he tried and wasn't allowed to do (`refused`). */
        steps: z.array(jugnuStepSchema),
        /** Props he is waiting on the learner to act on; empty if none. */
        watching: z.array(z.string()),
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
export type EventPlace = Pick<EventEnvelope, "lessonId" | "contentVersion" | "boardId">;
