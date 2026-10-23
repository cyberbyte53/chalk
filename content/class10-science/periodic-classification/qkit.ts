import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import type { Concept } from "./concepts.gen";
import { type L, type Wrong, pickOne, seedOf } from "./kit";

/** One question in a fact family: its prompt, the right answer and the wrong ones (with why). */
export type Item = { prompt: L; right: L; wrong: readonly Wrong[] };

/**
 * A question family made of written items, one per row of params.yaml (`{ item: <key> }`); the
 * options are shuffled by the item's key, the same way every build.
 */
export function factFamily<K extends string>(
  tests: readonly [Concept, ...Concept[]],
  items: Readonly<Record<K, Item>>,
  level: Level = Level.Easy,
) {
  const keys = Object.keys(items) as [K, ...K[]];
  return family({
    level,
    tests,
    params: z.object({ item: z.enum(keys) }).strict(),
    build: (params, b) => {
      const item = params.item as K;
      const it: Item = items[item];
      const ask = pickOne(b, {
        prompt: t(it.prompt[0], it.prompt[1]),
        right: t(it.right[0], it.right[1]),
        wrong: it.wrong.map((w) => ({ label: t(w[0], w[1]), why: t(w[2], w[3]) })),
        seed: seedOf(item),
      });
      return column([ask, space()]);
    },
  });
}
