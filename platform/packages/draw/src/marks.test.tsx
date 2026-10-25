import { describe, expect, it } from "vitest";
import { expectKitPiece, expectStylesUseTokens } from "./kit-checks";
import {
  AngleArc,
  Arrowhead,
  EqualTicks,
  HEAD_MIDDLE,
  LabelPush,
  ParallelArrows,
  RightAngle,
  SideLabel,
} from "./marks";

describe("geometry marks", () => {
  it.each([
    ["arrowhead", <Arrowhead key="a" part="arrowhead" at={[10, 10]} toward={[1, 0]} />],
    ["angle", <AngleArc key="b" part="angle" vertex={[0, 0]} p={[50, 0]} q={[0, 50]} label="θ" />],
    ["right", <RightAngle key="c" part="right" vertex={[0, 0]} p={[50, 0]} q={[0, 50]} />],
    ["ticks", <EqualTicks key="d" part="ticks" from={[0, 0]} to={[40, 0]} count={2} />],
    ["parallel", <ParallelArrows key="e" part="parallel" from={[0, 0]} to={[40, 0]} />],
    ["length", <SideLabel key="f" part="length" from={[0, 0]} to={[40, 0]} text="5 cm" />],
  ])("%s renders, carries data-part and uses no raw colour", (part, piece) => {
    expectKitPiece(piece, part);
  });

  it("the kit's styles use only the look's tokens", () => {
    expectStylesUseTokens();
  });

  it("an arrowhead's tip sits at the anchor, or 5 px past it when centred", () => {
    const tip = expectKitPiece(<Arrowhead part="h" at={[0, 0]} toward={[1, 0]} />, "h");
    expect(tip).toContain('d="M0 0 L-9');
    const mid = expectKitPiece(
      <Arrowhead part="h" at={[0, 0]} toward={[1, 0]} shape={HEAD_MIDDLE} />,
      "h",
    );
    expect(mid).toContain('d="M5 0 L-7 -5 L-7 5 Z"');
  });

  it("a right-angle square's corner is `size` along both rays", () => {
    const html = expectKitPiece(
      <RightAngle part="r" vertex={[0, 0]} p={[50, 0]} q={[0, 50]} />,
      "r",
    );
    expect(html).toContain('d="M9.0 0.0 L9.0 9.0 L0.0 9.0"');
  });

  it("an angle's label sits inside the angle, past the arcs", () => {
    const html = expectKitPiece(
      <AngleArc part="a" vertex={[0, 0]} p={[50, 0]} q={[0, 50]} r={14} count={2} label="x" />,
      "a",
    );
    expect(html.match(/ A /g)?.length).toBe(2);
    const d = (14 + 3.5 + 10) * Math.SQRT1_2;
    expect(html).toContain(`x="${d}"`);
  });

  it("a side's label is pushed along the normal away from the inside, or radially", () => {
    const below = expectKitPiece(
      <SideLabel part="s" from={[0, 0]} to={[40, 0]} text="a" away={[20, -30]} />,
      "s",
    );
    expect(below).toContain('y="14"');
    const radial = expectKitPiece(
      <SideLabel
        part="s"
        from={[0, 0]}
        to={[40, 0]}
        text="a"
        away={[0, -30]}
        push={LabelPush.Radial}
      />,
      "s",
    );
    expect(radial).toContain(`x="${20 + 10 * (20 / Math.hypot(20, 30))}"`);
  });
});
