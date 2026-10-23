import type { Locale } from "@chalk/content";
import type { AnyPropDef, PropView } from "@chalk/prop";
import type { ComponentType } from "preact";

/** What a prop's view gets. It draws the view and reports the learner's actions; it owns nothing. */
export type PropViewProps = {
  /** The prop's state, stored and derived. */
  view: PropView;
  locale: Locale;
  /** Width in px the view should draw at. */
  width: number;
  /** The learner did something: runs one of the prop's actions through the one door. */
  call: (action: string, args?: Readonly<Record<string, unknown>>) => void;
  /** Raises one of the prop's signals (e.g. the learner let go of the marker). */
  signal: (name: string, payload?: Readonly<Record<string, unknown>>) => void;
};

/** A prop as the player knows it: the definition plus a view. */
export type PropModule = { def: AnyPropDef; View: ComponentType<PropViewProps> };

export type PropRegistry = Readonly<Record<string, PropModule>>;
