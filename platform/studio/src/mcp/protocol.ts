import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { withTally } from "./call-timing";

/**
 * The Model Context Protocol, through its official SDK: the server (version negotiation, input
 * validation against each tool's schema, cancellation, progress); the transport is HTTP (http.ts). What's
 * here is only what every Chalk tool shares.
 */

export type Content = CallToolResult["content"][number];

/** What a tool's handler is given besides its arguments: the cancel signal, the progress token. */
export type Extra = RequestHandlerExtra<ServerRequest, ServerNotification>;

export const result = (content: Content[]): CallToolResult => ({ content });

/**
 * Tells the client how a long call is going, when it asked to be told (it sent a progress
 * token); otherwise does nothing.
 */
export function progressOf(extra: Extra): (message: string) => Promise<void> {
  const token = extra._meta?.progressToken;
  let step = 0;
  return async (message) => {
    if (token === undefined) return;
    step += 1;
    await extra
      .sendNotification({
        method: "notifications/progress",
        params: { progressToken: token, progress: step, message },
      })
      .catch(() => {});
  };
}

/**
 * The server, with every tool's answer ending in where its time went (call-timing.ts): each call
 * runs in its own tally, and its one line is the answer's last text.
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: "chalk", version: "0.2.0" });
  const register = server.registerTool.bind(server);
  server.registerTool = ((name: string, config: unknown, handler: Handler) =>
    register(
      name,
      config as never,
      (async (...args: unknown[]) => {
        const { value, line } = await withTally(() => Promise.resolve(handler(...args)));
        return { ...value, content: [...(value.content ?? []), { type: "text", text: line }] };
      }) as never,
    )) as typeof server.registerTool;
  return server;
}

type Handler = (...args: unknown[]) => CallToolResult | Promise<CallToolResult>;
