import { groupView } from "@chalk/player";
import {
  AxisPointsView,
  BenchView,
  FocalStepperView,
  MarkerView,
  OpticImageView,
  OpticObjectView,
  OpticRaysView,
  OpticScreenView,
  RayButtonsView,
  ReadoutView,
} from "./bench/kit-view";
import { CurvedMirrorView, KindToggleView, SignConventionView } from "./bench/mirror-parts-view";
import { sphericalMirror } from "./spherical-mirror";

export { clipSegment } from "./bench/clip";

/**
 * The mirror on its bench: one picture (its face, the rays, P, F and C, a screen, the signs, the
 * image, the object and the marker, each drawn by its own leaf), then the readout, the concave /
 * convex switch with the focal-length stepper in one row, and the ray buttons.
 */
export const SphericalMirrorView = groupView(
  sphericalMirror,
  {
    bench: BenchView,
    face: CurvedMirrorView,
    rayLines: OpticRaysView,
    points: AxisPointsView,
    whiteScreen: OpticScreenView,
    signs: SignConventionView,
    imageArrow: OpticImageView,
    objectArrow: OpticObjectView,
    marker: MarkerView,
    readout: ReadoutView,
    kindToggle: KindToggleView,
    focal: FocalStepperView,
    rayButtons: RayButtonsView,
  },
  {
    look: () => "sm-svg",
    below: (slot, view) => {
      const v = view as { kindToggle: { isShown: boolean }; focal: { isShown: boolean } };
      return (
        <>
          {slot("readout")}
          {(v.kindToggle.isShown || v.focal.isShown) && (
            <div class="sm-controls">
              {slot("kindToggle")}
              {slot("focal")}
            </div>
          )}
          {slot("rayButtons")}
        </>
      );
    },
  },
);
