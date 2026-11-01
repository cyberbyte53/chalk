import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import {
  type Played,
  type Shown,
  keepPlayed,
  keepShown,
  playAnswer,
  playDiff,
  playsOf,
  shownDiffs,
  shownOf,
} from "./shown";

/** A white picture, `w`×`h`, with black squares where given. */
function picture(w: number, h: number, squares: [number, number, number][] = []): Buffer {
  const png = new PNG({ width: w, height: h });
  png.data.fill(255);
  for (const [sx, sy, size] of squares)
    for (let y = sy; y < sy + size; y++)
      for (let x = sx; x < sx + size; x++) {
        const i = (y * w + x) * 4;
        png.data[i] = 0;
        png.data[i + 1] = 0;
        png.data[i + 2] = 0;
      }
  return PNG.sync.write(png);
}

// Two pieces, one above the other (CSS pixels; the pictures at twice that).
const boxes = [
  { name: "town", x: 0, y: 0, w: 50, h: 50 },
  { name: "reply", x: 0, y: 50, w: 50, h: 50 },
];

/** A board shown in two versions, each with its picture and what it read. */
const shown = (
  pngs: [Buffer, Buffer],
  reads: [string, string] = ["town: a", "town: a"],
): Shown => ({
  inputs: "k",
  versions: [
    { version: "en · 360×640", read: reads[0], boxes, scale: 2, png: pngs[0] },
    { version: "hi · 360×640", read: reads[1], boxes, scale: 2, png: pngs[1] },
  ],
});

describe("what a board shows, against what it showed when passed", () => {
  it("the same in every version: nothing differs", () => {
    const a = picture(100, 200, [[10, 10, 20]]);
    expect(shownDiffs(shown([a, a]), shown([a, a]))).toEqual([]);
  });

  it("names each version that differs, the pieces, and how much", () => {
    const a = picture(100, 200, [[10, 10, 20]]);
    // In Hindi the square moved down into the reply.
    const moved = picture(100, 200, [[10, 130, 20]]);
    const [d, ...rest] = shownDiffs(shown([a, a]), shown([a, moved]));
    expect(rest).toEqual([]);
    expect(d).toMatchObject({ version: "hi · 360×640", read: [], pieces: ["town", "reply"] });
    expect(d?.share).toBeCloseTo((2 * 20 * 20) / (100 * 200));
  });

  it("a piece that reads differently differs, though its picture is the same", () => {
    const a = picture(100, 100);
    const d = shownDiffs(shown([a, a]), shown([a, a], ["town: a", "town: b\nreply: c"]));
    expect(d).toMatchObject([{ version: "hi · 360×640", read: ["town", "reply"], share: 0 }]);
  });

  it("a picture that grew differs, even where what was there is the same", () => {
    const d = shownDiffs(
      shown([picture(100, 100), picture(100, 100)]),
      shown([picture(100, 200), picture(100, 100)]),
    );
    expect(d.map((x) => x.version)).toEqual(["en · 360×640"]);
  });

  it("is kept on this machine: the latest drawing, and apart from it what a reviewer saw", () => {
    const root = mkdtempSync(join(tmpdir(), "chalk-shown-"));
    const [a, b] = [picture(10, 10), picture(10, 20)];
    keepShown(root, "seen", "b/c/l/one", shown([a, a]));
    keepShown(root, "now", "b/c/l/one", shown([b, b]));
    expect(shownOf(root, "seen", "b/c/l/one")?.versions[1]?.png.equals(a)).toBe(true);
    expect(shownOf(root, "now", "b/c/l/one")?.versions[1]?.png.equals(b)).toBe(true);
  });
});

describe("the review's plays", () => {
  const play = (steps: string[], answer: string): Played => ({
    steps: steps.map((tap) => ({ tap })),
    answer,
    inputs: "k",
  });

  it("are kept beside what a reviewer saw, the same steps again replacing the last", () => {
    const root = mkdtempSync(join(tmpdir(), "chalk-played-"));
    const a = picture(10, 10);
    keepPlayed(root, "seen", "b/one", play(["x"], "1. tap x → one"));
    keepPlayed(root, "seen", "b/one", play(["y"], "1. tap y → two"));
    keepPlayed(root, "seen", "b/one", play(["x"], "1. tap x → three"));
    // A drawing after them leaves them where they are.
    keepShown(root, "seen", "b/one", shown([a, a]));
    expect(playsOf(root, "seen", "b/one").map((p) => p.answer)).toEqual([
      "1. tap y → two",
      "1. tap x → three",
    ]);
  });

  it("keep each step's lines, not the header or the pictures", () => {
    expect(
      playAnswer(
        "board   2 steps · 360×640 · en\n1. tap a → x\n2. tap b → y\npictures: before, after",
      ),
    ).toBe("1. tap a → x\n2. tap b → y");
  });

  it("say the first step that answers differently, and only what differs in it", () => {
    const then =
      'as it opened:\n   said · title\n1. tap a → x · signal moved · b "1" → "2"\n   said · reply: "one"\n2. tap b → y';
    expect(playDiff(then, then)).toBeUndefined();
    const now = then.replace('"one"', '"two"').replace('"2"', '"3"');
    expect(playDiff(then, now)).toBe(
      [
        "1. tap a",
        'then: b "1" → "2"',
        'then: said · reply: "one"',
        'now: b "1" → "3"',
        'now: said · reply: "two"',
      ].join("\n"),
    );
    expect(playDiff(then, then.split("\n2.")[0] ?? "")).toBe("2. tap b: not done now\nthen: y");
  });
});
