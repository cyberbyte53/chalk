import { describe, expect, it } from "vitest";
import { type Paper, layOut } from "./paper";

/** The paper as lines of text, one character per column, so a case reads like the notebook. */
function draw(paper: Paper): string[] {
  const line = (cells: { col: number; text: string }[]) => {
    const chars = Array.from({ length: paper.columns }, () => " ");
    for (const cell of cells) chars[cell.col] = cell.text;
    return chars.join("").trimEnd();
  };
  const out = [line(paper.quotient), line(paper.dividend)];
  for (const row of paper.work) {
    out.push(line(row.cells));
    if (row.rule !== undefined) {
      out.push(" ".repeat(row.rule.from) + "-".repeat(row.rule.to - row.rule.from + 1));
    }
  }
  return out;
}

describe("long division on paper (NCERT p. 9)", () => {
  it("1 ÷ 7, three steps: 7 under 1.0, then 30, 28, then 20, 14, then 60", () => {
    expect(draw(layOut(1, 7, 3, true))).toEqual([
      "0142",
      "10000",
      " 7",
      "--",
      " 30",
      " 28",
      " --",
      "  20",
      "  14",
      "  --",
      "   60",
    ]);
  });

  it("10 ÷ 3: 9 under 10, then 10, 9 one place right each time", () => {
    expect(draw(layOut(10, 3, 2, false))).toEqual([
      " 333",
      "1000",
      " 9",
      "--",
      " 10",
      "  9",
      " --",
      "  10",
      "   9",
      "  --",
      "   1",
    ]);
  });

  it("7 ÷ 8 ends: the last remainder is 0 and no 0 is brought down", () => {
    const lines = draw(layOut(7, 8, 3, false));
    expect(lines[0]).toBe("0875");
    expect(lines.at(-1)).toBe("   0");
  });

  it("puts the point after the numerator's last digit, only once a digit after it is in play", () => {
    expect(layOut(22, 7, 0, false).pointAfter).toBeNull();
    expect(layOut(22, 7, 0, true).pointAfter).toBe(1);
    expect(layOut(1, 7, 2, true).pointAfter).toBe(0);
  });

  it("marks each remainder with its index, so the clock and the paper point at the same one", () => {
    const paper = layOut(1, 7, 3, true);
    const remainders = paper.work
      .flatMap((row) => row.cells)
      .filter((c) => c.remainderIndex !== undefined)
      .map((c) => `${c.remainderIndex}:${c.text}`);
    expect(remainders).toEqual(["1:3", "2:2", "3:6"]);
  });
});
