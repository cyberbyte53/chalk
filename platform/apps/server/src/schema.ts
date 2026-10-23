import type { ChalkEvent } from "@chalk/content";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * The database. Content is not in it (it ships with the app as built JSON); only the people, their
 * groups and the events they produced. Progress is worked out from events, never stored twice.
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
 * Every event a learner's phone uploaded (docs/events.md), whole in `body`, with the fields
 * queries need pulled out beside it. The id is the phone's, so an event sent twice is kept once.
 */
export const events = pgTable(
  "events",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    id: text("id").notNull(),
    sessionId: text("session_id").notNull(),
    seq: integer("seq").notNull(),
    producedAt: timestamp("produced_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    actor: text("actor").notNull(),
    machineType: text("machine_type").notNull(),
    machineId: text("machine_id").notNull(),
    lessonId: text("lesson_id"),
    body: jsonb("body").$type<ChalkEvent>().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.accountId, t.id] }),
    index("events_account_time").on(t.accountId, t.producedAt),
  ],
);

/**
 * A chat with Jugnu someone flagged (wasn't happy with), whole in `body` (`JugnuFlagRequest`):
 * the board, its state, the chat as the model saw it, and what the student saw. To look at, and to
 * replay on the test bench.
 */
export const jugnuFlags = pgTable(
  "jugnu_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    note: text("note").notNull(),
    lessonId: text("lesson_id"),
    body: jsonb("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("jugnu_flags_time").on(t.createdAt)],
);

export const schema = { schools, accounts, signIns, groups, members, events, jugnuFlags };
