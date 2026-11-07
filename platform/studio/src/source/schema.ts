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
  /** A heading the book prints without a number ("Mitosis"). */
  Heading: "heading",
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

/** The tools that make something a page's reader then proofreads (their versions: tools.ts). */
export const Tool = {
  /** The words and their numbering: lines, columns. */
  Reader: "reader",
  HindiRepair: "hindi-repair",
  FigureSnap: "figure-snap",
  TableCells: "table-cells",
} as const;
export type Tool = (typeof Tool)[keyof typeof Tool];
const toolName = z.enum(Object.values(Tool) as [Tool, ...Tool[]]);

/** Who made what didn't come from the PDF as it is: a tool, or the agent. */
export const Maker = {
  HindiRepair: Tool.HindiRepair,
  FigureSnap: Tool.FigureSnap,
  TableCells: Tool.TableCells,
  Agent: "agent",
} as const;
export type Maker = (typeof Maker)[keyof typeof Maker];
const maker = z.enum(Object.values(Maker) as [Maker, ...Maker[]]);

/**
 * Why the agent replaced what a tool suggested (platform/docs/plans/sources.md, "Every override is
 * feedback"): what `pnpm source feedback` gathers, so a later fix goes to the tool that fell short.
 */
export const Cause = {
  LinesRunTogether: "lines-run-together",
  SideColumn: "side-column",
  CaptionAway: "caption-away",
  BrokenAcrossLines: "broken-across-lines",
  WrongReading: "wrong-reading",
  WrongBox: "wrong-box",
  WrongCells: "wrong-cells",
  Other: "other",
} as const;
export type Cause = (typeof Cause)[keyof typeof Cause];
const cause = z.enum(Object.values(Cause) as [Cause, ...Cause[]]);

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
    /**
     * The chapter's title as page 1 prints it, set by `--title`: a PDF's text can't be trusted for
     * it, so it is never guessed. Absent until the session has read page 1.
     */
    title: z.string().min(1).optional(),
    reader: z.enum(Object.values(Reader) as [Reader, ...Reader[]]),
    /** The edition as the pages print it ("2020-21"), or `none`; set by `--edition`, as the title. */
    edition: z.string().min(1).optional(),
    /** The book's answers pages for this chapter, when separate (`answers.pdf`). */
    answers: pdf.optional(),
    /**
     * The tools' versions the chapter was built with, the reader's among them; set when the PDF is
     * prepared. Absent: the extract is from before tools were recorded, to be read again.
     */
    tools: z.record(toolName, z.number().int()).optional(),
  })
  .strict();
export type Book = z.infer<typeof bookSchema>;

const id = z.string().regex(/^\d+(\.\d+)*$/);

/**
 * Word ranges on a page, as its words file numbers them: `L12` (a line), `L12.3` (a word),
 * `L12.1-6`, `L12.7-L14`, `L12-L14.2`, several joined by commas, in reading order.
 */
const ranges = z.string();

/**
 * What of an item didn't come from the PDF as it is, and who made it: some words (`page` when they
 * aren't on the page the item starts on), its box, its cells.
 */
const madeSchema = z.union([
  z.object({ words: ranges, page: z.number().int().positive().optional(), by: maker }).strict(),
  z.object({ box: z.literal(true), by: maker }).strict(),
  z.object({ cells: z.literal(true), by: maker }).strict(),
]);
export type Made = z.infer<typeof madeSchema>;

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
    /** A table's cells, row by row; a merged cell at its first place, empty in the others. */
    rows: z.array(z.array(z.string())).optional(),
    /** A figure's or table's box on its page. */
    crop: box.optional(),
    /** A question's answer, from the answers pages. */
    answer: z.string().min(1).optional(),
    /** Only what didn't come from the PDF as it is. */
    made: z.array(madeSchema).optional(),
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
 * A reading of a span from the image: its words alone where it fills what a tool left (the tool's own
 * why is the record), with its cause where it replaces what a tool gave.
 */
const readingSchema = z.union([
  z.string(),
  z.number().transform(String),
  z.object({ text: z.coerce.string(), cause: cause.optional() }).strict(),
]);

/** A block of a page, as an agent reads it. */
export const pageBlockSchema = z
  .object({
    kind: itemKind,
    /** The words of its number as printed: a range, so they come from the PDF or a reading. */
    number: ranges.optional(),
    /** The words of its heading as printed, the same way. */
    title: ranges.optional(),
    words: ranges,
    /** Its start is on the page before. */
    continued: z.boolean().optional(),
    /** It runs onto the next page. */
    continues: z.boolean().optional(),
    /** A figure's or table's rough box, drawn by eye: the build snaps it to what the PDF drew. */
    box: box.optional(),
    /** The box exactly, over figure-snap's (or where it found no drawing). */
    crop: z.object({ box, cause: cause.optional() }).strict().optional(),
    /** A table's cells as word ranges, row by row, over table-cells' (or where it found no rules). */
    cells: z
      .object({ rows: z.array(z.array(ranges)), cause: cause.optional() })
      .strict()
      .optional(),
    /** Spans the agent read from the image, by range: over a tool's reading, or what it left. */
    read: z.record(ranges, readingSchema).optional(),
    /** A question's answer, read from the book's answers pages. */
    answer: z.string().min(1).optional(),
  })
  .strict();
export type PageBlock = z.infer<typeof pageBlockSchema>;

/**
 * `pages/page-NN.yaml`: one page's structure, pre-filled by the draft and decided by the agent, the
 * record the items are built from.
 */
export const pageFileSchema = z
  .object({
    page: z.number().int().positive(),
    /**
     * The agent's word that it checked this page against the image, corrected or not. The tools write
     * the page file first, so a page nobody looked at says false, and raises an issue until it doesn't.
     */
    proofread: z.boolean().optional(),
    /** The cause of every override on this page that names none: most pages have one. */
    cause: cause.optional(),
    /** The page's running head, number, footer and decoration. */
    furniture: ranges.optional(),
    blocks: z.array(pageBlockSchema),
    /** The spans of the terms the page defines. */
    terms: z.array(ranges).optional(),
    /** Answers to the machine's issues, by issue id (`read L36.6`), with why. */
    answers: z.record(z.string(), z.string().min(1)).optional(),
    /** A note on a cause of this page's overrides, once per cause. */
    notes: z.record(cause, z.string().min(1)).optional(),
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

/**
 * `source/match.yaml`: the languages' books paired. `pairs` are built, again on every run, from the
 * items' kinds and digits; `answers` are the session's: why one book has what the other doesn't, by
 * issue id (`only en figure 3.6`).
 */
export const matchSchema = z
  .object({
    pairs: z.array(
      z
        .object({
          /** What pairs them: `figure 3.6`, `question 2 of exercise 1`. */
          key: z.string().min(1),
          en: id,
          hi: id,
        })
        .strict(),
    ),
    answers: z.record(z.string(), z.string().min(1)).optional(),
  })
  .strict();
export type MatchFile = z.infer<typeof matchSchema>;

/** The file beside the languages' folders, in `source/`. */
export const MATCH_FILE = "match.yaml";

/** A page file's name: `page-03.yaml`. */
export const pageFileName = (page: number): string => `page-${String(page).padStart(2, "0")}.yaml`;
