// A chapter's book, one language: the machine's part of extracting it (platform/docs/plans/sources.md).
//
//   pnpm source <book>/<chapter> <lang> <pdf file or address> [answers pdf]
//       [--address <where the file came from>] [--title <the chapter's title>] [--new-edition]
//   pnpm source <book>/<chapter> <lang>          again, once the items are written: crops and checks
//
// It copies the PDF in and writes book.yaml (refusing a book whose sha256 differs from the one
// recorded, unless --new-edition), renders each page to an image and reads its text layer, then says
// what the model is to write. Run again, it numbers the items, crops each figure and table (only
// those whose page or box changed) and runs the checks.
import { join } from "node:path";
import { Locale } from "@chalk/content";
import { findUp } from "./find-up";
import { runSource } from "./source/pipeline";

const root = join(findUp("pnpm-workspace.yaml", import.meta.dirname), "..");
const args = process.argv.slice(2);
const flag = (name: string) => {
  const at = args.indexOf(name);
  if (at < 0) return undefined;
  const value = args[at + 1];
  args.splice(at, 2);
  return value;
};
const isSet = (name: string) => {
  const at = args.indexOf(name);
  if (at >= 0) args.splice(at, 1);
  return at >= 0;
};
const isNewEdition = isSet("--new-edition");
// Running again is the check; --check says so.
isSet("--check");
const addressFlag = flag("--address");
const titleFlag = flag("--title");
const [where, lang, input, answersInput] = args;
const langs: readonly string[] = Object.values(Locale);
if (
  where === undefined ||
  !/^[\w-]+\/[\w-]+$/.test(where) ||
  lang === undefined ||
  !langs.includes(lang)
) {
  console.error(
    "usage: pnpm source <book>/<chapter> <en|hi> [<pdf file or address> [answers pdf]] [--address <url>] [--title <title>] [--new-edition]",
  );
  process.exit(2);
}
const [book, chapter] = where.split("/") as [string, string];

runSource({
  root,
  book,
  chapter,
  lang: lang as Locale,
  ...(input === undefined ? {} : { input }),
  ...(answersInput === undefined ? {} : { answers: answersInput }),
  ...(addressFlag === undefined ? {} : { address: addressFlag }),
  ...(titleFlag === undefined ? {} : { title: titleFlag }),
  isNewEdition,
})
  .then(({ lines, problems, isWaitingOnModel }) => {
    for (const line of lines) console.log(line);
    if (isWaitingOnModel) return;
    if (problems.length > 0) {
      for (const p of problems) console.error(`  ✗ ${p}`);
      console.error(
        `✗ ${problems.length} problem${problems.length === 1 ? "" : "s"} in ${where} (${lang})`,
      );
      process.exit(1);
    }
    console.log(`✓ ${where} (${lang}): every check holds`);
  })
  .catch((error: unknown) => {
    console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
