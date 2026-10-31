import type { Locale, Localized, Sound } from "@chalk/content";
import type {
  ActionSpec,
  AnyPropDef,
  ArgsParam,
  PropDef,
  PropView,
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

/** A definition's state: what its defaults are (a host's joins its layers'). */
type StateOfDef<P> = P extends { readonly defaults: infer S extends StoredState } ? S : StoredState;

/**
 * How a prop sounds (platform/docs/sound.md), beside how it looks: its auditory view. Its `line` is
 * what it says when it appears on a board, unless the lesson gives it other words: a text's words,
 * a question's prompt. Worked out from its view, like its drawing.
 */
export type SoundView = {
  line?: (view: PropView) => Localized | undefined;
  /**
   * Its own sound cues, by the signal they sound at, inside the piece: its own ("checked") or a
   * part's ("walker.stepped"); from what the signal carries when the sound depends on it. A
   * lesson's cue at the same moment replaces it.
   */
  cues?: Readonly<
    Record<string, Sound | ((told: Readonly<Record<string, unknown>>) => Sound | undefined)>
  >;
  /** The signals among its cues whose sound takes a turn (right, wrong): words wait for it. */
  inTurn?: readonly string[];
};

/** A prop as the player knows it: the definition, how it looks, and how it sounds. */
export type PropModule = {
  def: AnyPropDef;
  View: ComponentType<PropViewProps>;
  sound?: SoundView;
};

/** A prop's definition and its view, as the player holds them (their types erased together). */
export function propModule<P extends { readonly type: string }>(
  def: P,
  View: ComponentType<PropViewProps<P>>,
  sound?: SoundView,
): PropModule {
  return {
    def: def as unknown as AnyPropDef,
    View: View as unknown as ComponentType<PropViewProps>,
    ...(sound === undefined ? {} : { sound }),
  };
}

export type PropRegistry = Readonly<Record<string, PropModule>>;
