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

/**
 * Jugnu's note on a learner, one per conversation, written when it ends (platform/docs/plans/
 * teacher-view.md): what they aren't good at yet and whether they got there. Kept here, where his
 * turns run, never sent to the phone. The board and its version say what it is about; its
 * concepts are worked out when it is read.
 */
export const jugnuNotes = pgTable(
  "jugnu_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    board: text("board").notNull(),
    version: text("version").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull(),
    text: text("text").notNull(),
  },
  (t) => [index("jugnu_notes_account_at").on(t.accountId, t.at)],
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
  jugnuNotes,
};
