import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  AsexualAction,
  AsexualPart,
  type AsexualState,
  Organism,
  describeAsexual,
  stepsOf,
} from "./asexual";
import { Arrow, Button, Caption, Controls, Frame, Label, Stepper, type Words, say } from "./draw";

const W = 320;
const H = 200;

const NAMES: Readonly<Record<Organism, Words>> = {
  amoeba: { en: "Amoeba", hi: "अमीबा" },
  leishmania: { en: "Leishmania", hi: "लेस्मानिया" },
  plasmodium: { en: "Plasmodium", hi: "प्लैज्मोडियम" },
  yeast: { en: "Yeast", hi: "यीस्ट" },
  spirogyra: { en: "Spirogyra", hi: "स्पाइरोगाइरा" },
  planaria: { en: "Planaria", hi: "प्लेनेरिया" },
  hydra: { en: "Hydra", hi: "हाइड्रा" },
  rhizopus: { en: "Bread mould", hi: "ब्रेड का फफूँद" },
};

const L = {
  nucleus: { en: "nucleus", hi: "केंद्रक" },
  nuclei: { en: "many nuclei", hi: "अनेक केंद्रक" },
  whip: { en: "whip-like structure", hi: "कशाभ जैसी संरचना" },
  bud: { en: "bud", hi: "कली" },
  fragments: { en: "fragments", hi: "खंड" },
  cut: { en: "cut", hi: "काटा" },
  hyphae: { en: "hyphae", hi: "कवक तंतु" },
  sporangium: { en: "sporangium", hi: "बीजाणुधानी" },
  spores: { en: "spores", hi: "बीजाणु" },
  bread: { en: "bread", hi: "ब्रेड" },
  daughters: { en: "daughter cells", hi: "संतति कोशिकाएँ" },
  tentacles: { en: "tentacles", hi: "स्पर्शक" },
  newPlanaria: { en: "each piece grows into a whole one", hi: "हर टुकड़ा पूरा बन जाता है" },
} as const satisfies Record<string, Words>;

function Blob({
  cx,
  cy,
  rx,
  ry,
  cls = "as-cell",
}: { cx: number; cy: number; rx: number; ry: number; cls?: string }) {
  return <ellipse class={cls} cx={cx} cy={cy} rx={rx} ry={ry} />;
}

function Nucleus({ cx, cy, r = 9 }: { cx: number; cy: number; r?: number }) {
  return <circle class="as-nucleus" cx={cx} cy={cy} r={r} />;
}

function AmoebaPic({ step, t }: { step: number; t: (w: Words) => string }) {
  const amoebaPath = (cx: number, cy: number, k: number) =>
    `M${cx - 40 * k} ${cy - 6 * k} C${cx - 36 * k} ${cy - 34 * k} ${cx - 4 * k} ${cy - 40 * k} ${cx + 18 * k} ${cy - 30 * k} C${cx + 34 * k} ${cy - 42 * k} ${cx + 52 * k} ${cy - 22 * k} ${cx + 40 * k} ${cy - 2 * k} C${cx + 56 * k} ${cy + 18 * k} ${cx + 30 * k} ${cy + 38 * k} ${cx + 4 * k} ${cy + 30 * k} C${cx - 18 * k} ${cy + 44 * k} ${cx - 50 * k} ${cy + 26 * k} ${cx - 40 * k} ${cy - 6 * k} Z`;
  if (step === 3) {
    return (
      <g>
        <path class="as-cell" d={amoebaPath(96, 96, 0.9)} />
        <Nucleus cx={96} cy={96} />
        <path class="as-cell" d={amoebaPath(226, 104, 0.9)} />
        <Nucleus cx={226} cy={104} />
        <Label x={160} y={180} text={t(L.daughters)} anchor="middle" />
      </g>
    );
  }
  if (step === 2) {
    return (
      <g>
        <path
          class="as-cell"
          d="M70 70 C90 40 150 52 160 82 C170 52 232 40 252 72 C276 104 250 140 214 136 C190 134 172 124 160 112 C148 124 130 134 106 136 C70 140 50 104 70 70 Z"
        />
        <Nucleus cx={110} cy={96} />
        <Nucleus cx={210} cy={96} />
        <Arrow x1={160} y1={44} x2={160} y2={74} />
        <Arrow x1={160} y1={156} x2={160} y2={124} />
      </g>
    );
  }
  return (
    <g>
      <path class="as-cell" d={amoebaPath(160, 100, 1.6)} />
      {step === 0 ? (
        <Nucleus cx={160} cy={100} r={13} />
      ) : (
        <g>
          <Nucleus cx={132} cy={100} />
          <Nucleus cx={188} cy={100} />
        </g>
      )}
      <Label x={160} y={step === 0 ? 128 : 126} text={t(L.nucleus)} anchor="middle" cls="is-dim" />
    </g>
  );
}

function Leish({ cx, cy, k = 1 }: { cx: number; cy: number; k?: number }) {
  return (
    <g>
      <ellipse class="as-cell" cx={cx} cy={cy} rx={34 * k} ry={14 * k} />
      <path
        class="as-whip"
        d={`M${cx + 34 * k} ${cy} q ${18 * k} ${-12 * k} ${30 * k} 0 t ${30 * k} 0`}
      />
      <Nucleus cx={cx - 8 * k} cy={cy} r={6 * k} />
    </g>
  );
}

function LeishmaniaPic({ step, t }: { step: number; t: (w: Words) => string }) {
  if (step === 0)
    return (
      <g>
        <Leish cx={130} cy={100} k={1.6} />
        <Label x={232} y={80} text={t(L.whip)} anchor="middle" />
      </g>
    );
  if (step === 1)
    return (
      <g>
        <ellipse class="as-cell" cx={130} cy={100} rx={54} ry={34} />
        <line class="as-split" x1={70} y1={100} x2={190} y2={100} />
        <path class="as-whip" d="M184 84 q 18 -12 30 0 t 30 0" />
        <path class="as-whip" d="M184 116 q 18 -12 30 0 t 30 0" />
        <Nucleus cx={120} cy={86} r={8} />
        <Nucleus cx={120} cy={114} r={8} />
      </g>
    );
  return (
    <g>
      <Leish cx={120} cy={66} k={1.2} />
      <Leish cx={120} cy={136} k={1.2} />
      <Label x={250} y={104} text={t(L.daughters)} anchor="middle" />
    </g>
  );
}

const DAUGHTERS: readonly [number, number][] = [
  [124, 70],
  [160, 58],
  [196, 70],
  [208, 104],
  [196, 138],
  [160, 150],
  [124, 138],
  [112, 104],
];

function PlasmodiumPic({ step, t }: { step: number; t: (w: Words) => string }) {
  if (step === 2)
    return (
      <g>
        <circle class="as-ghost" cx={160} cy={104} r={58} />
        {DAUGHTERS.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle class="as-cell" cx={x + (x - 160) * 0.25} cy={y + (y - 104) * 0.25} r={14} />
            <Nucleus cx={x + (x - 160) * 0.25} cy={y + (y - 104) * 0.25} r={5} />
          </g>
        ))}
        <Label x={160} y={190} text={t(L.daughters)} anchor="middle" />
      </g>
    );
  return (
    <g>
      <circle class="as-cell" cx={160} cy={100} r={62} />
      {step === 0 ? (
        <Nucleus cx={160} cy={100} r={14} />
      ) : (
        DAUGHTERS.map(([x, y]) => <Nucleus key={`${x}-${y}`} cx={x} cy={y} r={6} />)
      )}
      <Label
        x={160}
        y={186}
        text={t(step === 0 ? L.nucleus : L.nuclei)}
        anchor="middle"
        cls="is-dim"
      />
    </g>
  );
}

function YeastPic({ step, t }: { step: number; t: (w: Words) => string }) {
  return (
    <g>
      <Blob cx={130} cy={104} rx={46} ry={40} />
      <Nucleus cx={124} cy={104} r={10} />
      {step === 1 && (
        <g>
          <Blob cx={182} cy={80} rx={16} ry={14} />
          <Label x={204} y={64} text={t(L.bud)} />
        </g>
      )}
      {step === 2 && (
        <g>
          <Blob cx={226} cy={76} rx={32} ry={28} />
          <Nucleus cx={226} cy={76} r={7} />
          <Arrow x1={182} y1={88} x2={200} y2={82} />
          <Label x={226} y={124} text={t(L.bud)} anchor="middle" />
        </g>
      )}
    </g>
  );
}

function Filament({ x, y, n, w = 26 }: { x: number; y: number; n: number; w?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed cells
        <g key={i}>
          <rect class="as-alga" x={x + i * w} y={y} width={w} height={16} rx={3} />
          <path
            class="as-spiral"
            d={`M${x + i * w + 2} ${y + 12} q ${w / 4} -10 ${w / 2} 0 t ${w / 2 - 4} 0`}
          />
        </g>
      ))}
    </g>
  );
}

function SpirogyraPic({ step, t }: { step: number; t: (w: Words) => string }) {
  if (step === 0) return <Filament x={30} y={92} n={10} />;
  if (step === 1)
    return (
      <g>
        <Filament x={18} y={92} n={3} />
        <Filament x={118} y={92} n={4} />
        <Filament x={238} y={92} n={3} />
        <Label x={160} y={140} text={t(L.fragments)} anchor="middle" />
      </g>
    );
  return (
    <g>
      <Filament x={20} y={40} n={10} />
      <Filament x={20} y={92} n={10} />
      <Filament x={20} y={144} n={10} />
    </g>
  );
}

function Planaria({
  x,
  y,
  k = 1,
  piece,
}: { x: number; y: number; k?: number; piece?: "head" | "mid" | "tail" }) {
  const full = `M${x} ${y} c ${20 * k} ${-22 * k} ${50 * k} ${-18 * k} ${60 * k} ${-6 * k} c ${30 * k} ${-4 * k} ${80 * k} ${-2 * k} ${110 * k} ${6 * k} c ${-30 * k} ${10 * k} ${-80 * k} ${12 * k} ${-110 * k} ${8 * k} c ${-10 * k} ${10 * k} ${-40 * k} ${12 * k} ${-60 * k} ${-8 * k} z`;
  if (piece === undefined)
    return (
      <g>
        <path class="as-worm" d={full} />
        <circle class="as-eye" cx={x + 22 * k} cy={y - 6 * k} r={2.4 * k} />
        <circle class="as-eye" cx={x + 22 * k} cy={y + 5 * k} r={2.4 * k} />
      </g>
    );
  const clip = { head: [0, 60], mid: [60, 120], tail: [120, 170] }[piece] as [number, number];
  return (
    <g>
      <clipPath id={`pl-${piece}-${Math.round(x)}`}>
        <rect x={x + clip[0] * k} y={y - 40 * k} width={(clip[1] - clip[0]) * k} height={80 * k} />
      </clipPath>
      <g clip-path={`url(#pl-${piece}-${Math.round(x)})`}>
        <path class="as-worm" d={full} />
        {piece === "head" && (
          <g>
            <circle class="as-eye" cx={x + 22 * k} cy={y - 6 * k} r={2.4 * k} />
            <circle class="as-eye" cx={x + 22 * k} cy={y + 5 * k} r={2.4 * k} />
          </g>
        )}
      </g>
    </g>
  );
}

function PlanariaPic({ step, t }: { step: number; t: (w: Words) => string }) {
  if (step === 0) return <Planaria x={46} y={100} k={1.35} />;
  if (step === 1)
    return (
      <g>
        <g transform="translate(-20 0)">
          <Planaria x={46} y={100} k={1.35} piece="head" />
        </g>
        <Planaria x={46} y={100} k={1.35} piece="mid" />
        <g transform="translate(20 0)">
          <Planaria x={46} y={100} k={1.35} piece="tail" />
        </g>
        <Label x={160} y={150} text={t(L.cut)} anchor="middle" />
      </g>
    );
  return (
    <g>
      <Planaria x={70} y={42} k={1} />
      <Planaria x={70} y={100} k={1} />
      <Planaria x={70} y={158} k={1} />
      <Label x={160} y={192} text={t(L.newPlanaria)} anchor="middle" />
    </g>
  );
}

function Hydra({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  return (
    <g>
      <path
        class="as-hydra"
        d={`M${x - 10 * k} ${y} L${x - 8 * k} ${y - 80 * k} Q${x} ${y - 90 * k} ${x + 8 * k} ${y - 80 * k} L${x + 10 * k} ${y} Z`}
      />
      {[-28, -12, 12, 28].map((dx) => (
        <path
          key={dx}
          class="as-tentacle"
          d={`M${x + dx * 0.2 * k} ${y - 84 * k} q ${dx * 0.6 * k} ${-14 * k} ${dx * k} ${-28 * k}`}
        />
      ))}
      <rect class="as-foot" x={x - 14 * k} y={y - 3 * k} width={28 * k} height={5 * k} rx={2} />
    </g>
  );
}

function HydraPic({ step, t }: { step: number; t: (w: Words) => string }) {
  return (
    <g>
      <rect class="as-ground" x={0} y={176} width={W} height={24} />
      <Hydra x={120} y={176} k={1.25} />
      {step === 1 && (
        <g>
          <ellipse class="as-hydra" cx={136} cy={112} rx={11} ry={8} />
          <Label x={166} y={104} text={t(L.bud)} />
        </g>
      )}
      {step === 2 && (
        <g transform="rotate(60 130 116)">
          <Hydra x={130} y={116} k={0.45} />
        </g>
      )}
      {step === 3 && <Hydra x={226} y={176} k={0.9} />}
      {step >= 2 && (
        <Label
          x={step === 3 ? 226 : 200}
          y={step === 3 ? 192 : 72}
          text={t(L.tentacles)}
          anchor="middle"
          cls="is-dim"
        />
      )}
    </g>
  );
}

function RhizopusPic({ step, t }: { step: number; t: (w: Words) => string }) {
  const stalks = [60, 112, 168, 220, 262];
  return (
    <g>
      <rect class="as-bread" x={20} y={150} width={280} height={36} rx={10} />
      <path class="as-hypha" d="M30 150 q 30 -10 60 0 t 60 0 t 60 0 t 60 0 t 50 0" />
      <path class="as-hypha" d="M44 156 q 40 -8 80 0 t 80 0 t 80 0" />
      {step >= 1 &&
        stalks.map((x, i) => (
          <g key={x}>
            <line
              class="as-stalk"
              x1={x}
              y1={150}
              x2={x + (i % 2 === 0 ? -4 : 4)}
              y2={92 + (i % 3) * 8}
            />
            {(step === 1 || i % 2 === 1) && (
              <circle
                class="as-sporangium"
                cx={x + (i % 2 === 0 ? -4 : 4)}
                cy={86 + (i % 3) * 8}
                r={10}
              />
            )}
          </g>
        ))}
      {step === 2 &&
        [
          [40, 40],
          [76, 26],
          [104, 52],
          [150, 34],
          [196, 48],
          [240, 28],
          [280, 52],
        ].map(([x, y]) => <circle key={`${x}-${y}`} class="as-spore" cx={x} cy={y} r={3.5} />)}
      <Label x={290} y={176} text={t(L.bread)} anchor="end" cls="is-dim" />
      <Label x={30} y={144} text={t(L.hyphae)} />
      {step >= 1 && <Label x={188} y={70} text={t(L.sporangium)} anchor="middle" />}
      {step === 2 && <Label x={160} y={18} text={t(L.spores)} anchor="middle" />}
    </g>
  );
}

export function AsexualModesView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as AsexualState;
  const t = (w: Words) => say(locale, w);
  const step = s.step;
  const pic = (() => {
    switch (s.organism) {
      case Organism.Amoeba:
        return <AmoebaPic step={step} t={t} />;
      case Organism.Leishmania:
        return <LeishmaniaPic step={step} t={t} />;
      case Organism.Plasmodium:
        return <PlasmodiumPic step={step} t={t} />;
      case Organism.Yeast:
        return <YeastPic step={step} t={t} />;
      case Organism.Spirogyra:
        return <SpirogyraPic step={step} t={t} />;
      case Organism.Planaria:
        return <PlanariaPic step={step} t={t} />;
      case Organism.Hydra:
        return <HydraPic step={step} t={t} />;
      case Organism.Rhizopus:
        return <RhizopusPic step={step} t={t} />;
    }
  })();
  return (
    <div class="rp as">
      {s.choices.length > 0 && (
        <div data-part={AsexualPart.Choices}>
          <Controls>
            {s.choices.map((o) => (
              <Button
                key={o}
                label={t(NAMES[o])}
                isOn={o === s.organism}
                onClick={() => call(AsexualAction.Choose, { organism: o })}
              />
            ))}
          </Controls>
        </div>
      )}
      <Frame w={W} h={H} width={width} label={describeAsexual(s)} cls="as-svg">
        <rect class="as-water" x={0} y={0} width={W} height={H} />
        <g data-part={AsexualPart.Picture} class={s.showNames ? "" : "rp-no-names"}>
          {pic}
          <Label x={10} y={18} text={t(NAMES[s.organism])} cls="is-big" />
        </g>
      </Frame>
      <Caption
        text={say(locale, CAPTIONS[s.organism][step] ?? CAPTIONS[s.organism][0] ?? NAMES.amoeba)}
      />
      {s.canStep && (
        <Stepper
          step={step}
          count={stepsOf(s.organism)}
          locale={locale}
          part={AsexualPart.Next}
          onNext={() => call(AsexualAction.Next, {})}
          onReset={() => call(AsexualAction.Reset, {})}
        />
      )}
    </div>
  );
}

const CAPTIONS: Readonly<Record<Organism, readonly Words[]>> = {
  amoeba: [
    { en: "One Amoeba: a single cell.", hi: "एक अमीबा: एक कोशिका।" },
    { en: "Its nucleus divides into two.", hi: "इसका केंद्रक दो में बँटता है।" },
    {
      en: "The cell pinches in two, in any plane.",
      hi: "कोशिका किसी भी तल में दो भागों में बँट जाती है।",
    },
    { en: "Two daughter cells: binary fission.", hi: "दो संतति कोशिकाएँ: द्विखंडन।" },
  ],
  leishmania: [
    {
      en: "Leishmania (it causes kala-azar) has a whip-like structure at one end.",
      hi: "लेस्मानिया (काला-अज़ार का कारण) के एक सिरे पर कशाभ जैसी संरचना होती है।",
    },
    {
      en: "It splits in a definite orientation to that structure.",
      hi: "यह उस संरचना के सापेक्ष एक निश्चित दिशा में बँटता है।",
    },
    { en: "Two cells: binary fission.", hi: "दो कोशिकाएँ: द्विखंडन।" },
  ],
  plasmodium: [
    {
      en: "Plasmodium, the malarial parasite.",
      hi: "प्लैज्मोडियम, मलेरिया परजीवी।",
    },
    { en: "Its nucleus divides many times.", hi: "इसका केंद्रक कई बार बँटता है।" },
    {
      en: "Many daughter cells at once: multiple fission.",
      hi: "एक साथ अनेक संतति कोशिकाएँ: बहुखंडन।",
    },
  ],
  yeast: [
    { en: "A yeast cell.", hi: "एक यीस्ट कोशिका।" },
    { en: "It puts out a small bud.", hi: "यह एक छोटी कली निकालती है।" },
    { en: "The bud separates and grows: budding.", hi: "कली अलग होकर बढ़ती है: मुकुलन।" },
  ],
  spirogyra: [
    { en: "A Spirogyra filament.", hi: "स्पाइरोगाइरा का एक तंतु।" },
    {
      en: "When mature, it breaks into fragments.",
      hi: "परिपक्व होने पर यह खंडों में टूट जाता है।",
    },
    {
      en: "Each fragment grows into a new filament: fragmentation.",
      hi: "हर खंड नए तंतु में बढ़ता है: खंडन।",
    },
  ],
  planaria: [
    { en: "A Planaria.", hi: "एक प्लेनेरिया।" },
    { en: "It is cut into pieces.", hi: "इसे टुकड़ों में काटा जाता है।" },
    {
      en: "Each piece grows into a complete Planaria: regeneration.",
      hi: "हर टुकड़ा पूरा प्लेनेरिया बन जाता है: पुनरुद्भवन।",
    },
  ],
  hydra: [
    { en: "A Hydra.", hi: "एक हाइड्रा।" },
    {
      en: "Cells divide again and again at one spot: a bud.",
      hi: "एक जगह कोशिकाएँ बार-बार बँटती हैं: एक कली।",
    },
    { en: "The bud becomes a tiny Hydra.", hi: "कली एक नन्हा हाइड्रा बन जाती है।" },
    {
      en: "It detaches and lives on its own: budding.",
      hi: "यह अलग होकर स्वतंत्र जीता है: मुकुलन।",
    },
  ],
  rhizopus: [
    {
      en: "Bread mould: thread-like hyphae. These are not reproductive parts.",
      hi: "ब्रेड का फफूँद: धागे जैसे कवक तंतु। ये जनन अंग नहीं हैं।",
    },
    {
      en: "Blobs on sticks: sporangia, full of spores.",
      hi: "डंडियों पर गोले: बीजाणुधानियाँ, बीजाणुओं से भरी।",
    },
    {
      en: "Spores with thick walls spread, and grow where it is moist.",
      hi: "मोटी भित्ति वाले बीजाणु फैलते हैं, और नमी मिलने पर उगते हैं।",
    },
  ],
};
