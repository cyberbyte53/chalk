import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { propDefs } from "@chalk/library";
import { castSchema, chapterLines, makeVoice, providers } from "./voice";

/**
 * `pnpm voice <book>/<chapter>`: every line the chapter's boards say, made into clips in each
 * language by the voices authoring/voices.json casts, into the learner app's public/voice/ (made
 * from the content, not kept in git; only new or edited lines are made). The preview plays them.
 */
const { positionals } = parseArgs({ allowPositionals: true });
const chapter = positionals[0];
if (chapter === undefined)
  throw new Error("say which chapter: pnpm voice class9-maths/coordinate-geometry");
const root = join(import.meta.dirname, "..", "..", "..");
const { cast } = castSchema.parse(
  JSON.parse(readFileSync(join(root, "authoring", "voices.json"), "utf8")),
);
const outDir = join(root, "platform", "apps", "learner", "public", "voice", chapter);
mkdirSync(outDir, { recursive: true });
const boards = await chapterLines({
  root,
  chapter,
  load: (module) => import(pathToFileURL(join(root, "content", module)).href),
  roleOf: (type) => propDefs[type]?.role,
});
const result = await makeVoice({
  boards,
  cast,
  providers,
  outDir,
  onSpeak: (done, toMake, text) => console.log(`  ${done + 1}/${toMake} ${text.slice(0, 70)}`),
});
writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(result.manifest, null, 2)}\n`);
console.log(
  `✓ ${chapter}: ${boards.length} boards, ${Object.keys(result.manifest.files).length} lines (${result.made} made, ${result.reused} kept) → ${outDir}`,
);
