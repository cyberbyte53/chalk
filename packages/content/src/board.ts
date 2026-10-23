import { z } from "zod";
import { jugnuNotesSchema } from "./jugnu";
import { localizedSchema } from "./localized";
import { permanentIdSchema, pieceSchema } from "./piece";

/**
 * A script: actions over time. `call` runs one action ("line.zoomTo") and finishes when the action
 * does; `wait` pauses; `seq` runs one after another ("then"); `par` runs together ("with") and
 * finishes when all do. A plain list is a `seq`.
 */
export type Script =
  | { call: string; args?: Record<string, unknown> }
  | { wait: number }
  | { seq: Script[] }
  | { par: Script[] }
  | Script[];

export const scriptSchema: z.ZodType<Script, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.union([
    z
      .object({ call: z.string().min(1), args: z.record(z.string(), z.unknown()).optional() })
      .strict(),
    z.object({ wait: z.number().positive().max(30) }).strict(),
    z.object({ seq: z.array(scriptSchema) }).strict(),
    z.object({ par: z.array(scriptSchema) }).strict(),
    z.array(scriptSchema),
  ]),
);

/**
 * IS: a prop's input is always equal to something. `to` is an expression
 * (`line.marker * line.marker`); `text` is words with {expressions} in them, per language.
 */
export const isRuleSchema = z.union([
  z.object({ set: z.string().min(1), to: z.string().min(1) }).strict(),
  z.object({ set: z.string().min(1), text: localizedSchema }).strict(),
]);
export type IsRule = z.infer<typeof isRuleSchema>;

/** WHEN: a prop's signal (and an optional condition) runs a script. */
export const whenRuleSchema = z
  .object({ on: z.string().min(1), if: z.string().min(1).optional(), do: scriptSchema })
  .strict();
export type WhenRule = z.infer<typeof whenRuleSchema>;

/** One screen: a layout tree of props, and the IS and WHEN rules that wire them. */
export const boardSchema = z.object({
  /** Unique within the lesson; free to rename. */
  name: z.string().min(1),
  /** Permanent id, assigned at publish; used in events. */
  id: permanentIdSchema.optional(),
  /** The next piece id publish will hand out on this board. */
  nextPieceId: permanentIdSchema.optional(),
  /** Ids of deleted pieces; never handed out again. */
  retiredPieceIds: z.array(permanentIdSchema).optional(),
  root: pieceSchema,
  is: z.array(isRuleSchema).default([]),
  when: z.array(whenRuleSchema).default([]),
  /**
   * Actions only the student may do on this board, as "prop.action" (taking the bulb out, when that
   * is what the board asks of them). Jugnu can never do these for them.
   */
  studentOnly: z.array(z.string()).default([]),
  /** For Jugnu: what the board is for and what its props stand for (plain English). */
  jugnu: jugnuNotesSchema.optional(),
});
export type Board = z.infer<typeof boardSchema>;

/**
 * A script argument is a plain value, or `{ "expr": "coin.count" }`: an expression worked out
 * when the call runs. Returns the expression's source, or undefined for a plain value.
 */
export function argExpression(value: unknown): string | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = (value as Record<string, unknown>).expr;
  return Object.keys(value).length === 1 && typeof source === "string" ? source : undefined;
}

/** Splits "line.zoomTo" / "guess.wrong" / "line.marker" into the prop name and the member. */
export function splitTarget(target: string): { prop: string; member: string } {
  const dot = target.indexOf(".");
  if (dot <= 0 || dot === target.length - 1) {
    throw new Error(`"${target}" should be <prop>.<name>, e.g. line.zoomTo`);
  }
  return { prop: target.slice(0, dot), member: target.slice(dot + 1) };
}
