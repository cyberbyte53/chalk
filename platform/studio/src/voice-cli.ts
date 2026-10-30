import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { propDefs } from "@chalk/library";
import { PRONUNCIATIONS_FILE, loadReadings } from "./pronunciations";
import { providers, voicesSchema } from "./voice";
import { voiceChapter } from "./voice/chapter";

/**
 * `pnpm voice <book>/<chapter> [--voice macos]`: every line the chapter's boards say, made into
 * audio in English and Hindi, each with how long it plays, into the learner app's public/voice/
 * (made from the content, not kept in git). The preview plays them (?dev … &play).
 */
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { voice: { type: "string", default: "macos" } },
});
const chapter = positionals[0];
if (chapter === undefined)
  throw new Error("say which chapter: pnpm voice class9-maths/coordinate-geometry");
const root = join(import.meta.dirname, "..", "..", "..");
const provider = providers[values.voice ?? "macos"];
if (provider === undefined)
  throw new Error(`no voice "${values.voice}" (there are: ${Object.keys(providers).join(", ")})`);
const voices = voicesSchema.parse(
  JSON.parse(readFileSync(join(root, "authoring", "voices.json"), "utf8")),
);
const outDir = join(root, "platform", "apps", "learner", "public", "voice", chapter);
mkdirSync(outDir, { recursive: true });
const result = await voiceChapter({
  root,
  chapter,
  load: (module) => import(pathToFileURL(join(root, "content", module)).href),
  roleOf: (type) => propDefs[type]?.role,
  readings: loadReadings(join(root, "authoring", PRONUNCIATIONS_FILE)),
  provider,
  voices,
  outDir,
  onSpeak: (done, toMake, text) => console.log(`  ${done + 1}/${toMake} ${text.slice(0, 70)}`),
});
writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(result.manifest, null, 2)}\n`);
console.log(
  `✓ ${chapter}: ${result.boards} boards, ${Object.keys(result.manifest.files).length} lines (${result.made} made, ${result.reused} kept) → ${outDir}`,
);
