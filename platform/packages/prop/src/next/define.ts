import { type ZodObject, type ZodRawShape, type ZodType, type ZodTypeDef, z } from "zod";
import { type FrameKindName, type FramePixels, type PropRole, noteNames } from "../define";
import type { GroupLayoutSpec } from "../group";
import type { Size } from "../size";

/**
 * The event model's one building block (platform/docs/event-model.md). Every prop has the same
 * parts; a prop that doesn't need one leaves it out:
 *
 * - `variables`: its own data. Anyone reads them; only its own rules change them.
 * - `facts`: worked out from its variables, needs and children; read like variables.
 * - `needs`: what whatever holds it must give it (a template's requirements). Read live, never copied.
 * - `actions`: in, what it can be asked to do; `from: "screen"` means the student can ask.
 * - `signals`: out, news it tells. Whatever holds it (and so on up to the board) may hear it.
 * - `on`: one rule per action. `hear`: one rule per child signal it listens to.
 * - `children`: the props it holds; `give`: what it gives a child whose need isn't one of its own names.
 */

/** Where a student's event comes from. */
export const SCREEN = "screen";

/** A payload: plain data, so it can be logged, replayed and read by an agent. */
export type Payload = Readonly<Record<string, unknown>>;

export type ActionDef<P extends Payload = Payload> = {
  readonly payload: ZodType<P, ZodTypeDef, unknown>;
  /** Phantom: what it carries, for typing a view's `call` (never set). */
  readonly carries?: P;
  /** The student can ask for it (a tap, a drag, a key). */
  readonly isFromScreen: boolean;
  /** What it does, for an agent reading what the student can do. */
  readonly describe?: string;
};

export type SignalDef<P extends Payload = Payload> = {
  readonly payload: ZodType<P, ZodTypeDef, unknown>;
};

type Strict<Sh extends ZodRawShape> = z.infer<ZodObject<Sh, "strict">>;

/** Something a prop can be asked to do, and what it carries: `action({ direction }, { from: "screen" })`. */
export function action<const Sh extends ZodRawShape = Record<never, never>>(
  payload?: Sh,
  options: { from?: typeof SCREEN; describe?: string } = {},
): ActionDef<Strict<Sh>> {
  return {
    payload: z.object(payload ?? ({} as Sh)).strict(),
    isFromScreen: options.from === SCREEN,
    ...(options.describe === undefined ? {} : { describe: options.describe }),
  };
}

/** News a prop tells, and what it carries: `signal({ x: z.number(), y: z.number() })`. */
export function signal<const Sh extends ZodRawShape = Record<never, never>>(
  payload?: Sh,
): SignalDef<Strict<Sh>> {
  return { payload: z.object(payload ?? ({} as Sh)).strict() };
}

/** How a planned move eases from start to end. Named, so a move is plain data. */
export const Ease = { Linear: "linear", Smooth: "smooth" } as const;
export type Ease = (typeof Ease)[keyof typeof Ease];

/**
 * What a rule asks for, as data: built only by the tools a rule is handed (`t.set`, `t.tell`, …),
 * applied by the board.
 */
export type Out =
  | { readonly kind: "set"; readonly patch: Payload }
  | { readonly kind: "tell"; readonly signal: string; readonly payload: Payload }
  /** An action of this prop (`path` empty) or of a prop it holds. */
  | {
      readonly kind: "ask";
      readonly path: readonly string[];
      readonly action: string;
      readonly payload: Payload;
    }
  | { readonly kind: "later"; readonly seconds: number; readonly outs: readonly Out[] }
  | {
      readonly kind: "move";
      readonly variable: string;
      readonly to: unknown;
      readonly takes: number;
      readonly ease: Ease;
      /** Done as this prop when the move ends. */
      readonly atEnd: readonly Out[];
    }
  /** Drops what this prop has queued for later, and stops its moves where they are. */
  | { readonly kind: "stop" }
  /**
   * Says a line of the board aloud (by its name: a piece's line, or one of the scene's own), on the
   * voice bus: it cuts the line being said. `atEnd` is done, as this prop, when the line ends; a
   * line with nothing to say ends at once. Where its words and audio come from is the host's.
   */
  | {
      readonly kind: "say";
      readonly line: string;
      readonly atEnd: readonly Out[];
      /** Seconds of quiet first (a breath between lines); cutting the line cuts its quiet too. */
      readonly after?: number;
    }
  /** Stops the line being said: its `atEnd` never comes. */
  | { readonly kind: "hush" };

/** What a rule returns: one out, several, or nothing (`p.x === 4 && t.tell.arrived(p)`). */
export type Outs = Out | readonly Out[] | undefined | false | null;

// ---- the types a prop's parts are read and written through ----

type Rec = Readonly<Record<string, unknown>>;
type Actions = Readonly<Record<string, ActionDef>>;
type Signals = Readonly<Record<string, SignalDef>>;

declare const parts: unique symbol;
/** A defined prop's types, kept on it (never set) so they can be read back out. */
type Parts<V, N, F, A, S, C> = { v: V; n: N; f: F; a: A; s: S; c: C };
export type VarsOf<P> = P extends {
  readonly [parts]?: Parts<infer V, unknown, unknown, unknown, unknown, unknown>;
}
  ? V
  : never;
export type NeedsOf<P> = P extends {
  readonly [parts]?: Parts<unknown, infer N, unknown, unknown, unknown, unknown>;
}
  ? N
  : never;
export type FactsOf<P> = P extends {
  readonly [parts]?: Parts<unknown, unknown, infer F, unknown, unknown, unknown>;
}
  ? F
  : never;
export type ActionsOf<P> = P extends {
  readonly [parts]?: Parts<unknown, unknown, unknown, infer A, unknown, unknown>;
}
  ? A
  : never;
export type SignalsOf<P> = P extends {
  readonly [parts]?: Parts<unknown, unknown, unknown, unknown, infer S, unknown>;
}
  ? S
  : never;
export type ChildrenOf<P> = P extends {
  readonly [parts]?: Parts<unknown, unknown, unknown, unknown, unknown, infer C>;
}
  ? C
  : never;

export type PayloadOf<D> = D extends { payload: ZodType<infer P, ZodTypeDef, unknown> } ? P : never;
type PayloadArgs<D> = Record<never, never> extends PayloadOf<D>
  ? [payload?: PayloadOf<D>]
  : [payload: PayloadOf<D>];

/** What a prop reads of itself (and its holder of it): variables, needs, facts, children by name. */
export type Me<V, N, F, C> = Readonly<V & N & F> & { readonly [K in keyof C]: ReaderOf<C[K]> };

/** What anyone reads from a prop. */
export type ReaderOf<P> = Me<VarsOf<P>, NeedsOf<P>, FactsOf<P>, ChildrenOf<P>>;

/** A prop's actions, and its children's, as calls that build an `ask`: `t.to.places.chooseTarget({ x, y })`. */
type Asks<P> = {
  readonly [K in keyof ActionsOf<P>]: (...payload: PayloadArgs<ActionsOf<P>[K]>) => Out;
} & {
  readonly [K in keyof ChildrenOf<P>]: Asks<ChildrenOf<P>[K]>;
};

/** Every signal of the props a prop holds, by path from it: "walker.stepped", "town.walker.arrived". */
export type HeardPaths<C, Depth extends unknown[] = []> = string extends keyof C
  ? never // children not known yet (the prop being written generically)
  : Depth["length"] extends 4
    ? never
    : {
        [K in keyof C & string]:
          | `${K}.${keyof SignalsOf<C[K]> & string}`
          | `${K}.${HeardPaths<ChildrenOf<C[K]>, [...Depth, unknown]>}`;
      }[keyof C & string];

/** What the signal at a path carries. */
type HeardPayload<C, Path> = Path extends `${infer K}.${infer Rest}`
  ? K extends keyof C
    ? Rest extends keyof SignalsOf<C[K]>
      ? PayloadOf<SignalsOf<C[K]>[Rest]>
      : HeardPayload<ChildrenOf<C[K]>, Rest>
    : never
  : never;

/** The tools a rule is handed. Each builds an `Out`; nothing happens until the board applies them. */
export type Tools<V, A, S, C> = {
  /** Changes this prop's own variables. */
  readonly set: (patch: Partial<V>) => Out;
  /** Tells one of this prop's signals. */
  readonly tell: { readonly [K in keyof S]: (...payload: PayloadArgs<S[K]>) => Out };
  /** Asks this prop to do one of its own actions (one more event, after this rule). */
  readonly self: { readonly [K in keyof A]: (...payload: PayloadArgs<A[K]>) => Out };
  /** Asks a prop it holds: `t.to.places.chooseTarget({ x: 4, y: 5 })`. */
  readonly to: { readonly [K in keyof C]: Asks<C[K]> };
  /** Does `outs` (as this prop) `seconds` from now on the board's clock. */
  readonly later: (seconds: number, ...outs: Out[]) => Out;
  /**
   * A planned move: `variable` goes from where it is now to `to` over `takes` seconds; reading it
   * meanwhile gives where it is. Numbers (and objects of numbers) ease; anything else switches at
   * the end. `atEnd` is done when it arrives. Setting the variable meanwhile stops the move.
   */
  readonly move: <K extends keyof V & string>(
    variable: K,
    to: V[K],
    takes: number,
    options?: { ease?: Ease; atEnd?: readonly Out[] },
  ) => Out;
  /** Drops everything this prop has queued, and stops its moves where they are. */
  readonly stop: () => Out;
};

/**
 * The board's voice bus, for the one that keeps a board's lines (the scene): not for props, whose
 * models know nothing of sound, nor for a lesson's rules, which say lines through the scene
 * (`t.self.say`), so what waits for a line always hears it end.
 */
export type VoiceTools = {
  /** Says a line of the board (cutting the one being said); `atEnd` is done when it ends. */
  readonly say: (line: string, options?: { atEnd?: readonly Out[]; after?: number }) => Out;
  /** Stops the line being said. */
  readonly hush: () => Out;
};

export type Rule<Me, P, T> = (me: Me, payload: P, t: T) => Outs;

/** Every prop's parts, as written. */
export type PropSpec<
  V extends Rec,
  N extends Rec,
  F extends Rec,
  A extends Actions,
  S extends Signals,
  C extends Readonly<Record<string, AnyProp>>,
> = {
  /** Its type, as the board and agents name it ("walker"). */
  readonly type: string;
  /** What it is for, first sentence first. */
  readonly describe: string;
  readonly variables?: ZodType<V, ZodTypeDef, unknown>;
  /** Its variables before anyone sets them. */
  readonly start?: V;
  readonly needs?: ZodType<N, ZodTypeDef, unknown>;
  /** Worked out from its variables, needs and children (a fact using another calls a function). */
  readonly facts?: { readonly [K in keyof F]: (me: Me<V, N, unknown, C>) => F[K] };
  readonly actions?: A;
  readonly signals?: S;
  readonly children?: C;
  /**
   * What it gives a child, one need at a time, for the needs it doesn't have under the same name:
   * `give: { walker: { target: (me) => me.places.target } }`. Each is read only when that need is.
   */
  readonly give?: {
    readonly [K in keyof C]?: {
      readonly [J in keyof NeedsOf<C[K]>]?: (me: Me<V, N, F, C>) => NeedsOf<C[K]>[J];
    };
  };
  readonly on?: {
    readonly [K in keyof A]?: Rule<Me<V, N, F, C>, PayloadOf<A[K]>, Tools<V, A, S, C>>;
  };
  readonly hear?: {
    readonly [K in HeardPaths<C>]?: Rule<Me<V, N, F, C>, HeardPayload<C, K>, Tools<V, A, S, C>>;
  };

  // ---- what stays as it is today: how it is drawn, sized and read ----

  /** Its role: a question (the board's chrome reads its status), an explainer, … */
  readonly role?: PropRole;
  readonly size?: Size;
  /** It is a frame others draw on: the plane, a number line's axis. */
  readonly frame?: {
    readonly kind: FrameKindName;
    readonly pixels: (me: Me<V, N, F, C>, width: number) => FramePixels;
    readonly label?: (me: Me<V, N, F, C>) => string;
  };
  /** How its children are laid out (a frame and the places round it, a column). */
  readonly layout?: GroupLayoutSpec<keyof C & string>;
  /** Whether a child is drawn now (a child not shown draws nothing). */
  readonly show?: { readonly [K in keyof C]?: (me: Me<V, N, F, C>) => boolean };
  /** One line saying what it is now, for agents. */
  readonly summary?: (me: Me<V, N, F, C>) => string;
  /** What must always hold of its variables beyond their types: why not, or undefined. */
  readonly invariant?: (variables: V) => string | undefined;
  /** Variables it knows but doesn't show (the answer): kept from the student and from agents' view of the screen. */
  readonly offScreen?: readonly (keyof V & string)[];
};

/** A defined prop. */
export type Prop<
  V extends Rec = Rec,
  N extends Rec = Rec,
  F extends Rec = Rec,
  A extends Actions = Actions,
  S extends Signals = Signals,
  C extends Readonly<Record<string, AnyProp>> = Readonly<Record<string, AnyProp>>,
> = PropSpec<V, N, F, A, S, C> & { readonly [parts]?: Parts<V, N, F, A, S, C> };

type AnyRule = (me: never, payload: never, t: never) => Outs;
/** Any defined prop, as the board holds it: its parts without their types. */
export type AnyProp = {
  readonly type: string;
  readonly describe: string;
  readonly variables?: ZodType;
  readonly start?: unknown;
  readonly needs?: ZodType;
  readonly facts?: Readonly<Record<string, (me: never) => unknown>>;
  readonly actions?: Actions;
  readonly signals?: Signals;
  readonly children?: Readonly<Record<string, AnyProp>>;
  readonly give?: Readonly<
    Record<string, Readonly<Record<string, ((me: never) => unknown) | undefined>> | undefined>
  >;
  readonly on?: Readonly<Record<string, AnyRule | undefined>>;
  readonly hear?: Readonly<Record<string, AnyRule | undefined>>;
  readonly role?: PropRole;
  readonly size?: Size;
  readonly frame?: {
    readonly kind: FrameKindName;
    readonly pixels: (me: never, width: number) => FramePixels;
    readonly label?: (me: never) => string;
  };
  readonly layout?: GroupLayoutSpec;
  readonly show?: Readonly<Record<string, ((me: never) => boolean) | undefined>>;
  readonly summary?: (me: never) => string;
  readonly invariant?: (variables: never) => string | undefined;
  readonly offScreen?: readonly string[];
};

/**
 * Defines a prop. Checks what types can't: no name is used twice across its variables, needs,
 * facts, actions and children (they share one reader and one `to`), and every need of every child
 * is given by name or by `give`.
 */
export function prop<
  V extends Rec = Record<never, never>,
  N extends Rec = Record<never, never>,
  F extends Rec = Record<never, never>,
  A extends Actions = Record<never, never>,
  S extends Signals = Record<never, never>,
  C extends Readonly<Record<string, AnyProp>> = Record<never, never>,
>(spec: PropSpec<V, N, F, A, S, C>): Prop<V, N, F, A, S, C> {
  const where = `prop ${spec.type}`;
  const seen = new Map<string, string>();
  const note = (names: Iterable<string>, part: string) => {
    for (const name of names) {
      const before = seen.get(name);
      if (before !== undefined)
        throw new Error(`${where}: "${name}" is both one of its ${before} and one of its ${part}`);
      seen.set(name, part);
    }
  };
  note(keysOf(spec.variables), "variables");
  note(keysOf(spec.needs), "needs");
  note(Object.keys(spec.facts ?? {}), "facts");
  note(Object.keys(spec.children ?? {}), "children");
  const asked = new Set(Object.keys(spec.actions ?? {}));
  for (const child of Object.keys(spec.children ?? {}))
    if (asked.has(child))
      throw new Error(
        `${where}: "${child}" is both an action and a child (both are asked by name)`,
      );
  if (spec.variables !== undefined) {
    if (spec.start === undefined) throw new Error(`${where}: variables need a start`);
    const parsed = spec.variables.safeParse(spec.start);
    if (!parsed.success)
      throw new Error(`${where}: its start isn't its variables: ${parsed.error.message}`);
  }
  for (const rule of Object.keys(spec.on ?? {}))
    if (!asked.has(rule))
      throw new Error(`${where}: a rule for "${rule}", which isn't one of its actions`);
  // Every child's needs: given by `give`, or by one of this prop's own names (not a child's name).
  const values = new Set([...seen].filter(([, part]) => part !== "children").map(([n]) => n));
  for (const [name, child] of Object.entries(spec.children ?? {}) as [string, AnyProp][]) {
    const given = (spec.give as AnyProp["give"])?.[name] ?? {};
    const needs = new Set(keysOf(child.needs));
    for (const key of Object.keys(given))
      if (!needs.has(key))
        throw new Error(`${where}: gives ${name} "${key}", which ${child.type} doesn't need`);
    const missing = [...needs].filter((need) => !values.has(need) && given[need] === undefined);
    if (missing.length > 0)
      throw new Error(
        `${where}: its child ${name} (${child.type}) needs ${missing.join(", ")}, which ${spec.type} doesn't have: add them, or give them (give.${name})`,
      );
  }
  // Views, tags and scripts pass actions and signals as themselves: their names are noted here.
  noteNames(spec.type, spec.actions);
  noteNames(spec.type, spec.signals);
  // Today's drawing reads a group's layout and children (`groupOf`) and a state's `defaults`.
  const compat =
    spec.layout === undefined
      ? {}
      : { group: { layout: spec.layout, children: spec.children ?? {} } };
  // Safe: only fields today's drawing reads are added; the prop's own parts are as written.
  return {
    ...spec,
    ...compat,
    start: spec.start ?? {},
    defaults: spec.start ?? {},
  } as unknown as Prop<V, N, F, A, S, C>;
}

/** The keys of an object schema (variables, needs). */
export function keysOf(schema: ZodType | undefined): string[] {
  if (schema === undefined) return [];
  return schema instanceof z.ZodObject ? Object.keys(schema.shape as object) : [];
}
