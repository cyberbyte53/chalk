import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BeetleAction,
  BeetleColour,
  BeetleMode,
  BeetlePart,
  type BeetleState,
  COLOURS,
  type Counts,
  Food,
  canInterbreed,
  describeBeetles,
  totalOf,
} from "./beetles";
import { type Words, say } from "./draw";

const W = 320;

const WORDS = {
  generation: { en: "generation", hi: "पीढ़ी" },
  next: { en: "Next generation", hi: "अगली पीढ़ी" },
  elephant: { en: "An elephant comes", hi: "हाथी आया" },
  scarce: { en: "Food runs short", hi: "भोजन कम" },
  plenty: { en: "Food is back", hi: "भोजन फिर भरपूर" },
  green: { en: "A green beetle is born", hi: "एक हरा भृंग पैदा हुआ" },
  blue: { en: "A blue beetle is born", hi: "एक नीला भृंग पैदा हुआ" },
  crowsOn: { en: "Crows come", hi: "कौए आए" },
  crowsOff: { en: "Crows leave", hi: "कौए गए" },
  river: { en: "A river splits the hills", hi: "नदी पहाड़ियों को बाँट दे" },
  noRiver: { en: "No river", hi: "नदी नहीं" },
  again: { en: "Start again", hi: "फिर से" },
  red: { en: "red", hi: "लाल" },
  greenName: { en: "green", hi: "हरे" },
  blueName: { en: "blue", hi: "नीले" },
  small: { en: "food is short: the beetles are small", hi: "भोजन कम: भृंग छोटे हैं" },
  eagles: { en: "eagles, no crows", hi: "बाज़, कौए नहीं" },
  crows: { en: "crows", hi: "कौए" },
  apart: { en: "can no longer interbreed: two species", hi: "अब आपस में प्रजनन नहीं: दो प्रजातियाँ" },
  apartFor: { en: "generations apart", hi: "पीढ़ियों से अलग" },
} as const satisfies Record<string, Words>;

const NAMES: Readonly<Record<BeetleColour, Words>> = {
  red: WORDS.red,
  green: WORDS.greenName,
  blue: WORDS.blueName,
};

/** Spots in a bush for up to `n` beetles: a sunflower spiral, deterministic. */
function spots(cx: number, cy: number, rx: number, ry: number, n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt((i + 0.5) / Math.max(n, 1));
    const a = i * 2.39996;
    out.push([cx + r * rx * Math.cos(a), cy + r * ry * Math.sin(a)]);
  }
  return out;
}

/** One beetle, seen from above: a body, a head and six short legs. */
function Beetle({ x, y, colour, s }: { x: number; y: number; colour: BeetleColour; s: number }) {
  return (
    <g
      class={`hb-beetle hb-${colour}`}
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}
    >
      <path
        class="hb-legs"
        d="M-4 -2 l -3 -2 M-4 1 l -3.5 0 M-4 3 l -3 2 M4 -2 l 3 -2 M4 1 l 3.5 0 M4 3 l 3 2"
      />
      <ellipse class="hb-body" cx={0} cy={1} rx={4.6} ry={5.6} />
      <circle class="hb-head" cx={0} cy={-5.4} r={2.4} />
      <line class="hb-split" x1={0} y1={-3.6} x2={0} y2={6} />
    </g>
  );
}

/** A bush (leafy blobs) with its beetles drawn in it. */
function Bush({
  cx,
  cy,
  rx,
  ry,
  counts,
  size,
}: { cx: number; cy: number; rx: number; ry: number; counts: Counts; size: number }) {
  const list: BeetleColour[] = [];
  for (const k of COLOURS) for (let i = 0; i < counts[k]; i++) list.push(k);
  // Spread the colours through the bush, not in blocks.
  const shuffled = list.map((c, i) => ({ c, key: (i * 7919) % 101 })).sort((a, b) => a.key - b.key);
  const at = spots(cx, cy, rx * 0.82, ry * 0.75, shuffled.length);
  return (
    <g>
      <rect class="hb-trunk" x={cx - 4} y={cy + ry * 0.6} width={8} height={ry * 0.5} rx={2} />
      <ellipse class="hb-leaves" cx={cx} cy={cy} rx={rx} ry={ry} />
      <ellipse
        class="hb-leaves-2"
        cx={cx - rx * 0.45}
        cy={cy - ry * 0.3}
        rx={rx * 0.5}
        ry={ry * 0.5}
      />
      <ellipse
        class="hb-leaves-2"
        cx={cx + rx * 0.5}
        cy={cy + ry * 0.2}
        rx={rx * 0.45}
        ry={ry * 0.45}
      />
      {shuffled.map(({ c }, i) => {
        const p = at[i] ?? [cx, cy];
        return (
          <Beetle
            key={`${p[0].toFixed(1)}-${p[1].toFixed(1)}`}
            x={p[0]}
            y={p[1]}
            colour={c}
            s={size}
          />
        );
      })}
    </g>
  );
}

/** A crow in flight, simply drawn. */
function Crow({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g class="hb-crow" transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 0 q 7 -9 14 -1 q 7 -8 14 1 q -7 -2 -14 4 q -7 -6 -14 -4 z" />
      <path class="hb-beak" d="M0 1 l 3 2 l -3 1 z" />
    </g>
  );
}

function Bars({ x, y, counts, locale }: { x: number; y: number; counts: Counts; locale: string }) {
  const t = Math.max(1, totalOf(counts));
  return (
    <g data-part={BeetlePart.Bars}>
      {COLOURS.map((k, i) => (
        <g key={k}>
          <text class="hb-bar-name" x={x} y={y + i * 22 + 11}>
            {say(locale, NAMES[k])}
          </text>
          <rect class="hb-bar-bg" x={x + 40} y={y + i * 22} width={60} height={14} rx={3} />
          <rect
            class={`hb-bar hb-bar-${k}`}
            x={x + 40}
            y={y + i * 22}
            width={(60 * counts[k]) / t}
            height={14}
            rx={3}
          />
          <text class="hb-bar-count" x={x + 106} y={y + i * 22 + 11}>
            {counts[k]}
          </text>
        </g>
      ))}
    </g>
  );
}

/** The bush (or two hills) and its beetles, with buttons for what happens next. */
export function BeetlePopulationView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BeetleState;
  const k = width / W;
  const isSpec = s.mode === BeetleMode.Speciation;
  const H = isSpec ? 200 : 180;
  const height = Math.round(H * k);
  const size = s.food === Food.Scarce ? 0.62 : 1;
  const button = (words: Words, action: string, part: string, args = {}) => (
    <button type="button" class="hb-button" data-part={part} onClick={() => call(action, args)}>
      {say(locale, words)}
    </button>
  );
  return (
    <div class="hb">
      <Stage
        label={describeBeetles(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "hb-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="hb-sky" x={0} y={0} width={W} height={H} rx={10} />
          <text class="hb-generation" x={12} y={20}>
            {`${say(locale, WORDS.generation)} ${s.generation}`}
          </text>
          {isSpec ? (
            <g>
              <path class="hb-hill" d={`M0 ${H} L0 120 Q 70 70 168 126 L168 ${H} Z`} />
              <path class="hb-hill" d={`M152 ${H} L152 126 Q 250 70 320 120 L320 ${H} Z`} />
              <path
                class={s.isSplit ? "hb-river" : "hb-path"}
                data-part={BeetlePart.River}
                d={
                  s.isSplit
                    ? `M152 ${H} C 150 160 172 140 162 110 L168 110 C 178 140 160 160 168 ${H} Z`
                    : "M140 150 Q 160 136 180 150"
                }
              />
              {!s.isSplit && (
                <text class="hb-note" x={160} y={166} text-anchor="middle">
                  ⇄
                </text>
              )}
              <g data-part={BeetlePart.Left}>
                <Bush cx={74} cy={104} rx={50} ry={36} counts={s.beetles} size={size * 0.85} />
                <text class="hb-note" x={74} y={162} text-anchor="middle">
                  {say(locale, WORDS.eagles)}
                </text>
              </g>
              <g data-part={BeetlePart.Right}>
                <Bush cx={246} cy={104} rx={50} ry={36} counts={s.right} size={size * 0.85} />
                <Crow x={276} y={44} s={0.8} />
                <text class="hb-note" x={246} y={162} text-anchor="middle">
                  {say(locale, WORDS.crows)}
                </text>
              </g>
              <text class="hb-note" x={160} y={H - 14} text-anchor="middle">
                {s.isSplit && canInterbreed(s)
                  ? `${s.generationsApart} ${say(locale, WORDS.apartFor)}`
                  : ""}
              </text>
              {!canInterbreed(s) && (
                <rect class="hb-banner" x={60} y={H - 28} width={200} height={20} rx={6} />
              )}
              {!canInterbreed(s) && (
                <text class="hb-banner-text" x={160} y={H - 14} text-anchor="middle">
                  {say(locale, WORDS.apart)}
                </text>
              )}
            </g>
          ) : (
            <g>
              <rect class="hb-ground" x={0} y={150} width={W} height={30} />
              <g data-part={BeetlePart.Bush}>
                <Bush cx={100} cy={96} rx={84} ry={56} counts={s.beetles} size={size} />
              </g>
              {s.hasCrows && (
                <g>
                  <Crow x={150} y={30} />
                  <Crow x={250} y={22} s={0.8} />
                </g>
              )}
              <Bars x={192} y={70} counts={s.beetles} locale={locale} />
              {s.food === Food.Scarce && (
                <text class="hb-note" x={160} y={172} text-anchor="middle">
                  {say(locale, WORDS.small)}
                </text>
              )}
            </g>
          )}
        </g>
      </Stage>
      <div class="hb-controls" data-part={BeetlePart.Controls}>
        {s.canBreed && button(WORDS.next, BeetleAction.NextGeneration, "next")}
        {s.canMutate && !isSpec && s.beetles.red > 0 && (
          <>
            {button(WORDS.green, BeetleAction.Mutate, "mutate-green", {
              colour: BeetleColour.Green,
            })}
            {button(WORDS.blue, BeetleAction.Mutate, "mutate-blue", { colour: BeetleColour.Blue })}
          </>
        )}
        {s.canElephant && !isSpec && button(WORDS.elephant, BeetleAction.Elephant, "elephant")}
        {s.canFood &&
          !isSpec &&
          (s.food === Food.Plenty
            ? button(WORDS.scarce, BeetleAction.SetFood, "food", { food: Food.Scarce })
            : button(WORDS.plenty, BeetleAction.SetFood, "food", { food: Food.Plenty }))}
        {s.canCrows &&
          !isSpec &&
          (s.hasCrows
            ? button(WORDS.crowsOff, BeetleAction.SetCrows, "crows", { on: false })
            : button(WORDS.crowsOn, BeetleAction.SetCrows, "crows", { on: true }))}
        {s.canRiver &&
          isSpec &&
          (s.isSplit
            ? button(WORDS.noRiver, BeetleAction.SetRiver, "river", { on: false })
            : button(WORDS.river, BeetleAction.SetRiver, "river", { on: true }))}
        {s.generation > 0 && button(WORDS.again, BeetleAction.Reset, "reset")}
      </div>
    </div>
  );
}
