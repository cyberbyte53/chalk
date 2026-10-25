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

/**
 * Comments: what the person (and reviewer agents) said about boards, pieces, parts and props, and
 * how each was answered. One file per place they are about: content/<book>/<chapter>/comments.yaml
 * for a chapter's boards, library/props/<package>/comments.yaml for a prop (shown wherever the
 * prop is used). Kept in git with what they are about.
 *
 * Written only by the Chalk dev server, one change at a time, through `applyChange` (so two writers
 * can never collide, and every change follows the lifecycle). Nobody edits the files by hand; the
 * reader reports anything that doesn't fit the schema instead of skipping it. See
 * platform/docs/comments.md.
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

export const Kind = { Comment: "comment", Finding: "finding", Regression: "regression" } as const;
export type Kind = (typeof Kind)[keyof typeof Kind];

/** Who acts: the person (in the preview or editor), or an agent (through the MCP tools). */
export const Actor = { Person: "person", Agent: "agent" } as const;
export type Actor = (typeof Actor)[keyof typeof Actor];

const entrySchema = z.object({ by: z.string(), at: z.string(), text: z.string() });

export const commentSchema = z
  .object({
    id: z.string().min(1),
    kind: z.nativeEnum(Kind),
    status: z.nativeEnum(Status),
    by: z.string(),
    createdAt: z.string(),
    /** The board, by its build path without .json; absent for a comment on a plan. */
    board: z.string().optional(),
    /** What on the board, as a path: "machine", "machine › put", "shadow › circle › point". */
    target: z.string().optional(),
    /** For a comment about a prop wherever it is used: its type. */
    prop: z.string().optional(),
    /** The line the target was written at (content/…:42). */
    source: z.string().optional(),
    /** What the target said when the comment was made, so it can be found if lines move. */
    snapshot: z.string().optional(),
    commit: z.string().optional(),
    /** The sitting it was handed to an agent in; absent until handed over. */
    review: z.string().optional(),
    /** For a regression: the comment whose change broke this. */
    causedBy: z.string().optional(),
    /** Where it came from when not the preview: "chat" for feedback given in the agent's chat. */
    from: z.string().optional(),
    /** For a comment on a plan: the words picked. */
    quote: z.string().optional(),
    text: z.string(),
    /** What the agent will do here, written after the person's go. */
    plan: z.object({ by: z.string(), at: z.string(), text: z.string() }).optional(),
    /** Files changed for it, recorded from git when it became ready. */
    changed: z.array(z.string()).optional(),
    thread: z.array(entrySchema).default([]),
  })
  .strict();
export type Comment = z.infer<typeof commentSchema>;

/** A comment and where it is filed: "content/<book>/<chapter>" or "library/props/<package>". */
export type Filed = Comment & { home: string };

// ---- Where a comment lives ----

/**
 * Each prop type's package, from library/catalogue.md (generated from the prop definitions and
 * kept current by `pnpm check`). Read from the file rather than imported, so the dev server's
 * config can use this without loading every prop.
 */
function propHomes(root: string): Map<string, string> {
  const out = new Map<string, string>();
  const file = join(root, "library", "catalogue.md");
  if (!existsSync(file)) return out;
  let pkg: string | undefined;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const section = /^## `([^`]+)`/.exec(line);
    if (section) pkg = section[1];
    const row = /^\| `([^`]+)`/.exec(line);
    if (row?.[1] && pkg) out.set(row[1], `library/props/${pkg}`);
  }
  return out;
}

/** Where a comment is filed: its prop's package, else its board's (or source's) chapter. */
export function homeOf(
  root: string,
  c: Pick<Comment, "prop" | "board" | "source">,
): string | undefined {
  if (c.prop !== undefined) return propHomes(root).get(c.prop);
  for (const value of [c.board, c.source]) {
    if (value === undefined) continue;
    const [book, chapter] = value.replace(/^content\//, "").split("/");
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

/** Every folder a comments file can be in. */
function homes(root: string): string[] {
  return [
    ...dirsIn(join(root, "content")).flatMap((book) =>
      dirsIn(join(root, "content", book)).map((chapter) => `content/${book}/${chapter}`),
    ),
    ...dirsIn(join(root, "library", "props")).map((name) => `library/props/${name}`),
  ];
}

// ---- Reading ----

export type Read = { comments: Filed[]; problems: string[] };

/** Every comment, oldest first, and every entry that doesn't fit the schema (never skipped silently). */
export function readComments(root: string): Read {
  const comments: Filed[] = [];
  const problems: string[] = [];
  for (const home of homes(root)) {
    const file = join(root, home, COMMENTS_FILE);
    if (!existsSync(file)) continue;
    let raw: unknown;
    try {
      raw = parse(readFileSync(file, "utf8")) ?? [];
    } catch (e) {
      problems.push(`${home}/${COMMENTS_FILE}: not readable YAML (${String(e).split("\n")[0]})`);
      continue;
    }
    if (!Array.isArray(raw)) {
      problems.push(`${home}/${COMMENTS_FILE}: should be a list of comments`);
      continue;
    }
    for (const [i, entry] of raw.entries()) {
      const checked = commentSchema.safeParse(entry);
      if (checked.success) comments.push({ ...checked.data, home });
      else
        problems.push(
          `${home}/${COMMENTS_FILE} #${i + 1}: ${checked.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`,
        );
    }
  }
  comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { comments, problems };
}

// ---- Writing (the dev server only) ----

const HEADER =
  "# Comments, written only by the Chalk dev server (platform/studio/src/comments.ts). Don't edit by hand.\n";

function writeHome(root: string, home: string, all: readonly Filed[]): void {
  const file = join(root, home, COMMENTS_FILE);
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

const now = () => new Date().toISOString();

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
      return statSync(join(root, f)).mtimeMs >= t;
    } catch {
      return false; // deleted: git can't say when, so it can't be pinned on this comment
    }
  });
}

/** One change to the comments. Every write goes through here, and the lifecycle is checked here. */
export type Change =
  | {
      op: "add";
      comment: Omit<Comment, "id" | "status" | "createdAt" | "thread" | "kind" | "by"> & {
        kind?: Kind;
        by?: string;
      };
    }
  | { op: "reply"; id: string; text: string; by?: string }
  | { op: "plan"; id: string; text: string; by?: string }
  | { op: "ready"; id: string; text: string; by?: string }
  | { op: "close"; id: string }
  | { op: "reopen"; id: string; text?: string }
  | { op: "withdraw"; id: string; text?: string }
  | { op: "delete"; id: string }
  | { op: "handover" };

export type Applied =
  | { ok: true; comment?: Filed; review?: string; count?: number }
  | { ok: false; error: string };

/** Applies one change as `actor`, or says why it isn't allowed. */
export function applyChange(root: string, change: Change, actor: Actor): Applied {
  const { comments, problems } = readComments(root);
  if (problems.length > 0)
    return { ok: false, error: `fix the comments files first:\n${problems.join("\n")}` };
  const isPerson = actor === Actor.Person;
  const save = (c: Filed): Applied => {
    const all = comments.some((x) => x.id === c.id)
      ? comments.map((x) => (x.id === c.id ? c : x))
      : [...comments, c];
    writeHome(root, c.home, all);
    return { ok: true, comment: c };
  };

  if (change.op === "add") {
    const kind = change.comment.kind ?? Kind.Comment;
    if (isPerson && kind !== Kind.Comment) return { ok: false, error: "findings come from agents" };
    if (!isPerson && kind === Kind.Comment && change.comment.from !== "chat")
      return {
        ok: false,
        error:
          "an agent files a finding or a regression, or a comment the person made in chat (from: chat)",
      };
    if (kind === Kind.Regression && change.comment.causedBy === undefined)
      return {
        ok: false,
        error: "a regression names the comment whose change caused it (causedBy)",
      };
    const draft = {
      ...change.comment,
      id: newId(),
      kind,
      by: change.comment.by ?? (isPerson ? "you" : "agent"),
      status: Status.Open,
      createdAt: now(),
      commit: change.comment.commit ?? (git(root, "rev-parse", "HEAD") || undefined),
      thread: [],
    };
    const checked = commentSchema.safeParse(draft);
    if (!checked.success)
      return {
        ok: false,
        error: checked.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; "),
      };
    const home = homeOf(root, checked.data);
    if (home === undefined)
      return { ok: false, error: "can't tell which chapter or prop this is about" };
    return save({ ...checked.data, home });
  }

  if (change.op === "handover") {
    if (!isPerson) return { ok: false, error: "only the person hands a review over" };
    const fresh = comments.filter(
      (c) => c.by === "you" && c.review === undefined && c.status === Status.Open,
    );
    if (fresh.length === 0) return { ok: true, count: 0 };
    const review = now().slice(0, 16).replace(/[-:]/g, "").replace("T", "-");
    const touched = new Set<string>();
    const all = comments.map((c) => {
      if (!fresh.includes(c)) return c;
      touched.add(c.home);
      return { ...c, review };
    });
    for (const home of touched) writeHome(root, home, all);
    return { ok: true, review, count: fresh.length };
  }

  const found = comments.find((c) => c.id === change.id);
  if (found === undefined) return { ok: false, error: `no comment ${change.id}` };
  const c: Filed = { ...found, thread: [...found.thread] };
  const by = "by" in change && change.by ? change.by : isPerson ? "you" : "agent";
  const refuse = (why: string): Applied => ({ ok: false, error: `${c.id}: ${why}` });

  switch (change.op) {
    case "reply":
      c.thread.push({ by, at: now(), text: change.text });
      // The person replying sends it back to the agent, unless it was withdrawn.
      if (isPerson && c.status !== Status.Withdrawn) c.status = Status.Open;
      return save(c);
    case "plan":
      if (isPerson) return refuse("plans are written by the agent");
      if (c.status !== Status.Open && c.status !== Status.Planned)
        return refuse(`can't plan a comment that is ${c.status}`);
      c.plan = { by, at: now(), text: change.text };
      c.status = Status.Planned;
      return save(c);
    case "ready": {
      if (isPerson) return refuse("the agent marks its work ready; you close it");
      if (c.status !== Status.Planned)
        return refuse(`write the plan on it first (it is ${c.status}, not planned)`);
      const blocking = comments.filter(
        (x) =>
          x.kind === Kind.Regression &&
          x.causedBy === c.id &&
          x.status !== Status.Closed &&
          x.status !== Status.Withdrawn &&
          x.status !== Status.Ready,
      );
      if (blocking.length > 0)
        return refuse(
          `fix the regressions it caused first: ${blocking.map((x) => x.id).join(", ")}`,
        );
      c.thread.push({ by, at: now(), text: change.text });
      c.changed = changedSince(root, c.plan?.at ?? c.createdAt);
      c.status = Status.Ready;
      return save(c);
    }
    case "close":
      if (!isPerson) return refuse("only the person closes a comment");
      c.status = Status.Closed;
      return save(c);
    case "reopen":
      if (!isPerson) return refuse("only the person reopens a comment");
      if (change.text) c.thread.push({ by, at: now(), text: change.text });
      c.status = Status.Open;
      return save(c);
    case "withdraw":
      if (!isPerson) return refuse("only the person withdraws a comment");
      if (change.text) c.thread.push({ by, at: now(), text: change.text });
      c.status = Status.Withdrawn;
      return save(c);
    case "delete": {
      if (!isPerson) return refuse("only the person deletes a comment");
      const isTouched =
        c.status !== Status.Open || c.plan !== undefined || c.thread.some((e) => e.by !== "you");
      if (isTouched)
        return refuse("the agent has acted on it: withdraw it instead, so the thread is kept");
      writeHome(
        root,
        c.home,
        comments.filter((x) => x.id !== c.id),
      );
      return { ok: true };
    }
  }
}

/** The most recent review handed over, if any. */
export function latestReview(comments: readonly Comment[]): string | undefined {
  return comments
    .map((c) => c.review)
    .filter((r): r is string => r !== undefined)
    .sort()
    .at(-1);
}

/** Comments in a review that the agent hasn't answered yet (no reply after the last change by the person). */
export function unanswered(comments: readonly Comment[]): Comment[] {
  return comments.filter(
    (c) => c.status !== Status.Closed && c.status !== Status.Withdrawn && c.status !== Status.Ready,
  );
}

/** Relative path of a home's comments file, for messages. */
export const fileOf = (root: string, home: string): string =>
  relative(root, join(root, home, COMMENTS_FILE));
