import { describe, expect, it } from "vitest";
import { ranSegments } from "./ran";

describe("what ran, from the browser's coverage", () => {
  it("the innermost range decides: a function ran, its unused branch and inner function didn't", () => {
    // 0..100 a function that ran; 20..30 a branch never taken; 50..80 an inner function that ran,
    // and inside it 60..70 a block that didn't.
    const ranges = [
      { startOffset: 0, endOffset: 100, count: 1 },
      { startOffset: 20, endOffset: 30, count: 0 },
      { startOffset: 50, endOffset: 80, count: 2 },
      { startOffset: 60, endOffset: 70, count: 0 },
    ];
    expect(ranSegments(ranges)).toEqual([
      [0, 20],
      [30, 60],
      [70, 100],
    ]);
  });

  it("nothing ran: nothing", () => {
    expect(ranSegments([{ startOffset: 0, endOffset: 10, count: 0 }])).toEqual([]);
  });
});
