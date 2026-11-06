import { asciiDigits } from "./numbers";

/**
 * Text compared letters only: letters, their marks and digits are kept; spaces, hyphens, dashes and
 * minus signs, brackets, quotes, primes and line breaks are not, and nor are fractions (a stacked
 * fraction's digits sit apart in the text layer: `½`, `2/3` are left out of the comparison).
 */
export function lettersOnly(text: string): string {
  return asciiDigits(
    text
      .replace(/[¼-¾⅐-⅞]/g, "")
      .replace(/\d+\s*[/⁄]\s*\d+/g, "")
      .normalize("NFKC"),
  ).replace(/[^\p{L}\p{M}\p{N}]/gu, "");
}
