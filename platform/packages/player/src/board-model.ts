import type { Script } from "@chalk/content";
import {
  type AnyPropDef,
  BOARD,
  PATH,
  PropRole,
  type Element as SeenElement,
  type StoredState,
  compositeOf,
  hostOf,
  observationOfView,
} from "@chalk/prop";
import type { ZodTypeAny } from "zod";
import { partPathsIn } from "./part-paths";
import type { BoardRuntime } from "./runtime";

/**
 * The board as an agent (or Jugnu) should read it: every piece, what was fixed where it was placed
 * (setup) and what can change on this board (live), each thing on screen with its typed value, the
 * words the screen shows, the action it does and where it's drawn, and what the student can do with
 * its limits. Made from the prop definitions and the running board: nothing is written by hand.
 */
export type BoardModel = {
  board: string;
  isPassed: boolean;
  isQuestionOpen: boolean;
  pieces: PieceModel[];
};

export type PieceModel = {
  name: string;
  prop: string;
  isShown: boolean;
  /** One line, from the prop. */
  summary: string;
  /** For a host: its layers showing something now. */
  layers?: string[];
  /** For a composite: its children, top to bottom, with their props. */
  children?: { name: string; prop: string }[];
  /** Stored fields fixed where it was placed: nothing on this board changes them. */
  setup: Record<string, unknown>;
  /** Stored fields something on this board can change (the learner, a rule, an IS), and derived values that follow them. */
  live: Record<string, unknown>;
  elements: ElementModel[];
  /** What the student can do here: each action a control on screen does, with what it takes. */
  studentCan: { action: string; via: string[]; takes: unknown }[];
  /** The learner's actions no control on screen offers right now. */
  noControlNow?: string[];
  /** What the prop knows that the screen doesn't show. */
  hidden?: Readonly<Record<string, unknown>>;
  /** Where the description and the screen disagree, and other gaps. */
  problems: string[];
};

export type ElementModel = SeenElement & {
  /** Where its drawing is written: file:line (the dev preview only). */
  drawnAt?: string;
};

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

/** The actions a piece's control does, as the piece's own (a composite's child's routed up). */
function controlActions(def: AnyPropDef, view: StoredState, e: SeenElement): string[] {
  const does = e.does === undefined ? [] : typeof e.does === "string" ? [e.does] : e.does;
  const layout = compositeOf(def);
  return does.flatMap((d) => {
    const at = d.lastIndexOf(PATH);
    if (at < 0) return [d];
    const routed = layout?.route(view, d.slice(0, at), d.slice(at + PATH.length), {})?.[0];
    return routed === undefined ? [] : [routed];
  });
}

export function pieceModel(
  runtime: BoardRuntime,
  name: string,
  /** The piece on screen, when there is one: what's drawn, and where in the code. */
  onScreen?: Element | null,
): PieceModel {
  const def = runtime.getDef(name);
  // Its fields with what the board binds into them, and its view.
  const stored = runtime.getFields(name);
  const view = runtime.getView(name);
  const seen = observationOfView(def, view);
  const problems: string[] = [];
  const board = runtime.board;

  // What can act on this piece here: its controls on screen, the lesson's WHEN scripts, IS rules.
  const fromControls = new Map<string, string[]>();
  for (const e of seen.elements) {
    for (const action of controlActions(def, stored, e))
      fromControls.set(action, [...(fromControls.get(action) ?? []), e.id]);
  }
  const fromRules = new Set(
    board.when
      .flatMap((r) => calls(r.do))
      .filter((c) => c.startsWith(`${name}.`))
      .map((c) => c.slice(name.length + 1)),
  );
  const owned = new Set(
    board.is.filter((r) => r.set.startsWith(`${name}.`)).map((r) => r.set.slice(name.length + 1)),
  );
  const liveFields = new Set(owned);
  for (const action of new Set([...fromControls.keys(), ...fromRules])) {
    const spec = def.actions[action];
    if (spec === undefined) continue;
    if (spec.changes === undefined) {
      problems.push(`${action} doesn't declare what it changes: every field counted as live`);
      for (const f of Object.keys(stored)) liveFields.add(f);
    } else for (const f of spec.changes) liveFields.add(f);
  }
  // The question's own bookkeeping changes as the student answers.
  if (def.role === PropRole.Question)
    for (const f of ["status", "attempts", "feedback"]) liveFields.add(f);

  const host = hostOf(def);
  const on = host?.layersOn(stored);
  const shownFields =
    host === undefined
      ? Object.keys(stored)
      : Object.keys(stored).filter((f) => {
          const owner = host.ownerOf(f);
          return owner === undefined || (on ?? []).includes(owner) || liveFields.has(f);
        });
  const setup: Record<string, unknown> = {};
  const live: Record<string, unknown> = {};
  for (const f of shownFields) (liveFields.has(f) ? live : setup)[f] = stored[f];
  for (const [d, spec] of Object.entries(def.derived ?? {})) {
    const reads = fieldsRead(spec.compute as (s: StoredState) => unknown, stored);
    if (reads.some((f) => liveFields.has(f))) live[d] = view[d];
  }

  const studentCan = [...fromControls].map(([action, via]) => {
    const spec = def.actions[action];
    if (spec?.byLearner !== true)
      problems.push(`${via.join(", ")} does ${action}, which isn't marked byLearner`);
    return { action, via, takes: spec === undefined ? "?" : takes(spec.args as ZodTypeAny) };
  });
  // The learner's actions no control offers right now (a button that's off until there are dots).
  // (A host's layers that are off don't count: their controls aren't meant to be there.)
  const hostOn = hostOf(def);
  const layersNow = hostOn?.layersOn(stored) ?? [];
  const noControlNow = Object.entries(def.actions)
    .filter(([a, spec]) => {
      if (spec.byLearner !== true || fromControls.has(a)) return false;
      const owner = hostOn?.ownerOf(a);
      return owner === undefined || layersNow.includes(owner);
    })
    .map(([a]) => a);

  const elements: ElementModel[] = seen.elements.map((e) => ({ ...e }));
  // Drawn must equal described, for props that describe themselves (the default description is
  // just their fields). A part `locate` can find counts as drawn, without a code path.
  if (onScreen != null && def.observe !== undefined && def.role !== PropRole.Question) {
    const drawn = partPathsIn(onScreen);
    const width = Math.round(onScreen.getBoundingClientRect().width);
    const described = new Set(elements.map((e) => e.id));
    for (const e of elements) {
      const el = drawn.get(e.id);
      const code = el?.getAttribute("data-code");
      if (code) e.drawnAt = code;
      if (el === undefined && def.locate?.(view as never, e.id, width) === undefined)
        problems.push(`${e.id} is described but not drawn (no data-part)`);
    }
    for (const path of drawn.keys())
      if (!described.has(path)) problems.push(`${path} is drawn but not described`);
  }

  const layout = compositeOf(def);
  return {
    name,
    prop: def.type,
    isShown: !runtime.isHidden(name),
    summary: seen.summary,
    ...(on !== undefined ? { layers: on } : {}),
    ...(layout !== undefined
      ? {
          children: layout.children.map((c) => ({ name: c, prop: layout.childOf(c).def.type })),
        }
      : {}),
    setup,
    live,
    elements,
    studentCan,
    ...(def.observe !== undefined && noControlNow.length > 0 ? { noControlNow } : {}),
    ...(seen.hidden !== undefined ? { hidden: seen.hidden } : {}),
    problems,
  };
}

/** The whole board. `screen` finds a piece's element on the page, when there is a page. */
export function boardModel(
  runtime: BoardRuntime,
  screen?: (piece: string) => Element | null,
): BoardModel {
  return {
    board: runtime.board.name,
    isPassed: runtime.getStored(BOARD).isPassed === true,
    isQuestionOpen: runtime.hasOpenQuestion(),
    pieces: runtime.propNames().map((name) => pieceModel(runtime, name, screen?.(name))),
  };
}
