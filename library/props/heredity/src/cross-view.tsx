import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  CrossAction,
  CrossPart,
  type CrossState,
  Parent,
  isUniform,
  lookRatioOf,
  offspringGeneration,
  offspringOf,
  parentGeneration,
} from "./cross";
import { LookFigure, type Words, say } from "./draw";
import {
  LETTER,
  type Look,
  type Trait,
  allLooks,
  lookKey,
  lookKeyHi,
  lookOf,
  punnett,
} from "./genetics";

const W = 320;

const WORDS = {
  cross: { en: "Cross them", hi: "संकरण करो" },
  self: { en: "Self-pollinate F1", hi: "F1 का स्व-परागण करो" },
  reset: { en: "Start again", hi: "फिर से" },
  germ: { en: "germ cells", hi: "जनन कोशिकाएँ" },
  parent: { en: "parent", hi: "जनक" },
  offspring: { en: "offspring", hi: "संतति" },
  grown: { en: "plants grown", hi: "पौधे उगे" },
  about: { en: "about", hi: "लगभग" },
} as const satisfies Record<string, Words>;

const grow = (n: number): Words => ({ en: `Grow ${n} plants`, hi: `${n} पौधे उगाओ` });

/** One look in the reader's language. */
const lookWords = (locale: string, key: string): string => (locale === "hi" ? lookKeyHi(key) : key);

type Layout = {
  parents: number;
  gametes: number | null;
  punnett: number | null;
  cell: number;
  field: number | null;
  height: number;
};

function layoutOf(s: CrossState): Layout {
  let y = 128;
  const parents = 0;
  const gametes = s.showGametes ? y : null;
  const many = gameteRows(s) > 1;
  if (s.showGametes) y += many ? 62 : 34;
  const n = punnett(s.parentA, s.parentB).rows.length;
  const cell = n <= 2 ? 72 : 56;
  const punnettTop = s.isCrossed && s.showPunnett ? y + 6 : null;
  if (punnettTop !== null) y = punnettTop + GRID_TOP + n * cell + (s.traits.length > 1 ? 44 : 30);
  const field = s.grown !== null ? y + 4 : null;
  if (field !== null) y = field + 24 + allLooks(s.traits).length * 26 + 22;
  return { parents, gametes, punnett: punnettTop, cell, field, height: y + 4 };
}

/** Where the Punnett grid starts below its band's top: the tag, then the column heads. */
const GRID_TOP = 38;

/** Rows of germ cells drawn under a parent: 4 kinds go in a 2 × 2 block. */
function gameteRows(s: CrossState): number {
  const sq = punnett(s.parentA, s.parentB);
  return Math.max(new Set(sq.rows).size, new Set(sq.columns).size) > 2 ? 2 : 1;
}

/** A germ cell: a small round cell with its gene letters inside. */
function Gamete({ x, y, letters }: { x: number; y: number; letters: string }): JSX.Element {
  const r = letters.length > 1 ? 13 : 11;
  return (
    <g class="hc-gamete">
      <circle cx={x} cy={y} r={r} />
      <text x={x} y={y + 4} text-anchor="middle">
        {letters}
      </text>
    </g>
  );
}

function ParentPlant({
  s,
  which,
  x,
  locale,
}: { s: CrossState; which: Parent; x: number; locale: string }): JSX.Element {
  const g = which === Parent.A ? s.parentA : s.parentB;
  const look = lookOf(s.traits, g);
  return (
    <g data-part={which === Parent.A ? CrossPart.ParentA : CrossPart.ParentB}>
      <LookFigure traits={s.traits} look={look} x={x} y={92} size={80} />
      <text class="hc-look" x={x} y={108} text-anchor="middle">
        {lookWords(locale, lookKey(s.traits, look))}
      </text>
      {s.showGenotypes && (
        <text class="hc-genotype" x={x} y={122} text-anchor="middle">
          {g}
        </text>
      )}
    </g>
  );
}

/** A cross of two pea plants: parents, germ cells, the Punnett square and a grown field. */
export function CrossSimulatorView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CrossState;
  const k = width / W;
  const lay = layoutOf(s);
  const height = Math.round(lay.height * k);
  const square = punnett(s.parentA, s.parentB);
  const n = square.rows.length;
  const shares = offspringOf(s);
  const looks = allLooks(s.traits);
  const label = `Cross: ${lookKey(s.traits, lookOf(s.traits, s.parentA))} (${s.parentA}) × ${lookKey(s.traits, lookOf(s.traits, s.parentB))} (${s.parentB})${s.isCrossed ? `; offspring ${lookRatioOf(s)}` : ""}`;
  const unique = (xs: string[]) => [...new Set(xs)];
  const button = (words: Words, action: string, part: string, isOn = false) => (
    <button
      type="button"
      class={isOn ? "hc-button is-on" : "hc-button"}
      data-part={part}
      onClick={() => call(action, {})}
    >
      {say(locale, words)}
    </button>
  );
  const canSelfNow = s.canSelf && s.isCrossed && s.generation === 0 && isUniform(s);
  return (
    <div class="hc">
      <Stage label={label} x={[0, W]} width={width} height={height} svg={{ class: "hc-svg" }}>
        <g transform={`scale(${k})`}>
          <rect class="hc-bg" x={0} y={0} width={W} height={lay.height} rx={10} />
          {/* parents */}
          <text class="hc-tag" x={12} y={18}>
            {`${parentGeneration(s)} ${say(locale, WORDS.parent)}`}
          </text>
          <ParentPlant s={s} which={Parent.A} x={84} locale={locale} />
          <text class="hc-times" x={160} y={64} text-anchor="middle">
            ×
          </text>
          <ParentPlant s={s} which={Parent.B} x={236} locale={locale} />
          {/* germ cells */}
          {lay.gametes !== null && (
            <g data-part={CrossPart.Gametes}>
              {[
                { x: 84, gs: unique(square.rows) },
                { x: 236, gs: unique(square.columns) },
              ].map(({ x, gs }) =>
                gs.map((g, i) => {
                  const perRow = gs.length > 2 ? 2 : gs.length;
                  const col = i % perRow;
                  const row = Math.floor(i / perRow);
                  return (
                    <Gamete
                      key={`${x}-${g}`}
                      x={x + (col - (perRow - 1) / 2) * 30}
                      y={(lay.gametes ?? 0) + 14 + row * 28}
                      letters={g}
                    />
                  );
                }),
              )}
              <text
                class="hc-note"
                x={160}
                y={(lay.gametes ?? 0) + (gameteRows(s) > 1 ? 32 : 18)}
                text-anchor="middle"
              >
                {say(locale, WORDS.germ)}
              </text>
            </g>
          )}
          {/* the Punnett square */}
          {lay.punnett !== null &&
            (() => {
              const top = lay.punnett;
              const c = lay.cell;
              const x0 = (W - (24 + n * c)) / 2;
              return (
                <g data-part={CrossPart.Punnett}>
                  <text class="hc-tag" x={12} y={top + 12}>
                    {`${offspringGeneration(s)} ${say(locale, WORDS.offspring)}`}
                  </text>
                  {square.columns.map((g, j) => (
                    <text
                      key={`c${j}-${g}`}
                      class="hc-head"
                      x={x0 + 24 + (j + 0.5) * c}
                      y={top + GRID_TOP - 6}
                      text-anchor="middle"
                    >
                      {g}
                    </text>
                  ))}
                  {square.rows.map((g, i) => (
                    <text
                      key={`r${i}-${g}`}
                      class="hc-head"
                      x={x0 + 12}
                      y={top + GRID_TOP + (i + 0.5) * c + 4}
                      text-anchor="middle"
                    >
                      {g}
                    </text>
                  ))}
                  {square.cells.map((row, i) =>
                    row.map((g, j) => {
                      const cx = x0 + 24 + j * c;
                      const cy = top + GRID_TOP + i * c;
                      return (
                        <g key={`cell-${cx}-${cy}`}>
                          <rect class="hc-cell" x={cx} y={cy} width={c} height={c} />
                          <LookFigure
                            traits={s.traits}
                            look={lookOf(s.traits, g)}
                            x={cx + c / 2}
                            y={cy + c - (s.showGenotypes ? 15 : 6)}
                            size={c * (s.showGenotypes ? 0.62 : 0.78)}
                          />
                          {s.showGenotypes && (
                            <text
                              class="hc-cell-genotype"
                              x={cx + c / 2}
                              y={cy + c - 4}
                              text-anchor="middle"
                            >
                              {g}
                            </text>
                          )}
                        </g>
                      );
                    }),
                  )}
                  {ratioLines(shares, locale).map((line, li) => (
                    <text
                      key={line}
                      class="hc-ratio"
                      x={W / 2}
                      y={top + GRID_TOP + n * c + 20 + li * 16}
                      text-anchor="middle"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })()}
          {/* the grown field */}
          {lay.field !== null &&
            s.grown !== null &&
            (() => {
              const top = lay.field;
              const grown = s.grown;
              const max = Math.max(1, ...looks.map((key) => grown.counts[key] ?? 0));
              const nonzero = looks.map((key) => grown.counts[key] ?? 0).filter((c) => c > 0);
              const least = Math.min(...nonzero);
              return (
                <g data-part={CrossPart.Field}>
                  <text class="hc-tag" x={12} y={top + 14}>
                    {`${grown.total} ${say(locale, WORDS.grown)}`}
                  </text>
                  {looks.map((key, i) => {
                    const y = top + 24 + i * 26;
                    const count = grown.counts[key] ?? 0;
                    return (
                      <g key={key}>
                        <LookFigure
                          traits={s.traits}
                          look={lookFromKey(s.traits, key)}
                          x={24}
                          y={y + 22}
                          size={24}
                        />
                        <text class="hc-row-name" x={42} y={y + 16}>
                          {lookWords(locale, key)}
                        </text>
                        <rect
                          class="hc-bar"
                          x={204}
                          y={y + 6}
                          width={Math.max(count > 0 ? 2 : 0, (count / max) * 104)}
                          height={13}
                          rx={3}
                        />
                        <text class="hc-count" x={198} y={y + 16} text-anchor="end">
                          {count}
                        </text>
                      </g>
                    );
                  })}
                  {nonzero.length > 1 && (
                    <text
                      class="hc-note"
                      x={W / 2}
                      y={top + 24 + looks.length * 26 + 14}
                      text-anchor="middle"
                    >
                      {`${say(locale, WORDS.about)} ${looks
                        .map((key) => grown.counts[key] ?? 0)
                        .filter((c) => c > 0)
                        .map((c) => (c / least).toFixed(1).replace(/\.0$/, ""))
                        .join(" : ")}`}
                    </text>
                  )}
                </g>
              );
            })()}
        </g>
      </Stage>
      <div class="hc-controls" data-part={CrossPart.Controls}>
        {s.canSetParents &&
          [Parent.A, Parent.B].map((which) => {
            const g = which === Parent.A ? s.parentA : s.parentB;
            return (
              <div key={which} class="hc-row">
                <span class="hc-label">{`${say(locale, WORDS.parent)} ${which === Parent.A ? 1 : 2}`}</span>
                {s.traits.map((t, ti) => {
                  const up = LETTER[t];
                  const low = up.toLowerCase();
                  return [up + up, up + low, low + low].map((pair) => {
                    const next = g.slice(0, 2 * ti) + pair + g.slice(2 * ti + 2);
                    return (
                      <button
                        key={`${t}-${pair}`}
                        type="button"
                        class={g.slice(2 * ti, 2 * ti + 2) === pair ? "hc-chip is-on" : "hc-chip"}
                        data-part={`set-${which}-${pair}`}
                        onClick={() => call(CrossAction.SetParent, { which, genotype: next })}
                      >
                        {pair}
                      </button>
                    );
                  });
                })}
              </div>
            );
          })}
        <div class="hc-row">
          {!s.isCrossed && button(WORDS.cross, CrossAction.Cross, "cross")}
          {s.canGrow && button(grow(s.growCount), CrossAction.Grow, "grow")}
          {canSelfNow && button(WORDS.self, CrossAction.SelfF1, "self")}
          {s.isCrossed && button(WORDS.reset, CrossAction.Reset, "reset")}
        </div>
      </div>
    </div>
  );
}

/** The Punnett square's looks as a ratio in words, split in two lines for two traits. */
function ratioLines(shares: readonly { key: string; count: number }[], locale: string): string[] {
  if (shares.length === 1)
    return [`${locale === "hi" ? "सभी" : "all"} ${lookWords(locale, shares[0]?.key ?? "")}`];
  const g = shares.reduce((acc, x) => gcd(acc, x.count), 0);
  const parts = shares.map((x) => `${x.count / g} ${lookWords(locale, x.key)}`);
  if (parts.length <= 2) return [parts.join(" : ")];
  const half = Math.ceil(parts.length / 2);
  return [`${parts.slice(0, half).join(" : ")} :`, parts.slice(half).join(" : ")];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** A look from its key ("tall round" → { height: "tall", seedShape: "round" }). */
function lookFromKey(traits: readonly Trait[], key: string): Look {
  const words = key.split(" ");
  return Object.fromEntries(traits.map((t, i) => [t, words[i] ?? ""]));
}
