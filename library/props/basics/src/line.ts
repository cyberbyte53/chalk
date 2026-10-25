import { localizedSchema } from "@chalk/content";
import { SAY, actionsFor, defineProp, say } from "@chalk/prop";
import { z } from "zod";
import { CharacterId } from "./cast";

const lineState = z
  .object({
    character: z.nativeEnum(CharacterId),
    line: localizedSchema,
    /** Plain words for the voice when the line has maths glyphs. */
    speak: localizedSchema.nullable(),
  })
  .strict();
export type LineState = z.infer<typeof lineState>;

const act = actionsFor<LineState>();

/** A cast character's speech bubble. It is said aloud only when a script calls `say`. */
export const line = defineProp({
  type: "line",
  isExplainer: false,
  describe: "A character's speech bubble.",
  state: lineState,
  defaults: { character: CharacterId.Maya, line: { en: "", hi: "" }, speak: null },
  inputs: ["line"],
  actions: {
    [SAY]: act({
      describe: "The character says the line, in their own voice",
      args: z.object({}).strict(),
      run: () => say(),
    }),
  },
  speech: (s) => ({ say: s.line, speak: s.speak ?? undefined, speaker: s.character }),
});
