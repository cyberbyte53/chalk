import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  Allotrope,
  AllotropeAction,
  AllotropePart,
  type AllotropeState,
  FACTS,
  describeAllotrope,
  diamondLattice,
  fullereneAtoms,
  fullereneBonds,
} from "./allotropes";
import { Button, Controls, Frame, type Words, say } from "./draw";

const W = 320;
const H = 190;

const WORDS = {
  diamond: { en: "Diamond", hi: "हीरा" },
  graphite: { en: "Graphite", hi: "ग्रेफ़ाइट" },
  fullerene: { en: "Fullerene C-60", hi: "फ़ुलरीन C-60" },
  bonded: { en: "each carbon bonded to", hi: "हर कार्बन जुड़ा है" },
  others: { en: "others", hi: "अन्य से" },
  conducts: { en: "conducts electricity", hi: "विद्युत का चालक" },
  noConduct: { en: "does not conduct", hi: "विद्युत का चालक नहीं" },
  layer: { en: "one layer", hi: "एक परत" },
} as const satisfies Record<string, Words>;

type P = [number, number];

const DIAMOND = diamondLattice();

function Diamond() {
  // Real diamond-cubic positions, turned and tilted: every inner carbon has four neighbours.
  const tilt = 0.32;
  const turn = 0.5;
  const scale = 24;
  const proj = DIAMOND.atoms.map(([x, y, z]): [number, number, number] => {
    const x0 = x - 2.5;
    const y0 = y - 2.5;
    const z0 = z - 2.5;
    const x1 = x0 * Math.cos(turn) + z0 * Math.sin(turn);
    const z1 = -x0 * Math.sin(turn) + z0 * Math.cos(turn);
    const y2 = y0 * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y0 * Math.sin(tilt) + z1 * Math.cos(tilt);
    return [W / 2 + x1 * scale, H / 2 + y2 * scale, z2];
  });
  const bonds = DIAMOND.bonds
    .map(([a, b]) => ({
      a: proj[a] as [number, number, number],
      b: proj[b] as [number, number, number],
    }))
    .sort((p, q) => p.a[2] + p.b[2] - (q.a[2] + q.b[2]));
  const order = proj.map((p, i) => ({ p, i })).sort((u, v) => u.p[2] - v.p[2]);
  return (
    <g>
      {bonds.map(({ a, b }) => (
        <line
          key={`${a[0]}-${a[1]}-${b[0]}-${b[1]}`}
          class={`cb-net-bond${a[2] + b[2] < 0 ? " is-back" : ""}`}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
        />
      ))}
      {order.map(({ p, i }) => (
        <circle
          key={i}
          class={`cb-net-atom${p[2] < -1 ? " is-back" : ""}`}
          cx={p[0]}
          cy={p[1]}
          r={4.6}
        />
      ))}
    </g>
  );
}

function Graphite({ locale }: { locale: string }) {
  // three hexagonal sheets stacked, seen slanted
  const sheet = (oy: number, k: number) => {
    const out: JSX.Element[] = [];
    const s = 15;
    const hexW = s * Math.sqrt(3);
    const centres: P[] = [];
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 6; c++) centres.push([62 + c * hexW + (r % 2) * (hexW / 2), r * s * 1.5]);
    const project = ([x, y]: P): P => [x + y * 0.8 - 20, oy + y * 0.6];
    for (const [cx, cy] of centres) {
      const corners: P[] = Array.from({ length: 6 }, (_, j) => {
        const a = Math.PI / 6 + (j * Math.PI) / 3;
        return project([cx + s * Math.cos(a), cy + s * Math.sin(a)]);
      });
      out.push(
        <polygon
          key={`${k}-${cx}-${cy}`}
          class={`cb-sheet is-l${k}`}
          points={corners.map((p) => p.join(",")).join(" ")}
        />,
      );
      for (const p of corners)
        out.push(
          <circle
            key={`${k}-${cx}-${cy}-${p[0]}-${p[1]}`}
            class={`cb-sheet-atom is-l${k}`}
            cx={p[0]}
            cy={p[1]}
            r={2.6}
          />,
        );
    }
    return out;
  };
  return (
    <g>
      {sheet(126, 2)}
      {sheet(78, 1)}
      {sheet(30, 0)}
      <text class="cb-label" x={14} y={22}>
        {say(locale, WORDS.layer)}
      </text>
    </g>
  );
}

const C60 = fullereneAtoms();
const C60_BONDS = fullereneBonds(C60);

function Fullerene() {
  const tilt = 0.5;
  const turn = 0.35;
  const scale = 17;
  const cx = W / 2;
  const cy = H / 2;
  const proj = C60.map(([x, y, z]): [number, number, number] => {
    // turn about y, then tilt about x
    const x1 = x * Math.cos(turn) + z * Math.sin(turn);
    const z1 = -x * Math.sin(turn) + z * Math.cos(turn);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    return [cx + x1 * scale, cy + y2 * scale, z2];
  });
  const sorted = C60_BONDS.map(([a, b]) => ({
    a: proj[a] as [number, number, number],
    b: proj[b] as [number, number, number],
  })).sort((p, q) => p.a[2] + p.b[2] - (q.a[2] + q.b[2]));
  return (
    <g>
      {sorted.map(({ a, b }, i) => (
        <line
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed solid
          key={i}
          class={`cb-ball-bond${a[2] + b[2] < 0 ? " is-back" : ""}`}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
        />
      ))}
      {proj
        .filter((p) => p[2] >= 0)
        .map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed solid
          <circle key={i} class="cb-ball-atom" cx={p[0]} cy={p[1]} r={2.8} />
        ))}
    </g>
  );
}

export function AllotropesView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as AllotropeState;
  const f = FACTS[s.kind];
  return (
    <div class="cb cb-allotropes">
      <div class="cb-title">
        <span class="cb-name">{say(locale, WORDS[s.kind])}</span>
      </div>
      <Frame w={W} h={H} width={width} label={describeAllotrope(s)} cls="cb-allotrope-svg">
        <rect class="cb-bg" x={0} y={0} width={W} height={H} />
        <g data-part={AllotropePart.Structure}>
          {s.kind === Allotrope.Diamond && <Diamond />}
          {s.kind === Allotrope.Graphite && <Graphite locale={locale} />}
          {s.kind === Allotrope.Fullerene && <Fullerene />}
        </g>
      </Frame>
      {s.showFacts && (
        <ul class="cb-facts" data-part={AllotropePart.Facts}>
          <li>{`${say(locale, WORDS.bonded)} ${f.bondsPerCarbon} ${say(locale, WORDS.others)}`}</li>
          <li>{say(locale, f.shape)}</li>
          <li>{say(locale, f.feel)}</li>
          {f.conducts !== null && (
            <li>{say(locale, f.conducts ? WORDS.conducts : WORDS.noConduct)}</li>
          )}
        </ul>
      )}
      {s.canPick && (
        <Controls>
          {Object.values(Allotrope).map((k) => (
            <Button
              key={k}
              part={AllotropePart.Pick}
              label={say(locale, WORDS[k])}
              isOn={k === s.kind}
              onClick={() => call(AllotropeAction.Pick, { kind: k })}
            />
          ))}
        </Controls>
      )}
    </div>
  );
}
