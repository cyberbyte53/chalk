import { describe, expect, it } from "vitest";
import { expectKitPiece } from "./kit-checks";
import {
  Beaker,
  Bubbles,
  Burner,
  ConicalFlask,
  Flame,
  FlameKind,
  SpiritLamp,
  TestTube,
  Tripod,
  tubeFillPath,
  tubeLevel,
} from "./lab";

describe("labware", () => {
  it.each([
    [
      "tube",
      <TestTube key="a" part="tube" x={50} top={40} bottom={140} level={100} hasCork>
        <Bubbles x={50} y={130} height={30} />
      </TestTube>,
    ],
    ["beaker", <Beaker key="b" part="beaker" x={80} top={60} bottom={150} w={70} level={90} />],
    [
      "flask",
      <ConicalFlask key="c" part="flask" x={80} top={40} bottom={150} w={70} level={120} />,
    ],
    ["lamp", <SpiritLamp key="d" part="lamp" x={60} table={180} hasWick />],
    [
      "burner",
      <Burner key="e" part="burner" x={150} table={180} flame={FlameKind.Clean} isAirOpen />,
    ],
    ["flame", <Flame key="f" part="flame" x={10} y={60} kind={FlameKind.Sooty} />],
    ["tripod", <Tripod key="g" part="tripod" x={100} table={180} hasDish />],
    ["bubbles", <Bubbles key="h" part="bubbles" x={50} y={130} height={40} count={8} />],
  ])("%s renders, carries data-part and uses no raw colour", (part, piece) => {
    expectKitPiece(piece, part);
  });

  it("a tube's liquid fills from the level down, in the caller's class, under the glass", () => {
    const html = expectKitPiece(
      <TestTube part="t" x={50} top={40} bottom={140} level={100} liquid="my-acid">
        <circle class="my-precipitate" r={2} />
      </TestTube>,
      "t",
    );
    expect(html).toContain(`<path class="my-acid" d="${tubeFillPath(50, 100, 140, 24)}"`);
    const order = ["my-acid", "my-precipitate", "kit-glass"].map((c) => html.indexOf(c));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("an empty tube draws no liquid", () => {
    expect(expectKitPiece(<TestTube part="t" x={0} top={0} bottom={100} />, "t")).not.toContain(
      "kit-liquid",
    );
  });

  it("a fill fraction gives the level the carbon lab used", () => {
    // Full: the straight part's top; empty: just the round bottom.
    expect(tubeLevel(52, 168, 30, 1)).toBe(52);
    expect(tubeLevel(52, 168, 30, 0)).toBe(153);
  });

  it("an unlit lamp or burner has no flame", () => {
    expect(
      expectKitPiece(<SpiritLamp part="l" x={0} table={100} isLit={false} />, "l"),
    ).not.toContain("kit-flame");
    expect(expectKitPiece(<Burner part="b" x={0} table={100} />, "b")).not.toContain(
      "kit-burner-flame",
    );
  });

  it("a sooty flame smokes and a clean one has a core", () => {
    expect(expectKitPiece(<Flame part="f" x={0} y={0} kind={FlameKind.Sooty} />, "f")).toContain(
      "kit-smoke",
    );
    expect(expectKitPiece(<Flame part="f" x={0} y={0} kind={FlameKind.Clean} />, "f")).toContain(
      "kit-burner-flame-core",
    );
  });
});
