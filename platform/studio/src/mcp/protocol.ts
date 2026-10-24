import { createInterface } from "node:readline";

/**
 * The few parts of the Model Context Protocol a local tool server needs: JSON-RPC over stdio,
 * `initialize`, `tools/list` and `tools/call`. Hand-written (about a page) rather than a
 * dependency: the protocol's stdio transport is newline-delimited JSON and stable.
 */

export type Content =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string };

export type Tool = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  run: (args: Record<string, unknown>) => Promise<Content[]>;
};

const PROTOCOL = "2025-06-18";

export function serve(info: { name: string; version: string }, tools: readonly Tool[]): void {
  // stdout is the protocol: anything else printed by our code or a library goes to stderr.
  console.log = console.error;
  console.info = console.error;
  const write = (message: unknown) => process.stdout.write(`${JSON.stringify(message)}\n`);
  const byName = new Map(tools.map((t) => [t.name, t]));
  const lines = createInterface({ input: process.stdin });
  lines.on("line", async (line) => {
    if (line.trim() === "") return;
    let msg: { id?: number | string; method?: string; params?: Record<string, unknown> };
    try {
      msg = JSON.parse(line);
    } catch {
      return;
    }
    if (msg.id === undefined) return; // a notification: nothing to answer
    const reply = (result: unknown) => write({ jsonrpc: "2.0", id: msg.id, result });
    const fail = (code: number, message: string) =>
      write({ jsonrpc: "2.0", id: msg.id, error: { code, message } });
    switch (msg.method) {
      case "initialize":
        return reply({
          protocolVersion: String(msg.params?.protocolVersion ?? PROTOCOL),
          capabilities: { tools: {} },
          serverInfo: info,
        });
      case "ping":
        return reply({});
      case "tools/list":
        return reply({
          tools: tools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema,
          })),
        });
      case "tools/call": {
        const tool = byName.get(String(msg.params?.name));
        if (tool === undefined) return fail(-32602, `no tool ${String(msg.params?.name)}`);
        try {
          const content = await tool.run((msg.params?.arguments ?? {}) as Record<string, unknown>);
          return reply({ content });
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          return reply({ content: [{ type: "text", text }], isError: true });
        }
      }
      default:
        return fail(-32601, `unknown method ${String(msg.method)}`);
    }
  });
}
