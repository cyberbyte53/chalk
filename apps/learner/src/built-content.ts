import {
  type Board,
  BuiltFile,
  type Lesson,
  builtChapterSchema,
  builtConceptSchema,
  builtPageSchema,
  builtQuestionSchema,
} from "@chalk/content";

/**
 * Each built concept as a lesson the player can show: its overview pages in order, then every
 * question in its chapter's bank that tests it. A development view of build/; the real app will
 * fetch a concept when it's opened and sample its questions. `files` maps a path (under `prefix`)
 * to that file's JSON.
 */
export function conceptLessons(files: Readonly<Record<string, unknown>>, prefix: string): Lesson[] {
  const read = (path: string): unknown => {
    const json = files[prefix + path];
    if (json === undefined) throw new Error(`build/${path} is missing; run pnpm build-content`);
    return json;
  };
  const lessons: Lesson[] = [];
  for (const [path, json] of Object.entries(files)) {
    if (!path.endsWith(`/${BuiltFile.Chapter}`)) continue;
    const chapter = builtChapterSchema.parse(json);
    for (const ref of chapter.concepts) {
      const concept = builtConceptSchema.parse(read(ref.path));
      const boards: Board[] = [
        ...concept.overview.map((page) => builtPageSchema.parse(read(page.path)).board),
        ...chapter.questions
          .filter((question) => question.tests.includes(concept.id))
          .map((question) => builtQuestionSchema.parse(read(question.path)).board),
      ];
      const taken = new Set<string>();
      lessons.push({
        id: `build/${concept.source.path}`,
        version: concept.version,
        title: concept.title,
        concepts: [concept.id],
        boards: boards.map((board, i) => {
          let name = board.name;
          for (let n = 2; taken.has(name); n++) name = `${board.name}${n}`;
          taken.add(name);
          return { ...board, id: i + 1, name };
        }),
      });
    }
  }
  return lessons;
}
