import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type Lesson, lessonSchema } from "@chalk/content";
import { propDefs } from "@chalk/library";
import { describe, expect, it } from "vitest";
import { loadReadings } from "../pronunciations";
import { generateAudio } from "./generate";
import { parseSayVoices } from "./macos";
import { parlerProvider } from "./parler";
import { toneProvider } from "./tone";

const lesson: Lesson = lessonSchema.parse(
  JSON.parse(
    readFileSync(
      new URL("../../evals/boards/lessons/where-is-root-2.json", import.meta.url),
      "utf8",
    ),
  ),
);
const readings = loadReadings(
  new URL("../../../content/pronunciations.json", import.meta.url).pathname,
);
const voices = {
  tone: { narrator: { en: "n", hi: "n" }, maya: { en: "m", hi: "m" }, arjun: { en: "a", hi: "a" } },
};

describe("generateAudio", () => {
  it("speaks every spoken piece in both languages, keyed by permanent ids", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-audio-"));
    const result = await generateAudio(
      lesson,
      readings,
      propDefs,
      toneProvider,
      voices,
      dir,
      "where-is-root-2",
    );
    expect(result.manifest.provider).toBe("tone");
    expect(result.manifest.files["2.4.en"]).toMatch(/^audio\/where-is-root-2\/[0-9a-f]{16}\.wav$/); // question "guess-root"
    expect(result.manifest.files["1.3.hi"]).toBeDefined(); // Maya's first line, in Hindi
    for (const file of Object.values(result.manifest.files))
      expect(existsSync(join(dir, file))).toBe(true);
    expect(result.reused).toBe(0);
  });
  it("only speaks lines that changed", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-audio-"));
    const first = await generateAudio(lesson, readings, propDefs, toneProvider, voices, dir, "x");
    const again = await generateAudio(lesson, readings, propDefs, toneProvider, voices, dir, "x");
    expect(again.made).toBe(0);
    expect(again.reused).toBe(first.made + first.reused);
  });
  it("needs a voice for every speaker", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-audio-"));
    await expect(
      generateAudio(
        lesson,
        readings,
        propDefs,
        toneProvider,
        { tone: { narrator: { en: "n", hi: "n" } } },
        dir,
        "x",
      ),
    ).rejects.toThrow(/no voice for "maya"/);
  });
});

describe("default speaker", () => {
  it("lets one voice speak for the whole cast", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-audio-"));
    const result = await generateAudio(
      lesson,
      readings,
      propDefs,
      toneProvider,
      { tone: { default: { en: "d", hi: "d" } } },
      dir,
      "x",
    );
    expect(result.made).toBeGreaterThan(0);
  });
});

describe("parseSayVoices", () => {
  it("reads voice names from `say -v ?`", () => {
    const out =
      "Lekha               hi_IN    # नमस्ते\nEddy (English (US)) en_US    # Hello\nRishi               en_IN    # Hello\n";
    expect(parseSayVoices(out)).toEqual(["Lekha", "Eddy", "Rishi"]);
  });
  it("reads the newer macOS format, where the language follows the name", () => {
    const out =
      "Lekha (Hindi (India)) hi_IN    # नमस्ते, मेरा नाम लेखा है।\nLekha (Hindi (India)) hi_IN    # नमस्ते\nSamantha (English (US)) en_US    # Hello! My name is Samantha.\n";
    expect(parseSayVoices(out)).toEqual(["Lekha", "Samantha"]);
  });
});

describe("parlerProvider", () => {
  it("says how to set it up when its Python isn't there", async () => {
    const before = process.env.CHALK_PARLER_PYTHON;
    process.env.CHALK_PARLER_PYTHON = "/nowhere/python";
    await expect(parlerProvider.missingVoices([])).rejects.toThrow(
      /studio\/voice-parler\/README.md/,
    );
    if (before === undefined) Reflect.deleteProperty(process.env, "CHALK_PARLER_PYTHON");
    else process.env.CHALK_PARLER_PYTHON = before;
  });
});
