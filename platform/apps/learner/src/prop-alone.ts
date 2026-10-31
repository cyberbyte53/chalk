import { place, scene } from "@chalk/author";
import type { Board } from "@chalk/content";
import type { AnyProp } from "@chalk/prop/next";

/**
 * A prop on its own: a board with only it on it, named after its type, placed as a lesson places
 * it, from its start or the fields given (part by part: `{ plane: { … } }`). What a prop's address
 * opens, and the library's cards: from here it is any board.
 */
export function aloneBoard(def: AnyProp, given: Readonly<Record<string, unknown>> = {}): Board {
  return scene({ pieces: { [def.type]: place(def, given as never) } }).build(def.type).board;
}
