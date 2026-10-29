import { hostOf, onWhenUnsaid } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { clues } from "./clues";
import { coordinatePlane } from "./coordinate-plane";
import { dice } from "./dice";
import { places } from "./places";
import { plotting } from "./plotting";
import { reading } from "./reading";
import { walker } from "./walker";

/**
 * Each layer says which fields its on-rule reads (onWhen), and that is what lets a board be shown
 * never to turn a layer on: so it must be true. Checked from the defaults and from every layer on.
 */
describe("each layer's on-rule reads only the fields it says", () => {
  const layers = [reading, places, walker, clues, plotting, dice];
  const states = [
    coordinatePlane.defaults,
    {
      ...coordinatePlane.defaults,
      walkFrom: { x: 0, y: 0 },
      places: [{ x: 1, y: 1 }],
      clueChoices: [{ words: { en: "a", hi: "a" }, x: 1 }],
      toPlot: [{ x: 1, y: 1 }],
      counters: [{ x: 0, y: 0 }],
      point: { x: 1, y: 1 },
    },
  ];
  for (const layer of layers)
    it(layer.name, () => {
      for (const s of states) expect(onWhenUnsaid(layer as never, s as never)).toEqual([]);
    });

  it("a board that starts without a layer, and can't turn it on, provably never has it", () => {
    const host = hostOf(coordinatePlane as never);
    // movePoint changes `point`, so reading may come on anywhere; nothing changes walkFrom.
    const ever = host?.layersEverOn({ ...coordinatePlane.defaults, places: [{ x: 1, y: 1 }] });
    expect(ever).toContain("places");
    expect(ever).toContain("reading");
    expect(ever).not.toContain("walker");
  });
});
