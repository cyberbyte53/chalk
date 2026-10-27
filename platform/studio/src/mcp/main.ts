import { createServer } from "node:http";
import { mcpMiddleware } from "./http";

/**
 * The chalk MCP, as its own service, at /mcp. Where it listens and who may connect are settings,
 * so the same service runs on a laptop now and on a server later:
 *
 * - CHALK_MCP_HOST: the address to listen on. Default 127.0.0.1, this machine's loopback, which
 *   nothing on the network can reach.
 * - CHALK_MCP_PORT: default 5174.
 * - CHALK_MCP_ALLOW: who may connect (http.ts). Default this machine only.
 * - CHALK_TOKENS: which token gives which role (http.ts).
 *
 * The tools use the dev server for boards and comments, and start it when it isn't running.
 * Start: `pnpm mcp` (or `pnpm dev`, or the editor).
 */

const PORT = Number(process.env.CHALK_MCP_PORT ?? 5174);
const HOST = process.env.CHALK_MCP_HOST ?? "127.0.0.1";

const mcp = mcpMiddleware();
const server = createServer((req, res) => {
  const path = (req.url ?? "").split("?")[0];
  if (path === "/health") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, service: "chalk-mcp" }));
    return;
  }
  if (path !== "/mcp") {
    res.statusCode = 404;
    res.end("The chalk MCP is at /mcp.");
    return;
  }
  mcp.handle(req, res).catch((error: unknown) => {
    if (res.headersSent) return;
    res.statusCode = 500;
    res.end(String(error instanceof Error ? error.message : error));
  });
});

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${PORT} is taken: the chalk MCP is probably running already (or set CHALK_MCP_PORT).`
      : String(error),
  );
  process.exit(1);
});

server.listen(PORT, HOST, () => console.error(`chalk MCP on http://${HOST}:${PORT}/mcp`));

const stop = () => {
  server.close();
  void mcp.close().finally(() => process.exit(0));
};
for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"] as const) process.on(signal, stop);
