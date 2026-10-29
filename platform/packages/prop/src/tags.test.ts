import { expect, describe as group, it } from "vitest";
import { z } from "zod";
import { PropRole, actionsFor, asAnyProp, defineProp, set } from "./define";
import { describe, does, says, shows, tagsInMarkup, tagsOf } from "./tags";

const act = actionsFor<{ count: number; isOpen: boolean }>();
const shelf = defineProp({
  type: "shelf",
  role: PropRole.Explainer,
  describe: "A shelf of counters",
  state: z.object({ count: z.number().int(), isOpen: z.boolean() }).strict(),
  defaults: { count: 0, isOpen: true },
  derived: { isFull: { describe: "Ten or more", compute: (s) => s.count >= 10 } },
  offScreen: ["isFull"],
  summary: (s) => `${s.count} on the shelf`,
  actions: {
    placeOne: act({
      describe: "Put one on",
      byLearner: true,
      changes: ["count"],
      args: z.object({}).strict(),
      run: (s) => set({ count: s.count + 1 }),
    }),
    placeMany: act({
      describe: "Put several on",
      byLearner: true,
      changes: ["count"],
      args: z.object({ count: z.number().int() }).strict(),
      run: (s, a) => set({ count: s.count + a.count }),
    }),
  },
});

/** Attributes as preact-render-to-string writes them. */
const attrs = (tags: Readonly<Record<string, string>>) =>
  Object.entries(tags)
    .map(([k, v]) =>
      v === "" ? k : `${k}="${v.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`,
    )
    .join(" ");

group("a view's tags", () => {
  it("name an input by its action, with its arguments, and a key when several do one action", () => {
    expect(does(shelf.actions.placeOne)).toEqual({
      "data-part": "placeOne",
      "data-does": "placeOne",
    });
    expect(does(shelf.actions.placeMany, { count: 10 }, 10)).toEqual({
      "data-part": "placeMany:10",
      "data-does": "placeMany",
      "data-with": '{"count":10}',
    });
    expect(says(shelf.actions.placeMany)).toEqual({
      "data-part": "placeMany",
      "data-does": "placeMany",
      "data-by-hand": "",
    });
    expect(shows("count", 3, "3 counters")).toEqual({
      "data-part": "count",
      "data-shows": "3",
      "data-words": "3 counters",
    });
    expect(tagsOf({ label: "x", ...does(shelf.actions.placeOne) })).toEqual(
      does(shelf.actions.placeOne),
    );
  });

  it("make an input that sends arguments say which one it is, when written (a type error)", () => {
    const a = shelf.actions;
    // Checked by the type checker: each line below must fail to compile.
    // @ts-expect-error arguments without a key: every copy would get the same name
    does(a.placeMany, { count: 2 });
    // @ts-expect-error an action that takes arguments, given none
    does(a.placeMany);
    expect(does(a.placeMany, { count: 2 }, 2)["data-part"]).toBe("placeMany:2");
    expect(does(a.placeOne)["data-part"]).toBe("placeOne");
  });

  it("name an action only as itself: one not in a defined prop is refused", () => {
    const loose = act({
      describe: "Loose",
      changes: [],
      args: z.object({}).strict(),
      run: () => set({}),
    });
    expect(() => does(loose)).toThrow(/isn't an action or signal of a defined prop/);
  });

  it("are read back from the markup: inputs (off inside something disabled) and shown parts", () => {
    const html = `<div><span ${attrs(shows("count", 12, "12 counters"))}>12</span><fieldset disabled><button ${attrs(does(shelf.actions.placeMany, { count: 10 }, 10))}>+10</button></fieldset><button ${attrs(does(shelf.actions.placeOne))}>+1</button></div>`;
    expect(tagsInMarkup(html)).toEqual([
      { part: "count", value: 12, words: "12 counters" },
      { part: "placeMany:10", does: ["placeMany"], args: { count: 10 }, isOff: true },
      { part: "placeOne", does: ["placeOne"] },
    ]);
  });

  it("make the description: the summary, each part, and what is known but not shown", () => {
    const view = { count: 12, isOpen: true, isFull: true };
    const html = `<span ${attrs(shows("count", 12))}></span><button ${attrs(does(shelf.actions.placeOne))}></button>`;
    expect(describe(asAnyProp(shelf), view, tagsInMarkup(html))).toEqual({
      summary: "12 on the shelf",
      elements: [
        { id: "count", value: 12 },
        { id: "placeOne", does: "placeOne" },
      ],
      hidden: { isFull: true },
    });
  });

  it("refuse two parts with one name, a part that says nothing, and a view still loading", () => {
    const twice = `<button ${attrs(does(shelf.actions.placeOne))}></button><button ${attrs(does(shelf.actions.placeOne))}></button>`;
    expect(() => describe(asAnyProp(shelf), {}, tagsInMarkup(twice))).toThrow(
      /two parts are named "placeOne"/,
    );
    expect(() => tagsInMarkup('<g data-part="dot"></g>')).toThrow(/neither what it does/);
    expect(() => tagsInMarkup('<div data-waiting=""></div>')).toThrow(/still loading/);
  });
});
