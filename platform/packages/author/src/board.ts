import {
  type Board,
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
  BOARD,
  BoardAction,
  BoardSignal,
  type PropDef,
  PropRole,
  QuestionSignal,
  type Size,
  type StoredState,
} from "@chalk/prop";
import { Expr } from "./expr";
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

/** Turns authoring values into plain JSON: a Dec becomes a number, an Expr an expression argument. */
export function plain(value: unknown): unknown {
  if (value instanceof Dec) return value.toNumber();
  if (value instanceof Expr) return { expr: value.source };
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
  | { kind: typeof StepKind.Expect; that: Rule<boolean> | Expr; says: string };

/** The name every board's root layout gets. */
export const ROOT_NAME = "page";

type PropPiece = Extract<Piece, { kind: typeof PieceKind.Prop }>;

/** A wrong answer that should get a particular note: how to reach it, and what should show. */
export type NoteCheck = { steps: readonly Step[]; feedback: Localized };

type LayoutPiece = Exclude<Piece, PropPiece>;

/** Any placed prop, whatever its state type: enough to lay it out or show and hide it. */
export type AnyPlaced = { readonly name: string; readonly piece: PropPiece };

/**
 * A prop placed on a board, by name. Its stored fields, derived fields, signals and actions are typed
 * from its definition: naming one the prop doesn't have is a compile error.
 */
export class Placed<
  S extends StoredState = StoredState,
  A extends string = string,
  G extends string = string,
  D extends string = string,
> implements AnyPlaced
{
  constructor(
    readonly name: string,
    readonly def: PropDef<S, A, G, D>,
    readonly piece: PropPiece,
  ) {}

  /** A stored field, for rules: `line.field("marker")`. */
  field(key: keyof S & string): Expr {
    return new Expr(`${this.name}.${key}`);
  }

  /** A derived field, for rules: `line.derived(NumberLineDerived.Level)`. */
  derived(key: D): Expr {
    return new Expr(`${this.name}.${key}`);
  }

  /** One of its actions, as a reference (e.g. to make it the student's alone). */
  action(action: A): ActionRef {
    return { target: `${this.name}.${action}` };
  }

  /** One of its signals, for a WHEN rule. */
  on(signal: G): Signal {
    return { target: `${this.name}.${signal}` };
  }

  /** The lesson (or a rule) runs one of its actions. */
  call(action: A, args: Args = {}): Script {
    const out: { call: string; args?: Record<string, unknown> } = {
      call: `${this.name}.${action}`,
    };
    if (Object.keys(args).length > 0) out.args = plain(args) as Record<string, unknown>;
    return out;
  }

  /** A witness step: the learner does this. */
  learner(action: A, args: Args = {}): Step {
    return { kind: StepKind.Act, prop: this.name, action, args: plain(args) as Args };
  }
}

/** What a rule written as code sees of a placed prop: its stored fields, and its derived ones. */
export type ViewOfPlaced<P> = P extends Placed<infer S, infer _A, infer _G, infer D>
  ? Readonly<S & { readonly [K in D]: unknown }>
  : Readonly<Record<string, unknown>>;

/** How a rule written as code reads the board, typed: `at(race).time`. */
export type At = <P extends AnyPlaced>(piece: P) => ViewOfPlaced<P>;

/** A rule's value or condition as code: `(at) => at(race).time > 36`. */
export type Rule<T = unknown> = (at: At) => T;

/** The rule as the board keeps it (its `at` takes a piece or a name, untyped). */
export const asRuleFn = (rule: Rule): RuleFn => rule as unknown as RuleFn;

/** The placed form of a prop definition: `PlacedOf<typeof numberLineDef>`. */
export type PlacedOf<P> = P extends PropDef<infer S, infer A, infer G, infer D>
  ? Placed<S, A, G, D>
  : never;

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
  isPassed: new Expr(`${BOARD}.isPassed`),
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
  private readonly placed: Placed<StoredState, string, string, string>[] = [];
  private readonly propsStandFor: Record<string, string> = {};

  /** Places a prop: `b.prop(numberLine, "line", { from: 2, to: 3 })`. */
  prop<S extends StoredState, A extends string, G extends string, D extends string>(
    def: PropDef<S, A, G, D>,
    name: string,
    given: Given<S> = {},
    options: { isHidden?: boolean; size?: Size } = {},
  ): Placed<S, A, G, D> {
    if (this.names.has(name)) throw new Error(`Two props named "${name}" on one board`);
    if (name === BOARD) throw new Error(`"${BOARD}" is the board itself; pick another name`);
    this.names.add(name);
    const piece: PropPiece = { kind: PieceKind.Prop, name, prop: def.type };
    const fields = plain(given) as Record<string, unknown>;
    if (Object.keys(fields).length > 0) piece.with = fields;
    if (options.isHidden === true) piece.isHidden = true;
    if (options.size !== undefined) piece.size = { ...options.size };
    noteStack(piece, framesHere());
    const placed = new Placed(name, def, piece);
    this.placed.push(placed as unknown as Placed<StoredState, string, string, string>);
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

  /** IS: this input always equals the rule's value (`(at) => at(line).marker ** 2`). */
  is(input: Expr, to: Rule | Expr): void {
    this.isRules.push({ set: input.source, to: to instanceof Expr ? to.source : asRuleFn(to) });
  }

  /** IS for words: the input always reads this text, with {expressions} filled in. */
  isText(input: Expr, text: Localized): void {
    this.isRules.push({ set: input.source, text });
  }

  /** WHEN: on this signal (and if the condition holds), run the script. */
  when(signal: Signal, script: Script | readonly Script[], condition?: Rule<boolean> | Expr): void {
    const rule: WhenRule = {
      on: signal.target,
      do: Array.isArray(script) ? [...script] : (script as Script),
    };
    if (condition !== undefined)
      rule.if = condition instanceof Expr ? condition.source : asRuleFn(condition);
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
          .map((c) => String(c.args?.name)),
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
export function expect(that: Rule<boolean> | Expr, says: string): Step {
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
function scriptCalls(script: Script): { call: string; args?: Record<string, unknown> }[] {
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
