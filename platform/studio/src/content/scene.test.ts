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
    const played = await play(
      board.board,
      propLibrary,
      [tap("ask", "select", { option: "house" }), tap("ask", "check")],
      "en",
    );
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
    expect(runtime.getView("board").reads).toEqual([]);
  });

  it("lines are said in order and waited for: the title, the question, then what is shown", async () => {
    const played = await play(
      board.board,
      propLibrary,
      [tap("ask", "select", { option: "street" }), tap("ask", "check")],
      "hi",
    );
    expect(played.view("board").hidden).toEqual([]);
    expect(played.view("board").saying).toEqual([]);
    expect(played.view("board").reads).toEqual([]);
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
    // "first" takes 5 / 2.5 = 2 s, then one breath (0.7): the plane says nothing, no second.
    expect(said.slice(0, 2)).toEqual(["first at 0.0", "second at 2.7"]);

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
    hiding.settle(1);
    // "first" is cut; after a breath the plane, next, has nothing to say; "second" goes on at once.
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

  it("lines wait for real events, the board's own too, and the script shows each as one", async () => {
    const events = scene({
      pieces: {
        title: place(sceneText, { text: t("Two numbers", "दो संख्याएँ") }),
        plane: place(sceneCoordinatePlane),
        ask,
        hint: hidden(place(sceneText, { text: t("Look along", "आगे देखो") })),
      },
      lines: {
        afterTitle: line(t("Now this.", "अब यह।"), {
          when: "board.said",
          where: { line: "title" },
        }),
        afterPlane: line(t("See the plane.", "तल देखो।"), {
          when: "board.said",
          where: { line: "plane" },
        }),
        well: line(t("Well done!", "शाबाश!"), {
          speaker: "riya",
          when: "ask.checked",
          where: { status: "correct" },
          about: "ask",
        }),
      },
      witness: [tap("ask", "select", { option: "street" }), tap("ask", "check")],
    }).build("events");
    expect(
      scriptOf(events.board, (type) => propLibrary[type]).map((l) => `${l.line}: ${l.moment}`),
    ).toEqual([
      "title: board.started",
      "ask: board.said · line afterPlane",
      "hint: board.shown · name hint",
      "afterTitle: board.said · line title",
      "afterPlane: board.said · line plane",
      "well: ask.checked · status correct",
    ]);
    // Heard in every language, on the passing run.
    const heard: string[] = [];
    expect(
      await checkWitness(events.board, propLibrary, events.witness, (l, locale) =>
        heard.push(`${locale} ${l}`),
      ),
    ).toEqual([]);
    // A line on the board's own event goes in its speech, ahead of what waits: nothing is cut.
    expect(heard.filter((h) => h.startsWith("en ")).map((h) => h.slice(3))).toEqual([
      "title",
      "afterTitle",
      "afterPlane",
      "ask",
      "well",
    ]);
    for (const locale of ["en", "hi"])
      for (const l of ["title", "afterTitle", "afterPlane", "well"])
        expect(heard).toContain(`${locale} ${l}`);
  });

  it("the board talks in turn: a piece the lesson shows waits its turn, nothing is lost", async () => {
    const busy = scene({
      pieces: {
        title: place(sceneText, { text: t("Two numbers", "दो संख्याएँ") }),
        ask,
        hint: hidden(place(sceneText, { text: t("Look along", "आगे देखो") })),
      },
      lines: {
        first: line(t("First.", "पहला।"), { when: "board.said", where: { line: "title" } }),
        second: line(t("Second.", "दूसरा।"), { when: "board.said", where: { line: "title" } }),
      },
      // The lesson shows a piece the moment the title is said: it cuts in, the lines due follow.
      onSaid: { title: (_, t) => t.self.show({ name: "hint" }) },
      witness: [tap("ask", "select", { option: "street" }), tap("ask", "check")],
    }).build("busy");
    const heard: string[] = [];
    expect(
      await checkWitness(busy.board, propLibrary, busy.witness, (l, locale) =>
        heard.push(`${locale} ${l}`),
      ),
    ).toEqual([]);
    // The lines written for the moment come first, in order; the hint the lesson shows in answer
    // waits its turn and drops nothing. The opening goes on when the board has nothing else to say.
    expect(heard.filter((h) => h.startsWith("en ")).map((h) => h.slice(3))).toEqual([
      "title",
      "first",
      "second",
      "hint",
      "ask",
    ]);
  });

  it("a line the student cuts is still said: what waits on it happens (Aman always replies)", () => {
    const reply = scene({
      pieces: {
        title: place(sceneText, { text: t("Where does Aman live?", "अमन कहाँ रहता है?") }),
        ask,
        answer: hidden(place(sceneText, { text: t("Street 4.", "गली 4।") })),
      },
      onSaid: { title: (_, t) => t.self.show({ name: "answer" }) },
    }).build("reply");
    const said: string[] = [];
    const runtime = new SceneRuntime(reply.board, (type) => propLibrary[type], {
      locale: "en",
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => void said.push(line.name),
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    // While the title is said, the student answers: the title is cut, and the answer still comes.
    void runtime.call("ask", "select", { option: "house" }, Actor.Learner);
    void runtime.call("ask", "check", {}, Actor.Learner);
    runtime.settle();
    expect(runtime.getView("board").hidden).toEqual([]);
    expect(said).toContain("answer");
  });

  it("a line with blanks is said with its moment's values, as phrases", async () => {
    const walk = scene({
      pieces: {
        plane: place(sceneCoordinatePlane, {
          walker: { walkFrom: { x: 0, y: 0 }, at: { x: 0, y: 0 } },
        }),
      },
      lines: {
        where: line(t("The bus is at {x}.", "बस {x} पर है।"), { when: "plane.walker.stepped" }),
      },
    }).build("walk");
    const runtime = new SceneRuntime(walk.board, (type) => propLibrary[type], {
      locale: "hi",
      now: () => 0,
      frame: () => () => undefined,
      speak: async () => undefined,
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    // Three steps, each once the bus has arrived (it refuses a step while moving).
    for (const _ of [1, 2, 3]) {
      await runtime.call("plane", "walker.step", { direction: "left" }, Actor.Learner);
      runtime.settle(1, true);
    }
    runtime.settle();
    // Each step cuts the last (the student's): the newest is what is heard to the end.
    const heard = runtime.heard().filter((h) => h.line === "where");
    expect(heard.map((h) => `${h.words}${h.cutAt === undefined ? "" : " (cut)"}`)).toEqual([
      "बस माइनस 1 पर है। (cut)",
      "बस माइनस 2 पर है। (cut)",
      "बस माइनस 3 पर है।",
    ]);
  });

  it("refuses blanks its moment doesn't fill", () => {
    expect(() =>
      scene({
        pieces: { plane: place(sceneCoordinatePlane) },
        lines: { x: line(t("At {z}.", "{z} पर।"), { when: "plane.walker.stepped" }) },
      }).build("bad"),
    ).toThrow(/\{z\} isn't a number plane.walker.stepped carries \(x, y\)/);
    expect(() =>
      scene({ pieces: { ask }, lines: { x: line(t("At {x}.", "{x} पर।")) } }).build("bad"),
    ).toThrow(/it needs a when/);
  });

  it("on a student's board, a line is over when its sound is: no length is assumed", async () => {
    const ends: (() => void)[] = [];
    const said: string[] = [];
    const runtime = new SceneRuntime(board.board, (type) => propLibrary[type], {
      locale: "en",
      now: () => 0,
      frame: () => () => undefined,
      speak: (line) =>
        new Promise<void>((resolve) => {
          said.push(line.name);
          ends.push(resolve);
        }),
      isHeard: true,
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    runtime.settle(600, true);
    // Ten minutes on, the title is still being said: its sound hasn't ended.
    expect(said).toEqual(["title"]);
    ends[0]?.();
    await Promise.resolve();
    runtime.settle(5, true);
    expect(said).toEqual(["title", "ask"]);
  });

  it("refuses a line on Continue (nothing is heard after it) and a piece named board", () => {
    expect(() =>
      scene({
        pieces: { ask },
        lines: { x: line(t("x", "x"), { when: "board.continued" }) },
      }).build("bad"),
    ).toThrow(/when "board.continued"/);
    expect(() => scene({ pieces: { board: ask } }).build("bad")).toThrow(/can't be named "board"/);
  });

  it("a line about something not on the board is refused; a part inside a piece is fine", () => {
    expect(() =>
      scene({ pieces: { ask }, lines: { x: line(t("x", "x"), { about: "nowhere" }) } }).build(
        "bad",
      ),
    ).toThrow(/about "nowhere" isn't a piece here/);
    expect(() =>
      scene({ pieces: { ask }, lines: { x: line(t("x", "x"), { about: "ask.nothing" }) } }).build(
        "bad",
      ),
    ).toThrow(/about "ask.nothing"/);
  });

  it("a moment that isn't a signal here is refused when the board is built", () => {
    expect(() =>
      scene({ pieces: { ask }, lines: { x: line(t("x", "x"), { when: "ask.landed" }) } }).build(
        "bad",
      ),
    ).toThrow(/when "ask.landed" isn't a signal of a piece here/);
  });
});
