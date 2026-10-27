import { actionsFor, defineProp, set } from "@chalk/prop";
import { render } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { does, doesOf, says } from "./does";

const act = actionsFor<{ count: number }>();
const shelf = defineProp({
  type: "shelf",
  describe: "A shelf of counters",
  state: z.object({ count: z.number().int() }).strict(),
  defaults: { count: 0 },
  actions: {
    placeOne: act({
      describe: "Put one on",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ count: s.count + 1 }),
    }),
    placeMany: act({
      describe: "Put several on",
      byLearner: true,
      args: z.object({ count: z.number().int() }).strict(),
      run: (s, a) => set({ count: s.count + a.count }),
    }),
  },
});

describe("an input says what it does", () => {
  it("as data on the input: the action's name, and its arguments if any", () => {
    expect(does(shelf.actions.placeOne)).toEqual({ "data-does": "placeOne" });
    expect(does(shelf.actions.placeMany, { count: 10 })).toEqual({
      "data-does": "placeMany",
      "data-with": '{"count":10}',
    });
    expect(says(shelf.actions.placeMany)).toEqual({
      "data-does": "placeMany",
      "data-by-hand": "",
    });
  });

  it("is on the page, so it can be read without pressing it", () => {
    const html = render(
      <button type="button" {...does(shelf.actions.placeMany, { count: 10 })}>
        +10
      </button>,
    );
    expect(html).toContain('data-does="placeMany"');
    expect(html).toContain('data-with="{&quot;count&quot;:10}"');
  });

  it("is passed on by a component to the element that is pressed", () => {
    const Button = (props: Record<string, unknown>) => (
      <button type="button" {...doesOf(props)}>
        go
      </button>
    );
    expect(render(<Button {...does(shelf.actions.placeOne)} label="x" />)).toContain(
      'data-does="placeOne"',
    );
    expect(doesOf({ label: "x", onPress: () => {} })).toEqual({});
  });

  it("names an action only as itself: one not in a defined prop is refused", () => {
    const loose = act({ describe: "Loose", args: z.object({}).strict(), run: () => set({}) });
    expect(() => does(loose)).toThrow(/isn't an action or signal of a defined prop/);
  });
});
