import { localizedSchema } from "@chalk/content";
import { Level, Origin } from "@chalk/content";
import { z } from "zod";

/** The file names the build looks for. Folder names are the only other names it reads. */
export const ContentFile = {
  Manifest: "build.yaml",
  Overview: "overview.ts",
  Family: "family.ts",
  Params: "params.yaml",
  Graph: "graph.yaml",
  /** A chapter's `Concept` enum, generated from its build.yaml for question families to import. */
  Concepts: "concepts.gen.ts",
  /** A book's, chapter's or concept's art, drawn with @chalk/draw (optional). */
  Art: "art.tsx",
} as const;

/** A chapter's question families live in this folder: the chapter's question bank. */
export const QUESTIONS_DIR = "questions";

/** `questions: all`: every family folder (minus `exclude`). */
export const ALL = "all";

/** A folder name a manifest lists: kebab-case, checked against the folders on disk. */
export const nameSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, "folder names are kebab-case, like locate-on-line");

const names = z.array(nameSchema).refine((list) => new Set(list).size === list.length, {
  message: "a name is listed twice",
});

/** content/build.yaml: which books are built, in order. */
export const rootManifestSchema = z.object({ books: names }).strict();

/** <book>/build.yaml */
export const bookManifestSchema = z.object({ title: localizedSchema, chapters: names }).strict();

/** <chapter>/build.yaml: its concepts in order, and its question bank (folders under questions/). */
export const chapterManifestSchema = z
  .object({
    title: localizedSchema,
    concepts: names.refine((list) => !list.includes(QUESTIONS_DIR), {
      message: `"${QUESTIONS_DIR}" is the question bank's folder, not a concept`,
    }),
    /** `all` (every family folder, minus `exclude`), or the family folders to include. */
    questions: z.union([z.literal(ALL), names]),
    exclude: names.optional(),
  })
  .strict()
  .refine((m) => m.exclude === undefined || m.questions === ALL, {
    message: "`exclude` only goes with `questions: all`; with a list, just leave the name out",
    path: ["exclude"],
  });

/** <concept>/build.yaml. Its pages are in overview.ts; the questions that test it are the chapter's. */
export const conceptManifestSchema = z
  .object({
    title: localizedSchema,
    /** A glyph or two for its stop on the chapter's path (½, 0.1, √): not words. */
    glyph: z.string().min(1).max(4).optional(),
    /** Extra props Jugnu may explain with, beyond those its pages and questions place. */
    props: z.array(z.string().min(1)).optional(),
  })
  .strict();

export type RootManifest = z.infer<typeof rootManifestSchema>;
export type BookManifest = z.infer<typeof bookManifestSchema>;
export type ChapterManifest = z.infer<typeof chapterManifestSchema>;
export type ConceptManifest = z.infer<typeof conceptManifestSchema>;

/** One row of a family's params.yaml: one question. */
export const paramsRowSchema = z
  .object({
    params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    /** Overrides the family's level for this question. */
    level: z.nativeEnum(Level).optional(),
    origin: z.nativeEnum(Origin).default(Origin.Authored),
    /** Kept in the file, left out of the build. */
    exclude: z.boolean().optional(),
  })
  .strict();
export const paramsFileSchema = z.array(paramsRowSchema).min(1);
export type ParamsRow = z.infer<typeof paramsRowSchema>;

/** content/graph.yaml: prerequisite edges between concepts, by their paths in content/. */
export const graphFileSchema = z
  .object({
    edges: z.array(
      z
        .object({
          concept: z.string().min(1),
          parents: z.array(z.string().min(1)).min(1),
        })
        .strict(),
    ),
  })
  .strict();
export type GraphFile = z.infer<typeof graphFileSchema>;
