import {
  type Board,
  type CallArgs,
  type IsRule,
  type Localized,
  type Piece,
  PieceKind,
  type Pin,
  type RuleFn,
  type Script,
  type WhenRule,
} from "@chalk/content";
import { Dec } from "@chalk/exact";
import {
  AnswerStatus,
  type ArgsOf,
  type ArgsParam,
  BOARD,
  BoardAction,
  BoardSignal,
  PropRole,
  QuestionSignal,
  type Size,
  type StoredState,
  type ViewOf,
} from "@chalk/prop";
import type { ZodType } from "zod";
import { framesHere, noteStack } from "./site";

/** A field's value as an author may give it: anywhere a number goes, an exact Dec may go too. */
export type Loose<T> = T extends number
  ? number | Dec
  : T extends readonly (infer U)[]
    ? readonly Loose<U>[]
    : T extends object
      ? { [K in keyof T]: Loose<T[K]> }
      : T;

/** What an author gives a placed prop: any of its stored fields, the rest from its defaults. */
export type Given<S> = { [K in keyof S]?: Loose<S[K]> };

/** Action arguments: plain values, exact Decs, or expressions worked out when the action runs. */
export type Args = Readonly<Record<string, unknown>>;

/** Turns authoring values into plain JSON: a Dec becomes a number. */
export function plain(value: unknown): unknown {
  if (value instanceof Dec) return value.toNumber();
  if (Array.isArray(value)) return value.map(plain);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  }
  return value;
}

/** A signal a rule can answer: "line.zoomed". */
export type Signal = { readonly target: string };

/** An action of a placed prop: "line.moveMarker". */
export type ActionRef = { readonly target: string };

/**
 * One step of a witness: what a learner does (or waits for, or should see) to show a board works.
 * Publish plays witnesses on the real props; a question whose witness fails is not published.
 */
export const StepKind = { Act: "act", Expect: "expect" } as const;
export type StepKind = (typeof StepKind)[keyof typeof StepKind];

/** A pause on the board's clock: the same step in a witness as in a script (`wait(2)`). */
export type Wait = { wait: number };

export type Step =
  | { kind: typeof StepKind.Act; prop: string; action: string; args: Args }
  | Wait
  | { kind: typeof StepKind.Expect; that: Rule<boolean>; says: string };

/** The name every board's root layout gets. */
export const ROOT_NAME = "page";

type PropPiece = Extract<Piece, { kind: typeof PieceKind.Prop }>;

/** A wrong answer that should get a particular note: how to reach it, and what should show. */
export type NoteCheck = { steps: readonly Step[]; feedback: Localized };

type LayoutPiece = Exclude<Piece, PropPiece>;

/** Any placed prop, whatever its state type: enough to lay it out or show and hide it. */
export type AnyPlaced = { readonly name: string; readonly piece: PropPiece };

/** A prop definition as content places it: its state, actions, signals and derived values. */
export type DefLike = {
  readonly type: string;
  readonly state: ZodType<StoredState>;
  readonly actions: object;
  readonly signals?: object;
  readonly derived?: object;
  readonly role?: string;
};

type ActionsOf<P> = P extends { actions: infer X } ? X : never;
type ActionNames<P> = keyof ActionsOf<P> & string;
type SignalNames<P> = P extends { signals?: infer G } ? keyof NonNullable<G> & string : never;
type StateOfDef<P> = P extends { state: ZodType<infer S> } ? S : never;
type InputNames<P> = P extends { inputs?: readonly (infer I)[] } ? I & string : never;
type FieldOf<P, K extends string> = K extends keyof StateOfDef<P> ? StateOfDef<P>[K] : never;
/** A field of a placed prop that a lesson owns with an IS rule. */
export type InputRef<P = DefLike, K extends string = string> = {
  readonly target: string;
  /** Only carries the types: which prop and field. */
  readonly __input?: [P, K];
};
/** What an action of a placed prop takes, as an author may write it (exact Decs where numbers go). */
type TakesOf<P, K extends ActionNames<P>> = ArgsParam<Loose<ArgsOf<ActionsOf<P>[K]>>>;
/** What a lesson's call takes: the arguments, or a rule working them out when the call runs. */
type CallTakes<P, K extends ActionNames<P>> =
  | TakesOf<P, K>
  | [args: Rule<Loose<ArgsOf<ActionsOf<P>[K]>>>];

/**
 * One entry per name: `byName(names, (n) => …)`, typed by the caller. A name by path (a group's
 * child's, "walker.step") is nested under the child: `town.call.walker.step()`.
 */
function byName<T>(names: readonly string[], make: (name: string) => T): Record<string, T> {
  const out: Record<string, unknown> = {};
  for (const n of names) {
    const path = n.split(".");
    let at = out;
    for (const part of path.slice(0, -1)) {
      at[part] ??= {};
      at = at[part] as Record<string, unknown>;
    }
    at[path.at(-1) as string] = make(n);
  }
  return out as Record<string, T>;
}

/** Entries named by path ("walker.step"), nested by their first parts: `{ walker: { step } }`. */
export type Nested<M, P extends string = ""> = {
  readonly [K in keyof M & string as K extends `${P}${infer R}`
    ? R extends `${string}.${string}`
      ? never
      : R
    : never]: M[K];
} & {
  readonly [K in keyof M & string as K extends `${P}${infer H}.${string}` ? H : never]: Nested<
    M,
    `${P}${K extends `${P}${infer H}.${string}` ? H : never}.`
  >;
};

/**
 * A prop placed on a board, by name. Its actions and signals are reached by name from its
 * definition (`split.learner.split({ n: 4 })`, `game.on.over`), with their arguments typed: naming
 * one the prop doesn't have, or giving it the wrong arguments, is a compile error.
 */
export class Placed<P extends DefLike = DefLike> implements AnyPlaced {
  /** Its signals, for a WHEN rule: `game.on.over` (a group's child's: `town.on.walker.arrived`). */
  readonly on: Nested<{ readonly [K in SignalNames<P>]: Signal }>;
  /**
   * The lesson (or a rule) runs one of its actions: `game.call.giveRound()`, or with arguments
   * worked out when it runs: `chart.call.addPoint((at) => ({ x: at(coin).count, y: 0 }))`.
   */
  readonly call: Nested<{
    readonly [K in ActionNames<P>]: (...args: CallTakes<P, K>) => Script;
  }>;
  /** A witness step, the learner doing one of its actions: `split.learner.split({ n: 4 })`. */
  readonly learner: Nested<{ readonly [K in ActionNames<P>]: (...args: TakesOf<P, K>) => Step }>;
  /** One of its actions as a reference (to make it the student's alone): `line.action.moveMarker`. */
  readonly action: Nested<{ readonly [K in ActionNames<P>]: ActionRef }>;

  constructor(
    readonly name: string,
    readonly def: P,
    readonly piece: PropPiece,
  ) {
    const actions = Object.keys(def.actions);
    this.on = byName(Object.keys(def.signals ?? {}), (s) => ({
      target: `${name}.${s}`,
    })) as Placed<P>["on"];
    this.call = byName(actions, (a) => (args?: Args | Rule<Args>): Script => {
      const out: { call: string; args?: CallArgs } = { call: `${name}.${a}` };
      if (typeof args === "function") {
        const rule = asRuleFn(args as Rule);
        out.args = (at) => plain(rule(at)) as Record<string, unknown>;
      } else if (args !== undefined && Object.keys(args).length > 0)
        out.args = plain(args) as Record<string, unknown>;
      return out;
    }) as unknown as Placed<P>["call"];
    this.learner = byName(
      actions,
      (a) =>
        (args?: Args): Step => ({
          kind: StepKind.Act,
          prop: name,
          action: a,
          args: plain(args ?? {}) as Args,
        }),
    ) as unknown as Placed<P>["learner"];
    this.action = byName(actions, (a) => ({ target: `${name}.${a}` })) as Placed<P>["action"];
  }

  /** The fields a lesson may own with an IS rule (the prop's `inputs`): `b.is(box.input.text, …)`. */
  get input(): { readonly [K in InputNames<P>]: InputRef<P, K> } {
    const inputs = ((this.def as { inputs?: readonly string[] }).inputs ?? []) as readonly string[];
    return byName(inputs, (field) => ({ target: `${this.name}.${field}` })) as never;
  }
}

/** What a rule written as code sees of a placed prop: its stored fields, and its derived ones. */
export type ViewOfPlaced<P> = P extends Placed<infer D>
  ? Readonly<ViewOf<D>>
  : Readonly<Record<string, unknown>>;

/** How a rule written as code reads the board, typed: `at(race).time`. */
export type At = <P extends AnyPlaced>(piece: P) => ViewOfPlaced<P>;

/** A rule's value or condition as code: `(at) => at(race).time > 36`. */
export type Rule<T = unknown> = (at: At) => T;

/** The rule as the board keeps it (its `at` takes a piece or a name, untyped). */
export const asRuleFn = (rule: Rule): RuleFn => rule as unknown as RuleFn;

/** The placed form of a prop definition: `PlacedOf<typeof numberLineDef>`. */
export type PlacedOf<P extends DefLike> = Placed<P>;

export type Child = AnyPlaced | Piece;

function pieceOf(child: Child): Piece {
  return "kind" in child ? child : child.piece;
}

export type LayoutOptions = { gap?: number };

/** Children top to bottom. */
export function column(children: readonly Child[], options: LayoutOptions = {}): Piece {
  return { kind: PieceKind.Column, name: "", ...options, children: children.map(pieceOf) };
}

/** Children side by side. */
export function row(children: readonly Child[], options: LayoutOptions = {}): Piece {
  return { kind: PieceKind.Row, name: "", ...options, children: children.map(pieceOf) };
}

/** Children stacked on the first one; `pins` places the others by name. */
export function overlay(
  children: readonly Child[],
  pins: Readonly<Record<string, Pin>> = {},
): Piece {
  return { kind: PieceKind.Overlay, name: "", children: children.map(pieceOf), pins: { ...pins } };
}

/** Empty room that pushes its neighbours apart. */
export function space(): Piece {
  return { kind: PieceKind.Space, name: "" };
}

/** A pause on the board's clock, in a script or a witness. */
export function wait(seconds: number): Wait {
  return { wait: seconds };
}

/** One after another. (Not called `then`: a module exporting `then` hangs `await import`.) */
export function inOrder(...steps: Script[]): Script {
  return { seq: steps };
}

/** All together; finishes when all do. */
export function together(...steps: Script[]): Script {
  return { par: steps };
}

/** The board itself: show, hide, let the learner go on. */
export const theBoard = {
  started: { target: `${BOARD}.${BoardSignal.Started}` } as Signal,
  pass: (): Script => ({ call: `${BOARD}.${BoardAction.Pass}` }),
  show: (prop: AnyPlaced): Script => ({
    call: `${BOARD}.${BoardAction.Show}`,
    args: { name: prop.name },
  }),
  hide: (prop: AnyPlaced): Script => ({
    call: `${BOARD}.${BoardAction.Hide}`,
    args: { name: prop.name },
  }),
};

/** What building a board gives: the board itself, and the witnesses that show it works. */
export type BuiltBoard = {
  board: Board;
  witness: readonly Step[];
  noteChecks: readonly NoteCheck[];
};

/** Collects a board's props, rules and witnesses while an author's build function runs. */
export class BoardKit {
  private readonly names = new Set<string>();
  private readonly isRules: IsRule[] = [];
  private readonly whenRules: WhenRule[] = [];
  private readonly studentOnlyActions: string[] = [];
  private readonly steps: Step[] = [];
  private readonly notes: NoteCheck[] = [];
  private boardPurpose: string | undefined;
  /** The page's own `passWhen` rules. */
  private readonly passesWhen = new Set<WhenRule>();
  private readonly placed: Placed[] = [];
  private readonly propsStandFor: Record<string, string> = {};

  /** Places a prop: `b.prop(numberLine, "line", { from: 2, to: 3 })`. */
  prop<P extends DefLike>(
    def: P,
    name: string,
    given: Given<StateOfDef<P>> = {},
    options: {
      isHidden?: boolean;
      size?: Size;
      /** Drawn still, as a picture of what it shows (in words): nothing on it responds. */
      still?: Localized;
    } = {},
  ): Placed<P> {
    if (this.names.has(name)) throw new Error(`Two props named "${name}" on one board`);
    if (name === BOARD) throw new Error(`"${BOARD}" is the board itself; pick another name`);
    this.names.add(name);
    const piece: PropPiece = { kind: PieceKind.Prop, name, prop: def.type };
    const fields = plain(given) as Record<string, unknown>;
    if (Object.keys(fields).length > 0) piece.with = fields;
    if (options.isHidden === true) piece.isHidden = true;
    if (options.size !== undefined) piece.size = { ...options.size };
    if (options.still !== undefined) piece.still = { ...options.still };
    noteStack(piece, framesHere());
    const placed = new Placed(name, def, piece);
    this.placed.push(placed as unknown as Placed);
    return placed;
  }

  /**
   * What appears later: these pieces start hidden and show when `trigger` fires (and `if` holds).
   * A question as the trigger means "once it is answered right". Presence on the board is one
   * stored fact, so a later rule may hide a piece again (`when(…, theBoard.hide(p))`).
   */
  after(
    trigger: Signal | AnyPlaced,
    pieces: AnyPlaced | readonly AnyPlaced[],
    options: { if?: Rule<boolean> } = {},
  ): void {
    const list: readonly AnyPlaced[] = "piece" in pieces ? [pieces] : pieces;
    if (list.length === 0) throw new Error("after(...): name the pieces that appear");
    for (const p of list) p.piece.isHidden = true;
    this.when(signalOf(trigger), list.map(theBoard.show), options.if);
  }

  /**
   * When the learner may go on, if not when the page's questions are all answered right (or at
   * once, on a page with none): on this signal, if the condition holds. May be given more than once.
   */
  passWhen(signal: Signal, options: { if?: Rule<boolean> } = {}): void {
    this.when(signal, theBoard.pass(), options.if);
    const rule = this.whenRules.at(-1);
    if (rule !== undefined) this.passesWhen.add(rule);
  }

  /** IS: this input always equals the rule's value (`b.is(box.input.text, (at) => …)`). */
  is<P extends DefLike, K extends InputNames<P>>(
    input: InputRef<P, K>,
    to: Rule<FieldOf<P, K>>,
  ): void {
    this.isRules.push({ set: input.target, to: asRuleFn(to) });
  }

  /** WHEN: on this signal (and if the condition holds), run the script. */
  when(signal: Signal, script: Script | readonly Script[], condition?: Rule<boolean>): void {
    const rule: WhenRule = {
      on: signal.target,
      do: Array.isArray(script) ? [...script] : (script as Script),
    };
    if (condition !== undefined) rule.if = asRuleFn(condition);
    this.whenRules.push(rule);
  }

  /** An action only the learner may do here (Jugnu can never do it for them). */
  studentOnly(action: ActionRef): void {
    this.studentOnlyActions.push(action.target);
  }

  /** For Jugnu, in plain English: what this board is for ("estimate √2 by squeezing"). */
  purpose(text: string): void {
    this.boardPurpose = text;
  }

  /** For Jugnu, in plain English: what a prop stands for here ("the student's guess for √2"). */
  standsFor(prop: AnyPlaced, text: string): void {
    this.propsStandFor[prop.name] = text;
  }

  /** How a learner gets this board right. Played on the real props at publish. */
  witness(...steps: Step[]): void {
    this.steps.push(...steps);
  }

  /** A wrong answer and the note it should get. Played at publish too. */
  noteCheck(check: NoteCheck): void {
    this.notes.push(check);
  }

  /**
   * A board passes when its questions are all answered right, or at once if it has none, unless it
   * says `passWhen`. It never passes by a rule of its own.
   */
  private derivePass(name: string): void {
    const passRule = this.whenRules.find(
      (r) => !this.passesWhen.has(r) && callsIn(r.do).includes(PASS),
    );
    if (passRule !== undefined)
      throw new Error(
        `Board ${name}: ${passRule.on} passes the board by a rule; use passWhen (or let its questions pass it)`,
      );
    if (this.passesWhen.size > 0) return;
    const questions = this.placed.filter((p) => p.def.role === PropRole.Question);
    if (questions.length === 0) {
      this.whenRules.unshift({ on: theBoard.started.target, do: theBoard.pass() });
      return;
    }
    const allRight = (at: At) => questions.every((q) => at(q).status === AnswerStatus.Correct);
    for (const q of questions)
      this.when(signalOf(q), theBoard.pass(), questions.length === 1 ? undefined : allRight);
  }

  /** Every piece that starts hidden is shown by some rule (else it could never appear). */
  private checkShown(name: string, root: Piece): void {
    const shown = new Set(
      this.whenRules.flatMap((r) =>
        scriptCalls(r.do)
          .filter((c) => c.call === SHOW)
          .map((c) => (typeof c.args === "function" ? undefined : String(c.args?.name))),
      ),
    );
    const never = [...walkLayout(root)].filter((p) => p.isHidden === true && !shown.has(p.name));
    if (never.length > 0)
      throw new Error(
        `Board ${name}: ${never.map((p) => p.name).join(", ")} start hidden and nothing shows them (use after)`,
      );
  }

  /** A board's pieces, top to bottom: laid out in a column with room at the bottom. */
  finish(name: string, built: readonly Child[]): BuiltBoard {
    if (!Array.isArray(built))
      throw new Error(`Board ${name}: return its pieces as a list, top to bottom: [a, b, c]`);
    this.derivePass(name);
    const named = pieceOf(column([...built, space()]));
    const onBoard = new Set<string>();
    const collect = (piece: Piece): void => {
      if (piece.kind === PieceKind.Prop) onBoard.add(piece.name);
      else if ("children" in piece) for (const child of piece.children) collect(child);
    };
    collect(named);
    const missing = [...this.names].filter((n) => !onBoard.has(n));
    if (missing.length > 0) {
      throw new Error(
        `placed but not in the layout: ${missing.join(", ")} (add them to a column or row)`,
      );
    }
    nameLayouts(named, this.names);
    this.checkShown(name, named);
    return {
      board: {
        name,
        root: named,
        is: this.isRules,
        when: this.whenRules,
        studentOnly: this.studentOnlyActions,
        ...(this.boardPurpose !== undefined || Object.keys(this.propsStandFor).length > 0
          ? {
              jugnu: {
                ...(this.boardPurpose !== undefined ? { purpose: this.boardPurpose } : {}),
                ...(Object.keys(this.propsStandFor).length > 0
                  ? { props: { ...this.propsStandFor } }
                  : {}),
              },
            }
          : {}),
      },
      witness: this.steps,
      noteChecks: this.notes,
    };
  }
}

/** A witness step: this should hold now (`(at) => at(race).time === 36`). */
export function expect(that: Rule<boolean>, says: string): Step {
  return { kind: StepKind.Expect, that, says };
}

/** Layout pieces get names nobody has to write: the root is "page", the rest "row1", "column2", … */
function nameLayouts(root: Piece, taken: Set<string>): void {
  let count = 0;
  const visit = (piece: Piece, isRoot: boolean): void => {
    if (piece.kind === PieceKind.Prop) return;
    const layout = piece as LayoutPiece;
    if (layout.name === "") {
      let name = isRoot ? ROOT_NAME : `${layout.kind}${++count}`;
      while (taken.has(name)) name = `${layout.kind}${++count}`;
      layout.name = name;
      taken.add(name);
    }
    if ("children" in layout) for (const child of layout.children) visit(child, false);
  };
  visit(root, true);
}

/** Runs an author's build function and returns the finished board. */
export function buildBoard(name: string, build: (b: BoardKit) => readonly Child[]): BuiltBoard {
  const kit = new BoardKit();
  return kit.finish(name, build(kit));
}

const PASS = `${BOARD}.${BoardAction.Pass}`;
const SHOW = `${BOARD}.${BoardAction.Show}`;

/** A trigger as the signal it waits for: a question means its Correct. */
function signalOf(trigger: Signal | AnyPlaced): Signal {
  if ("target" in trigger) return trigger;
  if (trigger instanceof Placed && trigger.def.role === PropRole.Question)
    return { target: `${trigger.name}.${QuestionSignal.Correct}` };
  throw new Error(`${trigger.name} isn't a question; wait for one of its signals instead`);
}

/** Every call in a script, in order. */
function scriptCalls(script: Script): { call: string; args?: CallArgs }[] {
  if (Array.isArray(script)) return script.flatMap(scriptCalls);
  if ("seq" in script) return script.seq.flatMap(scriptCalls);
  if ("par" in script) return script.par.flatMap(scriptCalls);
  if ("call" in script) return [script];
  return [];
}

function callsIn(script: Script): string[] {
  return scriptCalls(script).map((c) => c.call);
}

/** Every piece in a layout. */
function* walkLayout(piece: Piece): Generator<Piece> {
  yield piece;
  if ("children" in piece) for (const child of piece.children) yield* walkLayout(child);
}
