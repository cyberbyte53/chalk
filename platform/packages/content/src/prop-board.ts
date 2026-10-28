import { type Board, boardSchema } from "./board";
import { PieceKind } from "./piece";

/**
 * A prop on its own: a board with that one prop on it, named after its type, from its defaults or
 * the fields given. What a prop's address opens: from here it is any board, so the player, the
 * preview and the chalk MCP need nothing else.
 */
export function propBoard(type: string, state: Readonly<Record<string, unknown>> = {}): Board {
  return boardSchema.parse({
    name: type,
    root: {
      kind: PieceKind.Column,
      name: "page",
      children: [
        {
          kind: PieceKind.Prop,
          name: type,
          prop: type,
          ...(Object.keys(state).length > 0 ? { with: { ...state } } : {}),
        },
      ],
    },
  });
}
