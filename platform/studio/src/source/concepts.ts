import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { Locale } from "@chalk/content";
import { chapterSource, extractsIn, readYaml, sourcePaths } from "./files";
import { matchItems } from "./match";
import {
  type AttachedConcepts,
  type Item,
  type MainConcepts,
  SourceFile,
  type Term,
  attachedConceptsSchema,
  itemsSchema,
  mainConceptsSchema,
  termsSchema,
} from "./schema";

/**
 * A chapter's concepts (platform/docs/plans/sources.md, "Main and attached languages", "Concepts", "Attach"):
 * the main book's summary, written by the agent and checked against its items; each attached book's
 * line, terms and items for every main concept, which the tool suggests from the numbered things both books
 * have and the main language printed beside an attached term, and the agent proofreads.
 */

/** The chapter's main language; every other is attached to it. */
export const MAIN = Locale.En;

/** A text as compared: its letters, any punctuation or spacing between words one space. */
const asCompared = (s: string) =>
  ` ${s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s.,;:!?।'"‘’“”()[\]{}—–-]+/gu, " ")
    .trim()} `;

/** Whether a term is printed in any of the items: as whole words, punctuation aside. */
const printedIn = (term: string, items: readonly Item[]) =>
  items.some((i) => asCompared(i.text ?? "").includes(asCompared(term)));

/** One language's built items and terms, and its concepts file if written. */
type Book = { lang: Locale; items: Item[]; terms: Term[]; dir: string };

function readBook(source: string, lang: Locale): { book?: Book; problems: string[] } {
  const dir = join(source, lang);
  const items = readYaml(join(dir, SourceFile.Items), itemsSchema);
  const terms = readYaml(join(dir, SourceFile.Terms), termsSchema);
  const problems = [items.problem, terms.problem].filter((p): p is string => p !== undefined);
  if (items.value === undefined) return { problems };
  return { book: { lang, items: items.value, terms: terms.value ?? [], dir }, problems };
}

/** The problems with the items an concept cites, and its terms printed there. */
function grounded(
  where: string,
  concept: { terms: string[]; items: string[] },
  byId: Map<string, Item>,
): string[] {
  const problems: string[] = [];
  const cited = concept.items.flatMap((id) => {
    const item = byId.get(id);
    if (item === undefined) problems.push(`${where}: no item ${id}`);
    return item === undefined ? [] : [item];
  });
  for (const t of concept.terms)
    if (!printedIn(t, cited))
      problems.push(`${where}: "${t}" isn't printed in its items (${concept.items.join(", ")})`);
  return problems;
}

/** The book's set-apart terms that no concept has and no answer explains. */
function leftover(
  where: string,
  terms: readonly Term[],
  concepts: readonly { terms?: string[] }[],
  answers: Record<string, string>,
): string[] {
  const named = new Set(concepts.flatMap((i) => i.terms ?? []).map(asCompared));
  return [...new Set(terms.map((t) => t.term))]
    .filter((t) => !named.has(asCompared(t)) && answers[t] === undefined)
    .map(
      (t) =>
        `${where}: the book sets apart "${t}", in no concept: add it to one, or answer it under answers with why`,
    );
}

/** The main concepts' problems: keys once, items real, terms printed there, every set-apart term used. */
export function checkMain(concepts: MainConcepts, book: Book): string[] {
  const byId = new Map(book.items.map((i) => [i.id, i]));
  const problems: string[] = [];
  const keys = new Set<string>();
  for (const concept of concepts.concepts) {
    if (keys.has(concept.key)) problems.push(`concept ${concept.key}: twice`);
    keys.add(concept.key);
    problems.push(...grounded(`concept ${concept.key}`, concept, byId));
  }
  problems.push(...leftover("main", book.terms, concepts.concepts, concepts.answers ?? {}));
  return problems;
}

/** What the tool suggests for one main concept in an attached book. */
export type Suggestion = {
  key: string;
  /** The attached items paired with the concept's numbered items. */
  items: string[];
  /** The attached sections paired with the concept's items' sections: where to look. */
  sections: string[];
  /** Attached terms printed beside the main language's word for one of the concept's terms. */
  terms: string[];
};

/** For each main concept, where the attached book has it, from what pairs exactly. */
export function suggestAttached(concepts: MainConcepts, main: Book, attached: Book): Suggestion[] {
  const { pairs } = matchItems(main.items, attached.items);
  const across = new Map(pairs.map((p) => [p.en, p.hi]));
  const sections = new Map(
    pairs.filter((p) => p.key.startsWith("section ")).map((p) => [p.en, p.hi]),
  );
  /** The attached section paired with an item's nearest paired section. */
  const sectionOf = (id: string) => {
    const parts = id.split(".");
    for (let n = parts.length; n > 0; n--) {
      const s = sections.get(parts.slice(0, n).join("."));
      if (s !== undefined) return s;
    }
    return undefined;
  };
  return concepts.concepts.map((concept) => {
    const mainTerms = new Set(concept.terms.map(asCompared));
    return {
      key: concept.key,
      items: [...new Set(concept.items.flatMap((id) => across.get(id) ?? []))],
      sections: [...new Set(concept.items.flatMap((id) => sectionOf(id) ?? []))],
      terms: [
        ...new Set(
          attached.terms
            .filter((t) => t.en !== undefined && mainTerms.has(asCompared(t.en)))
            .map((t) => t.term),
        ),
      ],
    };
  });
}

/** An attached book's concepts' problems, against the main concepts and what the tool suggested. */
export function checkAttached(
  concepts: AttachedConcepts,
  main: MainConcepts,
  attached: Book,
  suggestions: readonly Suggestion[],
): string[] {
  const byId = new Map(attached.items.map((i) => [i.id, i]));
  const problems: string[] = [];
  const seen = new Set<string>();
  const mainKeys = new Set(main.concepts.map((i) => i.key));
  for (const concept of concepts.concepts) {
    const where = `concept ${concept.key}`;
    if (!mainKeys.has(concept.key)) problems.push(`${where}: no main concept has this key`);
    if (seen.has(concept.key)) problems.push(`${where}: twice`);
    seen.add(concept.key);
    if ("absent" in concept) continue;
    problems.push(...grounded(where, concept, byId));
    const s = suggestions.find((x) => x.key === concept.key);
    const dropped = [
      ...(s?.items ?? []).filter((i) => !concept.items.includes(i)),
      ...(s?.terms ?? []).filter((t) => !concept.terms.map(asCompared).includes(asCompared(t))),
    ];
    if (dropped.length > 0 && concept.cause === undefined)
      problems.push(
        `${where}: leaves out what the tool suggested (${dropped.join(", ")}): give the cause`,
      );
  }
  for (const k of mainKeys)
    if (!seen.has(k))
      problems.push(
        `concept ${k}: not attached: its line, terms and items here, or absent with why`,
      );
  const present = concepts.concepts.filter(
    (i): i is Exclude<typeof i, { absent: string }> => !("absent" in i),
  );
  problems.push(...leftover(attached.lang, attached.terms, present, concepts.answers ?? {}));
  return problems;
}

/** An item as the sheet shows it: its id, kind and number, and its words. */
const shown = (i: Item | undefined, id: string) =>
  i === undefined
    ? `  ${id}: (no such item)`
    : `  ${id} ${i.kind}${i.number === undefined ? "" : ` ${i.number}`} (p${i.page}): ${(i.text ?? "").replace(/\s+/g, " ")}`;

/** The proofreading sheet: each main concept beside what the tool suggests in the attached book. */
export function sheet(
  main: MainConcepts,
  mainBook: Book,
  attached: Book,
  s: readonly Suggestion[],
) {
  const mainById = new Map(mainBook.items.map((i) => [i.id, i]));
  const byId = new Map(attached.items.map((i) => [i.id, i]));
  const out = [
    `# Attaching ${attached.lang} to ${mainBook.lang}: every main concept, and where the tool suggests the ${attached.lang} book has it`,
    "",
    "Proofread each: the suggestion is a start, never sure. Write source/<lang>/concepts.yaml (see the skill).",
  ];
  for (const concept of main.concepts) {
    const x = s.find((y) => y.key === concept.key);
    out.push(
      "",
      `## ${concept.key}`,
      `${mainBook.lang}: ${concept.concept}`,
      `terms: ${concept.terms.join(" · ") || "(none)"}`,
      ...concept.items.map((id) => shown(mainById.get(id), id)),
      `suggested ${attached.lang} items: ${x?.items.length ? "" : "(none: numbered things don't place it)"}`,
      ...(x?.items ?? []).map((id) => shown(byId.get(id), id)),
      `look in ${attached.lang} sections: ${x?.sections.join(", ") || "(none paired)"}`,
      `suggested ${attached.lang} terms: ${x?.terms.join(" · ") || "(none)"}`,
    );
  }
  return out.join("\n");
}

/** `pnpm source attach <book>/<chapter>`: each attached book's sheet written and its concepts checked. */
export function attachChapter(
  root: string,
  book: string,
  chapter: string,
): { lines: string[]; problems: string[] } {
  const source = chapterSource(root, book, chapter);
  const r = checkChapter(source);
  const lines: string[] = [];
  for (const a of r.attached) {
    const file = join(sourcePaths(root, book, chapter, a.lang).cache, "attach.md");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, a.sheet);
    lines.push(
      `${relative(root, file)}: the sheet to proofread from`,
      `${relative(root, join(source, a.lang, SourceFile.Concepts))}: ${a.written ? "checked" : "not written yet"}`,
    );
  }
  return { lines, problems: r.problems };
}

/** A chapter's concepts checked: the main book's, and each attached book's if written. */
function checkChapter(source: string): {
  problems: string[];
  attached: { lang: Locale; sheet: string; written: boolean }[];
  main?: { concepts: MainConcepts; book: Book };
} {
  const m = readBook(source, MAIN);
  const problems = [...m.problems];
  const mainFile = readYaml(join(source, MAIN, SourceFile.Concepts), mainConceptsSchema);
  if (mainFile.problem !== undefined) problems.push(mainFile.problem);
  if (m.book === undefined || mainFile.value === undefined) {
    if (m.book !== undefined && mainFile.problem === undefined)
      problems.push(`no ${MAIN}/${SourceFile.Concepts}: write the main book's concepts first`);
    return { problems, attached: [] };
  }
  const main = { concepts: mainFile.value, book: m.book };
  problems.push(...checkMain(main.concepts, main.book).map((p) => `${MAIN}: ${p}`));
  const attached = Object.values(Locale)
    .filter((l) => l !== MAIN && existsSync(join(source, l, SourceFile.Items)))
    .map((lang) => {
      const a = readBook(source, lang);
      problems.push(...a.problems);
      if (a.book === undefined) return { lang, sheet: "", written: false };
      const s = suggestAttached(main.concepts, main.book, a.book);
      const file = readYaml(join(source, lang, SourceFile.Concepts), attachedConceptsSchema);
      if (file.problem !== undefined) problems.push(file.problem);
      if (file.value !== undefined)
        problems.push(
          ...checkAttached(file.value, main.concepts, a.book, s).map((p) => `${lang}: ${p}`),
        );
      return {
        lang,
        sheet: sheet(main.concepts, main.book, a.book, s),
        written: file.value !== undefined,
      };
    });
  return { problems, attached, main };
}

/** Every chapter with concepts checked, for `pnpm check`. */
export function checkConcepts(
  root: string,
): { rel: string; concepts: number; problems: string[] }[] {
  const sources = new Set(extractsIn(root).map((x) => dirname(x.dir)));
  return [...sources]
    .filter((s) => existsSync(join(s, MAIN, SourceFile.Concepts)))
    .map((s) => {
      const r = checkChapter(s);
      return {
        rel: relative(root, s),
        concepts: r.main?.concepts.concepts.length ?? 0,
        problems: r.problems,
      };
    });
}

/** `pnpm source term <book>/<chapter> <term>`: the concept with that term, in every language, and where. */
export function lookUp(
  root: string,
  book: string,
  chapter: string,
  term: string,
): { lines: string[]; problems: string[] } {
  const source = chapterSource(root, book, chapter);
  const langs = Object.values(Locale).filter((l) =>
    existsSync(join(source, l, SourceFile.Concepts)),
  );
  const files = langs.map((lang) => {
    const at = join(source, lang, SourceFile.Concepts);
    const read =
      lang === MAIN
        ? readYaml(at, mainConceptsSchema).value
        : readYaml(at, attachedConceptsSchema).value;
    const concepts = (read?.concepts ?? []) as {
      key: string;
      concept?: string;
      terms?: string[];
      items?: string[];
      absent?: string;
    }[];
    const items = new Map(
      (readYaml(join(source, lang, SourceFile.Items), itemsSchema).value ?? []).map((i) => [
        i.id,
        i,
      ]),
    );
    return { lang, concepts, items };
  });
  const keys = new Set(
    files.flatMap((f) =>
      f.concepts
        .filter((i) => (i.terms ?? []).some((t) => asCompared(t) === asCompared(term)))
        .map((i) => i.key),
    ),
  );
  if (keys.size === 0) return { lines: [], problems: [`no concept has the term "${term}"`] };
  const lines = [...keys].flatMap((key) =>
    files.map((f) => {
      const i = f.concepts.find((x) => x.key === key);
      if (i === undefined) return `${f.lang}: not attached yet`;
      if (i.absent !== undefined) return `${f.lang}: not in this book (${i.absent})`;
      const where = (i.items ?? [])
        .map((id) => `${id} p${f.items.get(id)?.page ?? "?"}`)
        .join(", ");
      return `${f.lang}: ${(i.terms ?? []).join(" · ")} (${where}): ${i.concept}`;
    }),
  );
  return { lines, problems: [] };
}
