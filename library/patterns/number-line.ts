import { type PlacedOf, type Step, after } from "@chalk/author";
import type { Dec } from "@chalk/exact";
import { NumberLineAction, type numberLineDef } from "@chalk/prop-number-line";

/** Seconds a zoom takes to settle, with room to spare. */
const ZOOM_SETTLES = 2;

/**
 * What a learner does to put the marker exactly on `value`: one zoom per decimal place (moving the
 * marker onto the value first, so the zoom goes the right way), then the final drag. For witnesses.
 */
export function reach(line: PlacedOf<typeof numberLineDef>, value: Dec): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < value.places; i++) {
    steps.push(
      line.learner(NumberLineAction.MoveMarker, { to: value }),
      line.learner(NumberLineAction.ZoomIn),
      after(ZOOM_SETTLES),
    );
  }
  steps.push(line.learner(NumberLineAction.MoveMarker, { to: value }));
  return steps;
}
