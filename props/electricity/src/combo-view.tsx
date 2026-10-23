import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ComboAction,
  type ComboItem,
  ComboMode,
  type ComboState,
  MAIN,
  OHM_STEPS,
  PartKind,
  ammeterReadingOf,
  describeCombo,
  glowOf,
  groupsOf,
  partName,
  solve,
  voltmeterReadingOf,
} from "./combo";
import { BatterySymbol, BulbSymbol, MeterSymbol, ResistorSymbol } from "./draw";
import { type Words, amps as ampsText, num, ohms as ohmsText, say } from "./words";

const W = 320;
const TOP = 24;
const LEFT = 22;
const RIGHT = 298;
const HALF = 16;

const WORDS = {
  ammeter: { en: "Ammeter:", hi: "ऐमीटर:" },
  voltmeter: { en: "Voltmeter across:", hi: "वोल्टमीटर किसके सिरों पर:" },
  main: { en: "main line", hi: "मुख्य तार" },
  whole: { en: "the whole", hi: "पूरे संयोजन" },
  none: { en: "none", hi: "कोई नहीं" },
  equivalent: { en: "Equivalent resistance", hi: "तुल्य प्रतिरोध" },
  fromBattery: { en: "current from the battery", hi: "बैटरी से धारा" },
  broken: { en: "broken", hi: "टूटा" },
  breakIt: { en: "Break", hi: "तोड़ो" },
  mend: { en: "Mend", hi: "ठीक करो" },
  open: { en: "∞ (broken circuit)", hi: "∞ (टूटा परिपथ)" },
} as const satisfies Record<string, Words>;

type Place = { x: number; y: number };
type Layout = {
  height: number;
  parts: Place[];
  /** Line segments of plain wire. */
  wires: [number, number, number, number][];
  /** Where the ammeter sits for each choice: main, then part i. */
  ammeterSpots: Place[];
  /** The voltmeter's two ends and its middle for each choice: whole, then part i. */
  voltSpots: { from: Place; to: Place; y: number }[];
};

function layoutOf(s: ComboState): Layout {
  const n = s.parts.length;
  const wires: Layout["wires"] = [];
  const battery = { x: W / 2, y: TOP };
  wires.push([LEFT, TOP, battery.x - 30, TOP], [battery.x + 30, TOP, RIGHT, TOP]);
  if (s.mode === ComboMode.Series) {
    const y = 92;
    const step = (RIGHT - LEFT) / (n + 1);
    const parts = s.parts.map((_, i) => ({ x: LEFT + step * (i + 1), y }));
    wires.push([LEFT, TOP, LEFT, y], [RIGHT, TOP, RIGHT, y]);
    const xs = [LEFT, ...parts.flatMap((p) => [p.x - HALF, p.x + HALF]), RIGHT];
    for (let i = 0; i < xs.length; i += 2) wires.push([xs[i] as number, y, xs[i + 1] as number, y]);
    const ammeterSpots = [
      { x: LEFT, y: (TOP + y) / 2 },
      ...parts.map((p, i) => ({
        x: (p.x + HALF + ((parts[i + 1]?.x ?? RIGHT + HALF) as number) - HALF) / 2,
        y,
      })),
    ];
    const vy = y + 44;
    const voltSpots = [
      {
        from: { x: (parts[0]?.x ?? 0) - HALF - 6, y },
        to: { x: (parts[n - 1]?.x ?? 0) + HALF + 6, y },
        y: vy,
      },
      ...parts.map((p) => ({
        from: { x: p.x - HALF - 4, y },
        to: { x: p.x + HALF + 4, y },
        y: vy,
      })),
    ];
    return { height: vy + 30, parts, wires, ammeterSpots, voltSpots };
  }
  const groups = groupsOf(s);
  const rails =
    s.mode === ComboMode.Parallel
      ? [{ x1: 78, x2: 242 }]
      : [
          { x1: 46, x2: 136 },
          { x1: 172, x2: 284 },
        ];
  const y0 = 70;
  const gap = s.parts.some((p) => p.kind === PartKind.Bulb) ? 60 : 56;
  const parts: Place[] = s.parts.map(() => ({ x: 0, y: 0 }));
  const ammeterSpots: Place[] = [{ x: LEFT, y: (TOP + y0) / 2 }];
  let lowest = y0;
  groups.forEach((g, gi) => {
    const r = rails[gi] as { x1: number; x2: number };
    const mid = (r.x1 + r.x2) / 2 + (s.mode === ComboMode.Parallel ? 14 : 8);
    g.forEach((pi, k) => {
      const y = y0 + gap * k;
      parts[pi] = { x: mid, y };
      wires.push([r.x1, y, mid - HALF, y], [mid + HALF, y, r.x2, y]);
      lowest = Math.max(lowest, y);
    });
    const last = y0 + gap * (g.length - 1);
    wires.push([r.x1, y0, r.x1, last], [r.x2, y0, r.x2, last]);
  });
  // joining wires: in from the left, between groups, out to the right
  const first = rails[0] as { x1: number; x2: number };
  const lastRail = rails[rails.length - 1] as { x1: number; x2: number };
  wires.push(
    [LEFT, TOP, LEFT, y0],
    [LEFT, y0, first.x1, y0],
    [lastRail.x2, y0, RIGHT, y0],
    [RIGHT, TOP, RIGHT, y0],
  );
  if (rails.length === 2) wires.push([first.x2, y0, (rails[1] as { x1: number }).x1, y0]);
  for (const [i, p] of parts.entries()) {
    const g = groups.findIndex((gg) => gg.includes(i));
    const r = rails[g] as { x1: number; x2: number };
    ammeterSpots.push({ x: (r.x1 + p.x - HALF) / 2, y: p.y });
  }
  const vy = lowest + 40;
  // The voltmeter's leads leave each group from its lowest rung, so they don't run over the rails.
  const lastY = (g: number) => y0 + gap * ((groups[g]?.length ?? 1) - 1);
  const voltSpots = [
    {
      from: { x: first.x1, y: lastY(0) },
      to: { x: lastRail.x2, y: lastY(groups.length - 1) },
      y: vy,
    },
    ...parts.map((_, i) => {
      const g = groups.findIndex((gg) => gg.includes(i));
      const r = rails[g] as { x1: number; x2: number };
      return { from: { x: r.x1, y: lastY(g) }, to: { x: r.x2, y: lastY(g) }, y: vy };
    }),
  ];
  return { height: vy + 30, parts, wires, ammeterSpots, voltSpots };
}

function PartSymbol({ p, glow }: { p: ComboItem; glow: number }): JSX.Element {
  if (p.kind === PartKind.Bulb)
    return (
      <g>
        <line class="el-wire" x1={-HALF} y1={0} x2={-11} y2={0} />
        <line class="el-wire" x1={11} y1={0} x2={HALF} y2={0} />
        <BulbSymbol glow={glow} isBroken={p.isBroken} />
      </g>
    );
  return <ResistorSymbol half={HALF} cls={p.isBroken ? "is-broken" : ""} />;
}

export function ComboView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ComboState;
  const k = width / W;
  const L = layoutOf(s);
  const sol = solve(s);
  const glow = glowOf(s);
  const on = sol.total > 0;
  const loc = locale === "hi" ? "hi" : "en";
  const am = L.ammeterSpots[s.ammeterAt + 1] ?? (L.ammeterSpots[0] as Place);
  const vs = s.voltmeterAcross === null ? null : (L.voltSpots[s.voltmeterAcross + 1] ?? null);
  const cells = Math.max(1, Math.min(4, Math.round(s.volts / 1.5)));
  const meterOnPart = s.ammeterAt !== MAIN;
  return (
    <div class="el-rc">
      <Stage
        label={describeCombo(s)}
        x={[0, W]}
        width={width}
        height={Math.round(L.height * k)}
        svg={{ class: "el-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="el-bg" x={0} y={0} width={W} height={L.height} rx={12} />
          {L.wires.map(([x1, y1, x2, y2]) => (
            <line
              key={`${x1}-${y1}-${x2}-${y2}`}
              class={on ? "el-wire is-on" : "el-wire"}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          ))}
          <g transform={`translate(${W / 2} ${TOP})`} data-part="battery">
            <rect class="el-gapfill" x={-30} y={-14} width={60} height={28} />
            <BatterySymbol n={cells} />
          </g>
          <text class="el-small" x={W / 2} y={TOP - 15} text-anchor="middle">
            {num(s.volts)} V
          </text>
          {s.parts.map((p, i) => {
            const at = L.parts[i] as Place;
            const isTappable = s.canBreak && p.kind === PartKind.Bulb;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional (R₁, R₂, …) and never reorder
              <g key={`part${i}`} data-part={`part${i}`}>
                <g transform={`translate(${at.x} ${at.y})`}>
                  <rect class="el-gapfill" x={-HALF} y={-9} width={2 * HALF} height={18} />
                  <PartSymbol p={p} glow={glow[i] ?? 0} />
                </g>
                <text
                  class="el-small"
                  x={at.x}
                  y={at.y - (p.kind === PartKind.Bulb ? 16 : 15)}
                  text-anchor="middle"
                >
                  {partName(s, i, loc)} = {num(p.ohms)} Ω
                </text>
                {s.showValues && (
                  <text class="el-value" x={at.x} y={at.y + 22} text-anchor="middle">
                    {num(sol.currents[i] ?? 0, 2)} A, {num(sol.voltages[i] ?? 0, 2)} V
                  </text>
                )}
                {p.isBroken && (
                  <text
                    class="el-warn"
                    x={at.x}
                    y={at.y + (s.showValues ? 33 : 22)}
                    text-anchor="middle"
                  >
                    {say(locale, WORDS.broken)}
                  </text>
                )}
                {isTappable && (
                  <rect
                    class="el-hit"
                    x={at.x - 22}
                    y={at.y - 22}
                    width={44}
                    height={44}
                    rx={10}
                    role="button"
                    tabIndex={0}
                    aria-label={`${partName(s, i, loc)}: ${p.isBroken ? say(locale, WORDS.mend) : say(locale, WORDS.breakIt)}`}
                    onClick={() => call(ComboAction.ToggleBreak, { index: i })}
                    onKeyDown={(e: JSX.TargetedKeyboardEvent<SVGRectElement>) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        call(ComboAction.ToggleBreak, { index: i });
                      }
                    }}
                  />
                )}
              </g>
            );
          })}
          <g data-part="ammeter">
            <g transform={`translate(${am.x} ${am.y})`}>
              <circle class="el-gapfill-circle" r={12} />
              <MeterSymbol letter="A" />
            </g>
            <text
              class="el-reading"
              x={am.x + (meterOnPart ? 0 : 16)}
              y={am.y + (meterOnPart ? 27 : -4)}
              text-anchor={meterOnPart ? "middle" : "start"}
            >
              {num(ammeterReadingOf(s), 3)} A
            </text>
          </g>
          {vs !== null && (
            <g data-part="voltmeter">
              <line class="el-wire" x1={vs.from.x} y1={vs.from.y} x2={vs.from.x} y2={vs.y} />
              <line class="el-wire" x1={vs.to.x} y1={vs.to.y} x2={vs.to.x} y2={vs.y} />
              <line
                class="el-wire"
                x1={vs.from.x}
                y1={vs.y}
                x2={(vs.from.x + vs.to.x) / 2 - 11}
                y2={vs.y}
              />
              <line
                class="el-wire"
                x1={(vs.from.x + vs.to.x) / 2 + 11}
                y1={vs.y}
                x2={vs.to.x}
                y2={vs.y}
              />
              <circle class="el-joint" cx={vs.from.x} cy={vs.from.y} r={2.5} />
              <circle class="el-joint" cx={vs.to.x} cy={vs.to.y} r={2.5} />
              <g transform={`translate(${(vs.from.x + vs.to.x) / 2} ${vs.y})`}>
                <MeterSymbol letter="V" />
              </g>
              <text class="el-reading" x={(vs.from.x + vs.to.x) / 2 + 20} y={vs.y + 18}>
                {num(voltmeterReadingOf(s) ?? 0, 2)} V
              </text>
            </g>
          )}
        </g>
      </Stage>
      {s.showEquivalent && (
        <div class="el-readout" data-part="readout">
          <span class="el-readout-main">
            {say(locale, WORDS.equivalent)}:{" "}
            {Number.isFinite(sol.equivalent) ? ohmsText(sol.equivalent) : say(locale, WORDS.open)}
          </span>
          <span>
            {say(locale, WORDS.fromBattery)}: {ampsText(sol.total)}
          </span>
        </div>
      )}
      {s.canEdit && (
        <div class="el-controls" data-part="controls">
          {s.parts.map((p, i) => {
            const idx = OHM_STEPS.indexOf(p.ohms);
            const down =
              idx > 0
                ? OHM_STEPS[idx - 1]
                : idx === -1
                  ? OHM_STEPS.filter((v) => v < p.ohms).pop()
                  : undefined;
            const up = idx >= 0 ? OHM_STEPS[idx + 1] : OHM_STEPS.find((v) => v > p.ohms);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and never reorder
              <div key={`edit${i}`} class="el-stepper">
                <button
                  type="button"
                  class="el-button"
                  aria-label="−"
                  disabled={down === undefined}
                  onClick={() => call(ComboAction.SetOhms, { index: i, ohms: down })}
                >
                  −
                </button>
                <span class="el-stepper-value">
                  {partName(s, i, loc)} = {num(p.ohms)} Ω
                </span>
                <button
                  type="button"
                  class="el-button"
                  aria-label="+"
                  disabled={up === undefined}
                  onClick={() => call(ComboAction.SetOhms, { index: i, ohms: up })}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      )}
      {s.canMoveMeters && (
        <div class="el-choices">
          <span class="el-choices-label">{say(locale, WORDS.ammeter)}</span>
          {[MAIN, ...s.parts.map((_, i) => i)].map((at) => (
            <button
              key={`a${at}`}
              type="button"
              class={s.ammeterAt === at ? "el-chip is-on" : "el-chip"}
              aria-pressed={s.ammeterAt === at}
              onClick={() => call(ComboAction.MoveAmmeter, { at })}
            >
              {at === MAIN ? say(locale, WORDS.main) : partName(s, at, loc)}
            </button>
          ))}
        </div>
      )}
      {s.canMoveMeters && s.voltmeterAcross !== null && (
        <div class="el-choices">
          <span class="el-choices-label">{say(locale, WORDS.voltmeter)}</span>
          {[MAIN, ...s.parts.map((_, i) => i)].map((across) => (
            <button
              key={`v${across}`}
              type="button"
              class={s.voltmeterAcross === across ? "el-chip is-on" : "el-chip"}
              aria-pressed={s.voltmeterAcross === across}
              onClick={() => call(ComboAction.MoveVoltmeter, { across })}
            >
              {across === MAIN ? say(locale, WORDS.whole) : partName(s, across, loc)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
