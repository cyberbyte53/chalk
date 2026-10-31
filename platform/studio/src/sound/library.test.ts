import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { libraryIndex, libraryListSchema } from "./library";

const dir = join(import.meta.dirname, "../../../../library/sounds");

describe("the sound library", () => {
  const list = libraryListSchema.parse(JSON.parse(readFileSync(join(dir, "sounds.json"), "utf8")));

  it("is what its list says: every recording there, CC0, its index written from it", () => {
    for (const sound of list.sounds)
      expect(existsSync(join(dir, sound.file)), sound.file).toBe(true);
    expect(readFileSync(join(dir, "index.ts"), "utf8")).toBe(libraryIndex(list));
  });
});
