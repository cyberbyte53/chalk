import { describe, expect, it } from "vitest";
import { DEFAULT_SIZE, PHONE_COLUMN, layoutWidthFor, zoomFor } from "./size";

/** A prop whose height follows its width (a plane, a picture): the case that used to loop. */
const square = (width: number) => width;

describe("sizing a prop", () => {
  it("lays out by the column alone, so the zoom is one decision: the same on every pass", () => {
    const screens: [column: number, height: number][] = [
      [PHONE_COLUMN, 844],
      [640, 900],
      [1280, 720],
      [360, 640],
    ];
    for (const [column, screen] of screens) {
      const width = layoutWidthFor(DEFAULT_SIZE, column);
      const first = zoomFor(DEFAULT_SIZE, column, screen, square(width));
      // A second pass has nothing new to measure: the layout width didn't move with the zoom.
      const second = zoomFor(
        DEFAULT_SIZE,
        column,
        screen,
        square(layoutWidthFor(DEFAULT_SIZE, column)),
      );
      expect(second).toBe(first);
    }
  });

  it("on a short wide screen (a projector), a square prop is shrunk to fit once, within the limits", () => {
    const width = layoutWidthFor(DEFAULT_SIZE, 1280);
    expect(width).toBe(Math.round(1280 / 1.2));
    const zoom = zoomFor(DEFAULT_SIZE, 1280, 720, square(width));
    // 60% of 720 is 432; 432 / 1067 is below minZoom, so it stops there.
    expect(zoom).toBe(DEFAULT_SIZE.minZoom);
  });

  it("grows with the column up to maxZoom, and a phone is 1×", () => {
    expect(layoutWidthFor(DEFAULT_SIZE, PHONE_COLUMN)).toBe(PHONE_COLUMN);
    expect(zoomFor(DEFAULT_SIZE, PHONE_COLUMN, 844, 300)).toBe(1);
    expect(layoutWidthFor(DEFAULT_SIZE, 420)).toBe(PHONE_COLUMN);
    expect(zoomFor(DEFAULT_SIZE, 420, 844, 300)).toBeCloseTo(420 / PHONE_COLUMN);
    expect(zoomFor(DEFAULT_SIZE, 640, 900, 300)).toBe(1.2);
  });
});
