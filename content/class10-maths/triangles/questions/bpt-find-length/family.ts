import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const flipped = t(
  "That flips one ratio. Keep the same order on both sides: AD/DB = AE/EC.",
  "यह एक अनुपात उल्टा कर देता है। दोनों ओर एक ही क्रम रखो: AD/DB = AE/EC।",
);
const added = t(
  "The BPT is about ratios, not differences: AD/DB = AE/EC.",
  "BPT अनुपातों की बात है, अंतर की नहीं: AD/DB = AE/EC।",
);

/** Exercise 6.2 Q1 and similar: find a length with the basic proportionality theorem. */
const items = {
  q1i: numItem(
    t(
      "In ∆ ABC, DE ∥ BC. AD = 1.5 cm, DB = 3 cm and AE = 1 cm. Find EC.",
      "∆ ABC में DE ∥ BC। AD = 1.5 cm, DB = 3 cm और AE = 1 cm। EC ज्ञात करो।",
    ),
    "2 cm",
    [
      ["0.5 cm", flipped],
      ["2.5 cm", added],
    ],
  ),
  q1ii: numItem(
    t(
      "In ∆ ABC, DE ∥ BC. DB = 7.2 cm, AE = 1.8 cm and EC = 5.4 cm. Find AD.",
      "∆ ABC में DE ∥ BC। DB = 7.2 cm, AE = 1.8 cm और EC = 5.4 cm। AD ज्ञात करो।",
    ),
    "2.4 cm",
    [
      ["21.6 cm", flipped],
      ["3.6 cm", added],
    ],
  ),
  ratio: numItem(
    t(
      "In ∆ ABC, DE ∥ BC, AD/DB = 3/5 and AC = 5.6 cm. Find AE.",
      "∆ ABC में DE ∥ BC, AD/DB = 3/5 और AC = 5.6 cm। AE ज्ञात करो।",
    ),
    "2.1 cm",
    [
      [
        "3.36 cm",
        t(
          "3/5 compares AE with EC, not with AC. AE is 3 parts of 3 + 5 = 8: 5.6 × 3/8.",
          "3/5, AE की तुलना EC से करता है, AC से नहीं। AE, 3 + 5 = 8 में से 3 भाग है: 5.6 × 3/8।",
        ),
      ],
      [
        "3.5 cm",
        t(
          "That's EC, the 5 parts out of 8. AE is the 3 parts.",
          "यह EC है, 8 में से 5 भाग। AE, 3 भाग है।",
        ),
      ],
    ],
  ),
  simple: numItem(
    t(
      "In ∆ ABC, DE ∥ BC. AD = 4 cm, DB = 6 cm and AE = 6 cm. Find EC.",
      "∆ ABC में DE ∥ BC। AD = 4 cm, DB = 6 cm और AE = 6 cm। EC ज्ञात करो।",
    ),
    "9 cm",
    [
      ["4 cm", flipped],
      ["8 cm", added],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a length cut off by a line parallel to one side. */
export const bptFindLength = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.BasicProportionality],
});
