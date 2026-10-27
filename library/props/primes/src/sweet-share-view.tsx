import { NumberField, Stepper, SymbolButton } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import { does, says, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { count } from "./seen";
import { MAX_FRIENDS, MAX_SWEETS, sweetShare } from "./sweet-share";

/** One wrapped sweet: a round middle with a twist of wrapper either side. */
function Sweet({ isBig = false }: { isBig?: boolean }): JSX.Element {
  return (
    <svg class={isBig ? "pr-sweet is-big" : "pr-sweet"} viewBox="0 0 24 12" aria-hidden="true">
      <path class="pr-sweet-wrap" d="M0 1 L7 6 L0 11 Z M24 1 L17 6 L24 11 Z" />
      <circle class="pr-sweet-body" cx="12" cy="6" r="5.5" />
    </svg>
  );
}

/** Sweets drawn: identical items that never reorder. */
function Sweets({ n, isBig = false }: { n: number; isBig?: boolean }): JSX.Element {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: identical items that never reorder
        <Sweet key={i} isBig={isBig} />
      ))}
    </>
  );
}

/** Most rows the log shows: round 0, a gap, and the latest rounds. */
const LOG_ROWS = 7;

/** The rounds the log shows, from 0; null is the gap where earlier rounds are folded away. */
function logRows(rounds: number): (number | null)[] {
  const all = Array.from({ length: rounds + 1 }, (_, k) => k);
  if (all.length <= LOG_ROWS) return all;
  return [0, null, ...all.slice(-(LOG_ROWS - 2))];
}

/** A friend: a smiling face. */
function Face(): JSX.Element {
  return (
    <svg class="pr-face" viewBox="0 0 32 32" aria-hidden="true">
      <circle class="pr-face-head" cx="16" cy="16" r="14" />
      <circle class="pr-face-eye" cx="11" cy="13" r="2" />
      <circle class="pr-face-eye" cx="21" cy="13" r="2" />
      <path class="pr-face-smile" d="M10 19 Q16 25 22 19" />
    </svg>
  );
}

/**
 * The sharing game: b friends round the table, each with a plate holding the sweets given so far
 * (one per round), and the box with what's left. +1 gives a round and greys out when the box holds
 * fewer sweets than friends; ↺ puts them all back. a = b × q + r underneath when the page wants it.
 */
export function SweetShareView({
  view,
  call,
  locale,
}: PropViewProps<typeof sweetShare>): JSX.Element {
  const s = view;
  const friends = Array.from({ length: s.friends }, (_, i) => i);
  return (
    <div class="pr-share">
      {s.isEditable && (
        <div class="pr-steppers">
          <NumberField
            name="a"
            value={s.sweets}
            min={0}
            max={MAX_SWEETS}
            {...says(sweetShare.actions.setSweets)}
            onChange={(value) => call(sweetShare.actions.setSweets, { value })}
          />
          <Stepper
            name="b"
            value={s.friends}
            min={1}
            max={MAX_FRIENDS}
            {...says(sweetShare.actions.setFriends)}
            onChange={(value) => call(sweetShare.actions.setFriends, { value })}
          />
        </div>
      )}
      <div class="pr-box-row">
        <div
          class={s.isOver ? "pr-box is-over" : "pr-box"}
          {...shows("box", s.box, count(s.box, "sweet"))}
          role="img"
          aria-label={`${s.box} sweets in the box`}
        >
          <Sweets n={s.box} isBig />
        </div>
        <span class="pr-box-count">{s.box}</span>
      </div>
      <div
        class="pr-friends"
        style={{ "--friends": String(s.friends) }}
        {...shows(
          "plates",
          { friends: s.friends, each: s.rounds },
          `${count(s.friends, "friend")}, ${count(s.rounds, "sweet")} each`,
        )}
        role="img"
        aria-label={`${s.friends} friends, ${s.rounds} sweets each`}
      >
        {friends.map((f) => (
          <div class="pr-friend" key={f}>
            <Face />
            <div class="pr-plate">
              <Sweets n={s.rounds} />
            </div>
            <span class="pr-plate-count">{s.rounds}</span>
          </div>
        ))}
      </div>
      <div class="pr-controls">
        <SymbolButton
          symbol={s.shareLabel[locale] ?? s.shareLabel.en ?? "Give everyone one"}
          label={s.shareLabel[locale] ?? s.shareLabel.en ?? "Give everyone one"}
          isWide
          isEnabled={s.canGiveRound}
          {...does(sweetShare.actions.giveRound)}
        />
        <SymbolButton
          symbol="↺"
          label="Put every sweet back in the box"
          isEnabled={s.rounds > 0}
          {...does(sweetShare.actions.startAgain)}
        />
      </div>
      {s.showLog && (
        <table
          class="pr-log"
          {...shows(
            "log",
            Array.from({ length: s.rounds + 1 }, (_, k) => ({
              rounds: k,
              box: s.sweets - s.friends * k,
            })),
          )}
        >
          <thead>
            <tr>
              <th>{s.roundsLabel[locale] ?? s.roundsLabel.en}</th>
              <th>{s.boxLabel[locale] ?? s.boxLabel.en}</th>
            </tr>
          </thead>
          <tbody>
            {logRows(s.rounds).map((k) =>
              k === null ? (
                <tr key="gap" class="is-gap">
                  <td>⋮</td>
                  <td>⋮</td>
                </tr>
              ) : (
                <tr key={k} class={k === s.rounds ? "is-latest" : undefined}>
                  <td>{k}</td>
                  <td>{s.sweets - s.friends * k}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
      {s.showSum && (
        <p
          class={s.isOver ? "pr-equation is-done" : "pr-equation"}
          {...shows(
            "sum",
            { a: s.sweets, b: s.friends, q: s.rounds, r: s.box },
            `${s.sweets} = ${s.friends} × ${s.rounds} + ${s.box}`,
          )}
        >
          <span class="pr-a">{s.sweets}</span> = <span class="pr-b">{s.friends}</span> ×{" "}
          <span class="pr-q">{s.rounds}</span> + <span class="pr-r">{s.box}</span>
          {s.isOver && (
            <span class="pr-check">
              {s.box} &lt; {s.friends}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
