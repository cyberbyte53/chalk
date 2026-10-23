import { type Lesson, parseLesson } from "@chalk/content";
import { preloadProps } from "@chalk/library";
import type { AudioSource } from "@chalk/player";
import { collisionLab } from "./collision-lab";
import { type ChapterContent, loadChapter } from "./content-store";
import type { CourseChapter } from "./course";
import { gasLab } from "./gas-lab";
import { courses } from "./lessons";
import { specimen } from "./specimen";

/**
 * Lessons for the development shells (`?dev`, `?dev&review`), fetched when asked for: a book's
 * chapter one at a time from /content/ (build/, as the app does), and the lessons in no book
 * (specimens, labs, published lessons, test boards) only when that list is opened.
 */

/**
 * A lesson and where its spoken lines' audio is. v1 is silent: no lesson gets audio, so `say`
 * shows its text and moves on, and no retry mark appears. The player's narration and publish's
 * voices are kept for later; turning audio on means handing the player each lesson's
 * published/<lesson>.audio.json files again (git history has the loader).
 */
export type PlayableLesson = { lesson: Lesson; audio: AudioSource | undefined };

/** Published lessons, straight from the repo's content folder; each read only when wanted. */
const jsonFiles = import.meta.env.DEV
  ? import.meta.glob<unknown>(
      ["../../../../content/**/published/*.json", "!../../../../content/**/published/*.audio.json"],
      { import: "default" },
    )
  : {};

/** Test-only boards for trying Jugnu (platform/studio/evals/boards). */
const testBoards = import.meta.env.DEV
  ? import.meta.glob<unknown>(
      [
        "../../../studio/evals/boards/published/*.json",
        "!../../../studio/evals/boards/published/*.audio.json",
      ],
      { import: "default" },
    )
  : {};

const playable = (lesson: Lesson): PlayableLesson => ({ lesson, audio: undefined });

let others: Promise<PlayableLesson[]> | undefined;
/** Every lesson in no book: specimens and labs, then published lessons and test boards. */
export function otherLessons(): Promise<PlayableLesson[]> {
  others ??= Promise.all(
    [...Object.values(jsonFiles), ...Object.values(testBoards)].map((load) => load()),
  ).then((files) => [
    playable(specimen),
    playable(gasLab),
    playable(collisionLab),
    ...files.map((json) => playable(parseLesson(json))),
  ]);
  return others;
}

/** A chapter's lessons, each concept's pages, practice and bank in order, its props ready to draw. */
export async function chapterLessons(
  chapter: CourseChapter,
  onProgress?: (done: number, total: number) => void,
): Promise<ChapterContent> {
  const [content] = await Promise.all([
    loadChapter(chapter, onProgress),
    preloadProps(chapter.props),
  ]);
  return content;
}

/** Every lesson of a loaded chapter, by its id (`concept/<id>`, `practice/<id>`, `bank/<id>`). */
export function lessonsById(content: ChapterContent): Map<string, PlayableLesson> {
  const out = new Map<string, PlayableLesson>();
  for (const { pages, practice, bank } of content.values())
    for (const lesson of [pages, practice, bank])
      if (lesson !== null) out.set(lesson.id, playable(lesson));
  return out;
}

/** The chapter teaching a concept, if any book has it. */
export function chapterOf(conceptId: string): CourseChapter | undefined {
  for (const course of courses)
    for (const chapter of course.chapters)
      if (chapter.concepts.some((c) => c.id === conceptId)) return chapter;
  return undefined;
}

/** One lesson by its id, fetching only what holds it. */
export async function findLesson(id: string): Promise<PlayableLesson | undefined> {
  const chapter = chapterOf(id.split("/")[1] ?? "");
  if (chapter !== undefined) return lessonsById(await chapterLessons(chapter)).get(id);
  return (await otherLessons()).find((e) => e.lesson.id === id);
}
