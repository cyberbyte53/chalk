import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { INDICATORS, NATURE_WORDS, natureOfPh, responseOf } from "./acid-data";
import { ActionButton, Flask, hueClass, phClass } from "./acid-draw";
import {
  NeutraliseAction,
  type NeutraliseState,
  colourOf,
  describeNeutralise,
  excessAcidMl,
  isNeutral,
  phOf,
} from "./acid-neutralise";
import { type Words, say } from "./words";

const W = 320;
const H = 206;
const TABLE = 196;
const BX = 112;

const WORDS = {
  acid: { en: "dilute HCl", hi: "तनु HCl" },
  base: { en: "dilute NaOH", hi: "तनु NaOH" },
  addAcid: { en: "+ a drop of acid", hi: "+ अम्ल की एक बूँद" },
  addBase: { en: "+ a drop of base", hi: "+ क्षारक की एक बूँद" },
  again: { en: "↺ Start again", hi: "↺ फिर से शुरू करो" },
  added: { en: "acid added", hi: "डाला गया अम्ल" },
  inFlask: { en: "base in flask", hi: "फ़्लास्क में क्षारक" },
  neutral: { en: "neutral: salt + water", hi: "उदासीन: लवण + जल" },
  ohLeft: { en: "OH⁻ left", hi: "बचे OH⁻" },
  hLeft: { en: "H⁺ left", hi: "बचे H⁺" },
  ml: { en: "mL", hi: "mL" },
} as const satisfies Record<string, Words>;

/** A burette of acid over a conical flask of base and indicator; drop buttons and a pH readout. */
export function NeutraliserView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as NeutraliseState;
  const k = width / W;
  const height = Math.round(H * k);
  const pH = phOf(s);
  const r = responseOf(s.indicator, pH);
  const flaskFill =
    r.kind === "universal" ? phClass(r.band) : r.kind === "colour" ? hueClass(r.hue) : "ac-water";
  // The burette empties as acid runs out of it (it holds 50 mL).
  const buretteTop = 18;
  const buretteBottom = 104;
  const acidLeft = Math.max(0, 1 - s.acidMl / 50);
  const level = buretteBottom - (buretteBottom - buretteTop - 6) * acidLeft;
  const total = s.baseMl + s.acidMl;
  const flaskLevel = TABLE - 18 - Math.min(44, 12 + total * 0.9);
  const excess = excessAcidMl(s);
  const leftover = Math.min(1, Math.abs(excess) / Math.max(1, s.baseMl * s.acidPerBaseMl));
  return (
    <div class="nt ac">
      <Stage
        label={describeNeutralise(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "nt-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="ac-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="ac-table" x={0} y={TABLE} width={W} height={H - TABLE} />
          {/* the stand */}
          <rect class="ac-stand" x={28} y={TABLE - 4} width={70} height={4} rx={2} />
          <line class="ac-stand-rod" x1={40} y1={TABLE - 4} x2={40} y2={10} />
          <line class="ac-stand-rod" x1={40} y1={46} x2={BX - 7} y2={46} />
          {/* the burette */}
          <g data-part="burette">
            <rect class="ac-acid" x={BX - 5} y={level} width={10} height={buretteBottom - level} />
            <rect
              class="ac-glass-fill"
              x={BX - 6}
              y={buretteTop}
              width={12}
              height={buretteBottom - buretteTop}
              rx={2}
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                class="nt-tick"
                x1={BX - 6}
                y1={buretteTop + 8 + i * 18}
                x2={BX - 1}
                y2={buretteTop + 8 + i * 18}
              />
            ))}
            <path
              class="ac-glass"
              d={`M${BX - 6} ${buretteTop} V${buretteBottom} l 4 10 v 8 h 4 v -8 l 4 -10 V${buretteTop}`}
            />
            <rect class="nt-tap" x={BX - 10} y={buretteBottom + 5} width={20} height={4} rx={2} />
            <path
              key={`drop-${s.acidMl}`}
              class="ac-acid nt-drop"
              d={`M${BX} ${buretteBottom + 22} q 3 5 0 7 q -3 -2 0 -7 z`}
            />
            <text class="ac-label" x={BX + 12} y={buretteTop + 10}>
              {say(locale, WORDS.acid)}
            </text>
          </g>
          {/* the flask */}
          <g data-part="flask">
            <Flask
              x={BX}
              top={TABLE - 76}
              bottom={TABLE}
              w={70}
              fill={`${flaskFill} nt-liquid`}
              level={flaskLevel}
            />
            <line class="ac-leader" x1={BX + 30} y1={TABLE - 22} x2={180} y2={TABLE - 30} />
            <text class="ac-label" x={184} y={TABLE - 34}>
              {say(locale, WORDS.base)}
            </text>
            <text class="ac-label" x={184} y={TABLE - 21}>
              + {say(locale, INDICATORS[s.indicator].name)}
            </text>
          </g>
          {/* the readings, on the right */}
          {s.showVolumes && (
            <g class="nt-volumes">
              <text x={184} y={30}>
                {say(locale, WORDS.inFlask)}: {s.baseMl} {say(locale, WORDS.ml)}
              </text>
              <text x={184} y={48}>
                {say(locale, WORDS.added)}: {s.acidMl} {say(locale, WORDS.ml)}
              </text>
            </g>
          )}
          {s.showPh && (
            <g data-part="reading" class={`nt-reading is-${natureOfPh(pH)}`}>
              <text x={184} y={76}>
                pH {pH}
              </text>
              <text class="nt-reading-sub" x={184} y={92}>
                {isNeutral(s)
                  ? say(locale, WORDS.neutral)
                  : say(locale, NATURE_WORDS[natureOfPh(pH)])}
              </text>
            </g>
          )}
          {s.showIons && (
            <g data-part="ions" class="nt-ions">
              <text x={184} y={110}>
                {say(locale, excess < 0 ? WORDS.ohLeft : WORDS.hLeft)}
              </text>
              <rect class="nt-ion-track" x={184} y={116} width={120} height={8} rx={4} />
              <rect
                class={excess < 0 ? "nt-ion-oh" : "nt-ion-h"}
                x={184}
                y={116}
                width={Math.max(0, 120 * leftover)}
                height={8}
                rx={4}
              />
              <text class="nt-ions-eq" x={184} y={138}>
                H⁺ + OH⁻ → H₂O
              </text>
            </g>
          )}
        </g>
      </Stage>
      <div class="ac-under" data-part="buttons">
        {s.canAddAcid && (
          <ActionButton
            words={WORDS.addAcid}
            onPress={() => call(NeutraliseAction.AddAcid, {})}
            locale={locale}
          />
        )}
        {s.canAddBase && (
          <ActionButton
            words={WORDS.addBase}
            onPress={() => call(NeutraliseAction.AddBase, {})}
            locale={locale}
            isMain={false}
          />
        )}
        {(s.canAddAcid || s.canAddBase) && (s.acidMl > 0 || s.baseMl !== s.startBaseMl) && (
          <ActionButton
            words={WORDS.again}
            onPress={() => call(NeutraliseAction.Reset, {})}
            locale={locale}
            isMain={false}
          />
        )}
        <span class="ac-result">{say(locale, colourOf(s))}</span>
      </div>
    </div>
  );
}
