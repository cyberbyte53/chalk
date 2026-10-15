import { type Lesson, parseLesson } from "@chalk/content";
import type { AudioSource } from "@chalk/player";
import { conceptLessons } from "./built-content";
import { collisionLab } from "./collision-lab";
import { type Course, readCourses } from "./course";
import { gasLab } from "./gas-lab";
import { specimen } from "./specimen";

/** Published lessons, straight from the repo's content folder (later: bundles from the CDN). */
const jsonFiles = import.meta.glob<unknown>("../../../content/**/published/*.json", {
  eager: true,
  import: "default",
});

/** Test-only boards for trying Jugnu (studio/evals/boards), listed in development only. */
const testBoards = import.meta.env.DEV
  ? import.meta.glob<unknown>("../../../studio/evals/boards/published/*.json", {
      eager: true,
      import: "default",
    })
  : {};

/** Everything `pnpm build-content` / `pnpm preview` wrote to build/, shown in development only. */
const built = import.meta.env.DEV
  ? import.meta.glob<unknown>("../../../build/**/*.json", { eager: true, import: "default" })
  : {};

/**
 * A lesson and where its spoken lines' audio is. v1 is silent: no lesson gets audio, so `say`
 * shows its text and moves on, and no retry mark appears. The player's narration and publish's
 * voices are kept for later; turning audio on means handing the player each lesson's
 * published/<lesson>.audio.json files again (git history has the loader).
 */
export type PlayableLesson = { lesson: Lesson; audio: AudioSource | undefined };

export const lessons: readonly PlayableLesson[] = [
  ...(import.meta.env.DEV
    ? [
        { lesson: specimen, audio: undefined },
        { lesson: gasLab, audio: undefined },
        { lesson: collisionLab, audio: undefined },
      ]
    : []),
  ...conceptLessons(built, "../../../build/").map((lesson) => ({ lesson, audio: undefined })),
  ...Object.entries(jsonFiles)
    .filter(([path]) => !path.endsWith(".audio.json"))
    .map(([, json]) => ({ lesson: parseLesson(json), audio: undefined })),
  ...Object.entries(testBoards)
    .filter(([path]) => !path.endsWith(".audio.json"))
    .map(([, json]) => ({ lesson: parseLesson(json), audio: undefined })),
];

/** The books in build/, for the course and chapter screens (development only, like the lessons). */
export const courses: readonly Course[] = readCourses(built, "../../../build/");
