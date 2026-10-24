import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  ALL,
  type BuiltBoard,
  type ChapterManifest,
  type ConceptManifest,
  ContentFile,
  type Family,
  type GraphFile,
  type Page,
  QUESTIONS_DIR,
  bookManifestSchema,
  chapterManifestSchema,
  conceptManifestSchema,
  graphFileSchema,
  idOf,
  isFamily,
  isPage,
  paramsFileSchema,
  rootManifestSchema,
  siteOf,
  versionOf,
} from "@chalk/author";
import {
  type BankRef,
  type Board,
  type BuildIndex,
  type BuiltArt,
  type BuiltBook,
  type BuiltChapter,
  type BuiltConcept,
  type BuiltFamily,
  BuiltFile,
  type BuiltGraph,
  type BuiltPage,
  type BuiltQuestion,
  Kind,
  type Lesson,
  OVERVIEW_DIR,
  type Readings,
  type Ref,
  type Source,
  builtBookSchema,
  builtChapterSchema,
  builtConceptSchema,
  builtFamilySchema,
  builtPageSchema,
  builtQuestionSchema,
  propPieces,
  walkPieces,
} from "@chalk/content";
import { type AnyPropDef, PropRole } from "@chalk/prop";
import { parse as parseYaml } from "yaml";
import type { ZodType, ZodTypeDef } from "zod";
import { type Problem, validateLesson } from "../validate";
import { renderArt } from "./art";
import { conceptsModule } from "./concepts";
import { checkNote, checkWitness } from "./witness";

type Defs = Readonly<Record<string, AnyPropDef>>;

/** What a build makes: every output file by its path in build/, and what went wrong or was left out. */
export type BuildResult = {
  /** Path in build/ → the JSON to write there. */
  files: Map<string, unknown>;
  problems: Problem[];
  /** Things worth knowing that don't stop the build (a folder no manifest includes, an excluded row). */
  notices: string[];
  /**
   * Built item path → where its board was written: the board's own line and each prop's, as
   * `content/<path>/<file>:<line>`. Written to build/sources.json for the preview; never shipped.
   */
  sources: Map<string, ItemSources>;
};

/** build/sources.json: built item path → where its board was written. */
export const SOURCES_FILE = "sources.json";

/** Where one built board's parts were written. */
export type ItemSources = { board?: string; pieces: Record<string, string> };

type Context = {
  contentDir: string;
  defs: Defs;
  readings: Readings;
  commit: string;
  files: Map<string, unknown>;
  problems: Problem[];
  notices: string[];
  /** Every id handed out so far → where, to catch two items with one id. */
  ids: Map<string, string>;
  /** Concept path → its parents' paths, from graph.yaml. */
  parents: Map<string, string[]>;
  /** Concept paths built, for checking the graph. */
  concepts: Set<string>;
  sources: Map<string, ItemSources>;
};

/** Each prop's line, read from the board as authored (before ids are added, which copies it). */
function sitesOf(board: Board, boardSite: string | undefined): ItemSources {
  const pieces: Record<string, string> = {};
  for (const piece of walkPieces(board.root)) {
    const site = siteOf(piece);
    if (site !== undefined && piece.name !== "") pieces[piece.name] = site;
  }
  const first = Object.values(pieces)[0];
  const top = boardSite ?? first;
  return top === undefined ? { pieces } : { board: top, pieces };
}

/** The output file for an item: its kind's name in its own folder (book.json, concept.json, …). */
function outPath(path: string, file: string): string {
  return path === "" ? file : `${path}/${file}`;
}

function report(c: Context, where: string, message: string): void {
  c.problems.push({ where, message });
}

/** Reads and checks a YAML file; reports and returns undefined if it is missing or wrong. */
function readYaml<T>(
  c: Context,
  path: string,
  schema: ZodType<T, ZodTypeDef, unknown>,
): T | undefined {
  const file = join(c.contentDir, path);
  if (!existsSync(file)) {
    report(c, path, "missing");
    return undefined;
  }
  let raw: unknown;
  try {
    raw = parseYaml(readFileSync(file, "utf8"));
  } catch (error) {
    report(c, path, `not valid YAML: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues)
      report(c, path, `${issue.path.join(".") || "file"}: ${issue.message}`);
    return undefined;
  }
  return parsed.data;
}

function subfolders(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith(".") && statSync(join(dir, name)).isDirectory())
    .sort();
}

/** Listed children must exist; unlisted folders that are content (have a manifest) are reported. */
function checkChildren(
  c: Context,
  path: string,
  listed: readonly string[],
  marker: string,
): string[] {
  const dir = join(c.contentDir, path);
  const present = new Set(subfolders(dir));
  for (const name of listed) {
    if (!present.has(name))
      report(
        c,
        outPath(path, ContentFile.Manifest),
        `lists "${name}", but there is no folder ${outPath(path, name)}/`,
      );
  }
  const listedSet = new Set(listed);
  for (const name of present) {
    if (!listedSet.has(name) && existsSync(join(dir, name, marker))) {
      c.notices.push(`not included: ${outPath(path, name)}/ (no manifest lists it)`);
    }
  }
  return listed.filter((name) => present.has(name));
}

/** The line (from 1) where a params.yaml's row starts: its `- ` at the top level, else 1. */
function rowLine(c: Context, file: string, row: number): number {
  let text: string;
  try {
    text = readFileSync(join(c.contentDir, file), "utf8");
  } catch {
    return 1;
  }
  let seen = -1;
  const lines = text.split("\n");
  for (const [i, line] of lines.entries()) {
    if (/^-( |$)/.test(line)) seen += 1;
    if (seen === row) return i + 1;
  }
  return 1;
}

/** Hands out an item's id, refusing one already taken. */
function claimId(c: Context, id: string, where: string): void {
  const other = c.ids.get(id);
  if (other !== undefined) report(c, where, `same id ${id} as ${other}`);
  c.ids.set(id, where);
}

function source(c: Context, path: string, file: string, row?: number): Source {
  return row === undefined
    ? { path, file, commit: c.commit }
    : { path, file, row, commit: c.commit };
}

/** Gives the item its version, checks it against its format, files it, and returns a pointer to it. */
function emit<T extends { id: string; version: string; source: Source }>(
  c: Context,
  file: string,
  item: T,
  schema: ZodType<T, ZodTypeDef, unknown>,
): Ref {
  item.version = versionOf(item);
  const parsed = schema.safeParse(item);
  if (!parsed.success) {
    for (const issue of parsed.error.issues)
      report(c, file, `${issue.path.join(".")}: ${issue.message}`);
  }
  c.files.set(file, item);
  return { id: item.id, version: item.version, path: file };
}

/** Pieces get permanent ids in layout order: 1, 2, 3 … (the item's id names the board). */
function withPieceIds(board: Board): Board {
  const out = structuredClone(board);
  out.id = 1;
  let next = 1;
  for (const piece of walkPieces(out.root)) piece.id = next++;
  out.nextPieceId = next;
  return out;
}

/**
 * What a board's questions are about, and whether they count: written in by the build, never by the
 * author. A bank question is graded on the concepts it tests; a page's questions are about its
 * concept, ungraded.
 */
function tagQuestions(
  board: Board,
  defs: Defs,
  tag: { concepts: readonly string[]; isGraded: boolean },
): void {
  for (const piece of propPieces(board.root)) {
    if (defs[piece.prop]?.role === PropRole.Question)
      piece.with = { ...piece.with, concepts: [...tag.concepts], isGraded: tag.isGraded };
  }
}

async function importModule(
  c: Context,
  path: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    return await import(pathToFileURL(join(c.contentDir, path)).href);
  } catch (error) {
    report(c, path, error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

/** A folder's art (its art.tsx), drawn and checked; null when it has none. */
async function buildArt(c: Context, folder: string): Promise<BuiltArt | null> {
  const file = outPath(folder, ContentFile.Art);
  if (!existsSync(join(c.contentDir, file))) return null;
  const module = await importModule(c, file);
  if (module === undefined) return null;
  const result = renderArt(module.art);
  if ("problems" in result) {
    for (const problem of result.problems) report(c, file, problem);
    return null;
  }
  return result.art;
}

/** Checks a built board: its wiring (the lesson validator), its witness and its note checks. */
async function checkBoard(
  c: Context,
  where: string,
  built: BuiltBoard,
  board: Board,
): Promise<boolean> {
  const before = c.problems.length;
  const lesson: Lesson = {
    id: where,
    version: "0.0.0",
    title: { en: where, hi: where },
    concepts: [],
    boards: [board],
  };
  for (const p of validateLesson(lesson, c.defs, c.readings))
    report(c, where, `${p.where}: ${p.message}`);
  if (c.problems.length > before) return false;
  for (const failure of await checkWitness(board, c.defs, built.witness)) report(c, where, failure);
  for (const note of built.noteChecks) {
    for (const failure of await checkNote(board, c.defs, note.steps, note.feedback)) {
      report(c, where, `note "${note.feedback.en}": ${failure}`);
    }
  }
  return c.problems.length === before;
}

function propTypesOf(board: Board): string[] {
  return propPieces(board.root).map((p) => p.prop);
}

async function buildPages(
  c: Context,
  conceptPath: string,
  conceptId: string,
  used: Set<string>,
): Promise<Ref[]> {
  const file = outPath(conceptPath, ContentFile.Overview);
  if (!existsSync(join(c.contentDir, file))) {
    report(
      c,
      file,
      "missing: every concept has an overview.ts exporting `overview` (its pages, in order)",
    );
    return [];
  }
  const module = await importModule(c, file);
  if (module === undefined) return [];
  const pages = module.overview;
  if (!Array.isArray(pages) || !pages.every(isPage)) {
    report(c, file, "should export `overview`: an array of page(...)");
    return [];
  }
  const refs: Ref[] = [];
  const keys = new Set<string>();
  for (const [row, p] of (pages as Page[]).entries()) {
    const where = `${file} · ${p.key}`;
    if (keys.has(p.key)) report(c, where, `two pages with the key "${p.key}"`);
    keys.add(p.key);
    let built: BuiltBoard;
    try {
      built = p.build();
    } catch (error) {
      report(c, where, error instanceof Error ? error.message : String(error));
      continue;
    }
    const board = withPieceIds(built.board);
    tagQuestions(board, c.defs, { concepts: [conceptId], isGraded: false });
    if (!(await checkBoard(c, where, built, board))) continue;
    for (const type of propTypesOf(board)) used.add(type);
    const id = idOf(`${conceptPath}/${OVERVIEW_DIR}/${p.key}`);
    claimId(c, id, where);
    const item: BuiltPage = {
      kind: Kind.Page,
      id,
      version: "",
      source: source(c, conceptPath, ContentFile.Overview, row),
      concept: conceptId,
      key: p.key,
      board,
    };
    const out = `${conceptPath}/${OVERVIEW_DIR}/${p.key}.json`;
    c.sources.set(out, sitesOf(built.board, p.site));
    refs.push(emit(c, out, item, builtPageSchema));
  }
  return refs;
}

/** A chapter as its question bank sees it: its id, and its concepts' ids by folder name. */
type ChapterScope = { path: string; id: string; conceptIds: ReadonlyMap<string, string> };

/** A question built into the bank, with the prop types its board places. */
type Banked = BankRef & { props: readonly string[] };

async function buildFamily(
  c: Context,
  chapter: ChapterScope,
  familyPath: string,
): Promise<Banked[]> {
  const familyFile = outPath(familyPath, ContentFile.Family);
  const module = existsSync(join(c.contentDir, familyFile))
    ? await importModule(c, familyFile)
    : undefined;
  if (module === undefined) {
    if (!existsSync(join(c.contentDir, familyFile))) report(c, familyFile, "missing");
    return [];
  }
  const families = Object.values(module).filter(isFamily);
  if (families.length !== 1) {
    report(c, familyFile, `should export exactly one family(...) (found ${families.length})`);
    return [];
  }
  const fam = families[0] as Family;
  // The enum makes a wrong name a type error; this catches a stale concepts.gen.ts or a plain string.
  const tests: string[] = [];
  for (const name of fam.tests) {
    const conceptId = chapter.conceptIds.get(name);
    if (conceptId === undefined)
      report(c, familyFile, `tests "${name}", which isn't a concept of ${chapter.path}`);
    else if (!tests.includes(conceptId)) tests.push(conceptId);
  }
  if (tests.length === 0) {
    if (fam.tests.length === 0) report(c, familyFile, "`tests` names no concept");
    return [];
  }
  const paramsFile = outPath(familyPath, ContentFile.Params);
  const rows = readYaml(c, paramsFile, paramsFileSchema);
  if (rows === undefined) return [];
  const familyId = idOf(familyPath);
  const name = familyPath.slice(familyPath.lastIndexOf("/") + 1);
  const banked: Banked[] = [];
  for (const [row, r] of rows.entries()) {
    const where = `${paramsFile} · row ${row}`;
    if (r.exclude === true) {
      c.notices.push(`excluded: ${where}`);
      continue;
    }
    const parsed = fam.params.safeParse(r.params);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        report(c, where, `params.${issue.path.join(".")}: ${issue.message}`);
      continue;
    }
    let built: BuiltBoard;
    try {
      built = fam.build(parsed.data, name);
    } catch (error) {
      report(c, where, error instanceof Error ? error.message : String(error));
      continue;
    }
    const board = withPieceIds(built.board);
    tagQuestions(board, c.defs, { concepts: tests, isGraded: true });
    if (!(await checkBoard(c, where, built, board))) continue;
    if (built.witness.length === 0) {
      report(c, where, "a question needs a witness: how a learner gets it right");
      continue;
    }
    const id = idOf(familyPath, r.params);
    claimId(c, id, where);
    const level = r.level ?? fam.level;
    const item: BuiltQuestion = {
      kind: Kind.Question,
      id,
      version: "",
      source: source(c, familyPath, ContentFile.Params, row),
      tests,
      family: familyId,
      level,
      origin: r.origin,
      ...(r.firstTry === undefined ? {} : { firstTry: r.firstTry }),
      params: r.params,
      board,
    };
    const out = outPath(familyPath, `${id}.json`);
    c.sources.set(out, {
      ...sitesOf(built.board, undefined),
      board: `content/${paramsFile}:${rowLine(c, paramsFile, row)}`,
    });
    const ref = emit(c, out, item, builtQuestionSchema);
    banked.push({
      ...ref,
      level,
      tests,
      ...(r.firstTry === undefined ? {} : { firstTry: r.firstTry }),
      props: propTypesOf(board),
    });
  }
  claimId(c, familyId, familyFile);
  const item: BuiltFamily = {
    kind: Kind.Family,
    id: familyId,
    version: "",
    source: source(c, familyPath, ContentFile.Family),
    chapter: chapter.id,
    tests,
    questions: banked.map(({ id, version, path }) => ({ id, version, path })),
  };
  emit(c, outPath(familyPath, BuiltFile.Family), item, builtFamilySchema);
  return banked;
}

/** The chapter's question bank: the family folders its manifest includes, each built. */
async function buildBank(
  c: Context,
  chapter: ChapterScope,
  manifest: ChapterManifest,
): Promise<Banked[]> {
  const manifestFile = outPath(chapter.path, ContentFile.Manifest);
  const questionsDir = outPath(chapter.path, QUESTIONS_DIR);
  const present = subfolders(join(c.contentDir, questionsDir));
  let included: string[];
  if (manifest.questions === ALL) {
    const excluded = new Set(manifest.exclude ?? []);
    for (const name of excluded) {
      if (!present.includes(name))
        report(
          c,
          manifestFile,
          `excludes "${name}", but there is no folder ${questionsDir}/${name}/`,
        );
      else c.notices.push(`excluded: ${questionsDir}/${name}/`);
    }
    included = present.filter((name) => !excluded.has(name));
  } else {
    included = checkChildren(c, questionsDir, manifest.questions, ContentFile.Family);
  }
  const bank: Banked[] = [];
  for (const name of included)
    bank.push(...(await buildFamily(c, chapter, `${questionsDir}/${name}`)));
  // A first-try place names one question per concept.
  const taken = new Map<string, string>();
  for (const q of bank) {
    if (q.firstTry === undefined) continue;
    for (const concept of q.tests) {
      const key = `${concept} ${q.firstTry}`;
      const other = taken.get(key);
      if (other !== undefined)
        report(c, q.path, `firstTry ${q.firstTry} is also given to ${other} (concept ${concept})`);
      else taken.set(key, q.path);
    }
  }
  return bank;
}

/** Explainer props only: words, buttons and questions are on every board and explain nothing. */
function explainers(c: Context, types: Iterable<string>): string[] {
  return [...new Set(types)].filter((type) => c.defs[type]?.isExplainer !== false).sort();
}

/** A concept read and its pages built; its concept.json waits for the bank (for its props). */
type ConceptDraft = {
  path: string;
  id: string;
  manifest: ConceptManifest;
  overview: Ref[];
  /** Prop types its pages place, and its manifest's extras. */
  used: Set<string>;
  art: BuiltArt | null;
};

async function draftConcept(c: Context, conceptPath: string): Promise<ConceptDraft | undefined> {
  const manifestFile = outPath(conceptPath, ContentFile.Manifest);
  const manifest = readYaml(c, manifestFile, conceptManifestSchema);
  if (manifest === undefined) return undefined;
  if (existsSync(join(c.contentDir, conceptPath, QUESTIONS_DIR)))
    report(
      c,
      outPath(conceptPath, QUESTIONS_DIR),
      "question families live in the chapter's questions/ folder, with `tests` naming this concept",
    );
  const id = idOf(conceptPath);
  claimId(c, id, conceptPath);
  c.concepts.add(conceptPath);
  const used = new Set<string>();
  const overview = await buildPages(c, conceptPath, id, used);
  for (const extra of manifest.props ?? []) {
    const def = c.defs[extra];
    if (def === undefined) report(c, manifestFile, `props: no prop type "${extra}" in the library`);
    else if (def.isExplainer === false)
      report(
        c,
        manifestFile,
        `props: "${extra}" isn't an explainer (words, buttons and questions aren't)`,
      );
    else used.add(extra);
  }
  const art = await buildArt(c, conceptPath);
  return { path: conceptPath, id, manifest, overview, used, art };
}

function emitConcept(c: Context, draft: ConceptDraft, bank: readonly Banked[]): Ref {
  const tested = bank.filter((q) => q.tests.includes(draft.id)).flatMap((q) => q.props);
  const item: BuiltConcept = {
    kind: Kind.Concept,
    id: draft.id,
    version: "",
    source: source(c, draft.path, ContentFile.Manifest),
    title: draft.manifest.title,
    art: draft.art,
    glyph: draft.manifest.glyph ?? null,
    prereqs: (c.parents.get(draft.path) ?? []).map((p) => idOf(p)),
    overview: draft.overview,
    props: explainers(c, [...draft.used, ...tested]),
  };
  return emit(c, outPath(draft.path, BuiltFile.Concept), item, builtConceptSchema);
}

/** concepts.gen.ts must say what build.yaml says (build-content and preview rewrite it first). */
function checkConceptsModule(c: Context, chapterPath: string, concepts: readonly string[]): void {
  const file = outPath(chapterPath, ContentFile.Concepts);
  const path = join(c.contentDir, file);
  const text = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  if (text !== conceptsModule(concepts))
    report(
      c,
      file,
      `${text === undefined ? "missing" : "out of date with build.yaml"}: run pnpm build-content and commit it`,
    );
}

async function buildChapter(c: Context, chapterPath: string): Promise<Ref | undefined> {
  const manifest = readYaml(c, outPath(chapterPath, ContentFile.Manifest), chapterManifestSchema);
  if (manifest === undefined) return undefined;
  checkConceptsModule(c, chapterPath, manifest.concepts);
  const drafts: ConceptDraft[] = [];
  for (const name of checkChildren(c, chapterPath, manifest.concepts, ContentFile.Manifest)) {
    const draft = await draftConcept(c, `${chapterPath}/${name}`);
    if (draft !== undefined) drafts.push(draft);
  }
  const id = idOf(chapterPath);
  claimId(c, id, chapterPath);
  const chapter: ChapterScope = {
    path: chapterPath,
    id,
    conceptIds: new Map(drafts.map((d) => [d.path.slice(chapterPath.length + 1), d.id])),
  };
  const bank = await buildBank(c, chapter, manifest);
  const art = await buildArt(c, chapterPath);
  const concepts = drafts.map((draft) => emitConcept(c, draft, bank));
  const item: BuiltChapter = {
    kind: Kind.Chapter,
    id,
    version: "",
    source: source(c, chapterPath, ContentFile.Manifest),
    title: manifest.title,
    art,
    concepts,
    questions: bank.map(({ props: _, ...ref }) => ref),
    props: explainers(c, [...drafts.flatMap((d) => [...d.used]), ...bank.flatMap((q) => q.props)]),
  };
  noteLongAnswers(c, chapterPath);
  return emit(c, outPath(chapterPath, BuiltFile.Chapter), item, builtChapterSchema);
}

/** Above this share, "pick the longest option" works too often: say so (it doesn't stop the build). */
const LONGEST_ANSWER_LIMIT = 0.4;

/**
 * Multiple-choice questions where the right answer is the longest option teach students to guess by
 * length. Counts, across a chapter's built pages and questions, how often the answer is strictly the
 * longest of three or more options, and adds a notice when that's well above chance.
 */
function noteLongAnswers(c: Context, chapterPath: string): void {
  let asked = 0;
  let longest = 0;
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
      return;
    }
    if (node === null || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    if (Array.isArray(o.options) && typeof o.answer === "string" && o.options.length >= 3) {
      const lengths = new Map<string, number>();
      for (const option of o.options as { id?: unknown; label?: { en?: unknown } }[]) {
        if (typeof option?.id === "string" && typeof option.label?.en === "string") {
          lengths.set(option.id, option.label.en.length);
        }
      }
      const answer = lengths.get(o.answer);
      if (answer !== undefined && lengths.size >= 3) {
        asked += 1;
        const others = [...lengths].filter(([id]) => id !== o.answer).map(([, n]) => n);
        if (answer > Math.max(...others)) longest += 1;
      }
    }
    for (const value of Object.values(o)) visit(value);
  };
  for (const [path, json] of c.files) if (path.startsWith(`${chapterPath}/`)) visit(json);
  if (asked >= 20 && longest / asked > LONGEST_ANSWER_LIMIT) {
    c.notices.push(
      `${chapterPath}: the right answer is the longest option in ${longest} of ${asked} questions (${Math.round((100 * longest) / asked)}%); make wrong options as specific as the right one`,
    );
  }
}

async function buildBook(c: Context, bookPath: string): Promise<Ref | undefined> {
  const manifest = readYaml(c, outPath(bookPath, ContentFile.Manifest), bookManifestSchema);
  if (manifest === undefined) return undefined;
  const chapters: Ref[] = [];
  for (const name of checkChildren(c, bookPath, manifest.chapters, ContentFile.Manifest)) {
    const ref = await buildChapter(c, `${bookPath}/${name}`);
    if (ref !== undefined) chapters.push(ref);
  }
  const id = idOf(bookPath);
  claimId(c, id, bookPath);
  const art = await buildArt(c, bookPath);
  const item: BuiltBook = {
    kind: Kind.Book,
    id,
    version: "",
    source: source(c, bookPath, ContentFile.Manifest),
    title: manifest.title,
    art,
    chapters,
  };
  return emit(c, outPath(bookPath, BuiltFile.Book), item, builtBookSchema);
}

/** Graph edges must join built concepts and never loop. */
function checkGraph(c: Context, graph: GraphFile): BuiltGraph {
  const where = ContentFile.Graph;
  for (const edge of graph.edges) {
    for (const path of [edge.concept, ...edge.parents]) {
      if (!c.concepts.has(path)) report(c, where, `"${path}" is not a built concept`);
    }
  }
  const state = new Map<string, "visiting" | "done">();
  const visit = (path: string, trail: string[]): void => {
    if (state.get(path) === "done") return;
    if (state.get(path) === "visiting") {
      report(c, where, `a loop: ${[...trail, path].join(" → ")}`);
      return;
    }
    state.set(path, "visiting");
    for (const parent of c.parents.get(path) ?? []) visit(parent, [...trail, path]);
    state.set(path, "done");
  };
  for (const path of c.parents.keys()) visit(path, []);
  return {
    edges: graph.edges.map((e) => ({
      concept: idOf(e.concept),
      parents: e.parents.map((p) => idOf(p)),
    })),
  };
}

/**
 * Builds everything content/build.yaml reaches, in order, and checks it: manifests, every name
 * against the folders, every page and question board (wiring, witness, notes), ids, the graph.
 * Nothing is written; the result says what to write.
 */
export async function buildContent(options: {
  contentDir: string;
  defs: Defs;
  readings: Readings;
  commit: string;
}): Promise<BuildResult> {
  const c: Context = {
    ...options,
    files: new Map(),
    problems: [],
    notices: [],
    ids: new Map(),
    parents: new Map(),
    concepts: new Set(),
    sources: new Map(),
  };
  const graph: GraphFile = existsSync(join(c.contentDir, ContentFile.Graph))
    ? (readYaml(c, ContentFile.Graph, graphFileSchema) ?? { edges: [] })
    : { edges: [] };
  for (const edge of graph.edges)
    c.parents.set(edge.concept, [...(c.parents.get(edge.concept) ?? []), ...edge.parents]);

  const root = readYaml(c, ContentFile.Manifest, rootManifestSchema);
  const books: Ref[] = [];
  for (const name of checkChildren(c, "", root?.books ?? [], ContentFile.Manifest)) {
    const ref = await buildBook(c, name);
    if (ref !== undefined) books.push(ref);
  }
  c.files.set(BuiltFile.Graph, checkGraph(c, graph));
  const index: BuildIndex = { commit: c.commit, books };
  c.files.set(BuiltFile.Index, index);
  return { files: c.files, problems: c.problems, notices: c.notices, sources: c.sources };
}
