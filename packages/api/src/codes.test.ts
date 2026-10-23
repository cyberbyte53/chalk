import { describe, expect, it } from "vitest";
import {
  CODE_ALPHABET,
  DEV_SCHOOL_CODE,
  JOIN_CODE_LENGTH,
  devJoinCode,
  isJoinCode,
  isSchoolCode,
  makeCode,
  normalizeCode,
} from "./codes";

describe("codes", () => {
  it("never uses letters that look alike", () => {
    for (const ch of "ILO01") expect(CODE_ALPHABET).not.toContain(ch);
  });

  it("makes codes of the alphabet, of the right length", () => {
    let i = 0;
    const code = makeCode(JOIN_CODE_LENGTH, (n) => i++ % n);
    expect(code).toBe("ABCDEF");
    expect(isJoinCode(code)).toBe(true);
  });

  it("reads a code however it was typed", () => {
    expect(normalizeCode(" k7p-q3m ")).toBe("K7PQ3M");
    expect(isJoinCode(normalizeCode("k7pq3m"))).toBe(true);
    expect(isJoinCode("K7PQ3")).toBe(false);
    expect(isJoinCode("K7PQ0M")).toBe(false);
  });

  it("gives the dev school a real code, and each course its own lasting dev join code", () => {
    expect(isSchoolCode(DEV_SCHOOL_CODE)).toBe(true);
    const books = ["9835cb2687f1300a", "042503240f243514", "0000000000000000"];
    const codes = books.map(devJoinCode);
    for (const code of codes) expect(isJoinCode(code)).toBe(true);
    expect(new Set(codes).size).toBe(books.length);
    expect(devJoinCode(books[0] ?? "")).toBe(codes[0]);
  });
});
