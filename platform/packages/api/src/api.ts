import { Locale, boardSchema, cueSchema, turnInputSchema } from "@chalk/content";
import { z } from "zod";
import { progressSchema } from "./progress";

/**
 * What the app and the server say to each other, as Zod schemas both sides parse with. Times are
 * Unix ms; ids are strings. Every route is under /api.
 */

export const ApiPath = {
  SignInGoogle: "/api/sign-in/google",
  SignOut: "/api/sign-out",
  Me: "/api/me",
  Setup: "/api/me/setup",
  Join: "/api/join",
  Events: "/api/events",
  Groups: "/api/groups",
  Progress: "/api/progress",
  Health: "/api/health",
  /** One of Jugnu's turns, thought through on the server on its own copy of the board. */
  JugnuTurn: "/api/jugnu/turn",
  /** A chat with Jugnu someone wasn't happy with, kept to look at. */
  JugnuFlags: "/api/jugnu/flags",
} as const;

/** One group's routes. */
export const groupPath = (groupId: string): string => `${ApiPath.Groups}/${groupId}`;
export const groupCodePath = (groupId: string): string => `${groupPath(groupId)}/code`;
export const groupLearnerPath = (groupId: string, learnerId: string): string =>
  `${groupPath(groupId)}/learners/${learnerId}`;

/** What someone is in the app, chosen once at setup. */
export const Role = { Learner: "learner", Teacher: "teacher" } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const NAME_MAX = 60;
export const EVENTS_PER_BATCH = 200;

// ---- requests ----

export const signInGoogleRequestSchema = z.object({ credential: z.string().min(1) }).strict();
export type SignInGoogleRequest = z.infer<typeof signInGoogleRequestSchema>;

export const setupRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(NAME_MAX),
    schoolCode: z.string().min(1).max(20),
    role: z.nativeEnum(Role),
  })
  .strict();
export type SetupRequest = z.infer<typeof setupRequestSchema>;

export const joinRequestSchema = z.object({ code: z.string().min(1).max(20) }).strict();
export type JoinRequest = z.infer<typeof joinRequestSchema>;

export const newGroupRequestSchema = z.object({ courseId: z.string().min(1) }).strict();
export type NewGroupRequest = z.infer<typeof newGroupRequestSchema>;

/**
 * A batch of events from the phone's queue. Each is checked on its own (against `eventSchema`), so
 * one the server can't read never holds up the rest.
 */
export const eventsRequestSchema = z
  .object({ events: z.array(z.unknown()).min(1).max(EVENTS_PER_BATCH) })
  .strict();
export type EventsRequest = z.infer<typeof eventsRequestSchema>;

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
const boardStateSchema = z.record(z.string(), z.record(z.string(), z.unknown()));

/** Most messages a chat with Jugnu on one board may carry; a longer one starts again. */
export const JUGNU_CHAT_MAX = 600;

/**
 * One of Jugnu's turns: the board as the lesson wrote it, where it is now, the chat so far (as the
 * server last sent it; checked again there), and what the student did. The server is stateless:
 * everything it needs is here.
 */
export const jugnuTurnRequestSchema = z
  .object({
    board: boardSchema,
    place: jugnuPlaceSchema,
    state: boardStateSchema,
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
    boardId: z.number().int().nullable(),
    board: boardSchema,
    place: jugnuPlaceSchema,
    /** The board when the chat started, and now. */
    stateAtStart: boardStateSchema,
    state: boardStateSchema,
    /** The chat as the model saw it (his tries and their results included). */
    chat: z.array(z.unknown()).max(JUGNU_CHAT_MAX),
    /** What the student saw, turn by turn. */
    shown: z.array(z.object({ from: z.string(), text: z.string() }).strict()).max(1000),
    note: z.string().max(1000).default(""),
  })
  .strict();
export type JugnuFlagRequest = z.input<typeof jugnuFlagRequestSchema>;

// ---- replies ----

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  picture: z.string().nullable(),
  /** Null until setup. */
  role: z.nativeEnum(Role).nullable(),
  school: z.object({ name: z.string() }).nullable(),
});
export type Account = z.infer<typeof accountSchema>;

/** A group as its teacher sees it. Groups have no name: the course and when it was made. */
export const teacherGroupSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  joinCode: z.string(),
  createdAt: z.number(),
  learnerCount: z.number().int(),
});
export type TeacherGroup = z.infer<typeof teacherGroupSchema>;

/** A group as a learner in it sees it. */
export const joinedGroupSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  teacherName: z.string(),
  joinedAt: z.number(),
});
export type JoinedGroup = z.infer<typeof joinedGroupSchema>;

export const meReplySchema = z.object({
  account: accountSchema,
  teaching: z.array(teacherGroupSchema),
  joined: z.array(joinedGroupSchema),
});
export type MeReply = z.infer<typeof meReplySchema>;

export const groupLearnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  picture: z.string().nullable(),
  joinedAt: z.number(),
  /** When their last event was produced; null if none yet. */
  lastActiveAt: z.number().nullable(),
  /** Worked out from their events, as on their own phone. */
  progress: progressSchema,
});
export type GroupLearner = z.infer<typeof groupLearnerSchema>;

export const groupReplySchema = z.object({
  group: teacherGroupSchema,
  learners: z.array(groupLearnerSchema),
});
export type GroupReply = z.infer<typeof groupReplySchema>;

export const eventsReplySchema = z.object({
  /** Newly stored; an event sent twice is stored once and not counted again. */
  saved: z.number().int(),
  /** Ids (or positions, when an event has no id) the server couldn't read; drop them. */
  rejected: z.array(z.string()),
});
export type EventsReply = z.infer<typeof eventsReplySchema>;

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

// ---- errors ----

export const ApiErrorCode = {
  BadRequest: "badRequest",
  BadGoogleToken: "badGoogleToken",
  NotSignedIn: "notSignedIn",
  NotSetUp: "notSetUp",
  AlreadySetUp: "alreadySetUp",
  WrongRole: "wrongRole",
  UnknownSchool: "unknownSchool",
  UnknownJoinCode: "unknownJoinCode",
  UnknownCourse: "unknownCourse",
  NotFound: "notFound",
  TooMany: "tooMany",
  JugnuOff: "jugnuOff",
  JugnuFailed: "jugnuFailed",
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export const apiErrorSchema = z.object({
  error: z.nativeEnum(ApiErrorCode),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
