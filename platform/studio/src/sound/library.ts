import { z } from "zod";

/**
 * The sound library's list (library/sounds/sounds.json, platform/docs/sound.md): each sound by its
 * name (the role it plays: right, step), what it is for, and where its recording came from. The list
 * is the one place a sound is defined: its index.ts is written from it.
 */
const NOT_NAMES = new Set(
  "sound await break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield".split(
    " ",
  ),
);

export const libraryListSchema = z.object({
  $comment: z.string().optional(),
  sounds: z.array(
    z.object({
      // Its export's name: a word, not one JavaScript keeps for itself, nor the import's (sound).
      name: z
        .string()
        .regex(/^[a-z][a-zA-Z]*$/)
        .refine(
          (n) => !NOT_NAMES.has(n),
          (n) => ({ message: `"${n}" can't name a sound` }),
        ),
      file: z.string(),
      /** How long it plays, measured when it was added (ffprobe). */
      seconds: z.number().positive(),
      for: z.string().min(1),
      source: z.string().url(),
      title: z.string(),
      author: z.string(),
      license: z.literal("CC0 1.0"),
    }),
  ),
});
export type LibraryList = z.infer<typeof libraryListSchema>;
export type LibrarySound = LibraryList["sounds"][number];

/** The library's index.ts: one export per sound, from its list. */
export function libraryIndex(list: LibraryList): string {
  const exports = [...list.sounds]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (s) =>
        `/** ${s.for[0]?.toUpperCase()}${s.for.slice(1)}. */\nexport const ${s.name} = sound(${JSON.stringify(s.name)}, new URL(${JSON.stringify(`./${s.file}`)}, import.meta.url), ${s.seconds});`,
    );
  return `import { sound } from "@chalk/content";

/**
 * The sound library (platform/docs/sound.md): written from sounds.json by \`pnpm sound\`; don't edit.
 * Each sound is a role (right, step) any prop's sound view or lesson's cue uses by importing it; the
 * recording behind it changes with \`pnpm sound add <name> freesound:<id>\`, everywhere at once.
 */

${exports.join("\n")}
`;
}
