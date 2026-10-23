import { Actor, lessonSchema } from "@chalk/content";
import { boardState, headlessBoard } from "@chalk/player";
import { describe, expect, it } from "vitest";
import rootTwo from "../../studio/evals/boards/published/where-is-root-2.json";
import { propDefs } from "./index";

const guess = lessonSchema.parse(rootTwo).boards[1];
if (guess === undefined) throw new Error("no guess board");
const lookup = (type: string) => propDefs[type];

describe("a board with no screen (Jugnu's copy on the server)", () => {
  it("is put into the state the phone sent, with its IS rules true", () => {
    const phone = headlessBoard(guess, lookup);
    phone.runtime.restore(new Map([["line", { ...phone.runtime.getStored("line"), marker: 1.3 }]]));
    const copy = headlessBoard(guess, lookup, boardState(phone.runtime));
    expect(copy.runtime.getStored("line").marker).toBe(1.3);
    expect(copy.runtime.getView("squareLabel").text).toMatchObject({ en: "1.30 × 1.30 = 1.6900" });
    expect(copy.runtime.getStored("guessRoot").isMet).toBe(false);
    phone.dispose();
    copy.dispose();
  });

  it("finishes a glide at once: an action resolves at its end state", async () => {
    const copy = headlessBoard(guess, lookup);
    await copy.runtime.call("line", "magnify", { value: 1.41 }, Actor.Jugnu);
    expect(await copy.settle()).toBe(true);
    const line = copy.runtime.getStored("line");
    expect(line.from).toBeCloseTo(1.4);
    expect(line.to).toBeCloseTo(1.5);
    expect(copy.errors).toEqual([]);
    copy.dispose();
  });

  it("runs what an action sets off through the lesson's rules", async () => {
    const copy = headlessBoard(guess, lookup);
    await copy.runtime.call("line", "moveMarker", { to: 1.7 }, Actor.Learner);
    await copy.runtime.call("guessRoot", "check", {}, Actor.Learner);
    await copy.settle();
    expect(copy.runtime.getStored("guessRoot")).toMatchObject({
      status: "wrong",
      feedback: { en: "Its square is more than 2. Move left." },
    });
    copy.dispose();
  });
});
