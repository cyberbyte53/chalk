import type { Locale } from "@chalk/content";
import { SymbolButton } from "@chalk/draw";
import { type FramePixels, does, isLayerOn, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { type LayerView, actions } from "./layer-view";
import { PlacePicture } from "./pictures";
import { places } from "./places";
import type { Point } from "./plane";
import { type PlaneView, isRisen, unitOf } from "./plane-view";
import { walker } from "./walker";
import { WORDS, addressOf, word } from "./words";

/** The places, each a small picture; a tap makes one the target when the board allows it. */
function PlacesDraw({
  s,
  px,
  locale,
}: { s: PlaneView; px: FramePixels; locale: Locale }): JSX.Element {
  const size = Math.max(16, Math.min(34, unitOf(px) * 0.62));
  const isLit = (p: Point) => s.lit !== null && p[s.lit.axis] === s.lit.value;
  return (
    <g class="cp-places">
      {s.places.map((p) => {
        // A place stands on a line only once that line has risen (or as high as it has grown).
        const rise = s.rising;
        const isUp =
          p.y === 0 ||
          isRisen(s, p.x) ||
          (rise !== null && rise.at === p.x && p.y <= s.window.yMax * rise.height);
        if (!isUp) return null;
        const [x, y] = px.toPx(p.x, p.y);
        const isTarget = s.target !== null && s.target.x === p.x && s.target.y === p.y;
        const classes = ["cp-place", `is-${s.placeKind}`];
        if (isTarget) classes.push("is-target");
        if (isLit(p)) classes.push("is-lit");
        const key = `${p.x},${p.y}`;
        return (
          <g
            key={key}
            class={classes.join(" ")}
            transform={`translate(${x}, ${y})`}
            {...(s.canChooseTarget ? does(actions.chooseTarget, { x: p.x, y: p.y }, key) : {})}
          >
            <rect
              class="cp-hit"
              x={-size * 0.7}
              y={-size * 0.7}
              width={size * 1.4}
              height={size * 1.4}
            />
            {isTarget && <circle class="cp-target-halo" r={size * 0.8} />}
            <PlacePicture kind={s.placeKind} size={size} />
            {p.label !== undefined && (
              <text
                class="cp-place-label"
                // On the horizontal line, under its numbers (above it is where the walker stands).
                y={p.y === 0 ? 34 : size * 0.62 + 10}
                text-anchor="middle"
              >
                {word(p.label, locale)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** The places layer's drawing: the places, the chosen one's address over the plane, Lights off. */
export const placesView: LayerView = {
  isOn: (s) => isLayerOn(places, s),
  above: ({ s, locale }) => {
    if (!s.showAddress) return null;
    if (s.target !== null)
      return (
        <p
          class="cp-line cp-address"
          {...shows(
            "target",
            s.target,
            `${word(s.targetName, locale)}: ${addressOf(s.axisNames, s.target, locale)}`,
          )}
        >
          <strong>{word(s.targetName, locale)}</strong>: {addressOf(s.axisNames, s.target, locale)}
        </p>
      );
    // Room for the address before there is one, so the map doesn't move when it appears: an
    // unseen copy of the longest address this board can show (its farthest place).
    if (!s.canChooseTarget) return null;
    return (
      <p class="cp-line cp-address is-room" aria-hidden="true">
        <strong>{word(s.targetName, locale)}</strong>:{" "}
        {addressOf(
          s.axisNames,
          s.places.reduce(
            (far, p) => (p.x + p.y > far.x + far.y ? p : far),
            s.places[0] ?? { x: 0, y: 0 },
          ),
          locale,
        )}
      </p>
    );
  },
  picture: ({ s, px, locale }) => <PlacesDraw s={s} px={px} locale={locale} />,
  controls: ({ s, locale }) =>
    s.lit === null ? null : (
      <SymbolButton
        symbol={word(WORDS.lightsOff, locale)}
        label={word(WORDS.lightsOff, locale)}
        isWide
        {...does(actions.clearLight)}
      />
    ),
};
