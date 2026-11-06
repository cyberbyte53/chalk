import { createHash, randomBytes } from "node:crypto";
import {
  type Account,
  DEV_SCHOOL_CODE,
  type GroupLearner,
  JOIN_CODE_LENGTH,
  type JoinedGroup,
  type MeReply,
  Role,
  SCHOOL_CODE_LENGTH,
  type TeacherGroup,
  devJoinCode,
  makeCode,
} from "@chalk/api";
import { Actor, type ChalkEvent, localizedSchema } from "@chalk/content";
import {
  type Attempt,
  type ConceptPlan,
  type Mastery,
  MasteryModel,
  type Progress,
  type QuestionVersion,
  attemptsFrom,
  catalogueOf,
  masteryFrom,
  progressFrom,
} from "@chalk/learning";
import { and, desc, eq, gt, inArray, isNull, max, min, sql } from "drizzle-orm";
import type { Db } from "./db";
import type { GoogleProfile } from "./google";
import {
  events,
  accounts,
  attempts,
  groups,
  learnerUpdates,
  mastery,
  members,
  questionVersions,
  schools,
  signIns,
} from "./schema";

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
export async function groupLearners(
  db: Db,
  groupId: string,
  plans: readonly ConceptPlan[],
): Promise<GroupLearner[]> {
  const rows = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      picture: accounts.picture,
      joinedAt: members.joinedAt,
      lastActiveAt: max(events.at),
    })
    .from(members)
    .innerJoin(accounts, eq(accounts.id, members.learnerId))
    .leftJoin(events, eq(events.accountId, accounts.id))
    .where(and(eq(members.groupId, groupId), isNull(members.removedAt)))
    .groupBy(accounts.id, members.joinedAt)
    .orderBy(accounts.name);
  const ids = rows.map((row) => row.id);
  const progress = await progressOfEach(db, ids, plans);
  const masteries = await masteryOfEach(db, ids);
  const latest = await latestUpdateOfEach(db, ids);
  return rows.map((row) => ({
    ...row,
    joinedAt: row.joinedAt.getTime(),
    lastActiveAt: row.lastActiveAt === null ? null : new Date(row.lastActiveAt).getTime(),
    progress: progress.get(row.id) ?? {},
    mastery: masteries.get(row.id) ?? [],
    latestUpdate: latest.get(row.id) ?? null,
  }));
}

/**
 * Each learner's latest update (their last finished set's, then the last judged): when that set
 * finished, and its first point. One query for them all.
 */
async function latestUpdateOfEach(
  db: Db,
  accountIds: readonly string[],
): Promise<Map<string, { finishedAt: number; firstPoint: string | null }>> {
  if (accountIds.length === 0) return new Map();
  const rows = await db
    .selectDistinctOn([learnerUpdates.accountId], {
      accountId: learnerUpdates.accountId,
      finishedAt: learnerUpdates.setFinishedAt,
      points: learnerUpdates.points,
    })
    .from(learnerUpdates)
    .where(inArray(learnerUpdates.accountId, [...accountIds]))
    .orderBy(learnerUpdates.accountId, desc(learnerUpdates.setFinishedAt), desc(learnerUpdates.at));
  return new Map(
    rows.map((r) => [
      r.accountId,
      { finishedAt: r.finishedAt.getTime(), firstPoint: r.points[0]?.text ?? null },
    ]),
  );
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

/**
 * Stores the entries; one already stored (sent again after a lost reply) is skipped. If any was
 * new, the learner's attempts and mastery are worked out again from their whole record.
 */
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
        id: event.id,
        schemaVersion: event.schemaVersion,
        session: event.session,
        seq: event.seq,
        at: new Date(event.at),
        commit: event.commit,
        actor: event.actor,
        opening: event.opening,
        board: event.board,
        version: event.version,
        node: event.node,
        kind: event.kind,
        payload: event.payload,
      })),
    )
    .onConflictDoNothing({ target: [events.accountId, events.id] })
    .returning({ id: events.id });
  if (saved.length > 0) await workOut(db, accountId);
  return saved.length;
}

/** Adds the build's question versions to the catalogue; one already there is left as it is. */
export async function addQuestionVersions(
  db: Db,
  versions: readonly QuestionVersion[],
): Promise<void> {
  for (let i = 0; i < versions.length; i += 500)
    await db
      .insert(questionVersions)
      .values(versions.slice(i, i + 500).map((v) => ({ ...v, tests: [...v.tests] })))
      .onConflictDoNothing();
}

/** An attempt as its row holds it: what they answered (words in both languages) as JSON text. */
const rowOf = (a: Attempt, accountId: string): typeof attempts.$inferInsert => ({
  ...a,
  accountId,
  at: new Date(a.at),
  chosen: a.chosen === null ? null : JSON.stringify(a.chosen),
});

/** An attempt from its row. */
export const attemptOf = ({ accountId: _, ...row }: typeof attempts.$inferSelect): Attempt => ({
  ...row,
  at: row.at.getTime(),
  chosen: row.chosen === null ? null : localizedSchema.parse(JSON.parse(row.chosen)),
});

/** One learner's attempts and mastery, worked out again from their record, replacing the old. */
async function workOut(db: Db, accountId: string): Promise<Attempt[]> {
  const record = (await db.select().from(events).where(eq(events.accountId, accountId))).map(
    eventOf,
  );
  const boards = [...new Set(record.flatMap((e) => (e.board === null ? [] : [e.board])))];
  const versions =
    boards.length === 0
      ? []
      : await db.select().from(questionVersions).where(inArray(questionVersions.board, boards));
  const tries = attemptsFrom(record, catalogueOf(versions));
  await db.transaction(async (tx) => {
    await tx.delete(attempts).where(eq(attempts.accountId, accountId));
    for (let i = 0; i < tries.length; i += 500)
      await tx.insert(attempts).values(tries.slice(i, i + 500).map((a) => rowOf(a, accountId)));
  });
  return tries;
}

/**
 * Mastery as of a learner's last finished set (the numbers change only when a set finishes:
 * teacher-view.md, step 3); none before their first.
 */
function masteryAsOfLastSet(record: readonly ChalkEvent[], tries: readonly Attempt[]) {
  const finished = record.filter(
    (e) => e.kind === "set" && (e.payload as { what?: string }).what === "finished",
  );
  if (finished.length === 0) return [];
  const upTo = Math.max(...finished.map((e) => e.at));
  return masteryFrom(tries.filter((a) => a.at <= upTo));
}

/** A stored entry as the phone sent it. */
function eventOf(row: typeof events.$inferSelect): ChalkEvent {
  const { accountId: _, receivedAt: __, ...entry } = row;
  return { ...entry, at: row.at.getTime() } as unknown as ChalkEvent;
}

/**
 * Works out every learner's attempts again, and their mastery as of their last finished set
 * (after the code that does it changed).
 */
export async function workOutAll(db: Db): Promise<void> {
  const ids = await db.selectDistinct({ id: events.accountId }).from(events);
  for (const { id } of ids) {
    const tries = await workOut(db, id);
    const record = (await db.select().from(events).where(eq(events.accountId, id))).map(eventOf);
    const rows = masteryAsOfLastSet(record, tries);
    await db.transaction(async (tx) => {
      await tx.delete(mastery).where(eq(mastery.accountId, id));
      if (rows.length > 0)
        await tx
          .insert(mastery)
          .values(rows.map((m) => ({ ...m, accountId: id, lastAt: new Date(m.lastAt) })));
    });
  }
}

/** Each learner's progress: their passes and attempts, rolled up through the course tree. */
export async function progressOfEach(
  db: Db,
  accountIds: readonly string[],
  plans: readonly ConceptPlan[],
): Promise<Map<string, Progress>> {
  if (accountIds.length === 0) return new Map();
  const ids = [...accountIds];
  const passRows = await db
    .select({ accountId: events.accountId, board: events.board, at: min(events.at) })
    .from(events)
    .where(
      and(
        inArray(events.accountId, ids),
        eq(events.kind, "signal"),
        eq(events.actor, Actor.Learner),
        isNull(events.node),
        sql`${events.payload}->>'signal' = 'continued'`,
      ),
    )
    .groupBy(events.accountId, events.board);
  const tryRows = await db.select().from(attempts).where(inArray(attempts.accountId, ids));
  return new Map(
    ids.map((id) => {
      const passes = new Map(
        passRows.flatMap((r) =>
          r.accountId === id && r.board !== null && r.at !== null
            ? [[r.board, new Date(r.at).getTime()] as const]
            : [],
        ),
      );
      const tries = tryRows.filter((r) => r.accountId === id).map(attemptOf);
      return [id, progressFrom(passes, tries, plans)];
    }),
  );
}

export async function progressOf(
  db: Db,
  accountId: string,
  plans: readonly ConceptPlan[],
): Promise<Progress> {
  return (await progressOfEach(db, [accountId], plans)).get(accountId) ?? {};
}

/** Each learner's mastery rows, by the current model. */
export async function masteryOfEach(
  db: Db,
  accountIds: readonly string[],
): Promise<Map<string, Mastery[]>> {
  if (accountIds.length === 0) return new Map();
  const rows = await db
    .select()
    .from(mastery)
    .where(and(inArray(mastery.accountId, [...accountIds]), eq(mastery.model, MasteryModel.Beta1)));
  const byAccount = new Map<string, Mastery[]>(accountIds.map((id) => [id, []]));
  for (const { accountId, ...m } of rows)
    byAccount.get(accountId)?.push({ ...m, lastAt: m.lastAt.getTime() });
  return byAccount;
}
