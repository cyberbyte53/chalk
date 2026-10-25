import { describe, expect, it } from "vitest";
import { expectKitPiece } from "./kit-checks";
import { OpticArrow, OpticArrowKind, OpticPoint, PrincipalAxis, Ray } from "./optics";

describe("optics pieces", () => {
  it.each([
    ["object", <OpticArrow key="a" part="object" foot={[50, 100]} tip={[50, 60]} />],
    [
      "image",
      <OpticArrow
        key="b"
        part="image"
        foot={[200, 100]}
        tip={[200, 130]}
        kind={OpticArrowKind.Image}
        isVirtual
      />,
    ],
    ["ray", <Ray key="c" part="ray" from={[0, 60]} to={[160, 60]} />],
    ["extension", <Ray key="d" part="extension" from={[160, 60]} to={[220, 40]} isDashed />],
    ["axis", <PrincipalAxis key="e" part="axis" from={[0, 100]} to={[320, 100]} />],
    ["focus", <OpticPoint key="f" part="focus" at={[120, 100]} label="F" />],
  ])("%s renders, carries data-part and uses no raw colour", (part, piece) => {
    expectKitPiece(piece, part);
  });

  it("an arrow's head is at its tip, pointing away from the axis", () => {
    const up = expectKitPiece(<OpticArrow part="o" foot={[50, 100]} tip={[50, 60]} />, "o");
    expect(up).toContain('transform="translate(50 60) rotate(-90)"');
  });

  it("a virtual image is marked so it draws dashed", () => {
    const html = expectKitPiece(
      <OpticArrow part="i" foot={[0, 0]} tip={[0, 10]} kind={OpticArrowKind.Image} isVirtual />,
      "i",
    );
    expect(html).toContain('class="kit-optic-arrow is-image is-virtual"');
  });

  it("a ray's arrowhead sits part way along; a dashed extension has none unless asked", () => {
    expect(expectKitPiece(<Ray part="r" from={[0, 0]} to={[100, 0]} />, "r")).toContain(
      "translate(55",
    );
    expect(
      expectKitPiece(<Ray part="r" from={[0, 0]} to={[100, 0]} isDashed />, "r"),
    ).not.toContain("kit-arrowhead");
    expect(
      expectKitPiece(<Ray part="r" from={[0, 0]} to={[100, 0]} isDashed hasHead />, "r"),
    ).toContain("kit-arrowhead");
  });
});
