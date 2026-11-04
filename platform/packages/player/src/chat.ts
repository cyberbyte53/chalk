import type { EventEntry } from "@chalk/content";

/**
 * The chat with Jugnu, worked out from a board's events alone (platform/docs/plans/jugnu-chat.md):
 * the phone and the run page both draw it from this, so there is one model of the conversation.
 * Its messages: Jugnu's (`jugnu` events: his reply, his glow, his choices, his hand-back) and the
 * student's (`chat` said: their words, how they came; with what they did on the board since their
 * last words, from the `cause` events). Its state is where the chat stands after the last event.
 */

export const ChatState = {
  /** Not opened, or closed. */
  Closed: "closed",
  /** Jugnu has spoken: the student's turn. */
  Open: "open",
  /** The student has spoken: Jugnu is thinking. */
  Thinking: "thinking",
  /** Jugnu handed back: the student does the next one alone. */
  HandedBack: "handedBack",
} as const;
export type ChatState = (typeof ChatState)[keyof typeof ChatState];

export type ChatMessage =
  | {
      from: "jugnu";
      seq: number;
      text: string;
      /** The part he lights up while he says it (its address on the board). */
      glow?: string;
      choices?: readonly string[];
      isHandBack?: boolean;
    }
  | {
      from: "student";
      seq: number;
      text: string;
      /** getHelp: they pressed Get help, which asks "Why is it wrong?" for them. */
      via: "typed" | "choice" | "done" | "getHelp";
      /** What they did on the board since their last words, in order (each an action and its args). */
      did: readonly { action: string; args: Readonly<Record<string, unknown>> }[];
    };

export type Chat = { messages: ChatMessage[]; state: ChatState };

/** The chat as it stands after the events (all of them, or those up to `upTo`, a seq). */
export function chatOf(events: readonly EventEntry[], upTo = Number.POSITIVE_INFINITY): Chat {
  const messages: ChatMessage[] = [];
  let state: ChatState = ChatState.Closed;
  let did: { action: string; args: Readonly<Record<string, unknown>> }[] = [];
  for (const [seq, e] of events.entries()) {
    if (seq > upTo) break;
    if (e.kind === "cause" && e.actor === "learner" && state !== ChatState.Closed) {
      const p = e.payload as { action?: string; args?: Readonly<Record<string, unknown>> };
      if (p.action !== undefined) did.push({ action: p.action, args: p.args ?? {} });
    } else if (e.kind === "chat") {
      const p = e.payload as {
        what: string;
        reason?: string;
        text?: string;
        via?: string;
        by?: string;
      };
      if (p.what === "opened") {
        did = [];
        // Get help asks for them: their question is the opening (the chat draws its words).
        if (p.reason === "getHelp") {
          messages.push({ from: "student", seq, text: "", via: "getHelp", did: [] });
          state = ChatState.Thinking;
        } else state = ChatState.Open;
      } else if (p.what === "said") {
        messages.push({
          from: "student",
          seq,
          text: p.text ?? "",
          via: (p.via ?? "typed") as "typed" | "choice" | "done",
          did,
        });
        did = [];
        state = ChatState.Thinking;
      } else if (p.what === "closed")
        state = p.by === "handBack" ? ChatState.HandedBack : ChatState.Closed;
    } else if (e.kind === "jugnu") {
      const p = e.payload as {
        reply: string;
        steps?: { kind: string; part?: string }[];
        choices?: string[];
        isHandBack?: boolean;
      };
      const glow = p.steps?.find((s) => s.kind === "glow")?.part;
      messages.push({
        from: "jugnu",
        seq,
        text: p.reply,
        ...(glow === undefined ? {} : { glow }),
        ...(p.choices === undefined ? {} : { choices: p.choices }),
        ...(p.isHandBack === true ? { isHandBack: true } : {}),
      });
      state = p.isHandBack === true ? ChatState.HandedBack : ChatState.Open;
    }
  }
  return { messages, state };
}
