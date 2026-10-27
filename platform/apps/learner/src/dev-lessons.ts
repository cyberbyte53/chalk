import type { Lesson } from "@chalk/content";
import { preloadProps } from "@chalk/library";
import type { AudioSource } from "@chalk/player";
import { type ChapterContent, loadChapter } from "./content-store";
import type { CourseChapter } from "./course";
import { courses } from "./lessons";
import { specimen } from "./specimen";

/**
 * Lessons for the development shells (`?dev`, `?dev&board`), fetched when asked for: a book's
 * chapter one at a time from /content/ (build/, as the app does), and the lessons in no book
 * (the specimen) only when that list is opened.
 */

/**
 * A lesson and where its spoken lines' audio is. v1 is silent: no lesson gets audio, so `say`
 * shows its text and moves on, and no retry mark appears. The player's narration and the voices
 * (platform/studio/src/voice) are kept for the audio step, later.
 */
export type PlayableLesson = { lesson: Lesson; audio: AudioSource | undefined };

const playable = (lesson: Lesson): PlayableLesson => ({ lesson, audio: undefined });

/** Every lesson in no book: the specimen. */
export function otherLessons(): Promise<PlayableLesson[]> {
  return Promise.resolve([playable(specimen)]);
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
