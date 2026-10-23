import {
  type ChatMessage,
  type LlmProvider,
  ProviderKind,
  type TurnResult,
  chatMessageSchema,
  providerFrom,
  recordingFetch,
  thinkHere,
} from "@chalk/jugnu";
import { type JugnuLink, boardState } from "@chalk/player";
import { z } from "zod";
import { api } from "./api-client";
import { lessonLibrary } from "./lesson-library";
import { type DevModel, settings } from "./settings";

const chatSchema = z.array(chatMessageSchema);

/**
 * Jugnu for this app: each turn is thought through on the server, on its own copy of the board
 * (the model's key stays there); flagged chats are kept there too. Undefined when JUGNU_PROVIDER
 * is "off".
 */
export function jugnuLink(): JugnuLink | undefined {
  if (!settings.jugnu.isOn) return undefined;
  return {
    think: (runtime, place) => async (request) => {
      const reply = await api.jugnuTurn({
        board: runtime.board,
        place,
        state: boardState(runtime),
        chat: [...request.chat],
        input: request.input,
      });
      const chat: ChatMessage[] = chatSchema.parse(reply.chat);
      return {
        ...reply,
        chat,
        // Written by the server's own jugnuTurn; only logged and flagged here, never acted on.
        events: reply.events as TurnResult["events"],
      };
    },
    flag: (flag) =>
      api.flagJugnu({
        ...flag,
        chat: [...flag.chat],
        shown: flag.shown.map(({ from, text }) => ({ from, text })),
      }),
  };
}

/** Appends one line to tmp/jugnu-chat.jsonl through Vite (see devLog in vite.config.ts). */
function devLog(entry: Record<string, unknown>): void {
  void fetch("/dev-log", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ at: new Date().toISOString(), ...entry }),
  }).catch(() => undefined);
}

/**
 * Jugnu for the dev shell: thinks here, on the board itself (put back after each turn), calling the
 * model through Vite's /dev-model proxy. Nothing else is needed: no server, no sign-in, no
 * database; flags just go to the console. Every model call and every turn is logged to
 * tmp/jugnu-chat.jsonl (`pnpm --filter @chalk/studio chat-log` reads it). Undefined outside
 * development.
 */
export function devJugnuLink(dev: DevModel | undefined): JugnuLink | undefined {
  if (dev === undefined || !settings.jugnu.isOn) return undefined;
  // Every model call, exactly as sent and as answered, goes to tmp/llm-calls.jsonl.
  const recorded = recordingFetch((call) => {
    void fetch("/dev-llm-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: dev.id, ...call }),
    }).catch(() => undefined);
  });
  const base = providerFrom(
    {
      provider:
        dev.provider === "anthropic" ? ProviderKind.Anthropic : ProviderKind.OpenAiCompatible,
      url: `${window.location.origin}${dev.path}`,
      model: dev.model,
      think: dev.think,
      timeoutSeconds: 120,
    },
    recorded,
  );
  const provider: LlmProvider = {
    ...base,
    chat: async (request) => {
      const started = Date.now();
      const reply = await base.chat(request);
      // What he heard since his last call (the opening or the tool results), and what he answered.
      const heard = [];
      for (let i = request.messages.length - 1; i >= 0; i--) {
        const m = request.messages[i];
        if (m === undefined || m.role === "assistant") break;
        if (m.role !== "system") heard.unshift(m);
      }
      devLog({ kind: "call", model: dev.id, ms: Date.now() - started, heard, reply });
      return reply;
    },
  };
  return {
    think: (runtime, place) => {
      const think = thinkHere(runtime, provider, place, { lessons: lessonLibrary });
      devLog({ kind: "board", board: runtime.board.id ?? null, place });
      return async (request) => {
        const result = await think(request);
        devLog({ kind: "turn", input: request.input, cues: result.cues, calls: result.modelCalls });
        return result;
      };
    },
    flag: async (flag) => {
      console.log("Flagged chat:", flag);
      devLog({ kind: "flag", note: flag.note });
    },
  };
}
