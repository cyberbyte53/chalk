import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ALL,
  ContentFile,
  QUESTIONS_DIR,
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

/** Biome's line width (biome.json). */
const LINE_WIDTH = 100;

/** content/modules.gen.ts: where the app and the server load each module that makes boards. */
export const MODULES_FILE = "modules.gen.ts";

/**
 * Every module that makes boards, in build order: each included concept's overview.ts and each
 * question family's family.ts, as paths under content/. Read from the manifests (a broken one is
 * skipped; the build reports it).
 */
export function boardModules(contentDir: string): string[] {
  const out: string[] = [];
  const root = readManifest(join(contentDir, ContentFile.Manifest), rootManifestSchema);
  for (const book of root?.books ?? []) {
    const manifest = readManifest(join(contentDir, book, ContentFile.Manifest), bookManifestSchema);
    for (const chapter of manifest?.chapters ?? []) {
      const path = `${book}/${chapter}`;
      const chapterManifest = readManifest(
        join(contentDir, path, ContentFile.Manifest),
        chapterManifestSchema,
      );
      if (chapterManifest === undefined) continue;
      for (const concept of chapterManifest.concepts)
        out.push(`${path}/${concept}/${ContentFile.Overview}`);
      const questions = join(contentDir, path, QUESTIONS_DIR);
      const families =
        chapterManifest.questions === ALL
          ? existsSync(questions)
            ? readdirSync(questions)
                .filter((name) => !(chapterManifest.exclude ?? []).includes(name))
                .sort()
            : []
          : chapterManifest.questions;
      for (const family of families) {
        const file = `${path}/${QUESTIONS_DIR}/${family}/${ContentFile.Family}`;
        if (existsSync(join(contentDir, file))) out.push(file);
      }
    }
  }
  return out;
}

/** modules.gen.ts for these modules: a lazy import each (the app splits each into its own chunk). */
export function modulesModule(modules: readonly string[]): string {
  // Laid out as Biome lays it out: one line when it fits, else the import on the next.
  const entries = modules
    .map((file) => {
      const key = `  "${file}": () =>`;
      const path = `"./${file.replace(/\.ts$/, "")}"`;
      const load = `import(${path}),`;
      if (`${key} ${load}`.length <= LINE_WIDTH) return `${key} ${load}\n`;
      if (`    ${load}`.length <= LINE_WIDTH) return `${key}\n    ${load}\n`;
      return `${key}\n    import(\n      ${path}\n    ),\n`;
    })
    .join("");
  return [
    "// Generated from build.yaml by pnpm build-content. Do not edit.",
    'import type { ContentModules } from "@chalk/author";',
    "",
    "/** Every module that makes boards, by its path under content/: chapters ship as code. */",
    `export const modules: ContentModules = {${entries === "" ? "" : `\n${entries}`}};`,
    "",
  ].join("\n");
}

/** Brings content/modules.gen.ts in line with the manifests; true if it wrote it. */
export function writeModulesModule(contentDir: string): boolean {
  const file = join(contentDir, MODULES_FILE);
  const text = modulesModule(boardModules(contentDir));
  if (existsSync(file) && readFileSync(file, "utf8") === text) return false;
  writeFileSync(file, text);
  return true;
}
