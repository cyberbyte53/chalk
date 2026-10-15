import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  type Card,
  type Family,
  FamilySymbol,
  NumberSorterAction,
  NumberSorterPart,
  type NumberSorterState,
  OUTSIDE,
  type Place,
  placeFor,
} from "./model";

/** Which family a family's ring sits directly inside, in the full picture. */
const PARENT: Readonly<Record<Family, Family | null>> = {
  natural: "whole",
  whole: "integer",
  integer: "rational",
  rational: "real",
  irrational: "real",
  real: null,
};

const ALL: readonly Family[] = ["real", "rational", "irrational", "integer", "whole", "natural"];

/** The nearest shown family a ring sits in (skipping rings not drawn), or null at the top. */
function shownParent(family: Family, shown: readonly Family[]): Family | null {
  let p = PARENT[family];
  while (p !== null && !shown.includes(p)) p = PARENT[p];
  return p;
}

/**
 * The families of real numbers as rings inside rings, and the cards to sort into them. Tap a card to
 * pick it up, then tap the ring it belongs in (or the space outside every ring). It owns no state.
 */
export function NumberSorterView({ view, locale, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as NumberSorterState;
  const shown = ALL.filter((f) => s.families.includes(f));
  const childrenOf = (parent: Family | null) =>
    shown.filter((f) => shownParent(f, shown) === parent);
  const isPicking = s.selected !== null;

  const chip = (card: Card): JSX.Element => {
    const classes = ["ns-card"];
    if (s.selected === card.id) classes.push("is-picked");
    if (s.isMarked && card.placedIn !== null) {
      classes.push(card.placedIn === placeFor(card.family, s.families) ? "is-right" : "is-wrong");
    }
    return (
      <button
        type="button"
        key={card.id}
        class={classes.join(" ")}
        aria-pressed={s.selected === card.id}
        data-part={`${NumberSorterPart.CardPrefix}${card.id}`}
        onClick={(event) => {
          event.stopPropagation();
          call(NumberSorterAction.Pick, { card: card.id });
        }}
      >
        {card.label}
      </button>
    );
  };
  const cardsIn = (place: Place | null) => s.cards.filter((c) => c.placedIn === place);
  const drop = (place: Place) => (event: JSX.TargetedMouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isPicking) call(NumberSorterAction.Drop, { place });
  };

  const region = (family: Family): JSX.Element => {
    const kids = childrenOf(family);
    const name = s.names[family]?.[locale];
    return (
      <div
        key={family}
        class={`ns-region ns-${family}${isPicking ? " is-target" : ""}`}
        data-part={`${NumberSorterPart.RegionPrefix}${family}`}
        onClick={drop(family)}
        onKeyDown={(event) => {
          if (isPicking && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            event.stopPropagation();
            call(NumberSorterAction.Drop, { place: family });
          }
        }}
        // biome-ignore lint/a11y/useSemanticElements: a ring holds card buttons, so it can't be a <button>
        role="button"
        tabIndex={isPicking ? 0 : -1}
        aria-label={name ?? FamilySymbol[family]}
      >
        <div class="ns-head">
          {FamilySymbol[family] !== "" && <span class="ns-symbol">{FamilySymbol[family]}</span>}
          {name !== undefined && <span class="ns-name">{name}</span>}
        </div>
        {cardsIn(family).length > 0 && <div class="ns-cards">{cardsIn(family).map(chip)}</div>}
        {kids.length > 0 && (
          <div class={kids.length > 1 ? "ns-children is-side-by-side" : "ns-children"}>
            {kids.map(region)}
          </div>
        )}
      </div>
    );
  };

  const tops = childrenOf(null);
  const hasOutside = s.outsideName !== null || cardsIn(OUTSIDE).length > 0;
  const tray = cardsIn(null);

  return (
    <div class={`ns${isPicking ? " is-picking" : ""}`}>
      <div class={tops.length > 1 ? "ns-diagram is-side-by-side" : "ns-diagram"}>
        {tops.map(region)}
      </div>
      {hasOutside && (
        <div
          class={`ns-outside${isPicking ? " is-target" : ""}`}
          data-part={NumberSorterPart.Outside}
          onClick={drop(OUTSIDE)}
          onKeyDown={(event) => {
            if (isPicking && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              call(NumberSorterAction.Drop, { place: OUTSIDE });
            }
          }}
          // biome-ignore lint/a11y/useSemanticElements: it holds card buttons, so it can't be a <button>
          role="button"
          tabIndex={isPicking ? 0 : -1}
          aria-label={s.outsideName?.[locale] ?? "∉"}
        >
          <span class="ns-outside-name">{s.outsideName?.[locale] ?? "∉"}</span>
          {cardsIn(OUTSIDE).map(chip)}
        </div>
      )}
      {tray.length > 0 && <div class="ns-tray">{tray.map(chip)}</div>}
    </div>
  );
}
