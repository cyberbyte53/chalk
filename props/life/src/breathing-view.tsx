import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BreathingAction,
  BreathingMode,
  BreathingPart,
  type BreathingState,
  describeBreathing,
} from "./breathing";
import { Arrow, Button, Controls, Frame, Label, type Words, say } from "./draw";

const W = 320;
const H = 220;

const WORDS = {
  in: { en: "Breathe in", hi: "साँस अंदर" },
  out: { en: "Breathe out", hi: "साँस बाहर" },
  nostrils: { en: "nostrils: hairs, mucus", hi: "नासाद्वार: बाल, श्लेष्मा" },
  throat: { en: "throat: cartilage rings", hi: "गला: उपास्थि के छल्ले" },
  bronchi: { en: "bronchi", hi: "श्वसनी" },
  lungs: { en: "lungs: alveoli", hi: "फेफड़े: कूपिकाएँ" },
  ribs: { en: "ribs", hi: "पसलियाँ" },
  diaphragm: { en: "diaphragm", hi: "डायाफ्राम" },
  airIn: { en: "air in", hi: "हवा अंदर" },
  airOut: { en: "air out", hi: "हवा बाहर" },
  ribsUp: { en: "ribs lift", hi: "पसलियाँ उठती हैं" },
  ribsDown: { en: "ribs come down", hi: "पसलियाँ नीचे आती हैं" },
  flat: { en: "diaphragm flattens", hi: "डायाफ्राम चपटा" },
  dome: { en: "diaphragm domes up", hi: "डायाफ्राम ऊपर उठता है" },
  alvAir: { en: "air in the alveolus", hi: "कूपिका में हवा" },
  fromBody: { en: "blood from the body: CO₂", hi: "शरीर से रक्त: CO₂" },
  toHeart: { en: "blood to the heart: O₂", hi: "हृदय को रक्त: O₂" },
  o2: { en: "oxygen", hi: "ऑक्सीजन" },
  co2: { en: "carbon dioxide", hi: "कार्बन डाइऑक्साइड" },
  tube: { en: "smallest air tube", hi: "सबसे पतली वायु नली" },
  waterIn: { en: "water in", hi: "पानी अंदर" },
  gills: { en: "gills", hi: "गलफड़े" },
  waterOut: { en: "water out", hi: "पानी बाहर" },
  dissolved: { en: "oxygen dissolved in water", hi: "पानी में घुली ऑक्सीजन" },
} as const satisfies Record<string, Words>;

function Chest({ s, locale }: { s: BreathingState; locale: string }) {
  const k = s.isIn ? 1.12 : 1;
  const rib = s.isIn ? -10 : 6;
  const diaphragmY = s.isIn ? 184 : 156;
  const names = s.showNames;
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <rect class="br-torso" x={34} y={86} width={152} height={124} rx={34} />
      <circle class="br-head" cx={110} cy={36} r={24} />
      <path class="br-nose" d="M118 34 q 10 6 2 12" />
      <path class="br-trachea" d="M110 58 L110 104" />
      {[66, 74, 82, 90, 98].map((y) => (
        <line key={y} class="br-ring" x1={104} y1={y} x2={116} y2={y} />
      ))}
      <path class="br-bronchus" d="M110 104 Q 96 110 84 120 M110 104 Q 124 110 136 120" />
      <ellipse class="br-lung" cx={80} cy={142} rx={26 * k} ry={40 * k} />
      <ellipse class="br-lung" cx={140} cy={142} rx={26 * k} ry={40 * k} />
      <path
        class="br-bronchus"
        d="M84 120 L 74 136 M84 120 L 90 140 M136 120 L 146 136 M136 120 L 130 140"
      />
      {[118, 138, 158].map((y) => (
        <g key={y}>
          <path class="br-rib" d={`M108 ${y} Q 72 ${y + rib - 6} 44 ${y + rib + 6}`} />
          <path class="br-rib" d={`M112 ${y} Q 148 ${y + rib - 6} 176 ${y + rib + 6}`} />
        </g>
      ))}
      <path class="br-diaphragm" d={`M38 188 Q 110 ${diaphragmY - 30} 182 188`} />
      <g class="lp-oxygen">
        {s.isIn ? (
          <Arrow x1={160} y1={30} x2={126} y2={38} head={6} />
        ) : (
          <Arrow x1={126} y1={40} x2={160} y2={32} head={6} />
        )}
      </g>
      <Label x={164} y={28} text={say(locale, s.isIn ? WORDS.airIn : WORDS.airOut)} cls="is-big" />
      {names && (
        <g>
          <Label x={196} y={56} text={say(locale, WORDS.nostrils)} />
          <Label x={196} y={84} text={say(locale, WORDS.throat)} />
          <line class="br-leader" x1={194} y1={81} x2={118} y2={82} />
          <Label x={196} y={108} text={say(locale, WORDS.bronchi)} />
          <line class="br-leader" x1={194} y1={105} x2={128} y2={112} />
          <Label x={196} y={132} text={say(locale, WORDS.lungs)} />
          <Label
            x={196}
            y={154}
            text={say(locale, s.isIn ? WORDS.ribsUp : WORDS.ribsDown)}
            cls={s.isIn ? "is-good" : "is-dim"}
          />
          <Label
            x={196}
            y={192}
            text={say(locale, s.isIn ? WORDS.flat : WORDS.dome)}
            cls={s.isIn ? "is-good" : "is-dim"}
          />
          <line class="br-leader" x1={194} y1={189} x2={170} y2={184} />
        </g>
      )}
    </g>
  );
}

function Alveolus({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="lp-bg" x={0} y={0} width={W} height={H} />
      <path class="br-tube" d="M160 0 L160 46" />
      <circle class="br-alveolus" cx={160} cy={98} r={56} />
      <path class="br-blood-in" d="M310 168 C 250 178 220 176 166 168" />
      <path class="br-blood-out" d="M166 168 C 110 160 80 176 10 168" />
      <path
        class="lp-flow br-flow"
        d="M310 168 C 250 178 220 176 166 168 C 110 160 80 176 10 168"
      />
      <g class="lp-oxygen">
        <Arrow x1={140} y1={110} x2={140} y2={160} head={6} />
      </g>
      <g class="lp-co2">
        <Arrow x1={186} y1={162} x2={186} y2={112} head={6} />
      </g>
      <Label x={134} y={128} text={say(locale, WORDS.o2)} anchor="end" />
      <Label x={192} y={130} text={say(locale, WORDS.co2)} />
      <Label x={160} y={86} text={say(locale, WORDS.alvAir)} anchor="middle" cls="is-dim" />
      <Label x={168} y={20} text={say(locale, WORDS.tube)} cls="is-dim" />
      <Label x={312} y={198} text={say(locale, WORDS.fromBody)} anchor="end" />
      <Label x={10} y={198} text={say(locale, WORDS.toHeart)} />
    </g>
  );
}

function Fish({ locale }: { locale: string }) {
  return (
    <g>
      <rect class="br-water" x={0} y={0} width={W} height={H} />
      <path class="br-fish" d="M50 110 C 90 50 210 50 250 108 C 210 168 90 168 50 110 Z" />
      <path class="br-fish" d="M248 108 L300 70 L292 110 L300 150 Z" />
      <circle class="br-eye" cx={86} cy={98} r={6} />
      <path class="br-gill" d="M124 74 Q 138 110 124 146" />
      <path class="br-gill-lines" d="M110 86 q 8 24 0 48 M116 82 q 8 28 0 56" />
      <g class="lp-water">
        <Arrow x1={8} y1={114} x2={52} y2={112} head={6} />
        <Arrow x1={60} y1={114} x2={108} y2={112} head={6} />
        <Arrow x1={128} y1={140} x2={150} y2={176} head={6} />
      </g>
      <Label x={10} y={102} text={say(locale, WORDS.waterIn)} />
      <Label x={124} y={66} text={say(locale, WORDS.gills)} anchor="middle" cls="is-big" />
      <Label x={156} y={190} text={say(locale, WORDS.waterOut)} />
      <Label x={10} y={24} text={say(locale, WORDS.dissolved)} cls="is-dim" />
      {[
        [30, 50],
        [60, 180],
        [200, 30],
        [280, 190],
        [24, 150],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} class="lp-o2" cx={x} cy={y} r={2.5} />
      ))}
    </g>
  );
}

export function BreathingView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BreathingState;
  return (
    <div class="lp br">
      <Frame w={W} h={H} width={width} label={describeBreathing(s)} cls="br-svg">
        <g data-part={BreathingPart.Picture}>
          {s.mode === BreathingMode.Chest && <Chest s={s} locale={locale} />}
          {s.mode === BreathingMode.Alveolus && <Alveolus locale={locale} />}
          {s.mode === BreathingMode.Fish && <Fish locale={locale} />}
        </g>
      </Frame>
      {s.mode === BreathingMode.Chest && s.canBreathe && (
        <Controls>
          <Button
            part={BreathingPart.In}
            label={say(locale, WORDS.in)}
            isOn={s.isIn}
            onClick={() => call(BreathingAction.SetPhase, { in: true })}
          />
          <Button
            part={BreathingPart.Out}
            label={say(locale, WORDS.out)}
            isOn={!s.isIn}
            onClick={() => call(BreathingAction.SetPhase, { in: false })}
          />
        </Controls>
      )}
    </div>
  );
}
