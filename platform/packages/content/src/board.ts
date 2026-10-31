import type { AnyProp, Given } from "@chalk/prop/next";
import { z } from "zod";
import type { Effect } from "./audio";
import { jugnuNotesSchema } from "./jugnu";
import type { Localized } from "./localized";
import { pieceSchema } from "./piece";

/**
 * A script: actions over time. `call` runs one action ("line.zoomTo") and finishes when the action
 * does; `wait` pauses; `seq` runs one after another ("then"); `par` runs together ("with") and
 * finishes when all do. A plain list is a `seq`.
 */
export type Script =
  | { call: string; args?: CallArgs }
  | { wait: number }
  | { seq: Script[] }
  | { par: Script[] }
  | Script[];

/**
 * A call's arguments: plain values, or a function of the board worked out when the call runs
 * (`(at) => ({ to: at(coin).count })`).
 */
export type CallArgs = Record<string, unknown> | ((at: BoardAt) => Record<string, unknown>);

const callArgsSchema = z.union([
  z.record(z.string(), z.unknown()),
  z.custom<(at: BoardAt) => Record<string, unknown>>((value) => typeof value === "function", {
    message: "should be values, or a function of the board",
  }),
]);

export const scriptSchema: z.ZodType<Script, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.union([
    z.object({ call: z.string().min(1), args: callArgsSchema.optional() }).strict(),
    z.object({ wait: z.number().positive().max(30) }).strict(),
    z.object({ seq: z.array(scriptSchema) }).strict(),
    z.object({ par: z.array(scriptSchema) }).strict(),
    z.array(scriptSchema),
  ]),
);

/** How a rule reads the board: `at(piece)` is that piece's view (its stored and derived fields). */
export type BoardAt = (
  piece: string | { readonly name: string },
) => Readonly<Record<string, unknown>>;

/**
 * A rule's value or condition: code, a function of the board (`(at) => at(race).time > 36`). Authors
 * write it typed (@chalk/author's `Rule`); the board keeps it as this.
 */
export type RuleFn = (at: BoardAt) => unknown;

const ruleFnSchema = z.custom<RuleFn>((value) => typeof value === "function", {
  message: "should be a function of the board",
});

/** IS: one of a prop's inputs ("box.text") is always what a rule of the board works out. */
export const isRuleSchema = z.object({ set: z.string().min(1), to: ruleFnSchema }).strict();
export type IsRule = z.infer<typeof isRuleSchema>;

/** WHEN: a prop's signal (and, if given, a condition on the board) runs a script. */
export const whenRuleSchema = z
  .object({ on: z.string().min(1), if: ruleFnSchema.optional(), do: scriptSchema })
  .strict();
export type WhenRule = z.infer<typeof whenRuleSchema>;

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

/** One node of a board as plain facts: its stored facts, and whether the learner touched it. */
export const savedNodeSchema = z
  .object({ facts: z.record(z.string(), z.unknown()), isTouched: z.boolean() })
  .strict();
export type SavedNode = z.infer<typeof savedNodeSchema>;

/**
 * A board as plain facts, each node by its address (the phone's board sent to Jugnu's server).
 * Written and read by one function each (the runtime's save and load); load checks every node's
 * facts against its prop.
 */
export const savedBoardSchema = z.record(z.string(), savedNodeSchema);
export type SavedBoard = z.infer<typeof savedBoardSchema>;

/** One screen: a layout tree of props, and the IS and WHEN rules that wire them. */
export const boardSchema = z.object({
  /** Unique within the lesson; free to rename. */
  name: z.string().min(1),
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
  /**
   * The built item it was made from (build/<path>, at that version): where any copy of the board,
   * on the phone or on the server, is made again from its code.
   */
  item: itemRefSchema.optional(),
  /**
   * A board on the event model (platform/docs/event-model.md): the scene, the outermost prop, whose
   * children are the pieces (`root` lays them out), and what each piece starts with. Its rules are
   * the scene's own; `is` and `when` stay empty.
   */
  model: z
    .custom<SceneModel>(
      (v) => typeof v === "object" && v !== null && "scene" in v,
      "should be a scene and its pieces' setup",
    )
    .optional(),
});
export type Board = z.infer<typeof boardSchema>;

/**
 * A board on the event model: its scene, what each piece starts with, and its lines
 * (platform/docs/sound.md): the lesson's own words for a piece, and its narration lines (said by
 * rules), each with who says it. A piece without its own words says what it says itself.
 */
export type SceneModel = {
  readonly scene: AnyProp;
  readonly given: Given;
  readonly lines: Readonly<Record<string, SceneLine>>;
  /** The narration lines' names, in the order written. */
  readonly freeLines: readonly string[];
  /**
   * The lesson's effects, by the signal they sound at ("line.walker.stepped"): added to its pieces'
   * own, or replacing them; null silences one.
   */
  readonly effects?: Readonly<Record<string, Effect | null>>;
};

/**
 * A line's words (per language) and who says them (words left out: the piece says its own); for a
 * line of its own, its moment (a piece's signal, "town.walker.arrived") and the piece it is about.
 */
export type SceneLine = {
  readonly says?: Localized;
  readonly speaker?: string;
  readonly when?: string;
  /** The values its moment's signal must carry. */
  readonly where?: Readonly<Record<string, unknown>>;
  /** Its moment also has a condition in code (only shown as such). */
  readonly hasCondition?: true;
  readonly about?: string;
};

/** Splits "line.zoomTo" / "guess.wrong" / "line.marker" into the prop name and the member. */
export function splitTarget(target: string): { prop: string; member: string } {
  const dot = target.indexOf(".");
  if (dot <= 0 || dot === target.length - 1) {
    throw new Error(`"${target}" should be <prop>.<name>, e.g. line.zoomTo`);
  }
  return { prop: target.slice(0, dot), member: target.slice(dot + 1) };
}
