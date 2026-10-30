import { describe, expect, it } from "vitest";
import { audioKey } from "./audio";

describe("the voice's contract", () => {
  it("keys a clip by board, piece and language", () => {
    expect(audioKey("b1", "town%2Fwalker", "hi")).toBe("b1.town%2Fwalker.hi");
  });
});
