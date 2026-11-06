/**
 * How a prop made of parts lays them out (platform/docs/board-model.md): round a frame's
 * picture (one part provides the frame; the others draw in it, above, below or
 * among the controls), and which parts are showing now.
 */

/**
 * Where a child draws around a frame's picture. A child may draw in several (a walker: herself on
 * the lines, where she is in words below, her buttons): above the picture, inside it (back, on the
 * lines, front), below it, and among the controls.
 */
export const Place = {
  Above: "above",
  Back: "back",
  On: "on",
  Front: "front",
  Below: "below",
  Controls: "controls",
} as const;
export type Place = (typeof Place)[keyof typeof Place];
/** The places inside the picture, back to front. */
export const IN_PICTURE: readonly Place[] = [Place.Back, Place.On, Place.Front];

/** How a prop made of parts lays them out: round a frame one of them provides (the plane's). */
export type GroupLayoutSpec<N extends string = string> = {
  provider: N;
  children: readonly N[];
  backdrop?: N;
  below?: readonly N[];
  /**
   * Who draws first in each place, when it isn't the provider, then `children`, then `below`
   * (`{ front: ["plotting", "clues"] }`): each list names every child drawing there.
   */
  order?: { readonly [P in Place]?: readonly N[] };
};

const SHOWN = Symbol("shown");

/** Which parts are drawn now, noted on a view (from the prop's `show`). */
export function withShown(view: object, shown: Readonly<Record<string, boolean>>): void {
  Object.defineProperty(view, SHOWN, { value: shown });
}

export function shownOf(view: object): Readonly<Record<string, boolean>> | undefined {
  return (view as Record<symbol, Record<string, boolean>>)[SHOWN];
}

const GIVEN = Symbol("given");

/** The children its placement gave anything (`{ walker: {} }` counts), noted on a view. */
export function withGiven(view: object, given: ReadonlySet<string>): void {
  Object.defineProperty(view, GIVEN, { value: given });
}

/**
 * The children a prop's placement named: what a board uses of a prop made of pieces (the
 * coordinate plane's walker, places…). Empty for a view read without one.
 */
export function givenOf(view: object): ReadonlySet<string> {
  return (view as Record<symbol, ReadonlySet<string> | undefined>)[GIVEN] ?? new Set();
}
