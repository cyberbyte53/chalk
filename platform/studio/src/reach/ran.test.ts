import { describe, expect, it } from "vitest";
import { RanReader, ranSegments } from "./ran";

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

describe("what ran, mapped back to our lines", () => {
  // A served module of four lines, each mapped to the same line of /repo/src/x.ts:
  // 1 an import Vite adds (mapped to nothing), 2 `const A = 1;`, 3 `function f() {…}`, 4 `f2();`.
  const body = 'import "/@vite/client";\nconst A = 1;\nfunction f() { return 2; }\nconst B = A;\n';
  const map = { version: 3, sources: ["/repo/src/x.ts"], names: [], mappings: ";AACA;AACA;AACA" };
  const source = `${body}//# sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(map)).toString("base64")}`;
  const url = "http://localhost:5173/@fs/repo/src/x.ts";
  const fStart = body.indexOf("function f");
  const fEnd = body.indexOf("\nconst B");
  const loading = {
    url,
    source,
    functions: [
      { ranges: [{ startOffset: 0, endOffset: source.length, count: 1 }] },
      { ranges: [{ startOffset: fStart, endOffset: fEnd, count: 0 }] },
    ],
  };

  it("a stretch is mapped through every position in it, not only its ends", () => {
    // The stretch that ran starts on the generated import, which maps to nothing.
    expect(new RanReader("/repo").linesOf([loading])).toEqual({
      "src/x.ts": [
        [2, 2],
        [4, 4],
      ],
    });
  });

  it("what ran as the page loaded counts for every board drawn on it after", () => {
    const reader = new RanReader("/repo");
    reader.see([loading]); // loaded during another board's call
    const later = {
      url,
      functions: [{ ranges: [{ startOffset: fStart, endOffset: fEnd, count: 1 }] }],
    };
    expect(reader.linesOf([later])).toEqual({ "src/x.ts": [[2, 4]] });
  });
});
