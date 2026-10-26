import { z } from "zod";

export const PieceKind = {
  Column: "column",
  Row: "row",
  Overlay: "overlay",
  Space: "space",
  Prop: "prop",
} as const;
export type PieceKind = (typeof PieceKind)[keyof typeof PieceKind];

export const Pin = {
  TopLeft: "topLeft",
  TopRight: "topRight",
  BottomLeft: "bottomLeft",
  BottomRight: "bottomRight",
  Center: "center",
} as const;
export type Pin = (typeof Pin)[keyof typeof Pin];

/** Names appear in rules (`line.marker`), so they are identifiers: camelCase, no spaces or dashes. */
export const NAME_PATTERN = /^[a-z][A-Za-z0-9]*$/;
export const nameSchema = z
  .string()
  .regex(NAME_PATTERN, "names are camelCase identifiers (they appear in rules, e.g. line.marker)");

const base = {
  /** Unique within the board; how rules refer to it. Free to rename. */
  name: nameSchema,
  /** Not shown until the board shows it (`board.show`). */
  isHidden: z.boolean().optional(),
};

/**
 * A board's layout tree: layout pieces arrange, prop pieces place a prop. Written out by hand only
 * because the tree is recursive (zod cannot infer it); `pieceSchema` is annotated with this type.
 */
export type Piece =
  | {
      kind: "column";
      name: string;
      isHidden?: boolean;
      gap?: number;
      children: Piece[];
    }
  | { kind: "row"; name: string; isHidden?: boolean; gap?: number; children: Piece[] }
  | {
      kind: "overlay";
      name: string;
      isHidden?: boolean;
      children: Piece[];
      pins?: Record<string, Pin>;
    }
  | { kind: "space"; name: string; isHidden?: boolean }
  | {
      kind: "prop";
      name: string;
      isHidden?: boolean;
      /** Prop type from the library (e.g. "numberLine", "text"). */
      prop: string;
      /** Its starting fields; anything left out uses the prop's defaults. */
      with?: Record<string, unknown>;
    };

export type PropPiece = Extract<Piece, { kind: "prop" }>;

export const pieceSchema: z.ZodType<Piece, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      ...base,
      kind: z.literal(PieceKind.Column),
      gap: z.number().optional(),
      children: z.array(pieceSchema),
    }),
    z.object({
      ...base,
      kind: z.literal(PieceKind.Row),
      gap: z.number().optional(),
      children: z.array(pieceSchema),
    }),
    z.object({
      ...base,
      kind: z.literal(PieceKind.Overlay),
      children: z.array(pieceSchema).min(1),
      /** Child name → where it is pinned on top of the first child. */
      pins: z.record(z.string(), z.nativeEnum(Pin)).optional(),
    }),
    z.object({ ...base, kind: z.literal(PieceKind.Space) }),
    z.object({
      ...base,
      kind: z.literal(PieceKind.Prop),
      prop: z.string().min(1),
      with: z.record(z.string(), z.unknown()).optional(),
    }),
  ]),
);
