import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type CoinState, Face } from "./coin";

const FACE_TEXT: Record<Face, Record<string, string>> = {
  [Face.Heads]: { en: "H", hi: "चित" },
  [Face.Tails]: { en: "T", hi: "पट" },
};

/** The coin, showing the face it last landed on. Tapping it tosses it. */
export function CoinView({ view, locale, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as CoinState & { count: number };
  return (
    <button
      type="button"
      // Re-mounting on every toss restarts the flip animation.
      key={s.heads + s.tails}
      class={s.last === null ? "coin is-new" : `coin is-${s.last}`}
      aria-label={s.last === null ? "Coin" : `Coin: ${s.last}`}
      onClick={() => call("toss")}
    >
      {s.last === null ? "?" : FACE_TEXT[s.last][locale]}
    </button>
  );
}
