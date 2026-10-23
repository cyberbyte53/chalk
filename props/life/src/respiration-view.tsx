import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Dots, Frame, Label, Person, type Words, say } from "./draw";
import {
  GasSource,
  MAX_BUBBLES,
  MILKY,
  PATH_STEPS,
  RespirationAction,
  RespirationMode,
  RespirationPart,
  type RespirationState,
  Route,
  describeRespiration,
  milkinessOf,
} from "./respiration";

const W = 320;
const H = 200;

const WORDS = {
  next: { en: "Next step →", hi: "अगला चरण →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  cytoplasm: { en: "cytoplasm", hi: "कोशिका द्रव्य" },
  mito: { en: "mitochondria", hi: "माइटोकॉन्ड्रिया" },
  glucose: { en: "glucose: 6 carbons", hi: "ग्लूकोज़: 6 कार्बन" },
  pyruvate: { en: "pyruvate: 3 carbons", hi: "पाइरुवेट: 3 कार्बन" },
  co2: { en: "carbon dioxide", hi: "कार्बन डाइऑक्साइड" },
  water: { en: "water", hi: "पानी" },
  ethanol: { en: "ethanol", hi: "एथेनॉल" },
  lactic: { en: "lactic acid: cramps", hi: "लैक्टिक अम्ल: ऐंठन" },
  oxygen: { en: "oxygen", hi: "ऑक्सीजन" },
  noOxygen: { en: "no oxygen", hi: "ऑक्सीजन नहीं" },
  short: { en: "oxygen runs short", hi: "ऑक्सीजन कम पड़ी" },
  energy: { en: "energy (to make ATP)", hi: "ऊर्जा (ATP बनाने को)" },
  aerobic: { en: "With oxygen", hi: "ऑक्सीजन के साथ" },
  yeast: { en: "Yeast", hi: "यीस्ट" },
  muscle: { en: "Tired muscle", hi: "थकी पेशी" },
  breath: { en: "Breathed-out air", hi: "छोड़ी गई साँस" },
  pichkari: { en: "Air (pichkari)", hi: "हवा (पिचकारी)" },
  yeastGas: { en: "Yeast's gas", hi: "यीस्ट की गैस" },
  blow: { en: "Blow through the straw", hi: "स्ट्रॉ से फूँको" },
  push: { en: "Push the pichkari", hi: "पिचकारी दबाओ" },
  wait: { en: "Wait 10 minutes", hi: "10 मिनट रुको" },
  limeWater: { en: "lime water", hi: "चूने का पानी" },
  milky: { en: "milky!", hi: "दूधिया!" },
  clear: { en: "still clear", hi: "अभी साफ़" },
  cloudy: { en: "turning cloudy", hi: "धुँधला हो रहा" },
  sugar: { en: "sugar + yeast", hi: "शक्कर + यीस्ट" },
} as const satisfies Record<string, Words>;

const STEP_CAPTIONS: readonly Words[] = [
  {
    en: "A glucose molecule in the cytoplasm of a cell.",
    hi: "कोशिका के कोशिका द्रव्य में ग्लूकोज़ का एक अणु।",
  },
  {
    en: "In the cytoplasm, glucose breaks into pyruvate. Every organism does this first.",
    hi: "कोशिका द्रव्य में ग्लूकोज़ टूटकर पाइरुवेट बनता है। हर जीव पहले यही करता है।",
  },
];
const ROUTE_CAPTIONS: Record<Route, Words> = {
  aerobic: {
    en: "With oxygen, in the mitochondria: carbon dioxide and water, and a lot of energy.",
    hi: "ऑक्सीजन के साथ, माइटोकॉन्ड्रिया में: कार्बन डाइऑक्साइड और पानी, और बहुत ऊर्जा।",
  },
  yeast: {
    en: "In yeast, without oxygen: ethanol and carbon dioxide, and only a little energy.",
    hi: "यीस्ट में, बिना ऑक्सीजन: एथेनॉल और कार्बन डाइऑक्साइड, और थोड़ी ही ऊर्जा।",
  },
  muscle: {
    en: "In a muscle short of oxygen: lactic acid, which causes cramps, and only a little energy.",
    hi: "ऑक्सीजन की कमी वाली पेशी में: लैक्टिक अम्ल, जिससे ऐंठन होती है, और थोड़ी ही ऊर्जा।",
  },
};

/** A chain of carbon atoms, as beads. */
function Chain({ x, y, n, cls = "rp-carbon" }: { x: number; y: number; n: number; cls?: string }) {
  return (
    <g>
      <line class="rp-bond" x1={x} y1={y} x2={x + (n - 1) * 11} y2={y} />
      {Array.from({ length: n }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed drawing, never reordered
        <circle key={i} class={cls} cx={x + i * 11} cy={y} r={5} />
      ))}
    </g>
  );
}

/** Carbon dioxide: one carbon between two oxygens. */
function CO2({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle class="rp-oxy" cx={x - 7} cy={y} r={3.5} />
      <circle class="rp-carbon" cx={x} cy={y} r={4} />
      <circle class="rp-oxy" cx={x + 7} cy={y} r={3.5} />
    </g>
  );
}

function PathwaysPicture({ s, locale }: { s: RespirationState; locale: string }) {
  const energy = s.step === 0 ? 0 : s.step === 1 ? 0.06 : s.route === Route.Aerobic ? 1 : 0.1;
  const isAerobic = s.route === Route.Aerobic;
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <rect class="rp-cell" x={8} y={8} width={W - 16} height={150} rx={18} />
      <Label x={20} y={26} text={say(locale, WORDS.cytoplasm)} cls="is-dim" />
      <path
        class={s.step === 2 && isAerobic ? "rp-mito is-busy" : "rp-mito"}
        d="M214 58 C 214 34 296 34 296 60 C 296 86 214 86 214 58 Z"
      />
      <path
        class="rp-cristae"
        d="M226 60 q 6 -14 12 0 q 6 14 12 0 q 6 -14 12 0 q 6 14 12 0 q 6 -14 10 -2"
      />
      <Label x={255} y={98} text={say(locale, WORDS.mito)} anchor="middle" cls="is-dim" />
      <Chain x={26} y={90} n={6} />
      {s.step === 0 && <Label x={52} y={112} text={say(locale, WORDS.glucose)} anchor="middle" />}
      {s.step >= 1 && (
        <g>
          <Arrow x1={92} y1={90} x2={112} y2={90} />
          <Chain x={120} y={78} n={3} />
          <Chain x={120} y={102} n={3} />
          <Label x={130} y={126} text={say(locale, WORDS.pyruvate)} anchor="middle" />
        </g>
      )}
      {s.step === 2 && isAerobic && (
        <g>
          <Arrow x1={150} y1={88} x2={210} y2={66} />
          <g class="lp-oxygen">
            <Arrow x1={196} y1={26} x2={214} y2={40} />
          </g>
          <Label x={192} y={24} text={say(locale, WORDS.oxygen)} anchor="end" />
          <CO2 x={226} y={126} />
          <CO2 x={248} y={126} />
          <CO2 x={270} y={126} />
          <circle class="lp-water-dot" cx={294} cy={126} r={4} />
          <Label x={248} y={146} text={say(locale, WORDS.co2)} anchor="middle" />
          <Label x={300} y={112} text={say(locale, WORDS.water)} anchor="end" cls="is-dim" />
        </g>
      )}
      {s.step === 2 && s.route === Route.Yeast && (
        <g>
          <Arrow x1={150} y1={98} x2={172} y2={112} />
          <Chain x={180} y={116} n={2} cls="rp-ethanol" />
          <CO2 x={186} y={138} />
          <Label x={204} y={120} text={say(locale, WORDS.ethanol)} />
          <Label x={204} y={142} text={say(locale, WORDS.co2)} />
          <Label x={160} y={46} text={say(locale, WORDS.noOxygen)} anchor="middle" cls="is-bad" />
        </g>
      )}
      {s.step === 2 && s.route === Route.Muscle && (
        <g>
          <Arrow x1={150} y1={98} x2={172} y2={110} />
          <Chain x={180} y={112} n={3} cls="rp-lactic" />
          <Chain x={180} y={130} n={3} cls="rp-lactic" />
          <Label x={210} y={126} text={say(locale, WORDS.lactic)} cls="is-bad" />
          <Label x={160} y={46} text={say(locale, WORDS.short)} anchor="middle" cls="is-bad" />
        </g>
      )}
      <rect class="rp-meter" x={16} y={172} width={W - 32} height={12} rx={6} />
      <rect
        class="rp-meter-fill"
        x={16}
        y={172}
        width={Math.max(0, (W - 32) * energy)}
        height={12}
        rx={6}
      />
      <Label x={16} y={196} text={say(locale, WORDS.energy)} cls="is-dim" />
    </g>
  );
}

function LimeWaterPicture({ s, locale }: { s: RespirationState; locale: string }) {
  const m = milkinessOf(s);
  const tx = 214;
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      {s.source === GasSource.Breath && (
        <g>
          <Person who="kabir" x={86} y={190} s={2.6} />
          <path class="rp-straw" d={`M112 98 L${tx - 6} 80 L${tx - 6} 170`} />
        </g>
      )}
      {s.source === GasSource.Pichkari && (
        <g>
          <rect class="rp-syringe" x={40} y={86} width={90} height={22} rx={4} />
          <rect class="rp-plunger" x={20} y={92} width={30} height={10} rx={2} />
          <path class="rp-straw" d={`M130 97 L${tx - 6} 80 L${tx - 6} 170`} />
        </g>
      )}
      {s.source === GasSource.Yeast && (
        <g>
          <path
            class="rp-flask"
            d="M70 70 L96 70 L96 104 L122 168 Q 124 176 116 176 L50 176 Q 42 176 44 168 L70 104 Z"
          />
          <path
            class="rp-juice"
            d="M56 140 L110 140 L120 166 Q 122 172 116 172 L50 172 Q 44 172 46 166 Z"
          />
          <Label x={83} y={192} text={say(locale, WORDS.sugar)} anchor="middle" cls="is-dim" />
          <path class="rp-straw" d={`M83 70 L83 50 L${tx - 6} 50 L${tx - 6} 170`} />
        </g>
      )}
      <path
        class="rp-limewater"
        d={`M${tx - 22} 110 L${tx + 22} 110 L${tx + 22} 170 Q ${tx + 22} 184 ${tx} 184 Q ${tx - 22} 184 ${tx - 22} 170 Z`}
      />
      <path
        class="rp-milk"
        style={{ opacity: m }}
        d={`M${tx - 22} 110 L${tx + 22} 110 L${tx + 22} 170 Q ${tx + 22} 184 ${tx} 184 Q ${tx - 22} 184 ${tx - 22} 170 Z`}
      />
      <path
        class="rp-glass"
        d={`M${tx - 24} 60 L${tx - 24} 170 Q ${tx - 24} 186 ${tx} 186 Q ${tx + 24} 186 ${tx + 24} 170 L${tx + 24} 60`}
      />
      {s.bubbles > 0 &&
        [0, 1, 2, 3].map((i) => (
          <circle key={i} class="rp-bubble" cx={tx - 6 + (i % 2) * 8} cy={164 - i * 12} r={3} />
        ))}
      <Label x={tx + 34} y={120} text={say(locale, WORDS.limeWater)} cls="is-dim" />
      <Label
        x={tx + 34}
        y={140}
        text={say(locale, m >= MILKY ? WORDS.milky : m > 0.3 ? WORDS.cloudy : WORDS.clear)}
        cls={m >= MILKY ? "is-big is-good" : "is-dim"}
      />
      <Label x={tx + 34} y={156} text={`× ${s.bubbles}`} cls="is-dim" />
    </g>
  );
}

export function RespirationPathsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RespirationState;
  const isPaths = s.mode === RespirationMode.Pathways;
  const caption = isPaths ? (s.step < 2 ? STEP_CAPTIONS[s.step] : ROUTE_CAPTIONS[s.route]) : null;
  const routes = [
    { route: Route.Aerobic, w: WORDS.aerobic },
    { route: Route.Yeast, w: WORDS.yeast },
    { route: Route.Muscle, w: WORDS.muscle },
  ];
  const sources = [
    { source: GasSource.Breath, w: WORDS.breath },
    { source: GasSource.Pichkari, w: WORDS.pichkari },
    { source: GasSource.Yeast, w: WORDS.yeastGas },
  ];
  const bubbleWord =
    s.source === GasSource.Breath
      ? WORDS.blow
      : s.source === GasSource.Pichkari
        ? WORDS.push
        : WORDS.wait;
  return (
    <div class="lp rp">
      <Frame w={W} h={H} width={width} label={describeRespiration(s)} cls="rp-svg">
        <g data-part={RespirationPart.Picture}>
          {isPaths ? (
            <PathwaysPicture s={s} locale={locale} />
          ) : (
            <LimeWaterPicture s={s} locale={locale} />
          )}
        </g>
      </Frame>
      {caption && <p class="lp-caption">{say(locale, caption)}</p>}
      {isPaths ? (
        <Controls>
          {s.canStep && s.step < PATH_STEPS - 1 && (
            <Button
              part={RespirationPart.Next}
              label={say(locale, WORDS.next)}
              onClick={() => call(RespirationAction.Next, {})}
            />
          )}
          {s.canStep && s.step > 0 && (
            <Button
              label={say(locale, WORDS.again)}
              onClick={() => call(RespirationAction.Reset, {})}
            />
          )}
          <Dots step={s.step} count={PATH_STEPS} />
          {s.canSetRoute && s.step === PATH_STEPS - 1 && (
            <span class="rp-row" data-part={RespirationPart.Routes}>
              {routes.map((r) => (
                <Button
                  key={r.route}
                  label={say(locale, r.w)}
                  isOn={s.route === r.route}
                  onClick={() => call(RespirationAction.SetRoute, { route: r.route })}
                />
              ))}
            </span>
          )}
        </Controls>
      ) : (
        <Controls>
          {s.canSetSource && (
            <span class="rp-row">
              {sources.map((x) => (
                <Button
                  key={x.source}
                  label={say(locale, x.w)}
                  isOn={s.source === x.source}
                  onClick={() => call(RespirationAction.SetSource, { source: x.source })}
                />
              ))}
            </span>
          )}
          <Button
            part={RespirationPart.Bubble}
            label={say(locale, bubbleWord)}
            isDisabled={s.bubbles >= MAX_BUBBLES}
            onClick={() => call(RespirationAction.Bubble, {})}
          />
          {s.bubbles > 0 && (
            <Button
              label={say(locale, WORDS.again)}
              onClick={() => call(RespirationAction.Reset, {})}
            />
          )}
        </Controls>
      )}
    </div>
  );
}
