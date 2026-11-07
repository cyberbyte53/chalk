import { describe, expect, it } from "vitest";
import { numberPage } from "./read";
import { type TextPiece, scriptRuns } from "./scripts";

/** A word and the text piece it is, at a size and baseline (points, top-down). */
const at = (str: string, x0: number, x1: number, size: number, baseline: number) => ({
  word: { text: str, x0, x1, y0: baseline - size * 0.75, y1: baseline + size * 0.2 },
  piece: { str, x0, x1, top: baseline - size, baseline, size } satisfies TextPiece,
});
const runsOf = (...parts: ReturnType<typeof at>[]) =>
  scriptRuns(
    numberPage({ page: 1, width: 500, height: 700, words: parts.map((p) => p.word) }),
    parts.map((p) => p.piece),
  ).map((r) => r.reading);

describe("subscripts and superscripts", () => {
  it("writes a lowered piece as a subscript in its run (H₂O, Fe₃O₄(s))", () => {
    expect(
      runsOf(at("H", 10, 17, 10, 100), at("2", 17, 21, 6, 102.5), at("O", 21, 29, 10, 100)),
    ).toEqual(["H₂O"]);
    expect(
      runsOf(
        at("Fe", 10, 22, 10, 100),
        at("3", 22, 26, 6, 102.5),
        at("O", 26, 34, 10, 100),
        at("4", 34, 38, 6, 102.5),
        at("(s)", 38, 50, 10, 100),
      ),
    ).toEqual(["Fe₃O₄(s)"]);
  });
  it("writes a raised piece as a superscript, the PDF's en dash a minus (Na⁺, Cl⁻)", () => {
    expect(runsOf(at("Na", 10, 24, 10, 100), at("+", 24, 28, 6, 96))).toEqual(["Na⁺"]);
    expect(runsOf(at("Cl", 10, 22, 10, 100), at("–", 22, 26, 6, 96))).toEqual(["Cl⁻"]);
  });
  it("reads a subscript and a charge printed as one word by their own baselines (NO₃⁻)", () => {
    const word = { text: "3–", x0: 24, x1: 32, y0: 94, y1: 104 };
    const pieces: TextPiece[] = [
      { str: "NO", x0: 10, x1: 24, top: 90, baseline: 100, size: 10 },
      { str: "3", x0: 24, x1: 28, top: 96.5, baseline: 102.5, size: 6 },
      { str: "–", x0: 28, x1: 32, top: 90, baseline: 96, size: 6 },
    ];
    const page = numberPage({
      page: 1,
      width: 500,
      height: 700,
      words: [{ text: "NO", x0: 10, x1: 24, y0: 92.5, y1: 102 }, word],
    });
    expect(scriptRuns(page, pieces).map((r) => r.reading)).toEqual(["NO₃⁻"]);
  });
  it("leaves to the agent what it can't write: a script over a script, a letter as a script", () => {
    expect(
      runsOf(at("SO", 10, 24, 10, 100), at("4", 24, 28, 6, 102.5), at("2–", 24, 32, 6, 96)),
    ).toEqual([]);
    expect(runsOf(at("x", 10, 16, 10, 100), at("n", 16, 20, 6, 96))).toEqual([]);
  });
  it("ends a run at an operator the size of the text (CaCO₃(s) +)", () => {
    expect(
      runsOf(
        at("CaCO", 10, 40, 10, 100),
        at("3", 40, 44, 6, 102.5),
        at("(s)", 44, 56, 10, 100),
        at("+", 56.5, 62, 10, 100),
      ),
    ).toEqual(["CaCO₃(s)"]);
  });
});
