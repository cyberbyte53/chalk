// pnpm source <book>/<chapter> <lang> [<pdf file or address>] [--address <url>] [--title <title>] [--new-edition]
//
// Extracts a chapter's book in one language (platform/docs/plans/sources.md, the stages in
// platform/studio/src/source/pipeline.ts). The first run takes the PDF in; run again once the model
// has written items.yaml, until every check holds.
import { join } from "node:path";
import { parseArgs } from "node:util";
import { Locale } from "@chalk/content";
import { findUp } from "./find-up";
import { runSource } from "./source/pipeline";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    address: { type: "string" },
    title: { type: "string" },
    "new-edition": { type: "boolean" },
  },
});
const [where = "", lang = "", input] = positionals;
const [book, chapter] = where.split("/");
if (
  book === undefined ||
  chapter === undefined ||
  !(Object.values(Locale) as string[]).includes(lang)
) {
  console.error(
    "usage: pnpm source <book>/<chapter> <en|hi> [<pdf file or address>] [--address <url>] [--title <title>] [--new-edition]",
  );
  process.exit(2);
}

const result = await runSource({
  root: join(findUp("pnpm-workspace.yaml", import.meta.dirname), ".."),
  book,
  chapter,
  lang: lang as Locale,
  input,
  address: values.address,
  title: values.title,
  isNewEdition: values["new-edition"] ?? false,
}).catch((error: unknown) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
for (const line of result.lines) console.log(line);
for (const p of result.problems) console.error(`  ✗ ${p}`);
if (result.problems.length > 0) process.exit(1);
if (!result.isWaitingOnModel) console.log(`✓ ${where} (${lang}): every check holds`);
