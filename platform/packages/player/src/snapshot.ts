import { type Script, splitTarget } from "@chalk/content";
import {
  type AnyPropDef,
  BOARD,
  type BoardSnapshot,
  type BoundSnapshot,
  type CanSnapshot,
  type NodeSnapshot,
  PATH,
  type PartSnapshot,
  PropRole,
  type PropView,
  type Element as SeenElement,
  type StoredState,
  compileRule,
  compileTemplate,
  groupOf,
  layoutChildren,
  observationOfView,
  segment,
  shownOf,
} from "@chalk/prop";
import type { ZodTypeAny } from "zod";
import { inputsIn } from "./does";
import { findNode, partPathsIn } from "./part-paths";
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

/** The actions an element's control does. */
function controlActions(e: SeenElement): readonly string[] {
  return e.does === undefined ? [] : typeof e.does === "string" ? [e.does] : e.does;
}

/** A value's dotted path in a group's view as an address: "objectArrow.x" → "mirror/objectArrow.x". */
function addressIn(def: AnyPropDef, path: string, dotted: string): string {
  const [first = "", ...rest] = dotted.split(".");
  const child = groupOf(def)?.children[first] as AnyPropDef | undefined;
  if (child !== undefined && rest.length > 0)
    return addressIn(child, `${path}/${segment(first)}`, rest.join("."));
  return `${path}.${dotted}`;
}

type Context = {
  runtime: BoardRuntime;
  /** The board on the page, when there is one (the dev preview): what's drawn and where. */
  page: ParentNode | undefined;
  /** What the lesson's rules call on this node: its own action names. */
  rules: ReadonlySet<string>;
  /** Fields bound into this node, and what each is worked out from. */
  bound: ReadonlyMap<string, readonly string[]>;
  isShown: boolean;
  /** Its own actions its group turns into its own changes. */
  routed: ReadonlySet<string>;
};

function nodeOf(def: AnyPropDef, view: PropView, path: string, c: Context): NodeSnapshot {
  const group = groupOf(def);
  const problems: string[] = [];
  const seen = observationOfView(def, view);
  const fields = group !== undefined ? group.own : Object.keys(def.defaults);
  const onScreen = c.page === undefined ? undefined : findNode(c.page, path);

  // What can act on it here: its controls on screen (a leaf's), and the lesson's rules.
  const fromControls = new Map<string, string[]>();
  const parts: PartSnapshot[] = [];
  if (group === undefined)
    for (const e of seen.elements) {
      const at = `${path}/${e.id}`;
      const { id: _id, ...rest } = e;
      parts.push({ ...rest, path: at });
      for (const action of controlActions(e))
        fromControls.set(action, [...(fromControls.get(action) ?? []), at]);
    }
  // And what its inputs on the page say they do (does / says): the input is the source.
  if (group === undefined && onScreen !== undefined)
    for (const input of inputsIn(onScreen)) {
      const at = input.at ?? path;
      const known = fromControls.get(input.action) ?? [];
      if (!known.includes(at)) fromControls.set(input.action, [...known, at]);
    }

  // A field is live when something here can change it: what a control or rule does (its declared
  // changes), a route into its group, a question's own bookkeeping.
  const live = new Set<string>();
  const reachable = new Set([...fromControls.keys(), ...c.rules]);
  for (const action of reachable) {
    const spec = def.actions[action];
    if (spec === undefined) continue;
    if (spec.changes === undefined) {
      problems.push(`${action} doesn't declare what it changes: every field counted as live`);
      for (const f of fields) live.add(f);
    } else for (const f of spec.changes) live.add(f);
  }
  if (def.role === PropRole.Question)
    for (const f of ["status", "attempts", "feedback"]) live.add(f);
  if (group !== undefined && group.routes.length > 0) for (const f of fields) live.add(f);

  const shown = fields;
  const setup: Record<string, unknown> = {};
  const liveValues: Record<string, unknown> = {};
  const bound: Record<string, BoundSnapshot> = {};
  for (const f of shown) {
    const sources = c.bound.get(f);
    if (sources !== undefined) bound[f] = { value: view[f], from: sources };
    else (live.has(f) ? liveValues : setup)[f] = view[f];
  }
  for (const [d, spec] of Object.entries(def.derived ?? {})) {
    if (group !== undefined) {
      liveValues[d] = view[d];
      continue;
    }
    const reads = fieldsRead(spec.compute as (s: StoredState) => unknown, view as StoredState);
    if (reads.some((f) => live.has(f) || c.bound.has(f))) liveValues[d] = view[d];
  }

  // What can be done to it: each action once, with who does it and the controls that reach it.
  const can: CanSnapshot[] = [...reachable].map((action) => {
    const spec = def.actions[action];
    const via = fromControls.get(action) ?? [];
    if (via.length > 0 && spec?.byLearner !== true)
      problems.push(`${via.join(", ")} does ${action}, which isn't marked byLearner`);
    const who: ("learner" | "lesson")[] = [
      ...(via.length > 0 ? (["learner"] as const) : []),
      ...(c.rules.has(action) ? (["lesson"] as const) : []),
    ];
    return {
      action,
      takes: spec === undefined ? "?" : takes(spec.args as ZodTypeAny),
      who,
      via,
      ...(c.routed.has(action) ? { routed: true as const } : {}),
    };
  });
  // The learner's actions no control offers right now (a button that's off until there are dots).
  const noControlNow =
    group !== undefined
      ? []
      : Object.entries(def.actions)
          .filter(([a, spec]) => spec.byLearner === true && !fromControls.has(a))
          .map(([a]) => a);

  // Drawn must equal described, for props that describe themselves. A part `locate` finds counts.
  const describesItself = def.observe !== undefined || def.anatomy !== undefined;
  if (
    onScreen !== undefined &&
    group === undefined &&
    describesItself &&
    def.role !== PropRole.Question
  ) {
    const drawn = partPathsIn(onScreen);
    const width = Math.round(onScreen.getBoundingClientRect().width);
    const described = new Set(parts.map((p) => p.path.slice(path.length + 1)));
    for (const p of parts) {
      const id = p.path.slice(path.length + 1);
      const el = drawn.get(id);
      const code = el?.getAttribute("data-code");
      if (code) p.drawnAt = code;
      if (el === undefined && def.locate?.(view as never, id, width) === undefined)
        problems.push(`${id} is described but not drawn (no data-part)`);
    }
    for (const id of drawn.keys())
      if (!described.has(id)) problems.push(`${id} is drawn but not described`);
  }

  // A group's children, each a node of its own with what the group binds into it.
  const children: NodeSnapshot[] = [];
  if (group !== undefined) {
    const showing = shownOf(view) ?? {};
    for (const name of layoutChildren(group.layout)) {
      const childView = view[name];
      if (childView === null || childView === undefined) continue;
      const childDef = group.children[name] as AnyPropDef;
      const childPath = `${path}/${segment(name)}`;
      const tree = group.boundTree[name] ?? {};
      const boundHere = new Map<string, readonly string[]>();
      for (const [field, sub] of Object.entries(tree))
        if (sub === true)
          boundHere.set(
            field,
            (group.sources[name] ?? []).map((d) => addressIn(def, path, d)),
          );
      const prefix = `${name}.`;
      const own = (names: Iterable<string>) =>
        new Set([...names].filter((n) => n.startsWith(prefix)).map((n) => n.slice(prefix.length)));
      children.push(
        nodeOf(childDef, childView as PropView, childPath, {
          ...c,
          rules: own(c.rules),
          bound: boundHere,
          isShown: showing[name] !== false,
          routed: own(group.routes),
        }),
      );
    }
  }

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
    ...(children.length > 0 ? { children } : {}),
    ...(describesItself && noControlNow.length > 0 ? { noControlNow } : {}),
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
    const bound = new Map<string, readonly string[]>();
    for (const rule of board.is) {
      const { prop, member } = splitTarget(rule.set);
      if (prop !== name) continue;
      const refs =
        "to" in rule
          ? compileRule(rule.to, (n) => runtime.getView(n)).refs
          : Object.values(rule.text).flatMap((t) => compileTemplate(t).refs);
      bound.set(member, [...new Set(refs.map((r) => `${r[0]}.${r.slice(1).join(".")}`))]);
    }
    return nodeOf(def, runtime.getView(name), segment(name), {
      runtime,
      page,
      rules: new Set(
        ruleCalls.filter((c) => c.startsWith(prefix)).map((c) => c.slice(prefix.length)),
      ),
      bound,
      isShown: !runtime.isHidden(name),
      routed: new Set(),
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
