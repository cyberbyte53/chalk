import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./draw";
import {
  FORM_STEPS,
  FossilAction,
  FossilMode,
  FossilPart,
  type FossilState,
  LAYERS,
  describeFossils,
} from "./fossils";

const W = 320;
const H = 200;
const TOP = 34;
const BAND = 52;

const WORDS = {
  dig: { en: "Dig deeper", hi: "और गहरा खोदो" },
  again: { en: "Fill it in", hi: "फिर से भरो" },
  next: { en: "next →", hi: "आगे →" },
  older: { en: "deeper = older", hi: "जितना गहरा, उतना पुराना" },
  ago: { en: "million years ago", hi: "करोड़ वर्ष पहले" },
  today: { en: "today", hi: "आज" },
} as const satisfies Record<string, Words>;

const FORM_CAPTION: readonly Words[] = [
  { en: "100 million years ago: shells buried in sand", hi: "10 करोड़ वर्ष पहले: रेत में दबे सीप" },
  { en: "Later: a dinosaur buried in mud above", hi: "बाद में: ऊपर कीचड़ में दबा डायनासोर" },
  { en: "Later still: horse-like animals above that", hi: "और बाद में: उसके ऊपर घोड़े जैसे जीव" },
  { en: "Today: water wears the rock away", hi: "आज: पानी चट्टान को घिस देता है" },
];

/** Ages shown in the reader's language: Hindi counts in crores (1 crore = 10 million). */
function ageWords(locale: string, millions: number): string {
  return locale === "hi" ? `≈ ${millions / 10} ${WORDS.ago.hi}` : `≈ ${millions} ${WORDS.ago.en}`;
}

function HorseFossil({ x, y }: { x: number; y: number }) {
  return (
    <g class="hf-bone" transform={`translate(${x} ${y})`}>
      <path d="M-26 -6 Q 0 -12 22 -6" fill="none" />
      {[-18, -12, -6, 0, 6, 12].map((rx) => (
        <path key={rx} d={`M${rx} -8 q 2 6 0 10`} fill="none" />
      ))}
      <path d="M-22 -5 l -4 14 M-16 -5 l 2 14 M14 -6 l -2 15 M20 -6 l 4 14" fill="none" />
      <path d="M22 -6 l 6 -6 l 10 2 l -2 5 l -10 1 z" />
    </g>
  );
}

function DinoSkull({ x, y }: { x: number; y: number }) {
  return (
    <g class="hf-bone" transform={`translate(${x} ${y})`}>
      <path d="M-30 -2 Q -22 -18 4 -16 Q 26 -14 32 -4 L 30 2 Q 0 6 -30 4 Z" />
      <circle class="hf-hole" cx={-14} cy={-8} r={4} />
      <path
        class="hf-teeth"
        d="M-24 4 l 2 4 l 2 -4 l 2 4 l 2 -4 l 2 4 l 2 -4 l 2 4 l 2 -4 l 2 4 l 2 -4 l 2 4 l 2 -4"
        fill="none"
      />
    </g>
  );
}

function Shells({ x, y }: { x: number; y: number }) {
  return (
    <g class="hf-bone" transform={`translate(${x} ${y})`}>
      {[-30, 0, 28].map((dx, i) => (
        <g key={dx} transform={`translate(${dx} ${i === 1 ? -4 : 2})`}>
          <circle r={8} fill="none" />
          <path d="M0 0 m 0 -5 a 5 5 0 1 1 -4 2 a 3 3 0 1 1 3 -1" fill="none" />
        </g>
      ))}
      <path d="M14 8 q 6 -6 12 0 l -1 3 q -5 -3 -10 0 z" />
    </g>
  );
}

const FOSSIL = [HorseFossil, DinoSkull, Shells] as const;

function DigSection({ s, locale }: { s: FossilState; locale: string }) {
  return (
    <g data-part={FossilPart.Section}>
      <rect class="hf-sky" x={0} y={0} width={W} height={TOP} />
      <rect class="hf-grass" x={0} y={TOP - 6} width={W} height={8} />
      <text class="hf-note" x={10} y={20}>
        {say(locale, WORDS.today)}
      </text>
      {LAYERS.map((layer, i) => {
        const y = TOP + i * BAND;
        const open = s.dug > i;
        const Fossil = FOSSIL[i] ?? Shells;
        return (
          <g key={layer.id}>
            <rect class={`hf-layer hf-layer-${i}`} x={0} y={y} width={W} height={BAND} />
            <line class="hf-seam" x1={0} y1={y} x2={W} y2={y} />
            {open ? (
              <g>
                <rect class="hf-hole-dug" x={70} y={y + 6} width={130} height={BAND - 12} rx={6} />
                <Fossil x={135} y={y + BAND / 2 + 2} />
                <text class="hf-age" x={212} y={y + BAND / 2 + 4}>
                  {ageWords(locale, layer.age)}
                </text>
              </g>
            ) : (
              <text class="hf-q" x={135} y={y + BAND / 2 + 5} text-anchor="middle">
                ?
              </text>
            )}
          </g>
        );
      })}
      <path class="hf-arrow" d={`M${W - 14} ${TOP + 8} L${W - 14} ${H - 10}`} />
      <path
        class="hf-arrow-head"
        d={`M${W - 19} ${H - 16} L${W - 14} ${H - 6} L${W - 9} ${H - 16} Z`}
      />
      <text class="hf-note" x={W - 8} y={20} text-anchor="end">
        {`${say(locale, WORDS.older)} ↓`}
      </text>
    </g>
  );
}

/** How the layers piled up: one more layer each step, then erosion opening the top one. */
function FormSection({ s, locale }: { s: FossilState; locale: string }) {
  const layers = Math.min(s.step + 1, 3);
  const base = H - 20;
  return (
    <g data-part={FossilPart.Section}>
      <rect class={s.step === 0 ? "hf-sea" : "hf-sky"} x={0} y={0} width={W} height={H} />
      {Array.from({ length: layers }, (_, j) => {
        // j = 0 is the oldest (sea creatures), at the bottom.
        const i = 2 - j;
        const y = base - (j + 1) * 46;
        const Fossil = FOSSIL[i] ?? Shells;
        return (
          <g key={`layer-${i}`}>
            <rect class={`hf-layer hf-layer-${i}`} x={0} y={y} width={W} height={46} />
            <line class="hf-seam" x1={0} y1={y} x2={W} y2={y} />
            <Fossil x={s.step === 3 && j === 2 ? 186 : 160} y={y + 26} />
          </g>
        );
      })}
      <rect class="hf-layer hf-layer-base" x={0} y={base} width={W} height={20} />
      {s.step === 3 && (
        <g>
          {/* the river has cut a valley into the top layer, leaving the fossils in its wall */}
          <path
            class="hf-sky"
            d={`M214 ${base - 139} Q 226 ${base - 100} 244 ${base - 94} L 300 ${base - 94} Q 316 ${base - 110} 320 ${base - 139} Z`}
          />
          <path class="hf-water" d={`M236 ${base - 94} Q 270 ${base - 104} 306 ${base - 94} Z`} />
        </g>
      )}
      <text class="hf-caption" x={W / 2} y={18} text-anchor="middle">
        {say(locale, FORM_CAPTION[s.step] ?? FORM_CAPTION[0] ?? WORDS.today)}
      </text>
    </g>
  );
}

/** A rock section to dig through, or the story of how its layers formed. */
export function FossilLayersView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as FossilState;
  const k = width / W;
  const height = Math.round(H * k);
  const isForm = s.mode === FossilMode.Form;
  const clip = `hf-frame-${useId()}`;
  return (
    <div class="hf">
      <Stage
        label={describeFossils(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "hf-svg" }}
      >
        <g transform={`scale(${k})`}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            {isForm ? <FormSection s={s} locale={locale} /> : <DigSection s={s} locale={locale} />}
          </g>
        </g>
      </Stage>
      <div class="hf-controls">
        {!isForm && s.canDig && s.dug < LAYERS.length && (
          <button
            type="button"
            class="hf-button"
            data-part={FossilPart.Next}
            onClick={() => call(FossilAction.Dig, {})}
          >
            {say(locale, WORDS.dig)}
          </button>
        )}
        {!isForm && s.dug > 0 && (
          <button
            type="button"
            class="hf-button"
            data-part="reset"
            onClick={() => call(FossilAction.Reset, {})}
          >
            {say(locale, WORDS.again)}
          </button>
        )}
        {isForm && s.canStep && (
          <button
            type="button"
            class="hf-button"
            data-part={FossilPart.Next}
            onClick={() => call(FossilAction.Next, {})}
          >
            {`${say(locale, WORDS.next)} ${s.step + 1}/${FORM_STEPS}`}
          </button>
        )}
      </div>
    </div>
  );
}
