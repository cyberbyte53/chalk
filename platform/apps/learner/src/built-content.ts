import {
  type Board,
  Kind,
  type Lesson,
  builtChapterSchema,
  builtConceptSchema,
} from "@chalk/content";
import { bankLessonId, conceptLessonId, practiceLessonId, practiceOf } from "@chalk/learning";

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
 * app will sample the bank for review. `items` maps a node's path to its built item; `boards` maps
 * a page's or question's path to its board, made from its code (content-store).
 */
export function conceptLessons(
  items: Readonly<Record<string, unknown>>,
  boards: ReadonlyMap<string, Board>,
): Map<string, ConceptLessons> {
  const read = (path: string): unknown => {
    const json = items[path];
    if (json === undefined) throw new Error(`${path} is missing; run pnpm build-content`);
    return json;
  };
  const boardAt = (path: string): Board => {
    const board = boards.get(path);
    if (board === undefined) throw new Error(`no board made for ${path}`);
    return board;
  };
  const lessons = new Map<string, ConceptLessons>();
  for (const json of Object.values(items)) {
    if ((json as { kind?: unknown }).kind !== Kind.Chapter) continue;
    const chapter = builtChapterSchema.parse(json);
    for (const ref of chapter.concepts) {
      const concept = builtConceptSchema.parse(read(ref.path));
      const pages = concept.overview.map((page) => boardAt(page.path));
      const testing = chapter.questions.filter((question) => question.tests.includes(concept.id));
      const practice = practiceOf(chapter.questions, concept.id);
      const rest = testing.filter((q) => !practice.includes(q));
      const boards = (refs: typeof testing) => refs.map((question) => boardAt(question.path));
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
