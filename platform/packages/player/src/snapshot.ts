import type { ZodTypeAny } from "zod";
import type { BoardRuntime } from "./runtime";

/**
 * The one snapshot (see @chalk/prop's snapshot.ts): every node by address, its setup, live and
 * bound values, its parts and what can be done to it. The chalk MCP (look, play), Jugnu and tests read this.
 */

/** Every board running on the page, newest last (the dev preview reads it). */
const running = new Set<BoardRuntime>();
const watchers = new Set<(runtime: BoardRuntime) => void>();
export function trackBoard(runtime: BoardRuntime): () => void {
  running.add(runtime);
  for (const watch of watchers) watch(runtime);
  return () => running.delete(runtime);
}
/** Called with each board as it starts running (the dev preview watches what its rules do). */
export function onBoardRunning(watch: (runtime: BoardRuntime) => void): () => void {
  watchers.add(watch);
  return () => watchers.delete(watch);
}
export function runningBoards(): BoardRuntime[] {
  return [...running];
}

/** What an action takes, from its argument schema, in a few words per field. */
export function takes(schema: ZodTypeAny): unknown {
  const def = schema._def as { typeName?: string } & Record<string, unknown>;
  switch (def.typeName) {
    case "ZodObject": {
      const shape = (schema as unknown as { shape: Record<string, ZodTypeAny> }).shape;
      return Object.fromEntries(Object.entries(shape).map(([k, v]) => [k, takes(v)]));
    }
    case "ZodNumber": {
      const checks = (def.checks ?? []) as { kind: string; value?: number }[];
      const min = checks.find((c) => c.kind === "min")?.value;
      const max = checks.find((c) => c.kind === "max")?.value;
      const isInt = checks.some((c) => c.kind === "int");
      return `${isInt ? "whole number" : "number"}${min !== undefined || max !== undefined ? ` ${min ?? "…"} to ${max ?? "…"}` : ""}`;
    }
    case "ZodLiteral":
      return def.value;
    case "ZodUnion":
      return (def.options as ZodTypeAny[]).map(takes);
    case "ZodEnum":
      return def.values;
    case "ZodNativeEnum":
      return Object.values(def.values as object);
    case "ZodOptional":
      return { optional: takes(def.innerType as ZodTypeAny) };
    case "ZodNullable":
      return { orNull: takes(def.innerType as ZodTypeAny) };
    case "ZodArray":
      return [takes(def.type as ZodTypeAny)];
    case "ZodBoolean":
      return "true or false";
    case "ZodString":
      return "text";
    case "ZodEffects":
      return takes(def.schema as ZodTypeAny);
    default:
      return def.typeName ?? "?";
  }
}
