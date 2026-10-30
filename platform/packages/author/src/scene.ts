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
  type SignalDef,
  type Tools,
  type VarsOf,
  action,
  prop,
  signal,
} from "@chalk/prop/next";
import { type ZodTypeAny, z } from "zod";
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

/**
 * The signal `path` names: the board's own ("board.said"), a piece's ("ask.checked"), or one of a
 * part inside a piece ("town.walker.arrived").
 */
function signalAt(pieces: Pieces, path: string): SignalDef | undefined {
  const names = path.split(".");
  // Continue moves the student on: nothing on this board is heard after it.
  if (names[0] === BOARD_EVENTS)
    return names.length === 2 && names[1] !== "continued"
      ? (sceneSignals as Readonly<Record<string, SignalDef>>)[names[1] ?? ""]
      : undefined;
  const signal = names.pop();
  const [first, ...rest] = names;
  let def: AnyProp | undefined =
    first === undefined || !Object.hasOwn(pieces, first) ? undefined : pieces[first]?.def;
  for (const part of rest) def = def?.children?.[part];
  return signal === undefined ? undefined : def?.signals?.[signal];
}

/** Whether `path` names a piece ("town") or a part inside one ("town.walker"). */
function isPartAt(pieces: Pieces, path: string): boolean {
  const [first, ...rest] = path.split(".");
  let def: AnyProp | undefined =
    first === undefined || !Object.hasOwn(pieces, first) ? undefined : pieces[first]?.def;
  for (const part of rest) def = def?.children?.[part];
  return def !== undefined;
}

/** A signal's fields, each with its kind. */
const shapeOf = (signal: SignalDef): Readonly<Record<string, ZodTypeAny>> =>
  (signal.payload as unknown as { shape?: Record<string, ZodTypeAny> }).shape ?? {};

/** Whether a told value is the one `where` asks for: the same value, field by field, in any order. */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) => sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  );
}

/** What a piece starts with: some of its variables, and of its children's, by name. */
export type GivenFor<D> = Partial<VarsOf<D>> & {
  readonly [K in keyof ChildrenOf<D>]?: GivenFor<ChildrenOf<D>[K]>;
};

/**
 * What a piece says when it appears (platform/docs/sound.md): the lesson's own words for it, when
 * they aren't what the piece itself says (a text its words, a question its prompt), and who says
 * them (a character of the book's cast; the narrator when no one is named).
 */
export type Says = { readonly says?: Localized; readonly speaker?: string };

/** A prop placed on a board: what it is, what it starts with, how it is shown and heard. */
export type Placed<D extends AnyProp = AnyProp> = Says & {
  readonly def: D;
  readonly given: Given;
  readonly isHidden: boolean;
  readonly size?: Size;
  /** Drawn still, as a picture of what it shows (in words): nothing on it responds. */
  readonly still?: Localized;
};

/**
 * A line the board says with nothing on screen of its own: narration, or a character's line. Its
 * moment is written with it as data, so every view shows exactly what runs: `when` a piece's signal
 * is told, `where` it carries these values (`town.walker.arrived · x 4, y 5`). Without a moment, a
 * rule says it (`t.self.say`). `about`: the piece it is about, which glows while it plays.
 */
export type FreeLine = {
  readonly says: Localized;
  readonly speaker?: string;
  /** The moment: a piece's signal, by path ("town.walker.arrived"). */
  readonly when?: string;
  /** Which of those moments: the values the signal must carry (`{ x: 4, y: 5 }`). */
  readonly where?: Readonly<Record<string, unknown>>;
  /**
   * Which of those moments, when values can't say it (it depends on the board as it is): code,
   * which the script can only show as a condition in code. Prefer `where`.
   */
  readonly if?: (
    payload: Readonly<Record<string, unknown>>,
    me: Readonly<Record<string, unknown>>,
  ) => boolean;
  readonly about?: string;
};

/** A narration line: `lines: { watch: line(t("Watch the street…", "…")) }`. */
export function line(says: Localized, options: Omit<FreeLine, "says"> = {}): FreeLine {
  return { says, ...options };
}

/** Places a prop: `place(coordinatePlane, { plane: { upLines: [] } })`. */
export function place<D extends AnyProp>(
  def: D,
  given: GivenFor<D> = {} as GivenFor<D>,
  options: { isHidden?: boolean; size?: Size; still?: Localized } & Says = {},
): Placed<D> {
  return {
    def,
    given: given as Given,
    isHidden: options.isHidden === true,
    ...(options.size === undefined ? {} : { size: options.size }),
    ...(options.still === undefined ? {} : { still: options.still }),
    ...(options.says === undefined ? {} : { says: options.says }),
    ...(options.speaker === undefined ? {} : { speaker: options.speaker }),
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
    /** The line in turn: being said, or in the breath before it. */
    speaking: z.string().nullable(),
    /**
     * Lines declared on a moment that came, in order: said before the opening goes on. Only hush
     * drops them.
     */
    next: z.array(z.string()),
    /** The pieces' lines still to be read (the opening, top to bottom): a piece shown drops them. */
    waiting: z.array(z.string()),
  })
  .strict();
type SceneVars = z.infer<typeof sceneVariables>;

const sceneActions = {
  start: action(),
  show: action({ name: z.string().min(1) }),
  hide: action({ name: z.string().min(1) }),
  /** Says a line now (a piece's, or a narration line), cutting the one being said. */
  say: action({ line: z.string().min(1) }),
  /**
   * A line declared on a moment is due: it is said after the line in turn, before the opening goes
   * on, in the order lines came due. Nothing is cut or dropped.
   */
  sayNext: action({ line: z.string().min(1) }),
  /**
   * If no line is in turn, the next is said: a line due, else the next piece waiting (after a
   * breath, when a line has just ended). Every step that adds lines ends with it.
   */
  goOn: action({ isAfterLine: z.boolean() }),
  /** Stops the line being said, and drops every line due or waiting. */
  hush: action(),
  /** A line has ended (the voice bus): the next waiting is said, and what waits for it runs. */
  lineEnded: action({ line: z.string().min(1) }),
  pass: action(),
  continue: action({}, { from: "screen" }),
};
type SceneActions = typeof sceneActions;
/**
 * What the board itself tells: it opened, a piece was shown, a line was said (it ended), it passed,
 * Continue. Real events, written `board.<signal>`: lines can be declared on them, and the script
 * shows every moment as one of them.
 */
const sceneSignals = {
  started: signal(),
  shown: signal({ name: z.string().min(1) }),
  said: signal({ line: z.string().min(1) }),
  passed: signal(),
  continued: signal(),
};
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

type Lines = Readonly<Record<string, FreeLine>>;

export type SceneSpec<P extends Pieces, L extends Lines = Record<never, never>> = {
  /** The pieces, top to bottom. */
  readonly pieces: P;
  /** Narration: lines with nothing on screen of their own, said by rules (`t.self.say({ line })`). */
  readonly lines?: L;
  /** When a line has been said (a piece's, or a narration line), do these things. */
  readonly onSaid?: {
    readonly [K in (keyof P | keyof L) & string]?: (me: SceneMe<P>, t: SceneTools<P>) => Outs;
  };
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
/** How the board's own events are written: `board.said`. */
const BOARD_EVENTS = "board";
/** Seconds of quiet between one line and the next, as a reader takes a breath between paragraphs. */
const BETWEEN_LINES = 0.7;
/** A scene, ready to be built as a board (by `page` or a family). */
export type Scene = { readonly [SCENE]: true; readonly build: (name: string) => BuiltBoard };

export function isScene(value: unknown): value is Scene {
  return typeof value === "object" && value !== null && SCENE in value;
}

type AnyFn = (...args: never[]) => unknown;
const list = (outs: Outs): Out[] =>
  outs === undefined || outs === false || outs === null
    ? []
    : Array.isArray(outs)
      ? [...(outs as readonly Out[])]
      : [outs as Out];

/** A board as its pieces and rules: `page("street-and-house", scene({ pieces, hear, witness }))`. */
export function scene<const P extends Pieces, const L extends Lines = Record<never, never>>(
  spec: SceneSpec<P, L>,
): Scene {
  return {
    [SCENE]: true,
    build: (name) => buildScene(name, spec as unknown as SceneSpec<Pieces, Lines>),
  };
}

function buildScene(name: string, spec: SceneSpec<Pieces, Lines>): BuiltBoard {
  const names = Object.keys(spec.pieces);
  // "board" names the board's own events (board.said): a piece can't have that name.
  if (names.includes(BOARD_EVENTS))
    throw new Error(`Board ${name}: a piece can't be named "${BOARD_EVENTS}" (the board's own)`);
  const defs = Object.fromEntries(names.map((n) => [n, (spec.pieces[n] as Placed).def]));
  const freeLines = spec.lines ?? {};
  for (const [line, free] of Object.entries(freeLines)) {
    if (Object.hasOwn(spec.pieces, line))
      throw new Error(`Board ${name}: "${line}" is both a piece and a line; name the line apart`);
    const signal = free.when === undefined ? undefined : signalAt(spec.pieces, free.when);
    if (free.when !== undefined && signal === undefined)
      throw new Error(
        `Board ${name}, line ${line}: when "${free.when}" isn't a signal of a piece here ("town.walker.arrived")`,
      );
    if (free.where !== undefined) {
      if (signal === undefined)
        throw new Error(`Board ${name}, line ${line}: where needs a when (the signal it is about)`);
      // The values must be what the signal carries: its own fields, each of its own kind.
      const shape = shapeOf(signal);
      const isFit = Object.entries(free.where).every(
        ([k, v]) => shape[k]?.safeParse(v).success === true,
      );
      if (!isFit)
        throw new Error(
          `Board ${name}, line ${line}: where ${JSON.stringify(free.where)} isn't what ${free.when} carries (${Object.keys(shape).join(", ")})`,
        );
    }
    if (free.about !== undefined && !isPartAt(spec.pieces, free.about))
      throw new Error(
        `Board ${name}, line ${line}: about "${free.about}" isn't a piece here, or a part inside one ("town.walker")`,
      );
  }
  const questions = names.filter((n) => (defs[n] as AnyProp).role === PropRole.Question);
  const isHidden = (n: string) => (spec.pieces[n] as Placed).isHidden;

  type Me = SceneVars & Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  type T = {
    set: (patch: Partial<SceneVars>) => Out;
    tell: Record<keyof SceneSignals, (payload?: object) => Out>;
    self: {
      pass: () => Out;
      show: (p: { name: string }) => Out;
      lineEnded: (p: { line: string }) => Out;
      sayNext: (p: { line: string }) => Out;
      goOn: (p: { isAfterLine: boolean }) => Out;
    };
    to: Record<string, Record<string, (payload?: object) => Out>>;
    say: (line: string, options?: { atEnd?: readonly Out[]; after?: number }) => Out;
    hush: () => Out;
  };
  const onSaid = (spec.onSaid ?? {}) as Record<string, AnyFn | undefined>;
  /**
   * The voice bus, line by line: each piece's line (what the piece says, or the lesson's words for
   * it) and the narration lines. The host finds a line's words and audio by its name; a piece with
   * nothing to say ends at once. Lines waiting (the opening, read top to bottom) follow each other
   * with a breath between.
   */
  const sayNow = (t: T, line: string): Out => t.say(line, { atEnd: [t.self.lineEnded({ line })] });
  const sayAfterBreath = (t: T, line: string): Out =>
    t.say(line, { atEnd: [t.self.lineEnded({ line })], after: BETWEEN_LINES });

  // The board's own rules run first, the lesson's next, and the lines declared on a moment last:
  // a line written for a moment is what is heard at it (a piece the lesson shows then doesn't cut it).
  type OwnRule = (me: Me, payload: unknown, t: T) => Out[];
  const own: Record<string, OwnRule[]> = {};
  const addOwn = (key: string, rule: OwnRule) => {
    own[key] = [...(own[key] ?? []), rule];
  };
  /** The lines declared on a moment that are due when it is told with this payload. */
  type LineRule = (me: Me, payload: unknown) => string[];
  const linesAt: Record<string, LineRule[]> = {};
  const addLine = (key: string, rule: LineRule) => {
    linesAt[key] = [...(linesAt[key] ?? []), rule];
  };
  if (spec.passBy !== "rules")
    for (const q of questions)
      addOwn(`${q}.correct`, (me, _, t) =>
        questions.every((other) => me[other]?.status === AnswerStatus.Correct) && !me.isPassed
          ? [t.self.pass()]
          : [],
      );
  for (const [line, free] of Object.entries(freeLines))
    if (free.when !== undefined)
      addLine(free.when, (me, payload) => {
        const told = payload as Readonly<Record<string, unknown>>;
        const isThis =
          Object.entries(free.where ?? {}).every(([k, v]) => sameValue(told[k], v)) &&
          (free.if === undefined || free.if(told, me));
        return isThis ? [line] : [];
      });
  const uses = spec.uses ?? [];
  const rulesFrom = [spec.hear ?? {}, ...uses.map((u) => u.hear ?? {})] as Record<
    string,
    AnyFn | undefined
  >[];
  const hear: Record<string, AnyFn> = {};
  // The board's own events are told by the scene itself: lines declared on them run where it tells
  // them (below); the rest are its pieces' signals, heard.
  const isBoardEvent = (key: string) => key.startsWith(`${BOARD_EVENTS}.`);
  const dueAt = (key: string, me: Me, payload: unknown): string[] =>
    (linesAt[key] ?? []).flatMap((rule) => rule(me, payload));
  // The lines due at one of the board's own events: the board places them in what it says itself.
  const dueAtBoard = (event: keyof typeof sceneSignals, me: unknown, payload: object) =>
    dueAt(`${BOARD_EVENTS}.${event}`, me as Me, payload);
  const tell = (t: unknown, event: keyof typeof sceneSignals, payload: object): Out =>
    ((t as T).tell[event] as (p?: object) => Out)(payload);
  const keys = new Set(
    [
      ...Object.keys(own),
      ...Object.keys(linesAt),
      ...rulesFrom.flatMap((r) => Object.keys(r)),
    ].filter((k) => !isBoardEvent(k)),
  );
  for (const key of keys)
    hear[key] = (me: Me, payload: unknown, t: T) => [
      ...(own[key] ?? []).flatMap((rule) => rule(me, payload, t)),
      ...rulesFrom.flatMap((r) =>
        list(r[key]?.(me as never, payload as never, t as never) as Outs),
      ),
      // Last, the lines due at this moment: after what the board and the lesson did at it.
      ...dueAt(key, me, payload).map((line) => (t as T).self.sayNext({ line })),
      (t as T).self.goOn({ isAfterLine: false }),
    ];
  const give: Record<string, Record<string, unknown>> = {};
  for (const one of [spec.give ?? {}, ...uses.map((u) => u.give ?? {})])
    for (const [piece, needs] of Object.entries(one as Record<string, Record<string, unknown>>))
      give[piece] = { ...(give[piece] ?? {}), ...needs };

  const root = prop({
    type: "scene",
    describe: spec.purpose ?? `The board ${name}.`,
    variables: sceneVariables,
    start: {
      hidden: names.filter(isHidden),
      isPassed: false,
      speaking: null,
      next: [],
      waiting: [],
    },
    actions: sceneActions,
    signals: sceneSignals,
    children: defs as Readonly<Record<string, AnyProp>>,
    ...(Object.keys(give).length === 0 ? {} : { give: give as never }),
    on: {
      // The board opens: the pieces showing are read top to bottom, one after another.
      start: (me, _, t) => {
        const atOnce = spec.passBy !== "rules" && questions.length === 0;
        return [
          t.set({ waiting: names.filter((n) => !me.hidden.includes(n)) }),
          tell(t, "started", {}),
          ...dueAtBoard("started", me, {}).map((line) => t.self.sayNext({ line })),
          ...(atOnce ? [t.self.pass()] : []),
          t.self.goOn({ isAfterLine: false }),
        ];
      },
      // A piece shown says its line at once: the student has moved on, so the line in turn is cut
      // and the opening's reads are dropped. Lines due stay due: they follow it.
      show: (me, { name: piece }, t) =>
        me.hidden.includes(piece) && [
          t.set({ hidden: me.hidden.filter((n) => n !== piece), speaking: piece, waiting: [] }),
          sayNow(t as unknown as T, piece),
          tell(t, "shown", { name: piece }),
          ...dueAtBoard("shown", me, { name: piece }).map((line) => t.self.sayNext({ line })),
        ],
      // A rule says a line now: as a piece shown, it cuts the line in turn and the opening's reads.
      say: (_, { line }, t) => {
        if (!Object.hasOwn(spec.pieces, line) && !Object.hasOwn(freeLines, line))
          throw new Error(`Board ${name}: no line "${line}" (a piece's name, or one of its lines)`);
        return [t.set({ speaking: line, waiting: [] }), sayNow(t as unknown as T, line)];
      },
      // The line in turn ended: the board tells it, the lesson's rules on it run, the lines due at it
      // come due, and the board goes on. (A line cut before it ended is no longer in turn.)
      lineEnded: (me, { line }, t) =>
        me.speaking === line && [
          t.set({ speaking: null }),
          tell(t, "said", { line }),
          ...list(onSaid[line]?.(me as never, t as never) as Outs),
          ...dueAtBoard("said", me, { line }).map((due) => t.self.sayNext({ line: due })),
          t.self.goOn({ isAfterLine: true }),
        ],
      sayNext: (me, { line }, t) => {
        if (!Object.hasOwn(freeLines, line))
          throw new Error(`Board ${name}: no line "${line}" of its own`);
        return t.set({ next: [...me.next, line] });
      },
      goOn: (me, { isAfterLine }, t) => {
        if (me.speaking !== null) return;
        const [due, ...moreDue] = me.next;
        const [read, ...moreReads] = me.waiting;
        const line = due ?? read;
        if (line === undefined) return;
        const tt = t as unknown as T;
        return [
          t.set(
            due === undefined
              ? { speaking: line, waiting: moreReads }
              : { speaking: line, next: moreDue },
          ),
          isAfterLine ? sayAfterBreath(tt, line) : sayNow(tt, line),
        ];
      },
      // A piece hidden is no longer heard: its read is dropped, and cut if it is in turn.
      hide: (me, { name: piece }, t) =>
        !me.hidden.includes(piece) && [
          t.set({
            hidden: [...me.hidden, piece],
            waiting: me.waiting.filter((n) => n !== piece),
          }),
          ...(me.speaking === piece
            ? [
                (t as unknown as T).hush(),
                t.set({ speaking: null }),
                t.self.goOn({ isAfterLine: false }),
              ]
            : []),
        ],
      hush: (_, __, t) => [
        t.set({ speaking: null, next: [], waiting: [] }),
        (t as unknown as T).hush(),
      ],
      // Passed: the lines due at it are said after what the lesson does at the same moment (the
      // step that passed the board goes on).
      pass: (me, _, t) =>
        !me.isPassed && [
          t.set({ isPassed: true }),
          tell(t, "passed", {}),
          ...dueAtBoard("passed", me, {}).map((line) => t.self.sayNext({ line })),
        ],
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
  // What each piece says, when the lesson gives its own words, and the narration lines.
  const lines: Record<string, { says?: Localized; speaker?: string }> = {};
  for (const n of names) {
    const placed = spec.pieces[n] as Placed;
    if (placed.says !== undefined || placed.speaker !== undefined)
      lines[n] = {
        ...(placed.says === undefined ? {} : { says: placed.says }),
        ...(placed.speaker === undefined ? {} : { speaker: placed.speaker }),
      };
  }
  for (const [n, free] of Object.entries(freeLines))
    lines[n] = {
      says: free.says,
      ...(free.speaker === undefined ? {} : { speaker: free.speaker }),
      ...(free.when === undefined ? {} : { when: free.when }),
      ...(free.where === undefined ? {} : { where: free.where }),
      ...(free.if === undefined ? {} : { hasCondition: true }),
      ...(free.about === undefined ? {} : { about: free.about }),
    };
  const model: SceneModel = { scene: root, given, lines, freeLines: Object.keys(freeLines) };
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
