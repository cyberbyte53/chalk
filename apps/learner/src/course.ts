import {
  type BuiltArt,
  BuiltFile,
  type Localized,
  buildIndexSchema,
  builtBookSchema,
  builtChapterSchema,
  builtConceptSchema,
} from "@chalk/content";

export type CourseConcept = {
  /** The concept's lesson, as `conceptLessons` names it. */
  lessonId: string;
  title: Localized;
  art: BuiltArt | null;
  /** Its glyph on the chapter's path, or null. */
  glyph: string | null;
};
export type CourseChapter = { title: Localized; art: BuiltArt | null; concepts: CourseConcept[] };
export type Course = { title: Localized; art: BuiltArt | null; chapters: CourseChapter[] };

/**
 * The books in build/, as the course and chapter screens show them: each book's chapters in
 * order, each chapter's concepts, with their art. A development view, like `conceptLessons`.
 */
export function readCourses(files: Readonly<Record<string, unknown>>, prefix: string): Course[] {
  const index = files[`${prefix}${BuiltFile.Index}`];
  if (index === undefined) return [];
  const read = (path: string): unknown => {
    const json = files[prefix + path];
    if (json === undefined) throw new Error(`build/${path} is missing; run pnpm build-content`);
    return json;
  };
  return buildIndexSchema.parse(index).books.map((bookRef) => {
    const book = builtBookSchema.parse(read(bookRef.path));
    return {
      title: book.title,
      art: book.art,
      chapters: book.chapters.map((chapterRef) => {
        const chapter = builtChapterSchema.parse(read(chapterRef.path));
        return {
          title: chapter.title,
          art: chapter.art,
          concepts: chapter.concepts.map((conceptRef) => {
            const concept = builtConceptSchema.parse(read(conceptRef.path));
            return {
              lessonId: `build/${concept.source.path}`,
              title: concept.title,
              art: concept.art,
              glyph: concept.glyph,
            };
          }),
        };
      }),
    };
  });
}
