import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Locale } from "@chalk/content";
import { parse as parseYaml } from "yaml";
import { GUIDE, readComments, waitsOn } from "./comments";
import { type BoardChange, changesUnder } from "./reviewed";
import { checkExtract } from "./source/extract";
import { readYaml } from "./source/files";
import { SourceFile, type Item as SourceItem, itemsSchema } from "./source/schema";

/**
 * A chapter's planning files (platform/docs/authoring-pipeline.md), in authoring/books/<book>/<chapter>/:
 * `plan.md` (the intent, the one file the person approves: `approved: <commit>` in its front
 * matter, written only when he does; plain words, no ids) and `boards.md` (the agent's detail,
 * never approved: each board and family cites the English book's items, `source/en/items.yaml`,
 * and the items left out are skipped there with why). Each is checked by the machine: what is
 * read and cited holds together, and the build follows the plan. Nothing else is stored: whether
 * the plan changed since it was approved, and whether what it is written from changed since, are
 * worked out from git each time; each board's state (built, reviewed) from the build.
 */

export const Step = {
  Plan: "plan",
  Boards: "boards",
} as const;
export type Step = (typeof Step)[keyof typeof Step];

/** The files, in order. Only the plan is approved by the person; boards.md is the machine's. */
export const FILES: readonly { step: Step; file: string; isApprovable: boolean }[] = [
  { step: Step.Plan, file: "plan.md", isApprovable: true },
  { step: Step.Boards, file: "boards.md", isApprovable: false },
];

/** Where a chapter's source is: the English book's extract (platform/docs/plans/sources.md). */
export const SOURCE_DIR = join("source", "en");

/** The English book's items, which boards.md cites. */
export const ITEMS_FILE = join(SOURCE_DIR, SourceFile.Items);

/**
 * What each file is written from: an approved file whose sources changed since it was approved is
 * to be checked again.
 */
const READS: Readonly<Record<Step, readonly string[]>> = {
  [Step.Plan]: [ITEMS_FILE],
  [Step.Boards]: [],
};

/** What a prop in the plan is: used as it is, given something new, or made. */
export const Verdict = { Reuse: "reuse", Extend: "extend", New: "new" } as const;
export type Verdict = (typeof Verdict)[keyof typeof Verdict];
const VERDICTS: readonly string[] = Object.values(Verdict);

/** The sections plan.md has, each a `## ` heading. `Skipped` is optional. */
export const PLAN_SECTIONS = [
  "Goal",
  "Objectives",
  "Story",
  "Lessons",
  "Chapter art",
  "Props",
  "Question families",
] as const;

// ---- Reading the files ----

/** A markdown file's front matter (`key: value` lines) and its body. */
export function splitFront(text: string): { front: Record<string, string>; body: string } {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (m === null) return { front: {}, body: text };
  const front: Record<string, string> = {};
  for (const line of (m[1] ?? "").split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv?.[1] !== undefined) front[kv[1]] = (kv[2] ?? "").trim();
  }
  return { front, body: text.slice(m[0].length) };
}

/** The ids a line cites: the last bracketed group, split on commas and semicolons. */
const citesOf = (line: string): string[] => {
  const groups = [...line.matchAll(/\(([^()]*)\)/g)];
  const last = groups.at(-1)?.[1];
  return last === undefined
    ? []
    : last
        .split(/[,;]/)
        .map((x) => x.trim())
        .filter((x) => /^[\w.-]+$/.test(x));
};

/** A markdown body's `## ` sections, by heading in lower case: the lines under each. */
export function sectionsOf(body: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  let at: string[] | undefined;
  for (const line of body.split("\n")) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h?.[1] !== undefined) {
      at = [];
      out.set(h[1].toLowerCase(), at);
    } else at?.push(line);
  }
  return out;
}

/** An item of a list: `- **<id>** its words. (what it cites)`. */
export type Item = { id: string; text: string; cites: string[] };

/** The list items in some lines: `- **read-it** reads a marked point. (o6, o7)`. */
export function readItems(lines: readonly string[]): Item[] {
  const out: Item[] = [];
  for (const line of lines) {
    const m = /^\s*-\s+\*\*([\w.-]+)\*\*:?\s*(.*)$/.exec(line);
    if (m?.[1] !== undefined) out.push({ id: m[1], text: m[2] ?? "", cites: citesOf(m[2] ?? "") });
  }
  return out;
}

/** A lesson in the plan: `### <slug>  (o1, o2)`, its slug as in build.yaml. */
export type PlanLesson = { slug: string; cites: string[] };

export type Plan = {
  goal: string;
  objectives: Item[];
  lessons: PlanLesson[];
  /** The question families, by their folder under questions/, each citing objectives. */
  families: Item[];
  /** The props, each `- **reuse|extend|new** <prop>: …`. */
  props: Item[];
  /** Sections plan.md must have and hasn't. */
  missing: string[];
};

/** plan.md's body, by its sections (PLAN_SECTIONS). */
export function readPlan(body: string): Plan {
  const sections = sectionsOf(body);
  const lines = (name: string) => sections.get(name.toLowerCase()) ?? [];
  const lessons: PlanLesson[] = [];
  for (const line of lines("Lessons")) {
    const l = /^###\s+([\w-]+)\s*(.*)$/.exec(line);
    if (l?.[1] !== undefined) lessons.push({ slug: l[1], cites: citesOf(l[2] ?? "") });
  }
  return {
    goal: lines("Goal").join(" ").trim(),
    objectives: readItems(lines("Objectives")),
    lessons,
    families: readItems(lines("Question families")),
    props: readItems(lines("Props")),
    missing: PLAN_SECTIONS.filter((s) => !sections.has(s.toLowerCase())),
  };
}

/**
 * A board, or a question family (`questions/<family>`), in boards.md: the lesson it is in (its
 * `## ` heading), what its own heading cites (objectives; the book's items), and its lines.
 */
export type BoardPlan = {
  lesson: string;
  id: string;
  cites: string[];
  purpose?: string;
  needs?: string;
};

/** `## <lesson>`, then `### <board>  (o5, o9; 3.2, 3.3)` with `Purpose:`, `Beat:`, `Needs:`, `Props:`. */
export function readBoards(body: string): BoardPlan[] {
  const out: BoardPlan[] = [];
  let lesson = "";
  for (const line of body.split("\n")) {
    const l = /^##\s+([\w-]+)\s*$/.exec(line);
    if (l?.[1] !== undefined) lesson = l[1];
    const b = /^###\s+([\w/-]+)\s*(.*)$/.exec(line);
    if (b?.[1] !== undefined) out.push({ lesson, id: b[1], cites: citesOf(b[2] ?? "") });
    const last = out.at(-1);
    const field = /^(Purpose|Needs):\s*(.*)$/.exec(line);
    if (field !== null && last !== undefined) {
      if (field[1] === "Purpose") last.purpose = field[2] ?? "";
      else last.needs = field[2] ?? "";
    }
  }
  return out;
}

/** A family's entry in boards.md is `questions/<family>`. */
export const FAMILY_PREFIX = "questions/";

/** The items boards.md leaves out, each with why: `## Skipped`, `- **3.12** why.` */
export const readSkips = (body: string): Item[] => readItems(sectionsOf(body).get("skipped") ?? []);

/**
 * The item ids plan.md names: a list item's bold id, or a citation closing a heading or a line
 * (`… a line. (1.2)`). The person reads it, so it names the book's items as the book does.
 */
export function idsIn(body: string, ids: ReadonlySet<string>): string[] {
  const found = new Set<string>();
  for (const line of body.split("\n")) {
    const bold = /^\s*-\s+\*\*([\w.-]+)\*\*/.exec(line)?.[1];
    const isCited = /^#{2,}\s/.test(line) || /[.:;]\s*\([^()]*\)\s*$/.test(line);
    for (const x of [bold, ...(isCited ? citesOf(line) : [])])
      if (x !== undefined && ids.has(x)) found.add(x);
  }
  return [...found];
}

/**
 * The items not covered: neither cited nor skipped. A section or an exercise is covered when any
 * item in it is.
 */
export function uncovered(items: readonly SourceItem[], covered: ReadonlySet<string>): string[] {
  const all = [...covered];
  return items
    .filter((i) => !covered.has(i.id) && !all.some((c) => c.startsWith(`${i.id}.`)))
    .map((i) => i.id);
}

const sourceChecked = new Map<string, { key: string; problems: string[] }>();

/**
 * What is wrong with a chapter's English extract (source/check.ts), worked out again only when
 * one of its files changed: the checks read the book's PDF.
 */
export function sourceProblems(root: string, dir: string): string[] {
  const abs = join(root, dir, SOURCE_DIR);
  if (!existsSync(join(abs, SourceFile.Book)))
    return ["not extracted yet (pnpm source <book>/<chapter> en <pdf>)"];
  // The page files too: editing one changes no folder's time.
  const pages = join(abs, SourceFile.Pages);
  const key = [
    ...Object.values(SourceFile).map((f) => join(abs, f)),
    ...(existsSync(pages) ? readdirSync(pages).map((f) => join(pages, f)) : []),
  ]
    .map((f) => (existsSync(f) ? statSync(f).mtimeMs : 0))
    .join(",");
  const known = sourceChecked.get(abs);
  if (known?.key === key) return known.problems;
  const { problems } = checkExtract({ dir: abs, rel: join(dir, SOURCE_DIR), lang: Locale.En });
  sourceChecked.set(abs, { key, problems });
  return problems;
}

/**
 * The build against the plan: build.yaml's concepts are the plan's lessons, in its order (a part
 * while they are built; all of them once the chapter is ready), each with its art.tsx (its card);
 * a ready chapter has its own art.tsx (its tile) too.
 */
export function checkBuild(
  root: string,
  book: string,
  chapter: string,
  lessons: readonly string[],
  isReady: boolean,
): string[] {
  const dir = join(root, "content", book, chapter);
  const built = conceptsOf(root, book, chapter);
  const problems: string[] = [];
  let last = -1;
  for (const slug of built) {
    const at = lessons.indexOf(slug);
    if (at === -1) problems.push(`build.yaml has ${slug}: not a lesson in plan.md`);
    else if (at < last) problems.push(`build.yaml has ${slug} out of the plan's order`);
    else last = at;
    if (!existsSync(join(dir, slug, "art.tsx"))) problems.push(`${slug} has no art.tsx (its card)`);
  }
  if (isReady) {
    const left = lessons.filter((l) => !built.includes(l));
    if (left.length > 0)
      problems.push(`the chapter is ready, but build.yaml doesn't have ${left.join(", ")}`);
    if (!existsSync(join(dir, "art.tsx")))
      problems.push("the chapter is ready, but has no art.tsx (its tile)");
  }
  return problems;
}

/** The concepts (lessons) a chapter's build.yaml lists, in order; none when it has none. */
function conceptsOf(root: string, book: string, chapter: string): string[] {
  const manifest = join(root, "content", book, chapter, "build.yaml");
  if (!existsSync(manifest)) return [];
  try {
    const raw = parseYaml(readFileSync(manifest, "utf8")) as { concepts?: unknown };
    return Array.isArray(raw.concepts) ? raw.concepts.map(String) : [];
  } catch {
    return [];
  }
}

// ---- A chapter's files, their gates, and what they reach ----

/** A failing check, and the id it is about (an objective, a board, an item), when one. */
export type Problem = { text: string; about?: string };

export type FileState = {
  step: Step;
  file: string;
  /** Whether the person approves it (plan.md); the others are the machine's alone. */
  isApprovable: boolean;
  /** missing; draft (not approved); approved; changed (since it was approved). */
  status: "missing" | "draft" | "approved" | "changed";
  approvedAt?: string;
  /** Where its gate fails: the machine's checks of what it reads and cites, each with the id it is about. */
  problems: Problem[];
  /** Approved, but a file it is written from changed since: which (`source/en/items.yaml`). */
  recheck: string[];
  /** Waiting on the person's approval, but it can't be given yet: why (`approvalBlocker`). */
  blocked?: string;
};

/**
 * A built lesson, and whether a reviewer has looked at it since it last changed: a lesson with a
 * board new or changed since it was passed (reviewed.ts) is to be self-reviewed before the person
 * sees it.
 */
export type LessonState = { slug: string; isToSelfReview: boolean; why?: string };

/** Where a board (or question family) of boards.md stands, worked out from the build, never written. */
export const BoardStatus = {
  /** In boards.md, not built. */
  Planned: "planned",
  /** In the build. */
  Built: "built",
  /** In the build, and passed by a reviewer as it is built now (`changesUnder`). */
  Reviewed: "reviewed",
} as const;
export type BoardStatus = (typeof BoardStatus)[keyof typeof BoardStatus];

/**
 * A board's (or family's) state. "Waiting" (on a new prop whose showing thread the person hasn't
 * closed) isn't worked out yet: a thread doesn't say which prop it shows.
 */
export type BoardState = { lesson: string; id: string; status: BoardStatus };

export type Chapter = {
  book: string;
  chapter: string;
  dir: string;
  files: FileState[];
  lessons: LessonState[];
  /** Each board and family in boards.md, in its order, and where it stands. */
  boards: BoardState[];
};

/** Each lesson the chapter builds, and whether it waits on a self-review (see `LessonState`). */
export function readLessons(
  root: string,
  book: string,
  chapter: string,
  changes?: readonly BoardChange[],
): LessonState[] {
  const slugs = conceptsOf(root, book, chapter);
  if (slugs.length === 0) return [];
  const all = changes ?? changesUnder(root, `${book}/${chapter}`);
  // A lesson waits on a self-review while any of its boards is new or changed since it was passed
  // (reviewed.ts: the board as built now, against its record when passed).
  return slugs.map((slug) => {
    const pending = all.filter(
      (c) =>
        c.board.startsWith(`${book}/${chapter}/${slug}/`) &&
        (c.status === "new" || c.status === "changed" || c.status === "gone"),
    );
    if (pending.length === 0) return { slug, isToSelfReview: false };
    const names = pending.map((c) => `${c.board.split("/").at(-1)} (${c.status})`).join(", ");
    return { slug, isToSelfReview: true, why: names };
  });
}

/**
 * Where each board and family of boards.md stands, from the build: a lesson's board is built as
 * `<book>/<chapter>/<lesson>/<board>`; a family as its questions under `<book>/<chapter>/questions/<family>/`.
 */
export function boardStates(
  book: string,
  chapter: string,
  boards: readonly BoardPlan[],
  changes: readonly BoardChange[],
): BoardState[] {
  return boards.map(({ lesson, id }) => {
    const key = id.startsWith(FAMILY_PREFIX)
      ? `${book}/${chapter}/${id}`
      : `${book}/${chapter}/${lesson}/${id}`;
    const mine = changes.filter(
      (c) => c.status !== "gone" && (c.board === key || c.board.startsWith(`${key}/`)),
    );
    const status =
      mine.length === 0
        ? BoardStatus.Planned
        : mine.every((c) => c.status === "unchanged")
          ? BoardStatus.Reviewed
          : BoardStatus.Built;
    return { lesson, id, status };
  });
}

const git = (root: string, ...args: string[]): string | undefined => {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return undefined;
  }
};

/** A file as it was at a commit (repo-relative), or undefined when it wasn't there. */
const atCommit = (root: string, commit: string, rel: string) =>
  git(root, "show", `${commit}:${rel}`);

/** What of a file a later one is written from: its body. */
function content(text: string | undefined): string | undefined {
  return text === undefined ? undefined : splitFront(text).body.trim();
}

/**
 * Approvals committed together with edits: an `approved:` line is the person's word on the text
 * they read, so the commit that brings it changes nothing else in the file. Committed alongside an
 * edit, history can't say which text was approved. Only approvals already committed are checked.
 */
export function stampProblems(root: string, chapters: readonly Chapter[]): string[] {
  const out: string[] = [];
  for (const c of chapters)
    for (const f of c.files) {
      const rel = join(c.dir, f.file);
      const committed = atCommit(root, "HEAD", rel);
      const stamp = committed === undefined ? undefined : splitFront(committed).front.approved;
      if (stamp === undefined || stamp === "") continue;
      // The oldest commit whose file has this line: the one that brought it.
      const brought = (git(root, "log", "--format=%H", "-S", `approved: ${stamp}`, "--", rel) ?? "")
        .trim()
        .split("\n")
        .at(-1);
      if (brought === undefined || brought === "") continue;
      if (content(atCommit(root, brought, rel)) !== content(atCommit(root, `${brought}^`, rel)))
        out.push(
          `${rel}: its approval (approved: ${stamp}) was committed together with changes to its text, in ${brought.slice(0, 12)}: an approval is committed alone`,
        );
    }
  return out;
}

/** Everything about one chapter's planning files. */
export function readChapter(root: string, book: string, chapter: string): Chapter {
  const dir = join("authoring", "books", book, chapter);
  const abs = join(root, dir);
  const read = (file: string) => {
    const p = join(abs, file);
    return existsSync(p) ? readFileSync(p, "utf8") : undefined;
  };
  const texts = Object.fromEntries(FILES.map((f) => [f.step, read(f.file)])) as Record<
    Step,
    string | undefined
  >;
  const items = readYaml(join(abs, ITEMS_FILE), itemsSchema).value ?? [];
  const itemIds = new Set(items.map((i) => i.id));
  const planText = splitFront(texts.plan ?? "");
  const plan = readPlan(planText.body);
  const isReady = planText.front.ready === "true";
  const objectiveIds = new Set(plan.objectives.map((o) => o.id));
  const lessonSlugs = plan.lessons.map((l) => l.slug);
  const familyIds = new Set(plan.families.map((f) => `${FAMILY_PREFIX}${f.id}`));
  const boardsBody = splitFront(texts.boards ?? "").body;
  const boards = readBoards(boardsBody);

  const gate: Record<Step, Problem[]> = { plan: [], boards: [] };

  // plan.md: its sections; no ids; lessons and families cite objectives it has; props have a verdict.
  if (texts.plan !== undefined) {
    const p = gate.plan;
    for (const s of plan.missing) p.push({ text: `plan.md has no "## ${s}"` });
    if (!plan.missing.includes("Goal") && plan.goal === "") p.push({ text: "the goal is empty" });
    for (const id of idsIn(planText.body, itemIds))
      p.push({
        text: `plan.md has no ids: ${id} is an item's (name it as the book does; boards.md cites it)`,
        about: id,
      });
    const seen = new Set<string>();
    for (const o of plan.objectives) {
      if (seen.has(o.id)) p.push({ text: `${o.id} is listed twice`, about: o.id });
      seen.add(o.id);
    }
    const lessonsSeen = new Set<string>();
    for (const l of plan.lessons) {
      if (lessonsSeen.has(l.slug))
        p.push({ text: `lesson ${l.slug} is listed twice`, about: l.slug });
      lessonsSeen.add(l.slug);
      if (!l.cites.some((c) => objectiveIds.has(c)))
        p.push({ text: `lesson ${l.slug} serves no objective`, about: l.slug });
      for (const c of l.cites)
        if (!objectiveIds.has(c))
          p.push({ text: `lesson ${l.slug} cites ${c}: not an objective`, about: l.slug });
    }
    for (const f of plan.families) {
      if (!f.cites.some((c) => objectiveIds.has(c)))
        p.push({ text: `family ${f.id} tests no objective`, about: f.id });
      for (const c of f.cites)
        if (!objectiveIds.has(c))
          p.push({ text: `family ${f.id} cites ${c}: not an objective`, about: f.id });
    }
    for (const r of plan.props)
      if (!VERDICTS.includes(r.id))
        p.push({
          text: `"${r.id}" isn't a prop's verdict: one of ${VERDICTS.join(", ")}`,
          about: r.id,
        });
  }

  // boards.md: each board and family is in a lesson of the plan, serves its objectives and cites
  // items there are; every objective is served; every item is cited or skipped, with why; the
  // families are the plan's; and the build follows the plan.
  if (texts.boards !== undefined) {
    const p = gate.boards;
    const seen = new Set<string>();
    for (const b of boards) {
      if (seen.has(b.id)) p.push({ text: `${b.id} is listed twice`, about: b.id });
      seen.add(b.id);
      if (!lessonSlugs.includes(b.lesson))
        p.push({
          text: `${b.id} is under ${b.lesson === "" ? "no lesson" : b.lesson}: not a lesson in plan.md`,
          about: b.id,
        });
      if (b.id.startsWith(FAMILY_PREFIX) && !familyIds.has(b.id))
        p.push({ text: `${b.id} isn't a question family in plan.md`, about: b.id });
      if (!b.cites.some((c) => objectiveIds.has(c)))
        p.push({ text: `${b.id} serves no objective`, about: b.id });
      for (const c of b.cites)
        if (!objectiveIds.has(c) && !itemIds.has(c))
          p.push({
            text: `${b.id} cites ${c}: not an objective or an item of ${ITEMS_FILE}`,
            about: b.id,
          });
      if (b.purpose === undefined || b.purpose.trim() === "")
        p.push({ text: `${b.id} says nothing of what it is for (Purpose:)`, about: b.id });
      if (b.needs === undefined || b.needs.trim() === "")
        p.push({ text: `${b.id} says nothing it needs (Needs:)`, about: b.id });
    }
    for (const f of familyIds)
      if (!seen.has(f)) p.push({ text: `${f} is in plan.md, not in boards.md` });
    const served = new Set(boards.flatMap((b) => b.cites));
    for (const o of plan.objectives)
      if (!served.has(o.id)) p.push({ text: `no board or family serves ${o.id}` });
    const skips = readSkips(boardsBody);
    for (const s of skips) {
      if (!itemIds.has(s.id))
        p.push({ text: `${s.id} is skipped, but isn't an item of ${ITEMS_FILE}`, about: s.id });
      else if (served.has(s.id))
        p.push({ text: `${s.id} is skipped, but a board cites it`, about: s.id });
      if (s.text.trim() === "")
        p.push({ text: `${s.id} is skipped without a reason`, about: s.id });
    }
    const left = uncovered(items, new Set([...served, ...skips.map((s) => s.id)]));
    if (left.length > 0)
      p.push({
        text: `no board or family cites ${left.join(", ")}, and it isn't skipped ("## Skipped": "- **<id>** why")`,
      });
    p.push(...checkBuild(root, book, chapter, lessonSlugs, isReady).map((text) => ({ text })));
  }

  const files: FileState[] = FILES.map(({ step, file, isApprovable }) => {
    const text = texts[step];
    const rel = join(dir, file);
    if (text === undefined)
      return { step, file, isApprovable, status: "missing", problems: [], recheck: [] };
    const approvedAt = isApprovable ? splitFront(text).front.approved : undefined;
    const base = { step, file, isApprovable, problems: gate[step] };
    if (!isApprovable) return { ...base, status: "approved", recheck: [] };
    if (approvedAt === undefined || approvedAt === "")
      return { ...base, status: "draft", recheck: [] };
    const then = atCommit(root, approvedAt, rel);
    const isChanged =
      then === undefined || splitFront(then).body.trim() !== splitFront(text).body.trim();
    // A file it is written from that changed since this one was approved.
    const recheck = READS[step].filter(
      (from) => content(atCommit(root, approvedAt, join(dir, from))) !== content(read(from)),
    );
    return { ...base, status: isChanged ? "changed" : "approved", approvedAt, recheck };
  });
  // One reading of the build for the lessons and the boards: what changed since each was passed.
  const changes = existsSync(join(root, "content", book, chapter, "build.yaml"))
    ? changesUnder(root, `${book}/${chapter}`)
    : [];
  const whole: Chapter = {
    book,
    chapter,
    dir,
    files,
    lessons: readLessons(root, book, chapter, changes),
    boards: boardStates(book, chapter, boards, changes),
  };
  // What stands in the way of each approval the person is asked for: the same rule approve() keeps.
  for (const f of files) {
    const isAsked =
      f.isApprovable && f.status !== "missing" && (f.status !== "approved" || f.recheck.length > 0);
    if (!isAsked) continue;
    const why = approvalBlocker(root, whole, f.step);
    if (why !== undefined) f.blocked = why;
  }
  return whole;
}

/** Every chapter with planning files. */
export function readChapters(root: string): Chapter[] {
  const books = join(root, "authoring", "books");
  if (!existsSync(books)) return [];
  const dirs = (d: string) =>
    readdirSync(d, { withFileTypes: true })
      // "guide" is a level's guide folder, never a book or a chapter.
      .filter((x) => x.isDirectory() && x.name !== GUIDE)
      .map((x) => x.name);
  return dirs(books).flatMap((book) =>
    dirs(join(books, book))
      .filter((chapter) =>
        [...FILES.map((f) => f.file), ITEMS_FILE].some((f) =>
          existsSync(join(books, book, chapter, f)),
        ),
      )
      .map((chapter) => readChapter(root, book, chapter)),
  );
}

/** The step to do next: the first file missing, not approved, changed, or to recheck. */
export function nextStep(c: Chapter): FileState | undefined {
  return c.files.find(
    (f) => f.status !== "approved" || f.recheck.length > 0 || f.problems.length > 0,
  );
}

/**
 * Why the person can't approve a file yet, or undefined when they can: the source's checks
 * holding, its own gate holding, nothing on it still being talked about, and it
 * committed as it is (the approval names that commit). The tree shows it; approve() refuses with it.
 */
export function approvalBlocker(root: string, c: Chapter, step: Step): string | undefined {
  const f = c.files.find((x) => x.step === step);
  if (f === undefined) return `no step ${step}`;
  if (!f.isApprovable) return `${f.file} is checked by the machine, not approved`;
  if (f.status === "missing") return `${f.file} isn't written yet`;
  // The source is the machine's: the agent's to fix, never the person's.
  const broken = sourceProblems(root, c.dir);
  if (broken.length > 0) return `the agent fixes ${SOURCE_DIR} first (${broken.join("; ")})`;
  if (f.problems.length > 0)
    return `${f.file}'s checks fail: ${f.problems.map((p) => p.text).join("; ")}`;
  const rel = join(c.dir, f.file);
  // Approving settles the file: nothing on it may still be talked about.
  const unsettled = readComments(root).threads.filter(
    (t) => t.source?.startsWith(`${rel}:`) && waitsOn(t) !== undefined,
  );
  if (unsettled.length > 0)
    return `${unsettled.length} thread${unsettled.length === 1 ? " is" : "s are"} still open on ${f.file} (${unsettled.map((t) => t.id).join(", ")}): answer and close ${unsettled.length === 1 ? "it" : "them"} first`;
  const head = (git(root, "rev-parse", "HEAD") ?? "").trim();
  const committed = atCommit(root, head, rel);
  const now = readFileSync(join(root, rel), "utf8");
  if (committed === undefined || splitFront(committed).body.trim() !== splitFront(now).body.trim())
    return `${f.file} has changes not committed: commit it first, so the approval names what was approved`;
  return undefined;
}

/**
 * The person approves a file: refused (with `approvalBlocker`'s reason) unless it can be. Writes
 * `approved: <commit>` into its front matter; nothing else.
 */
export function approve(root: string, book: string, chapter: string, step: Step): string {
  const c = readChapter(root, book, chapter);
  const why = approvalBlocker(root, c, step);
  if (why !== undefined) throw new Error(why);
  const f = c.files.find((x) => x.step === step);
  if (f === undefined) throw new Error(`no step ${step}`);
  const rel = join(c.dir, f.file);
  const head = (git(root, "rev-parse", "HEAD") ?? "").trim();
  const now = readFileSync(join(root, rel), "utf8");
  const { front, body } = splitFront(now);
  const lines = Object.entries({ ...front, approved: head.slice(0, 12) }).map(
    ([k, v]) => `${k}: ${v}`,
  );
  writeFileSync(
    join(root, rel),
    `---\n${lines.join("\n")}\n---\n${body.startsWith("\n") ? body : `\n${body}`}`,
  );
  return head.slice(0, 12);
}

/** The person takes an approval back: the file's `approved:` line removed, nothing else. */
export function takeBack(root: string, book: string, chapter: string, step: Step): void {
  const spec = FILES.find((f) => f.step === step);
  if (spec === undefined || !spec.isApprovable) throw new Error(`nothing to take back: ${step}`);
  const file = join(root, "authoring", "books", book, chapter, spec.file);
  if (!existsSync(file)) throw new Error(`no ${spec.file}`);
  const { front, body } = splitFront(readFileSync(file, "utf8"));
  const { approved: _, ...rest } = front;
  const lines = Object.entries(rest).map(([k, v]) => `${k}: ${v}`);
  writeFileSync(
    file,
    lines.length > 0 ? `---\n${lines.join("\n")}\n---\n${body}` : body.replace(/^\n/, ""),
  );
}

/**
 * Where every chapter stands, in lines: each planning file's state, its failing checks, what to
 * check again and what blocks its approval; each lesson's self-review and its boards' and
 * families' states. The pipeline CLI prints it; the chalk MCP's `pipeline` tool returns it.
 * `failed`: files whose checks fail and that hold (the machine's files, an approved plan).
 */
export function pipelineLines(chapters: readonly Chapter[]): { lines: string[]; failed: number } {
  const lines: string[] = [];
  let failed = 0;
  for (const c of chapters) {
    lines.push(`  ${c.dir}`);
    for (const f of c.files) {
      if (f.status === "missing") continue;
      // A draft plan's failing checks are the work in progress: they block its approval, not the check.
      const isHeld = f.status !== "draft" || !f.isApprovable;
      const mark = f.problems.length > 0 ? (isHeld ? "✗" : "·") : "✓";
      const said = f.isApprovable
        ? `: ${f.status}${f.approvedAt ? ` at ${f.approvedAt}` : ""}`
        : f.problems.length > 0
          ? ""
          : ": checks hold";
      lines.push(`    ${mark} ${f.file}${said}`);
      for (const p of f.problems) lines.push(`        ${p.text}`);
      if (f.recheck.length > 0)
        lines.push(`        to check again: ${f.recheck.join(", ")} changed since it was approved`);
      if (f.blocked !== undefined) lines.push(`        can't approve yet: ${f.blocked}`);
      if (isHeld && f.problems.length > 0) failed += 1;
    }
    // Not a failure (lessons change while they're built); a lesson isn't shown to the person like this.
    const boards = c.boards ?? [];
    const counted = (of: readonly BoardState[], what: string) => {
      const n = (s: BoardStatus) =>
        of.filter(
          (b) => b.status === s || (s === BoardStatus.Built && b.status === BoardStatus.Reviewed),
        ).length;
      return `${of.length} ${of.length === 1 ? what.replace(/ies$/, "y").replace(/s$/, "") : what}: ${n(BoardStatus.Built)} built, ${n(BoardStatus.Reviewed)} reviewed`;
    };
    const slugs = [
      ...new Set([...boards.map((b) => b.lesson), ...(c.lessons ?? []).map((l) => l.slug)]),
    ];
    for (const slug of slugs) {
      const l = (c.lessons ?? []).find((x) => x.slug === slug);
      const mine = boards.filter((b) => b.lesson === slug && !b.id.startsWith(FAMILY_PREFIX));
      const families = boards.filter((b) => b.lesson === slug && b.id.startsWith(FAMILY_PREFIX));
      const counts = [
        ...(mine.length > 0 ? [counted(mine, "boards")] : []),
        ...(families.length > 0 ? [counted(families, "families")] : []),
      ].join("; ");
      const tail = counts === "" ? "" : ` · ${counts}`;
      lines.push(
        l === undefined
          ? `    · ${slug}: not built yet${tail}`
          : l.isToSelfReview
            ? `    · ${slug}: to self-review (${l.why})${tail}`
            : `    ✓ ${slug}: self-reviewed${tail}`,
      );
    }
  }
  if (chapters.length === 0) lines.push("  no chapter has planning files yet");
  return { lines, failed };
}
