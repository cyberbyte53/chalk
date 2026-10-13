import { resolve } from "node:path";
import { scriptedProvider } from "@chalk/jugnu";
import { describe, expect, it } from "vitest";
import students from "../../evals/students.json";
import { openBoard } from "./run";
import { Outcome, simulate, studentTools, studentView } from "./simulate";
import { studentsSchema } from "./students";

const root = resolve(new URL(".", import.meta.url).pathname, "../../..");
const all = studentsSchema.parse(students).students;
const byId = (id: string) => {
  const found = all.find((s) => s.id === id);
  if (found === undefined) throw new Error(`no student ${id}`);
  return found;
};

describe("simulated students", () => {
  it("every profile is on a real board with a question", () => {
    expect(new Set(all.map((s) => s.id)).size).toBe(all.length);
    for (const student of all) {
      const { runtime, stop } = openBoard(root, student.lesson, student.board, student.locale);
      expect(
        runtime.propNames().some((n) => runtime.getDef(n).role === "question"),
        student.id,
      ).toBe(true);
      expect(
        studentTools(runtime).some((t) => t.name.endsWith("__check")),
        student.id,
      ).toBe(true);
      stop();
    }
  });

  it("see only what's on screen, and do only what a finger can", () => {
    const { runtime, stop } = openBoard(
      root,
      "studio/evals/boards/published/jugnu-boards.json",
      "decimalPeriod",
      "en",
    );
    const view = JSON.stringify(studentView(runtime, "en"));
    expect(view).toContain('"digits":"14"');
    // The answer key and what the screen doesn't show stay hidden.
    expect(view).not.toContain('"answer"');
    expect(view).not.toContain("repeatLength");
    const names = studentTools(runtime).map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "division__nextDigit",
        "howMany__select",
        "howMany__check",
        "give_up",
      ]),
    );
    expect(names).not.toContain("division__completeDivision");
    stop();
  });

  it("play a whole conversation with Jugnu: ask, get help, act, check", async () => {
    const student = scriptedProvider([
      { say: "where is root 2??" },
      { call: [{ name: "line__moveMarker", args: { to: 1.414 } }, { name: "guessRoot__check" }] },
      { say: "Because 1.414 times itself is about 2." },
    ]);
    const jugnu = scriptedProvider([
      {
        say: "What is 1.5 × 1.5? Try a little left.",
        call: [{ name: "wait_for_student", args: { watch: ["line"] } }],
      },
    ]);
    const c = await simulate({
      root,
      student: byId("root2-halfway"),
      run: 1,
      withJugnu: true,
      jugnu,
      studentModel: student,
      judgeModel: undefined,
    });
    expect(c.outcome).toBe(Outcome.Solved);
    expect(c.metrics.solvedInRound).toBe(2);
    expect(c.metrics.jugnuTurns).toBe(1);
    expect(c.metrics.tools.wait).toBe(1);
    expect(c.explanation).toBe("Because 1.414 times itself is about 2.");
    // The student saw what Jugnu said, not his internals.
    const second = student.requests[1]?.messages[1]?.content ?? "";
    expect(second).toContain("Jugnu: What is 1.5 × 1.5?");
    expect(second).not.toContain("isMet");
  });

  it("without Jugnu (the baseline), nobody answers", async () => {
    const student = scriptedProvider([
      { say: "hmm" },
      { call: [{ name: "give_up" }] },
      { say: "no idea" },
    ]);
    const c = await simulate({
      root,
      student: byId("root2-halfway"),
      run: 1,
      withJugnu: false,
      jugnu: scriptedProvider([{ say: "never called" }]),
      studentModel: student,
      judgeModel: undefined,
    });
    expect(c.outcome).toBe(Outcome.GaveUp);
    expect(c.metrics.jugnuTurns).toBe(0);
  });
});
