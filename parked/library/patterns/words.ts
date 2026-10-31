import type { BoardKit, PlacedOf } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { TextStyle, textDef } from "@chalk/prop-basics";

/**
 * Words on a page, named in reading order ("w1", "w2", …) so a page only names what a rule needs.
 * `b.prop(textDef, …)` underneath: rich text, `$maths$` and `**bold**` included. Pass `{ isHidden: true }`
 * for words a rule shows later (what a task reveals once it's done).
 */
export function wordsOn(b: BoardKit) {
  let count = 0;
  const put =
    (style: TextStyle) =>
    (
      text: Localized,
      name?: string,
      options: { isHidden?: boolean } = {},
    ): PlacedOf<typeof textDef> =>
      b.prop(textDef, name ?? `w${++count}`, { text, style }, options);
  return {
    title: put(TextStyle.Title),
    body: put(TextStyle.Body),
    note: put(TextStyle.Note),
    definition: put(TextStyle.Definition),
  };
}
