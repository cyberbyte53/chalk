import { type ModelMessage, type ToolResultPart, generateText, tool } from "ai";
import type { ZodTypeAny } from "zod";
import type { Model } from "./model";

/**
 * Our agent loop (platform/docs/plans/jugnu-agent.md), provider-neutral: one request at a time,
 * through the model layer (model.ts). We answer every tool call ourselves; a tool named as the
 * turn's end (Jugnu's `reply`) stops the turn, and its result comes with the next message (hers).
 * The conversation is the AI SDK's message list, only ever appended to.
 */

/** A tool: what it is for, what it takes, and (unless it ends the turn) what running it says. */
export type ToolSpec = {
  description: string;
  input: ZodTypeAny;
  run?: (input: unknown) => Promise<string>;
};

/** One request, as it happened: what the model thought, said and called, and what it cost. */
export type Request = {
  thinking: string[];
  text: string;
  calls: { id: string; name: string; input: unknown }[];
  finish: string;
  usage: { uncached?: number; cacheRead?: number; cacheWrite?: number; output?: number };
  warnings: string[];
  ms: number;
};

/** How a turn ended: the ending tool called (its id and input), or plain words. */
export type Ended =
  | { kind: "tool"; id: string; name: string; input: unknown }
  | { kind: "text"; text: string };

export type Turn = {
  requests: Request[];
  ended: Ended;
  /** Results owed for other calls of the last response: sent with the ending tool's result. */
  owed: ToolResultPart[];
};

const result = (id: string, name: string, value: string, isError = false): ToolResultPart => ({
  type: "tool-result",
  toolCallId: id,
  toolName: name,
  output: isError ? { type: "error-text", value } : { type: "text", value },
});

/** One turn of a side: requests until it ends (the ending tool, or words with no tool call). */
export async function runTurn(o: {
  model: Model;
  instructions: readonly string[];
  /** The conversation: appended to here (his messages, and our answers to his calls). */
  messages: ModelMessage[];
  tools: Record<string, ToolSpec>;
  /** The tool that ends the turn (null: the turn ends when it answers in words). */
  endsWith: string | null;
  /** A guard against a broken run: past it, the run is broken, not the turn ended. */
  most?: number;
  onRequest?: (r: Request) => void;
  /** The most it may write a request, thinking included (the provider's default if unset). */
  maxOutput?: number;
}): Promise<Turn> {
  const tools = Object.fromEntries(
    Object.entries(o.tools).map(([name, t]) => [
      name,
      tool({ description: t.description, inputSchema: t.input }),
    ]),
  );
  const order = Object.keys(o.tools).sort();
  const requests: Request[] = [];
  for (let i = 0; i < (o.most ?? 40); i++) {
    const started = Date.now();
    const r = await generateText({
      model: o.model.model,
      instructions: o.model.instructions(o.instructions),
      messages: o.messages,
      tools,
      toolOrder: order as never,
      maxRetries: 0,
      ...(o.maxOutput === undefined ? {} : { maxOutputTokens: o.maxOutput }),
      providerOptions: o.model.options,
    });
    // Only his message is kept: we answer his calls (never the SDK's own answers to broken ones).
    const his = r.responseMessages.find((m) => m.role === "assistant");
    if (his !== undefined) o.messages.push(his);
    const parts = his === undefined || typeof his.content === "string" ? [] : his.content;
    const calls = parts.flatMap((p) =>
      p.type === "tool-call" ? [{ id: p.toolCallId, name: p.toolName, input: p.input }] : [],
    );
    const request: Request = {
      thinking: parts.flatMap((p) => (p.type === "reasoning" && p.text !== "" ? [p.text] : [])),
      text: r.text,
      calls,
      finish: r.finishReason,
      usage: {
        uncached: r.usage.inputTokenDetails.noCacheTokens,
        cacheRead: r.usage.inputTokenDetails.cacheReadTokens,
        cacheWrite: r.usage.inputTokenDetails.cacheWriteTokens,
        output: r.usage.outputTokens,
      },
      warnings: (r.warnings ?? []).map((w) => JSON.stringify(w)),
      ms: Date.now() - started,
    };
    requests.push(request);
    o.onRequest?.(request);
    if (calls.length === 0) return { requests, ended: { kind: "text", text: r.text }, owed: [] };
    const answers: ToolResultPart[] = [];
    let ended: Ended | undefined;
    for (const call of calls) {
      if (r.finishReason === "length") {
        answers.push(
          result(call.id, call.name, "Cut off before it was complete: say it again.", true),
        );
      } else if (call.name === o.endsWith) {
        if (ended === undefined) ended = { kind: "tool", ...call };
        else
          answers.push(result(call.id, call.name, "One reply a turn: this one wasn't sent.", true));
      } else {
        const spec = o.tools[call.name];
        if (spec?.run === undefined) {
          answers.push(result(call.id, call.name, `There is no tool "${call.name}".`, true));
          continue;
        }
        try {
          answers.push(result(call.id, call.name, await spec.run(call.input)));
        } catch (error) {
          answers.push(
            result(
              call.id,
              call.name,
              String(error instanceof Error ? error.message : error),
              true,
            ),
          );
        }
      }
    }
    if (ended !== undefined) return { requests, ended, owed: answers };
    o.messages.push({ role: "tool", content: answers });
  }
  throw new Error(`Broken: more than ${o.most ?? 40} requests in one turn`);
}
