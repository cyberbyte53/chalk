import { z } from "zod";

/**
 * A language's extract of a chapter's book (platform/docs/plans/sources.md, "Files"), in
 * authoring/books/<book>/<chapter>/source/<lang>/: `book.yaml` (which book, exactly), `pages/` (the
 * agents' reading of each page: the record), and what is built from them and the PDF: `items.yaml`
 * (the book's blocks in reading order, in its words), `terms.yaml` and `figures/`.
 */

/** What the book itself marks a block as. A figure's parts (a), (b), (c) are one figure. */
export const ItemKind = {
  Section: "section",
  Text: "text",
  /** A set-apart note (a side column's or a frame's), with its printed heading as `title`. */
  Box: "box",
  Figure: "figure",
  Table: "table",
  /** An equation set on its own line. */
  Equation: "equation",
  Example: "example",
  Activity: "activity",
  Exercise: "exercise",
  Question: "question",
} as const;
export type ItemKind = (typeof ItemKind)[keyof typeof ItemKind];
const itemKind = z.enum(Object.values(ItemKind) as [ItemKind, ...ItemKind[]]);

/** The kinds cropped from the page into `figures/<id>.png`. */
export const CROPPED: readonly ItemKind[] = [ItemKind.Figure, ItemKind.Table];

/** How a PDF's words are read (read/index.ts). */
export const Reader = {
  /** A PDF whose text layer is Unicode. */
  Text: "text",
  /** A PDF set in the old Walkman-Chanakya Hindi font: its text layer converted by the font's table. */
  Chanakya: "chanakya",
} as const;
export type Reader = (typeof Reader)[keyof typeof Reader];

/** A box on a PDF page, in points from its top left: `[x0, y0, x1, y1]`. */
const box = z.tuple([z.number(), z.number(), z.number(), z.number()]);
export type Box = z.infer<typeof box>;

/** Which PDF, exactly: an address can start serving another book. */
const pdf = z
  .object({
    /** Where it came from. */
    address: z.string().min(1),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    /** How many pages the PDF has. */
    pages: z.number().int().positive(),
  })
  .strict();

export const bookSchema = pdf
  .extend({
    /** The chapter's title, as printed. */
    title: z.string().min(1),
    reader: z.enum(Object.values(Reader) as [Reader, ...Reader[]]),
    /** The edition as the pages print it (NCERT's footer: "2020-21"). */
    edition: z.string().min(1),
    /** The book's answers pages for this chapter, when separate (`answers.pdf`). */
    answers: pdf.optional(),
    /** Not English: answers to the match's issues, by issue id (`match figure 3.6`), with why. */
    unmatched: z.record(z.string(), z.string().min(1)).optional(),
  })
  .strict();
export type Book = z.infer<typeof bookSchema>;

const id = z.string().regex(/^\d+(\.\d+)*$/);

/**
 * One of the book's blocks, built from the page files. `id` is ours and positional (build.ts);
 * `number` is the book's own, as printed ("Fig. 3.11", "Example 2", "प्रश्नावली 3.1", "1.").
 */
export const itemSchema = z
  .object({
    id,
    kind: itemKind,
    /** The PDF's page it starts on, from 1. */
    page: z.number().int().positive(),
    number: z.string().min(1).optional(),
    /** A heading the book prints without a number: a box's ("Think It Over"), an exercise's. */
    title: z.string().min(1).optional(),
    /** The book's words (a figure's or table's: its caption and the words inside it). */
    text: z.string(),
    /** A figure's or table's box on its page. */
    crop: box.optional(),
    /** A question's answer, from the answers pages. */
    answer: z.string().min(1).optional(),
  })
  .strict();
export type Item = z.infer<typeof itemSchema>;
export const itemsSchema = z.array(itemSchema);

/** A term the book defines, in the book's spelling, and the item it is defined in. */
export const termSchema = z
  .object({
    term: z.string().min(1),
    item: id,
    /** Not English: the English the book gives in brackets (मूल-बिन्दु (origin)). */
    en: z.string().min(1).optional(),
  })
  .strict();
export type Term = z.infer<typeof termSchema>;
export const termsSchema = z.array(termSchema);

/**
 * Word ranges on a page, as its words file numbers them: `L12` (a line), `L12.3` (a word),
 * `L12.1-6`, `L12.7-L14`, `L12-L14.2`, several joined by commas, in reading order.
 */
const ranges = z.string();

/** A block of a page, as an agent reads it. */
export const pageBlockSchema = z
  .object({
    kind: itemKind,
    number: z.coerce.string().min(1).optional(),
    title: z.string().min(1).optional(),
    words: ranges,
    /** Its start is on the page before. */
    continued: z.boolean().optional(),
    /** It runs onto the next page. */
    continues: z.boolean().optional(),
    /** A figure's or table's box: its drawing and caption. */
    box: box.optional(),
    /** Spans the agent read from the image (the PDF broke them, or flattened maths), by range. */
    read: z.record(ranges, z.coerce.string()).optional(),
    /** A question's answer, read from the book's answers pages. */
    answer: z.string().min(1).optional(),
  })
  .strict();
export type PageBlock = z.infer<typeof pageBlockSchema>;

/** `pages/page-NN.yaml`: an agent's reading of one page, the record the items are built from. */
export const pageFileSchema = z
  .object({
    page: z.number().int().positive(),
    /** The page's running head, number, footer and decoration. */
    furniture: ranges.optional(),
    blocks: z.array(pageBlockSchema),
    /** The spans of the terms the page defines. */
    terms: z.array(ranges).optional(),
    /** Answers to the machine's issues, by issue id (`read L36.6`), with why. */
    answers: z.record(z.string(), z.string().min(1)).optional(),
  })
  .strict();
export type PageFile = z.infer<typeof pageFileSchema>;

/** The files of one language's extract. */
export const SourceFile = {
  Book: "book.yaml",
  Pdf: "book.pdf",
  Answers: "answers.pdf",
  Pages: "pages",
  Items: "items.yaml",
  Terms: "terms.yaml",
  Figures: "figures",
} as const;
export type SourceFile = (typeof SourceFile)[keyof typeof SourceFile];

/** A page file's name: `page-03.yaml`. */
export const pageFileName = (page: number): string => `page-${String(page).padStart(2, "0")}.yaml`;
