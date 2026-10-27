import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { fracText, say } from "./quad";
import {
  MAX_B,
  TILE_STEPS,
  TilesAction,
  TilesPart,
  type TilesState,
  describeTiles,
  equationTex,
  stepTex,
} from "./tiles";
import { Button, Nudger } from "./ui";

const WORDS = {
  next: { en: "next →", hi: "आगे →" },
  again: { en: "again ↺", hi: "फिर से ↺" },
} as const;

const GAP = 14;
const LEFT = 26;
const TOP = 26;

export function TilesView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TilesState;
  const b = s.b;
  // Sizes: the x side as large as fits, one unit of b at most 14 px.
  const avail = width - LEFT - 10;
  let u = 14;
  let X = Math.min(150, avail - GAP * 2 - b * u);
  if (X < 90) {
    u = Math.max(5, (avail - GAP * 2 - 90) / b);
    X = Math.min(150, avail - GAP * 2 - b * u);
  }
  const h = (b / 2) * u;
  const ox = LEFT;
  const oy = TOP;
  const height = Math.round(oy + X + Math.max(h, 0) + 34);
  const half = fracText(b, 2);
  const corner = fracText(b * b, 4);
  const step = s.step;
  const joined = step >= 2;
  // The two halves: where each sits at this step.
  const right = joined
    ? `translate(${ox + X}px, ${oy}px)`
    : `translate(${ox + X + GAP}px, ${oy}px)`;
  const bottom = joined
    ? `translate(${ox}px, ${oy + X + h}px) rotate(-90deg)`
    : `translate(${ox + X + GAP + h + (step === 1 ? GAP : 0)}px, ${oy}px)`;
  const label = (x: number, y: number, text: string, cls = "qd-tile-label") => (
    <text class={cls} x={x} y={y} text-anchor="middle">
      {text}
    </text>
  );
  /** A label up the left side, turned to read along it. */
  const side = (y: number, text: string) => (
    <text
      class="qd-tile-label"
      x={ox - 10}
      y={y}
      text-anchor="middle"
      transform={`rotate(-90 ${ox - 10} ${y})`}
    >
      {text}
    </text>
  );
  const eq = equationTex(s);
  const isLast = step === TILE_STEPS - 1;
  return (
    <div class="qd-tiles">
      <Stage
        label={describeTiles(s)}
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "qd-svg" }}
      >
        <g data-part={TilesPart.Tiles}>
          {/* the x by x square */}
          <rect class="qd-tile is-square" x={ox} y={oy} width={X} height={X} />
          {label(ox + X / 2, oy + X / 2 + 6, "x²", "qd-tile-label is-big")}
          {/* the corner, once the halves are round two sides */}
          {joined && (
            <rect
              class={isLast ? "qd-tile is-corner" : "qd-tile is-missing"}
              x={ox + X}
              y={oy + X}
              width={h}
              height={h}
            />
          )}
          {/* the two halves of the strip */}
          <g class="qd-move" style={{ transform: right }}>
            <rect
              class={`qd-tile is-strip${step === 0 ? " is-joined" : ""}`}
              x={0}
              y={0}
              width={h}
              height={X}
            />
          </g>
          <g class="qd-move" style={{ transform: bottom }}>
            <rect
              class={`qd-tile is-strip${step === 0 ? " is-joined" : ""}`}
              x={0}
              y={0}
              width={h}
              height={X}
            />
          </g>
          {/* before the cut, one strip */}
          {step === 0 && (
            <rect class="qd-tile is-outline" x={ox + X + GAP} y={oy} width={2 * h} height={X} />
          )}
          {/* side labels */}
          {!isLast && label(ox + X / 2, oy - 8, "x")}
          {!isLast && side(oy + X / 2, "x")}
          {step === 0 && label(ox + X + GAP + h, oy - 8, String(b))}
          {step === 0 && h * 2 > 22 && label(ox + X + GAP + h, oy + X / 2 + 4, `${b}x`)}
          {step === 1 && (
            <>
              {label(ox + X + GAP + h / 2, oy - 8, half)}
              {label(ox + X + 2 * GAP + 1.5 * h, oy - 8, half)}
              {h > 22 && label(ox + X + GAP + h / 2, oy + X / 2 + 4, `${half}x`)}
              {h > 22 && label(ox + X + 2 * GAP + 1.5 * h, oy + X / 2 + 4, `${half}x`)}
            </>
          )}
          {joined && !isLast && (
            <>
              {label(ox + X + h / 2, oy - 8, half)}
              {h > 22 && label(ox + X + h / 2, oy + X / 2 + 4, `${half}x`)}
              {h > 14 && label(ox + X / 2, oy + X + h / 2 + 4, `${half}x`)}
              <text class="qd-tile-label is-missing" x={ox + X + h + 6} y={oy + X + h / 2 + 4}>
                ?
              </text>
            </>
          )}
          {isLast && (
            <>
              {label(ox + (X + h) / 2, oy - 8, `x + ${half}`)}
              {side(oy + (X + h) / 2, `x + ${half}`)}
              <text class="qd-tile-label is-corner" x={ox + X + h + 6} y={oy + X + h / 2 + 4}>
                {b % 2 === 0 ? half : `(${half})`}² = {corner}
              </text>
            </>
          )}
        </g>
      </Stage>
      <div class="qd-readout">
        {s.showAlgebra && (
          <p class="qd-equation" data-part={TilesPart.Algebra}>
            <RichText text={`$${stepTex(s)}$`} />
          </p>
        )}
        {eq !== null && isLast && (
          <p class="qd-equation" data-part={TilesPart.Equation}>
            <RichText text={`$${eq}$`} />
          </p>
        )}
        <div class="qd-controls">
          {s.canSetB && (
            <Nudger
              name="b"
              value={String(b)}
              part={TilesPart.B}
              canDown={b > 1}
              canUp={b < MAX_B}
              onNudge={(by) => call(TilesAction.SetB, { b: b + by })}
            />
          )}
          {s.canStep && (
            <div class="qd-stepper" data-part={TilesPart.Next}>
              <span class="qd-dots" aria-hidden="true">
                {Array.from({ length: TILE_STEPS }, (_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: one dot per fixed step
                  <span key={i} class={i === step ? "qd-dot is-on" : "qd-dot"} />
                ))}
              </span>
              <Button
                label={say(locale, WORDS.next)}
                isWide
                onPress={() => call(TilesAction.Next, {})}
              >
                {say(locale, isLast ? WORDS.again : WORDS.next)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
