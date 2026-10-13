import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { type Lesson, lessonSchema } from "@chalk/content";
import { propDefs } from "@chalk/library";
import { writeJsonFile } from "./json-file";
import { findUp, loadReadings } from "./pronunciations";
import { orderKeys, publishLesson } from "./publish";
import { generateAudio, providers, voicesSchema } from "./voice";

/**
 * `pnpm publish-lesson <lesson.json> [--voice <provider>]`: runs publish, writes the lesson and its
 * published snapshot, keeps a copy of every version in published/versions/<lesson>/ (events name the
 * version they came from), and with --voice speaks every line into published/audio/.
 */
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { voice: { type: "string" } },
});
const arg = positionals[0];
if (arg === undefined) {
  console.error(
    `Usage: pnpm publish-lesson <path to lessons/*.json> [--voice ${Object.keys(providers).join("|")}]`,
  );
  process.exit(1);
}
const file = resolve(process.env.INIT_CWD ?? process.cwd(), arg);
const snapshotFile = join(dirname(dirname(file)), "published", basename(file));
const previous: Lesson | null = existsSync(snapshotFile)
  ? lessonSchema.parse(JSON.parse(readFileSync(snapshotFile, "utf8")))
  : null;

const readings = loadReadings(findUp("pronunciations.json", dirname(file)));
const result = publishLesson(JSON.parse(readFileSync(file, "utf8")), previous, propDefs, readings);
if (!result.isOk) {
  console.error(`✗ ${arg} can't be published:`);
  for (const p of result.problems) console.error(`    ${p.where}: ${p.message}`);
  process.exit(1);
}
const lesson = orderKeys(result.lesson);
writeJsonFile(file, lesson);
mkdirSync(dirname(snapshotFile), { recursive: true });
writeJsonFile(snapshotFile, lesson);
const lessonName = basename(file, ".json");
const versionFile = join(
  dirname(snapshotFile),
  "versions",
  lessonName,
  `${result.lesson.version}.json`,
);
if (!existsSync(versionFile)) {
  mkdirSync(dirname(versionFile), { recursive: true });
  writeJsonFile(versionFile, lesson);
}
console.log(`✓ published ${result.lesson.id} at version ${result.lesson.version}`);
for (const note of result.notes) console.log(`    ${note}`);
if (result.notes.length === 0) console.log("    nothing changed");

const manifestFile = join(dirname(snapshotFile), `${lessonName}.audio.json`);
if (values.voice === undefined) {
  if (!existsSync(manifestFile))
    console.log("    no audio yet: add --voice macos (or another provider) to speak the lines");
} else {
  const provider = providers[values.voice];
  if (provider === undefined) {
    console.error(
      `✗ unknown voice provider "${values.voice}" (have: ${Object.keys(providers).join(", ")})`,
    );
    process.exit(1);
  }
  const voices = voicesSchema.parse(
    JSON.parse(readFileSync(findUp("voices.json", dirname(file)), "utf8")),
  );
  try {
    const audio = await generateAudio(
      result.lesson,
      readings,
      propDefs,
      provider,
      voices,
      dirname(snapshotFile),
      lessonName,
      (done, toMake, text) =>
        console.log(`    speaking ${done + 1}/${toMake}: ${text.slice(0, 60)}`),
    );
    writeJsonFile(manifestFile, audio.manifest);
    console.log(`✓ audio (${provider.id}): ${audio.made} line(s) spoken, ${audio.reused} reused`);
  } catch (error) {
    console.error(`✗ audio: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
