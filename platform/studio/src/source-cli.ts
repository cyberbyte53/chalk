// A chapter's book, one language (platform/docs/plans/sources.md; the skill
// .agents/skills/extract-chapter/SKILL.md runs it):
//
//   pnpm source <book>/<chapter> <lang> <pdf file or address> [--answers <pdf>]
//       [--address <where the file came from>] [--title <the chapter's title>]
//       [--edition <as printed>] [--new-edition]
//   pnpm source <book>/<chapter> <lang>          again, once the agents wrote pages/: builds and checks
//       [--tidy]                                 first removing what a tool's improvement left behind
//   pnpm source match <book>/<chapter>           the two books paired, into source/match.yaml
//   pnpm source feedback [<book>/<chapter>]      every override of a tool, across chapters
//   pnpm source attach <book>/<chapter>          the main book's concepts checked; each attached
//                                                book's sheet written and its concepts checked
//   pnpm source term <book>/<chapter> <term>     the concept with that term, in every language, and where
//   pnpm source measure [<book>/<chapter>] [--save <file>] [--against <file>]
//                                                each proofread book built from the tools alone against
//                                                as decided, block by block; diffed against an earlier run
//
// It takes the PDF in and records it in book.yaml (refusing a book whose sha256 differs from the
// one recorded, unless --new-edition), and writes each page's image and numbered words for the
// agents. Once there are page files, it builds items.yaml, terms.yaml and figures/ from them and
// lists the issues. The title and edition are the session's, read on page 1: never guessed.
import { join } from "node:path";
import { parseArgs } from "node:util";
import { Locale } from "@chalk/content";
import { findUp } from "./find-up";
import { attachChapter, lookUp } from "./source/concepts";
import { feedback } from "./source/feedback";
import { matchChapter } from "./source/match";
import { measure } from "./source/measure";
import { type SourceResult, runSource } from "./source/pipeline";

const USAGE =
  "usage: pnpm source <book>/<chapter> <en|hi> [<pdf file or address>] [--answers <pdf>] [--address <url>] [--title <as printed>] [--edition <as printed, or none>] [--new-edition] [--tidy]\n       pnpm source match <book>/<chapter>\n       pnpm source feedback [<book>/<chapter>]\n       pnpm source attach <book>/<chapter>\n       pnpm source term <book>/<chapter> <term>\n       pnpm source measure [<book>/<chapter>] [--save <file>] [--against <file>]";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    root: { type: "string" },
    answers: { type: "string" },
    address: { type: "string" },
    title: { type: "string" },
    edition: { type: "string" },
    "new-edition": { type: "boolean" },
    tidy: { type: "boolean" },
    save: { type: "string" },
    against: { type: "string" },
  },
});
// `--root`: another tree than this repo, to try the pipeline on a throwaway copy.
const root = values.root ?? join(findUp("pnpm-workspace.yaml", import.meta.dirname), "..");
const CHAPTER = /^[\w-]+\/[\w-]+$/;

/** What was asked, run; undefined when the arguments don't say. */
function dispatch(): Promise<SourceResult> | undefined {
  const [first, second, third] = positionals;
  if (first === "match") {
    if (second === undefined || !CHAPTER.test(second) || third !== undefined) return undefined;
    const [book, chapter] = second.split("/") as [string, string];
    return Promise.resolve(matchChapter(root, book, chapter));
  }
  if (first === "attach") {
    if (second === undefined || !CHAPTER.test(second) || third !== undefined) return undefined;
    const [book, chapter] = second.split("/") as [string, string];
    return Promise.resolve(attachChapter(root, book, chapter));
  }
  if (first === "term") {
    if (second === undefined || !CHAPTER.test(second) || third === undefined) return undefined;
    const [book, chapter] = second.split("/") as [string, string];
    return Promise.resolve(lookUp(root, book, chapter, positionals.slice(2).join(" ")));
  }
  if (first === "feedback") {
    if (third !== undefined || (second !== undefined && !CHAPTER.test(second))) return undefined;
    return Promise.resolve(feedback(root, second));
  }
  if (first === "measure") {
    if (third !== undefined || (second !== undefined && !CHAPTER.test(second))) return undefined;
    return Promise.resolve(
      measure({
        root,
        ...(second === undefined ? {} : { chapter: second }),
        ...(values.save === undefined ? {} : { save: values.save }),
        ...(values.against === undefined ? {} : { against: values.against }),
      }),
    );
  }
  const langs: readonly string[] = Object.values(Locale);
  if (
    first === undefined ||
    !CHAPTER.test(first) ||
    second === undefined ||
    !langs.includes(second) ||
    positionals.length > 3
  )
    return undefined;
  const [book, chapter] = first.split("/") as [string, string];
  return runSource({
    root,
    book,
    chapter,
    lang: second as Locale,
    ...(third === undefined ? {} : { input: third }),
    ...(values.answers === undefined ? {} : { answers: values.answers }),
    ...(values.address === undefined ? {} : { address: values.address }),
    ...(values.title === undefined ? {} : { title: values.title }),
    ...(values.edition === undefined ? {} : { edition: values.edition }),
    isNewEdition: values["new-edition"] === true,
    isTidy: values.tidy === true,
  });
}

const running = dispatch();
if (running === undefined) {
  console.error(USAGE);
  process.exit(2);
}
const what = positionals.slice(0, 2).join(" ");
running
  .then(({ lines, problems }) => {
    for (const line of lines) console.log(line);
    if (problems.length > 0) {
      for (const p of problems) console.error(`  ✗ ${p}`);
      console.error(`✗ ${problems.length} problem${problems.length === 1 ? "" : "s"}: ${what}`);
      process.exit(1);
    }
    console.log(`✓ ${what}: holds`);
  })
  .catch((error: unknown) => {
    console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
