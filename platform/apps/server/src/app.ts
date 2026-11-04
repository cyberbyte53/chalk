import { randomInt } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join as joinPath } from "node:path";
import {
  ApiErrorCode,
  ApiPath,
  type EventsReply,
  type JugnuTurnReply,
  type JugnuTurnRequest,
  Role,
  eventsRequestSchema,
  isJoinCode,
  isSchoolCode,
  joinRequestSchema,
  jugnuTurnRequestSchema,
  newGroupRequestSchema,
  normalizeCode,
  setupRequestSchema,
  signInGoogleRequestSchema,
} from "@chalk/api";
import { type Board, type ChalkEvent, type ItemRef, builtFile, eventSchema } from "@chalk/content";
import type { ConceptPlan } from "@chalk/learning";
import { serveStatic } from "@hono/node-server/serve-static";
import { sql } from "drizzle-orm";
import { type Context, Hono, type MiddlewareHandler } from "hono";
import { bodyLimit } from "hono/body-limit";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { z } from "zod";
import type { Db } from "./db";
import { ApiFailure } from "./failure";
import type { GoogleVerifier } from "./google";
import { learnerView } from "./learner-view";
import { saveNote } from "./notes";
import { type RateLimit, rateLimit } from "./rate-limit";
import {
  type AccountRow,
  SIGN_IN_DAYS,
  accountForToken,
  closeSignIn,
  groupByJoinCode,
  groupLearners,
  join,
  joinedGroups,
  me,
  newGroup,
  newJoinCode,
  openSignIn,
  progressOf,
  removeLearner,
  saveEvents,
  schoolByCode,
  setUp,
  teacherGroup,
  teacherGroups,
  upsertGoogleAccount,
} from "./store";

export const SIGN_IN_COOKIE = "chalk_sign_in";
/** A conversation with Jugnu this long without a message has ended. */
export const JUGNU_QUIET_MS = 15 * 60 * 1000;
export type AppDeps = {
  db: Db;
  verifyGoogle: GoogleVerifier;
  /** Where the app is served from; requests that change things must come from it. */
  origin: string;
  /**
   * Development (DEV_SIGN_IN): also take requests from the app on this computer's Wi-Fi address,
   * same port, so a phone on the same network can try it.
   */
  isLanAllowed?: boolean;
  /** The commit the server and its content were built from (build/index.json), for /api/health. */
  commit?: string;
  /** What the author decided about each concept (its pages, its first practice): progress reads it. */
  plans?: readonly ConceptPlan[];
  /** The book ids in the built content: what a group may be for. */
  courseIds: ReadonlySet<string>;
  /** The built learner app to serve; unset in development. */
  staticDir?: string;
  /** The built content (build/), served under /content/ for the app to fetch a chapter at a time. */
  contentDir?: string;
  now?: () => number;
  random?: (n: number) => number;
  /** Where the server's log lines go; unset: the console (one JSON object per line for records). */
  log?: ServerLog;
  /**
   * The committed Jugnu (the studio's live.ts); unset, he isn't on this server. `turn` is one turn
   * (its error "still answering": the session's last turn hasn't ended); `end` ends a conversation
   * and gives its note for the teacher (none if he never answered).
   */
  jugnu?: {
    turn: (turn: JugnuTurnRequest) => Promise<JugnuTurnReply>;
    end: (session: string) => Promise<string | undefined>;
  };
};

/** The server's log: records, refusals and failures. */
export type ServerLog = {
  record: (record: Record<string, unknown>) => void;
  warn: (message: string) => void;
  error: (message: string, error?: unknown) => void;
};

const consoleLog: ServerLog = {
  record: (record) => console.log(JSON.stringify(record)),
  warn: (message) => console.warn(message),
  error: (message, error) => console.error(message, error ?? ""),
};

type Env = { Variables: { account: AccountRow } };

const parse = <S extends z.ZodTypeAny>(schema: S, value: unknown): z.infer<S> => {
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw new ApiFailure(
      400,
      ApiErrorCode.BadRequest,
      parsed.error.issues[0]?.message ?? "bad request",
    );
  return parsed.data;
};

const readJson = async (c: Context): Promise<unknown> => {
  try {
    return await c.req.json();
  } catch {
    throw new ApiFailure(400, ApiErrorCode.BadRequest, "the body isn't JSON");
  }
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A path's id; anything that isn't one can't be a group or a learner, so it's not found. */
const idParam = (c: Context, name: string): string => {
  const value = c.req.param(name);
  if (value === undefined || !UUID.test(value))
    throw new ApiFailure(404, ApiErrorCode.NotFound, `no ${name} ${value ?? ""}`);
  return value;
};

const PRIVATE_IPV4 = /^(10\.\d+|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d+\.\d+$/;

/** `origin` is plain http on a private network address (192.168.x, 10.x, 172.16–31.x), on `app`'s port. */
export function isLanOrigin(origin: string, app: string): boolean {
  try {
    const page = new URL(origin);
    return (
      page.protocol === "http:" &&
      PRIVATE_IPV4.test(page.hostname) &&
      page.port === new URL(app).port
    );
  } catch {
    return false;
  }
}

/** The types of a chapter's clips. */
const AUDIO_TYPES: Readonly<Record<string, string>> = {
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

/** Where the built content is served (the app fetches `/content/<path in build/>?v=<version>`). */
export const CONTENT_ROUTE = "/content/";

/** The Hono app: every /api route, and the built app when `staticDir` is set. */
export function createApp(deps: AppDeps): Hono<Env> {
  const { db } = deps;
  const now = deps.now ?? Date.now;
  const log = deps.log ?? consoleLog;
  const random = deps.random ?? ((n: number) => randomInt(n));
  const isSecure = deps.origin.startsWith("https:");
  const app = new Hono<Env>();

  app.onError((error, c) => {
    if (error instanceof ApiFailure) return c.json(error.body, error.status);
    log.error("request failed:", error);
    return c.json({ error: ApiErrorCode.BadRequest, message: "the server failed" }, 500);
  });

  // Anything that changes something must come from the app's own page. (The cookie is also
  // SameSite=Lax and there is no CORS, so a JSON request from another site can't carry it.)
  app.use("*", async (c, next) => {
    const origin = c.req.header("origin");
    const isApp =
      origin === deps.origin ||
      (deps.isLanAllowed === true && origin !== undefined && isLanOrigin(origin, deps.origin));
    if (c.req.method !== "GET" && c.req.method !== "HEAD" && !isApp)
      throw new ApiFailure(403, ApiErrorCode.BadRequest, "requests must come from the app");
    await next();
  });

  const signedIn: MiddlewareHandler<Env> = async (c, next) => {
    const token = getCookie(c, SIGN_IN_COOKIE);
    const account = token === undefined ? undefined : await accountForToken(db, token, now());
    if (account === undefined)
      throw new ApiFailure(401, ApiErrorCode.NotSignedIn, "sign in with Google first");
    c.set("account", account);
    await next();
  };
  const as =
    (role: Role): MiddlewareHandler<Env> =>
    async (c, next) => {
      const { role: actual } = c.get("account");
      if (actual === null) throw new ApiFailure(403, ApiErrorCode.NotSetUp, "finish setup first");
      if (actual !== role)
        throw new ApiFailure(403, ApiErrorCode.WrongRole, `only a ${role} can do this`);
      await next();
    };
  const isSetUp: MiddlewareHandler<Env> = async (c, next) => {
    if (c.get("account").role === null)
      throw new ApiFailure(403, ApiErrorCode.NotSetUp, "finish setup first");
    await next();
  };

  // ---- signing in ----

  app.post(ApiPath.SignInGoogle, async (c) => {
    const { credential } = parse(signInGoogleRequestSchema, await readJson(c));
    const profile = await deps.verifyGoogle(credential);
    if (profile === undefined)
      throw new ApiFailure(401, ApiErrorCode.BadGoogleToken, "Google didn't confirm this sign-in");
    const account = await upsertGoogleAccount(db, profile);
    const token = await openSignIn(db, account.id, now());
    setCookie(c, SIGN_IN_COOKIE, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "Lax",
      path: "/",
      maxAge: SIGN_IN_DAYS * 24 * 60 * 60,
    });
    return c.json(await me(db, account));
  });

  app.post(ApiPath.SignOut, async (c) => {
    const token = getCookie(c, SIGN_IN_COOKIE);
    if (token !== undefined) await closeSignIn(db, token);
    deleteCookie(c, SIGN_IN_COOKIE, { path: "/" });
    return c.body(null, 204);
  });

  app.get(ApiPath.Me, signedIn, async (c) => c.json(await me(db, c.get("account"))));

  app.post(ApiPath.Setup, signedIn, async (c) => {
    const account = c.get("account");
    if (account.role !== null)
      throw new ApiFailure(409, ApiErrorCode.AlreadySetUp, "setup is done already");
    const { name, role, schoolCode } = parse(setupRequestSchema, await readJson(c));
    const code = normalizeCode(schoolCode);
    const school = isSchoolCode(code) ? await schoolByCode(db, code) : undefined;
    if (school === undefined)
      throw new ApiFailure(422, ApiErrorCode.UnknownSchool, `no school has the code ${code}`);
    await setUp(db, account.id, { name, role, schoolId: school.id }, now());
    return c.json(await me(db, { ...account, name, role, schoolId: school.id }));
  });

  // ---- learners ----

  app.post(ApiPath.Join, signedIn, as(Role.Learner), async (c) => {
    const code = normalizeCode(parse(joinRequestSchema, await readJson(c)).code);
    const group = isJoinCode(code) ? await groupByJoinCode(db, code) : undefined;
    if (group === undefined)
      throw new ApiFailure(422, ApiErrorCode.UnknownJoinCode, `no group has the code ${code}`);
    const learner = c.get("account");
    await join(db, group.id, learner.id, now());
    const joined = (await joinedGroups(db, learner.id)).find((g) => g.id === group.id);
    return c.json(joined);
  });

  app.post(
    ApiPath.Events,
    bodyLimit({ maxSize: 2 * 1024 * 1024 }),
    signedIn,
    isSetUp,
    async (c) => {
      const { events } = parse(eventsRequestSchema, await readJson(c));
      const good: ChalkEvent[] = [];
      const rejected: string[] = [];
      events.forEach((raw, i) => {
        const parsed = eventSchema.safeParse(raw);
        if (parsed.success) good.push(parsed.data);
        else {
          const id = (raw as { id?: unknown } | null)?.id;
          rejected.push(typeof id === "string" ? id : `#${i}`);
          log.warn(`event refused: ${parsed.error.issues[0]?.message}`);
        }
      });
      const reply: EventsReply = {
        saved: await saveEvents(db, c.get("account").id, good),
        rejected,
      };
      return c.json(reply);
    },
  );

  app.get(ApiPath.Progress, signedIn, as(Role.Learner), async (c) =>
    c.json(await progressOf(db, c.get("account").id, deps.plans ?? [])),
  );

  // ---- teachers ----

  app.get(ApiPath.Groups, signedIn, as(Role.Teacher), async (c) =>
    c.json(await teacherGroups(db, c.get("account").id)),
  );

  app.post(ApiPath.Groups, signedIn, as(Role.Teacher), async (c) => {
    const { courseId } = parse(newGroupRequestSchema, await readJson(c));
    if (!deps.courseIds.has(courseId))
      throw new ApiFailure(422, ApiErrorCode.UnknownCourse, `no course ${courseId}`);
    const teacher = c.get("account");
    const id = await newGroup(db, teacher.id, courseId, random);
    return c.json(await teacherGroup(db, teacher.id, id), 201);
  });

  /** The group, if it's this teacher's; any other is simply not found. */
  const ownGroup = async (c: Context<Env>) => {
    const group = await teacherGroup(db, c.get("account").id, idParam(c, "groupId"));
    if (group === undefined) throw new ApiFailure(404, ApiErrorCode.NotFound, "no such group");
    return group;
  };

  app.get(`${ApiPath.Groups}/:groupId`, signedIn, as(Role.Teacher), async (c) => {
    const group = await ownGroup(c);
    return c.json({ group, learners: await groupLearners(db, group.id, deps.plans ?? []) });
  });

  app.get(
    `${ApiPath.Groups}/:groupId/learners/:learnerId`,
    signedIn,
    as(Role.Teacher),
    async (c) => {
      const group = await ownGroup(c);
      const view = await learnerView(db, group.id, idParam(c, "learnerId"), deps.plans ?? []);
      if (view === undefined)
        throw new ApiFailure(404, ApiErrorCode.NotFound, "no such learner here");
      return c.json(view);
    },
  );

  app.post(`${ApiPath.Groups}/:groupId/code`, signedIn, as(Role.Teacher), async (c) => {
    const group = await ownGroup(c);
    await newJoinCode(db, group.id, random);
    return c.json(await teacherGroup(db, c.get("account").id, group.id));
  });

  app.delete(
    `${ApiPath.Groups}/:groupId/learners/:learnerId`,
    signedIn,
    as(Role.Teacher),
    async (c) => {
      const group = await ownGroup(c);
      await removeLearner(db, group.id, idParam(c, "learnerId"), now());
      return c.body(null, 204);
    },
  );

  // Jugnu: one turn, for a signed-in person, at most 60 an hour each (each costs a model call).
  const jugnuLimit = rateLimit(60, 60 * 60 * 1000);
  // His conversations going on, by session: each ends when he hands back, or after a quiet
  // while (children just leave); then its note is written, once, from the whole of it, and kept
  // here for the teacher. It never goes to the phone.
  const talking = new Map<string, { accountId: string; board: string; at: number }>();
  const endTalk = async (key: string) => {
    const talk = talking.get(key);
    talking.delete(key);
    if (talk === undefined || deps.jugnu === undefined) return;
    try {
      const text = await deps.jugnu.end(key);
      if (text === undefined) return;
      const built = JSON.parse(
        await readFile(joinPath(deps.contentDir ?? "", builtFile(talk.board)), "utf8"),
      ) as { version?: string };
      await saveNote(db, { ...talk, version: built.version ?? "", at: now(), text });
    } catch (error) {
      log.error("Jugnu's note failed", error);
    }
  };
  /** Ends the conversations quiet for `JUGNU_QUIET_MS` (15 minutes); the server calls it each minute. */
  const endQuietTalks = async () => {
    for (const [key, talk] of talking) if (now() - talk.at > JUGNU_QUIET_MS) await endTalk(key);
  };
  if (deps.jugnu !== undefined) setInterval(() => void endQuietTalks(), 60_000).unref();
  app.post(ApiPath.JugnuTurn, bodyLimit({ maxSize: 512 * 1024 }), signedIn, isSetUp, async (c) => {
    if (deps.jugnu === undefined)
      throw new ApiFailure(503, ApiErrorCode.Unavailable, "Jugnu isn't on this server");
    const turn = parse(jugnuTurnRequestSchema, await readJson(c));
    const account = c.get("account").id;
    // Only a built board (its path is a file under the content).
    const isBoard =
      deps.contentDir !== undefined &&
      !turn.board.includes("..") &&
      existsSync(joinPath(deps.contentDir, builtFile(turn.board)));
    if (!isBoard) throw new ApiFailure(400, ApiErrorCode.BadRequest, "no such board");
    if (!jugnuLimit.take(account, now()))
      throw new ApiFailure(429, ApiErrorCode.TooMany, "Jugnu needs a rest: try again later");
    void endQuietTalks();
    try {
      // One account's sessions are its own.
      const key = `${account}:${turn.session}`;
      const reply = await deps.jugnu.turn({ ...turn, session: key });
      talking.set(key, { accountId: account, board: turn.board, at: now() });
      // Handed back: the conversation is over; its note is written (after this reply).
      if (reply.isHandBack) void endTalk(key);
      return c.json(reply);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Jugnu is still answering"))
        throw new ApiFailure(409, ApiErrorCode.Busy, error.message);
      throw error;
    }
  });

  app.get(ApiPath.Health, async (c) => {
    await db.execute(sql`select 1`);
    return c.json({ ok: true, commit: deps.commit ?? "unknown" });
  });

  app.all("/api/*", () => {
    throw new ApiFailure(404, ApiErrorCode.NotFound, "no such route");
  });

  // ---- the content: build/, one chapter's files at a time as the app opens it ----

  const { contentDir } = deps;
  if (contentDir !== undefined) {
    // The app asks for each file with its version (?v=…): that exact file never changes, so keep
    // it a year. Without a version, check each time.
    app.use(`${CONTENT_ROUTE}*`, async (c, next) => {
      await next();
      if (c.res.status !== 200 && c.res.status !== 206) return;
      // A chapter's clips: audio (its type isn't one the static server knows), named by what they
      // hold, so they never change; its sound list is the one that does.
      const isClip = /\/sound\/[^/]+\.(m4a|mp3|wav)$/.test(c.req.path);
      if (isClip) c.header("content-type", AUDIO_TYPES[c.req.path.split(".").pop() ?? ""]);
      c.header(
        "cache-control",
        c.req.query("v") === undefined && !isClip
          ? "no-cache"
          : "public, max-age=31536000, immutable",
      );
    });
    app.use(
      `${CONTENT_ROUTE}*`,
      serveStatic({
        root: contentDir,
        rewriteRequestPath: (path) => path.slice(CONTENT_ROUTE.length - 1),
      }),
    );
    app.all(`${CONTENT_ROUTE}*`, () => {
      throw new ApiFailure(404, ApiErrorCode.NotFound, "no such content");
    });
  }

  // ---- the app itself ----

  const { staticDir } = deps;
  if (staticDir !== undefined) {
    // Files with a hash in their name never change: keep them a year. Everything else (the page,
    // the service worker, the manifest) is checked each time, so a new version reaches phones.
    app.use("/*", async (c, next) => {
      await next();
      if (c.req.path.endsWith(".webmanifest"))
        c.header("content-type", "application/manifest+json");
      if (c.res.headers.has("cache-control")) return;
      c.header(
        "cache-control",
        c.req.path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
      );
    });
    app.use("/*", serveStatic({ root: staticDir }));
    // Any other page is the app's own route (/join/K7PQ3M, …): hand it the app.
    app.get("*", async (c) => c.html(await readFile(joinPath(staticDir, "index.html"), "utf8")));
  }

  return app;
}
