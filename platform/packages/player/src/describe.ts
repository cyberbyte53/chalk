import type { Locale } from "@chalk/content";
import { type Observation, describe, tagsInMarkup } from "@chalk/prop";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import type { PropModule, PropView, PropViewProps } from "./prop-module";

/** A width to draw at when only what is drawn matters (a phone's). */
const DESCRIBE_WIDTH = 390;

const nothing = () => undefined;

/**
 * A prop as the student sees it right now: its view drawn from this state (as markup, the same
 * code the phone runs), and read for its tags (`does`, `says`, `shows`). The one way anything
 * describes a prop: the snapshot, `look` and `play`, Jugnu on the phone and on the server, tests.
 * Words are read in `locale`.
 */
export function describeView(
  module: PropModule,
  view: PropView,
  locale: Locale = "en",
): Observation {
  const props: PropViewProps = {
    view,
    locale,
    width: DESCRIBE_WIDTH,
    call: nothing,
    signal: nothing,
  };
  return describe(module.def, view, tagsInMarkup(renderToString(h(module.View, props))));
}
