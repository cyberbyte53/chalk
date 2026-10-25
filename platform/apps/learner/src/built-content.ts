import { bankLessonId, conceptLessonId, practiceLessonId } from "@chalk/api";
import {
  type Board,
  BuiltFile,
  type Lesson,
  builtChapterSchema,
  builtConceptSchema,
} from "@chalk/content";

/**
 * A concept as the app plays it: its pages, then practice right after them (null if it has no
 * questions), and the rest of its bank for later (null if practice already holds them all).
 */
export type ConceptLessons = { pages: Lesson; practice: Lesson | null; bank: Lesson | null };

/** Boards numbered in order and named uniquely, as a published lesson's are. */
function asLesson(base: Omit<Lesson, "boards">, boards: readonly Board[]): Lesson {
  const taken = new Set<string>();
  return {
    ...base,
    boards: boards.map((board, i) => {
      let name = board.name;
      for (let n = 2; taken.has(name); n++) name = `${board.name}${n}`;
      taken.add(name);
      return { ...board, id: i + 1, name };
    }),
  };
}

/**
 * Each built concept, by its id, as the lessons the player can show: its overview pages in order
 * (`concept/<id>`); practice (`practice/<id>`), the questions marked `firstTry` in that order, or
 * every question testing it when none is marked; and the rest of the bank (`bank/<id>`). Later the
 * app will sample the bank for review. `files` maps a path (under `prefix`) to that file's JSON;
 * `boards` maps a page's or question's path to its board, made from its code (content-store).
 */
export function conceptLessons(
  files: Readonly<Record<string, unknown>>,
  prefix: string,
  boards: ReadonlyMap<string, Board>,
): Map<string, ConceptLessons> {
  const read = (path: string): unknown => {
    const json = files[prefix + path];
    if (json === undefined) throw new Error(`build/${path} is missing; run pnpm build-content`);
    return json;
  };
  const boardAt = (path: string): Board => {
    const board = boards.get(path);
    if (board === undefined) throw new Error(`no board made for build/${path}`);
    return board;
  };
  const lessons = new Map<string, ConceptLessons>();
  for (const [path, json] of Object.entries(files)) {
    if (!path.endsWith(`/${BuiltFile.Chapter}`)) continue;
    const chapter = builtChapterSchema.parse(json);
    for (const ref of chapter.concepts) {
      const concept = builtConceptSchema.parse(read(ref.path));
      const pages = concept.overview.map((page) => boardAt(page.path));
      const testing = chapter.questions.filter((question) => question.tests.includes(concept.id));
      const first = testing
        .filter((question) => question.firstTry !== undefined)
        .sort((a, b) => (a.firstTry ?? 0) - (b.firstTry ?? 0));
      const rest = first.length === 0 ? [] : testing.filter((q) => q.firstTry === undefined);
      const boards = (refs: typeof testing) => refs.map((question) => boardAt(question.path));
      const practice = first.length === 0 ? testing : first;
      const base = { version: concept.version, title: concept.title, concepts: [concept.id] };
      lessons.set(concept.id, {
        pages: asLesson({ ...base, id: conceptLessonId(concept.id) }, pages),
        practice:
          practice.length === 0
            ? null
            : asLesson({ ...base, id: practiceLessonId(concept.id) }, boards(practice)),
        bank:
          rest.length === 0
            ? null
            : asLesson({ ...base, id: bankLessonId(concept.id) }, boards(rest)),
      });
    }
  }
  return lessons;
}
