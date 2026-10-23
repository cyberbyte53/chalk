import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const ask = (given: string, find: string) =>
  t(`In an AP, given ${given}, find ${find}.`, `एक AP में, ${given} दिया है, ${find} ज्ञात करो।`);
const forms = t(
  "Use both formulas: aₙ = a + (n − 1)d and Sₙ = n/2 [2a + (n − 1)d] (or n/2 (a + l)).",
  "दोनों सूत्र लो: aₙ = a + (n − 1)d और Sₙ = n/2 [2a + (n − 1)d] (या n/2 (a + l))।",
);
const negative = t(
  "Of the two roots of the quadratic in n, keep the positive whole number.",
  "n के द्विघात के दो मूलों में से धन पूर्ण संख्या रखो।",
);

/** Exercise 5.3 Q3 (i)–(x) and Example 12: know three of S, a, d, n (or l), find the rest. */
const items = {
  ex12: numItem(ask("S₁₄ = 1050 and a = 10", "the 20th term"), "200", [
    [
      "210",
      t(
        "d = 10, so a₂₀ = 10 + 19 × 10 = 200: 19 steps, not 20.",
        "d = 10, तो a₂₀ = 10 + 19 × 10 = 200: 19 क़दम, 20 नहीं।",
      ),
    ],
    ["10", t("10 is d. Use it to find the 20th term.", "10, d है। इससे 20वाँ पद निकालो।")],
  ]),
  q3i: numItem(ask("a = 5, d = 3, aₙ = 50", "n and Sₙ"), "n = 16, Sₙ = 440", [
    [
      "n = 15, Sₙ = 412.5",
      t(
        "50 = 5 + (n − 1) × 3 gives n − 1 = 15, so n = 16.",
        "50 = 5 + (n − 1) × 3 से n − 1 = 15, तो n = 16।",
      ),
    ],
    [
      "n = 16, Sₙ = 880",
      t(
        "S = n/2 (a + l) = 8 × 55. Don't forget the half.",
        "S = n/2 (a + l) = 8 × 55। आधा मत भूलो।",
      ),
    ],
  ]),
  q3ii: numItem(ask("a = 7, a₁₃ = 35", "d and S₁₃"), "d = 7/3, S₁₃ = 273", [
    [
      "d = 28/13, S₁₃ = 273",
      t(
        "From the 1st to the 13th term is 12 steps: 12d = 28.",
        "पहले से 13वें पद तक 12 क़दम हैं: 12d = 28।",
      ),
    ],
    ["d = 7/3, S₁₃ = 546", t("S₁₃ = 13/2 × (7 + 35). Halve.", "S₁₃ = 13/2 × (7 + 35)। आधा करो।")],
  ]),
  q3iii: numItem(ask("a₁₂ = 37, d = 3", "a and S₁₂"), "a = 4, S₁₂ = 246", [
    [
      "a = 1, S₁₂ = 228",
      t("a = 37 − 11 × 3 = 4: 11 steps back, not 12.", "a = 37 − 11 × 3 = 4: 11 क़दम पीछे, 12 नहीं।"),
    ],
    ["a = 4, S₁₂ = 492", t("S₁₂ = 6 × (4 + 37) = 246.", "S₁₂ = 6 × (4 + 37) = 246।")],
  ]),
  q3iv: numItem(ask("a₃ = 15, S₁₀ = 125", "d and a₁₀"), "d = −1, a₁₀ = 8", [
    [
      "d = 1, a₁₀ = 22",
      t(
        "a + 2d = 15 and 2a + 9d = 25 give d = −1, a = 17.",
        "a + 2d = 15 और 2a + 9d = 25 से d = −1, a = 17।",
      ),
    ],
    ["d = −1, a₁₀ = 7", t("a₁₀ = 17 + 9 × (−1) = 8.", "a₁₀ = 17 + 9 × (−1) = 8।")],
  ]),
  q3v: numItem(ask("d = 5, S₉ = 75", "a and a₉"), "a = −35/3, a₉ = 85/3", [
    [
      "a = 35/3, a₉ = 155/3",
      t(
        "9/2 [2a + 40] = 75 gives 2a = −70/3: a is negative.",
        "9/2 [2a + 40] = 75 से 2a = −70/3: a ऋणात्मक है।",
      ),
    ],
    [
      "a = −5, a₉ = 35",
      t("Check: S₉ would be 9/2 × 30 = 135, not 75.", "जाँचो: S₉ होता 9/2 × 30 = 135, 75 नहीं।"),
    ],
  ]),
  q3vi: numItem(ask("a = 2, d = 8, Sₙ = 90", "n and aₙ"), "n = 5, aₙ = 34", [
    ["n = −4.5, aₙ = −42", negative],
    ["n = 5, aₙ = 42", t("a₅ = 2 + 4 × 8 = 34.", "a₅ = 2 + 4 × 8 = 34।")],
  ]),
  q3vii: numItem(ask("a = 8, aₙ = 62, Sₙ = 210", "n and d"), "n = 6, d = 54/5", [
    [
      "n = 6, d = 9",
      t("62 = 8 + 5d, so d = 54/5, not 54/6.", "62 = 8 + 5d, तो d = 54/5, 54/6 नहीं।"),
    ],
    ["n = 3, d = 27", forms],
  ]),
  q3viii: numItem(ask("aₙ = 4, d = 2, Sₙ = −14", "n and a"), "n = 7, a = −8", [
    ["n = −2, a = 10", negative],
    [
      "n = 7, a = 8",
      t(
        "a = 4 − 6 × 2 = −8: going back from the last term subtracts d.",
        "a = 4 − 6 × 2 = −8: अंतिम पद से पीछे जाने पर d घटता है।",
      ),
    ],
  ]),
  q3ix: numItem(ask("a = 3, n = 8, S = 192", "d"), "6", [
    [
      "21/4",
      t("192 = 4 [6 + 7d], so 7d = 42 and d = 6.", "192 = 4 [6 + 7d], तो 7d = 42 और d = 6।"),
    ],
    ["24", t("24 is the average term, 192 ÷ 8, not d.", "24 औसत पद है, 192 ÷ 8, d नहीं।")],
  ]),
  q3x: numItem(ask("l = 28, S = 144, and there are 9 terms", "a"), "4", [
    ["−12", t("144 = 9/2 (a + 28), so a + 28 = 32.", "144 = 9/2 (a + 28), तो a + 28 = 32।")],
    [
      "16",
      t(
        "16 = 144 ÷ 9 is the average term: (a + 28) ÷ 2 = 16, so a = 4.",
        "16 = 144 ÷ 9 औसत पद है: (a + 28) ÷ 2 = 16, तो a = 4।",
      ),
    ],
  ]),
} satisfies Record<string, Item>;

/** Know three of the quantities in an AP and find the others. */
export const findTheMissing = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingTheSum],
});
