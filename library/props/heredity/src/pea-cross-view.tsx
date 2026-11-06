import type { Locale } from "@chalk/content";
import { Stage, SymbolButton } from "@chalk/draw";
import type { PropView, PropViewProps } from "@chalk/player";
import { does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { Gene, type Genes, genesWord, growthOf, isTallOf, peaCross } from "./pea-cross";
import { WORDS, generationName, ratioWords, word } from "./words";

type View = PropView<typeof peaCross>;
const actions = peaCross.actions;

// The garden is drawn in a box 360 wide (the stage scales it to the column).
const W = 360;
const H = 404;
/** The parents stand on this line; the first at P1, the second at P2. */
const PARENT_BASE = 104;
const P1 = 66;
const P2 = 236;
/** The Punnett square: its boxes, the first parent's copies down its side, the second's along the top. */
const GRID_X = 78;
const GRID_Y = 168;
const CELL_W = 136;
const CELL_H = 100;
/** In a box: where its soil line is, from the box's top. */
const CELL_BASE = 76;
/** Where the copies each parent gives are drawn: down the side (first), along the top (second). */
const SIDE_X = 46;
const TOP_Y = 152;
const BEAD_R = 8;
/** How far apart a plant's two beads are. */
const BEAD_GAP = 9.5;
/** A child's growth: its two copies fly in for the first part, then it grows from the soil. */
const FLY = 0.35;

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, f: number) => a + (b - a) * f;

/** Where box k's plant stands: the middle of its soil line. */
function cellBase(k: number): { x: number; y: number } {
  const col = k % 2;
  const row = Math.floor(k / 2);
  return { x: GRID_X + CELL_W * (col + 0.5), y: GRID_Y + CELL_H * row + CELL_BASE };
}
/** Where the copy a parent gives is drawn: the first parent's i-th down the side, the second's along the top. */
const sideAt = (i: number) => ({ x: SIDE_X, y: GRID_Y + CELL_H * (i + 0.5) });
const topAt = (j: number) => ({ x: GRID_X + CELL_W * (j + 0.5), y: TOP_Y });

/**
 * A pea plant standing on the soil at the origin, grown `g` of the way (0 nothing yet, 1 in
 * flower): tall or short. Its stem rises, its leaflets open as the stem passes them, its flower last.
 */
function PeaPlant({ isTall, g }: { isTall: boolean; g: number }): JSX.Element | null {
  if (g <= 0) return null;
  const full = isTall ? 58 : 28;
  const h = full * smooth(g);
  const leaves = isTall ? [0.22, 0.44, 0.66, 0.86] : [0.3, 0.7];
  const bloom = clamp((g - 0.78) / 0.22);
  return (
    <g class="pc-plant">
      <path class="pc-stem" d={`M0 0 C -3 ${-h * 0.35} 3 ${-h * 0.65} 0 ${-h}`} />
      {leaves.map((f, i) => {
        const open = clamp((h - f * full) / 7);
        if (open <= 0) return null;
        const side = i % 2 === 0 ? 1 : -1;
        const y = -f * full;
        const size = isTall ? 1 : 1.15;
        return (
          <g key={f} transform={`translate(0 ${y}) scale(${side * open * size} ${open * size})`}>
            <path class="pc-leaf" d="M0 0 q 6 -9 15 -6 q -3 9 -15 6 Z" />
            <path class="pc-leaf is-back" d="M0 0 q -5 -7 -12 -4 q 3 7 12 4 Z" />
          </g>
        );
      })}
      {isTall && bloom > 0 && (
        <path class="pc-tendril" d={`M0 ${-h * 0.9} q 7 -3 8 -9 q 1 -5 -3 -4`} opacity={bloom} />
      )}
      {bloom > 0 && (
        <g transform={`translate(0 ${-h - 2}) scale(${bloom})`}>
          <path class="pc-petal" d="M0 2 C -9 0 -9 -11 0 -11 C 9 -11 9 0 0 2 Z" />
          <path class="pc-petal is-wing" d="M0 3 C -5 1 -6 -5 -1 -5 Z M0 3 C 5 1 6 -5 1 -5 Z" />
          <circle class="pc-flower-heart" cx={0} cy={-2} r={1.6} />
        </g>
      )}
    </g>
  );
}

/** One copy of the gene, as a bead with its letter; a t in a tall plant is hidden (drawn faint). */
function Bead({
  gene,
  x,
  y,
  isHidden = false,
  isLit = false,
}: {
  gene: Gene;
  x: number;
  y: number;
  isHidden?: boolean;
  isLit?: boolean;
}): JSX.Element {
  const tone = gene === Gene.Tall ? "is-tall" : "is-short";
  return (
    <g
      class={`pc-bead ${tone}${isHidden ? " is-hidden" : ""}${isLit ? " is-lit" : ""}`}
      transform={`translate(${x} ${y})`}
    >
      {isLit && <circle class="pc-bead-glow" r={BEAD_R * 1.8} />}
      <circle r={BEAD_R} />
      <text y={0.5} text-anchor="middle" dominant-baseline="central">
        {gene}
      </text>
    </g>
  );
}

/** A plant's two beads, side by side under it at (x, y). */
function BeadPair({
  genes,
  x,
  y,
  opacity = 1,
}: { genes: Genes; x: number; y: number; opacity?: number }) {
  const isTall = isTallOf(genes);
  return (
    <g opacity={opacity}>
      {genes.map((gene, i) => (
        <Bead
          key={i}
          gene={gene}
          x={x + (i === 0 ? -BEAD_GAP : BEAD_GAP)}
          y={y}
          isHidden={isTall && gene === Gene.Short}
        />
      ))}
    </g>
  );
}

/** A plant with its two beads in the soil at its base. */
function Plant({
  genes,
  x,
  y,
  g,
  isGenesShown,
}: {
  genes: Genes;
  x: number;
  y: number;
  g: number;
  isGenesShown: boolean;
}) {
  return (
    <g>
      <g transform={`translate(${x} ${y})`}>
        <PeaPlant isTall={isTallOf(genes)} g={g} />
      </g>
      {isGenesShown && <BeadPair genes={genes} x={x} y={y + 11} />}
    </g>
  );
}

function looksWords(genes: Genes, locale: Locale): string {
  return `${word(isTallOf(genes) ? WORDS.tall : WORDS.short, locale)} ${genesWord(genes)}`;
}

/** The garden: the parents, the copies each gives, the Punnett square of children, the count. */
function Garden({ s, locale }: { s: View; locale: Locale }) {
  const rise = s.rising;
  const isRising = rise > 0;
  // The copies each parent gives, as they are drawn round the square.
  const [a, b] = s.parents;
  const growing = s.grown > 0 && s.grown < 4 ? Math.floor(s.grown) : -1;
  return (
    <Stage label={word(WORDS.crossOf, locale)} x={[0, W]} width={W} height={H}>
      {/* The generations' names, at the left. */}
      <text class="pc-generation" x={18} y={PARENT_BASE - 30} text-anchor="middle">
        {generationName(s.generation)}
      </text>
      <text class="pc-generation" x={SIDE_X} y={TOP_Y + 5} text-anchor="middle">
        {generationName(s.generation + 1)}
      </text>

      {/* The parents, on their soil, fading as two of their children rise to take their place. */}
      <g opacity={1 - rise}>
        {[P1, P2].map((x) => (
          <rect key={x} class="pc-soil" x={x - 34} y={PARENT_BASE} width={68} height={20} rx={8} />
        ))}
        <text class="pc-times" x={(P1 + P2) / 2} y={PARENT_BASE - 22} text-anchor="middle">
          ×
        </text>
        {s.parents.map((genes, i) => (
          <g key={i} {...shows(`parent${i + 1}`, genesWord(genes), looksWords(genes, locale))}>
            <Plant
              genes={genes}
              x={i === 0 ? P1 : P2}
              y={PARENT_BASE}
              g={1}
              isGenesShown={s.isGenesShown}
            />
          </g>
        ))}
      </g>

      {/* The copies each parent gives: the first's down the side, the second's along the top. */}
      {s.isGenesShown && (
        <g opacity={1 - rise}>
          <g {...shows("gives1", a.map(String), a.join(", "))}>
            {a.map((gene, i) => {
              const p = sideAt(i);
              return (
                <g key={i}>
                  <path
                    class="pc-guide"
                    d={`M${P1 + (i === 0 ? -BEAD_GAP : BEAD_GAP)} ${PARENT_BASE + 22} L${p.x} ${p.y - BEAD_R - 2}`}
                  />
                  <Bead
                    gene={gene}
                    x={p.x}
                    y={p.y}
                    isLit={growing >= 0 && Math.floor(growing / 2) === i}
                  />
                </g>
              );
            })}
          </g>
          <g {...shows("gives2", b.map(String), b.join(", "))}>
            {b.map((gene, j) => {
              const p = topAt(j);
              return (
                <g key={j}>
                  <path
                    class="pc-guide"
                    d={`M${P2 + (j === 0 ? -BEAD_GAP : BEAD_GAP)} ${PARENT_BASE + 22} L${p.x} ${p.y - BEAD_R - 2}`}
                  />
                  <Bead gene={gene} x={p.x} y={p.y} isLit={growing >= 0 && growing % 2 === j} />
                </g>
              );
            })}
          </g>
        </g>
      )}

      {/* The square's boxes: a plot of soil each. */}
      {s.children.map((genes, k) => {
        const g = growthOf(s.grown, k);
        const base = cellBase(k);
        const x0 = base.x - CELL_W / 2;
        const y0 = base.y - CELL_BASE;
        const isGrown = g >= 1;
        const isChosen = s.chosen.includes(k);
        const isShort = isGrown && !isTallOf(genes);
        const classes = ["pc-cell"];
        if (isShort) classes.push("is-short");
        if (isChosen) classes.push("is-chosen");
        const canChoose = s.isCrossed && !isRising;
        return (
          <g
            key={k}
            class={classes.join(" ")}
            opacity={isRising && !isChosen ? 1 - rise : 1}
            {...(canChoose
              ? {
                  ...shows("child", genesWord(genes), looksWords(genes, locale)),
                  ...does(actions.choose, { child: k }, k),
                }
              : {})}
          >
            <rect
              class="pc-plot"
              x={x0 + 4}
              y={y0 + 4}
              width={CELL_W - 8}
              height={CELL_H - 8}
              rx={12}
            />
            <rect class="pc-soil" x={x0 + 10} y={base.y} width={CELL_W - 20} height={20} rx={7} />
          </g>
        );
      })}

      {/* The children: their two copies fly in from the parents' sides, then they grow. Two that
          are rising glide up to the parents' row. */}
      {s.children.map((genes, k) => {
        const g = growthOf(s.grown, k);
        if (g <= 0) return null;
        const base = cellBase(k);
        const rank = s.chosen.indexOf(k);
        if (isRising && rank < 0) {
          return (
            <g key={k} opacity={1 - rise} class="pc-child">
              <Plant genes={genes} x={base.x} y={base.y} g={1} isGenesShown={s.isGenesShown} />
            </g>
          );
        }
        if (isRising) {
          const to = rank === 0 ? P1 : P2;
          return (
            <g key={k} class="pc-child">
              <Plant
                genes={genes}
                x={mix(base.x, to, rise)}
                y={mix(base.y, PARENT_BASE, rise)}
                g={1}
                isGenesShown={s.isGenesShown}
              />
            </g>
          );
        }
        const fly = smooth(g / FLY);
        const grow = clamp((g - FLY) / (1 - FLY));
        const from = [sideAt(Math.floor(k / 2)), topAt(k % 2)];
        return (
          <g key={k} class="pc-child">
            <g transform={`translate(${base.x} ${base.y})`}>
              <PeaPlant isTall={isTallOf(genes)} g={grow} />
            </g>
            {s.isGenesShown &&
              (fly < 1 ? (
                genes.map((gene, i) => {
                  const f = from[i] ?? base;
                  const tx = base.x + (i === 0 ? -BEAD_GAP : BEAD_GAP);
                  const ty = base.y + 11;
                  return (
                    <Bead
                      key={i}
                      gene={gene}
                      x={mix(f.x, tx, fly)}
                      y={mix(f.y, ty, fly) - Math.sin(Math.PI * fly) * 18}
                    />
                  );
                })
              ) : (
                <BeadPair genes={genes} x={base.x} y={base.y + 11} />
              ))}
          </g>
        );
      })}

      {/* What came out, once all four have grown. */}
      {s.isCrossed && !isRising && (
        <text
          key={`ratio${s.generation}`}
          class="pc-ratio"
          x={GRID_X + CELL_W}
          y={GRID_Y + 2 * CELL_H + 26}
          text-anchor="middle"
          {...shows("ratio", { tall: s.tall, short: s.short }, ratioWords(s.tall, s.short, locale))}
        >
          {s.tall > 0 && s.short > 0 ? (
            <>
              <tspan class="is-tall">{`${s.tall} ${word(WORDS.talls, locale)}`}</tspan>
              {" : "}
              <tspan class="is-short">{`${s.short} ${word(WORDS.shorts, locale)}`}</tspan>
            </>
          ) : (
            ratioWords(s.tall, s.short, locale)
          )}
        </text>
      )}
    </Stage>
  );
}

/** Mendel's pea cross: the garden, and under it Cross, or Cross these two and Start again. */
export function PeaCrossView({ view: s, locale }: PropViewProps<typeof peaCross>): JSX.Element {
  const isBusy = (s.grown > 0 && s.grown < 4) || s.rising > 0;
  return (
    <div class="pc">
      <Garden s={s} locale={locale} />
      <div class="pc-controls">
        {s.grown === 0 && s.rising === 0 ? (
          <SymbolButton
            symbol={word(WORDS.cross, locale)}
            label={word(WORDS.cross, locale)}
            isWide
            {...does(actions.crossParents)}
          />
        ) : (
          <>
            <SymbolButton
              symbol={word(s.chosen.length === 2 ? WORDS.crossChosen : WORDS.pickTwo, locale)}
              label={word(WORDS.crossChosen, locale)}
              isWide
              isEnabled={!isBusy && s.chosen.length === 2}
              {...does(actions.crossChosen)}
            />
            <SymbolButton
              symbol={word(WORDS.startAgain, locale)}
              label={word(WORDS.startAgain, locale)}
              isWide
              isEnabled={!isBusy}
              {...does(actions.startAgain)}
            />
          </>
        )}
      </div>
    </div>
  );
}
