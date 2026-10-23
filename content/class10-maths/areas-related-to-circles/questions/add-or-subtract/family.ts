import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const plan = (
  prompt: Item["prompt"],
  right: Item["right"],
  wrong: readonly (readonly [Item["right"], Item["right"]])[],
): Item => ({ prompt, right, wrong: wrong.map(([label, why]) => ({ label, why })) });

const flipped = t(
  "That adds a piece that is cut out (or subtracts one that is part of it). Shade the region in your head, piece by piece.",
  "इसमें कटे टुकड़े को जोड़ा (या शामिल टुकड़े को घटाया)। मन में भाग को टुकड़ा-टुकड़ा रंगो।",
);
const missing = t(
  "That leaves a piece out. List every piece the shaded part touches before you combine them.",
  "इसमें एक टुकड़ा छूट गया। जोड़ने-घटाने से पहले छायांकित भाग के हर टुकड़े की सूची बनाओ।",
);

/** Planning combined figures: which areas to add and which to subtract. */
const items = {
  frame: plan(
    t(
      "A square photo frame has a circular window cut in it. Which gives the frame's area?",
      "एक वर्गाकार फ़ोटो-फ़्रेम में वृत्ताकार खिड़की कटी है। फ़्रेम का क्षेत्रफल किससे मिलेगा?",
    ),
    t("square − circle", "वर्ग − वृत्त"),
    [
      [t("square + circle", "वर्ग + वृत्त"), flipped],
      [
        t("circle − square", "वृत्त − वर्ग"),
        t(
          "The circle is inside the square, so that's negative.",
          "वृत्त वर्ग के अंदर है, तो यह ऋणात्मक है।",
        ),
      ],
    ],
  ),
  ring: plan(
    t(
      "A circular path runs round a round garden. Which gives the path's area?",
      "एक गोल बगीचे के चारों ओर गोल पथ है। पथ का क्षेत्रफल किससे मिलेगा?",
    ),
    t("outer circle − inner circle", "बाहरी वृत्त − भीतरी वृत्त"),
    [
      [t("outer circle + inner circle", "बाहरी वृत्त + भीतरी वृत्त"), flipped],
      [
        t("π × (path width)²", "π × (पथ की चौड़ाई)²"),
        t("The width isn't a radius. Use π(R² − r²).", "चौड़ाई त्रिज्या नहीं है। π(R² − r²) लो।"),
      ],
    ],
  ),
  track: plan(
    t(
      "A running track is two straight strips joined by two semicircular bands. Which gives its area?",
      "एक दौड़ पथ दो सीधी पट्टियों और दो अर्धवृत्ताकार पट्टियों से बना है। उसका क्षेत्रफल किससे मिलेगा?",
    ),
    t("2 rectangles + one full ring", "2 आयत + एक पूरा वलय"),
    [
      [t("2 rectangles + one half ring", "2 आयत + एक आधा वलय"), missing],
      [t("2 rectangles − one full ring", "2 आयत − एक पूरा वलय"), flipped],
    ],
  ),
  leaf: plan(
    t(
      "Two quadrants drawn from opposite corners of a square overlap in a leaf. Which gives the leaf's area?",
      "वर्ग के सम्मुख कोनों से बने दो चतुर्थांश एक पत्ती में मिलते हैं। पत्ती का क्षेत्रफल किससे मिलेगा?",
    ),
    t("2 quadrants − square", "2 चतुर्थांश − वर्ग"),
    [
      [t("2 quadrants + square", "2 चतुर्थांश + वर्ग"), flipped],
      [
        t("square − 1 quadrant", "वर्ग − 1 चतुर्थांश"),
        t(
          "That's the corner left outside one quadrant, not the overlap.",
          "यह एक चतुर्थांश के बाहर बचा कोना है, ओवरलैप नहीं।",
        ),
      ],
    ],
  ),
  pacman: plan(
    t(
      "A circle sits at a triangle's corner; the shaded shape is the triangle together with the circle's outside part. Which gives it?",
      "एक वृत्त त्रिभुज के कोने पर है; छायांकित आकार त्रिभुज और वृत्त का बाहरी भाग है। वह किससे मिलेगा?",
    ),
    t("triangle + major sector", "त्रिभुज + दीर्घ त्रिज्यखंड"),
    [
      [
        t("triangle + whole circle", "त्रिभुज + पूरा वृत्त"),
        t(
          "That counts the sector inside the triangle twice.",
          "इसमें त्रिभुज के अंदर का त्रिज्यखंड दो बार गिना।",
        ),
      ],
      [t("triangle − minor sector", "त्रिभुज − लघु त्रिज्यखंड"), flipped],
    ],
  ),
  petals: plan(
    t(
      "Four semicircles drawn inward on a square's sides make petals. Which gives the petals' area?",
      "वर्ग की भुजाओं पर अंदर की ओर बने चार अर्धवृत्त पंखुड़ियाँ बनाते हैं। पंखुड़ियों का क्षेत्रफल किससे मिलेगा?",
    ),
    t("4 semicircles − square", "4 अर्धवृत्त − वर्ग"),
    [
      [
        t("square − 4 semicircles", "वर्ग − 4 अर्धवृत्त"),
        t(
          "That's negative: the semicircles overlap, so together they're bigger than the square.",
          "यह ऋणात्मक है: अर्धवृत्त एक-दूसरे पर आते हैं, तो मिलकर वर्ग से बड़े हैं।",
        ),
      ],
      [t("4 semicircles + square", "4 अर्धवृत्त + वर्ग"), flipped],
    ],
  ),
} as const;

export const addOrSubtract = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.CombinationsOfFigures],
});
