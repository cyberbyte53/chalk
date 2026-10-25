import { groupView } from "@chalk/player";
import { shownOf } from "@chalk/prop";
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
import { LensCardView, ThinLensView } from "./bench/lens-parts-view";
import { lens } from "./lens";

/**
 * The lens on its bench: one picture (the glass, the rays, the card, O and the foci, the image, a
 * screen, the object and the marker, each drawn by its own leaf), and under it the ray buttons,
 * the readout and the focal-length stepper in one row, when any of them is on.
 */
export const LensView = groupView(
  lens,
  {
    bench: BenchView,
    glass: ThinLensView,
    rayLines: OpticRaysView,
    card: LensCardView,
    points: AxisPointsView,
    imageArrow: OpticImageView,
    whiteScreen: OpticScreenView,
    objectArrow: OpticObjectView,
    marker: MarkerView,
    rayButtons: RayButtonsView,
    readout: ReadoutView,
    focal: FocalStepperView,
  },
  {
    theme: "ln",
    look: () => "ln-svg",
    below: (slot, view) => {
      const shown = shownOf(view);
      if (!shown?.rayButtons && !shown?.readout && !shown?.focal) return null;
      return (
        <div class="ln-under">
          {slot("rayButtons")}
          {slot("readout")}
          {slot("focal")}
        </div>
      );
    },
  },
);
