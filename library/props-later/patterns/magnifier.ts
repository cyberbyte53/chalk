import { type BoardKit, type PlacedOf, expect, inOrder, row, t, wait } from "@chalk/author";
import type { Piece } from "@chalk/content";
import type { Dec } from "@chalk/exact";
import { ButtonAction, ButtonSignal, buttonDef } from "@chalk/prop-basics";
import { NumberLineAction, NumberLineDerived, numberLineDef } from "@chalk/prop-number-line";

/** Seconds from a press to the zoom having settled, with room to spare. */
const PRESS_SETTLES = 2.5;

/**
 * A number line with a Zoom in button: each press picks out the tenth that holds `value`, then
 * magnifies into it (successive magnification), up to `zooms` times. Adds its own witness: pressing
 * Zoom in `zooms` times reaches that many decimal places.
 */
export function magnifier(
  b: BoardKit,
  spec: { value: Dec; from: number; to: number; zooms: number },
): {
  line: PlacedOf<typeof numberLineDef>;
  zoom: PlacedOf<typeof buttonDef>;
  pieces: readonly Piece[];
} {
  const line = b.prop(numberLineDef, "line", {
    from: spec.from,
    to: spec.to,
    marks: [{ at: spec.value, label: spec.value.toString() }],
  });
  const zoom = b.prop(buttonDef, "zoom", { label: t("Zoom in", "ज़ूम करो") });
  const level = line.derived(NumberLineDerived.Level);
  b.is(zoom.field("isEnabled"), level.lt(spec.zooms).and(line.field("lens").eq(null)));
  b.when(
    zoom.on(ButtonSignal.Pressed),
    inOrder(
      line.call(NumberLineAction.ShowLens, { value: spec.value }),
      wait(0.7),
      line.call(NumberLineAction.Magnify, { value: spec.value }),
    ),
  );
  for (let i = 0; i < spec.zooms; i++)
    b.witness(zoom.learner(ButtonAction.Press), wait(PRESS_SETTLES));
  b.witness(expect(level.eq(spec.zooms), `${spec.zooms} zooms reach ${spec.zooms} decimal places`));
  return { line, zoom, pieces: [line.piece, row([zoom])] };
}
