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
import { BOARD, BoardAction, BoardSignal, type PropDef, type StoredState } from "@chalk/prop";
import { Expr } from "./expr";
import { noteSite, siteHere } from "./site";

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
export const StepKind = { Act: "act", Wait: "wait", Expect: "expect" } as const;
export type StepKind = (typeof StepKind)[keyof typeof StepKind];

export type Step =
  | { kind: typeof StepKind.Act; prop: string; action: string; args: Args }
  | { kind: typeof StepKind.Wait; seconds: number }
  | { kind: typeof StepKind.Expect; that: Expr; says: string };

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
const asRuleFn = (rule: Rule): RuleFn => rule as unknown as RuleFn;

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

export function wait(seconds: number): Script {
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
  private readonly propsStandFor: Record<string, string> = {};

  /** Places a prop: `b.prop(numberLine, "line", { from: 2, to: 3 })`. */
  prop<S extends StoredState, A extends string, G extends string, D extends string>(
    def: PropDef<S, A, G, D>,
    name: string,
    given: Given<S> = {},
    options: { isHidden?: boolean } = {},
  ): Placed<S, A, G, D> {
    if (this.names.has(name)) throw new Error(`Two props named "${name}" on one board`);
    if (name === BOARD) throw new Error(`"${BOARD}" is the board itself; pick another name`);
    this.names.add(name);
    const piece: PropPiece = { kind: PieceKind.Prop, name, prop: def.type };
    const fields = plain(given) as Record<string, unknown>;
    if (Object.keys(fields).length > 0) piece.with = fields;
    if (options.isHidden === true) piece.isHidden = true;
    noteSite(piece, siteHere());
    return new Placed(name, def, piece);
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

  finish(name: string, root: Child): BuiltBoard {
    const top = pieceOf(root);
    const named = top.kind === PieceKind.Prop ? column([top]) : top;
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

/** A witness step: wait on the board's clock. */
export function after(seconds: number): Step {
  return { kind: StepKind.Wait, seconds };
}

/** A witness step: this should hold now. */
export function expect(that: Expr, says: string): Step {
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
export function buildBoard(name: string, build: (b: BoardKit) => Child): BuiltBoard {
  const kit = new BoardKit();
  return kit.finish(name, build(kit));
}
