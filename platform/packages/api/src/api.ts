import { masterySchema, progressSchema } from "@chalk/learning";
import { z } from "zod";

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
  JugnuTurn: "/api/jugnu/turn",
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

/**
 * One turn of Jugnu (platform/docs/plans/jugnu-live.md): the board (a built item's path), its state
 * now, what the student did since his last reply (as steps), and what they said.
 */
export const jugnuTurnRequestSchema = z.object({
  session: z.string().min(1).max(100),
  board: z
    .string()
    .max(300)
    .regex(/^[a-z0-9][a-z0-9/_-]*$/i),
  state: z.record(z.unknown()),
  did: z.array(z.record(z.unknown())).max(200),
  said: z.string().max(2000),
});
export type JugnuTurnRequest = z.infer<typeof jugnuTurnRequestSchema>;

/** Jugnu's reply, as the phone gets it: his words, and the ids the server keeps this turn by. */
export type JugnuTurnReply = {
  says: string;
  glow: string | null;
  choices: string[];
  isHandBack: boolean;
  model: string;
};
export type JugnuTurnAnswer = JugnuTurnReply & { conversation: string; turn: string };

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
  /** Pages passed and practice done, as on their own phone. */
  progress: progressSchema,
  /** How well they understand each concept with evidence (the server's model). */
  mastery: z.array(masterySchema),
  /**
   * Their latest learner update (their last finished set's): when that set finished, and its
   * first point (null if it found nothing not yet good). Null before their first finished set.
   */
  latestUpdate: z.object({ finishedAt: z.number(), firstPoint: z.string().nullable() }).nullable(),
});
export type GroupLearner = z.infer<typeof groupLearnerSchema>;

/** Whether, by a conversation's end, the child understood it themselves (Jugnu's judgement). */
export const GotThere = { Yes: "yes", Partly: "partly", NotYet: "notYet" } as const;
export type GotThere = (typeof GotThere)[keyof typeof GotThere];

/** A question as the teacher reads it: its name, the concepts it tests (titles), its level. */
const questionSeenSchema = z.object({
  board: z.string(),
  name: z.string(),
  concepts: z.array(z.string()),
  level: z.string().nullable(),
  /** Their tries at it in that set, in order. */
  tries: z.array(
    z.object({ isRight: z.boolean(), chosen: z.string().nullable(), helped: z.boolean() }),
  ),
});
export type QuestionSeen = z.infer<typeof questionSeenSchema>;

/** One of Jugnu's reflections on a conversation of theirs: the board, got there, his points. */
const reflectionSeenSchema = z.object({
  id: z.string(),
  board: z.string(),
  name: z.string(),
  gotThere: z.nativeEnum(GotThere),
  points: z.array(z.string()),
});
export type ReflectionSeen = z.infer<typeof reflectionSeenSchema>;

/**
 * A teacher's look at one child (platform/docs/plans/teacher-view.md, step 4): as in the class,
 * and their latest update, each point with its evidence (the questions and reflections it cites,
 * as the teacher reads them), and Jugnu's reflections on that set. Judged points only.
 */
export const learnerReplySchema = z.object({
  learner: groupLearnerSchema,
  update: z
    .object({
      finishedAt: z.number(),
      points: z.array(
        z.object({
          text: z.string(),
          questions: z.array(questionSeenSchema),
          reflections: z.array(z.string()),
        }),
      ),
      reflections: z.array(reflectionSeenSchema),
    })
    .nullable(),
});
export type LearnerReply = z.infer<typeof learnerReplySchema>;

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
  /** Jugnu is still answering this session's last message. */
  Busy: "busy",
  /** Jugnu isn't on this server (no model set up). */
  Unavailable: "unavailable",
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export const apiErrorSchema = z.object({
  error: z.nativeEnum(ApiErrorCode),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
