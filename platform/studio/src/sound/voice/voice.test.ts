import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { place, scene } from "@chalk/author";
import { propLibrary } from "@chalk/library";
import { scriptOf } from "@chalk/player";
import { text } from "@chalk/prop-basics";
import { describe, expect, it } from "vitest";
import { voiceFor } from "./cast";
import { SOUND_LIST, voiceChapter } from "./make";
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
    title: place(text, { text: t("Finding **Aman's** house", "अमन का घर") }),
    root: place(
      text,
      { text: t("√2 is about 1.41", "√2 लगभग 1.41 है") },
      { says: t("The square root of 2 is about 1.41", "2 का वर्गमूल लगभग 1.41 है") },
    ),
    reply: place(text, { text: t("House 5.", "मकान 5।") }, { speaker: "aman" }),
  },
}).build("tiny");
const lookup = (type: string) => propLibrary[type];
const tiny = scriptOf(built.board, lookup);
const boards = [{ id: "b1", path: "book/chapter/lesson/tiny", lines: tiny }];

describe("a board's script", () => {
  it("is every line it says, in order, with who says it", () => {
    expect(scriptOf(built.board, lookup).map((l) => `${l.line}: ${l.speaker}`)).toEqual([
      "title: narrator",
      "root: narrator",
      "reply: aman",
    ]);
  });
});

describe("voicing a chapter: cast, speak, keep, in its own folder", () => {
  const voice = (
    b: typeof boards,
    folder = mkdtempSync(join(tmpdir(), "chalk-sound-")),
    p = providers,
  ) =>
    voiceChapter({ soundDir: folder, boards: b, isWhole: true, cast, providers: p }).then((r) => ({
      ...r,
      folder,
    }));

  it("makes a clip per phrase, listed with its voice, language, words and length", async () => {
    const { list, made, folder } = await voice(boards);
    expect(made).toBe(6);
    const clip = list.clips.find((c) => c.words === "Finding Aman's house");
    expect(clip).toMatchObject({ voice: "tone:narrator", locale: "en" });
    expect(clip?.file).toMatch(/^[0-9a-f]{16}\.wav$/);
    expect(list.clips.find((c) => c.words === "मकान 5।")?.voice).toBe("tone:aman-hi");
    expect(list.speakers.aman).toEqual({ en: "tone:aman", hi: "tone:aman-hi" });
    // The list is in the folder, beside the clips.
    expect(JSON.parse(readFileSync(join(folder, SOUND_LIST), "utf8"))).toEqual(list);
  });

  it("says the screen words without bold marks, or the line's own spoken words", async () => {
    const said: string[] = [];
    const listening = {
      tone: {
        ...toneProvider,
        synthesize: async (text: string, v: string, out: string) => {
          said.push(`${v}: ${text}`);
          await toneProvider.synthesize(text, v, out);
        },
      },
    };
    await voice(boards, undefined, listening);
    expect(said).toContain("narrator: Finding Aman's house");
    expect(said).toContain("narrator: The square root of 2 is about 1.41");
    expect(said).toContain("aman-hi: मकान 5।");
  });

  it("only makes what is missing, and removes clips nothing says any more", async () => {
    const { folder } = await voice(boards);
    expect((await voice(boards, folder)).made).toBe(0);
    const fewer = [{ id: "b1", path: "book/chapter/lesson/tiny", lines: tiny.slice(0, 1) }];
    // Not every board voiced (one didn't build): nothing is removed.
    const before = readdirSync(folder).length;
    await voiceChapter({ soundDir: folder, boards: fewer, isWhole: false, cast, providers });
    expect(readdirSync(folder)).toHaveLength(before);
    const { list } = await voice(fewer, folder);
    expect(readdirSync(folder).sort()).toEqual(
      [...list.clips.map((c) => c.file), SOUND_LIST].sort(),
    );
  });

  it("gives no clip to a line a voice can't say as shown: it lists it, with a suggestion for maths", async () => {
    const odd = scene({
      pieces: {
        sign: place(text, { text: t("α + β", "α + β") }),
        maths: place(text, { text: t("Is $x^2$ even?", "क्या $x^2$ सम है?") }),
      },
    }).build("odd");
    const made = await voice([
      { id: "b2", path: "book/chapter/lesson/odd", lines: scriptOf(odd.board, lookup) },
    ]);
    expect(made.made).toBe(0);
    expect(made.unsaid.join("\n")).toMatch(/sign \(en\): it has "α \+ β" outside maths/);
    expect(made.unsaid.join("\n")).toMatch(
      /maths \(en\): it has maths[\s\S]*suggested: "Is x squared even\?"/,
    );
    // The script has them all the same: what is shown, and what is missing.
    expect(made.script.boards[0]?.lines[1]?.said.en).toEqual({
      needs: "it has maths",
      suggested: "Is x squared even?",
    });
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
