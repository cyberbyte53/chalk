import { type Cue, cue, hidden, place, scene, tap } from "@chalk/author";
import { Actor, BREATH } from "@chalk/content";
import { propLibrary } from "@chalk/library";
import { BoardRuntime, recordBoard, scriptOf } from "@chalk/player";
import { GRACE, estimatedSeconds } from "@chalk/prop";
import { choice, text } from "@chalk/prop-basics";
import { coordinatePlane } from "@chalk/prop-coordinates";
import { appear, tap as tapSound, wrong as wrongSound } from "@chalk/sounds";
import { describe, expect, it } from "vitest";
import { checkWitness, play } from "./witness";

// A board, end to end: written as a scene, checked the way the build checks
// any board (its witness played on the real props, the clock jumping), lines said and waited for.

const t = (en: string, hi: string) => ({ en, hi });
const ask = place(choice, {
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
    title: place(text, { text: { en: "Two numbers", hi: "दो संख्याएँ" } }),
    ask,
    found: hidden(place(text, { text: { en: "Right: along, then up.", hi: "सही।" } })),
  },
  hear: { "ask.correct": (_, __, t) => t.self.show({ name: "found" }) },
  witness: [tap("ask", "select", { option: "street" }), tap("ask", "check")],
}).build("tiny");

/** The boards here have no clips: each line stands in as long as its words would take to say. */
const lineSeconds = (line: { phrases: Readonly<Record<string, readonly string[] | undefined>> }) =>
  estimatedSeconds((line.phrases.en ?? line.phrases.hi ?? []).join(" "));

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
    const runtime = new BoardRuntime(board.board, (type) => propLibrary[type], {
      locale: "en",
      lineSeconds,
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => {
        heard.push(`say ${line.name}`);
        return true;
      },
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
        first: place(text, {
          text: { en: "One two three four five.", hi: "एक दो तीन चार पाँच।" },
        }),
        plane: place(coordinatePlane),
        second: place(text, { text: { en: "Six.", hi: "छह।" } }),
        third: place(text, { text: { en: "Seven.", hi: "सात।" } }),
      },
    }).build("quiet");
    const said: string[] = [];
    const runtime = new BoardRuntime(quiet.board, (type) => propLibrary[type], {
      locale: "en",
      lineSeconds,
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => {
        said.push(`${line.name} at ${runtime.time().toFixed(1)}`);
        return true;
      },
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    runtime.settle();
    // "first" takes 5 / 2.5 = 2 s, then one breath (0.7): the plane says nothing, no second.
    expect(said.slice(0, 2)).toEqual(["first at 0.0", "second at 2.7"]);

    const hiding = new BoardRuntime(quiet.board, (type) => propLibrary[type], {
      locale: "en",
      lineSeconds,
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => {
        said.push(line.name);
        return true;
      },
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
      cues: {
        well: cue(t("Well done!", "शाबाश!"), {
          speaker: "riya",
          when: "ask.correct",
          about: "ask",
        }),
        never: cue(t("Never said.", "कभी नहीं।"), { when: "ask.wrong", if: () => false }),
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
        title: place(text, { text: t("Two numbers", "दो संख्याएँ") }),
        plane: place(coordinatePlane),
        ask,
        hint: hidden(place(text, { text: t("Look along", "आगे देखो") })),
      },
      cues: {
        afterTitle: cue(t("Now this.", "अब यह।"), {
          when: "board.said",
          where: { line: "title" },
        }),
        afterPlane: cue(t("See the plane.", "तल देखो।"), {
          when: "board.said",
          where: { line: "plane" },
        }),
        well: cue(t("Well done!", "शाबाश!"), {
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
        title: place(text, { text: t("Two numbers", "दो संख्याएँ") }),
        ask,
        hint: hidden(place(text, { text: t("Look along", "आगे देखो") })),
      },
      cues: {
        first: cue(t("First.", "पहला।"), { when: "board.said", where: { line: "title" } }),
        second: cue(t("Second.", "दूसरा।"), { when: "board.said", where: { line: "title" } }),
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
        title: place(text, { text: t("Where does Aman live?", "अमन कहाँ रहता है?") }),
        ask,
        answer: hidden(place(text, { text: t("Street 4.", "गली 4।") })),
      },
      onSaid: { title: (_, t) => t.self.show({ name: "answer" }) },
    }).build("reply");
    const said: string[] = [];
    const runtime = new BoardRuntime(reply.board, (type) => propLibrary[type], {
      locale: "en",
      lineSeconds,
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => {
        said.push(line.name);
        return true;
      },
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
        plane: place(coordinatePlane, {
          walker: { walkFrom: { x: 0, y: 0 }, at: { x: 0, y: 0 } },
        }),
      },
      cues: {
        where: cue(t("The bus is at {x}.", "बस {x} पर है।"), { when: "plane.walker.stepped" }),
      },
    }).build("walk");
    const runtime = new BoardRuntime(walk.board, (type) => propLibrary[type], {
      locale: "hi",
      lineSeconds,
      now: () => 0,
      frame: () => () => undefined,
      speak: async () => true,
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
    const heard = runtime.heard().flatMap((h) => ("line" in h && h.line === "where" ? [h] : []));
    expect(heard.map((h) => `${h.words}${h.cutAt === undefined ? "" : " (cut)"}`)).toEqual([
      "बस माइनस 1 पर है। (cut)",
      "बस माइनस 2 पर है। (cut)",
      "बस माइनस 3 पर है।",
    ]);
  });

  it("refuses blanks its moment doesn't fill", () => {
    expect(() =>
      scene({
        pieces: { plane: place(coordinatePlane) },
        cues: { x: cue(t("At {z}.", "{z} पर।"), { when: "plane.walker.stepped" }) },
      }).build("bad"),
    ).toThrow(/\{z\} isn't a number plane.walker.stepped carries \(x, y\)/);
    expect(() =>
      scene({ pieces: { ask }, cues: { x: cue(t("At {x}.", "{x} पर।")) } }).build("bad"),
    ).toThrow(/it needs a when/);
  });

  it("on a student's board, a line is over when its sound tells it is, at the latest its length + GRACE", async () => {
    const heard = (isEver: boolean) => {
      const ends: (() => void)[] = [];
      const said: string[] = [];
      const runtime = new BoardRuntime(board.board, (type) => propLibrary[type], {
        locale: "en",
        lineSeconds,
        now: () => 0,
        frame: () => () => undefined,
        speak: (line) =>
          new Promise<boolean>((resolve) => {
            said.push(line.name);
            if (isEver) ends.push(() => resolve(true));
          }),
        isHeard: true,
        onError: (message) => {
          throw new Error(message);
        },
      });
      runtime.start();
      return { runtime, said, ends };
    };
    const title = lineSeconds({ phrases: { en: ["Two numbers"] } });
    // Its sound tells it ended, sooner or later than its length: the next line follows.
    const told = heard(true);
    told.runtime.settle(title + GRACE - 0.1, true);
    expect(told.said).toEqual(["title"]);
    told.ends[0]?.();
    await Promise.resolve();
    told.runtime.settle(5, true);
    expect(told.said).toEqual(["title", "ask"]);
    // A sound that never tells (it hung): the board ends the line at its length + GRACE.
    const hung = heard(false);
    hung.runtime.settle(title + GRACE + BREATH + 0.1, true);
    expect(hung.said).toEqual(["title", "ask"]);
  });

  it("a sound in turn holds the voice: the words after it wait its length, then a breath", async () => {
    // The question's own wrong takes a turn; its option's note is said after it.
    const board = scene({
      pieces: { ask },
      cues: { note: cue(t("Not that one.", "वह नहीं।"), { when: "ask.checked" }) },
    }).build("held");
    const said: string[] = [];
    const runtime = new BoardRuntime(board.board, (type) => propLibrary[type], {
      locale: "en",
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => {
        said.push(line.name);
        return true;
      },
      playSound: (sound) => {
        said.push(`(${sound.name})`);
        return { done: Promise.resolve(), stop: () => undefined };
      },
      isHeard: true,
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    runtime.settle(5, true);
    said.length = 0;
    await runtime.call("ask", "select", { option: "house" }, Actor.Learner);
    await runtime.call("ask", "check", {}, Actor.Learner);
    // The buzz plays; the note waits for the buzz's length (its file's), then a breath.
    runtime.settle(wrongSound.seconds + BREATH - 0.05, true);
    expect(said).toEqual(["(wrong)"]);
    runtime.settle(0.1, true);
    expect(said).toEqual(["(wrong)", "note"]);
  });

  it("plays sound cues at signals: a prop's own, and the lesson's (replacing, silencing, lasting)", async () => {
    const walking = (cues?: Record<string, Cue>) =>
      scene({
        pieces: {
          plane: place(coordinatePlane, {
            walker: { walkFrom: { x: 0, y: 0 }, at: { x: 0, y: 0 } },
          }),
          ask,
        },
        ...(cues === undefined ? {} : { cues }),
      }).build("walking");
    const effectsOf = async (built: ReturnType<typeof walking>, stopped: string[] = []) => {
      const played: string[] = [];
      const runtime = new BoardRuntime(built.board, (type) => propLibrary[type], {
        locale: "en",
        lineSeconds,
        now: () => 0,
        frame: () => () => undefined,
        speak: async () => true,
        playSound: (e) => {
          played.push(e.name);
          return { done: Promise.resolve(), stop: () => void stopped.push(e.name) };
        },
        onError: (message) => {
          throw new Error(message);
        },
      });
      runtime.start();
      await runtime.call("plane", "walker.step", { direction: "right" }, Actor.Learner);
      runtime.settle(1, true);
      await runtime.call("ask", "select", { option: "house" }, Actor.Learner);
      await runtime.call("ask", "check", {}, Actor.Learner);
      runtime.settle();
      expect(runtime.heard().flatMap((h) => ("sound" in h ? [h.sound] : []))).toEqual(played);
      return played;
    };
    // The props' own: the walker's step, and the question's wrong.
    expect(await effectsOf(walking())).toEqual(["step", "wrong"]);
    // The lesson's: a tap for each step instead; silence for the step (the question's own stays).
    expect(
      await effectsOf(walking({ tap: cue(tapSound, { when: "plane.walker.stepped" }) })),
    ).toEqual(["tap", "wrong"]);
    expect(
      await effectsOf(walking({ quiet: cue(null, { when: "plane.walker.stepped" }) })),
    ).toEqual(["wrong"]);
    // Only at the moment it names: a step that lands elsewhere keeps the prop's own.
    expect(
      await effectsOf(
        walking({
          tap: cue(tapSound, { when: "plane.walker.stepped", where: { x: 5, y: 5 } }),
        }),
      ),
    ).toEqual(["step", "wrong"]);
    // A lasting sound plays from its moment until the next, and stops then.
    const stopped: string[] = [];
    expect(
      await effectsOf(
        walking({ hum: cue(appear, { when: "board.started", until: "plane.walker.stepped" }) }),
        stopped,
      ),
    ).toEqual(["appear", "step", "wrong"]);
    expect(stopped).toEqual(["appear"]);
  });

  it("refuses a sound cue at no signal, one that isn't a sound, or a where its signal doesn't carry", () => {
    expect(() =>
      scene({ pieces: { ask }, cues: { x: cue(tapSound, { when: "ask.landed" }) } }).build("bad"),
    ).toThrow(/"ask.landed" isn't a signal here/);
    expect(() => scene({ pieces: { ask }, cues: { x: cue(tapSound) } }).build("bad")).toThrow(
      /it needs a when/,
    );
    expect(() =>
      scene({
        pieces: { ask },
        cues: { x: { sound: "boom" as never, when: "ask.checked" } },
      }).build("bad"),
    ).toThrow(/isn't a sound/);
    expect(() =>
      scene({
        pieces: { ask },
        cues: { x: cue(tapSound, { when: "ask.checked", where: { nothing: 1 } }) },
      }).build("bad"),
    ).toThrow(/isn't what ask.checked carries/);
    // A cue is words or a sound, one of them, with only what its kind has.
    const bad = (x: unknown) => () =>
      scene({ pieces: { ask }, cues: { x: x as never } }).build("bad");
    expect(bad({ when: "ask.checked" })).toThrow(/give it words .* or a sound/);
    expect(bad(cue(undefined as never))).toThrow(/give it words .* or a sound/);
    expect(bad({ says: t("x", "x"), sound: tapSound })).toThrow(/one of them/);
    expect(bad({ says: t("x", "x"), when: "ask.checked", until: "board.passed" })).toThrow(
      /words don't last/,
    );
    expect(bad({ sound: tapSound, when: "ask.checked", speaker: "riya" })).toThrow(
      /a sound has no speaker/,
    );
    expect(bad({ sound: tapSound, when: "ask.checked", if: () => true })).toThrow(
      /a sound has no if/,
    );
    expect(bad(cue(tapSound, { when: "ask.checked", until: "ask.checked" }))).toThrow(
      /can't last until the moment it starts/,
    );
  });

  it("the student can hear the screen again: what is showing now, from the top", () => {
    const screen = scene({
      pieces: {
        title: place(text, { text: t("Two numbers", "दो संख्याएँ") }),
        found: hidden(place(text, { text: t("Found it.", "मिल गया।") })),
        later: hidden(place(text, { text: t("Not yet.", "अभी नहीं।") })),
      },
    }).build("screen");
    const said: string[] = [];
    const runtime = new BoardRuntime(screen.board, (type) => propLibrary[type], {
      locale: "en",
      lineSeconds,
      now: () => 0,
      frame: () => () => undefined,
      speak: async (line) => {
        said.push(line.name);
        return true;
      },
      onError: (message) => {
        throw new Error(message);
      },
    });
    runtime.start();
    void runtime.call("board", "show", { name: "found" });
    runtime.settle();
    said.length = 0;
    void runtime.call("board", "hearAgain", {}, Actor.Learner);
    runtime.settle();
    expect(said).toEqual(["title", "found"]);
  });

  it("refuses a line on Continue (nothing is heard after it) and a piece named board", () => {
    expect(() =>
      scene({
        pieces: { ask },
        cues: { x: cue(t("x", "x"), { when: "board.continued" }) },
      }).build("bad"),
    ).toThrow(/when "board.continued"/);
    expect(() => scene({ pieces: { board: ask } }).build("bad")).toThrow(/can't be named "board"/);
  });

  it("a line about something not on the board is refused; a part inside a piece is fine", () => {
    expect(() =>
      scene({ pieces: { ask }, cues: { x: cue(t("x", "x"), { about: "nowhere" }) } }).build("bad"),
    ).toThrow(/about "nowhere" isn't a piece here/);
    expect(() =>
      scene({ pieces: { ask }, cues: { x: cue(t("x", "x"), { about: "ask.nothing" }) } }).build(
        "bad",
      ),
    ).toThrow(/about "ask.nothing"/);
  });

  it("a moment that isn't a signal here is refused when the board is built", () => {
    expect(() =>
      scene({ pieces: { ask }, cues: { x: cue(t("x", "x"), { when: "ask.landed" }) } }).build(
        "bad",
      ),
    ).toThrow(/when "ask.landed" isn't a signal of a piece here/);
  });
});

describe("what is recorded", () => {
  it("the student's taps are causes; what the rules do follows from them, and so do signals", () => {
    const entries: {
      seq: number;
      kind: string;
      actor: string;
      payload: Record<string, unknown>;
    }[] = [];
    const runtime = new BoardRuntime(board.board, (type) => propLibrary[type], {
      locale: "en",
      lineSeconds,
      now: () => 0,
      frame: () => () => undefined,
      speak: async () => true,
      onError: (message) => {
        throw new Error(message);
      },
    });
    const recorder = recordBoard(
      runtime,
      (entry) => {
        const seq = entries.length;
        entries.push({ seq, ...(entry as Omit<(typeof entries)[number], "seq">) });
        return seq;
      },
      "test",
    );
    runtime.start();
    runtime.settle();
    void runtime.call("ask", "select", { option: "street" }, Actor.Learner);
    void runtime.call("ask", "check", {}, Actor.Learner);
    runtime.settle();
    recorder.close?.();
    const causes = entries.filter((e) => e.kind === "cause" && e.actor === Actor.Learner);
    expect(causes.map((e) => e.payload.action)).toEqual(["select", "check"]);
    // The board's rule showing "found" is the check's consequence, not a cause of its own.
    expect(entries.some((e) => e.kind === "cause" && e.payload.action === "show")).toBe(false);
    const correct = entries.find((e) => e.kind === "signal" && e.payload.signal === "correct");
    expect(correct?.payload.from).toBe(causes[1]?.seq);
  });
});
