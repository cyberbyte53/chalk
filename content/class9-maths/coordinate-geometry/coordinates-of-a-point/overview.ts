import { hidden, page, place, scene, t, tap } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { choice, plane, words } from "@chalk/patterns";
import {
  Choosing,
  Marks,
  PlaceKind,
  Reading,
  Roads,
  Scene,
  Tone,
  coordinatePlane,
} from "@chalk/prop-coordinates";

const { setup, walkTo } = plane;

/**
 * Graph paper with the axes as Fig. 3.10 has them: P at (4, 3) and Q at (−6, −2) both on it, and
 * a unit past Q to the left, so X′ at the axis's end isn't drawn on Q.
 */
const GRAPH = { xMin: -7.5, xMax: 6.5, yMin: -4.5, yMax: 4.5 };
/** Fig. 3.11 and 3.12: −5 to 5 each way. */
const FIVE = { xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 };
/** Fig. 3.14: D at x = 6, L at y = 5, E and C at y = −5, each a unit clear of the axes' end names. */
const FIG_3_14 = { xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 7.5 };

/** The axes as the last lesson left them: numbered, O at the crossing, the directions named. */
const AXES = {
  marks: Marks.Numbers,
  numbered: ["x", "y"] as ("x" | "y")[],
  hasGrid: true,
  showAxisNames: false,
  showDirections: true,
};

/** A point a figure names, shown, with or without its dashed lines to the axes. */
const point = (name: string, x: number, y: number, hasDropLines = true) => ({
  name,
  x,
  y,
  isShown: true,
  hasDropLines,
  tone: Tone.Main,
});

/** A number as the book writes it, and in a language's words: "−3", "minus 3". */
const shown = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const spoken = (n: number, minus: string) => (n < 0 ? `${minus} ${-n}` : `${n}`);

/** An axis letter in a Hindi line: written x, said एक्स. */
const hiLetter = (v: "x" | "y") => (v === "x" ? "[[x|एक्स]]" : "[[y|वाई]]");

/** A pair as a mark: shown (−3, 5), said "minus 3, 5" in a language's words. */
const pairMark = (minus: string) => (x: number, y: number) =>
  `[[(${shown(x)}, ${shown(y)})|${spoken(x, minus)}, ${spoken(y, minus)}]]`;
const pairEn = pairMark("minus");
const pairHi = pairMark("माइनस");

/** "x = −3" in a sentence, as a mark: said "x is minus 3", in Hindi "एक्स माइनस 3 है". */
const isEn = (v: "x" | "y", n: number) =>
  `[[${v}\u00a0=\u00a0${shown(n)}|${v} is ${spoken(n, "minus")}]]`;
const isHi = (v: "x" | "y", n: number) =>
  `[[${v}\u00a0=\u00a0${shown(n)}|${v === "x" ? "एक्स" : "वाई"} ${spoken(n, "माइनस")} है]]`;

/** A wrong option: its pair, and its note. */
type Slip = { pair: string; note: Localized };

/**
 * The slips reading a point off a figure: its pair written y first, and each sign the wrong way.
 * For a point off the axes (both coordinates not 0).
 */
function slipsOf(name: string, x: number, y: number): Slip[] {
  const lr = x < 0 ? ["left", "बाईं"] : ["right", "दाईं"];
  const ud = y < 0 ? ["below", "नीचे"] : ["above", "ऊपर"];
  const sign = (v: number) => (v < 0 ? ["negative", "ऋणात्मक"] : ["positive", "धनात्मक"]);
  const pairOf = (a: number, b: number) => `(${shown(a)}, ${shown(b)})`;
  return [
    {
      pair: pairOf(y, x),
      note: t(
        `That is y first. ${name} is ${Math.abs(x)} units ${lr[0]} of the y-axis, so ${isEn("x", x)}, written first.`,
        `यह ${hiLetter("y")} पहले है। ${name}, ${hiLetter("y")}-अक्ष से ${Math.abs(x)} इकाई ${lr[1]} ओर है, इसलिए ${isHi("x", x)}, जो पहले लिखा जाता है।`,
      ),
    },
    {
      pair: pairOf(-x, y),
      note: t(
        `That point is on the other side of the y-axis. ${name} is ${lr[0]} of it, so its x-coordinate is ${sign(x)[0]}.`,
        `वह बिंदु ${hiLetter("y")}-अक्ष की दूसरी ओर है। ${name} उसके ${lr[1]} ओर है, इसलिए उसका ${hiLetter("x")}-निर्देशांक ${sign(x)[1]} है।`,
      ),
    },
    {
      pair: pairOf(x, -y),
      note: t(
        `That point is on the other side of the x-axis. ${name} is ${ud[0]} it, so its y-coordinate is ${sign(y)[0]}.`,
        `वह बिंदु ${hiLetter("x")}-अक्ष की दूसरी ओर है। ${name} उसके ${ud[1]} है, इसलिए उसका ${hiLetter("y")}-निर्देशांक ${sign(y)[1]} है।`,
      ),
    },
  ];
}

/** "What are the coordinates of B?": its pair, and the slips with their notes. */
function pairQuestion(name: string, right: string, slips: readonly Slip[]) {
  return choice({
    prompt: t(`What are the coordinates of ${name}?`, `${name} के निर्देशांक क्या हैं?`),
    options: [
      { id: "right", label: t(right, right) },
      ...slips.map((w, i) => ({
        id: `slip${i}`,
        label: t(w.pair, w.pair),
        feedback: w.note,
      })),
    ],
    answer: "right",
  });
}

/** How far a point is from each axis: P and Q on graph paper, walked to as Riya walked in town. */
const distancesFromAxes = page(
  "distances-from-axes",
  scene({
    pieces: {
      title: words.title(t("How far from each axis", "हर अक्ष से कितनी दूर")),
      link: words.body(
        t(
          "In Riya's town, a house was found by walking: along the main road, then up or down a street. Riya and Aman now plan the fair ground on graph paper, with the axes drawn on it. Any point on it is found the same way: by **how far it is from each axis**.",
          "रिया के शहर में, मकान चलकर मिलता था: मुख्य सड़क के साथ, फिर गली में ऊपर या नीचे। रिया और अमन अब ग्राफ़ पेपर पर मेले के मैदान का नक्शा बना रहे हैं, जिस पर अक्ष खिंचे हैं। उस पर हर बिंदु इसी तरह मिलता है: **हर अक्ष से वह कितनी दूर है**, इससे।",
        ),
      ),
      toP: words.body(
        t(
          "**Walk Riya from O to P**, along the lines of the graph paper.",
          "**रिया को O से P तक ले चलो**, ग्राफ़ पेपर की रेखाओं पर।",
        ),
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            window: GRAPH,
            ...AXES,
            points: [point("P", 4, 3), point("Q", -6, -2)],
          },
          walker: {
            walkFrom: { x: 0, y: 0 },
            at: { x: 0, y: 0 },
            roads: Roads.Grid,
            showWhere: false,
          },
        }),
      ),
      atP: hidden(
        words.definition(
          t(
            "**P is 4 units from the y-axis, measured along the x-axis, in the positive direction [[OX|O X]]. It is 3 units from the x-axis, measured along the y-axis, in the positive direction [[OY|O Y]].** Riya walked them: 4 along and 3 up, whichever way she went, the distances are the same.",
            "**P, [[y|वाई]]-अक्ष से 4 इकाई दूर है, जो [[x|एक्स]]-अक्ष के साथ धनात्मक दिशा [[OX|O X]] में मापी जाती है। वह [[x|एक्स]]-अक्ष से 3 इकाई दूर है, जो [[y|वाई]]-अक्ष के साथ धनात्मक दिशा [[OY|O Y]] में मापी जाती है।** रिया ने यही चला: 4 आगे और 3 ऊपर, वह किसी भी क्रम में चली हो, दूरियाँ वही हैं।",
          ),
        ),
      ),
      toQ: hidden(
        words.body(
          t("She is back at O. **Now walk her to Q.**", "वह फिर O पर है। **अब उसे Q तक ले चलो।**"),
        ),
      ),
      atQ: hidden(
        words.definition(
          t(
            "**Q is 6 units from the y-axis, measured along the negative direction [[OX′|O X dash]], and 2 units from the x-axis, measured along the negative direction [[OY′|O Y dash]].** Her walk: 6 to the left and 2 down, in either order.",
            "**Q, [[y|वाई]]-अक्ष से 6 इकाई दूर है, जो ऋणात्मक दिशा [[OX′|O X डैश]] में मापी जाती है, और [[x|एक्स]]-अक्ष से 2 इकाई दूर, जो ऋणात्मक दिशा [[OY′|O Y डैश]] में मापी जाती है।** उसकी चाल: 6 बाईं ओर और 2 नीचे, किसी भी क्रम में।",
          ),
        ),
      ),
    },
    passBy: "rules",
    hear: {
      // P first: Riya back at O for Q. Her trail is each distance: along one axis, then the other.
      "sheet.walker.stepped": (me, p, t) =>
        p.x === 4 && p.y === 3 && me.hidden.includes("atP")
          ? [
              t.self.show({ name: "atP" }),
              t.to.sheet.walker.backToStart({}),
              t.self.show({ name: "toQ" }),
            ]
          : p.x === -6 &&
            p.y === -2 &&
            !me.hidden.includes("atP") && [t.self.show({ name: "atQ" }), t.self.pass()],
    },
    witness: [...walkTo("sheet", 4, 3), ...walkTo("sheet", -6, -2)],
  }),
);

/** The distances with their signs: the x-coordinate (abscissa) and the y-coordinate (ordinate). */
const abscissaAndOrdinate = page(
  "abscissa-and-ordinate",
  scene({
    pieces: {
      title: words.title(t("Abscissa and ordinate", "भुज और कोटि")),
      link: words.body(
        t(
          "P is 4 units from the y-axis and Q is 6, on opposite sides of it. A sign tells the sides apart, as on a number line.",
          "P, y-अक्ष से 4 इकाई दूर है और Q 6 इकाई, उसकी उलटी ओर। एक चिह्न दोनों ओर को अलग बताता है, जैसे संख्या रेखा पर।",
        ),
      ),
      abscissa: words.definition(
        t(
          "**The x-coordinate of a point is its perpendicular distance from the y-axis, measured along the x-axis: positive along [[OX|O X]], negative along [[OX′|O X dash]]. It is also called the abscissa.**",
          "**किसी बिंदु का [[x|एक्स]]-निर्देशांक, [[y|वाई]]-अक्ष से उसकी लंब दूरी है, जो [[x|एक्स]]-अक्ष के साथ मापी जाती है: [[OX|O X]] की ओर धनात्मक, [[OX′|O X डैश]] की ओर ऋणात्मक। इसे भुज भी कहते हैं।**",
        ),
      ),
      ordinate: words.definition(
        t(
          "**The y-coordinate of a point is its perpendicular distance from the x-axis, measured along the y-axis: positive along [[OY|O Y]], negative along [[OY′|O Y dash]]. It is also called the ordinate.**",
          "**किसी बिंदु का [[y|वाई]]-निर्देशांक, [[x|एक्स]]-अक्ष से उसकी लंब दूरी है, जो [[y|वाई]]-अक्ष के साथ मापी जाती है: [[OY|O Y]] की ओर धनात्मक, [[OY′|O Y डैश]] की ओर ऋणात्मक। इसे कोटि भी कहते हैं।**",
        ),
      ),
      ofPQ: words.body(
        t(
          "So P has x-coordinate [[+4|plus 4]] and y-coordinate [[+3|plus 3]]. Q has x-coordinate [[−6|minus 6]] and y-coordinate [[−2|minus 2]].",
          "इसलिए P का [[x|एक्स]]-निर्देशांक [[+4|धन 4]] और [[y|वाई]]-निर्देशांक [[+3|धन 3]] है। Q का [[x|एक्स]]-निर्देशांक [[−6|माइनस 6]] और [[y|वाई]]-निर्देशांक [[−2|माइनस 2]] है।",
        ),
      ),
      sheet: place(
        coordinatePlane,
        setup({
          // No marker at Q: the words say where it is, and the point's own labels say when it is there.
          plane: { window: GRAPH, ...AXES },
          reading: { point: { x: 4, y: 3 }, pointStep: 1, reading: Reading.Abscissa, unit: "" },
        }),
      ),
      ask: words.body(
        t(
          "The point is at P. **Drag it to where [[x\u00a0=\u00a0−6|x is minus 6]] and [[y\u00a0=\u00a0−2|y is minus 2]]**: that is Q. Watch each sign change as it crosses an axis.",
          "बिंदु P पर है। **उसे वहाँ खींचो जहाँ [[x\u00a0=\u00a0−6|एक्स माइनस 6]] और [[y\u00a0=\u00a0−2|वाई माइनस 2]] है**: वही Q है। देखो कि अक्ष पार करते ही हर चिह्न कैसे बदलता है।",
        ),
      ),
      crossing: hidden(
        words.body(
          t(
            "**Crossing the y-axis changes the sign of x; crossing the x-axis changes the sign of y.** The distances stay distances: the sign says which side.",
            "**[[y|वाई]]-अक्ष पार करने पर [[x|एक्स]] का चिह्न बदलता है; [[x|एक्स]]-अक्ष पार करने पर [[y|वाई]] का।** दूरियाँ दूरियाँ ही रहती हैं: चिह्न बताता है कि किस ओर।",
          ),
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "sheet.reading.moved": (_, p, t) =>
        p.x === -6 && p.y === -2 && [t.self.show({ name: "crossing" }), t.self.pass()],
    },
    witness: [tap("sheet.reading", "movePoint", { x: -6, y: -2 })],
  }),
);

/** The coordinates written as a pair, x first; the order an agreement the whole world keeps. */
const writingCoordinates = page(
  "writing-coordinates",
  scene({
    pieces: {
      title: words.title(t("Writing the coordinates", "निर्देशांक लिखना")),
      pair: words.definition(
        t(
          "**The coordinates of a point are written x-coordinate first, then y-coordinate, in brackets: P is [[(4, 3)|the point 4, 3,]] and Q is [[(−6, −2)|the point minus 6, minus 2]].**",
          "**किसी बिंदु के निर्देशांक पहले [[x|एक्स]]-निर्देशांक, फिर [[y|वाई]]-निर्देशांक, कोष्ठक में लिखे जाते हैं: P है [[(4, 3)|बिंदु 4, 3,]] और Q है [[(−6, −2)|बिंदु माइनस 6, माइनस 2]]।**",
        ),
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: { window: FIVE, ...AXES, points: [point("P", 4, 3, false)] },
          // Away from P, which stays marked: the point the student moves is another.
          reading: { point: { x: -3, y: 2 }, pointStep: 1, reading: Reading.Pair, unit: "" },
        }),
      ),
      ask: words.body(
        t(
          "**Drag the point anywhere on the plane:** its coordinates go with it. Then put it at **[[(3, 4)|the point 3, 4]]**.",
          "**बिंदु को तल पर कहीं भी खींचो:** उसके निर्देशांक उसके साथ चलते हैं। फिर उसे **[[(3, 4)|बिंदु 3, 4]]** पर रखो।",
        ),
      ),
      notP: hidden(
        words.body(
          t(
            "**[[(3, 4)|The point 3, 4]] is not P.** The same two numbers in the other order are another point: 3 along and 4 up, not 4 along and 3 up. The coordinates name exactly one point.",
            "**[[(3, 4)|बिंदु 3, 4]], P नहीं है।** वही दो संख्याएँ उलटे क्रम में एक दूसरा बिंदु हैं: 3 आगे और 4 ऊपर, न कि 4 आगे और 3 ऊपर। निर्देशांक ठीक एक ही बिंदु बताते हैं।",
          ),
        ),
      ),
      agreement: hidden(
        words.body(
          t(
            'Why x first? Nothing in mathematics makes it so. It is an **agreement** kept all over the world, so a pair means the same point to everyone, as Aman\'s address did: Street 4, House 5, the street first. Lewis Carroll once joked that the lines on a map "are merely conventional signs": agreed, not discovered.',
            'x पहले क्यों? गणित में ऐसा कुछ नहीं जो इसे ज़रूरी बनाए। यह पूरी दुनिया में माना गया एक **समझौता** है, ताकि एक जोड़ा सबके लिए एक ही बिंदु बताए, जैसे अमन का पता बताता था: गली 4, मकान 5, गली पहले। लुईस कैरल ने एक बार मज़ाक में कहा था कि नक्शे की रेखाएँ "बस माने हुए चिह्न हैं": तय की गई, खोजी नहीं गई।',
          ),
        ),
      ),
      plan: hidden(
        words.body(
          t(
            "On the fair ground's plan, the two main paths are the axes, crossing at O. Riya writes where the first stalls stand: **snacks at [[(3, 2)|the point 3, 2]], books at [[(−4, 1)|the point minus 4, 1]]**. **Tap a stall** to see its coordinates.",
            "मेले के मैदान के नक्शे पर दो मुख्य रास्ते अक्ष हैं, जो O पर काटते हैं। रिया पहले स्टॉल की जगहें लिखती है: **नाश्ता [[(3, 2)|बिंदु 3, 2]] पर, किताबें [[(−4, 1)|बिंदु माइनस 4, 1]] पर**। उसके निर्देशांक देखने के लिए **किसी स्टॉल को दबाओ**।",
          ),
        ),
      ),
      ground: hidden(
        place(
          coordinatePlane,
          setup({
            plane: {
              window: FIVE,
              ...AXES,
              hasGrid: false,
              scene: Scene.FairGround,
              showDirections: false,
            },
            places: {
              placeKind: PlaceKind.Stall,
              places: [
                { x: 3, y: 2, label: t("Snacks", "नाश्ता") },
                { x: -4, y: 1, label: t("Books", "किताबें") },
              ],
              choosing: Choosing.Always,
              showAddress: true,
              targetName: t("The stall you tapped", "तुम्हारा चुना स्टॉल"),
            },
          }),
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "sheet.reading.moved": (_, p, t) =>
        p.x === 3 &&
        p.y === 4 && [
          t.self.show({ name: "notP" }),
          t.self.show({ name: "agreement" }),
          t.self.show({ name: "ground" }),
          t.self.show({ name: "plan" }),
          t.self.pass(),
        ],
    },
    witness: [tap("sheet.reading", "movePoint", { x: 3, y: 4 })],
  }),
);

/** Example 1, asked: each of B, M, L and S read off Fig. 3.11, one at a time, its reason after. */
const askB = pairQuestion("B", "(4, 3)", slipsOf("B", 4, 3));
const askM = pairQuestion("M", "(−3, 4)", slipsOf("M", -3, 4));
const askL = pairQuestion("L", "(−5, −4)", slipsOf("L", -5, -4));
const askS = pairQuestion("S", "(3, −4)", slipsOf("S", 3, -4));

const readingPoints = page(
  "reading-points",
  scene({
    pieces: {
      title: words.title(t("Reading a point's coordinates", "बिंदु के निर्देशांक पढ़ना")),
      q: words.body(
        t(
          "Read the coordinates of B, M, L and S in the figure, one at a time: follow each point's dashed lines to the axes.",
          "आकृति में B, M, L और S के निर्देशांक एक-एक करके पढ़ो: हर बिंदु की बिंदीदार रेखाओं को अक्षों तक देखो।",
        ),
      ),
      figure: place(
        coordinatePlane,
        setup({
          plane: {
            window: FIVE,
            ...AXES,
            points: [point("B", 4, 3), point("M", -3, 4), point("L", -5, -4), point("S", 3, -4)],
          },
        }),
      ),
      pairOfB: askB,
      b: hidden(
        words.body(
          t(
            "B is 4 units from the y-axis along [[OX|O X]] and 3 units from the x-axis along [[OY|O Y]]: abscissa 4, ordinate 3, coordinates [[(4, 3)|4, 3]].",
            "B, [[y|वाई]]-अक्ष से [[OX|O X]] की ओर 4 इकाई और [[x|एक्स]]-अक्ष से [[OY|O Y]] की ओर 3 इकाई दूर है: भुज 4, कोटि 3, निर्देशांक [[(4, 3)|4, 3]]।",
          ),
        ),
      ),
      pairOfM: hidden(askM),
      m: hidden(
        words.body(
          t(
            "M is 3 units from the y-axis along [[OX′|O X dash]] and 4 units from the x-axis along [[OY|O Y]]: abscissa [[−3|minus 3]], ordinate 4, coordinates [[(−3, 4)|minus 3, 4]].",
            "M, [[y|वाई]]-अक्ष से [[OX′|O X डैश]] की ओर 3 इकाई और [[x|एक्स]]-अक्ष से [[OY|O Y]] की ओर 4 इकाई दूर है: भुज [[−3|माइनस 3]], कोटि 4, निर्देशांक [[(−3, 4)|माइनस 3, 4]]।",
          ),
        ),
      ),
      pairOfL: hidden(askL),
      l: hidden(
        words.body(
          t(
            "L is 5 units from the y-axis along [[OX′|O X dash]] and 4 units from the x-axis along [[OY′|O Y dash]]: abscissa [[−5|minus 5]], ordinate [[−4|minus 4]], coordinates [[(−5, −4)|minus 5, minus 4]].",
            "L, [[y|वाई]]-अक्ष से [[OX′|O X डैश]] की ओर 5 इकाई और [[x|एक्स]]-अक्ष से [[OY′|O Y डैश]] की ओर 4 इकाई दूर है: भुज [[−5|माइनस 5]], कोटि [[−4|माइनस 4]], निर्देशांक [[(−5, −4)|माइनस 5, माइनस 4]]।",
          ),
        ),
      ),
      pairOfS: hidden(askS),
      s: hidden(
        words.body(
          t(
            "S is 3 units from the y-axis along [[OX|O X]] and 4 units from the x-axis along [[OY′|O Y dash]]: abscissa 3, ordinate [[−4|minus 4]], coordinates [[(3, −4)|3, minus 4]].",
            "S, [[y|वाई]]-अक्ष से [[OX|O X]] की ओर 3 इकाई और [[x|एक्स]]-अक्ष से [[OY′|O Y डैश]] की ओर 4 इकाई दूर है: भुज 3, कोटि [[−4|माइनस 4]], निर्देशांक [[(3, −4)|3, माइनस 4]]।",
          ),
        ),
      ),
    },
    passBy: "rules",
    // One point at a time: each right answer brings its reason, then the next point.
    hear: {
      "pairOfB.correct": (_, __, t) => [
        t.self.show({ name: "b" }),
        t.self.show({ name: "pairOfM" }),
      ],
      "pairOfM.correct": (_, __, t) => [
        t.self.show({ name: "m" }),
        t.self.show({ name: "pairOfL" }),
      ],
      "pairOfL.correct": (_, __, t) => [
        t.self.show({ name: "l" }),
        t.self.show({ name: "pairOfS" }),
      ],
      "pairOfS.correct": (_, __, t) => [t.self.show({ name: "s" }), t.self.pass()],
    },
  }),
);

/** Example 2, asked: B on the y-axis, C and E on the x-axis, each with an axis point's own slips. */
const onAxis = (
  name: string,
  axis: "x" | "y",
  [swappedPair, flippedPair, notZeroPair]: [string, string, string],
  dist: Localized,
): Slip[] => {
  const [zero, other]: ["x" | "y", "x" | "y"] = axis === "x" ? ["y", "x"] : ["x", "y"];
  return [
    {
      pair: swappedPair,
      note: t(
        `That is y first. ${name} is on the ${axis}-axis, so ${isEn(zero, 0)}, written ${zero === "x" ? "first" : "second"}.`,
        `यह ${hiLetter("y")} पहले है। ${name}, ${hiLetter(axis)}-अक्ष पर है, इसलिए ${isHi(zero, 0)}, जो ${zero === "x" ? "पहले" : "दूसरा"} लिखा जाता है।`,
      ),
    },
    {
      pair: flippedPair,
      note: t(
        `That point is on the other side of O. ${name} is ${dist.en}.`,
        `वह बिंदु O की दूसरी ओर है। ${name}, ${dist.hi} है।`,
      ),
    },
    {
      pair: notZeroPair,
      note: t(
        `${name} is on the ${axis}-axis: 0 units from it, so its ${zero}-coordinate is 0. Only its ${other}-coordinate isn't.`,
        `${name}, ${hiLetter(axis)}-अक्ष पर है: उससे 0 इकाई दूर, इसलिए उसका ${hiLetter(zero)}-निर्देशांक 0 है। केवल ${hiLetter(other)}-निर्देशांक 0 नहीं है।`,
      ),
    },
  ];
};
const askAxisB = pairQuestion(
  "B",
  "(0, 3)",
  onAxis(
    "B",
    "y",
    ["(3, 0)", "(0, −3)", "(3, 3)"],
    t("3 units above O, along [[OY|O Y]]", "O से [[OY|O Y]] की ओर 3 इकाई ऊपर"),
  ),
);
const askAxisC = pairQuestion(
  "C",
  "(−5, 0)",
  onAxis(
    "C",
    "x",
    ["(0, −5)", "(5, 0)", "(−5, −5)"],
    t("5 units left of O, along [[OX′|O X dash]]", "O से [[OX′|O X डैश]] की ओर 5 इकाई बाईं ओर"),
  ),
);
const askAxisE = pairQuestion(
  "E",
  "(⅔, 0)",
  onAxis(
    "E",
    "x",
    ["(0, ⅔)", "(−⅔, 0)", "(⅔, ⅔)"],
    t(
      "two-thirds of a unit right of O, along [[OX|O X]]",
      "O से [[OX|O X]] की ओर दो-तिहाई इकाई दाईं ओर",
    ),
  ),
);

/** On an axis one coordinate is 0; at O both are: dragged there, lit by y = 0, and Example 2. */
const pointsOnAxes = page(
  "points-on-axes",
  scene({
    pieces: {
      title: words.title(t("Points on the axes", "अक्षों पर बिंदु")),
      ask: words.body(
        t(
          "**Drag the point onto the x-axis**, then onto the y-axis, then onto O, and watch its coordinates.",
          "**बिंदु को [[x|एक्स]]-अक्ष पर खींचो**, फिर [[y|वाई]]-अक्ष पर, फिर O पर, और उसके निर्देशांक देखो।",
        ),
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: { window: FIVE, ...AXES },
          reading: { point: { x: 3, y: 2 }, pointStep: 1, reading: Reading.Pair, unit: "" },
          // y = 0 and x = 0, each a button: one alone lights its whole axis; both leave one point, O.
          clues: {
            hidden: null,
            canGiveClues: true,
            clueChoices: [
              { words: t("y = 0", "y = 0"), y: 0 },
              { words: t("x = 0", "x = 0"), x: 0 },
            ],
          },
        }),
      ),
      onX: hidden(
        words.definition(
          t(
            "**A point on the x-axis is 0 units from the x-axis, so its y-coordinate is 0: it is [[(x, 0)|the point x, 0]].** Press **[[y\u00a0=\u00a00|y equals 0]]**: every point with [[y\u00a0=\u00a00|y equal to 0]] lights up, and they make the whole x-axis. In Riya's town, a house on the main road needs no walk up the street: its second number is 0.",
            "**[[x|एक्स]]-अक्ष पर कोई बिंदु [[x|एक्स]]-अक्ष से 0 इकाई दूर है, इसलिए उसका [[y|वाई]]-निर्देशांक 0 है: वह [[(x, 0)|बिंदु एक्स, 0]] है।** **[[y\u00a0=\u00a00|वाई बराबर 0]]** दबाओ: [[y\u00a0=\u00a00|वाई बराबर 0]] वाले सारे बिंदु चमक उठते हैं, और वे पूरा [[x|एक्स]]-अक्ष बनाते हैं। रिया के शहर में, मुख्य सड़क पर बने मकान तक गली में ऊपर नहीं चलना पड़ता: उसकी दूसरी संख्या 0 है।",
          ),
        ),
      ),
      onY: hidden(
        words.definition(
          t(
            "**A point on the y-axis is 0 units from the y-axis, so its x-coordinate is 0: it is [[(0, y)|the point 0, y]].** Every point with [[x\u00a0=\u00a00|x equal to 0]] makes the whole y-axis. With **[[y\u00a0=\u00a00|y equals 0]]** pressed, press **[[x\u00a0=\u00a00|x equals 0]]** too: which points have both [[y\u00a0=\u00a00|y equal to 0]] and [[x\u00a0=\u00a00|x equal to 0]]?",
            "**[[y|वाई]]-अक्ष पर कोई बिंदु [[y|वाई]]-अक्ष से 0 इकाई दूर है, इसलिए उसका [[x|एक्स]]-निर्देशांक 0 है: वह [[(0, y)|बिंदु 0, वाई]] है।** [[x\u00a0=\u00a00|एक्स बराबर 0]] वाले सारे बिंदु मिलकर पूरा [[y|वाई]]-अक्ष बनाते हैं। **[[y\u00a0=\u00a00|वाई बराबर 0]]** दबाने के बाद **[[x\u00a0=\u00a00|एक्स बराबर 0]]** भी दबाओ: किन बिंदुओं का [[y\u00a0=\u00a00|वाई बराबर 0]] और [[x\u00a0=\u00a00|एक्स बराबर 0]] दोनों है?",
          ),
        ),
      ),
      atO: hidden(
        words.definition(
          t(
            "**The origin is 0 units from both axes, so its coordinates are [[(0, 0)|0, 0]].** It is the one point with both [[y\u00a0=\u00a00|y equal to 0]] and [[x\u00a0=\u00a00|x equal to 0]].",
            "**मूल बिंदु दोनों अक्षों से 0 इकाई दूर है, इसलिए उसके निर्देशांक [[(0, 0)|0, 0]] हैं।** यही वह एक बिंदु है जिसका [[y\u00a0=\u00a00|वाई बराबर 0]] और [[x\u00a0=\u00a00|एक्स बराबर 0]] दोनों हैं।",
          ),
        ),
      ),
      q: hidden(
        words.body(
          t(
            "Now read the points on the axes in the figure: A, C and E on the x-axis, B and D on the y-axis.",
            "अब आकृति में अक्षों पर बने बिंदु पढ़ो: A, C और E x-अक्ष पर, B और D y-अक्ष पर।",
          ),
        ),
      ),
      figure: hidden(
        place(
          coordinatePlane,
          setup({
            plane: {
              window: FIVE,
              ...AXES,
              points: [
                point("A", 4, 0, false),
                point("B", 0, 3, false),
                point("C", -5, 0, false),
                point("D", 0, -4, false),
                point("E", 2 / 3, 0, false),
              ],
            },
          }),
        ),
      ),
      pairOfB: hidden(askAxisB),
      whyB: hidden(
        words.body(
          t(
            "B is on the y-axis, 3 units from the x-axis along [[OY|O Y]]: **B is [[(0, 3)|the point 0, 3]]**.",
            "B, [[y|वाई]]-अक्ष पर है, [[x|एक्स]]-अक्ष से [[OY|O Y]] की ओर 3 इकाई: **B है [[(0, 3)|बिंदु 0, 3]]**।",
          ),
        ),
      ),
      pairOfC: hidden(askAxisC),
      whyC: hidden(
        words.body(
          t(
            "C is on the x-axis, 5 units from the y-axis along [[OX′|O X dash]]: **C is [[(−5, 0)|the point minus 5, 0]]**.",
            "C, [[x|एक्स]]-अक्ष पर है, [[y|वाई]]-अक्ष से [[OX′|O X डैश]] की ओर 5 इकाई: **C है [[(−5, 0)|बिंदु माइनस 5, 0]]**।",
          ),
        ),
      ),
      pairOfE: hidden(askAxisE),
      whyE: hidden(
        words.body(
          t(
            "E is on the x-axis, two-thirds of a unit from the y-axis along OX. So E is\n$$\\left(\\tfrac{2}{3},\\ 0\\right)$$",
            "E, x-अक्ष पर है, y-अक्ष से OX की ओर दो-तिहाई इकाई। इसलिए E है\n$$\\left(\\tfrac{2}{3},\\ 0\\right)$$",
          ),
          {
            says: t(
              "E is on the x-axis, two thirds of a unit from the y-axis along O X: E is the point two thirds, 0.",
              "E, एक्स-अक्ष पर है, वाई-अक्ष से O X की ओर दो तिहाई इकाई: E है बिंदु दो तिहाई, 0।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      // Example 2, one point at a time: each right answer brings its reason, then the next.
      "pairOfB.correct": (_, __, t) => [
        t.self.show({ name: "whyB" }),
        t.self.show({ name: "pairOfC" }),
      ],
      "pairOfC.correct": (_, __, t) => [
        t.self.show({ name: "whyC" }),
        t.self.show({ name: "pairOfE" }),
      ],
      "pairOfE.correct": (_, __, t) => [t.self.show({ name: "whyE" }), t.self.pass()],
      // O counts once the point has been on both axes: the y-axis rule is always met first.
      "sheet.reading.moved": (me, p, t) =>
        p.place === "x-axis"
          ? t.self.show({ name: "onX" })
          : p.place === "y-axis"
            ? !me.hidden.includes("onX") && t.self.show({ name: "onY" })
            : p.place === "O" &&
              !me.hidden.includes("onX") &&
              !me.hidden.includes("onY") && [
                t.self.show({ name: "atO" }),
                t.self.show({ name: "q" }),
                t.self.show({ name: "figure" }),
                t.self.show({ name: "pairOfB" }),
              ],
    },
    witness: [
      tap("sheet.reading", "movePoint", { x: 3, y: 0 }),
      tap("sheet.reading", "movePoint", { x: 0, y: 2 }),
      tap("sheet.reading", "movePoint", { x: 0, y: 0 }),
    ],
  }),
);

/** Where a point is: a quadrant, or an axis. */
type Where = "I" | "II" | "III" | "IV" | "xAxis" | "yAxis";
const WHERE: Record<Where, ReturnType<typeof t>> = {
  I: t("Quadrant I", "पहला चतुर्थांश (I)"),
  II: t("Quadrant II", "दूसरा चतुर्थांश (II)"),
  III: t("Quadrant III", "तीसरा चतुर्थांश (III)"),
  IV: t("Quadrant IV", "चौथा चतुर्थांश (IV)"),
  xAxis: t("On the x-axis", "x-अक्ष पर"),
  yAxis: t("On the y-axis", "y-अक्ष पर"),
};
/** What each place's coordinates are, as a wrong choice is told. */
const PATTERN: Record<Where, Localized> = {
  I: t(
    "Quadrant [[I|one]] is [[(+,\u00a0+)|plus, plus]].",
    "पहला चतुर्थांश [[(+,\u00a0+)|धन, धन]] है।",
  ),
  II: t(
    "Quadrant [[II|two]] is [[(−,\u00a0+)|minus, plus]].",
    "दूसरा चतुर्थांश [[(−,\u00a0+)|ऋण, धन]] है।",
  ),
  III: t(
    "Quadrant [[III|three]] is [[(−,\u00a0−)|minus, minus]].",
    "तीसरा चतुर्थांश [[(−,\u00a0−)|ऋण, ऋण]] है।",
  ),
  IV: t(
    "Quadrant [[IV|four]] is [[(+,\u00a0−)|plus, minus]].",
    "चौथा चतुर्थांश [[(+,\u00a0−)|धन, ऋण]] है।",
  ),
  xAxis: t(`On the x-axis, ${isEn("y", 0)}.`, "[[x|एक्स]]-अक्ष पर [[y\u00a0=\u00a00|वाई 0]] होता है।"),
  yAxis: t(`On the y-axis, ${isEn("x", 0)}.`, "[[y|वाई]]-अक्ष पर [[x\u00a0=\u00a00|एक्स 0]] होता है।"),
};
const whereOf = (x: number, y: number): Where =>
  y === 0 ? "xAxis" : x === 0 ? "yAxis" : x > 0 ? (y > 0 ? "I" : "IV") : y > 0 ? "II" : "III";

/** A round: "From the signs alone: where is (x, y)?", the same six choices, each wrong one told. */
function whereRound(x: number, y: number) {
  const answer = whereOf(x, y);
  return choice({
    prompt: t(
      `From the signs alone: where is the point ${pairEn(x, y)}?`,
      `केवल चिह्नों से बताओ: बिंदु ${pairHi(x, y)} कहाँ है?`,
    ),
    options: (["I", "II", "III", "IV", "xAxis", "yAxis"] as const).map((id) =>
      id === answer
        ? { id, label: WHERE[id] }
        : {
            id,
            label: WHERE[id],
            feedback: t(
              `${PATTERN[id].en} This point is ${pairEn(x, y)}.`,
              `${PATTERN[id].hi} यह बिंदु ${pairHi(x, y)} है।`,
            ),
          },
    ),
    keepOrder: true,
    answer,
  });
}
/** Four rounds: three quadrants and an axis, none the quadrant just dragged through last. */
const ROUNDS = [
  whereRound(-3, 5),
  whereRound(2, -4),
  whereRound(-4, -1),
  whereRound(0, -3),
] as const;

/** Each quadrant's signs, found by taking the point through all four, then called before seeing. */
const signsAndQuadrants = page(
  "signs-and-quadrants",
  scene({
    pieces: {
      title: words.title(t("Signs in each quadrant", "हर चतुर्थांश में चिह्न")),
      ask: words.body(
        t(
          "**Drag the point into each of the four quadrants.** Watch the signs of its coordinates: each quadrant shows its pattern once the point has been there.",
          "**बिंदु को चारों चतुर्थांशों में बारी-बारी खींचो।** उसके निर्देशांकों के चिह्न देखो: बिंदु के वहाँ पहुँचते ही हर चतुर्थांश अपने चिह्न दिखाता है।",
        ),
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: { window: FIVE, ...AXES, quadrantsNamed: 4 },
          reading: {
            // Clear of quadrant I's name and the signs that show under it.
            point: { x: 4, y: 1 },
            pointStep: 1,
            reading: Reading.Pair,
            unit: "",
            visited: ["I"],
            showsVisitedSigns: true,
          },
        }),
      ),
      rule: hidden(
        words.definition(
          t(
            "**In quadrant [[I|one]] a point is [[(+,\u00a0+)|plus, plus]]; in [[II|quadrant two]], [[(−,\u00a0+)|minus, plus]]; in [[III|quadrant three]], [[(−,\u00a0−)|minus, minus]]; in [[IV|quadrant four]], [[(+,\u00a0−)|plus, minus]].** Each quadrant lies between two halves of the axes: quadrant [[II|two]] between [[OX′|O X dash]] and [[OY|O Y]], so x is negative and y positive there.",
            "**पहले [[चतुर्थांश (I)|चतुर्थांश]] में बिंदु [[(+,\u00a0+)|धन, धन]] होता है; [[दूसरे (II)|दूसरे]] में [[(−,\u00a0+)|ऋण, धन]]; [[तीसरे (III)|तीसरे]] में [[(−,\u00a0−)|ऋण, ऋण]]; [[चौथे (IV)|चौथे]] में [[(+,\u00a0−)|धन, ऋण]]।** हर चतुर्थांश अक्षों के दो आधे भागों के बीच है: दूसरा चतुर्थांश [[OX′|O X डैश]] और [[OY|O Y]] के बीच है, इसलिए वहाँ [[x|एक्स]] ऋणात्मक और [[y|वाई]] धनात्मक है।",
          ),
        ),
      ),
      round1: hidden(ROUNDS[0]),
      round2: hidden(ROUNDS[1]),
      round3: hidden(ROUNDS[2]),
      round4: hidden(ROUNDS[3]),
    },
    passBy: "rules",
    hear: {
      "sheet.reading.enteredQuadrant": (me, _, t) =>
        me.sheet.reading.visited.length === 4 && [
          t.self.show({ name: "rule" }),
          t.self.show({ name: "round1" }),
        ],
      // One round at a time: each right answer brings the next.
      "round1.correct": (_, __, t) => t.self.show({ name: "round2" }),
      "round2.correct": (_, __, t) => t.self.show({ name: "round3" }),
      "round3.correct": (_, __, t) => t.self.show({ name: "round4" }),
      "round4.correct": (_, __, t) => t.self.pass(),
    },
    witness: [
      tap("sheet.reading", "movePoint", { x: -3, y: 2 }),
      tap("sheet.reading", "movePoint", { x: -3, y: -2 }),
      tap("sheet.reading", "movePoint", { x: 3, y: -2 }),
    ],
  }),
);

/** The axes are a choice: moved and turned under a point that stays, only its numbers change. */
const anyAxes = page(
  "any-axes",
  scene({
    pieces: {
      title: words.title(t("Why these axes?", "यही अक्ष क्यों?")),
      link: words.body(
        t(
          "Two perpendicular lines can be drawn anywhere, pointing any way. The dot is the point P. On the agreed axes, P is **[[(3, 2)|the point 3, 2]]**, and P stays where it is. **Drag O** to move the axes, and **turn them by the [[↻|turning]] handle** on the x-axis. Watch P's coordinates.",
          "दो लंब रेखाएँ कहीं भी, किसी भी दिशा में खींची जा सकती हैं। यह बिंदु P है। माने हुए अक्षों पर P **[[(3, 2)|बिंदु 3, 2]]** है, और P अपनी जगह रहता है। अक्षों को खिसकाने के लिए **O को खींचो**, और [[x|एक्स]]-अक्ष पर बने **[[↻|घुमाने वाले]] हैंडल से उन्हें घुमाओ**। P के निर्देशांक देखो।",
        ),
      ),
      sheet: place(
        coordinatePlane,
        setup({
          // The axes' end names would be cut off once they move: the numbers say the directions.
          plane: {
            window: FIVE,
            ...AXES,
            showDirections: false,
            // P is the reading's dot, unnamed on the plane: the turned axes' numbers sweep across
            // wherever a name would sit. Its pair is written under the plane.
            canMoveAxes: true,
          },
          reading: {
            point: { x: 3, y: 2 },
            reading: Reading.Pair,
            unit: "",
            decimals: 2,
            canMovePoint: false,
          },
        }),
      ),
      choice: hidden(
        words.body(
          t(
            "P never moved, yet its coordinates changed: **coordinates depend on the axes we choose.** So everyone uses the same pair, the agreed x-axis across and y-axis up, just as everyone writes x first. Then a pair of numbers means one point to everyone.",
            "P कभी नहीं हिला, फिर भी उसके निर्देशांक बदल गए: **निर्देशांक उन अक्षों पर निर्भर करते हैं जो हम चुनते हैं।** इसलिए सब एक ही जोड़ा लेते हैं, माना हुआ आड़ा x-अक्ष और खड़ा y-अक्ष, जैसे सब x पहले लिखते हैं। तब संख्याओं का एक जोड़ा सबके लिए एक ही बिंदु बताता है।",
          ),
        ),
      ),
      putBack: hidden(
        words.body(
          t(
            "On the agreed axes P was [[(3, 2)|the point 3, 2]]. **Put the axes back** and see: O at the crossing it started on, and the x-axis level again.",
            "माने हुए अक्षों पर P [[(3, 2)|बिंदु 3, 2]] था। **अक्षों को वापस रखो** और देखो: O फिर उसी जगह पर, और [[x|एक्स]]-अक्ष फिर से आड़ा।",
          ),
        ),
      ),
      back: hidden(
        words.body(
          t(
            "Back on the agreed axes, P is [[(3, 2)|the point 3, 2]] again, the same for everyone.",
            "माने हुए अक्षों पर लौटकर P फिर [[(3, 2)|बिंदु 3, 2]] है, सबके लिए एक जैसा।",
          ),
        ),
      ),
    },
    passBy: "rules",
    hear: {
      // Both moved and turned: then it is a choice of axes, not a slide. Put back afterwards, the
      // agreed axes give P its numbers again.
      "sheet.plane.axesMoved": (me, p, t) => {
        const isHome = p.x === 0 && p.y === 0 && p.degrees === 0;
        if (isHome)
          return (
            !me.hidden.includes("choice") &&
            me.hidden.includes("back") &&
            t.self.show({ name: "back" })
          );
        return (
          (p.x !== 0 || p.y !== 0) &&
          p.degrees !== 0 &&
          me.hidden.includes("choice") && [
            t.self.show({ name: "choice" }),
            t.self.show({ name: "putBack" }),
            t.self.pass(),
          ]
        );
      },
    },
    witness: [
      tap("sheet.plane", "moveAxes", { x: 1, y: 1 }),
      tap("sheet.plane", "turnAxes", { x: 5, y: 3 }),
      // Put back: O home, then level.
      tap("sheet.plane", "moveAxes", { x: 0, y: 0 }),
      tap("sheet.plane", "turnAxes", { x: 5, y: 0 }),
    ],
  }),
);

/**
 * Fig. 3.14 read both ways, on parts Ex 3.2 Q2 doesn't ask (the exercise's own are in its family,
 * fig-3-14): H's coordinates, and the point at (5, −5).
 */
const coordinatesOfH = choice({
  prompt: t("What are the coordinates of H?", "H के निर्देशांक क्या हैं?"),
  options: [
    { id: "right", label: t("(−5, −3)", "(−5, −3)") },
    {
      id: "swapped",
      label: t("(−3, −5)", "(−3, −5)"),
      feedback: t(
        `That is y first: ${pairEn(-3, -5)} is E. H is 5 units left of the y-axis, so ${isEn("x", -5)}, written first.`,
        `यह ${hiLetter("y")} पहले है: ${pairHi(-3, -5)} तो E है। H, ${hiLetter("y")}-अक्ष से 5 इकाई बाईं ओर है, इसलिए ${isHi("x", -5)}, जो पहले लिखा जाता है।`,
      ),
    },
    {
      id: "ySign",
      label: t("(−5, 3)", "(−5, 3)"),
      feedback: t(
        "[[(−5, 3)|The point minus 5, 3]] is above the x-axis. H is below it, along [[OY′|O Y dash]], so its y-coordinate is negative.",
        "[[(−5, 3)|बिंदु माइनस 5, 3]], [[x|एक्स]]-अक्ष के ऊपर है। H उसके नीचे, [[OY′|O Y डैश]] की ओर है, इसलिए उसका [[y|वाई]]-निर्देशांक ऋणात्मक है।",
      ),
    },
    {
      id: "unsigned",
      label: t("(5, 3)", "(5, 3)"),
      feedback: t(
        "Those are H's distances without their signs. H is left of the y-axis and below the x-axis: both coordinates are negative.",
        "ये H की दूरियाँ हैं, बिना चिह्न के। H, [[y|वाई]]-अक्ष के बाईं ओर और [[x|एक्स]]-अक्ष के नीचे है: दोनों निर्देशांक ऋणात्मक हैं।",
      ),
    },
  ],
  answer: "right",
});
const pointAt = choice({
  prompt: t(
    "Which point is [[(5, −5)|the point 5, minus 5]]?",
    "बिंदु [[(5, −5)|5, माइनस 5]] कौन-सा है?",
  ),
  options: [
    { id: "c", label: t("C", "C") },
    {
      id: "e",
      label: t("E", "E"),
      feedback: t(
        "E is [[(−3, −5)|the point minus 3, minus 5]]: 3 units left of the y-axis. [[(5, −5)|The point 5, minus 5]] is 5 units right of it.",
        "E है [[(−3, −5)|बिंदु माइनस 3, माइनस 5]]: [[y|वाई]]-अक्ष से 3 इकाई बाईं ओर। [[(5, −5)|बिंदु 5, माइनस 5]] उससे 5 इकाई दाईं ओर है।",
      ),
    },
    {
      id: "g",
      label: t("G", "G"),
      feedback: t(
        "G is [[(2, −4)|the point 2, minus 4]]: 2 units right and 4 down. [[(5, −5)|The point 5, minus 5]] is further right and lower.",
        "G है [[(2, −4)|बिंदु 2, माइनस 4]]: 2 इकाई दाईं ओर और 4 नीचे। [[(5, −5)|बिंदु 5, माइनस 5]] और दाईं ओर और और नीचे है।",
      ),
    },
    {
      id: "d",
      label: t("D", "D"),
      feedback: t(
        "D is [[(6, 2)|the point 6, 2]], above the x-axis. [[(5, −5)|The point 5, minus 5]] is below it: its y-coordinate is negative.",
        "D है [[(6, 2)|बिंदु 6, 2]], [[x|एक्स]]-अक्ष के ऊपर। [[(5, −5)|बिंदु 5, माइनस 5]] उसके नीचे है: उसका [[y|वाई]]-निर्देशांक ऋणात्मक है।",
      ),
    },
  ],
  answer: "c",
});

const findThePoint = page(
  "find-the-point",
  scene({
    pieces: {
      title: words.title(t("Coordinates both ways", "निर्देशांक दोनों ओर से")),
      link: words.body(
        t(
          "Coordinates are read two ways: from a point to its pair, and from a pair to its point. Each point in the figure has dashed lines to the axes.",
          "निर्देशांक दो तरह पढ़े जाते हैं: बिंदु से उसका जोड़ा, और जोड़े से उसका बिंदु। आकृति में हर बिंदु से अक्षों तक बिंदीदार रेखाएँ हैं।",
        ),
      ),
      figure: place(
        coordinatePlane,
        setup({
          plane: {
            window: FIG_3_14,
            ...AXES,
            points: [
              point("B", -5, 2),
              point("D", 6, 2),
              point("L", 0, 5, false),
              point("M", -3, 0, false),
              point("H", -5, -3),
              point("G", 2, -4),
              point("E", -3, -5),
              point("C", 5, -5),
            ],
          },
        }),
      ),
      coordinatesOfH: coordinatesOfH,
      pointAt: hidden(pointAt),
      summary: hidden(
        words.body(
          t(
            "**In short:** the x-coordinate[[ (abscissa)|, the abscissa,]] of a point is its distance from the y-axis, and the y-coordinate[[ (ordinate)|, the ordinate,]] its distance from the x-axis, each with a sign for its side.",
            "**संक्षेप में:** किसी बिंदु का [[x|एक्स]]-निर्देशांक[[ (भुज)|, यानी भुज,]] [[y|वाई]]-अक्ष से उसकी दूरी है, और [[y|वाई]]-निर्देशांक[[ (कोटि)|, यानी कोटि,]] [[x|एक्स]]-अक्ष से उसकी दूरी, हर एक अपनी ओर बताने वाले चिह्न के साथ।",
          ),
        ),
      ),
      summaryPair: hidden(
        words.body(
          t(
            "A point is written [[(x, y)|x, y]], x first.",
            "बिंदु [[(x, y)|एक्स, वाई]] लिखा जाता है, [[x|एक्स]] पहले।",
          ),
        ),
      ),
      summaryAxes: hidden(
        words.body(
          t(
            "On the x-axis a point is [[(x, 0)|x, 0]]; on the y-axis, [[(0, y)|0, y]]; the origin is [[(0, 0)|0, 0]].",
            "[[x|एक्स]]-अक्ष पर बिंदु [[(x, 0)|एक्स, 0]] होता है; [[y|वाई]]-अक्ष पर [[(0, y)|0, वाई]]; मूल बिंदु [[(0, 0)|0, 0]] है।",
          ),
        ),
      ),
      summarySigns: hidden(
        words.body(
          t(
            "In quadrant [[I|one]] a point is [[(+,\u00a0+)|plus, plus]]; in [[II|two]], [[(−,\u00a0+)|minus, plus]]; in [[III|three]], [[(−,\u00a0−)|minus, minus]]; in [[IV|four]], [[(+,\u00a0−)|plus, minus]].",
            "पहले चतुर्थांश में बिंदु [[(+,\u00a0+)|धन, धन]] होता है; दूसरे में [[(−,\u00a0+)|ऋण, धन]]; तीसरे में [[(−,\u00a0−)|ऋण, ऋण]]; चौथे में [[(+,\u00a0−)|धन, ऋण]]।",
          ),
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "coordinatesOfH.correct": (_, __, t) => t.self.show({ name: "pointAt" }),
      "pointAt.correct": (_, __, t) => [
        ...(["summary", "summaryPair", "summaryAxes", "summarySigns"] as const).map((name) =>
          t.self.show({ name }),
        ),
        t.self.pass(),
      ],
    },
  }),
);

/** The pages, in reading order. */
export const overview = [
  distancesFromAxes,
  abscissaAndOrdinate,
  writingCoordinates,
  readingPoints,
  pointsOnAxes,
  signsAndQuadrants,
  anyAxes,
  findThePoint,
];
