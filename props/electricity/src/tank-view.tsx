import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { BatterySymbol, KeySymbol, MeterSymbol, ResistorSymbol } from "./draw";
import {
  MAX_LEVEL,
  PIPE_OHMS,
  Pipe,
  TankAction,
  type TankState,
  ampsOf,
  describeTank,
  flowOf,
  voltsOf,
} from "./tank";
import { type Words, num, say } from "./words";

const W = 320;
const SCENE_H = 150;
const TWIN_H = 92;
const GROUND = 142;
const TAP = { x: 252, y: 118 } as const;
const TANK = { x: 34, w: 64, h: 30 } as const;
const STEP = 27;

const WORDS = {
  raise: { en: "Raise tank", hi: "टंकी ऊपर" },
  lower: { en: "Lower tank", hi: "टंकी नीचे" },
  open: { en: "Open tap", hi: "नल खोलो" },
  shut: { en: "Shut tap", hi: "नल बंद करो" },
  wide: { en: "Wide pipe", hi: "चौड़ा पाइप" },
  narrow: { en: "Narrow pipe", hi: "पतला पाइप" },
  levelDiff1: { en: "difference", hi: "तल में" },
  levelDiff2: { en: "in level", hi: "अंतर" },
  sameLevel: { en: "same level: no flow", hi: "बराबर तल: कोई बहाव नहीं" },
  twin: { en: "its circuit twin", hi: "इसका परिपथ जुड़वाँ" },
  linkHeight: {
    en: "height difference ↔ potential difference (V)",
    hi: "ऊँचाई का अंतर ↔ विभवांतर (V)",
  },
  linkPipe: { en: "narrow pipe ↔ resistance (R)", hi: "पतला पाइप ↔ प्रतिरोध (R)" },
  linkFlow: { en: "flow of water ↔ current (I)", hi: "पानी का बहाव ↔ धारा (I)" },
  linkTap: { en: "tap ↔ key (switch)", hi: "नल ↔ कुंजी (स्विच)" },
  lpm: { en: "L/min", hi: "L/मिनट" },
} as const satisfies Record<string, Words>;

function Scene({ s, locale }: { s: TankState; locale: string }): JSX.Element {
  const bottom = TAP.y + 2 - s.level * STEP;
  const top = bottom - TANK.h;
  const pipeW = s.pipe === Pipe.Wide ? 8 : 4;
  const flow = flowOf(s);
  const outY = bottom - 5;
  const pipe = `M${TANK.x + TANK.w} ${outY} H 190 V ${TAP.y} H ${TAP.x}`;
  return (
    <g>
      <rect class="el-bg" x={0} y={0} width={W} height={SCENE_H} rx={12} />
      <rect class="el-ground" x={0} y={GROUND} width={W} height={SCENE_H - GROUND} />
      {/* the house wall the tap is on */}
      <rect class="el-wall" x={200} y={58} width={90} height={GROUND - 58} />
      {/* stand */}
      {s.level > 0 && (
        <g class="el-stand">
          <line x1={TANK.x + 8} y1={bottom} x2={TANK.x + 4} y2={GROUND} />
          <line x1={TANK.x + TANK.w - 8} y1={bottom} x2={TANK.x + TANK.w - 4} y2={GROUND} />
          <line
            x1={TANK.x + 6}
            y1={(bottom + GROUND) / 2}
            x2={TANK.x + TANK.w - 6}
            y2={(bottom + GROUND) / 2}
          />
        </g>
      )}
      <g data-part="tank">
        <rect class="el-tank" x={TANK.x} y={top} width={TANK.w} height={TANK.h} rx={4} />
        <rect
          class="el-water"
          x={TANK.x + 3}
          y={top + 8}
          width={TANK.w - 6}
          height={TANK.h - 11}
          rx={2}
        />
      </g>
      <path class="el-pipe" d={pipe} style={{ strokeWidth: `${pipeW + 3}px` }} data-part="pipe" />
      <path
        class={flow > 0 ? "el-pipe-water is-flowing" : "el-pipe-water"}
        d={pipe}
        style={{ strokeWidth: `${pipeW}px` }}
      />
      {/* the tap */}
      <g data-part="tap">
        <rect class="el-tap" x={TAP.x - 2} y={TAP.y - 6} width={16} height={12} rx={2} />
        <rect class="el-tap" x={TAP.x + 10} y={TAP.y + 4} width={6} height={8} rx={1} />
        <rect
          class={s.isOpen ? "el-tap-handle is-open" : "el-tap-handle"}
          x={TAP.x + 2}
          y={TAP.y - 13}
          width={10}
          height={4}
          rx={2}
        />
      </g>
      {flow > 0 && (
        <rect
          class="el-stream"
          x={TAP.x + 13 - flow / 12}
          y={TAP.y + 12}
          width={Math.max(1.5, flow / 6)}
          height={GROUND - 12 - (TAP.y + 12)}
        />
      )}
      <path
        class="el-bucket"
        d={`M${TAP.x + 2} ${GROUND - 14} H ${TAP.x + 26} L ${TAP.x + 23} ${GROUND} H ${TAP.x + 5} Z`}
      />
      {/* the level difference */}
      {s.level > 0 ? (
        <g class="el-dim">
          <line x1={120} y1={bottom - TANK.h / 2} x2={120} y2={TAP.y} />
          <path d={`M120 ${bottom - TANK.h / 2} l -3 6 h 6 z`} />
          <path d={`M120 ${TAP.y} l -3 -6 h 6 z`} />
          <text x={126} y={(bottom - TANK.h / 2 + TAP.y) / 2 - 2}>
            {say(locale, WORDS.levelDiff1)}
          </text>
          <text x={126} y={(bottom - TANK.h / 2 + TAP.y) / 2 + 10}>
            {say(locale, WORDS.levelDiff2)}
          </text>
        </g>
      ) : (
        <text class="el-note" x={160} y={40} text-anchor="middle">
          {say(locale, WORDS.sameLevel)}
        </text>
      )}
      {flow > 0 && (
        <text class="el-flow-text" x={TAP.x - 6} y={GROUND - 4} text-anchor="end">
          {num(flow, 1)} {say(locale, WORDS.lpm)}
        </text>
      )}
    </g>
  );
}

function Twin({ s, locale }: { s: TankState; locale: string }): JSX.Element {
  const top = 22;
  const bottom = 66;
  const on = ampsOf(s) > 0;
  return (
    <g data-part="twin">
      <rect class="el-bg" x={0} y={0} width={W} height={TWIN_H} rx={12} />
      <text class="el-label" x={12} y={TWIN_H - 8}>
        {say(locale, WORDS.twin)}
      </text>
      <line class={on ? "el-wire is-on" : "el-wire"} x1={40} y1={top} x2={40} y2={bottom} />
      <line class={on ? "el-wire is-on" : "el-wire"} x1={280} y1={top} x2={280} y2={bottom} />
      <line class={on ? "el-wire is-on" : "el-wire"} x1={40} y1={bottom} x2={148} y2={bottom} />
      <line class={on ? "el-wire is-on" : "el-wire"} x1={172} y1={bottom} x2={280} y2={bottom} />
      <line class={on ? "el-wire is-on" : "el-wire"} x1={40} y1={top} x2={60} y2={top} />
      <line class={on ? "el-wire is-on" : "el-wire"} x1={110} y1={top} x2={150} y2={top} />
      <line class={on ? "el-wire is-on" : "el-wire"} x1={190} y1={top} x2={232} y2={top} />
      <line class={on ? "el-wire is-on" : "el-wire"} x1={262} y1={top} x2={280} y2={top} />
      <g transform={`translate(85 ${top})`}>
        {s.level > 0 ? (
          <BatterySymbol n={s.level} />
        ) : (
          <line class="el-wire" x1={-25} y1={0} x2={25} y2={0} />
        )}
      </g>
      <text class="el-small" x={85} y={top + 22} text-anchor="middle">
        {num(voltsOf(s), 1)} V
      </text>
      <g transform={`translate(170 ${top})`}>
        <line class="el-wire" x1={-20} y1={0} x2={-16} y2={0} />
        <ResistorSymbol />
        <line class="el-wire" x1={16} y1={0} x2={20} y2={0} />
      </g>
      <text class="el-small" x={170} y={top + 22} text-anchor="middle">
        {PIPE_OHMS[s.pipe]} Ω
      </text>
      <g transform={`translate(247 ${top})`}>
        <KeySymbol isClosed={s.isOpen} />
      </g>
      <g transform={`translate(160 ${bottom})`}>
        <MeterSymbol letter="A" />
      </g>
      <text class="el-reading" x={160} y={bottom + 22} text-anchor="middle">
        I = {num(ampsOf(s), 2)} A
      </text>
    </g>
  );
}

export function TankView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as TankState;
  const k = width / W;
  const H = SCENE_H + (s.showTwin ? TWIN_H + 8 : 0);
  return (
    <div class="el-wt">
      <Stage
        label={describeTank(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "el-svg" }}
      >
        <g transform={`scale(${k})`}>
          <Scene s={s} locale={locale} />
          {s.showTwin && (
            <g transform={`translate(0 ${SCENE_H + 8})`}>
              <Twin s={s} locale={locale} />
            </g>
          )}
        </g>
      </Stage>
      {s.showLinks && s.showTwin && (
        <ul class="el-links">
          <li>{say(locale, WORDS.linkHeight)}</li>
          <li>{say(locale, WORDS.linkPipe)}</li>
          <li>{say(locale, WORDS.linkFlow)}</li>
          <li>{say(locale, WORDS.linkTap)}</li>
        </ul>
      )}
      {(s.canSetLevel || s.canSetPipe || s.canOpen) && (
        <div class="el-controls" data-part="controls">
          {s.canSetLevel && (
            <>
              <button
                type="button"
                class="el-button"
                disabled={s.level <= 0}
                onClick={() => call(TankAction.SetLevel, { level: s.level - 1 })}
              >
                {say(locale, WORDS.lower)}
              </button>
              <button
                type="button"
                class="el-button"
                disabled={s.level >= MAX_LEVEL}
                onClick={() => call(TankAction.SetLevel, { level: s.level + 1 })}
              >
                {say(locale, WORDS.raise)}
              </button>
            </>
          )}
          {s.canSetPipe && (
            <button
              type="button"
              class="el-button"
              onClick={() =>
                call(TankAction.SetPipe, { pipe: s.pipe === Pipe.Wide ? Pipe.Narrow : Pipe.Wide })
              }
            >
              {say(locale, s.pipe === Pipe.Wide ? WORDS.narrow : WORDS.wide)}
            </button>
          )}
          {s.canOpen && (
            <button
              type="button"
              class={s.isOpen ? "el-button is-on" : "el-button is-primary"}
              aria-pressed={s.isOpen}
              onClick={() => call(TankAction.SetTap, { isOpen: !s.isOpen })}
            >
              {say(locale, s.isOpen ? WORDS.shut : WORDS.open)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
