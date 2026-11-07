import { describe, expect, it } from "vitest";
import type { Block } from "./build";
import { compareBlocks, diffRows, readRowsFile, rowsFile } from "./measure";
import type { Item } from "./schema";

/** A side of the measure: items with the words each starts from (`page:L1.1`). */
const side = (...blocks: [string, string, string[]][]) => ({
  items: blocks.map(([kind, text], i) => ({ id: `0.${i + 1}`, kind, page: 1, text }) as Item),
  parts: blocks.map(([, , ids]) => [{ page: 1, ids } as unknown as Block]),
});

describe("compareBlocks", () => {
  const decided = side(
    ["section", "1.1 Atoms", ["L1.1", "L1.2"]],
    ["text", "Atoms are small.", ["L2.1", "L2.2", "L2.3"]],
    ["box", "Think It Over", ["L3.1", "L3.2", "L3.3"]],
  );
  it("counts a block right only with the same kind and the same text", () => {
    const tools = side(
      ["section", "1.1 Atoms", ["L1.1", "L1.2"]],
      ["text", "Atoms are small. Think It Over", ["L2.1", "L2.2", "L2.3", "L3.1", "L3.2", "L3.3"]],
    );
    const rows = compareBlocks("b/c/en", decided, tools);
    expect(rows.map((r) => r.isRight)).toEqual([true, false, false]);
    // The tools' block at its first word, whatever it is.
    expect(rows[2]?.tools).toBe("text: Atoms are small. Think It Over");
  });
  it("counts a kind the tools didn't give as wrong, the text alike", () => {
    const tools = side(
      ["section", "1.1 Atoms", ["L1.1", "L1.2"]],
      ["text", "Atoms are small.", ["L2.1", "L2.2", "L2.3"]],
      ["text", "Think It Over", ["L3.1", "L3.2", "L3.3"]],
    );
    expect(compareBlocks("b/c/en", decided, tools).map((r) => r.isRight)).toEqual([
      true,
      true,
      false,
    ]);
  });
});

describe("a run diffed against an earlier one", () => {
  it("reads its file back, and says which blocks became right and which wrong", () => {
    const decided = side(["text", "a\tb", ["L1.1"]], ["text", "c", ["L2.1"]]);
    const was = compareBlocks(
      "b/c/en",
      decided,
      side(["text", "a b", ["L1.1"]], ["text", "c", ["L2.1"]]),
    );
    const now = compareBlocks(
      "b/c/en",
      decided,
      side(["text", "a\tb", ["L1.1"]], ["heading", "c", ["L2.1"]]),
    );
    const back = readRowsFile(rowsFile(was));
    expect(back.map((r) => [r.id, r.isRight])).toEqual([
      ["0.1", false],
      ["0.2", true],
    ]);
    const d = diffRows(back, now);
    expect(d.nowRight.map((r) => r.id)).toEqual(["0.1"]);
    expect(d.nowWrong.map((r) => r.id)).toEqual(["0.2"]);
  });
});
