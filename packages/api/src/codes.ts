/**
 * Codes people read off a board or a phone and type: a group's join code and a school's code. No
 * letters that look alike (no I, L, O, 0, 1), upper case only; typed lower case is accepted.
 */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const JOIN_CODE_LENGTH = 6;
export const SCHOOL_CODE_LENGTH = 6;

/**
 * The school a dev sign-in is set up in: the server adds it at start when DEV_SIGN_IN is on
 * (localhost only), so trying the app needs no `add-school`.
 */
export const DEV_SCHOOL_CODE = "DEVDEV";

/**
 * The dev school's group for a course (a book id): the same code on the server, which makes the
 * group, and in the app, which joins it.
 */
export function devJoinCode(courseId: string): string {
  let hash = 2166136261;
  for (const ch of courseId) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0;
  // The hash's digits in base 31 (31⁶ < 2³², so six digits fit).
  return makeCode(JOIN_CODE_LENGTH, (n) => {
    const digit = hash % n;
    hash = Math.floor(hash / n);
    return digit;
  });
}

const codePattern = (length: number) => new RegExp(`^[${CODE_ALPHABET}]{${length}}$`);
const JOIN_CODE = codePattern(JOIN_CODE_LENGTH);
const SCHOOL_CODE = codePattern(SCHOOL_CODE_LENGTH);

/** A code as typed (spaces, dashes, lower case) in the form it is stored. */
export const normalizeCode = (typed: string): string => typed.replace(/[\s-]/g, "").toUpperCase();

export const isJoinCode = (code: string): boolean => JOIN_CODE.test(code);
export const isSchoolCode = (code: string): boolean => SCHOOL_CODE.test(code);

/** A new code from `random` (an integer in [0, n) each call; crypto-backed on the server). */
export function makeCode(length: number, random: (n: number) => number): string {
  let code = "";
  for (let i = 0; i < length; i++) code += CODE_ALPHABET.charAt(random(CODE_ALPHABET.length));
  return code;
}
