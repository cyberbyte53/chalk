import { z } from "zod";

/**
 * A language's extract of a chapter's book (platform/docs/plans/sources.md), in
 * authoring/books/<book>/<chapter>/source/<lang>/: `book.yaml` (which book, exactly), `items.yaml`
 * (the book's own blocks, in reading order, in its exact words) and `terms.yaml` (what it defines).
 */

/** What the book itself marks a block as. A figure's parts (a), (b), (c) are one figure. */
export const ItemKind = {
  Section: "section",
  Text: "text",
  Figure: "figure",
  Table: "table",
  Example: "example",
  Activity: "activity",
  Exercise: "exercise",
  Question: "question",
} as const;
export type ItemKind = (typeof ItemKind)[keyof typeof ItemKind];

/** The kinds cropped from the page into `figures/<id>.png`. */
export const CROPPED: readonly ItemKind[] = [ItemKind.Figure, ItemKind.Table];

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
    /** The book's own number for each page of the PDF, in order. */
    printed: z.array(z.number().int()),
  })
  .strict();

export const bookSchema = pdf
  .extend({
    /** The chapter's title, as printed. */
    title: z.string().min(1),
    /** The edition as the pages print it (NCERT's footer: "2020-21"). */
    edition: z.string().min(1),
    /** The book's answers pages for this chapter, when separate (`answers.pdf`). */
    answers: pdf.optional(),
    /** Not English: each number found in one language's book and not the other's, with why. */
    unmatched: z.record(z.string(), z.string()).optional(),
  })
  .strict();
export type Book = z.infer<typeof bookSchema>;

/**
 * One of the book's own blocks. `id` is ours and positional, written by the machine (ids.ts);
 * `number` is the book's own, as printed ("Fig. 3.11", "Example 2", "Exercise 3.2", "Q1", "3.2").
 */
export const itemSchema = z
  .object({
    id: z.string().regex(/^\d+(\.\d+)*$/),
    kind: z.enum(Object.values(ItemKind) as [ItemKind, ...ItemKind[]]),
    /** The PDF's page it starts on, from 1. */
    page: z.number().int().positive(),
    number: z.string().min(1).optional(),
    /** A section inside a section: 2. */
    level: z.literal(2).optional(),
    /** The book's exact words (a figure's or table's: its caption and labels, not its number). */
    text: z.string(),
    /** A question's answer, from the answers pages. */
    answer: z.string().min(1).optional(),
    /** A figure's or table's box on its page. */
    crop: box.optional(),
  })
  .strict();
export type Item = z.infer<typeof itemSchema>;
export const itemsSchema = z.array(itemSchema);

/** What the model writes before the machine numbers it: an item whose id may be missing. */
export const draftItemsSchema = z.array(itemSchema.extend({ id: itemSchema.shape.id.optional() }));
export type DraftItem = z.infer<typeof draftItemsSchema>[number];

/** A term the book defines, in the book's spelling, and the item it is defined in. */
export const termSchema = z
  .object({
    term: z.string().min(1),
    item: z.string().regex(/^\d+(\.\d+)*$/),
    /** Not English: the English the book gives in brackets (मूल-बिन्दु (origin)). */
    en: z.string().min(1).optional(),
  })
  .strict();
export type Term = z.infer<typeof termSchema>;
export const termsSchema = z.array(termSchema);

/** The files of one language's extract. */
export const SourceFile = {
  Book: "book.yaml",
  Pdf: "book.pdf",
  Answers: "answers.pdf",
  Items: "items.yaml",
  Terms: "terms.yaml",
  Figures: "figures",
} as const;
