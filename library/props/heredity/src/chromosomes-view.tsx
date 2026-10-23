import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ShuffleAction,
  ShuffleMode,
  ShufflePart,
  type ShuffleState,
  ShuffleStep,
  Sperm,
  childSexOf,
  describeShuffle,
  germPicks,
} from "./chromosomes";
import { type Words, say } from "./draw";

const W = 320;
const LENGTHS = [26, 20, 15, 11] as const;

const WORDS = {
  mother: { en: "mother", hi: "माँ" },
  father: { en: "father", hi: "पिता" },
  egg: { en: "egg", hi: "अंड" },
  sperm: { en: "sperm", hi: "शुक्राणु" },
  child: { en: "new cell", hi: "नई कोशिका" },
  girl: { en: "girl", hi: "लड़की" },
  boy: { en: "boy", hi: "लड़का" },
  girls: { en: "girls", hi: "लड़कियाँ" },
  boys: { en: "boys", hi: "लड़के" },
  next: { en: "next →", hi: "आगे →" },
  shuffle: { en: "New germ cells", hi: "नई जनन कोशिकाएँ" },
  xSperm: { en: "X sperm", hi: "X शुक्राणु" },
  ySperm: { en: "Y sperm", hi: "Y शुक्राणु" },
  again: { en: "Start again", hi: "फिर से" },
  pairs: { en: "22 pairs like this", hi: "ऐसे 22 जोड़े" },
} as const satisfies Record<string, Words>;

const growWords = (n: number): Words => ({ en: `Count ${n} babies`, hi: `${n} शिशु गिनो` });

/** Which parent a chromosome came from, and which of that parent's own two copies. */
type Origin = "mom-a" | "mom-b" | "dad-a" | "dad-b";
type Chromo = { len: number; origin: Origin; label?: string };

/** One chromosome: a rounded rod with a pinch at its middle, centred at (x, y). */
function Rod({ x, y, c }: { x: number; y: number; c: Chromo }): JSX.Element {
  return (
    <g class={`hx-rod hx-${c.origin}`}>
      <rect x={x - 3} y={y - c.len / 2} width={6} height={c.len} rx={3} />
      <line class="hx-pinch" x1={x - 3.5} y1={y} x2={x + 3.5} y2={y} />
      {c.label !== undefined && (
        <text class="hx-rod-label" x={x} y={y + c.len / 2 + 9} text-anchor="middle">
          {c.label}
        </text>
      )}
    </g>
  );
}

/** A row of chromosomes, paired ones drawn close together, centred at (x, y). */
function Rods({
  x,
  y,
  groups,
  spread = 8,
}: { x: number; y: number; groups: Chromo[][]; spread?: number }): JSX.Element {
  const pairW = 15;
  const gap = 7;
  const widths = groups.map((g) => g.length * spread - 2);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (groups.length - 1);
  let left = x - total / 2;
  return (
    <g>
      {groups.map((g, i) => {
        const start = left;
        left += (widths[i] ?? pairW) + gap;
        return (
          <g key={`g${start.toFixed(1)}`}>
            {g.map((c, j) => (
              <Rod key={`${start.toFixed(1)}-${j}`} x={start + 3 + j * spread} y={y} c={c} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

/** What each cell holds, from the state. */
function cellsOf(s: ShuffleState) {
  const picks = germPicks(s.seed, s.mode === ShuffleMode.Sex ? 2 : s.pairs);
  const momOf = (i: number): Origin => ((picks.egg[i] ?? 0) === 0 ? "mom-a" : "mom-b");
  const dadOf = (i: number): Origin => ((picks.sperm[i] ?? 0) === 0 ? "dad-a" : "dad-b");
  if (s.mode === ShuffleMode.Sex) {
    const auto = LENGTHS[0];
    const mother: Chromo[][] = [
      [
        { len: auto, origin: "mom-a" },
        { len: auto, origin: "mom-b" },
      ],
      [
        { len: 22, origin: "mom-a", label: "X" },
        { len: 22, origin: "mom-b", label: "X" },
      ],
    ];
    const father: Chromo[][] = [
      [
        { len: auto, origin: "dad-a" },
        { len: auto, origin: "dad-b" },
      ],
      [
        { len: 22, origin: "dad-a", label: "X" },
        { len: 11, origin: "dad-b", label: "Y" },
      ],
    ];
    const egg: Chromo[][] = [
      [{ len: auto, origin: momOf(0) }],
      [{ len: 22, origin: momOf(1), label: "X" }],
    ];
    const spermX: Chromo[][] = [
      [{ len: auto, origin: dadOf(0) }],
      [{ len: 22, origin: "dad-a", label: "X" }],
    ];
    const spermY: Chromo[][] = [
      [{ len: auto, origin: dadOf(0) }],
      [{ len: 11, origin: "dad-b", label: "Y" }],
    ];
    const fromDad = s.sperm === Sperm.Y ? spermY : spermX;
    const child: Chromo[][] = [
      [egg[0]?.[0] as Chromo, fromDad[0]?.[0] as Chromo],
      [egg[1]?.[0] as Chromo, fromDad[1]?.[0] as Chromo],
    ];
    return { mother, father, egg, sperm: [spermX, spermY], child };
  }
  const lens = LENGTHS.slice(0, s.pairs);
  const mother = lens.map((len): Chromo[] => [
    { len, origin: "mom-a" },
    { len, origin: "mom-b" },
  ]);
  const father = lens.map((len): Chromo[] => [
    { len, origin: "dad-a" },
    { len, origin: "dad-b" },
  ]);
  const egg = lens.map((len, i): Chromo[] => [{ len, origin: momOf(i) }]);
  const sperm = lens.map((len, i): Chromo[] => [{ len, origin: dadOf(i) }]);
  const child = lens.map((len, i): Chromo[] => [
    { len, origin: momOf(i) },
    { len, origin: dadOf(i) },
  ]);
  return { mother, father, egg, sperm: [sperm], child };
}

function SpermShape({ x, y, children }: { x: number; y: number; children?: JSX.Element }) {
  return (
    <g class="hx-sperm">
      <path class="hx-tail" d={`M${x + 18} ${y} q 10 -6 18 0 q 8 6 16 0`} />
      <ellipse cx={x} cy={y} rx={20} ry={15} />
      {children}
    </g>
  );
}

/** Parents' cells, germ cells, fertilisation and the new cell, with buttons to step through. */
export function ChromosomeShuffleView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ShuffleState;
  const k = width / W;
  const isSex = s.mode === ShuffleMode.Sex;
  const h = 270 + (s.babies !== null ? 46 : 0);
  const height = Math.round(h * k);
  const cells = cellsOf(s);
  const sex = childSexOf(s);
  const step = s.step;
  const button = (words: Words, action: string, part: string, args = {}) => (
    <button type="button" class="hx-button" data-part={part} onClick={() => call(action, args)}>
      {say(locale, words)}
    </button>
  );
  const girls = s.babies?.girls ?? 0;
  const boys = s.babies?.boys ?? 0;
  return (
    <div class="hx">
      <Stage
        label={describeShuffle(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "hx-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="hx-bg" x={0} y={0} width={W} height={h} rx={10} />
          {/* the parents' body cells */}
          <g data-part={ShufflePart.Mother}>
            <circle class="hx-cell hx-cell-mom" cx={78} cy={54} r={44} />
            <Rods spread={isSex ? 12 : 8} x={78} y={52} groups={cells.mother} />
            <text class="hx-name" x={78} y={112} text-anchor="middle">
              {say(locale, WORDS.mother)}
            </text>
          </g>
          <g data-part={ShufflePart.Father}>
            <circle class="hx-cell hx-cell-dad" cx={242} cy={54} r={44} />
            <Rods spread={isSex ? 12 : 8} x={242} y={52} groups={cells.father} />
            <text class="hx-name" x={242} y={112} text-anchor="middle">
              {say(locale, WORDS.father)}
            </text>
          </g>
          {isSex && (
            <text class="hx-note" x={160} y={16} text-anchor="middle">
              {say(locale, WORDS.pairs)}
            </text>
          )}
          {/* germ cells */}
          {step >= ShuffleStep.GermCells && (
            <g>
              <path class="hx-arrow" d="M78 118 L78 132" />
              <path class="hx-arrow" d="M242 118 L242 132" />
              <g data-part={ShufflePart.Egg}>
                <circle class="hx-egg" cx={78} cy={160} r={24} />
                <Rods spread={isSex ? 12 : 8} x={78} y={158} groups={cells.egg} />
                <text class="hx-name" x={78} y={198} text-anchor="middle">
                  {say(locale, WORDS.egg)}
                </text>
              </g>
              <g data-part={ShufflePart.Sperm}>
                {cells.sperm.length === 2 ? (
                  <g>
                    <SpermShape x={214} y={152}>
                      <Rods spread={isSex ? 12 : 8} x={214} y={150} groups={cells.sperm[0] ?? []} />
                    </SpermShape>
                    <SpermShape x={214} y={186}>
                      <Rods spread={isSex ? 12 : 8} x={214} y={184} groups={cells.sperm[1] ?? []} />
                    </SpermShape>
                  </g>
                ) : (
                  <SpermShape x={232} y={160}>
                    <Rods spread={isSex ? 12 : 8} x={232} y={158} groups={cells.sperm[0] ?? []} />
                  </SpermShape>
                )}
                <text
                  class="hx-name"
                  x={cells.sperm.length === 2 ? 268 : 242}
                  y={cells.sperm.length === 2 ? 212 : 198}
                  text-anchor="middle"
                >
                  {say(locale, WORDS.sperm)}
                </text>
              </g>
            </g>
          )}
          {/* fertilisation, then the new cell */}
          {step === ShuffleStep.Fusion && (
            <g>
              <path class="hx-arrow" d="M100 176 L136 222" />
              <path
                class="hx-arrow"
                d={`M${cells.sperm.length === 2 ? 196 : 212} ${isSex && s.sperm === Sperm.X ? 160 : 180} L184 222`}
              />
              <circle class="hx-egg" cx={160} cy={238} r={22} />
              <ellipse class="hx-sperm-head" cx={178} cy={224} rx={7} ry={5} />
            </g>
          )}
          {step >= ShuffleStep.Zygote && (
            <g data-part={ShufflePart.Zygote}>
              <path class="hx-arrow" d="M100 176 L128 206" />
              <path class="hx-arrow" d="M214 202 L192 210" />
              <circle class="hx-cell hx-cell-child" cx={160} cy={232} r={32} />
              <Rods spread={isSex ? 12 : 8} x={160} y={230} groups={cells.child} />
              <text class="hx-name" x={198} y={236}>
                {sex === null
                  ? say(locale, WORDS.child)
                  : `${say(locale, sex === "girl" ? WORDS.girl : WORDS.boy)} (${s.sperm === Sperm.X ? "XX" : "XY"})`}
              </text>
            </g>
          )}
          {/* babies counted */}
          {s.babies !== null && (
            <g data-part={ShufflePart.Babies}>
              <rect
                class="hx-girls"
                x={20}
                y={276}
                width={(280 * girls) / Math.max(1, girls + boys)}
                height={16}
                rx={4}
              />
              <rect
                class="hx-boys"
                x={20 + (280 * girls) / Math.max(1, girls + boys)}
                y={276}
                width={(280 * boys) / Math.max(1, girls + boys)}
                height={16}
                rx={4}
              />
              <text class="hx-note" x={20} y={306}>
                {`${girls} ${say(locale, WORDS.girls)}`}
              </text>
              <text class="hx-note" x={300} y={306} text-anchor="end">
                {`${boys} ${say(locale, WORDS.boys)}`}
              </text>
            </g>
          )}
        </g>
      </Stage>
      <div class="hx-controls" data-part={ShufflePart.Controls}>
        {s.canPickSperm && isSex && step === ShuffleStep.GermCells && (
          <>
            {button(WORDS.xSperm, ShuffleAction.PickSperm, "pick-x", { sperm: Sperm.X })}
            {button(WORDS.ySperm, ShuffleAction.PickSperm, "pick-y", { sperm: Sperm.Y })}
          </>
        )}
        {s.canShuffle &&
          !isSex &&
          step >= ShuffleStep.GermCells &&
          button(WORDS.shuffle, ShuffleAction.Shuffle, "shuffle")}
        {s.canGrow && isSex && button(growWords(s.growCount), ShuffleAction.Grow, "grow")}
        {s.canStep &&
          (step === ShuffleStep.Zygote
            ? button(WORDS.again, ShuffleAction.Reset, ShufflePart.Next)
            : button(WORDS.next, ShuffleAction.Next, ShufflePart.Next))}
      </div>
    </div>
  );
}
