import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BptAction,
  BptMode,
  BptPart,
  type BptState,
  eOf,
  isParallelOf,
  lengthsOf,
  pointsOf,
  ratioDOf,
  ratioEOf,
} from "./bpt";
import { ParallelMark, SideLabel, VertexLabel, centreOf, fitPoints, pathOf } from "./draw";
import { type Pt, type Words, lerp, numText, ratioText, say } from "./geometry";
import { Nudger } from "./ui";

const WORDS = {
  parallel: { en: "is parallel to", hi: "के समांतर है" },
  notParallel: { en: "is not parallel to", hi: "के समांतर नहीं है" },
} as const satisfies Record<string, Words>;

const H = 220;

export function BptView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BptState;
  const [A, B, C, D, E] = s.names as [string, string, string, string, string];
  const pts = pointsOf(s);
  const fit = fitPoints([pts.a, pts.b, pts.c], { left: 0, top: 4, width, height: H - 4 }, 26);
  const a = fit.px(pts.a);
  const b = fit.px(pts.b);
  const c = fit.px(pts.c);
  const d = fit.px(pts.dPt);
  const e = fit.px(pts.ePt);
  const centre = centreOf([a, b, c]);
  const par = isParallelOf(s);
  const L = lengthsOf(s);
  const rd = ratioDOf(s);
  const re = ratioEOf(s);
  // DE drawn a little past D and E, so it reads as a line.
  const ext = (p: Pt, q: Pt, t: number): Pt => [p[0] + (p[0] - q[0]) * t, p[1] + (p[1] - q[1]) * t];
  const marks = (from: Pt, to: Pt) =>
    s.parts === null
      ? null
      : Array.from({ length: s.parts - 1 }, (_, i) => {
          const m = lerp(from, to, (i + 1) / (s.parts as number));
          const dx = to[0] - from[0];
          const dy = to[1] - from[1];
          const l = Math.hypot(dx, dy) || 1;
          return (
            <line
              key={`t${m[0].toFixed(1)}-${m[1].toFixed(1)}`}
              class="tg-tick"
              x1={m[0] - (dy / l) * 4}
              y1={m[1] + (dx / l) * 4}
              x2={m[0] + (dy / l) * 4}
              y2={m[1] - (dx / l) * 4}
            />
          );
        });
  const verdict = `${D}${E} ${say(locale, par ? WORDS.parallel : WORDS.notParallel)} ${B}${C}`;
  return (
    <div class="tg tg-bpt">
      <Stage
        label={`Triangle ${A}${B}${C} with ${D} on ${A}${B} and ${E} on ${A}${C}; ${D}${E} ${par ? "parallel" : "not parallel"} to ${B}${C}`}
        x={[0, width]}
        width={width}
        height={H}
        svg={{ class: "tg-svg" }}
      >
        <g data-part={BptPart.Triangle}>
          <path class="tg-shape-1" d={pathOf([a, b, c])} />
          {marks(a, b)}
          {marks(a, c)}
          {par && (
            <>
              <ParallelMark p={b} q={c} />
              <ParallelMark p={d} q={e} />
            </>
          )}
          <VertexLabel at={a} centre={centre} text={A} />
          <VertexLabel at={b} centre={centre} text={B} />
          <VertexLabel at={c} centre={centre} text={C} />
        </g>
        <g data-part={BptPart.Line}>
          <line
            class={`tg-cut ${par ? "is-parallel" : ""}`}
            x1={ext(d, e, 0.18)[0]}
            y1={ext(d, e, 0.18)[1]}
            x2={ext(e, d, 0.18)[0]}
            y2={ext(e, d, 0.18)[1]}
          />
          <circle class="tg-point" cx={d[0]} cy={d[1]} r={4.5} />
          <circle class="tg-point" cx={e[0]} cy={e[1]} r={4.5} />
          <text class="tg-vertex" x={d[0] - 14} y={d[1] + 4} text-anchor="middle">
            {D}
          </text>
          <text class="tg-vertex" x={e[0] + 14} y={e[1] + 4} text-anchor="middle">
            {E}
          </text>
        </g>
        {s.showLengths && (
          <g>
            <SideLabel p={a} q={d} centre={centre} text={numText(L.ad)} gap={14} />
            <SideLabel p={d} q={b} centre={centre} text={numText(L.db)} gap={14} />
            <SideLabel p={a} q={e} centre={centre} text={numText(L.ae)} gap={14} />
            <SideLabel p={e} q={c} centre={centre} text={numText(L.ec)} gap={14} />
          </g>
        )}
      </Stage>
      {s.showRatios && (
        <div class="tg-readout" data-part={BptPart.Ratios}>
          <span class="tg-chip">{`${A}${D} : ${D}${B} = ${ratioText(rd)}`}</span>
          <span class={`tg-sign ${par ? "is-on" : "is-off"}`}>{par ? "=" : "≠"}</span>
          <span class="tg-chip">{`${A}${E} : ${E}${C} = ${ratioText(re)}`}</span>
        </div>
      )}
      <p class={`tg-verdict ${par ? "is-on" : "is-off"}`} data-part={BptPart.Verdict}>
        {verdict}
      </p>
      {(s.canMoveD || (s.canMoveE && s.mode === BptMode.Free)) && (
        <div class="tg-controls">
          {s.canMoveD && (
            <Nudger
              name={`${A}${D}`}
              value={numText(L.ad)}
              part={BptPart.MoveD}
              canDown={s.d > (s.parts === null ? 0.05 : 1 / s.parts) + 1e-9}
              canUp={s.d < 1 - (s.parts === null ? 0.05 : 1 / s.parts) - 1e-9}
              onNudge={(by) => call(BptAction.MoveD, { by })}
            />
          )}
          {s.canMoveE && s.mode === BptMode.Free && (
            <Nudger
              name={`${A}${E}`}
              value={numText(L.ae)}
              part={BptPart.MoveE}
              canDown={eOf(s) > (s.parts === null ? 0.05 : 1 / s.parts) + 1e-9}
              canUp={eOf(s) < 1 - (s.parts === null ? 0.05 : 1 / s.parts) - 1e-9}
              onNudge={(by) => call(BptAction.MoveE, { by })}
            />
          )}
        </div>
      )}
    </div>
  );
}
