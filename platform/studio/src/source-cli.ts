// A chapter's book, one language (platform/docs/plans/sources.md; the skill
// .agents/skills/extract-chapter/SKILL.md runs it):
//
//   pnpm source <book>/<chapter> <lang> <pdf file or address> [--answers <pdf>]
//       [--address <where the file came from>] [--title <the chapter's title>]
//       [--edition <as printed>] [--new-edition]
//   pnpm source <book>/<chapter> <lang>          again, once the agents wrote pages/: builds and checks
//
// It takes the PDF in and records it in book.yaml (refusing a book whose sha256 differs from the
// one recorded, unless --new-edition), and writes each page's image and numbered words for the
// agents. Once there are page files, it builds items.yaml, terms.yaml and figures/ from them and
// lists the issues.
import { join } from "node:path";
import { parseArgs } from "node:util";
import { Locale } from "@chalk/content";
import { findUp } from "./find-up";
import { runSource } from "./source/pipeline";

const USAGE =
  "usage: pnpm source <book>/<chapter> <en|hi> [<pdf file or address>] [--answers <pdf>] [--address <url>] [--title <title>] [--edition <as printed>] [--new-edition]";

const root = join(findUp("pnpm-workspace.yaml", import.meta.dirname), "..");
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    answers: { type: "string" },
    address: { type: "string" },
    title: { type: "string" },
    edition: { type: "string" },
    "new-edition": { type: "boolean" },
  },
});
const [where, lang, input] = positionals;
const langs: readonly string[] = Object.values(Locale);
if (
  where === undefined ||
  !/^[\w-]+\/[\w-]+$/.test(where) ||
  lang === undefined ||
  !langs.includes(lang) ||
  positionals.length > 3
) {
  console.error(USAGE);
  process.exit(2);
}
const [book, chapter] = where.split("/") as [string, string];

runSource({
  root,
  book,
  chapter,
  lang: lang as Locale,
  ...(input === undefined ? {} : { input }),
  ...(values.answers === undefined ? {} : { answers: values.answers }),
  ...(values.address === undefined ? {} : { address: values.address }),
  ...(values.title === undefined ? {} : { title: values.title }),
  ...(values.edition === undefined ? {} : { edition: values.edition }),
  isNewEdition: values["new-edition"] === true,
})
  .then(({ lines, problems }) => {
    for (const line of lines) console.log(line);
    if (problems.length > 0) {
      for (const p of problems) console.error(`  ✗ ${p}`);
      console.error(
        `✗ ${problems.length} problem${problems.length === 1 ? "" : "s"} in ${where} (${lang})`,
      );
      process.exit(1);
    }
    console.log(`✓ ${where} (${lang}): holds`);
  })
  .catch((error: unknown) => {
    console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
