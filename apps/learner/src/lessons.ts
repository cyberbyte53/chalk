import { type AudioManifest, type Lesson, audioManifestSchema, parseLesson } from "@chalk/content";
import type { AudioSource } from "@chalk/player";

/** Published lessons and their audio, straight from the repo's content folder (later: bundles from the CDN). */
const jsonFiles = import.meta.glob<unknown>("../../../content/**/published/*.json", {
  eager: true,
  import: "default",
});
const audioFiles = import.meta.glob<string>(
  "../../../content/**/published/audio/**/*.{m4a,wav,mp3}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

/** Test-only boards for trying Jugnu (studio/evals/boards), listed in development only. */
const testBoards = import.meta.env.DEV
  ? import.meta.glob<unknown>("../../../studio/evals/boards/published/*.json", {
      eager: true,
      import: "default",
    })
  : {};

export type PlayableLesson = { lesson: Lesson; audio: AudioSource | undefined };

function audioSourceFor(lessonPath: string): AudioSource | undefined {
  const manifestPath = lessonPath.replace(/\.json$/, ".audio.json");
  const raw = jsonFiles[manifestPath];
  if (raw === undefined) return undefined;
  const manifest: AudioManifest = audioManifestSchema.parse(raw);
  const folder = lessonPath.slice(0, lessonPath.lastIndexOf("/") + 1);
  return (key) => {
    const file = manifest.files[key];
    return file === undefined ? undefined : audioFiles[folder + file];
  };
}

export const lessons: readonly PlayableLesson[] = [
  ...Object.entries(jsonFiles)
    .filter(([path]) => !path.endsWith(".audio.json"))
    .map(([path, json]) => ({ lesson: parseLesson(json), audio: audioSourceFor(path) })),
  ...Object.entries(testBoards)
    .filter(([path]) => !path.endsWith(".audio.json"))
    .map(([, json]) => ({ lesson: parseLesson(json), audio: undefined })),
];
