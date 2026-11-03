import {
  type BuiltArt,
  BuiltFile,
  type Localized,
  buildIndexSchema,
  builtBookSchema,
  builtChapterSchema,
  builtConceptSchema,
  builtFile,
} from "@chalk/content";

export type CourseConcept = {
  /** The concept's id in the build: what progress and events hang on. */
  id: string;
  /** Its path in the course tree ("class9-maths/coordinate-geometry/plotting-points"). */
  path: string;
  version: string;
  /** Whether its chapter's bank has questions testing it (then it ends with practice). */
  hasPractice: boolean;
  title: Localized;
  art: BuiltArt | null;
  /** Its glyph on the chapter's path, or null. */
  glyph: string | null;
  /** Concepts it builds on (ids). */
  prereqs: string[];
};
export type CourseChapter = {
  /** Its path in the course tree (its file is build/<path>.json), its id and its version. */
  path: string;
  id: string;
  version: string;
  title: Localized;
  art: BuiltArt | null;
  concepts: CourseConcept[];
  /** Every prop type its lessons may use, so their drawing code loads with the chapter. */
  props: string[];
};
export type Course = {
  /** The book's id in the build; a group is for one. */
  id: string;
  /** Its path in the course tree ("class9-maths"). */
  path: string;
  version: string;
  title: Localized;
  art: BuiltArt | null;
  chapters: CourseChapter[];
};

/**
 * The books in build/, as the course and chapter screens show them: each book's chapters in
 * order, each chapter's concepts, with their art. A development view, like `conceptLessons`.
 */
export function readCourses(files: Readonly<Record<string, unknown>>, prefix: string): Course[] {
  const index = files[`${prefix}${BuiltFile.Index}`];
  if (index === undefined) return [];
  const read = (path: string): unknown => {
    const json = files[prefix + builtFile(path)];
    if (json === undefined)
      throw new Error(`build/${builtFile(path)} is missing; run pnpm build-content`);
    return json;
  };
  return buildIndexSchema.parse(index).books.map((bookRef) => {
    const book = builtBookSchema.parse(read(bookRef.path));
    return {
      id: book.id,
      path: bookRef.path,
      version: book.version,
      title: book.title,
      art: book.art,
      chapters: book.chapters.map((chapterRef) => {
        const chapter = builtChapterSchema.parse(read(chapterRef.path));
        return {
          path: chapterRef.path,
          id: chapterRef.id,
          version: chapterRef.version,
          title: chapter.title,
          art: chapter.art,
          props: chapter.props,
          concepts: chapter.concepts.map((conceptRef) => {
            const concept = builtConceptSchema.parse(read(conceptRef.path));
            return {
              id: concept.id,
              path: conceptRef.path,
              version: concept.version,
              hasPractice: chapter.questions.some((q) => q.tests.includes(concept.id)),
              title: concept.title,
              art: concept.art,
              glyph: concept.glyph,
              prereqs: concept.prereqs,
            };
          }),
        };
      }),
    };
  });
}
