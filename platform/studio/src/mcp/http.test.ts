import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { isAllowed, whoOf } from "./http";

const req = (headers: Record<string, string>) => ({ headers }) as unknown as IncomingMessage;

describe("who may use the chalk MCP", () => {
  it("hears only this machine by default, or the addresses CHALK_MCP_ALLOW lists", () => {
    expect(isAllowed("127.0.0.1", undefined)).toBe(true);
    expect(isAllowed("::ffff:127.0.0.1", undefined)).toBe(true);
    expect(isAllowed("192.168.1.20", undefined)).toBe(false);
    expect(isAllowed("192.168.1.20", "192.168.1.20, 10.0.0.5")).toBe(true);
    expect(isAllowed("::ffff:10.0.0.5", "10.0.0.5")).toBe(true);
    expect(isAllowed("8.8.8.8", "10.0.0.5")).toBe(false);
    expect(isAllowed("8.8.8.8", "*")).toBe(true);
  });

  it("takes the role from the token, never from the caller", () => {
    expect(whoOf(req({ authorization: "Bearer chalk-dev-reviewer" }))).toEqual({
      role: "reviewer",
      name: "reviewer",
    });
    expect(
      whoOf(req({ authorization: "Bearer chalk-dev-fixer", "x-chalk-name": "claude" })),
    ).toEqual({ role: "fixer", name: "claude" });
    expect(whoOf(req({ authorization: "Bearer nope", "x-chalk-role": "reviewer" }))).toBeNull();
    expect(whoOf(req({}))).toBeNull();
    // An agent can't call itself the person.
    expect(
      whoOf(req({ authorization: "Bearer chalk-dev-fixer", "x-chalk-name": "you" }))?.name,
    ).toBe("fixer");
  });
});
