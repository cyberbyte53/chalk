import type { ChalkEvent } from "@chalk/content";
import { BuiltFile, buildIndexSchema, builtFile } from "@chalk/content";
import {
  type ConceptPlan,
  type Progress,
  attemptsFrom,
  catalogueOf,
  conceptPlansOf,
  passesFrom,
  progressFrom,
  questionVersionsOf,
} from "@chalk/learning";
import { type Course, readCourses } from "./course";

/**
 * The small part of build/ the course screens need at once, bundled with the app so they open
 * instantly and offline: the index, each book, each chapter (its concepts and its bank's list) and
 * each concept (title, art, its pages' list). The pages and questions themselves are not bundled:
 * a chapter's are fetched when it is opened (content-store.ts).
 */
export const skeleton = import.meta.glob<unknown>(
  // Each item is at build/<path>.json: books one level down, chapters two, concepts three.
  [
    "../../../../build/*.json",
    "../../../../build/*/*.json",
    "../../../../build/*/*/*.json",
    "!../../../../build/graph.json",
    "!../../../../build/ids.json",
    "!../../../../build/sources.json",
    "!../../../../build/screens.json",
    "!../../../../build/reach.json",
  ],
  { eager: true, import: "default" },
);

/** What every key of `skeleton` starts with, before the path inside build/. */
export const SKELETON_PREFIX = "../../../../build/";

/** The books in build/, for the course and chapter screens. */
export const courses: readonly Course[] = readCourses(skeleton, SKELETON_PREFIX);

const index = skeleton[`${SKELETON_PREFIX}${BuiltFile.Index}`];
const read = (path: string): unknown => skeleton[`${SKELETON_PREFIX}${builtFile(path)}`];

/** What the author decided about each concept (its pages, its first practice): progress reads it. */
export const plans: readonly ConceptPlan[] =
  index === undefined ? [] : conceptPlansOf(buildIndexSchema.parse(index), read);

/** The bundled build's question versions: what each tests, for this phone's own attempts. */
const catalogue = catalogueOf(
  index === undefined ? [] : questionVersionsOf(buildIndexSchema.parse(index), read),
);

/** Progress from this phone's own entries, worked out as the server does. */
export function progressFromRecord(events: readonly ChalkEvent[]): Progress {
  return progressFrom(passesFrom(events), attemptsFrom(events, catalogue), plans);
}
