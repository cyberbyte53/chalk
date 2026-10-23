import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Frame, type Words, say, tappable } from "./draw";
import {
  ELEMENTS,
  type Element,
  type Kind,
  RADII,
  configOf,
  element,
  shellsOf,
  trendOf,
  valenceOf,
  valencyOf,
} from "./elements";
import {
  Layout,
  ModernAction,
  ModernPart,
  type ModernState,
  SHORT_GROUPS,
  SHORT_MAX_Z,
  Trend,
  describeModern,
} from "./modern";

const W = 320;

const WORDS = {
  group: { en: "Group", hi: "समूह" },
  period: { en: "Period", hi: "आवर्त" },
  z: { en: "Atomic number", hi: "परमाणु संख्या" },
  mass: { en: "mass", hi: "द्रव्यमान" },
  config: { en: "Electrons", hi: "इलेक्ट्रॉन" },
  valence: { en: "Valence electrons", hi: "संयोजकता इलेक्ट्रॉन" },
  valency: { en: "Valency", hi: "संयोजकता" },
  radius: { en: "Atomic radius", hi: "परमाणु त्रिज्या" },
  metal: { en: "Metal", hi: "धातु" },
  metalloid: { en: "Metalloid", hi: "उपधातु" },
  nonMetal: { en: "Non-metal", hi: "अधातु" },
  inner: { en: "inner row (lanthanoids / actinoids)", hi: "भीतरी पंक्ति (लैंथेनॉइड / ऐक्टिनॉइड)" },
  tap: { en: "Tap an element.", hi: "किसी तत्व पर टैप करो।" },
  first20: { en: "First 20", hi: "पहले 20" },
  all: { en: "All 118", hi: "सभी 118" },
  none: { en: "Plain", hi: "सादा" },
  kind: { en: "Metals", hi: "धातुएँ" },
  valencyT: { en: "Valency", hi: "संयोजकता" },
  size: { en: "Size", hi: "आकार" },
  metallic: { en: "Metallic", hi: "धात्विक" },
  electronegativity: { en: "Gains e⁻", hi: "e⁻ लेना" },
} as const satisfies Record<string, Words>;

const LEGEND: Record<Trend, Words> = {
  none: { en: "", hi: "" },
  kind: {
    en: "Metals on the left, non-metals on the right; metalloids along the zig-zag between them.",
    hi: "धातुएँ बाईं ओर, अधातुएँ दाईं ओर; उपधातुएँ उनके बीच की टेढ़ी-मेढ़ी रेखा पर।",
  },
  valency: {
    en: "Valency across a period: 1, 2, 3, 4, 3, 2, 1, 0. Down a group it stays the same.",
    hi: "आवर्त में बाएँ से दाएँ संयोजकता: 1, 2, 3, 4, 3, 2, 1, 0। समूह में नीचे जाने पर वही रहती है।",
  },
  size: {
    en: "Atomic size: decreases → across a period, increases ↓ down a group (radii in pm).",
    hi: "परमाणु आकार: आवर्त में → घटता है, समूह में ↓ बढ़ता है (त्रिज्या pm में)।",
  },
  metallic: {
    en: "Metallic character: decreases → across a period, increases ↓ down a group.",
    hi: "धात्विक गुण: आवर्त में → घटता है, समूह में ↓ बढ़ता है।",
  },
  electronegativity: {
    en: "Tendency to gain electrons: increases → across a period, decreases ↓ down a group.",
    hi: "इलेक्ट्रॉन लेने की प्रवृत्ति: आवर्त में → बढ़ती है, समूह में ↓ घटती है।",
  },
};

const TREND_LABEL: Record<Trend, Words> = {
  none: WORDS.none,
  kind: WORDS.kind,
  valency: WORDS.valencyT,
  size: WORDS.size,
  metallic: WORDS.metallic,
  electronegativity: WORDS.electronegativity,
};

const KIND_WORDS: Record<Kind, Words> = {
  metal: WORDS.metal,
  metalloid: WORDS.metalloid,
  nonMetal: WORDS.nonMetal,
};

type Cell = { e: Element; x: number; y: number; w: number; h: number };

/** Where each element's tile sits, per layout. */
function cellsOf(layout: Layout): {
  cells: Cell[];
  height: number;
  colX: (g: number) => number | null;
  rowY: (p: number) => number;
  colW: number;
  rowH: number;
  left: number;
  top: number;
} {
  if (layout === Layout.Short) {
    const left = 18;
    const top = 16;
    const colW = (W - left - 6) / SHORT_GROUPS.length;
    const rowH = 40;
    const colX = (g: number) => {
      const i = (SHORT_GROUPS as readonly number[]).indexOf(g);
      return i < 0 ? null : left + i * colW;
    };
    const rowY = (p: number) => top + (p - 1) * rowH;
    const cells = ELEMENTS.filter((e) => e.z <= SHORT_MAX_Z).map((e) => ({
      e,
      x: colX(e.group as number) as number,
      y: rowY(e.period),
      w: colW,
      h: rowH,
    }));
    return { cells, height: top + 4 * rowH + 6, colX, rowY, colW, rowH, left, top };
  }
  const left = 6;
  const top = 12;
  const colW = (W - 2 * left) / 18;
  const rowH = 18;
  const colX = (g: number) => left + (g - 1) * colW;
  const rowY = (p: number) => top + (p - 1) * rowH;
  const innerTop = top + 7 * rowH + 8;
  const cells: Cell[] = ELEMENTS.map((e) => {
    if (e.group !== null) return { e, x: colX(e.group), y: rowY(e.period), w: colW, h: rowH };
    const k = e.z >= 89 ? e.z - 89 : e.z - 57;
    return { e, x: colX(3) + k * colW, y: innerTop + (e.z >= 89 ? rowH : 0), w: colW, h: rowH };
  });
  return { cells, height: innerTop + 2 * rowH + 6, colX, rowY, colW, rowH, left, top };
}

function tileClass(s: ModernState, e: Element): string {
  const out = ["pt-tile"];
  if (s.trend === Trend.Kind) out.push(`is-${e.kind}`);
  if (s.trend === Trend.Valency && valencyOf(e.z) !== null) out.push(`is-v${valencyOf(e.z)}`);
  if (s.selected === e.z) out.push("is-on");
  if (s.highlightGroup !== null && e.group === s.highlightGroup) out.push("is-lit");
  if (s.highlightPeriod !== null && e.period === s.highlightPeriod && e.group !== null)
    out.push("is-lit");
  return out.join(" ");
}

function Shells({ z }: { z: number }) {
  const shells = shellsOf(z) ?? [];
  const size = 92;
  const c = size / 2;
  return (
    <svg
      class="pt-shells"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle class="pt-nucleus" cx={c} cy={c} r={7} />
      <text class="pt-nucleus-text" x={c} y={c + 3} text-anchor="middle">
        {`${z}+`}
      </text>
      {shells.map((n, i) => {
        const r = 14 + i * 10;
        return (
          <g key={r}>
            <circle class="pt-orbit" cx={c} cy={c} r={r} />
            {Array.from({ length: n }, (_, k) => {
              const a = (2 * Math.PI * k) / n - Math.PI / 2;
              return (
                <circle
                  // biome-ignore lint/suspicious/noArrayIndexKey: electrons in a fixed ring
                  key={k}
                  class={i === shells.length - 1 ? "pt-electron is-outer" : "pt-electron"}
                  cx={c + r * Math.cos(a)}
                  cy={c + r * Math.sin(a)}
                  r={2.3}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function ModernView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ModernState;
  const L = cellsOf(s.layout);
  const H = L.height;
  const isShort = s.layout === Layout.Short;
  const sel = s.selected === null ? null : element(s.selected);
  const shading =
    s.trend === Trend.Size || s.trend === Trend.Metallic || s.trend === Trend.Electronegativity;
  return (
    <div class="pt pt-modern">
      <Frame w={W} h={H} width={width} label={describeModern(s)} cls="pt-modern-svg">
        <rect class="pt-bg" x={0} y={0} width={W} height={H} />
        {isShort && (
          <g class="pt-axis">
            {SHORT_GROUPS.map((g) => (
              <text
                key={g}
                class="pt-axis-text"
                x={(L.colX(g) as number) + L.colW / 2}
                y={11}
                text-anchor="middle"
              >
                {g}
              </text>
            ))}
            {[1, 2, 3, 4].map((p) => (
              <text
                key={p}
                class="pt-axis-text"
                x={9}
                y={L.rowY(p) + L.rowH / 2 + 3}
                text-anchor="middle"
              >
                {p}
              </text>
            ))}
          </g>
        )}
        <g data-part={ModernPart.Table}>
          {L.cells.map(({ e, x, y, w, h }) => {
            const score = shading
              ? trendOf(e.z, s.trend as "size" | "metallic" | "electronegativity")
              : null;
            const radius = RADII[e.symbol];
            return (
              <g
                key={e.z}
                class={s.canTap ? "pt-el is-tappable" : "pt-el"}
                {...tappable(
                  s.canTap,
                  () => call(ModernAction.Tap, { z: e.z }),
                  `${e.name.en} ${e.z}`,
                )}
              >
                <rect
                  class={tileClass(s, e)}
                  x={x + 1}
                  y={y + 1}
                  width={w - 2}
                  height={h - 2}
                  rx={isShort ? 5 : 2.5}
                />
                {score !== null && (
                  <rect
                    class="pt-shade"
                    x={x + 1}
                    y={y + 1}
                    width={w - 2}
                    height={h - 2}
                    rx={isShort ? 5 : 2.5}
                    fill-opacity={0.12 + 0.7 * score}
                  />
                )}
                {isShort ? (
                  <>
                    <text class="pt-tile-z" x={x + 5} y={y + 11}>
                      {e.z}
                    </text>
                    <text class="pt-tile-sym" x={x + w / 2} y={y + 27} text-anchor="middle">
                      {e.symbol}
                    </text>
                    {s.trend === Trend.Valency && (
                      <text class="pt-tile-badge" x={x + w - 5} y={y + 11} text-anchor="end">
                        {valencyOf(e.z)}
                      </text>
                    )}
                    {s.trend === Trend.Size && radius !== undefined && (
                      <text class="pt-tile-badge" x={x + w / 2} y={y + 36} text-anchor="middle">
                        {radius}
                      </text>
                    )}
                  </>
                ) : (
                  <text
                    class="pt-tile-sym is-tiny"
                    x={x + w / 2}
                    y={y + h / 2 + 3}
                    text-anchor="middle"
                  >
                    {e.symbol}
                  </text>
                )}
              </g>
            );
          })}
          {!isShort &&
            [6, 7].map((p) => (
              <text
                key={p}
                class="pt-tile-sym is-tiny is-dim"
                x={(L.colX(3) as number) + L.colW / 2}
                y={L.rowY(p) + L.rowH / 2 + 3}
                text-anchor="middle"
              >
                *
              </text>
            ))}
          {!isShort && (
            <rect
              class="pt-tile is-gap-mark"
              x={(L.colX(3) as number) + 1}
              y={L.rowY(6) + 1}
              width={L.colW - 2}
              height={2 * L.rowH - 2}
              rx={2.5}
            />
          )}
        </g>
        {s.highlightGroup !== null && (isShort ? L.colX(s.highlightGroup) !== null : true) && (
          <rect
            class="pt-ring"
            x={(L.colX(s.highlightGroup) as number) + 0.5}
            y={L.rowY(1) + 0.5}
            width={L.colW - 1}
            height={(isShort ? 4 : 7) * L.rowH - 1}
            rx={6}
          />
        )}
        {s.highlightPeriod !== null && (!isShort || s.highlightPeriod <= 4) && (
          <rect
            class="pt-ring"
            x={isShort ? L.left + 0.5 : L.left + 0.5}
            y={L.rowY(s.highlightPeriod) + 0.5}
            width={W - L.left - (isShort ? 6 : L.left) - 1}
            height={L.rowH - 1}
            rx={6}
          />
        )}
      </Frame>
      {s.trend !== Trend.None && (
        <p class="pt-caption" data-part={ModernPart.Legend}>
          {say(locale, LEGEND[s.trend])}
        </p>
      )}
      {s.trend === Trend.Kind && (
        <div class="pt-legend">
          {(["metal", "metalloid", "nonMetal"] as const).map((k) => (
            <span key={k} class="pt-legend-item">
              <span class={`pt-swatch is-${k}`} />
              {say(locale, KIND_WORDS[k])}
            </span>
          ))}
        </div>
      )}
      <div class="pt-elcard" data-part={sel === null ? undefined : ModernPart.Card}>
        {sel === null ? (
          <p class="pt-caption">{s.canTap ? say(locale, WORDS.tap) : ""}</p>
        ) : (
          <div class="pt-elcard-row">
            {s.showShells && sel.z <= SHORT_MAX_Z && (
              <span data-part={ModernPart.Shells}>
                <Shells z={sel.z} />
              </span>
            )}
            <dl class="pt-facts">
              <div class="pt-fact-title">
                <span class="pt-fact-sym">{sel.symbol}</span>
                <span>{say(locale, sel.name)}</span>
              </div>
              <div>
                <dt>{say(locale, WORDS.z)}</dt>
                <dd>{sel.z}</dd>
              </div>
              <div>
                <dt>{say(locale, WORDS.group)}</dt>
                <dd>{sel.group === null ? say(locale, WORDS.inner) : sel.group}</dd>
              </div>
              <div>
                <dt>{say(locale, WORDS.period)}</dt>
                <dd>{sel.period}</dd>
              </div>
              {configOf(sel.z) !== null && (
                <>
                  <div>
                    <dt>{say(locale, WORDS.config)}</dt>
                    <dd>{configOf(sel.z)}</dd>
                  </div>
                  <div>
                    <dt>{say(locale, WORDS.valence)}</dt>
                    <dd>{valenceOf(sel.z)}</dd>
                  </div>
                  <div>
                    <dt>{say(locale, WORDS.valency)}</dt>
                    <dd>{valencyOf(sel.z)}</dd>
                  </div>
                </>
              )}
              {RADII[sel.symbol] !== undefined && (
                <div>
                  <dt>{say(locale, WORDS.radius)}</dt>
                  <dd>{`${RADII[sel.symbol]} pm`}</dd>
                </div>
              )}
              <div>
                <dt>{say(locale, WORDS.mass)}</dt>
                <dd>{`${sel.mass} u · ${say(locale, KIND_WORDS[sel.kind])}`}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
      {(s.trends.length > 0 || s.canSetLayout) && (
        <Controls>
          {s.trends.length > 0 && (
            <span class="pt-trend-buttons" data-part={ModernPart.Trends}>
              {[Trend.None, ...s.trends.filter((t) => t !== Trend.None)].map((t) => (
                <Button
                  key={t}
                  label={say(locale, TREND_LABEL[t])}
                  isOn={s.trend === t}
                  onClick={() => call(ModernAction.SetTrend, { trend: t })}
                />
              ))}
            </span>
          )}
          {s.canSetLayout && (
            <span data-part={ModernPart.Layouts}>
              <Button
                label={say(locale, isShort ? WORDS.all : WORDS.first20)}
                onClick={() =>
                  call(ModernAction.SetLayout, { layout: isShort ? Layout.Full : Layout.Short })
                }
              />
            </span>
          )}
        </Controls>
      )}
    </div>
  );
}
