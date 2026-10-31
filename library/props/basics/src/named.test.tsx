import { does } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { choice } from "./props";

/**
 * In a prop view, anything a student can press says what it does (@chalk/prop's jsx-runtime): an
 * event handler without a name is a type error, so it can't be written, let alone drawn. The lines
 * marked below must fail to compile; the type check fails if one ever does compile.
 */
describe("a prop view's pressable elements", () => {
  it("can't have a handler without a name", () => {
    const press = () => {};
    // @ts-expect-error a press handler with no name on it
    const unnamed = <button type="button" onClick={press} />;
    // @ts-expect-error a key handler with no name on it, on a shape
    const shape = <g onKeyDown={press} />;
    const named = <button type="button" {...does(choice.actions.check)} onClick={press} />;
    const plain = <span>no handler, no name needed</span>;
    expect([unnamed, shape, named, plain]).toHaveLength(4);
  });
});
