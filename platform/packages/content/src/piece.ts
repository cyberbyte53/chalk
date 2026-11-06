import type { Size } from "@chalk/prop";
import { z } from "zod";
import { type Localized, localizedSchema } from "./localized";

/** A board is a column of pieces, top to bottom, with a space at its foot. */
export const PieceKind = {
  Column: "column",
  Space: "space",
  Prop: "prop",
} as const;
export type PieceKind = (typeof PieceKind)[keyof typeof PieceKind];

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
  | { kind: "space"; name: string; isHidden?: boolean }
  | {
      kind: "prop";
      name: string;
      isHidden?: boolean;
      /** Prop type from the library (e.g. "numberLine", "text"). */
      prop: string;
      /** How it is sized on other screens, over its prop type's own rule (see @chalk/prop size.ts). */
      size?: Size;
      /** Its starting fields; anything left out uses the prop's defaults. */
      with?: Record<string, unknown>;
      /**
       * Drawn still, as a picture: nothing on it can be tapped, dragged or focused. What it shows, in
       * words, for a screen reader and for Jugnu.
       */
      still?: Localized;
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
    z.object({ ...base, kind: z.literal(PieceKind.Space) }),
    z.object({
      ...base,
      kind: z.literal(PieceKind.Prop),
      prop: z.string().min(1),
      size: z
        .object({
          fit: z.enum(["scale", "fill"]).optional(),
          maxZoom: z.number().min(1).max(3).optional(),
          maxHeight: z.number().min(0.2).max(1).optional(),
          minZoom: z.number().min(0.3).max(1).optional(),
        })
        .strict()
        .optional(),
      with: z.record(z.string(), z.unknown()).optional(),
      still: localizedSchema.optional(),
    }),
  ]),
);
