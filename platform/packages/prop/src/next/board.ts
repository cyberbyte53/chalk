import type { ZodType } from "zod";
import { joinPath } from "../address";
import {
  type AnyProp,
  Ease,
  type Out,
  type Outs,
  type Payload,
  type ReaderOf,
  keysOf,
} from "./define";
import { type Move, moveAt } from "./move";
import { type Entry, TimeQueue } from "./queue";

/**
 * A board running: the tree of props and their variables, one door every event goes through
 * (`deliver`), the queue of what is due later, and the board's clock.
 *
 * - An action goes to one prop; a signal goes up, to every prop holding the one that told it (the
 *   nearest first) that has a rule for it.
 * - An event sent while another is handled runs at once, like a function call: it finishes, with
 *   everything it causes, before the next one starts. A chain that comes back round is stopped.
 * - "Later" waits in the queue; `advanceTo` moves the clock and delivers what falls due. Nothing
 *   reads real time: the screen moves the clock each frame, a check jumps it (`runUntilIdle`).
 */

/** What the student did, and when on the board's clock: replaying these gives the same board. */
export type Input = {
  readonly at: number;
  readonly path: string;
  readonly action: string;
  readonly payload: Payload;
};

/** What waits in the queue: outs to do as the prop that queued them. */
type Later = { readonly outs: readonly Out[]; readonly move?: string };

type Node = {
  readonly path: string;
  readonly def: AnyProp;
  readonly holder: Node | undefined;
  /** Its name in its holder. */
  readonly name: string;
  readonly children: ReadonlyMap<string, Node>;
  vars: Readonly<Record<string, unknown>>;
  /** Its variables on the move, by name. */
  readonly moves: Map<string, Move>;
};

/** Variables to start from, for the board and the props it holds: `{ town: { walker: { at } } }`. */
export type Given = Readonly<Record<string, unknown>>;

/** How deep one event may set off others before it is taken for a loop. */
const MAX_DEPTH = 64;
/** How many queued events one move of the clock may deliver before it is taken for a loop. */
const MAX_AT_ONCE = 10_000;

type AnyFn = (...args: never[]) => unknown;

export class Board {
  private readonly nodes = new Map<string, Node>();
  private readonly root: Node;
  private readonly queue = new TimeQueue<Later>();
  private clock = 0;
  private readonly inputs: Input[] = [];
  private readonly watchers = new Set<() => void>();
  /** The events being handled, outermost first (to name a loop's path). */
  private readonly chain: string[] = [];

  constructor(root: AnyProp, given: Given = {}) {
    this.root = this.build(root, "", "", undefined, given);
  }

  /** The same board played again: the same props and setup, the student's taps at their times, to `until`. */
  static replay(root: AnyProp, given: Given, log: readonly Input[], until: number): Board {
    const board = new Board(root, given);
    for (const input of log) {
      board.advanceTo(input.at);
      board.input(input.path, input.action, input.payload);
    }
    board.advanceTo(until);
    return board;
  }

  private build(
    def: AnyProp,
    path: string,
    name: string,
    holder: Node | undefined,
    given: Given,
  ): Node {
    const own: Record<string, unknown> = {};
    const children = new Map<string, Node>();
    const node: Node = { path, def, holder, name, children, vars: {}, moves: new Map() };
    for (const [key, value] of Object.entries(given)) if (!def.children?.[key]) own[key] = value;
    const start = { ...(def.start as Record<string, unknown> | undefined), ...own };
    node.vars = this.checked(def, path, start);
    this.nodes.set(path, node);
    for (const [childName, child] of Object.entries(def.children ?? {}))
      children.set(
        childName,
        this.build(
          child,
          joinPath(path, childName),
          childName,
          node,
          (given[childName] ?? {}) as Given,
        ),
      );
    return node;
  }

  private checked(
    def: AnyProp,
    path: string,
    vars: Record<string, unknown>,
  ): Readonly<Record<string, unknown>> {
    const names = new Set(keysOf(def.variables));
    for (const key of Object.keys(vars))
      if (!names.has(key))
        throw new Error(`${where(path, def)}: "${key}" isn't one of its variables`);
    if (def.variables === undefined) return {};
    const parsed = def.variables.safeParse(vars);
    if (!parsed.success)
      throw new Error(
        `${where(path, def)}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "variables"} ${i.message}`).join("; ")}`,
      );
    return parsed.data as Readonly<Record<string, unknown>>;
  }

  // ---- reading ----

  /** The board's clock, in seconds. */
  get now(): number {
    return this.clock;
  }

  /** What anyone reads of the prop at `path`: variables (moving ones where they are now), needs, facts, children. */
  read<P = AnyProp>(path = ""): ReaderOf<P> {
    return this.reader(this.at(path)) as ReaderOf<P>;
  }

  private at(path: string): Node {
    const node = this.nodes.get(path);
    if (node === undefined) throw new Error(`Board: nothing at "${path}"`);
    return node;
  }

  /**
   * A read-only view, worked out as it is read: a variable on the move gives where it is now; a
   * need comes from the holder (its `give`, else its own name), read live, never copied.
   */
  private reader(node: Node): Readonly<Record<string, unknown>> {
    const view: Record<string, unknown> = {};
    const define = (key: string, get: () => unknown) =>
      Object.defineProperty(view, key, { get, enumerable: true });
    for (const key of Object.keys(node.vars)) define(key, () => this.valueOf(node, key));
    for (const key of keysOf(node.def.needs)) define(key, () => this.need(node, key));
    for (const [key, fact] of Object.entries(node.def.facts ?? {}))
      define(key, () =>
        this.guarded(`${node.path || "board"}.${key}`, () => (fact as AnyFn)(view as never)),
      );
    for (const [name, child] of node.children) define(name, () => this.reader(child));
    return Object.freeze(view);
  }

  private valueOf(node: Node, key: string): unknown {
    const move = node.moves.get(key);
    return move === undefined ? node.vars[key] : moveAt(move, this.clock);
  }

  private readonly reading = new Set<string>();
  /** Runs `get`, refusing to read something while it is being worked out (a need or fact in a circle). */
  private guarded<T>(key: string, get: () => T): T {
    if (this.reading.has(key))
      throw new Error(`Board: ${[...this.reading, key].join(" → ")} goes round in a circle`);
    this.reading.add(key);
    try {
      return get();
    } finally {
      this.reading.delete(key);
    }
  }

  private need(node: Node, key: string): unknown {
    const holder = node.holder;
    if (holder === undefined)
      throw new Error(`${where(node.path, node.def)} needs ${key}, and nothing holds it`);
    const value = this.guarded(`${node.path}.${key}`, () => {
      const give = holder.def.give?.[node.name]?.[key];
      const view = this.reader(holder);
      if (give !== undefined) return (give as AnyFn)(view as never);
      if (key in view && !holder.children.has(key)) return view[key];
      throw new Error(
        `${where(holder.path, holder.def)} doesn't give ${node.name} its need ${key}`,
      );
    });
    // A need is what the child says it is, whoever gives it (a template's types, checked as it runs).
    const shape = (node.def.needs as { shape?: Record<string, ZodType> } | undefined)?.shape?.[key];
    const parsed = shape?.safeParse(value);
    if (parsed !== undefined && !parsed.success)
      throw new Error(
        `${where(node.path, node.def)} needs ${key}; ${holder.path || "the board"} gives ${JSON.stringify(value)}: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
      );
    return value;
  }

  // ---- events ----

  /**
   * The student asks: only an action marked `from: "screen"`. Logged with the clock (the replay),
   * and it drops what the props holding this one queued for it (the student takes over).
   */
  input(path: string, action: string, payload: Payload = {}): void {
    const node = this.at(path);
    const spec = node.def.actions?.[action];
    if (spec === undefined) throw new Error(`${where(path, node.def)} has no action ${action}`);
    if (!spec.isFromScreen)
      throw new Error(`${where(path, node.def)}.${action} isn't the student's (from: "screen")`);
    this.payload(node, action, spec.payload, payload);
    this.inputs.push({ at: this.clock, path, action, payload });
    // What the props holding it queued for it is dropped, out by out; the rest of each entry stays.
    this.queue.rewrite((e) => {
      if (isInside(e.owner, path)) return e.what;
      const outs = without(e.owner, e.what.outs, path);
      return outs.length === 0 && e.what.move === undefined ? undefined : { ...e.what, outs };
    });
    this.changed(() => this.ask(node, action, payload));
  }

  /** The lesson, a test or a tool asks a prop to act (no screen check, not logged). */
  send(path: string, action: string, payload: Payload = {}): void {
    this.changed(() => this.ask(this.at(path), action, payload));
  }

  private ask(node: Node, action: string, payload: Payload): void {
    const spec = node.def.actions?.[action];
    if (spec === undefined)
      throw new Error(`${where(node.path, node.def)} has no action ${action}`);
    const data = this.payload(node, action, spec.payload, payload);
    const rule = node.def.on?.[action];
    this.step(`${node.path || "board"}.${action}`, () => {
      if (rule !== undefined)
        this.apply(
          node,
          (rule as AnyFn)(
            this.reader(node) as never,
            data as never,
            this.tools(node) as never,
          ) as Outs,
        );
    });
  }

  /** A signal told by `node`: to each prop holding it, nearest first, that hears it. */
  private tell(node: Node, signal: string, payload: Payload): void {
    const spec = node.def.signals?.[signal];
    if (spec === undefined)
      throw new Error(`${where(node.path, node.def)} has no signal ${signal}`);
    const data = this.payload(node, signal, spec.payload, payload);
    let heard = signal;
    let from = node;
    for (let holder = node.holder; holder !== undefined; holder = holder.holder) {
      heard = `${from.name}.${heard}`;
      from = holder;
      const rule = holder.def.hear?.[heard];
      if (rule === undefined) continue;
      const by = holder;
      this.step(`${by.path || "board"} hears ${heard}`, () =>
        this.apply(
          by,
          (rule as AnyFn)(this.reader(by) as never, data as never, this.tools(by) as never) as Outs,
        ),
      );
    }
  }

  /** An event's payload, checked against what it says it carries. */
  private payload(node: Node, name: string, schema: ZodType, payload: Payload): unknown {
    const parsed = schema.safeParse(payload);
    if (!parsed.success)
      throw new Error(
        `${where(node.path, node.def)}.${name} carries ${JSON.stringify(payload)}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "it"} ${i.message}`).join("; ")}`,
      );
    return parsed.data;
  }

  /** One event handled, inside the chain of those that set it off. */
  private step(name: string, run: () => void): void {
    if (this.chain.length >= MAX_DEPTH)
      throw new Error(
        `Board: events go round without end: ${[...this.chain.slice(0, 8), "…", ...this.chain.slice(-8), name].join(" → ")}`,
      );
    this.chain.push(name);
    try {
      run();
    } finally {
      this.chain.pop();
    }
  }

  /** What a rule asked for, in order: its own changes first, then what it sends. */
  private apply(node: Node, outs: Outs): void {
    const list =
      outs === undefined || outs === false || outs === null
        ? []
        : Array.isArray(outs)
          ? (outs as readonly Out[])
          : [outs as Out];
    const patch: Record<string, unknown> = {};
    for (const out of list) if (out.kind === "set") Object.assign(patch, out.patch);
    if (Object.keys(patch).length > 0) this.setVars(node, patch);
    for (const out of list) {
      switch (out.kind) {
        case "set":
          break;
        case "tell":
          this.tell(node, out.signal, out.payload);
          break;
        case "ask":
          this.ask(this.below(node, out.path), out.action, out.payload);
          break;
        case "later":
          this.queue.add(this.clock + seconds(node, "later", out.seconds), node.path, {
            outs: out.outs,
          });
          break;
        case "move":
          this.startMove(node, out.variable, out.to, out.takes, out.ease, out.atEnd);
          break;
        case "stop":
          this.stopAll(node);
          break;
      }
    }
  }

  private below(node: Node, names: readonly string[]): Node {
    let at = node;
    for (const name of names) {
      const child = at.children.get(name);
      if (child === undefined) throw new Error(`${where(at.path, at.def)} holds no ${name}`);
      at = child;
    }
    return at;
  }

  /** Changes a prop's own variables, checked; a variable set while on the move stops there. */
  private setVars(node: Node, patch: Record<string, unknown>): void {
    for (const key of Object.keys(patch)) {
      if (node.moves.delete(key))
        this.queue.drop((e) => e.owner === node.path && e.what.move === key);
    }
    const next = { ...this.settled(node), ...patch };
    node.vars = this.checked(node.def, node.path, next);
  }

  /** Its variables with each move where it is now. */
  private settled(node: Node): Record<string, unknown> {
    const out = { ...node.vars };
    for (const [key, move] of node.moves) out[key] = moveAt(move, this.clock);
    return out;
  }

  private startMove(
    node: Node,
    variable: string,
    to: unknown,
    takes: number,
    ease: Ease,
    atEnd: readonly Out[],
  ): void {
    seconds(node, `move ${variable}`, takes);
    const from = this.valueOf(node, variable);
    if (node.moves.delete(variable))
      this.queue.drop((e) => e.owner === node.path && e.what.move === variable);
    // Its end is checked now: a move can't end somewhere the variables don't allow.
    this.checked(node.def, node.path, { ...this.settled(node), [variable]: to });
    node.moves.set(variable, { from, to, startedAt: this.clock, takes, ease });
    this.queue.add(this.clock + takes, node.path, {
      outs: [{ kind: "set", patch: { [variable]: to } }, ...atEnd],
      move: variable,
    });
  }

  private stopAll(node: Node): void {
    if (node.moves.size > 0) {
      node.vars = this.settled(node);
      node.moves.clear();
    }
    this.queue.drop((e) => e.owner === node.path);
  }

  // ---- time ----

  /** Moves the clock to `t`, delivering on the way everything that falls due, in order. */
  advanceTo(t: number): void {
    if (t < this.clock) throw new Error(`Board: the clock can't go back (${this.clock} → ${t})`);
    this.changed(() => {
      let n = 0;
      for (let due = this.queue.takeDue(t); due !== undefined; due = this.queue.takeDue(t)) {
        // Entries queuing more at the same moment (a "later" of 0 that comes back) never let time on.
        if (++n > MAX_AT_ONCE)
          throw new Error(
            `Board: more than ${MAX_AT_ONCE} queued events fall due by ${round(t)}s, queued by ${[...new Set(this.queue.all.slice(0, 8).map((e) => e.owner || "board"))].join(", ")}: a "later" that keeps coming back?`,
          );
        this.clock = due.at;
        this.due(due);
      }
      this.clock = t;
    });
  }

  private due(entry: Entry<Later>): void {
    const node = this.at(entry.owner);
    // A move arriving: it is no longer on the move, it is there.
    if (entry.what.move !== undefined) node.moves.delete(entry.what.move);
    this.step(`${entry.owner || "board"} at ${round(entry.at)}s`, () =>
      this.apply(node, entry.what.outs),
    );
  }

  /** Jumps the clock from one queued entry to the next until nothing is queued (a check, a test). */
  runUntilIdle(limit = 100_000): void {
    for (let n = 0; this.queue.nextAt !== undefined; n++) {
      if (n >= limit)
        throw new Error(
          `Board: still busy after ${limit} queued events (a repeat that never stops?)`,
        );
      this.advanceTo(this.queue.nextAt);
    }
  }

  /** What waits, in order: when, and who queued it. */
  get queued(): readonly { at: number; owner: string; outs: readonly Out[] }[] {
    return this.queue.all.map((e) => ({ at: e.at, owner: e.owner, outs: e.what.outs }));
  }

  /** What the student did, with when. */
  get log(): readonly Input[] {
    return this.inputs;
  }

  /** Called once after each change from outside (an input, a send, the clock moving), not per event inside it. */
  watch(fn: () => void): () => void {
    this.watchers.add(fn);
    return () => this.watchers.delete(fn);
  }

  private depth = 0;
  private changed(run: () => void): void {
    this.depth++;
    try {
      run();
    } finally {
      this.depth--;
    }
    if (this.depth === 0) for (const fn of this.watchers) fn();
  }

  // ---- the tools a rule is handed ----

  private tools(node: Node): unknown {
    const def = node.def;
    const asks = (target: AnyProp, path: readonly string[]): unknown => {
      const out: Record<string, unknown> = {};
      for (const action of Object.keys(target.actions ?? {}))
        out[action] = (payload: Payload = {}): Out => ({ kind: "ask", path, action, payload });
      for (const [name, child] of Object.entries(target.children ?? {}))
        out[name] = asks(child, [...path, name]);
      return out;
    };
    const tell: Record<string, unknown> = {};
    for (const signal of Object.keys(def.signals ?? {}))
      tell[signal] = (payload: Payload = {}): Out => ({ kind: "tell", signal, payload });
    const self: Record<string, unknown> = {};
    for (const action of Object.keys(def.actions ?? {}))
      self[action] = (payload: Payload = {}): Out => ({ kind: "ask", path: [], action, payload });
    const to: Record<string, unknown> = {};
    for (const [name, child] of Object.entries(def.children ?? {})) to[name] = asks(child, [name]);
    return {
      set: (patch: Payload): Out => ({ kind: "set", patch }),
      tell,
      self,
      to,
      later: (seconds: number, ...outs: Out[]): Out => ({ kind: "later", seconds, outs }),
      move: (
        variable: string,
        to: unknown,
        takes: number,
        options: { ease?: Ease; atEnd?: readonly Out[] } = {},
      ): Out => ({
        kind: "move",
        variable,
        to,
        takes,
        ease: options.ease ?? Ease.Linear,
        atEnd: options.atEnd ?? [],
      }),
      stop: (): Out => ({ kind: "stop" }),
    };
  }
}

function where(path: string, def: AnyProp): string {
  return path === "" ? `${def.type} (the board)` : `${path} (${def.type})`;
}

/** Whether `inside` is `path` or a prop it holds. */
function isInside(inside: string, path: string): boolean {
  return inside === path || (path === "" ? true : inside.startsWith(`${path}/`));
}

/** `outs` queued by `owner` without those that act on the prop at `path` (or a prop it holds). */
function without(owner: string, outs: readonly Out[], path: string): Out[] {
  const kept: Out[] = [];
  for (const out of outs) {
    if (out.kind === "ask" && isInside(joinPath(owner, ...out.path), path)) continue;
    if (out.kind === "later") {
      const inner = without(owner, out.outs, path);
      if (inner.length > 0) kept.push({ ...out, outs: inner });
      continue;
    }
    if (out.kind === "move") {
      kept.push({ ...out, atEnd: without(owner, out.atEnd, path) });
      continue;
    }
    kept.push(out);
  }
  return kept;
}

/** A time a rule gave: never negative, never not a number. */
function seconds(node: Node, what: string, value: number): number {
  if (!Number.isFinite(value) || value < 0)
    throw new Error(
      `${where(node.path, node.def)}: ${what} of ${value} seconds (it must be 0 or more)`,
    );
  return value;
}

function round(t: number): number {
  return Math.round(t * 1000) / 1000;
}
