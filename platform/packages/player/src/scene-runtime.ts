import { Actor, type Board, type Locale, propPieces } from "@chalk/content";
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
  type Spoken,
  segment,
  shownOf,
} from "@chalk/prop";
import { type AnyProp, Board as Core, estimatedSeconds } from "@chalk/prop/next";
import { type Signal, signal } from "@preact/signals-core";
import type { ZodTypeAny } from "zod";
import { describeView } from "./describe";
import { findNode } from "./part-paths";
import type { PropModule } from "./prop-module";
import type { ActionRecord, RuntimeServices, SignalRecord } from "./runtime";
import { takes } from "./snapshot";

/**
 * A board on the event model (platform/docs/event-model.md), running: the scene and its pieces on
 * the core's `Board`, with the same outside as `BoardRuntime`, so the player, the recorder and the
 * tools (`look`, `play`) run it the same way. Its clock moves on each screen frame; the board's
 * own timing (moves, waits, lines being said) is the core's queue.
 *
 * Jugnu doesn't run on these boards yet.
 */
export class SceneRuntime {
  readonly isScene = true;
  private readonly core: Core;
  private readonly scene: AnyProp;
  /** Bumped on every change: what views read, so they redraw. */
  private readonly version: Signal<number> = signal(0);
  private readonly signalListeners = new Set<(record: SignalRecord) => void>();
  private readonly actionListeners = new Set<(record: ActionRecord) => void>();
  private readonly touched = new Set<string>();
  private count = 0;
  private startedAt: number | undefined;
  private stopFrames: (() => void) | undefined;
  private isDisposed = false;

  constructor(
    readonly board: Board,
    private readonly lookup: (type: string) => PropModule | undefined,
    private readonly services: RuntimeServices & {
      /** How long a line plays, when its audio's length is known (publish); else from its words. */
      lineSeconds?: (prop: string, line: Spoken) => number | undefined;
      locale?: Locale;
    },
  ) {
    const model = board.model;
    if (model === undefined) throw new Error(`Board ${board.name} isn't a scene`);
    this.scene = model.scene;
    const locale = services.locale ?? "en";
    this.core = new Core(model.scene, model.given, {
      voice: {
        start: (path, line) => {
          void services.speak({ name: path }, line);
        },
        seconds: (path, line) =>
          services.lineSeconds?.(path, line) ??
          estimatedSeconds(line.speak?.[locale] ?? line.say[locale] ?? ""),
      },
    });
    this.core.watch(() => {
      this.version.value++;
    });
    this.core.listen((event) => {
      const [piece = "", ...rest] = event.path.split("/");
      const prop = piece === "" ? BOARD : piece;
      const name = [...rest, event.kind === "ask" ? event.action : event.signal].join(".");
      const n = ++this.count;
      if (event.kind === "ask") {
        if (event.isInput) this.touched.add(prop);
        const record: ActionRecord = {
          n,
          prop,
          action: name,
          args: event.payload,
          actor: event.isInput ? Actor.Learner : Actor.Lesson,
          isStep: false,
          t: this.core.now,
        };
        for (const fn of this.actionListeners) fn(record);
      } else {
        const record: SignalRecord = {
          n,
          prop,
          signal: name,
          payload: event.payload,
          actor: Actor.Lesson,
        };
        for (const fn of this.signalListeners) fn(record);
      }
    });
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
  describe(name: string, locale: Locale = "en"): Observation {
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

  onAction(listener: (record: ActionRecord) => void): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  // ---- driving ----

  /** Opens the board: the scene starts (what is shown is said), and its clock runs. */
  start(): void {
    this.core.send("", "start");
    const tick = (ms: number) => {
      if (this.isDisposed) return;
      this.startedAt ??= ms;
      this.core.advanceTo(Math.max(this.core.now, (ms - this.startedAt) / 1000));
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

  /** Views don't raise signals on the event model: what the student does is an action. */
  signal(name: string, signalName: string): void {
    this.services.onError(
      `Board ${this.board.name}: ${name}'s view raised ${signalName}; on the event model the student's acts are actions`,
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
    this.stopFrames?.();
    this.signalListeners.clear();
    this.actionListeners.clear();
  }

  /** Jugnu doesn't run here yet: nothing to send him. */
  save(): Record<string, never> {
    return {};
  }

  // ---- what agents read (look, play) ----

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
    const given = (this.board.model?.given[name] ?? {}) as Readonly<Record<string, unknown>>;
    const setup: Record<string, unknown> = {};
    const live: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(view)) {
      if (shown?.[key] === false) continue;
      (key in given ? setup : live)[key] = value;
    }
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

/** A board running: on today's runtime, or on the event model. */
export type LiveBoard = import("./runtime").BoardRuntime | SceneRuntime;

/** Whether a board runs on the event model. */
export function isSceneBoard(board: Board): boolean {
  return board.model !== undefined;
}
