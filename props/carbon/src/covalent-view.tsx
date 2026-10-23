import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { subscript } from "./chem";
import {
  type Atom,
  CovalentAction,
  CovalentPart,
  type CovalentState,
  MOLECULES,
  type Structure,
  bondsAt,
  describeCovalent,
  isComplete,
  loneElectrons,
  marksOf,
  outerCount,
  sharedPairsOf,
} from "./covalent";
import { Button, Controls, Dots, Frame, type Words, say } from "./draw";

const W = 320;
const H = 190;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  apart: {
    en: "The atoms apart: only the outermost electrons are drawn.",
    hi: "परमाणु अलग: केवल सबसे बाहरी इलेक्ट्रॉन दिखाए गए हैं।",
  },
  shared: {
    en: "They share pairs of electrons: every outer shell is now full.",
    hi: "वे इलेक्ट्रॉनों के जोड़े साझा करते हैं: अब हर बाहरी कोश भरा है।",
  },
  lines: {
    en: "Each shared pair drawn as a line: a covalent bond.",
    hi: "हर साझा जोड़ा एक रेखा से: एक सहसंयोजी बंध।",
  },
  pairs: { en: "shared pairs", hi: "साझा जोड़े" },
  full: { en: "outer shells full", hi: "बाहरी कोश भरे" },
} as const satisfies Record<string, Words>;

type P = [number, number];
const DIRS: readonly P[] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

/** Where each atom sits on screen, at this step (apart = spread out). */
function layout(s: Structure, step: number): { pos: P[]; unit: number } {
  const spread = step === 0 ? 1.55 : 1;
  const xs = s.atoms.map((a) => a.x * spread);
  const ys = s.atoms.map((a) => a.y * spread);
  const spanX = Math.max(...xs) - Math.min(...xs) || 1;
  const spanY = Math.max(...ys) - Math.min(...ys) || 1;
  const unit = Math.min(70, (W - 70) / spanX, (H - 60) / spanY);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return {
    unit,
    pos: s.atoms.map((_, i) => [
      W / 2 + ((xs[i] as number) - cx) * unit,
      H / 2 + ((ys[i] as number) - cy) * unit,
    ]),
  };
}

/** Directions from atom i to its bond partners. */
function bondDirs(s: Structure, i: number): P[] {
  const me = s.atoms[i] as Atom;
  return s.bonds.flatMap((b) => {
    if (b.a !== i && b.b !== i) return [];
    const other = s.atoms[b.a === i ? b.b : b.a] as Atom;
    const dx = Math.sign(Math.round((other.x - me.x) * 10));
    const dy = Math.sign(Math.round((other.y - me.y) * 10));
    return [[dx, dy] as P];
  });
}

/** The free sides of an atom for its lone pairs: the side opposite a bond first. */
function freeDirs(s: Structure, i: number): P[] {
  const used = bondDirs(s, i);
  const free = DIRS.filter(([x, y]) => !used.some(([u, v]) => u === x && v === y));
  const first = used[0];
  if (first === undefined) return free;
  const away = free.find(([x, y]) => x === -first[0] && y === -first[1]);
  return away === undefined ? free : [away, ...free.filter((d) => d !== away)];
}

function Electron({ x, y, mark }: { x: number; y: number; mark: "dot" | "cross" }) {
  if (mark === "dot") return <circle class="cb-e-dot" cx={x} cy={y} r={2.7} />;
  return (
    <g class="cb-e-cross">
      <line x1={x - 2.6} y1={y - 2.6} x2={x + 2.6} y2={y + 2.6} />
      <line x1={x - 2.6} y1={y + 2.6} x2={x + 2.6} y2={y - 2.6} />
    </g>
  );
}

function Picture({ s }: { s: CovalentState }) {
  const m = MOLECULES[s.molecule];
  const marks = marksOf(m);
  const { pos, unit } = layout(m, s.step);
  const r = unit * 0.3;
  const out: JSX.Element[] = [];
  // shells: a ring round each atom, overlapping where the atoms share
  if (s.showShells && s.step < 2) {
    for (const [x, y] of pos) {
      out.push(<circle key={`sh${x}-${y}`} class="cb-shell" cx={x} cy={y} r={unit * 0.52} />);
    }
  }
  // bonds
  m.bonds.forEach((b, k) => {
    const [x1, y1] = pos[b.a] as P;
    const [x2, y2] = pos[b.b] as P;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const nx = -uy;
    const ny = ux;
    if (s.step === 2) {
      const pad = 13;
      for (let j = 0; j < b.order; j++) {
        const off = (j - (b.order - 1) / 2) * 5;
        out.push(
          <line
            key={`b${k}-${j}`}
            class="cb-bond"
            x1={x1 + ux * pad + nx * off}
            y1={y1 + uy * pad + ny * off}
            x2={x2 - ux * pad + nx * off}
            y2={y2 - uy * pad + ny * off}
          />,
        );
      }
      return;
    }
    if (s.step === 1) {
      // the shared pairs, side by side between the two atoms
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      for (let j = 0; j < b.order; j++) {
        const off = (j - (b.order - 1) / 2) * 9;
        out.push(
          <Electron
            key={`s${k}-${j}a`}
            x={mx - ux * 4 + nx * off}
            y={my - uy * 4 + ny * off}
            mark={marks[b.a] ?? "dot"}
          />,
          <Electron
            key={`s${k}-${j}b`}
            x={mx + ux * 4 + nx * off}
            y={my + uy * 4 + ny * off}
            mark={marks[b.b] ?? "cross"}
          />,
        );
      }
      return;
    }
    // apart: each atom's bonding electrons point at its partner, unpaired
    for (const [i, sign] of [
      [b.a, 1],
      [b.b, -1],
    ] as const) {
      const [x, y] = pos[i] as P;
      for (let j = 0; j < b.order; j++) {
        const off = (j - (b.order - 1) / 2) * 9;
        out.push(
          <Electron
            key={`u${k}-${i}-${j}`}
            x={x + sign * ux * r + nx * off}
            y={y + sign * uy * r + ny * off}
            mark={marks[i] ?? "dot"}
          />,
        );
      }
    }
  });
  // lone pairs (not drawn once bonds are lines)
  if (s.step < 2) {
    m.atoms.forEach((_, i) => {
      const pairs = loneElectrons(m, i) / 2;
      const dirs = freeDirs(m, i);
      const [x, y] = pos[i] as P;
      for (let p = 0; p < pairs; p++) {
        const d = dirs[p];
        if (d === undefined) continue;
        const [dx, dy] = d;
        const px = x + dx * r;
        const py = y + dy * r;
        out.push(
          <Electron
            key={`l${i}-${p}a`}
            x={px - dy * 4.5}
            y={py - dx * 4.5}
            mark={marks[i] ?? "dot"}
          />,
          <Electron
            key={`l${i}-${p}b`}
            x={px + dy * 4.5}
            y={py + dx * 4.5}
            mark={marks[i] ?? "dot"}
          />,
        );
      }
    });
  }
  // the element symbols on top
  m.atoms.forEach((a, i) => {
    const [x, y] = pos[i] as P;
    out.push(
      <text key={`t${x}-${y}`} class={`cb-symbol is-${a.el}`} x={x} y={y + 5} text-anchor="middle">
        {a.el}
      </text>,
    );
  });
  return <g>{out}</g>;
}

export function CovalentBondView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CovalentState;
  const m = MOLECULES[s.molecule];
  const caption = [WORDS.apart, WORDS.shared, WORDS.lines][s.step] ?? WORDS.apart;
  const counts = m.atoms
    .map((a, i) => ({ el: a.el, n: outerCount(m, i), bonds: bondsAt(m, i) }))
    .filter((c, i, all) => all.findIndex((d) => d.el === c.el) === i)
    .map((c) => `${c.el}: ${c.n}`)
    .join(" · ");
  return (
    <div class="cb cb-covalent">
      <div class="cb-title">
        <span class="cb-formula">{subscript(s.molecule)}</span>
        <span class="cb-name">{say(locale, m.name)}</span>
      </div>
      <Frame w={W} h={H} width={width} label={describeCovalent(s)} cls="cb-covalent-svg">
        <rect class="cb-bg" x={0} y={0} width={W} height={H} />
        <g data-part={CovalentPart.Molecule}>
          <Picture s={s} />
        </g>
      </Frame>
      <p class="cb-caption">{say(locale, caption)}</p>
      {s.showCounts && s.step > 0 && (
        <p class="cb-counts">
          {`${sharedPairsOf(m)} ${say(locale, WORDS.pairs)} · ${counts}${isComplete(m) ? ` ✓ ${say(locale, WORDS.full)}` : ""}`}
        </p>
      )}
      {s.choices.length > 0 && (
        <Controls>
          {s.choices.map((c) => (
            <Button
              key={c}
              part={CovalentPart.Pick}
              label={subscript(c)}
              isOn={c === s.molecule}
              onClick={() => call(CovalentAction.Pick, { molecule: c })}
            />
          ))}
        </Controls>
      )}
      {s.canStep && (
        <Controls>
          {s.step < 2 && (
            <Button
              part={CovalentPart.Next}
              label={say(locale, WORDS.next)}
              onClick={() => call(CovalentAction.Next, {})}
            />
          )}
          {s.step > 0 && (
            <Button
              label={say(locale, WORDS.again)}
              onClick={() => call(CovalentAction.Reset, {})}
            />
          )}
          <Dots step={s.step} count={3} />
        </Controls>
      )}
    </div>
  );
}
