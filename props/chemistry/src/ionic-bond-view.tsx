import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BOND_STEPS,
  BondAction,
  type BondState,
  BondStep,
  COMPOUNDS,
  IONIC_ELEMENTS,
  type IonicElement,
  chargeOf,
  chargeText,
  describeBond,
  ionShellsOf,
  shellsOf,
  valenceOf,
} from "./ionic-bond";
import { type Words, range, say } from "./words";

const W = 320;
const H = 180;
const Y = 86;
/** Shell radii, inside out, with every shell drawn; the outer shell alone is drawn at DOT_R. */
const RADII = [13, 23, 33, 43] as const;
const DOT_R = 20;
/** How far each outer atom moves in towards the middle at the last step. */
const PULL = 14;

const WORDS = {
  next: { en: "Next →", hi: "आगे →" },
  again: { en: "↺ Again", hi: "↺ फिर से" },
  steps: [
    { en: "The atoms", hi: "परमाणु" },
    { en: "Electrons move", hi: "इलेक्ट्रॉन जाते हैं" },
    { en: "Now they are ions", hi: "अब ये आयन हैं" },
    { en: "Held together", hi: "एक साथ बँधे" },
  ],
  stepsLong: [
    {
      en: "Each atom with its electrons in shells. The metal has only a few electrons in its outer shell.",
      hi: "हर परमाणु अपने इलेक्ट्रॉनों के साथ, कोशों में। धातु के बाहरी कोश में बस कुछ इलेक्ट्रॉन हैं।",
    },
    {
      en: "The metal's outer electrons move to the non-metal.",
      hi: "धातु के बाहरी इलेक्ट्रॉन अधातु के पास चले जाते हैं।",
    },
    {
      en: "Each now has a full outer shell of 8. Losing electrons left the metal positive; gaining them made the non-metal negative.",
      hi: "अब हर एक का बाहरी कोश 8 से भरा है। इलेक्ट्रॉन खोकर धातु धनावेशित हुई; पाकर अधातु ऋणावेशित।",
    },
    {
      en: "Opposite charges attract: the ions stay together as an ionic compound.",
      hi: "विपरीत आवेश आकर्षित करते हैं: आयन एक आयनिक यौगिक बनकर साथ रहते हैं।",
    },
  ],
} as const;

type Atom = { el: IonicElement; x: number; isMetal: boolean; key: string };

/** Where the atoms sit: the one in the middle stays, the outer ones move in at the last step. */
function layout(s: BondState): Atom[] {
  const info = COMPOUNDS[s.compound];
  if (info.metals === 1 && info.nonMetals === 1)
    return [
      { el: info.metal, x: 96, isMetal: true, key: "m0" },
      { el: info.nonMetal, x: 224, isMetal: false, key: "n0" },
    ];
  if (info.nonMetals === 2)
    return [
      { el: info.nonMetal, x: 58, isMetal: false, key: "n0" },
      { el: info.metal, x: 160, isMetal: true, key: "m0" },
      { el: info.nonMetal, x: 262, isMetal: false, key: "n1" },
    ];
  return [
    { el: info.metal, x: 58, isMetal: true, key: "m0" },
    { el: info.nonMetal, x: 160, isMetal: false, key: "n0" },
    { el: info.metal, x: 262, isMetal: true, key: "m1" },
  ];
}

const atAngle = (x: number, y: number, r: number, a: number): [number, number] => [
  x + r * Math.cos(a),
  y + r * Math.sin(a),
];

type Electron = { id: string; at: [number, number][]; moved: boolean };

/** Every electron's place at each step. */
function electronsOf(s: BondState, atoms: Atom[]): Electron[] {
  const out: Electron[] = [];
  const centreAt = (a: Atom, step: number) =>
    step >= BondStep.Together ? a.x + Math.sign(160 - a.x) * PULL : a.x;
  const outerR = (el: IonicElement) =>
    s.showAllShells ? (RADII[shellsOf(IONIC_ELEMENTS[el].z).length - 1] ?? 35) : DOT_R;
  // Which non-metal each metal atom gives its electrons to, and how many each non-metal receives.
  const nonMetals = atoms.filter((a) => !a.isMetal);
  const metals = atoms.filter((a) => a.isMetal);
  const incoming = new Map<string, { from: Atom; n: number }[]>();
  for (const m of metals) {
    const v = valenceOf(IONIC_ELEMENTS[m.el].z);
    if (nonMetals.length === 1) {
      const t = nonMetals[0] as Atom;
      incoming.set(t.key, [...(incoming.get(t.key) ?? []), { from: m, n: v }]);
    } else {
      // A metal between two non-metals gives one electron to each.
      for (const t of nonMetals)
        incoming.set(t.key, [...(incoming.get(t.key) ?? []), { from: m, n: v / nonMetals.length }]);
    }
  }
  // The eight slots on each non-metal's outer shell: its own electrons take the far side.
  const slotsOf = (t: Atom) => {
    const from = incoming.get(t.key) ?? [];
    const own = valenceOf(IONIC_ELEMENTS[t.el].z);
    const angles = range(8).map((i) => (i * Math.PI) / 4 + Math.PI / 8);
    const facing = (a: number) =>
      Math.max(...from.map((f) => Math.cos(a - (f.from.x < t.x ? Math.PI : 0))));
    const byNear = [...angles].sort((p, q) => facing(q) - facing(p));
    const near = byNear.slice(0, 8 - own);
    const far = byNear.slice(8 - own);
    return { near, far };
  };
  const nearSlots = new Map<string, number[]>();
  for (const t of nonMetals) {
    const { near, far } = slotsOf(t);
    nearSlots.set(t.key, near);
    const shells = shellsOf(IONIC_ELEMENTS[t.el].z);
    // Inner shells.
    if (s.showAllShells)
      shells.slice(0, -1).forEach((n, shell) => {
        for (const i of range(n)) {
          const a = (2 * Math.PI * i) / n + Math.PI / 4;
          out.push({
            id: `${t.key}-s${shell}-${i}`,
            moved: false,
            at: range(BOND_STEPS).map((step) =>
              atAngle(centreAt(t, step), Y, RADII[shell] ?? 13, a),
            ),
          });
        }
      });
    far.forEach((a, i) => {
      out.push({
        id: `${t.key}-own-${i}`,
        moved: false,
        at: range(BOND_STEPS).map((step) => atAngle(centreAt(t, step), Y, outerR(t.el), a)),
      });
    });
  }
  for (const m of metals) {
    const shells = shellsOf(IONIC_ELEMENTS[m.el].z);
    if (s.showAllShells)
      shells.slice(0, -1).forEach((n, shell) => {
        for (const i of range(n)) {
          const a = (2 * Math.PI * i) / n + Math.PI / 4;
          out.push({
            id: `${m.key}-s${shell}-${i}`,
            moved: false,
            at: range(BOND_STEPS).map((step) =>
              atAngle(centreAt(m, step), Y, RADII[shell] ?? 13, a),
            ),
          });
        }
      });
    // The outer electrons, on the side facing where they go, then on the non-metal's near slots.
    const targets = nonMetals.length === 1 ? [nonMetals[0] as Atom] : nonMetals;
    let k = 0;
    for (const t of targets) {
      const share = (incoming.get(t.key) ?? []).find((f) => f.from.key === m.key)?.n ?? 0;
      for (const _ of range(share)) {
        const towards = t.x > m.x ? 0 : Math.PI;
        const a0 = towards + (k % 2 === 0 ? -0.35 : 0.35) * (k > 0 ? 1 : 0);
        const slots = nearSlots.get(t.key) ?? [];
        const slot = slots.shift() ?? 0;
        nearSlots.set(t.key, slots);
        out.push({
          id: `${m.key}-out-${k}`,
          moved: true,
          at: range(BOND_STEPS).map((step) =>
            step === BondStep.Atoms
              ? atAngle(centreAt(m, step), Y, outerR(m.el), a0)
              : atAngle(centreAt(t, step), Y, outerR(t.el), slot),
          ),
        });
        k++;
      }
    }
  }
  return out;
}

/** Atoms with their shells; the metal's outer electrons hop to the non-metal; ions; together. */
export function IonicBondView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BondState;
  const info = COMPOUNDS[s.compound];
  const k = width / W;
  const height = Math.round(H * k);
  const atoms = layout(s);
  const electrons = electronsOf(s, atoms);
  const ions = s.step >= BondStep.Ions;
  const isLast = s.step === BOND_STEPS - 1;
  return (
    <div class="mn mn-ib">
      <Stage
        label={describeBond(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "mn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="mn-bg" x={0} y={0} width={W} height={H} rx={12} />
          <text class="mn-small" x={12} y={18}>
            {say(locale, WORDS.steps[s.step] as Words)}
          </text>
          <text class="mn-title" x={W - 12} y={20} text-anchor="end">
            {info.formula}
          </text>
          <g data-part="atoms">
            {atoms.map((a) => {
              const shells = shellsOf(IONIC_ELEMENTS[a.el].z);
              const now = ions ? ionShellsOf(a.el) : shells;
              const x = s.step >= BondStep.Together ? a.x + Math.sign(160 - a.x) * PULL : a.x;
              const rings = s.showAllShells
                ? now.map((_, i) => RADII[i] ?? 43)
                : a.isMetal && ions
                  ? []
                  : [DOT_R];
              return (
                <g
                  key={a.key}
                  class={a.isMetal ? "mn-atom is-metal" : "mn-atom"}
                  data-part={a.isMetal ? "metal" : "nonMetal"}
                  style={{ transform: `translateX(${x - a.x}px)` } as JSX.CSSProperties}
                >
                  {rings.map((r) => (
                    <circle key={r} class="mn-shell" cx={a.x} cy={Y} r={r} />
                  ))}
                  <circle class="mn-nucleus" cx={a.x} cy={Y} r={8} />
                  <text class="mn-nucleus-text" x={a.x} y={Y + 3.5} text-anchor="middle">
                    {a.el}
                  </text>
                  {ions && (
                    <text
                      class={a.isMetal ? "mn-charge is-plus" : "mn-charge is-minus"}
                      x={a.x + 28}
                      y={Y - 38}
                      text-anchor="middle"
                    >
                      {a.el}
                      {chargeText(chargeOf(a.el))}
                    </text>
                  )}
                  {s.showConfig && (
                    <text class="mn-config" x={a.x} y={Y + 60} text-anchor="middle">
                      {now.join(", ")}
                    </text>
                  )}
                </g>
              );
            })}
            {electrons.map((e) => {
              const [x, y] = e.at[s.step] as [number, number];
              return (
                <circle
                  key={e.id}
                  class={e.moved ? "mn-e is-moved" : "mn-e"}
                  r={2.6}
                  style={{ transform: `translate(${x}px, ${y}px)` } as JSX.CSSProperties}
                />
              );
            })}
            {s.step === BondStep.Transfer &&
              atoms
                .filter((a) => a.isMetal)
                .map((m) => {
                  const targets = atoms.filter((a) => !a.isMetal);
                  return targets
                    .filter((t) => targets.length === 1 || Math.abs(t.x - m.x) < 120)
                    .map((t) => (
                      <path
                        key={`${m.key}-${t.key}`}
                        class="mn-hop"
                        d={`M${m.x + Math.sign(t.x - m.x) * 20} ${Y - 34} Q ${(m.x + t.x) / 2} ${Y - 70} ${t.x - Math.sign(t.x - m.x) * 20} ${Y - 34}`}
                      />
                    ));
                })}
            {isLast && (
              <text class="mn-attract" x={160} y={Y + 82} text-anchor="middle">
                + ⟷ −
              </text>
            )}
          </g>
        </g>
      </Stage>
      <p class="mn-caption" data-part="caption">
        {say(locale, WORDS.stepsLong[s.step] as Words)}
      </p>
      {s.compounds.length > 1 && (
        <div class="mn-chips" data-part="compounds">
          {s.compounds.map((c) => (
            <button
              key={c}
              type="button"
              class={c === s.compound ? "mn-chip is-on" : "mn-chip"}
              aria-pressed={c === s.compound}
              onClick={() => call(BondAction.Choose, { compound: c })}
            >
              {COMPOUNDS[c].formula}
            </button>
          ))}
        </div>
      )}
      {s.canStep && (
        <div class="mn-row is-end">
          <span class="mn-dots" aria-hidden="true">
            {range(BOND_STEPS).map((i) => (
              <span key={i} class={i === s.step ? "mn-dot is-on" : "mn-dot"} />
            ))}
          </span>
          <button
            type="button"
            class="mn-button"
            data-part="next"
            onClick={() => call(BondAction.Next, {})}
          >
            {say(locale, isLast ? WORDS.again : WORDS.next)}
          </button>
        </div>
      )}
    </div>
  );
}
