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
import {
  type Filed as Comment,
  isUnanswered,
  readComments as readAll,
} from "../../studio/src/comments";
import {
  FILES,
  type FileState,
  type Step as PipelineStep,
  approve,
  readChapter,
  readFlow,
  splitFront,
} from "../../studio/src/pipeline";
import { type Next, type Step, nextStep, runs, startRun, steps, stopRun } from "./dev-runner";

/**
 * Where a chapter's planning stands, from its planning files (studio/src/pipeline.ts): none yet,
 * a draft (a file missing, not approved, changed, failing its checks or to be checked again), or
 * approved through the props match.
 */
export const PlanStatus = {
  None: "none",
  Draft: "draft",
  Approved: "approved",
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
  /** Lessons the flow lists (its `## <lesson>` headings). */
  lessonsPlanned: number;
  /** Their slugs, in order. */
  plannedLessons: string[];
  /** The notes in runs/, by file name. */
  runNames: string[];
  lessons: Lesson[];
  runs: number;
  openComments: number;
  /** Threads on the planning files still waiting on a fixer: a gate's questions among them. */
  openQuestions: number;
};

export type Board = {
  books: { id: string; title: string; isListed: boolean }[];
  chapters: ChapterRow[];
};

/** One planning file as Studio shows it: its state (pipeline.ts) and its words. */
export type PlanningFile = FileState & { isApproved: boolean; text: string | null };

export type ChapterDetail = ChapterRow & {
  pipeline: PlanningFile[];
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

/**
 * Where a chapter's authoring lives (its planning files, run notes and source as handed over):
 * under authoring/books/, apart from content/, which holds only what is built.
 */
export const authoringOf = (root: string, book: string, chapter: string): string =>
  join(root, "authoring", "books", book, chapter);

/** Which chapter each built concept id belongs to, from build/. */
function conceptChapters(root: string): Map<string, { book: string; chapter: string }> {
  const map = new Map<string, { book: string; chapter: string }>();
  const build = join(root, "build");
  for (const book of dirsIn(build)) {
    for (const chapter of dirsIn(join(build, book))) {
      const file = join(build, book, `${chapter}.json`);
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
  const file = join(root, "build", book, `${chapter}.json`);
  if (!existsSync(file)) return ids;
  try {
    const json = JSON.parse(readFileSync(file, "utf8")) as {
      concepts?: { id: string; path: string }[];
    };
    for (const c of json.concepts ?? []) ids.set(c.path.split("/")[2] ?? "", c.id);
  } catch {}
  return ids;
}

const readComments = (root: string): Comment[] => readAll(root).threads;

/** Comments on a chapter: those filed in its comments.yaml (plan comments and screen comments). */
function chapterComments(
  comments: Comment[],
  _byConcept: Map<string, { book: string; chapter: string }>,
  book: string,
  chapter: string,
): Comment[] {
  return comments.filter((c) => c.home === `content/${book}/${chapter}`);
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
  for (const slug of dirsIn(dir)) if (existsSync(join(dir, slug, "build.yaml"))) add(slug);
  const authoring = authoringOf(root, book, chapter);
  const planning = readChapter(root, book, chapter);
  const hasPlanning = planning.files.some((f) => f.status !== "missing");
  const isApproved = planning.files.every(
    (f) => f.status === "approved" && f.problems.length === 0 && f.recheck.length === 0,
  );
  const flowFile = join(authoring, "flow.md");
  const plannedLessons = existsSync(flowFile)
    ? [...new Set(readFlow(splitFront(readFileSync(flowFile, "utf8")).body).map((b) => b.lesson))]
    : [];
  const runNames = existsSync(join(authoring, "runs"))
    ? readdirSync(join(authoring, "runs")).sort()
    : [];
  const mine = chapterComments(comments, byConcept, book, chapter);
  const row: Omit<ChapterRow, "next"> = {
    book,
    bookTitle,
    chapter,
    title: manifest.title?.en ?? titleOf(chapter),
    isListed,
    status: !hasPlanning ? PlanStatus.None : isApproved ? PlanStatus.Approved : PlanStatus.Draft,
    approvedOn: planning.files.at(-1)?.approvedAt ?? null,
    source: existsSync(join(authoring, "source")) ? "source/" : null,
    lessonsPlanned: plannedLessons.length,
    plannedLessons,
    runNames,
    lessons,
    runs: runNames.length,
    openComments: mine.filter(isUnanswered).length,
    openQuestions: mine.filter(
      (c) =>
        c.board === undefined &&
        (c.source ?? "").startsWith(`authoring/books/${book}/${chapter}/`) &&
        isUnanswered(c),
    ).length,
  };
  return { ...row, next: nextStep({ ...row, next: null }, planning.files) };
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
    const all = [
      ...new Set([...listed, ...dirsIn(dir), ...dirsIn(join(root, "authoring", "books", book.id))]),
    ];
    for (const chapter of all) {
      const isBuilt = existsSync(join(dir, chapter, "build.yaml"));
      if (!isBuilt && !existsSync(authoringOf(root, book.id, chapter))) continue;
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
  const authoring = authoringOf(root, book, chapter);
  if (!existsSync(dir) && !existsSync(authoring)) return null;
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
  const runsDir = join(authoring, "runs");
  const sourceDir = join(authoring, "source");
  const planning = readChapter(root, book, chapter);
  return {
    ...row,
    pipeline: planning.files.map((f) => {
      const file = join(authoring, f.file);
      return {
        ...f,
        isApproved: FILES.find((x) => x.step === f.step)?.isApproved ?? false,
        text: existsSync(file) ? readFileSync(file, "utf8") : null,
      };
    }),
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

/**
 * The person approves a planning file (pipeline.ts `approve`: in order, committed, its checks
 * holding), or takes an approval back (its `approved:` line removed): the only edits Studio makes
 * to them.
 */
export function setApproval(
  root: string,
  book: string,
  chapter: string,
  step: PipelineStep,
  isApproved: boolean,
): void {
  if (isApproved) {
    approve(root, book, chapter, step);
    return;
  }
  const spec = FILES.find((f) => f.step === step);
  if (spec === undefined || !spec.isApproved) throw new Error(`nothing to reopen: ${step}`);
  const file = join(authoringOf(root, book, chapter), spec.file);
  if (!existsSync(file)) throw new Error(`no ${spec.file}`);
  const { front, body } = splitFront(readFileSync(file, "utf8"));
  const { approved: _, ...rest } = front;
  const lines = Object.entries(rest).map(([k, v]) => `${k}: ${v}`);
  writeFileSync(
    file,
    lines.length > 0 ? `---\n${lines.join("\n")}\n---\n${body}` : body.replace(/^\n/, ""),
  );
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/**
 * A dropped source: a new or existing book, a new or existing chapter, one file into its
 * `source/` (under authoring/books/<book>/<chapter>). With no brief yet, the chapter's next step is
 * to plan it. The build manifests are not touched:
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
  const dir = authoringOf(root, book, chapter);
  mkdirSync(join(dir, "source"), { recursive: true });
  const safeName = drop.fileName.replace(/[^A-Za-z0-9._-]+/g, "-");
  writeFileSync(join(dir, "source", safeName), Buffer.from(drop.base64, "base64"));
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
          setApproval(
            root,
            data.book ?? "",
            data.chapter ?? "",
            (data.step ?? "") as PipelineStep,
            url.pathname === "/approve",
          );
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
