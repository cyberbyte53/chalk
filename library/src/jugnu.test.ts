import { Actor, lessonSchema } from "@chalk/content";
import { JugnuSession, type JugnuStep, boardJson, scriptedProvider, toolsFor } from "@chalk/jugnu";
import { BoardRuntime, type RuntimeServices } from "@chalk/player";
import { BOARD } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import coinLesson from "../../content/class8-maths/ch4-data-handling/published/does-a-coin-settle.json";
import rootTwo from "../../studio/evals/boards/published/where-is-root-2.json";
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
const toolNames = (runtime: BoardRuntime) => toolsFor(runtime).map((tool) => tool.name);
const lastToolResult = (messages: readonly { role: string; content: string }[]) =>
  [...messages].reverse().find((m) => m.role === "tool")?.content ?? "";

describe("what Jugnu is given", () => {
  it("the whole board as data: every prop's state, the question included, and the lesson's rules", () => {
    const runtime = start();
    const json = boardJson(runtime, en, []);
    const props = json.props as Record<string, { type: string; state: Record<string, unknown> }>;
    expect(props.line?.state).toMatchObject({ marker: 1.5, from: 1, to: 2 });
    expect(props.guessRoot).toMatchObject({ type: "goal", role: "question" });
    expect(props.guessRoot?.state.prompt).toBe("Press Check when the square is close to 2.");
    expect(props.squareLabel?.state.text).toBe("1.50 × 1.50 = 2.2500");
    expect(json.isQuestionOpen).toBe(true);
    const rules = json.rules as { is: { set: string; to?: string }[]; when: unknown[] };
    expect(rules.is).toContainEqual({
      set: "guessRoot.isMet",
      to: "1.98 <= line.marker * line.marker and line.marker * line.marker <= 2.02",
    });
    expect(JSON.stringify(rules.when)).toContain("Its square is less than 2. Move right.");
  });

  it("a tool for each action he may use now, plus point, calculate and wait_for_student", () => {
    const names = toolNames(start());
    expect(names).toContain("line__moveMarker");
    expect(names).toContain("line__zoomTo");
    expect(names).toEqual(expect.arrayContaining(["point", "calculate", "wait_for_student"]));
    // Never the question, the board, or the lesson's lines.
    expect(names.some((n) => n.startsWith("guessRoot__") || n.startsWith(`${BOARD}__`))).toBe(
      false,
    );
    expect(names).not.toContain("title__say");
    const move = toolsFor(start()).find((tool) => tool.name === "line__moveMarker");
    expect(move?.parameters).toMatchObject({
      type: "object",
      properties: { to: { type: "number" } },
      required: ["to"],
    });
  });
});

describe("the loop", () => {
  it("acts through the one door, sees what changed, then talks about it", async () => {
    const runtime = start();
    const model = scriptedProvider([
      { call: [{ name: "line__moveMarker", args: { to: 1.4 } }] },
      (request) => ({
        say: lastToolResult(request.messages).includes("1.96")
          ? "I put the dot at 1.4. Its square is 1.96: more or less than 2?"
          : "Hmm.",
      }),
    ]);
    const events: string[] = [];
    const session = new JugnuSession(runtime, model, en, {
      onEvent: (event) => events.push(event.kind),
    });
    const turn = await session.ask("I'm stuck");
    expect(turn.reply).toBe("I put the dot at 1.4. Its square is 1.96: more or less than 2?");
    expect(turn.modelCalls).toBe(2);
    expect(events).toEqual(["act", "say"]);
    expect(turn.events[0]).toMatchObject({
      kind: "act",
      prop: "line",
      action: "moveMarker",
      changed: { line: { marker: 1.4 } },
    });
    expect(runtime.getView("line").marker).toBe(1.4);
    // His move isn't the student's own work.
    expect(runtime.isTouched("line")).toBe(false);
    // Each step gets the board fresh: the second call already sees the dot at 1.4.
    expect(model.requests[1]?.messages[0]?.content).toContain('"marker": 1.4');
  });

  it("calculates exactly, reading board values by name", async () => {
    const model = scriptedProvider([
      { call: [{ name: "calculate", args: { expression: "line.marker * line.marker - 2" } }] },
      { say: "ok" },
    ]);
    const turn = await new JugnuSession(start(), model, en).ask("how far off?");
    expect(turn.events[0]).toEqual({
      kind: "calculate",
      expression: "line.marker * line.marker - 2",
      result: 0.25,
    });
    expect(lastToolResult(model.requests[1]?.messages ?? [])).toBe('{"result":0.25}');
  });

  it("points at a prop or a part by name, and says when there is no such part", async () => {
    const model = scriptedProvider([
      {
        call: [
          { name: "point", args: { prop: "line", part: "marker" } },
          { name: "point", args: { prop: "line", part: "elbow" } },
        ],
      },
      { say: "Look at the dot." },
    ]);
    const turn = await new JugnuSession(start(), model, en).ask("where?");
    expect(turn.events[0]).toEqual({ kind: "point", prop: "line", part: "marker" });
    expect(turn.events[1]).toMatchObject({
      kind: "point",
      refused: expect.stringMatching(/no part "elbow"/),
    });
  });

  it("can't do what's the student's, and hears why", async () => {
    const runtime = start();
    const model = scriptedProvider([
      {
        call: [
          { name: "guessRoot__check" },
          { name: "board__continue" },
          { name: "line__fly" },
          { name: "line__moveMarker", args: { to: "far" } },
        ],
      },
      { say: "Zoom in and look closely." },
    ]);
    const turn = await new JugnuSession(runtime, model, en).ask("just press check");
    const refused = turn.events.map((e) => ("refused" in e ? e.refused : undefined));
    expect(refused[0]).toMatch(/only the student answers it/);
    expect(refused[1]).toMatch(/no tool "board__continue"|the board itself/);
    expect(refused[2]).toMatch(/no tool "line__fly"/);
    expect(refused[3]).toBeDefined();
    expect(runtime.getView("guessRoot").attempts).toBe(0);
    expect(turn.reply).toBe("Zoom in and look closely.");
  });

  it("puts the board back if his move would answer the question for the student", async () => {
    const runtime = start();
    const model = scriptedProvider([
      { call: [{ name: "line__moveMarker", args: { to: 1.414 } }] },
      (request) => ({
        say: lastToolResult(request.messages).includes("put back") ? "Try it yourself." : "Done!",
      }),
    ]);
    const turn = await new JugnuSession(runtime, model, en).ask("put it on root 2");
    const step = turn.events[0] as JugnuStep & { kind: "act" };
    expect(step.isUndone).toBe(true);
    expect(runtime.getView("line").marker).toBe(1.5);
    expect(runtime.getView("guessRoot").isMet).toBe(false);
    expect(turn.reply).toBe("Try it yourself.");
  });

  it("hands the board back, hears the student's move, and goes on from it", async () => {
    const runtime = start();
    const model = scriptedProvider([
      {
        say: "Your turn: move the dot a little left.",
        call: [{ name: "wait_for_student", args: { watch: ["line"] } }],
      },
      (request) => ({
        say: request.messages[0]?.content.includes("student: line.moveMarker")
          ? "Good, 1.45. What's its square?"
          : "?",
      }),
    ]);
    const session = new JugnuSession(runtime, model, en);
    const first = await session.ask("help");
    expect(first.watching).toEqual(["line"]);
    expect(model.requests).toHaveLength(1);
    const moves: string[] = [];
    session.onStudentMove((prop) => moves.push(prop));
    await runtime.call("line", "moveMarker", { to: 1.45 }, Actor.Learner);
    expect(moves).toEqual(["line"]);
    const next = await session.continue();
    expect(next.asked).toBeUndefined();
    expect(next.reply).toBe("Good, 1.45. What's its square?");
    expect(next.watching).toEqual([]);
    // The chat stays whole: every tool call has its answer.
    expect(model.requests[1]?.messages.map((m) => m.role)).toEqual([
      "system",
      "user",
      "assistant",
      "tool",
      "user",
    ]);
  });

  it("stops after a few steps, with words", async () => {
    // An instant action, so the loop is about steps, not about waiting for a glide to finish.
    const model = scriptedProvider([
      { say: "Hmm.", call: [{ name: "line__moveMarker", args: { to: 1.5 } }] },
    ]);
    const turn = await new JugnuSession(start(), model, en, { maxSteps: 3 }).ask("show me");
    expect(turn.modelCalls).toBe(3);
    expect(model.requests[2]?.toolChoice).toBe("none");
    expect(turn.reply).toBe("Hmm. Hmm. Hmm.");
  });

  it("remembers what the student did and the chat so far, and answers in Hindi", async () => {
    const runtime = start();
    const model = scriptedProvider([{ say: "ठीक है" }]);
    const session = new JugnuSession(runtime, model, { ...place, locale: "hi" });
    await runtime.call("line", "moveMarker", { to: 1.6 }, Actor.Learner);
    await runtime.call("line", "moveMarker", { to: 1.7 }, Actor.Learner);
    await session.ask("पहला सवाल");
    await session.ask("दूसरा सवाल");
    const second = model.requests[1]?.messages ?? [];
    expect(second[0]?.content).toContain("Hindi, in Devanagari");
    // A drag is one line, with its last value.
    expect(second[0]?.content).toContain('student: line.moveMarker {\\"to\\":1.7} (×2)');
    expect(second.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"]);
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
