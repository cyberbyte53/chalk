import { SymbolButton } from "@chalk/draw";
import { FrameStage, type PropViewProps, useDrags } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import { Fragment, type JSX } from "preact";
import { cluesView } from "./clues-view";
import type { coordinatePlane } from "./coordinate-plane";
import { diceView } from "./dice-view";
import { type LayerView, type LayerViewProps, PlaneTap, actions } from "./layer-view";
import { placesView } from "./places-view";
import { planeFrame } from "./plane";
import {
  AxesDraw,
  GridDraw,
  NamedPointsDraw,
  PART_WORDS,
  PartTaps,
  type PlaneView,
  SceneDraw,
  canNameParts,
} from "./plane-view";
import { plottingView } from "./plotting-view";
import { readingView } from "./reading-view";
import { walkerView } from "./walker-view";
import { WORDS, pair, word } from "./words";

/**
 * The vertical number line's zero, a handle the learner slides; let go where the two zeroes meet
 * and the lines are the axes.
 */
function ApartHandle({ s, px }: { s: PlaneView; px: FramePixels }): JSX.Element | null {
  const drag = useDrags();
  if (s.axes !== "both" || s.isCrossed === true) return null;
  const [x, y] = px.toPx(s.apart.x, s.apart.y);
  const w = s.window;
  return (
    <circle
      class="cp-apart"
      {...drag({
        axis: "xy",
        at: s.apart,
        place: (to) => ({
          x: Math.min(w.xMax, Math.max(w.xMin, Math.round(to.x))),
          y: Math.min(w.yMax, Math.max(w.yMin, Math.round(to.y))),
        }),
        move: actions.moveApart,
        step: 1,
        words: pair(s.apart),
      })}
      cx={x}
      cy={y}
      r={9}
    />
  );
}

/**
 * Where each layer's drawing goes, in order. A layer's drawing is its own file (layer-view.tsx);
 * these lists only say what lies over what, and which lines and buttons come first.
 */
const ABOVE: readonly LayerView[] = [placesView, cluesView, plottingView];
const UNDER: readonly LayerView[] = [cluesView];
const PICTURE: readonly LayerView[] = [placesView, walkerView];
const OVER: readonly LayerView[] = [plottingView, cluesView, diceView, readingView];
const LINES: readonly LayerView[] = [walkerView, plottingView, diceView];
const CONTROLS_FIRST: readonly LayerView[] = [walkerView, placesView];
const CONTROLS_AFTER: readonly LayerView[] = [readingView, cluesView, plottingView, diceView];

type SlotName = "above" | "under" | "picture" | "over" | "lines" | "controls";

/** One slot of every layer in `views` that is on, in order. */
function slot(views: readonly LayerView[], name: SlotName, p: LayerViewProps): JSX.Element[] {
  return views.flatMap((v, i) => {
    const draw = v[name];
    if (draw === undefined || !v.isOn(p.s)) return [];
    const drawn = draw(p);
    // A layer appears once per slot: its place in the list is its key.
    return drawn === null ? [] : [<Fragment key={i}>{drawn}</Fragment>];
  });
}

/**
 * The coordinate plane: the core (scene, grid, axes, naming its parts, moving its lines apart) and
 * each layer's drawing in its slots.
 */
export function CoordinatePlaneView({
  view: s,
  width,
  call,
  locale,
}: PropViewProps<typeof coordinatePlane>): JSX.Element {
  const px = planeFrame.pixels(s, width);
  const p: LayerViewProps = { s, px, call, locale };
  const isLayered = [placesView, plottingView, cluesView, diceView].some((v) => v.isOn(s));
  const isNaming = canNameParts(s) && !isLayered;
  const unshown = s.canShowPoints && s.points.some((pt) => !pt.isShown);
  return (
    <div class="cp">
      {slot(ABOVE, "above", p)}
      <FrameStage px={px} label={planeFrame.label?.(s) ?? "A plane"} present={[""]} look="cp-frame">
        <SceneDraw s={s} px={px} />
        <GridDraw s={s} px={px} />
        {slot(UNDER, "under", p)}
        {isNaming && <PartTaps s={s} px={px} />}
        <AxesDraw s={s} px={px} locale={locale} canLight={placesView.isOn(s)} />
        <ApartHandle s={s} px={px} />
        <PlaneTap s={s} px={px} call={call} />
        {slot(PICTURE, "picture", p)}
        {/* Over Riya, so the mark she has just made stays in view. */}
        <NamedPointsDraw s={s} px={px} />
        {slot(OVER, "over", p)}
      </FrameStage>
      {s.named !== null && isNaming && (
        <p class="cp-line" {...shows("named", s.named, PART_WORDS[s.named][locale])}>
          {PART_WORDS[s.named][locale]}
        </p>
      )}
      {slot(LINES, "lines", p)}
      <div class="cp-controls">
        {slot(CONTROLS_FIRST, "controls", p)}
        {!(s.isCrossed === true) && s.axes === "both" && (
          <SymbolButton
            symbol={word(WORDS.bringTogether, locale)}
            label={word(WORDS.bringTogether, locale)}
            isWide
            {...does(actions.bringTogether)}
          />
        )}
        {isNaming && s.showDirections && s.quadrantsNamed < 4 && (
          <SymbolButton
            symbol={word(WORDS.nameQuadrants, locale)}
            label={word(WORDS.nameQuadrants, locale)}
            isWide
            {...does(actions.numberQuadrants)}
          />
        )}
        {unshown && (
          <SymbolButton
            symbol={word(WORDS.nextPoint, locale)}
            label={word(WORDS.nextPoint, locale)}
            isWide
            {...does(actions.showPoint)}
          />
        )}
        {slot(CONTROLS_AFTER, "controls", p)}
      </div>
    </div>
  );
}
