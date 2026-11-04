import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ApiErrorCode,
  ApiPath,
  type EventsReply,
  type GroupReply,
  type JoinedGroup,
  type JugnuTurnAnswer,
  type LearnerReply,
  type MeReply,
  Role,
  type TeacherGroup,
  groupCodePath,
  groupLearnerPath,
  groupPath,
} from "@chalk/api";
import { Actor, type ChalkEvent, EVENT_SCHEMA_VERSION, Level } from "@chalk/content";
import { Band, type Progress } from "@chalk/learning";
import { type UpdateInput, realEvidence } from "@chalk/studio/jugnu-sets";
import { PGlite } from "@electric-sql/pglite";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { type AppDeps, SIGN_IN_COOKIE, type ServerLog, createApp, isLanOrigin } from "./app";
import { type Db, MIGRATIONS } from "./db";
import type { GoogleVerifier } from "./google";
import {
  ConversationEnd,
  GotThere,
  jugnuConversations,
  jugnuMessages,
  jugnuReflections,
  jugnuTurns,
  learnerUpdates,
  mastery,
  schema,
  texts,
} from "./schema";
import { addQuestionVersions, addSchool } from "./store";

const ORIGIN = "https://chalk.test";
const COURSE = "9835cb2687f1300a";

/** Google, faked: a credential "ok:<sub>:<name>" is good; anything else isn't. */
const fakeGoogle: GoogleVerifier = async (credential) => {
  const [ok, sub, name] = credential.split(":");
  if (ok !== "ok" || sub === undefined || name === undefined) return undefined;
  return { sub, email: `${sub}@example.com`, name, picture: null };
};

/** Counts up from 0 so codes are made in a known order. */
function counter(): (n: number) => number {
  let i = 0;
  return (n) => i++ % n;
}

async function testDb(): Promise<Db> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db;
}

type App = ReturnType<typeof createApp>;

/** One person's phone: keeps their cookie between requests, like a browser. */
class Phone {
  cookie: string | undefined;
  constructor(private readonly app: App) {}

  async send(method: string, path: string, body?: unknown, origin = ORIGIN): Promise<Response> {
    const headers: Record<string, string> = { origin };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (this.cookie !== undefined) headers.cookie = `${SIGN_IN_COOKIE}=${this.cookie}`;
    const response = await this.app.request(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = response.headers.get("set-cookie");
    const match = set === null ? null : new RegExp(`${SIGN_IN_COOKIE}=([^;]*)`).exec(set);
    if (match !== null) this.cookie = match[1] === "" ? undefined : match[1];
    return response;
  }

  async json<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await this.send(method, path, body);
    if (!response.ok)
      throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`);
    return (await response.json()) as T;
  }

  async error(method: string, path: string, body?: unknown): Promise<[number, string]> {
    const response = await this.send(method, path, body);
    const json = (await response.json()) as { error: string };
    return [response.status, json.error];
  }

  signIn(sub: string, name: string): Promise<MeReply> {
    return this.json("POST", ApiPath.SignInGoogle, { credential: `ok:${sub}:${name}` });
  }
}

/** One entry as a phone records it. */
function entry(id: string, at: number, more: Partial<ChalkEvent> = {}): ChalkEvent {
  return {
    id,
    schemaVersion: EVENT_SCHEMA_VERSION,
    session: "s1",
    seq: 0,
    at,
    commit: "abc",
    actor: Actor.App,
    opening: null,
    board: null,
    version: "v",
    node: "cccccccccccccccc",
    kind: "open",
    payload: {},
    ...more,
  } as ChalkEvent;
}

/** A set's entry (the lesson's, on no board). */
const setEntry = (id: string, seq: number, payload: Record<string, unknown>): ChalkEvent =>
  entry(id, 1000 + seq, {
    seq,
    actor: Actor.Lesson,
    opening: null,
    board: null,
    version: null,
    node: null,
    kind: "set",
    payload,
  } as Partial<ChalkEvent>);

/** A learner's signal on a board. */
const signalOn = (
  id: string,
  seq: number,
  board: string,
  name: string,
  payload: Record<string, unknown> = {},
): ChalkEvent =>
  entry(id, 1000 + seq, {
    seq,
    actor: Actor.Learner,
    opening: "o",
    board,
    node: name === "continued" ? null : "qqqqqqqqqqqqqqqq",
    kind: "signal",
    payload: { signal: name, payload, from: null },
  } as Partial<ChalkEvent>);

describe("server", () => {
  let db: Db;
  let app: App;
  let schoolCode: string;
  let clock: number;
  // What the server logged, kept for the tests to check instead of printed.
  let logged: { records: Record<string, unknown>[]; warnings: string[]; errors: string[] };
  const log: ServerLog = {
    record: (record) => logged.records.push(record),
    warn: (message) => logged.warnings.push(message),
    error: (message) => logged.errors.push(message),
  };

  const make = (extra: Partial<AppDeps> = {}) =>
    createApp({
      log,
      db,
      verifyGoogle: fakeGoogle,
      origin: ORIGIN,
      courseIds: new Set([COURSE]),
      plans: [{ id: "c1", pages: ["page1"], practice: ["ask1", "ask2"] }],
      now: () => clock,
      random: counter(),
      ...extra,
    });

  // One database for the file (migrating takes a second or two), emptied before each test.
  beforeAll(async () => {
    db = await testDb();
  });

  beforeEach(async () => {
    logged = { records: [], warnings: [], errors: [] };
    await db.execute(
      sql`truncate learner_updates, jugnu_reflections, jugnu_messages, jugnu_turns, jugnu_conversations, texts, mastery, attempts, question_versions, events, members, groups, sign_ins, accounts, schools restart identity cascade`,
    );
    schoolCode = await addSchool(db, "Sunrise Public School", counter());
    clock = Date.UTC(2026, 9, 15);
    app = make();
  });

  async function teacherAndLearner() {
    const teacher = new Phone(app);
    await teacher.signIn("t1", "Meera Rao");
    await teacher.json("POST", ApiPath.Setup, {
      name: "Meera Rao",
      schoolCode,
      role: Role.Teacher,
    });
    const learner = new Phone(app);
    await learner.signIn("l1", "Priya S");
    await learner.json("POST", ApiPath.Setup, { name: "Priya", schoolCode, role: Role.Learner });
    const group = await teacher.json<TeacherGroup>("POST", ApiPath.Groups, { courseId: COURSE });
    return { teacher, learner, group };
  }

  it("signs in with Google and stays signed in", async () => {
    const phone = new Phone(app);
    expect(await phone.error("GET", ApiPath.Me)).toEqual([401, ApiErrorCode.NotSignedIn]);
    expect(await phone.error("POST", ApiPath.SignInGoogle, { credential: "forged" })).toEqual([
      401,
      ApiErrorCode.BadGoogleToken,
    ]);

    const first = await phone.signIn("g1", "Priya Sharma");
    expect(first.account).toMatchObject({ name: "Priya Sharma", role: null, school: null });
    expect(phone.cookie).toBeDefined();
    expect((await phone.json<MeReply>("GET", ApiPath.Me)).account.id).toBe(first.account.id);

    // The same Google account on another phone is the same person.
    const other = new Phone(app);
    expect((await other.signIn("g1", "Priya Sharma")).account.id).toBe(first.account.id);

    await phone.send("POST", ApiPath.SignOut);
    expect(phone.cookie).toBeUndefined();
    expect(await phone.error("GET", ApiPath.Me)).toEqual([401, ApiErrorCode.NotSignedIn]);
    expect((await other.json<MeReply>("GET", ApiPath.Me)).account.id).toBe(first.account.id);
  });

  it("lets a sign-in run out", async () => {
    const phone = new Phone(app);
    await phone.signIn("g1", "Priya");
    clock += 91 * 24 * 60 * 60 * 1000;
    expect(await phone.error("GET", ApiPath.Me)).toEqual([401, ApiErrorCode.NotSignedIn]);
  });

  it("sets up once, with a real school code", async () => {
    const phone = new Phone(app);
    await phone.signIn("g1", "Priya Sharma");
    expect(
      await phone.error("POST", ApiPath.Setup, {
        name: "Priya",
        schoolCode: "ZZZZZZ",
        role: Role.Learner,
      }),
    ).toEqual([422, ApiErrorCode.UnknownSchool]);

    const set = await phone.json<MeReply>("POST", ApiPath.Setup, {
      name: " Priya ",
      schoolCode: schoolCode.toLowerCase(),
      role: Role.Learner,
    });
    expect(set.account).toMatchObject({
      name: "Priya",
      role: Role.Learner,
      school: { name: "Sunrise Public School" },
    });
    expect(
      await phone.error("POST", ApiPath.Setup, { name: "P", schoolCode, role: Role.Teacher }),
    ).toEqual([409, ApiErrorCode.AlreadySetUp]);

    // The name they chose stands even if their Google name changes.
    expect((await phone.signIn("g1", "Priya S. Sharma")).account.name).toBe("Priya");
  });

  it("runs a group: create, join by code, see learners, new code, remove", async () => {
    const { teacher, learner, group } = await teacherAndLearner();
    expect(group).toMatchObject({ courseId: COURSE, learnerCount: 0 });
    expect(group.joinCode).toMatch(/^[A-Z2-9]{6}$/);

    const joined = await learner.json<JoinedGroup>("POST", ApiPath.Join, {
      code: group.joinCode.toLowerCase(),
    });
    expect(joined).toMatchObject({ id: group.id, courseId: COURSE, teacherName: "Meera Rao" });
    // Joining twice is still one membership.
    await learner.json("POST", ApiPath.Join, { code: group.joinCode });

    const view = await teacher.json<GroupReply>("GET", groupPath(group.id));
    expect(view.group.learnerCount).toBe(1);
    expect(view.learners).toMatchObject([{ name: "Priya", lastActiveAt: null }]);
    expect((await teacher.json<MeReply>("GET", ApiPath.Me)).teaching).toHaveLength(1);
    expect((await learner.json<MeReply>("GET", ApiPath.Me)).joined).toHaveLength(1);

    const renewed = await teacher.json<TeacherGroup>("POST", groupCodePath(group.id));
    expect(renewed.joinCode).not.toBe(group.joinCode);
    const late = new Phone(app);
    await late.signIn("l2", "Arjun");
    await late.json("POST", ApiPath.Setup, { name: "Arjun", schoolCode, role: Role.Learner });
    expect(await late.error("POST", ApiPath.Join, { code: group.joinCode })).toEqual([
      422,
      ApiErrorCode.UnknownJoinCode,
    ]);

    const learnerId = view.learners[0]?.id ?? "";
    expect((await teacher.send("DELETE", groupLearnerPath(group.id, learnerId))).status).toBe(204);
    expect((await teacher.json<GroupReply>("GET", groupPath(group.id))).learners).toEqual([]);
    expect((await learner.json<MeReply>("GET", ApiPath.Me)).joined).toEqual([]);

    // With the new code they can come back.
    await learner.json("POST", ApiPath.Join, { code: renewed.joinCode });
    expect((await teacher.json<GroupReply>("GET", groupPath(group.id))).learners).toHaveLength(1);
  });

  it("keeps each role to its own routes and each teacher to their own groups", async () => {
    const { learner, group } = await teacherAndLearner();
    expect(await learner.error("POST", ApiPath.Groups, { courseId: COURSE })).toEqual([
      403,
      ApiErrorCode.WrongRole,
    ]);
    expect(await learner.error("GET", groupPath(group.id))).toEqual([403, ApiErrorCode.WrongRole]);

    const other = new Phone(app);
    await other.signIn("t2", "Ravi");
    expect(await other.error("POST", ApiPath.Groups, { courseId: COURSE })).toEqual([
      403,
      ApiErrorCode.NotSetUp,
    ]);
    await other.json("POST", ApiPath.Setup, { name: "Ravi", schoolCode, role: Role.Teacher });
    expect(await other.error("GET", groupPath(group.id))).toEqual([404, ApiErrorCode.NotFound]);
    expect(await other.error("GET", groupPath("not-a-uuid"))).toEqual([404, ApiErrorCode.NotFound]);
    expect(await other.error("POST", ApiPath.Groups, { courseId: "nope" })).toEqual([
      422,
      ApiErrorCode.UnknownCourse,
    ]);
    expect(await other.error("POST", ApiPath.Join, { code: group.joinCode })).toEqual([
      403,
      ApiErrorCode.WrongRole,
    ]);
  });

  it("stores events once each, and refuses only the ones it can't read", async () => {
    const { teacher, learner, group } = await teacherAndLearner();
    await learner.json("POST", ApiPath.Join, { code: group.joinCode });

    const at = Date.UTC(2026, 9, 15, 9, 30);
    const batch = [entry("e1", at), { id: "e2", nonsense: true }];
    const first = await learner.json<EventsReply>("POST", ApiPath.Events, { events: batch });
    expect(first).toEqual({ saved: 1, rejected: ["e2"] });
    expect(logged.warnings).toEqual([expect.stringMatching(/^event refused: /)]);
    // The reply was lost and the phone sends it again: nothing is counted twice.
    const again = await learner.json<EventsReply>("POST", ApiPath.Events, {
      events: [entry("e1", at), entry("e3", at + 1000, { seq: 1 })],
    });
    expect(again).toEqual({ saved: 1, rejected: [] });

    const view = await teacher.json<GroupReply>("GET", groupPath(group.id));
    expect(view.learners[0]?.lastActiveAt).toBe(at + 1000);
  });

  it("works out a learner's progress and mastery from their events", async () => {
    const { teacher, learner, group } = await teacherAndLearner();
    const asks = ["ask1", "ask2"].map((board) => ({
      board,
      version: "v",
      tests: ["c1"],
      level: Level.Medium,
    }));
    await addQuestionVersions(db, asks);
    // A build's versions are added once; adding them again changes nothing.
    await addQuestionVersions(
      db,
      asks.map((a) => ({ ...a, level: Level.Hard })),
    );
    const events = [
      signalOn("p0", 0, "page1", "continued"),
      signalOn("p1", 1, "ask1", "checked", { status: "wrong", isGraded: true, answer: null }),
      signalOn("p2", 2, "ask1", "checked", { status: "correct", isGraded: true, answer: null }),
      signalOn("p3", 3, "ask2", "checked", { status: "correct", isGraded: true, answer: null }),
    ];
    expect(await learner.json<EventsReply>("POST", ApiPath.Events, { events })).toMatchObject({
      saved: 4,
    });
    const progress = await learner.json<Progress>("GET", ApiPath.Progress);
    expect(progress.c1).toMatchObject({ isLearnt: true, practice: { right: 1, of: 2 } });
    // Their teacher sees the same.
    await learner.json("POST", ApiPath.Join, { code: group.joinCode });
    const view = await teacher.json<GroupReply>("GET", groupPath(group.id));
    expect(view.learners[0]?.progress).toEqual(progress);
    // Mastery changes only when a set finishes: none yet, mid-set.
    expect(view.learners[0]?.mastery).toEqual([]);
    await learner.json("POST", ApiPath.Events, {
      events: [
        setEntry("s0", 9, {
          what: "served",
          set: "set1",
          by: "lesson-practice",
          questions: [
            { board: "ask1", version: "v" },
            { board: "ask2", version: "v" },
          ],
        }),
        setEntry("s1", 10, { what: "finished", set: "set1" }),
      ],
    });
    await new Promise((r) => setTimeout(r, 100));
    const after = await teacher.json<GroupReply>("GET", groupPath(group.id));
    // Mastery: the first tries only (ask1 wrong, ask2 right), medium: Beta(2, 2).
    expect(after.learners[0]?.mastery).toEqual([
      expect.objectContaining({ concept: "c1", estimate: 0.5, tries: 2, band: Band.Unsure }),
    ]);
  });

  it("only takes changes from the app's own page", async () => {
    const phone = new Phone(app);
    const response = await phone.send(
      "POST",
      ApiPath.SignInGoogle,
      { credential: "ok:g1:P" },
      "https://evil.test",
    );
    expect(response.status).toBe(403);
  });

  it("serves the built app, its routes and long-lived assets", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-app-"));
    mkdirSync(join(dir, "assets"));
    writeFileSync(join(dir, "index.html"), "<!doctype html><title>Chalk</title>");
    writeFileSync(join(dir, "assets", "index-abc.js"), "console.log(1)");
    writeFileSync(join(dir, "manifest.webmanifest"), "{}");
    const served = make({ staticDir: dir });
    const page = await served.request("/join/K7PQ3M");
    expect(await page.text()).toContain("<title>Chalk</title>");
    expect(page.headers.get("cache-control")).toBe("no-cache");
    const asset = await served.request("/assets/index-abc.js");
    expect(asset.headers.get("cache-control")).toContain("immutable");
    const manifest = await served.request("/manifest.webmanifest");
    expect(manifest.headers.get("content-type")).toContain("application/manifest+json");
    expect((await served.request("/api/nope")).status).toBe(404);
  });

  it("serves built content by version, and nothing outside it", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-content-"));
    mkdirSync(join(dir, "book", "chapter"), { recursive: true });
    writeFileSync(join(dir, "book", "chapter", "page.json"), '{"kind":"page"}');
    const served = make({ contentDir: dir });
    const kept = await served.request("/content/book/chapter/page.json?v=abc123");
    expect(kept.status).toBe(200);
    expect(await kept.json()).toEqual({ kind: "page" });
    expect(kept.headers.get("cache-control")).toContain("immutable");
    const unversioned = await served.request("/content/book/chapter/page.json");
    expect(unversioned.headers.get("cache-control")).toBe("no-cache");
    expect((await served.request("/content/book/missing.json?v=1")).status).toBe(404);
    expect((await served.request("/content/../app.test.ts")).status).toBe(404);
    expect((await served.request("/content/%2e%2e/app.test.ts")).status).toBe(404);
  });

  it("serves a chapter's clips as audio, kept for good, and its sound list fresh", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-content-"));
    mkdirSync(join(dir, "book", "chapter", "sound"), { recursive: true });
    writeFileSync(join(dir, "book", "chapter", "sound", "ab12.m4a"), "clip");
    writeFileSync(join(dir, "book", "chapter", "sound", "sound.json"), "{}");
    const served = make({ contentDir: dir });
    const clip = await served.request("/content/book/chapter/sound/ab12.m4a");
    expect(clip.headers.get("content-type")).toBe("audio/mp4");
    expect(clip.headers.get("cache-control")).toContain("immutable");
    const list = await served.request("/content/book/chapter/sound/sound.json");
    expect(list.headers.get("cache-control")).toBe("no-cache");
  });

  it("keeps Jugnu's side of each conversation: found by its opening, appended, ended once", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-content-"));
    mkdirSync(join(dir, "book", "chapter"), { recursive: true });
    writeFileSync(
      join(dir, "book", "chapter", "ask.json"),
      '{"kind":"question","id":"b1","version":"v1"}',
    );
    const QUIET_MS = 5 * 60 * 1000;
    const given: (
      | { messages: unknown[]; cursor: unknown; prompt: { text: string } }
      | undefined
    )[] = [];
    const reflected: { messages: unknown[]; cursor: unknown }[] = [];
    const settled = () => new Promise((r) => setTimeout(r, 100));
    const served = make({
      contentDir: dir,
      commit: "c1",
      jugnu: {
        quietMs: QUIET_MS,
        judge: async () =>
          ({
            points: [],
            prompt: { seat: "update", name: "u", hash: "uh", text: "u" },
            model: "m/1",
            requests: [],
          }) as never,
        updatePromptHash: () => "uh",
        turn: async (turn, going) => {
          given.push(going);
          const added = [
            { role: "user", content: turn.said },
            { role: "assistant", content: `heard: ${turn.said}` },
          ];
          const messages = [...(going?.messages ?? []), ...added];
          return {
            reply: {
              says: `heard: ${turn.said}`,
              glow: null,
              choices: [],
              isHandBack: turn.said === "got it",
              model: "m/1",
            },
            conversation: {
              model: { provider: "m", id: "1" },
              prompt: { seat: "tutor", name: "p", hash: "h", text: "the prompt" },
              lesson: "the lesson",
              messages,
              cursor: { turns: messages.length / 2 },
            },
            added,
            requests: [{ ms: 1 }],
            ms: 5,
          } as never;
        },
        reflect: async (conversation) => {
          reflected.push(conversation);
          return {
            points: ["reads the first number as up"],
            gotThere: GotThere.Partly,
            prompt: { name: "r", hash: "rh", text: "the reflect prompt" },
            model: "m/1",
            added: [
              { role: "tool", content: "she has gone" },
              { role: "assistant", content: "ok" },
            ],
            requests: [{ ms: 2 }],
            ms: 3,
          } as never;
        },
      },
    });
    const turn = { session: "o1", board: "book/chapter/ask", state: {}, did: [], said: "why?" };
    expect(await new Phone(served).error("POST", ApiPath.JugnuTurn, turn)).toEqual([
      401,
      ApiErrorCode.NotSignedIn,
    ]);
    const learner = new Phone(served);
    await learner.signIn("l1", "Priya");
    await learner.json("POST", ApiPath.Setup, { name: "Priya", schoolCode, role: Role.Learner });
    for (const board of ["book/chapter/missing", "../secret", "book/../x"])
      expect(await learner.error("POST", ApiPath.JugnuTurn, { ...turn, board })).toEqual([
        400,
        ApiErrorCode.BadRequest,
      ]);

    // The first turn starts a conversation: kept with its place, what ran, its turn and messages.
    const first = await learner.json<JugnuTurnAnswer>("POST", ApiPath.JugnuTurn, turn);
    expect(first).toMatchObject({ says: "heard: why?" });
    expect(given[0]).toBeUndefined();
    const [kept] = await db.select().from(jugnuConversations);
    expect(kept).toMatchObject({
      id: first.conversation,
      opening: "o1",
      board: "b1",
      version: "v1",
      commit: "c1",
      provider: "m",
      model: "1",
      promptName: "p",
      promptHash: "h",
      endedAt: null,
    });
    expect((await db.select().from(texts)).map((t) => t.text).sort()).toEqual([
      "the lesson",
      "the prompt",
    ]);
    // The next turn at the same opening goes on with it: given back whole, appended to.
    const second = await learner.json<JugnuTurnAnswer>("POST", ApiPath.JugnuTurn, {
      ...turn,
      said: "and now?",
    });
    expect(second.conversation).toBe(first.conversation);
    expect(second.turn).not.toBe(first.turn);
    expect(given[1]?.messages).toHaveLength(2);
    expect(given[1]?.cursor).toEqual({ turns: 1 });
    expect(given[1]?.prompt.text).toBe("the prompt");
    const messages = await db.select().from(jugnuMessages);
    expect(messages.map((m) => m.n).sort()).toEqual([0, 1, 2, 3]);
    expect((await db.select().from(jugnuTurns)).map((t) => t.n).sort()).toEqual([0, 1]);

    // Handing back ends nothing: the child may go on, in the same conversation.
    const handedBack = await learner.json<JugnuTurnAnswer>("POST", ApiPath.JugnuTurn, {
      ...turn,
      said: "got it",
    });
    expect(handedBack.conversation).toBe(first.conversation);

    // Another child at the same opening id has their own.
    const other = new Phone(served);
    await other.signIn("l2", "Asha");
    await other.json("POST", ApiPath.Setup, { name: "Asha", schoolCode, role: Role.Learner });
    const theirs = await other.json<JugnuTurnAnswer>("POST", ApiPath.JugnuTurn, turn);
    expect(theirs.conversation).not.toBe(first.conversation);
    expect(given[3]).toBeUndefined();

    // Five quiet minutes after his last turn, it is over (checked on any turn, and each minute),
    // and he reflects on it, once, from where it ended (cursor and all); the reflection and its
    // turn are kept, and nothing goes on from it now.
    clock += QUIET_MS + 1;
    await learner.json("POST", ApiPath.JugnuTurn, { ...turn, session: "o2" });
    await settled();
    const [ended] = await db
      .select()
      .from(jugnuConversations)
      .where(eq(jugnuConversations.id, first.conversation));
    expect(ended).toMatchObject({ endedBy: ConversationEnd.Quiet, cursor: null });
    expect(reflected.find((k) => k.messages.length === 6)?.cursor).toEqual({ turns: 3 });
    const reflections = await db.select().from(jugnuReflections);
    expect(reflections.map((r) => r.conversationId).sort()).toEqual(
      [first.conversation, theirs.conversation].sort(),
    );
    expect(reflections.find((r) => r.conversationId === first.conversation)).toMatchObject({
      points: ["reads the first number as up"],
      gotThere: GotThere.Partly,
      promptName: "r",
      model: "m/1",
    });
    const turnsNow = await db
      .select()
      .from(jugnuTurns)
      .where(eq(jugnuTurns.conversationId, first.conversation));
    expect(turnsNow.map((t) => `${t.n}:${t.kind}`).sort()).toEqual([
      "0:reply",
      "1:reply",
      "2:reply",
      "3:reflect",
    ]);
    const record = await db
      .select()
      .from(jugnuMessages)
      .where(eq(jugnuMessages.conversationId, first.conversation));
    expect(record.map((m) => m.n).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    // The opening's next ask, after it was over, starts a new conversation.
    const after = await learner.json<JugnuTurnAnswer>("POST", ApiPath.JugnuTurn, turn);
    expect(after.conversation).not.toBe(first.conversation);

    // Without a model set up, he isn't there.
    const none = new Phone(make({ contentDir: dir }));
    await none.signIn("l1", "Priya");
    expect(await none.error("POST", ApiPath.JugnuTurn, turn)).toEqual([
      503,
      ApiErrorCode.Unavailable,
    ]);
  });

  it("updates a learner once a set finishes: its conversations reflected on, then judged", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-content-"));
    mkdirSync(join(dir, "book", "chapter"), { recursive: true });
    writeFileSync(
      join(dir, "book", "chapter", "ask.json"),
      '{"kind":"question","id":"b1","version":"v1","tests":["c1"],"level":"easy"}',
    );
    writeFileSync(join(dir, "ids.json"), '{"b1":"book/chapter/ask"}');
    await addQuestionVersions(db, [
      { board: "b1", version: "v1", tests: ["c1"], level: Level.Easy },
    ]);
    const judged: UpdateInput[] = [];
    let isJudgeDown = true;
    const served = make({
      contentDir: dir,
      jugnu: {
        quietMs: 5 * 60 * 1000,
        turn: async (turn) =>
          ({
            reply: { says: "a question", glow: null, choices: [], isHandBack: false, model: "m/1" },
            conversation: {
              model: { provider: "m", id: "1" },
              prompt: { seat: "tutor", name: "p", hash: "h", text: "the prompt" },
              lesson: "the lesson",
              messages: [{ role: "user", content: turn.said }],
              cursor: {},
            },
            added: [{ role: "user", content: turn.said }],
            requests: [],
            ms: 1,
          }) as never,
        reflect: async () =>
          ({
            points: ["swaps the numbers"],
            gotThere: GotThere.Partly,
            prompt: { name: "r", hash: "rh", text: "the reflect prompt" },
            model: "m/1",
            added: [],
            requests: [],
            ms: 1,
          }) as never,
        judge: async (input) => {
          if (isJudgeDown) throw new Error("model unreachable");
          judged.push(input);
          return {
            points: realEvidence(
              [{ text: "swaps x and y", questions: ["b1", "made-up"], reflections: ["made-up"] }],
              input,
            ),
            prompt: { seat: "update", name: "u", hash: "uh", text: "the update prompt" },
            model: "m/1",
            requests: [],
          } as never;
        },
        updatePromptHash: () => "uh",
      },
    });
    const learner = new Phone(served);
    await learner.signIn("l1", "Priya");
    await learner.json("POST", ApiPath.Setup, { name: "Priya", schoolCode, role: Role.Learner });
    const teacher = new Phone(served);
    await teacher.signIn("t1", "Meera Rao");
    await teacher.json("POST", ApiPath.Setup, { name: "Meera", schoolCode, role: Role.Teacher });
    const group = await teacher.json<TeacherGroup>("POST", ApiPath.Groups, { courseId: COURSE });
    await learner.json("POST", ApiPath.Join, { code: group.joinCode });
    // Before any set is finished, the teacher sees no update.
    const [before] = (await teacher.json<GroupReply>("GET", groupPath(group.id))).learners;
    expect(before?.latestUpdate).toBeNull();
    const learnerId = before?.id ?? "";
    expect(
      (await teacher.json<LearnerReply>("GET", groupLearnerPath(group.id, learnerId))).update,
    ).toBeNull();
    // The set is served; its board opens (naming it); they get it wrong and ask Jugnu.
    await learner.json("POST", ApiPath.Events, {
      events: [
        setEntry("e0", 0, {
          what: "served",
          set: "set1",
          by: "lesson-practice",
          questions: [{ board: "b1", version: "v1" }],
        }),
        entry("e1", 1001, {
          seq: 1,
          actor: Actor.Learner,
          opening: "o",
          board: "b1",
          version: "v1",
          node: null,
          kind: "open",
          payload: { set: "set1" },
        } as Partial<ChalkEvent>),
        {
          ...signalOn("e2", 2, "b1", "checked", {
            status: "wrong",
            isGraded: true,
            answer: { en: "(3, 2)", hi: "(3, 2)" },
          }),
          version: "v1",
        },
      ],
    });
    const talk = await learner.json<JugnuTurnAnswer>("POST", ApiPath.JugnuTurn, {
      session: "o",
      board: "book/chapter/ask",
      state: {},
      did: [],
      said: "why?",
    });
    // It finishes, while the conversation still goes on; the judgement fails the first time.
    const finish = (id: string) =>
      learner.json("POST", ApiPath.Events, {
        events: [setEntry(id, 3, { what: "finished", set: "set1" })],
      });
    await finish("e3");
    await new Promise((r) => setTimeout(r, 150));
    const [ended] = await db
      .select()
      .from(jugnuConversations)
      .where(eq(jugnuConversations.id, talk.conversation));
    expect(ended?.endedBy).toBe(ConversationEnd.SetFinished);
    expect(await db.select().from(jugnuReflections)).toHaveLength(1);
    expect(await db.select().from(learnerUpdates)).toEqual([]);
    // The numbers are kept even so (they don't wait on a model).
    expect((await db.select().from(mastery)).map((m) => m.concept)).toEqual(["c1"]);

    // Tried again (the sweep, or the set's finish arriving again), once, with what happened.
    isJudgeDown = false;
    await finish("e4");
    await finish("e4b");
    await new Promise((r) => setTimeout(r, 150));
    const updates = await db.select().from(learnerUpdates);
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({ set: "set1", promptName: "u", model: "m/1" });
    // Its evidence is only what it was given.
    expect(updates[0]?.points).toEqual([
      { text: "swaps x and y", questions: ["b1"], reflections: [] },
    ]);
    const input = judged[0];
    expect(input?.questions).toEqual([
      {
        board: "b1",
        name: "chapter/ask",
        concepts: [{ id: "c1", title: "c1" }],
        level: "easy",
        // Wrong before they asked him: not helped; what they answered, in the English they saw.
        tries: [{ isRight: false, chosen: "(3, 2)", helped: false, nth: 1 }],
      },
    ]);
    expect(input?.reflections).toEqual([
      expect.objectContaining({ board: "b1", points: ["swaps the numbers"], gotThere: "partly" }),
    ]);

    // Their teacher sees it: in the class, its first point; for the child, each point's evidence
    // as the teacher reads it, and his reflection on that set.
    const [inClass] = (await teacher.json<GroupReply>("GET", groupPath(group.id))).learners;
    expect(inClass?.latestUpdate).toEqual({ finishedAt: 1003, firstPoint: "swaps x and y" });
    const look = await teacher.json<LearnerReply>("GET", groupLearnerPath(group.id, learnerId));
    expect(look.update).toEqual({
      finishedAt: 1003,
      points: [
        {
          text: "swaps x and y",
          questions: [
            {
              board: "b1",
              name: "chapter/ask",
              concepts: ["c1"],
              level: "easy",
              tries: [{ isRight: false, chosen: { en: "(3, 2)", hi: "(3, 2)" }, helped: false }],
            },
          ],
          reflections: [],
        },
      ],
      reflections: [
        expect.objectContaining({
          board: "b1",
          name: "chapter/ask",
          gotThere: "partly",
          points: ["swaps the numbers"],
        }),
      ],
    });
    // Nothing of how it was made reaches the teacher.
    expect(JSON.stringify(look)).not.toMatch(/prompt|requests|the lesson|why\?/);

    // An older set judged again later is history, not their state.
    const [made] = await db.select().from(learnerUpdates);
    await db.insert(learnerUpdates).values({
      ...(made as typeof learnerUpdates.$inferSelect),
      id: undefined as never,
      set: "older",
      setFinishedAt: new Date(500),
      at: new Date(clock + 60_000),
      points: [{ text: "an old point", questions: [], reflections: [] }],
    });
    expect(
      (await teacher.json<GroupReply>("GET", groupPath(group.id))).learners[0]?.latestUpdate
        ?.firstPoint,
    ).toBe("swaps x and y");

    // Another teacher's, or a child no longer in the group, is not found.
    const other = new Phone(served);
    await other.signIn("t2", "Ravi");
    await other.json("POST", ApiPath.Setup, { name: "Ravi", schoolCode, role: Role.Teacher });
    expect(await other.error("GET", groupLearnerPath(group.id, learnerId))).toEqual([
      404,
      ApiErrorCode.NotFound,
    ]);
    await teacher.send("DELETE", groupLearnerPath(group.id, learnerId));
    expect(await teacher.error("GET", groupLearnerPath(group.id, learnerId))).toEqual([
      404,
      ApiErrorCode.NotFound,
    ]);
  });

  it("answers health checks", async () => {
    expect(await new Phone(app).json("GET", ApiPath.Health)).toEqual({
      ok: true,
      commit: "unknown",
    });
  });
});

describe("a phone on the same Wi-Fi (development)", () => {
  it("takes the app at a private address on the same port, and nothing else", () => {
    const app = "http://localhost:5173";
    expect(isLanOrigin("http://192.168.1.5:5173", app)).toBe(true);
    expect(isLanOrigin("http://10.0.0.7:5173", app)).toBe(true);
    expect(isLanOrigin("http://172.20.3.4:5173", app)).toBe(true);
    expect(isLanOrigin("http://192.168.1.5:8000", app)).toBe(false);
    expect(isLanOrigin("http://172.32.3.4:5173", app)).toBe(false);
    expect(isLanOrigin("http://8.8.8.8:5173", app)).toBe(false);
    expect(isLanOrigin("https://192.168.1.5:5173", app)).toBe(false);
    expect(isLanOrigin("http://evil.example:5173", app)).toBe(false);
    expect(isLanOrigin("not a url", app)).toBe(false);
  });
});
