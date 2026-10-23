import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Frame, Label, type Words, say } from "./draw";
import {
  Season,
  TransportAction,
  TransportMode,
  TransportPart,
  type TransportState,
  describeTransport,
} from "./transport";

const W = 320;
const H = 220;

const WORDS = {
  day: { en: "Day", hi: "दिन" },
  night: { en: "Night", hi: "रात" },
  summer: { en: "Summer", hi: "गर्मी" },
  spring: { en: "Spring", hi: "वसंत" },
  sun: { en: "Half an hour in the sun →", hi: "आधा घंटा धूप में →" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  xylem: { en: "xylem: water + minerals ↑", hi: "जाइलम: पानी + खनिज ↑" },
  phloem: { en: "phloem: food", hi: "फ्लोएम: भोजन" },
  vapour: { en: "transpiration", hi: "वाष्पोत्सर्जन" },
  pull: { en: "main force: transpiration pull", hi: "मुख्य बल: वाष्पोत्सर्जन खिंचाव" },
  pressure: { en: "main force: root pressure", hi: "मुख्य बल: मूल दाब" },
  roots: { en: "roots take in water", hi: "जड़ें पानी लेती हैं" },
  stomataShut: { en: "stomata closed", hi: "रंध्र बंद" },
  toStores: { en: "to fruits, seeds, roots", hi: "फलों, बीजों, जड़ों को" },
  fromLeaves: { en: "sugar from the leaves", hi: "पत्तियों से शर्करा" },
  toBuds: { en: "to the growing buds", hi: "बढ़ती कलियों को" },
  fromStore: { en: "from the root's store", hi: "जड़ के भंडार से" },
  atp: { en: "uses energy (ATP)", hi: "ऊर्जा (ATP) लगती है" },
  plant: { en: "plant", hi: "पौधा" },
  stick: { en: "stick", hi: "डंडी" },
  misty: { en: "water drops!", hi: "पानी की बूँदें!" },
  dry: { en: "dry", hi: "सूखा" },
} as const satisfies Record<string, Words>;

const LEAVES: readonly [number, number, number][] = [
  [120, 52, -20],
  [180, 52, 20],
  [104, 80, -30],
  [196, 80, 30],
  [150, 36, 0],
];

function Tree({ s, locale }: { s: TransportState; locale: string }) {
  const isWater = s.mode === TransportMode.Water;
  const isSummer = s.season === Season.Summer;
  return (
    <g>
      <rect class={isWater && !s.isDay ? "pt-night" : "pt-sky"} x={0} y={0} width={W} height={H} />
      <rect class="pt-soil" x={0} y={160} width={W} height={60} />
      {isWater &&
        (s.isDay ? (
          <circle class="pt-sun" cx={286} cy={30} r={14} />
        ) : (
          <path class="pt-moon" d="M290 18 a 13 13 0 1 0 8 22 a 10 10 0 1 1 -8 -22 z" />
        ))}
      {/* roots */}
      <path
        class="pt-root"
        d="M150 160 L150 196 M150 172 L118 196 M150 172 L182 198 M150 184 L130 210 M150 184 L172 212"
      />
      {!isWater && !isSummer && <ellipse class="pt-store" cx={150} cy={188} rx={14} ry={10} />}
      {/* stem and branches */}
      <path
        class="pt-stem"
        d="M150 160 L150 60 M150 96 L108 78 M150 96 L192 78 M150 74 L124 54 M150 74 L176 54"
      />
      {LEAVES.map(([x, y, a]) => (
        <ellipse
          key={`${x}-${y}`}
          class="pt-leaf"
          cx={x}
          cy={y}
          rx={16}
          ry={8}
          transform={`rotate(${a} ${x} ${y})`}
        />
      ))}
      {!isWater && isSummer && <circle class="pt-fruit" cx={196} cy={100} r={8} />}
      {!isWater && !isSummer && (
        <g>
          <circle class="pt-bud" cx={150} cy={58} r={4} />
          <circle class="pt-bud" cx={110} cy={76} r={4} />
          <circle class="pt-bud" cx={190} cy={76} r={4} />
        </g>
      )}
      {/* the pipes: xylem (water, up) and phloem (food) */}
      <path class="pt-xylem" d="M146 196 L146 64" />
      <path class="pt-phloem" d="M154 196 L154 64" />
      {isWater && <path class="lp-flow pt-flow-water" d="M146 196 L146 64" />}
      {!isWater && (
        <path class="lp-flow pt-flow-food" d={isSummer ? "M154 64 L154 196" : "M154 188 L154 64"} />
      )}
      {isWater && s.isDay && (
        <g class="lp-water">
          <Arrow x1={96} y1={46} x2={70} y2={30} />
          <Arrow x1={204} y1={46} x2={230} y2={30} />
          <Arrow x1={150} y1={24} x2={150} y2={6} />
        </g>
      )}
      {isWater && !s.isDay && (
        <g class="lp-water">
          <Arrow x1={100} y1={200} x2={124} y2={190} />
          <Arrow x1={200} y1={204} x2={176} y2={194} />
        </g>
      )}
      {isWater ? (
        <g>
          <Label x={160} y={140} text={say(locale, WORDS.xylem)} />
          {s.isDay ? (
            <Label x={20} y={24} text={say(locale, WORDS.vapour)} />
          ) : (
            <Label x={20} y={24} text={say(locale, WORDS.stomataShut)} cls="pt-on-dark" />
          )}
          <Label x={10} y={176} text={say(locale, WORDS.roots)} cls="pt-on-soil" />
          <Label
            x={310}
            y={124}
            text={say(locale, s.isDay ? WORDS.pull : WORDS.pressure)}
            anchor="end"
            cls={s.isDay ? "is-good" : "pt-on-dark"}
          />
        </g>
      ) : (
        <g>
          <Label x={162} y={140} text={say(locale, WORDS.phloem)} />
          <Label x={162} y={154} text={say(locale, WORDS.atp)} cls="is-dim" />
          {isSummer ? (
            <g>
              <Label x={10} y={24} text={say(locale, WORDS.fromLeaves)} />
              <Label x={310} y={110} text={say(locale, WORDS.toStores)} anchor="end" />
            </g>
          ) : (
            <g>
              <Label x={10} y={24} text={say(locale, WORDS.toBuds)} />
              <Label x={10} y={212} text={say(locale, WORDS.fromStore)} cls="pt-on-soil" />
            </g>
          )}
        </g>
      )}
    </g>
  );
}

function Bag({ s, locale }: { s: TransportState; locale: string }) {
  const done = s.step === 1;
  const pots = [
    { x: 92, isPlant: true },
    { x: 228, isPlant: false },
  ];
  return (
    <g>
      <rect class="pt-sky" x={0} y={0} width={W} height={H} />
      {done && <circle class="pt-sun" cx={160} cy={28} r={14} />}
      {pots.map((p) => (
        <g key={p.x}>
          <path
            class="pt-pot"
            d={`M${p.x - 30} 160 L${p.x + 30} 160 L${p.x + 22} 196 L${p.x - 22} 196 Z`}
          />
          <rect class="pt-sheet" x={p.x - 32} y={156} width={64} height={6} rx={2} />
          {p.isPlant ? (
            <g>
              <path class="pt-stem" d={`M${p.x} 156 L${p.x} 76`} />
              {[
                [p.x - 14, 100, -30],
                [p.x + 14, 90, 30],
                [p.x - 12, 120, -30],
                [p.x + 12, 112, 30],
                [p.x, 74, 0],
              ].map(([x, y, a]) => (
                <ellipse
                  key={`${x}-${y}`}
                  class="pt-leaf"
                  cx={x}
                  cy={y}
                  rx={13}
                  ry={6}
                  transform={`rotate(${a} ${x} ${y})`}
                />
              ))}
            </g>
          ) : (
            <path class="pt-stick" d={`M${p.x} 156 L${p.x} 74`} />
          )}
          <path
            class="pt-cover"
            d={`M${p.x - 36} 160 L${p.x - 36} 80 Q ${p.x} 46 ${p.x + 36} 80 L${p.x + 36} 160`}
          />
          {done &&
            p.isPlant &&
            (
              [
                [-26, 92],
                [-28, 120],
                [26, 96],
                [28, 128],
                [-14, 66],
                [14, 64],
                [-30, 146],
                [30, 148],
              ] as const
            ).map(([dx, y]) => (
              <circle key={`${dx}-${y}`} class="lp-water-dot" cx={p.x + dx} cy={y} r={2.4} />
            ))}
          <Label
            x={p.x}
            y={214}
            text={say(locale, p.isPlant ? WORDS.plant : WORDS.stick)}
            anchor="middle"
            cls="is-big"
          />
          {done && (
            <Label
              x={p.x}
              y={44}
              text={say(locale, p.isPlant ? WORDS.misty : WORDS.dry)}
              anchor="middle"
              cls={p.isPlant ? "is-good" : "is-dim"}
            />
          )}
        </g>
      ))}
    </g>
  );
}

export function PlantTransportView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TransportState;
  return (
    <div class="lp pt">
      <Frame w={W} h={H} width={width} label={describeTransport(s)} cls="pt-svg">
        <g data-part={TransportPart.Plant}>
          {s.mode === TransportMode.Bag ? (
            <Bag s={s} locale={locale} />
          ) : (
            <Tree s={s} locale={locale} />
          )}
        </g>
      </Frame>
      {s.canToggle && (
        <Controls>
          {s.mode === TransportMode.Water && (
            <>
              <Button
                part={TransportPart.Toggle}
                label={say(locale, WORDS.day)}
                isOn={s.isDay}
                onClick={() => call(TransportAction.SetDay, { day: true })}
              />
              <Button
                label={say(locale, WORDS.night)}
                isOn={!s.isDay}
                onClick={() => call(TransportAction.SetDay, { day: false })}
              />
            </>
          )}
          {s.mode === TransportMode.Food && (
            <>
              <Button
                part={TransportPart.Toggle}
                label={say(locale, WORDS.summer)}
                isOn={s.season === Season.Summer}
                onClick={() => call(TransportAction.SetSeason, { season: Season.Summer })}
              />
              <Button
                label={say(locale, WORDS.spring)}
                isOn={s.season === Season.Spring}
                onClick={() => call(TransportAction.SetSeason, { season: Season.Spring })}
              />
            </>
          )}
          {s.mode === TransportMode.Bag &&
            (s.step === 0 ? (
              <Button
                part={TransportPart.Next}
                label={say(locale, WORDS.sun)}
                onClick={() => call(TransportAction.Next, {})}
              />
            ) : (
              <Button
                label={say(locale, WORDS.again)}
                onClick={() => call(TransportAction.Reset, {})}
              />
            ))}
        </Controls>
      )}
    </div>
  );
}
