import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Dots, Frame, type Words, say } from "./draw";
import {
  Cleaner,
  MICELLE_STEPS,
  SoapAction,
  SoapMode,
  SoapPart,
  type SoapState,
  Water,
  describeSoap,
  resultOf,
} from "./soap";

const W = 320;
const H = 190;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  shake: { en: "Shake", hi: "हिलाओ" },
  soft: { en: "Soft water", hi: "मृदु जल" },
  hard: { en: "Hard water", hi: "कठोर जल" },
  soap: { en: "Soap", hi: "साबुन" },
  detergent: { en: "Detergent", hi: "अपमार्जक" },
  head: { en: "ionic end: loves water", hi: "आयनिक सिरा: जल-प्रेमी" },
  tail: { en: "hydrocarbon tail: loves oil", hi: "हाइड्रोकार्बन पूँछ: तेल-प्रेमी" },
  hydrophilic: { en: "hydrophilic", hi: "जलरागी" },
  hydrophobic: { en: "hydrophobic", hi: "जलविरागी" },
  water: { en: "water", hi: "जल" },
  air: { en: "air", hi: "वायु" },
  oil: { en: "oily dirt", hi: "तैलीय मैल" },
  cloth: { en: "cloth", hi: "कपड़ा" },
  micelle: { en: "micelle", hi: "मिसेल" },
  foam: { en: "foam", hi: "झाग" },
  scum: { en: "scum", hi: "मैल (स्कम)" },
} as const satisfies Record<string, Words>;

const MICELLE_HI = [
  "कपड़े पर तैलीय मैल, पानी में: तेल और पानी नहीं मिलते, इसलिए अकेला पानी इसे नहीं हटा सकता।",
  "साबुन डाला गया। हर अणु में एक जल-प्रेमी आयनिक सिरा और एक तेल-प्रेमी हाइड्रोकार्बन पूँछ है।",
  "पूँछें तेल में घुस जाती हैं; आयनिक सिरे पानी में रहते हैं: एक मिसेल, जिसके भीतर तेल बंद है।",
  "धोने पर मिसेल, मैल समेत, बह जाते हैं: कपड़ा साफ़।",
] as const;

const SURFACE_HI =
  "पानी की सतह पर साबुन: अणु इस तरह सजते हैं कि आयनिक सिरे पानी में और हाइड्रोकार्बन पूँछें पानी से बाहर रहती हैं।";
const MOLECULE_HI =
  "साबुन का अणु: एक लंबी हाइड्रोकार्बन पूँछ (जलविरागी: तेल में मिलती है, पानी में नहीं) जुड़ी है एक आयनिक सिरे –COO⁻ Na⁺ (जलरागी: पानी में मिलता है) से।";

/** One soap molecule: head at (x, y), tail pointing along angle `a` (radians). */
function Molecule({ x, y, a, len = 24 }: { x: number; y: number; a: number; len?: number }) {
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const nx = -uy;
  const ny = ux;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const t = 4 + (i * len) / 5;
    const z = i % 2 === 0 ? -2.2 : 2.2;
    return `${x + ux * t + nx * z},${y + uy * t + ny * z}`;
  }).join(" ");
  return (
    <g class="cb-soap-mol">
      <polyline class="cb-soap-tail" points={pts} />
      <circle class="cb-soap-head" cx={x} cy={y} r={4.2} />
    </g>
  );
}

function MoleculePicture({ locale }: { locale: string }) {
  const y = 96;
  const pts = Array.from(
    { length: 15 },
    (_, i) => `${96 + i * 13},${y + (i % 2 === 0 ? -7 : 7)}`,
  ).join(" ");
  return (
    <g>
      <polyline class="cb-soap-tail is-big" points={pts} />
      <circle class="cb-soap-head is-big" cx={70} cy={y} r={18} />
      <text class="cb-head-text" x={70} y={y + 4} text-anchor="middle">
        COO⁻
      </text>
      <text class="cb-ion" x={40} y={y - 22} text-anchor="middle">
        Na⁺
      </text>
      <text class="cb-label" x={70} y={y + 44} text-anchor="middle">
        {say(locale, WORDS.head)}
      </text>
      <text class="cb-label is-dim" x={70} y={y + 58} text-anchor="middle">
        {say(locale, WORDS.hydrophilic)}
      </text>
      <text class="cb-label" x={196} y={y - 26} text-anchor="middle">
        {say(locale, WORDS.tail)}
      </text>
      <text class="cb-label is-dim" x={196} y={y - 12} text-anchor="middle">
        {say(locale, WORDS.hydrophobic)}
      </text>
    </g>
  );
}

function SurfacePicture({ locale }: { locale: string }) {
  const level = 82;
  return (
    <g>
      <rect class="cb-water" x={0} y={level} width={W} height={H - level} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <Molecule
          key={n}
          x={26 + n * 27}
          y={level + 5}
          a={-Math.PI / 2 + (n % 2 === 0 ? 0.12 : -0.12)}
          len={30}
        />
      ))}
      {[
        [70, 140, 0.4],
        [150, 156, -2.4],
        [240, 138, 1.6],
      ].map(([x, y, a]) => (
        <Molecule key={`${x}`} x={x as number} y={y as number} a={a as number} />
      ))}
      <text class="cb-label" x={10} y={24}>
        {say(locale, WORDS.air)}
      </text>
      <text class="cb-label" x={10} y={H - 12}>
        {say(locale, WORDS.water)}
      </text>
    </g>
  );
}

function MicellePicture({ s, locale }: { s: SoapState; locale: string }) {
  const step = s.step;
  const cx = step === 3 ? 238 : 160;
  const cy = step === 3 ? 70 : 104;
  const around = Array.from({ length: 14 }, (_, i) => (i * 2 * Math.PI) / 14);
  return (
    <g>
      <rect class="cb-water" x={0} y={0} width={W} height={H} />
      <rect class="cb-cloth" x={20} y={150} width={280} height={24} rx={4} />
      {step < 3 && (
        <ellipse
          class="cb-oil-drop"
          cx={160}
          cy={step === 0 ? 146 : cy}
          rx={step === 0 ? 34 : 22}
          ry={step === 0 ? 10 : 18}
        />
      )}
      {step === 1 &&
        [
          [60, 50, 0.2],
          [100, 90, 2.6],
          [250, 60, 1.2],
          [230, 120, -2],
          [80, 120, -0.6],
          [200, 40, 2.2],
        ].map(([x, y, a]) => (
          <Molecule key={`${x}-${y}`} x={x as number} y={y as number} a={a as number} />
        ))}
      {step >= 2 && (
        <g class={step === 3 ? "cb-micelle is-away" : "cb-micelle"}>
          {step === 3 && <ellipse class="cb-oil-drop" cx={cx} cy={cy} rx={20} ry={16} />}
          {around.map((a) => (
            <Molecule
              key={a}
              x={cx + 46 * Math.cos(a)}
              y={cy + 40 * Math.sin(a)}
              a={a + Math.PI}
              len={22}
            />
          ))}
        </g>
      )}
      {s.showNames && (
        <g>
          <text class="cb-label" x={24} y={186}>
            {say(locale, WORDS.cloth)}
          </text>
          {step < 2 && (
            <text
              class="cb-label"
              x={step === 0 ? 200 : 160}
              y={step === 0 ? 140 : cy + 4}
              text-anchor={step === 0 ? "start" : "middle"}
            >
              {say(locale, WORDS.oil)}
            </text>
          )}
          {step >= 2 && (
            <text class="cb-label" x={cx} y={step === 3 ? cy + 66 : cy - 70} text-anchor="middle">
              {say(locale, WORDS.micelle)}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

function HardWaterPicture({ s, locale }: { s: SoapState; locale: string }) {
  const r = resultOf(s.water, s.cleaner);
  const foam = s.isShaken ? r.foam : 0;
  const x = 160;
  const top = 26;
  const bottom = 170;
  const level = 108;
  return (
    <g>
      <rect class="cb-bg" x={0} y={0} width={W} height={H} />
      <path
        class={s.water === Water.Hard ? "cb-liquid is-hard" : "cb-liquid"}
        d={`M${x - 26} ${level} L${x - 26} ${bottom - 24} A 26 26 0 0 0 ${x + 26} ${bottom - 24} L${x + 26} ${level} Z`}
      />
      {foam > 0 &&
        Array.from({ length: foam * 7 }, (_, i) => (
          <circle
            // biome-ignore lint/suspicious/noArrayIndexKey: foam bubbles
            key={i}
            class="cb-foam"
            cx={x - 20 + ((i * 13) % 42)}
            cy={level - 4 - Math.floor(i / 4) * 7}
            r={4 + (i % 3)}
          />
        ))}
      {s.isShaken && r.scum && (
        <g class="cb-scum">
          <ellipse cx={x - 10} cy={level + 10} rx={9} ry={4} />
          <ellipse cx={x + 9} cy={level + 22} rx={7} ry={3.5} />
          <ellipse cx={x - 2} cy={bottom - 14} rx={10} ry={4} />
        </g>
      )}
      <path
        class="cb-glass"
        d={`M${x - 28} ${top} L${x - 28} ${bottom - 26} A 28 28 0 0 0 ${x + 28} ${bottom - 26} L${x + 28} ${top}`}
      />
      {s.showNames && (
        <g>
          <text class="cb-label" x={x + 40} y={level + 30}>
            {say(locale, s.water === Water.Hard ? WORDS.hard : WORDS.soft)}
          </text>
          <text class="cb-label" x={x + 40} y={level + 44}>
            {`+ ${say(locale, s.cleaner === Cleaner.Soap ? WORDS.soap : WORDS.detergent)}`}
          </text>
          {foam > 0 && (
            <text class="cb-label" x={x - 40} y={level - 18} text-anchor="end">
              {say(locale, WORDS.foam)}
            </text>
          )}
          {s.isShaken && r.scum && (
            <text class="cb-label is-bad" x={x - 40} y={level + 20} text-anchor="end">
              {say(locale, WORDS.scum)}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

function captionOf(s: SoapState, locale: string): string {
  if (locale !== "hi") return describeSoap(s);
  if (s.mode === SoapMode.Molecule) return MOLECULE_HI;
  if (s.mode === SoapMode.Surface) return SURFACE_HI;
  if (s.mode === SoapMode.Micelle) return MICELLE_HI[s.step] ?? MICELLE_HI[0];
  const r = resultOf(s.water, s.cleaner);
  if (!s.isShaken) return "अभी हिलाया नहीं गया।";
  return `${r.foam >= 3 ? "खूब झाग" : "बहुत कम झाग"}${r.scum ? ", और सफ़ेद दही जैसा मैल (स्कम)" : ""}।`;
}

export function SoapActionView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SoapState;
  return (
    <div class="cb cb-soap">
      <Frame w={W} h={H} width={width} label={describeSoap(s)} cls="cb-soap-svg">
        <g data-part={SoapPart.Picture}>
          {s.mode === SoapMode.Molecule && <MoleculePicture locale={locale} />}
          {s.mode === SoapMode.Surface && <SurfacePicture locale={locale} />}
          {s.mode === SoapMode.Micelle && <MicellePicture s={s} locale={locale} />}
          {s.mode === SoapMode.HardWater && <HardWaterPicture s={s} locale={locale} />}
        </g>
      </Frame>
      <p class="cb-caption">{captionOf(s, locale)}</p>
      {s.canAct && s.mode === SoapMode.Micelle && (
        <Controls>
          {s.step < MICELLE_STEPS - 1 && (
            <Button
              part={SoapPart.Next}
              label={say(locale, WORDS.next)}
              onClick={() => call(SoapAction.Next, {})}
            />
          )}
          {s.step > 0 && (
            <Button label={say(locale, WORDS.again)} onClick={() => call(SoapAction.Reset, {})} />
          )}
          <Dots step={s.step} count={MICELLE_STEPS} />
        </Controls>
      )}
      {s.canAct && s.mode === SoapMode.HardWater && (
        <>
          <Controls>
            {([Water.Soft, Water.Hard] as const).map((w) => (
              <Button
                key={w}
                part={SoapPart.Water}
                label={say(locale, w === Water.Soft ? WORDS.soft : WORDS.hard)}
                isOn={s.water === w}
                onClick={() => call(SoapAction.SetWater, { water: w })}
              />
            ))}
          </Controls>
          <Controls>
            {([Cleaner.Soap, Cleaner.Detergent] as const).map((c) => (
              <Button
                key={c}
                part={SoapPart.Cleaner}
                label={say(locale, c === Cleaner.Soap ? WORDS.soap : WORDS.detergent)}
                isOn={s.cleaner === c}
                onClick={() => call(SoapAction.SetCleaner, { cleaner: c })}
              />
            ))}
            <Button
              part={SoapPart.Shake}
              label={say(locale, WORDS.shake)}
              onClick={() => call(SoapAction.Shake, {})}
            />
          </Controls>
        </>
      )}
    </div>
  );
}
