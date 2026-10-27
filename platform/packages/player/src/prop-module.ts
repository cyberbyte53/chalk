import type { Locale } from "@chalk/content";
import type {
  ActionSpec,
  AnyPropDef,
  ArgsParam,
  PropDef,
  SignalSpec,
  StoredState,
  ViewOf,
} from "@chalk/prop";
import type { ComponentType } from "preact";

/**
 * What a prop's view gets. It draws the view and reports the learner's actions; it owns nothing.
 * Typed by the prop's definition (`PropViewProps<typeof sweetShare>`): the view's stored and derived
 * fields, and its own actions, passed as themselves with their arguments checked.
 */
export type PropViewProps<P = AnyPropDef> = {
  /** The prop's state, stored and derived. */
  view: ViewOf<P>;
  locale: Locale;
  /** Width in px the view should draw at. */
  width: number;
  /** The learner did something: runs one of the prop's actions through the one door. */
  call: <Ar>(action: ActionSpec<StateOfDef<P>, Ar>, ...args: ArgsParam<Ar>) => void;
  /** Raises one of the prop's signals (e.g. the learner let go of the marker). */
  signal: (signal: SignalSpec, payload?: Readonly<Record<string, unknown>>) => void;
};

type StateOfDef<P> = P extends PropDef<infer S> ? S : StoredState;

/** A prop as the player knows it: the definition plus a view. */
export type PropModule = { def: AnyPropDef; View: ComponentType<PropViewProps> };

/** A prop's definition and its view, as the player holds them (their types erased together). */
export function propModule<P extends { readonly type: string }>(
  def: P,
  View: ComponentType<PropViewProps<P>>,
): PropModule {
  return {
    def: def as unknown as AnyPropDef,
    View: View as unknown as ComponentType<PropViewProps>,
  };
}

export type PropRegistry = Readonly<Record<string, PropModule>>;
