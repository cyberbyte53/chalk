import { Actor } from "@chalk/content";
import type { JugnuBoard, JugnuPlace } from "./board";
import { systemPrompt } from "./context";
import { BoardHistory } from "./history";
import type { ChatMessage, LlmProvider } from "./provider";
import { type JugnuStep, runTool, toolsFor } from "./tools";

/** Something Jugnu said or did during a turn, in order: what the chat shows as it happens. */
export type JugnuEvent = { kind: "say"; text: string } | JugnuStep;

/** One turn: from the student's message (or their move after a hand-over) to Jugnu handing back. */
export type JugnuTurn = {
  /** What the student typed; undefined when Jugnu continued after watching them act. */
  asked: string | undefined;
  /** Everything he said this turn, joined. */
  reply: string;
  /** What he said and did, in order. */
  events: JugnuEvent[];
  /** Props he is watching for the student's move; empty if he isn't waiting on them. */
  watching: string[];
  /** Which model answered. */
  model: string;
  /** How many times the model was called (each call is one step of the loop). */
  modelCalls: number;
  /** He neither said nor did anything, so the chat shows his "ask me again" line. */
  isFallback: boolean;
};

export type JugnuOptions = {
  /** Most model calls in one turn; the last is asked for words only. */
  maxSteps?: number;
  /** Hears each thing he says or does as it happens (the chat shows it live). */
  onEvent?: (event: JugnuEvent) => void;
};

const MAX_STEPS = 6;

/**
 * Jugnu on one board: an agent loop. Each step he gets the whole board as data, then answers in
 * words, calls tools (act through the one door, point, calculate, hand back), or both; tool results
 * come back to him and he goes on until he stops or hands the board back. His hard limits are in
 * the runtime and in `runTool`; everything else is the model's judgement under the persona.
 * One session per board; it forgets when the board goes.
 */
export class JugnuSession {
  private readonly history: BoardHistory;
  private readonly chat: ChatMessage[] = [];
  private watching: string[] = [];
  private readonly moveListeners = new Set<(prop: string) => void>();
  private readonly stopListening: () => void;
  private readonly maxSteps: number;

  constructor(
    private readonly board: JugnuBoard,
    private readonly provider: LlmProvider,
    private readonly place: JugnuPlace,
    private readonly options: JugnuOptions = {},
  ) {
    this.maxSteps = Math.max(1, options.maxSteps ?? MAX_STEPS);
    this.history = new BoardHistory(board);
    this.stopListening = board.onAction((action) => {
      if (
        action.actor === Actor.Learner &&
        action.refused === undefined &&
        this.watching.includes(action.prop)
      )
        for (const listener of this.moveListeners) listener(action.prop);
    });
  }

  /** The props Jugnu is watching for the student's move (he handed the board back). */
  get watchedProps(): readonly string[] {
    return this.watching;
  }

  /**
   * Calls back each time the student acts on a prop Jugnu is watching. The caller decides when
   * the move is finished (a drag is many moves) and then calls `continue()`.
   */
  onStudentMove(listener: (prop: string) => void): () => void {
    this.moveListeners.add(listener);
    return () => this.moveListeners.delete(listener);
  }

  /** The student asks something; resolves when Jugnu has finished the turn. */
  ask(text: string): Promise<JugnuTurn> {
    return this.turn(text, { role: "user", content: text });
  }

  /** The student made the move Jugnu handed back for: he looks at the board and goes on. */
  continue(): Promise<JugnuTurn> {
    const watched = this.watching.join(", ");
    return this.turn(undefined, {
      role: "user",
      content: `(Not typed by the student.) After you handed back, the student acted on ${watched}. The board and "happened" show what they did. Respond to it.`,
    });
  }

  private async turn(asked: string | undefined, opening: ChatMessage): Promise<JugnuTurn> {
    this.watching = [];
    const start = this.chat.length;
    this.chat.push(opening);
    const events: JugnuEvent[] = [];
    const said: string[] = [];
    const emit = (event: JugnuEvent) => {
      events.push(event);
      this.options.onEvent?.(event);
    };
    let modelCalls = 0;
    try {
      for (let step = 1; step <= this.maxSteps; step++) {
        const isLast = step === this.maxSteps;
        const reply = await this.provider.chat({
          messages: [
            {
              role: "system",
              content: systemPrompt(this.board, this.place, this.history.lines()),
            },
            ...this.chat,
          ],
          tools: toolsFor(this.board),
          toolChoice: isLast ? "none" : "auto",
        });
        modelCalls++;
        const calls = isLast ? [] : reply.toolCalls;
        this.chat.push({
          role: "assistant",
          content: reply.content,
          ...(calls.length > 0 ? { toolCalls: calls } : {}),
          ...(reply.reasoning !== undefined ? { reasoning: reply.reasoning } : {}),
        });
        const text = reply.content.trim();
        if (text !== "") {
          said.push(text);
          emit({ kind: "say", text });
        }
        if (calls.length === 0) break;
        let isHandedBack = false;
        for (const call of calls) {
          if (isHandedBack) {
            // Every call needs an answer, even the ones after he handed back.
            this.chat.push({
              role: "tool",
              toolCallId: call.id,
              name: call.name,
              content: JSON.stringify({ skipped: "you had already handed the board back" }),
            });
            continue;
          }
          const { step: done, result } = await runTool(this.board, call.name, call.args);
          this.chat.push({ role: "tool", toolCallId: call.id, name: call.name, content: result });
          emit(done);
          if (done.kind === "wait") {
            isHandedBack = true;
            this.watching = done.watch;
          }
        }
        if (isHandedBack) break;
      }
    } catch (error) {
      // Leave the chat as it was, so the next turn starts from a whole conversation.
      this.chat.length = start;
      this.watching = [];
      throw error;
    }
    const isFallback = said.length === 0 && events.length === 0;
    const reply = isFallback ? fallback(this.place.locale) : said.join(" ");
    if (isFallback) this.chat.push({ role: "assistant", content: reply });
    return {
      asked,
      reply,
      events,
      watching: [...this.watching],
      model: this.provider.id,
      modelCalls,
      isFallback,
    };
  }

  /** The board is gone. */
  close(): void {
    this.history.close();
    this.stopListening();
    this.moveListeners.clear();
  }
}

function fallback(locale: JugnuPlace["locale"]): string {
  return locale === "hi"
    ? "माफ़ करना, मैं अभी ठीक से नहीं सोच पाया। फिर से पूछोगे?"
    : "Sorry, I got muddled. Could you ask me again?";
}
