import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { CYCLE_STEPS, CycleAction, CyclePart, type CycleState, describeCycle } from "./cycle";
import { Caption, Frame, Label, Stepper, type Words, say } from "./draw";

const W = 320;
const H = 200;

const STAGES: readonly Words[] = [
  { en: "lining thickens", hi: "परत मोटी होती है" },
  { en: "egg released", hi: "अंडाणु निकलता है" },
  { en: "egg lives ~1 day", hi: "अंडाणु ~1 दिन जीता है" },
  { en: "lining breaks: 2–8 days", hi: "परत टूटती है: 2–8 दिन" },
];

const CAPTIONS: readonly Words[] = [
  {
    en: "The uterus lining becomes thick and spongy, rich in blood.",
    hi: "गर्भाशय की परत मोटी और स्पंजी हो जाती है, रक्त से भरपूर।",
  },
  { en: "An ovary releases one egg.", hi: "एक अंडाशय एक अंडाणु छोड़ता है।" },
  {
    en: "The egg is not fertilised; it lives about one day.",
    hi: "अंडाणु निषेचित नहीं होता; यह लगभग एक दिन जीता है।",
  },
  {
    en: "The lining breaks and leaves as blood and mucus: menstruation.",
    hi: "परत टूटकर रक्त और श्लेष्मा के रूप में बाहर आती है: ऋतुस्राव।",
  },
];

const L = {
  month: { en: "≈ 1 month", hi: "≈ 1 महीना" },
  egg: { en: "egg", hi: "अंडाणु" },
} as const satisfies Record<string, Words>;

/** A simple uterus with its lining: thick, or breaking down. */
function Uterus({ step }: { step: number }) {
  const isBreaking = step === 3;
  return (
    <g transform="translate(-60 0)">
      {[-1, 1].map((d) => (
        <path
          key={d}
          class="rph-tube"
          d={`M${160 + d * 26} 62 Q ${160 + d * 60} 34 ${160 + d * 80} 52`}
        />
      ))}
      {[-1, 1].map((d) => (
        <ellipse key={`o${d}`} class="rph-ovary" cx={160 + d * 78} cy={72} rx={14} ry={9} />
      ))}
      <path
        class="rph-uterus"
        d="M128 58 Q 160 50 192 58 Q 202 104 172 138 L148 138 Q 118 104 128 58 Z"
      />
      <path
        class={isBreaking ? "mc-lining is-breaking" : "mc-lining"}
        d="M138 66 Q 160 60 182 66 Q 188 102 166 128 L154 128 Q 132 102 138 66 Z"
      />
      <rect class="rph-cervix" x={148} y={136} width={24} height={14} rx={5} />
      <rect class="rph-vagina" x={150} y={150} width={20} height={36} rx={6} />
      {step >= 1 && step <= 2 && (
        <circle
          class={step === 2 ? "rph-egg is-fading" : "rph-egg"}
          cx={step === 1 ? 228 : 214}
          cy={step === 1 ? 74 : 46}
          r={6}
        />
      )}
      {isBreaking &&
        [154, 160, 166].map((x, i) => (
          <circle key={x} class="mc-drop" cx={x} cy={170 + i * 6} r={2.2} />
        ))}
    </g>
  );
}

export function MenstrualCycleView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CycleState;
  const t = (w: Words) => say(locale, w);
  const cx = 250;
  const cy = 96;
  const r = 44;
  return (
    <div class="rp mc">
      <Frame w={W} h={H} width={width} label={describeCycle(s)} cls="mc-svg">
        <rect class="rp-bg" x={0} y={0} width={W} height={H} />
        <g data-part={CyclePart.Picture} class={s.showNames ? "" : "rp-no-names"}>
          <Uterus step={s.step} />
          <circle class="mc-ring" cx={cx} cy={cy} r={r} />
          {STAGES.map((_, i) => {
            const a = -Math.PI / 2 + (i / CYCLE_STEPS) * Math.PI * 2;
            return (
              <circle
                // biome-ignore lint/suspicious/noArrayIndexKey: four fixed stages
                key={i}
                class={i === s.step ? "mc-dot is-on" : "mc-dot"}
                cx={cx + r * Math.cos(a)}
                cy={cy + r * Math.sin(a)}
                r={i === s.step ? 8 : 5}
              />
            );
          })}
          <Label x={cx} y={cy + 22} text={t(L.month)} anchor="middle" cls="is-dim" />
          <Label
            x={cx}
            y={170}
            text={t(STAGES[s.step] ?? STAGES[0] ?? L.month)}
            anchor="middle"
            cls="is-big"
          />
        </g>
      </Frame>
      <Caption text={t(CAPTIONS[s.step] ?? CAPTIONS[0] ?? L.month)} />
      {s.canStep && (
        <Stepper
          step={s.step}
          count={CYCLE_STEPS}
          locale={locale}
          part={CyclePart.Next}
          onNext={() => call(CycleAction.Next, {})}
          onReset={() => call(CycleAction.Reset, {})}
        />
      )}
    </div>
  );
}
