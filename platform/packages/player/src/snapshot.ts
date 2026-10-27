import { type Script, splitTarget } from "@chalk/content";
import {
  type AnyPropDef,
  BOARD,
  type BoardSnapshot,
  type BoundSnapshot,
  type CanSnapshot,
  type NodeSnapshot,
  type Observation,
  type PartSnapshot,
  PropRole,
  type PropView,
  type Element as SeenElement,
  type StoredState,
  hostOf,
  segment,
} from "@chalk/prop";
import type { ZodTypeAny } from "zod";
import { findNode } from "./part-paths";
import type { BoardRuntime } from "./runtime";

/**
 * The one snapshot (see @chalk/prop's snapshot.ts): every node by address, its setup, live and
 * bound values, its parts and what can be done to it. The chalk MCP (look, play), Jugnu and tests read this.
 */

/** Every board running on the page, newest last (the dev preview reads it). */
const running = new Set<BoardRuntime>();
export function trackBoard(runtime: BoardRuntime): () => void {
  running.add(runtime);
  return () => running.delete(runtime);
}
export function runningBoards(): BoardRuntime[] {
  return [...running];
}

/** Every `call` target in a script. */
function calls(script: Script): string[] {
  if (Array.isArray(script)) return script.flatMap(calls);
  if ("seq" in script) return script.seq.flatMap(calls);
  if ("par" in script) return script.par.flatMap(calls);
  if ("wait" in script) return [];
  return [script.call];
}

/** The stored fields a derived value reads, found by running it on a state that notes each read. */
export function fieldsRead(compute: (s: StoredState) => unknown, stored: StoredState): string[] {
  const read = new Set<string>();
  const watched = new Proxy(stored as Record<string, unknown>, {
    get: (target, key) => {
      if (typeof key === "string") read.add(key);
      return target[key as string];
    },
  });
  try {
    compute(watched);
  } catch {}
  return [...read].filter((k) => k in stored);
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

/** The actions a part does, when it's an input that's on. */
function controlActions(e: SeenElement): readonly string[] {
  return e.does === undefined ? [] : typeof e.does === "string" ? [e.does] : e.does;
}

type Context = {
  /** The board on the page, when there is one (the dev preview): where each part's drawing is written. */
  page: ParentNode | undefined;
  /** What the lesson's rules call on this node: its own action names. */
  rules: ReadonlySet<string>;
  /** Fields bound into this node, and what each is worked out from. */
  bound: ReadonlyMap<string, readonly string[]>;
  isShown: boolean;
};

/** One placed prop as agents read it: what it shows and does (from its view), its values, what can act on it. */
function nodeOf(
  def: AnyPropDef,
  view: PropView,
  seen: Observation,
  path: string,
  c: Context,
): NodeSnapshot {
  // A host's layers that are off show nothing: their fields and controls aren't meant to be there.
  const host = hostOf(def);
  const layersOn = host?.layersOn(view as StoredState) ?? [];
  const isOff = (name: string) => {
    const owner = host?.ownerOf(name);
    return owner !== undefined && !layersOn.includes(owner);
  };
  const fields = Object.keys(def.defaults);

  // Its parts, as its view draws them, and which inputs do each action.
  const fromControls = new Map<string, string[]>();
  const parts: PartSnapshot[] = seen.elements.map((e) => {
    const at = `${path}/${segment(e.id)}`;
    for (const action of controlActions(e))
      fromControls.set(action, [...(fromControls.get(action) ?? []), at]);
    const { id: _id, ...rest } = e;
    const drawnAt =
      c.page === undefined ? undefined : findNode(c.page, at)?.getAttribute("data-code");
    return { ...rest, path: at, ...(drawnAt ? { drawnAt } : {}) };
  });

  // A field is live when something here can change it: what an input or a rule does (its declared
  // changes), a question's own bookkeeping.
  const live = new Set<string>();
  const reachable = new Set([...fromControls.keys(), ...c.rules]);
  for (const action of reachable) for (const f of def.actions[action]?.changes ?? []) live.add(f);
  if (def.role === PropRole.Question)
    for (const f of ["status", "attempts", "feedback"]) live.add(f);

  const setup: Record<string, unknown> = {};
  const liveValues: Record<string, unknown> = {};
  const bound: Record<string, BoundSnapshot> = {};
  for (const f of fields) {
    if (isOff(f) && !live.has(f)) continue;
    const sources = c.bound.get(f);
    if (sources !== undefined) bound[f] = { value: view[f], from: sources };
    else (live.has(f) ? liveValues : setup)[f] = view[f];
  }
  for (const [d, spec] of Object.entries(def.derived ?? {})) {
    const reads = fieldsRead(spec.compute as (s: StoredState) => unknown, view as StoredState);
    if (reads.some((f) => live.has(f) || c.bound.has(f))) liveValues[d] = view[d];
  }

  // What can be done to it: each action once, with who does it and the inputs that reach it.
  const problems: string[] = [];
  const can: CanSnapshot[] = [...reachable].map((action) => {
    const spec = def.actions[action];
    const via = fromControls.get(action) ?? [];
    if (via.length > 0 && spec?.byLearner !== true)
      problems.push(`${via.join(", ")} does ${action}, which isn't marked byLearner`);
    const who: ("learner" | "lesson")[] = [
      ...(via.length > 0 ? (["learner"] as const) : []),
      ...(c.rules.has(action) ? (["lesson"] as const) : []),
    ];
    return { action, takes: spec === undefined ? "?" : takes(spec.args as ZodTypeAny), who, via };
  });
  // The learner's actions no input offers right now (a button that's off until there are dots).
  const noControlNow = Object.entries(def.actions)
    .filter(([a, spec]) => spec.byLearner === true && !fromControls.has(a) && !isOff(a))
    .map(([a]) => a);

  return {
    path,
    prop: def.type,
    isShown: c.isShown,
    summary: seen.summary,
    setup,
    live: liveValues,
    bound,
    parts,
    can,
    ...(seen.hidden !== undefined ? { hidden: seen.hidden } : {}),
    ...(noControlNow.length > 0 ? { noControlNow } : {}),
    problems,
  };
}

/** The whole board as agents read it. `page`: the board on screen, when there is one. */
export function snapshotOf(runtime: BoardRuntime, page?: ParentNode): BoardSnapshot {
  const board = runtime.board;
  const ruleCalls = board.when.flatMap((r) => calls(r.do));
  const nodes = runtime.propNames().map((name) => {
    const def = runtime.getDef(name);
    const prefix = `${name}.`;
    // What each bound field's rule read when it last ran.
    const bound = runtime.boundReads(name);
    return nodeOf(def, runtime.getView(name), runtime.describe(name), segment(name), {
      page,
      rules: new Set(
        ruleCalls.filter((c) => c.startsWith(prefix)).map((c) => c.slice(prefix.length)),
      ),
      bound,
      isShown: !runtime.isHidden(name),
    });
  });
  const open = runtime
    .propNames()
    .find(
      (n) =>
        runtime.getDef(n).role === PropRole.Question && runtime.getView(n).status !== "correct",
    );
  return {
    board: board.name,
    isPassed: runtime.getView(BOARD).isPassed === true,
    ...(open !== undefined ? { openQuestion: segment(open) } : {}),
    nodes,
  };
}
