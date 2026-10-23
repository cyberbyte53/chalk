import { createHash, randomBytes } from "node:crypto";
import {
  type Account,
  DEV_SCHOOL_CODE,
  type GroupLearner,
  JOIN_CODE_LENGTH,
  type JoinedGroup,
  type MeReply,
  type Progress,
  Role,
  SCHOOL_CODE_LENGTH,
  type TeacherGroup,
  conceptLessonId,
  devJoinCode,
  makeCode,
  practiceLessonId,
  progressFrom,
} from "@chalk/api";
import type { ChalkEvent } from "@chalk/content";
import { and, desc, eq, gt, inArray, isNull, like, max, or, sql } from "drizzle-orm";
import type { Db } from "./db";
import type { GoogleProfile } from "./google";
import { events, accounts, groups, jugnuFlags, members, schools, signIns } from "./schema";

/** Every query the routes make. Routes check who may ask; these only read and write. */

export type AccountRow = typeof accounts.$inferSelect;

export const SIGN_IN_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const isRole = (value: string | null): value is Role =>
  value !== null && (Object.values(Role) as string[]).includes(value);

// ---- accounts and sign-ins ----

/** Finds the person by Google's id, or adds them. Their Google name stands until setup. */
export async function upsertGoogleAccount(db: Db, profile: GoogleProfile): Promise<AccountRow> {
  const [row] = await db
    .insert(accounts)
    .values({
      googleSub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    })
    .onConflictDoUpdate({
      target: accounts.googleSub,
      set: {
        email: profile.email,
        picture: profile.picture,
        name: sql`case when ${accounts.setUpAt} is null then excluded.name else ${accounts.name} end`,
      },
    })
    .returning();
  if (row === undefined) throw new Error(`Couldn't save the account for ${profile.email}`);
  return row;
}

/** A new sign-in; returns the token for the cookie (only its hash is kept). */
export async function openSignIn(db: Db, accountId: string, now: number): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.insert(signIns).values({
    tokenHash: hashToken(token),
    accountId,
    expiresAt: new Date(now + SIGN_IN_DAYS * DAY_MS),
  });
  return token;
}

/** The account a cookie's token belongs to, if the sign-in hasn't run out. */
export async function accountForToken(
  db: Db,
  token: string,
  now: number,
): Promise<AccountRow | undefined> {
  const [row] = await db
    .select({ account: accounts })
    .from(signIns)
    .innerJoin(accounts, eq(accounts.id, signIns.accountId))
    .where(and(eq(signIns.tokenHash, hashToken(token)), gt(signIns.expiresAt, new Date(now))))
    .limit(1);
  return row?.account;
}

export async function closeSignIn(db: Db, token: string): Promise<void> {
  await db.delete(signIns).where(eq(signIns.tokenHash, hashToken(token)));
}

export async function schoolByCode(
  db: Db,
  code: string,
): Promise<typeof schools.$inferSelect | undefined> {
  const [row] = await db.select().from(schools).where(eq(schools.code, code)).limit(1);
  return row;
}

export async function setUp(
  db: Db,
  accountId: string,
  setup: { name: string; role: Role; schoolId: string },
  now: number,
): Promise<void> {
  await db
    .update(accounts)
    .set({ ...setup, setUpAt: new Date(now) })
    .where(eq(accounts.id, accountId));
}

export async function addSchool(
  db: Db,
  name: string,
  random: (n: number) => number,
): Promise<string> {
  return unusedCode(
    SCHOOL_CODE_LENGTH,
    async (candidate) => {
      const [row] = await db
        .insert(schools)
        .values({ code: candidate, name })
        .onConflictDoNothing({ target: schools.code })
        .returning({ code: schools.code });
      return row !== undefined;
    },
    random,
  );
}

/**
 * For DEV_SIGN_IN (localhost only): the dev school, its teacher, and a group for every course
 * with the join code `devJoinCode(course)`, so a dev learner can join them all without anyone
 * making a group. Safe to run on every start.
 */
export async function ensureDevClass(db: Db, courseIds: readonly string[]): Promise<void> {
  await db
    .insert(schools)
    .values({ code: DEV_SCHOOL_CODE, name: "Dev School" })
    .onConflictDoNothing({ target: schools.code });
  const school = await schoolByCode(db, DEV_SCHOOL_CODE);
  if (school === undefined) throw new Error("The dev school wasn't saved");
  const teacher = await upsertGoogleAccount(db, {
    sub: "dev-dev-teacher",
    email: "dev-teacher@dev.local",
    name: "Dev Teacher",
    picture: null,
  });
  if (teacher.role === null)
    await setUp(
      db,
      teacher.id,
      { name: "Dev Teacher", role: Role.Teacher, schoolId: school.id },
      0,
    );
  for (const courseId of courseIds)
    await db
      .insert(groups)
      .values({ teacherId: teacher.id, courseId, joinCode: devJoinCode(courseId) })
      .onConflictDoNothing({ target: groups.joinCode });
}

// ---- what someone sees ----

export async function me(db: Db, row: AccountRow): Promise<MeReply> {
  const school =
    row.schoolId === null
      ? null
      : ((
          await db.select({ name: schools.name }).from(schools).where(eq(schools.id, row.schoolId))
        )[0] ?? null);
  const account: Account = {
    id: row.id,
    name: row.name,
    email: row.email,
    picture: row.picture,
    role: isRole(row.role) ? row.role : null,
    school,
  };
  return {
    account,
    teaching: row.role === Role.Teacher ? await teacherGroups(db, row.id) : [],
    joined: row.role === Role.Learner ? await joinedGroups(db, row.id) : [],
  };
}

const groupColumns = {
  id: groups.id,
  courseId: groups.courseId,
  joinCode: groups.joinCode,
  createdAt: groups.createdAt,
  learnerCount:
    sql<number>`count(${members.learnerId}) filter (where ${members.removedAt} is null)`.mapWith(
      Number,
    ),
};

const toTeacherGroup = (row: {
  id: string;
  courseId: string;
  joinCode: string;
  createdAt: Date;
  learnerCount: number;
}): TeacherGroup => ({ ...row, createdAt: row.createdAt.getTime() });

export async function teacherGroups(db: Db, teacherId: string): Promise<TeacherGroup[]> {
  const rows = await db
    .select(groupColumns)
    .from(groups)
    .leftJoin(members, eq(members.groupId, groups.id))
    .where(eq(groups.teacherId, teacherId))
    .groupBy(groups.id)
    .orderBy(desc(groups.createdAt));
  return rows.map(toTeacherGroup);
}

/** One of this teacher's groups; undefined if it isn't theirs (or doesn't exist). */
export async function teacherGroup(
  db: Db,
  teacherId: string,
  groupId: string,
): Promise<TeacherGroup | undefined> {
  const [row] = await db
    .select(groupColumns)
    .from(groups)
    .leftJoin(members, eq(members.groupId, groups.id))
    .where(and(eq(groups.teacherId, teacherId), eq(groups.id, groupId)))
    .groupBy(groups.id);
  return row === undefined ? undefined : toTeacherGroup(row);
}

export async function joinedGroups(db: Db, learnerId: string): Promise<JoinedGroup[]> {
  const rows = await db
    .select({
      id: groups.id,
      courseId: groups.courseId,
      teacherName: accounts.name,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .innerJoin(groups, eq(groups.id, members.groupId))
    .innerJoin(accounts, eq(accounts.id, groups.teacherId))
    .where(and(eq(members.learnerId, learnerId), isNull(members.removedAt)))
    .orderBy(desc(members.joinedAt));
  return rows.map((row) => ({ ...row, joinedAt: row.joinedAt.getTime() }));
}

/** The learners in a group now, with when each was last active. */
export async function groupLearners(db: Db, groupId: string): Promise<GroupLearner[]> {
  const rows = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      picture: accounts.picture,
      joinedAt: members.joinedAt,
      lastActiveAt: max(events.producedAt),
    })
    .from(members)
    .innerJoin(accounts, eq(accounts.id, members.learnerId))
    .leftJoin(events, eq(events.accountId, accounts.id))
    .where(and(eq(members.groupId, groupId), isNull(members.removedAt)))
    .groupBy(accounts.id, members.joinedAt)
    .orderBy(accounts.name);
  const progress = await progressOfEach(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({
    ...row,
    joinedAt: row.joinedAt.getTime(),
    lastActiveAt: row.lastActiveAt === null ? null : new Date(row.lastActiveAt).getTime(),
    progress: progress.get(row.id) ?? {},
  }));
}

// ---- groups ----

/** Tries codes until `tryCode` takes one (a clash with an existing code is vanishingly rare). */
async function unusedCode(
  length: number,
  tryCode: (code: string) => Promise<boolean>,
  random: (n: number) => number,
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = makeCode(length, random);
    if (await tryCode(code)) return code;
  }
  throw new Error("Couldn't find an unused code in 8 tries");
}

export async function newGroup(
  db: Db,
  teacherId: string,
  courseId: string,
  random: (n: number) => number,
): Promise<string> {
  let id = "";
  await unusedCode(
    JOIN_CODE_LENGTH,
    async (joinCode) => {
      const [row] = await db
        .insert(groups)
        .values({ teacherId, courseId, joinCode })
        .onConflictDoNothing({ target: groups.joinCode })
        .returning({ id: groups.id });
      if (row !== undefined) id = row.id;
      return row !== undefined;
    },
    random,
  );
  return id;
}

/** A new join code for the group; the old one stops working. */
export async function newJoinCode(
  db: Db,
  groupId: string,
  random: (n: number) => number,
): Promise<void> {
  await unusedCode(
    JOIN_CODE_LENGTH,
    async (joinCode) => {
      const clash = await db
        .select({ id: groups.id })
        .from(groups)
        .where(eq(groups.joinCode, joinCode))
        .limit(1);
      if (clash.length > 0) return false;
      await db.update(groups).set({ joinCode }).where(eq(groups.id, groupId));
      return true;
    },
    random,
  );
}

export async function groupByJoinCode(
  db: Db,
  joinCode: string,
): Promise<typeof groups.$inferSelect | undefined> {
  const [row] = await db.select().from(groups).where(eq(groups.joinCode, joinCode)).limit(1);
  return row;
}

/** Puts the learner in the group; joining again after being removed puts them back. */
export async function join(db: Db, groupId: string, learnerId: string, now: number): Promise<void> {
  await db
    .insert(members)
    .values({ groupId, learnerId, joinedAt: new Date(now) })
    .onConflictDoUpdate({
      target: [members.groupId, members.learnerId],
      set: {
        removedAt: null,
        joinedAt: sql`case when ${members.removedAt} is null then ${members.joinedAt} else excluded.joined_at end`,
      },
    });
}

export async function removeLearner(db: Db, groupId: string, learnerId: string, now: number) {
  await db
    .update(members)
    .set({ removedAt: new Date(now) })
    .where(
      and(
        eq(members.groupId, groupId),
        eq(members.learnerId, learnerId),
        isNull(members.removedAt),
      ),
    );
}

// ---- events ----

/** Stores the events; one already stored (sent again after a lost reply) is skipped. */
export async function saveEvents(
  db: Db,
  accountId: string,
  batch: readonly ChalkEvent[],
): Promise<number> {
  if (batch.length === 0) return 0;
  const saved = await db
    .insert(events)
    .values(
      batch.map((event) => ({
        accountId,
        id: event.envelope.id,
        sessionId: event.envelope.sessionId,
        seq: event.envelope.seq,
        producedAt: new Date(event.envelope.producedAt),
        actor: event.envelope.actor,
        machineType: event.machine.type,
        machineId: String(event.machine.id),
        lessonId: event.envelope.lessonId,
        body: event,
      })),
    )
    .onConflictDoNothing({ target: [events.accountId, events.id] })
    .returning({ id: events.id });
  return saved.length;
}

/** Each learner's progress, from their events in concept and practice lessons. */
export async function progressOfEach(
  db: Db,
  accountIds: readonly string[],
): Promise<Map<string, Progress>> {
  if (accountIds.length === 0) return new Map();
  const rows = await db
    .select({ accountId: events.accountId, body: events.body })
    .from(events)
    .where(
      and(
        inArray(events.accountId, [...accountIds]),
        or(
          like(events.lessonId, `${conceptLessonId("")}%`),
          like(events.lessonId, `${practiceLessonId("")}%`),
        ),
      ),
    );
  const byAccount = new Map<string, ChalkEvent[]>(accountIds.map((id) => [id, []]));
  for (const row of rows) byAccount.get(row.accountId)?.push(row.body);
  return new Map([...byAccount].map(([id, list]) => [id, progressFrom(list)]));
}

export async function progressOf(db: Db, accountId: string): Promise<Progress> {
  return (await progressOfEach(db, [accountId])).get(accountId) ?? {};
}

/** Keeps a flagged chat with Jugnu; returns its id. */
export async function saveJugnuFlag(
  db: Db,
  accountId: string,
  flag: { note: string; lessonId: string | null; body: unknown },
): Promise<string> {
  const [row] = await db
    .insert(jugnuFlags)
    .values({ accountId, note: flag.note, lessonId: flag.lessonId, body: flag.body })
    .returning({ id: jugnuFlags.id });
  if (row === undefined) throw new Error("jugnu_flags: the insert returned nothing");
  return row.id;
}

/** Flagged chats, newest first: who, when, the note. */
export async function jugnuFlagList(
  db: Db,
  limit: number,
): Promise<{ id: string; createdAt: Date; name: string; note: string; lessonId: string | null }[]> {
  return db
    .select({
      id: jugnuFlags.id,
      createdAt: jugnuFlags.createdAt,
      name: accounts.name,
      note: jugnuFlags.note,
      lessonId: jugnuFlags.lessonId,
    })
    .from(jugnuFlags)
    .innerJoin(accounts, eq(accounts.id, jugnuFlags.accountId))
    .orderBy(desc(jugnuFlags.createdAt))
    .limit(limit);
}

/** One flagged chat, whole; undefined if there is none with that id. */
export async function jugnuFlag(db: Db, id: string): Promise<unknown> {
  const [row] = await db
    .select({ body: jugnuFlags.body })
    .from(jugnuFlags)
    .where(eq(jugnuFlags.id, id));
  return row?.body;
}
