import { describe, expect, it } from "vitest";
import {
  type ChatMessage,
  ProviderKind,
  ollamaProvider,
  openAiCompatibleProvider,
  parseArgs,
  providerFrom,
} from "./provider";

type Sent = { url: string; body: Record<string, unknown>; headers: Record<string, string> };

function fakeFetch(answer: unknown, status = 200): { fetchFn: typeof fetch; sent: Sent[] } {
  const sent: Sent[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    sent.push({
      url,
      body: JSON.parse(String(init.body)),
      headers: init.headers as Record<string, string>,
    });
    return new Response(JSON.stringify(answer), { status });
  }) as unknown as typeof fetch;
  return { fetchFn, sent };
}

const SCHEMA = { type: "object", properties: { say: { type: "string" } } };
const request = { messages: [{ role: "user" as const, content: "help" }], schema: SCHEMA };

describe("providers", () => {
  it("talks to Ollama's chat API and holds the reply to the schema", async () => {
    const { fetchFn, sent } = fakeFetch({ message: { content: '{"say":"hi"}' } });
    const provider = ollamaProvider(
      { provider: ProviderKind.Ollama, url: "http://localhost:11434/", model: "qwen2.5:7b" },
      fetchFn,
    );
    expect(await provider.complete(request)).toBe('{"say":"hi"}');
    expect(provider.id).toBe("ollama:qwen2.5:7b");
    expect(sent[0]?.url).toBe("http://localhost:11434/api/chat");
    expect(sent[0]?.body).toMatchObject({
      model: "qwen2.5:7b",
      stream: false,
      format: SCHEMA,
      think: false,
    });
  });

  it("asks thinking models not to think, unless told to, and copes with models that can't", async () => {
    const thinking = fakeFetch({ message: { content: "{}" } });
    const on = ollamaProvider(
      { provider: ProviderKind.Ollama, url: "http://x", model: "qwen3.5:9b", think: true },
      thinking.fetchFn,
    );
    await on.complete(request);
    expect(thinking.sent[0]?.body.think).toBe(true);
    expect(on.id).toBe("ollama:qwen3.5:9b (thinking)");

    // A model that refuses the field: the request is sent again without it, and never again with it.
    const sent: Record<string, unknown>[] = [];
    const picky = (async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      sent.push(body);
      return "think" in body
        ? new Response(JSON.stringify({ error: "model does not support thinking" }), {
            status: 400,
          })
        : new Response(JSON.stringify({ message: { content: "ok" } }));
    }) as unknown as typeof fetch;
    const plain = ollamaProvider(
      { provider: ProviderKind.Ollama, url: "http://x", model: "gemma4:12b" },
      picky,
    );
    expect(await plain.complete(request)).toBe("ok");
    expect(await plain.complete(request)).toBe("ok");
    expect(sent.map((b) => "think" in b)).toEqual([true, false, false]);
  });

  it("talks to any OpenAI-style endpoint, with a key if given", async () => {
    const { fetchFn, sent } = fakeFetch({ choices: [{ message: { content: "{}" } }] });
    const provider = providerFrom(
      {
        provider: ProviderKind.OpenAiCompatible,
        url: "http://localhost:1234",
        model: "local",
        apiKey: "k",
      },
      fetchFn,
    );
    expect(await provider.complete(request)).toBe("{}");
    expect(sent[0]?.url).toBe("http://localhost:1234/v1/chat/completions");
    expect(sent[0]?.headers.authorization).toBe("Bearer k");
    expect(sent[0]?.body.response_format).toMatchObject({ type: "json_schema" });
  });

  it("falls back to plain JSON mode for servers without shaped JSON (e.g. DeepSeek), once", async () => {
    const sent: Record<string, unknown>[] = [];
    const deepseekLike = (async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      sent.push(body);
      return (body.response_format as { type: string }).type === "json_schema"
        ? new Response(
            JSON.stringify({ error: { message: "This response_format type is unavailable now" } }),
            { status: 400 },
          )
        : new Response(JSON.stringify({ choices: [{ message: { content: '{"say":"hi"}' } }] }));
    }) as unknown as typeof fetch;
    const provider = openAiCompatibleProvider(
      {
        provider: ProviderKind.OpenAiCompatible,
        url: "https://api.deepseek.com",
        model: "deepseek-flash",
        apiKey: "k",
      },
      deepseekLike,
    );
    expect(await provider.complete(request)).toBe('{"say":"hi"}');
    expect(await provider.complete(request)).toBe('{"say":"hi"}');
    expect(sent.map((b) => (b.response_format as { type: string }).type)).toEqual([
      "json_schema",
      "json_object",
      "json_object",
    ]);
  });

  it("says plainly when the model server fails", async () => {
    const { fetchFn } = fakeFetch({ error: "model not found" }, 404);
    const provider = openAiCompatibleProvider(
      { provider: ProviderKind.OpenAiCompatible, url: "http://x", model: "m" },
      fetchFn,
    );
    await expect(provider.complete(request)).rejects.toThrow(/404/);
  });
});

const TOOLS = [
  {
    name: "line__moveMarker",
    description: "Move the marker",
    parameters: { type: "object", properties: { to: { type: "number" } }, required: ["to"] },
  },
];

const conversation: ChatMessage[] = [
  { role: "system", content: "board" },
  { role: "user", content: "show me 1.5" },
  {
    role: "assistant",
    content: "Watch.",
    toolCalls: [{ id: "c1", name: "line__moveMarker", args: { to: 1.5 }, rawArgs: '{"to":1.5}' }],
  },
  { role: "tool", toolCallId: "c1", name: "line__moveMarker", content: '{"ok":true}' },
];

describe("tool calling", () => {
  it("reads the JSON object at the start of argument text, ignoring what follows", () => {
    expect(parseArgs("")).toEqual({});
    expect(parseArgs('{}""')).toEqual({});
    expect(parseArgs('{"to":1.5}{"to":1.5}')).toEqual({ to: 1.5 });
    expect(parseArgs('{"label":"a } b"} x')).toEqual({ label: "a } b" });
    expect(parseArgs("{oops")).toBeUndefined();
    expect(parseArgs("[1]")).toBeUndefined();
  });

  it("speaks OpenAI's format: tools as functions, arguments as text, results by call id", async () => {
    const { fetchFn, sent } = fakeFetch({
      choices: [
        {
          message: {
            content: "Now you.",
            tool_calls: [
              {
                id: "c2",
                type: "function",
                function: { name: "wait_for_student", arguments: '{"watch":["line"]}' },
              },
              { id: "c3", type: "function", function: { name: "point", arguments: "{oops" } },
            ],
          },
        },
      ],
    });
    const provider = openAiCompatibleProvider(
      { provider: ProviderKind.OpenAiCompatible, url: "https://api.deepseek.com", model: "m" },
      fetchFn,
    );
    const reply = await provider.chat({ messages: conversation, tools: TOOLS });
    expect(reply.content).toBe("Now you.");
    expect(reply.toolCalls[0]).toEqual({
      id: "c2",
      name: "wait_for_student",
      args: { watch: ["line"] },
      rawArgs: '{"watch":["line"]}',
    });
    // Bad argument text isn't thrown away: the session tells the model it wasn't JSON.
    expect(reply.toolCalls[1]?.args).toBeUndefined();
    const body = sent[0]?.body as Record<string, unknown>;
    expect(body.tool_choice).toBe("auto");
    expect(body.tools).toEqual([{ type: "function", function: TOOLS[0] }]);
    expect(body.messages).toEqual([
      { role: "system", content: "board" },
      { role: "user", content: "show me 1.5" },
      {
        role: "assistant",
        content: "Watch.",
        tool_calls: [
          {
            id: "c1",
            type: "function",
            function: { name: "line__moveMarker", arguments: '{"to":1.5}' },
          },
        ],
      },
      { role: "tool", tool_call_id: "c1", content: '{"ok":true}' },
    ]);
  });

  it("switches DeepSeek's thinking off, and drops the switch for servers that refuse it", async () => {
    const sent: Record<string, unknown>[] = [];
    const picky = (async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      sent.push(body);
      return "thinking" in body
        ? new Response(JSON.stringify({ error: "Unrecognized request argument: thinking" }), {
            status: 400,
          })
        : new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }));
    }) as unknown as typeof fetch;
    const provider = openAiCompatibleProvider(
      {
        provider: ProviderKind.OpenAiCompatible,
        url: "https://x.openai.azure.com/openai",
        model: "jugnu-main",
      },
      picky,
    );
    await provider.chat({ messages: conversation, tools: TOOLS });
    await provider.chat({ messages: conversation, tools: TOOLS });
    expect(sent[0]?.thinking).toEqual({ type: "disabled" });
    expect(sent.map((b) => "thinking" in b)).toEqual([true, false, false]);
  });

  it("thinks on Foundry through reasoning_effort, dropping only the switch it refuses", async () => {
    const sent: Record<string, unknown>[] = [];
    const foundry = (async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      sent.push(body);
      return "thinking" in body
        ? new Response(
            JSON.stringify({ error: "Unrecognized request argument supplied: thinking" }),
            { status: 400 },
          )
        : new Response(
            JSON.stringify({
              choices: [{ message: { content: "ok", reasoning_content: "2.25 is more than 2" } }],
            }),
          );
    }) as unknown as typeof fetch;
    const provider = openAiCompatibleProvider(
      {
        provider: ProviderKind.OpenAiCompatible,
        url: "https://x.services.ai.azure.com/openai",
        model: "DeepSeek-V4-Flash",
        think: true,
      },
      foundry,
    );
    const reply = await provider.chat({ messages: conversation, tools: TOOLS });
    await provider.chat({ messages: conversation, tools: TOOLS });
    expect(reply).toMatchObject({ content: "ok", reasoning: "2.25 is more than 2" });
    expect(sent.map((b) => "thinking" in b)).toEqual([true, false, false]);
    expect(sent.map((b) => b.reasoning_effort)).toEqual(["low", "low", "low"]);
  });

  it("sends a thinking model's reasoning back with its tool calls", async () => {
    const { fetchFn, sent } = fakeFetch({ choices: [{ message: { content: "ok" } }] });
    const provider = openAiCompatibleProvider(
      {
        provider: ProviderKind.OpenAiCompatible,
        url: "https://api.deepseek.com",
        model: "deepseek-flash",
        think: true,
      },
      fetchFn,
    );
    const withReasoning: ChatMessage[] = conversation.map((m) =>
      m.role === "assistant" ? { ...m, reasoning: "1.5 squared is 2.25" } : m,
    );
    await provider.chat({ messages: withReasoning, tools: TOOLS });
    expect(sent[0]?.body.thinking).toEqual({ type: "enabled" });
    const messages = sent[0]?.body.messages as Record<string, unknown>[];
    expect(messages[2]?.reasoning_content).toBe("1.5 squared is 2.25");
  });

  it("asks for words only with tool_choice none", async () => {
    const { fetchFn, sent } = fakeFetch({ choices: [{ message: { content: "ok" } }] });
    const provider = openAiCompatibleProvider(
      { provider: ProviderKind.OpenAiCompatible, url: "http://x", model: "m" },
      fetchFn,
    );
    await provider.chat({ messages: conversation, tools: TOOLS, toolChoice: "none" });
    expect(sent[0]?.body.tool_choice).toBe("none");
  });

  it("speaks Ollama's format: arguments as objects, results by tool name, ids made up", async () => {
    const { fetchFn, sent } = fakeFetch({
      message: {
        content: "",
        tool_calls: [{ function: { name: "calculate", arguments: { expression: "1.5^2" } } }],
      },
    });
    const provider = ollamaProvider(
      { provider: ProviderKind.Ollama, url: "http://127.0.0.1:11434", model: "qwen3.5:9b" },
      fetchFn,
    );
    const reply = await provider.chat({ messages: conversation, tools: TOOLS });
    expect(reply.toolCalls).toEqual([
      {
        id: "call_1",
        name: "calculate",
        args: { expression: "1.5^2" },
        rawArgs: '{"expression":"1.5^2"}',
      },
    ]);
    const body = sent[0]?.body as Record<string, unknown>;
    expect(body.messages).toEqual([
      { role: "system", content: "board" },
      { role: "user", content: "show me 1.5" },
      {
        role: "assistant",
        content: "Watch.",
        tool_calls: [{ function: { name: "line__moveMarker", arguments: { to: 1.5 } } }],
      },
      { role: "tool", tool_name: "line__moveMarker", content: '{"ok":true}' },
    ]);
    expect(body.tools).toEqual([{ type: "function", function: TOOLS[0] }]);
    // Words only: Ollama has no tool_choice, so the tools are left out.
    await provider.chat({ messages: conversation, tools: TOOLS, toolChoice: "none" });
    expect(sent[1]?.body.tools).toBeUndefined();
  });
});
