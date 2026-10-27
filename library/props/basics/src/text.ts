import { localizedSchema } from "@chalk/content";
import { SizeFit, actionsFor, colorSchema, defineProp, say } from "@chalk/prop";
import { z } from "zod";

/** How words sit on the board. A definition is set apart in an outlined box. */
export const TextStyle = {
  Title: "title",
  Body: "body",
  Note: "note",
  Definition: "definition",
} as const;
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];

const textState = z
  .object({
    text: localizedSchema,
    /** Plain words for the voice when the text has maths glyphs. */
    speak: localizedSchema.nullable(),
    style: z.nativeEnum(TextStyle),
    /** The colour a definition is drawn in (its edge, tint and display maths), or null for none. */
    color: colorSchema.nullable(),
  })
  .strict();
export type TextState = z.infer<typeof textState>;

const act = actionsFor<TextState>();

/** Words on the board. The lesson may own its words with an IS (e.g. a live "1.41² = 1.9881"). */
export const text = defineProp({
  type: "text",
  /** Words and controls: they reflow with the column (text sizes grow), never scale. */
  size: { fit: SizeFit.Fill },
  isExplainer: false,
  describe: "Words on the board, in the learner's language.",
  state: textState,
  defaults: { text: { en: "", hi: "" }, speak: null, style: TextStyle.Body, color: null },
  inputs: ["text"],
  summary: (s) => `words: ${s.text.en}`,
  actions: {
    say: act({
      describe: "Read the words aloud (narrator)",
      changes: [],
      args: z.object({}).strict(),
      run: () => say(),
    }),
  },
  speech: (s) => ({ say: s.text, speak: s.speak ?? undefined }),
});
