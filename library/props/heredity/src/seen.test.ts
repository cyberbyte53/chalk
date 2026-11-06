import { type PropView, checkProp, describeView } from "@chalk/player";
import { Board } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { peaCrossProp } from "./index";
import { Gene } from "./pea-cross";

const { Tall: T, Short: t } = Gene;

/** The cross placed with these fields, played to its end, as the student sees it. */
function seen(
  given: Readonly<Record<string, unknown>> = {},
  send?: [string, Record<string, unknown>],
) {
  const board = new Board(peaCrossProp.def, given as never);
  if (send !== undefined) board.send("", send[0], send[1]);
  board.runUntilIdle();
  const d = describeView(peaCrossProp, board.read() as unknown as PropView);
  return {
    ...d,
    ids: d.elements.map((e) => e.id),
    at: (id: string) => d.elements.find((e) => e.id === id),
  };
}

describe("what the student sees", () => {
  it("every input says what it does, and every student action is offered", () => {
    expect(
      checkProp(peaCrossProp, [
        {},
        { grown: 4 },
        { grown: 4, chosen: [0, 2] },
        {
          parents: [
            [T, t],
            [T, t],
          ],
          generation: 1,
          grown: 4,
          chosen: [1],
        },
      ]),
    ).toEqual([]);
  });

  it("before the cross: the two parents and what each gives, and Cross", () => {
    const s = seen();
    expect(s.at("parent1")).toMatchObject({ value: "TT", words: "tall TT" });
    expect(s.at("parent2")).toMatchObject({ value: "tt", words: "short tt" });
    expect(s.at("gives1")?.value).toEqual(["T", "T"]);
    expect(s.at("gives2")?.value).toEqual(["t", "t"]);
    expect(s.ids).toContain("crossParents");
    expect(s.ids).not.toContain("choose:0");
    expect(s.ids).not.toContain("ratio");
  });

  it("F1: four tall children, each Tt, to tap; all tall", () => {
    const s = seen({}, ["cross", { seconds: 2 }]);
    expect([0, 1, 2, 3].map((k) => s.at(`choose:${k}`)?.value)).toEqual(["Tt", "Tt", "Tt", "Tt"]);
    expect(s.at("ratio")).toMatchObject({ value: { tall: 4, short: 0 }, words: "all tall" });
    expect(s.at("crossChosen")?.isOff).toBe(true);
  });

  it("F2: 3 tall : 1 short, in English and Hindi", () => {
    const given = {
      parents: [
        [T, t],
        [T, t],
      ],
      generation: 1,
    };
    const s = seen(given, ["cross", { seconds: 2 }]);
    expect(s.at("ratio")).toMatchObject({
      value: { tall: 3, short: 1 },
      words: "3 tall : 1 short",
    });
    expect(s.at("choose:3")?.value).toBe("tt");
    const board = new Board(peaCrossProp.def, { ...given, grown: 4 } as never);
    const hi = describeView(peaCrossProp, board.read() as unknown as PropView, "hi");
    expect(hi.elements.find((e) => e.id === "ratio")?.words).toBe("3 लंबे : 1 बौने");
  });
});
