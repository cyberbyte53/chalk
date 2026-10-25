import { z } from "zod";
import { localizedSchema } from "./localized";

/** Every kind of item the build writes. */
export const Kind = {
  Book: "book",
  Chapter: "chapter",
  Concept: "concept",
  Page: "page",
  Family: "family",
  Question: "question",
} as const;
export type Kind = (typeof Kind)[keyof typeof Kind];

/** The files the build writes, by kind: each item's in its own folder; index and graph at the top. */
export const BuiltFile = {
  Index: "index.json",
  Graph: "graph.json",
  Book: "book.json",
  Chapter: "chapter.json",
  Concept: "concept.json",
  Family: "family.json",
} as const;
export type BuiltFile = (typeof BuiltFile)[keyof typeof BuiltFile];

/** A concept's pages are built into this folder, one `<key>.json` each. */
export const OVERVIEW_DIR = "overview";

/** How hard a question is, for its concept. */
export const Level = { Easy: "easy", Medium: "medium", Hard: "hard" } as const;
export type Level = (typeof Level)[keyof typeof Level];

/** Who wrote a params row: a person (or an agent they asked), or the question generator. */
export const Origin = { Authored: "authored", Generated: "generated" } as const;
export type Origin = (typeof Origin)[keyof typeof Origin];

/** The shape a book's, chapter's or concept's art is drawn in: a wide card or a square tile. */
export const ArtFrame = { Card: "card", Tile: "tile" } as const;
export type ArtFrame = (typeof ArtFrame)[keyof typeof ArtFrame];

/** Each frame's size in px; art is drawn at this size and scales with the screen. */
export const ART_SIZE: Record<ArtFrame, { width: number; height: number }> = {
  [ArtFrame.Card]: { width: 320, height: 140 },
  [ArtFrame.Tile]: { width: 160, height: 160 },
};

/** The most an item's art may weigh, as SVG text. */
export const MAX_ART_BYTES = 16_000;

/** The commit recorded when building from uncommitted files (preview, a local build). */
export const WORKING_TREE = "working-tree";

const id = z.string().regex(/^[0-9a-f]{16}$/);
const paramValue = z.union([z.string(), z.number(), z.boolean()]);

/** Where an item came from: its folder in content/, the file, the row (questions), the commit. */
export const sourceSchema = z
  .object({
    path: z.string().min(1),
    file: z.string().min(1),
    /** A question's row in params.yaml, or a page's place in overview.ts (from 0). */
    row: z.number().int().min(0).optional(),
    commit: z.string().min(1),
  })
  .strict();
export type Source = z.infer<typeof sourceSchema>;

/** A pointer from a container to a child: enough to fetch it and to know if it changed. */
export const refSchema = z.object({ id, version: id, path: z.string().min(1) }).strict();
export type Ref = z.infer<typeof refSchema>;

const base = { id, version: id, source: sourceSchema };

/** Art built from an `art.tsx`: drawn with @chalk/draw, checked, kept as SVG markup to inline. */
export const builtArtSchema = z
  .object({ frame: z.nativeEnum(ArtFrame), svg: z.string().min(1).max(MAX_ART_BYTES) })
  .strict();
export type BuiltArt = z.infer<typeof builtArtSchema>;

export const builtPageSchema = z
  .object({
    kind: z.literal(Kind.Page),
    ...base,
    concept: id,
    key: z.string().min(1),
    /**
     * The hash of the code that makes its board (its module and every file it imports, under
     * content/, library/ and platform/): the board itself is made from that code, never kept as data.
     */
    code: id,
  })
  .strict();
export type BuiltPage = z.infer<typeof builtPageSchema>;

export const builtQuestionSchema = z
  .object({
    kind: z.literal(Kind.Question),
    ...base,
    /** The concepts it tests (its family's `tests`). It is served once all of them are taught. */
    tests: z.array(id).min(1),
    family: id,
    level: z.nativeEnum(Level),
    origin: z.nativeEnum(Origin),
    /** Its place (from 1) in the first practice after the lesson; absent: bank only. */
    firstTry: z.number().int().min(1).optional(),
    params: z.record(z.string(), paramValue),
    /**
     * The hash of the code that makes its board (its module and every file it imports, under
     * content/, library/ and platform/): the board itself is made from that code, never kept as data.
     */
    code: id,
  })
  .strict();
export type BuiltQuestion = z.infer<typeof builtQuestionSchema>;

export const builtFamilySchema = z
  .object({
    kind: z.literal(Kind.Family),
    ...base,
    chapter: id,
    tests: z.array(id).min(1),
    questions: z.array(refSchema),
  })
  .strict();
export type BuiltFamily = z.infer<typeof builtFamilySchema>;

export const builtConceptSchema = z
  .object({
    kind: z.literal(Kind.Concept),
    ...base,
    title: localizedSchema,
    /** Its art, or null when it has no art.tsx yet. */
    art: builtArtSchema.nullable(),
    /** Its glyph on the chapter's path, or null. */
    glyph: z.string().min(1).max(4).nullable(),
    /** Prerequisite concepts, from content/graph.yaml. */
    prereqs: z.array(id),
    /** Theory pages (walkthroughs too), in reading order. */
    overview: z.array(refSchema),
    /** Prop types Jugnu may use here: its pages', the questions testing it, and its extras. */
    props: z.array(z.string()),
  })
  .strict();
export type BuiltConcept = z.infer<typeof builtConceptSchema>;

/** A question as the bank lists it: enough to sample by level and by what is taught. */
export const bankRefSchema = refSchema
  .extend({
    level: z.nativeEnum(Level),
    tests: z.array(id).min(1),
    /** Its place in the first practice after the lesson; absent: bank only. */
    firstTry: z.number().int().min(1).optional(),
  })
  .strict();
export type BankRef = z.infer<typeof bankRefSchema>;

export const builtChapterSchema = z
  .object({
    kind: z.literal(Kind.Chapter),
    ...base,
    title: localizedSchema,
    /** Its art, or null when it has no art.tsx yet. */
    art: builtArtSchema.nullable(),
    concepts: z.array(refSchema),
    /** The question bank: no order, sampled at runtime from the questions whose concepts are taught. */
    questions: z.array(bankRefSchema),
    /** Every prop type its concepts may use. */
    props: z.array(z.string()),
  })
  .strict();
export type BuiltChapter = z.infer<typeof builtChapterSchema>;

export const builtBookSchema = z
  .object({
    kind: z.literal(Kind.Book),
    ...base,
    title: localizedSchema,
    /** Its art, or null when it has no art.tsx yet. */
    art: builtArtSchema.nullable(),
    chapters: z.array(refSchema),
  })
  .strict();
export type BuiltBook = z.infer<typeof builtBookSchema>;

/** build/index.json: the books, and the commit they were built from. */
export const buildIndexSchema = z
  .object({ commit: z.string().min(1), books: z.array(refSchema) })
  .strict();
export type BuildIndex = z.infer<typeof buildIndexSchema>;

/** build/graph.json: every built concept's prerequisites. */
export const builtGraphSchema = z
  .object({ edges: z.array(z.object({ concept: id, parents: z.array(id) }).strict()) })
  .strict();
export type BuiltGraph = z.infer<typeof builtGraphSchema>;
