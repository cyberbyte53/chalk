import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const added = t(
  "You added x and y. From the origin, OP = √(x² + y²).",
  "तुमने x और y जोड़ दिए। मूलबिंदु से OP = √(x² + y²)।",
);
const noRoot = t("That's OP². Take the square root.", "यह OP² है। वर्गमूल लो।");
const negative = t(
  "Squares are never negative: (−6)² = 36, not −36.",
  "वर्ग कभी ऋणात्मक नहीं होते: (−6)² = 36, −36 नहीं।",
);

const items = {
  threeFour: numItem(t("How far is P(3, 4) from the origin?", "P(3, 4) मूलबिंदु से कितनी दूर है?"), "5", [
    ["7", added],
    ["25", noRoot],
  ]),
  sixEight: numItem(
    t("How far is P(−6, 8) from the origin?", "P(−6, 8) मूलबिंदु से कितनी दूर है?"),
    "10",
    [
      ["2", negative],
      ["14", added],
      ["√28", negative],
    ],
  ),
  fiveTwelve: numItem(
    t("How far is P(5, −12) from the origin?", "P(5, −12) मूलबिंदु से कितनी दूर है?"),
    "13",
    [
      ["17", added],
      ["169", noRoot],
    ],
  ),
  ones: numItem(t("How far is P(1, 1) from the origin?", "P(1, 1) मूलबिंदु से कितनी दूर है?"), "√2", [
    ["2", added],
    [
      "1",
      t(
        "Each leg is 1, but the straight line is longer: √(1 + 1).",
        "हर भुजा 1 है, पर सीधी रेखा लंबी है: √(1 + 1)।",
      ),
    ],
  ]),
} satisfies Record<string, Item>;

/** The distance of a point from the origin, √(x² + y²) (NCERT 7.2, Remark 1). */
export const fromTheOrigin = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.DistanceFormula],
});
