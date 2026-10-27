import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Caption, Controls, Frame, Label, Stepper, type Words, say } from "./draw";
import { Jar, Leaf, Pot, Roots, Soil, Sprout } from "./plants";
import {
  Method,
  PropagationAction,
  PropagationPart,
  type PropagationState,
  describePropagation,
  stepsOfMethod,
} from "./propagation";

const W = 320;
const H = 200;

const NAMES: Readonly<Record<Method, Words>> = {
  potato: { en: "Potato pieces", hi: "आलू के टुकड़े" },
  bryophyllum: { en: "Bryophyllum leaf", hi: "ब्रायोफिलम की पत्ती" },
  moneyPlant: { en: "Money-plant pieces", hi: "मनी-प्लांट के टुकड़े" },
  layering: { en: "Layering", hi: "दाब लगाना (लेयरिंग)" },
  grafting: { en: "Grafting", hi: "कलम बाँधना (ग्राफ्टिंग)" },
  tissueCulture: { en: "Tissue culture", hi: "ऊतक संवर्धन" },
};

const L = {
  bud: { en: "bud (eye)", hi: "कली (आँख)" },
  noBud: { en: "no bud", hi: "कली नहीं" },
  cotton: { en: "wet cotton", hi: "गीली रुई" },
  day: { en: "day", hi: "दिन" },
  notchBuds: { en: "buds in the notches", hi: "खाँचों में कलियाँ" },
  soil: { en: "soil", hi: "मिट्टी" },
  withLeaf: { en: "with a leaf", hi: "पत्ती वाला" },
  between: { en: "between two leaves", hi: "दो पत्तियों के बीच का" },
  roots: { en: "roots", hi: "जड़ें" },
  cutHere: { en: "cut here", hi: "यहाँ काटो" },
  stock: { en: "stock (rooted)", hi: "स्टॉक (जड़ वाला)" },
  scion: { en: "scion", hi: "सायन (कलम)" },
  tied: { en: "joined and tied", hi: "जोड़कर बाँधा" },
  tip: { en: "growing tip", hi: "बढ़ता सिरा" },
  medium: { en: "artificial medium", hi: "कृत्रिम माध्यम" },
  callus: { en: "callus", hi: "कैलस" },
  hormones: { en: "medium with hormones", hi: "हॉर्मोन वाला माध्यम" },
  plantlets: { en: "plantlets", hi: "पौधिकाएँ" },
} as const satisfies Record<string, Words>;

type T = (w: Words) => string;

function PotatoPiece({ x, y, bud, grown }: { x: number; y: number; bud: boolean; grown: number }) {
  return (
    <g>
      <path
        class="pl-potato"
        d={`M${x - 20} ${y} Q ${x - 22} ${y - 26} ${x} ${y - 28} Q ${x + 22} ${y - 26} ${x + 20} ${y} Z`}
      />
      {bud && <circle class="pl-eye" cx={x + 2} cy={y - 18} r={3} />}
      {bud && grown >= 1 && <Sprout x={x + 2} y={y - 21} h={grown === 1 ? 10 : 30} />}
      {bud && grown === 2 && <Roots x={x} y={y} len={12} />}
    </g>
  );
}

function PotatoPic({ step, t }: { step: number; t: T }) {
  const xs = [52, 124, 196, 268];
  return (
    <g>
      <rect class="pl-cotton" x={20} y={150} width={280} height={18} rx={8} />
      {xs.map((x, i) => (
        <PotatoPiece key={x} x={x} y={152} bud={i % 2 === 0} grown={step} />
      ))}
      <Label x={52} y={186} text={t(L.bud)} anchor="middle" />
      <Label x={124} y={186} text={t(L.noBud)} anchor="middle" cls="is-dim" />
      <Label x={196} y={186} text={t(L.bud)} anchor="middle" />
      <Label x={268} y={186} text={t(L.noBud)} anchor="middle" cls="is-dim" />
      <Label
        x={310}
        y={18}
        text={`${t(L.day)} ${[0, 3, 7][step] ?? 0}`}
        anchor="end"
        cls="is-big"
      />
    </g>
  );
}

const NOTCHES: readonly [number, number][] = [
  [100, 74],
  [140, 62],
  [180, 62],
  [220, 74],
  [100, 126],
  [140, 138],
  [180, 138],
  [220, 126],
];

function BryophyllumPic({ step, t }: { step: number; t: T }) {
  const leafD = "M70 100 Q 110 48 160 58 Q 220 54 252 100 Q 220 146 160 142 Q 110 152 70 100 Z";
  if (step === 0)
    return (
      <g>
        <path class="pl-leaf" d={leafD} />
        <line class="pl-vein" x1={70} y1={100} x2={252} y2={100} />
        {NOTCHES.map(([x, y]) => (
          <circle key={`${x}-${y}`} class="pl-bud" cx={x} cy={y} r={4} />
        ))}
        <Label x={160} y={30} text={t(L.notchBuds)} anchor="middle" />
      </g>
    );
  return (
    <g>
      <Soil x={0} y={150} w={W} h={50} />
      <g transform="translate(0 70) scale(1 0.5)">
        <path class={step === 2 ? "pl-leaf is-old" : "pl-leaf"} d={leafD} />
      </g>
      {step === 2 &&
        [100, 140, 180, 220].map((x) => (
          <g key={x}>
            <Sprout x={x} y={150} h={24} />
            <Roots x={x} y={150} len={10} />
          </g>
        ))}
      <Label x={300} y={190} text={t(L.soil)} anchor="end" cls="is-dim" />
    </g>
  );
}

function MoneyPlantPic({ step, t }: { step: number; t: T }) {
  return (
    <g>
      <Jar x={96} y={180} w={70} h={100} />
      <Jar x={224} y={180} w={70} h={100} />
      <line class="pl-stem" x1={96} y1={70} x2={96} y2={150} />
      <Leaf x={96} y={90} a={-30} len={30} />
      <line class="pl-stem" x1={224} y1={70} x2={224} y2={150} />
      {step >= 1 && <Roots x={96} y={150} len={18} />}
      {step === 2 && <Leaf x={96} y={74} a={-150} len={20} />}
      <Label x={96} y={56} text={t(L.withLeaf)} anchor="middle" />
      <Label x={224} y={56} text={t(L.between)} anchor="middle" cls="is-dim" />
      {step >= 1 && <Label x={130} y={170} text={t(L.roots)} />}
      <Label
        x={310}
        y={18}
        text={`${t(L.day)} ${[0, 5, 10][step] ?? 0}`}
        anchor="end"
        cls="is-big"
      />
    </g>
  );
}

function LayeringPic({ step, t }: { step: number; t: T }) {
  return (
    <g>
      <Soil x={0} y={150} w={W} h={50} />
      <line class="pl-stem is-thick" x1={80} y1={150} x2={80} y2={50} />
      {[60, 80, 100].map((y) => (
        <Leaf key={y} x={80} y={y} a={y % 40 === 0 ? -20 : -160} len={20} />
      ))}
      <path
        class={step === 2 ? "pl-stem is-cut" : "pl-stem"}
        d="M80 120 Q 150 110 190 156 Q 210 170 236 128"
      />
      <Leaf x={236} y={128} a={-60} len={18} />
      <Leaf x={236} y={128} a={-120} len={18} />
      {step >= 1 && <Roots x={198} y={162} len={14} />}
      {step === 2 && (
        <g>
          <line class="pl-cut" x1={120} y1={104} x2={132} y2={124} />
          <Label x={126} y={98} text={t(L.cutHere)} anchor="middle" cls="is-bad" />
        </g>
      )}
      {step >= 1 && <Label x={232} y={186} text={t(L.roots)} anchor="middle" />}
    </g>
  );
}

function GraftingPic({ step, t }: { step: number; t: T }) {
  return (
    <g>
      <Pot x={160} y={140} w={70} />
      <line class="pl-stem is-thick" x1={160} y1={136} x2={160} y2={step === 0 ? 96 : 96} />
      {step === 0 && (
        <g>
          <line class="pl-stem" x1={240} y1={40} x2={240} y2={92} />
          <Leaf x={240} y={56} a={-30} len={18} />
          <Leaf x={240} y={70} a={-150} len={18} />
          <Label x={240} y={30} text={t(L.scion)} anchor="middle" />
          <Arrow x1={226} y1={88} x2={172} y2={92} />
        </g>
      )}
      {step >= 1 && (
        <g>
          <line class="pl-stem" x1={160} y1={96} x2={160} y2={40} />
          <rect class="pl-tie" x={154} y={90} width={12} height={10} rx={2} />
          <Leaf x={160} y={60} a={-30} len={18} />
          <Leaf x={160} y={72} a={-150} len={18} />
          <Label x={186} y={98} text={t(L.tied)} />
        </g>
      )}
      {step === 2 && (
        <g class="pl-rose">
          <circle cx={160} cy={38} r={9} />
          <circle cx={160} cy={38} r={4} class="pl-rose-in" />
        </g>
      )}
      <Label x={100} y={126} text={t(L.stock)} anchor="end" />
    </g>
  );
}

function TissuePic({ step, t }: { step: number; t: T }) {
  if (step === 0)
    return (
      <g>
        <line class="pl-stem is-thick" x1={160} y1={190} x2={160} y2={60} />
        <Leaf x={160} y={110} a={-30} len={30} />
        <Leaf x={160} y={140} a={-150} len={30} />
        <circle class="pl-tipcells" cx={160} cy={56} r={8} />
        <Label x={176} y={54} text={t(L.tip)} />
      </g>
    );
  if (step === 3)
    return (
      <g>
        <Pot x={90} y={130} w={60} />
        <Pot x={160} y={130} w={60} />
        <Pot x={230} y={130} w={60} />
        {[90, 160, 230].map((x) => (
          <Sprout key={x} x={x} y={126} h={40} />
        ))}
      </g>
    );
  return (
    <g>
      <path class="pl-dish" d="M70 120 L250 120 L240 160 L80 160 Z" />
      <rect class="pl-medium" x={78} y={128} width={164} height={28} rx={4} />
      {step === 1 ? (
        <g>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle
              key={i}
              class="pl-callus"
              cx={150 + (i % 4) * 7}
              cy={122 - Math.floor(i / 4) * 7}
              r={6}
            />
          ))}
          <Label x={160} y={96} text={t(L.callus)} anchor="middle" />
          <Label x={160} y={180} text={t(L.medium)} anchor="middle" cls="is-dim" />
        </g>
      ) : (
        <g>
          {[110, 145, 180, 215].map((x) => (
            <Sprout key={x} x={x} y={126} h={22} />
          ))}
          <Label x={160} y={86} text={t(L.plantlets)} anchor="middle" />
          <Label x={160} y={180} text={t(L.hormones)} anchor="middle" cls="is-dim" />
        </g>
      )}
    </g>
  );
}

export function PlantPropagationView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PropagationState;
  const t: T = (w) => say(locale, w);
  const pic = (() => {
    switch (s.method) {
      case Method.Potato:
        return <PotatoPic step={s.step} t={t} />;
      case Method.Bryophyllum:
        return <BryophyllumPic step={s.step} t={t} />;
      case Method.MoneyPlant:
        return <MoneyPlantPic step={s.step} t={t} />;
      case Method.Layering:
        return <LayeringPic step={s.step} t={t} />;
      case Method.Grafting:
        return <GraftingPic step={s.step} t={t} />;
      case Method.TissueCulture:
        return <TissuePic step={s.step} t={t} />;
    }
  })();
  return (
    <div class="rp pp">
      {s.choices.length > 0 && (
        <div data-part={PropagationPart.Choices}>
          <Controls>
            {s.choices.map((m) => (
              <Button
                key={m}
                label={t(NAMES[m])}
                isOn={m === s.method}
                onClick={() => call(PropagationAction.Choose, { method: m })}
              />
            ))}
          </Controls>
        </div>
      )}
      <Frame w={W} h={H} width={width} label={describePropagation(s)} cls="pp-svg">
        <rect class="pl-sky" x={0} y={0} width={W} height={H} />
        <g data-part={PropagationPart.Picture} class={s.showNames ? "" : "rp-no-names"}>
          {pic}
          <Label x={10} y={18} text={t(NAMES[s.method])} cls="is-big" />
        </g>
      </Frame>
      <Caption
        text={say(locale, CAPTIONS[s.method][s.step] ?? CAPTIONS[s.method][0] ?? NAMES.potato)}
      />
      {s.canStep && (
        <Stepper
          step={s.step}
          count={stepsOfMethod(s.method)}
          locale={locale}
          part={PropagationPart.Next}
          onNext={() => call(PropagationAction.Next, {})}
          onReset={() => call(PropagationAction.Reset, {})}
        />
      )}
    </div>
  );
}

const CAPTIONS: Readonly<Record<Method, readonly Words[]>> = {
  potato: [
    {
      en: "Four potato pieces on wet cotton: two with a bud, two without.",
      hi: "गीली रुई पर आलू के चार टुकड़े: दो कली वाले, दो बिना कली के।",
    },
    {
      en: "Day 3: the pieces with a bud start to sprout.",
      hi: "दिन 3: कली वाले टुकड़े अंकुरित होने लगते हैं।",
    },
    {
      en: "Day 7: only the pieces with a bud grow shoots and roots.",
      hi: "दिन 7: केवल कली वाले टुकड़ों में तने और जड़ें निकलती हैं।",
    },
  ],
  bryophyllum: [
    {
      en: "Buds grow in the notches along the leaf's edge.",
      hi: "पत्ती के किनारे के खाँचों में कलियाँ उगती हैं।",
    },
    { en: "The leaf falls on the soil.", hi: "पत्ती मिट्टी पर गिरती है।" },
    { en: "Each bud grows into a new plant.", hi: "हर कली एक नए पौधे में बढ़ती है।" },
  ],
  moneyPlant: [
    {
      en: "Two pieces in water: one with a leaf, one from between two leaves.",
      hi: "पानी में दो टुकड़े: एक पत्ती वाला, एक दो पत्तियों के बीच का।",
    },
    { en: "Day 5: the piece with a leaf grows roots.", hi: "दिन 5: पत्ती वाले टुकड़े में जड़ें निकलती हैं।" },
    {
      en: "Day 10: only the piece with a leaf grows roots and a fresh leaf.",
      hi: "दिन 10: केवल पत्ती वाले टुकड़े में जड़ें और नई पत्ती आती है।",
    },
  ],
  layering: [
    {
      en: "A branch is bent down and covered with soil, still on the parent.",
      hi: "एक शाखा झुकाकर मिट्टी से ढकी जाती है, अभी भी पौधे से जुड़ी।",
    },
    { en: "Roots grow from the buried part.", hi: "दबे हुए हिस्से से जड़ें निकलती हैं।" },
    { en: "Cut it free: a new plant.", hi: "काटकर अलग करो: एक नया पौधा।" },
  ],
  grafting: [
    {
      en: "A rooted plant (stock) and a cut shoot (scion).",
      hi: "जड़ वाला पौधा (स्टॉक) और कटा हुआ तना (सायन)।",
    },
    { en: "The scion is joined to the stock and tied.", hi: "सायन को स्टॉक से जोड़कर बाँधा जाता है।" },
    {
      en: "They grow as one plant, with the scion's flowers.",
      hi: "वे एक पौधे की तरह बढ़ते हैं, सायन के फूलों के साथ।",
    },
  ],
  tissueCulture: [
    { en: "Cells are taken from the growing tip.", hi: "बढ़ते सिरे से कोशिकाएँ ली जाती हैं।" },
    {
      en: "In an artificial medium they divide into a callus.",
      hi: "कृत्रिम माध्यम में वे बँटकर कैलस बनाती हैं।",
    },
    {
      en: "Hormones make the callus form plantlets.",
      hi: "हॉर्मोन कैलस से पौधिकाएँ बनवाते हैं।",
    },
    {
      en: "The plantlets grow in soil: many plants from one parent.",
      hi: "पौधिकाएँ मिट्टी में बढ़ती हैं: एक पौधे से अनेक पौधे।",
    },
  ],
};
