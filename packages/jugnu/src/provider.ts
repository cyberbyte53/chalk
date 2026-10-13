import { z } from "zod";

/** A tool the model may call: its name, what it does, and its arguments as JSON Schema. */
export type ToolSpec = {
  name: string;
  description: string;
  parameters: Readonly<Record<string, unknown>>;
};

/** A tool call the model asked for. `args` is undefined when its arguments weren't valid JSON. */
export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown> | undefined;
  /** The arguments exactly as the model wrote them. */
  rawArgs: string;
};

/** One message in a chat with tools, in our own shape; each provider translates it to its API's. */
export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | {
      role: "assistant";
      content: string;
      toolCalls?: readonly ToolCall[];
      /** A thinking model's hidden reasoning; DeepSeek needs it sent back with tools, every turn. */
      reasoning?: string;
    }
  | { role: "tool"; toolCallId: string; name: string; content: string };

/** A chat with tools: the model answers in words, asks for tool calls, or both. */
export type ChatRequest = {
  messages: readonly ChatMessage[];
  tools: readonly ToolSpec[];
  /** "none": answer in words only this time (the tools are still described). Default "auto". */
  toolChoice?: "auto" | "none";
};

export type ChatReply = {
  content: string;
  toolCalls: ToolCall[];
  reasoning?: string;
};

/** A plain message, for a one-shot JSON answer (the test bench's judge). */
export type PlainMessage = { role: "system" | "user" | "assistant"; content: string };

/** A one-shot request whose answer must be JSON of the given shape. */
export type LlmRequest = {
  messages: readonly PlainMessage[];
  /** JSON Schema of the reply; providers that support structured output enforce it. */
  schema: Readonly<Record<string, unknown>>;
};

/**
 * A model Jugnu can talk to, through the provider's standard tool calling. Swapping models means
 * swapping this, nothing else.
 */
export type LlmProvider = {
  /** Which model answered, e.g. "openai-compatible:deepseek-chat"; recorded in events. */
  readonly id: string;
  chat: (request: ChatRequest) => Promise<ChatReply>;
  /** A one-shot JSON answer (no tools). */
  complete: (request: LlmRequest) => Promise<string>;
};

export const ProviderKind = {
  /** Ollama's own API (local: `ollama serve`). */
  Ollama: "ollama",
  /**
   * Anything with an OpenAI-style /v1/chat/completions: DeepSeek, Microsoft Foundry, LM Studio,
   * llama.cpp, vLLM.
   */
  OpenAiCompatible: "openai-compatible",
} as const;
export type ProviderKind = (typeof ProviderKind)[keyof typeof ProviderKind];

/** How the app says which model to use. */
export const llmConfigSchema = z
  .object({
    provider: z.nativeEnum(ProviderKind),
    /** Base URL without /v1, e.g. "https://api.deepseek.com" or "http://127.0.0.1:11434". */
    url: z.string().min(1),
    model: z.string().min(1),
    apiKey: z.string().optional(),
    /** Give up on one model call after this many seconds. */
    timeoutSeconds: z.number().positive().default(90),
    /**
     * Whether a model that can "think" (reason silently before answering) should. Off by default:
     * a student shouldn't wait a minute for a hint. Sent as Ollama's `think`, or as DeepSeek's
     * `thinking` and OpenAI-style `reasoning_effort` (at `THINK_EFFORT`); a server that doesn't
     * take a switch is asked again without it. The reasoning comes back apart from the reply.
     */
    think: z.boolean().default(false),
    /** Randomness of replies. Low: a tutor should be steady. */
    temperature: z.number().min(0).max(2).default(0.3),
  })
  .strict();
export type LlmConfig = z.input<typeof llmConfigSchema>;

type Fetch = typeof fetch;

const trimSlash = (url: string) => url.replace(/\/+$/, "");

async function postJson(
  fetchFn: Fetch,
  url: string,
  body: unknown,
  timeoutSeconds: number,
  headers: Readonly<Record<string, string>> = {},
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  try {
    const response = await fetchFn(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`${url} answered ${response.status}: ${text.slice(0, 300)}`);
    }
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error(`${url} took longer than ${timeoutSeconds} s to answer`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parses a tool call's argument text; undefined if it doesn't start with a JSON object. Text after
 * the object is ignored: Foundry's DeepSeek sends `{}""` for the second of two calls at once.
 */
export function parseArgs(raw: string): Record<string, unknown> | undefined {
  const text = raw.trim();
  if (text === "") return {};
  try {
    const value: unknown = JSON.parse(text.slice(0, leadingObjectEnd(text)));
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

/** Where the JSON object at the start of `text` ends (strings and nesting followed); else its length. */
function leadingObjectEnd(text: string): number {
  if (!text.startsWith("{")) return text.length;
  let depth = 0;
  let isInString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isInString) {
      if (ch === "\\") i++;
      else if (ch === '"') isInString = false;
    } else if (ch === '"') isInString = true;
    else if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return text.length;
}

const asFunctions = (tools: readonly ToolSpec[]) =>
  tools.map((tool) => ({
    type: "function",
    function: { name: tool.name, description: tool.description, parameters: tool.parameters },
  }));

// ---- OpenAI-compatible ----

const openAiReply = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullish(),
          reasoning_content: z.string().nullish(),
          tool_calls: z
            .array(
              z.object({
                id: z.string(),
                function: z.object({ name: z.string(), arguments: z.string().nullish() }),
              }),
            )
            .nullish(),
        }),
      }),
    )
    .min(1),
});

function toOpenAi(message: ChatMessage): Record<string, unknown> {
  switch (message.role) {
    case "system":
    case "user":
      return { role: message.role, content: message.content };
    case "assistant": {
      const out: Record<string, unknown> = { role: "assistant", content: message.content };
      if (message.toolCalls !== undefined && message.toolCalls.length > 0)
        out.tool_calls = message.toolCalls.map((call) => ({
          id: call.id,
          type: "function",
          function: { name: call.name, arguments: call.rawArgs },
        }));
      if (message.reasoning !== undefined) out.reasoning_content = message.reasoning;
      return out;
    }
    case "tool":
      return { role: "tool", tool_call_id: message.toolCallId, content: message.content };
  }
}

/**
 * How hard a thinking model thinks. DeepSeek has three levels (low, high, max; OpenAI's other names
 * map onto them); low reasons well enough for a hint and keeps him quick.
 */
const THINK_EFFORT = "low";

/** Any OpenAI-style chat completions endpoint (DeepSeek, Foundry, LM Studio, vLLM, llama.cpp). */
export function openAiCompatibleProvider(config: LlmConfig, fetchFn: Fetch = fetch): LlmProvider {
  const { url, model, apiKey, timeoutSeconds, temperature, think } = llmConfigSchema.parse({
    ...config,
    provider: ProviderKind.OpenAiCompatible,
  });
  const endpoint = `${trimSlash(url)}/v1/chat/completions`;
  const headers: Record<string, string> =
    apiKey === undefined ? {} : { authorization: `Bearer ${apiKey}` };
  // Switches for thinking, which not every server takes: DeepSeek's own API thinks by default and
  // takes both; Microsoft Foundry doesn't think unless given `reasoning_effort`, and refuses
  // `thinking`. A refused switch is dropped (the one the error names, else all) and never sent again.
  const switches: Record<string, unknown> = {
    thinking: { type: think ? "enabled" : "disabled" },
    ...(think ? { reasoning_effort: THINK_EFFORT } : {}),
  };
  const refused = new Set<string>();
  const post = async (body: Record<string, unknown>): Promise<unknown> => {
    const full = { model, temperature, ...body };
    for (;;) {
      const extra = Object.fromEntries(
        Object.entries(switches).filter(([name]) => !refused.has(name)),
      );
      try {
        return await postJson(fetchFn, endpoint, { ...full, ...extra }, timeoutSeconds, headers);
      } catch (error) {
        const text = String(error);
        const names = Object.keys(extra);
        const named = names.filter((name) => text.includes(name));
        const isRefusal =
          named.length > 0 || /unrecognized|unknown|extra|not permitted/i.test(text);
        if (!isRefusal || names.length === 0) throw error;
        for (const name of named.length > 0 ? named : names) refused.add(name);
      }
    }
  };
  // Reasoning counts towards the output limit.
  const maxTokens = (forReply: number) => (think ? forReply + 4000 : forReply);
  // Ask for JSON in the reply's exact shape; servers that only offer plain JSON mode (DeepSeek, some
  // local servers) refuse that, so fall back to "any JSON" once and remember.
  let isShapeSupported = true;
  return {
    id: `${ProviderKind.OpenAiCompatible}:${model}${think ? " (thinking)" : ""}`,
    chat: async ({ messages, tools, toolChoice = "auto" }) => {
      const reply = openAiReply.parse(
        await post({
          messages: messages.map(toOpenAi),
          max_tokens: maxTokens(1000),
          ...(tools.length > 0 ? { tools: asFunctions(tools), tool_choice: toolChoice } : {}),
        }),
      );
      const message = reply.choices[0]?.message;
      const out: ChatReply = {
        content: message?.content ?? "",
        toolCalls: (message?.tool_calls ?? []).map((call) => {
          const rawArgs = call.function.arguments ?? "";
          return { id: call.id, name: call.function.name, args: parseArgs(rawArgs), rawArgs };
        }),
      };
      if (message?.reasoning_content) out.reasoning = message.reasoning_content;
      return out;
    },
    complete: async ({ messages, schema }) => {
      const send = (shaped: boolean) =>
        post({
          messages,
          max_tokens: maxTokens(800),
          response_format: shaped
            ? { type: "json_schema", json_schema: { name: "reply", schema, strict: false } }
            : { type: "json_object" },
        });
      let reply: unknown;
      try {
        reply = await send(isShapeSupported);
      } catch (error) {
        if (!isShapeSupported || !/response_format|json_schema/i.test(String(error))) throw error;
        isShapeSupported = false;
        reply = await send(false);
      }
      return openAiReply.parse(reply).choices[0]?.message.content ?? "";
    },
  };
}

// ---- Ollama ----

const ollamaReply = z.object({
  message: z.object({
    content: z.string().nullish(),
    thinking: z.string().nullish(),
    tool_calls: z
      .array(
        z.object({
          id: z.string().optional(),
          function: z.object({
            name: z.string(),
            arguments: z.union([z.record(z.string(), z.unknown()), z.string()]).nullish(),
          }),
        }),
      )
      .nullish(),
  }),
});

function toOllama(message: ChatMessage): Record<string, unknown> {
  switch (message.role) {
    case "system":
    case "user":
      return { role: message.role, content: message.content };
    case "assistant": {
      const out: Record<string, unknown> = { role: "assistant", content: message.content };
      if (message.toolCalls !== undefined && message.toolCalls.length > 0)
        out.tool_calls = message.toolCalls.map((call) => ({
          function: { name: call.name, arguments: call.args ?? {} },
        }));
      return out;
    }
    case "tool":
      return { role: "tool", tool_name: message.name, content: message.content };
  }
}

/** Ollama's own /api/chat, with tools. */
export function ollamaProvider(config: LlmConfig, fetchFn: Fetch = fetch): LlmProvider {
  const { url, model, timeoutSeconds, think, temperature } = llmConfigSchema.parse({
    ...config,
    provider: ProviderKind.Ollama,
  });
  const endpoint = `${trimSlash(url)}/api/chat`;
  // Some models refuse the `think` field outright; remember that and stop sending it.
  let canSetThinking = true;
  let calls = 0;
  const post = async (body: Record<string, unknown>) => {
    const full = { model, stream: false, options: { temperature }, ...body };
    try {
      return await postJson(
        fetchFn,
        endpoint,
        canSetThinking ? { ...full, think } : full,
        timeoutSeconds,
      );
    } catch (error) {
      if (!canSetThinking || !/think/i.test(String(error))) throw error;
      canSetThinking = false;
      return await postJson(fetchFn, endpoint, full, timeoutSeconds);
    }
  };
  return {
    id: `${ProviderKind.Ollama}:${model}${think ? " (thinking)" : ""}`,
    chat: async ({ messages, tools, toolChoice = "auto" }) => {
      // Ollama has no tool_choice: leaving the tools out is how to ask for words only.
      const reply = ollamaReply.parse(
        await post({
          messages: messages.map(toOllama),
          ...(tools.length > 0 && toolChoice === "auto" ? { tools: asFunctions(tools) } : {}),
        }),
      );
      return {
        content: reply.message.content ?? "",
        toolCalls: (reply.message.tool_calls ?? []).map((call) => {
          const raw = call.function.arguments ?? {};
          const rawArgs = typeof raw === "string" ? raw : JSON.stringify(raw);
          calls++;
          return {
            id: call.id ?? `call_${calls}`,
            name: call.function.name,
            args: typeof raw === "string" ? parseArgs(raw) : raw,
            rawArgs,
          };
        }),
      };
    },
    complete: async ({ messages, schema }) => {
      const reply = ollamaReply.parse(await post({ messages, format: schema }));
      return reply.message.content ?? "";
    },
  };
}

/** The provider a config names. */
export function providerFrom(config: LlmConfig, fetchFn: Fetch = fetch): LlmProvider {
  switch (config.provider) {
    case ProviderKind.Ollama:
      return ollamaProvider(config, fetchFn);
    case ProviderKind.OpenAiCompatible:
      return openAiCompatibleProvider(config, fetchFn);
  }
}

/** One scripted model reply: words, tool calls, or both. */
export type ScriptedReply = { say?: string; call?: readonly { name: string; args?: object }[] };

/**
 * A stand-in model for tests and demos: answers with the given replies in turn (the last repeats).
 * A reply can be a function of the chat so far, to react to what the tools returned.
 */
export function scriptedProvider(
  replies: readonly (ScriptedReply | ((request: ChatRequest) => ScriptedReply))[],
): LlmProvider & { readonly requests: ChatRequest[] } {
  const requests: ChatRequest[] = [];
  let calls = 0;
  return {
    id: "scripted",
    requests,
    chat: async (request) => {
      requests.push({ ...request, messages: [...request.messages] });
      const reply = replies[Math.min(requests.length - 1, replies.length - 1)];
      if (reply === undefined) throw new Error("scriptedProvider has no replies");
      const { say, call } = typeof reply === "function" ? reply(request) : reply;
      return {
        content: say ?? "",
        toolCalls: (request.toolChoice === "none" ? [] : (call ?? [])).map((c) => {
          calls++;
          const rawArgs = JSON.stringify(c.args ?? {});
          return { id: `call_${calls}`, name: c.name, args: JSON.parse(rawArgs), rawArgs };
        }),
      };
    },
    complete: async () => "{}",
  };
}
