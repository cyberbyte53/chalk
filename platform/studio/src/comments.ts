import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { parse, stringify } from "yaml";

/**
 * Comments live with the content it is about: one Markdown file per comment in the chapter's
 * `.comments/` folder (content/<book>/<chapter>/.comments/<id>.md), versioned with it. The body is
 * what the person said; the front matter is everything else (where it points, status, the agent's
 * proposal, the thread). People, the review page, agents and the MCP tools all read and write
 * these files; there is no other store.
 *
 *   ---
 *   id: cmvdxpha3lr5
 *   status: open            # open | proposed | approved | done | declined
 *   on: class10-maths/real-numbers/division-lemma/overview/lemma   # the board (?dev&board=…)
 *   piece: w6
 *   source: content/class10-maths/real-numbers/division-lemma/overview.ts:117
 *   createdAt: 2026-10-18T14:42:18.939Z
 *   proposal: { summary: …, changes: [{ before: …, after: … }] }
 *   thread: [{ by: claude, at: …, text: … }]
 *   ---
 *   there is only one answer feels weird? can we frame better
 *
 * A comment on a prop (picked on a prop or a part of one, in the preview) is about the prop, not
 * one board: it lives with the prop, in library/props/<package>/.comments/, names it (`prop`, and
 * `part` when a part was picked) and still names the board it was seen on (`on`, `source`). The
 * preview shows it under every board that places the prop.
 */

export const COMMENTS_DIR = ".comments";

export const CommentStatus = {
  Open: "open",
  Proposed: "proposed",
  Approved: "approved",
  Done: "done",
  Declined: "declined",
} as const;
export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus];

export type ThreadEntry = { by: string; at: string; text: string };

/** One comment. Unknown fields are kept as they are (the format can grow). */
export type Comment = {
  id: string;
  status: string;
  text: string;
  thread: ThreadEntry[];
  /** Where it is filed: `<book>/<chapter>`, or `library/props/<package>` for a prop comment. */
  chapter: string;
  /** For a prop comment: the prop type, and the part picked. */
  prop?: string;
  part?: string;
  /** The board, as a build path without .json; absent for a plan comment. */
  on?: string;
  piece?: string | null;
  source?: string;
  createdAt?: string;
} & Record<string, unknown>;

const FRONT = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export function parseComment(text: string, chapter: string): Comment {
  const match = FRONT.exec(text.replace(/\r\n/g, "\n"));
  if (match === null) throw new Error("no front matter");
  const meta = (parse(match[1] ?? "") ?? {}) as Record<string, unknown>;
  return {
    ...meta,
    id: String(meta.id ?? ""),
    status: String(meta.status ?? CommentStatus.Open),
    thread: Array.isArray(meta.thread) ? (meta.thread as ThreadEntry[]) : [],
    chapter,
    text: (match[2] ?? "").trim(),
  };
}

export function formatComment(fb: Comment): string {
  const { text, chapter: _, ...meta } = fb;
  const ordered: Record<string, unknown> = { id: meta.id, status: meta.status };
  for (const key of ["prop", "on", "piece", "part", "source", "lessonTitle", "board", "createdAt"])
    if (meta[key] !== undefined && meta[key] !== null && meta[key] !== "") ordered[key] = meta[key];
  for (const [key, value] of Object.entries(meta))
    if (!(key in ordered) && value !== undefined && value !== null && value !== "")
      if (!(Array.isArray(value) && value.length === 0)) ordered[key] = value;
  return `---\n${stringify(ordered, { lineWidth: 100 }).trimEnd()}\n---\n${text.trim()}\n`;
}

const dirsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .map((d) => d.name)
    : [];

/** The folders comments are filed in: each chapter's, and each prop package's. */
function homes(root: string): string[] {
  const content = join(root, "content");
  const props = join(root, "library", "props");
  return [
    ...dirsIn(content).flatMap((book) =>
      dirsIn(join(content, book)).map((chapter) => `${book}/${chapter}`),
    ),
    ...dirsIn(props).map((name) => `library/props/${name}`),
  ];
}

/** Every comment (in content/ and on props), each with the file it lives in (repo-relative). */
export function listComments(root: string): (Comment & { file: string })[] {
  const out: (Comment & { file: string })[] = [];
  for (const home of homes(root)) {
    const dir = join(homeDir(root, home), COMMENTS_DIR);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)
      .filter((n) => n.endsWith(".md"))
      .sort()) {
      const file = join(dir, name);
      try {
        out.push({ ...parseComment(readFileSync(file, "utf8"), home), file: relative(root, file) });
      } catch {
        // A half-written or broken file is skipped, not fatal; `pnpm check` can report it later.
      }
    }
  }
  return out.sort((a, b) => String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")));
}

const homeDir = (root: string, home: string): string =>
  home.startsWith("library/") ? join(root, home) : join(root, "content", home);

export function commentFile(root: string, fb: Pick<Comment, "chapter" | "id">): string {
  return join(homeDir(root, fb.chapter), COMMENTS_DIR, `${fb.id}.md`);
}

export function writeComment(root: string, fb: Comment): string {
  const file = commentFile(root, fb);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(`${file}.tmp`, formatComment(fb));
  renameSync(`${file}.tmp`, file);
  return relative(root, file);
}

export function removeComment(root: string, fb: Pick<Comment, "chapter" | "id">): void {
  rmSync(commentFile(root, fb), { force: true });
}

export const newCommentId = (): string =>
  `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** `<book>/<chapter>` from whatever a comment knows: its board, its source, or a plan's lesson id. */
export function chapterOf(fb: Record<string, unknown>): string | undefined {
  for (const key of ["on", "sourcePath", "source"]) {
    const value = fb[key];
    if (typeof value !== "string") continue;
    const parts = value.replace(/^content\//, "").split("/");
    if (parts.length >= 2 && parts[0] && parts[1]) return `${parts[0]}/${parts[1]}`;
  }
  const lesson = fb.lessonId;
  if (typeof lesson === "string" && /^[^/]+\/[^/]+$/.test(lesson) && !lesson.startsWith("concept/"))
    return lesson;
  return undefined;
}
