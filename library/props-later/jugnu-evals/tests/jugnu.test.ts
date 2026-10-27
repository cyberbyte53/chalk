import { Actor, lessonSchema } from "@chalk/content";
import {
  JugnuSession,
  type ScriptedReply,
  boardJson,
  jugnuTools,
  jugnuTurn,
  scriptedProvider,
} from "@chalk/jugnu";
import { BoardRuntime, type RuntimeServices, headlessBoard } from "@chalk/player";
import { BOARD } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import coinLesson from "../../../platform/studio/evals/boards/does-a-coin-settle.json";
import rootTwo from "../../../platform/studio/evals/boards/where-is-root-2.json";
import { propDefs } from "./index";

// Jugnu on real boards, with a stand-in model playing his part.

const guess = lessonSchema.parse(rootTwo).boards[1];
if (guess === undefined) throw new Error("no guess board");

const errors: string[] = [];
const services: RuntimeServices = {
  now: () => 0,
  frame: () => () => {},
  speak: async () => {},
  onError: (message) => errors.push(message),
};
const place = { lessonTitle: "Where does √2 live?", boardNumber: 2, boardCount: 4 } as const;
const en = { ...place, locale: "en" } as const;
const start = () => new BoardRuntime(guess, (type) => propDefs[type], services);
const lastToolResult = (messages: readonly { role: string; content: string }[]) =>
  [...messages].reverse().find((m) => m.role === "tool")?.content ?? "";

/** His reply, as the model writes it (strict: every field there). */
const reply = (
  steps: Record<string, unknown>[],
  end: Record<string, unknown> | null = null,
): ScriptedReply => ({ call: [{ name: "reply", args: { steps, end } }] });
const say = (text: string) => ({ say: text });
const show = (call: string, args: Record<string, unknown>) => ({ show: { call, args } });
const point = (prop: string, part: string | null = null) => ({ point: { prop, part } });

describe("what Jugnu is given", () => {
  it("the board as the student sees it: each prop's elements, what's hidden apart, and the lesson's rules", () => {
    const runtime = start();
    const json = boardJson(runtime, en);
    const props = json.props as Record<
      string,
      {
        type: string;
        is?: string;
        elements: Record<string, unknown>;
        hidden?: Record<string, unknown>;
      }
    >;
    expect(props.line?.elements).toMatchObject({ marker: 1.5, axis: "1 to 2", "tick:1.4": "1.4" });
    expect(props.line?.is).toBe("a number line from 1 to 2 (ticks every 0.1), the dot at 1.5");
    expect(props.guessRoot).toMatchObject({ type: "goal", role: "question" });
    expect(props.guessRoot?.elements.prompt).toBe("Press Check when the square is close to 2.");
    // What the prop knows but the screen doesn't show is labelled, apart.
    expect(props.guessRoot?.hidden).toEqual({ isMet: false });
    expect(props.guessRoot?.elements.isMet).toBeUndefined();
    expect(props.squareLabel?.elements.text).toBe("1.50 × 1.50 = 2.2500");
    expect(json.isQuestionOpen).toBe(true);
    const rules = json.rules as { is: { set: string; to?: string }[]; when: unknown[] };
    expect(rules.is).toContainEqual({
      set: "guessRoot.isMet",
      to: "1.98 <= line.marker * line.marker and line.marker * line.marker <= 2.02",
    });
    expect(JSON.stringify(rules.when)).toContain("Its square is less than 2. Move right.");
    const actions = json.yourActions as Record<string, string>;
    expect(actions["line.magnify"]).toMatch(/Zoom ten times/);
    // Never the question, the board, or the lesson's lines.
    expect(Object.keys(actions).some((a) => a.startsWith("guessRoot.") || a.endsWith(".say"))).toBe(
      false,
    );
  });

  it("three tools: try and calculate to think, reply to answer; typed and strict", () => {
    const tools = jugnuTools(start());
    expect(tools.specs.map((t) => t.name)).toEqual(["try", "calculate", "reply"]);
    expect(tools.isStrict).toBe(true);
    expect(tools.specs.every((t) => t.strict === true)).toBe(true);
    // Each action is a typed choice: its name, and its own arguments.
    const calls = JSON.stringify(tools.specs[0]?.parameters);
    expect(calls).toContain('"enum":["line.moveMarker"]');
    expect(calls).toContain('"to":{"type":"number"}');
    expect(calls).not.toContain("guessRoot.check");
    expect(calls).not.toContain(`${BOARD}.`);
    // An optional argument is "or null" in a strict schema (placeMark's colour).
    expect(calls).toMatch(/"color":\{"anyOf":\[.*\{"type":"null"\}\]\}/);
  });

  it("what the lesson wrote for him: what the board is for, what each prop stands for", async () => {
    const model = scriptedProvider([reply([say("ok")])]);
    await new JugnuSession(start(), model, en).ask("hi");
    const system = model.requests[0]?.messages[0]?.content ?? "";
    expect(system).toContain('"purpose": "Estimate √2 by squeezing');
    expect(system).toContain('"standsFor": "the student\'s guess for √2 (the marker)"');
  });

  it("the system message and tools are the same however the board moves (so they cache)", async () => {
    const runtime = start();
    const model = scriptedProvider([reply([say("ok")])]);
    const session = new JugnuSession(runtime, model, en);
    await session.ask("one");
    await runtime.call("line", "moveMarker", { to: 1.8 }, Actor.Learner);
    await session.ask("two");
    const [first, second] = model.requests;
    expect(second?.messages[0]).toEqual(first?.messages[0]);
    expect(JSON.stringify(second?.tools)).toBe(JSON.stringify(first?.tools));
    // The board now comes in the turn's opening, which is added to the chat, never rewritten.
    expect(second?.messages.at(-1)?.content).toContain('"marker":1.8');
    expect(second?.messages[1]).toEqual(first?.messages[1]);
  });
});

describe("a turn", () => {
  it("thinks out of sight, then sends one reply: words, a move to watch, a glow", async () => {
    const runtime = start();
    const model = scriptedProvider([
      {
        call: [{ name: "try", args: { calls: [{ call: "line.moveMarker", args: { to: 1.4 } }] } }],
      },
      (request) =>
        lastToolResult(request.messages).includes('"marker":1.4')
          ? reply([
              show("line.moveMarker", { to: 1.4 }),
              say("At 1.4 the square is 1.96: more or less than 2?"),
              point("squareLabel"),
            ])
          : reply([say("?")]),
    ]);
    const events: string[] = [];
    const session = new JugnuSession(runtime, model, en, {
      onEvent: (event) => {
        events.push(event.kind);
      },
    });
    const turn = await session.ask("I'm stuck");
    expect(turn.cues).toEqual([
      { kind: "act", prop: "line", action: "moveMarker", args: { to: 1.4 } },
      { kind: "say", text: "At 1.4 the square is 1.96: more or less than 2?" },
      { kind: "point", prop: "squareLabel" },
    ]);
    expect(turn.reply).toBe("At 1.4 the square is 1.96: more or less than 2?");
    expect(turn.modelCalls).toBe(2);
    expect(events).toEqual(["act", "say", "point"]);
    // Played here, through the one door, as his: not the student's own work.
    expect(runtime.getView("line").marker).toBe(1.4);
    expect(runtime.isTouched("line")).toBe(false);
  });

  it("try shows what the student would see change, and leaves the board as it was", async () => {
    const runtime = start();
    const model = scriptedProvider([
      {
        call: [
          { name: "try", args: { calls: [{ call: "line.moveMarker", args: { to: 1.414 } }] } },
        ],
      },
      (request) =>
        reply([
          say(
            lastToolResult(request.messages).includes("1.9994")
              ? "Get close to 2 yourself."
              : "Look!",
          ),
        ]),
    ]);
    const turn = await new JugnuSession(runtime, model, en).ask("show me");
    // The square label is what the student would see change; the goal's isMet stays hidden.
    expect(turn.events[0]).toMatchObject({
      kind: "try",
      changed: { line: { marker: 1.414 }, squareLabel: { text: { en: "1.41 × 1.41 = 1.9994" } } },
    });
    expect(JSON.stringify(turn.events[0])).not.toContain("isMet");
    expect(turn.cues).toEqual([{ kind: "say", text: "Get close to 2 yourself." }]);
    expect(runtime.getView("line").marker).toBe(1.5);
  });

  it("calculates exactly, reading board values by name", async () => {
    const model = scriptedProvider([
      { call: [{ name: "calculate", args: { expression: "line.marker * line.marker - 2" } }] },
      reply([say("ok")]),
    ]);
    const turn = await new JugnuSession(start(), model, en).ask("how far off?");
    expect(turn.events[0]).toEqual({
      kind: "calculate",
      expression: "line.marker * line.marker - 2",
      result: 0.25,
    });
    expect(lastToolResult(model.requests[1]?.messages ?? [])).toBe('{"result":0.25}');
  });

  it("what he shows is his call: a move that lands on the answer goes through", async () => {
    const runtime = start();
    const model = scriptedProvider([
      reply([show("line.moveMarker", { to: 1.414 }), say("There!")]),
    ]);
    const turn = await new JugnuSession(runtime, model, en).ask("put it on root 2");
    expect(turn.cues[0]).toMatchObject({ kind: "act", action: "moveMarker" });
    expect(runtime.getView("line").marker).toBe(1.414);
    // The student still has to press Check themselves.
    expect(runtime.getView("guessRoot").status).not.toBe("correct");
  });

  it("can't do what's the student's: the reply goes back with the reason", async () => {
    const model = scriptedProvider([
      reply([show("guessRoot.check", {})]),
      reply([point("line", "elbow")]),
      reply([say("Zoom in and look closely.")]),
    ]);
    const runtime = start();
    const turn = await new JugnuSession(runtime, model, en).ask("just press check");
    const refused = turn.events.map((e) => ("refused" in e ? e.refused : undefined));
    expect(refused[0]).toMatch(/only the student answers it/);
    expect(refused[1]).toMatch(/nothing called "elbow"/);
    expect(runtime.getView("guessRoot").attempts).toBe(0);
    expect(turn.reply).toBe("Zoom in and look closely.");
    expect(turn.modelCalls).toBe(3);
  });

  // Reply chips are off for now (no `ask` options): kept for when they come back.
  it.skip("asks with options; the student's tap starts the next turn", async () => {
    const model = scriptedProvider([
      reply([say("1.3² is 1.69 and 1.6² is 2.56.")], {
        ask: { question: "So where is √2?", options: ["Left of 1.3", "Between them"] },
      }),
      (request) =>
        reply([
          say(
            request.messages.at(-1)?.content.includes('tapped your option: "Between them"')
              ? "Yes! Try the middle."
              : "?",
          ),
        ]),
    ]);
    const session = new JugnuSession(start(), model, en);
    const first = await session.ask("where is it");
    expect(first.options).toEqual(["Left of 1.3", "Between them"]);
    expect(first.reply).toBe("1.3² is 1.69 and 1.6² is 2.56. So where is √2?");
    const second = await session.choose("Between them");
    expect(second.reply).toBe("Yes! Try the middle.");
  });

  it.skip("refuses options that aren't options", async () => {
    const model = scriptedProvider([
      reply([say("Hmm.")], { ask: { question: "Which?", options: ["only one"] } }),
      reply([say("Which side is it on?")]),
    ]);
    const turn = await new JugnuSession(start(), model, en).ask("?");
    expect(turn.events[0]).toMatchObject({ kind: "ask", refused: "give 2 to 4 options" });
    expect(turn.options).toEqual([]);
    expect(turn.cues).toEqual([{ kind: "say", text: "Which side is it on?" }]);
  });

  it("ends quiet: the board is the student's, and the next turn sees where they left it", async () => {
    const runtime = start();
    const model = scriptedProvider([
      reply([say("Try moving the dot a little left.")]),
      (request) =>
        reply([
          say(
            request.messages.at(-1)?.content.includes('"marker":1.45')
              ? "Good, 1.45. What's its square?"
              : "?",
          ),
        ]),
    ]);
    const session = new JugnuSession(runtime, model, en);
    const first = await session.ask("help");
    expect(first.options).toEqual([]);
    await runtime.call("line", "moveMarker", { to: 1.45 }, Actor.Learner);
    const next = await session.ask("now?");
    expect(next.reply).toBe("Good, 1.45. What's its square?");
    // The chat stays whole: every tool call has its answer.
    expect(model.requests[1]?.messages.map((m) => m.role)).toEqual([
      "system",
      "user",
      "assistant",
      "tool",
      "user",
    ]);
  });

  it("hears what the student held to ask about, in the names he points with", async () => {
    const model = scriptedProvider([reply([say("That's the dot.")])]);
    const session = new JugnuSession(start(), model, en);
    await session.ask("what's this?", [
      { prop: "line", part: "marker" },
      { prop: "guessRoot", text: "Check" },
      { prop: "line", part: "nothingHere" },
      { prop: "nope" },
    ]);
    const opening = model.requests[0]?.messages.at(-1)?.content ?? "";
    expect(opening).toContain(
      'held these on the board to ask about them: line · marker; guessRoot (where they held it reads "Check"); line.',
    );
    expect(opening).not.toContain("nope");
  });

  it("the last step must be a reply; plain words count as one", async () => {
    const model = scriptedProvider([
      { call: [{ name: "calculate", args: { expression: "1+1" } }] },
    ]);
    const turn = await new JugnuSession(start(), model, en, { maxSteps: 3 }).ask("show me");
    expect(turn.modelCalls).toBe(3);
    expect(model.requests[2]?.toolChoice).toEqual({ name: "reply" });
    expect(turn.isFallback).toBe(true);
    const words = scriptedProvider([{ say: "Look at the dot." }]);
    const plain = await new JugnuSession(start(), words, en).ask("hi");
    expect(plain.cues).toEqual([{ kind: "say", text: "Look at the dot." }]);
  });

  it("sees where things are now, not the moves that got there; keeps the chat; answers in Hindi", async () => {
    const runtime = start();
    const model = scriptedProvider([reply([say("ठीक है")])]);
    const session = new JugnuSession(runtime, model, { ...place, locale: "hi" });
    await runtime.call("line", "moveMarker", { to: 1.6 }, Actor.Learner);
    await runtime.call("line", "moveMarker", { to: 1.7 }, Actor.Learner);
    await session.ask("पहला सवाल");
    await session.ask("दूसरा सवाल");
    const first = model.requests[0]?.messages ?? [];
    const second = model.requests[1]?.messages ?? [];
    expect(second[0]?.content).toContain("Hindi, in Devanagari");
    expect(first[1]?.content).toContain('"marker":1.7');
    expect(first[1]?.content).not.toContain("moveMarker");
    expect(second.map((m) => m.role)).toEqual(["system", "user", "assistant", "tool", "user"]);
  });

  it("what he tried stays out of sight: the next turn's board shows only what he showed", async () => {
    const model = scriptedProvider([
      {
        call: [
          {
            name: "try",
            args: { calls: [{ call: "line.zoomTo", args: { from: 1, to: 3, over: 0 } }] },
          },
        ],
      },
      reply([show("line.placeMark", { at: 1.2, label: "a", color: null }), say("See a.")]),
      reply([say("ok")]),
    ]);
    const session = new JugnuSession(start(), model, en);
    await session.ask("one");
    await session.ask("two");
    const opening = model.requests.at(-1)?.messages.at(-1)?.content ?? "";
    expect(opening).toContain('"mark:a":1.2');
    expect(opening).toContain('"axis":"1 to 2"');
  });

  it("forgets a turn the model failed, so the next one starts clean", async () => {
    let calls = 0;
    const flaky = {
      ...scriptedProvider([{ say: "hi" }]),
      chat: async () => {
        calls++;
        if (calls === 1) throw new Error("server down");
        return { content: "hi", toolCalls: [] };
      },
    };
    const session = new JugnuSession(start(), flaky, en);
    await expect(session.ask("one")).rejects.toThrow("server down");
    const turn = await session.ask("two");
    expect(turn.reply).toBe("hi");
  });

  it("works a turn out on a copy with no screen, as the server does", async () => {
    const phone = start();
    await phone.call("line", "moveMarker", { to: 1.3 }, Actor.Learner);
    const copy = headlessBoard(guess, (type) => propDefs[type], phone.save());
    const model = scriptedProvider([
      {
        call: [{ name: "try", args: { calls: [{ call: "line.magnify", args: { value: 1.3 } }] } }],
      },
      (request) =>
        lastToolResult(request.messages).includes('"axis":"1.3 to 1.4"')
          ? reply([show("line.magnify", { value: 1.3 }), say("Zoomed.")])
          : reply([say("?")]),
    ]);
    const result = await jugnuTurn(copy.runtime, model, en, {
      chat: [],
      input: { kind: "typed", text: "zoom" },
      settle: copy.settle,
    });
    expect(result.cues).toEqual([
      { kind: "act", prop: "line", action: "magnify", args: { value: 1.3 } },
      { kind: "say", text: "Zoomed." },
    ]);
    expect(result.chat.map((m) => m.role)).toEqual([
      "user",
      "assistant",
      "tool",
      "assistant",
      "tool",
    ]);
    // The phone's board hasn't moved; it will when it plays the cues.
    expect(phone.getView("line").from).toBe(1);
    copy.dispose();
  });
});

describe("what his moves set off", () => {
  it("the lesson's rules still answer him, but never move the board on", async () => {
    const lesson = lessonSchema.parse(coinLesson);
    const board = lesson.boards[0];
    if (board === undefined) throw new Error("no board");
    let now = 0;
    let pending: ((now: number) => void)[] = [];
    const timed: RuntimeServices = {
      now: () => now,
      frame: (callback) => {
        pending.push(callback);
        return () => {
          pending = pending.filter((c) => c !== callback);
        };
      },
      speak: async () => {},
      onError: (message) => errors.push(message),
    };
    const runtime = new BoardRuntime(board, (type) => propDefs[type], timed);
    runtime.start();
    await runtime.perform({ call: "tossMany.press" }, Actor.Jugnu);
    for (let t = 0; t < 6000; t += 16) {
      now += 16;
      const due = pending;
      pending = [];
      for (const callback of due) callback(now);
      for (let i = 0; i < 5; i++) await Promise.resolve();
    }
    // The timer he started tossed the coin 100 times and the lesson showed its line...
    expect(runtime.getView("coin").count).toBe(100);
    expect(runtime.isHidden("mayaSettles")).toBe(false);
    // ...but the board didn't pass: that takes the student's own tosses.
    expect(runtime.getView(BOARD).isPassed).toBe(false);
  });
});
