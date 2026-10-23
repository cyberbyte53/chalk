import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { writeJsonFile } from "./json-file";

// Inside the repo, so biome.json is found above it.
const dir = mkdtempSync(new URL("../json-file-test-", import.meta.url).pathname);
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("writeJsonFile", () => {
  it("lays JSON out the way biome format does", () => {
    const file = join(dir, "report.json");
    writeJsonFile(file, { cases: [{ notSay: ["1\\.41", "1\\.414"] }] });
    expect(readFileSync(file, "utf8")).toBe(
      '{\n  "cases": [\n    {\n      "notSay": ["1\\\\.41", "1\\\\.414"]\n    }\n  ]\n}\n',
    );
  });

  it("writes a path biome ignores as it is, Hindi intact", () => {
    // Lesson sources are ignored by biome.json; its echo of them used to drop the vowel signs.
    const lessons = new URL("../../../content/zz-json-file-test/lessons/", import.meta.url)
      .pathname;
    mkdirSync(lessons, { recursive: true });
    try {
      const file = join(lessons, "lesson.json");
      writeJsonFile(file, { title: { hi: "पूर्ण संख्याएँ" } });
      expect(readFileSync(file, "utf8")).toBe('{\n  "title": {\n    "hi": "पूर्ण संख्याएँ"\n  }\n}\n');
    } finally {
      rmSync(new URL("../../../content/zz-json-file-test", import.meta.url).pathname, {
        recursive: true,
        force: true,
      });
    }
  });
});
