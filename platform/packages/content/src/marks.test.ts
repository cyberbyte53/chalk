import { describe, expect, it } from "vitest";
import { markProblems, saidOf, saidParts, shownOf } from "./marks";

describe("a line written once, its odd bits marked", () => {
  it("shows the shown part and says the said part; the rest is both", () => {
    const line = "Now plot [[R(−4, 2)|R, the point minus 4, 2]] yourself.";
    expect(shownOf(line)).toBe("Now plot R(−4, 2) yourself.");
    expect(saidOf(line)).toBe("Now plot R, the point minus 4, 2 yourself.");
    expect(saidOf("पहले [[x|एक्स]], फिर [[y|वाई]]")).toBe("पहले एक्स, फिर वाई");
  });

  it("leaves a line without marks as it is", () => {
    for (const line of ["Find Aman's house", "**Bold** and $x^{2}$", "a [0, 1) interval", ""])
      expect([shownOf(line), saidOf(line), markProblems(line)]).toEqual([line, line, []]);
  });

  it("keeps maths whole: a formula can't end a mark, and | inside one is the formula's", () => {
    expect(shownOf("[[$\\frac{1}{2}$|one half]] of it")).toBe("$\\frac{1}{2}$ of it");
    expect(saidOf("[[$|x|$|the size of x]]")).toBe("the size of x");
    expect(shownOf("[[$[A,[B,C]]$|A with B C]]")).toBe("$[A,[B,C]]$");
    // Outside a mark, maths is left alone: its brackets aren't marks.
    expect(shownOf("$[[a]]$ and [[x|ex]]")).toBe("$[[a]]$ and x");
  });

  it("holds bold and blanks", () => {
    expect(shownOf("**[[(4, 5)|four, five]]**")).toBe("**(4, 5)**");
    expect(saidOf("at [[({x}, {y})|the point {x}, {y}]]")).toBe("at the point {x}, {y}");
  });

  it("escapes: \\[[ and \\]] are the brackets themselves", () => {
    expect(shownOf("\\[[not a mark")).toBe("\\[[not a mark");
    expect(shownOf("[[a\\]]b|ab]]")).toBe("a]]b");
    expect(markProblems("\\[[not a mark")).toEqual([]);
  });

  it("reports a mark it can't read", () => {
    expect(markProblems("[[open")).toEqual(['"[[" at 0 is never closed']);
    expect(markProblems("[[no bar]]")[0]).toContain('no "|"');
    expect(markProblems("[[a [[b|c]]|d]]")[0]).toContain("inside a mark");
    expect(markProblems("[[|said]]")[0]).toContain("shows nothing");
    expect(markProblems("[[shown|]]")[0]).toContain("says nothing");
  });

  it("lists each mark's spoken words", () => {
    expect(saidParts("[[x|ex]] then [[y|why]]")).toEqual(["ex", "why"]);
  });
});
