import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Button, Controls, Frame, Label, type Words, say } from "./draw";
import {
  CHAINS,
  ChainAction,
  ChainMode,
  ChainPart,
  type ChainState,
  Effect,
  type Habitat,
  LEVEL_KINDS,
  type LevelKind,
  PLANT_SHARE,
  SUNLIGHT_KJ,
  WEB_EATEN_BY,
  WEB_NODES,
  chainOf,
  describeChain,
  eatenBy,
  eats,
  effectsOf,
  energyAt,
} from "./food-chain";

const W = 320;
const H = 200;

export const ORGANISM_WORDS: Readonly<Record<string, Words>> = {
  plants: { en: "plants", hi: "पौधे" },
  deer: { en: "deer", hi: "हिरण" },
  lion: { en: "lion", hi: "शेर" },
  grass: { en: "grass", hi: "घास" },
  grasshopper: { en: "grasshopper", hi: "टिड्डा" },
  frog: { en: "frog", hi: "मेंढक" },
  snake: { en: "snake", hi: "साँप" },
  phytoplankton: { en: "phytoplankton", hi: "पादप प्लवक" },
  zooplankton: { en: "zooplankton", hi: "जंतु प्लवक" },
  smallFish: { en: "small fish", hi: "छोटी मछली" },
  bigFish: { en: "big fish", hi: "बड़ी मछली" },
  rabbit: { en: "rabbit", hi: "खरगोश" },
  mouse: { en: "mouse", hi: "चूहा" },
  lizard: { en: "lizard", hi: "छिपकली" },
  hawk: { en: "hawk", hi: "बाज़" },
};

const KIND_WORDS: Readonly<Record<LevelKind, Words>> = {
  producer: { en: "1 · producers", hi: "1 · उत्पादक" },
  herbivore: { en: "2 · herbivores", hi: "2 · शाकाहारी" },
  smallCarnivore: { en: "3 · secondary consumers", hi: "3 · द्वितीयक उपभोक्ता" },
  largeCarnivore: { en: "4 · tertiary consumers", hi: "4 · तृतीयक उपभोक्ता" },
};

const EFFECT_WORDS: Readonly<Record<Effect, Words>> = {
  gone: { en: "wiped out", hi: "खत्म" },
  starves: { en: "starves", hi: "भूखा मरता" },
  declines: { en: "declines", hi: "घटता" },
  grows: { en: "grows unchecked", hi: "बेरोक बढ़ता" },
  unchanged: { en: "", hi: "" },
};

const HABITAT_WORDS: Readonly<Record<Habitat, Words>> = {
  forest: { en: "Forest", hi: "वन" },
  grassland: { en: "Grassland", hi: "घास का मैदान" },
  pond: { en: "Pond", hi: "तालाब" },
};

const WORDS = {
  next: { en: "Next level ↑", hi: "अगला स्तर ↑" },
  remove: { en: "Wipe out level", hi: "स्तर खत्म करो" },
  back: { en: "Bring back", hi: "वापस लाओ" },
  sun: { en: "sunlight", hi: "सूर्य का प्रकाश" },
  captured: { en: "plants keep 1%", hi: "पौधे 1% रखते हैं" },
  heat: { en: "lost as heat", hi: "ऊष्मा बनकर खोई" },
  eats: { en: "eats", hi: "खाता है" },
  eatenBy: { en: "eaten by", hi: "इसे खाते हैं" },
  nothing: { en: "nothing here", hi: "यहाँ कोई नहीं" },
  tap: { en: "Tap an animal or plant", hi: "किसी जीव पर टैप करो" },
  kj: { en: "kJ", hi: "kJ" },
} as const satisfies Record<string, Words>;

const fmt = (n: number) => n.toLocaleString("en-IN");

/** Chain mode: one box per level, producers at the bottom, arrows up from eaten to eater. */
function ChainPicture({ s, locale }: { s: ChainState; locale: string }) {
  const chain = chainOf(s);
  const effects = effectsOf(chain.length, s.removed);
  const rowH = 44;
  const yOf = (i: number) => H - 30 - i * rowH;
  return (
    <g>
      {chain.slice(0, s.shown).map((o, i) => {
        const y = yOf(i);
        const effect = effects[i] as Effect;
        const isGone = effect === Effect.Gone;
        return (
          <g key={o}>
            {i > 0 && <Arrow x1={200} y1={y + rowH - 12} x2={200} y2={y + 14} cls="ev-up" />}
            <rect
              class={`ev-fc-box is-l${i + 1}${isGone ? " is-gone" : ""}`}
              x={146}
              y={y - 12}
              width={108}
              height={26}
              rx={8}
            />
            <Label
              x={200}
              y={y + 5}
              text={say(locale, ORGANISM_WORDS[o] ?? { en: o, hi: o })}
              anchor="middle"
              cls="is-big"
            />
            {isGone && <line class="ev-fc-cross" x1={150} y1={y + 10} x2={250} y2={y - 8} />}
            {s.showLevelNames && (
              <Label
                x={140}
                y={y + 5}
                text={say(locale, KIND_WORDS[LEVEL_KINDS[i] as LevelKind])}
                anchor="end"
                cls="is-dim"
              />
            )}
            {effect !== Effect.Unchanged && !isGone && (
              <Label
                x={260}
                y={y + 5}
                text={say(locale, EFFECT_WORDS[effect])}
                cls={effect === Effect.Grows ? "is-bad" : "is-bad"}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Pyramid mode: bars for the food energy at each level, heat lost at every step. */
function PyramidPicture({ s, locale }: { s: ChainState; locale: string }) {
  const chain = chainOf(s);
  const rowH = 34;
  const baseY = H - 26;
  return (
    <g>
      {s.showEnergy && (
        <g>
          <circle class="ev-fc-sun" cx={30} cy={H - 92} r={12} />
          <Label x={6} y={H - 68} text={`${fmt(SUNLIGHT_KJ)} kJ`} cls="is-dim" />
          <Label x={6} y={H - 57} text={say(locale, WORDS.sun)} cls="is-dim" />
          <Arrow x1={30} y1={H - 50} x2={30} y2={H - 34} cls="ev-sunlight" />
          <Label x={6} y={H - 20} text={say(locale, WORDS.captured)} cls="is-dim" />
        </g>
      )}
      {chain.slice(0, s.shown).map((o, i) => {
        const w = 190 * 0.62 ** i;
        const x = 200 - w / 2;
        const y = baseY - (i + 1) * rowH;
        return (
          <g key={o}>
            <rect class={`ev-fc-box is-l${i + 1}`} x={x} y={y} width={w} height={rowH - 4} rx={4} />
            <Label
              x={200}
              y={y + 13}
              text={say(locale, ORGANISM_WORDS[o] ?? { en: o, hi: o })}
              anchor="middle"
            />
            {s.showEnergy && (
              <Label
                x={200}
                y={y + 25}
                text={`${fmt(energyAt(i + 1))} kJ`}
                anchor="middle"
                cls="is-dim"
              />
            )}
            {s.showEnergy && (
              <g class="ev-heat">
                <Arrow x1={x + w + 2} y1={y + 15} x2={x + w + 22} y2={y + 6} />
              </g>
            )}
          </g>
        );
      })}
      {s.showEnergy && (
        <Label x={312} y={16} text={`↗ ${say(locale, WORDS.heat)}`} anchor="end" cls="is-bad" />
      )}
    </g>
  );
}

/** The lowest trophic level each web organism feeds at, for its colour. */
const WEB_LEVEL: Readonly<Record<string, number>> = {
  grass: 1,
  grasshopper: 2,
  rabbit: 2,
  mouse: 2,
  frog: 3,
  lizard: 3,
  snake: 3,
  hawk: 4,
};

const WEB_AT: Readonly<Record<string, [number, number]>> = {
  grass: [150, 172],
  grasshopper: [70, 136],
  rabbit: [160, 136],
  mouse: [250, 136],
  frog: [40, 88],
  lizard: [120, 88],
  snake: [220, 70],
  hawk: [150, 22],
};

/** Web mode: the grassland web; the tapped organism's links light up. */
function WebPicture({
  s,
  locale,
  onTap,
}: {
  s: ChainState;
  locale: string;
  onTap: (node: string) => void;
}) {
  const sel = s.selected;
  const linked = sel === null ? [] : [...eats(sel), ...eatenBy(sel)];
  return (
    <g>
      {WEB_NODES.flatMap((from) =>
        (WEB_EATEN_BY[from] ?? []).map((to) => {
          const [x1, y1] = WEB_AT[from] as [number, number];
          const [x2, y2] = WEB_AT[to] as [number, number];
          const d = Math.hypot(x2 - x1, y2 - y1);
          const k = 15 / d;
          const isOn = sel !== null && (from === sel || to === sel);
          return (
            <Arrow
              key={`${from}-${to}`}
              x1={x1 + (x2 - x1) * k}
              y1={y1 + (y2 - y1) * k}
              x2={x2 - (x2 - x1) * k}
              y2={y2 - (y2 - y1) * k}
              cls={
                isOn ? "ev-web-link is-on" : sel === null ? "ev-web-link" : "ev-web-link is-faded"
              }
            />
          );
        }),
      )}
      {WEB_NODES.map((n) => {
        const [x, y] = WEB_AT[n] as [number, number];
        const cls =
          n === sel ? "is-sel" : linked.includes(n) ? "is-linked" : sel === null ? "" : "is-faded";
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: the buttons under the picture do the same
          <g key={n} class={`ev-web-node ${cls}`} onClick={() => onTap(n)}>
            <circle class={`ev-fc-box is-l${WEB_LEVEL[n] ?? 1}`} cx={x} cy={y} r={13} />
            <Label
              x={x}
              y={y + 24}
              text={say(locale, ORGANISM_WORDS[n] ?? { en: n, hi: n })}
              anchor="middle"
            />
          </g>
        );
      })}
      <g>
        {sel === null ? (
          <Label x={312} y={192} text={say(locale, WORDS.tap)} anchor="end" cls="is-dim" />
        ) : (
          <g>
            <Label
              x={312}
              y={176}
              text={`${say(locale, WORDS.eats)}: ${
                eats(sel)
                  .map((n) => say(locale, ORGANISM_WORDS[n] as Words))
                  .join(", ") || say(locale, WORDS.nothing)
              }`}
              anchor="end"
            />
            <Label
              x={312}
              y={192}
              text={`${say(locale, WORDS.eatenBy)}: ${
                eatenBy(sel)
                  .map((n) => say(locale, ORGANISM_WORDS[n] as Words))
                  .join(", ") || say(locale, WORDS.nothing)
              }`}
              anchor="end"
            />
          </g>
        )}
      </g>
    </g>
  );
}

export function FoodChainView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ChainState;
  const chain = chainOf(s);
  const isWeb = s.mode === ChainMode.Web;
  return (
    <div class="ev ev-fc">
      <Frame w={W} h={H} width={width} label={describeChain(s)} cls="ev-fc-svg">
        <rect class="ev-bg" x={0} y={0} width={W} height={H} />
        <g data-part={ChainPart.Picture}>
          {s.mode === ChainMode.Chain && <ChainPicture s={s} locale={locale} />}
          {s.mode === ChainMode.Pyramid && <PyramidPicture s={s} locale={locale} />}
          {isWeb && (
            <WebPicture
              s={s}
              locale={locale}
              onTap={(node) => s.canTap && call(ChainAction.Tap, { node })}
            />
          )}
        </g>
      </Frame>
      <Controls>
        {!isWeb && s.canReveal && s.shown < chain.length && (
          <Button
            part={ChainPart.Next}
            label={say(locale, WORDS.next)}
            onClick={() => call(ChainAction.Reveal, {})}
          />
        )}
        {!isWeb && s.canSetHabitat && (
          <span class="ev-row" data-part={ChainPart.Habitats}>
            {(Object.keys(CHAINS) as Habitat[]).map((h) => (
              <Button
                key={h}
                label={say(locale, HABITAT_WORDS[h])}
                isOn={s.habitat === h}
                onClick={() => call(ChainAction.SetHabitat, { habitat: h })}
              />
            ))}
          </span>
        )}
        {!isWeb && s.canRemove && s.shown === chain.length && (
          <span class="ev-row" data-part={ChainPart.Remove}>
            <span class="ev-stepper-label">{say(locale, WORDS.remove)}</span>
            {chain.map((_, i) => (
              <Button
                // biome-ignore lint/suspicious/noArrayIndexKey: levels are positions
                key={i}
                label={String(i + 1)}
                isOn={s.removed === i + 1}
                onClick={() => call(ChainAction.Remove, { level: i + 1 })}
              />
            ))}
            {s.removed !== null && (
              <Button
                label={say(locale, WORDS.back)}
                onClick={() => call(ChainAction.Remove, { level: null })}
              />
            )}
          </span>
        )}
        {isWeb && s.canTap && (
          <span class="ev-row">
            {WEB_NODES.map((n) => (
              <Button
                key={n}
                label={say(locale, ORGANISM_WORDS[n] as Words)}
                isOn={s.selected === n}
                onClick={() => call(ChainAction.Tap, { node: n })}
              />
            ))}
          </span>
        )}
      </Controls>
    </div>
  );
}

/** For the plants-keep-1% caption elsewhere. */
export const PLANT_PERCENT = PLANT_SHARE * 100;
