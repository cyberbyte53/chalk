import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { BatterySymbol, BulbSymbol, Dial, KeySymbol, MeterSymbol, ResistorSymbol } from "./draw";
import {
  AMMETER_MAX,
  GAP_ORDER,
  GapItem,
  MAX_CELLS,
  OhmAction,
  OhmMode,
  type OhmRow,
  type OhmState,
  ampsOf,
  describeOhm,
  gapAmpsOf,
  slopeOf,
  voltsOf,
} from "./ohm";
import { type Words, amps as ampsText, num, say } from "./words";

const W = 320;

const WORDS = {
  cells: { en: "cells", hi: "सेल" },
  cell: { en: "cell", hi: "सेल" },
  plugIn: { en: "Plug in the key", hi: "कुंजी लगाओ" },
  plugOut: { en: "Take the plug out", hi: "प्लग निकालो" },
  record: { en: "Record reading", hi: "पाठ्यांक लिखो" },
  clear: { en: "Clear table", hi: "तालिका साफ़ करो" },
  number: { en: "Cells", hi: "सेल" },
  current: { en: "I (A)", hi: "I (A)" },
  pd: { en: "V (V)", hi: "V (V)" },
  ratio: { en: "V/I", hi: "V/I" },
  graphI: { en: "current I (A)", hi: "धारा I (A)" },
  graphV: { en: "V (V)", hi: "V (V)" },
  empty: { en: "Readings appear here when you record them.", hi: "पाठ्यांक लिखने पर यहाँ दिखेंगे।" },
  wire: { en: "nichrome wire", hi: "नाइक्रोम तार" },
  overScale: { en: "off the scale!", hi: "पैमाने से बाहर!" },
  nothing: { en: "nothing", hi: "कुछ नहीं" },
  nichrome: { en: "Nichrome wire", hi: "नाइक्रोम तार" },
  torchBulb: { en: "Torch bulb", hi: "टॉर्च बल्ब" },
  bulb10W: { en: "10 W bulb", hi: "10 W बल्ब" },
  copper: { en: "Copper wire", hi: "ताँबे का तार" },
  rubber: { en: "Rubber", hi: "रबड़" },
  glass: { en: "Glass rod", hi: "काँच की छड़" },
  emptyGap: { en: "(gap empty)", hi: "(खाली)" },
  slope: { en: "slope", hi: "ढाल" },
} as const satisfies Record<string, Words>;

const ITEM_WORDS: Readonly<Record<GapItem, Words>> = {
  empty: WORDS.emptyGap,
  nichrome: WORDS.nichrome,
  torchBulb: WORDS.torchBulb,
  bulb10W: WORDS.bulb10W,
  copper: WORDS.copper,
  rubber: WORDS.rubber,
  glass: WORDS.glass,
};

/** The thing in gap XY, centred at (0, 0), about 44 wide. */
function GapThing({ item, isLit }: { item: GapItem; isLit: boolean }): JSX.Element | null {
  switch (item) {
    case GapItem.Empty:
      return null;
    case GapItem.Nichrome:
      return <ResistorSymbol half={22} cls="is-nichrome" />;
    case GapItem.TorchBulb:
      return (
        <g>
          <line class="el-wire" x1={-22} y1={0} x2={-9} y2={0} />
          <line class="el-wire" x1={9} y1={0} x2={22} y2={0} />
          <BulbSymbol r={9} glow={isLit ? 0.8 : 0} />
        </g>
      );
    case GapItem.Bulb10W:
      return (
        <g>
          <line class="el-wire" x1={-22} y1={0} x2={-12} y2={0} />
          <line class="el-wire" x1={12} y1={0} x2={22} y2={0} />
          <BulbSymbol r={12} glow={0} />
        </g>
      );
    case GapItem.Copper:
      return <line class="el-copper" x1={-22} y1={0} x2={22} y2={0} />;
    case GapItem.Rubber:
      return <rect class="el-rubber" x={-22} y={-4} width={44} height={8} rx={4} />;
    case GapItem.Glass:
      return <rect class="el-glass-rod" x={-22} y={-3.5} width={44} height={7} rx={3.5} />;
  }
}

/** The circuit of Fig 12.2 (cells mode) or Fig 12.4 (gap mode). */
function Circuit({ s, locale }: { s: OhmState; locale: string }): JSX.Element {
  const top = 26;
  const bottom = 92;
  const left = 30;
  const right = 290;
  const isGap = s.mode === OhmMode.Gap;
  const on = s.isKeyClosed && (isGap ? gapAmpsOf(s) > 0 : true);
  const wire = (x1: number, y1: number, x2: number, y2: number) => (
    <line class={on ? "el-wire is-on" : "el-wire"} x1={x1} y1={y1} x2={x2} y2={y2} />
  );
  const cells = isGap ? MAX_CELLS : s.cells;
  const half = (cells - 1) * 5 + 14;
  const bx = 100;
  const kx = 220;
  const ax = 90;
  const gx = 215;
  return (
    <g data-part="circuit">
      {wire(left, top, bx - half, top)}
      <g transform={`translate(${bx} ${top})`}>
        <BatterySymbol n={cells} />
      </g>
      <text class="el-small" x={bx} y={top - 16} text-anchor="middle">
        {cells} × 1.5 V
      </text>
      {wire(bx + half, top, kx - 14, top)}
      <g transform={`translate(${kx} ${top})`}>
        <KeySymbol isClosed={s.isKeyClosed} />
      </g>
      {wire(kx + 14, top, right, top)}
      {wire(right, top, right, bottom)}
      {wire(left, top, left, bottom)}
      {wire(left, bottom, ax - 11, bottom)}
      <g transform={`translate(${ax} ${bottom})`} data-part="ammeter">
        <MeterSymbol letter="A" />
      </g>
      {wire(ax + 11, bottom, gx - 22, bottom)}
      <g transform={`translate(${gx} ${bottom})`} data-part={isGap ? "gap" : "wire"}>
        {isGap ? (
          <GapThing item={s.inGap} isLit={gapAmpsOf(s) > 0.3} />
        ) : (
          <ResistorSymbol half={22} cls="is-nichrome" />
        )}
      </g>
      <text class="el-node" x={gx - 26} y={bottom - 10} text-anchor="middle">
        X
      </text>
      <text class="el-node" x={gx + 26} y={bottom - 10} text-anchor="middle">
        Y
      </text>
      {wire(gx + 22, bottom, right, bottom)}
      {!isGap && (
        <g>
          <line class="el-wire" x1={gx - 22} y1={bottom} x2={gx - 22} y2={bottom + 26} />
          <line class="el-wire" x1={gx + 22} y1={bottom} x2={gx + 22} y2={bottom + 26} />
          <line class="el-wire" x1={gx - 22} y1={bottom + 26} x2={gx - 11} y2={bottom + 26} />
          <line class="el-wire" x1={gx + 11} y1={bottom + 26} x2={gx + 22} y2={bottom + 26} />
          <g transform={`translate(${gx} ${bottom + 26})`} data-part="voltmeter">
            <MeterSymbol letter="V" />
          </g>
          <text class="el-small" x={gx} y={bottom - 24} text-anchor="middle">
            {say(locale, WORDS.wire)}
          </text>
        </g>
      )}
      {isGap && (
        <text class="el-small" x={gx} y={bottom + 22} text-anchor="middle">
          {say(locale, ITEM_WORDS[s.inGap])}
        </text>
      )}
    </g>
  );
}

/** The V–I graph: points, and the best line through the origin. */
function Graph({
  rows,
  showRatio,
  locale,
}: { rows: readonly OhmRow[]; showRatio: boolean; locale: string }) {
  const G = { left: 40, right: 304, top: 14, bottom: 150 } as const;
  const maxI = Math.max(1, ...rows.map((r) => r.amps)) * 1.15;
  const maxV = Math.max(1, ...rows.map((r) => r.volts)) * 1.15;
  const niceI = niceMax(maxI);
  const niceV = niceMax(maxV);
  const x = (i: number) => G.left + ((G.right - G.left) * i) / niceI;
  const y = (v: number) => G.bottom - ((G.bottom - G.top) * v) / niceV;
  const k = slopeOf(rows);
  const ticksI = ticks(niceI);
  const ticksV = ticks(niceV);
  const lineEndI = k === null ? 0 : Math.min(niceI, niceV / k);
  return (
    <g data-part="graph">
      <rect class="el-bg" x={0} y={0} width={W} height={182} rx={12} />
      {ticksI.map((t) => (
        <g key={`i${t}`}>
          <line class="el-grid" x1={x(t)} y1={G.top} x2={x(t)} y2={G.bottom} />
          <text class="el-axis-num" x={x(t)} y={G.bottom + 13} text-anchor="middle">
            {num(t)}
          </text>
        </g>
      ))}
      {ticksV.map((t) => (
        <g key={`v${t}`}>
          <line class="el-grid" x1={G.left} y1={y(t)} x2={G.right} y2={y(t)} />
          <text class="el-axis-num" x={G.left - 5} y={y(t) + 4} text-anchor="end">
            {num(t)}
          </text>
        </g>
      ))}
      <line class="el-axis" x1={G.left} y1={G.bottom} x2={G.right} y2={G.bottom} />
      <line class="el-axis" x1={G.left} y1={G.bottom} x2={G.left} y2={G.top} />
      <text class="el-axis-name" x={G.right} y={G.bottom + 28} text-anchor="end">
        {say(locale, WORDS.graphI)}
      </text>
      <text class="el-axis-name" x={G.left + 4} y={G.top + 4}>
        {say(locale, WORDS.graphV)}
      </text>
      {k !== null && rows.filter((r) => r.amps > 0).length >= 2 && (
        <line class="el-fit" x1={x(0)} y1={y(0)} x2={x(lineEndI)} y2={y(k * lineEndI)} />
      )}
      {rows.map((r) => (
        <circle
          key={`${r.amps}-${r.volts}`}
          class="el-point"
          cx={x(r.amps)}
          cy={y(r.volts)}
          r={4}
        />
      ))}
      {showRatio && k !== null && rows.filter((r) => r.amps > 0).length >= 2 && (
        <text class="el-fit-text" x={G.left + 10} y={G.top + 22}>
          {say(locale, WORDS.slope)} = V/I ≈ {num(k, 2)} Ω
        </text>
      )}
    </g>
  );
}

function niceMax(v: number): number {
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100])
    if (m >= v) return m;
  return Math.ceil(v / 10) * 10;
}
function ticks(max: number): number[] {
  const step = max <= 2 ? 0.5 : max <= 5 ? 1 : max <= 10 ? 2 : max <= 20 ? 5 : 10;
  const out: number[] = [];
  for (let t = step; t <= max + 1e-9; t += step) out.push(Math.round(t * 100) / 100);
  return out;
}

export function OhmView({ view, width, locale, call }: PropViewProps): JSX.Element {
  const s = view as unknown as OhmState;
  const k = width / W;
  const isGap = s.mode === OhmMode.Gap;
  const isData = s.mode === OhmMode.Data;
  const circuitH = isGap ? 124 : 132;
  const dialsH = 86;
  const gapI = gapAmpsOf(s);
  return (
    <div class="el-ol">
      {!isData && (
        <Stage
          label={describeOhm(s)}
          x={[0, W]}
          width={width}
          height={Math.round((circuitH + dialsH) * k)}
          svg={{ class: "el-svg" }}
        >
          <g transform={`scale(${k})`}>
            <rect class="el-bg" x={0} y={0} width={W} height={circuitH + dialsH} rx={12} />
            <Circuit s={s} locale={locale} />
            <g transform={`translate(0 ${circuitH})`}>
              {isGap ? (
                <Dial
                  x={W / 2}
                  y={36}
                  value={gapI}
                  max={AMMETER_MAX}
                  letter="A"
                  reading={gapI > AMMETER_MAX ? say(locale, WORDS.overScale) : ampsText(gapI)}
                />
              ) : (
                <>
                  <Dial
                    x={95}
                    y={36}
                    value={ampsOf(s)}
                    max={AMMETER_MAX}
                    letter="A"
                    reading={`${num(ampsOf(s), 2)} A`}
                  />
                  <Dial
                    x={225}
                    y={36}
                    value={voltsOf(s)}
                    max={6}
                    ticks={6}
                    letter="V"
                    reading={`${num(voltsOf(s), 2)} V`}
                  />
                </>
              )}
            </g>
          </g>
        </Stage>
      )}
      {!isGap && s.showTable && (
        <table class="el-table" data-part="table">
          <thead>
            <tr>
              {!isData && <th>{say(locale, WORDS.number)}</th>}
              <th>{say(locale, WORDS.current)}</th>
              <th>{say(locale, WORDS.pd)}</th>
              {s.showRatio && <th>{say(locale, WORDS.ratio)}</th>}
            </tr>
          </thead>
          <tbody>
            {s.rows.length === 0 ? (
              <tr>
                <td colSpan={4} class="el-table-empty">
                  {say(locale, WORDS.empty)}
                </td>
              </tr>
            ) : (
              s.rows.map((r) => (
                <tr key={`${r.cells}-${r.amps}`}>
                  {!isData && <td>{r.cells}</td>}
                  <td>{num(r.amps, 2)}</td>
                  <td>{num(r.volts, 2)}</td>
                  {s.showRatio && <td>{r.amps > 0 ? num(r.volts / r.amps, 2) : "—"}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {!isGap && s.showGraph && (
        <Stage
          label="V–I graph"
          x={[0, W]}
          width={width}
          height={Math.round(182 * k)}
          svg={{ class: "el-svg" }}
        >
          <g transform={`scale(${k})`}>
            <Graph rows={s.rows} showRatio={s.showRatio} locale={locale} />
          </g>
        </Stage>
      )}
      {!isData && (
        <div class="el-controls" data-part="controls">
          {!isGap && s.canSetCells && (
            <div class="el-stepper">
              <button
                type="button"
                class="el-button"
                aria-label="−"
                disabled={s.cells <= 1}
                onClick={() => call(OhmAction.SetCells, { cells: s.cells - 1 })}
              >
                −
              </button>
              <span class="el-stepper-value">
                {s.cells} {say(locale, s.cells === 1 ? WORDS.cell : WORDS.cells)}
              </span>
              <button
                type="button"
                class="el-button"
                aria-label="+"
                disabled={s.cells >= MAX_CELLS}
                onClick={() => call(OhmAction.SetCells, { cells: s.cells + 1 })}
              >
                +
              </button>
            </div>
          )}
          <button
            type="button"
            class={s.isKeyClosed ? "el-button is-on" : "el-button"}
            aria-pressed={s.isKeyClosed}
            onClick={() => call(OhmAction.SetKey, { isClosed: !s.isKeyClosed })}
          >
            {say(locale, s.isKeyClosed ? WORDS.plugOut : WORDS.plugIn)}
          </button>
          {!isGap && s.canRecord && (
            <button
              type="button"
              class="el-button is-primary"
              disabled={!s.isKeyClosed}
              onClick={() => call(OhmAction.Record, {})}
            >
              {say(locale, WORDS.record)}
            </button>
          )}
          {!isGap && s.canRecord && s.rows.length > 0 && (
            <button type="button" class="el-button" onClick={() => call(OhmAction.ClearTable, {})}>
              {say(locale, WORDS.clear)}
            </button>
          )}
        </div>
      )}
      {isGap && s.canChooseGap && (
        <div class="el-choices">
          {GAP_ORDER.map((item) => (
            <button
              key={item}
              type="button"
              class={s.inGap === item ? "el-chip is-on" : "el-chip"}
              aria-pressed={s.inGap === item}
              onClick={() => call(OhmAction.PutInGap, { item })}
            >
              {say(locale, ITEM_WORDS[item])}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
