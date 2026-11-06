import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

/**
 * How we make lessons (platform/docs/plans/authoring.md): a `guide.md` at the top of `authoring/`, and
 * optionally in a book's and a chapter's folder. Each is prose (instructions, read top to bottom) with an
 * optional "## Settings" section whose first ```yaml block holds exact values code reads. Settings merge
 * key by key, the nearest level winning; maps merge deeply, lists are replaced whole.
 */

export const GUIDE_FILE = "guide.md";

const voiceRef = z
  .string()
  .regex(/^[a-z0-9-]+:.+$/, 'a voice is "provider:voice", e.g. "piper:hi_IN-rohan-medium"');

/** What a guide may set. A lower guide sets only what it changes, so every key is optional. */
const settingsSchema = z
  .object({
    /** Each speaker's voice per language (the narrator speaks a line that names no one). */
    voices: z.record(z.string(), z.record(z.string(), voiceRef)).optional(),
  })
  .strict();
export type GuideSettings = z.infer<typeof settingsSchema>;

/** One level's guide: where it is, its settings and its prose. */
export type GuideLevel = { file: string; settings: GuideSettings; prose: string };

/** The guides that apply to `path` (a book or `<book>/<chapter>`), top first; those that exist. */
export function guideFiles(authoring: string, path: string): string[] {
  const [book, chapter] = path.split("/").filter((p) => p !== "");
  const dirs = [
    authoring,
    ...(book === undefined ? [] : [join(authoring, "books", book)]),
    ...(book === undefined || chapter === undefined
      ? []
      : [join(authoring, "books", book, chapter)]),
  ];
  return dirs.map((d) => join(d, GUIDE_FILE)).filter((f) => existsSync(f));
}

/** A guide's settings: the first yaml block under its "## Settings" heading (none: no settings). */
export function settingsIn(markdown: string, file = "guide.md"): GuideSettings {
  const heading = /^## Settings\s*$/m.exec(markdown);
  if (heading === null) return {};
  const rest = markdown.slice(heading.index + heading[0].length);
  const next = /^## /m.exec(rest);
  const section = next === null ? rest : rest.slice(0, next.index);
  const fence = /^```ya?ml\s*\n([\s\S]*?)^```/m.exec(section);
  if (fence === null) return {};
  const parsed = settingsSchema.safeParse(parseYaml(fence[1] ?? "") ?? {});
  if (!parsed.success)
    throw new Error(
      `${file}: its settings: ${parsed.error.issues.map((i) => `${i.path.join(".") || "settings"} ${i.message}`).join("; ")}`,
    );
  return parsed.data;
}

const isMap = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** `lower` over `upper`: maps merge deeply, anything else (a value, a list) is replaced whole. */
export function mergeSettings(upper: unknown, lower: unknown): unknown {
  if (!isMap(upper) || !isMap(lower)) return lower === undefined ? upper : lower;
  const out: Record<string, unknown> = { ...upper };
  for (const [key, value] of Object.entries(lower)) out[key] = mergeSettings(upper[key], value);
  return out;
}

/** The guides for `path`, top first, and their settings merged (the nearest level wins). */
export function guideAt(
  authoring: string,
  path: string,
): { levels: GuideLevel[]; settings: GuideSettings } {
  const levels = guideFiles(authoring, path).map((file) => {
    const markdown = readFileSync(file, "utf8");
    return { file, settings: settingsIn(markdown, file), prose: markdown };
  });
  const settings = levels.reduce<unknown>((all, l) => mergeSettings(all, l.settings), {});
  return { levels, settings: settings as GuideSettings };
}

/** Where each setting's value came from: `voices.narrator.hi` → the guide that set it last. */
export function settingSources(authoring: string, path: string): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (value: unknown, at: string, file: string) => {
    if (isMap(value))
      for (const [k, v] of Object.entries(value)) walk(v, at === "" ? k : `${at}.${k}`, file);
    else out.set(at, relative(join(authoring, ".."), file));
  };
  for (const level of guideAt(authoring, path).levels) walk(level.settings, "", level.file);
  return out;
}
