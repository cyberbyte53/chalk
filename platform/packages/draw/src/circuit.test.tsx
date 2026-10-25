import { describe, expect, it } from "vitest";
import {
  Battery,
  Bulb,
  Cell,
  Dial,
  Meter,
  MeterKind,
  PlugKey,
  Resistor,
  Rheostat,
  Switch,
  Wire,
} from "./circuit";
import { expectKitPiece } from "./kit-checks";

describe("circuit symbols", () => {
  it.each([
    [
      "wire",
      <Wire
        key="a"
        part="wire"
        points={[
          [0, 0],
          [40, 0],
          [40, 30],
        ]}
        isOn
      />,
    ],
    ["cell", <Cell key="b" part="cell" at={[50, 50]} />],
    ["battery", <Battery key="c" part="battery" cells={3} />],
    ["resistor", <Resistor key="d" part="resistor" at={[10, 10]} angle={90} />],
    ["rheostat", <Rheostat key="e" part="rheostat" />],
    ["bulb", <Bulb key="f" part="bulb" brightness={0.6} />],
    ["fused", <Bulb key="g" part="fused" isBroken />],
    ["switch", <Switch key="h" part="switch" isClosed={false} />],
    ["key", <PlugKey key="i" part="key" isClosed />],
    ["ammeter", <Meter key="j" part="ammeter" kind={MeterKind.Ammeter} />],
    [
      "dial",
      <Dial key="k" part="dial" at={[60, 60]} value={0.3} max={1} letter="A" reading="0.30 A" />,
    ],
  ])("%s renders, carries data-part and uses no raw colour", (part, piece) => {
    expectKitPiece(piece, part);
  });

  it("a symbol is placed by a transform, and none at the origin", () => {
    expect(expectKitPiece(<Cell part="c" at={[50, 20]} angle={90} />, "c")).toContain(
      'transform="translate(50 20) rotate(90)"',
    );
    expect(expectKitPiece(<Cell part="c" />, "c")).not.toContain("transform=");
  });

  it("a cell's + plate is the long one, on the right; leads can be left off", () => {
    const html = expectKitPiece(<Cell part="c" lead={0} long={13} />, "c");
    expect(html).toContain('class="kit-plate-plus" x1="5" y1="-13"');
    expect(html).not.toContain("kit-wire");
  });

  it("a dark bulb has no glow; a lit one glows by its brightness", () => {
    expect(expectKitPiece(<Bulb part="b" />, "b")).not.toContain("kit-bulb-glow");
    const lit = expectKitPiece(<Bulb part="b" brightness={1} />, "b");
    expect(lit).toContain('r="18"');
    expect(lit).toContain("kit-filament is-lit");
  });

  it("an open switch's lever is raised, a closed one rests on the far contact", () => {
    expect(expectKitPiece(<Switch part="s" isClosed />, "s")).toContain('x2="14" y2="0"');
    expect(expectKitPiece(<Switch part="s" isClosed={false} />, "s")).not.toContain(
      'x2="14" y2="0"',
    );
  });

  it("a dial past its end pins the needle and marks the reading", () => {
    const html = expectKitPiece(
      <Dial part="d" at={[0, 0]} value={5} max={1} letter="A" reading="5 A" />,
      "d",
    );
    expect(html).toContain('class="kit-dial is-over"');
    expect(html).toContain(">5 A<");
  });
});
