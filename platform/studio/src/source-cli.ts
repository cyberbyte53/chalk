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
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { Locale } from "@chalk/content";
import { type Document, Scalar, isMap, isSeq, parseDocument, stringify } from "yaml";
import { findUp } from "./find-up";
import { place } from "./source/boxes";
import { cropFigure } from "./source/crop";
import { checkExtract, readYaml, sha256 } from "./source/extract";
import { positionalIds } from "./source/ids";
import {
  type Book,
  CROPPED,
  type Item,
  SourceFile,
  bookSchema,
  draftItemsSchema,
} from "./source/schema";
import { type PageText, TEXT_LAYER, pageText, poppler } from "./source/text-layer";

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
const locale = lang as Locale;
const [bookName, chapter] = where.split("/") as [string, string];
const dir = join(root, "authoring", "books", bookName, chapter, "source", locale);
// Not in build/: the content build prunes what it didn't make. Ignored by git (.chalk-*).
const cache = join(root, ".chalk-source-pages", bookName, chapter, locale);
const rel = (p: string) => relative(root, p);
const pdf = join(dir, SourceFile.Pdf);
const bookFile = join(dir, SourceFile.Book);
const itemsFile = join(dir, SourceFile.Items);
const termsFile = join(dir, SourceFile.Terms);
const figures = join(dir, SourceFile.Figures);
/** Page images are rendered at this many pixels per point (144 dpi). */
const PAGE_SCALE = 2;

/** A PDF's bytes, from a file or an address. */
async function bytesOf(from: string): Promise<Buffer> {
  // pnpm runs this in platform/studio; a path is the caller's, from where pnpm was run.
  if (!/^https?:\/\//.test(from))
    return readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), from));
  const res = await fetch(from);
  if (!res.ok) throw new Error(`${from}: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

/** The book's page numbers: each page's running head's number, the missing ones from their neighbours. */
function printedPages(pages: readonly PageText[]): number[] {
  const seen = pages.map((p) => {
    const n = p.head.find((w) => /^\d+$/.test(w.text));
    return n === undefined ? undefined : Number(n.text);
  });
  const known = seen.findIndex((n) => n !== undefined);
  return pages.map((_, i) => (known < 0 ? i + 1 : (seen[known] as number) - known + i));
}

/** The edition the pages print in their footers: the most common footer. */
function editionOf(pages: readonly PageText[]): string {
  const counts = new Map<string, number>();
  for (const p of pages) {
    const foot = p.foot
      .map((w) => w.text)
      .join(" ")
      .trim();
    if (foot !== "") counts.set(foot, (counts.get(foot) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
}

/** A PDF copied in (or the one there), recorded the same way for the book and its answers. */
async function takeIn(
  from: string | undefined,
  to: string,
  recorded: { sha256: string } | undefined,
): Promise<void> {
  if (from === undefined) {
    if (!existsSync(to)) throw new Error(`no ${rel(to)}: give the PDF, a file or an address`);
    return;
  }
  const bytes = await bytesOf(from);
  const sha = sha256(bytes);
  if (recorded !== undefined && recorded.sha256 !== sha && !isNewEdition)
    throw new Error(
      `${from} isn't the book recorded in ${rel(bookFile)} (sha256 ${sha.slice(0, 12)}…, recorded ${recorded.sha256.slice(0, 12)}…). If the edition changed, run again with --new-edition`,
    );
  if (!existsSync(to) || sha256(readFileSync(to)) !== sha) writeFileSync(to, bytes);
}

/** Renders a PDF's pages into the cache; which pages' images changed since the last run. */
function render(file: string, prefix: string): { images: string[]; changed: number[] } {
  mkdirSync(cache, { recursive: true });
  const manifestFile = join(cache, `${prefix}.json`);
  const before = existsSync(manifestFile)
    ? (JSON.parse(readFileSync(manifestFile, "utf8")) as { sha256: string; pages: string[] })
    : undefined;
  const sha = sha256(readFileSync(file));
  const count = Number(/Pages:\s+(\d+)/.exec(poppler("pdfinfo", [file]))?.[1] ?? 0);
  const name = (n: number) => join(cache, `${prefix}-${String(n).padStart(2, "0")}.png`);
  const images = Array.from({ length: count }, (_, i) => name(i + 1));
  if (before?.sha256 === sha && images.every((f) => existsSync(f))) return { images, changed: [] };
  for (const f of readdirSync(cache).filter((f) => f.startsWith(`${prefix}-`)))
    rmSync(join(cache, f));
  poppler("pdftoppm", ["-r", String(72 * PAGE_SCALE), "-png", file, join(cache, prefix)]);
  // pdftoppm pads the page number to the count's width: name them all the same way.
  for (const f of readdirSync(cache).filter((f) => new RegExp(`^${prefix}-\\d+\\.png$`).test(f))) {
    const n = Number(/-(\d+)\.png$/.exec(f)?.[1]);
    if (join(cache, f) === name(n)) continue;
    copyFileSync(join(cache, f), name(n));
    rmSync(join(cache, f));
  }
  const hashes = images.map((f) => sha256(readFileSync(f)));
  const changed = hashes.flatMap((h, i) => (before?.pages[i] === h ? [] : [i + 1]));
  writeFileSync(manifestFile, JSON.stringify({ sha256: sha, pages: hashes }, null, 2));
  return { images, changed };
}

/** Numbers the items (ids are the machine's), in place, keeping the file as written; old id → new. */
function numberItems(): Map<string, string> {
  const doc: Document = parseDocument(readFileSync(itemsFile, "utf8"));
  const parsed = draftItemsSchema.safeParse(doc.toJS());
  if (!parsed.success)
    throw new Error(
      `${rel(itemsFile)}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  const ids = positionalIds(parsed.data);
  const moved = new Map<string, string>();
  if (!isSeq(doc.contents)) throw new Error(`${rel(itemsFile)}: not a list`);
  doc.contents.items.forEach((node, i) => {
    const id = ids[i] as string;
    const old = parsed.data[i]?.id;
    if (!isMap(node) || old === id) return;
    if (old !== undefined) moved.set(old, id);
    // Quoted, always: `1.13` unquoted would read back as a number.
    const value = new Scalar(id);
    value.type = Scalar.QUOTE_DOUBLE;
    if (node.has("id")) node.set("id", value);
    else node.items.unshift(doc.createPair("id", value));
  });
  if (moved.size > 0 || parsed.data.some((x) => x.id === undefined))
    writeFileSync(itemsFile, doc.toString({ lineWidth: 100, flowCollectionPadding: false }));
  return moved;
}

/** Terms follow their items when the items are numbered again. */
function moveTerms(moved: ReadonlyMap<string, string>): void {
  if (moved.size === 0 || !existsSync(termsFile)) return;
  const doc: Document = parseDocument(readFileSync(termsFile, "utf8"));
  if (!isSeq(doc.contents)) return;
  for (const node of doc.contents.items) {
    if (!isMap(node)) continue;
    const item = node.get("item");
    const to = typeof item === "string" ? moved.get(item) : undefined;
    if (to !== undefined) node.set("item", to);
  }
  writeFileSync(termsFile, doc.toString({ lineWidth: 100, flowCollectionPadding: false }));
}

/** Crops each figure and table whose page image, box or picture changed; drops pictures of none. */
function crop(pages: readonly PageText[], changed: readonly number[]): string[] {
  const drafts = readYaml(itemsFile, draftItemsSchema).value ?? [];
  const ids = positionalIds(drafts);
  const items: Item[] = drafts.map((d, i) => ({ ...d, id: ids[i] as string }));
  mkdirSync(figures, { recursive: true });
  const stateFile = join(cache, "crops.json");
  const before = existsSync(stateFile)
    ? (JSON.parse(readFileSync(stateFile, "utf8")) as Record<string, string>)
    : {};
  const after: Record<string, string> = {};
  const made: string[] = [];
  for (const item of items) {
    const page = pages[item.page - 1];
    if (!CROPPED.includes(item.kind) || page === undefined) continue;
    const placed = place(item, page, items);
    if (placed === undefined) continue;
    const { box, running: blank } = placed;
    const out = join(figures, `${item.id}.png`);
    const key = JSON.stringify({ page: item.page, box, blank: blank.length });
    after[item.id] = key;
    if (before[item.id] === key && existsSync(out) && !changed.includes(item.page)) continue;
    cropFigure(pdf, item.page, box, blank, out);
    made.push(rel(out));
  }
  for (const f of readdirSync(figures))
    if (!(f.replace(/\.png$/, "") in after)) rmSync(join(figures, f));
  writeFileSync(stateFile, JSON.stringify(after, null, 2));
  return made;
}

const ITEMS_SHAPE = `- kind: section          # ${["section", "text", "figure", "table", "example", "activity", "exercise", "question"].join(" | ")}
  page: 1                # the PDF's page it starts on
  number: "3.1"          # the book's own number, as printed: "Fig. 3.1", "Example 2", "EXERCISE 3.1", a question's "Q1"
  text: Introduction     # the book's exact words; maths as the lessons write it: (x, y), −3, ½
- kind: figure
  page: 1
  number: Fig. 3.1
  text: ""               # its caption and labels (not its number)
  crop: [300, 430, 440, 600]   # its box in points from the page's top left: the image's pixels ÷ ${PAGE_SCALE}
- kind: question
  page: 3
  number: Q1
  text: How will you describe …
  answer: …              # from the answers pages`;

async function main(): Promise<void> {
  mkdirSync(dir, { recursive: true });
  const recorded = readYaml(bookFile, bookSchema);
  if (recorded.problem !== undefined && input === undefined) throw new Error(recorded.problem);
  const old = recorded.value;
  await takeIn(input, pdf, old);
  if (answersInput !== undefined)
    await takeIn(answersInput, join(dir, SourceFile.Answers), old?.answers);
  const pages = TEXT_LAYER[locale](pdf);
  const isAnswers = existsSync(join(dir, SourceFile.Answers));
  const answerPages = isAnswers ? TEXT_LAYER[locale](join(dir, SourceFile.Answers)) : [];
  const address = (from: string | undefined, before: string | undefined) =>
    addressFlag ?? (from !== undefined && /^https?:\/\//.test(from) ? from : before) ?? from;
  const firstLine = (p: PageText | undefined) =>
    (p?.words ?? [])
      .filter((w) => Math.abs(w.y0 - (p?.words[0]?.y0 ?? 0)) < 3)
      .map((w) => w.text)
      .join(" ");
  const book: Book = {
    title: titleFlag ?? old?.title ?? firstLine(pages[0]),
    edition: editionOf(pages),
    address: address(input, old?.address) ?? "",
    sha256: sha256(readFileSync(pdf)),
    pages: pages.length,
    printed: printedPages(pages),
    ...(isAnswers
      ? {
          answers: {
            address: address(answersInput, old?.answers?.address) ?? "",
            sha256: sha256(readFileSync(join(dir, SourceFile.Answers))),
            pages: answerPages.length,
            printed: printedPages(answerPages),
          },
        }
      : {}),
    ...(old?.unmatched === undefined ? {} : { unmatched: old.unmatched }),
  };
  if (book.address === "") throw new Error("where did the PDF come from? give --address <url>");
  bookSchema.parse(book);
  writeFileSync(bookFile, stringify(book, { lineWidth: 0 }));

  const { images, changed } = render(pdf, "page");
  const answerImages = isAnswers ? render(join(dir, SourceFile.Answers), "answers").images : [];
  pages.forEach((p, i) =>
    writeFileSync(
      join(cache, `page-${String(i + 1).padStart(2, "0")}.txt`),
      `${pageText(p)}\n\nbold: ${p.bold.join(" | ")}\n`,
    ),
  );
  console.log(
    `${rel(bookFile)}: ${book.title}, ${book.edition}, ${book.pages} pages (the book's ${book.printed[0]}–${book.printed.at(-1)})`,
  );
  console.log(
    `page images: ${rel(cache)}/ (${changed.length} changed${changed.length > 0 ? `: pages ${changed.join(", ")}` : ""})`,
  );

  if (!existsSync(itemsFile)) {
    console.log(`
Next, the model's part. Read each page image, in order:
${images.map((f) => `  ${rel(f)}`).join("\n")}${answerImages.length > 0 ? `\nand the answers pages:\n${answerImages.map((f) => `  ${rel(f)}`).join("\n")}` : ""}
(each page's text layer and its bold runs are beside it, page-NN.txt). Write ${rel(itemsFile)}: every
block of the book in reading order, its exact words, no ids (the machine numbers them):

${ITEMS_SHAPE}

A section inside a section has level: 2. An exercise's questions follow it. A figure's parts (a), (b),
(c) are one figure. Then run this again: it numbers the items and crops each figure and table into
${rel(figures)}/. Look at every crop and fix its box if it's wrong. Then write ${rel(termsFile)}:
what the book defines (in bold, in a sentence that defines it), each by the item it is defined in:

- term: origin
  item: "2.3"

and run this again until its checks pass.`);
    return;
  }

  const moved = numberItems();
  moveTerms(moved);
  if (moved.size > 0)
    console.log(
      `${moved.size} items numbered again (terms moved with them): cites of the old ids are to move too`,
    );
  const made = crop(pages, changed);
  if (made.length > 0)
    console.log(`cropped (look at each):\n${made.map((f) => `  ${f}`).join("\n")}`);
  if (changed.length > 0 && readYaml(itemsFile, draftItemsSchema).value !== undefined)
    console.log(`pages ${changed.join(", ")} changed: read them again against ${rel(itemsFile)}`);

  const report = checkExtract({ dir, rel: rel(dir), lang: locale });
  const counts = new Map<string, number>();
  for (const i of report.items) counts.set(i.kind, (counts.get(i.kind) ?? 0) + 1);
  console.log(
    `${report.items.length} items (${[...counts].map(([k, n]) => `${n} ${k}`).join(", ")}), ${report.terms.length} terms`,
  );
  if (report.problems.length > 0) {
    for (const p of report.problems) console.error(`  ✗ ${p}`);
    console.error(
      `✗ ${report.problems.length} problem${report.problems.length === 1 ? "" : "s"} in ${rel(dir)}`,
    );
    process.exit(1);
  }
  console.log(`✓ ${rel(dir)}: every check holds`);
}

main().catch((error: unknown) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
