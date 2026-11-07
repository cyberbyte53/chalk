import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { Locale } from "@chalk/content";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import { SourceFile } from "./schema";

/** The file names of a PDF's page images and words: `page-03.png`, `page-03.words.txt`. */
export const PAGE_PREFIX = "page";

/** A source's files (platform/docs/plans/sources.md, "Files"): where they are, and reading them. */

/** One language's extract of a chapter's book: its folder and what it holds. */
export type Extract = {
  /** `authoring/books/<book>/<chapter>/source/<lang>`, from the repo's root. */
  rel: string;
  dir: string;
  lang: Locale;
};

/** The folder of what the pipeline makes for the agents and keeps between runs (not in git). */
export const CACHE = ".chalk-source-pages";

/** A chapter's `source/`, which holds each language's extract and match.yaml. */
export const chapterSource = (root: string, book: string, chapter: string): string =>
  join(root, "authoring", "books", book, chapter, "source");

/** An extract's chapter, as the commands name it: `class9-science/coordinate-geometry`. */
export const chapterOf = (x: Extract): string => x.rel.split("/").slice(2, 4).join("/");

/** Where one language's extract keeps its files, and its page images (not in git). */
export function sourcePaths(root: string, book: string, chapter: string, lang: Locale) {
  const dir = join(chapterSource(root, book, chapter), lang);
  return {
    dir,
    rel: relative(root, dir),
    pdf: join(dir, SourceFile.Pdf),
    answers: join(dir, SourceFile.Answers),
    book: join(dir, SourceFile.Book),
    pages: join(dir, SourceFile.Pages),
    items: join(dir, SourceFile.Items),
    terms: join(dir, SourceFile.Terms),
    figures: join(dir, SourceFile.Figures),
    // Not in build/: the content build prunes what it didn't make. Ignored by git (.chalk-*).
    cache: join(root, CACHE, book, chapter, lang),
  };
}
export type SourcePaths = ReturnType<typeof sourcePaths>;

/** An extract's paths from its folder: `…/<book>/<chapter>/source/<lang>`. */
export function extractPaths(root: string, dir: string, lang: Locale): SourcePaths {
  const [book, chapter] = relative(join(root, "authoring", "books"), dir).split("/") as [
    string,
    string,
  ];
  return sourcePaths(root, book, chapter, lang);
}

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
export function readYaml<T>(
  file: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): { value?: T; problem?: string } {
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
