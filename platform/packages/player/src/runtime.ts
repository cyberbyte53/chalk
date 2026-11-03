import {
  AGENT_LOCALE,
  Actor,
  BREATH,
  type Board,
  type Heard,
  type HeardWords,
  LOCALES,
  type Locale,
  type Localized,
  NARRATOR,
  type Sound,
  carries,
  propPieces,
} from "@chalk/content";
import {
  AnswerStatus,
  BOARD,
  BoardAction,
  type BoardSnapshot,
  type CanSnapshot,
  type NodeSnapshot,
  type Observation,
  type PartSnapshot,
  PropRole,
  type PropView,
  segment,
  shownOf,
} from "@chalk/prop";
import {
  type AnyProp,
  type BoardState,
  Board as Core,
  type LineCall,
  estimatedSeconds,
} from "@chalk/prop";

/** A runtime's board as data: its core's state, and how long an in-turn sound holds the voice. */
export type RuntimeState = { readonly core: BoardState; readonly heldUntil: number };
import { type Signal, signal } from "@preact/signals-core";
import type { ZodTypeAny } from "zod";
import type { ActionRecord, RuntimeServices, SignalRecord } from "./board-records";
import { describeView } from "./describe";
import { findNode } from "./part-paths";
import type { PropModule } from "./prop-module";
import { aboutOf, ownLine } from "./script";
import { takes } from "./snapshot";
import type { SoundPlaying } from "./sound/engine";
import { linePhrases } from "./sound/spoken-line";
import type { WordsToSay } from "./sound/voice";

/**
 * Where a tool's jumping clock goes (platform/docs/show.md): to the board's end; to a line by its
 * name, held there while it is said (a step done while it is said); or nowhere, held where it is.
 */
export type JumpTo = { kind: "end" } | { kind: "line"; line: string } | { kind: "here" };

/** The page's setting, for every board on it: a tool acts on one board at a time. */
export const toolClock: { to: JumpTo } = { to: { kind: "end" } };

const JUMP_LIMIT = 100_000;

/**
 * A board (platform/docs/board-model.md), running: the scene and its pieces on
 * the core's `Board`, with the same outside as `BoardRuntime`, so the player, the recorder and the
 * tools (`show`) run it the same way. Its clock moves on each screen frame; the board's
 * own timing (moves, waits, lines being said) is the core's queue.
 *
 * Jugnu doesn't run on these boards yet.
 */
export class BoardRuntime {
  readonly isScene = true;
  private readonly core: Core;
  private readonly scene: AnyProp;
  /** Bumped on every change: what views read, so they redraw. */
  private readonly version: Signal<number> = signal(0);
  private readonly signalListeners = new Set<(record: SignalRecord) => void>();
  private readonly ruleListeners = new Set<
    (record: { rule: string; did: readonly string[] }) => void
  >();
  private readonly actionListeners = new Set<(record: ActionRecord) => void>();
  /** Each act's record number, by the board's act number. */
  private readonly acts = new Map<number, number>();
  /** Who did each act, by its `n`: what it sets off is theirs too. */
  private readonly actorOf = new Map<number, Actor>();
  private readonly touched = new Set<string>();
  private count = 0;
  private startedAt: number | undefined;
  private stopFrames: (() => void) | undefined;
  private isDisposed = false;

  constructor(
    readonly board: Board,
    private readonly lookup: (type: string) => PropModule | undefined,
    private readonly services: RuntimeServices & {
      /** Stops the line being said. */
      hush?: () => void;
      /** How long a line's clips play; none (no clips yet): an estimate from its words. */
      lineSeconds?: (line: WordsToSay) => number | undefined;
      /** The board's language: what it says, and how long each line takes. */
      locale: Locale;
      /** Plays a sound alongside (sound/engine.ts): at once, never waited for; returns how to stop it. */
      playSound?: (sound: Sound, lasts?: boolean) => SoundPlaying;
      /**
       * A line is over when its sound tells it is (`speak` resolves): a student's board. Else a
       * stand-in ends it at its length, on the board's clock (a tool, a check, a test).
       */
      isHeard?: boolean;
      /**
       * The child turned the voice off (a heard board): each line is over the moment it starts,
       * since they read it at their own pace. Off mid-line ends that line (`voiceOff`).
       */
      isVoiceOff?: () => boolean;
      /** The child turned the sounds off: an in-turn sound no one hears holds no line back. */
      isSoundsOff?: () => boolean;
      /** A state to go on from (a copy of a board, to try things on): `BoardRuntime.state()`. */
      from?: RuntimeState;
      /**
       * A tool reading the board: each frame, the clock jumps through everything due, so the board
       * is where it ends at once (its lines, moves and waits each at their own time).
       */
      isJumping?: boolean;
    },
  ) {
    const model = board.model;
    this.scene = model.scene;
    const locale = services.locale;
    // What starts hidden is the board's to say (a preview shows every piece at once).
    const hidden = propPieces(board.root)
      .filter((p) => p.isHidden === true)
      .map((p) => p.name);
    // Its voice: the same for a board started fresh and one restored from a state.
    const options: ConstructorParameters<typeof Core>[2] = {
      // A line by its name: the lesson's words for it, else what its piece says of itself (its
      // sound view), with its moment's values. It lasts its clips' length (an estimate from its
      // words without clips), told to the board, which ends it itself if no end is told
      // (platform/docs/one-clock.md). What tells its end: a phone's sound, as it finishes; on a
      // silent board (a tool, a check), a stand-in at its length, on the board's clock.
      voice: (core) => {
        /** What is said for a line, logged as heard; undefined when it has nothing to say. */
        const begin = (
          call: LineCall,
          wait: number,
        ): { line: WordsToSay; heard: HeardWords } | undefined => {
          const words = this.lineWords(call.name);
          if (words === undefined) return undefined;
          const phrases = Object.fromEntries(
            LOCALES.map((l) => [l, linePhrases(words[l], l, call.values)]),
          ) as WordsToSay["phrases"];
          const said = phrases[locale];
          if (said === undefined || said.length === 0) return undefined;
          const line: WordsToSay = {
            name: call.name,
            speaker: model.lines[call.name]?.speaker ?? NARRATOR,
            phrases,
          };
          const about = aboutOf(
            model,
            call.name,
            propPieces(board.root).some((p) => p.name === call.name),
          );
          const heard: HeardWords = {
            line: call.name,
            ...(about === undefined ? {} : { about }),
            speaker: line.speaker,
            words: said.join(" "),
            at: core.now + wait,
            // Its clips' length (a fact of the clips); without clips, an estimate from its words.
            seconds: services.lineSeconds?.(line) ?? estimatedSeconds(said.join(" ")),
          };
          this.log.push(heard);
          return { line, heard };
        };
        // The line being said, until it ends: a stop meanwhile cut it.
        let hearing: HeardWords | undefined;
        // Its waits on the clock: called off when it is cut, so nothing of it is left behind.
        let waits: (() => void)[] = [];
        return {
          say: (call, hear) => {
            const isOff = services.isVoiceOff?.() === true;
            // An in-turn sound holds the voice: the line starts after it, and a breath.
            const wait =
              !isOff && this.heldUntil > core.now ? this.heldUntil - core.now + BREATH : 0;
            const begun = begin(call, wait);
            if (begun === undefined) return undefined;
            const { line, heard } = begun;
            // The voice is off: the line is on screen, and over now.
            if (isOff) {
              hear("ended");
              return 0;
            }
            hearing = heard;
            const isMine = () => hearing === heard && !this.isDisposed;
            const end = () => {
              if (!isMine()) return;
              hearing = undefined;
              hear("ended");
            };
            this.endLineNow = end;
            const start = () => {
              if (!isMine()) return;
              if (services.isHeard !== true) {
                // A stand-in for the sound: it ends when the line's clips would. (A silent
                // board's speak plays nothing; it is told what is said all the same.)
                void services.speak(line);
                waits.push(core.after(heard.seconds, end));
                return;
              }
              // The sound tells its end. One that couldn't be heard (its clips failed and the
              // phone has no voice) ends where its clips would have: the board's pace is kept.
              void services.speak(line).then((isHeard) => {
                if (!isMine()) return;
                if (isHeard) end();
                else waits.push(core.after(Math.max(0, heard.at + heard.seconds - core.now), end));
              });
            };
            if (wait > 0) waits.push(core.after(wait, start));
            else start();
            return wait + heard.seconds;
          },
          stop: () => {
            if (hearing !== undefined) hearing.cutAt = core.now;
            hearing = undefined;
            for (const callOff of waits) callOff();
            waits = [];
            this.endLineNow = undefined;
            services.hush?.();
          },
        };
      },
    };
    // A board restored from a state (a copy to try things on) goes on from it; else it starts
    // as the lesson set it up.
    this.core =
      services.from === undefined
        ? new Core(model.scene, { ...model.given, hidden }, options)
        : Core.restore(model.scene, services.from.core, options);
    if (services.from !== undefined) {
      this.heldUntil = services.from.heldUntil;
      this.isRestored = true;
    }
    this.core.watch(() => {
      this.version.value++;
    });
    this.core.listen((event) => {
      if (event.kind === "rule") {
        for (const fn of this.ruleListeners) fn({ rule: event.rule, did: event.did });
        return;
      }
      const [piece = "", ...rest] = event.path.split("/");
      const prop = piece === "" ? BOARD : piece;
      const name = [...rest, event.kind === "ask" ? event.action : event.signal].join(".");
      const n = ++this.count;
      // An act (the student's tap, the lesson or a tool asking) is recorded as itself; what a rule
      // asks, and every signal, as the consequence of the act it follows from.
      const act = this.acts.get(event.act);
      if (event.kind === "ask") {
        if (event.isInput) this.touched.add(prop);
        const isAct = event.by === undefined;
        if (isAct) this.acts.set(event.act, n);
        const record: ActionRecord = {
          n,
          prop,
          action: name,
          args: event.payload,
          actor: event.isInput ? Actor.Learner : Actor.Lesson,
          ...(event.by === "" ? { isLessons: true as const } : {}),
          ...(!isAct && act !== undefined ? { cause: act } : {}),
          isStep: false,
          t: this.core.now,
        };
        if (isAct) this.actorOf.set(n, record.actor);
        for (const fn of this.actionListeners) fn(record);
      } else {
        const record: SignalRecord = {
          n,
          prop,
          signal: name,
          payload: event.payload,
          // The child's tap is the child's, through every rule it sets off; else the lesson's.
          actor: (act === undefined ? undefined : this.actorOf.get(act)) ?? Actor.Lesson,
          ...(act === undefined ? {} : { from: act }),
        };
        for (const fn of this.signalListeners) fn(record);
        this.sound(piece, rest, event.signal, event.payload);
      }
    });
  }

  /**
   * The sounds a moment plays (platform/docs/sound.md): the lesson's cues at it, which replace its
   * piece's own there (a null cue only silences it), else the piece's sound view's. A lasting
   * sound plays until its `until` moment, or the board's end. Each is logged.
   */
  private sound(
    piece: string,
    inside: readonly string[],
    signal: string,
    told: Readonly<Record<string, unknown>>,
  ): void {
    const at = [piece === "" ? "board" : piece, ...inside, signal].join(".");
    for (const [name, playing] of this.lasting)
      if (this.board.model.sounds?.[name]?.until === at) {
        playing.stop();
        this.lasting.delete(name);
      }
    const cues = Object.entries(this.board.model.sounds ?? {}).filter(
      ([, cue]) => cue.when === at && carries(told, cue.where),
    );
    const type = propPieces(this.board.root).find((p) => p.name === piece)?.prop;
    const own =
      type === undefined
        ? undefined
        : this.lookup(type)?.sound?.cues?.[[...inside, signal].join(".")];
    const ownSound = typeof own === "function" ? own(told) : own;
    const isOwnInTurn =
      type !== undefined &&
      this.lookup(type)?.sound?.inTurn?.includes([...inside, signal].join(".")) === true;
    const playing: { name?: string; sound: Sound; lasts: boolean; inTurn: boolean }[] =
      cues.length > 0
        ? cues.flatMap(([name, cue]) =>
            cue.sound === null
              ? []
              : [
                  {
                    name,
                    sound: cue.sound,
                    lasts: cue.until !== undefined,
                    inTurn: cue.inTurn === true,
                  },
                ],
          )
        : ownSound === undefined
          ? []
          : [{ sound: ownSound, lasts: false, inTurn: isOwnInTurn }];
    for (const { name, sound, lasts, inTurn } of playing) {
      this.log.push({ sound: sound.name, signal: at, at: this.core.now });
      // It holds the voice until it is over: by its length, the same heard or silent; unheard
      // (the sounds off), it holds nothing.
      if (inTurn && this.services.isSoundsOff?.() !== true)
        this.heldUntil = Math.max(this.heldUntil, this.core.now + sound.seconds);
      const played = this.services.playSound?.(sound, lasts);
      if (played === undefined) continue;
      if (lasts && name !== undefined) {
        this.lasting.get(name)?.stop();
        this.lasting.set(name, played);
      }
    }
  }

  /** The lasting sounds playing, by cue. */
  private readonly lasting = new Map<string, SoundPlaying>();
  /** When the in-turn sounds playing are over, on the board's clock: a line waits for that. */
  private heldUntil = 0;
  /** Made from a state: it goes on from there, so starting it doesn't start the lesson again. */
  private isRestored = false;

  /**
   * The board as it is now, as data: restored (the `from` service) it is the same board and goes
   * on the same (@chalk/prop's Board.state; here, also how long an in-turn sound holds the voice).
   */
  state(): RuntimeState {
    return { core: this.core.state(), heldUntil: this.heldUntil };
  }
  /** Ends the line being said, as its voice would: set while one is said. */
  private endLineNow: (() => void) | undefined;

  /**
   * The child turned the voice off: the line being said is over now (recorded as ended, as its
   * voice would tell), then its sound stops. Lines after it are over as they start.
   */
  voiceOff(): void {
    const end = this.endLineNow;
    this.endLineNow = undefined;
    if (end === undefined) return;
    end();
    this.services.hush?.();
  }

  /** A line's words: the lesson's own for it, else what its piece says of itself, as it is now. */
  private lineWords(name: string): Localized | undefined {
    const given = this.board.model.lines[name]?.says;
    if (given !== undefined) return given;
    const piece = propPieces(this.board.root).find((p) => p.name === name);
    return piece === undefined ? undefined : ownLine(this.lookup(piece.prop), this.core.read(name));
  }

  /** Everything heard on this board, in the order it came: words and sounds. */
  private readonly log: Heard[] = [];

  /**
   * Everything heard on this board so far, in order (platform/docs/sound.md): words (who said
   * them, the words the voice was given, when, for how long, when cut) and sounds (which, at which
   * signal, when). What an agent reviews of the sound (`show` prints each step's), before anyone
   * listens to the clips.
   */
  heard(): readonly Heard[] {
    return this.log;
  }

  /** The words heard last. */
  private lastWords(): HeardWords | undefined {
    for (let i = this.log.length - 1; i >= 0; i--) {
      const heard = this.log[i];
      if (heard !== undefined && "line" in heard) return heard;
    }
    return undefined;
  }

  /**
   * What the line being said now is about (a piece, or a part in one: "town.walker"): it glows, as
   * a teacher points. Undefined when nothing is said, or the line is about nothing on the board.
   */
  speakingAbout(): string | undefined {
    void this.version.value;
    const model = this.board.model;
    // Which line is in turn is the scene's (the first it is saying); whether it is heard yet is the voice's: in
    // the breath before it, nothing is said, so nothing glows.
    const line = (this.core.read("") as { saying?: readonly { line: string }[] }).saying?.[0]?.line;
    const last = this.lastWords();
    if (line === undefined || last?.line !== line || last.cutAt !== undefined) return undefined;
    return aboutOf(
      model,
      line,
      propPieces(this.board.root).some((p) => p.name === line),
    );
  }

  // ---- reading ----

  propNames(): string[] {
    return propPieces(this.board.root).map((p) => p.name);
  }

  /** A piece as it is now (the board itself: its `isPassed` and `hidden`). Views redraw on change. */
  getView(name: string): PropView {
    void this.version.value;
    return this.core.read(name === BOARD ? "" : name) as PropView;
  }

  getStored(name: string): PropView {
    return this.getView(name);
  }

  /** A piece's definition (its type, role, actions): what the player's chrome reads. */
  getDef(name: string): AnyProp {
    const module = this.lookup(this.typeOf(name));
    return (module?.def as unknown as AnyProp | undefined) ?? this.childDef(name);
  }

  private childDef(name: string): AnyProp {
    const def = this.scene.children?.[name];
    if (def === undefined) throw new Error(`Board ${this.board.name}: no piece "${name}"`);
    return def;
  }

  private typeOf(name: string): string {
    return this.childDef(name).type;
  }

  isHidden(name: string): boolean {
    return (this.getView(BOARD).hidden as readonly string[]).includes(name);
  }

  isTouched(name: string): boolean {
    return this.touched.has(name);
  }

  /** A piece as the student sees it now, read from what its view draws. */
  describe(name: string, locale: Locale = AGENT_LOCALE): Observation {
    const module = this.lookup(this.typeOf(name));
    if (module === undefined) throw new Error(`no prop type "${this.typeOf(name)}" in the library`);
    return describeView(module, this.getView(name), locale);
  }

  /** Scenes have no IS rules: nothing is bound from outside a piece. */
  boundReads(): ReadonlyMap<string, readonly string[]> {
    return new Map();
  }

  /** "walker.step" on the piece "town": the node it names, and the member. */
  nodeOf(piece: string, dotted: string): { node: string; member: string } {
    const parts = dotted.split(".");
    const member = parts.pop() ?? "";
    return { node: [segment(piece), ...parts.map(segment)].join("/"), member };
  }

  hasOpenQuestion(): boolean {
    return this.propNames().some(
      (n) =>
        this.childDef(n).role === PropRole.Question &&
        this.getView(n).status !== AnswerStatus.Correct,
    );
  }

  whyNotJugnu(): string {
    return "Jugnu doesn't run on event-model boards yet";
  }

  /** What is still going on: a move, a wait, a line being said. Empty once the board has settled. */
  busyWith(): string[] {
    return this.core.queued.map((q) => `${q.owner || "the board"} at ${q.at.toFixed(2)}s`);
  }

  // ---- listening ----

  onSignal(listener: (record: SignalRecord) => void): () => void {
    this.signalListeners.add(listener);
    return () => this.signalListeners.delete(listener);
  }

  /** Each rule that heard a signal and ran, with what it asked for (none: it chose nothing). */
  onRule(listener: (record: { rule: string; did: readonly string[] }) => void): () => void {
    this.ruleListeners.add(listener);
    return () => this.ruleListeners.delete(listener);
  }

  onAction(listener: (record: ActionRecord) => void): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  // ---- driving ----

  /** Opens the board: the scene starts (what is shown is said), and its clock runs. */
  start(): void {
    if (!this.isRestored) this.core.send("", "start");
    const tick = (ms: number) => {
      if (this.isDisposed) return;
      this.startedAt ??= ms;
      // A tool reading the board: everything due is done now, in order, each at its own time; the
      // screen then shows where it ends (platform/docs/one-clock.md).
      if (this.services.isJumping === true)
        try {
          this.jump(toolClock.to);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.services.onError(`Board ${this.board.name}: ${message}`, error);
        }
      else this.core.advanceTo(Math.max(this.core.now, (ms - this.startedAt) / 1000));
      // A move redraws each frame (where it is now is a value of the clock).
      if (this.core.isBusy) this.version.value++;
      this.stopFrames = this.services.frame(tick);
    };
    this.stopFrames = this.services.frame(tick);
  }

  /**
   * The one door, as `BoardRuntime.call`: `call("town", "walker.step", { direction }, Learner)`.
   * The board itself (BOARD) passes and goes on. A refusal is reported, never thrown at the screen.
   */
  call(
    name: string,
    action: string,
    args: unknown = {},
    actor: Actor = Actor.Lesson,
  ): Promise<void> {
    const payload = (args ?? {}) as Readonly<Record<string, unknown>>;
    try {
      if (name === BOARD) {
        const own =
          action === BoardAction.Continue
            ? "continue"
            : action === BoardAction.Pass
              ? "pass"
              : action;
        if (own === "continue") this.core.input("", own, payload);
        else this.core.send("", own, payload);
        return Promise.resolve();
      }
      const parts = action.split(".");
      const member = parts.pop() ?? "";
      const path = [name, ...parts].join("/");
      if (actor === Actor.Learner) this.core.input(path, member, payload);
      else this.core.send(path, member, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.services.onError(`Board ${this.board.name}: ${message}`, error);
    }
    return Promise.resolve();
  }

  /** A jumping clock goes where the tool says: to the end, to a line (held while it is said), or nowhere. */
  private jump(to: JumpTo): void {
    if (to.kind === "here") return;
    if (to.kind === "end") {
      this.core.runUntilIdle();
      return;
    }
    for (let n = 0; this.core.lineInTurn !== to.line; n++) {
      const next = this.core.queued[0]?.at;
      if (next === undefined) return;
      if (n >= JUMP_LIMIT)
        throw new Error(
          `still busy after ${JUMP_LIMIT} queued events (a repeat that never stops?)`,
        );
      this.core.advanceTo(next);
    }
  }

  /** The line being said now, by its name. */
  lineInTurn(): string | undefined {
    return this.core.lineInTurn;
  }

  /**
   * Plays the board's time forward without waiting (a check, a test, the build): every entry due
   * within `seconds` from now, in no time, the clock jumping from one to the next; with `isWait`,
   * the clock also moves the whole way (a witness's wait).
   */
  settle(seconds = 60, isWait = false): void {
    const until = this.core.now + seconds;
    try {
      for (
        let next = this.core.queued[0]?.at;
        next !== undefined && next <= until;
        next = this.core.queued[0]?.at
      )
        this.core.advanceTo(next);
      if (isWait) this.core.advanceTo(Math.max(this.core.now, until));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.services.onError(`Board ${this.board.name}: ${message}`, error);
    }
  }

  /** Views don't raise signals: what the student does is an action. */
  signal(name: string, signalName: string): void {
    this.services.onError(
      `Board ${this.board.name}: ${name}'s view raised ${signalName}; the student's acts are actions`,
    );
  }

  time(): number {
    void this.version.value;
    return this.core.now;
  }

  onFrame(callback: () => void): () => void {
    return this.isDisposed ? () => {} : this.services.frame(() => callback());
  }

  pause(): void {}
  resume(): void {}

  dispose(): void {
    this.isDisposed = true;
    // A board's sounds all end with it.
    for (const playing of this.lasting.values()) playing.stop();
    this.lasting.clear();
    this.stopFrames?.();
    this.signalListeners.clear();
    this.actionListeners.clear();
  }

  /** Jugnu doesn't run here yet: nothing to send him. */
  save(): Record<string, never> {
    return {};
  }

  // ---- what agents read (show) ----

  snapshot(page?: ParentNode): BoardSnapshot {
    const nodes = this.propNames().map((name) => this.nodeSnapshot(name, page));
    const open = this.propNames().find(
      (n) =>
        this.childDef(n).role === PropRole.Question &&
        this.getView(n).status !== AnswerStatus.Correct,
    );
    return {
      board: this.board.name,
      isPassed: this.getView(BOARD).isPassed === true,
      ...(open !== undefined ? { openQuestion: segment(open) } : {}),
      nodes,
    };
  }

  private nodeSnapshot(name: string, page: ParentNode | undefined): NodeSnapshot {
    const def = this.childDef(name);
    const view = this.getView(name);
    const seen = this.describe(name);
    const path = segment(name);
    const shown = shownOf(view);
    const fromControls = new Map<string, string[]>();
    const parts: PartSnapshot[] = seen.elements.map((e) => {
      const at = `${path}/${segment(e.id)}`;
      const does = e.does === undefined ? [] : typeof e.does === "string" ? [e.does] : e.does;
      if (e.isOff !== true)
        for (const action of does)
          fromControls.set(action, [...(fromControls.get(action) ?? []), at]);
      const { id: _id, ...rest } = e;
      const drawnAt =
        page === undefined ? undefined : findNode(page, at)?.getAttribute("data-code");
      return { ...rest, path: at, ...(drawnAt ? { drawnAt } : {}) };
    });
    const given = (this.board.model.given[name] ?? {}) as Readonly<Record<string, unknown>>;
    const setup: Record<string, unknown> = {};
    const live: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(view)) {
      if (shown?.[key] === false) continue;
      (key in given ? setup : live)[key] = value;
    }
    const start = (def.start ?? {}) as Readonly<Record<string, unknown>>;
    const atStart = Object.keys(live).filter(
      (k) => k in start && JSON.stringify(live[k]) === JSON.stringify(start[k]),
    );
    const problems: string[] = [];
    const can: CanSnapshot[] = [];
    for (const [action, via] of fromControls) {
      const spec = actionAt(def, action);
      if (spec === undefined)
        problems.push(`${via.join(", ")} does ${action}, which ${def.type} doesn't have`);
      else if (!spec.isFromScreen)
        problems.push(
          `${via.join(", ")} does ${action}, which isn't the student's (from: "screen")`,
        );
      can.push({
        action,
        takes: spec === undefined ? "?" : takes(spec.payload as unknown as ZodTypeAny),
        who: ["learner"],
        via,
      });
    }
    return {
      path,
      prop: def.type,
      isShown: !this.isHidden(name),
      summary: seen.summary,
      setup,
      given: Object.keys(given).filter((f) => f in setup),
      live,
      ...(atStart.length > 0 ? { atStart } : {}),
      bound: {},
      parts,
      can,
      ...(seen.hidden !== undefined ? { hidden: seen.hidden } : {}),
      problems,
    };
  }
}

/** The action at "walker.step" under a prop. */
function actionAt(def: AnyProp, dotted: string) {
  const parts = dotted.split(".");
  const member = parts.pop() ?? "";
  let at: AnyProp | undefined = def;
  for (const part of parts) at = at?.children?.[part];
  return at?.actions?.[member];
}
