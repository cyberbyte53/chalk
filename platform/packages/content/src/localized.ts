import { z } from "zod";

export const Locale = { En: "en", Hi: "hi" } as const;
export type Locale = (typeof Locale)[keyof typeof Locale];
export const LOCALES: readonly Locale[] = [Locale.En, Locale.Hi];

/**
 * The language agents read and write in (Jugnu's tools, `show`, the reviewer, a prop's one-line
 * summary for them): one choice, named here, not a language picked anew in each place.
 */
export const AGENT_LOCALE: Locale = Locale.En;

/** Text in every supported language. */
export const localizedSchema = z.object({ en: z.string().min(1), hi: z.string().min(1) });
export type Localized = z.infer<typeof localizedSchema>;

/**
 * A line that is shown and spoken. `speak` is plain language for the voice when the
 * screen text has maths glyphs (√2 → "square root of two"); it falls back to `say`.
 */
export const spokenSchema = z.object({ say: localizedSchema, speak: localizedSchema.optional() });
export type Spoken = z.infer<typeof spokenSchema>;
