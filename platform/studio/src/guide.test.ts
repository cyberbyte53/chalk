import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { guideAt, mergeSettings, settingSources, settingsIn } from "./guide";

const guide = (yaml: string, prose = "# How we make lessons\n\nSome words.\n") =>
  `${prose}\n## Settings\n\nWhat code reads.\n\n\`\`\`yaml\n${yaml}\`\`\`\n\n## For details\n\n- more\n`;

describe("the guides, top to chapter", () => {
  const authoring = mkdtempSync(join(tmpdir(), "chalk-guide-"));
  mkdirSync(join(authoring, "books", "b", "c"), { recursive: true });
  writeFileSync(
    join(authoring, "guide.md"),
    guide(
      "voices:\n  narrator: { en: 'piper:a', hi: 'piper:b' }\n  riya: { en: 'piper:c', hi: 'piper:d' }\n",
    ),
  );
  writeFileSync(
    join(authoring, "books", "b", "guide.md"),
    guide("voices:\n  narrator: { hi: 'piper:x' }\n"),
  );

  it("reads the yaml block under Settings, and nothing without one", () => {
    expect(settingsIn(guide("voices:\n  narrator: { en: 'piper:a' }\n"))).toEqual({
      voices: { narrator: { en: "piper:a" } },
    });
    expect(settingsIn("# A guide\n\n```yaml\nvoices: {}\n```\n")).toEqual({});
  });

  it("refuses a setting it doesn't know, or a voice not written provider:voice", () => {
    expect(() => settingsIn(guide("colour: red\n"))).toThrow(/colour/);
    expect(() => settingsIn(guide("voices:\n  narrator: { en: lessac }\n"))).toThrow(
      /provider:voice/,
    );
  });

  it("merges key by key, the nearest level winning; lists are replaced whole", () => {
    const { settings, levels } = guideAt(authoring, "b/c");
    expect(levels).toHaveLength(2);
    expect(settings.voices).toEqual({
      narrator: { en: "piper:a", hi: "piper:x" },
      riya: { en: "piper:c", hi: "piper:d" },
    });
    expect(mergeSettings({ a: [1, 2], b: { c: 1 } }, { a: [3] })).toEqual({ a: [3], b: { c: 1 } });
  });

  it("says where each value came from", () => {
    const from = settingSources(authoring, "b/c");
    expect(from.get("voices.narrator.hi")).toMatch(/books\/b\/guide\.md$/);
    expect(from.get("voices.narrator.en")).toMatch(/[^s]\/guide\.md$/);
  });
});
