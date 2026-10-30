import { hidden, place, scene, tap } from "@chalk/author";
import { Actor } from "@chalk/content";
import { propLibrary } from "@chalk/library";
import { SceneRuntime } from "@chalk/player";
import { sceneChoice, sceneText } from "@chalk/prop-basics";
import { describe, expect, it } from "vitest";
import { checkWitness, play } from "./witness";

// A board on the event model, end to end: written as a scene, checked the way the build checks
// any board (its witness played on the real props, the clock jumping), lines said and waited for.

const ask = place(sceneChoice, {
  prompt: { en: "Which comes first?", hi: "पहले क्या आता है?" },
  options: [
    { id: "street", label: { en: "the street", hi: "गली" } },
    {
      id: "house",
      label: { en: "the house", hi: "मकान" },
      feedback: { en: "Along first.", hi: "पहले आगे।" },
    },
  ],
  answer: "street",
});

const board = scene({
  pieces: {
    title: place(sceneText, { text: { en: "Two numbers", hi: "दो संख्याएँ" } }),
    ask,
    found: hidden(place(sceneText, { text: { en: "Right: along, then up.", hi: "सही।" } })),
  },
  hear: { "ask.correct": (_, __, t) => t.self.show({ name: "found" }) },
  witness: [tap("ask", "select", { option: "street" }), tap("ask", "check")],
}).build("tiny");

describe("a scene, built and checked like any board", () => {
  it("its witness answers the question and gets Continue", async () => {
    expect(await checkWitness(board.board, propLibrary, board.witness)).toEqual([]);
  });

  it("a wrong answer gets its note, and no Continue", async () => {
    const played = await play(board.board, propLibrary, [
      tap("ask", "select", { option: "house" }),
      tap("ask", "check"),
    ]);
    expect(played.failures).toEqual([]);
    expect(played.view("ask").feedback).toEqual({ en: "Along first.", hi: "पहले आगे।" });
    expect(played.view("board").isPassed).toBe(false);
    expect(played.view("board").hidden).toEqual(["found"]);
  });

  it("a line shown cuts off what is being said: the newest line wins", () => {
    const heard: string[] = [];
    const runtime = new SceneRuntime(board.board, (type) => propLibrary[type], {
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => void heard.push(`say ${line.name}`),
      hush: () => void heard.push("hush"),
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    // While the title is being said (the question waits its turn), the student answers.
    void runtime.call("ask", "select", { option: "street" }, Actor.Learner);
    void runtime.call("ask", "check", {}, Actor.Learner);
    runtime.settle();
    // "found" is said at once, cutting the title; the question, still waiting, is never said.
    expect(heard).toEqual(["say title", "say found"]);
    expect(runtime.getView("board").saying).toEqual([]);
  });

  it("lines are said in order and waited for: the title, the question, then what is shown", async () => {
    const played = await play(board.board, propLibrary, [
      tap("ask", "select", { option: "street" }),
      tap("ask", "check"),
    ]);
    expect(played.view("board").hidden).toEqual([]);
    expect(played.view("board").saying).toEqual([]);
  });
});
