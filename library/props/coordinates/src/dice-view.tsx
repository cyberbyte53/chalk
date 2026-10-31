import type { Locale } from "@chalk/content";
import { SymbolButton } from "@chalk/draw";
import type { PropView } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import { dice } from "./dice";
import { drawing } from "./layer-view";
import { Counter } from "./pictures";
import { unitOf } from "./plane-view";
import { WORDS, pair, word } from "./words";

type DiceView = PropView<typeof dice>;
const actions = dice.actions;
/** Never shown: every counter has its player's name (the dice's invariant). */
const NO_NAME = { en: "", hi: "" };

/** Both players' counters on the board, side by side when they share a point. */
function CountersDraw({ s, px, locale }: { s: DiceView; px: FramePixels; locale: Locale }) {
  const size = Math.max(14, Math.min(24, unitOf(px) * 0.6));
  return (
    <g class="cp-counters">
      {s.counters.map((c, i) => {
        const [x, y] = px.toPx(c.x, c.y);
        const other = s.counters[1 - i];
        const isShared = other !== undefined && other.x === c.x && other.y === c.y;
        const dx = isShared ? (i === 0 ? -size * 0.35 : size * 0.35) : 0;
        const name = s.playerNames[i] === undefined ? `${i + 1}` : word(s.playerNames[i], locale);
        return (
          <g
            key={i}
            transform={`translate(${x + dx}, ${y})`}
            {...shows(`counter${i + 1}`, c, `${name} ${pair(c)}`)}
          >
            <Counter size={size} initial={name.slice(0, 1)} tone={i === 0 ? "a" : "b"} />
          </g>
        );
      })}
    </g>
  );
}

/** The dice game's drawing: the counters, the throw and whose turn, Throw and New game. */
export const diceDrawing = drawing(dice, {
  front: ({ s, px, locale }) => <CountersDraw s={s} px={px} locale={locale} />,
  below: ({ s, locale }) => (
    <p
      class="cp-line cp-dice"
      {...shows(
        "throw",
        s.lastThrow,
        s.lastThrow === null ? undefined : `${s.lastThrow.red}, ${s.lastThrow.green}`,
      )}
    >
      <span class="cp-die is-red">{s.lastThrow?.red ?? "–"}</span>
      <span class="cp-die is-green">{s.lastThrow?.green ?? "–"}</span>
      <span class="cp-turn">
        {s.winner !== null
          ? `${word(s.playerNames[s.winner] ?? NO_NAME, locale)} 🏁`
          : locale === "hi"
            ? `${word(s.playerNames[s.turn] ?? NO_NAME, locale)} की बारी`
            : `${word(s.playerNames[s.turn] ?? NO_NAME, locale)}'s turn`}
      </span>
    </p>
  ),
  controls: ({ s, locale }) => (
    <>
      <SymbolButton
        symbol={word(WORDS.throw, locale)}
        label={word(WORDS.throw, locale)}
        isWide
        isEnabled={s.winner === null}
        {...does(actions.throwDice)}
      />
      <SymbolButton
        symbol={word(WORDS.newGame, locale)}
        label={word(WORDS.newGame, locale)}
        isWide
        {...does(actions.startAgain)}
      />
    </>
  ),
});
