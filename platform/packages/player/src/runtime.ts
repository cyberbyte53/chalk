import {
  Actor,
  type Board,
  type BoardAt,
  type CallArgs,
  type Locale,
  type SavedBoard,
  type Script,
  type WhenRule,
  propPieces,
  splitTarget,
} from "@chalk/content";
import {
  AnswerStatus,
  type AnyPropDef,
  BOARD,
  BoardAction,
  BoardSignal,
  type BoardSnapshot,
  type BoundTree,
  type Change,
  EffectKind,
  type Observation,
  PropRole,
  type PropView,
  type Raised,
  SAY,
  type Spoken,
  type StoredState,
  type TaskContext,
  boardProp,
  changesBetween,
  defineGroup,
  groupOf,
  initialState,
  invariantOfView,
  isFullChecking,
  namesOf,
  prepareOnView,
  runEffect,
  schemaWithout,
  segment,
  viewOf,
  without,
} from "@chalk/prop";
import { type ReadonlySignal, type Signal, batch, computed, signal } from "@preact/signals-core";
import { describeView } from "./describe";
import type { PropModule } from "./prop-module";
import { snapshotOf } from "./snapshot";

/** What the runtime needs from outside: the voice and the screen's frames. Fakes in tests. */
export type RuntimeServices = {
  /** Reads a prop's line aloud; resolves when it ends or fails (the text stays on screen either way). */
  speak: (prop: { name: string }, line: Spoken) => Promise<void>;
  /** Calls back on the next frame with the time in ms; returns a function that cancels it. */
  frame: (callback: (now: number) => void) => () => void;
  now: () => number;
  /** Something in the content broke while playing. The board carries on. */
  onError: (message: string, error?: unknown) => void;
};

/**
 * An action someone asked for, and whether the board took it. Every action and signal on a board
 * is numbered (`n`) in the order it happened, and says what set it off, so a record can link a
 * consequence to its cause.
 */
export type ActionRecord = {
  n: number;
  prop: string;
  action: string;
  args: unknown;
  actor: Actor;
  /**
   * What set it off: the `n` of the act (an action asked directly, or a signal a view raised)
   * whose consequence this is, through the lesson's rules. Undefined: it was asked directly.
   */
  cause?: number;
  /** A step of an effect already running on the prop (a tween's tick, its own `call`), not an act. */
  isStep: boolean;
  /** When, on the board's clock (seconds, not counting pauses). */
  t: number;
  /** Why it was refused; absent when the board took it. */
  refused?: string;
};

/** A copy of every prop's stored facts, to put the board back exactly as it was. */
export type BoardFacts = ReadonlyMap<string, StoredState>;

/** An event on the board, its node by address: a signal raised, or an action asked of it. */
export type BoardEvent =
  | {
      kind: "signal";
      node: string;
      signal: string;
      payload: Readonly<Record<string, unknown>>;
      actor: Actor;
    }
  | { kind: "action"; node: string; action: string; args: unknown; actor: Actor; refused?: string };

/** What acting on a node did. */
export type ActResult = {
  changed: Change[];
  signals: { node: string; signal: string; payload: Readonly<Record<string, unknown>> }[];
  /** Why it was refused; absent when it was taken. */
  refused?: string;
};

/** A signal as the runtime saw it: which prop, what, with what, and who caused it. */
export type SignalRecord = {
  n: number;
  prop: string;
  signal: string;
  payload: Readonly<Record<string, unknown>>;
  actor: Actor;
  /**
   * The `n` of the act that set it off (an action asked directly, whatever rules ran between).
   * Undefined: nothing did; a view raised it (it is an act itself), or the board started.
   */
  from?: number;
};

/** One placed prop: what it is. Its facts live in the board's one root; its view is worked out. */
type Piece = {
  name: string;
  def: AnyPropDef;
  /** Its stored facts' schema: the prop's own, minus the fields the board binds. */
  facts: FactsSchema;
  /** Fields the board binds into it (never stored, never set by an action). */
  bound: BoundTree | undefined;
  isGroup: boolean;
  /** Its view, made again only when it changes (a prop on screen re-renders only then). */
  view: ReadonlySignal<PropView>;
};

/** The whole board's facts: each piece's, by name (the board's own under BOARD). */
type Root = Readonly<Record<string, StoredState>>;

type CompiledWhen = {
  prop: string;
  signal: string;
  condition: ((at: BoardAt) => unknown) | undefined;
  script: Script;
};

/** Steps running over time on one prop: stopped by marking it dead (it stops at its next step). */
type Timeline = { actor: Actor; isLive: boolean };

/** Waits (and so every step over time) run on the board's own clock, so pausing the board pauses them all together. */
class Clock {
  private pausedAt: number | undefined;
  private pausedTotal = 0;
  private readonly waiters = new Set<{ until: number; resolve: () => void }>();
  private cancelFrame: (() => void) | undefined;
  private isStopped = false;

  constructor(private readonly services: RuntimeServices) {}

  /** Seconds since the board started, not counting pauses. */
  time(): number {
    const now = this.pausedAt ?? this.services.now();
    return (now - this.pausedTotal) / 1000;
  }

  pause(): void {
    if (this.pausedAt === undefined) this.pausedAt = this.services.now();
  }

  resume(): void {
    if (this.pausedAt === undefined) return;
    this.pausedTotal += this.services.now() - this.pausedAt;
    this.pausedAt = undefined;
    this.schedule();
  }

  wait(seconds: number): Promise<void> {
    // Once the board is gone, nothing waits its turn again: a task's loop just stops here.
    if (this.isStopped) return new Promise(() => {});
    return new Promise((resolve) => {
      this.waiters.add({ until: this.time() + seconds, resolve });
      this.schedule();
    });
  }

  stop(): void {
    this.isStopped = true;
    this.cancelFrame?.();
    this.cancelFrame = undefined;
    for (const waiter of this.waiters) waiter.resolve();
    this.waiters.clear();
  }

  private schedule(): void {
    if (this.cancelFrame !== undefined || this.pausedAt !== undefined) return;
    if (this.waiters.size === 0) return;
    this.cancelFrame = this.services.frame(() => {
      this.cancelFrame = undefined;
      this.tick();
    });
  }

  private tick(): void {
    if (this.pausedAt !== undefined) return;
    const time = this.time();
    for (const waiter of [...this.waiters]) {
      if (time >= waiter.until) {
        this.waiters.delete(waiter);
        waiter.resolve();
      }
    }
    this.schedule();
  }
}

/** A schema for a piece's facts. */
type FactsSchema = ReturnType<typeof schemaWithout>;

/** What a fork runs on when given nothing: the parent's services, silent. */
const silenced = (services: RuntimeServices): RuntimeServices => ({
  ...services,
  speak: () => Promise.resolve(),
});

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** Sets `value` at `path` in a nested object, making the levels it needs. */
function setPath(out: Record<string, unknown>, path: readonly string[], value: unknown): void {
  const [first, ...rest] = path;
  if (first === undefined) return;
  if (rest.length === 0) {
    out[first] = value;
    return;
  }
  const next = isObject(out[first]) ? { ...out[first] } : {};
  setPath(next, rest, value);
  out[first] = next;
}

function getPath(from: unknown, path: readonly string[]): unknown {
  let at = from;
  for (const key of path) at = isObject(at) ? at[key] : undefined;
  return at;
}

type Link = (view: PropView) => Record<string, unknown>;

/** What each bound field's rule read the last time it ran ("race.time"), by piece and field. */
type BoundReads = Map<string, Map<string, readonly string[]>>;

/** A placed prop's view as a rule reads it, noting each field read. */
function noted(name: string, view: Readonly<Record<string, unknown>>, reads: Set<string>) {
  return new Proxy(view, {
    get(target, key, receiver) {
      if (typeof key === "string" && key in target) reads.add(`${segment(name)}.${key}`);
      return Reflect.get(target, key, receiver);
    },
  });
}

/**
 * The board's IS rules as the top group's links: per piece, one function returning the fields the
 * board binds into it. The group works a piece out when it is read, so a rule may read any piece;
 * what each rule reads is noted every time it runs (`reads`). A rule that breaks (an error, or a
 * value its field won't take) keeps its last good value and is reported once, until it works again.
 */
function boardLinks(
  board: Board,
  defs: ReadonlyMap<string, AnyPropDef>,
  starts: ReadonlyMap<string, StoredState>,
  report: (message: string, error?: unknown) => void,
): { links: Record<string, Link>; reads: BoundReads } {
  type Rule = {
    target: string;
    member: string;
    path: readonly string[];
    to: (at: BoardAt) => unknown;
    check: ((value: unknown) => string | undefined) | undefined;
    last: unknown;
    lastError: string | undefined;
  };
  const rules = new Map<string, Rule[]>();
  for (const rule of board.is) {
    const { prop, member } = splitTarget(rule.set);
    const def = defs.get(prop);
    if (def === undefined)
      throw new Error(`Board ${board.name}: IS ${rule.set}: no prop "${prop}"`);
    const path = member.split(".");
    // A leaf's own field is checked against its schema (a group's fields are checked inside it).
    const shape = (def.state as unknown as { shape?: Record<string, FieldSchema> }).shape;
    const field = path.length === 1 && groupOf(def) === undefined ? shape?.[member] : undefined;
    const check =
      field === undefined
        ? undefined
        : (value: unknown) => {
            if (!isFullChecking()) return undefined;
            const parsed = field.safeParse(value);
            return parsed.success
              ? undefined
              : parsed.error.issues.map((i) => i.message).join("; ");
          };
    const list = rules.get(prop) ?? [];
    list.push({
      target: rule.set,
      member,
      path,
      to: rule.to,
      check,
      last: getPath(starts.get(prop), path),
      lastError: undefined,
    });
    rules.set(prop, list);
  }

  const reads: BoundReads = new Map();
  const links: Record<string, Link> = {};
  for (const [name, list] of rules) {
    const noting = new Map<string, readonly string[]>();
    reads.set(name, noting);
    links[name] = (view) => {
      const out: Record<string, unknown> = {};
      for (const rule of list) {
        const read = new Set<string>();
        // The group's view works each piece out as it is read; this piece reads as it is so far.
        const at: BoardAt = (piece) => {
          const prop = typeof piece === "string" ? piece : piece.name;
          const seen = view[prop];
          if (!isObject(seen)) throw new Error(`no prop "${prop}"`);
          return noted(prop, prop === name ? { ...seen, ...out } : seen, read);
        };
        let value: unknown;
        let problem: string | undefined;
        let cause: unknown;
        try {
          value = rule.to(at);
          problem = rule.check?.(value);
        } catch (error) {
          problem = error instanceof Error ? error.message : String(error);
          cause = error;
        }
        noting.set(rule.member, [...read]);
        if (problem === undefined) {
          rule.last = value;
          rule.lastError = undefined;
        } else if (problem !== rule.lastError) {
          rule.lastError = problem;
          report(`Board ${board.name}: IS ${rule.target}: ${problem}`, cause);
        }
        setPath(out, rule.path, rule.last);
      }
      return out;
    };
  }
  return { links, reads };
}

type FieldSchema = {
  safeParse: (
    v: unknown,
  ) => { success: true } | { success: false; error: { issues: { message: string }[] } };
};

/**
 * One board, live. It is the top group: its children are the placed props (and the board's own
 * prop), its links are the board's IS rules, and its state is one root of facts, by piece. A field
 * an IS binds is never stored: it is worked out when read, like everything derived. Every change
 * goes through `commit`, which checks it and swaps the root; a refusal is always reported.
 *
 * The root is a signal (@preact/signals-core) and each piece's view a computed value, made again
 * only when its facts or what is bound into it changed: a prop on screen re-renders only then.
 * WHEN rules are answered in order, and scripts run on the board's own clock.
 */
export class BoardRuntime {
  private readonly pieces = new Map<string, Piece>();
  private readonly top: AnyPropDef;
  private readonly root: Signal<Root>;
  private readonly boardView: ReadonlySignal<PropView>;
  private readonly whenRules: CompiledWhen[];
  /** What each bound field's rule read when it last ran. */
  private readonly reads: BoundReads;
  private readonly signalListeners = new Set<(record: SignalRecord) => void>();
  private readonly actionListeners = new Set<(record: ActionRecord) => void>();
  private readonly queue: SignalRecord[] = [];
  private isDispatching = false;
  /** What is running over time on each prop, and who started it. */
  private readonly timelines = new Map<string, Set<Timeline>>();
  /** Each placed prop's definition and view, by name. */
  private readonly modules = new Map<string, PropModule>();
  private readonly clock: Clock;
  private readonly touchedProps = signal<ReadonlySet<string>>(new Set());
  private isDisposed = false;
  /** The last number given to an action or signal (ActionRecord.n). */
  private count = 0;

  constructor(
    readonly board: Board,
    private readonly lookup: (type: string) => PropModule | undefined,
    private readonly services: RuntimeServices,
    /** Start from these facts instead of the placements (a fork). */
    from?: Root,
  ) {
    this.clock = new Clock(services);
    const defs = new Map<string, AnyPropDef>();
    const starts = new Map<string, StoredState>();
    const hidden: string[] = [];
    for (const piece of propPieces(board.root)) {
      const module = lookup(piece.prop);
      if (module === undefined)
        throw new Error(`Board ${board.name}: no prop type "${piece.prop}" in the library`);
      const def = module.def;
      this.modules.set(piece.name, module);
      const start = initialState(def, piece.with);
      if (!start.isOk)
        throw new Error(`Board ${board.name}, ${piece.name}: ${start.errors.join("; ")}`);
      defs.set(piece.name, def);
      starts.set(piece.name, start.state);
      if (piece.isHidden === true) hidden.push(piece.name);
    }
    defs.set(BOARD, boardProp as unknown as AnyPropDef);
    starts.set(BOARD, { ...boardProp.defaults, hidden });

    const names = [...defs.keys()];
    const links = boardLinks(board, defs, starts, (m, e) => this.services.onError(m, e));
    this.reads = links.reads;
    let top: AnyPropDef;
    try {
      top = defineGroup({
        type: `board ${board.name}`,
        describe: `The board ${board.name}`,
        children: Object.fromEntries(defs),
        defaults: Object.fromEntries(starts),
        is: links.links,
        summary: () => board.name,
        layout: { kind: "column", children: names },
      } as never) as unknown as AnyPropDef;
    } catch (error) {
      throw new Error(
        `Board ${board.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    this.top = top;
    const boundTree = groupOf(top)?.boundTree ?? {};
    this.root = signal((from ?? top.defaults) as Root);
    this.boardView = computed(() => viewOf(top, this.root.value));
    for (const name of names) {
      const def = defs.get(name) as AnyPropDef;
      const bound = boundTree[name];
      const facts = schemaWithout(def, bound);
      this.pieces.set(name, {
        name,
        def,
        facts,
        bound,
        isGroup: groupOf(def) !== undefined,
        view: computed(() => this.boardView.value[name] as PropView),
      });
    }
    this.whenRules = board.when.map((rule) => this.compileWhen(rule));
  }

  // ---- reading ----

  /**
   * What the board binds into a prop, field by field, and what each field's rule read the last time
   * it ran ("race.time"). Empty for a prop the board binds nothing into.
   */
  boundReads(name: string): ReadonlyMap<string, readonly string[]> {
    this.getView(name);
    return this.reads.get(name) ?? new Map();
  }

  /** A prop's state: its facts, what the board binds into it, and what is derived. */
  getView(name: string): PropView {
    return this.piece(name).view.value;
  }

  /** A prop's stored facts (without what the board binds into it). */
  getStored(name: string): StoredState {
    this.piece(name);
    return this.root.value[name] as StoredState;
  }

  /**
   * A prop's fields as its own code reads them: a leaf's stored fields with what the board binds
   * into them (no derived values), a group's facts (it works out its own links).
   */
  getFields(name: string): StoredState {
    return this.fieldsOf(this.piece(name));
  }

  /** Why these facts don't fit the prop here (checked fully), or nothing if they do. */
  checkFacts(name: string, facts: StoredState): readonly string[] {
    const piece = this.piece(name);
    const parsed = (piece.facts as unknown as FieldSchema).safeParse(facts);
    if (parsed.success) return [];
    return (parsed.error.issues as unknown as { path: (string | number)[]; message: string }[]).map(
      (i) => `${piece.def.type}.${i.path.join(".") || "state"}: ${i.message}`,
    );
  }

  getDef(name: string): AnyPropDef {
    return this.piece(name).def;
  }

  /** A placed prop as the student sees it right now, read from what its view draws. */
  describe(name: string, locale: Locale = "en"): Observation {
    const module = this.modules.get(name);
    if (module === undefined) throw new Error(`no prop "${name}" on this board`);
    return describeView(module, this.getView(name), locale);
  }

  /** Every placed prop's name (not the board). */
  propNames(): string[] {
    return [...this.pieces.keys()].filter((name) => name !== BOARD);
  }

  isHidden(name: string): boolean {
    const hidden = this.piece(BOARD).view.value.hidden;
    return Array.isArray(hidden) && hidden.includes(name);
  }

  /** Props the learner has acted on. */
  isTouched(name: string): boolean {
    return this.touchedProps.value.has(name);
  }

  /** Every action asked of the board, by anyone, taken or refused (for Jugnu's history, logs). */
  onAction(listener: (record: ActionRecord) => void): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  /** The board as agents read it: every node by address, its values, parts and what can be done. */
  snapshot(page?: ParentNode): BoardSnapshot {
    return snapshotOf(this, page);
  }

  /**
   * The board as plain facts (the phone's board sent to Jugnu's server): each node by address, its
   * stored facts and whether the learner touched it. The one way a board is written down; `load` is
   * the one way it is read back.
   */
  save(): SavedBoard {
    const out: SavedBoard = {};
    for (const [name, facts] of Object.entries(this.root.peek())) {
      if (!this.pieces.has(name)) continue;
      out[segment(name)] = {
        facts: { ...(facts as StoredState) },
        isTouched: this.touchedProps.peek().has(name),
      };
    }
    return out;
  }

  /**
   * Puts the board into a saved one. Refused, before anything changes, if a node isn't on this board
   * or its facts don't fit its prop (checked fully): it is never read wrong.
   */
  load(saved: SavedBoard): void {
    const problems: string[] = [];
    const facts = new Map<string, StoredState>();
    const touched = new Set<string>();
    for (const [path, node] of Object.entries(saved)) {
      const [name] = namesOf(path);
      const piece = name === undefined ? undefined : this.pieces.get(name);
      if (name === undefined || piece === undefined) {
        problems.push(`${path}: not on this board`);
        continue;
      }
      const errors = this.checkFacts(name, node.facts as StoredState);
      if (errors.length > 0) problems.push(`${path}: ${errors.join("; ")}`);
      facts.set(name, node.facts as StoredState);
      if (node.isTouched) touched.add(name);
    }
    if (problems.length > 0)
      throw new Error(`Board ${this.board.name} can't load this record: ${problems.join(" | ")}`);
    this.restoreFacts(facts);
    this.touchedProps.value = touched;
  }

  /** Every prop's stored facts right now. */
  saveFacts(): BoardFacts {
    return new Map(Object.entries(this.root.peek()));
  }

  /**
   * Puts the board back to a snapshot (Jugnu's undo; a phone's state on the server). Each piece's
   * facts are checked; one that doesn't fit is reported and left as it is. A field the board
   * binds is worked out again, whatever the snapshot says.
   */
  restoreFacts(facts: BoardFacts): void {
    batch(() => {
      for (const [name, stored] of facts) {
        const piece = this.pieces.get(name);
        if (piece === undefined) continue;
        this.stopTimelines(name);
        const errors = this.commit({ [name]: without(stored, piece.bound) });
        if (errors.length > 0)
          this.services.onError(
            `Board ${this.board.name}: restoring ${name}: ${errors.join("; ")}`,
          );
      }
    });
  }

  /**
   * A copy of the board as it is now, with its own clock and no listeners: for trying something
   * out (Jugnu's try, a witness, a test) without touching this one. Nothing is said aloud unless
   * `services` say so.
   */
  fork(services: RuntimeServices = silenced(this.services)): BoardRuntime {
    const copy = new BoardRuntime(this.board, this.lookup, services, this.root.peek());
    copy.touchedProps.value = this.touchedProps.peek();
    return copy;
  }

  /**
   * The one event stream, every node by address: signals ("lens/objectArrow" released), actions
   * asked by anyone (taken or refused, and by whom). What Jugnu, review steps and logs watch.
   */
  watch(listener: (event: BoardEvent) => void): () => void {
    const offSignal = this.onSignal((r) => {
      const { node, member } = this.nodeOf(r.prop, r.signal);
      listener({ kind: "signal", node, signal: member, payload: r.payload, actor: r.actor });
    });
    const offAction = this.onAction((r) => {
      const { node, member } = this.nodeOf(r.prop, r.action);
      listener({
        kind: "action",
        node,
        action: member,
        args: r.args,
        actor: r.actor,
        ...(r.refused !== undefined ? { refused: r.refused } : {}),
      });
    });
    return () => {
      offSignal();
      offAction();
    };
  }

  /**
   * Acts on a node through the one door, as `actor`, and says what happened: each value that moved
   * (by address), the signals raised, and why not, if it was refused. Resolves when it finishes.
   */
  async act(
    ref: { node: string; action: string; args?: Readonly<Record<string, unknown>> },
    actor: Actor = Actor.App,
  ): Promise<ActResult> {
    const [piece = "", ...inside] = namesOf(ref.node);
    const member = [...inside, ref.action].join(".");
    const before = this.snapshot();
    const signals: ActResult["signals"] = [];
    let refused: string | undefined;
    const stop = this.watch((e) => {
      if (e.kind === "signal") signals.push({ node: e.node, signal: e.signal, payload: e.payload });
      else if (
        e.refused !== undefined &&
        e.node === ref.node &&
        e.action === ref.action &&
        refused === undefined
      )
        refused = e.refused;
    });
    try {
      if (!this.pieces.has(piece)) refused = `there is no prop "${piece}" on this board`;
      else await this.call(piece, member, ref.args ?? {}, actor);
    } finally {
      stop();
    }
    return {
      changed: changesBetween(before, this.snapshot()),
      signals,
      ...(refused !== undefined ? { refused } : {}),
    };
  }

  /** "objectArrow.released" on a group piece → the node "lens/objectArrow" and "released". */
  nodeOf(piece: string, dotted: string): { node: string; member: string } {
    const names = dotted.split(".");
    let def = this.pieces.get(piece)?.def;
    const path = [segment(piece)];
    while (names.length > 1 && def !== undefined) {
      const child = groupOf(def)?.children[names[0] ?? ""] as AnyPropDef | undefined;
      if (child === undefined) break;
      path.push(segment(names.shift() ?? ""));
      def = child;
    }
    return { node: path.join("/"), member: names.join(".") };
  }

  onSignal(listener: (record: SignalRecord) => void): () => void {
    this.signalListeners.add(listener);
    return () => this.signalListeners.delete(listener);
  }

  // ---- driving ----

  /** Opens the board: raises `board.started`, which usually starts its script. */
  start(): void {
    this.enqueue(BOARD, { signal: BoardSignal.Started }, Actor.Lesson, undefined);
  }

  /**
   * The one door. Runs one of a prop's actions and resolves when it has finished (at once for an
   * instant change; at the end of a tween or a spoken line). The learner always wins: their action
   * stops anything the lesson is animating on that prop.
   */
  call(
    name: string,
    action: string,
    args: unknown = {},
    actor: Actor = Actor.Lesson,
  ): Promise<void> {
    return this.invoke(name, action, args, actor, false);
  }

  /**
   * `fromTimeline`: a step of an effect already running on this prop (a tick, a `call`): it is the
   * same act as the one that started it, so it neither stops the prop's timelines nor counts again.
   * `cause`: the act this is a consequence of (a lesson rule answering it); undefined, asked directly.
   */
  private invoke(
    name: string,
    action: string,
    args: unknown,
    actor: Actor,
    isSetOff: boolean,
    fromTimeline = false,
    cause: number | undefined = undefined,
  ): Promise<void> {
    if (this.isDisposed) return Promise.resolve();
    const piece = this.piece(name);
    const n = ++this.count;
    // What its signals (and what they set off) are consequences of.
    const root = cause ?? n;
    const notify = (refused?: string) => {
      const record: ActionRecord = {
        n,
        prop: name,
        action,
        args,
        actor,
        isStep: fromTimeline,
        t: this.clock.time(),
      };
      if (cause !== undefined) record.cause = cause;
      if (refused !== undefined) record.refused = refused;
      for (const listener of this.actionListeners) listener(record);
    };
    if (actor === Actor.Jugnu && !fromTimeline) {
      const why = this.whyNotJugnu(name, action, isSetOff);
      if (why !== undefined) {
        notify(why);
        return Promise.resolve();
      }
    }
    if (actor === Actor.Learner && !fromTimeline) {
      // The learner wins: whatever the lesson (or Jugnu) is moving on this prop stops.
      this.stopTimelines(name, (t) => t.actor !== Actor.Learner);
      if (!this.touchedProps.peek().has(name))
        this.touchedProps.value = new Set([...this.touchedProps.peek(), name]);
    }
    const prepared = prepareOnView(piece.def, piece.view.peek(), action, args);
    if (!prepared.isOk) {
      notify(prepared.errors.join("; "));
      return this.fail(`${name}.${action}: ${prepared.errors.join("; ")}`, actor);
    }
    notify();
    const effect = prepared.effect;
    // An action changes only the fields it says it changes: anything else is refused here.
    const allowed = piece.def.actions[action]?.changes;
    const outside = (patch: Readonly<Record<string, unknown>>) =>
      allowed === undefined ? [] : Object.keys(patch).filter((key) => !allowed.includes(key));
    // A prop bug, whoever acted: always reported.
    const refuse = (keys: string[]) =>
      this.services.onError(
        `Board ${this.board.name}: ${name}.${action} changed ${keys.join(", ")}, outside what it declares (changes)`,
      );
    if (effect.kind === EffectKind.Set) {
      if (outside(effect.set).length > 0) {
        refuse(outside(effect.set));
        return Promise.resolve();
      }
      this.change(piece, effect.set, actor);
      for (const emit of effect.emit) this.enqueue(name, emit, actor, root);
      return Promise.resolve();
    }
    // Anything else runs as a timeline on this prop: steps on the board's clock, through the door.
    const timeline: Timeline = { actor, isLive: true };
    const running = this.timelines.get(name) ?? new Set<Timeline>();
    running.add(timeline);
    this.timelines.set(name, running);
    const isLive = () => timeline.isLive && !this.isDisposed;
    const context: TaskContext<StoredState> = {
      speak: () => {
        const spoken = piece.def.speech?.(this.fieldsOf(piece));
        return spoken === undefined || !isLive()
          ? Promise.resolve()
          : this.services.speak({ name }, spoken);
      },
      wait: (seconds) => this.clock.wait(seconds),
      now: () => this.clock.time(),
      set: (patch) => {
        if (!isLive()) return;
        if (outside(patch).length > 0) refuse(outside(patch));
        else this.change(piece, patch, actor);
      },
      get: () => this.fieldsOf(piece),
      emit: (signal, payload) => {
        if (isLive()) this.enqueue(name, { signal, payload }, actor, root);
      },
      call: (next, nextArgs) =>
        isLive()
          ? this.invoke(name, next, nextArgs, actor, isSetOff, true, root)
          : Promise.resolve(),
      isLive,
    };
    const finish = () => {
      running.delete(timeline);
    };
    let ran: Promise<boolean> | boolean;
    try {
      ran = runEffect(effect, context);
    } catch (error) {
      finish();
      this.services.onError(`${name}.${action} failed`, error);
      return Promise.resolve();
    }
    if (ran === true || ran === false) {
      finish();
      return Promise.resolve();
    }
    return ran.then(
      () => finish(),
      (error: unknown) => {
        finish();
        this.services.onError(`${name}.${action} failed`, error);
      },
    );
  }

  /** Stops a prop's timelines (those `which` picks): each stops at its next step. */
  private stopTimelines(name: string, which: (t: Timeline) => boolean = () => true): void {
    for (const timeline of this.timelines.get(name) ?? [])
      if (which(timeline)) timeline.isLive = false;
  }

  /**
   * Runs a script as someone other than the lesson: Jugnu acting on the board. Same language and
   * same door as the lesson's own scripts; resolves when it has finished.
   */
  perform(script: Script, actor: Actor): Promise<void> {
    return this.run(script, actor);
  }

  /** A prop's view raises one of its signals (e.g. the learner let go of the marker): an act itself. */
  signal(
    name: string,
    signal: string,
    payload: Readonly<Record<string, unknown>> = {},
    actor: Actor = Actor.Learner,
  ): void {
    this.enqueue(name, { signal, payload }, actor, undefined);
  }

  /** Seconds on the board's clock (not counting pauses): what views animate by. */
  time(): number {
    return this.clock.time();
  }

  /** Calls back on the next frame (for a view's look that eases on the board's clock). */
  onFrame(callback: () => void): () => void {
    return this.isDisposed ? () => {} : this.services.frame(() => callback());
  }

  /** Pauses everything moving on the board (e.g. while Jugnu's chat is open). */
  pause(): void {
    this.clock.pause();
  }

  resume(): void {
    this.clock.resume();
  }

  /** The board is gone: stop every tween, wait and script. */
  dispose(): void {
    this.isDisposed = true;
    for (const name of this.timelines.keys()) this.stopTimelines(name);
    this.timelines.clear();
    this.clock.stop();
    this.signalListeners.clear();
    this.actionListeners.clear();
  }

  // ---- internals ----

  private piece(name: string): Piece {
    const piece = this.pieces.get(name);
    if (piece === undefined) throw new Error(`Board ${this.board.name}: no prop "${name}"`);
    return piece;
  }

  /**
   * What a prop's own code reads as its state while an action runs over time: a leaf's fields
   * (with what the board binds), a group's facts (it works out its own bindings).
   */
  private fieldsOf(piece: Piece): StoredState {
    if (piece.isGroup) return this.root.peek()[piece.name] as StoredState;
    const view = piece.view.value;
    return Object.fromEntries(Object.keys(piece.def.defaults).map((k) => [k, view[k]]));
  }

  private fail(message: string, actor: Actor): Promise<void> {
    // A drag past the end is normal, and Jugnu hears his own refusals; anything the lesson does
    // wrong is a content bug.
    if (actor === Actor.Lesson || actor === Actor.App)
      this.services.onError(`Board ${this.board.name}: ${message}`);
    return Promise.resolve();
  }

  /**
   * Why Jugnu may not run `prop.action` right now, or undefined if he may. The one place his hard
   * limits live, checked on every call he makes and on everything his actions set off through the
   * lesson's rules (`isSetOff`): he never answers a question or lets the board pass, never directly
   * speaks the lesson's lines or shows and hides its props (the lesson's own rules still may, in
   * answer to what he did), and never runs a prop's own steps. Everything else is his judgement:
   * his instructions say what is the student's part, and his evals check he leaves it to them.
   */
  whyNotJugnu(name: string, action: string, isSetOff = false): string | undefined {
    const piece = this.pieces.get(name);
    if (piece === undefined) return `there is no prop "${name}" on this board`;
    if (name === BOARD && (action === BoardAction.Pass || action === BoardAction.Continue))
      return "only the student's own work moves the board on";
    if (name === BOARD && !isSetOff)
      return "the board itself is the student's (Continue) and the lesson's";
    if (piece.def.role === PropRole.Question)
      return `${name} is the question: only the student answers it`;
    if (action === SAY && !isSetOff) return "lesson lines are the lesson's to say";
    const spec = piece.def.actions[action];
    if (spec === undefined) return undefined; // the action itself refuses, with its own words
    if (spec.internal === true)
      return `${name}.${action} is a step of the prop's own, not an action`;
    return undefined;
  }

  /** True while some question on the board isn't answered correctly yet. */
  hasOpenQuestion(): boolean {
    return [...this.pieces.values()].some(
      (piece) =>
        piece.def.role === PropRole.Question && piece.view.value.status !== AnswerStatus.Correct,
    );
  }

  /**
   * Checks new facts for some pieces and, if they all hold, swaps them into the root. Returns why
   * not, if not. Every IS that reads them is worked out again when next read.
   */
  private commit(changes: Readonly<Record<string, StoredState>>): string[] {
    const next: Root = { ...this.root.peek(), ...changes };
    const errors = isFullChecking()
      ? Object.keys(changes).flatMap((name) => this.checkFacts(name, next[name] as StoredState))
      : [];
    if (errors.length > 0) return errors;
    let view: PropView;
    try {
      view = viewOf(this.top, next);
    } catch (error) {
      return [error instanceof Error ? error.message : String(error)];
    }
    for (const name of Object.keys(changes)) {
      const piece = this.piece(name);
      const broken = invariantOfView(piece.def, view[name] as PropView);
      if (broken !== undefined) errors.push(`${piece.def.type}: ${broken}`);
    }
    if (errors.length > 0) return errors;
    this.root.value = next;
    return [];
  }

  /** Changes some of a piece's facts. A field the board binds has one writer, its IS. */
  private change(piece: Piece, patch: Readonly<Record<string, unknown>>, actor: Actor): boolean {
    const blocked = Object.keys(patch).filter((field) => piece.bound?.[field] === true);
    if (blocked.length > 0) {
      void this.fail(
        `${piece.name}: ${blocked.join(", ")} is set by an IS rule; actions can't change it`,
        actor,
      );
      return false;
    }
    if (Object.keys(patch).length === 0) return true;
    const facts = this.root.peek()[piece.name] as StoredState;
    const unknown = Object.keys(patch).filter((key) => !(key in facts));
    if (unknown.length > 0) {
      void this.fail(
        `${piece.name}: ${unknown.map((k) => `${piece.def.type} has no stored field "${k}"`).join("; ")}`,
        actor,
      );
      return false;
    }
    const errors = this.commit({ [piece.name]: { ...facts, ...patch } });
    if (errors.length > 0) {
      void this.fail(`${piece.name}: ${errors.join("; ")}`, actor);
      return false;
    }
    return true;
  }

  /** How a rule or a script's arguments read the board: a piece's view. */
  private at: BoardAt = (piece) => this.getView(typeof piece === "string" ? piece : piece.name);

  // ---- WHEN ----

  private compileWhen(rule: WhenRule): CompiledWhen {
    const { prop, member } = splitTarget(rule.on);
    return {
      prop,
      signal: member,
      condition: rule.if,
      script: rule.do,
    };
  }

  /**
   * Signals are answered one at a time, in order. A signal raised while answering waits its turn.
   * `from`: the act it is a consequence of (see SignalRecord).
   */
  private enqueue(name: string, emit: Raised, actor: Actor, from: number | undefined): void {
    if (this.isDisposed) return;
    const record: SignalRecord = {
      n: ++this.count,
      prop: name,
      signal: emit.signal,
      payload: emit.payload ?? {},
      actor,
    };
    if (from !== undefined) record.from = from;
    this.queue.push(record);
    if (this.isDispatching) return;
    this.isDispatching = true;
    try {
      for (let next = this.queue.shift(); next !== undefined; next = this.queue.shift())
        this.dispatch(next);
    } finally {
      this.isDispatching = false;
    }
  }

  private dispatch(record: SignalRecord): void {
    for (const listener of this.signalListeners) listener(record);
    for (const rule of this.whenRules) {
      if (rule.prop !== record.prop || rule.signal !== record.signal) continue;
      if (rule.condition !== undefined) {
        try {
          if (!rule.condition(this.at)) continue;
        } catch (error) {
          this.services.onError(
            `Board ${this.board.name}: WHEN ${record.prop}.${record.signal} condition`,
            error,
          );
          continue;
        }
      }
      // The rule's script runs on its own; the next signal doesn't wait for it to finish. What
      // Jugnu sets off stays Jugnu's, so his limits hold through the lesson's own rules too.
      // Everything it does is a consequence of the act that raised the signal.
      const cause = record.from ?? record.n;
      if (record.actor === Actor.Jugnu) void this.run(rule.script, Actor.Jugnu, true, cause);
      else void this.run(rule.script, Actor.Lesson, false, cause);
    }
  }

  // ---- THEN ----

  /**
   * `isSetOff`: a lesson rule answering something Jugnu did (his limits still hold). `cause`: the
   * act a lesson rule is answering; undefined for a script run directly (Jugnu's own).
   */
  private async run(
    script: Script,
    actor: Actor = Actor.Lesson,
    isSetOff = false,
    cause: number | undefined = undefined,
  ): Promise<void> {
    if (this.isDisposed) return;
    if (Array.isArray(script)) {
      for (const step of script) await this.run(step, actor, isSetOff, cause);
      return;
    }
    if ("seq" in script) {
      for (const step of script.seq) await this.run(step, actor, isSetOff, cause);
      return;
    }
    if ("par" in script) {
      await Promise.all(script.par.map((step) => this.run(step, actor, isSetOff, cause)));
      return;
    }
    if ("wait" in script) {
      await this.clock.wait(script.wait);
      return;
    }
    const { prop, member } = splitTarget(script.call);
    let args: Record<string, unknown>;
    try {
      args = this.resolveArgs(script.args);
    } catch (error) {
      this.services.onError(`Board ${this.board.name}: ${script.call} arguments`, error);
      return;
    }
    await this.invoke(prop, member, args, actor, isSetOff, false, cause);
  }

  /** Arguments are plain values, or a function of the board worked out when the call runs. */
  private resolveArgs(args: CallArgs | undefined): Record<string, unknown> {
    return typeof args === "function" ? args(this.at) : { ...(args ?? {}) };
  }
}
