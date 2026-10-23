import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Frame, Label, Person, type Words, say } from "./draw";
import {
  MAGNIFY,
  MAG_CHAINS,
  MagAction,
  MagPart,
  MagSetting,
  type MagState,
  describeMagnification,
  doseAt,
} from "./magnification";

const W = 320;
const H = 200;

const WORDS: Readonly<Record<string, Words>> = {
  soilAndWater: { en: "soil & water", hi: "मिट्टी और पानी" },
  wheat: { en: "wheat", hi: "गेहूँ" },
  goat: { en: "goat", hi: "बकरी" },
  human: { en: "human", hi: "मनुष्य" },
  pondWater: { en: "pond water", hi: "तालाब का पानी" },
  waterPlants: { en: "water plants", hi: "जलीय पौधे" },
  fish: { en: "fish", hi: "मछली" },
  spray: { en: "Spray pesticide", hi: "कीटनाशक छिड़को" },
  stop: { en: "Stop spraying", hi: "छिड़कना बंद करो" },
  next: { en: "Up the chain ↑", hi: "शृंखला में ऊपर ↑" },
  again: { en: "Start again", hi: "फिर से" },
  field: { en: "Field", hi: "खेत" },
  pond: { en: "Pond", hi: "तालाब" },
  pesticide: { en: "● pesticide in each body", hi: "● हर शरीर में कीटनाशक" },
  most: { en: "most!", hi: "सबसे ज़्यादा!" },
};

const COL = 78;
const X0 = 10;

function Icon({ id, cx }: { id: string; cx: number }) {
  switch (id) {
    case "soilAndWater":
    case "pondWater":
      return (
        <g>
          <rect class="ev-mag-soil" x={cx - 28} y={82} width={56} height={14} rx={3} />
          <path
            class="ev-mag-water"
            d={`M${cx - 28} 78 q 7 -6 14 0 t 14 0 t 14 0 t 14 0 L${cx + 28} 84 L${cx - 28} 84 Z`}
          />
        </g>
      );
    case "wheat":
      return (
        <g class="ev-mag-wheat">
          {[-10, 0, 10].map((dx) => (
            <g key={dx}>
              <line x1={cx + dx} y1={96} x2={cx + dx} y2={58} />
              {[0, 1, 2, 3].map((k) => (
                <ellipse
                  key={k}
                  cx={cx + dx + (k % 2 === 0 ? -3 : 3)}
                  cy={62 + k * 6}
                  rx={3}
                  ry={1.6}
                />
              ))}
            </g>
          ))}
        </g>
      );
    case "waterPlants":
      return (
        <g class="ev-mag-wheat">
          {[-10, 0, 10].map((dx) => (
            <path key={dx} d={`M${cx + dx} 96 q -6 -12 0 -24 q 6 -12 0 -22`} fill="none" />
          ))}
        </g>
      );
    case "goat":
      return (
        <g class="ev-mag-goat">
          <ellipse cx={cx} cy={76} rx={18} ry={9} />
          <circle cx={cx + 20} cy={66} r={6} />
          <path d={`M${cx + 18} 61 l -4 -7 M${cx + 22} 61 l 2 -7`} />
          {[-12, -5, 6, 13].map((dx) => (
            <line key={dx} x1={cx + dx} y1={82} x2={cx + dx} y2={96} />
          ))}
        </g>
      );
    case "fish":
      return (
        <g class="ev-mag-fish" transform={`translate(${cx} 78)`}>
          <ellipse cx={0} cy={0} rx={18} ry={8} />
          <path d="M16 0 L28 -9 L28 9 Z" />
          <circle class="ev-eco-eye" cx={-10} cy={-2} r={1.6} />
        </g>
      );
    default:
      return <Person who="grandpa" x={cx} y={98} s={1.05} />;
  }
}

function Dots({ n, cx }: { n: number; cx: number }) {
  const per = 8;
  const size = 56 / per;
  return (
    <g class="ev-mag-dots">
      {Array.from({ length: n }, (_, i) => {
        const r = Math.floor(i / per);
        const c = i % per;
        return (
          <circle
            // biome-ignore lint/suspicious/noArrayIndexKey: a fixed grid
            key={i}
            cx={cx - 28 + size * (c + 0.5)}
            cy={168 - size * (r + 0.5)}
            r={size * 0.32}
          />
        );
      })}
    </g>
  );
}

export function BioMagnificationView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as MagState;
  const chain = MAG_CHAINS[s.setting];
  return (
    <div class="ev ev-mag">
      <Frame w={W} h={H} width={width} label={describeMagnification(s)} cls="ev-mag-svg">
        <rect class="ev-bg" x={0} y={0} width={W} height={H} />
        <g data-part={MagPart.Picture}>
          {s.isSprayed && (
            <g class="ev-mag-spray">
              <rect x={10} y={10} width={12} height={20} rx={3} />
              <rect x={13} y={6} width={6} height={5} rx={1} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle key={i} cx={28 + i * 5} cy={12 + (i % 3) * 4} r={1.6} />
              ))}
            </g>
          )}
          <Label
            x={312}
            y={22}
            text={say(locale, WORDS.pesticide as Words)}
            anchor="end"
            cls="is-dim"
          />
          {chain.map((id, i) => {
            const cx = X0 + COL * i + 35;
            const isShown = i <= s.step;
            const dose = doseAt(i, s.isSprayed);
            return (
              <g key={id} class={isShown ? "" : "ev-mag-hidden"}>
                {i > 0 && <Arrow x1={cx - COL + 30} y1={140} x2={cx - 32} y2={140} cls="ev-up" />}
                <Icon id={id} cx={cx} />
                <rect class="ev-mag-body" x={cx - 30} y={110} width={60} height={60} rx={6} />
                {isShown && <Dots n={dose} cx={cx} />}
                <Label x={cx} y={186} text={say(locale, WORDS[id] as Words)} anchor="middle" />
                {isShown && s.isSprayed && (s.showNumbers || i === 3) && (
                  <Label
                    x={cx}
                    y={105}
                    text={[
                      s.showNumbers ? `×${MAGNIFY ** i}` : "",
                      i === 3 ? say(locale, WORDS.most as Words) : "",
                    ]
                      .filter((t) => t !== "")
                      .join(" ")}
                    anchor="middle"
                    cls={i === 3 ? "is-bad" : "is-dim"}
                  />
                )}
              </g>
            );
          })}
        </g>
      </Frame>
      <Controls>
        {s.canSetSetting && (
          <span class="ev-row">
            {[MagSetting.Field, MagSetting.Pond].map((m) => (
              <Button
                key={m}
                label={say(locale, WORDS[m] as Words)}
                isOn={s.setting === m}
                onClick={() => call(MagAction.SetSetting, { setting: m })}
              />
            ))}
          </span>
        )}
        {s.canSpray && (
          <Button
            part={MagPart.Spray}
            label={say(locale, (s.isSprayed ? WORDS.stop : WORDS.spray) as Words)}
            isOn={s.isSprayed}
            onClick={() => call(MagAction.Spray, { on: !s.isSprayed })}
          />
        )}
        {s.canStep &&
          (s.step < 3 ? (
            <Button
              part={MagPart.Next}
              label={say(locale, WORDS.next as Words)}
              onClick={() => call(MagAction.Next, {})}
            />
          ) : (
            <Button
              label={say(locale, WORDS.again as Words)}
              onClick={() => call(MagAction.Reset, {})}
            />
          ))}
      </Controls>
    </div>
  );
}
