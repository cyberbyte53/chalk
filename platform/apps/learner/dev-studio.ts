/**
 * Studio's dev-server side: the content pipeline as the files say it is. Nothing here builds or
 * runs an agent; it reads the tree (plans, manifests, runs, comments, the build) and writes the
 * two things a person does in Studio: approve a plan, drop a source. See AGENTS.md ("the content
 * pipeline") and platform/docs/writing-content.md ("A chapter's own files").
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { type Comment, listComments } from "../../studio/src/comments";
import { type Next, type Step, nextStep, runs, startRun, steps, stopRun } from "./dev-runner";

export const PlanStatus = {
  None: "none",
  Queued: "queued",
  Draft: "draft",
  Approved: "approved",
  Built: "built",
} as const;
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

export type Lesson = {
  slug: string;
  title: string;
  /** Listed in the chapter's build.yaml. */
  isListed: boolean;
  /** Has an overview.ts. */
  isWritten: boolean;
  /** The built concept's id, when the build has it (links to the review shell). */
  id: string | null;
};

export type ChapterRow = {
  /** What the pipeline would do next, or null when it waits for the person or is finished. */
  next: Next;
  book: string;
  bookTitle: string;
  chapter: string;
  title: string;
  /** Listed in the book's build.yaml. */
  isListed: boolean;
  status: PlanStatus;
  approvedOn: string | null;
  source: string | null;
  /** Lessons the plan lists (numbered items under "## Lessons"). */
  lessonsPlanned: number;
  /** Their slugs, when the plan writes them as `1. **slug** …`. */
  plannedLessons: string[];
  /** The notes in runs/, by file name. */
  runNames: string[];
  lessons: Lesson[];
  runs: number;
  openComments: number;
  openQuestions: number;
};

export type Board = {
  books: { id: string; title: string; isListed: boolean }[];
  chapters: ChapterRow[];
};

export type ChapterDetail = ChapterRow & {
  plan: string | null;
  runList: { name: string; text: string }[];
  comments: Record<string, unknown>[];
  files: string[];
};

type Manifest = {
  title?: { en?: string };
  books?: string[];
  chapters?: string[];
  concepts?: string[];
};

const readManifest = (dir: string): Manifest => {
  const file = join(dir, "build.yaml");
  if (!existsSync(file)) return {};
  try {
    return (parseYaml(readFileSync(file, "utf8")) as Manifest) ?? {};
  } catch {
    return {};
  }
};

const dirsIn = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => !n.startsWith(".") && n !== "node_modules" && n !== "questions")
        .filter((n) => statSync(join(dir, n)).isDirectory())
        .sort()
    : [];

const titleOf = (name: string): string =>
  name
    .replace(/^ch\d+-/, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/** The plan's front matter and the counts Studio shows, read leniently. */
export function readPlan(file: string): {
  text: string;
  status: PlanStatus;
  approvedOn: string | null;
  source: string | null;
  lessonsPlanned: number;
  plannedLessons: string[];
  openQuestions: number;
} {
  const text = readFileSync(file, "utf8");
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const field = (name: string): string | null => {
    const m = fm === null ? null : new RegExp(`^${name}:\\s*(.+)$`, "m").exec(fm[1] ?? "");
    return m?.[1]?.trim() ?? null;
  };
  const statusRaw = field("status");
  const status = (Object.values(PlanStatus) as string[]).includes(statusRaw ?? "")
    ? (statusRaw as PlanStatus)
    : PlanStatus.Draft;
  const section = (heading: RegExp): string => {
    const lines = text.split("\n");
    const start = lines.findIndex((l) => heading.test(l));
    if (start < 0) return "";
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((l) => /^## /.test(l));
    return (end < 0 ? rest : rest.slice(0, end)).join("\n");
  };
  const count = (body: string, item: RegExp) => body.split("\n").filter((l) => item.test(l)).length;
  const plannedLessons = [
    ...section(/^## Lessons/i).matchAll(/^(?:\d+\.|### \d+\.)\s+\*\*([a-z0-9][a-z0-9-]*)\*\*/gm),
  ].map((m) => m[1] ?? "");
  return {
    text,
    status,
    approvedOn: field("approved"),
    source: field("source"),
    lessonsPlanned: count(section(/^## Lessons/i), /^(\d+\.|### \d+\.|\| \d+ \|)/),
    plannedLessons,
    openQuestions: count(section(/^## Open questions/i), /^\s*[-*\d]/),
  };
}

/** Which chapter each built concept id belongs to, from build/. */
function conceptChapters(root: string): Map<string, { book: string; chapter: string }> {
  const map = new Map<string, { book: string; chapter: string }>();
  const build = join(root, "build");
  for (const book of dirsIn(build)) {
    for (const chapter of dirsIn(join(build, book))) {
      const file = join(build, book, chapter, "chapter.json");
      if (!existsSync(file)) continue;
      try {
        const json = JSON.parse(readFileSync(file, "utf8")) as { concepts?: { id: string }[] };
        for (const c of json.concepts ?? []) map.set(c.id, { book, chapter });
      } catch {}
    }
  }
  return map;
}

function conceptIds(root: string, book: string, chapter: string): Map<string, string> {
  const ids = new Map<string, string>();
  const file = join(root, "build", book, chapter, "chapter.json");
  if (!existsSync(file)) return ids;
  try {
    const json = JSON.parse(readFileSync(file, "utf8")) as {
      concepts?: { id: string; path: string }[];
    };
    for (const c of json.concepts ?? []) ids.set(c.path.split("/")[2] ?? "", c.id);
  } catch {}
  return ids;
}

const readComments = (root: string): Comment[] => listComments(root);

/** Comments on a chapter: the files in its .comments/ folder (plan comments and screen comments). */
function chapterComments(
  comments: Comment[],
  _byConcept: Map<string, { book: string; chapter: string }>,
  book: string,
  chapter: string,
): Comment[] {
  return comments.filter((c) => c.chapter === `${book}/${chapter}`);
}

function chapterRow(
  root: string,
  book: string,
  bookTitle: string,
  chapter: string,
  isListed: boolean,
  comments: Comment[],
  byConcept: Map<string, { book: string; chapter: string }>,
): ChapterRow {
  const dir = join(root, "content", book, chapter);
  const manifest = readManifest(dir);
  const listed = manifest.concepts ?? [];
  const ids = conceptIds(root, book, chapter);
  const lessons: Lesson[] = [];
  const seen = new Set<string>();
  const add = (slug: string) => {
    if (seen.has(slug)) return;
    seen.add(slug);
    const lessonDir = join(dir, slug);
    lessons.push({
      slug,
      title: readManifest(lessonDir).title?.en ?? titleOf(slug),
      isListed: listed.includes(slug),
      isWritten: existsSync(join(lessonDir, "overview.ts")),
      id: ids.get(slug) ?? null,
    });
  };
  for (const slug of listed) add(slug);
  for (const slug of dirsIn(dir)) {
    if (["source", "runs", "lessons", "published"].includes(slug)) continue;
    if (existsSync(join(dir, slug, "build.yaml"))) add(slug);
  }
  const planFile = join(dir, "plan.md");
  const plan = existsSync(planFile) ? readPlan(planFile) : null;
  const runNames = existsSync(join(dir, "runs")) ? readdirSync(join(dir, "runs")).sort() : [];
  const mine = chapterComments(comments, byConcept, book, chapter);
  const row: Omit<ChapterRow, "next"> = {
    book,
    bookTitle,
    chapter,
    title: manifest.title?.en ?? titleOf(chapter),
    isListed,
    status: plan?.status ?? PlanStatus.None,
    approvedOn: plan?.approvedOn ?? null,
    source: plan?.source ?? (existsSync(join(dir, "source")) ? "source/" : null),
    lessonsPlanned: plan?.lessonsPlanned ?? 0,
    plannedLessons: plan?.plannedLessons ?? [],
    runNames,
    lessons,
    runs: runNames.length,
    openComments: mine.filter((c) => c.status !== "done").length,
    openQuestions: plan?.openQuestions ?? 0,
  };
  return { ...row, next: nextStep({ ...row, next: null }) };
}

/** Every book and chapter on disk, listed or not, with where each stands. */
export function studioBoard(root: string): Board {
  const content = join(root, "content");
  const listedBooks = readManifest(content).books ?? [];
  const books = [
    ...listedBooks,
    ...dirsIn(content).filter(
      (b) => !listedBooks.includes(b) && existsSync(join(content, b, "build.yaml")),
    ),
  ].map((id) => ({
    id,
    title: readManifest(join(content, id)).title?.en ?? titleOf(id),
    isListed: listedBooks.includes(id),
  }));
  const comments = readComments(root);
  const byConcept = conceptChapters(root);
  const chapters: ChapterRow[] = [];
  for (const book of books) {
    const dir = join(content, book.id);
    const listed = readManifest(dir).chapters ?? [];
    const all = [...listed, ...dirsIn(dir).filter((c) => !listed.includes(c))];
    for (const chapter of all) {
      const cdir = join(dir, chapter);
      if (!existsSync(join(cdir, "build.yaml")) && !existsSync(join(cdir, "plan.md"))) continue;
      chapters.push(
        chapterRow(
          root,
          book.id,
          book.title,
          chapter,
          listed.includes(chapter),
          comments,
          byConcept,
        ),
      );
    }
  }
  return { books, chapters };
}

/** One chapter with its plan, runs and comments. */
export function studioChapter(root: string, book: string, chapter: string): ChapterDetail | null {
  const dir = join(root, "content", book, chapter);
  if (!existsSync(dir)) return null;
  const content = join(root, "content");
  const bookManifest = readManifest(join(content, book));
  const comments = readComments(root);
  const byConcept = conceptChapters(root);
  const row = chapterRow(
    root,
    book,
    bookManifest.title?.en ?? titleOf(book),
    chapter,
    (bookManifest.chapters ?? []).includes(chapter),
    comments,
    byConcept,
  );
  const planFile = join(dir, "plan.md");
  const runsDir = join(dir, "runs");
  const sourceDir = join(dir, "source");
  return {
    ...row,
    plan: existsSync(planFile) ? readFileSync(planFile, "utf8") : null,
    runList: existsSync(runsDir)
      ? readdirSync(runsDir)
          .sort()
          .reverse()
          .map((name) => ({ name, text: readFileSync(join(runsDir, name), "utf8") }))
      : [],
    comments: chapterComments(comments, byConcept, book, chapter),
    files: existsSync(sourceDir) ? readdirSync(sourceDir).sort() : [],
  };
}

/** Move a plan between draft and approved; the only edit Studio makes to a plan. */
export function setPlanStatus(
  root: string,
  book: string,
  chapter: string,
  status: typeof PlanStatus.Approved | typeof PlanStatus.Draft,
): string {
  const file = join(root, "content", book, chapter, "plan.md");
  if (!existsSync(file)) throw new Error("no plan.md");
  let text = readFileSync(file, "utf8");
  if (!/^---\n[\s\S]*?\n---\n/.test(text)) text = `---\nstatus: draft\n---\n\n${text}`;
  const today = new Date().toISOString().slice(0, 10);
  text = text.replace(/^status:.*$/m, `status: ${status}`);
  if (status === PlanStatus.Approved) {
    text = /^approved:/m.test(text)
      ? text.replace(/^approved:.*$/m, `approved: ${today}`)
      : text.replace(/^(status:.*\n)/m, `$1approved: ${today}\n`);
  }
  writeFileSync(file, text);
  return text;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/**
 * A dropped source: a new or existing book, a new or existing chapter, one file into its
 * `source/`, and a queued plan.md if the chapter has none. The build manifests are not touched:
 * the plan skill lists the chapter and its lessons once there is a plan.
 */
export function dropSource(
  root: string,
  drop: {
    book: string;
    bookTitle?: string;
    chapter: string;
    chapterTitle?: string;
    fileName: string;
    base64: string;
  },
): { book: string; chapter: string } {
  const book = slugify(drop.book);
  const chapter = slugify(drop.chapter);
  if (book === "" || chapter === "" || drop.fileName.trim() === "")
    throw new Error("book, chapter and a file are needed");
  const content = join(root, "content");
  const bookDir = join(content, book);
  if (!existsSync(join(bookDir, "build.yaml"))) {
    mkdirSync(bookDir, { recursive: true });
    const title = (drop.bookTitle ?? drop.book).replace(/"/g, "'");
    writeFileSync(
      join(bookDir, "build.yaml"),
      `title: { en: "${title}", hi: "${title}" }\n# Chapters in book order. A chapter is added here by its plan.\nchapters: []\n`,
    );
  }
  const dir = join(bookDir, chapter);
  mkdirSync(join(dir, "source"), { recursive: true });
  const safeName = drop.fileName.replace(/[^A-Za-z0-9._-]+/g, "-");
  writeFileSync(join(dir, "source", safeName), Buffer.from(drop.base64, "base64"));
  const planFile = join(dir, "plan.md");
  if (!existsSync(planFile)) {
    const title = drop.chapterTitle ?? titleOf(chapter);
    writeFileSync(
      planFile,
      `---\nstatus: queued\nsource: source/\n---\n\n# ${title} (plan)\n\nQueued: run the \`plan-chapter\` skill on \`content/${book}/${chapter}\`.\n`,
    );
  }
  return { book, chapter };
}

/** The dev-server middleware: GET /dev-studio/board, GET /dev-studio/chapter?book=&chapter=, POST /dev-studio/{approve,reopen,drop}. */
export function studioMiddleware(root: string) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://x");
    const send = (status: number, body: unknown) => {
      res.statusCode = status;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(body));
    };
    const fail = (e: unknown) => send(400, { error: e instanceof Error ? e.message : String(e) });
    try {
      if (req.method === "GET" && url.pathname === "/board") return send(200, studioBoard(root));
      if (req.method === "GET" && url.pathname === "/runs") return send(200, runs());
      if (req.method === "GET" && url.pathname === "/chapter") {
        const detail = studioChapter(
          root,
          url.searchParams.get("book") ?? "",
          url.searchParams.get("chapter") ?? "",
        );
        return detail === null ? send(404, { error: "no such chapter" }) : send(200, detail);
      }
    } catch (e) {
      return fail(e);
    }
    if (req.method !== "POST") return send(404, { error: "not found" });
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}") as Record<string, string>;
        if (url.pathname === "/approve" || url.pathname === "/reopen") {
          const status = url.pathname === "/approve" ? PlanStatus.Approved : PlanStatus.Draft;
          setPlanStatus(root, data.book ?? "", data.chapter ?? "", status);
          return send(200, studioChapter(root, data.book ?? "", data.chapter ?? ""));
        }
        if (url.pathname === "/run") {
          const step = data.step as Step | undefined;
          if (step !== undefined && !steps.includes(step)) throw new Error(`no such step: ${step}`);
          const detail = studioChapter(root, data.book ?? "", data.chapter ?? "");
          if (detail === null) throw new Error("no such chapter");
          const chosen: { step: Step; lesson?: string } | null =
            step !== undefined
              ? { step, ...(data.lesson ? { lesson: data.lesson } : {}) }
              : detail.next === null
                ? null
                : {
                    step: detail.next.step,
                    ...(detail.next.lesson ? { lesson: detail.next.lesson } : {}),
                  };
          if (chosen === null) throw new Error("nothing to run: the chapter waits for you");
          return send(
            200,
            startRun(root, { book: detail.book, chapter: detail.chapter, ...chosen }),
          );
        }
        if (url.pathname === "/stop") return send(200, stopRun());
        if (url.pathname === "/drop") {
          const where = dropSource(root, {
            book: data.book ?? "",
            bookTitle: data.bookTitle,
            chapter: data.chapter ?? "",
            chapterTitle: data.chapterTitle,
            fileName: data.fileName ?? "",
            base64: data.base64 ?? "",
          });
          return send(200, where);
        }
        send(404, { error: "not found" });
      } catch (e) {
        fail(e);
      }
    });
  };
}
