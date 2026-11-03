import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { impureLines } from "./purity";

describe("purity", () => {
  it("refuses chance, the wall clock and outside values in prop and lesson code, not in views", () => {
    const root = mkdtempSync(join(tmpdir(), "purity-"));
    mkdirSync(join(root, "library/props/dice/src"), { recursive: true });
    mkdirSync(join(root, "content/b/c/l"), { recursive: true });
    writeFileSync(
      join(root, "library/props/dice/src/dice.ts"),
      [
        "export const roll = () => Math.random();",
        "// Math.random in a comment is fine",
        "let rolls = 0;",
      ].join("\n"),
    );
    writeFileSync(join(root, "library/props/dice/src/dice-view.tsx"), "const r = Math.random();");
    writeFileSync(join(root, "content/b/c/l/overview.ts"), "const at = Date.now();");
    expect(impureLines(root)).toEqual([
      "library/props/dice/src/dice.ts:1: chance: a copy would roll differently: export const roll = () => Math.random();",
      "library/props/dice/src/dice.ts:3: a value kept outside the board: its state is its variables: let rolls = 0;",
      "content/b/c/l/overview.ts:1: the wall clock: time is only the board's clock: const at = Date.now();",
    ]);
  });
});
