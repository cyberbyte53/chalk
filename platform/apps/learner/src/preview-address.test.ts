import { describe, expect, it } from "vitest";
import { isPreviewAddress } from "./preview-address";

const opens = (search: string) => isPreviewAddress(new URLSearchParams(search));

describe("the addresses the preview opens", () => {
  it("opens every kind the editor and the tools make", () => {
    for (const search of [
      "?dev&at=content/class9-maths/coordinate-geometry/two-numbers-for-a-place&show=questions",
      "?dev&at=content/class9-maths/coordinate-geometry/two-numbers-for-a-place/dot-on-paper",
      "?dev&source=content/class9-maths/coordinate-geometry/questions/place-the-dot",
      "?dev&at=library/props/coordinates/coordinatePlane",
      "?dev&at=library/props/",
      "?dev&threads",
      "?dev&threads&thread=cmvyww2w2120",
    ])
      expect(opens(search), search).toBe(true);
  });

  it("leaves the rest to the app's own screens", () => {
    expect(opens("?dev")).toBe(false);
    expect(opens("?dev&activity")).toBe(false);
  });
});
