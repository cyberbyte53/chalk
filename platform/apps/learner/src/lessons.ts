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
    "!../../../../build/sources.json",
  ],
  { eager: true, import: "default" },
);

/** What every key of `skeleton` starts with, before the path inside build/. */
export const SKELETON_PREFIX = "../../../../build/";

/** The books in build/, for the course and chapter screens. */
export const courses: readonly Course[] = readCourses(skeleton, SKELETON_PREFIX);
