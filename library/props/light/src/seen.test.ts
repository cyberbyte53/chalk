import { type PropView, checkProp, describeView } from "@chalk/player";
import { Board } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { sphericalMirrorProp } from "./index";
import { ImageCase, MirrorKind } from "./mirror";
import { sphericalMirror } from "./spherical-mirror";

function seen(given: Readonly<Record<string, unknown>> = {}, locale: "en" | "hi" = "en") {
  const b = new Board(sphericalMirror, { u: -35, ...given });
  b.runUntilIdle();
  const d = describeView(sphericalMirrorProp, b.read() as unknown as PropView, locale);
  return { ...d, at: (id: string) => d.elements.find((e) => e.id === id) };
}

describe("what the student sees", () => {
  it("every input says what it does, and every student action has one", () => {
    expect(
      checkProp(sphericalMirrorProp, [
        { canSwitchKind: true },
        { u: -15, canSwitchKind: true },
        { kind: MirrorKind.Convex, u: -20, canSwitchKind: true },
      ]),
    ).toEqual([]);
  });

  it("beyond C: the object, its image in front, the case in the textbook's words, u v m", () => {
    const s = seen();
    expect(s.at("object")?.value).toBe(-35);
    expect(s.at("image")?.value).toBe(-14);
    expect(s.at("case")?.value).toBe(ImageCase.BeyondC);
    expect(s.at("case")?.words).toBe(
      "Object beyond C · image between F and C: real, inverted, diminished",
    );
    expect(s.at("numbers")?.words).toBe("u = −35 cm   v = −14 cm   m = −0.4");
    expect(s.at("moveObject")?.does).toEqual(["moveObject", "letGo"]);
  });

  it("at F, the image is at infinity; between F and P, behind the mirror", () => {
    expect(seen({ u: -10 }).at("image")?.value).toBeNull();
    expect(seen({ u: -10 }).at("case")?.words).toContain("image at infinity");
    expect(seen({ u: -5 }).at("image")?.value).toBe(10);
    expect(seen({ u: -5 }, "hi").at("case")?.words).toBe(
      "वस्तु F और P के बीच · प्रतिबिंब दर्पण के पीछे: आभासी, सीधा, बड़ा",
    );
  });

  it("the switch is there only when the board offers it", () => {
    expect(seen().at("setKind:convex")).toBeUndefined();
    expect(seen({ canSwitchKind: true }).at("setKind:convex")?.does).toBe("setKind");
  });
});
