import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ContentFile,
  bookManifestSchema,
  chapterManifestSchema,
  rootManifestSchema,
} from "@chalk/author";
import { parseDocument } from "yaml";
import type { ZodType, ZodTypeDef } from "zod";

/** `successive-magnification` → `SuccessiveMagnification`. */
function pascal(name: string): string {
  return name
    .split("-")
    .filter((word) => word !== "")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * A chapter's concepts.gen.ts: its concepts as an enum, for question families' `tests`. Written so
 * Biome leaves it as it is.
 */
export function conceptsModule(concepts: readonly string[]): string {
  const entries = concepts.map((name) => `  ${pascal(name)}: "${name}",\n`).join("");
  return [
    "// Generated from build.yaml by pnpm build-content. Do not edit.",
    "",
    "/** This chapter's concepts, for a question family's `tests`. */",
    `export const Concept = {${entries === "" ? "" : `\n${entries}`}} as const;`,
    "export type Concept = (typeof Concept)[keyof typeof Concept];",
    "",
  ].join("\n");
}

/** A manifest, or undefined if it is missing or broken (the build that follows reports why). */
function readManifest<T>(file: string, schema: ZodType<T, ZodTypeDef, unknown>): T | undefined {
  if (!existsSync(file)) return undefined;
  const document = parseDocument(readFileSync(file, "utf8"));
  if (document.errors.length > 0) return undefined;
  const parsed = schema.safeParse(document.toJS());
  return parsed.success ? parsed.data : undefined;
}

/**
 * Brings every chapter's concepts.gen.ts in line with its build.yaml, and returns the ones it wrote.
 * Runs before a build, since question families import it. Chapters with a broken manifest are left
 * alone; the build reports them.
 */
export function writeConceptModules(contentDir: string): string[] {
  const written: string[] = [];
  const root = readManifest(join(contentDir, ContentFile.Manifest), rootManifestSchema);
  for (const book of root?.books ?? []) {
    const manifest = readManifest(join(contentDir, book, ContentFile.Manifest), bookManifestSchema);
    for (const chapter of manifest?.chapters ?? []) {
      const dir = join(contentDir, book, chapter);
      const chapterManifest = readManifest(join(dir, ContentFile.Manifest), chapterManifestSchema);
      if (chapterManifest === undefined) continue;
      const file = join(dir, ContentFile.Concepts);
      const text = conceptsModule(chapterManifest.concepts);
      if (existsSync(file) && readFileSync(file, "utf8") === text) continue;
      writeFileSync(file, text);
      written.push(`${book}/${chapter}/${ContentFile.Concepts}`);
    }
  }
  return written;
}
