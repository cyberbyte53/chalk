import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Facts and numbers for Construction 11.1 (Exercise 11.1 Q1 and others). */
const items = {
  howMany: numItem(
    t(
      "To divide AB in 4 : 7 with one ray, how many equal steps are marked on AX?",
      "एक किरण से AB को 4 : 7 में बाँटने के लिए AX पर कितने बराबर कदम लगते हैं?",
    ),
    "11",
    [
      [
        "7",
        t(
          "7 covers only the second part. The ray needs 4 + 7.",
          "7 में केवल दूसरा भाग आता है। किरण पर 4 + 7 चाहिए।",
        ),
      ],
      [
        "28",
        t("That's 4 × 7. The equal steps add up: 4 + 7.", "वह 4 × 7 है। बराबर कदम जुड़ते हैं: 4 + 7।"),
      ],
    ],
  ),
  through: numItem(
    t(
      "Dividing AB in 2 : 5 with one ray: A₇ is joined to B. Through which mark is the parallel drawn?",
      "एक किरण से AB को 2 : 5 में बाँटना: A₇ को B से मिलाया। समांतर रेखा किस निशान से खींची जाती है?",
    ),
    "A₂",
    [
      [
        "A₅",
        t(
          "Through A₅ gives AC : CB = 5 : 2. Use the first number, 2.",
          "A₅ से AC : CB = 5 : 2 बनता है। पहली संख्या, 2, लो।",
        ),
      ],
      [
        "A₆",
        t(
          "A₆ is one step before A₇, which doesn't match 2 : 5.",
          "A₆, A₇ से एक कदम पहले है, जो 2 : 5 से मेल नहीं खाता।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 11.1 Q1: a 7.6 cm segment divided in 5 : 8. How long is the shorter part, to one decimal place?",
      "प्रश्नावली 11.1 प्र.1: 7.6 cm का रेखाखंड 5 : 8 में बँटा। छोटा भाग कितना लंबा है, एक दशमलव तक?",
    ),
    "2.9 cm",
    [
      ["4.7 cm", t("4.7 cm is the longer part, 7.6 × 8/13.", "4.7 cm लंबा भाग है, 7.6 × 8/13।")],
      [
        "1.5 cm",
        t(
          "That's 7.6 ÷ 5. The shorter part is 5 of 13 parts: 7.6 × 5/13.",
          "वह 7.6 ÷ 5 है। छोटा भाग 13 में से 5 भाग है: 7.6 × 5/13।",
        ),
      ],
    ],
  ),
  why: {
    prompt: t(
      "Which result justifies Construction 11.1 (one ray, m + n steps)?",
      "कौन-सा परिणाम रचना 11.1 (एक किरण, m + n कदम) का औचित्य है?",
    ),
    right: t("The basic proportionality theorem", "आधारभूत समानुपातिकता प्रमेय"),
    wrong: [
      {
        label: t("The Pythagoras theorem on AA₅B", "AA₅B पर पाइथागोरस प्रमेय"),
        why: t(
          "There's no right angle in the figure. The parallel line A₃C ∥ A₅B is what carries the ratio.",
          "आकृति में कोई समकोण नहीं है। अनुपात समांतर रेखा A₃C ∥ A₅B से आता है।",
        ),
      },
      {
        label: t("Congruence of the triangles AA₃C, AA₅B", "त्रिभुज AA₃C, AA₅B की सर्वांगसमता"),
        why: t(
          "Those triangles have different sizes, so they can't be congruent. The BPT gives AA₃/A₃A₅ = AC/CB.",
          "उन त्रिभुजों के आकार अलग हैं, तो वे सर्वांगसम नहीं हो सकते। BPT देता है AA₃/A₃A₅ = AC/CB।",
        ),
      },
    ],
  },
  altWhy: {
    prompt: t(
      "In the alternative method, why is ∆AA₃C ~ ∆BB₂C?",
      "वैकल्पिक विधि में ∆AA₃C ~ ∆BB₂C क्यों है?",
    ),
    right: t("Alternate and vertically opposite angles (AA)", "एकांतर कोण और शीर्षाभिमुख कोण (AA)"),
    wrong: [
      {
        label: t(
          "Both have a side lying along the line AB (SAS)",
          "दोनों की एक भुजा रेखा AB के साथ पड़ी है (SAS)",
        ),
        why: t(
          "Sharing a line isn't a similarity test. AX ∥ BY gives equal alternate angles, and the angles at C are vertically opposite.",
          "एक रेखा साझा करना समरूपता की कसौटी नहीं है। AX ∥ BY से एकांतर कोण बराबर, और C पर के कोण शीर्षाभिमुख हैं।",
        ),
      },
      {
        label: t("AA₃ and BB₂ were drawn equal (SSS)", "AA₃ और BB₂ बराबर खींचे गए (SSS)"),
        why: t(
          "AA₃ is 3 steps and BB₂ only 2, so they aren't equal. The angles make the triangles similar.",
          "AA₃ तीन कदम और BB₂ केवल दो, तो वे बराबर नहीं। कोणों से त्रिभुज समरूप बनते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Facts, counts and lengths for dividing a segment. */
export const divideFacts = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.DividingASegment],
});
