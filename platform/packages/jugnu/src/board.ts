import type { Actor, IsRule, JugnuNotes, Script, WhenRule } from "@chalk/content";
import type { AnyPropDef, StoredState } from "@chalk/prop";

/** A signal on the board, as Jugnu hears it. */
export type HeardSignal = {
  prop: string;
  signal: string;
  payload: Readonly<Record<string, unknown>>;
  actor: Actor;
};

/** An action someone asked of the board, and whether it was refused. */
export type HeardAction = {
  prop: string;
  action: string;
  args: unknown;
  actor: Actor;
  refused?: string;
};

/** Every prop's stored state at one moment, to put the board back exactly. */
export type Snapshot = ReadonlyMap<string, StoredState>;

/**
 * The board as Jugnu sees it. The player's `BoardRuntime` is one; Jugnu needs nothing else, so
 * he never depends on the player or any UI.
 */
export type JugnuBoard = {
  /** The board as the lesson wrote it: its rules are facts Jugnu reads. */
  readonly board: {
    readonly name: string;
    readonly is: readonly IsRule[];
    readonly when: readonly WhenRule[];
    readonly studentOnly: readonly string[];
    readonly jugnu?: JugnuNotes | undefined;
  };
  propNames: () => string[];
  getDef: (name: string) => AnyPropDef;
  getStored: (name: string) => StoredState;
  isHidden: (name: string) => boolean;
  /** Runs a script through the one door, as `actor`. */
  perform: (script: Script, actor: Actor) => Promise<void>;
  onSignal: (listener: (signal: HeardSignal) => void) => () => void;
  onAction: (listener: (action: HeardAction) => void) => () => void;
  snapshot: () => Snapshot;
  restore: (snapshot: Snapshot) => void;
  /** Why Jugnu may not run `prop.action` now, or undefined if he may (his hard limits, in code). */
  whyNotJugnu: (prop: string, action: string) => string | undefined;
  hasOpenQuestion: () => boolean;
};

/** Where the learner is, for Jugnu's context. */
export type JugnuPlace = {
  lessonTitle: string;
  /** 1-based. */
  boardNumber: number;
  boardCount: number;
  /** The learner's language: Jugnu answers in it. */
  locale: "en" | "hi";
  /**
   * How the board is being played (the player's play mode): a lesson's page, practice after it,
   * or a skill check's mistake under review. Left out: a lesson's page.
   */
  mode?: "lesson" | "guided" | "skillCheck" | "review";
};
