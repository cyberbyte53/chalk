import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BalancerAction,
  type BalancerState,
  EquationSide,
  equationText,
  isEquationBalanced,
  tallyRows,
} from "./balancer";
import { ArrowCondition, CONDITION_WORDS } from "./equations";
import { MAX_COEFFICIENT, atomsOf, formulaRuns } from "./formula";
import { ATOM_COLOURED, type Words, range, say } from "./words";

const WORDS = {
  element: { en: "Element", hi: "तत्व" },
  left: { en: "Left (reactants)", hi: "बाएँ (अभिकारक)" },
  right: { en: "Right (products)", hi: "दाएँ (उत्पाद)" },
  balanced: { en: "Balanced", hi: "संतुलित" },
  notBalanced: { en: "Not balanced yet", hi: "अभी संतुलित नहीं" },
  more: { en: "one more", hi: "एक और" },
  fewer: { en: "one fewer", hi: "एक कम" },
} as const satisfies Record<string, Words>;

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

const ATOM_R = 5.5;

/** One molecule as touching coloured atoms in a small grid, symbols written on them. */
function Molecule({ formula }: { formula: string }): JSX.Element {
  const atoms: { el: string; key: string }[] = [];
  for (const [el, n] of Object.entries(atomsOf(formula)))
    for (let j = 0; j < n; j++) atoms.push({ el, key: `${el}${j}` });
  const cols = Math.min(atoms.length, atoms.length > 6 ? 4 : 3);
  const rows = Math.ceil(atoms.length / cols);
  const d = ATOM_R * 2;
  const w = cols * d + 2;
  const h = rows * d + 2;
  return (
    <svg class="eb-molecule" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {atoms.map(({ el, key }, i) => {
        const cx = 1 + ATOM_R + (i % cols) * d;
        const cy = 1 + ATOM_R + Math.floor(i / cols) * d;
        const known = ATOM_COLOURED.includes(el);
        return (
          <g key={key}>
            <circle
              class={`eb-atom ${known ? `eb-atom-${el}` : "eb-atom-other"}`}
              cx={cx}
              cy={cy}
              r={ATOM_R}
            />
            <text class="eb-atom-symbol" x={cx} y={cy + 2.2} text-anchor="middle">
              {el}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** A coefficient, with buttons to change it above and below when the learner may. */
function Term({
  s,
  side,
  index,
  locale,
  call,
}: {
  s: BalancerState;
  side: EquationSide;
  index: number;
  locale: string;
  call: PropViewProps["call"];
}): JSX.Element {
  const species = side === EquationSide.Left ? s.left[index] : s.right[index];
  const c = (side === EquationSide.Left ? s.leftCoefficients : s.rightCoefficients)[index] ?? 1;
  if (species === undefined) return <span />;
  const step = (by: 1 | -1) => call(BalancerAction.Step, { side, index, by });
  return (
    <div class="eb-term" data-part={`${side}-${index}`}>
      {s.canEdit && (
        <button
          type="button"
          class="eb-step"
          aria-label={`${say(locale, WORDS.more)} ${species.formula}`}
          disabled={c >= MAX_COEFFICIENT}
          onClick={() => step(1)}
        >
          +
        </button>
      )}
      <div class="eb-written">
        <span class={c === 1 ? "eb-coefficient is-one" : "eb-coefficient"}>
          {c === 1 && !s.canEdit ? "" : c}
        </span>
        <Formula formula={species.formula} />
        {s.showStates && species.state !== undefined && (
          <span class="eb-state">({species.state})</span>
        )}
      </div>
      {s.canEdit && (
        <button
          type="button"
          class="eb-step"
          aria-label={`${say(locale, WORDS.fewer)} ${species.formula}`}
          disabled={c <= 1}
          onClick={() => step(-1)}
        >
          −
        </button>
      )}
      {s.showMolecules && (
        <div class="eb-molecules" data-part="molecules">
          {range(c).map((i) => (
            <Molecule key={i} formula={species.formula} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The equation, its steppers, the molecules and the tally of atoms. */
export function BalancerView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BalancerState;
  const rows = tallyRows(s);
  const balanced = isEquationBalanced(s);
  const count = s.left.length + s.right.length;
  const size = count >= 5 || width < 330 ? "is-small" : count >= 4 ? "is-medium" : "";
  const condition = CONDITION_WORDS[s.condition];
  const side = (which: EquationSide) => {
    const list = which === EquationSide.Left ? s.left : s.right;
    return range(list.length).flatMap((i) => [
      ...(i > 0
        ? [
            <span key={`plus-${which}-${i}`} class="eb-op">
              +
            </span>,
          ]
        : []),
      <Term key={`${which}-${i}`} s={s} side={which} index={i} locale={locale} call={call} />,
    ]);
  };
  return (
    <div class={`eb ${size}${s.canEdit ? " can-edit" : ""}`} style={{ maxWidth: `${width}px` }}>
      <div class="eb-equation" data-part="equation" title={equationText(s)}>
        {side(EquationSide.Left)}
        <span class={s.condition === ArrowCondition.None ? "eb-arrow" : "eb-arrow has-condition"}>
          {s.condition !== ArrowCondition.None && (
            <span class="eb-condition">{say(locale, condition)}</span>
          )}
          <span>→</span>
        </span>
        {side(EquationSide.Right)}
      </div>
      {s.showTally && (
        <div class="eb-tally" data-part="tally">
          <div class="eb-tally-head">
            <span>{say(locale, WORDS.element)}</span>
            <span>{say(locale, WORDS.left)}</span>
            <span>{say(locale, WORDS.right)}</span>
          </div>
          {rows.map((row) => {
            const max = Math.max(row.left, row.right, 1);
            const ok = row.left === row.right;
            return (
              <div key={row.element} class={ok ? "eb-row is-equal" : "eb-row is-off"}>
                <span class="eb-row-el">{row.element}</span>
                <span class="eb-cell">
                  <span class="eb-bar" style={{ width: `${(row.left / max) * 100}%` }} />
                  <span class="eb-n">{row.left}</span>
                </span>
                <span class="eb-cell">
                  <span class="eb-bar" style={{ width: `${(row.right / max) * 100}%` }} />
                  <span class="eb-n">{row.right}</span>
                </span>
              </div>
            );
          })}
          <div class={balanced ? "eb-verdict is-balanced" : "eb-verdict"} aria-live="polite">
            {balanced ? `✓ ${say(locale, WORDS.balanced)}` : say(locale, WORDS.notBalanced)}
          </div>
        </div>
      )}
    </div>
  );
}
