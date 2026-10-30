import { hidden, line, place, scene, tap } from "@chalk/author";
import { Actor } from "@chalk/content";
import { propLibrary } from "@chalk/library";
import { SceneRuntime, scriptOf } from "@chalk/player";
import { sceneChoice, sceneText } from "@chalk/prop-basics";
import { sceneCoordinatePlane } from "@chalk/prop-coordinates";
import { describe, expect, it } from "vitest";
import { checkWitness, play } from "./witness";

// A board on the event model, end to end: written as a scene, checked the way the build checks
// any board (its witness played on the real props, the clock jumping), lines said and waited for.

const t = (en: string, hi: string) => ({ en, hi });
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
      locale: "en",
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
    // "found" is said at once, cutting the title (its audio stopped first); the question, still
    // waiting, is never said.
    expect(heard.filter((h) => h.startsWith("say"))).toEqual(["say title", "say found"]);
    expect(heard.slice(heard.indexOf("say found") - 1)).toEqual(["hush", "say found"]);
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

  it("a piece with nothing to say adds no pause; a line hidden while said moves on to the next", () => {
    const quiet = scene({
      pieces: {
        first: place(sceneText, {
          text: { en: "One two three four five.", hi: "एक दो तीन चार पाँच।" },
        }),
        plane: place(sceneCoordinatePlane),
        second: place(sceneText, { text: { en: "Six.", hi: "छह।" } }),
        third: place(sceneText, { text: { en: "Seven.", hi: "सात।" } }),
      },
    }).build("quiet");
    const said: string[] = [];
    const runtime = new SceneRuntime(quiet.board, (type) => propLibrary[type], {
      locale: "en",
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => void said.push(`${line.name} at ${runtime.time().toFixed(1)}`),
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    runtime.settle();
    // "first" takes 0.4 + 5 / 2.5 = 2.4 s, then one breath (0.7): the plane says nothing, no second.
    expect(said.slice(0, 2)).toEqual(["first at 0.0", "second at 3.1"]);

    const hiding = new SceneRuntime(quiet.board, (type) => propLibrary[type], {
      locale: "en",
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => void said.push(line.name),
      onError: (message) => {
        throw new Error(message);
      },
    });
    said.length = 0;
    hiding.start();
    void hiding.call("board", "hide", { name: "first" });
    hiding.settle(0);
    // "first" is cut; the plane, next, has nothing to say; "second" goes on at once.
    expect(said).toEqual(["first", "second"]);
  });

  it("a line of its own is said at its moment, and the runs say which lines they hear", async () => {
    const moments = scene({
      pieces: { ask },
      lines: {
        well: line(t("Well done!", "शाबाश!"), {
          speaker: "riya",
          when: "ask.correct",
          about: "ask",
        }),
        never: line(t("Never said.", "कभी नहीं।"), { when: "ask.wrong", if: () => false }),
      },
      witness: [tap("ask", "select", { option: "street" }), tap("ask", "check")],
    }).build("moments");
    const heard = new Set<string>();
    expect(
      await checkWitness(moments.board, propLibrary, moments.witness, (l) => void heard.add(l)),
    ).toEqual([]);
    expect([...heard].sort()).toEqual(["ask", "well"]);
    // Every line a board can say, with its moment: "never" is one no run reaches.
    expect(
      scriptOf(moments.board, (type) => propLibrary[type]).map((l) => `${l.line}: ${l.cue}`),
    ).toEqual(["ask: opening", "well: moment", "never: moment"]);
  });

  it("a moment that isn't a signal here is refused when the board is built", () => {
    expect(() =>
      scene({ pieces: { ask }, lines: { x: line(t("x", "x"), { when: "ask.landed" }) } }).build(
        "bad",
      ),
    ).toThrow(/when "ask.landed" isn't a signal of a piece here/);
  });
});
