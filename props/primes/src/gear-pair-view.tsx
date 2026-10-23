import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { GearPairAction, type GearPairState } from "./gear-pair";
import { turnsText } from "./seen";
import { SymbolButton } from "./ui";

const TOOTH = 7;
const MAX_RADIUS = 96;
const PAD = 10;

/** A gear's outline: `teeth` square-ish teeth around a circle of radius r. */
function gearPath(teeth: number, r: number): string {
  const points: string[] = [];
  const step = (2 * Math.PI) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const corners = [
      [r, a - step * 0.5],
      [r, a - step * 0.22],
      [r + TOOTH, a - step * 0.16],
      [r + TOOTH, a + step * 0.16],
      [r, a + step * 0.22],
    ] as const;
    for (const [radius, angle] of corners) {
      points.push(
        `${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`,
      );
    }
  }
  return `M${points.join("L")}Z`;
}

/** The painted tooth: drawn over tooth 0, which starts pointing at the other gear. */
function paintedTooth(r: number, teeth: number): string {
  const step = (2 * Math.PI) / teeth;
  const p = (radius: number, angle: number) =>
    `${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`;
  return `M${p(r - 4, -step * 0.22)}L${p(r + TOOTH, -step * 0.16)}L${p(r + TOOTH, step * 0.16)}L${p(r - 4, step * 0.22)}Z`;
}

/**
 * Two gears in mesh. Each has one painted tooth; both start at the point where the gears touch
 * (marked ▾). The teeth passed so far are counted between them, and each gear's full turns under it.
 * The painted teeth meet again only after the LCM of the two tooth counts; then the mark glows.
 */
export function GearPairView({ view, width, call }: PropViewProps): JSX.Element {
  const s = view as unknown as GearPairState & {
    turnsA: number;
    turnsB: number;
    isMarkMet: boolean;
    timesMet: number;
  };
  const k = Math.min(
    MAX_RADIUS / Math.max(s.teethA, s.teethB),
    (width - 2 * PAD - 4 * TOOTH - 2) / (2 * (s.teethA + s.teethB)),
  );
  const rA = k * s.teethA;
  const rB = k * s.teethB;
  const height = 2 * Math.max(rA, rB) + 2 * TOOTH + 2 * PAD + 14;
  const cy = height / 2 + 7;
  const total = 2 * rA + 2 * rB + 4 * TOOTH + 2;
  const left = (width - total) / 2 + rA + TOOTH;
  const cxA = left;
  const cxB = left + rA + rB + 2 * TOOTH + 2;
  const touchX = cxA + rA + TOOTH + 1;
  const angleA = (s.turned / s.teethA) * 360;
  const angleB = 180 - (s.turned / s.teethB) * 360;
  return (
    <div class={`pr-gears${s.isMarkMet ? " is-met" : ""}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={`Gears with ${s.teethA} and ${s.teethB} teeth, ${Math.round(s.turned)} teeth turned${s.isMarkMet ? ": the painted teeth meet" : ""}`}
      >
        <g
          transform={`translate(${cxA} ${cy}) rotate(${angleA})`}
          data-part="gearA"
          class="pr-gear pr-gear-a"
        >
          <path d={gearPath(s.teethA, rA)} />
          <circle r={Math.max(4, rA * 0.18)} class="pr-hub" />
          <path d={paintedTooth(rA, s.teethA)} class="pr-painted" />
        </g>
        <g
          transform={`translate(${cxB} ${cy}) rotate(${angleB})`}
          data-part="gearB"
          class="pr-gear pr-gear-b"
        >
          <path d={gearPath(s.teethB, rB)} />
          <circle r={Math.max(4, rB * 0.18)} class="pr-hub" />
          <path d={paintedTooth(rB, s.teethB)} class="pr-painted" />
        </g>
        <g
          data-part="meetingPoint"
          class="pr-meet"
          transform={`translate(${touchX} ${cy - Math.min(rA, rB) - TOOTH - 4})`}
        >
          <path d="M-7,-9 L7,-9 L0,0 Z" />
        </g>
        <text class="pr-gear-label" x={cxA} y={cy} dy="0.35em">
          {s.teethA}
        </text>
        <text class="pr-gear-label" x={cxB} y={cy} dy="0.35em">
          {s.teethB}
        </text>
      </svg>
      <div class="pr-gear-counts">
        <span>{turnsText(s.turnsA)} ↻</span>
        <span class="pr-teeth-passed" data-part="teethTurned">
          {Math.round(s.turned)}
        </span>
        <span>{turnsText(s.turnsB)} ↺</span>
      </div>
      <div class="pr-controls">
        <SymbolButton
          symbol="↻ 1"
          label="Turn by one tooth"
          part="turn:1"
          isWide
          onPress={() => call(GearPairAction.TurnBy, { teeth: 1 })}
        />
        <SymbolButton
          symbol={`↻ ${s.teethA}`}
          label={`Turn by ${s.teethA} teeth`}
          part="turn:a"
          isWide
          onPress={() => call(GearPairAction.TurnBy, { teeth: s.teethA })}
        />
        <SymbolButton
          symbol={`↻ ${s.teethB}`}
          label={`Turn by ${s.teethB} teeth`}
          part="turn:b"
          isWide
          onPress={() => call(GearPairAction.TurnBy, { teeth: s.teethB })}
        />
        <SymbolButton
          symbol="↺"
          label="Back to the start"
          part="startAgain"
          isEnabled={s.turned > 0}
          onPress={() => call(GearPairAction.StartAgain)}
        />
      </div>
    </div>
  );
}
