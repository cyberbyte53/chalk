import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Dots, Frame, Label, Person, Stepper, type Words, say } from "./draw";
import {
  FORMATION_STEPS,
  MAX_CFC,
  OzoneAction,
  OzoneMode,
  OzonePart,
  type OzoneState,
  UV_RAYS,
  describeOzone,
  ozoneShareOf,
  uvThroughOf,
} from "./ozone";

const W = 320;
const H = 200;

const WORDS = {
  uv: { en: "UV from the Sun", hi: "सूर्य से पराबैंगनी (UV)" },
  o2: { en: "oxygen, O₂", hi: "ऑक्सीजन, O₂" },
  o: { en: "free O atoms", hi: "मुक्त O परमाणु" },
  o3: { en: "ozone, O₃", hi: "ओज़ोन, O₃" },
  layer: { en: "ozone layer", hi: "ओज़ोन परत" },
  ground: { en: "Earth", hi: "पृथ्वी" },
  cfc: { en: "CFCs", hi: "CFC" },
  next: { en: "Next →", hi: "आगे →" },
  again: { en: "Start again", hi: "फिर से" },
  through: { en: "UV reaching the ground:", hi: "ज़मीन तक पहुँचती UV:" },
  stopped: { en: "UV stopped", hi: "UV रुक गई" },
} as const satisfies Record<string, Words>;

/** A wavy UV ray from (x, y1) down to y2. */
function UvRay({ x, y1, y2, cls = "" }: { x: number; y1: number; y2: number; cls?: string }) {
  const n = Math.max(1, Math.round((y2 - y1) / 10));
  const step = (y2 - y1) / n;
  let d = `M${x} ${y1}`;
  for (let i = 0; i < n; i++) d += ` q ${i % 2 === 0 ? 5 : -5} ${step / 2} 0 ${step}`;
  return (
    <g class={`ev-uv ${cls}`}>
      <path d={d} />
      <path class="ev-uv-head" d={`M${x - 4} ${y2 - 5} L${x} ${y2 + 1} L${x + 4} ${y2 - 5} Z`} />
    </g>
  );
}

function Atom({ x, y, cls = "" }: { x: number; y: number; cls?: string }) {
  return (
    <g class={`ev-atom ${cls}`}>
      <circle cx={x} cy={y} r={7} />
      <text x={x} y={y + 3.5} text-anchor="middle">
        O
      </text>
    </g>
  );
}

function O2({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Atom x={x - 6} y={y} />
      <Atom x={x + 6} y={y} />
    </g>
  );
}

function O3({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Atom x={x - 6} y={y + 4} cls="is-ozone" />
      <Atom x={x + 6} y={y + 4} cls="is-ozone" />
      <Atom x={x} y={y - 6} cls="is-ozone" />
    </g>
  );
}

function Formation({ s, locale }: { s: OzoneState; locale: string }) {
  return (
    <g class="is-night">
      <rect class="ev-oz-high" x={0} y={0} width={W} height={H} />
      <circle class="ev-oz-sun" cx={26} cy={24} r={14} />
      <Label x={46} y={20} text={say(locale, WORDS.uv)} cls="is-dim" />
      <UvRay x={70} y1={30} y2={s.step === 0 ? 92 : 100} />
      <UvRay x={150} y1={30} y2={s.step === 0 ? 92 : 100} />
      {s.step === 0 && (
        <g>
          <O2 x={70} y={120} />
          <O2 x={150} y={120} />
          <O2 x={230} y={110} />
          <O2 x={270} y={150} />
          <Label x={230} y={92} text={say(locale, WORDS.o2)} anchor="middle" />
        </g>
      )}
      {s.step === 1 && (
        <g>
          <Atom x={56} y={120} cls="is-free" />
          <Atom x={86} y={128} cls="is-free" />
          <Atom x={136} y={120} cls="is-free" />
          <Atom x={166} y={128} cls="is-free" />
          <O2 x={230} y={110} />
          <O2 x={270} y={150} />
          <Label x={110} y={150} text={say(locale, WORDS.o)} anchor="middle" />
          <Label x={250} y={92} text={say(locale, WORDS.o2)} anchor="middle" />
        </g>
      )}
      {s.step === 2 && (
        <g>
          <O3 x={110} y={120} />
          <O3 x={240} y={124} />
          <Label x={175} y={96} text={say(locale, WORDS.o3)} anchor="middle" cls="is-big" />
        </g>
      )}
      {s.showEquation && s.step > 0 && (
        <g>
          <rect class="ev-oz-eq" x={60} y={164} width={200} height={26} rx={6} />
          <text class="ev-oz-eq-text" x={160} y={182} text-anchor="middle">
            {s.step === 1 ? "O₂  —UV→  O + O" : "O + O₂  →  O₃"}
          </text>
        </g>
      )}
    </g>
  );
}

function Shield({ s, locale }: { s: OzoneState; locale: string }) {
  const share = ozoneShareOf(s.cfc);
  const through = uvThroughOf(s.cfc);
  const bandY = 52;
  const bandH = 26 * share;
  const rays = Array.from({ length: UV_RAYS }, (_, i) => 40 + i * 56);
  /** The rays that get through go where the holes are: the middle rays first. */
  const order = [2, 1, 3, 0, 4];
  const passes = new Set(order.slice(0, through));
  return (
    <g>
      <rect class="ev-oz-sky" x={0} y={0} width={W} height={H} />
      <circle class="ev-oz-sun" cx={300} cy={14} r={12} />
      {/* the layer, with gaps over the rays that get through */}
      <g data-part={OzonePart.Sky}>
        <rect class="ev-oz-band" x={0} y={bandY} width={W} height={bandH} rx={4} />
        {[...passes].map((i) => (
          <rect
            key={i}
            class="ev-oz-hole"
            x={(rays[i] as number) - 14}
            y={bandY - 1}
            width={28}
            height={bandH + 2}
            rx={8}
          />
        ))}
        {s.showNames && (
          <Label x={312} y={bandY + bandH + 12} text={say(locale, WORDS.layer)} anchor="end" />
        )}
      </g>
      {rays.map((x, i) => (
        <UvRay
          key={x}
          x={x}
          y1={6}
          y2={passes.has(i) ? 156 : bandY - 2}
          cls={passes.has(i) ? "is-through" : ""}
        />
      ))}
      <rect class="ev-oz-ground" x={0} y={160} width={W} height={40} />
      <Person who="kabir" x={160} y={186} s={0.9} />
      {s.showNames && <Label x={8} y={194} text={say(locale, WORDS.ground)} cls="is-dim" />}
      {s.cfc > 0 && (
        <g class="ev-oz-cfc">
          <rect x={262} y={150} width={22} height={34} rx={3} />
          <line x1={262} y1={164} x2={284} y2={164} />
          {[140, 128, 116, 104, 92, 80].slice(0, s.cfc * 2).map((cy, k) => (
            <circle key={cy} class="ev-oz-puff" cx={272 + (k % 2 === 0 ? -6 : 6)} cy={cy} r={3.5} />
          ))}
          <Label x={290} y={160} text={say(locale, WORDS.cfc)} />
        </g>
      )}
      <Label
        x={312}
        y={196}
        text={
          through === 0
            ? say(locale, WORDS.stopped)
            : `${say(locale, WORDS.through)} ${through}/${UV_RAYS}`
        }
        anchor="end"
        cls={through === 0 ? "is-good" : "is-bad"}
      />
    </g>
  );
}

export function OzoneLayerView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as OzoneState;
  const isFormation = s.mode === OzoneMode.Formation;
  return (
    <div class="ev ev-oz">
      <Frame w={W} h={H} width={width} label={describeOzone(s)} cls="ev-oz-svg">
        {isFormation ? <Formation s={s} locale={locale} /> : <Shield s={s} locale={locale} />}
      </Frame>
      <Controls>
        {isFormation && s.canStep && (
          <span class="ev-row" data-part={OzonePart.Next}>
            <Dots step={s.step} count={FORMATION_STEPS} />
            {s.step < FORMATION_STEPS - 1 ? (
              <Button label={say(locale, WORDS.next)} onClick={() => call(OzoneAction.Next, {})} />
            ) : (
              <Button
                label={say(locale, WORDS.again)}
                onClick={() => call(OzoneAction.Reset, {})}
              />
            )}
          </span>
        )}
        {!isFormation && s.canSetCfc && (
          <span data-part={OzonePart.Cfc}>
            <Stepper
              label={say(locale, WORDS.cfc)}
              value={s.cfc}
              max={MAX_CFC}
              onSet={(level) => call(OzoneAction.SetCfc, { level })}
            />
          </span>
        )}
      </Controls>
    </div>
  );
}
