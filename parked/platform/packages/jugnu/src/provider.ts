import { z } from "zod";

/** A tool the model may call: its name, what it does, and its arguments as JSON Schema. */
export type ToolSpec = {
  name: string;
  description: string;
  parameters: Readonly<Record<string, unknown>>;
  /**
   * The model server must hold the arguments to the schema exactly (structured outputs). Servers
   * that don't take it are asked again without it.
   */
  strict?: boolean;
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
  /**
   * "none": answer in words only this time (the tools are still described); `{ name }`: call that
   * tool. Default "auto".
   */
  toolChoice?: "auto" | "none" | "required" | { name: string };
};

/** Tokens one call (or a turn) used: all input, the part of it read from the cache, and output. */
export type Usage = {
  input: number;
  cached: number;
  output: number;
  /** Of `input`, what was written to the cache this call (Anthropic reports it). */
  cacheWritten?: number;
};

export type ChatReply = {
  content: string;
  toolCalls: ToolCall[];
  reasoning?: string;
  /** What the model server reported, if it did. */
  usage?: Usage;
};

const toolCallSchema = z
  .object({
    id: z.string().max(200),
    name: z.string().max(200),
    args: z.record(z.string(), z.unknown()).optional(),
    rawArgs: z.string().max(20_000),
  })
  .strict()
  .transform((call): ToolCall => ({ ...call, args: call.args }));

/**
 * A chat as a phone sends it back to the server (his earlier turns): never a system message, which
 * the server writes itself.
 */
export const chatMessageSchema: z.ZodType<ChatMessage, z.ZodTypeDef, unknown> = z.union([
  z.object({ role: z.literal("user"), content: z.string().max(40_000) }).strict(),
  z
    .object({
      role: z.literal("assistant"),
      content: z.string().max(20_000),
      toolCalls: z.array(toolCallSchema).max(20).optional(),
      reasoning: z.string().max(60_000).optional(),
    })
    .strict(),
  z
    .object({
      role: z.literal("tool"),
      toolCallId: z.string().max(200),
      name: z.string().max(200),
      content: z.string().max(40_000),
    })
    .strict(),
]);

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
  /** Anthropic's Messages API (Claude), at https://api.anthropic.com. */
  Anthropic: "anthropic",
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

/**
 * One model call exactly as it went: the request body as sent and the response as it came back
 * (parsed when it is JSON, else the text), with the status and how long it took. Keys and other
 * headers are never kept.
 */
export type CallRecord = {
  at: string;
  url: string;
  ms: number;
  status: number | null;
  request: unknown;
  response: unknown;
  error?: string;
};

/**
 * A fetch that records every call it makes (give it to a provider): so every model call, from the
 * dev shell, the server or the bench, can be read back exactly.
 */
export function recordingFetch(record: (call: CallRecord) => void, fetchFn: Fetch = fetch): Fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const started = Date.now();
    const at = new Date(started).toISOString();
    const url = String(input instanceof Request ? input.url : input);
    const parse = (text: string): unknown => {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    };
    const request = typeof init?.body === "string" ? parse(init.body) : null;
    try {
      const response = await fetchFn(input, init);
      const text = await response.clone().text();
      record({
        at,
        url,
        ms: Date.now() - started,
        status: response.status,
        request,
        response: parse(text),
      });
      return response;
    } catch (error) {
      record({
        at,
        url,
        ms: Date.now() - started,
        status: null,
        request,
        response: null,
        error: String(error),
      });
      throw error;
    }
  }) as Fetch;
}

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

const asFunctions = (tools: readonly ToolSpec[], canBeStrict = true) =>
  tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      ...(canBeStrict && tool.strict === true ? { strict: true } : {}),
    },
  }));

const openAiToolChoice = (choice: ChatRequest["toolChoice"]) =>
  typeof choice === "object" ? { type: "function", function: { name: choice.name } } : choice;

// ---- OpenAI-compatible ----

const openAiUsage = z
  .object({
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional(),
    /** OpenAI and Microsoft Foundry. */
    prompt_tokens_details: z.object({ cached_tokens: z.number().nullish() }).nullish(),
    /** DeepSeek's own API. */
    prompt_cache_hit_tokens: z.number().optional(),
  })
  .nullish();

const openAiReply = z.object({
  usage: openAiUsage,
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
  // Strict tool schemas, unless this server refused them once.
  let canBeStrict = true;
  return {
    id: `${ProviderKind.OpenAiCompatible}:${model}${think ? " (thinking)" : ""}`,
    chat: async ({ messages, tools, toolChoice = "auto" }) => {
      const send = () => {
        const isStrict = canBeStrict && tools.some((tool) => tool.strict === true);
        return post({
          messages: messages.map(toOpenAi),
          max_tokens: maxTokens(1500),
          ...(tools.length > 0
            ? {
                tools: asFunctions(tools, canBeStrict),
                tool_choice: openAiToolChoice(toolChoice),
                // Strict schemas can't be held across several calls at once.
                ...(isStrict ? { parallel_tool_calls: false } : {}),
              }
            : {}),
        });
      };
      let raw: unknown;
      try {
        raw = await send();
      } catch (error) {
        if (!canBeStrict || !/strict|parallel_tool_calls|json_schema/i.test(String(error)))
          throw error;
        canBeStrict = false;
        raw = await send();
      }
      const reply = openAiReply.parse(raw);
      const message = reply.choices[0]?.message;
      const out: ChatReply = {
        content: message?.content ?? "",
        toolCalls: (message?.tool_calls ?? []).map((call) => {
          const rawArgs = call.function.arguments ?? "";
          return { id: call.id, name: call.function.name, args: parseArgs(rawArgs), rawArgs };
        }),
      };
      if (message?.reasoning_content) out.reasoning = message.reasoning_content;
      if (reply.usage) {
        const used = reply.usage;
        out.usage = {
          input: used.prompt_tokens ?? 0,
          cached: used.prompt_tokens_details?.cached_tokens ?? used.prompt_cache_hit_tokens ?? 0,
          output: used.completion_tokens ?? 0,
        };
      }
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

// ---- Anthropic ----

const anthropicReply = z.object({
  content: z.array(
    z.union([
      z.object({ type: z.literal("text"), text: z.string() }),
      z.object({
        type: z.literal("tool_use"),
        id: z.string(),
        name: z.string(),
        input: z.unknown(),
      }),
      z.object({ type: z.literal("thinking"), thinking: z.string() }).passthrough(),
      z.object({ type: z.string() }).passthrough(),
    ]),
  ),
  usage: z
    .object({
      input_tokens: z.number().optional(),
      output_tokens: z.number().optional(),
      cache_read_input_tokens: z.number().nullish(),
      cache_creation_input_tokens: z.number().nullish(),
    })
    .nullish(),
});

type AnthropicBlock = Record<string, unknown>;
type AnthropicMessage = { role: "user" | "assistant"; content: AnthropicBlock[] };

/**
 * Our chat in Anthropic's shape: system text apart; tool results as user blocks; and turns of the
 * same role merged, since the API wants user and assistant to alternate.
 */
function toAnthropic(messages: readonly ChatMessage[]): {
  system: string;
  turns: AnthropicMessage[];
} {
  const system: string[] = [];
  const turns: AnthropicMessage[] = [];
  const push = (role: AnthropicMessage["role"], blocks: AnthropicBlock[]) => {
    if (blocks.length === 0) return;
    const last = turns[turns.length - 1];
    if (last !== undefined && last.role === role) last.content.push(...blocks);
    else turns.push({ role, content: blocks });
  };
  for (const message of messages) {
    switch (message.role) {
      case "system":
        system.push(message.content);
        break;
      case "user":
        push("user", message.content === "" ? [] : [{ type: "text", text: message.content }]);
        break;
      case "assistant":
        push("assistant", [
          // A thinking model's blocks go back as they came (signatures and all), before its words.
          ...thinkingBlocksOf(message.reasoning),
          ...(message.content.trim() === "" ? [] : [{ type: "text", text: message.content }]),
          ...(message.toolCalls ?? []).map((call) => ({
            type: "tool_use",
            id: call.id,
            name: call.name,
            input: call.args ?? {},
          })),
        ]);
        break;
      case "tool":
        push("user", [
          { type: "tool_result", tool_use_id: message.toolCallId, content: message.content },
        ]);
        break;
    }
  }
  return { system: system.join("\n\n"), turns };
}

/** Claude's thinking blocks, kept in `reasoning` as their JSON so they can go back unchanged. */
const THINKING_PREFIX = "anthropic-thinking:";
function thinkingBlocksOf(reasoning: string | undefined): AnthropicBlock[] {
  if (reasoning === undefined || !reasoning.startsWith(THINKING_PREFIX)) return [];
  try {
    const blocks = JSON.parse(reasoning.slice(THINKING_PREFIX.length)) as unknown;
    return Array.isArray(blocks) ? (blocks as AnthropicBlock[]) : [];
  } catch {
    return [];
  }
}

const anthropicToolChoice = (choice: ChatRequest["toolChoice"]) =>
  typeof choice === "object"
    ? { type: "tool", name: choice.name }
    : { type: choice === "required" ? "any" : (choice ?? "auto") };

/**
 * Claude through Anthropic's Messages API. The system prompt and the tools are marked for prompt
 * caching (they repeat every call of a conversation). Thinking is off (`think` is ignored for now):
 * it costs seconds and tokens the student waits for, and thinking blocks would have to be sent back
 * with their signatures across tool calls.
 */
export function anthropicProvider(config: LlmConfig, fetchFn: Fetch = fetch): LlmProvider {
  // No temperature: newer Claude models refuse it.
  const { url, model, apiKey, timeoutSeconds, think } = llmConfigSchema.parse({
    ...config,
    provider: ProviderKind.Anthropic,
  });
  const endpoint = `${trimSlash(url)}/v1/messages`;
  const headers: Record<string, string> = {
    "anthropic-version": "2023-06-01",
    ...(apiKey === undefined ? {} : { "x-api-key": apiKey }),
  };
  const cached = { cache_control: { type: "ephemeral" } };
  // How to say "don't think": "disabled", unless the model asks for another way (its error names it),
  // which is then used for every call after.
  let thinkingOff: Record<string, unknown> = { type: "disabled" };
  const toolsOf = (tools: readonly ToolSpec[]) =>
    tools.map((tool, i) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
      ...(i === tools.length - 1 ? cached : {}),
    }));
  const call = async (
    messages: readonly ChatMessage[],
    tools: readonly ToolSpec[],
    toolChoice: ChatRequest["toolChoice"],
    maxTokens: number,
  ) => {
    const { system, turns } = toAnthropic(messages);
    // A third cache point at the end of the chat: the next call reads everything up to here from
    // the cache and pays full price only for what is new (with the tools and the system, 3 of 4).
    const lastBlock = turns.at(-1)?.content.at(-1);
    if (lastBlock !== undefined) Object.assign(lastBlock, cached);
    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      messages: turns,
      // Newer models think unless told not to (their default, when `think` is on). A forced tool
      // call can't go with thinking, so a thinking model is only ever left to choose.
      ...(think ? {} : { thinking: thinkingOff }),
      ...(system === "" ? {} : { system: [{ type: "text", text: system, ...cached }] }),
      ...(tools.length > 0
        ? {
            tools: toolsOf(tools),
            tool_choice: anthropicToolChoice(think ? "auto" : toolChoice),
          }
        : {}),
    };
    try {
      return anthropicReply.parse(await postJson(fetchFn, endpoint, body, timeoutSeconds, headers));
    } catch (error) {
      const asked = /To turn thinking off on this model, send \\?"thinking\\?": (\{[^}]*\})/.exec(
        String(error),
      )?.[1];
      if (asked === undefined) throw error;
      thinkingOff = JSON.parse(asked.replace(/\\"/g, '"')) as Record<string, unknown>;
      return anthropicReply.parse(
        await postJson(
          fetchFn,
          endpoint,
          { ...body, thinking: thinkingOff },
          timeoutSeconds,
          headers,
        ),
      );
    }
  };
  return {
    id: `${ProviderKind.Anthropic}:${model}${think ? " (thinking)" : ""}`,
    chat: async ({ messages, tools, toolChoice = "auto" }) => {
      const reply = await call(messages, tools, toolChoice, 1500);
      const out: ChatReply = { content: "", toolCalls: [] };
      const texts: string[] = [];
      const thinking = reply.content.filter(
        (block) => block.type === "thinking" || block.type === "redacted_thinking",
      );
      if (thinking.length > 0) out.reasoning = THINKING_PREFIX + JSON.stringify(thinking);
      for (const block of reply.content) {
        if (block.type === "text" && "text" in block) texts.push(block.text as string);
        if (block.type === "tool_use" && "id" in block && "name" in block) {
          const input = (block as { input: unknown }).input;
          const rawArgs = JSON.stringify(input ?? {});
          out.toolCalls.push({
            id: block.id as string,
            name: block.name as string,
            args: parseArgs(rawArgs),
            rawArgs,
          });
        }
      }
      out.content = texts.join("\n\n");
      if (reply.usage) {
        const used = reply.usage;
        const read = used.cache_read_input_tokens ?? 0;
        const written = used.cache_creation_input_tokens ?? 0;
        out.usage = {
          input: (used.input_tokens ?? 0) + read + written,
          cached: read,
          output: used.output_tokens ?? 0,
          cacheWritten: written,
        };
      }
      return out;
    },
    // JSON of a given shape: asked for as the arguments of one forced tool.
    complete: async ({ messages, schema }) => {
      const reply = await call(
        messages,
        [{ name: "reply", description: "Give your answer.", parameters: schema }],
        { name: "reply" },
        1200,
      );
      const used = reply.content.find((block) => block.type === "tool_use");
      return JSON.stringify(used === undefined ? {} : (used as { input: unknown }).input);
    },
  };
}

// ---- Ollama ----

const ollamaReply = z.object({
  prompt_eval_count: z.number().optional(),
  eval_count: z.number().optional(),
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
      // Ollama has no tool_choice: leaving the tools out is how to ask for words only (and a call
      // can't be forced).
      const reply = ollamaReply.parse(
        await post({
          messages: messages.map(toOllama),
          ...(tools.length > 0 && toolChoice !== "none"
            ? { tools: asFunctions(tools, false) }
            : {}),
        }),
      );
      return {
        content: reply.message.content ?? "",
        usage: { input: reply.prompt_eval_count ?? 0, cached: 0, output: reply.eval_count ?? 0 },
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
    case ProviderKind.Anthropic:
      return anthropicProvider(config, fetchFn);
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
