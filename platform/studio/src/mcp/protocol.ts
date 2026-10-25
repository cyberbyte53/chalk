import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * The Model Context Protocol, through its official SDK: the server (version negotiation, input
 * validation against each tool's schema, cancellation, progress) and the stdio transport. What's
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

export function createServer(): McpServer {
  return new McpServer({ name: "chalk", version: "0.2.0" });
}

/** Serves over stdio. stdout is the protocol, so anything else printed goes to stderr. */
export async function serveStdio(server: McpServer, onClose: () => Promise<void>): Promise<void> {
  console.log = console.error;
  console.info = console.error;
  const transport = new StdioServerTransport();
  // The editor closed the connection or stopped the server: tidy up, then go.
  let isClosing = false;
  const close = async () => {
    if (isClosing) return;
    isClosing = true;
    await onClose().catch(() => {});
    process.exit(0);
  };
  process.stdin.on("end", () => void close());
  for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"] as const)
    process.on(signal, () => void close());
  await server.connect(transport);
  // Set after connecting: connecting sets the transport's own close handler.
  server.server.onclose = () => void close();
}
