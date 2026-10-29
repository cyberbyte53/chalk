import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Role } from "../comments";
import { closeBrowser, closeLane } from "./app-driver";
import { type Who, chalkMcp } from "./tools";

/**
 * The chalk MCP over HTTP (the spec's Streamable HTTP transport), served at /mcp by its own
 * service (main.ts): one endpoint for every agent. Each connection says who it is with a bearer token; the token
 * decides the caller's role, and the caller gets its own MCP session showing only what that role
 * may do (tools.ts). Nobody picks a role per call.
 *
 * Settings (main.ts has where it listens):
 * - CHALK_TOKENS: JSON, token → role ({"…": "reviewer"}); the development tokens below by default.
 *   On a laptop they are only as private as its config files; on a server they come from sign-in.
 * - CHALK_MCP_ALLOW: the addresses that may connect, comma-separated, or "*" for any (then only
 *   tokens decide). Default this machine only.
 */

const LOOPBACK = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];

/** Whether a connection from `address` may be heard at all (CHALK_MCP_ALLOW). */
export function isAllowed(address: string, allow = process.env.CHALK_MCP_ALLOW): boolean {
  if (allow === undefined || allow.trim() === "") return LOOPBACK.includes(address);
  const list = allow.split(",").map((a) => a.trim());
  if (list.includes("*")) return true;
  const plain = address.replace(/^::ffff:/, "");
  return list.some(
    (a) => a === address || a === plain || (a === "localhost" && LOOPBACK.includes(address)),
  );
}

/** Development tokens: one per agent role, written in the repo's MCP configs. */
export const DEV_TOKENS: Readonly<Record<string, Who["role"]>> = {
  "chalk-dev-fixer": Role.Fixer,
  "chalk-dev-reviewer": Role.Reviewer,
};

function tokens(): Readonly<Record<string, Who["role"]>> {
  try {
    const given = process.env.CHALK_TOKENS;
    if (given === undefined) return DEV_TOKENS;
    const parsed = JSON.parse(given) as Record<string, string>;
    const roles: readonly string[] = [Role.Fixer, Role.Reviewer];
    return Object.fromEntries(
      Object.entries(parsed).filter(([, role]) => roles.includes(role)),
    ) as Record<string, Who["role"]>;
  } catch {
    return {};
  }
}

/** Who a request is from, by its bearer token (and x-chalk-name to name the agent), or null. */
export function whoOf(req: IncomingMessage): Who | null {
  const auth = String(req.headers.authorization ?? "");
  const token = /^Bearer\s+(.+)$/i.exec(auth)?.[1]?.trim();
  const role = token === undefined ? undefined : tokens()[token];
  if (role === undefined) return null;
  const name = String(req.headers["x-chalk-name"] ?? "").trim();
  return { role, name: name !== "" && name !== "you" ? name : role };
}

/**
 * The /mcp middleware: each request on its own (MCP's stateless HTTP), held to its token's role.
 * No session lives here, so the service restarting (its code changed) loses nothing a caller holds:
 * who it is comes with every request (its token), and its page for drawing boards too (the agent
 * id its relay, connect.ts, sends).
 */
export function mcpMiddleware(): {
  handle: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
  close: () => Promise<void>;
} {
  const refuse = (res: ServerResponse, status: number, message: string) => {
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    if (status === 401) res.setHeader("www-authenticate", 'Bearer realm="chalk"');
    res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32001, message }, id: null }));
  };

  const readBody = (req: IncomingMessage): Promise<unknown> =>
    new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          resolve(body === "" ? undefined : JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    });

  const handle = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    // Who may connect at all (CHALK_MCP_ALLOW; this machine only by default), then the token.
    if (!isAllowed(req.socket.remoteAddress ?? ""))
      return refuse(res, 403, "this address may not use the chalk tools");
    const who = whoOf(req);
    if (who === null)
      return refuse(res, 401, "a chalk token is needed: Authorization: Bearer <token>");
    const body = req.method === "POST" ? await readBody(req).catch(() => null) : undefined;
    if (body === null) return refuse(res, 400, "not JSON");
    // The agent's own page for drawing boards (app-driver.ts), by the id its relay sends with every
    // call; without one, a page for this request alone (nothing to go on from).
    const agent = String(req.headers["x-chalk-agent"] ?? "").trim();
    const lane = agent !== "" ? `agent:${agent}` : randomUUID();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const server = chalkMcp(who, lane);
    res.on("close", () => {
      void transport.close().catch(() => {});
      void server.close().catch(() => {});
      if (agent === "") void closeLane(lane);
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  };

  const close = async () => {
    await closeBrowser().catch(() => {});
  };
  return { handle, close };
}
