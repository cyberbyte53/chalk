import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  BurialAction,
  BurialPart,
  type BurialState,
  CHECK_EVERY,
  MAX_DAYS,
  describeBurial,
} from "./burial";
import { Button, Controls, Frame, Label, type Words, say } from "./draw";
import { WASTE_WORDS, isBiodegradable, leftAfter } from "./waste";
import { WasteIcon } from "./waste-icons";

const W = 320;
const H = 200;

const WORDS = {
  day: { en: "Day", hi: "दिन" },
  soil: { en: "15 cm of moist soil", hi: "15 सेमी नम मिट्टी" },
  wait: { en: "Wait 15 days, dig up", hi: "15 दिन रुको, खोदो" },
  again: { en: "Bury again", hi: "फिर से गाड़ो" },
  gone: { en: "gone", hi: "गायब" },
  bio: { en: "biodegradable", hi: "जैव निम्नीकरणीय" },
  nonBio: { en: "non-biodegradable", hi: "अजैव निम्नीकरणीय" },
} as const satisfies Record<string, Words>;

export function WasteBurialView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as BurialState;
  const perRow = 4;
  const rows = Math.ceil(s.items.length / perRow);
  const slot = W / perRow;
  return (
    <div class="ev ev-bur">
      <Frame w={W} h={H} width={width} label={describeBurial(s)} cls="ev-bur-svg">
        <rect class="ev-bur-sky" x={0} y={0} width={W} height={40} />
        <rect class="ev-bur-soil" x={0} y={40} width={W} height={H - 40} />
        <path
          class="ev-bur-grass"
          d="M0 40 q 10 -6 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 L320 44 L0 44 Z"
        />
        <g>
          <rect class="ev-bur-badge" x={8} y={8} width={64} height={24} rx={12} />
          <Label
            x={40}
            y={24}
            text={`${say(locale, WORDS.day)} ${s.days}`}
            anchor="middle"
            cls="is-big"
          />
          <Label x={312} y={26} text={say(locale, WORDS.soil)} anchor="end" cls="is-dim" />
        </g>
        <g data-part={BurialPart.Pit}>
          {s.items.map((item, i) => {
            const row = Math.floor(i / perRow);
            const col = i % perRow;
            const cx = slot * (col + 0.5);
            const cy = rows === 1 ? 110 : 82 + row * 70;
            const left = leftAfter(item, s.days);
            const isGone = left === 0;
            const isBio = isBiodegradable(item);
            return (
              <g key={item}>
                <rect class="ev-bur-hole" x={cx - 30} y={cy - 22} width={60} height={42} rx={8} />
                {isGone ? (
                  <g>
                    <rect
                      class="ev-bur-ghost"
                      x={cx - 18}
                      y={cy - 13}
                      width={36}
                      height={26}
                      rx={6}
                    />
                    <Label
                      x={cx}
                      y={cy + 4}
                      text={say(locale, WORDS.gone)}
                      anchor="middle"
                      cls="is-good"
                    />
                  </g>
                ) : (
                  <g
                    transform={`translate(${cx} ${cy - 2}) scale(${0.55 + 0.45 * left})`}
                    opacity={0.35 + 0.65 * left}
                  >
                    <WasteIcon item={item} />
                  </g>
                )}
                {!isGone && left < 1 && (
                  <g class="ev-bur-microbes">
                    {[-14, -4, 8, 16].map((dx, k) => (
                      <circle key={dx} cx={cx + dx} cy={cy + 10 - (k % 2) * 16} r={1.4} />
                    ))}
                  </g>
                )}
                <Label x={cx} y={cy + 32} text={say(locale, WASTE_WORDS[item])} anchor="middle" />
                {s.showKinds && (
                  <Label
                    x={cx}
                    y={cy + 42}
                    text={say(locale, isBio ? WORDS.bio : WORDS.nonBio)}
                    anchor="middle"
                    cls={isBio ? "is-small is-good" : "is-small is-bad"}
                  />
                )}
              </g>
            );
          })}
        </g>
      </Frame>
      {s.canWait && (
        <Controls>
          {s.days < MAX_DAYS ? (
            <Button
              part={BurialPart.Wait}
              label={say(locale, WORDS.wait)}
              onClick={() => call(BurialAction.Wait, {})}
            />
          ) : (
            <Button label={say(locale, WORDS.again)} onClick={() => call(BurialAction.Reset, {})} />
          )}
        </Controls>
      )}
    </div>
  );
}
