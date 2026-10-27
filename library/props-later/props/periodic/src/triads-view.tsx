import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Dots, Frame, type Words, say } from "./draw";
import { bySymbol } from "./elements";
import {
  TRIADS,
  TRIAD_STEPS,
  TriadAction,
  TriadPart,
  type TriadState,
  averageOf,
  describeTriad,
  isTriad,
  middleOf,
} from "./triads";

const W = 320;
const H = 168;

const WORDS = {
  next: { en: "Next →", hi: "आगे →" },
  again: { en: "Again", hi: "फिर से" },
  average: { en: "average of the outer two", hi: "बाहरी दो का औसत" },
  middle: { en: "middle mass", hi: "बीच का द्रव्यमान" },
  yes: { en: "≈ equal: a triad!", hi: "≈ बराबर: त्रिक!" },
  no: { en: "far apart: not a triad", hi: "बहुत अलग: त्रिक नहीं" },
  mass: { en: "mass", hi: "द्रव्यमान" },
} as const satisfies Record<string, Words>;

const X = [58, 160, 262] as const;
const CARD_W = 76;
const CARD_H = 78;
const CARD_Y = 54;

export function TriadsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TriadState;
  const cards = TRIADS[s.set];
  const good = isTriad(s.set);
  return (
    <div class="pt pt-triads">
      <Frame w={W} h={H} width={width} label={describeTriad(s)} cls="pt-triad-svg">
        <rect class="pt-bg" x={0} y={0} width={W} height={H} />
        <g data-part={TriadPart.Cards}>
          {cards.map(([sym, mass], i) => {
            const x = X[i] as number;
            const isMid = i === 1;
            return (
              <g key={sym}>
                <rect
                  class={`pt-card${isMid && s.step >= 1 ? " is-mid" : ""}`}
                  x={x - CARD_W / 2}
                  y={CARD_Y}
                  width={CARD_W}
                  height={CARD_H}
                  rx={8}
                />
                <text class="pt-card-sym" x={x} y={CARD_Y + 36} text-anchor="middle">
                  {sym}
                </text>
                <text class="pt-card-name" x={x} y={CARD_Y + 52} text-anchor="middle">
                  {say(locale, bySymbol(sym).name)}
                </text>
                <text class="pt-card-mass" x={x} y={CARD_Y + 69} text-anchor="middle">
                  {`${say(locale, WORDS.mass)} ${mass.toFixed(1)}`}
                </text>
              </g>
            );
          })}
        </g>
        {s.step >= 1 && (
          <g data-part={TriadPart.Average}>
            <path
              class="pt-bracket"
              d={`M${X[0]} ${CARD_Y - 4} V ${CARD_Y - 16} H ${X[2]} V ${CARD_Y - 4}`}
            />
            <rect class="pt-avg-chip" x={X[1] - 74} y={8} width={148} height={30} rx={8} />
            <text class="pt-avg-num" x={X[1]} y={23} text-anchor="middle">
              {`(${(cards[0] as [string, number])[1].toFixed(1)} + ${(cards[2] as [string, number])[1].toFixed(1)}) ÷ 2 = ${averageOf(s.set)}`}
            </text>
            <text class="pt-avg-word" x={X[1]} y={34} text-anchor="middle">
              {say(locale, WORDS.average)}
            </text>
          </g>
        )}
        {s.step >= 2 && (
          <g data-part={TriadPart.Verdict}>
            <rect
              class={`pt-verdict${good ? " is-good" : " is-bad"}`}
              x={X[1] - 96}
              y={CARD_Y + CARD_H + 6}
              width={192}
              height={24}
              rx={12}
            />
            <text class="pt-verdict-text" x={X[1]} y={CARD_Y + CARD_H + 22} text-anchor="middle">
              {`${averageOf(s.set)} vs ${middleOf(s.set).toFixed(1)}: ${say(locale, good ? WORDS.yes : WORDS.no)}`}
            </text>
          </g>
        )}
      </Frame>
      {(s.canStep || s.choices.length > 0) && (
        <Controls>
          {s.choices.length > 0 && (
            <span class="pt-picks" data-part={TriadPart.Pick}>
              {s.choices.map((c) => (
                <Button
                  key={c}
                  label={TRIADS[c].map(([sym]) => sym).join(" · ")}
                  isOn={c === s.set}
                  onClick={() => call(TriadAction.Pick, { set: c })}
                />
              ))}
            </span>
          )}
          {s.canStep && (
            <span class="pt-stepper" data-part={TriadPart.Next}>
              <Dots step={s.step} count={TRIAD_STEPS} />
              {s.step < TRIAD_STEPS - 1 ? (
                <Button
                  label={say(locale, WORDS.next)}
                  onClick={() => call(TriadAction.Next, {})}
                />
              ) : (
                <Button
                  label={say(locale, WORDS.again)}
                  onClick={() => call(TriadAction.Reset, {})}
                />
              )}
            </span>
          )}
        </Controls>
      )}
    </div>
  );
}
