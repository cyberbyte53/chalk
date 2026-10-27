import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Frame, type Words, range, say, tappable } from "./draw";
import {
  Anomaly,
  EKA_ALUMINIUM_TABLE,
  GAPS,
  GROUP_NAMES,
  Gap,
  HYDRIDES,
  MENDELEEV_ROWS,
  MendeleevAction,
  MendeleevMode,
  MendeleevPart,
  type MendeleevState,
  NOBLE,
  OXIDES,
  type Slot,
  describeMendeleev,
  hydrideOf,
  mendeleevGroupOf,
  oxideOf,
} from "./mendeleev";

const W = 320;

const WORDS = {
  group: { en: "Group", hi: "समूह" },
  oxide: { en: "oxide", hi: "ऑक्साइड" },
  hydride: { en: "hydride", hi: "हाइड्राइड" },
  tapCard: {
    en: "Tap a card: its group gives its formulae.",
    hi: "किसी कार्ड पर टैप करो: उसका समूह उसके सूत्र बताता है।",
  },
  tapGap: {
    en: "Tap a ? to see what was found later.",
    hi: "बाद में क्या मिला, देखने के लिए ? पर टैप करो।",
  },
  table: { en: "Table", hi: "सारणी" },
  predict: { en: "Prediction", hi: "भविष्यवाणी" },
  anomalies: { en: "Problems", hi: "कमियाँ" },
  property: { en: "Property", hi: "गुण" },
  eka: { en: "Eka-aluminium", hi: "एका-ऐलुमिनियम" },
  gallium: { en: "Gallium", hi: "गैलियम" },
  reveal: { en: "Reveal gallium", hi: "गैलियम दिखाओ" },
  predicted: { en: "predicted 1871", hi: "1871 में भविष्यवाणी" },
  found: { en: "found 1875", hi: "1875 में खोजा" },
  coNi: { en: "Co before Ni", hi: "Ni से पहले Co" },
  hydrogen: { en: "Hydrogen", hi: "हाइड्रोजन" },
  isotopes: { en: "Isotopes", hi: "समस्थानिक" },
  byMass: { en: "by mass: Ni first", hi: "द्रव्यमान से: पहले Ni" },
  byLikeness: {
    en: "placed by likeness: Co first",
    hi: "समानता से रखा: पहले Co",
  },
  alkali: { en: "like alkali metals", hi: "क्षार धातुओं जैसा" },
  halogen: { en: "like halogens", hi: "हैलोजन जैसा" },
  where: { en: "where does it go?", hi: "यह कहाँ जाए?" },
  same: { en: "same chemistry", hi: "एक जैसे रासायनिक गुण" },
  slots: { en: "one slot or two?", hi: "एक खाना या दो?" },
  noble: { en: "added later", hi: "बाद में जोड़ा" },
  mass: { en: "mass", hi: "द्रव्यमान" },
} as const satisfies Record<string, Words>;

const SUB = "₀₁₂₃₄₅₆₇₈₉";
/** K2O → K₂O. */
export const pretty = (formula: string): string =>
  formula.replace(/(?<=[A-Za-z)])(\d+)/g, (d) => [...d].map((c) => SUB[Number(c)]).join(""));

const EKA_SHORT: Record<Gap, string> = {
  ekaBoron: "eka-B",
  ekaAluminium: "eka-Al",
  ekaSilicon: "eka-Si",
};

type Bits = { s: MendeleevState; call: PropViewProps["call"]; locale: string; width: number };

function Table({ s, call, locale, width }: Bits) {
  const cols = s.showNoble ? 9 : 8;
  const left = 6;
  const colW = (W - 2 * left) / cols;
  const head = s.showFormulas ? 44 : 22;
  const rowH = 24;
  const H = head + MENDELEEV_ROWS.length * rowH + 8;
  const x0 = (g: number) => left + colW * g;
  const cell = (slot: Slot, x: number, y: number, w: number, key: string, small = false) => {
    if (slot === null) return null;
    if ("gap" in slot) {
      const isOpen = s.revealed.includes(slot.gap);
      const found = GAPS[slot.gap];
      return (
        <g
          key={key}
          class={s.canReveal && !isOpen ? "pt-m-gap is-tappable" : "pt-m-gap"}
          {...tappable(
            s.canReveal && !isOpen,
            () => call(MendeleevAction.Reveal, { gap: slot.gap }),
            EKA_SHORT[slot.gap],
          )}
        >
          <rect
            class={isOpen ? "pt-m-cell is-found" : "pt-m-cell is-gap"}
            x={x + 1.5}
            y={y + 1.5}
            width={w - 3}
            height={rowH - 3}
            rx={4}
          />
          <text class="pt-m-sym" x={x + w / 2} y={y + 12} text-anchor="middle">
            {isOpen ? found.found : "?"}
          </text>
          <text class="pt-m-mass" x={x + w / 2} y={y + 20} text-anchor="middle">
            {isOpen ? String(found.mass) : `${EKA_SHORT[slot.gap]} ${found.predicted}`}
          </text>
        </g>
      );
    }
    const isSel = s.selected === slot.symbol;
    return (
      <g
        key={key}
        class={s.canTap ? "pt-m-el is-tappable" : "pt-m-el"}
        {...tappable(
          s.canTap,
          () => call(MendeleevAction.Tap, { symbol: slot.symbol }),
          slot.symbol,
        )}
      >
        <rect
          class={isSel ? "pt-m-cell is-on" : "pt-m-cell"}
          x={x + 1}
          y={y + 1.5}
          width={w - 2}
          height={rowH - 3}
          rx={4}
        />
        <text
          class={small ? "pt-m-sym is-small" : "pt-m-sym"}
          x={x + w / 2}
          y={small ? y + 15 : y + 12}
          text-anchor="middle"
        >
          {slot.symbol}
        </text>
        {!small && (
          <text class="pt-m-mass" x={x + w / 2} y={y + 20} text-anchor="middle">
            {String(slot.mass)}
          </text>
        )}
      </g>
    );
  };
  return (
    <Frame w={W} h={H} width={width} label={describeMendeleev(s)} cls="pt-m-svg">
      <rect class="pt-bg" x={0} y={0} width={W} height={H} />
      <g data-part={MendeleevPart.Formulae}>
        {range(cols).map((g) => {
          const isNoble = g === 8;
          return (
            <g key={g}>
              <text class="pt-m-head" x={x0(g) + colW / 2} y={14} text-anchor="middle">
                {isNoble ? "0" : GROUP_NAMES[g]}
              </text>
              {s.showFormulas && !isNoble && (
                <>
                  <text class="pt-m-formula" x={x0(g) + colW / 2} y={27} text-anchor="middle">
                    {pretty(OXIDES[g] as string)}
                  </text>
                  <text
                    class="pt-m-formula is-dim"
                    x={x0(g) + colW / 2}
                    y={38}
                    text-anchor="middle"
                  >
                    {pretty(HYDRIDES[g] as string)}
                  </text>
                </>
              )}
              {s.showFormulas && isNoble && (
                <text class="pt-m-formula is-dim" x={x0(g) + colW / 2} y={30} text-anchor="middle">
                  {say(locale, WORDS.noble)}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <g data-part={MendeleevPart.Table}>
        {range(MENDELEEV_ROWS.length).map((r) => {
          const row = MENDELEEV_ROWS[r] ?? [];
          const y = head + r * rowH;
          return (
            <g key={r}>
              {range(row.length).map((g) => {
                const slot = row[g] ?? null;
                if (Array.isArray(slot)) {
                  const w = colW / 3;
                  return (
                    <g key={g}>
                      {(slot as Slot[]).map((x, i) =>
                        cell(x, x0(g) + i * w, y, w, `${r}-${g}-${i}`, true),
                      )}
                    </g>
                  );
                }
                return cell(slot as Slot, x0(g), y, colW, `${r}-${g}`);
              })}
              {s.showNoble && r >= 1 && r <= 5 && (
                <g key="noble">
                  <rect
                    class="pt-m-cell is-noble"
                    x={x0(8) + 1}
                    y={y + 1.5}
                    width={colW - 2}
                    height={rowH - 3}
                    rx={4}
                  />
                  <text class="pt-m-sym" x={x0(8) + colW / 2} y={y + 15} text-anchor="middle">
                    {NOBLE[r - 1]}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </Frame>
  );
}

function Predict({ s, locale, width }: Bits) {
  const H = 132;
  const isOpen = s.revealed.includes(Gap.EkaAluminium);
  const colX = [10, 128, 228];
  const rowY = (i: number) => 52 + i * 26;
  return (
    <Frame w={W} h={H} width={width} label={describeMendeleev(s)} cls="pt-m-svg">
      <rect class="pt-bg" x={0} y={0} width={W} height={H} />
      <g data-part={MendeleevPart.Predict}>
        <text class="pt-p-head" x={colX[0]} y={22}>
          {say(locale, WORDS.property)}
        </text>
        <text class="pt-p-head" x={colX[1]} y={22}>
          {say(locale, WORDS.eka)}
        </text>
        <text class="pt-p-sub" x={colX[1]} y={34}>
          {say(locale, WORDS.predicted)}
        </text>
        <text class="pt-p-head" x={colX[2]} y={22}>
          {say(locale, WORDS.gallium)}
        </text>
        <text class="pt-p-sub" x={colX[2]} y={34}>
          {say(locale, WORDS.found)}
        </text>
        {EKA_ALUMINIUM_TABLE.map((row, i) => (
          <g key={row.property.en}>
            <rect class="pt-p-row" x={6} y={rowY(i) - 15} width={W - 12} height={22} rx={6} />
            <text class="pt-p-cell" x={colX[0]} y={rowY(i)}>
              {say(locale, row.property)}
            </text>
            <text class="pt-p-cell is-strong" x={colX[1]} y={rowY(i)}>
              {pretty(row.eka)}
            </text>
            <text
              class={isOpen ? "pt-p-cell is-strong is-good" : "pt-p-cell is-dim"}
              x={colX[2]}
              y={rowY(i)}
            >
              {isOpen ? pretty(row.gallium) : "?"}
            </text>
          </g>
        ))}
      </g>
    </Frame>
  );
}

function Card({
  x,
  y,
  sym,
  sub,
  cls = "",
  w = 52,
}: { x: number; y: number; sym: string; sub: string; cls?: string; w?: number }) {
  return (
    <g>
      <rect class={`pt-card ${cls}`} x={x - w / 2} y={y - 22} width={w} height={50} rx={7} />
      <text class="pt-card-sym is-mid" x={x} y={y + 6} text-anchor="middle">
        {sym}
      </text>
      <text class="pt-card-mass" x={x} y={y + 20} text-anchor="middle">
        {sub}
      </text>
    </g>
  );
}

function Anomalies({ s, locale, width }: Bits) {
  const H = 150;
  return (
    <Frame w={W} h={H} width={width} label={describeMendeleev(s)} cls="pt-m-svg">
      <rect class="pt-bg" x={0} y={0} width={W} height={H} />
      <g data-part={MendeleevPart.Anomaly}>
        {s.anomaly === Anomaly.CoNi && (
          <g>
            <Card x={120} y={70} sym="Co" sub="58.9" cls="is-mid" />
            <Card x={200} y={70} sym="Ni" sub="58.7" />
            <path class="pt-swap" d="M120 40 C 140 18, 180 18, 200 40" />
            <text class="pt-a-text is-bad" x={160} y={20} text-anchor="middle">
              {say(locale, WORDS.byMass)}
            </text>
            <text class="pt-a-text is-good" x={160} y={126} text-anchor="middle">
              {say(locale, WORDS.byLikeness)}
            </text>
          </g>
        )}
        {s.anomaly === Anomaly.Hydrogen && (
          <g>
            <Card x={160} y={36} sym="H" sub="1" cls="is-mid" />
            <rect class="pt-a-col" x={24} y={86} width={92} height={50} rx={8} />
            <text class="pt-a-col-text" x={70} y={106} text-anchor="middle">
              Li · Na · K
            </text>
            <text class="pt-a-text" x={70} y={126} text-anchor="middle">
              {say(locale, WORDS.alkali)}
            </text>
            <rect class="pt-a-col" x={204} y={86} width={92} height={50} rx={8} />
            <text class="pt-a-col-text" x={250} y={106} text-anchor="middle">
              F · Cl · Br
            </text>
            <text class="pt-a-text" x={250} y={126} text-anchor="middle">
              {say(locale, WORDS.halogen)}
            </text>
            <Arrow x1={136} y1={50} x2={92} y2={84} cls="pt-a-arrow" />
            <Arrow x1={184} y1={50} x2={228} y2={84} cls="pt-a-arrow" />
            <text class="pt-a-text is-bad" x={160} y={100} text-anchor="middle">
              {say(locale, WORDS.where)}
            </text>
          </g>
        )}
        {s.anomaly === Anomaly.Isotopes && (
          <g>
            <Card x={84} y={40} sym="Cl-35" sub="35 u" w={68} />
            <Card x={236} y={40} sym="Cl-37" sub="37 u" w={68} />
            <text class="pt-a-text" x={160} y={44} text-anchor="middle">
              {say(locale, WORDS.same)}
            </text>
            <rect class="pt-m-cell is-gap" x={134} y={96} width={52} height={36} rx={6} />
            <text class="pt-m-sym" x={160} y={119} text-anchor="middle">
              ?
            </text>
            <Arrow x1={104} y1={70} x2={142} y2={96} cls="pt-a-arrow" />
            <Arrow x1={216} y1={70} x2={178} y2={96} cls="pt-a-arrow" />
            <text class="pt-a-text is-bad" x={160} y={146} text-anchor="middle">
              {say(locale, WORDS.slots)}
            </text>
          </g>
        )}
      </g>
    </Frame>
  );
}

export function MendeleevView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as MendeleevState;
  const sel = s.selected;
  const group = sel === null ? null : mendeleevGroupOf(sel);
  return (
    <div class="pt pt-mendeleev">
      {s.mode === MendeleevMode.Table && <Table s={s} call={call} locale={locale} width={width} />}
      {s.mode === MendeleevMode.Predict && (
        <Predict s={s} call={call} locale={locale} width={width} />
      )}
      {s.mode === MendeleevMode.Anomalies && (
        <Anomalies s={s} call={call} locale={locale} width={width} />
      )}
      {s.mode === MendeleevMode.Table && (
        <p class="pt-caption" data-part={sel === null ? undefined : MendeleevPart.Card}>
          {sel === null || group === null
            ? `${say(locale, WORDS.tapCard)}${s.canReveal ? ` ${say(locale, WORDS.tapGap)}` : ""}`
            : `${sel}: ${say(locale, WORDS.group)} ${GROUP_NAMES[group]} · ${say(locale, WORDS.oxide)} ${pretty(oxideOf(sel) ?? "")}${hydrideOf(sel) === null ? "" : ` · ${say(locale, WORDS.hydride)} ${pretty(hydrideOf(sel) ?? "")}`}`}
        </p>
      )}
      {(s.canSetMode ||
        (s.mode === MendeleevMode.Predict &&
          s.canReveal &&
          !s.revealed.includes(Gap.EkaAluminium)) ||
        s.mode === MendeleevMode.Anomalies) && (
        <Controls>
          {s.mode === MendeleevMode.Predict &&
            s.canReveal &&
            !s.revealed.includes(Gap.EkaAluminium) && (
              <Button
                label={say(locale, WORDS.reveal)}
                onClick={() => call(MendeleevAction.Reveal, { gap: Gap.EkaAluminium })}
              />
            )}
          {s.mode === MendeleevMode.Anomalies &&
            ([Anomaly.CoNi, Anomaly.Hydrogen, Anomaly.Isotopes] as const).map((a) => (
              <Button
                key={a}
                label={say(locale, WORDS[a])}
                isOn={s.anomaly === a}
                onClick={() => call(MendeleevAction.PickAnomaly, { anomaly: a })}
              />
            ))}
          {s.canSetMode && (
            <span class="pt-modes" data-part={MendeleevPart.Modes}>
              {([MendeleevMode.Table, MendeleevMode.Predict, MendeleevMode.Anomalies] as const).map(
                (m) => (
                  <Button
                    key={m}
                    label={say(
                      locale,
                      m === "table"
                        ? WORDS.table
                        : m === "predict"
                          ? WORDS.predict
                          : WORDS.anomalies,
                    )}
                    isOn={s.mode === m}
                    onClick={() => call(MendeleevAction.SetMode, { mode: m })}
                  />
                ),
              )}
            </span>
          )}
        </Controls>
      )}
    </div>
  );
}
