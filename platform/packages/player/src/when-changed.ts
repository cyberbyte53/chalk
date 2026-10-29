import { type EffectCallback, useEffect, useLayoutEffect, useMemo } from "preact/hooks";

/**
 * Work that runs again when something changes that the work itself doesn't read: fetch the boards
 * again after a rebuild (`build`), scroll once a column is added, measure again when the formula
 * changes. The triggers are named as what they are; an ordinary effect keeps listing exactly what
 * it reads, and the linter keeps checking that.
 */
export function useWhenChanged(triggers: readonly unknown[], run: EffectCallback): void {
  useEffect(run, triggers);
}

/** The same, before the browser paints (a measurement that changes the layout). */
export function useLayoutWhenChanged(triggers: readonly unknown[], run: EffectCallback): void {
  useLayoutEffect(run, triggers);
}

/** A value made again only when one of `triggers` changes (one recorder per board on screen). */
export function useMadeWhenChanged<T>(triggers: readonly unknown[], make: () => T): T {
  return useMemo(make, triggers);
}
