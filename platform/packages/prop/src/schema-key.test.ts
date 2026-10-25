import { describe, expect, it } from "vitest";
import { z } from "zod";
import { schemaKey, shapeOf } from "./schema-key";

describe("a prop's schema key", () => {
  it("names the shape of the facts, not their descriptions or order", () => {
    const a = z.object({ at: z.number().min(0).describe("where"), name: z.string().nullable() });
    const b = z.object({ name: z.string().nullable(), at: z.number() });
    expect(schemaKey("dial", a)).toBe(schemaKey("dial", b));
    expect(shapeOf(a)).toBe("{at:number,name:string|null}");
  });

  it("changes when what the facts may be changes", () => {
    const base = z.object({ mode: z.enum(["a", "b"]) });
    const more = z.object({ mode: z.enum(["a", "b", "c"]) });
    const extra = z.object({ mode: z.enum(["a", "b"]), at: z.number().optional() });
    const keys = new Set([base, more, extra].map((s) => schemaKey("dial", s)));
    expect(keys.size).toBe(3);
    expect(schemaKey("dial", base)).toMatch(/^dial@[0-9a-f]{8}$/);
  });
});
