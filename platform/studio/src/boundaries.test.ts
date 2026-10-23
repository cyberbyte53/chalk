import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { boundaryBreaks, layerOf } from "./boundaries";

describe("layers", () => {
  it("are named by the top folder", () => {
    expect(layerOf("platform/packages/prop")).toBe("core");
    expect(layerOf("platform/apps/learner")).toBe("assembly");
    expect(layerOf("platform/studio")).toBe("assembly");
    expect(layerOf("library/props/number-line")).toBe("library");
    expect(layerOf("content")).toBe("content");
    expect(layerOf("tmp/old")).toBeUndefined();
  });

  it("import one way in this repo: content → library → core", () => {
    const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
    expect(boundaryBreaks(root)).toEqual([]);
  });
});
