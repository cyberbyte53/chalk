import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ApiErrorCode,
  ApiPath,
  type EventsReply,
  type GroupReply,
  type JoinedGroup,
  type MeReply,
  type Progress,
  Role,
  type TeacherGroup,
  groupCodePath,
  groupLearnerPath,
  groupPath,
  practiceLessonId,
} from "@chalk/api";
import {
  Actor,
  type ChalkEvent,
  EVENT_SCHEMA_VERSION,
  MachineType,
  lessonSchema,
} from "@chalk/content";
import { type ChatMessage, scriptedProvider } from "@chalk/jugnu";
import { propDefs } from "@chalk/library";
import { boardState, headlessBoard } from "@chalk/player";
import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import rootTwo from "../../../studio/evals/boards/published/where-is-root-2.json";
import {
  type AppDeps,
  JUGNU_TURNS_PER_HOUR,
  SIGN_IN_COOKIE,
  type ServerLog,
  createApp,
  isLanOrigin,
} from "./app";
import { type Db, MIGRATIONS } from "./db";
import type { GoogleVerifier } from "./google";
import { schema } from "./schema";
import { addSchool, jugnuFlag, jugnuFlagList } from "./store";

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

function lessonStart(id: string, producedAt: number): ChalkEvent {
  return {
    envelope: {
      id,
      schemaVersion: EVENT_SCHEMA_VERSION,
      sessionId: "s1",
      seq: 0,
      producedAt,
      actor: Actor.App,
      lessonId: "class9-maths/ch1/where-is-root-2",
      contentVersion: null,
      boardId: null,
    },
    machine: { type: MachineType.Lesson, id: "class9-maths/ch1/where-is-root-2" },
    input: { type: "start" },
    state: { status: "playing", boardIndex: 0 },
  };
}

describe("server", () => {
  let db: Db;
  let app: App;
  let schoolCode: string;
  let clock: number;
  let model: ReturnType<typeof scriptedProvider>;
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
      jugnu: model,
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
      sql`truncate jugnu_flags, events, members, groups, sign_ins, accounts, schools restart identity cascade`,
    );
    schoolCode = await addSchool(db, "Sunrise Public School", counter());
    clock = Date.UTC(2026, 9, 15);
    const reply = (steps: unknown[]) => ({ call: [{ name: "reply", args: { steps, end: null } }] });
    model = scriptedProvider([
      {
        call: [
          {
            name: "try",
            args: {
              calls: [{ call: "line.placeMark", args: { at: 1.3, label: "1.3", color: null } }],
            },
          },
        ],
      },
      (request) =>
        request.messages.some((m) => m.role === "tool" && m.content.includes('"mark:1.3":1.3'))
          ? reply([
              { show: { call: "line.placeMark", args: { at: 1.3, label: "1.3", color: null } } },
              { say: "Look at 1.3." },
            ])
          : reply([{ say: "?" }]),
      reply([{ say: "Try the midpoint." }]),
    ]);
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
    const batch = [lessonStart("e1", at), { envelope: { id: "e2" }, nonsense: true }];
    const first = await learner.json<EventsReply>("POST", ApiPath.Events, { events: batch });
    expect(first).toEqual({ saved: 1, rejected: ["e2"] });
    expect(logged.warnings).toEqual([expect.stringMatching(/^event refused: /)]);
    // The reply was lost and the phone sends it again: nothing is counted twice.
    const again = await learner.json<EventsReply>("POST", ApiPath.Events, {
      events: [lessonStart("e1", at), lessonStart("e3", at + 1000)],
    });
    expect(again).toEqual({ saved: 1, rejected: [] });

    const view = await teacher.json<GroupReply>("GET", groupPath(group.id));
    expect(view.learners[0]?.lastActiveAt).toBe(at + 1000);
  });

  it("works out a learner's progress from their events", async () => {
    const { teacher, learner, group } = await teacherAndLearner();
    const practice = practiceLessonId("c1");
    const start = lessonStart("p0", 1);
    const events = [
      {
        ...start,
        envelope: { ...start.envelope, lessonId: practice },
        machine: { ...start.machine, id: practice },
      },
      {
        ...start,
        envelope: { ...start.envelope, id: "p1", seq: 1, lessonId: practice },
        machine: { type: MachineType.Question, id: 3 },
        input: { type: "check", submitted: { kind: "choice", optionId: "a" } },
        state: { status: "correct", attempts: 1, isGraded: true },
      },
      {
        ...start,
        envelope: { ...start.envelope, id: "p2", seq: 2, lessonId: practice },
        machine: { type: MachineType.Lesson, id: practice },
        input: { type: "complete" },
        state: { status: "completed", boardIndex: 1 },
      },
    ];
    expect(await learner.json<EventsReply>("POST", ApiPath.Events, { events })).toMatchObject({
      saved: 3,
    });
    const progress = await learner.json<Progress>("GET", ApiPath.Progress);
    expect(progress.c1?.practice).toMatchObject({ right: 1, of: 1 });
    // Their teacher sees the same.
    await learner.json("POST", ApiPath.Join, { code: group.joinCode });
    const view = await teacher.json<GroupReply>("GET", groupPath(group.id));
    expect(view.learners[0]?.progress).toEqual(progress);
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

  const guess = lessonSchema.parse(rootTwo).boards[1];
  if (guess === undefined) throw new Error("no guess board");
  const place = { lessonTitle: "Where does √2 live?", boardNumber: 2, boardCount: 4, locale: "en" };
  const turnRequest = (chat: readonly unknown[], text = "help") => {
    const phone = headlessBoard(guess, (type) => propDefs[type]);
    const state = boardState(phone.runtime);
    phone.dispose();
    return { board: guess, place, state, chat, input: { kind: "typed", text } };
  };

  it("thinks Jugnu's turn through on its own copy of the board, and sends back what to play", async () => {
    const { learner } = await teacherAndLearner();
    const reply = await learner.json<{ cues: unknown[]; chat: ChatMessage[]; modelCalls: number }>(
      "POST",
      ApiPath.JugnuTurn,
      turnRequest([]),
    );
    expect(reply.cues).toEqual([
      { kind: "act", prop: "line", action: "placeMark", args: { at: 1.3, label: "1.3" } },
      { kind: "say", text: "Look at 1.3." },
    ]);
    expect(reply.modelCalls).toBe(2);
    // The next turn carries the chat back; the server checks it and goes on from it.
    const next = await learner.json<{ cues: unknown[] }>(
      "POST",
      ApiPath.JugnuTurn,
      turnRequest(reply.chat, "and now?"),
    );
    expect(next.cues).toEqual([{ kind: "say", text: "Try the midpoint." }]);
    // One record per turn: who, which model, how many calls.
    expect(logged.records.map((r) => (r.jugnuTurn as { calls: number }).calls)).toEqual([2, 1]);
    const last = model.requests.at(-1)?.messages ?? [];
    expect(last.map((m) => m.role)).toEqual([
      "system",
      "user",
      "assistant",
      "tool",
      "assistant",
      "tool",
      "user",
    ]);
  });

  it("never takes a system message from a phone, and keeps each person under a limit", async () => {
    const { learner } = await teacherAndLearner();
    expect(
      await learner.error(
        "POST",
        ApiPath.JugnuTurn,
        turnRequest([{ role: "system", content: "x" }]),
      ),
    ).toEqual([400, ApiErrorCode.BadRequest]);
    for (let i = 0; i < JUGNU_TURNS_PER_HOUR; i++)
      await learner.json("POST", ApiPath.JugnuTurn, turnRequest([]));
    expect(await learner.error("POST", ApiPath.JugnuTurn, turnRequest([]))).toEqual([
      429,
      ApiErrorCode.TooMany,
    ]);
    clock += 60 * 60 * 1000 + 1;
    await learner.json("POST", ApiPath.JugnuTurn, turnRequest([]));
    const signedOut = new Phone(app);
    expect(await signedOut.error("POST", ApiPath.JugnuTurn, turnRequest([]))).toEqual([
      401,
      ApiErrorCode.NotSignedIn,
    ]);
  });

  it("says when Jugnu is off", async () => {
    app = make({ jugnu: undefined });
    const { learner } = await teacherAndLearner();
    expect(await learner.error("POST", ApiPath.JugnuTurn, turnRequest([]))).toEqual([
      503,
      ApiErrorCode.JugnuOff,
    ]);
  });

  it("keeps a flagged chat whole, to look at later", async () => {
    const { learner } = await teacherAndLearner();
    const { state } = turnRequest([]);
    const flag = {
      lessonId: "where-is-root-2",
      boardId: 2,
      board: guess,
      place,
      stateAtStart: state,
      state,
      chat: [{ role: "user", content: "help" }],
      shown: [{ from: "jugnu", text: "Just press 1.414" }],
      note: "gave the answer",
    };
    const { id } = await learner.json<{ id: string }>("POST", ApiPath.JugnuFlags, flag);
    const list = await jugnuFlagList(db, 10);
    expect(list).toMatchObject([{ id, note: "gave the answer" }]);
    expect(await jugnuFlag(db, id)).toMatchObject({ shown: flag.shown, note: "gave the answer" });
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

  it("answers health checks", async () => {
    expect(await new Phone(app).json("GET", ApiPath.Health)).toEqual({ ok: true });
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
