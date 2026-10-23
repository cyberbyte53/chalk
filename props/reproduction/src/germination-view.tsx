import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Caption, Frame, Label, Stepper, type Words, say } from "./draw";
import {
  GERMINATION_STEPS,
  GerminationAction,
  GerminationPart,
  type GerminationState,
  describeGermination,
} from "./germination";

const W = 320;
const H = 200;

const L = {
  dry: { en: "dry chana", hi: "सूखे चने" },
  soaked: { en: "soaked overnight", hi: "रात भर भिगोए" },
  cloth: { en: "under a wet cloth", hi: "गीले कपड़े के नीचे" },
  cotyledon: { en: "cotyledon (food store)", hi: "बीजपत्र (भोजन भंडार)" },
  plumule: { en: "plumule (future shoot)", hi: "प्रांकुर (भावी प्ररोह)" },
  radicle: { en: "radicle (future root)", hi: "मूलांकुर (भावी जड़)" },
} as const satisfies Record<string, Words>;

const CAPTIONS: readonly Words[] = [
  { en: "Dry chana seeds.", hi: "सूखे चने के बीज।" },
  { en: "Soaked overnight, they swell.", hi: "रात भर भिगोने पर वे फूल जाते हैं।" },
  {
    en: "A day under a wet cloth: tiny roots push out.",
    hi: "गीले कपड़े के नीचे एक दिन: नन्ही जड़ें निकलती हैं।",
  },
  {
    en: "Cut open: cotyledons, plumule and radicle.",
    hi: "काटकर खोला: बीजपत्र, प्रांकुर और मूलांकुर।",
  },
];

function Seed({ x, y, r, root = 0 }: { x: number; y: number; r: number; root?: number }) {
  return (
    <g>
      <path
        class="sg-seed"
        d={`M${x} ${y - r} Q ${x + r * 1.2} ${y - r} ${x + r} ${y + r * 0.2} Q ${x + r * 0.8} ${y + r} ${x} ${y + r} Q ${x - r} ${y + r} ${x - r} ${y} Q ${x - r} ${y - r * 0.9} ${x} ${y - r} Z`}
      />
      <circle class="sg-tip" cx={x + r * 0.55} cy={y - r * 0.55} r={r * 0.16} />
      {root > 0 && (
        <path
          class="sg-radicle"
          d={`M${x + r * 0.6} ${y - r * 0.5} q ${root * 0.6} ${root * 0.2} ${root * 0.4} ${root}`}
        />
      )}
    </g>
  );
}

export function SeedGerminationView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as GerminationState;
  const t = (w: Words) => say(locale, w);
  const pic = (() => {
    if (s.step === 3)
      return (
        <g>
          <path class="sg-cotyledon" d="M160 40 Q 90 44 84 104 Q 90 164 160 166 Z" />
          <path class="sg-cotyledon is-right" d="M164 40 Q 236 44 240 104 Q 234 164 164 166 Z" />
          <path class="sg-axis" d="M162 60 L162 150" />
          <path
            class="sg-plumule"
            d="M162 62 q -8 -10 -2 -18 q 6 6 2 18 z M162 62 q 8 -10 2 -18 q -6 6 -2 18 z"
          />
          <path class="sg-radicle" d="M162 150 q 4 18 -2 34" />
          <line class="sg-leader" x1={170} y1={52} x2={236} y2={30} />
          <Label x={238} y={28} text={t(L.plumule)} />
          <line class="sg-leader" x1={162} y1={176} x2={226} y2={186} />
          <Label x={228} y={190} text={t(L.radicle)} />
          <line class="sg-leader" x1={110} y1={104} x2={40} y2={60} />
          <Label x={10} y={52} text={t(L.cotyledon)} />
        </g>
      );
    const r = s.step === 0 ? 14 : 19;
    const spots: readonly [number, number][] = [
      [80, 90],
      [140, 80],
      [200, 94],
      [250, 82],
      [110, 134],
      [170, 130],
      [230, 136],
    ];
    return (
      <g>
        {s.step === 1 && <rect class="sg-water" x={30} y={56} width={260} height={110} rx={14} />}
        {spots.map(([x, y]) => (
          <Seed key={`${x}-${y}`} x={x} y={y} r={r} root={s.step === 2 ? 22 : 0} />
        ))}
        {s.step === 2 && (
          <path class="sg-cloth" d="M20 40 Q 160 20 300 40 L300 70 Q 160 54 20 70 Z" />
        )}
        <Label
          x={160}
          y={190}
          text={t([L.dry, L.soaked, L.cloth][s.step] ?? L.dry)}
          anchor="middle"
          cls="is-big"
        />
      </g>
    );
  })();
  return (
    <div class="rp sg">
      <Frame w={W} h={H} width={width} label={describeGermination(s)} cls="sg-svg">
        <rect class="rp-bg" x={0} y={0} width={W} height={H} />
        <g data-part={GerminationPart.Picture} class={s.showNames ? "" : "rp-no-names"}>
          {pic}
        </g>
      </Frame>
      <Caption text={t(CAPTIONS[s.step] ?? CAPTIONS[0] ?? L.dry)} />
      {s.canStep && (
        <Stepper
          step={s.step}
          count={GERMINATION_STEPS}
          locale={locale}
          part={GerminationPart.Next}
          onNext={() => call(GerminationAction.Next, {})}
          onReset={() => call(GerminationAction.Reset, {})}
        />
      )}
    </div>
  );
}
