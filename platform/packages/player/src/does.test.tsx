import { render } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { does, doesOf, says } from "./does";

describe("an input says what it does", () => {
  it("as data on the input: the action, and its arguments if any", () => {
    expect(does("giveRound")).toEqual({ "data-does": "giveRound" });
    expect(does("placeMany", { count: 10 })).toEqual({
      "data-does": "placeMany",
      "data-with": '{"count":10}',
    });
    expect(says("setSweets")).toEqual({ "data-does": "setSweets", "data-by-hand": "" });
  });

  it("is on the page, so it can be read without pressing it", () => {
    const html = render(
      <button type="button" {...does("placeMany", { count: 10 })}>
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
    expect(render(<Button {...does("giveRound")} label="x" />)).toContain('data-does="giveRound"');
    expect(doesOf({ label: "x", onPress: () => {} })).toEqual({});
  });
});
