import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Galvanometer } from "./draw";
import {
  InductionAction,
  InductionMode,
  type InductionState,
  Mover,
  Place,
  describeInduction,
} from "./induction";
import { type Words, say } from "./words";

const W = 320;
const H = 200;

const WORDS = {
  away: { en: "Pull apart", hi: "दूर करो" },
  near: { en: "Bring close", hi: "पास लाओ" },
  inside: { en: "Push in", hi: "अंदर डालो" },
  hold: { en: "Hold still", hi: "स्थिर रखो" },
  flip: { en: "Turn magnet round", hi: "चुंबक पलटो" },
  moveMagnet: { en: "Move the magnet", hi: "चुंबक हिलाओ" },
  moveCoil: { en: "Move the coil", hi: "कुंडली हिलाओ" },
  close: { en: "Close key", hi: "कुंजी बंद करो" },
  open: { en: "Open key", hi: "कुंजी खोलो" },
  coil1: { en: "coil 1", hi: "कुंडली 1" },
  coil2: { en: "coil 2", hi: "कुंडली 2" },
  kickRight: { en: "needle kicked right, then back to 0", hi: "सुई दाईं ओर झटकी, फिर 0 पर" },
  kickLeft: { en: "needle kicked left, then back to 0", hi: "सुई बाईं ओर झटकी, फिर 0 पर" },
  still: { en: "needle at 0", hi: "सुई 0 पर" },
  steady: { en: "steady current in coil 1", hi: "कुंडली 1 में स्थिर धारा" },
} as const satisfies Record<string, Words>;

/** A coil of wire seen from the side, its turns drawn as thin ellipses, from x0 to x1. */
function Coil({
  x0,
  x1,
  y,
  r,
  turns,
  cls,
}: { x0: number; x1: number; y: number; r: number; turns: number; cls: string }): JSX.Element {
  const step = (x1 - x0) / turns;
  return (
    <g class={`mg-coil-side ${cls}`}>
      {Array.from({ length: turns }, (_, i) => x0 + step * (i + 0.5)).map((cx) => (
        <ellipse key={cx} cx={cx} cy={y} rx={step * 0.55} ry={r} />
      ))}
    </g>
  );
}

const MAGNET_X: Readonly<Record<Place, number>> = { away: 18, near: 70, inside: 116 };
const COIL_X: Readonly<Record<Place, number>> = { away: 220, near: 168, inside: 122 };

function MagnetMode({ s, locale }: { s: InductionState; locale: string }): JSX.Element {
  const magnetX = s.mover === Mover.Magnet ? MAGNET_X[s.at] : MAGNET_X.near;
  const coilX = s.mover === Mover.Coil ? COIL_X[s.at] : COIL_X.near;
  const facing = s.pole;
  const back = facing === "N" ? "S" : "N";
  const coilEnd = coilX + 100;
  const moverX = s.mover === Mover.Magnet ? magnetX + 40 : coilX + 50;
  return (
    <g>
      <g data-part="coil">
        <rect class="mg-roll" x={coilX} y={64} width={100} height={36} rx={4} />
        <Coil x0={coilX} x1={coilEnd} y={82} r={22} turns={9} cls="" />
        <text class="mg-small" x={coilX - 4} y={56} text-anchor="middle">
          B
        </text>
        <text class="mg-small" x={coilEnd + 4} y={56} text-anchor="middle">
          A
        </text>
        <path class="mg-lead" d={`M${coilX + 6} 104 V 150 H 136`} />
        <path class="mg-lead" d={`M${coilEnd - 6} 104 V 150 H 184`} />
      </g>
      <g data-part="magnet" class="mg-bar-small">
        <rect
          class={`mg-bar is-${back.toLowerCase()}`}
          x={magnetX}
          y={72}
          width={40}
          height={20}
          rx={3}
        />
        <rect
          class={`mg-bar is-${facing.toLowerCase()}`}
          x={magnetX + 40}
          y={72}
          width={40}
          height={20}
          rx={3}
        />
        <text class="mg-bar-name" x={magnetX + 20} y={87} text-anchor="middle">
          {back}
        </text>
        <text class="mg-bar-name" x={magnetX + 60} y={87} text-anchor="middle">
          {facing}
        </text>
      </g>
      {s.kick !== 0 && (
        <Arrow
          key={s.flicks}
          cls="mg-motion"
          x1={moverX}
          y1={46}
          x2={
            moverX +
            ((s.mover === Mover.Magnet ? 1 : -1) * (s.kick * (facing === "N" ? 1 : -1)) > 0
              ? 36
              : -36)
          }
          y2={46}
          head={7}
        />
      )}
      <g data-part="galvanometer">
        <Galvanometer x={160} y={160} swing={s.kick * 0.8} isMomentary flicks={s.flicks} />
      </g>
      <text class="mg-caption" x={W / 2} y={H - 6} text-anchor="middle">
        {say(locale, s.kick > 0 ? WORDS.kickRight : s.kick < 0 ? WORDS.kickLeft : WORDS.still)}
      </text>
    </g>
  );
}

function TwoCoilsMode({ s, locale }: { s: InductionState; locale: string }): JSX.Element {
  return (
    <g>
      <rect class="mg-roll" x={40} y={58} width={240} height={36} rx={6} />
      <g data-part="coil">
        <Coil x0={52} x1={150} y={76} r={22} turns={11} cls="is-primary" />
        <Coil x0={186} x1={268} y={76} r={22} turns={6} cls="is-secondary" />
        <text class="mg-small" x={100} y={44} text-anchor="middle">
          {say(locale, WORDS.coil1)}
        </text>
        <text class="mg-small" x={227} y={44} text-anchor="middle">
          {say(locale, WORDS.coil2)}
        </text>
      </g>
      <path class={s.isClosed ? "mg-lead is-live" : "mg-lead"} d="M58 98 V 160 H 74" />
      <path class={s.isClosed ? "mg-lead is-live" : "mg-lead"} d="M144 98 V 160 H 126" />
      <g class="mg-battery">
        <line x1={78} y1={150} x2={78} y2={170} />
        <line class="is-thin" x1={86} y1={154} x2={86} y2={166} />
      </g>
      <g data-part="key" class="mg-key">
        <circle cx={100} cy={160} r={3} />
        <circle cx={122} cy={160} r={3} />
        <line x1={100} y1={160} x2={122} y2={s.isClosed ? 160 : 148} />
        <line x1={86} y1={160} x2={100} y2={160} />
      </g>
      <path class="mg-lead" d="M190 98 V 162 H 204" />
      <path class="mg-lead" d="M264 98 V 162 H 252" />
      <g data-part="galvanometer">
        <Galvanometer x={228} y={162} r={22} swing={s.kick * 0.8} isMomentary flicks={s.flicks} />
      </g>
      <text class="mg-caption" x={W / 2} y={H - 6} text-anchor="middle">
        {say(
          locale,
          s.kick > 0
            ? WORDS.kickRight
            : s.kick < 0
              ? WORDS.kickLeft
              : s.isClosed
                ? WORDS.steady
                : WORDS.still,
        )}
      </text>
    </g>
  );
}

export function InductionView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as InductionState;
  const k = width / W;
  const isMagnet = s.mode === InductionMode.Magnet;
  return (
    <div class="mg-in">
      <Stage
        label={describeInduction(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "mg-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mg-bg" x={0} y={0} width={W} height={H} rx={12} />
          {isMagnet ? <MagnetMode s={s} locale={locale} /> : <TwoCoilsMode s={s} locale={locale} />}
        </g>
      </Stage>
      <div class="mg-controls" data-part="controls">
        {isMagnet ? (
          <>
            {([Place.Away, Place.Near, Place.Inside] as const).map((p) => (
              <button
                key={p}
                type="button"
                class={s.at === p ? "mg-button is-on" : "mg-button"}
                aria-pressed={s.at === p}
                onClick={() => call(InductionAction.Move, { to: p })}
              >
                {say(locale, WORDS[p])}
              </button>
            ))}
            <button type="button" class="mg-button" onClick={() => call(InductionAction.Hold, {})}>
              {say(locale, WORDS.hold)}
            </button>
            {s.canFlip && (
              <button
                type="button"
                class="mg-button"
                onClick={() => call(InductionAction.FlipMagnet, {})}
              >
                {say(locale, WORDS.flip)}
              </button>
            )}
            {s.canSetMover && (
              <button
                type="button"
                class="mg-button"
                onClick={() =>
                  call(InductionAction.SetMover, {
                    mover: s.mover === Mover.Magnet ? Mover.Coil : Mover.Magnet,
                  })
                }
              >
                {say(locale, s.mover === Mover.Magnet ? WORDS.moveCoil : WORDS.moveMagnet)}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            class={s.isClosed ? "mg-button is-on" : "mg-button is-primary"}
            aria-pressed={s.isClosed}
            onClick={() => call(InductionAction.SetKey, { isClosed: !s.isClosed })}
          >
            {say(locale, s.isClosed ? WORDS.open : WORDS.close)}
          </button>
        )}
      </div>
    </div>
  );
}
