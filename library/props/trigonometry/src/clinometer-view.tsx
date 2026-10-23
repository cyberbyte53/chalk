import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import {
  ClinoAction,
  ClinoPart,
  type ClinoState,
  ClinoTarget,
  DISTANCE_MAX,
  DISTANCE_MIN,
  isSightedOf,
  trueAngleOf,
  workingOf,
} from "./clinometer";
import { AngleArc } from "./draw";
import { type Pt, type Words, numText, rad, say } from "./trig";
import { Button, Nudger } from "./ui";

const WORDS = {
  tilt: { en: "Tilt", hi: "झुकाव" },
  walk: { en: "Distance", hi: "दूरी" },
  level: { en: "Level", hi: "सीधा करो" },
  reading: { en: "Reading", hi: "पाठ्यांक" },
  distance: { en: "Distance", hi: "दूरी" },
  sighted: { en: "On the top!", hi: "ठीक चोटी पर!" },
  low: { en: "Below the top: tilt up", hi: "चोटी से नीचे: ऊपर झुकाओ" },
  high: { en: "Above the top: tilt down", hi: "चोटी से ऊपर: नीचे झुकाओ" },
} as const satisfies Record<string, Words>;

const H = 200;

function Target({ kind, foot, top }: { kind: ClinoTarget; foot: Pt; top: Pt }): JSX.Element {
  const h = foot[1] - top[1];
  if (kind === ClinoTarget.Tower) {
    const w = Math.max(12, Math.min(26, h * 0.22));
    return (
      <g class="tr-tower">
        <path
          d={`M${foot[0] - w / 2} ${foot[1]} L${foot[0] - w / 4} ${top[1]} L${foot[0] + w / 4} ${top[1]} L${foot[0] + w / 2} ${foot[1]} Z`}
        />
      </g>
    );
  }
  if (kind === ClinoTarget.Tree) {
    const r = Math.max(9, h * 0.25);
    return (
      <g>
        <line class="tr-trunk" x1={foot[0]} y1={foot[1]} x2={foot[0]} y2={top[1] + r} />
        <circle class="tr-leaves" cx={top[0]} cy={top[1] + r} r={r} />
      </g>
    );
  }
  if (kind === ClinoTarget.Flag) {
    return (
      <g>
        <line class="tr-pole" x1={foot[0]} y1={foot[1]} x2={top[0]} y2={top[1]} />
        <path class="tr-flag" d={`M${top[0]} ${top[1]} l14 3.5 l-14 3.5 Z`} />
      </g>
    );
  }
  return (
    <g class="tr-kite">
      <path
        d={`M${top[0]} ${top[1] - 8} L${top[0] + 6} ${top[1]} L${top[0]} ${top[1] + 8} L${top[0] - 6} ${top[1]} Z`}
      />
    </g>
  );
}

/** The protractor with its plumb line, as held: straight edge along the sight. */
function Dial({
  tilt,
  cx,
  cy,
  r,
}: { tilt: number; cx: number; cy: number; r: number }): JSX.Element {
  const t = rad(tilt);
  // Straight edge direction (towards the target, up the screen).
  const ux = Math.cos(t);
  const uy = -Math.sin(t);
  // The curved half hangs below the straight edge.
  const nx = Math.sin(t);
  const ny = Math.cos(t);
  const a: Pt = [cx - ux * r, cy - uy * r];
  const b: Pt = [cx + ux * r, cy + uy * r];
  const ticks = [0, 30, 60, 90, 120, 150, 180];
  return (
    <g class="tr-dial">
      <path class="tr-protractor" d={`M${a[0]} ${a[1]} A${r} ${r} 0 0 0 ${b[0]} ${b[1]} Z`} />
      {ticks.map((k) => {
        // k measured from the straight edge (towards b), along the curved side.
        const ang = rad(k);
        const dx = ux * Math.cos(ang) + nx * Math.sin(ang);
        const dy = uy * Math.cos(ang) + ny * Math.sin(ang);
        return (
          <line
            key={k}
            class="tr-tick"
            x1={cx + dx * r * 0.82}
            y1={cy + dy * r * 0.82}
            x2={cx + dx * r}
            y2={cy + dy * r}
          />
        );
      })}
      <line class="tr-plumb" x1={cx} y1={cy} x2={cx} y2={cy + r * 1.05} />
      <circle class="tr-bob" cx={cx} cy={cy + r * 1.05} r={2.5} />
      <line class="tr-straw" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      <circle class="tr-pin" cx={cx} cy={cy} r={1.8} />
    </g>
  );
}

export function ClinometerView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ClinoState;
  const sighted = isSightedOf(s);
  const truth = trueAngleOf(s);
  // A fixed frame: the furthest walk and the target's height always fit.
  const left = 26;
  const right = width - 30;
  const ground = H - 18;
  const k = Math.min((right - left) / DISTANCE_MAX, (ground - 22) / Math.max(s.targetHeight, 10));
  const footX = right;
  const obsX = footX - s.distance * k;
  const eye: Pt = [obsX, ground - Math.max(s.eyeHeight * k, 14)];
  const top: Pt = [footX, ground - s.targetHeight * k];
  const foot: Pt = [footX, ground];
  // Ray from the eye at the current tilt, long enough to cross the frame.
  const t = rad(s.tilt);
  // Run the ray to the frame's right or top edge, whichever it meets first.
  const reach = Math.min(
    Math.cos(t) > 1e-9 ? (width - eye[0]) / Math.cos(t) : Number.POSITIVE_INFINITY,
    Math.sin(t) > 1e-9 ? eye[1] / Math.sin(t) : Number.POSITIVE_INFINITY,
  );
  const end: Pt = [eye[0] + Math.cos(t) * reach, eye[1] - Math.sin(t) * reach];
  const level: Pt = [footX, eye[1]];
  const verdict = sighted ? WORDS.sighted : s.tilt < truth ? WORDS.low : WORDS.high;
  const dialR = 26;
  return (
    <div class="tr tr-clino">
      <Stage
        label={`An observer ${numText(s.distance, 1)} m from a ${s.target}, sighting at ${s.tilt}°`}
        x={[0, width]}
        width={width}
        height={H}
        svg={{ class: "tr-svg" }}
      >
        <g data-part={ClinoPart.Figure}>
          <line class="tr-ground-line" x1={0} y1={ground} x2={width} y2={ground} />
          <Target kind={s.target} foot={foot} top={top} />
          <line class="tr-horizontal" x1={eye[0]} y1={eye[1]} x2={level[0]} y2={level[1]} />
          <line
            class={`tr-sight${sighted ? " is-on" : ""}`}
            x1={eye[0]}
            y1={eye[1]}
            x2={end[0]}
            y2={end[1]}
          />
          {s.tilt > 0 && (
            <AngleArc v={eye} p={level} q={end} r={34} label={`${s.tilt}°`} cls="tr-arc is-ref" />
          )}
          <g class="tr-person">
            <line x1={obsX} y1={ground} x2={eye[0] - 4} y2={eye[1] + 3} />
            <circle cx={eye[0] - 4} cy={eye[1]} r={3.5} />
          </g>
          <circle class={`tr-top${sighted ? " is-on" : ""}`} cx={top[0]} cy={top[1]} r={3} />
          <text class="tr-length" x={(obsX + footX) / 2} y={ground + 13} text-anchor="middle">
            {`${numText(s.distance, 1)} m`}
          </text>
        </g>
        <g data-part={ClinoPart.Dial}>
          <Dial tilt={s.tilt} cx={left + dialR - 8} cy={dialR + 8} r={dialR} />
        </g>
      </Stage>
      <div class="tr-readout" data-part={ClinoPart.Readout}>
        <span class="tr-chip">{`${say(locale, WORDS.reading)}: ${s.tilt}°`}</span>
        <span class="tr-chip">{`${say(locale, WORDS.distance)}: ${numText(s.distance, 1)} m`}</span>
        <span class={`tr-chip${sighted ? " is-right" : ""}`}>{say(locale, verdict)}</span>
      </div>
      {s.showWorking && sighted && (
        <div class="tr-working" data-part={ClinoPart.Working}>
          {workingOf(s).map((line) => (
            <p key={line}>
              <RichText text={`$${line}$`} />
            </p>
          ))}
        </div>
      )}
      {(s.canTilt || s.canWalk) && (
        <div class="tr-controls" data-part={ClinoPart.Controls}>
          {s.canTilt && (
            <Nudger
              name={say(locale, WORDS.tilt)}
              value={`${s.tilt}°`}
              canDown={s.tilt > 0}
              canUp={s.tilt < 85}
              onNudge={(by) => call(ClinoAction.Tilt, { by })}
            />
          )}
          {s.canWalk && (
            <Nudger
              name={say(locale, WORDS.walk)}
              value={`${numText(s.distance, 1)} m`}
              canDown={s.distance > DISTANCE_MIN}
              canUp={s.distance < DISTANCE_MAX}
              onNudge={(by) => call(ClinoAction.Walk, { by })}
            />
          )}
          {s.canTilt && (
            <Button
              label={say(locale, WORDS.level)}
              isEnabled={s.tilt > 0}
              onPress={() => call(ClinoAction.Reset, {})}
            >
              {say(locale, WORDS.level)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
