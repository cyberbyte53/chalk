import { type About, Actor, type Cue, CueKind, type TurnInput } from "@chalk/content";
import type { HeardAction, JugnuBoard, JugnuPlace } from "./board";
import type { LessonLibrary } from "./lessons";
import type { ChatMessage, LlmProvider, Usage } from "./provider";
import type { JugnuEvent, JugnuStep } from "./tools";
import { type TurnResult, jugnuTurn } from "./turn";

/** What a turn needs besides the board: the chat so far and what the student did. */
export type ThinkRequest = {
  chat: readonly ChatMessage[];
  input: TurnInput;
};

/**
 * Where Jugnu thinks a turn through. On the phone: the server, on its own copy of the board
 * (`JugnuSession` with `think`). In tests and the bench: right here, on the board itself, put back
 * afterwards (`thinkHere`).
 */
export type JugnuThink = (request: ThinkRequest) => Promise<TurnResult>;

/** A turn as the chat shows it: from the student's message to Jugnu going quiet. */
export type JugnuTurn = {
  /** What the student typed or tapped. */
  asked: string;
  /** Everything he said this turn, joined. */
  reply: string;
  /** What he said and did while thinking, tries and refusals included, in order. */
  events: JugnuEvent[];
  /** What the student saw, in order. */
  cues: Cue[];
  /** Options he offered to tap; empty if none. */
  options: string[];
  /** Which model answered. */
  model: string;
  /** How many times the model was called (each call is one step of the loop). */
  modelCalls: number;
  usage: Usage;
  /** He neither said nor did anything, so the chat shows his "ask me again" line. */
  isFallback: boolean;
};

/** What the chat shows as each cue plays: words, or something he did on the board. */
export type PlayedCue = { kind: "say"; text: string } | JugnuStep;

export type JugnuOptions = {
  /** Most model calls in one turn: a guard against a runaway loop. */
  maxSteps?: number;
  /**
   * Hears each cue as it plays (the chat shows it). If it returns a promise, the next cue waits
   * for it: the chat paces his reply.
   */
  onEvent?: (event: PlayedCue) => void | Promise<void>;
  /** Where he thinks; default: here, on this board, put back after (`thinkHere`). */
  think?: JugnuThink;
  /** Waits until what an action set off on this board has run. */
  settle?: () => Promise<boolean>;
};

/**
 * Thinks a turn through on this very board, then puts it back as it was: what a server does on its
 * copy. For tests, the bench and a board run with no server.
 */
export function thinkHere(
  board: JugnuBoard,
  provider: LlmProvider,
  place: JugnuPlace,
  options: { maxSteps?: number; settle?: () => Promise<boolean>; lessons?: LessonLibrary } = {},
): JugnuThink {
  return async (request) => {
    const before = board.snapshot();
    try {
      return await jugnuTurn(board, provider, place, { ...request, ...options });
    } finally {
      board.restore(before);
      await options.settle?.();
    }
  };
}

/**
 * Jugnu on one board, as the student meets him: one chat, many turns. Each turn is thought through
 * elsewhere (`think`: the server, on its copy of the board), and comes back as cues, which play
 * here in order: his words, a prop glowing, his actions through the one door as `Actor.Jugnu`
 * (the runtime's limits hold again), options to tap. One session per board;
 * it forgets when the board goes.
 */
export class JugnuSession {
  private readonly chat: ChatMessage[] = [];
  private readonly think: JugnuThink;

  constructor(
    private readonly board: JugnuBoard,
    provider: LlmProvider | undefined,
    private readonly place: JugnuPlace,
    private readonly options: JugnuOptions = {},
  ) {
    const settle = options.settle;
    const think =
      options.think ??
      (provider === undefined
        ? undefined
        : thinkHere(board, provider, place, {
            ...(options.maxSteps !== undefined ? { maxSteps: options.maxSteps } : {}),
            ...(settle !== undefined ? { settle } : {}),
          }));
    if (think === undefined) throw new Error("JugnuSession needs a model or a think function");
    this.think = think;
  }

  /** The whole chat so far (for a flagged conversation). */
  get messages(): readonly ChatMessage[] {
    return this.chat;
  }

  /**
   * The student types something (or says it), maybe about things they held on the board; resolves
   * when Jugnu's turn has played.
   */
  ask(text: string, about: readonly About[] = []): Promise<JugnuTurn> {
    return this.turn(text, {
      kind: "typed",
      text,
      ...(about.length > 0 ? { about: [...about] } : {}),
    });
  }

  /** The student taps one of his options. */
  choose(option: string): Promise<JugnuTurn> {
    return this.turn(option, { kind: "chose", option });
  }

  private async turn(asked: string, input: TurnInput): Promise<JugnuTurn> {
    const result = await this.think({ chat: this.chat, input });
    this.chat.push(...result.chat);
    const options = await this.play(result.cues);
    return {
      asked,
      reply: result.reply,
      events: result.events,
      cues: result.cues,
      options,
      model: result.model,
      modelCalls: result.modelCalls,
      usage: result.usage,
      isFallback: result.isFallback,
    };
  }

  /** Plays the cues in order; stops if one of his actions isn't taken here. Returns his options. */
  private async play(cues: readonly Cue[]): Promise<string[]> {
    const emit = async (event: PlayedCue) => {
      await this.options.onEvent?.(event);
    };
    let options: string[] = [];
    for (const cue of cues) {
      switch (cue.kind) {
        case CueKind.Say:
          await emit({ kind: "say", text: cue.text });
          break;
        case CueKind.Point:
          await emit({
            kind: "point",
            prop: cue.prop,
            ...(cue.part !== undefined ? { part: cue.part } : {}),
          });
          break;
        case CueKind.Ask:
          await emit({ kind: "say", text: cue.question });
          await emit({ kind: "ask", question: cue.question, options: cue.options });
          options = cue.options;
          break;
        case CueKind.Act: {
          const refused = await this.act(cue);
          await emit({
            kind: "act",
            prop: cue.prop,
            action: cue.action,
            args: cue.args,
            ...(refused !== undefined ? { refused } : {}),
          });
          // The board here isn't where he thought it would be: the rest no longer fits.
          if (refused !== undefined) return [];
          break;
        }
      }
    }
    return options;
  }

  /** One of his actions, through the one door; why it was refused, if it was. */
  private async act(cue: Cue & { kind: "act" }): Promise<string | undefined> {
    if (!this.board.propNames().includes(cue.prop)) return `there is no prop "${cue.prop}"`;
    let refused: string | undefined;
    const stop = this.board.onAction((heard: HeardAction) => {
      if (
        heard.actor === Actor.Jugnu &&
        heard.prop === cue.prop &&
        heard.action === cue.action &&
        heard.refused !== undefined
      )
        refused ??= heard.refused;
    });
    try {
      await this.board.perform({ call: `${cue.prop}.${cue.action}`, args: cue.args }, Actor.Jugnu);
    } finally {
      stop();
    }
    return refused;
  }

  /** The board is gone. */
  close(): void {}
}
