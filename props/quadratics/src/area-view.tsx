import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import {
  AreaAction,
  AreaPart,
  type AreaState,
  areaOf,
  isOnTarget,
  lengthOf,
  lengthTex,
  productTex,
  standardTex,
} from "./area";
import { numText, say } from "./quad";
import { Nudger } from "./ui";

const WORDS = {
  length: { en: "length", hi: "लंबाई" },
  area: { en: "area", hi: "क्षेत्रफल" },
  target: { en: "target", hi: "लक्ष्य" },
  hit: { en: "exactly the target!", hi: "ठीक लक्ष्य!" },
  breadth: { en: "breadth", hi: "चौड़ाई" },
} as const;

const PAD = { left: 52, right: 12, top: 12, bottom: 40 };
const MAX_H = 170;

export function AreaView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as AreaState;
  const len = lengthOf(s);
  const area = areaOf(s);
  const hit = isOnTarget(s);
  // A fixed scale: the biggest rectangle the stepper can reach fits, so changing x visibly changes it.
  const longest = Math.max(1, s.m > 0 ? s.m * s.xMax + s.n : s.n, len);
  const k = Math.min((width - PAD.left - PAD.right) / longest, MAX_H / Math.max(1, s.xMax));
  const rw = Math.max(2, len * k);
  const rh = Math.max(2, s.x * k);
  const height = Math.round(PAD.top + Math.max(rh, 60) + PAD.bottom);
  const x0 = PAD.left;
  const y0 = PAD.top;
  const u = s.unit;
  const product = productTex(s);
  const standard = standardTex(s);
  return (
    <div class="qd-area">
      <Stage
        label={`A rectangle ${numText(s.x)} ${u} by ${numText(len)} ${u}, area ${numText(area)} ${u}²`}
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "qd-svg" }}
      >
        <rect
          class={hit ? "qd-plot is-hit" : "qd-plot"}
          x={x0}
          y={y0}
          width={rw}
          height={rh}
          rx={3}
          data-part={AreaPart.Rectangle}
        />
        {/* breadth, up the left side */}
        <line class="qd-dim" x1={x0 - 10} y1={y0} x2={x0 - 10} y2={y0 + rh} />
        <text
          class="qd-dim-label"
          x={x0 - 14}
          y={y0 + rh / 2 + 4}
          text-anchor="end"
          data-part={AreaPart.Breadth}
        >
          x = {numText(s.x)}
        </text>
        {/* length, along the bottom */}
        <line class="qd-dim" x1={x0} y1={y0 + rh + 10} x2={x0 + rw} y2={y0 + rh + 10} />
        <text
          class="qd-dim-label"
          x={x0 + Math.max(rw, 120) / 2}
          y={y0 + rh + 28}
          text-anchor="middle"
          data-part={AreaPart.Length}
        >
          {say(locale, WORDS.length)} = {lengthTex(s.m, s.n).replace(/ - /g, " − ")} ={" "}
          {numText(len)} {u}
        </text>
        {/* area, inside (or beside a thin rectangle) */}
        <text
          class={hit ? "qd-area-label is-hit" : "qd-area-label"}
          x={rh > 34 && rw > 110 ? x0 + rw / 2 : Math.min(width - 8, x0 + rw + 8)}
          y={rh > 34 && rw > 110 ? y0 + rh / 2 + 5 : y0 + 16}
          text-anchor={rh > 34 && rw > 110 ? "middle" : "start"}
          data-part={AreaPart.Area}
        >
          {numText(area)} {u}²
        </text>
      </Stage>
      <div class="qd-readout">
        {s.target !== null && (
          <p class={hit ? "qd-goal is-hit" : "qd-goal"}>
            {hit
              ? `${say(locale, WORDS.area)} = ${s.target} ${u}²: ${say(locale, WORDS.hit)}`
              : `${say(locale, WORDS.target)}: ${s.target} ${u}²`}
          </p>
        )}
        {s.canMove && (
          <Nudger
            name="x"
            value={`${numText(s.x)} ${u}`}
            part={AreaPart.Nudge}
            canDown={s.x - s.step >= 0 && s.m * (s.x - s.step) + s.n > 0}
            canUp={s.x + s.step <= s.xMax}
            onNudge={(by) => call(AreaAction.Nudge, { by })}
          />
        )}
        {s.showEquation && product !== null && standard !== null && (
          <div class="qd-equation" data-part={AreaPart.Equation}>
            <p>
              <RichText text={`$${product}$`} />
            </p>
            <p>
              <RichText text={`$${standard}$`} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
