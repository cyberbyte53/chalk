import { type Piece, PieceKind, type PropPiece } from "./piece";

/** Every piece in a layout tree, depth first, parents before children. */
export function walkPieces(root: Piece): Piece[] {
  const out: Piece[] = [root];
  if ("children" in root) {
    for (const child of root.children) out.push(...walkPieces(child));
  }
  return out;
}

/** The props placed in a layout tree. */
export function propPieces(root: Piece): PropPiece[] {
  return walkPieces(root).filter((p): p is PropPiece => p.kind === PieceKind.Prop);
}
