import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Role } from "../comments";
import { closeBrowser } from "./preview";
import { type Who, chalkMcp } from "./tools";

/**
 * The chalk MCP over HTTP (the spec's Streamable HTTP transport), served by the dev server at
 * /mcp: one endpoint for every agent. Each connection says who it is with a bearer token; the token
 * decides the caller's role, and the caller gets its own MCP session showing only what that role
 * may do (tools.ts). Nobody picks a role per call.
 *
 * Tokens: CHALK_TOKENS (JSON, token → role, e.g. {"…": "reviewer"}) or the development defaults
 * below. On a laptop they are only as private as its config files; on the Chalk server they will
 * come from sign-in.
 */

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

type Session = { transport: StreamableHTTPServerTransport; who: Who };

/** The /mcp middleware: a session per connection, each held to its token's role. */
export function mcpMiddleware(): {
  handle: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
  close: () => Promise<void>;
} {
  const sessions = new Map<string, Session>();
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
    // This machine only: the dev server can listen on the network (dev sign-in on a phone).
    const from = req.socket.remoteAddress ?? "";
    if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(from))
      return refuse(res, 403, "the chalk tools answer only on this machine");
    const who = whoOf(req);
    if (who === null)
      return refuse(res, 401, "a chalk token is needed: Authorization: Bearer <token>");
    const id = req.headers["mcp-session-id"];
    const body = req.method === "POST" ? await readBody(req).catch(() => null) : undefined;
    if (body === null) return refuse(res, 400, "not JSON");
    const known = typeof id === "string" ? sessions.get(id) : undefined;
    if (known !== undefined) {
      // A session stays with the token that opened it.
      if (known.who.role !== who.role)
        return refuse(res, 403, "this session belongs to another role");
      return known.transport.handleRequest(req, res, body);
    }
    if (typeof id === "string") return refuse(res, 404, "no such session: connect again");
    // A new connection: its own server, showing only what its role may do.
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        sessions.set(sessionId, { transport, who });
      },
    });
    transport.onclose = () => {
      if (transport.sessionId !== undefined) sessions.delete(transport.sessionId);
    };
    await chalkMcp(who).connect(transport);
    await transport.handleRequest(req, res, body);
  };

  const close = async () => {
    for (const { transport } of sessions.values()) await transport.close().catch(() => {});
    sessions.clear();
    await closeBrowser().catch(() => {});
  };
  return { handle, close };
}
