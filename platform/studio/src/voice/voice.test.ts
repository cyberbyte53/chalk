import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { place, scene } from "@chalk/author";
import { scriptOf } from "@chalk/player";
import { sceneText } from "@chalk/prop-basics";
import { describe, expect, it } from "vitest";
import { voiceFor } from "./cast";
import { makeVoice } from "./make";
import { parseSayVoices } from "./providers/macos";
import { parlerProvider } from "./providers/parler";
import { toneProvider } from "./providers/tone";

// The voice module, end to end on a small board: collect its script, cast each line, speak it with
// a stand-in voice (a tone as long as the line), keep the clips.

const providers = { tone: toneProvider };
const cast = {
  narrator: { en: "tone:narrator", hi: "tone:narrator" },
  aman: { en: "tone:aman", hi: "tone:aman-hi" },
};
const t = (en: string, hi: string) => ({ en, hi });
const built = scene({
  pieces: {
    title: place(sceneText, { text: t("Finding **Aman's** house", "अमन का घर") }),
    root: place(sceneText, {
      text: t("√2 is about 1.41", "√2 लगभग 1.41 है"),
      speak: t("The square root of 2 is about 1.41", "2 का वर्गमूल लगभग 1.41 है"),
    }),
    reply: place(sceneText, { text: t("House 5.", "मकान 5।"), speaker: "aman" }),
  },
}).build("tiny");
const item = { id: "b1", path: "book/chapter/lesson/tiny" } as never;
const boards = [{ item, folder: "lesson", lines: scriptOf(built.board) }];

describe("a board's script", () => {
  it("is every line it says, in order, with who says it", () => {
    expect(scriptOf(built.board).map((l) => `${l.piece}: ${l.speaker}`)).toEqual([
      "title: narrator",
      "root: narrator",
      "reply: aman",
    ]);
  });
});

describe("the voice: cast, speak, keep", () => {
  it("makes a clip per line and language, in its lesson's folder, with its length", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-voice-"));
    const { manifest, made } = await makeVoice({ boards, cast, providers, outDir: dir });
    expect(made).toBe(6);
    expect(manifest.files["b1.title.en"]).toMatch(/^lesson\/[0-9a-f]{16}\.wav$/);
    expect(manifest.seconds?.["b1.reply.hi"]).toBeGreaterThan(0);
  });

  it("says the screen words without bold marks, or the line's own spoken words", async () => {
    const said: string[] = [];
    const listening = {
      tone: {
        ...toneProvider,
        synthesize: async (text: string, voice: string, out: string) => {
          said.push(`${voice}: ${text}`);
          await toneProvider.synthesize(text, voice, out);
        },
      },
    };
    await makeVoice({
      boards,
      cast,
      providers: listening,
      outDir: mkdtempSync(join(tmpdir(), "v-")),
    });
    expect(said).toContain("narrator: Finding Aman's house");
    expect(said).toContain("narrator: The square root of 2 is about 1.41");
    expect(said).toContain("aman-hi: मकान 5।");
  });

  it("only makes lines that changed", async () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-voice-"));
    await makeVoice({ boards, cast, providers, outDir: dir });
    const again = await makeVoice({ boards, cast, providers, outDir: dir });
    expect(again).toMatchObject({ made: 0, reused: 6 });
  });

  it("refuses screen words a voice can't say, when the line has no spoken words", async () => {
    const odd = scene({ pieces: { x: place(sceneText, { text: t("α + β", "α + β") }) } }).build(
      "odd",
    );
    await expect(
      makeVoice({
        boards: [{ item, folder: "lesson", lines: scriptOf(odd.board) }],
        cast,
        providers,
        outDir: mkdtempSync(join(tmpdir(), "v-")),
      }),
    ).rejects.toThrow(/write how each is said, as its "speak"[\s\S]*tiny, x \(en\): it has "α/);
  });
});

describe("the cast", () => {
  it("names a voice with its provider, per character and language", () => {
    expect(voiceFor(cast, providers, "aman", "hi")).toMatchObject({ voice: "aman-hi" });
    expect(voiceFor(cast, providers, undefined, "en")).toMatchObject({ voice: "narrator" });
  });
  it("says who is missing, and which providers there are", () => {
    expect(() => voiceFor(cast, providers, "riya", "en")).toThrow(/no "riya" in its cast/);
    expect(() =>
      voiceFor({ narrator: { en: "cloud:x", hi: "cloud:x" } }, providers, undefined, "en"),
    ).toThrow(/"cloud", which isn't a voice provider/);
  });
});

describe("parseSayVoices", () => {
  it("reads voice names from `say -v ?`", () => {
    const out =
      "Lekha               hi_IN    # नमस्ते\nEddy (English (US)) en_US    # Hello\nRishi               en_IN    # Hello\n";
    expect(parseSayVoices(out)).toEqual(["Lekha", "Eddy", "Rishi"]);
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
