import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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
  builtOf,
  chapterManifestSchema,
  conceptManifestSchema,
  finishBoard,
  graphFileSchema,
  isFamily,
  isPage,
  paramsFileSchema,
  rootManifestSchema,
  siteOf,
  stackOf,
} from "@chalk/author";
import { hashOf, idOf, rowKey, versionOf } from "@chalk/author/id";
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
  LOCALES,
  type Locale,
  type Ref,
  type Source,
  builtBookSchema,
  builtChapterSchema,
  builtConceptSchema,
  builtFamilySchema,
  builtFile,
  builtPageSchema,
  builtQuestionSchema,
  markProblems,
  piecePath,
  propPieces,
  saidParts,
  shownOf,
  soundListSchema,
  walkPieces,
} from "@chalk/content";
import { CONTENT_ROOT, NodePart } from "@chalk/content/address";
import { propPackages } from "@chalk/library";
import { type PropModule, scriptOf } from "@chalk/player";
import { PropRole, segment } from "@chalk/prop";
import type { AnyProp } from "@chalk/prop";
import { parse as parseYaml } from "yaml";
import type { ZodType, ZodTypeDef } from "zod";
import { type GuideSettings, guideAt } from "../guide";
import type { Problem } from "../problem";
import { SOUND_LIST, castSchema, voiceChapter, providers as voiceProviders } from "../sound/voice";
import { unspeakable } from "../sound/voice/said";
import { renderArt } from "./art";
import { recordOf } from "./board-record";
import {
  MODULES_FILE,
  boardModules,
  conceptsModule,
  contentFrom,
  modulesFileOf,
  modulesModule,
} from "./concepts";
import { filesUnder, fingerprint, importClosure, isRecordingImports, recordImports } from "./deps";
import { checkNote, checkWitness } from "./witness";

/** Where each board's record is written in build/ (board-record.ts). */
export const REVIEW_DIR = "review";
/** Each board's witness and note checks, as steps (build/witness/<board>.json). */
export const WITNESS_DIR = "witness";

type Defs = Readonly<Record<string, AnyProp>>;
type Modules = Readonly<Record<string, PropModule>>;

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
  /** What each board was made from, for tracing a change to what it reaches (build/reach.json). */
  reach: Reach;
  /** Chapters built this run, and how many were reused unchanged from the cache. */
  chapters: { built: string[]; reused: number };
};

/** build/sources.json: board path → where its board was written. */
export const SOURCES_FILE = "sources.json";

/** build/screens.json: book, chapter or lesson path → where its title, glyph and art are written. */
export const SCREENS_FILE = "screens.json";

/** build/reach.json: what each board was made from (see Reach). Never shipped. */
export const REACH_FILE = "reach.json";

/**
 * What every board was made from, recorded while building, so a change can be traced to the pieces
 * it reaches (platform/studio/src/reach): for each board, the module that made it and every line of
 * the author's code each piece was made through; for each module, the files it imported.
 * Paths are from the repo root (content/…, library/patterns/…).
 */
export type Reach = {
  boards: Record<string, BoardReach>;
  modules: Record<string, string[]>;
};

export type BoardReach = {
  /** The file whose code made it: an overview.ts or a family.ts. */
  module: string;
  /** Frames of the call that made the board itself (a page's page(...)), innermost first. */
  stack?: readonly string[];
  /** A question's row: `content/…/params.yaml:12-18`. */
  rows?: string;
  /**
   * Each named piece: its prop type (absent for words and groups), the frames it was made through,
   * and how the board uses it: the fields it sets where it places it (`given`), the inputs its rules
   * feed (`binds`) and the actions its scripts call (`calls`). What a prop's page lists under where
   * it is used, and what says which of its fields and actions any board uses.
   */
  pieces: Record<
    string,
    {
      type?: string;
      stack: readonly string[];
      given?: readonly string[];
      /** The prop's children its placement names (`{ walker: {} }` counts): the parts it uses. */
      parts?: readonly string[];
      binds?: readonly string[];
      calls?: readonly string[];
    }
  >;
  /**
   * Each line it says (platform/docs/sound.md), by its name: a piece's line is its piece's name
   * (addressed `board#piece/said`), a line of its own its own (`board#name`). Its piece, what it is
   * about, who says it, and its moment as the event it waits for. Lines are part of the board, so
   * comments on them, `show` them and gone-checks resolve them as they do pieces.
   */
  lines?: Record<string, { piece?: string; about?: string; speaker: string; moment: string }>;
};

/** Where one built board's parts were written, and each placed prop's type. */
export type ItemSources = {
  board?: string;
  pieces: Record<string, string>;
  props: Record<string, string>;
  /** A book, chapter or lesson (its screen things), not a board: written to screens.json instead. */
  screen?: true;
};

/** The repo's root: prop packages are under library/props/ there. */
const REPO_ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

/** Each prop type's package folder (from the repo root), from the library's own list. */
export const PROP_DIRS: Readonly<Record<string, string>> = Object.fromEntries(
  [...propPackages].flatMap(([name, defs]) =>
    existsSync(join(REPO_ROOT, "library", "props", name))
      ? defs.map((def) => [def.type, `library/props/${name}`] as const)
      : [],
  ),
);

type Context = {
  /** Each prop type's package folder, for its version. */
  propDirs: Readonly<Record<string, string>>;
  contentDir: string;
  defs: Defs;
  modules: Modules;
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
  reach: Reach;
  /** Built item path → its board as played, for checks across a chapter (this run only). */
  boards: Map<string, Board>;
  /** Module file (absolute) → the hash of its code, and each file's hash, computed once. */
  codeHashes: Map<string, string>;
  /** The authoring folder, whose guides (guide.md) set who voices whom; none: no voices. */
  guides: string | undefined;
  /** Files imported while building (content paths, relative), for a chapter's dependency list. */
  imported: string[];
  cache: ChapterCache | undefined;
  chapters: { built: string[]; reused: number };
};

/** Each prop's line, read from the board as authored (before ids are added, which copies it). */
function sitesOf(board: Board, boardSite: string | undefined): ItemSources {
  const pieces: Record<string, string> = {};
  for (const piece of walkPieces(board.root)) {
    const site = siteOf(piece);
    if (site !== undefined && piece.name !== "") pieces[piece.name] = site;
  }
  const props = Object.fromEntries(propPieces(board.root).map((p) => [p.name, p.prop]));
  const first = Object.values(pieces)[0];
  const top = boardSite ?? first;
  return top === undefined ? { pieces, props } : { board: top, pieces, props };
}

/** The fields a placement sets: a group's part by part ("walker.walkFrom"). */
function givenFields(def: AnyProp | undefined, given: Readonly<Record<string, unknown>>): string[] {
  const parts = def?.children;
  return Object.entries(given)
    .flatMap(([name, value]) => {
      const part = parts?.[name];
      return part !== undefined && value !== null && typeof value === "object"
        ? givenFields(part, value as Record<string, unknown>).map((f) => `${name}.${f}`)
        : [name];
    })
    .sort();
}

/** What the scene's `give` feeds each piece: the needs, by path inside it ("walker.target"). */
function fedOf(board: Board): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const [path, needs] of Object.entries(board.model.scene.give ?? {})) {
    const [piece = "", ...inside] = path.split(/[./]/);
    const into = out.get(piece) ?? new Set<string>();
    for (const need of Object.keys(needs as object)) into.add([...inside, need].join("."));
    out.set(piece, into);
  }
  return out;
}

/** What a board was made from (see Reach), read from the board as authored. */
function reachOf(
  board: Board,
  module: string,
  more: { stack?: readonly string[]; rows?: string },
  defs: Defs,
  modules: Readonly<Record<string, PropModule>>,
  /** What the lesson's own rules were seen to do to each piece, as its runs played. */
  called: ReadonlyMap<string, ReadonlySet<string>>,
): BoardReach {
  const placed = new Map(propPieces(board.root).map((p) => [p.name, p]));
  const fed = fedOf(board);
  const pieces: BoardReach["pieces"] = {};
  for (const piece of walkPieces(board.root)) {
    if (piece.name === "") continue;
    const prop = placed.get(piece.name);
    const given = givenFields(prop === undefined ? undefined : defs[prop.prop], prop?.with ?? {});
    const children = prop === undefined ? undefined : defs[prop.prop]?.children;
    const parts = Object.keys(prop?.with ?? {})
      .filter((name) => children?.[name] !== undefined)
      .sort();
    const binds = [...(fed.get(piece.name) ?? [])].sort();
    const calls = [...(called.get(piece.name) ?? [])].sort();
    pieces[piece.name] = {
      ...(prop === undefined ? {} : { type: prop.prop }),
      stack: stackOf(piece),
      ...(given.length > 0 ? { given } : {}),
      ...(parts.length > 0 ? { parts } : {}),
      ...(binds.length > 0 ? { binds } : {}),
      ...(calls.length > 0 ? { calls } : {}),
    };
  }
  const lines: NonNullable<BoardReach["lines"]> = {};
  for (const l of scriptOf(board, (type) => modules[type]))
    lines[l.line] = {
      ...(l.piece === undefined ? {} : { piece: l.piece }),
      ...(l.about === undefined ? {} : { about: l.about }),
      speaker: l.speaker,
      moment: l.moment,
    };
  return {
    module: `content/${module}`,
    ...(more.stack === undefined || more.stack.length === 0 ? {} : { stack: more.stack }),
    ...(more.rows === undefined ? {} : { rows: more.rows }),
    pieces,
    ...(Object.keys(lines).length > 0 ? { lines } : {}),
  };
}

/** A path read while building, from the repo root, if it is the author's code (content/, library/patterns/). */
function authoredPath(c: Context, path: string): string | undefined {
  if (path.startsWith(`${c.contentDir}/`)) return `content/${relative(c.contentDir, path)}`;
  const fromRoot = relative(REPO_ROOT, path);
  return fromRoot.startsWith("library/patterns/") ? fromRoot : undefined;
}

/**
 * The hash of the code that makes a module's boards: the module and every file it imports, as
 * Node resolved them while building (outside node_modules; libraries change with the lockfile).
 * A change to any of them is a new version of every item the module makes.
 */
function codeHash(c: Context, module: string): string {
  const file = join(c.contentDir, module);
  const known = c.codeHashes.get(file);
  if (known !== undefined) return known;
  const fileHash = (path: string): string => {
    const key = `file:${path}`;
    const seen = c.codeHashes.get(key);
    if (seen !== undefined) return seen;
    const hash = hashOf(readFileSync(path, "utf8"));
    c.codeHashes.set(key, hash);
    return hash;
  };
  const closure = [...importClosure([file])].sort();
  c.reach.modules[`content/${module}`] = closure
    .map((path) => authoredPath(c, path))
    .filter((path): path is string => path !== undefined && path !== `content/${module}`);
  const hash = hashOf(closure.map((path) => [relative(c.contentDir, path), fileHash(path)]));
  c.codeHashes.set(file, hash);
  return hash;
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

/**
 * The line (from 1) where a params.yaml's row starts: its `- ` at the top level, else 1 (or, with
 * `pastEnd`, one past the file's last line: where a row after the last would start).
 */
/** Lines `from`–`to`, or one line when they're the same. */
const lineRange = (from: number, to: number) => (to > from ? `${from}-${to}` : `${from}`);

function rowLine(c: Context, file: string, row: number, pastEnd = false): number {
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
  return pastEnd ? lines.length + 1 : 1;
}

/** Hands out an item's id, refusing one already taken. */
function claimId(c: Context, id: string, where: string): void {
  const other = c.ids.get(id);
  if (other !== undefined) report(c, where, `same id ${id} as ${other}`);
  c.ids.set(id, where);
}

function source(c: Context, path: string, file: string, row?: number): Source {
  return row === undefined ? { path, file } : { path, file, row };
}

/**
 * Files an item at its path in the course tree (`<path>.json`), with its version unless it has one
 * already (a board's is worked out with its code), checks it against its format, and returns a
 * pointer to it.
 */
function emit<T extends { path: string; id: string; version: string; source: Source }>(
  c: Context,
  item: T,
  schema: ZodType<T, ZodTypeDef, unknown>,
): Ref {
  if (item.version === "") item.version = versionOf(item);
  const file = builtFile(item.path);
  const parsed = schema.safeParse(item);
  if (!parsed.success) {
    for (const issue of parsed.error.issues)
      report(c, file, `${issue.path.join(".")}: ${issue.message}`);
  }
  if (c.files.has(file)) report(c, file, `two items at ${item.path}`);
  c.files.set(file, item);
  return { id: item.id, version: item.version, path: item.path };
}

/**
 * Every id to its path: each built item's, and each prop placed on a board (`<board path>#<address>`),
 * so the ids events carry read back as paths. Sorted, so an unchanged build writes the same file.
 */
function idsOf(c: Context): Record<string, string> {
  const paths: string[] = [];
  for (const item of c.files.values()) {
    const path = (item as { path?: unknown }).path;
    if (typeof path === "string") paths.push(path);
  }
  for (const [board, where] of c.sources)
    for (const name of Object.keys(where.props)) paths.push(piecePath(board, segment(name)));
  return Object.fromEntries(paths.sort().map((path) => [idOf(path), path]));
}

/**
 * A board item's prop versions and its version: the board is made from its module's code and the
 * props it places, so its version is worked out from them (its board must be built first).
 */
function versionBoard(
  c: Context,
  item: BuiltPage | BuiltQuestion,
  built: BuiltBoard,
  module: string,
): void {
  item.props = Object.fromEntries(
    [...new Set(propTypesOf(built.board))].sort().map((type) => [type, propVersion(c, type)]),
  );
  item.version = versionOf(item, codeHash(c, module));
}

/** A prop type's version: a hash of its package's source (every file under its folder). */
function propVersion(c: Context, type: string): string {
  const key = `prop:${type}`;
  const known = c.codeHashes.get(key);
  if (known !== undefined) return known;
  const dir = c.propDirs[type];
  const files = dir === undefined ? [] : filesUnder(join(REPO_ROOT, dir));
  const version = hashOf(
    files.sort().map((f) => [relative(REPO_ROOT, f), hashOf(readFileSync(f, "utf8"))]),
  );
  c.codeHashes.set(key, version);
  return version;
}

async function importModule(
  c: Context,
  path: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    c.imported.push(join(c.contentDir, path));
    return await import(pathToFileURL(join(c.contentDir, path)).href);
  } catch (error) {
    report(c, path, error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

/**
 * Where a book, chapter or lesson's screen things are written (platform/docs/plans/
 * comment-on-screens.md): its title and glyph on their build.yaml lines, its art in its art.tsx.
 * Into build/screens.json (split from the boards' at writing), so a comment on one names its line.
 */
function noteNodeSources(c: Context, folder: string): void {
  const manifest = outPath(folder, ContentFile.Manifest);
  const lines = existsSync(join(c.contentDir, manifest))
    ? readFileSync(join(c.contentDir, manifest), "utf8").split("\n")
    : [];
  const lineOf = (key: string) => {
    const at = lines.findIndex((line) => line.startsWith(`${key}:`));
    return at === -1 ? undefined : `${CONTENT_ROOT}${manifest}:${at + 1}`;
  };
  const pieces: Record<string, string> = {};
  for (const part of [NodePart.Title, NodePart.Glyph]) {
    const site = lineOf(part);
    if (site !== undefined) pieces[part] = site;
  }
  const art = outPath(folder, ContentFile.Art);
  if (existsSync(join(c.contentDir, art))) pieces[NodePart.Art] = `${CONTENT_ROOT}${art}:1`;
  const board = lineOf(NodePart.Title) ?? `${CONTENT_ROOT}${manifest}:1`;
  c.sources.set(folder, { board, pieces, props: {}, screen: true });
}

/** A folder's art (its art.tsx), drawn and checked; null when it has none. */
async function buildArt(c: Context, folder: string): Promise<BuiltArt | null> {
  noteNodeSources(c, folder);
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

/**
 * Checks a built board: its witness and its note checks, played on the real props (a scene's
 * wiring is its code, checked when it is defined and as it plays). What the lesson's own rules do
 * to each piece on the way goes into `called`.
 */
async function checkBoard(
  c: Context,
  where: string,
  built: BuiltBoard,
  board: Board,
  called: Map<string, Set<string>>,
): Promise<boolean> {
  const before = c.problems.length;
  const onCalled = (piece: string, action: string) =>
    void called.set(piece, (called.get(piece) ?? new Set()).add(action));
  // Which of the board's lines its passing runs are heard to say, in each language: a line no run
  // says (in some language) is worth a look.
  const heard = new Map<Locale, Set<string>>();
  const onHeard = (line: string, locale: Locale) =>
    void heard.set(locale, (heard.get(locale) ?? new Set()).add(line));
  for (const failure of await checkWitness(board, c.modules, built.witness, onHeard, onCalled))
    report(c, where, failure);
  for (const note of built.noteChecks) {
    for (const failure of await checkNote(
      board,
      c.modules,
      note.steps,
      note.feedback,
      onHeard,
      onCalled,
    )) {
      report(c, where, `note "${note.feedback.en}": ${failure}`);
    }
  }
  for (const { line } of scriptOf(board, (type) => c.modules[type])) {
    const missing = LOCALES.filter((l) => heard.get(l)?.has(line) !== true);
    if (missing.length > 0)
      c.notices.push(
        `${where}: no passing run says ${line}${missing.length < LOCALES.length ? ` in ${missing.join(", ")}` : ""} (a moment never true, or a path no witness or note takes)`,
      );
  }
  return c.problems.length === before;
}

/**
 * An item's board, made from its module the way the app and the server make it (`boardOf`), and
 * kept for the chapter's checks. Undefined (reported) if the module doesn't make it.
 */
function makeBoard(
  c: Context,
  where: string,
  item: BuiltPage | BuiltQuestion,
  module: Readonly<Record<string, unknown>>,
  moduleFile: string,
): { built: BuiltBoard; board: Board } | undefined {
  try {
    const built = builtOf(item, module);
    versionBoard(c, item, built, moduleFile);
    const board = finishBoard(item, built, (type) => c.defs[type]?.role);
    c.boards.set(item.path, board);
    return { built, board };
  } catch (error) {
    report(c, where, error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

/** A good board's record, for knowing what changed since it was reviewed (the changes tool). */
function keepRecord(c: Context, item: BuiltPage | BuiltQuestion, built: BuiltBoard): void {
  c.files.set(`${REVIEW_DIR}/${item.path}.json`, recordOf(built.board));
  // How a learner gets through it, and each note's way there: replayed on the screen by the chapter
  // check (a step a finger can't take is found there, not here, where no screen is drawn).
  c.files.set(`${WITNESS_DIR}/${item.path}.json`, {
    witness: built.witness,
    noteChecks: built.noteChecks.map((n) => n.steps),
  });
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
    const path = `${conceptPath}/${p.key}`;
    const item: BuiltPage = {
      kind: Kind.Page,
      path,
      id: idOf(path),
      version: "",
      source: source(c, conceptPath, ContentFile.Overview, row),
      concept: conceptId,
      key: p.key,
      props: {},
    };
    const made = makeBoard(c, where, item, module, file);
    const called = new Map<string, Set<string>>();
    if (made === undefined || !(await checkBoard(c, where, made.built, made.board, called)))
      continue;
    keepRecord(c, item, made.built);
    for (const type of propTypesOf(made.board)) used.add(type);
    claimId(c, item.id, where);
    c.sources.set(path, sitesOf(made.built.board, p.site));
    c.reach.boards[path] = reachOf(
      made.built.board,
      file,
      { ...(p.stack === undefined ? {} : { stack: p.stack }) },
      c.defs,
      c.modules,
      called,
    );
    refs.push(emit(c, item, builtPageSchema));
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
  const banked: Banked[] = [];
  const keys = new Map<string, number>();
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
    const key = rowKey(r.params);
    const other = keys.get(key);
    if (other !== undefined) {
      report(c, where, `the same params as row ${other}: one question, written twice`);
      continue;
    }
    keys.set(key, row);
    const path = `${familyPath}/${key}`;
    const id = idOf(path);
    const level = r.level ?? fam.level;
    const item: BuiltQuestion = {
      kind: Kind.Question,
      path,
      id,
      version: "",
      source: source(c, familyPath, ContentFile.Params, row),
      tests,
      family: familyId,
      level,
      origin: r.origin,
      ...(r.firstTry === undefined ? {} : { firstTry: r.firstTry }),
      params: r.params,
      props: {},
    };
    const made = makeBoard(c, where, item, module, familyFile);
    const called = new Map<string, Set<string>>();
    if (made === undefined || !(await checkBoard(c, where, made.built, made.board, called)))
      continue;
    const { built, board } = made;
    if (built.witness.length === 0) {
      report(c, where, "a question needs a witness: how a learner gets it right");
      continue;
    }
    keepRecord(c, item, built);
    claimId(c, id, where);
    c.sources.set(path, {
      ...sitesOf(built.board, undefined),
      board: `content/${paramsFile}:${rowLine(c, paramsFile, row)}`,
    });
    c.reach.boards[path] = reachOf(
      built.board,
      familyFile,
      {
        rows: `content/${paramsFile}:${lineRange(rowLine(c, paramsFile, row), rowLine(c, paramsFile, row + 1, true) - 1)}`,
      },
      c.defs,
      c.modules,
      called,
    );
    const ref = emit(c, item, builtQuestionSchema);
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
    path: familyPath,
    id: familyId,
    version: "",
    source: source(c, familyPath, ContentFile.Family),
    chapter: chapter.id,
    tests,
    questions: banked.map(({ id, version, path }) => ({ id, version, path })),
  };
  emit(c, item, builtFamilySchema);
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
  return [...new Set(types)].filter((type) => c.defs[type]?.role === PropRole.Explainer).sort();
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
    else if (def.role !== PropRole.Explainer)
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
    path: draft.path,
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
  return emit(c, item, builtConceptSchema);
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
  const problemsBefore = c.problems.length;
  const manifest = readYaml(c, outPath(chapterPath, ContentFile.Manifest), chapterManifestSchema);
  if (manifest === undefined) return undefined;
  if (manifest.concepts.includes(SOUND_DIR))
    report(
      c,
      chapterPath,
      `a lesson can't be named "${SOUND_DIR}": it is the chapter's sound folder`,
    );
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
    path: chapterPath,
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
  checkMarks(c, chapterPath);
  await voiceOf(c, chapterPath, c.problems.length === problemsBefore);
  return emit(c, item, builtChapterSchema);
}

/** Whether every clip a chapter's sound list names is there (a chapter reused as built must still sound). */
function isSoundComplete(c: Context, chapterPath: string, entry: ChapterEntry): boolean {
  const dir = join(c.contentDir, chapterPath, SOUND_DIR);
  const list = join(dir, SOUND_LIST);
  // A chapter that says lines (its script was built) has a list; one that doesn't, doesn't.
  const saysLines = entry.files.some(([path]) => path === `${chapterPath}/${SCRIPT_FILE}`);
  if (!existsSync(list)) return !saysLines;
  const parsed = soundListSchema.safeParse(JSON.parse(readFileSync(list, "utf8")));
  return parsed.success && parsed.data.clips.every((clip) => existsSync(join(dir, clip.file)));
}

/** A chapter's script beside its built content: every line its boards can say (the preview's script view, look). */
export const SCRIPT_FILE = "script.json";

/** A chapter's sound folder: its clips and their list. */
const SOUND_DIR = "sound";

/**
 * A chapter's sound (platform/docs/sound.md): its boards' lines voiced into its own sound folder
 * (content/<book>/<chapter>/sound: only missing clips made; one list, sound.json), its script built
 * beside it. A line that can't be voiced (it needs its spoken words; no voice to make it) is a
 * problem: a chapter never ships silent.
 */
async function voiceOf(c: Context, chapterPath: string, isWhole: boolean): Promise<void> {
  const where = `${chapterPath}/sound`;
  const boards = [...c.boards]
    .filter(([path]) => path.startsWith(`${chapterPath}/`))
    .map(([path, board]) => ({
      id: board.item?.id ?? path,
      path,
      lines: scriptOf(board, (type) => c.modules[type]),
    }));
  // A chapter whose boards say nothing has nothing to voice.
  if (boards.every((b) => b.lines.length === 0)) return;
  const voices = voicesFor(c, chapterPath);
  if (voices === undefined) {
    report(
      c,
      where,
      "its boards say lines, but no guide sets voices (authoring/guide.md, ## Settings)",
    );
    return;
  }
  const soundDir = join(c.contentDir, chapterPath, SOUND_DIR);
  mkdirSync(soundDir, { recursive: true });
  try {
    const { cast } = castSchema.parse({ cast: voices });
    const voiced = await voiceChapter({
      soundDir,
      boards,
      isWhole,
      cast,
      providers: voiceProviders,
    });
    c.files.set(`${chapterPath}/${SCRIPT_FILE}`, voiced.script);
    for (const line of voiced.unsaid) report(c, where, line);
    if (voiced.made > 0) c.notices.push(`${where}: ${voiced.made} clips made`);
  } catch (error) {
    report(c, where, error instanceof Error ? error.message : String(error));
  }
}

/**
 * Every text on every board of a chapter, in every language: its speech marks (`[[shown|said]]`,
 * @chalk/content marks.ts) read cleanly, and what each says is speakable. A mark that doesn't read
 * would show its brackets; a spoken part a voice can't say would be guessed.
 */
function checkMarks(c: Context, chapterPath: string): void {
  const visit = (node: unknown, where: string): void => {
    if (typeof node === "string") {
      for (const problem of markProblems(node)) report(c, where, `"${node}": ${problem}`);
      for (const part of saidParts(node)) {
        const odd = unspeakable(part.replace(/\{\w+\}/g, " "));
        if (odd.length > 0)
          report(
            c,
            where,
            `"${node}": the mark's spoken words have "${odd.join(" ")}": write them in words`,
          );
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) visit(child, where);
      return;
    }
    if (node === null || typeof node !== "object") return;
    for (const value of Object.values(node)) visit(value, where);
  };
  for (const [path, board] of c.boards) if (path.startsWith(`${chapterPath}/`)) visit(board, path);
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
          lengths.set(option.id, shownOf(option.label.en).length);
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
  for (const [path, board] of c.boards) if (path.startsWith(`${chapterPath}/`)) visit(board);
  if (asked >= 20 && longest / asked > LONGEST_ANSWER_LIMIT) {
    c.notices.push(
      `${chapterPath}: the right answer is the longest option in ${longest} of ${asked} questions (${Math.round((100 * longest) / asked)}%); make wrong options as specific as the right one`,
    );
  }
}

// ---- The chapter cache: a chapter is rebuilt only when something it read has changed ----

/**
 * Settings for keeping built chapters between runs. A chapter's entry holds everything building it
 * added (files, problems, notices, ids, concepts, sources) and the list of files it depended on,
 * recorded, not declared:
 * - every file under the chapter's folder (its manifests, lessons, questions, art), except its
 *   comments, run notes and sources, which the build never reads;
 * - every file the chapter's modules imported, transitively (other chapters' kits, patterns, props'
 *   defs, the platform), from the imports Node actually resolved;
 * - the whole source of each prop package its boards place (their witnesses run that code);
 * - the builder's own code, and the inputs every chapter shares (root manifests, graph,
 *   root files of the repo, the Node version, the commit being built).
 * If every one of those files is byte-for-byte as it was, the entry is replayed; otherwise the
 * chapter is built and its entry rewritten.
 */
type ChapterCache = {
  dir: string;
  root: string;
  propDirs: Readonly<Record<string, string>>;
  /** Files every chapter depends on (builder code, shared inputs). */
  shared: string[];
};

type ChapterEntry = {
  key: string;
  deps: string[];
  ref: Ref | undefined;
  files: [string, unknown][];
  problems: Problem[];
  notices: string[];
  ids: [string, string][];
  concepts: string[];
  sources: [string, ItemSources][];
  reach: Reach;
};

function chapterCache(o: {
  dir: string;
  root: string;
  propDirs: Readonly<Record<string, string>>;
}): ChapterCache {
  const builder = importClosure([fileURLToPath(import.meta.url)]);
  const rootFiles = readdirSync(o.root)
    .map((name) => join(o.root, name))
    .filter((f) => statSync(f).isFile());
  // The registry's table of prop definitions is used to check every board.
  const registry = filesUnder(join(o.root, "library", "registry", "src"));
  return { ...o, shared: [...builder, ...rootFiles, ...registry] };
}

function entryFile(cache: ChapterCache, chapterPath: string): string {
  return join(cache.dir, `${chapterPath.replace(/\//g, "__")}.json`);
}

/** Bump when what an entry records changes: every older entry is then rebuilt. */
const CACHE_FORMAT = "4";

function keyOf(c: Context, chapterPath: string, deps: readonly string[]): string {
  // The guides count only by the voices they set: editing their prose rebuilds nothing.
  return fingerprint(deps, [
    CACHE_FORMAT,
    process.version,
    c.contentDir,
    JSON.stringify(voicesFor(c, chapterPath) ?? null),
  ]);
}

/** Who voices whom in a chapter: its guides' settings, merged (the nearest level wins). */
function voicesFor(c: Context, chapterPath: string): GuideSettings["voices"] {
  return c.guides === undefined ? undefined : guideAt(c.guides, chapterPath).settings.voices;
}

function sharedContentFiles(c: Context): string[] {
  return [ContentFile.Manifest, ContentFile.Graph].map((f) => join(c.contentDir, f));
}

async function cachedChapter(c: Context, chapterPath: string): Promise<Ref | undefined> {
  const cache = c.cache;
  if (cache === undefined || !isRecordingImports()) {
    c.chapters.built.push(chapterPath);
    return buildChapter(c, chapterPath);
  }
  const file = entryFile(cache, chapterPath);
  let entry: ChapterEntry | undefined;
  try {
    entry = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as ChapterEntry) : undefined;
  } catch {
    entry = undefined;
  }
  // Its sound folder is what voicing writes, not what the chapter is built from; the voices are.
  const chapterDir = join(c.contentDir, chapterPath);
  const chapterFiles = [
    ...filesUnder(chapterDir).filter(
      (f) => !relative(chapterDir, f).startsWith(`${SOUND_DIR}${sep}`),
    ),
  ];
  // The folder's own files are listed afresh: a file added or removed changes the key.
  if (
    entry !== undefined &&
    keyOf(c, chapterPath, [...entry.deps, ...chapterFiles]) === entry.key &&
    isSoundComplete(c, chapterPath, entry)
  ) {
    for (const [path, json] of entry.files) c.files.set(path, json);
    c.problems.push(...entry.problems);
    c.notices.push(...entry.notices);
    for (const [id, where] of entry.ids) claimId(c, id, where);
    for (const concept of entry.concepts) c.concepts.add(concept);
    for (const [path, where] of entry.sources) c.sources.set(path, where);
    Object.assign(c.reach.boards, entry.reach.boards);
    Object.assign(c.reach.modules, entry.reach.modules);
    c.chapters.reused += 1;
    return entry.ref;
  }
  const before = {
    files: new Set(c.files.keys()),
    problems: c.problems.length,
    notices: c.notices.length,
    ids: new Set(c.ids.keys()),
    concepts: new Set(c.concepts),
    sources: new Set(c.sources.keys()),
    boards: new Set(Object.keys(c.reach.boards)),
    modules: new Set(Object.keys(c.reach.modules)),
    imported: c.imported.length,
  };
  const ref = await buildChapter(c, chapterPath);
  c.chapters.built.push(chapterPath);
  const files = [...c.files].filter(([path]) => !before.files.has(path));
  const used = new Set<string>();
  for (const [, json] of files) {
    const board = (json as { board?: Board }).board;
    if (board?.root !== undefined) for (const type of propTypesOf(board)) used.add(type);
  }
  const propFiles: string[] = [];
  for (const type of used) {
    const dir = cache.propDirs[type];
    // A prop whose package we can't place: depend on every prop (larger, never wrong).
    propFiles.push(...filesUnder(join(cache.root, dir ?? "library/props")));
  }
  const deps = [
    ...cache.shared,
    ...sharedContentFiles(c),
    ...importClosure(c.imported.slice(before.imported)),
    ...propFiles,
  ].filter((f) => !f.startsWith(`${join(c.contentDir, chapterPath)}/`));
  const fresh: ChapterEntry = {
    key: keyOf(c, chapterPath, [...deps, ...chapterFiles]),
    deps: [...new Set(deps)],
    ref,
    files,
    problems: c.problems.slice(before.problems),
    notices: c.notices.slice(before.notices),
    ids: [...c.ids].filter(([id]) => !before.ids.has(id)),
    concepts: [...c.concepts].filter((x) => !before.concepts.has(x)),
    sources: [...c.sources].filter(([path]) => !before.sources.has(path)),
    reach: {
      boards: Object.fromEntries(
        Object.entries(c.reach.boards).filter(([path]) => !before.boards.has(path)),
      ),
      modules: Object.fromEntries(
        Object.entries(c.reach.modules).filter(([path]) => !before.modules.has(path)),
      ),
    },
  };
  // A chapter with problems is rebuilt every time: some problems (a repeated id) depend on others.
  if (fresh.problems.length === 0) {
    mkdirSync(cache.dir, { recursive: true });
    writeFileSync(file, JSON.stringify(fresh));
  }
  return ref;
}

async function buildBook(c: Context, bookPath: string): Promise<Ref | undefined> {
  const manifest = readYaml(c, outPath(bookPath, ContentFile.Manifest), bookManifestSchema);
  if (manifest === undefined) return undefined;
  const chapters: Ref[] = [];
  for (const name of checkChildren(c, bookPath, manifest.chapters, ContentFile.Manifest)) {
    const ref = await cachedChapter(c, `${bookPath}/${name}`);
    if (ref !== undefined) chapters.push(ref);
  }
  const id = idOf(bookPath);
  claimId(c, id, bookPath);
  const art = await buildArt(c, bookPath);
  const item: BuiltBook = {
    kind: Kind.Book,
    path: bookPath,
    id,
    version: "",
    source: source(c, bookPath, ContentFile.Manifest),
    title: manifest.title,
    art,
    chapters,
  };
  return emit(c, item, builtBookSchema);
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
  /** Every prop with its view (drawing a prop is how it's described: witnesses read descriptions). */
  modules: Modules;
  commit: string;
  /** The modules.gen.ts the app and the server load (platform/content-source/ by default). */
  modulesFile?: string;
  /** Where built chapters are kept between runs (with what they read); no cache when absent. */
  cache?: { dir: string; root: string; propDirs: Readonly<Record<string, string>> };
  /** The authoring folder: its guides set who voices whom; without them, a chapter that says lines is a problem. */
  guides?: string;
}): Promise<BuildResult> {
  const { cache, modulesFile, modules, guides: _, ...rest } = options;
  const c: Context = {
    ...rest,
    modules,
    defs: {
      ...Object.fromEntries(Object.entries(modules).map(([type, m]) => [type, m.def])),
    },
    propDirs: PROP_DIRS,
    imported: [],
    chapters: { built: [], reused: 0 },
    cache: cache === undefined || !recordImports() ? undefined : chapterCache(cache),
    files: new Map(),
    problems: [],
    notices: [],
    ids: new Map(),
    parents: new Map(),
    concepts: new Set(),
    sources: new Map(),
    reach: { boards: {}, modules: {} },
    boards: new Map(),
    codeHashes: new Map(),
    guides: options.guides,
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
  // The app and the server load boards' code through modules.gen.ts: it must list what this builds.
  const modulesGen = modulesFile ?? modulesFileOf(c.contentDir);
  const modulesText = existsSync(modulesGen) ? readFileSync(modulesGen, "utf8") : undefined;
  if (
    modulesText !== modulesModule(boardModules(c.contentDir), contentFrom(modulesGen, c.contentDir))
  )
    report(
      c,
      MODULES_FILE,
      `${modulesText === undefined ? "missing" : "out of date with the manifests"}: run pnpm build-content and commit it`,
    );
  const index: BuildIndex = { commit: c.commit, books };
  c.files.set(BuiltFile.Index, index);
  c.files.set(BuiltFile.Ids, idsOf(c));
  return {
    files: c.files,
    problems: c.problems,
    notices: c.notices,
    sources: c.sources,
    reach: c.reach,
    chapters: c.chapters,
  };
}
