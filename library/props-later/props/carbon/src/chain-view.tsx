import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  CLASS_WORDS,
  ChainAction,
  ChainPart,
  type ChainState,
  Group,
  MAX_CARBONS,
  Shape,
  bookFormula,
  ccBonds,
  classOf,
  countsOf,
  describeChain,
  hydrogensOf,
  mainLength,
  nameOf,
} from "./chain";
import { massOf, subscript } from "./chem";
import { Button, Controls, Frame, type Words, say } from "./draw";

const W = 320;
const H = 196;
const CY = 100;

const WORDS = {
  carbons: { en: "Carbons", hi: "कार्बन" },
  shape: { en: "Shape", hi: "आकार" },
  bond: { en: "C–C bond", hi: "C–C बंध" },
  group: { en: "Group", hi: "समूह" },
  straight: { en: "straight", hi: "सीधी" },
  branched: { en: "branched", hi: "शाखित" },
  doubly: { en: "2 branches", hi: "2 शाखाएँ" },
  ring: { en: "ring", hi: "वलय" },
  none: { en: "none", hi: "कोई नहीं" },
  single: { en: "single", hi: "एकल" },
  double: { en: "double", hi: "द्वि" },
  triple: { en: "triple", hi: "त्रि" },
  benzene: { en: "alternate (benzene)", hi: "एकांतर (बेंज़ीन)" },
  mass: { en: "molecular mass", hi: "आणविक द्रव्यमान" },
} as const satisfies Record<string, Words>;

const GROUP_LABEL: Readonly<Record<Group, string>> = {
  none: "–",
  chloro: "–Cl",
  bromo: "–Br",
  alcohol: "–OH",
  aldehyde: "–CHO",
  ketone: ">C=O",
  acid: "–COOH",
};

type P = [number, number];

function Atom({ x, y, el, cls = "" }: { x: number; y: number; el: string; cls?: string }) {
  return (
    <text class={`cb-atom is-${el} ${cls}`} x={x} y={y + 5} text-anchor="middle">
      {el}
    </text>
  );
}

/** A bond of `order` lines from a to b, trimmed so it doesn't run into the letters. */
function Bond({ a, b, order = 1, pad = 9 }: { a: P; b: P; order?: number; pad?: number }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  const nx = -uy;
  const ny = ux;
  return (
    <g class="cb-bonds">
      {Array.from({ length: order }, (_, j) => {
        const off = (j - (order - 1) / 2) * 4.5;
        return (
          <line
            // biome-ignore lint/suspicious/noArrayIndexKey: parallel lines of one bond
            key={j}
            class="cb-bond"
            x1={a[0] + ux * pad + nx * off}
            y1={a[1] + uy * pad + ny * off}
            x2={b[0] - ux * pad + nx * off}
            y2={b[1] - uy * pad + ny * off}
          />
        );
      })}
    </g>
  );
}

/** Hydrogens round a carbon at `c`, in the given free directions (first ones used first). */
function hydrogens(c: P, count: number, dirs: readonly P[], arm: number, key: string) {
  return dirs.slice(0, count).map(([dx, dy], i) => {
    const h: P = [c[0] + dx * arm, c[1] + dy * arm];
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed drawing
      <g key={`${key}-${i}`}>
        <Bond a={c} b={h} pad={8} />
        <Atom x={h[0]} y={h[1]} el="H" />
      </g>
    );
  });
}

const UP: P = [0, -1];
const DOWN: P = [0, 1];
const LEFT: P = [-1, 0];
const RIGHT: P = [1, 0];

function rightExtra(g: Group): number {
  if (g === Group.Alcohol || g === Group.Acid) return 66;
  if (g === Group.Chloro || g === Group.Bromo || g === Group.Aldehyde) return 36;
  return 30;
}

function StraightPicture({ s }: { s: ChainState }) {
  const L = mainLength(s);
  const hs = hydrogensOf(s);
  const cc = ccBonds(s);
  const left = s.showH ? 30 : 0;
  const right = s.showH ? rightExtra(s.group) : 0;
  const sp = L <= 1 ? 0 : Math.min(48, (W - 34 - left - right) / (L - 1));
  const span = (L - 1) * sp;
  const x0 = (W - span - left - right) / 2 + left;
  const branched = s.shape !== Shape.Straight;
  const arm = 30;
  const pos: P[] = Array.from({ length: L }, (_, i) => [x0 + i * sp, CY]);
  const out: JSX.Element[] = [];
  cc.forEach((o, i) => {
    const a = pos[i] as P;
    out.push(<Bond key={`cc${a[0]}`} a={a} b={pos[i + 1] as P} order={o} />);
  });
  // branches on C2
  const branches: P[] = [];
  if (s.shape === Shape.Branched) branches.push(DOWN);
  if (s.shape === Shape.DoublyBranched) branches.push(DOWN, UP);
  const c2 = pos[1];
  if (branched && c2 !== undefined) {
    for (const d of branches) {
      const m: P = [c2[0], c2[1] + d[1] * 44];
      out.push(<Bond key={`br${m[1]}`} a={c2} b={m} />);
      out.push(<Atom key={`brc${m[1]}`} x={m[0]} y={m[1]} el="C" />);
      if (s.showH) out.push(...hydrogens(m, 3, [LEFT, RIGHT, d], 26, `brh${m[1]}`));
    }
  }
  pos.forEach((p, i) => {
    out.push(<Atom key={`c${p[0]}`} x={p[0]} y={p[1]} el="C" />);
    if (!s.showH) return;
    const isFirst = i === 0;
    const isLast = i === L - 1;
    let free: P[] = [];
    const upTaken =
      (s.group === Group.Ketone && i === 1) ||
      ((s.group === Group.Aldehyde || s.group === Group.Acid) && isLast) ||
      (branched && i === 1 && s.shape === Shape.DoublyBranched);
    const downTaken = branched && i === 1;
    // a carbon with a triple bond keeps its hydrogen in line with the chain
    const hasTriple = (cc[i - 1] ?? 1) === 3 || (cc[i] ?? 1) === 3;
    if (!hasTriple) {
      if (!upTaken) free.push(UP);
      if (!downTaken) free.push(DOWN);
    }
    if (isFirst) free.push(LEFT);
    if (isLast && (s.group === Group.None || s.group === Group.Ketone)) free.push(RIGHT);
    if (isLast && s.group === Group.Aldehyde) free = L === 1 ? [RIGHT, LEFT] : [RIGHT, ...free];
    out.push(...hydrogens(p, hs[i] ?? 0, free, arm, `h${i}`));
    // the functional group
    if (s.group === Group.Ketone && i === 1) {
      const o: P = [p[0], p[1] - 34];
      out.push(<Bond key="ko" a={p} b={o} order={2} />, <Atom key="kO" x={o[0]} y={o[1]} el="O" />);
    }
    if (isLast && (s.group === Group.Aldehyde || s.group === Group.Acid)) {
      const o: P = [p[0], p[1] - 34];
      out.push(<Bond key="ao" a={p} b={o} order={2} />, <Atom key="aO" x={o[0]} y={o[1]} el="O" />);
    }
    if (isLast && (s.group === Group.Alcohol || s.group === Group.Acid)) {
      const o: P = [p[0] + 32, p[1]];
      const h: P = [o[0] + 28, o[1]];
      out.push(
        <Bond key="oh1" a={p} b={o} />,
        <Atom key="ohO" x={o[0]} y={o[1]} el="O" />,
        <Bond key="oh2" a={o} b={h} pad={8} />,
        <Atom key="ohH" x={h[0]} y={h[1]} el="H" />,
      );
    }
    if (isLast && (s.group === Group.Chloro || s.group === Group.Bromo)) {
      const el = s.group === Group.Chloro ? "Cl" : "Br";
      const x: P = [p[0] + 34, p[1]];
      out.push(
        <Bond key="x1" a={p} b={x} pad={10} />,
        <Atom key="xX" x={x[0] + 2} y={x[1]} el={el} cls="is-hetero" />,
      );
    }
  });
  return <g>{out}</g>;
}

function RingPicture({ s }: { s: ChainState }) {
  const n = s.carbons;
  const R = n === 3 ? 34 : 42;
  const cx = W / 2;
  const cy = CY;
  const cc = ccBonds(s);
  const hs = hydrogensOf(s);
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pos: P[] = Array.from({ length: n }, (_, i) => [
    cx + R * Math.cos(angle(i)),
    cy + R * Math.sin(angle(i)),
  ]);
  const out: JSX.Element[] = [];
  cc.forEach((o, i) => {
    const a = pos[i] as P;
    const b = pos[(i + 1) % n] as P;
    out.push(<Bond key={`r${a[0]}-${a[1]}`} a={a} b={b} />);
    if (o === 2) {
      // the second line of a ring double bond, drawn just inside the ring
      const k = 0.78;
      const ia: P = [cx + (a[0] - cx) * k, cy + (a[1] - cy) * k];
      const ib: P = [cx + (b[0] - cx) * k, cy + (b[1] - cy) * k];
      out.push(<Bond key={`ri${a[0]}-${a[1]}`} a={ia} b={ib} pad={8} />);
    }
  });
  pos.forEach((p, i) => {
    out.push(<Atom key={`c${p[0]}-${p[1]}`} x={p[0]} y={p[1]} el="C" />);
    if (!s.showH) return;
    const count = hs[i] ?? 0;
    const base = angle(i);
    const spread = count === 2 ? [-0.42, 0.42] : [0];
    for (const d of spread.slice(0, count)) {
      const len = 30;
      const h: P = [p[0] + len * Math.cos(base + d), p[1] + len * Math.sin(base + d)];
      out.push(
        <Bond key={`rh${h[0]}-${h[1]}`} a={p} b={h} pad={8} />,
        <Atom key={`rH${h[0]}-${h[1]}`} x={h[0]} y={h[1]} el="H" />,
      );
    }
  });
  return <g>{out}</g>;
}

export function CarbonChainView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ChainState;
  const name = nameOf(s);
  const counts = countsOf(s);
  const cls = classOf(s);
  const ringOrBranch = s.shape !== Shape.Straight;
  return (
    <div class="cb cb-chain">
      {(s.showName || s.showFormula) && (
        <div class="cb-title">
          {s.showFormula && <span class="cb-formula">{subscript(bookFormula(s))}</span>}
          {s.showName && <span class="cb-name">{say(locale, name)}</span>}
        </div>
      )}
      <Frame w={W} h={H} width={width} label={describeChain(s)} cls="cb-chain-svg">
        <rect class="cb-bg" x={0} y={0} width={W} height={H} />
        <g data-part={ChainPart.Molecule}>
          {s.shape === Shape.Ring ? <RingPicture s={s} /> : <StraightPicture s={s} />}
        </g>
      </Frame>
      {s.showName && <p class="cb-caption">{say(locale, CLASS_WORDS[cls])}</p>}
      {s.showMass && (
        <p class="cb-counts">
          {`${say(locale, WORDS.mass)}: ${(counts.C ?? 0) > 0 ? `${massOf(counts)} u` : ""}`}
        </p>
      )}
      {s.canSetCarbons && (
        <Controls>
          <span class="cb-row-label">{say(locale, WORDS.carbons)}</span>
          {Array.from({ length: MAX_CARBONS }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              part={ChainPart.Carbons}
              label={`${n}`}
              isOn={n === s.carbons}
              onClick={() => call(ChainAction.SetCarbons, { carbons: n })}
            />
          ))}
        </Controls>
      )}
      {s.canSetShape && (
        <Controls>
          <span class="cb-row-label">{say(locale, WORDS.shape)}</span>
          {(
            [
              [Shape.Straight, WORDS.straight],
              [Shape.Branched, WORDS.branched],
              [Shape.DoublyBranched, WORDS.doubly],
              [Shape.Ring, WORDS.ring],
            ] as const
          ).map(([shape, w]) => (
            <Button
              key={shape}
              part={ChainPart.Shape}
              label={say(locale, w)}
              isOn={shape === s.shape}
              onClick={() => call(ChainAction.SetShape, { shape })}
            />
          ))}
        </Controls>
      )}
      {s.canSetBonds && s.carbons > 1 && (
        <Controls>
          <span class="cb-row-label">{say(locale, WORDS.bond)}</span>
          {s.shape === Shape.Ring ? (
            <>
              <Button
                part={ChainPart.Bond}
                label={say(locale, WORDS.single)}
                isOn={ccBonds(s).every((o) => o === 1)}
                onClick={() => call(ChainAction.SetBond, { index: 0, order: 1 })}
              />
              {s.carbons === 6 && (
                <Button
                  part={ChainPart.Bond}
                  label={say(locale, WORDS.benzene)}
                  isOn={ccBonds(s).some((o) => o === 2)}
                  onClick={() => call(ChainAction.SetBond, { index: 0, order: 2 })}
                />
              )}
            </>
          ) : ringOrBranch ? null : (
            ([1, 2, 3] as const).map((order) => (
              <Button
                key={order}
                part={ChainPart.Bond}
                label={say(
                  locale,
                  [WORDS.single, WORDS.double, WORDS.triple][order - 1] ?? WORDS.single,
                )}
                isOn={
                  (ccBonds(s)[0] ?? 1) === order &&
                  ccBonds(s)
                    .slice(1)
                    .every((o) => o === 1)
                }
                onClick={() => call(ChainAction.SetBond, { index: 0, order })}
              />
            ))
          )}
        </Controls>
      )}
      {s.canSetGroup && s.shape === Shape.Straight && (
        <Controls>
          <span class="cb-row-label">{say(locale, WORDS.group)}</span>
          {[Group.None, ...s.groups].map((g) => (
            <Button
              key={g}
              part={ChainPart.Group}
              label={g === Group.None ? say(locale, WORDS.none) : GROUP_LABEL[g]}
              isOn={g === s.group}
              onClick={() => call(ChainAction.SetGroup, { group: g })}
            />
          ))}
        </Controls>
      )}
    </div>
  );
}
