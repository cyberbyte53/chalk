import { Actor } from "@chalk/content";
import { headlessBoard } from "@chalk/player";
import { describe, expect, it } from "vitest";
import { propDefs } from "./index";
import { testLesson } from "./test-lesson";

const [share, race] = testLesson().boards;
if (share === undefined || race === undefined) throw new Error("no test boards");
const lookup = (type: string) => propDefs[type];

describe("a board with no screen (Jugnu's copy on the server)", () => {
  it("is put into the state the phone sent, with its IS rules true", () => {
    const phone = headlessBoard(share, lookup);
    phone.runtime.restoreFacts(
      new Map([["game", { ...phone.runtime.getStored("game"), rounds: 2 }]]),
    );
    const copy = headlessBoard(share, lookup, phone.runtime.save());
    expect(copy.runtime.getStored("game").rounds).toBe(2);
    expect(copy.runtime.getView("box").text).toMatchObject({ en: "7 in the box" });
    phone.dispose();
    copy.dispose();
  });

  it("finishes a glide at once: an action resolves at its end state", async () => {
    const copy = headlessBoard(race, lookup);
    await copy.runtime.call("runners", "play", {}, Actor.Jugnu);
    expect(await copy.settle()).toBe(true);
    expect(copy.runtime.getStored("runners")).toMatchObject({ time: 12, isRunning: false });
    expect(copy.errors).toEqual([]);
    copy.dispose();
  });

  it("runs what an action sets off through the lesson's rules", async () => {
    const copy = headlessBoard(share, lookup);
    for (let i = 0; i < 3; i++) await copy.runtime.call("game", "giveRound", {}, Actor.Learner);
    await copy.settle();
    expect(copy.runtime.isHidden("left")).toBe(false);
    await copy.runtime.call("left", "select", { option: "three" }, Actor.Learner);
    await copy.runtime.call("left", "check", {}, Actor.Learner);
    await copy.settle();
    expect(copy.runtime.getStored("left")).toMatchObject({
      status: "wrong",
      feedback: { en: "Count the box again." },
    });
    copy.dispose();
  });
});
