import { GotThere } from "@chalk/api";
import type { ChalkEvent, Level, PlayMode } from "@chalk/content";
import type { Band, MasteryModel } from "@chalk/learning";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * The database. Content is not in it (it ships with the app as built JSON); only the people, their
 * groups, the events they recorded, the catalogue of question versions, and what is worked out
 * from those (attempts, mastery: dropped and made again from them at will).
 * A change here needs a migration: `pnpm --filter @chalk/server migration`.
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** A school we've signed up; its code is handed out by us (`pnpm add-school`). */
export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

/** Someone who signed in with Google. Role and school are chosen once, at setup. */
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Google's own id for the person; it never changes, unlike their email. */
    googleSub: text("google_sub").notNull().unique(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    picture: text("picture"),
    role: text("role"),
    schoolId: uuid("school_id").references(() => schools.id),
    createdAt: createdAt(),
    setUpAt: timestamp("set_up_at", { withTimezone: true }),
  },
  (t) => [check("accounts_role", sql`${t.role} in ('learner', 'teacher')`)],
);

/** A sign-in on one device. The cookie holds a random token; only its SHA-256 is stored here. */
export const signIns = pgTable(
  "sign_ins",
  {
    tokenHash: text("token_hash").primaryKey(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sign_ins_account").on(t.accountId)],
);

/** A teacher's group for one course. No name: shown as its course and when it was made. */
export const groups = pgTable(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => accounts.id),
    /** The book's id in the built content. */
    courseId: text("course_id").notNull(),
    joinCode: text("join_code").notNull().unique(),
    createdAt: createdAt(),
  },
  (t) => [index("groups_teacher").on(t.teacherId)],
);

/** A learner in a group. Removing them keeps the row (and their history), with `removedAt`. */
export const members = pgTable(
  "members",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => accounts.id),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    removedAt: timestamp("removed_at", { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.groupId, t.learnerId] }),
    index("members_learner").on(t.learnerId),
  ],
);

/**
 * Every entry a learner's phone recorded (docs/events.md): the envelope in its own columns, the
 * kind's payload as JSON. The id is the phone's, so an entry sent twice is kept once. The stream is
 * the truth; every table derived from it can be dropped and made again from it.
 */
export const events = pgTable(
  "events",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    id: text("id").notNull(),
    schemaVersion: integer("schema_version").notNull(),
    session: text("session").notNull(),
    seq: integer("seq").notNull(),
    /** The phone's clock (Unix ms): when it happened there. */
    at: timestamp("at", { withTimezone: true, mode: "date" }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    commit: text("commit").notNull(),
    actor: text("actor").notNull(),
    opening: text("opening"),
    board: text("board"),
    version: text("version"),
    node: text("node"),
    kind: text("kind").notNull(),
    payload: jsonb("payload").$type<ChalkEvent["payload"]>().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.accountId, t.id] }),
    index("events_account_order").on(t.accountId, t.session, t.seq),
    index("events_account_time").on(t.accountId, t.at),
    index("events_board").on(t.board),
  ],
);

/**
 * Every question version the server has served (`@chalk/learning` catalogue.ts): what it tests and
 * how hard it is. Filled at boot from the build, a row added and never changed, so an old answer
 * keeps its meaning after a new build.
 */
export const questionVersions = pgTable(
  "question_versions",
  {
    board: text("board").notNull(),
    version: text("version").notNull(),
    tests: text("tests").array().notNull(),
    level: text("level").$type<Level>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.board, t.version] })],
);

/**
 * Every try a learner made at a question (`@chalk/learning` attempts.ts), worked out again from
 * their whole record on each upload. Rebuildable from events and the catalogue.
 */
export const attempts = pgTable(
  "attempts",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    board: text("board").notNull(),
    /** The board's opening it was made on (joins it to its set and Jugnu's conversation). */
    opening: text("opening").notNull(),
    node: text("node").notNull(),
    nth: integer("nth").notNull(),
    version: text("version").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull(),
    isRight: boolean("is_right").notNull(),
    isGraded: boolean("is_graded").notNull(),
    chosen: text("chosen"),
    tests: text("tests").array().notNull(),
    level: text("level").$type<Level>(),
    mode: text("mode").$type<PlayMode>(),
    helped: boolean("helped").notNull(),
  },
  (t) => [primaryKey({ columns: [t.accountId, t.board, t.node, t.nth] })],
);

/**
 * How well each learner understands each concept, by model (`@chalk/learning` mastery.ts):
 * written with their attempts on each upload, so it is ready before they next open the app.
 */
export const mastery = pgTable(
  "mastery",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    concept: text("concept").notNull(),
    model: text("model").$type<MasteryModel>().notNull(),
    estimate: real("estimate").notNull(),
    low: real("low").notNull(),
    high: real("high").notNull(),
    band: text("band").$type<Band>().notNull(),
    tries: integer("tries").notNull(),
    lastAt: timestamp("last_at", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.accountId, t.concept, t.model] })],
);

/** A text kept once, by the SHA-256 of its words: a prompt's or a lesson's, as Jugnu ran with it. */
export const texts = pgTable("texts", {
  hash: text("hash").primaryKey(),
  text: text("text").notNull(),
  createdAt: createdAt(),
});

/** How a conversation with Jugnu ended. */
export const ConversationEnd = {
  /** Five minutes after his last turn (app.ts, JUGNU_QUIET_MS). */
  Quiet: "quiet",
  /** Their practice run finished. */
  SetFinished: "setFinished",
} as const;
export type ConversationEnd = (typeof ConversationEnd)[keyof typeof ConversationEnd];

/**
 * Jugnu's side of a conversation (platform/docs/plans/teacher-view.md, raw): who and where (the
 * account; the board's opening, id and version; the build's commit), what ran (the model, the
 * tutor prompt by name and hash, the exact prompt and lesson texts by their hash), when it began
 * and ended and why. Its turns and messages are appended, never changed. `cursor` is working
 * state only (where it stands, to go on from): overwritten each turn, dropped once he has
 * reflected on it (the reflection goes on from it). Never
 * served by any API; removed with the account.
 */
export const jugnuConversations = pgTable(
  "jugnu_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    opening: text("opening").notNull(),
    board: text("board").notNull(),
    version: text("version").notNull(),
    commit: text("commit").notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    promptName: text("prompt_name").notNull(),
    promptHash: text("prompt_hash").notNull(),
    promptText: text("prompt_text")
      .notNull()
      .references(() => texts.hash),
    lessonText: text("lesson_text")
      .notNull()
      .references(() => texts.hash),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    lastTurnAt: timestamp("last_turn_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    endedBy: text("ended_by").$type<ConversationEnd>(),
    cursor: jsonb("cursor"),
  },
  (t) => [
    index("jugnu_conversations_account_opening").on(t.accountId, t.opening),
    index("jugnu_conversations_open").on(t.endedAt, t.lastTurnAt),
  ],
);

/** What a turn of Jugnu's was: a reply to the child, or his reflection once it was over. */
export const TurnKind = { Reply: "reply", Reflect: "reflect" } as const;
export type TurnKind = (typeof TurnKind)[keyof typeof TurnKind];

/** One turn of Jugnu's (raw): which kind, when, how long, and his requests (usage, finish, timing). */
export const jugnuTurns = pgTable(
  "jugnu_turns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => jugnuConversations.id, { onDelete: "cascade" }),
    n: integer("n").notNull(),
    kind: text("kind").$type<TurnKind>().notNull().default(TurnKind.Reply),
    at: timestamp("at", { withTimezone: true }).notNull(),
    ms: integer("ms").notNull(),
    requests: jsonb("requests").notNull(),
  },
  (t) => [uniqueIndex("jugnu_turns_conversation_n").on(t.conversationId, t.n)],
);

/** Every message of a conversation as the model had it (raw), in order, with the turn that added it. */
export const jugnuMessages = pgTable(
  "jugnu_messages",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => jugnuConversations.id, { onDelete: "cascade" }),
    n: integer("n").notNull(),
    turnId: uuid("turn_id")
      .notNull()
      .references(() => jugnuTurns.id, { onDelete: "cascade" }),
    message: jsonb("message").notNull(),
  },
  (t) => [primaryKey({ columns: [t.conversationId, t.n] })],
);

/** Whether, by a conversation's end, the child understood it themselves (his judgement). */
export { GotThere };

/**
 * Jugnu's reflection on a conversation once it was over (teacher-view.md, layer 1, judged): what it
 * showed the child isn't good at yet, and whether they got there. Kept with what it came from (the
 * conversation, and the turn that asked it: its messages are in jugnu_messages) and how (the
 * reflect prompt by name, hash and text; the model). Judging again adds a new one; none is changed.
 */
export const jugnuReflections = pgTable(
  "jugnu_reflections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => jugnuConversations.id, { onDelete: "cascade" }),
    turnId: uuid("turn_id")
      .notNull()
      .references(() => jugnuTurns.id, { onDelete: "cascade" }),
    at: timestamp("at", { withTimezone: true }).notNull(),
    promptName: text("prompt_name").notNull(),
    promptHash: text("prompt_hash").notNull(),
    promptText: text("prompt_text")
      .notNull()
      .references(() => texts.hash),
    model: text("model").notNull(),
    points: text("points").array().notNull(),
    gotThere: text("got_there").$type<GotThere>().notNull(),
  },
  (t) => [index("jugnu_reflections_conversation").on(t.conversationId)],
);

/**
 * The learner update, once per finished set (teacher-view.md, step 3, judged): what the set shows
 * the child is still not good at and keeps getting wrong, each point with its evidence (question
 * board ids, reflection ids). History: never overwritten; their state is their latest (by when the
 * set finished, then when judged: judging an old set again is not their state). Kept with
 * how it was made (the update prompt by name, hash and text; the model; the requests' usage).
 * Its numbers are `mastery`, worked out at the same moment.
 */
export const learnerUpdates = pgTable(
  "learner_updates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    /** The set's id (its `set` entries' `set`). */
    set: text("set").notNull(),
    /** When the set finished: the latest update is their last finished set's. */
    setFinishedAt: timestamp("set_finished_at", { withTimezone: true }).notNull(),
    /** When it was judged. */
    at: timestamp("at", { withTimezone: true }).notNull(),
    promptName: text("prompt_name").notNull(),
    promptHash: text("prompt_hash").notNull(),
    promptText: text("prompt_text")
      .notNull()
      .references(() => texts.hash),
    model: text("model").notNull(),
    points: jsonb("points")
      .$type<{ text: string; questions: string[]; reflections: string[] }[]>()
      .notNull(),
    requests: jsonb("requests").notNull(),
  },
  (t) => [
    uniqueIndex("learner_updates_once").on(t.accountId, t.set, t.promptHash),
    index("learner_updates_account_at").on(t.accountId, t.at),
    index("learner_updates_account_finished").on(t.accountId, t.setFinishedAt),
  ],
);

export const schema = {
  schools,
  accounts,
  signIns,
  groups,
  members,
  events,
  questionVersions,
  attempts,
  mastery,
  texts,
  jugnuConversations,
  jugnuTurns,
  jugnuMessages,
  jugnuReflections,
  learnerUpdates,
};
