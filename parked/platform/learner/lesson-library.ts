import type { ConceptLine, LessonLibrary } from "@chalk/jugnu";
import { lessonText, readable } from "@chalk/jugnu";
import { preloadProps, propDefs, propLibrary } from "@chalk/library";
import { describeView } from "@chalk/player";
import { initialState, viewOf } from "@chalk/prop";
import { loadChapter } from "./content-store";
import type { CourseChapter, CourseConcept } from "./course";
import { courses } from "./lessons";

/** Every concept in the books, with its chapter and place there. */
const where = new Map<string, { chapter: CourseChapter; concept: CourseConcept; index: number }>();
for (const course of courses)
  for (const chapter of course.chapters)
    chapter.concepts.forEach((concept, index) =>
      where.set(concept.id, { chapter, concept, index }),
    );

/**
 * Lessons for Jugnu, from the app's own content: a concept's lesson is fetched with its chapter
 * (as the learner's screens do) and read out with `lessonText`. The map is the board's chapter in
 * order, plus anything its concepts build on from other chapters.
 */
export const lessonLibrary: LessonLibrary = {
  lesson: async (conceptId, locale) => {
    const place = where.get(conceptId);
    if (place === undefined) return undefined;
    const [content] = await Promise.all([
      loadChapter(place.chapter),
      preloadProps(place.chapter.props),
    ]);
    const pages = content.get(conceptId)?.pages;
    if (pages === undefined) return undefined;
    const title = String(readable(place.concept.title, locale));
    return lessonText(
      title,
      pages.boards,
      {
        def: (type) => propDefs[type],
        describeStart: (type, given, at) => {
          const module = propLibrary[type];
          const start = module === undefined ? undefined : initialState(module.def, given);
          if (module === undefined || start === undefined || !start.isOk) return undefined;
          return describeView(module, viewOf(module.def, start.state), at);
        },
      },
      locale,
    );
  },
  map: async (conceptIds, locale) => {
    const lines: ConceptLine[] = [];
    const add = (id: string) => {
      const place = where.get(id);
      if (place === undefined || lines.some((line) => line.id === id)) return;
      lines.push({
        id,
        title: String(readable(place.concept.title, locale)),
        where: `${String(readable(place.chapter.title, locale))}, ${place.index + 1} of ${place.chapter.concepts.length}`,
        buildsOn: place.concept.prereqs,
      });
    };
    for (const id of conceptIds) {
      const place = where.get(id);
      if (place === undefined) continue;
      for (const concept of place.chapter.concepts) add(concept.id);
    }
    // What they build on from elsewhere, one step back.
    for (const line of [...lines]) for (const id of line.buildsOn) add(id);
    return lines;
  },
};
