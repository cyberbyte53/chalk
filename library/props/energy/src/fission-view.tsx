import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow } from "./draw";
import {
  FissionAction,
  FissionPart,
  type FissionState,
  JOULES_PER_EV,
  MAX_GENERATION,
  MEV_PER_U,
  describeFission,
  fissionsIn,
  mevOf,
  totalFissions,
} from "./fission";
import { type Words, num, range, say } from "./words";

const W = 320;
const H = 230;
const ROW_Y = [26, 82, 140, 198] as const;

const WORDS = {
  next: { en: "Next generation →", hi: "अगली पीढ़ी →" },
  again: { en: "Start again", hi: "फिर से" },
  controlled: { en: "Controlled (reactor)", hi: "नियंत्रित (रिएक्टर)" },
  uncontrolled: { en: "Uncontrolled", hi: "अनियंत्रित" },
  neutron: { en: "slow neutron", hi: "धीमा न्यूट्रॉन" },
  uranium: { en: "uranium nucleus", hi: "यूरेनियम नाभिक" },
  absorbed: { en: "absorbed", hi: "अवशोषित" },
  fissions: { en: "fissions so far", hi: "अब तक विखंडन" },
  massLost: { en: "Mass lost Δm", hi: "द्रव्यमान में कमी Δm" },
  energy: { en: "Energy", hi: "ऊर्जा" },
} as const satisfies Record<string, Words>;

/** A split: two lighter nuclei flying apart, an energy flash, and 3 neutrons. */
function Split({
  x,
  y,
  spread,
  goOn,
  showAbsorbed,
}: {
  x: number;
  y: number;
  spread: number;
  goOn: number;
  showAbsorbed: boolean;
}) {
  const r = Math.max(3.2, Math.min(7, spread / 5));
  const n = 3;
  return (
    <g>
      <circle class="en-flash" cx={x} cy={y} r={r * 1.9} />
      <circle class="en-nucleus is-light" cx={x - r * 1.1} cy={y - r * 0.4} r={r * 0.75} />
      <circle class="en-nucleus is-light" cx={x + r * 1.1} cy={y + r * 0.4} r={r * 0.75} />
      {range(n).map((i) => {
        const dx = (i - 1) * (spread / 3);
        const goes = i < goOn;
        return (
          <g key={i}>
            <line
              class={goes ? "en-neutron-path" : "en-neutron-path is-stopped"}
              x1={x}
              y1={y + r}
              x2={x + dx}
              y2={y + 24}
            />
            <circle
              class={goes ? "en-neutron" : "en-neutron is-absorbed"}
              cx={x + dx}
              cy={y + 24}
              r={2.2}
            />
            {!goes && showAbsorbed && (
              <rect class="en-control-rod" x={x + dx - 1.5} y={y + 27} width={3} height={8} />
            )}
          </g>
        );
      })}
    </g>
  );
}

export function FissionView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as FissionState;
  const k = width / W;
  const rows = range(s.generation).map((i) => i + 1);
  return (
    <div class="en-fi">
      <Stage
        label={describeFission(s)}
        x={[0, W]}
        width={width}
        height={Math.round(H * k)}
        svg={{ class: "en-svg" }}
      >
        <g transform={`scale(${k})`} data-part={FissionPart.Chain}>
          <rect class="en-bg" x={0} y={0} width={W} height={H} rx={12} />
          {/* generation 0: the first neutron heading for the first nucleus */}
          {s.generation === 0 ? (
            <g>
              <circle class="en-neutron" cx={90} cy={ROW_Y[0] + 30} r={3} />
              <Arrow
                cls="en-neutron-arrow"
                x1={96}
                y1={ROW_Y[0] + 30}
                x2={140}
                y2={ROW_Y[0] + 30}
                head={6}
              />
              <circle class="en-nucleus" cx={160} cy={ROW_Y[0] + 30} r={14} />
              <text class="en-tiny" x={90} y={ROW_Y[0] + 50} text-anchor="middle">
                {say(locale, WORDS.neutron)}
              </text>
              <text class="en-tiny" x={160} y={ROW_Y[0] + 58} text-anchor="middle">
                {say(locale, WORDS.uranium)}
              </text>
            </g>
          ) : (
            rows.map((g) => {
              const count = fissionsIn(g, s.isControlled);
              const spread = (W - 20) / count;
              const y = ROW_Y[g - 1] ?? 26;
              return (
                <g key={g}>
                  {range(count).map((i) => (
                    <Split
                      key={i}
                      x={10 + spread * (i + 0.5)}
                      y={y}
                      spread={Math.min(spread, 90)}
                      goOn={s.isControlled ? 1 : 3}
                      showAbsorbed={s.isControlled}
                    />
                  ))}
                  <text class="en-tiny is-strong" x={6} y={y + 4}>
                    {g}
                  </text>
                </g>
              );
            })
          )}
          {s.generation > 0 && (
            <text class="en-small" x={W - 8} y={H - 8} text-anchor="end">
              {totalFissions(s.generation, s.isControlled)} {say(locale, WORDS.fissions)}
            </text>
          )}
          {s.isControlled && s.generation > 0 && (
            <text class="en-tiny" x={8} y={H - 8}>
              ▮ {say(locale, WORDS.absorbed)}
            </text>
          )}
        </g>
      </Stage>
      {s.showCalculator && (
        <div class="en-calc" data-part={FissionPart.Calculator}>
          <span class="en-stepper">
            <button
              type="button"
              class="en-button is-small"
              disabled={!s.canSetMass || s.massLost <= 0}
              onClick={() =>
                call(FissionAction.SetMass, { massLost: Math.max(0, s.massLost - 0.05) })
              }
            >
              −
            </button>
            <span class="en-stepper-value">
              {say(locale, WORDS.massLost)} {num(s.massLost)} u
            </span>
            <button
              type="button"
              class="en-button is-small"
              disabled={!s.canSetMass || s.massLost >= 1}
              onClick={() =>
                call(FissionAction.SetMass, { massLost: Math.min(1, s.massLost + 0.05) })
              }
            >
              +
            </button>
          </span>
          <span>
            {say(locale, WORDS.energy)} = {num(s.massLost)} × {MEV_PER_U} MeV ={" "}
            <strong>{num(mevOf(s.massLost), 1)} MeV</strong> ≈{" "}
            {num(mevOf(s.massLost) * 1e6 * JOULES_PER_EV * 1e11, 2)} × 10⁻¹¹ J
          </span>
        </div>
      )}
      <div class="en-controls" data-part={FissionPart.Controls}>
        {s.canStep &&
          (s.generation < MAX_GENERATION ? (
            <button
              type="button"
              class="en-button is-primary"
              onClick={() => call(FissionAction.Next, {})}
            >
              {say(locale, WORDS.next)}
            </button>
          ) : (
            <button type="button" class="en-button" onClick={() => call(FissionAction.Reset, {})}>
              {say(locale, WORDS.again)}
            </button>
          ))}
        {s.canControl &&
          [true, false].map((c) => (
            <button
              key={String(c)}
              type="button"
              class={s.isControlled === c ? "en-chip is-on" : "en-chip"}
              aria-pressed={s.isControlled === c}
              onClick={() => call(FissionAction.SetControl, { isControlled: c })}
            >
              {say(locale, c ? WORDS.controlled : WORDS.uncontrolled)}
            </button>
          ))}
      </div>
    </div>
  );
}
