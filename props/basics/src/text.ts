import { localizedSchema } from "@chalk/content";
import { SAY, actionsFor, defineProp, task } from "@chalk/prop";
import { z } from "zod";

export const TextStyle = { Title: "title", Body: "body", Note: "note" } as const;
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];

const textState = z
  .object({
    text: localizedSchema,
    /** Plain words for the voice when the text has maths glyphs. */
    speak: localizedSchema.nullable(),
    style: z.nativeEnum(TextStyle),
  })
  .strict();
export type TextState = z.infer<typeof textState>;

const act = actionsFor<TextState>();

/** Words on the board. The lesson may own its words with an IS (e.g. a live "1.41² = 1.9881"). */
export const text = defineProp<TextState>({
  type: "text",
  describe: "Words on the board, in the learner's language.",
  state: textState,
  defaults: { text: { en: "", hi: "" }, speak: null, style: TextStyle.Body },
  inputs: ["text"],
  actions: {
    [SAY]: act({
      describe: "Read the words aloud (narrator)",
      args: z.object({}).strict(),
      run: () => task((context) => context.speak()),
    }),
  },
  speech: (s) => ({ say: s.text, speak: s.speak ?? undefined }),
});
