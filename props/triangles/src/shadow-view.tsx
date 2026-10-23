import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { RightMark, fitPoints, pathOf } from "./draw";
import { type Pt, type Words, numText, say } from "./geometry";
import {
  SHADOW_STEPS,
  ShadowAction,
  ShadowMode,
  ShadowObject,
  ShadowPart,
  type ShadowState,
  lampShadowOf,
  objectShadowOf,
  workingOf,
} from "./shadow";
import { Button, Nudger } from "./ui";

const WORDS = {
  next: { en: "Next step", hi: "अगला कदम" },
  again: { en: "Start again", hi: "फिर से" },
  lower: { en: "Sun lower", hi: "सूरज नीचे" },
  higher: { en: "Sun higher", hi: "सूरज ऊपर" },
  bigger: { en: "(stick drawn bigger)", hi: "(छड़ी बड़ी बनाई है)" },
} as const satisfies Record<string, Words>;

const H = 200;

function Silhouette({ kind, base, top }: { kind: ShadowObject; base: Pt; top: Pt }): JSX.Element {
  const h = base[1] - top[1];
  const x = base[0];
  switch (kind) {
    case ShadowObject.Tank: {
      const w = Math.max(14, h * 0.32);
      const tankH = h * 0.3;
      return (
        <g class="tg-object">
          <path
            class="tg-object-leg"
            d={`M${x - w * 0.35} ${base[1]} L${x - w * 0.2} ${top[1] + tankH} M${x + w * 0.35} ${base[1]} L${x + w * 0.2} ${top[1] + tankH} M${x - w * 0.3} ${base[1] - h * 0.25} L${x + w * 0.3} ${base[1] - h * 0.25} M${x - w * 0.25} ${base[1] - h * 0.5} L${x + w * 0.25} ${base[1] - h * 0.5}`}
          />
          <rect class="tg-object-body" x={x - w / 2} y={top[1]} width={w} height={tankH} rx={3} />
        </g>
      );
    }
    case ShadowObject.Tower: {
      const w = Math.max(12, h * 0.22);
      return (
        <path
          class="tg-object-leg"
          d={`M${x - w / 2} ${base[1]} L${x} ${top[1]} L${x + w / 2} ${base[1]} M${x - w * 0.33} ${base[1] - h * 0.33} L${x + w * 0.33} ${base[1] - h * 0.33} M${x - w * 0.17} ${base[1] - h * 0.66} L${x + w * 0.17} ${base[1] - h * 0.66} M${x - w / 2} ${base[1]} L${x + w * 0.33} ${base[1] - h * 0.33} M${x + w / 2} ${base[1]} L${x - w * 0.33} ${base[1] - h * 0.33}`}
        />
      );
    }
    case ShadowObject.Pole:
      return <line class="tg-object-pole" x1={x} y1={base[1]} x2={x} y2={top[1]} />;
    case ShadowObject.Tree: {
      const r = Math.max(8, h * 0.22);
      return (
        <g class="tg-object">
          <line class="tg-object-trunk" x1={x} y1={base[1]} x2={x} y2={top[1] + r} />
          <circle class="tg-object-leaf" cx={x} cy={top[1] + r} r={r} />
        </g>
      );
    }
  }
}

export function ShadowView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ShadowState;
  const work = workingOf(s);
  const isSun = s.mode === ShadowMode.Sun;
  let picture: JSX.Element;
  let label: string;
  if (isSun) {
    const s2 = objectShadowOf(s);
    // The stick is drawn bigger when it would be a speck next to the object.
    const zoom = Math.max(1, s.objectHeight / s.stickHeight / 4);
    const h1 = s.stickHeight * zoom;
    const w1 = s.stickShadow * zoom;
    const gap = Math.max(1.5, s2 * 0.25);
    const xo = w1 + gap;
    const fit = fitPoints(
      [
        [0, 0],
        [0, s.objectHeight * 1.08],
        [xo + s2, 0],
      ],
      { left: 0, top: 4, width, height: H - 24 },
      22,
    );
    const sb = fit.px([0, 0]);
    const st = fit.px([0, h1]);
    const ss = fit.px([w1, 0]);
    const ob = fit.px([xo, 0]);
    const ot = fit.px([xo, s.objectHeight]);
    const os = fit.px([xo + s2, 0]);
    const ground = sb[1];
    const solved = s.step >= SHADOW_STEPS;
    picture = (
      <>
        <line class="tg-ground" x1={0} y1={ground} x2={width} y2={ground} />
        <circle class="tg-sun" cx={14} cy={14} r={9} />
        {s.step >= 1 && (
          <g data-part={ShadowPart.Triangles}>
            <path class="tg-part is-one" d={pathOf([sb, st, ss])} />
            <path class="tg-part is-two" d={pathOf([ob, ot, os])} />
            <text
              class="tg-tag"
              x={(sb[0] * 2 + ss[0]) / 3 + 2}
              y={(sb[1] * 2 + st[1]) / 3 + 4}
              text-anchor="middle"
            >
              1
            </text>
            <text
              class="tg-tag"
              x={(ob[0] * 2 + os[0]) / 3 + 4}
              y={(ob[1] * 2 + ot[1]) / 3 + 4}
              text-anchor="middle"
            >
              2
            </text>
          </g>
        )}
        <g data-part={ShadowPart.Picture}>
          <line class="tg-shadow-line" x1={sb[0]} y1={ground} x2={ss[0]} y2={ground} />
          <line class="tg-shadow-line" x1={ob[0]} y1={ground} x2={os[0]} y2={ground} />
          <Silhouette kind={s.object} base={ob} top={ot} />
          <line class="tg-stick" x1={sb[0]} y1={sb[1]} x2={st[0]} y2={st[1]} />
          <line class="tg-ray" x1={st[0]} y1={st[1]} x2={ss[0]} y2={ss[1]} />
          <line class="tg-ray" x1={ot[0]} y1={ot[1]} x2={os[0]} y2={os[1]} />
          <RightMark v={sb} p={st} q={ss} size={6} />
          <RightMark v={ob} p={ot} q={os} size={8} />
          <text class="tg-length" x={sb[0] - 4} y={(sb[1] + st[1]) / 2 + 4} text-anchor="end">
            {`${numText(s.stickHeight)} m`}
          </text>
          <text class="tg-length" x={(sb[0] + ss[0]) / 2} y={ground + 14} text-anchor="middle">
            {`${numText(s.stickShadow)} m`}
          </text>
          <text
            class="tg-length is-ask"
            x={ob[0] - 10}
            y={(ob[1] + ot[1]) / 2 + 4}
            text-anchor="end"
          >
            {solved ? `${numText(s.objectHeight)} m` : "h = ?"}
          </text>
          <text class="tg-length" x={(ob[0] + os[0]) / 2} y={ground + 14} text-anchor="middle">
            {`${numText(s2)} m`}
          </text>
          {zoom > 1 && (
            <text class="tg-note" x={sb[0]} y={ground + 28}>
              {say(locale, WORDS.bigger)}
            </text>
          )}
        </g>
      </>
    );
    label = `A ${numText(s.stickHeight)} m stick with a ${numText(s.stickShadow)} m shadow and a ${s.object} with a ${numText(s2)} m shadow`;
  } else {
    const x = lampShadowOf(s);
    const fit = fitPoints(
      [
        [0, 0],
        [0, s.lampHeight * 1.05],
        [Math.max(s.distance + x, 2), 0],
      ],
      { left: 0, top: 4, width, height: H - 24 },
      26,
    );
    const a = fit.px([0, s.lampHeight]);
    const b = fit.px([0, 0]);
    const c = fit.px([s.distance, s.personHeight]);
    const d = fit.px([s.distance, 0]);
    const e = fit.px([s.distance + x, 0]);
    const solved = s.step >= SHADOW_STEPS;
    picture = (
      <>
        <line class="tg-ground" x1={0} y1={b[1]} x2={width} y2={b[1]} />
        {s.step >= 1 && (
          <g data-part={ShadowPart.Triangles}>
            <path class="tg-part is-one" d={pathOf([a, b, e])} />
            <path class="tg-part is-two" d={pathOf([c, d, e])} />
          </g>
        )}
        <g data-part={ShadowPart.Picture}>
          <line class="tg-shadow-line" x1={d[0]} y1={d[1]} x2={e[0]} y2={e[1]} />
          <line class="tg-object-pole" x1={b[0]} y1={b[1]} x2={a[0]} y2={a[1]} />
          <circle class="tg-bulb-glow" cx={a[0]} cy={a[1]} r={10} />
          <circle class="tg-bulb" cx={a[0]} cy={a[1]} r={4.5} />
          <line class="tg-ray" x1={a[0]} y1={a[1]} x2={e[0]} y2={e[1]} />
          <line class="tg-stick" x1={d[0]} y1={d[1]} x2={c[0]} y2={c[1]} />
          <circle class="tg-head" cx={c[0]} cy={c[1] - 3} r={3.5} />
          {(
            [
              [a, "A", -10, 0],
              [b, "B", -10, 4],
              [c, "C", 8, -6],
              [d, "D", 0, 16],
              [e, "E", 0, 16],
            ] as [Pt, string, number, number][]
          ).map(([p, n, dx, dy]) => (
            <text key={n} class="tg-vertex" x={p[0] + dx} y={p[1] + dy} text-anchor="middle">
              {n}
            </text>
          ))}
          <text class="tg-length" x={a[0] + 10} y={(a[1] + b[1]) / 2} text-anchor="start">
            {`${numText(s.lampHeight)} m`}
          </text>
          <text class="tg-length" x={(b[0] + d[0]) / 2} y={b[1] + 30} text-anchor="middle">
            {`${numText(s.distance)} m`}
          </text>
          <text class="tg-length is-ask" x={(d[0] + e[0]) / 2} y={b[1] + 30} text-anchor="middle">
            {solved ? `${numText(x)} m` : "x"}
          </text>
        </g>
      </>
    );
    label = `A ${numText(s.personHeight)} m person ${numText(s.distance)} m from a ${numText(s.lampHeight)} m lamp-post`;
  }
  return (
    <div class="tg tg-shadow">
      <Stage label={label} x={[0, width]} width={width} height={H} svg={{ class: "tg-svg" }}>
        {picture}
      </Stage>
      {s.step > 0 && (
        <div class="tg-working" data-part={ShadowPart.Working}>
          {work.slice(0, s.step).map((line) => (
            <p key={line}>
              <RichText text={`$${line}$`} />
            </p>
          ))}
        </div>
      )}
      {(s.canMove || s.canStep) && (
        <div class="tg-controls">
          {s.canMove && isSun && (
            <>
              <Button
                label={say(locale, WORDS.higher)}
                isWide
                part={ShadowPart.Controls}
                onPress={() => call(ShadowAction.NudgeSun, { by: -1 })}
              >
                {say(locale, WORDS.higher)}
              </Button>
              <Button
                label={say(locale, WORDS.lower)}
                isWide
                part={ShadowPart.Controls}
                onPress={() => call(ShadowAction.NudgeSun, { by: 1 })}
              >
                {say(locale, WORDS.lower)}
              </Button>
            </>
          )}
          {s.canMove && !isSun && (
            <Nudger
              name="BD"
              value={`${numText(s.distance)} m`}
              part={ShadowPart.Controls}
              canDown={s.distance > 0}
              onNudge={(by) => call(ShadowAction.Walk, { by })}
            />
          )}
          {s.canStep && (
            <Button
              isWide
              label={say(locale, s.step < SHADOW_STEPS ? WORDS.next : WORDS.again)}
              part={ShadowPart.Next}
              onPress={() =>
                call(s.step < SHADOW_STEPS ? ShadowAction.Next : ShadowAction.Reset, {})
              }
            >
              {say(locale, s.step < SHADOW_STEPS ? WORDS.next : WORDS.again)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
