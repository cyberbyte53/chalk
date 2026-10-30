import { describe, expect, it } from "vitest";
import { audioSeconds } from "./length";
import { toneWav } from "./tone";

/** A bare MP4: an `ftyp`, then a `moov` holding only its movie header. */
function mp4(timescale: number, duration: number): Uint8Array {
  const bytes = new Uint8Array(16 + 8 + 8 + 100);
  const view = new DataView(bytes.buffer);
  const ascii = (at: number, s: string) =>
    [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  view.setUint32(0, 16);
  ascii(4, "ftyp");
  ascii(8, "M4A ");
  view.setUint32(16, 8 + 108);
  ascii(20, "moov");
  view.setUint32(24, 108);
  ascii(28, "mvhd");
  // version 0, flags, created, modified, then the timescale and duration.
  view.setUint32(32 + 12, timescale);
  view.setUint32(32 + 16, duration);
  return bytes;
}

describe("how long an audio file plays", () => {
  it("reads a WAV from its data size and byte rate", () => {
    // The tone stand-in is as long as the line would take: 0.06 s a letter, at least 0.6 s.
    expect(audioSeconds(toneWav("a".repeat(50), "v"), "wav")).toBeCloseTo(3);
  });

  it("reads an M4A from its movie header", () => {
    expect(audioSeconds(mp4(44_100, 44_100 * 3.5), "m4a")).toBeCloseTo(3.5);
  });

  it("reads a streamed WAV (size unknown) by what is in the file", () => {
    const wav = toneWav("a".repeat(50), "v");
    new DataView(wav.buffer).setUint32(40, 0xffffffff, true);
    expect(audioSeconds(wav, "wav")).toBeCloseTo(3);
  });

  it("says so when it can't tell", () => {
    expect(() => audioSeconds(new Uint8Array(40), "wav")).toThrow(/Can't tell how long/);
    expect(() => audioSeconds(new Uint8Array(40), "ogg")).toThrow(/Can't tell how long/);
  });
});
