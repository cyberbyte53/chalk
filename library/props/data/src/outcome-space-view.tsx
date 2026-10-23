import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  Experiment,
  RANKS,
  SUITS,
  SUIT_SYMBOL,
  complementOf,
  isRedSuit,
  probabilityOf,
  totalOutcomes,
} from "./chance";
import { setupOf } from "./chance-run";
import { type Words, fracText, say } from "./numbers";
import { SpaceAction, SpacePart, type SpaceState, isMatched, litOf } from "./outcome-space";
import { Button } from "./ui";

const WORDS = {
  first: { en: "1st die", hi: "पहला पासा" },
  second: { en: "2nd die", hi: "दूसरा पासा" },
  favourable: { en: "favourable", hi: "अनुकूल" },
  of: { en: "of", hi: "में से" },
  not: { en: "not", hi: "नहीं" },
  clear: { en: "Clear", hi: "साफ़ करो" },
  show: { en: "Show the event", hi: "घटना दिखाओ" },
  hide: { en: "Hide the event", hi: "घटना छिपाओ" },
  comp: { en: "Show the complement", hi: "पूरक दिखाओ" },
  noComp: { en: "Hide the complement", hi: "पूरक छिपाओ" },
  tap: { en: "Tap every outcome where", hi: "हर उस परिणाम पर टैप करो जहाँ" },
  matched: { en: "That's the whole event.", hi: "यही पूरी घटना है।" },
} as const satisfies Record<string, Words>;

type Cell = { id: string; text: string; sub?: string; isRed?: boolean };

export function OutcomeSpaceView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SpaceState;
  const setup = setupOf(s);
  const lit = new Set(litOf(s));
  const comp = new Set(s.isComplementShown ? complementOf(setup, s.favourable) : []);
  const tappable = s.canPick && !s.isEventShown;
  const total = totalOutcomes(setup);
  const p = probabilityOf(setup, [...lit]);
  const pc = probabilityOf(setup, complementOf(setup, s.favourable));

  const tile = (c: Cell) => {
    const isLit = lit.has(c.id);
    const isComp = comp.has(c.id);
    const cls = `dt-tile${isLit ? " is-lit" : ""}${isComp ? " is-comp" : ""}${c.isRed ? " is-red" : ""}`;
    const body = (
      <>
        <span>{c.text}</span>
        {c.sub !== undefined && <span class="dt-tile-sub">{c.sub}</span>}
      </>
    );
    return tappable ? (
      <button
        key={c.id}
        type="button"
        class={`${cls} is-tappable`}
        aria-pressed={isLit}
        aria-label={`${c.text}${c.sub ?? ""}`}
        onClick={() => call(SpaceAction.Toggle, { id: c.id })}
      >
        {body}
      </button>
    ) : (
      <span key={c.id} class={cls}>
        {body}
      </span>
    );
  };

  let grid: JSX.Element;
  if (s.kind === Experiment.TwoDice) {
    grid = (
      <div class="dt-space is-dice" style={{ gridTemplateColumns: "auto repeat(6, 1fr)" }}>
        <span class="dt-head is-corner">
          {say(locale, WORDS.first)} ↓ {say(locale, WORDS.second)} →
        </span>
        {s.faces.map((b, j) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: faces are positional
          <span key={`h${j}`} class="dt-head">
            {b}
          </span>
        ))}
        {s.faces.map((a, i) => [
          // biome-ignore lint/suspicious/noArrayIndexKey: faces are positional
          <span key={`r${i}`} class="dt-head">
            {a}
          </span>,
          ...s.faces.map((b, j) =>
            tile({ id: `${i + 1}-${j + 1}`, text: width < 340 ? `${a},${b}` : `(${a}, ${b})` }),
          ),
        ])}
      </div>
    );
  } else if (s.kind === Experiment.Cards) {
    grid = (
      <div class="dt-space is-cards" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
        {SUITS.flatMap((suit) =>
          RANKS.map((rank) =>
            tile({
              id: `${rank}${suit}`,
              text: rank,
              sub: SUIT_SYMBOL[suit],
              isRed: isRedSuit(suit),
            }),
          ),
        )}
      </div>
    );
  } else {
    const cells: Cell[] =
      s.kind === Experiment.Coin
        ? [
            { id: "H", text: "H" },
            { id: "T", text: "T" },
          ]
        : s.kind === Experiment.TwoCoins
          ? ["HH", "HT", "TH", "TT"].map((id) => ({ id, text: id }))
          : s.faces.map((v, i) => ({ id: String(i + 1), text: String(v) }));
    grid = (
      <div class="dt-space is-row" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
        {cells.map(tile)}
      </div>
    );
  }

  return (
    <div class="dt-outcomes">
      {tappable && (
        <p class={`dt-note${isMatched(s) ? " is-right" : ""}`}>
          {isMatched(s)
            ? say(locale, WORDS.matched)
            : `${say(locale, WORDS.tap)} ${say(locale, s.eventLabel)}`}
        </p>
      )}
      <div data-part={SpacePart.Grid}>{grid}</div>
      {s.showCount && (
        <p class="dt-given" data-part={SpacePart.Count}>
          {`P(${say(locale, s.eventLabel)}) = ${lit.size === 0 && !tappable ? "–" : `${lit.size}/${total} = ${fracText(p)}`}`}
        </p>
      )}
      {s.isComplementShown && (
        <p class="dt-given is-comp" data-part={SpacePart.Complement}>
          {`P(${say(locale, WORDS.not)}: ${say(locale, s.eventLabel)}) = 1 − ${fracText(
            probabilityOf(setup, s.favourable),
          )} = ${fracText(pc)}`}
        </p>
      )}
      <div class="dt-controls" data-part={SpacePart.Show}>
        {tappable && s.picked.length > 0 && (
          <Button
            isWide
            label={say(locale, WORDS.clear)}
            part={SpacePart.Clear}
            onPress={() => call(SpaceAction.Clear, {})}
          >
            {say(locale, WORDS.clear)}
          </Button>
        )}
        {s.canPick && (
          <Button
            isWide
            label={say(locale, s.isEventShown ? WORDS.hide : WORDS.show)}
            onPress={() => call(SpaceAction.ShowEvent, { isShown: !s.isEventShown })}
          >
            {say(locale, s.isEventShown ? WORDS.hide : WORDS.show)}
          </Button>
        )}
        <Button
          isWide
          isOn={s.isComplementShown}
          label={say(locale, s.isComplementShown ? WORDS.noComp : WORDS.comp)}
          onPress={() => call(SpaceAction.ShowComplement, { isShown: !s.isComplementShown })}
        >
          {say(locale, s.isComplementShown ? WORDS.noComp : WORDS.comp)}
        </Button>
      </div>
    </div>
  );
}
