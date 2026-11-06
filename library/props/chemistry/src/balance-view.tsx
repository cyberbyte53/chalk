import type { Locale } from "@chalk/content";
import { Stage, SymbolButton } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import { Color, cssColor, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { Side, type TallyRow, equationBalance } from "./balance";
import { MAX_COEFFICIENT, formulaRuns, prettyFormula } from "./formula";
import { type AtomAt, type Picture, atomsAt, flightAt, pairsOf, pictureOf } from "./picture";
import { WORDS } from "./words";

type Props = PropViewProps<typeof equationBalance>;
type View = Props["view"];
const actions = equationBalance.actions;

/** Roles dark enough that an atom's letter is written light on them. */
const DARK_ROLES: readonly string[] = [
  Color.OnSurface,
  Color.OnSurfaceVariant,
  Color.InverseSurface,
  Color.Primary,
  Color.PrimaryPress,
  Color.Right,
  Color.Wrong,
  Color.Category2,
  Color.Category3,
  Color.Category4,
];

/** Whether a colour is dark (its letter then written light): by luminance for a hex. */
function isDark(color: string): boolean {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (hex === null) return DARK_ROLES.includes(color);
  const [r, g, b] = hex.slice(1).map((h) => Number.parseInt(h, 16) / 255) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.55;
}

/** An element's colour, as CSS: the content's, or none (drawn grey by the styles). */
function toneOf(colors: View["colors"], element: string): JSX.CSSProperties | undefined {
  const color = colors[element];
  return color === undefined ? undefined : { "--tone": cssColor(color) };
}

/**
 * Atoms: each a ball in its element's colour with a shine, then every symbol on top (so no ball
 * covers a neighbour's letter), written when the ball is big enough.
 */
function Atoms({
  atoms,
  colors,
  isGhost = false,
}: {
  atoms: readonly AtomAt[];
  colors: View["colors"];
  isGhost?: boolean;
}): JSX.Element {
  const drawn = atoms.filter((a) => a.r >= 0.5);
  return (
    <>
      {drawn.map(({ x, y, r, element }, i) => (
        <g
          key={i}
          class={`eb-atom ${colors[element] === undefined ? "is-plain" : ""} ${isGhost ? "is-ghost" : ""}`}
          style={toneOf(colors, element)}
          data-coverable
        >
          {/* Ellipses, not dots: joined balls overlap by design, their letters all drawn above. */}
          <ellipse class="eb-ball" cx={x} cy={y} rx={r} ry={r} />
          {!isGhost && (
            <ellipse
              class="eb-shine"
              cx={x - r * 0.38}
              cy={y - r * 0.42}
              rx={r * 0.36}
              ry={r * 0.24}
              transform={`rotate(-35 ${x - r * 0.38} ${y - r * 0.42})`}
            />
          )}
        </g>
      ))}
      {!isGhost &&
        drawn.map(({ x, y, r, element }, i) =>
          r < 7 ? null : (
            <text
              key={`s${i}`}
              class={`eb-symbol ${isDark(colors[element] ?? "") ? "is-light" : ""}`}
              x={x}
              y={y}
              font-size={Math.min(r * 0.9, 14)}
              text-anchor="middle"
              dominant-baseline="central"
            >
              {element}
            </text>
          ),
        )}
    </>
  );
}

/** The molecules, the arrow and the plusses; while regrouping, the atoms flying across. */
function Molecules({ s, p, locale }: { s: View; p: Picture; locale: Locale }): JSX.Element {
  const g = s.regrouped;
  const isMoving = g > 0;
  const pairs = isMoving ? pairsOf(p) : [];
  const lift = Math.min(p.height * 0.32, 44);
  const { x0, x1, y } = p.arrow;
  return (
    <>
      <text class="eb-side" x={p.middles[Side.Reactants]} y={14} text-anchor="middle">
        {WORDS.reactants[locale]}
      </text>
      <text class="eb-side" x={p.middles[Side.Products]} y={14} text-anchor="middle">
        {WORDS.products[locale]}
      </text>
      <g class="eb-arrow">
        <line x1={x0} y1={y} x2={x1 - 3} y2={y} />
        <path d={`M ${x1 - 8} ${y - 6} L ${x1} ${y} L ${x1 - 8} ${y + 6}`} />
      </g>
      {p.plusses.map((x) => (
        <text key={x} class="eb-plus" x={x} y={y} text-anchor="middle" dominant-baseline="central">
          +
        </text>
      ))}
      {p.columns.map((c) => (
        <g
          key={`${c.side}${c.index}`}
          class="eb-molecule"
          {...shows(
            `${c.side}:${c.index}`,
            { formula: c.term.formula, coefficient: c.term.coefficient },
            `${c.term.coefficient} × ${prettyFormula(c.term.formula)}`,
          )}
        >
          <Atoms
            atoms={c.copies.flatMap((copy) => atomsAt(c.shape, copy, p.unit))}
            colors={s.colors}
            isGhost={isMoving}
          />
        </g>
      ))}
      {isMoving && (
        <g class="eb-flying">
          <Atoms
            atoms={pairs.map((pair, j) => flightAt(pair, j, pairs.length, g, lift))}
            colors={s.colors}
          />
        </g>
      )}
    </>
  );
}

/** A formula with its digits as subscripts. */
function Formula({ formula }: { formula: string }): JSX.Element {
  return (
    <span class="eb-formula">
      {formulaRuns(formula).map((run) =>
        run.isSub ? <sub key={run.at}>{run.text}</sub> : <span key={run.at}>{run.text}</span>,
      )}
    </span>
  );
}

/** The equation as written, its coefficients picked out; the one changing now bumps. */
function Equation({ s }: { s: View }): JSX.Element {
  const side = (which: Side) =>
    s[which].map((term, i) => (
      <span key={`${which}${i}`} class="eb-term">
        {i > 0 && <span class="eb-op">+</span>}
        {term.coefficient > 1 && (
          <span
            key={`${which}${i}-${term.coefficient}`}
            class={`eb-coefficient ${s.pop?.side === which && s.pop.index === i ? "is-new" : ""}`}
          >
            {term.coefficient}
          </span>
        )}
        <Formula formula={term.formula} />
      </span>
    ));
  return (
    <p
      class={`eb-equation ${s.isBalanced ? "is-balanced" : ""}`}
      {...shows("equation", s.equation)}
    >
      {side(Side.Reactants)}
      <span class="eb-op eb-yields">→</span>
      {side(Side.Products)}
    </p>
  );
}

/** Most dots drawn in a row of the tally; beyond, the number says it. */
const MOST_DOTS = 12;

function Dots({ n, tone }: { n: number; tone: JSX.CSSProperties | undefined }): JSX.Element {
  return (
    <span class="eb-dots" style={tone}>
      {Array.from({ length: Math.min(n, MOST_DOTS) }, (_, i) => (
        <i key={i} class="eb-dot" />
      ))}
    </span>
  );
}

/** Each element's atoms on both sides: dots and a number, red while they differ. */
function Tally({ s, locale }: { s: View; locale: Locale }): JSX.Element {
  return (
    <div class="eb-tally">
      {s.tally.map((row: TallyRow) => {
        const tone = toneOf(s.colors, row.element);
        const isEqual = row.left === row.right;
        return (
          <div
            key={row.element}
            class={`eb-row ${isEqual ? "is-equal" : "is-off"}`}
            {...shows(
              `tally:${row.element}`,
              { left: row.left, right: row.right },
              `${row.element}: ${row.left} ${WORDS.atoms[locale]} | ${row.right} ${WORDS.atoms[locale]}`,
            )}
          >
            <span class="eb-count is-left">
              <Dots n={row.left} tone={tone} />
              <b>{row.left}</b>
            </span>
            <span class="eb-element" style={tone}>
              {row.element}
              <span class="eb-sign">{isEqual ? "=" : "≠"}</span>
            </span>
            <span class="eb-count is-right">
              <b>{row.right}</b>
              <Dots n={row.right} tone={tone} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Each molecule's − and +, under its column. */
function Steppers({ s, p, locale }: { s: View; p: Picture; locale: Locale }): JSX.Element {
  return (
    <div class="eb-steppers">
      {p.columns.map((c) => {
        const name = prettyFormula(c.term.formula);
        const key = `${c.side}${c.index}`;
        const left = `${((c.x / p.width) * 100).toFixed(3)}%`;
        return (
          <div key={key} class="eb-stepper" style={{ left }}>
            <SymbolButton
              symbol="−"
              label={`${WORDS.fewer[locale]} ${name}`}
              isEnabled={c.term.coefficient > 1}
              {...does(actions.step, { side: c.side, index: c.index, by: -1 }, `${key}-less`)}
            />
            <SymbolButton
              symbol="+"
              label={`${WORDS.more[locale]} ${name}`}
              isEnabled={c.term.coefficient < MAX_COEFFICIENT}
              {...does(actions.step, { side: c.side, index: c.index, by: 1 }, `${key}-more`)}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * The equation, its molecules drawn as atoms (as many as each coefficient), each one's − and +,
 * the atoms counted on both sides, and once balanced, the atoms regrouped across the arrow.
 */
export function EquationBalanceView({ view: s, width, locale }: Props): JSX.Element {
  const p = pictureOf(s, width, s.pop, s.popped);
  const isRegrouped = s.regrouped >= 0.5;
  return (
    <div class={`eb ${s.isBalanced ? "is-balanced" : ""}`}>
      <Equation s={s} />
      <p
        class={`eb-verdict ${s.isBalanced ? "is-balanced" : ""}`}
        {...shows(
          "verdict",
          s.isBalanced,
          s.isBalanced ? WORDS.balanced[locale] : WORDS.notBalanced[locale],
        )}
      >
        {s.isBalanced ? `✓ ${WORDS.balanced[locale]}` : WORDS.notBalanced[locale]}
      </p>
      <Stage label={s.equation} x={[0, width]} width={width} height={p.height}>
        <Molecules s={s} p={p} locale={locale} />
      </Stage>
      <Steppers s={s} p={p} locale={locale} />
      <Tally s={s} locale={locale} />
      <div class="eb-controls">
        {isRegrouped ? (
          <SymbolButton
            symbol={WORDS.ungroup[locale]}
            label={WORDS.ungroup[locale]}
            isWide
            {...does(actions.ungroup)}
          />
        ) : (
          <SymbolButton
            symbol={WORDS.regroup[locale]}
            label={WORDS.regroup[locale]}
            isWide
            isEnabled={s.isBalanced}
            {...does(actions.regroup)}
          />
        )}
        <SymbolButton
          symbol="↺"
          label={WORDS.startAgain[locale]}
          isEnabled={[...s.reactants, ...s.products].some((t) => t.coefficient > 1)}
          {...does(actions.startAgain)}
        />
      </div>
    </div>
  );
}
