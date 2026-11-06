import type { AnyProp, Place } from "@chalk/prop";

/**
 * One piece on the coordinate plane, as the plane holds it: everything the plane needs to know of
 * it, in one place. A new piece is its own files and one of these, added to the plane's list
 * (coordinate-plane.ts); nothing already there changes. Every piece starts off: a board that never
 * gives it anything never shows it.
 */
export type Piece<D extends AnyProp = AnyProp, S = never> = {
  readonly prop: D;
  /** Whether it has anything to show now. Its start is off. */
  readonly isOn: (s: S) => boolean;
  /** Whether, while it is on, a tap on the empty plane is its own, not the plane's. */
  readonly takesTaps?: (s: S) => boolean;
  /**
   * Its turn in each place it draws round the plane's picture (`Place`), lower first; the plane's
   * own turns are in coordinate-plane.ts. Every place it draws in has a turn (the view refuses one
   * without).
   */
  readonly turns: { readonly [P in Place]?: number };
  /** What it puts on the plane, in a phrase, for the plane's description ("the dice game"). */
  readonly says: string;
};

export const piece = <D extends AnyProp, S>(p: Piece<D, S>): Piece<D, S> => p;

/** Always: for a piece that, while on, always takes the plane's taps. */
export const always = () => true;
