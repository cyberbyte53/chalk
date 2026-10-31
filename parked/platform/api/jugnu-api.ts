// Jugnu's part of @chalk/api (packages/api/src/api.ts), cut when he was parked: his routes,
// turn and flag requests, his reply, his error codes. Not built.

/** His routes, from ApiPath. */
export const JugnuPath = {
  /** One of Jugnu's turns, thought through on the server on its own copy of the board. */
  JugnuTurn: "/api/jugnu/turn",
  /** A chat with Jugnu someone wasn't happy with, kept to look at. */
  JugnuFlags: "/api/jugnu/flags",
} as const;

/** Where the student is, for Jugnu. */
export const jugnuPlaceSchema = z
  .object({
    lessonTitle: z.string().max(300),
    boardNumber: z.number().int().min(1),
    boardCount: z.number().int().min(1),
    locale: z.nativeEnum(Locale),
    mode: z.enum(["lesson", "guided", "skillCheck", "review"]).optional(),
  })
  .strict();

/** Every prop's stored state, as the phone's board holds it. */

/** Most messages a chat with Jugnu on one board may carry; a longer one starts again. */
export const JUGNU_CHAT_MAX = 600;

/**
 * One of Jugnu's turns: which board (the built page or question it was made from: the server makes
 * its own copy from the same code), where it is now, the chat so far (as the server last sent it;
 * checked again there), and what the student did. The server keeps nothing between turns.
 */
export const jugnuTurnRequestSchema = z
  .object({
    item: itemRefSchema,
    place: jugnuPlaceSchema,
    state: savedBoardSchema,
    chat: z.array(z.unknown()).max(JUGNU_CHAT_MAX),
    input: turnInputSchema,
  })
  .strict();
export type JugnuTurnRequest = z.infer<typeof jugnuTurnRequestSchema>;

/** What Jugnu did, step by step, as he reported it (`kind` plus its own fields). */
const jugnuEventSchema = z.object({ kind: z.string() }).passthrough();

/** A chat with Jugnu, flagged: everything needed to see it again and replay it on the bench. */
export const jugnuFlagRequestSchema = z
  .object({
    lessonId: z.string().max(200).nullable(),
    /** The board's name, and the built item it was made from (none for a board made by hand). */
    board: z.string().min(1).max(200),
    item: itemRefSchema.nullable(),
    place: jugnuPlaceSchema,
    /** The board when the chat started, and now. */
    stateAtStart: savedBoardSchema,
    state: savedBoardSchema,
    /** The chat as the model saw it (his tries and their results included). */
    chat: z.array(z.unknown()).max(JUGNU_CHAT_MAX),
    /** What the student saw, turn by turn. */
    shown: z.array(z.object({ from: z.string(), text: z.string() }).strict()).max(1000),
    note: z.string().max(1000).default(""),
  })
  .strict();
export type JugnuFlagRequest = z.input<typeof jugnuFlagRequestSchema>;

export const jugnuTurnReplySchema = z.object({
  /** What to play on the phone, in order. */
  cues: z.array(cueSchema),
  /** This turn's messages: the phone adds them to its chat and sends them back next turn. */
  chat: z.array(z.unknown()),
  /** What he did while thinking, in order (tries and refusals included): for logs and flags. */
  events: z.array(jugnuEventSchema),
  reply: z.string(),
  model: z.string(),
  modelCalls: z.number().int(),
  usage: z.object({ input: z.number(), cached: z.number(), output: z.number() }),
  isFallback: z.boolean(),
});
export type JugnuTurnReply = z.infer<typeof jugnuTurnReplySchema>;

/** His error codes, from ApiErrorCode. */
export const JugnuErrorCode = {
  JugnuOff: "jugnuOff",
  JugnuFailed: "jugnuFailed",
} as const;
