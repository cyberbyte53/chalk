import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { parse, stringify } from "yaml";
import { z } from "zod";
import { changesFromGit, reachIndex, rollUp } from "./reach";

/**
 * Comments and reviews (platform/docs/comments.md).
 *
 * A **thread** is one thing said about a board, a piece or a prop, and everything written on it
 * since: its messages. A thread's **home** is what it is about: a chapter (content/<book>/<chapter>)
 * or a prop package (library/props/<package>). Threads are about the work, not part of it, so they
 * are kept under authoring/, one file per home: authoring/books/<book>/<chapter>/comments.yaml, or
 * authoring/props/<package>/comments.yaml. A **review** is one participant's sitting handed to
 * another: authoring/reviews/<id>.yaml lists its threads.
 * Reviews point to threads; threads know nothing of reviews.
 *
 * Everyone who writes is a participant with a role (the person, a fixer agent, a reviewer agent).
 * Anyone starts a thread. Each thread says whose turn it is (`turn`): every write sets it, from what
 * the write does (`turnAfter`), or as the writer says (a reviewer's taste question is the person's).
 * Every view reads that one field; nothing works it out again. Only the person closes. Every write goes through `applyChange`, which checks it against two tables: the
 * status moves each role may make, and what else each role may do. The caller never picks its own
 * role: the person writes through the preview, an agent through the chalk MCP with its role fixed
 * when it connects.
 */

export const COMMENTS_FILE = "comments.yaml";
export const REVIEWS_DIR = "authoring/reviews";

export const Status = {
  Open: "open",
  Planned: "planned",
  Ready: "ready",
  Closed: "closed",
  Withdrawn: "withdrawn",
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const Role = {
  Person: "person",
  Fixer: "fixer",
  Reviewer: "reviewer",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** Who is writing. The person is "you"; an agent is named after its role unless it says otherwise. */
export type Who = { name: string; role: Role };
export const YOU: Who = { name: "you", role: Role.Person };

// ---- What each role may do ----

/** A status move: to `to`, from any of `from` (all when absent), on threads it started only if `own`. */
type Move = { to: Status; from?: readonly Status[]; own?: boolean };

/** The status moves each role may make. A message with no move is open to everyone. */
export const MOVES: Readonly<Record<Role, readonly Move[]>> = {
  [Role.Person]: [{ to: Status.Open }, { to: Status.Closed }, { to: Status.Withdrawn }],
  // An agent takes back a thread of its own that became moot (a question settled in chat).
  [Role.Fixer]: [
    { to: Status.Planned, from: [Status.Open, Status.Planned] },
    { to: Status.Ready, from: [Status.Planned] },
    { to: Status.Withdrawn, from: [Status.Open, Status.Planned], own: true },
  ],
  [Role.Reviewer]: [{ to: Status.Withdrawn, from: [Status.Open], own: true }],
};

/**
 * What else each role may do: deleting its own, and re-pointing a thread whose place is gone
 * (merged, renamed), saying where it went. Everyone starts threads and hands over.
 */
export const ACTS: Readonly<Record<Role, { deletesOwn: boolean; moves: boolean }>> = {
  [Role.Person]: { deletesOwn: true, moves: true },
  [Role.Fixer]: { deletesOwn: false, moves: true },
  [Role.Reviewer]: { deletesOwn: false, moves: false },
};

// ---- The shapes ----

const roleSchema = z.nativeEnum(Role);

export const messageSchema = z
  .object({
    by: z.string().min(1),
    role: roleSchema,
    at: z.string(),
    text: z.string(),
    /** The status the thread moved to with this message; absent when it didn't move. */
    status: z.nativeEnum(Status).optional(),
  })
  .strict();
export type Message = z.infer<typeof messageSchema>;

export const threadSchema = z
  .object({
    id: z.string().min(1),
    status: z.nativeEnum(Status),
    by: z.string().min(1),
    role: roleSchema,
    createdAt: z.string(),
    /** The board, by its path; absent for a thread on a plan. */
    board: z.string().optional(),
    /** What on the board, by address: "machine", "machine/put", "shadow/circle/point". */
    target: z.string().optional(),
    /** For a thread about a prop wherever it is used: its type. */
    prop: z.string().optional(),
    /** The line the target was written at (content/…:42). */
    source: z.string().optional(),
    /** What the target said when the thread was started, so it can be found if lines move. */
    snapshot: z.string().optional(),
    commit: z.string().optional(),
    /** Whose turn it is while it is open, planned or ready; absent once closed or withdrawn. */
    turn: z.enum(["person", "agent"]).optional(),
    /** Where it came from when not the preview: "chat" for feedback given in an agent's chat. */
    from: z.string().optional(),
    /** For a thread on a plan: the words picked. */
    quote: z.string().optional(),
    text: z.string(),
    /** Files changed for it, recorded from git when it became ready. */
    changed: z.array(z.string()).optional(),
    /**
     * What those changes reach (platform/studio/src/reach), worked out when it became ready: how many
     * pieces and boards, and the lessons they are in; `everything` says why when it is every board.
     */
    reaches: z
      .object({
        pieces: z.number(),
        boards: z.number(),
        lessons: z.array(z.string()),
        everything: z.string().optional(),
      })
      .strict()
      .optional(),
    messages: z.array(messageSchema).default([]),
  })
  .strict();
export type Thread = z.infer<typeof threadSchema>;
export type Turn = NonNullable<Thread["turn"]>;

/** A thread and where it is filed: "content/<book>/<chapter>" or "library/props/<package>". */
export type Filed = Thread & { home: string };

export const reviewSchema = z
  .object({
    id: z.string().min(1),
    by: z.string().min(1),
    role: roleSchema,
    at: z.string(),
    /** Later handovers that added to it while it wasn't done, oldest first. */
    added: z.array(z.string()).optional(),
    /** Its threads, in the order they were written: the comments file each is in, and its id. */
    threads: z.array(z.object({ file: z.string(), id: z.string() }).strict()).min(1),
  })
  .strict();
export type Review = z.infer<typeof reviewSchema>;

// ---- Where a thread lives ----

/**
 * Each prop type's package, from library/catalogue.md (generated from the prop definitions and
 * kept current by `pnpm check`). Read from the file rather than imported, so the dev server's
 * config can use this without loading every prop.
 */
export function propHomes(root: string): Map<string, string> {
  const out = new Map<string, string>();
  const file = join(root, "library", "catalogue.md");
  if (!existsSync(file)) return out;
  // Each prop's page opens with its address: `library/props/<package>/<type>`.
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = /^`library\/props\/([^/`]+)\/([^`]+)`/.exec(line);
    if (m?.[1] && m[2]) out.set(m[2], `library/props/${m[1]}`);
  }
  return out;
}

/** Where a thread is filed: its prop's package, else its board's (or source's) chapter. */
export function homeOf(
  root: string,
  c: Pick<Thread, "prop" | "board" | "source">,
): string | undefined {
  if (c.prop !== undefined) return propHomes(root).get(c.prop);
  for (const value of [c.board, c.source]) {
    if (value === undefined) continue;
    const [book, chapter] = value.replace(/^content\/|^authoring\/books\//, "").split("/");
    if (book && chapter) return `content/${book}/${chapter}`;
  }
  return undefined;
}

const dirsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "node_modules")
        .map((d) => d.name)
    : [];

/**
 * Every home a thread can be about: each chapter and prop package there is, and any that still has
 * threads kept under authoring/ (its folder since removed: its threads are still read).
 */
function homes(root: string): string[] {
  const kept = [
    ...dirsIn(join(root, "authoring", "books")).flatMap((book) =>
      dirsIn(join(root, "authoring", "books", book)).map((chapter) => `content/${book}/${chapter}`),
    ),
    ...dirsIn(join(root, "authoring", "props")).map((name) => `library/props/${name}`),
  ];
  return [
    ...new Set([
      ...dirsIn(join(root, "content")).flatMap((book) =>
        dirsIn(join(root, "content", book)).map((chapter) => `content/${book}/${chapter}`),
      ),
      ...dirsIn(join(root, "library", "props")).map((name) => `library/props/${name}`),
      ...kept,
    ]),
  ];
}

/**
 * A home's comments file, relative to the repo (what a review lists): content/<book>/<chapter> is
 * kept in authoring/books/<book>/<chapter>, library/props/<package> in authoring/props/<package>.
 */
export function fileOf(home: string): string {
  if (home.startsWith("content/"))
    return `authoring/books/${home.slice("content/".length)}/${COMMENTS_FILE}`;
  if (home.startsWith("library/props/"))
    return `authoring/props/${home.slice("library/props/".length)}/${COMMENTS_FILE}`;
  throw new Error(`no home ${home}: threads are about a chapter or a prop package`);
}

// ---- Reading ----

export type Read = { threads: Filed[]; reviews: Review[]; problems: string[] };

const issues = (e: z.ZodError) =>
  e.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ");

function readYaml(file: string, label: string, problems: string[]): unknown {
  try {
    return parse(readFileSync(file, "utf8")) ?? [];
  } catch (e) {
    problems.push(`${label}: not readable YAML (${String(e).split("\n")[0]})`);
    return undefined;
  }
}

/**
 * Every thread (oldest first) and every review (oldest first), and everything a file holds that
 * doesn't fit: never skipped silently.
 */
export function readComments(root: string): Read {
  const threads: Filed[] = [];
  const problems: string[] = [];
  for (const home of homes(root)) {
    const file = join(root, fileOf(home));
    if (!existsSync(file)) continue;
    const raw = readYaml(file, fileOf(home), problems);
    if (raw === undefined) continue;
    if (!Array.isArray(raw)) {
      problems.push(`${fileOf(home)}: should be a list of threads`);
      continue;
    }
    for (const [i, entry] of raw.entries()) {
      const checked = threadSchema.safeParse(withTurn(entry));
      if (checked.success) threads.push({ ...checked.data, home });
      else problems.push(`${fileOf(home)} #${i + 1}: ${issues(checked.error)}`);
    }
  }
  threads.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const reviews: Review[] = [];
  const dir = join(root, REVIEWS_DIR);
  if (existsSync(dir))
    for (const name of readdirSync(dir).filter((n) => n.endsWith(".yaml"))) {
      const label = `${REVIEWS_DIR}/${name}`;
      const raw = readYaml(join(dir, name), label, problems);
      if (raw === undefined) continue;
      const checked = reviewSchema.safeParse(raw);
      if (!checked.success) {
        problems.push(`${label}: ${issues(checked.error)}`);
        continue;
      }
      if (`${checked.data.id}.yaml` !== name)
        problems.push(`${label}: its id is ${checked.data.id}`);
      for (const t of checked.data.threads)
        if (!threads.some((x) => x.id === t.id && fileOf(x.home) === t.file))
          problems.push(`${label}: no thread ${t.id} in ${t.file}`);
      reviews.push(checked.data);
    }
  reviews.sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
  return { threads, reviews, problems };
}

/** A review's threads, in its order, as they are now. */
export function threadsOf(review: Review, threads: readonly Filed[]): Filed[] {
  return review.threads.flatMap((t) => threads.find((x) => x.id === t.id) ?? []);
}

/** The most recent review, if any. */
export const latestReview = (reviews: readonly Review[]): Review | undefined => reviews.at(-1);

/** Whose turn it is on a thread: as it says, and no one's once closed or withdrawn. */
export function waitsOn(t: Thread): Turn | undefined {
  if (t.status === Status.Closed || t.status === Status.Withdrawn) return undefined;
  return t.turn;
}

/**
 * Whose turn it is after a write, from what the write does. The person's words are the agent's to
 * answer; a plan is the agent's to carry out; ready, or an agent's question or reason, is the
 * person's; a reviewer's words are the fixer's to answer. Closed and withdrawn: no one's.
 */
export function turnAfter(role: Role, to: Status | undefined): Turn | undefined {
  if (to === Status.Closed || to === Status.Withdrawn) return undefined;
  if (to === Status.Ready) return "person";
  if (to === Status.Planned) return "agent";
  return role === Role.Fixer ? "person" : "agent";
}

/**
 * A thread written before threads kept their turn: its turn, worked out once from how it stands
 * (who spoke last), and `about` (a regression, the agent's) dropped.
 */
function withTurn(entry: unknown): unknown {
  if (typeof entry !== "object" || entry === null) return entry;
  const { about, ...t } = entry as Record<string, unknown> & {
    status?: Status;
    role?: Role;
    messages?: { role?: Role; status?: Status }[];
  };
  if ("turn" in t || t.status === Status.Closed || t.status === Status.Withdrawn) return t;
  const last = t.messages?.at(-1)?.role ?? t.role ?? Role.Person;
  const turn =
    about !== undefined && t.status === Status.Open
      ? "agent"
      : turnAfter(last, t.status === Status.Open ? undefined : t.status);
  return turn === undefined ? t : { ...t, turn };
}

/** Threads still waiting on the agent. */
export const isUnanswered = (t: Thread): boolean => waitsOn(t) === "agent";

/** How a review stands, worked out from its threads: "3 ready, 1 open", and whether it's done. */
export function standing(threads: readonly Thread[]): { text: string; isDone: boolean } {
  const counts = new Map<Status, number>();
  for (const t of threads) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
  const order = [Status.Open, Status.Planned, Status.Ready, Status.Closed, Status.Withdrawn];
  const text = order
    .filter((s) => counts.has(s))
    .map((s) => `${counts.get(s)} ${s}`)
    .join(", ");
  return { text, isDone: threads.every((t) => waitsOn(t) === undefined) };
}

/** The last message that moved the thread to `status`: its plan (planned), its answer (ready). */
export const lastMove = (t: Thread, status: Status): Message | undefined =>
  [...t.messages].reverse().find((m) => m.status === status);

// ---- The sitting ----

/** When a review was last handed over: its first handover, or the last that added to it. */
export const handedOverAt = (r: Review): string => r.added?.at(-1) ?? r.at;

/** When `name` last handed over (an ISO time), or "" if never. */
function lastHandover(reviews: readonly Review[], name: string): string {
  return reviews
    .filter((r) => r.by === name)
    .map(handedOverAt)
    .reduce((a, b) => (a > b ? a : b), "");
}

/**
 * `name`'s review still in progress: their latest, while any of its threads isn't closed or
 * withdrawn. A handover adds to it (a reviewer's next pass is the same review); a new review starts
 * once the person has settled every thread in it.
 */
export function openReviewOf(read: Read, name: string): Review | undefined {
  const latest = read.reviews
    .filter((r) => r.by === name)
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1);
  if (latest === undefined) return undefined;
  const mine = threadsOf(latest, read.threads);
  return mine.some((t) => waitsOn(t) !== undefined) ? latest : undefined;
}

/**
 * `who`'s sitting: every thread they started or wrote on since their last handover, in the order
 * they did it. Closing or withdrawing alone doesn't count: there's nothing in it to hand over.
 */
export function sittingOf(read: Read, who: Who): Filed[] {
  const since = lastHandover(read.reviews, who.name);
  const when = (t: Filed): string | undefined => {
    const times = [
      ...(t.by === who.name && t.createdAt > since ? [t.createdAt] : []),
      ...t.messages
        .filter(
          (m) =>
            m.by === who.name &&
            m.at > since &&
            m.status !== Status.Closed &&
            m.status !== Status.Withdrawn,
        )
        .map((m) => m.at),
    ];
    return times.sort()[0];
  };
  return read.threads
    .flatMap((t) => {
      const at = when(t);
      return at === undefined ? [] : [{ t, at }];
    })
    .sort((a, b) => a.at.localeCompare(b.at))
    .map(({ t }) => t);
}

// ---- Writing (the one writer) ----

const HEADER =
  "# Written only through platform/studio/src/comments.ts (the dev server, the chalk MCP). Don't edit by hand.\n";

function writeHome(root: string, home: string, all: readonly Filed[]): void {
  const file = join(root, fileOf(home));
  const mine = all
    .filter((c) => c.home === home)
    .map(({ home: _, ...c }) => c)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, `${HEADER}${stringify(mine, { lineWidth: 100 })}`);
  renameSync(`${file}.tmp`, file);
}

function writeReview(root: string, review: Review): void {
  const file = join(root, REVIEWS_DIR, `${review.id}.yaml`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, `${HEADER}${stringify(review, { lineWidth: 100 })}`);
  renameSync(`${file}.tmp`, file);
}

export const newId = (): string =>
  `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** The time of a write: always later than the last, so a sitting's edge is never ambiguous. */
let lastNow = 0;
const now = (): string => {
  lastNow = Math.max(Date.now(), lastNow + 1);
  return new Date(lastNow).toISOString();
};

/** A review's id: its minute (20261026-1734), with -2, -3… if that minute already has one. */
function reviewId(root: string, at: string): string {
  const base = at.slice(0, 16).replace(/[-:]/g, "").replace("T", "-");
  let id = base;
  for (let n = 2; existsSync(join(root, REVIEWS_DIR, `${id}.yaml`)); n++) id = `${base}-${n}`;
  return id;
}

function git(root: string, ...args: string[]): string {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd(); // not trim(): a status line starts with a space
  } catch {
    return "";
  }
}

/** Files in content/, library/ and platform/ changed since `since` (uncommitted, modified after it). */
function changedSince(root: string, since: string): string[] {
  const t = Date.parse(since);
  // -z: NUL-separated, unquoted, and a rename's old path comes as its own entry after the new one.
  const entries = git(
    root,
    "status",
    "--porcelain",
    "-z",
    "--untracked-files=all",
    "--",
    "content",
    "library",
    "platform",
  )
    .split("\0")
    .filter((e) => e !== "");
  const listed: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i] ?? "";
    if (/^R|^C/.test(e)) i++;
    const f = e.slice(3);
    if (!f.endsWith(COMMENTS_FILE)) listed.push(f);
  }
  return listed.filter((f) => {
    try {
      // File times come from a coarse clock (a few ms behind Date.now on Linux): allow for it.
      return statSync(join(root, f)).mtimeMs >= t - 20;
    } catch {
      return false; // deleted: git can't say when, so it can't be pinned on this thread
    }
  });
}

/** What a new thread says: where it is, its words. The writer adds the rest. */
export type NewThread = Pick<
  Thread,
  "board" | "target" | "prop" | "source" | "snapshot" | "commit" | "from" | "quote"
> & {
  text: string;
  /** Whose turn it starts as, when not what starting it says (a reviewer's taste question: "person"). */
  turn?: Turn;
};

/** One change. Every write goes through here. */
export type Change =
  /** Start a thread. */
  | { op: "start"; thread: NewThread }
  /** Write on a thread, maybe moving its status. */
  | { op: "write"; id: string; text: string; status?: Status; turn?: Turn }
  /** Delete a thread no one else has touched and that was never handed over. */
  | { op: "delete"; id: string }
  /** Re-point a thread whose place is gone (a piece renamed, a board merged), saying where it went. */
  | {
      op: "move";
      id: string;
      to: Pick<Thread, "board" | "target" | "prop" | "source" | "quote">;
      text: string;
    }
  /** Hand over the sitting as a review. */
  | { op: "handover" };

export type Applied =
  | { ok: true; thread?: Filed; review?: Review; count?: number }
  | { ok: false; error: string };

/** Applies one change as `who`, or says why it isn't allowed. */
export function applyChange(root: string, change: Change, who: Who): Applied {
  const read = readComments(root);
  if (read.problems.length > 0)
    return { ok: false, error: `fix the comments files first:\n${read.problems.join("\n")}` };
  const { threads, reviews } = read;
  const acts = ACTS[who.role];
  const save = (t: Filed): Applied => {
    const all = threads.some((x) => x.id === t.id)
      ? threads.map((x) => (x.id === t.id ? t : x))
      : [...threads, t];
    writeHome(root, t.home, all);
    return { ok: true, thread: t };
  };

  if (change.op === "start") {
    // What the person said in a fixer's chat is filed in their name.
    const isFromChat = change.thread.from === "chat";
    if (isFromChat && who.role !== Role.Fixer)
      return { ok: false, error: "only a fixer files what the person said in its chat" };
    const author = isFromChat ? YOU : who;
    const { turn, ...placed } = change.thread;
    const draft = {
      ...placed,
      id: newId(),
      by: author.name,
      role: author.role,
      status: Status.Open,
      turn: turn ?? turnAfter(author.role, undefined),
      createdAt: now(),
      commit: change.thread.commit ?? (git(root, "rev-parse", "HEAD") || undefined),
      messages: [],
    };
    const checked = threadSchema.safeParse(draft);
    if (!checked.success) return { ok: false, error: issues(checked.error) };
    const home = homeOf(root, checked.data);
    if (home === undefined)
      return { ok: false, error: "can't tell which chapter or prop this is about" };
    return save({ ...checked.data, home });
  }

  if (change.op === "handover") {
    const sitting = sittingOf(read, who);
    if (sitting.length === 0) return { ok: true, count: 0 };
    const at = now();
    // One review in progress per person: a handover while it isn't done adds to it (a reply on
    // one of its threads is already in it), and keeps its id.
    const open = openReviewOf(read, who.name);
    if (open !== undefined) {
      const known = new Set(open.threads.map((x) => x.id));
      const review: Review = {
        ...open,
        added: [...(open.added ?? []), at],
        threads: [
          ...open.threads,
          ...sitting
            .filter((t) => !known.has(t.id))
            .map((t) => ({ file: fileOf(t.home), id: t.id })),
        ],
      };
      writeReview(root, review);
      return { ok: true, review, count: review.threads.length };
    }
    const review: Review = {
      id: reviewId(root, at),
      by: who.name,
      role: who.role,
      at,
      threads: sitting.map((t) => ({ file: fileOf(t.home), id: t.id })),
    };
    writeReview(root, review);
    return { ok: true, review, count: sitting.length };
  }

  const found = threads.find((x) => x.id === change.id);
  if (found === undefined) return { ok: false, error: `no thread ${change.id}` };
  const t: Filed = { ...found, messages: [...found.messages] };
  const isOwn = t.by === who.name;
  const refuse = (why: string): Applied => ({ ok: false, error: `${t.id}: ${why}` });

  if (change.op === "move") {
    if (!acts.moves) return refuse(`a ${who.role} doesn't re-point threads`);
    if (change.text.trim() === "") return refuse("say where it went and why");
    const placed: Filed = {
      ...t,
      board: change.to.board,
      target: change.to.target,
      prop: change.to.prop,
      source: change.to.source ?? t.source,
      quote: change.to.quote,
    };
    for (const k of ["board", "target", "prop", "quote"] as const)
      if (placed[k] === undefined) delete placed[k];
    const home = homeOf(root, placed);
    if (home === undefined) return refuse("can't tell which chapter or prop it now is about");
    const was = placeWords(t);
    placed.home = home;
    placed.messages.push({
      by: who.name,
      role: who.role,
      at: now(),
      text: `moved from ${was} to ${placeWords(placed)}: ${change.text.trim()}`,
    });
    const all = threads.map((x) => (x.id === t.id ? placed : x));
    if (t.home !== home) writeHome(root, t.home, all);
    writeHome(root, home, all);
    return { ok: true, thread: placed };
  }

  if (change.op === "delete") {
    if (!acts.deletesOwn || !isOwn) return refuse(`a ${who.role} can't delete this thread`);
    if (reviews.some((r) => r.threads.some((x) => x.id === t.id)))
      return refuse("it was handed over: withdraw it instead, so the review still finds it");
    if (t.messages.some((m) => m.by !== who.name))
      return refuse("someone else wrote on it: withdraw it instead, so the thread is kept");
    writeHome(
      root,
      t.home,
      threads.filter((x) => x.id !== t.id),
    );
    return { ok: true };
  }

  // A message, maybe with a move. The person's words on a thread the agent has answered send it
  // back to open.
  const mayMove = (to: Status): boolean =>
    MOVES[who.role].some(
      (m) =>
        m.to === to &&
        (m.from === undefined || m.from.includes(t.status)) &&
        (m.own !== true || isOwn),
    );
  let to = change.status;
  const isAnswered =
    t.status === Status.Planned || t.status === Status.Ready || t.status === Status.Closed;
  if (to === undefined && who.role === Role.Person && isAnswered && change.text !== "")
    if (mayMove(Status.Open)) to = Status.Open;
  if (to === undefined && change.text === "") return refuse("say something, or move its status");
  if (to !== undefined && !mayMove(to))
    return refuse(
      to === t.status
        ? `it's already ${to}: leave the status out to just add a message`
        : `a ${who.role} can't move a thread from ${t.status} to ${to}`,
    );
  if (to === Status.Ready) {
    // A reviewer's words on the thread wait for an answer (a message or a new plan) before it's ready.
    const last = t.messages.at(-1);
    if (last?.role === Role.Reviewer)
      return refuse(
        `answer the reviewer first (${last.by}: "${last.text.slice(0, 80)}"): write a message or a new plan, then mark it ready`,
      );
    const since = lastMove(t, Status.Planned)?.at ?? t.createdAt;
    t.changed = changedSince(root, since);
    // Undefined fields aren't written to the file.
    t.reaches = reachOf(root, t.changed);
  }
  t.messages.push({
    by: who.name,
    role: who.role,
    at: now(),
    text: change.text,
    ...(to !== undefined ? { status: to } : {}),
  });
  if (to !== undefined) t.status = to;
  const turn =
    to === Status.Closed || to === Status.Withdrawn
      ? undefined
      : (change.turn ?? turnAfter(who.role, to));
  // Settled: no one's turn, and nothing written for it.
  const { turn: _, ...rest } = t;
  return save(turn === undefined ? rest : { ...rest, turn });
}

/** Where a thread is, in words: its board and what on it, its prop, or its file and words. */
function placeWords(t: Pick<Thread, "board" | "target" | "prop" | "source" | "quote">): string {
  if (t.prop !== undefined) return `prop ${t.prop}${t.target ? `#${t.target}` : ""}`;
  if (t.board !== undefined) return `content/${t.board}${t.target ? `#${t.target}` : ""}`;
  return `${t.source ?? "?"}${t.quote ? ` "${t.quote.slice(0, 60)}"` : ""}`;
}

/** What changed files reach, from git's lines for them; undefined when nothing changed or it can't tell. */
function reachOf(root: string, files: readonly string[]): Thread["reaches"] {
  if (files.length === 0) return undefined;
  try {
    const wanted = new Set(files);
    const changes = changesFromGit(root).filter((c) => wanted.has(c.file));
    const reached = reachIndex(root).reach(changes);
    const boards = new Set(reached.hits.map((h) => h.board));
    return {
      pieces: reached.hits.length,
      boards: boards.size,
      lessons: reached.everything ? [] : rollUp(reached.hits, "lesson").map((r) => r.path),
      ...(reached.everything === undefined ? {} : { everything: reached.everything }),
    };
  } catch {
    return undefined;
  }
}

/** A comments file's path relative to the repo, for messages. */
export const pathOf = (_root: string, home: string): string => fileOf(home);
