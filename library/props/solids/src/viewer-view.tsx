import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { fit } from "./draw";
import { Net } from "./net";
import { SolidShape, extentOf } from "./shapes";
import { type MeasureKey, Solid, type Words, alignedTex, say, workTex } from "./solids";
import { Button, Chips, Nudger } from "./ui";
import {
  DIM_NAMES,
  Measure,
  ViewerAction,
  ViewerPart,
  type ViewerState,
  turnAngles,
} from "./viewer";

const WORDS = {
  open: { en: "Open it out", hi: "खोलकर फैलाओ" },
  close: { en: "Fold it up", hi: "मोड़कर बनाओ" },
  turnLeft: { en: "Turn left", hi: "बाएँ घुमाओ" },
  turnRight: { en: "Turn right", hi: "दाएँ घुमाओ" },
  measures: { en: "Work out", hi: "निकालो" },
  curved: { en: "Curved surface", hi: "वक्र पृष्ठ" },
  lateral: { en: "Side faces", hi: "पार्श्व पृष्ठ" },
  total: { en: "Total surface", hi: "कुल पृष्ठ" },
  volume: { en: "Volume", hi: "आयतन" },
  none: { en: "Nothing", hi: "कुछ नहीं" },
} as const satisfies Record<string, Words>;

const NAMES: Record<Solid, Words> = {
  [Solid.Cuboid]: { en: "cuboid", hi: "घनाभ" },
  [Solid.Cube]: { en: "cube", hi: "घन" },
  [Solid.Cylinder]: { en: "cylinder", hi: "बेलन" },
  [Solid.Cone]: { en: "cone", hi: "शंकु" },
  [Solid.Sphere]: { en: "sphere", hi: "गोला" },
  [Solid.Hemisphere]: { en: "hemisphere", hi: "अर्धगोला" },
  [Solid.Frustum]: { en: "frustum of a cone", hi: "शंकु का छिन्नक" },
};

/** The picture's height: a little under the width, never too tall on a phone. */
const pictureHeight = (width: number) => Math.round(Math.min(260, width * 0.66));

export function ViewerView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ViewerState;
  const { tilt, yaw } = turnAngles(s.turn);
  const labels = { show: s.showDims, values: true, unit: s.unit };
  const height = pictureHeight(width);
  const isBox = s.solid === Solid.Cuboid || s.solid === Solid.Cube;
  const f = fit([extentOf(s.solid, s.dims)], width, height, tilt, isBox ? yaw : 0, 30);
  const label = `A ${NAMES[s.solid].en}`;
  const lit = s.measure === Measure.None ? "" : ` is-${s.measure}`;
  const curvedName = isBox ? WORDS.lateral : WORDS.curved;
  const work =
    s.measure === Measure.None || !s.showFormula
      ? []
      : workTex(s.solid, s.dims, s.pi, s.unit, s.measure as MeasureKey);
  return (
    <div class="so-viewer">
      {s.isNet ? (
        <Net
          solid={s.solid}
          d={s.dims}
          width={width}
          maxHeight={Math.round(width * 0.95)}
          unit={s.unit}
          values={s.showDims}
          isCurvedLit={s.measure === Measure.Curved || s.measure === Measure.Total}
          label={`The net of a ${NAMES[s.solid].en}`}
        />
      ) : (
        <Stage label={label} x={[0, width]} width={width} height={height} svg={{ class: "so-svg" }}>
          <g class={`so-solid${lit}`} data-part={ViewerPart.Picture}>
            <SolidShape f={f} solid={s.solid} d={s.dims} labels={labels} />
          </g>
        </Stage>
      )}
      {work.length > 0 && (
        <div class="so-lines" data-part={ViewerPart.Formulas}>
          <RichText text={alignedTex(work)} />
        </div>
      )}
      {s.measures.length > 0 && (
        <Chips
          part={ViewerPart.Measures}
          label={say(locale, WORDS.measures)}
          value={s.measure}
          options={s.measures.map((m) => ({
            id: m,
            text: say(
              locale,
              m === Measure.Curved
                ? curvedName
                : m === Measure.Total
                  ? WORDS.total
                  : m === Measure.Volume
                    ? WORDS.volume
                    : WORDS.none,
            ),
          }))}
          onPick={(measure) => call(ViewerAction.Pick, { measure })}
        />
      )}
      {(s.canSetDims || s.canUnfold || s.canTurn) && (
        <div class="so-controls">
          {s.canSetDims && (
            <div class="so-steppers" data-part={ViewerPart.Steppers}>
              {DIM_NAMES[s.solid].map((k) => (
                <Nudger
                  key={k}
                  name={k.replace("1", "₁").replace("2", "₂")}
                  value={`${Math.round(s.dims[k] * 100) / 100}`}
                  canDown={s.dims[k] > s.dimStep}
                  onNudge={(by) => call(ViewerAction.Nudge, { name: k, by })}
                />
              ))}
            </div>
          )}
          {s.canTurn && !s.isNet && (
            <div class="so-row" data-part={ViewerPart.Turn}>
              <Button
                label={say(locale, WORDS.turnLeft)}
                onPress={() => call(ViewerAction.Turn, { by: -1 })}
              >
                ↺
              </Button>
              <Button
                label={say(locale, WORDS.turnRight)}
                onPress={() => call(ViewerAction.Turn, { by: 1 })}
              >
                ↻
              </Button>
            </div>
          )}
          {s.canUnfold && (
            <Button
              isWide
              isOn={s.isNet}
              part={ViewerPart.Unfold}
              label={say(locale, s.isNet ? WORDS.close : WORDS.open)}
              onPress={() => call(ViewerAction.Unfold, { on: !s.isNet })}
            >
              {say(locale, s.isNet ? WORDS.close : WORDS.open)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
