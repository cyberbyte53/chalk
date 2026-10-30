import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { comparePictures } from "./pictures";

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

describe("a board's picture as passed against now", () => {
  it("the same picture is the same", () => {
    const a = picture(100, 200, [[10, 10, 20]]);
    expect(comparePictures(a, a, boxes, 2)).toEqual({ isSame: true });
  });

  it("names the pieces where pixels differ, and how much differs", () => {
    const passed = picture(100, 200, [[10, 10, 20]]);
    // The square moved down into the reply.
    const now = picture(100, 200, [[10, 130, 20]]);
    const diff = comparePictures(passed, now, boxes, 2);
    if (diff.isSame) throw new Error("should differ");
    expect(diff.pieces).toEqual(["town", "reply"]);
    expect(diff.share).toBeCloseTo((2 * 20 * 20) / (100 * 200));
    // As passed | now, side by side.
    expect(PNG.sync.read(diff.image).width).toBeGreaterThan(200);
  });

  it("a picture that grew differs, even where what was there is the same", () => {
    const passed = picture(100, 100);
    const now = picture(100, 200);
    const diff = comparePictures(passed, now, boxes, 2);
    expect(diff.isSame).toBe(false);
  });
});
