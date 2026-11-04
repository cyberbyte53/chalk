import { z } from "zod";

/**
 * Events: what a child did, carried from the phone to the server (docs/events.md). Everything the
 * learner (or Jugnu) does is recorded automatically, as entries on nodes of the course tree. Each
 * entry is the same envelope plus one kind's payload; the kinds are one table below, so adding a
 * kind is adding a line to it. Until the first learner, shapes change freely; after that, add
 * optional fields freely and bump EVENT_SCHEMA_VERSION for anything else.
 */
export const EVENT_SCHEMA_VERSION = 2;

/**
 * How a board is played. A question is only content (prompt, interaction, answer); the mode
 * decides what happens around it: whether Jugnu is there, whether a wrong answer can be tried
 * again, and what the banner under the board says. The same question plays in every mode.
 * See plans/play-modes.md. Here because
 * the record says it (`open`'s `mode`).
 */
export const PlayMode = {
  /** A question inside a lesson's pages. */
  Lesson: "lesson",
  /** Practice after a lesson: Jugnu any time, try again until right. */
  Guided: "guided",
  /** A test: no Jugnu, one try, only right or wrong. */
  SkillCheck: "skillCheck",
  /** A skill check's mistakes again, with Jugnu. */
  Review: "review",
} as const;
export type PlayMode = (typeof PlayMode)[keyof typeof PlayMode];

/** Who did it. Only the learner's own entries are evidence. */
export const Actor = { Learner: "learner", Lesson: "lesson", App: "app", Jugnu: "jugnu" } as const;
export type Actor = (typeof Actor)[keyof typeof Actor];

const id = z.string().min(1).max(64);
const record = z.record(z.string(), z.unknown());

/** One kind's payload: only what is new in that moment, never the page's state. */
export const eventKinds = {
  /** A node was opened: a board (how), or a book, chapter or concept on screen. */
  open: z
    .object({
      /** How a board is played (play-mode.ts). */
      mode: z.nativeEnum(PlayMode).optional(),
      /** The learner had passed this board before; it opened fresh, Continue showing. */
      wasPassed: z.boolean().optional(),
      locale: z.string().optional(),
      hasAudio: z.boolean().optional(),
      /** Why the app showed it, as plain context ("practice", "review"). */
      reason: z.string().optional(),
      /** The set this board is played in (its `set served` entry's id): what joins it to its set. */
      set: z.string().optional(),
    })
    .strict(),
  close: z.object({}).strict(),
  /**
   * Something the learner or Jugnu did on a board: an action asked of a node, or a signal its view
   * raised directly. A drag is one entry per gesture: its last args, and when it started.
   */
  cause: z.union([
    z
      .object({
        action: z.string().min(1),
        args: record,
        /** Why the board refused it; absent when it was taken. */
        refused: z.string().optional(),
        /** A gesture merged into this entry: when it started (Unix ms) and how many steps it had. */
        startAt: z.number().int().optional(),
        steps: z.number().int().min(2).optional(),
      })
      .strict(),
    z.object({ signal: z.string().min(1), payload: record }).strict(),
  ]),
  /** A signal the board raised, and the seq of the cause that set it off (null: none did). */
  signal: z
    .object({ signal: z.string().min(1), payload: record, from: z.number().int().nullable() })
    .strict(),
  /**
   * One turn with Jugnu: what was asked (and held to ask about), his reply, what he did (kept as he
   * reported it; his actions on the board are `cause` entries of his own), which model.
   */
  jugnu: z
    .object({
      asked: z.string(),
      about: z
        .array(
          z
            .object({ prop: z.string(), part: z.string().optional(), text: z.string().optional() })
            .strict(),
        )
        .optional(),
      reply: z.string(),
      steps: z.array(z.object({ kind: z.string() }).passthrough()),
      model: z.string(),
      /** Short options he offered with his reply, for the student to tap (or type their own). */
      choices: z.array(z.string()).min(2).max(4).optional(),
      /** He handed back: he thinks they have it, and they do the next one alone. */
      isHandBack: z.boolean().optional(),
      /**
       * The server's record of this turn: its conversation and turn ids (they join this entry to
       * Jugnu's side of it, kept on the server). Absent where no server keeps him (the sandbox).
       */
      conversation: z.string().optional(),
      turn: z.string().optional(),
    })
    .strict(),
  /**
   * The chat with Jugnu, as the student meets it: it opened (from Get help, or Ask Jugnu), they
   * said something (typed, a tapped choice, or Done after acting on the board), it closed (by them,
   * or by his hand-back). What they did on the board between is its `cause` entries.
   */
  chat: z.union([
    z.object({ what: z.literal("opened"), reason: z.enum(["getHelp", "ask"]) }).strict(),
    z
      .object({
        what: z.literal("said"),
        text: z.string(),
        via: z.enum(["typed", "choice", "done"]),
      })
      .strict(),
    z.object({ what: z.literal("closed"), by: z.enum(["student", "handBack"]) }).strict(),
  ]),
  /**
   * A set of questions given to the child (platform/docs/plans/teacher-view.md): `served` as it
   * starts from its first question (its id, who made it, its questions in order), `finished` as
   * its last is passed. Recorded by the lesson; its place fields are null. A set left halfway has
   * no `finished`.
   */
  set: z.union([
    z
      .object({
        what: z.literal("served"),
        set: z.string(),
        /** The set constructor that made it (its version is the entry's commit). */
        by: z.string(),
        questions: z.array(z.object({ board: z.string(), version: z.string() }).strict()).min(1),
      })
      .strict(),
    z.object({ what: z.literal("finished"), set: z.string() }).strict(),
  ]),
  /** Things around boards: a line's audio failed, the app passed a board itself. */
  app: z.object({ what: z.string().min(1) }).catchall(z.unknown()),
} as const;

export type EventKind = keyof typeof eventKinds;
export const EventKind = Object.fromEntries(Object.keys(eventKinds).map((k) => [k, k])) as {
  readonly [K in EventKind]: K;
};
export type PayloadOf<K extends EventKind> = z.infer<(typeof eventKinds)[K]>;

/** What `app` entries say. */
export const AppWhat = { AudioFailed: "audioFailed", Passed: "passed" } as const;

/** The same on every entry; its own columns on the server. */
export const eventEnvelopeSchema = z
  .object({
    id,
    schemaVersion: z.literal(EVENT_SCHEMA_VERSION),
    session: id,
    /** Order within the session: the phone's clock can't be trusted for order. */
    seq: z.number().int().min(0),
    /** Unix ms on the phone: the only time. */
    at: z.number().int().positive(),
    /** The commit the app was built from. */
    commit: z.string().min(1).max(80),
    actor: z.nativeEnum(Actor),
    /** Which opening of the board (one board can open twice in a session); null off a board. */
    opening: id.nullable(),
    /** The board's id, or null off a board. */
    board: id.nullable(),
    /** The version of the board, or of the node opened off a board. */
    version: id.nullable(),
    /** The piece on the board, or the node opened off a board; null for the board itself. */
    node: id.nullable(),
  })
  .strict();
export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export type ChalkEvent = {
  [K in EventKind]: EventEnvelope & { kind: K; payload: PayloadOf<K> };
}[EventKind];

const entrySchema = (kind: EventKind) =>
  eventEnvelopeSchema.extend({ kind: z.literal(kind), payload: eventKinds[kind] });
export const eventSchema = z.discriminatedUnion(
  "kind",
  (Object.keys(eventKinds) as EventKind[]).map(entrySchema) as unknown as [
    ReturnType<typeof entrySchema>,
    ...ReturnType<typeof entrySchema>[],
  ],
) as unknown as z.ZodType<ChalkEvent>;

/** The fields the bus adds to every entry. */
type Added = "id" | "schemaVersion" | "session" | "seq" | "at" | "commit";
/** An entry as a producer records it: the bus adds the rest of the envelope. */
export type EventEntry = ChalkEvent extends infer E
  ? E extends ChalkEvent
    ? Omit<E, Added>
    : never
  : never;

/** Narrows an entry to one kind. */
export function isKind<K extends EventKind>(
  event: ChalkEvent,
  kind: K,
): event is Extract<ChalkEvent, { kind: K }> {
  return event.kind === kind;
}
