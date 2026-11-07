import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { Locale } from "@chalk/content";
import { type Document, Scalar, isMap, isSeq, parseDocument, parse as parseYaml } from "yaml";
import type { z } from "zod";
import { positionalIds } from "./ids";
import { SourceFile, draftItemsSchema } from "./schema";

/** A source's files (platform/docs/plans/sources.md): where they are, reading them, writing ids. */

/** One language's extract of a chapter's book: its folder and what it holds. */
export type Extract = {
  /** `authoring/books/<book>/<chapter>/source/<lang>`, from the repo's root. */
  rel: string;
  dir: string;
  lang: Locale;
};

/** Where one language's extract keeps its files, and its page images (not in git). */
export function sourcePaths(root: string, book: string, chapter: string, lang: Locale) {
  const dir = join(root, "authoring", "books", book, chapter, "source", lang);
  return {
    dir,
    rel: relative(root, dir),
    pdf: join(dir, SourceFile.Pdf),
    book: join(dir, SourceFile.Book),
    items: join(dir, SourceFile.Items),
    terms: join(dir, SourceFile.Terms),
    figures: join(dir, SourceFile.Figures),
    // Not in build/: the content build prunes what it didn't make. Ignored by git (.chalk-*).
    cache: join(root, ".chalk-source-pages", book, chapter, lang),
  };
}
export type SourcePaths = ReturnType<typeof sourcePaths>;

export const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");

/** Every extract in the repo: each `source/<lang>/` with a book.yaml. */
export function extractsIn(root: string): Extract[] {
  const books = join(root, "authoring", "books");
  if (!existsSync(books)) return [];
  const dirs = (d: string) =>
    existsSync(d)
      ? readdirSync(d, { withFileTypes: true })
          .filter((x) => x.isDirectory())
          .map((x) => x.name)
      : [];
  const langs: readonly string[] = Object.values(Locale);
  return dirs(books).flatMap((book) =>
    dirs(join(books, book)).flatMap((chapter) =>
      dirs(join(books, book, chapter, "source"))
        .filter((lang) => langs.includes(lang))
        .map((lang) => join(books, book, chapter, "source", lang))
        .filter((dir) => existsSync(join(dir, SourceFile.Book)))
        .map((dir) => ({ dir, rel: relative(root, dir), lang: dir.split("/").at(-1) as Locale })),
    ),
  );
}

/** A YAML file read against its schema; the problem with it, if any. */
export function readYaml<T>(file: string, schema: z.ZodType<T>): { value?: T; problem?: string } {
  if (!existsSync(file)) return {};
  let raw: unknown;
  try {
    raw = parseYaml(readFileSync(file, "utf8"));
  } catch (error) {
    return { problem: `${file}: ${error instanceof Error ? error.message : String(error)}` };
  }
  const parsed = schema.safeParse(raw);
  return parsed.success
    ? { value: parsed.data }
    : {
        problem: `${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      };
}

/** A PDF's bytes, from a file (from where the command was run) or an address. */
async function bytesOf(from: string): Promise<Buffer> {
  if (!/^https?:\/\//.test(from))
    return readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), from));
  const res = await fetch(from);
  if (!res.ok) throw new Error(`${from}: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * A PDF copied in (or the one there), refused when it isn't the book recorded unless the edition
 * changed: an address can start serving another book.
 */
export async function takeIn(
  from: string | undefined,
  to: string,
  recorded: { sha256: string } | undefined,
  isNewEdition: boolean,
): Promise<void> {
  if (from === undefined) {
    if (!existsSync(to)) throw new Error(`no ${to}: give the PDF, a file or an address`);
    return;
  }
  const bytes = await bytesOf(from);
  const sha = sha256(bytes);
  if (recorded !== undefined && recorded.sha256 !== sha && !isNewEdition)
    throw new Error(
      `${from} isn't the book recorded (sha256 ${sha.slice(0, 12)}…, recorded ${recorded.sha256.slice(0, 12)}…). If the edition changed, run again with --new-edition`,
    );
  if (!existsSync(to) || sha256(readFileSync(to)) !== sha) writeFileSync(to, bytes);
}

const YAML_OUT = { lineWidth: 100, flowCollectionPadding: false } as const;

/** Numbers the items (ids are the machine's), in place, keeping the file as written; old id → new. */
export function numberItems(itemsFile: string): Map<string, string> {
  const doc: Document = parseDocument(readFileSync(itemsFile, "utf8"));
  const parsed = draftItemsSchema.safeParse(doc.toJS());
  if (!parsed.success)
    throw new Error(
      `${itemsFile}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  const ids = positionalIds(parsed.data);
  const moved = new Map<string, string>();
  if (!isSeq(doc.contents)) throw new Error(`${itemsFile}: not a list`);
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
    writeFileSync(itemsFile, doc.toString(YAML_OUT));
  return moved;
}

/** Terms follow their items when the items are numbered again. */
export function moveTerms(termsFile: string, moved: ReadonlyMap<string, string>): void {
  if (moved.size === 0 || !existsSync(termsFile)) return;
  const doc: Document = parseDocument(readFileSync(termsFile, "utf8"));
  if (!isSeq(doc.contents)) return;
  for (const node of doc.contents.items) {
    if (!isMap(node)) continue;
    const item = node.get("item");
    const to = typeof item === "string" ? moved.get(item) : undefined;
    if (to !== undefined) node.set("item", to);
  }
  writeFileSync(termsFile, doc.toString(YAML_OUT));
}
