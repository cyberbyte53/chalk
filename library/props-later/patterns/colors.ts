import { Color } from "@chalk/prop";

/** The colour each collection of numbers is drawn in, so every page shows N in the same blue. */
export const NumberColor = {
  Natural: "#2B4CD3",
  Whole: "#0F766E",
  Integer: "#C2410C",
  Rational: "#A21CAF",
  /** A number that is no longer the one to look at: plain ink, whatever the theme. */
  Ink: Color.OnSurface,
} as const;
