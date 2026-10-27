import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  CUPS,
  CUP_FACTS,
  CUP_QUESTIONS,
  Cup,
  CupAction,
  CupPart,
  type CupQuestion,
  type CupState,
  describeCups,
  isGood,
} from "./cups";
import { Arrow, Button, Controls, Frame, Label, type Words, say } from "./draw";

const W = 320;
const H = 200;

const CUP_WORDS: Readonly<Record<Cup, Words>> = {
  returnable: { en: "returned glass", hi: "लौटाया गिलास" },
  disposablePlastic: { en: "plastic cup", hi: "प्लास्टिक कप" },
  kulhad: { en: "kulhad", hi: "कुल्हड़" },
  paper: { en: "paper cup", hi: "कागज़ का कप" },
};
const CUP_SHORT: Readonly<Record<Cup, Words>> = {
  returnable: { en: "glass", hi: "गिलास" },
  disposablePlastic: { en: "plastic", hi: "प्लास्टिक" },
  kulhad: { en: "kulhad", hi: "कुल्हड़" },
  paper: { en: "paper", hi: "कागज़" },
};
const Q_WORDS: Readonly<Record<CupQuestion, Words>> = {
  reused: { en: "used again?", hi: "दोबारा इस्तेमाल?" },
  hygienic: { en: "clean for each person?", hi: "हर व्यक्ति के लिए साफ़?" },
  pilesUp: { en: "waste lasts for years?", hi: "कचरा सालों रहता?" },
  costsTopsoil: { en: "costs topsoil?", hi: "ऊपरी मिट्टी खर्च?" },
};
const WORDS = {
  earlier: { en: "earlier", hi: "पहले" },
  now: { en: "now", hi: "अब" },
  pick: { en: "Pick a cup", hi: "कोई कप चुनो" },
} as const satisfies Record<string, Words>;

function CupDrawing({ cup, x }: { cup: Cup; x: number }) {
  const y = 56;
  switch (cup) {
    case Cup.Kulhad:
      return (
        <path
          class="ev-cup-clay"
          d={`M${x - 14} ${y - 16} L${x + 14} ${y - 16} Q ${x + 12} ${y + 14} ${x} ${y + 14} Q ${x - 12} ${y + 14} ${x - 14} ${y - 16} Z`}
        />
      );
    case Cup.Paper:
      return (
        <path
          class="ev-cup-paper"
          d={`M${x - 13} ${y - 18} L${x + 13} ${y - 18} L${x + 9} ${y + 14} L${x - 9} ${y + 14} Z`}
        />
      );
    default:
      return (
        <path
          class={cup === Cup.Returnable ? "ev-cup-glass" : "ev-cup-plastic"}
          d={`M${x - 12} ${y - 18} L${x + 12} ${y - 18} L${x + 9} ${y + 14} L${x - 9} ${y + 14} Z`}
        />
      );
  }
}

export function CupChoiceView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CupState;
  const xOf = (i: number) => 140 + i * 50;
  const rows = CUP_QUESTIONS;
  const cols = s.showAll ? CUPS : s.selected === null ? [] : [s.selected];
  return (
    <div class="ev ev-cup">
      <Frame w={W} h={H} width={width} label={describeCups(s)} cls="ev-cup-svg">
        <rect class="ev-bg" x={0} y={0} width={W} height={H} />
        <g data-part={CupPart.Cups}>
          <Arrow x1={124} y1={14} x2={312} y2={14} cls="ev-up" />
          <Label x={120} y={18} text={say(locale, WORDS.earlier)} anchor="end" cls="is-dim" />
          {CUPS.map((c, i) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the buttons under the picture do the same
            <g
              key={c}
              class={s.selected === c ? "ev-cup is-sel" : "ev-cup"}
              onClick={() => s.canPick && call(CupAction.Pick, { cup: c })}
            >
              <rect class="ev-cup-slot" x={xOf(i) - 24} y={26} width={48} height={66} rx={8} />
              <CupDrawing cup={c} x={xOf(i)} />
              <Label x={xOf(i)} y={86} text={say(locale, CUP_SHORT[c])} anchor="middle" />
            </g>
          ))}
        </g>
        <g data-part={CupPart.Table}>
          {rows.map((q, r) => (
            <g key={q}>
              <Label x={10} y={118 + r * 22} text={say(locale, Q_WORDS[q])} />
              {cols.map((c) => {
                const yes = CUP_FACTS[c][q];
                const good = isGood(q, yes);
                return (
                  <text
                    key={c}
                    class={good ? "ev-tick is-good" : "ev-tick is-bad"}
                    x={xOf(CUPS.indexOf(c))}
                    y={118 + r * 22}
                    text-anchor="middle"
                  >
                    {yes ? "✓" : "✗"}
                  </text>
                );
              })}
            </g>
          ))}
          {cols.length === 0 && (
            <Label
              x={xOf(1.5)}
              y={150}
              text={say(locale, WORDS.pick)}
              anchor="middle"
              cls="is-dim"
            />
          )}
        </g>
      </Frame>
      {s.canPick && (
        <Controls>
          <span class="ev-row">
            {CUPS.map((c) => (
              <Button
                key={c}
                label={say(locale, CUP_WORDS[c])}
                isOn={s.selected === c}
                onClick={() => call(CupAction.Pick, { cup: c })}
              />
            ))}
          </span>
        </Controls>
      )}
    </div>
  );
}
