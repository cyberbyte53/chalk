import type { AnyProp, Given } from "@chalk/prop";
import { z } from "zod";
import type { Localized } from "./localized";
import { pieceSchema } from "./piece";
import type { SceneSound, SceneWords } from "./sound/cue";

/** A built page or question, by its file under build/ and its version: what its board is made from. */
export const itemRefSchema = z
  .object({
    /** Its id (a hash of where it lives in content/): with a node's address, what events name. */
    id: z.string().min(1).max(64),
    path: z.string().min(1).max(400),
    version: z.string().min(1).max(64),
  })
  .strict();
export type ItemRef = z.infer<typeof itemRefSchema>;

/** One screen: its scene (platform/docs/board-model.md), and how its pieces are laid out. */
export const boardSchema = z.object({
  /** Unique within the lesson; free to rename. */
  name: z.string().min(1),
  root: pieceSchema,
  /**
   * The built item it was made from (build/<path>, at that version): where any copy of the board,
   * on the phone or on the server, is made again from its code.
   */
  item: itemRefSchema.optional(),
  /** The scene, the outermost prop, whose children are the pieces (`root` lays them out), and what each starts with. */
  model: z.custom<SceneModel>(
    (v) => typeof v === "object" && v !== null && "scene" in v,
    "should be a scene and its pieces' setup",
  ),
});
export type Board = z.infer<typeof boardSchema>;

/**
 * A board's model: its scene, what each piece starts with, and its lines
 * (platform/docs/sound.md): the lesson's own words for a piece, and its narration lines (said by
 * rules), each with who says it. A piece without its own words says what it says itself.
 */
export type SceneModel = {
  readonly scene: AnyProp;
  readonly given: Given;
  readonly lines: Readonly<Record<string, SceneWords>>;
  /** The narration lines' names, in the order written. */
  readonly freeLines: readonly string[];
  /**
   * The lesson's sound cues, by name (platform/docs/sound.md): at their moment they replace the
   * pieces' own sound there; null only silences it.
   */
  readonly sounds?: Readonly<Record<string, SceneSound>>;
  /** What each piece stands for on this board, in the author's words (`standsFor`). */
  readonly standsFor?: Readonly<Record<string, string>>;
};
