import { type Localized, type Piece, PieceKind, type SceneModel } from "@chalk/content";
import { AnswerStatus, PropRole, type Size } from "@chalk/prop";
import {
  type AnyProp,
  type ChildrenOf,
  type Given,
  type HeardPaths,
  type Out,
  type Outs,
  type Prop,
  type Rule,
  type Tools,
  type VarsOf,
  action,
  prop,
  signal,
} from "@chalk/prop/next";
import { z } from "zod";
import { type BuiltBoard, type NoteCheck, type Step, StepKind } from "./board";

/**
 * A board on the event model (platform/docs/event-model.md): the scene is the outermost prop. Its
 * children are the pieces, top to bottom; its rules (`hear`) are the lesson's: on this signal,
 * do these things. It also does what every board does:
 *
 * - it starts (`start`): what is shown is said, in order;
 * - it shows a piece (`show`), which then says its line, after whatever is being said;
 * - it passes (`pass`): when its questions are all right, at once with none, or by a rule
 *   (`passBy: "rules"`, then `t.self.pass()`);
 * - Continue (`continue`) tells `continued`, and the player goes on.
 */

/** What a piece starts with: some of its variables, and of its children's, by name. */
export type GivenFor<D> = Partial<VarsOf<D>> & {
  readonly [K in keyof ChildrenOf<D>]?: GivenFor<ChildrenOf<D>[K]>;
};

/** A prop placed on a board: what it is, what it starts with, how it is shown. */
export type Placed<D extends AnyProp = AnyProp> = {
  readonly def: D;
  readonly given: Given;
  readonly isHidden: boolean;
  readonly size?: Size;
  /** Drawn still, as a picture of what it shows (in words): nothing on it responds. */
  readonly still?: Localized;
};

/** Places a prop: `place(coordinatePlane, { plane: { upLines: [] } })`. */
export function place<D extends AnyProp>(
  def: D,
  given: GivenFor<D> = {} as GivenFor<D>,
  options: { isHidden?: boolean; size?: Size; still?: Localized } = {},
): Placed<D> {
  return {
    def,
    given: given as Given,
    isHidden: options.isHidden === true,
    ...(options.size === undefined ? {} : { size: options.size }),
    ...(options.still === undefined ? {} : { still: options.still }),
  };
}

/** The same piece, hidden until a rule shows it (`t.self.show({ name: "found" })`). */
export function hidden<D extends AnyProp>(placed: Placed<D>): Placed<D> {
  return { ...placed, isHidden: true };
}

type Pieces = Readonly<Record<string, Placed>>;
type ChildrenOfPieces<P extends Pieces> = { readonly [K in keyof P]: P[K]["def"] };

const sceneVariables = z
  .object({
    /** The pieces not shown yet. */
    hidden: z.array(z.string()),
    isPassed: z.boolean(),
    /** Lines waiting to be said, in order; the first is being said. */
    saying: z.array(z.string()),
  })
  .strict();
type SceneVars = z.infer<typeof sceneVariables>;

const sceneActions = {
  start: action(),
  show: action({ name: z.string().min(1) }),
  hide: action({ name: z.string().min(1) }),
  pass: action(),
  continue: action({}, { from: "screen" }),
};
type SceneActions = typeof sceneActions;
const sceneSignals = { started: signal(), passed: signal(), continued: signal() };
type SceneSignals = typeof sceneSignals;

/** What a scene's rules read: its own variables and every piece by name. */
type SceneMe<P extends Pieces> = Readonly<SceneVars> & {
  readonly [K in keyof P]: import("@chalk/prop/next").ReaderOf<P[K]["def"]>;
};
type SceneTools<P extends Pieces> = Tools<
  SceneVars,
  SceneActions,
  SceneSignals,
  ChildrenOfPieces<P>
>;

export type SceneSpec<P extends Pieces> = {
  /** The pieces, top to bottom. */
  readonly pieces: P;
  /** The lesson's rules: on a piece's signal ("town.walker.arrived"), do these things. */
  readonly hear?: {
    readonly [K in HeardPaths<ChildrenOfPieces<P>>]?: Rule<
      SceneMe<P>,
      Parameters<
        NonNullable<
          NonNullable<
            Prop<
              SceneVars,
              Record<never, never>,
              Record<never, never>,
              SceneActions,
              SceneSignals,
              ChildrenOfPieces<P>
            >["hear"]
          >[K]
        >
      >[1],
      SceneTools<P>
    >;
  };
  /** What the scene gives a piece for a need (a question's `isMet`). */
  readonly give?: {
    readonly [K in keyof P]?: {
      readonly [J in keyof import("@chalk/prop/next").NeedsOf<P[K]["def"]>]?: (
        me: SceneMe<P>,
      ) => import("@chalk/prop/next").NeedsOf<P[K]["def"]>[J];
    };
  };
  /**
   * Ready-made parts a pattern brings (a question with its check, its notes and its witness): their
   * rules, what they give, their witness steps and note checks, joined with the scene's own.
   */
  readonly uses?: readonly SceneUse[];
  /** "rules": the board passes only when a rule says `t.self.pass()`. Else by its questions. */
  readonly passBy?: "rules";
  /** How a learner gets this board right, played on the real props at publish. */
  readonly witness?: readonly Step[];
  /** Wrong answers and the note each should get, played at publish too. */
  readonly noteChecks?: readonly NoteCheck[];
  /** For Jugnu: what the board is for, and what its pieces stand for. */
  readonly purpose?: string;
  readonly standsFor?: { readonly [K in keyof P]?: string };
};

/** What a pattern adds to a scene, untyped: it names its own pieces' paths. */
export type SceneUse = {
  readonly give?: Readonly<Record<string, Readonly<Record<string, (me: never) => unknown>>>>;
  readonly hear?: Readonly<Record<string, (me: never, payload: never, t: never) => Outs>>;
  readonly witness?: readonly Step[];
  readonly noteChecks?: readonly NoteCheck[];
};

const SCENE = Symbol("scene");
/** Seconds of quiet between one line and the next, as a reader takes a breath between paragraphs. */
const BETWEEN_LINES = 0.7;
/** A scene, ready to be built as a board (by `page` or a family). */
export type Scene = { readonly [SCENE]: true; readonly build: (name: string) => BuiltBoard };

export function isScene(value: unknown): value is Scene {
  return typeof value === "object" && value !== null && SCENE in value;
}

/** Whether a prop says lines: it has one (`speech`), an action `say` and a signal `said`. */
const speaks = (def: AnyProp) =>
  def.speech !== undefined && def.actions?.say !== undefined && def.signals?.said !== undefined;

type AnyFn = (...args: never[]) => unknown;
const list = (outs: Outs): Out[] =>
  outs === undefined || outs === false || outs === null
    ? []
    : Array.isArray(outs)
      ? [...(outs as readonly Out[])]
      : [outs as Out];

/** A board as its pieces and rules: `page("street-and-house", scene({ pieces, hear, witness }))`. */
export function scene<const P extends Pieces>(spec: SceneSpec<P>): Scene {
  return { [SCENE]: true, build: (name) => buildScene(name, spec as unknown as SceneSpec<Pieces>) };
}

function buildScene(name: string, spec: SceneSpec<Pieces>): BuiltBoard {
  const names = Object.keys(spec.pieces);
  const defs = Object.fromEntries(names.map((n) => [n, (spec.pieces[n] as Placed).def]));
  const speaking = names.filter((n) => speaks(defs[n] as AnyProp));
  const questions = names.filter((n) => (defs[n] as AnyProp).role === PropRole.Question);
  const isHidden = (n: string) => (spec.pieces[n] as Placed).isHidden;

  type Me = SceneVars & Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  type T = {
    set: (patch: Partial<SceneVars>) => Out;
    tell: Record<keyof SceneSignals, () => Out>;
    self: { pass: () => Out; show: (p: { name: string }) => Out };
    to: Record<string, Record<string, (payload?: object) => Out>>;
  };
  /** Says `next` lines after what is being said: the first starts now if nothing is. */
  const say = (me: Me, t: T, next: readonly string[]): Out[] => {
    if (next.length === 0) return [];
    const saying = [...me.saying, ...next];
    const first = next[0] as string;
    return [t.set({ saying }), ...(me.saying.length === 0 ? [askSay(t, first)] : [])];
  };
  const askSay = (t: T, piece: string, after?: number): Out =>
    (t.to[piece]?.say as (p: { after?: number }) => Out)(after === undefined ? {} : { after });

  // Every board's own rules, then the lesson's on the same signal.
  const own: Record<string, (me: Me, payload: unknown, t: T) => Out[]> = {};
  for (const piece of speaking)
    own[`${piece}.said`] = (me, _, t) => {
      const rest = me.saying.slice(1);
      const next = rest[0];
      // A breath between one paragraph and the next.
      return [
        t.set({ saying: rest }),
        ...(next === undefined ? [] : [askSay(t, next, BETWEEN_LINES)]),
      ];
    };
  if (spec.passBy !== "rules")
    for (const q of questions)
      own[`${q}.correct`] = (me, _, t) =>
        questions.every((other) => me[other]?.status === AnswerStatus.Correct) && !me.isPassed
          ? [t.self.pass()]
          : [];
  const uses = spec.uses ?? [];
  const rulesFrom = [spec.hear ?? {}, ...uses.map((u) => u.hear ?? {})] as Record<
    string,
    AnyFn | undefined
  >[];
  const hear: Record<string, AnyFn> = {};
  const keys = new Set([...Object.keys(own), ...rulesFrom.flatMap((r) => Object.keys(r))]);
  for (const key of keys) {
    const mine = own[key];
    hear[key] = (me: Me, payload: unknown, t: T) => [
      ...(mine?.(me, payload, t) ?? []),
      ...rulesFrom.flatMap((r) =>
        list(r[key]?.(me as never, payload as never, t as never) as Outs),
      ),
    ];
  }
  const give: Record<string, Record<string, unknown>> = {};
  for (const one of [spec.give ?? {}, ...uses.map((u) => u.give ?? {})])
    for (const [piece, needs] of Object.entries(one as Record<string, Record<string, unknown>>))
      give[piece] = { ...(give[piece] ?? {}), ...needs };

  const root = prop({
    type: "scene",
    describe: spec.purpose ?? `The board ${name}.`,
    variables: sceneVariables,
    start: { hidden: names.filter(isHidden), isPassed: false, saying: [] },
    actions: sceneActions,
    signals: sceneSignals,
    children: defs as Readonly<Record<string, AnyProp>>,
    ...(Object.keys(give).length === 0 ? {} : { give: give as never }),
    on: {
      start: (me, _, t) => {
        const shown = speaking.filter((n) => !me.hidden.includes(n));
        const atOnce = spec.passBy !== "rules" && questions.length === 0;
        return [
          t.tell.started(),
          ...say(me as unknown as Me, t as unknown as T, shown),
          ...(atOnce ? [t.self.pass()] : []),
        ];
      },
      // A piece shown says its line at once: the student has moved on, so whatever was being said
      // stops, and what was waiting to be said is dropped.
      show: (me, { name: piece }, t) => {
        if (!me.hidden.includes(piece)) return;
        const shown = t.set({ hidden: me.hidden.filter((n) => n !== piece) });
        if (!speaking.includes(piece)) return shown;
        const now = me.saying[0];
        const tt = t as unknown as T;
        return [
          shown,
          t.set({ saying: [piece] }),
          ...(now === undefined || tt.to[now]?.hush === undefined
            ? []
            : [(tt.to[now].hush as () => Out)()]),
          askSay(tt, piece),
        ];
      },
      hide: (me, { name: piece }, t) =>
        !me.hidden.includes(piece) && t.set({ hidden: [...me.hidden, piece] }),
      pass: (me, _, t) => !me.isPassed && [t.set({ isPassed: true }), t.tell.passed()],
      continue: (me, _, t) => me.isPassed && t.tell.continued(),
    },
    hear: hear as never,
  });

  const given: Record<string, Given> = {};
  for (const n of names) given[n] = (spec.pieces[n] as Placed).given;
  const pieces: Piece[] = names.map((n) => {
    const placed = spec.pieces[n] as Placed;
    return {
      kind: PieceKind.Prop,
      name: n,
      prop: placed.def.type,
      with: placed.given as Record<string, unknown>,
      ...(placed.isHidden ? { isHidden: true } : {}),
      ...(placed.size === undefined ? {} : { size: placed.size }),
      ...(placed.still === undefined ? {} : { still: placed.still }),
    };
  });
  const model: SceneModel = { scene: root, given };
  const standsFor = Object.fromEntries(
    Object.entries(spec.standsFor ?? {}).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;
  return {
    board: {
      name,
      root: {
        kind: PieceKind.Column,
        name: "page",
        children: [...pieces, { kind: PieceKind.Space, name: "space1" }],
      },
      is: [],
      when: [],
      studentOnly: [],
      model,
      ...(spec.purpose !== undefined || Object.keys(standsFor).length > 0
        ? {
            jugnu: {
              ...(spec.purpose !== undefined ? { purpose: spec.purpose } : {}),
              ...(Object.keys(standsFor).length > 0 ? { props: standsFor } : {}),
            },
          }
        : {}),
    },
    witness: [...(spec.witness ?? []), ...uses.flatMap((u) => u.witness ?? [])],
    noteChecks: [...(spec.noteChecks ?? []), ...uses.flatMap((u) => u.noteChecks ?? [])],
  };
}

/** A witness step: the learner does `action` on the prop at `path` ("town.walker"). */
export function tap(
  path: string,
  action: string,
  args: Readonly<Record<string, unknown>> = {},
): Step {
  const [piece, ...rest] = path.split(".");
  return {
    kind: StepKind.Act,
    prop: piece as string,
    action: [...rest, action].join("."),
    args: { ...args },
  };
}

export type { Pieces };
