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
 * Comments (platform/docs/comments.md).
 *
 * A **thread** is one thing said about a board, a piece, a prop or a planning file, and everything
 * written on it since: its messages. A thread's **home** is what it is about: a chapter
 * (content/<book>/<chapter>) or a prop package (library/props/<package>). Threads are about the
 * work, not part of it, so they are kept under authoring/, one file per home:
 * authoring/books/<book>/<chapter>/comments.yaml, or authoring/props/<package>/comments.yaml.
 *
 * Everyone who writes is a participant with a role (the person, a fixer agent, a reviewer agent).
 * Anyone starts a thread. Each thread says whose turn it is (`turn`, a role): every write sets it,
 * from what the write does (`turnAfter`), or as the writer says. Every view reads that one field;
 * nothing works it out again. Whoever opened a thread closes it: a ready thread goes back to its
 * opener's role; the person may close any. A reviewer's finding has a weight (must, consider); an
 * agent's question to the person (`ask`) has options. Every write goes through `applyChange`, which
 * checks it against two tables: the status moves each role may make, and what else each role may
 * do. The caller never picks its own role: the person writes through the preview and the editor,
 * an agent through the chalk MCP with its role fixed when it connects.
 */

export const COMMENTS_FILE = "comments.yaml";

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

/**
 * How much a reviewer's finding weighs: a must the fixer fixes; a consider the fixer decides, and
 * says what it did in its reply.
 */
export const Weight = { Must: "must", Consider: "consider" } as const;
export type Weight = (typeof Weight)[keyof typeof Weight];

/** A move a role may make: to a status, from some (all when absent), maybe only on its own threads or on a turn. */
type Move = { to: Status; from?: readonly Status[]; own?: boolean; onTurn?: Role };

/** The status moves each role may make. A message with no move is open to everyone. */
export const MOVES: Readonly<Record<Role, readonly Move[]>> = {
  // The person closes any thread.
  [Role.Person]: [{ to: Status.Open }, { to: Status.Closed }, { to: Status.Withdrawn }],
  // An agent takes back a thread of its own that became moot (a question settled in chat), and
  // closes a thread of its own once it is back on its turn (its fix made, its question answered).
  [Role.Fixer]: [
    { to: Status.Planned, from: [Status.Open, Status.Planned] },
    // A fix sent back ("not yet": the fixer's turn) is planned again, then made ready again.
    { to: Status.Planned, from: [Status.Ready], onTurn: Role.Fixer },
    { to: Status.Ready, from: [Status.Planned] },
    { to: Status.Withdrawn, from: [Status.Open, Status.Planned], own: true },
    { to: Status.Closed, from: [Status.Open, Status.Ready], own: true, onTurn: Role.Fixer },
  ],
  [Role.Reviewer]: [
    { to: Status.Withdrawn, from: [Status.Open], own: true },
    { to: Status.Closed, from: [Status.Open, Status.Ready], own: true, onTurn: Role.Reviewer },
  ],
};

/**
 * What else each role may do: deleting its own, and re-pointing a thread whose place is gone
 * (merged, renamed), saying where it went. Everyone starts threads.
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
    /** A plan's commit (HEAD when it was written): what its fix is counted from. */
    commit: z.string().optional(),
  })
  .strict();
export type Message = z.infer<typeof messageSchema>;

/** One answer an agent offers the person (`ask`): a short label, and why. */
export const optionSchema = z.object({ label: z.string().min(1), why: z.string().min(1) }).strict();
export type Option = z.infer<typeof optionSchema>;

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
    /** Whose turn it is while it is open, planned or ready (a role); absent once closed or withdrawn. */
    turn: roleSchema.optional(),
    /** A reviewer's finding: must (fixed) or consider (the fixer decides). */
    weight: z.nativeEnum(Weight).optional(),
    /**
     * An agent's question to the person (`ask`): two to four answers, the agent's pick first. His
     * answer is a reply: an option's label, or his own words.
     */
    options: z.array(optionSchema).min(2).max(4).optional(),
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

/** A thread and where it is filed: "content/<book>/<chapter>" or "library/props/<package>". */
export type Filed = Thread & { home: string };

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

/**
 * Where a thread is filed: its prop's package, else its board's (or source's) chapter, else (a
 * thread at a book itself, on the book's screen) its book.
 */
export function homeOf(
  root: string,
  c: Pick<Thread, "prop" | "board" | "source">,
): string | undefined {
  if (c.prop !== undefined) return propHomes(root).get(c.prop);
  // A chapter, or a book, is a folder under content/ or its planning under authoring/books/ (a
  // source line's file, build.yaml:1, is neither).
  const isFolder = (...parts: string[]) =>
    existsSync(join(root, "content", ...parts)) ||
    existsSync(join(root, "authoring", "books", ...parts));
  for (const value of [c.board, c.source]) {
    if (value === undefined) continue;
    const [book, chapter] = value.replace(/^content\/|^authoring\/books\//, "").split("/");
    if (book && chapter && isFolder(book, chapter)) return `content/${book}/${chapter}`;
  }
  const [book, ...rest] = (c.board ?? "").replace(/^content\//, "").split("/");
  return book && rest.length === 0 && isFolder(book) ? `content/${book}` : undefined;
}

const dirsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "node_modules")
        .map((d) => d.name)
    : [];

/**
 * Every home a thread can be about: each book, chapter and prop package there is, and any that
 * still has threads kept under authoring/ (its folder since removed: its threads are still read).
 */
function homes(root: string): string[] {
  const kept = [
    ...dirsIn(join(root, "authoring", "books")).map((book) => `content/${book}`),
    ...dirsIn(join(root, "authoring", "books")).flatMap((book) =>
      dirsIn(join(root, "authoring", "books", book)).map((chapter) => `content/${book}/${chapter}`),
    ),
    ...dirsIn(join(root, "authoring", "props")).map((name) => `library/props/${name}`),
  ];
  return [
    ...new Set([
      ...dirsIn(join(root, "content")).flatMap((book) => [
        `content/${book}`,
        ...dirsIn(join(root, "content", book)).map((chapter) => `content/${book}/${chapter}`),
      ]),
      ...dirsIn(join(root, "library", "props")).map((name) => `library/props/${name}`),
      ...kept,
    ]),
  ];
}

/**
 * A home's comments file, relative to the repo: content/<book>/<chapter> is
 * kept in authoring/books/<book>/<chapter>, library/props/<package> in authoring/props/<package>.
 */
export function fileOf(home: string): string {
  if (home.startsWith("content/"))
    return `authoring/books/${home.slice("content/".length)}/${COMMENTS_FILE}`;
  if (home.startsWith("library/props/"))
    return `authoring/props/${home.slice("library/props/".length)}/${COMMENTS_FILE}`;
  throw new Error(`no home ${home}: threads are about a book, a chapter or a prop package`);
}

// ---- Reading ----

export type Read = { threads: Filed[]; problems: string[] };

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

/** Every thread (oldest first), and everything a file holds that doesn't fit: never skipped silently. */
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
  return { threads, problems };
}

/** Whose turn it is on a thread: as it says, and no one's once closed or withdrawn. */
export function waitsOn(t: Thread): Role | undefined {
  if (t.status === Status.Closed || t.status === Status.Withdrawn) return undefined;
  return t.turn;
}

/**
 * Whose turn it is after a write by `role` on a thread `opener` started, from what the write does.
 * Ready goes back to whoever opened the thread, to close it or send it back; a plan is the fixer's
 * to carry out; the person's words and a reviewer's are the fixer's to answer; a fixer's words (a
 * question, a reason, what it decided on a consider) are the reviewer's on a reviewer's thread,
 * else the person's. Closed and withdrawn: no one's.
 */
export function turnAfter(role: Role, to: Status | undefined, opener: Role): Role | undefined {
  if (to === Status.Closed || to === Status.Withdrawn) return undefined;
  if (to === Status.Ready) return opener;
  if (to === Status.Planned) return Role.Fixer;
  if (role !== Role.Fixer) return Role.Fixer;
  return opener === Role.Reviewer ? Role.Reviewer : Role.Person;
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
  const opener = t.role ?? Role.Person;
  const last = t.messages?.at(-1)?.role ?? opener;
  const turn =
    about !== undefined && t.status === Status.Open
      ? Role.Fixer
      : turnAfter(last, t.status === Status.Open ? undefined : t.status, opener);
  return turn === undefined ? t : { ...t, turn };
}

/** Threads still waiting on `role` (the fixer, unless said). */
export const isUnanswered = (t: Thread, role: Role = Role.Fixer): boolean => waitsOn(t) === role;

/** The option the person picked on an `ask`: his last reply that is one of its labels. */
export function pickedOption(t: Thread): Option | undefined {
  if (t.options === undefined) return undefined;
  for (const m of [...t.messages].reverse()) {
    if (m.role !== Role.Person || m.text.trim() === "") continue;
    return t.options.find((o) => o.label === m.text.trim());
  }
  return undefined;
}

/** The last message that moved the thread to `status`: its plan (planned), its answer (ready). */
export const lastMove = (t: Thread, status: Status): Message | undefined =>
  [...t.messages].reverse().find((m) => m.status === status);

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

export const newId = (): string =>
  `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** The time of a write: always later than the last, so threads and messages keep their order. */
let lastNow = 0;
const now = (): string => {
  lastNow = Math.max(Date.now(), lastNow + 1);
  return new Date(lastNow).toISOString();
};

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

/**
 * Files in content/, library/ and platform/ changed since a plan's commit, committed or not (and
 * new ones made since the plan); never a comments file.
 */
function changedFrom(root: string, commit: string, since: string): string[] {
  const t = Date.parse(since);
  const tracked = new Set(
    git(root, "diff", "--name-only", "--no-renames", commit, "--", "content", "library", "platform")
      .split("\n")
      .filter((f) => f !== ""),
  );
  const fresh = git(
    root,
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    "content",
    "library",
    "platform",
  )
    .split("\n")
    .filter((f) => {
      if (f === "") return false;
      try {
        // File times come from a coarse clock: allow for it.
        return statSync(join(root, f)).mtimeMs >= t - 20;
      } catch {
        return false;
      }
    });
  return [...tracked, ...fresh].filter((f) => !f.endsWith(COMMENTS_FILE)).sort();
}

/** What a new thread says: where it is, its words. The writer adds the rest. */
export type NewThread = Pick<
  Thread,
  | "board"
  | "target"
  | "prop"
  | "source"
  | "snapshot"
  | "commit"
  | "from"
  | "quote"
  | "weight"
  | "options"
> & {
  text: string;
  /** Whose turn it starts as, when not what starting it says. An `ask` (options) is always the person's. */
  turn?: Role;
};

/** One change. Every write goes through here. */
export type Change =
  /** Start a thread. */
  | { op: "start"; thread: NewThread }
  /** Write on a thread, maybe moving its status. */
  | { op: "write"; id: string; text: string; status?: Status; turn?: Role }
  /** Delete a thread no one else has touched. */
  | { op: "delete"; id: string }
  /** Re-point a thread whose place is gone (a piece renamed, a board merged), saying where it went. */
  | {
      op: "move";
      id: string;
      to: Pick<Thread, "board" | "target" | "prop" | "source" | "quote">;
      text: string;
    };

export type Applied = { ok: true; thread?: Filed } | { ok: false; error: string };

/** Applies one change as `who`, or says why it isn't allowed. */
export function applyChange(root: string, change: Change, who: Who): Applied {
  const read = readComments(root);
  if (read.problems.length > 0)
    return { ok: false, error: `fix the comments files first:\n${read.problems.join("\n")}` };
  const { threads } = read;
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
    const isAsk = placed.options !== undefined;
    // A reviewer's finding says how much it weighs; a question to the person (an ask) doesn't.
    if (author.role === Role.Reviewer && !isAsk && placed.weight === undefined)
      return {
        ok: false,
        error:
          "a reviewer's finding has a weight: must (the fixer fixes it) or consider (the fixer decides, and says what it did)",
      };
    if (isAsk && new Set(placed.options?.map((o) => o.label)).size !== placed.options?.length)
      return { ok: false, error: "each option has its own label" };
    const draft = {
      ...placed,
      id: newId(),
      by: author.name,
      role: author.role,
      status: Status.Open,
      // An ask is always the person's to answer.
      turn: isAsk ? Role.Person : (turn ?? turnAfter(author.role, undefined, author.role)),
      createdAt: now(),
      commit: change.thread.commit ?? (git(root, "rev-parse", "HEAD") || undefined),
      messages: [],
    };
    const checked = threadSchema.safeParse(draft);
    if (!checked.success) return { ok: false, error: issues(checked.error) };
    const home = homeOf(root, checked.data);
    if (home === undefined)
      return { ok: false, error: "can't tell which book, chapter or prop this is about" };
    return save({ ...checked.data, home });
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
        (m.own !== true || isOwn) &&
        (m.onTurn === undefined || t.turn === m.onTurn),
    );
  let to = change.status;
  const isAnswered =
    t.status === Status.Planned || t.status === Status.Ready || t.status === Status.Closed;
  if (to === undefined && who.role === Role.Person && isAnswered && change.text !== "")
    if (mayMove(Status.Open)) to = Status.Open;
  if (to === undefined && change.text === "") return refuse("say something, or move its status");
  if (to !== undefined && !mayMove(to) && t.status === Status.Closed) {
    const closing = [...t.messages].reverse().find((m) => m.status === Status.Closed);
    return refuse(
      `it was closed${closing ? ` by ${closing.by} on ${closing.at.slice(0, 10)}` : ""}: nothing to do; start a new thread if it needs more`,
    );
  }
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
    // What this fix changed: since its plan's commit, committed or not; a plan from before plans
    // kept their commit, by the files' times.
    const plan = lastMove(t, Status.Planned);
    const since = plan?.at ?? t.createdAt;
    t.changed =
      plan?.commit !== undefined
        ? changedFrom(root, plan.commit, since)
        : changedSince(root, since);
    // Undefined fields aren't written to the file.
    t.reaches = reachOf(root, t.changed, plan?.commit);
  }
  const head = to === Status.Planned ? git(root, "rev-parse", "HEAD").trim() : "";
  t.messages.push({
    by: who.name,
    role: who.role,
    at: now(),
    text: change.text,
    ...(to !== undefined ? { status: to } : {}),
    ...(head !== "" ? { commit: head } : {}),
  });
  if (to !== undefined) t.status = to;
  const turn =
    to === Status.Closed || to === Status.Withdrawn
      ? undefined
      : (change.turn ?? turnAfter(who.role, to, t.role));
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
function reachOf(root: string, files: readonly string[], since = "HEAD"): Thread["reaches"] {
  if (files.length === 0) return undefined;
  try {
    const wanted = new Set(files);
    // Each file's changed lines, against where the fix started (a committed fix is in neither
    // HEAD's diff nor the working tree's).
    const changes = changesFromGit(root, since).filter((c) => wanted.has(c.file));
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
