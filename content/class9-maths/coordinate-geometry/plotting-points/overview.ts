import { page, t } from "@chalk/author";
import { wordsOn } from "@chalk/patterns";
import { coordinatePlaneDef } from "@chalk/prop-coordinates";

const r = String.raw;

/**
 * NCERT 3.3 and 3.4: given the coordinates, place the point ("plotting"): from O, go x along the
 * x-axis, then y parallel to the y-axis. State → see it hold: the method, then the student walks
 * Example 3's points and swaps them (the ordered pair), Example 4's table with halves, Activity 2,
 * the Remark on other graphs, and the chapter's summary.
 */

/** Fig 3.15: plotting (3, 5) and (5, −4) by walking from O. */
const plotting = page("plotting", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "State the method (Fig 3.15): to plot (3, 5), start at O, count 3 units along the x-axis to A, then 5 units parallel to the y-axis to P. Q(5, −4) goes down, into quadrant IV. The walker does it step by step.",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    x: 3,
    y: 5,
    canSetNumbers: true,
    canWalk: true,
    isMovable: false,
    showPerpendiculars: false,
    pairs: [
      { x: 3, y: 5 },
      { x: 5, y: -4 },
    ],
  });
  b.standsFor(plane, "a walker goes from O along x, then parallel to the y-axis, and leaves a dot");
  return [
    w.title(t("Plotting points", "बिंदु आलेखित करना")),
    w.body(
      t(
        "So far we read a point's coordinates. Now the other way: given the coordinates, place the point. This is called **plotting** the point.",
        "अब तक हमने बिंदु के निर्देशांक पढ़े। अब उलटा: निर्देशांक दिए हों, तो बिंदु रखो। इसे बिंदु **आलेखित करना** कहते हैं।",
      ),
    ),
    w.definition(
      t(
        "To plot $(3, 5)$: start at O. Go **3** units along the x-axis. From there, go **5** units parallel to the y-axis. Mark the point.",
        "$(3, 5)$ आलेखित करने के लिए: O से शुरू करो। x-अक्ष के साथ **3** इकाई चलो। वहाँ से y-अक्ष के समांतर **5** इकाई चलो। बिंदु अंकित करो।",
      ),
      "method",
    ),
    plane,
    w.body(
      t(
        "Now plot $(5, -4)$: 5 along the x-axis, then 4 **down**, because its y-coordinate is negative. It lands in quadrant IV, since it is $(+, -)$.",
        "अब $(5, -4)$ आलेखित करो: x-अक्ष के साथ 5, फिर 4 **नीचे**, क्योंकि उसका y-निर्देशांक ऋणात्मक है। यह चतुर्थांश IV में आता है, क्योंकि यह $(+, -)$ है।",
      ),
    ),
  ];
});

/** Example 3 and the Note: (x, y) and (y, x) are different points unless x = y. */
const ordered = page("ordered-pair", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Example 3 plotted pair by pair: (5, 0) and (0, 5), (5, 2) and (2, 5), (−3, 5) and (5, −3) land in different places. So (x, y) is an ordered pair: (x, y) ≠ (y, x) when x ≠ y, and (x, y) = (y, x) when x = y.",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    x: 5,
    y: 2,
    canSetNumbers: true,
    canWalk: true,
    isMovable: false,
    showPerpendiculars: false,
    showQuadrants: false,
    // Example 3's eight points, one tap each.
    pairs: [
      { x: 5, y: 0 },
      { x: 0, y: 5 },
      { x: 2, y: 5 },
      { x: 5, y: 2 },
      { x: -3, y: 5 },
      { x: -3, y: -5 },
      { x: 5, y: -3 },
      { x: 6, y: 1 },
    ],
    swapLabel: t("Swap x and y", "x और y की अदला-बदली करो"),
  });
  b.standsFor(plane, "walk to a point, swap its two numbers, walk again: two different dots");
  return [
    w.title(t("Order matters", "क्रम मायने रखता है")),
    w.body(
      t(
        r`**Example 3.** Plot $(5, 0)$, $(0, 5)$, $(2, 5)$, $(5, 2)$, $(-3, 5)$, $(-3, -5)$, $(5, -3)$ and $(6, 1)$. Tap a pair, then walk to it. Compare $(5, 2)$ with $(2, 5)$, $(5, 0)$ with $(0, 5)$, and $(-3, 5)$ with $(5, -3)$.`,
        r`**उदाहरण 3.** $(5, 0)$, $(0, 5)$, $(2, 5)$, $(5, 2)$, $(-3, 5)$, $(-3, -5)$, $(5, -3)$ और $(6, 1)$ आलेखित करो। एक युग्म चुनो, फिर उस तक चलो। $(5, 2)$ की $(2, 5)$ से, $(5, 0)$ की $(0, 5)$ से, और $(-3, 5)$ की $(5, -3)$ से तुलना करो।`,
      ),
    ),
    plane,
    w.definition(
      t(
        r`Swapping the coordinates moves the point, so their order matters. That is why $(x, y)$ is called an **ordered pair**: $(x, y) \ne (y, x)$ when $x \ne y$, and $(x, y) = (y, x)$ only when $x = y$.`,
        r`निर्देशांक बदलने से बिंदु हट जाता है, इसलिए उनका क्रम मायने रखता है। इसीलिए $(x, y)$ को **क्रमित युग्म** कहते हैं: $x \ne y$ हो तो $(x, y) \ne (y, x)$, और $(x, y) = (y, x)$ केवल तब जब $x = y$।`,
      ),
      "orderedPair",
    ),
  ];
});

/** Example 4 (Fig 3.17): a table of pairs, with a decimal, (0, −3.5). */
const example4 = page("example-table", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Example 4 plotted: the table's pairs (−3, 7), (0, −3.5), (−1, −3), (4, 4), (2, −3); a coordinate can be a decimal, and (0, −3.5) sits halfway between −3 and −4 on the y-axis.",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    yMin: -6,
    yMax: 8,
    x: -3,
    y: 7,
    snap: 0.5,
    canSetNumbers: true,
    canWalk: true,
    isMovable: false,
    showPerpendiculars: false,
    // The table's five pairs, one tap each.
    pairs: [
      { x: -3, y: 7 },
      { x: 0, y: -3.5 },
      { x: -1, y: -3 },
      { x: 4, y: 4 },
      { x: 2, y: -3 },
    ],
  });
  b.standsFor(plane, "a plane in half units: walk to each pair of the table in turn");
  return [
    w.title(t("Plotting from a table", "सारणी से आलेखन")),
    w.body(
      t(
        "**Example 4.** Plot these pairs $(x, y)$ as points.",
        "**उदाहरण 4.** इन युग्मों $(x, y)$ को बिंदुओं के रूप में आलेखित करो।",
      ),
    ),
    w.body(
      t(
        r`$$\begin{array}{c|ccccc} x & -3 & 0 & -1 & 4 & 2 \\ \hline y & 7 & -3.5 & -3 & 4 & -3 \end{array}$$`,
        r`$$\begin{array}{c|ccccc} x & -3 & 0 & -1 & 4 & 2 \\ \hline y & 7 & -3.5 & -3 & 4 & -3 \end{array}$$`,
      ),
    ),
    w.body(
      t(
        r`Each column is one point: $(-3, 7)$, $(0, -3.5)$, $(-1, -3)$, $(4, 4)$, $(2, -3)$. Tap each pair and walk to it.`,
        r`हर स्तंभ एक बिंदु है: $(-3, 7)$, $(0, -3.5)$, $(-1, -3)$, $(4, 4)$, $(2, -3)$। हर युग्म चुनो और उस तक चलो।`,
      ),
    ),
    plane,
    w.note(
      t(
        r`Coordinates need not be whole numbers. $(0, -3.5)$ is on the y-axis, halfway between $-3$ and $-4$.`,
        r`निर्देशांक पूर्ण संख्याएँ ही हों, ज़रूरी नहीं। $(0, -3.5)$, y-अक्ष पर $-3$ और $-4$ के ठीक बीच में है।`,
      ),
    ),
  ];
});

/** Activity 2 (the dice game) and the Remark on other graphs. */
const game = page("dice-game", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Activity 2, a game for two on graph paper with two dice, practises moving by (red, green); the Remark: graphs from earlier classes (time–distance, side–perimeter) are the same plane with axes named t, d, s or p.",
  );
  return [
    w.title(t("A game and other graphs", "एक खेल और दूसरे आलेख")),
    w.body(
      t(
        "**A game for two.** You need graph paper, two counters and two dice of different colours, red and green. Both counters start at $(0, 0)$.",
        "**दो लोगों का खेल।** ग्राफ़ पेपर, दो गोटियाँ और दो अलग रंग के पासे चाहिए, लाल और हरा। दोनों गोटियाँ $(0, 0)$ से शुरू होती हैं।",
      ),
    ),
    w.body(
      t(
        r`Throw both dice. If red shows 3 and green shows 1, move your counter to $(3, 1)$. Next turn, if red shows 1 and green 4, move from $(3, 1)$ to $(3 + 1, 1 + 4) = (4, 5)$.`,
        r`दोनों पासे फेंको। अगर लाल पर 3 और हरे पर 1 आए, तो गोटी $(3, 1)$ पर ले जाओ। अगली बारी में, अगर लाल पर 1 और हरे पर 4 आए, तो $(3, 1)$ से $(3 + 1, 1 + 4) = (4, 5)$ पर जाओ।`,
      ),
    ),
    w.body(
      t(
        r`The first to reach $(10, 10)$ wins, without going past: neither coordinate may be more than 10. If you land on the other counter, it goes back to $(0, 0)$. If you can't move without going past, you miss your turn.`,
        r`जो पहले $(10, 10)$ पर पहुँचे, वह जीतता है, बिना आगे निकले: कोई भी निर्देशांक 10 से ज़्यादा नहीं हो सकता। अगर तुम दूसरी गोटी पर पहुँचो, तो वह $(0, 0)$ पर लौट जाती है। अगर बिना आगे निकले चल नहीं सकते, तो तुम्हारी बारी छूट जाती है।`,
      ),
    ),
    w.note(
      t(
        "The graphs you drew in earlier classes, such as time–distance graphs, are this same plane. Only the axes have other names: a t-axis and a d-axis instead of the x-axis and the y-axis.",
        "पिछली कक्षाओं में बनाए आलेख, जैसे समय–दूरी आलेख, यही तल हैं। बस अक्षों के नाम अलग हैं: x-अक्ष और y-अक्ष की जगह t-अक्ष और d-अक्ष।",
      ),
    ),
  ];
});

/** 3.4: the chapter's summary. */
const summary = page("summary", (b) => {
  const w = wordsOn(b);
  b.purpose("The chapter's summary (3.4): every term and fact, in one place, to revise from.");
  return [
    w.title(t("Summary", "सारांश")),
    w.definition(
      t(
        "To fix a point in a plane we need **two perpendicular lines**: one horizontal, the **x-axis**, and one vertical, the **y-axis**. They are the **coordinate axes**, and they cross at the **origin**, O.",
        "समतल में बिंदु तय करने के लिए **दो लंब रेखाएँ** चाहिए: एक क्षैतिज, **x-अक्ष**, और एक ऊर्ध्वाधर, **y-अक्ष**। ये **निर्देशांक अक्ष** हैं, और **मूलबिंदु** O पर काटते हैं।",
      ),
      "axes",
    ),
    w.definition(
      t(
        "The plane is the **Cartesian plane**, or coordinate plane. The axes divide it into four **quadrants**, I to IV, anticlockwise.",
        "इस तल को **कार्तीय तल** या निर्देशांक तल कहते हैं। अक्ष इसे चार **चतुर्थांशों** में बाँटते हैं, I से IV, वामावर्त।",
      ),
      "plane",
    ),
    w.definition(
      t(
        "A point's distance from the y-axis is its **x-coordinate** (abscissa); its distance from the x-axis is its **y-coordinate** (ordinate). Its **coordinates** are $(x, y)$.",
        "किसी बिंदु की y-अक्ष से दूरी उसका **x-निर्देशांक** (भुज) है; x-अक्ष से दूरी उसका **y-निर्देशांक** (कोटि) है। उसके **निर्देशांक** $(x, y)$ हैं।",
      ),
      "coordinates",
    ),
    w.definition(
      t(
        r`On the x-axis a point is $(x, 0)$; on the y-axis, $(0, y)$. The origin is $(0, 0)$.`,
        r`x-अक्ष पर बिंदु $(x, 0)$ है; y-अक्ष पर $(0, y)$। मूलबिंदु $(0, 0)$ है।`,
      ),
      "onAxes",
    ),
    w.definition(
      t(
        r`The signs are $(+, +)$ in quadrant I, $(-, +)$ in II, $(-, -)$ in III and $(+, -)$ in IV.`,
        r`चिह्न चतुर्थांश I में $(+, +)$, II में $(-, +)$, III में $(-, -)$ और IV में $(+, -)$ होते हैं।`,
      ),
      "signs",
    ),
    w.definition(
      t(
        r`If $x \ne y$, then $(x, y) \ne (y, x)$; and $(x, y) = (y, x)$ if $x = y$.`,
        r`अगर $x \ne y$, तो $(x, y) \ne (y, x)$; और $(x, y) = (y, x)$ अगर $x = y$।`,
      ),
      "order",
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [plotting, ordered, example4, game, summary];
