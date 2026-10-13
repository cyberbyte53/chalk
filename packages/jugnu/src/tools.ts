import { Actor } from "@chalk/content";
import {
  type AnyPropDef,
  EffectKind,
  PropRole,
  QuestionAction,
  type StoredState,
  compileExpression,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import type { z } from "zod";
import type { HeardAction, JugnuBoard } from "./board";
import type { ToolSpec } from "./provider";
import { jsonSchemaOf } from "./schema";

/** Jugnu's own tools; every other tool is one of a prop's actions, named `<prop>__<action>`. */
export const JugnuTool = {
  Point: "point",
  Calculate: "calculate",
  WaitForStudent: "wait_for_student",
} as const;

const SEPARATOR = "__";

/** What one tool call did, for the chat, the logs and the test bench. */
export type JugnuStep =
  | {
      kind: "act";
      prop: string;
      action: string;
      args: unknown;
      /** Why it didn't happen (a hard limit, bad arguments); absent when it did. */
      refused?: string;
      /** What changed on the board, prop by prop, field by field. */
      changed?: Record<string, Record<string, unknown>>;
      /** It would have answered the question for the student, so the board was put back. */
      isUndone?: boolean;
    }
  | { kind: "point"; prop: string; part?: string; refused?: string }
  | { kind: "calculate"; expression: string; result?: number | string | boolean; refused?: string }
  | { kind: "wait"; watch: string[] }
  | { kind: "unknown"; name: string; refused: string };

/** The tools Jugnu has on this board right now: each allowed action, plus point, calculate, wait. */
export function toolsFor(board: JugnuBoard): ToolSpec[] {
  const shown = board.propNames().filter((name) => !board.isHidden(name));
  const tools: ToolSpec[] = [];
  for (const name of shown) {
    const def = board.getDef(name);
    for (const [action, spec] of Object.entries(def.actions)) {
      if (board.whyNotJugnu(name, action) !== undefined) continue;
      const parameters = jsonSchemaOf(spec.args as z.ZodTypeAny);
      tools.push({
        name: `${name}${SEPARATOR}${action}`,
        description: `${name} (${def.type}): ${spec.describe}`,
        parameters: parameters.type === "object" ? parameters : { type: "object", properties: {} },
      });
    }
  }
  tools.push(
    {
      name: JugnuTool.Point,
      description:
        "Make a prop, or one named part of it, glow so the student looks there. Changes nothing on the board.",
      parameters: {
        type: "object",
        properties: {
          prop: { type: "string", enum: shown },
          part: {
            type: "string",
            description: "One of the prop's parts; leave out for the whole prop",
          },
        },
        required: ["prop"],
        additionalProperties: false,
      },
    },
    {
      name: JugnuTool.Calculate,
      description:
        "Work out an exact number. Operators + - * / ^ and brackets; functions sqrt, abs, round, floor, ceil, min, max; comparisons < <= > >= == !=. Board values by name, e.g. line.marker * line.marker. Use it for every number you didn't read off the board.",
      parameters: {
        type: "object",
        properties: { expression: { type: "string" } },
        required: ["expression"],
        additionalProperties: false,
      },
    },
    {
      name: JugnuTool.WaitForStudent,
      description:
        "Hand the board back: it's the student's turn to act. Call it last, after asking them to do something. When they act on a prop you watch, you'll be told and can continue.",
      parameters: {
        type: "object",
        properties: { watch: { type: "array", items: { type: "string", enum: shown } } },
        required: ["watch"],
        additionalProperties: false,
      },
    },
  );
  return tools;
}

const viewsOf = (board: JugnuBoard, names: readonly string[]) =>
  new Map(names.map((name) => [name, viewOf(board.getDef(name), board.getStored(name))]));

/** Fields whose value differs between two moments, prop by prop. */
function changes(
  before: Map<string, Record<string, unknown>>,
  after: Map<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [name, view] of after) {
    const old = before.get(name) ?? {};
    for (const [field, value] of Object.entries(view)) {
      if (JSON.stringify(old[field]) === JSON.stringify(value)) continue;
      out[name] ??= {};
      (out[name] as Record<string, unknown>)[field] =
        typeof value === "number" ? Number(value.toPrecision(10)) : value;
    }
  }
  return out;
}

/** True if pressing Check on this question now would count as correct (worked out, not run). */
export function wouldPass(def: AnyPropDef, stored: StoredState): boolean {
  if (def.role !== PropRole.Question) return false;
  const prepared = prepareAction(def, stored, QuestionAction.Check, {});
  return (
    prepared.isOk &&
    prepared.effect.kind === EffectKind.Set &&
    prepared.effect.set.status === "correct"
  );
}

const questionsThatWouldPass = (board: JugnuBoard) =>
  new Set(
    board
      .propNames()
      .filter((name) => board.getStored(name).status !== "correct")
      .filter((name) => wouldPass(board.getDef(name), board.getStored(name))),
  );

/** Runs one of a prop's actions as Jugnu, through the one door, and reports what happened. */
async function act(
  board: JugnuBoard,
  prop: string,
  action: string,
  args: Record<string, unknown>,
): Promise<JugnuStep> {
  const step: JugnuStep = { kind: "act", prop, action, args };
  const why = board.whyNotJugnu(prop, action);
  if (why !== undefined) return { ...step, refused: why };
  const names = board.propNames();
  const before = viewsOf(board, names);
  const snapshot = board.snapshot();
  const passingBefore = questionsThatWouldPass(board);
  // Anything refused while this runs (the action itself, or what it sets off) is heard here.
  const refusals: string[] = [];
  const stop = board.onAction((heard: HeardAction) => {
    if (heard.actor === Actor.Jugnu && heard.refused !== undefined)
      refusals.push(`${heard.prop}.${heard.action}: ${heard.refused}`);
  });
  try {
    await board.perform({ call: `${prop}.${action}`, args }, Actor.Jugnu);
  } finally {
    stop();
  }
  const solved = [...questionsThatWouldPass(board)].filter((name) => !passingBefore.has(name));
  if (solved.length > 0) {
    board.restore(snapshot);
    return {
      ...step,
      isUndone: true,
      refused: `that put the board into the answer for ${solved.join(", ")}, so it was put back: the student must get there themselves`,
    };
  }
  const changed = changes(before, viewsOf(board, names));
  return refusals.length > 0
    ? { ...step, refused: refusals.join(" | "), changed }
    : { ...step, changed };
}

/** Runs one tool call. Returns the step, and the text the model gets back as the tool's result. */
export async function runTool(
  board: JugnuBoard,
  name: string,
  args: Record<string, unknown> | undefined,
): Promise<{ step: JugnuStep; result: string }> {
  const reply = (step: JugnuStep, result: unknown) => ({ step, result: JSON.stringify(result) });
  if (args === undefined) {
    const step: JugnuStep = { kind: "unknown", name, refused: "arguments weren't valid JSON" };
    return reply(step, { error: step.refused });
  }
  switch (name) {
    case JugnuTool.Point: {
      const prop = String(args.prop ?? "");
      const part = typeof args.part === "string" && args.part !== "" ? args.part : undefined;
      if (!board.propNames().includes(prop) || board.isHidden(prop)) {
        const step: JugnuStep = { kind: "point", prop, refused: `no prop "${prop}" is shown` };
        return reply(step, { error: step.refused });
      }
      if (part !== undefined) {
        const def = board.getDef(prop);
        const parts = def.parts?.({ ...viewOf(def, board.getStored(prop)) } as never) ?? [];
        if (!parts.includes(part)) {
          const refused = `${prop} has no part "${part}" (parts: ${parts.join(", ") || "none"})`;
          return reply({ kind: "point", prop, part, refused }, { error: refused });
        }
        return reply({ kind: "point", prop, part }, { ok: `${prop}.${part} is glowing` });
      }
      return reply({ kind: "point", prop }, { ok: `${prop} is glowing` });
    }
    case JugnuTool.Calculate: {
      const expression = String(args.expression ?? "");
      try {
        const value = compileExpression(expression).evaluate((prop) =>
          viewOf(board.getDef(prop), board.getStored(prop)),
        );
        if (typeof value !== "number" && typeof value !== "boolean" && typeof value !== "string")
          throw new Error("that isn't a number");
        const result = typeof value === "number" ? Number(value.toPrecision(12)) : value;
        return reply({ kind: "calculate", expression, result }, { result });
      } catch (error) {
        const refused = error instanceof Error ? error.message : String(error);
        return reply({ kind: "calculate", expression, refused }, { error: refused });
      }
    }
    case JugnuTool.WaitForStudent: {
      const shown = board.propNames().filter((prop) => !board.isHidden(prop));
      const watch = (Array.isArray(args.watch) ? args.watch : [])
        .map(String)
        .filter((prop) => shown.includes(prop));
      return reply(
        { kind: "wait", watch },
        { ok: "Your turn ends here. You'll hear what the student does." },
      );
    }
  }
  const at = name.indexOf(SEPARATOR);
  const prop = at > 0 ? name.slice(0, at) : "";
  const action = at > 0 ? name.slice(at + SEPARATOR.length) : "";
  if (!board.propNames().includes(prop) || board.getDef(prop).actions[action] === undefined) {
    const step: JugnuStep = { kind: "unknown", name, refused: `there is no tool "${name}"` };
    return reply(step, { error: step.refused });
  }
  const step = await act(board, prop, action, args);
  if (step.kind !== "act") return reply(step, {});
  return reply(
    step,
    step.refused !== undefined
      ? { refused: step.refused, ...(step.changed ? { changed: step.changed } : {}) }
      : { ok: true, changed: step.changed ?? {} },
  );
}
