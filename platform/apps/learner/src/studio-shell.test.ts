import { describe, expect, it } from "vitest";
import { linesOf } from "./studio-shell";

const plan = `---
status: draft
---

# Motion (plan)

## Lessons

1. **describing-motion** (intro, 8.1)
   - Hook: the bus is late again; Kabir's claim.
   - Learn: a **reference point** before anything is "2 km away".
2. **speed-and-velocity**
`;

describe("linesOf", () => {
  it("finds a quote on one line, ignoring markdown marks", () => {
    expect(linesOf(plan, "a reference point before anything")).toBe("11");
  });
  it("finds a quote that runs over lines", () => {
    expect(linesOf(plan, "Kabir's claim. Learn: a reference point")).toBe("10-11");
  });
  it("gives null for words not in the plan", () => {
    expect(linesOf(plan, "the moon")).toBeNull();
  });
});
