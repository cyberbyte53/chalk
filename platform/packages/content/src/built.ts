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

/** The two files at the top of build/: the books, and the concept graph. */
export const BuiltFile = { Index: "index.json", Graph: "graph.json" } as const;
export type BuiltFile = (typeof BuiltFile)[keyof typeof BuiltFile];

/**
 * Every built item lives at its path in the course tree, as `<path>.json`: a book at
 * `class10-maths.json`, a page at `class10-maths/real-numbers/hcf-and-lcm/story.json`, a bank
 * question at `class10-maths/real-numbers/questions/hcf-story/3922a76b.json`.
 */
export const builtFile = (path: string): string => `${path}.json`;

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

const id = z.string().regex(/^[0-9a-f]{16}$/);
const paramValue = z.union([z.string(), z.number(), z.boolean()]);

/** Where an item came from: its folder in content/, the file, and the row (a question's, in params.yaml). */
export const sourceSchema = z
  .object({
    path: z.string().min(1),
    file: z.string().min(1),
    /** A question's row in params.yaml, or a page's place in overview.ts (from 0). */
    row: z.number().int().min(0).optional(),
  })
  .strict();
export type Source = z.infer<typeof sourceSchema>;

/** A node's path in the course tree: its name (`class10-maths/real-numbers/hcf-and-lcm/story`). */
const path = z.string().min(1);

/** A pointer from a container to a child: its path (its file is `<path>.json`), id and version. */
export const refSchema = z.object({ id, version: id, path }).strict();
export type Ref = z.infer<typeof refSchema>;

/** Every item: where it is in the tree (`path`; `id` is a hash of it), its version, where it came from. */
const base = { path, id, version: id, source: sourceSchema };

/**
 * The prop types a board places, each with its version (a hash of its package's code): a board is
 * made from its own code and these, so its version changes when one of them does.
 */
const propVersions = z.record(z.string(), id);

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
    props: propVersions,
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
    props: propVersions,
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

/** build/index.json: the books, and the commit they were built from (`<sha>-dirty` from uncommitted files). */
export const buildIndexSchema = z
  .object({ commit: z.string().min(1), books: z.array(refSchema) })
  .strict();
export type BuildIndex = z.infer<typeof buildIndexSchema>;

/** build/graph.json: every built concept's prerequisites. */
export const builtGraphSchema = z
  .object({ edges: z.array(z.object({ concept: id, parents: z.array(id) }).strict()) })
  .strict();
export type BuiltGraph = z.infer<typeof builtGraphSchema>;
