import { loadBoard } from "@chalk/author";
import {
  type Board,
  Kind,
  type Locale,
  type Ref,
  type SoundList,
  builtChapterSchema,
  builtConceptSchema,
  builtFile,
  builtPageSchema,
  builtQuestionSchema,
} from "@chalk/content";
import { modules } from "@chalk/content-source/modules";
import { practiceOf } from "@chalk/learning";
import { propDefs } from "@chalk/library";
import { type ConceptLessons, conceptLessons } from "./built-content";
import type { CourseChapter } from "./course";
import { SKELETON_PREFIX, skeleton } from "./lessons";

/**
 * A chapter's lessons, fetched when it is first opened. The app bundles only the course screens'
 * skeleton (lessons.ts); each page and question is a file under /content/ (build/ on the server),
 * named by its version, so a file is fetched once, kept by the service worker for offline, and a
 * new version is a new file. The file says which module makes its board, and with what: chapters
 * ship as code, and the board is made from it here (its module is a chunk of the app, loaded once).
 * Kept in memory while the app is open. Its sound is fetched lesson by lesson, ahead of the
 * child (`soundAhead`), never waited for.
 */
export type ChapterContent = ReadonlyMap<string, ConceptLessons>;

/** Where a built file is served: build/<path>, its version in the query so it can be kept forever. */
export const CONTENT_ROUTE = "/content/";
export const contentUrl = (ref: Pick<Ref, "path" | "version">): string =>
  `${CONTENT_ROUTE}${builtFile(ref.path)}?v=${ref.version}`;

/** The chapter's files couldn't be fetched: offline and not kept from before, or the server said no. */
export class ContentUnavailable extends Error {}

/** How many files are asked for at once. */
const AT_ONCE = 8;

const ready = new Map<string, ChapterContent>();
const loading = new Map<string, Promise<ChapterContent>>();
/** Each loading chapter's watchers: a screen opened while it loads still sees the progress. */
const watchers = new Map<string, Set<(done: number, total: number) => void>>();

/** The chapter's lessons if they're already here (no waiting), else undefined. */
export function readyChapter(chapter: Pick<CourseChapter, "path">): ChapterContent | undefined {
  return ready.get(chapter.path);
}

/** Fetch a chapter's pages and questions (once; a second call joins the first), telling progress. */
export function loadChapter(
  chapter: Pick<CourseChapter, "path">,
  onProgress: (done: number, total: number) => void = () => {},
): Promise<ChapterContent> {
  const done = ready.get(chapter.path);
  if (done !== undefined) return Promise.resolve(done);
  const watching = watchers.get(chapter.path) ?? new Set();
  watching.add(onProgress);
  watchers.set(chapter.path, watching);
  const running = loading.get(chapter.path);
  if (running !== undefined) return running;
  const tell = (n: number, of: number) => {
    for (const watch of watchers.get(chapter.path) ?? []) watch(n, of);
  };
  const started = fetchChapter(chapter.path, tell).then(
    (content) => {
      ready.set(chapter.path, content);
      loading.delete(chapter.path);
      watchers.delete(chapter.path);
      return content;
    },
    (error: unknown) => {
      loading.delete(chapter.path);
      watchers.delete(chapter.path);
      throw error;
    },
  );
  loading.set(chapter.path, started);
  return started;
}

async function fetchChapter(
  path: string,
  tell: (done: number, total: number) => void,
): Promise<ChapterContent> {
  const bundled = (path: string): unknown => {
    const json = skeleton[SKELETON_PREFIX + builtFile(path)];
    if (json === undefined) throw new ContentUnavailable(`${path} isn't in the app`);
    return json;
  };
  const chapter = builtChapterSchema.parse(bundled(path));
  const files: Record<string, unknown> = { [path]: chapter };
  const refs: Ref[] = [...chapter.questions];
  for (const ref of chapter.concepts) {
    const concept = builtConceptSchema.parse(bundled(ref.path));
    files[ref.path] = concept;
    refs.push(...concept.overview);
  }
  let count = 0;
  tell(0, refs.length);
  const queue = [...refs];
  const worker = async () => {
    for (let ref = queue.shift(); ref !== undefined; ref = queue.shift()) {
      files[ref.path] = await fetchJson(ref);
      count += 1;
      tell(count, refs.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(AT_ONCE, refs.length) }, worker));
  const boards = new Map<string, Board>();
  for (const ref of refs) boards.set(ref.path, await boardOfFile(files[ref.path]));
  return conceptLessons(files, boards);
}

/** How many clips are fetched ahead at once: few, so a line the child is waiting on comes first. */
const AHEAD_AT_ONCE = 2;

/** Each chapter's sound list, fetched once. */
const soundLists = new Map<string, Promise<SoundList | undefined>>();
/** Clips already fetched (or being fetched) this session: the service worker keeps them after. */
const fetchedClips = new Set<string>();
/** The clips still to fetch ahead, in order; a newer plan (another lesson, another language) replaces it. */
let ahead: string[] = [];
let aheadRunning = 0;

/**
 * A lesson's sound, fetched ahead of the child in their language (platform/docs/sound.md): its
 * boards' clips in the order the boards come (pages, then practice, then the bank), then the next
 * lesson's. A line whose clip hasn't come yet fetches it as it plays; a chapter with no sound has
 * no list. Called when a lesson opens, and when the language changes.
 */
export function soundAhead(chapterPath: string, conceptId: string, locale: Locale): void {
  const list =
    soundLists.get(chapterPath) ??
    fetch(`${CONTENT_ROUTE}${chapterPath}/sound/sound.json`)
      .then((reply) => (reply.ok ? (reply.json() as Promise<SoundList>) : undefined))
      .catch(() => undefined);
  soundLists.set(chapterPath, list);
  void list.then((sound) => {
    if (sound === undefined) return;
    const base = `${CONTENT_ROUTE}${chapterPath}/sound/`;
    const order = boardsInOrder(chapterPath, conceptId);
    const files = order.flatMap((board) =>
      sound.clips
        .filter((clip) => clip.locale === locale && clip.boards.includes(board))
        .map((clip) => `${base}${clip.file}`),
    );
    ahead = [...new Set(files)].filter((url) => !fetchedClips.has(url));
    while (aheadRunning < AHEAD_AT_ONCE) void fetchAhead();
  });
}

async function fetchAhead(): Promise<void> {
  aheadRunning += 1;
  for (let url = ahead.shift(); url !== undefined; url = ahead.shift()) {
    if (fetchedClips.has(url)) continue;
    fetchedClips.add(url);
    await fetch(url).catch(() => fetchedClips.delete(url));
  }
  aheadRunning -= 1;
}

/** The boards of a lesson and of the one after it, in the order a child meets them. */
function boardsInOrder(chapterPath: string, conceptId: string): string[] {
  const read = (path: string): unknown => skeleton[SKELETON_PREFIX + builtFile(path)];
  const chapter = builtChapterSchema.parse(read(chapterPath));
  const at = chapter.concepts.findIndex((ref) => ref.id === conceptId);
  return chapter.concepts.slice(Math.max(0, at), at + 2).flatMap((ref) => {
    const concept = builtConceptSchema.parse(read(ref.path));
    const practice = practiceOf(chapter.questions, concept.id);
    const rest = chapter.questions.filter(
      (q) => q.tests.includes(concept.id) && !practice.includes(q),
    );
    return [...concept.overview, ...practice, ...rest].map((board) => board.id);
  });
}

/** A page's or question's board, made from its code (its file under build/ says which). */
export async function boardOfFile(json: unknown): Promise<Board> {
  const item =
    (json as { kind?: unknown }).kind === Kind.Page
      ? builtPageSchema.parse(json)
      : builtQuestionSchema.parse(json);
  return loadBoard(modules, item, (type) => propDefs[type]?.role);
}

async function fetchJson(ref: Ref): Promise<unknown> {
  let reply: Response;
  try {
    reply = await fetch(contentUrl(ref));
  } catch {
    throw new ContentUnavailable(`can't reach ${ref.path}`);
  }
  if (!reply.ok) throw new ContentUnavailable(`${ref.path}: ${reply.status}`);
  return reply.json();
}
