import type { Locale, Localized, Sound } from "@chalk/content";
import type { ActionDef, AnyProp, Payload, ReaderOf, SignalDef } from "@chalk/prop";
import type { ComponentType } from "preact";

/**
 * What a view reads of its prop, as the board reads it: its variables, what it needs, what it
 * works out, and each part's own view, by name. Any prop's, when it isn't said which.
 */
export type PropView<P = AnyProp> = Readonly<Record<string, unknown>> &
  (AnyProp extends P ? unknown : ReaderOf<P>);

/**
 * What a prop's view gets. It draws the view and reports the student's actions; it owns nothing.
 * Typed by the prop's definition (`PropViewProps<typeof choice>`): what the view reads, and its own
 * actions, passed as themselves with what they carry checked.
 */
export type PropViewProps<P = AnyProp> = {
  view: PropView<P>;
  locale: Locale;
  /** Width in px the view should draw at. */
  width: number;
  /** The student did something: runs one of the prop's actions through the one door. */
  call: <Pa extends Payload>(action: ActionDef<Pa>, args?: Pa) => void;
  /** Raises one of the prop's signals. */
  signal: (signal: SignalDef, payload?: Payload) => void;
};

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
  def: AnyProp;
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
    def: def as unknown as AnyProp,
    View: View as unknown as ComponentType<PropViewProps>,
    ...(sound === undefined ? {} : { sound }),
  };
}

export type PropRegistry = Readonly<Record<string, PropModule>>;
