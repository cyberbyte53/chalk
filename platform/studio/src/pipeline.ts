import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * A chapter's planning files (platform/docs/authoring-pipeline.md), in authoring/books/<book>/<chapter>/:
 * the brief, the source's outline, the objectives, the flow and the props match. Each answers one
 * question and ends at a gate: the machine's (what is read and cited holds together) and, for all
 * but the outline, the person's (`approved: <commit>` in its front matter, written only when they
 * approve). Nothing else is stored: whether a file changed since it was approved, and what an
 * earlier file's change sends back to recheck, are worked out from git each time.
 */

export const Step = {
  Brief: "brief",
  Outline: "outline",
  Objectives: "objectives",
  Flow: "flow",
  Props: "props",
} as const;
export type Step = (typeof Step)[keyof typeof Step];

/** The files, in pipeline order. The outline's gate is the machine's only. */
export const FILES: readonly { step: Step; file: string; isApproved: boolean }[] = [
  { step: Step.Brief, file: "brief.md", isApproved: true },
  { step: Step.Outline, file: "source/outline.yaml", isApproved: false },
  { step: Step.Objectives, file: "objectives.md", isApproved: true },
  { step: Step.Flow, file: "flow.md", isApproved: true },
  { step: Step.Props, file: "props.md", isApproved: true },
];

/**
 * What each file is written from: an approved file whose sources changed since it was approved is
 * to be checked again. The brief's screens reach no file (only the checks that draw), so a file
 * reads the brief's scope.
 */
const READS: Readonly<Record<Step, readonly Step[]>> = {
  [Step.Brief]: [],
  [Step.Outline]: [],
  [Step.Objectives]: [Step.Brief, Step.Outline],
  [Step.Flow]: [Step.Brief, Step.Objectives],
  [Step.Props]: [Step.Brief, Step.Objectives, Step.Flow],
};

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

/** A section of a markdown body, by its `## ` heading, without the heading. */
function section(body: string, heading: string): string | undefined {
  const lines = body.split("\n");
  const at = lines.findIndex((l) => l.trim().toLowerCase() === `## ${heading.toLowerCase()}`);
  if (at === -1) return undefined;
  const end = lines.findIndex((l, i) => i > at && /^## /.test(l));
  return lines.slice(at + 1, end === -1 ? undefined : end).join("\n");
}

export type Screen = { width: number; height: number; words: string };

/** The brief: its scope (what the objectives and flow are written from) and its screens. */
export function readBrief(body: string): { scope?: string; screens: Screen[]; problems: string[] } {
  const problems: string[] = [];
  const scope = section(body, "Scope");
  const screensText = section(body, "Screens");
  if (scope === undefined) problems.push("no ## Scope");
  if (screensText === undefined) problems.push("no ## Screens");
  const screens: Screen[] = [];
  for (const line of (screensText ?? "").split("\n").filter((l) => /^\s*-\s/.test(l))) {
    const m = /(\d+)\s*[×x]\s*(\d+)/.exec(line);
    if (m === null) problems.push(`a screen without its size (W×H): ${line.trim()}`);
    else
      screens.push({
        width: Number(m[1]),
        height: Number(m[2]),
        words: line.replace(/^\s*-\s*/, "").trim(),
      });
  }
  if (screensText !== undefined && screens.length === 0) problems.push("no screens listed");
  return { ...(scope === undefined ? {} : { scope }), screens, problems };
}

export type OutlineItem = { id: string; kind: string } & Record<string, unknown>;

/** What a source's text numbers, by kind, and the id an outline gives each ("Fig. 3.10" → fig3.10). */
const NUMBERED: readonly { kind: string; scan: RegExp; id: (n: string) => string }[] = [
  { kind: "figure", scan: /Fig\.?\s*(\d+\.\d+)/g, id: (n) => `fig${n}` },
  { kind: "example", scan: /\bExample\s+(\d+)\b/g, id: (n) => `example${n}` },
  { kind: "activity", scan: /\bActivity\s+(\d+)\b/g, id: (n) => `activity${n}` },
  { kind: "exercise", scan: /\bEXERCISE\s+(\d+\.\d+)/g, id: (n) => `ex${n}` },
];

/** The outline's gate: ids unique, and every figure, example, activity and exercise the text has. */
export function checkOutline(items: readonly OutlineItem[], texts: readonly string[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) problems.push(`${item.id} is listed twice`);
    seen.add(item.id);
  }
  if (texts.length === 0) return problems;
  for (const { kind, scan, id } of NUMBERED) {
    const inText = new Set(texts.flatMap((t) => [...t.matchAll(scan)].map((m) => id(m[1] ?? ""))));
    const listed = new Set(items.filter((i) => i.kind === kind).map((i) => i.id));
    const missing = [...inText].filter((x) => !listed.has(x));
    const extra = [...listed].filter((x) => !inText.has(x));
    if (missing.length > 0)
      problems.push(`the text has ${missing.join(", ")}; the outline doesn't`);
    if (extra.length > 0) problems.push(`the outline has ${extra.join(", ")}; the text doesn't`);
  }
  return problems;
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

export type Objective = { id: string; text: string; cites: string[] };

/** `- **o5** what a student can do. (def-abscissa, fig3.10)` */
export function readObjectives(body: string): Objective[] {
  const out: Objective[] = [];
  for (const line of body.split("\n")) {
    const m = /^\s*-\s+\*\*(\w+)\*\*\s+(.*)$/.exec(line);
    if (m?.[1] !== undefined) out.push({ id: m[1], text: m[2] ?? "", cites: citesOf(m[2] ?? "") });
  }
  return out;
}

export type FlowBoard = { lesson: string; id: string; cites: string[]; needs?: string };

/** `## <lesson>`, then `### <board>  (o5, o9; fig3.15)` with `Purpose:` and `Needs:` lines. */
export function readFlow(body: string): FlowBoard[] {
  const out: FlowBoard[] = [];
  let lesson = "";
  for (const line of body.split("\n")) {
    const l = /^##\s+([\w-]+)\s*$/.exec(line);
    if (l?.[1] !== undefined) lesson = l[1];
    const b = /^###\s+([\w-]+)\s*(.*)$/.exec(line);
    if (b?.[1] !== undefined) out.push({ lesson, id: b[1], cites: citesOf(b[2] ?? "") });
    const n = /^Needs:\s*(.*)$/.exec(line);
    const last = out.at(-1);
    if (n !== null && last !== undefined) last.needs = n[1] ?? "";
  }
  return out;
}

export const VERDICTS = ["reuse", "configure", "extend", "new", "no prop"] as const;
export type MatchRow = { need: string; boards: string[]; verdict: string };

/** The props match: a table with Need, Boards and Verdict columns (more are fine). */
export function readMatch(body: string): { rows: MatchRow[]; problems: string[] } {
  const lines = body.split("\n").filter((l) => /^\s*\|/.test(l));
  const cells = (l: string) =>
    l
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
  const head = lines[0] === undefined ? [] : cells(lines[0]).map((c) => c.toLowerCase());
  const col = (name: string) => head.findIndex((h) => h === name);
  const [need, boards, verdict] = [col("need"), col("boards"), col("verdict")];
  if (need === -1 || boards === -1 || verdict === -1)
    return { rows: [], problems: ["no table with Need, Boards and Verdict columns"] };
  const rows = lines.slice(2).map((l) => {
    const c = cells(l);
    return {
      need: c[need] ?? "",
      boards: (c[boards] ?? "")
        .split(",")
        .map((b) => b.replace(/[`*]/g, "").trim())
        .filter(Boolean),
      verdict: (c[verdict] ?? "").replace(/[`*]/g, "").trim().toLowerCase(),
    };
  });
  const problems = rows
    .filter((r) => !VERDICTS.some((v) => r.verdict.startsWith(v)))
    .map(
      (r) => `"${r.need}": its verdict is one of ${VERDICTS.join(", ")} (it says "${r.verdict}")`,
    );
  return { rows, problems };
}

// ---- A chapter's files, their gates, and what they reach ----

export type FileState = {
  step: Step;
  file: string;
  /** missing; draft (not approved); approved; changed (since it was approved). */
  status: "missing" | "draft" | "approved" | "changed";
  approvedAt?: string;
  /** Where its gate fails: the machine's checks of what it reads and cites. */
  problems: string[];
  /** Facts the gate lists, for the person to decide on (what nothing cites). */
  notes: string[];
  /** Approved, but a file it is written from changed since: which. */
  recheck: Step[];
};

export type Chapter = { book: string; chapter: string; dir: string; files: FileState[] };

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

/** What of a file a later one is written from: its body, and of the brief only its scope. */
function content(step: Step, text: string | undefined): string | undefined {
  if (text === undefined) return undefined;
  const body = splitFront(text).body;
  return (step === Step.Brief ? (section(body, "Scope") ?? "") : body).trim();
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
  const outline = ((): OutlineItem[] => {
    try {
      const raw = parseYaml(texts.outline ?? "[]") as unknown;
      return Array.isArray(raw) ? (raw as OutlineItem[]) : [];
    } catch {
      return [];
    }
  })();
  const outlineIds = new Set(outline.map((i) => i.id));
  const objectives = readObjectives(splitFront(texts.objectives ?? "").body);
  const objectiveIds = new Set(objectives.map((o) => o.id));
  const flow = readFlow(splitFront(texts.flow ?? "").body);
  const boardIds = new Set(flow.map((b) => b.id));

  const gate: Record<Step, { problems: string[]; notes: string[] }> = {
    brief: { problems: readBrief(splitFront(texts.brief ?? "").body).problems, notes: [] },
    outline: { problems: [], notes: [] },
    objectives: { problems: [], notes: [] },
    flow: { problems: [], notes: [] },
    props: { problems: [], notes: [] },
  };
  if (texts.outline !== undefined) {
    const sourceDir = join(abs, "source");
    const txts = existsSync(sourceDir)
      ? readdirSync(sourceDir)
          .filter((n) => n.endsWith(".txt"))
          .map((n) => readFileSync(join(sourceDir, n), "utf8"))
      : [];
    gate.outline.problems.push(...checkOutline(outline, txts));
    if (txts.length === 0)
      gate.outline.notes.push("no text in source/ to check the outline against");
  }
  for (const o of objectives) {
    if (o.cites.length === 0) gate.objectives.problems.push(`${o.id} cites nothing in the outline`);
    for (const c of o.cites)
      if (!outlineIds.has(c))
        gate.objectives.problems.push(`${o.id} cites ${c}, not in the outline`);
  }
  const citedByObjectives = new Set(objectives.flatMap((o) => o.cites));
  const uncited = outline.filter((i) => !citedByObjectives.has(i.id)).map((i) => i.id);
  if (texts.objectives !== undefined && uncited.length > 0)
    gate.objectives.notes.push(`no objective cites: ${uncited.join(", ")}`);
  const seenBoards = new Set<string>();
  for (const b of flow) {
    if (seenBoards.has(b.id)) gate.flow.problems.push(`board ${b.id} is listed twice`);
    seenBoards.add(b.id);
    if (!b.cites.some((c) => objectiveIds.has(c)))
      gate.flow.problems.push(`board ${b.id} serves no objective`);
    for (const c of b.cites)
      if (!objectiveIds.has(c) && !outlineIds.has(c))
        gate.flow.problems.push(`board ${b.id} cites ${c}: not an objective or in the outline`);
    if (b.needs === undefined || b.needs.trim() === "")
      gate.flow.problems.push(`board ${b.id} says nothing it needs (Needs:)`);
  }
  if (texts.flow !== undefined) {
    const served = new Set(flow.flatMap((b) => b.cites));
    for (const o of objectives)
      if (!served.has(o.id)) gate.flow.problems.push(`no board serves ${o.id}`);
    const shown = outline
      .filter((i) => ["figure", "example", "activity"].includes(i.kind) && !served.has(i.id))
      .map((i) => i.id);
    if (shown.length > 0) gate.flow.notes.push(`no board cites: ${shown.join(", ")}`);
  }
  if (texts.props !== undefined) {
    const match = readMatch(splitFront(texts.props).body);
    gate.props.problems.push(...match.problems);
    const matched = new Set(match.rows.flatMap((r) => r.boards));
    for (const b of flow)
      if (!matched.has(b.id)) gate.props.problems.push(`board ${b.id}'s need has no verdict`);
    for (const b of matched)
      if (!boardIds.has(b)) gate.props.problems.push(`${b} is not a board in the flow`);
  }

  const files: FileState[] = FILES.map(({ step, file, isApproved }) => {
    const text = texts[step];
    const rel = join(dir, file);
    if (text === undefined)
      return { step, file, status: "missing", problems: [], notes: [], recheck: [] };
    const approvedAt = isApproved ? splitFront(text).front.approved : undefined;
    const base = { step, file, problems: gate[step].problems, notes: gate[step].notes };
    if (!isApproved) return { ...base, status: "approved", recheck: [] };
    if (approvedAt === undefined || approvedAt === "")
      return { ...base, status: "draft", recheck: [] };
    const then = atCommit(root, approvedAt, rel);
    const isChanged =
      then === undefined || splitFront(then).body.trim() !== splitFront(text).body.trim();
    // A file it is written from that changed since this one was approved.
    const recheck = READS[step].filter((from) => {
      const f = FILES.find((x) => x.step === from);
      if (f === undefined) return false;
      return (
        content(from, atCommit(root, approvedAt, join(dir, f.file))) !== content(from, texts[from])
      );
    });
    return { ...base, status: isChanged ? "changed" : "approved", approvedAt, recheck };
  });
  return { book, chapter, dir, files };
}

/** Every chapter with planning files. */
export function readChapters(root: string): Chapter[] {
  const books = join(root, "authoring", "books");
  if (!existsSync(books)) return [];
  const dirs = (d: string) =>
    readdirSync(d, { withFileTypes: true })
      .filter((x) => x.isDirectory())
      .map((x) => x.name);
  return dirs(books).flatMap((book) =>
    dirs(join(books, book))
      .filter((chapter) => FILES.some((f) => existsSync(join(books, book, chapter, f.file))))
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
 * The person approves a file: refused unless every file before it is approved and holds, its own
 * gate holds, and it is committed as it is (the approval names that commit). Writes
 * `approved: <commit>` into its front matter; nothing else.
 */
export function approve(root: string, book: string, chapter: string, step: Step): string {
  const c = readChapter(root, book, chapter);
  const at = c.files.findIndex((f) => f.step === step);
  const f = c.files[at];
  const spec = FILES[at];
  if (f === undefined || spec === undefined) throw new Error(`no step ${step}`);
  if (!spec.isApproved) throw new Error(`${f.file} is checked by the machine, not approved`);
  if (f.status === "missing") throw new Error(`${f.file} isn't written yet`);
  for (const before of c.files.slice(0, at))
    if (before.status !== "approved" || before.recheck.length > 0 || before.problems.length > 0)
      throw new Error(
        `${before.file} comes first: it is ${before.status}${before.problems.length > 0 ? ", and its checks fail" : ""}${before.recheck.length > 0 ? ", and to be checked again" : ""}`,
      );
  if (f.problems.length > 0) throw new Error(`${f.file}'s checks fail: ${f.problems.join("; ")}`);
  const rel = join(c.dir, f.file);
  const head = (git(root, "rev-parse", "HEAD") ?? "").trim();
  const committed = atCommit(root, head, rel);
  const now = readFileSync(join(root, rel), "utf8");
  if (committed === undefined || splitFront(committed).body.trim() !== splitFront(now).body.trim())
    throw new Error(
      `${f.file} has changes not committed: commit it first, so the approval names what was approved`,
    );
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

/** The brief's screens for a chapter, if it has a brief: what every check that draws its boards uses. */
export function briefScreens(root: string, book: string, chapter: string): Screen[] {
  const file = join(root, "authoring", "books", book, chapter, "brief.md");
  if (!existsSync(file)) return [];
  return readBrief(splitFront(readFileSync(file, "utf8")).body).screens;
}
