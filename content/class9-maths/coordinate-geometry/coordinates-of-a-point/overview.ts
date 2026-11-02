import { hidden, page, place, scene, t, tap } from "@chalk/author";
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
const FIG_3_14 = { xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 6.5 };

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
            "**P is 4 units from the y-axis, measured along the x-axis, in the positive direction OX. It is 3 units from the x-axis, measured along the y-axis, in the positive direction OY.** Riya walked them: 4 along and 3 up, whichever way she went, the distances are the same.",
            "**P, y-अक्ष से 4 इकाई दूर है, जो x-अक्ष के साथ धनात्मक दिशा OX में मापी जाती है। वह x-अक्ष से 3 इकाई दूर है, जो y-अक्ष के साथ धनात्मक दिशा OY में मापी जाती है।** रिया ने यही चला: 4 आगे और 3 ऊपर, वह किसी भी क्रम में चली हो, दूरियाँ वही हैं।",
          ),
          null,
          {
            says: t(
              "P is 4 units from the y-axis, measured along the x-axis, in the positive direction O X. It is 3 units from the x-axis, measured along the y-axis, in the positive direction O Y. Riya walked them: 4 along and 3 up, whichever way she went, the distances are the same.",
              "P, वाई-अक्ष से 4 इकाई दूर है, जो एक्स-अक्ष के साथ धनात्मक दिशा O X में मापी जाती है। वह एक्स-अक्ष से 3 इकाई दूर है, जो वाई-अक्ष के साथ धनात्मक दिशा O Y में मापी जाती है। रिया ने यही चला: 4 आगे और 3 ऊपर, वह किसी भी क्रम में चली हो, दूरियाँ वही हैं।",
            ),
          },
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
            "**Q is 6 units from the y-axis, measured along the negative direction OX′, and 2 units from the x-axis, measured along the negative direction OY′.** Her walk: 6 to the left and 2 down, in either order.",
            "**Q, y-अक्ष से 6 इकाई दूर है, जो ऋणात्मक दिशा OX′ में मापी जाती है, और x-अक्ष से 2 इकाई दूर, जो ऋणात्मक दिशा OY′ में मापी जाती है।** उसकी चाल: 6 बाईं ओर और 2 नीचे, किसी भी क्रम में।",
          ),
          null,
          {
            says: t(
              "Q is 6 units from the y-axis, measured along the negative direction O X dash, and 2 units from the x-axis, measured along the negative direction O Y dash. Her walk: 6 to the left and 2 down, in either order.",
              "Q, वाई-अक्ष से 6 इकाई दूर है, जो ऋणात्मक दिशा O X डैश में मापी जाती है, और एक्स-अक्ष से 2 इकाई दूर, जो ऋणात्मक दिशा O Y डैश में मापी जाती है। उसकी चाल: 6 बाईं ओर और 2 नीचे, किसी भी क्रम में।",
            ),
          },
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
          "**The x-coordinate of a point is its perpendicular distance from the y-axis, measured along the x-axis: positive along OX, negative along OX′. It is also called the abscissa.**",
          "**किसी बिंदु का x-निर्देशांक, y-अक्ष से उसकी लंब दूरी है, जो x-अक्ष के साथ मापी जाती है: OX की ओर धनात्मक, OX′ की ओर ऋणात्मक। इसे भुज भी कहते हैं।**",
        ),
        null,
        {
          says: t(
            "The x-coordinate of a point is its perpendicular distance from the y-axis, measured along the x-axis: positive along O X, negative along O X dash. It is also called the abscissa.",
            "किसी बिंदु का एक्स-निर्देशांक, वाई-अक्ष से उसकी लंब दूरी है, जो एक्स-अक्ष के साथ मापी जाती है: O X की ओर धनात्मक, O X डैश की ओर ऋणात्मक। इसे भुज भी कहते हैं।",
          ),
        },
      ),
      ordinate: words.definition(
        t(
          "**The y-coordinate of a point is its perpendicular distance from the x-axis, measured along the y-axis: positive along OY, negative along OY′. It is also called the ordinate.**",
          "**किसी बिंदु का y-निर्देशांक, x-अक्ष से उसकी लंब दूरी है, जो y-अक्ष के साथ मापी जाती है: OY की ओर धनात्मक, OY′ की ओर ऋणात्मक। इसे कोटि भी कहते हैं।**",
        ),
        null,
        {
          says: t(
            "The y-coordinate of a point is its perpendicular distance from the x-axis, measured along the y-axis: positive along O Y, negative along O Y dash. It is also called the ordinate.",
            "किसी बिंदु का वाई-निर्देशांक, एक्स-अक्ष से उसकी लंब दूरी है, जो वाई-अक्ष के साथ मापी जाती है: O Y की ओर धनात्मक, O Y डैश की ओर ऋणात्मक। इसे कोटि भी कहते हैं।",
          ),
        },
      ),
      ofPQ: words.body(
        t(
          "So P has x-coordinate +4 and y-coordinate +3. Q has x-coordinate −6 and y-coordinate −2.",
          "इसलिए P का x-निर्देशांक +4 और y-निर्देशांक +3 है। Q का x-निर्देशांक −6 और y-निर्देशांक −2 है।",
        ),
        {
          says: t(
            "So P has x-coordinate plus 4 and y-coordinate plus 3. Q has x-coordinate minus 6 and y-coordinate minus 2.",
            "इसलिए P का एक्स-निर्देशांक धन 4 और वाई-निर्देशांक धन 3 है। Q का एक्स-निर्देशांक माइनस 6 और वाई-निर्देशांक माइनस 2 है।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          // Q marked where the point is to go; P is where it starts.
          plane: { window: GRAPH, ...AXES, points: [point("Q", -6, -2, false)] },
          reading: { point: { x: 4, y: 3 }, pointStep: 1, reading: Reading.Abscissa, unit: "" },
        }),
      ),
      ask: words.body(
        t(
          "The point is at P. **Drag it to Q**, where x = −6 and y = −2, and watch each sign change as it crosses an axis.",
          "बिंदु P पर है। **उसे Q तक खींचो**, जहाँ x = −6 और y = −2 है, और देखो कि अक्ष पार करते ही हर चिह्न कैसे बदलता है।",
        ),
        {
          says: t(
            "The point is at P. Drag it to Q, where x is minus 6 and y is minus 2, and watch each sign change as it crosses an axis.",
            "बिंदु P पर है। उसे Q तक खींचो, जहाँ एक्स माइनस 6 और वाई माइनस 2 है, और देखो कि अक्ष पार करते ही हर चिह्न कैसे बदलता है।",
          ),
        },
      ),
      crossing: hidden(
        words.body(
          t(
            "**Crossing the y-axis changes the sign of x; crossing the x-axis changes the sign of y.** The distances stay distances: the sign says which side.",
            "**y-अक्ष पार करने पर x का चिह्न बदलता है; x-अक्ष पार करने पर y का।** दूरियाँ दूरियाँ ही रहती हैं: चिह्न बताता है कि किस ओर।",
          ),
          {
            says: t(
              "Crossing the y-axis changes the sign of x; crossing the x-axis changes the sign of y. The distances stay distances: the sign says which side.",
              "वाई-अक्ष पार करने पर एक्स का चिह्न बदलता है; एक्स-अक्ष पार करने पर वाई का। दूरियाँ दूरियाँ ही रहती हैं: चिह्न बताता है कि किस ओर।",
            ),
          },
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
          "**The coordinates of a point are written x-coordinate first, then y-coordinate, in brackets: P is (4, 3) and Q is (−6, −2).**",
          "**किसी बिंदु के निर्देशांक पहले x-निर्देशांक, फिर y-निर्देशांक, कोष्ठक में लिखे जाते हैं: P है (4, 3) और Q है (−6, −2)।**",
        ),
        null,
        {
          says: t(
            "The coordinates of a point are written x-coordinate first, then y-coordinate, in brackets: P is the point 4, 3, and Q is the point minus 6, minus 2.",
            "किसी बिंदु के निर्देशांक पहले एक्स-निर्देशांक, फिर वाई-निर्देशांक, कोष्ठक में लिखे जाते हैं: P है बिंदु 4, 3, और Q है बिंदु माइनस 6, माइनस 2।",
          ),
        },
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
          "**Drag the point anywhere on the plane:** its coordinates go with it. Then put it at **(3, 4)**.",
          "**बिंदु को तल पर कहीं भी खींचो:** उसके निर्देशांक उसके साथ चलते हैं। फिर उसे **(3, 4)** पर रखो।",
        ),
        {
          says: t(
            "Drag the point anywhere on the plane: its coordinates go with it. Then put it at the point 3, 4.",
            "बिंदु को तल पर कहीं भी खींचो: उसके निर्देशांक उसके साथ चलते हैं। फिर उसे बिंदु 3, 4 पर रखो।",
          ),
        },
      ),
      notP: hidden(
        words.body(
          t(
            "**(3, 4) is not P.** The same two numbers in the other order are another point: 3 along and 4 up, not 4 along and 3 up. The coordinates name exactly one point.",
            "**(3, 4), P नहीं है।** वही दो संख्याएँ उलटे क्रम में एक दूसरा बिंदु हैं: 3 आगे और 4 ऊपर, न कि 4 आगे और 3 ऊपर। निर्देशांक ठीक एक ही बिंदु बताते हैं।",
          ),
          {
            says: t(
              "The point 3, 4 is not P. The same two numbers in the other order are another point: 3 along and 4 up, not 4 along and 3 up. The coordinates name exactly one point.",
              "बिंदु 3, 4, P नहीं है। वही दो संख्याएँ उलटे क्रम में एक दूसरा बिंदु हैं: 3 आगे और 4 ऊपर, न कि 4 आगे और 3 ऊपर। निर्देशांक ठीक एक ही बिंदु बताते हैं।",
            ),
          },
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
            "On the fair ground's plan, the two main paths are the axes, crossing at O. Riya writes where the first stalls stand: **snacks at (3, 2), books at (−4, 1)**. **Tap a stall** to see its coordinates.",
            "मेले के मैदान के नक्शे पर दो मुख्य रास्ते अक्ष हैं, जो O पर काटते हैं। रिया पहले स्टॉल की जगहें लिखती है: **नाश्ता (3, 2) पर, किताबें (−4, 1) पर**। उसके निर्देशांक देखने के लिए **किसी स्टॉल को दबाओ**।",
          ),
          {
            says: t(
              "On the fair ground's plan, the two main paths are the axes, crossing at O. Riya writes where the first stalls stand: snacks at the point 3, 2, books at the point minus 4, 1. Tap a stall to see its coordinates.",
              "मेले के मैदान के नक्शे पर दो मुख्य रास्ते अक्ष हैं, जो O पर काटते हैं। रिया पहले स्टॉल की जगहें लिखती है: नाश्ता बिंदु 3, 2 पर, किताबें बिंदु माइनस 4, 1 पर। उसके निर्देशांक देखने के लिए किसी स्टॉल को दबाओ।",
            ),
          },
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

/** Example 1: the abscissa, ordinate and coordinates of B, M, L and S, read off Fig. 3.11. */
const readingPoints = page(
  "reading-points",
  scene({
    pieces: {
      title: words.title(t("Reading a point's coordinates", "बिंदु के निर्देशांक पढ़ना")),
      q: words.body(
        t(
          "**Q.** Write the abscissa, the ordinate and the coordinates of the points B, M, L and S in the figure.",
          "**प्रश्न.** आकृति में बिंदुओं B, M, L और S के भुज, कोटि और निर्देशांक लिखिए।",
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
      how: words.body(
        t(
          "**A.** Follow each point's dashed lines to the axes. The line to the x-axis ends at its abscissa; the line to the y-axis ends at its ordinate.",
          "**उत्तर.** हर बिंदु की बिंदीदार रेखाओं को अक्षों तक देखिए। x-अक्ष तक की रेखा उसके भुज पर रुकती है; y-अक्ष तक की रेखा उसकी कोटि पर।",
        ),
      ),
      b: words.body(
        t(
          "B is 4 units from the y-axis along OX and 3 units from the x-axis along OY: abscissa 4, ordinate 3, coordinates (4, 3).",
          "B, y-अक्ष से OX की ओर 4 इकाई और x-अक्ष से OY की ओर 3 इकाई दूर है: भुज 4, कोटि 3, निर्देशांक (4, 3)।",
        ),
        {
          says: t(
            "B is 4 units from the y-axis along O X and 3 units from the x-axis along O Y: abscissa 4, ordinate 3, coordinates 4, 3.",
            "B, वाई-अक्ष से O X की ओर 4 इकाई और एक्स-अक्ष से O Y की ओर 3 इकाई दूर है: भुज 4, कोटि 3, निर्देशांक 4, 3।",
          ),
        },
      ),
      m: words.body(
        t(
          "M is 3 units from the y-axis along OX′ and 4 units from the x-axis along OY: abscissa −3, ordinate 4, coordinates (−3, 4).",
          "M, y-अक्ष से OX′ की ओर 3 इकाई और x-अक्ष से OY की ओर 4 इकाई दूर है: भुज −3, कोटि 4, निर्देशांक (−3, 4)।",
        ),
        {
          says: t(
            "M is 3 units from the y-axis along O X dash and 4 units from the x-axis along O Y: abscissa minus 3, ordinate 4, coordinates minus 3, 4.",
            "M, वाई-अक्ष से O X डैश की ओर 3 इकाई और एक्स-अक्ष से O Y की ओर 4 इकाई दूर है: भुज माइनस 3, कोटि 4, निर्देशांक माइनस 3, 4।",
          ),
        },
      ),
      l: words.body(
        t(
          "L is 5 units from the y-axis along OX′ and 4 units from the x-axis along OY′: abscissa −5, ordinate −4, coordinates (−5, −4).",
          "L, y-अक्ष से OX′ की ओर 5 इकाई और x-अक्ष से OY′ की ओर 4 इकाई दूर है: भुज −5, कोटि −4, निर्देशांक (−5, −4)।",
        ),
        {
          says: t(
            "L is 5 units from the y-axis along O X dash and 4 units from the x-axis along O Y dash: abscissa minus 5, ordinate minus 4, coordinates minus 5, minus 4.",
            "L, वाई-अक्ष से O X डैश की ओर 5 इकाई और एक्स-अक्ष से O Y डैश की ओर 4 इकाई दूर है: भुज माइनस 5, कोटि माइनस 4, निर्देशांक माइनस 5, माइनस 4।",
          ),
        },
      ),
      s: words.body(
        t(
          "S is 3 units from the y-axis along OX and 4 units from the x-axis along OY′: abscissa 3, ordinate −4, coordinates (3, −4).",
          "S, y-अक्ष से OX की ओर 3 इकाई और x-अक्ष से OY′ की ओर 4 इकाई दूर है: भुज 3, कोटि −4, निर्देशांक (3, −4)।",
        ),
        {
          says: t(
            "S is 3 units from the y-axis along O X and 4 units from the x-axis along O Y dash: abscissa 3, ordinate minus 4, coordinates 3, minus 4.",
            "S, वाई-अक्ष से O X की ओर 3 इकाई और एक्स-अक्ष से O Y डैश की ओर 4 इकाई दूर है: भुज 3, कोटि माइनस 4, निर्देशांक 3, माइनस 4।",
          ),
        },
      ),
    },
  }),
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
          "**बिंदु को x-अक्ष पर खींचो**, फिर y-अक्ष पर, फिर O पर, और उसके निर्देशांक देखो।",
        ),
        {
          says: t(
            "Drag the point onto the x-axis, then onto the y-axis, then onto O, and watch its coordinates.",
            "बिंदु को एक्स-अक्ष पर खींचो, फिर वाई-अक्ष पर, फिर O पर, और उसके निर्देशांक देखो।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: { window: FIVE, ...AXES },
          reading: { point: { x: 3, y: 2 }, pointStep: 1, reading: Reading.Pair, unit: "" },
          // y = 0, a button: every point it describes is lit, the whole x-axis.
          clues: {
            hidden: null,
            canGiveClues: true,
            clueChoices: [{ words: t("y = 0", "y = 0"), y: 0 }],
          },
        }),
      ),
      onX: hidden(
        words.definition(
          t(
            "**A point on the x-axis is 0 units from the x-axis, so its y-coordinate is 0: it is (x, 0).** Press **y = 0**: every point with y = 0 lights up, and they make the whole x-axis. In Riya's town, a house on the main road needs no walk up the street: its second number is 0.",
            "**x-अक्ष पर कोई बिंदु x-अक्ष से 0 इकाई दूर है, इसलिए उसका y-निर्देशांक 0 है: वह (x, 0) है।** **y = 0** दबाओ: y = 0 वाले सारे बिंदु चमक उठते हैं, और वे पूरा x-अक्ष बनाते हैं। रिया के शहर में, मुख्य सड़क पर बने मकान तक गली में ऊपर नहीं चलना पड़ता: उसकी दूसरी संख्या 0 है।",
          ),
          null,
          {
            says: t(
              "A point on the x-axis is 0 units from the x-axis, so its y-coordinate is 0: it is the point x, 0. Press y equals 0: every point with y equal to 0 lights up, and they make the whole x-axis. In Riya's town, a house on the main road needs no walk up the street: its second number is 0.",
              "एक्स-अक्ष पर कोई बिंदु एक्स-अक्ष से 0 इकाई दूर है, इसलिए उसका वाई-निर्देशांक 0 है: वह बिंदु एक्स, 0 है। वाई बराबर 0 दबाओ: वाई बराबर 0 वाले सारे बिंदु चमक उठते हैं, और वे पूरा एक्स-अक्ष बनाते हैं। रिया के शहर में, मुख्य सड़क पर बने मकान तक गली में ऊपर नहीं चलना पड़ता: उसकी दूसरी संख्या 0 है।",
            ),
          },
        ),
      ),
      onY: hidden(
        words.definition(
          t(
            "**A point on the y-axis is 0 units from the y-axis, so its x-coordinate is 0: it is (0, y).**",
            "**y-अक्ष पर कोई बिंदु y-अक्ष से 0 इकाई दूर है, इसलिए उसका x-निर्देशांक 0 है: वह (0, y) है।**",
          ),
          null,
          {
            says: t(
              "A point on the y-axis is 0 units from the y-axis, so its x-coordinate is 0: it is the point 0, y.",
              "वाई-अक्ष पर कोई बिंदु वाई-अक्ष से 0 इकाई दूर है, इसलिए उसका एक्स-निर्देशांक 0 है: वह बिंदु 0, वाई है।",
            ),
          },
        ),
      ),
      atO: hidden(
        words.definition(
          t(
            "**The origin is 0 units from both axes, so its coordinates are (0, 0).**",
            "**मूल बिंदु दोनों अक्षों से 0 इकाई दूर है, इसलिए उसके निर्देशांक (0, 0) हैं।**",
          ),
          null,
          {
            says: t(
              "The origin is 0 units from both axes, so its coordinates are 0, 0.",
              "मूल बिंदु दोनों अक्षों से 0 इकाई दूर है, इसलिए उसके निर्देशांक 0, 0 हैं।",
            ),
          },
        ),
      ),
      q: hidden(
        words.body(
          t(
            "**Q.** Write the coordinates of the points A, B, C, D and E in the figure, each with its reason.",
            "**प्रश्न.** आकृति में बिंदुओं A, B, C, D और E के निर्देशांक लिखिए, हर एक का कारण बताते हुए।",
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
      whyA: hidden(
        words.body(
          t(
            "**A.** A is on the x-axis, 4 units from the y-axis along OX: **A is (4, 0)**.",
            "**उत्तर.** A, x-अक्ष पर है, y-अक्ष से OX की ओर 4 इकाई: **A है (4, 0)**।",
          ),
          {
            says: t(
              "A is on the x-axis, 4 units from the y-axis along O X: A is the point 4, 0.",
              "A, एक्स-अक्ष पर है, वाई-अक्ष से O X की ओर 4 इकाई: A है बिंदु 4, 0।",
            ),
          },
        ),
      ),
      whyB: hidden(
        words.body(
          t(
            "B is on the y-axis, 3 units from the x-axis along OY: **B is (0, 3)**.",
            "B, y-अक्ष पर है, x-अक्ष से OY की ओर 3 इकाई: **B है (0, 3)**।",
          ),
          {
            says: t(
              "B is on the y-axis, 3 units from the x-axis along O Y: B is the point 0, 3.",
              "B, वाई-अक्ष पर है, एक्स-अक्ष से O Y की ओर 3 इकाई: B है बिंदु 0, 3।",
            ),
          },
        ),
      ),
      whyC: hidden(
        words.body(
          t(
            "C is on the x-axis, 5 units from the y-axis along OX′: **C is (−5, 0)**.",
            "C, x-अक्ष पर है, y-अक्ष से OX′ की ओर 5 इकाई: **C है (−5, 0)**।",
          ),
          {
            says: t(
              "C is on the x-axis, 5 units from the y-axis along O X dash: C is the point minus 5, 0.",
              "C, एक्स-अक्ष पर है, वाई-अक्ष से O X डैश की ओर 5 इकाई: C है बिंदु माइनस 5, 0।",
            ),
          },
        ),
      ),
      whyD: hidden(
        words.body(
          t(
            "D is on the y-axis, 4 units from the x-axis along OY′: **D is (0, −4)**.",
            "D, y-अक्ष पर है, x-अक्ष से OY′ की ओर 4 इकाई: **D है (0, −4)**।",
          ),
          {
            says: t(
              "D is on the y-axis, 4 units from the x-axis along O Y dash: D is the point 0, minus 4.",
              "D, वाई-अक्ष पर है, एक्स-अक्ष से O Y डैश की ओर 4 इकाई: D है बिंदु 0, माइनस 4।",
            ),
          },
        ),
      ),
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
      // O counts once the point has been on both axes: the y-axis rule is always met first.
      "sheet.reading.moved": (me, p, t) =>
        p.place === "x-axis"
          ? t.self.show({ name: "onX" })
          : p.place === "y-axis"
            ? t.self.show({ name: "onY" })
            : p.place === "O" &&
              !me.hidden.includes("onX") &&
              !me.hidden.includes("onY") && [
                t.self.show({ name: "atO" }),
                t.self.show({ name: "q" }),
                t.self.show({ name: "figure" }),
                ...(["whyA", "whyB", "whyC", "whyD", "whyE"] as const).map((name) =>
                  t.self.show({ name }),
                ),
                t.self.pass(),
              ],
    },
    witness: [
      tap("sheet.reading", "movePoint", { x: 3, y: 0 }),
      tap("sheet.reading", "movePoint", { x: 0, y: 2 }),
      tap("sheet.reading", "movePoint", { x: 0, y: 0 }),
    ],
  }),
);

/** In which quadrant a point is, from the signs of its coordinates. */
const quadrantOf = choice({
  name: "whichQuadrant",
  prompt: t(
    "From the signs alone: in which quadrant is the point (−3, 5)?",
    "केवल चिह्नों से बताओ: बिंदु (−3, 5) किस चतुर्थांश में है?",
  ),
  says: t(
    "From the signs alone: in which quadrant is the point minus 3, 5?",
    "केवल चिह्नों से बताओ: बिंदु माइनस 3, 5 किस चतुर्थांश में है?",
  ),
  options: [
    { id: "two", label: t("Quadrant II", "दूसरा चतुर्थांश (II)") },
    {
      id: "one",
      label: t("Quadrant I", "पहला चतुर्थांश (I)"),
      feedback: t(
        "In quadrant I both coordinates are positive. Here x is −3: the point is left of the y-axis.",
        "पहले चतुर्थांश में दोनों निर्देशांक धनात्मक होते हैं। यहाँ x = −3 है: बिंदु y-अक्ष के बाईं ओर है।",
      ),
      feedbackSays: t(
        "In quadrant one both coordinates are positive. Here x is minus 3: the point is left of the y-axis.",
        "पहले चतुर्थांश में दोनों निर्देशांक धनात्मक होते हैं। यहाँ एक्स माइनस 3 है: बिंदु वाई-अक्ष के बाईं ओर है।",
      ),
    },
    {
      id: "three",
      label: t("Quadrant III", "तीसरा चतुर्थांश (III)"),
      feedback: t(
        "In quadrant III both coordinates are negative. Here y is 5: the point is above the x-axis.",
        "तीसरे चतुर्थांश में दोनों निर्देशांक ऋणात्मक होते हैं। यहाँ y = 5 है: बिंदु x-अक्ष के ऊपर है।",
      ),
      feedbackSays: t(
        "In quadrant three both coordinates are negative. Here y is 5: the point is above the x-axis.",
        "तीसरे चतुर्थांश में दोनों निर्देशांक ऋणात्मक होते हैं। यहाँ वाई 5 है: बिंदु एक्स-अक्ष के ऊपर है।",
      ),
    },
    {
      id: "four",
      label: t("Quadrant IV", "चौथा चतुर्थांश (IV)"),
      feedback: t(
        "Quadrant IV is (+, −): x positive, y negative. Here it is the other way round, (−, +).",
        "चौथा चतुर्थांश (+, −) है: x धनात्मक, y ऋणात्मक। यहाँ उलटा है, (−, +)।",
      ),
      feedbackSays: t(
        "Quadrant four is plus, minus: x positive, y negative. Here it is the other way round, minus, plus.",
        "चौथा चतुर्थांश धन, ऋण है: एक्स धनात्मक, वाई ऋणात्मक। यहाँ उलटा है, ऋण, धन।",
      ),
    },
  ],
  answer: "two",
});

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
            "**In quadrant I a point is (+, +); in II, (−, +); in III, (−, −); in IV, (+, −).** Each quadrant lies between two halves of the axes: quadrant II between OX′ and OY, so x is negative and y positive there.",
            "**पहले चतुर्थांश (I) में बिंदु (+, +) होता है; दूसरे (II) में (−, +); तीसरे (III) में (−, −); चौथे (IV) में (+, −)।** हर चतुर्थांश अक्षों के दो आधे भागों के बीच है: दूसरा चतुर्थांश OX′ और OY के बीच है, इसलिए वहाँ x ऋणात्मक और y धनात्मक है।",
          ),
          null,
          {
            says: t(
              "In quadrant one a point is plus, plus; in quadrant two, minus, plus; in quadrant three, minus, minus; in quadrant four, plus, minus. Each quadrant lies between two halves of the axes: quadrant two between O X dash and O Y, so x is negative and y positive there.",
              "पहले चतुर्थांश में बिंदु धन, धन होता है; दूसरे में ऋण, धन; तीसरे में ऋण, ऋण; चौथे में धन, ऋण। हर चतुर्थांश अक्षों के दो आधे भागों के बीच है: दूसरा चतुर्थांश O X डैश और O Y के बीच है, इसलिए वहाँ एक्स ऋणात्मक और वाई धनात्मक है।",
            ),
          },
        ),
      ),
      whichQuadrant: hidden(quadrantOf.piece),
    },
    passBy: "rules",
    hear: {
      "sheet.reading.enteredQuadrant": (me, _, t) =>
        me.sheet.reading.visited.length === 4 && [
          t.self.show({ name: "rule" }),
          t.self.show({ name: "whichQuadrant" }),
        ],
      "whichQuadrant.correct": (_, __, t) => t.self.pass(),
    },
    uses: [quadrantOf.use],
    witness: [
      tap("sheet.reading", "movePoint", { x: -3, y: 2 }),
      tap("sheet.reading", "movePoint", { x: -3, y: -2 }),
      tap("sheet.reading", "movePoint", { x: 3, y: -2 }),
      tap("whichQuadrant", "select", { option: "two" }),
      tap("whichQuadrant", "check"),
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
          "Two perpendicular lines can be drawn anywhere, pointing any way. The point P stays where it is. **Drag O** to move the axes, and **turn them by the ↻ handle** on the x-axis. Watch P's coordinates.",
          "दो लंब रेखाएँ कहीं भी, किसी भी दिशा में खींची जा सकती हैं। बिंदु P अपनी जगह रहता है। अक्षों को खिसकाने के लिए **O को खींचो**, और x-अक्ष पर बने **↻ हैंडल से उन्हें घुमाओ**। P के निर्देशांक देखो।",
        ),
        {
          says: t(
            "Two perpendicular lines can be drawn anywhere, pointing any way. The point P stays where it is. Drag O to move the axes, and turn them by the turning handle on the x-axis. Watch P's coordinates.",
            "दो लंब रेखाएँ कहीं भी, किसी भी दिशा में खींची जा सकती हैं। बिंदु P अपनी जगह रहता है। अक्षों को खिसकाने के लिए O को खींचो, और एक्स-अक्ष पर बने घुमाने वाले हैंडल से उन्हें घुमाओ। P के निर्देशांक देखो।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          // The axes' end names would be cut off once they move: the numbers say the directions.
          plane: {
            window: FIVE,
            ...AXES,
            showDirections: false,
            canMoveAxes: true,
            points: [point("P", 3, 2, false)],
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
            "**Put the axes back**: O at the crossing of the paper's lines it started on, and the x-axis level again.",
            "**अक्षों को वापस रखो**: O फिर उन्हीं रेखाओं के मिलने की जगह पर, और x-अक्ष फिर से आड़ा।",
          ),
          {
            says: t(
              "Put the axes back: O at the crossing it started on, and the x-axis level again.",
              "अक्षों को वापस रखो: O फिर उसी जगह पर, और एक्स-अक्ष फिर से आड़ा।",
            ),
          },
        ),
      ),
      back: hidden(
        words.body(
          t(
            "Back on the agreed axes, P is (3, 2) again, the same for everyone.",
            "माने हुए अक्षों पर लौटकर P फिर (3, 2) है, सबके लिए एक जैसा।",
          ),
          {
            says: t(
              "Back on the agreed axes, P is the point 3, 2 again, the same for everyone.",
              "माने हुए अक्षों पर लौटकर P फिर बिंदु 3, 2 है, सबके लिए एक जैसा।",
            ),
          },
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
  name: "coordinatesOfH",
  prompt: t("What are the coordinates of H?", "H के निर्देशांक क्या हैं?"),
  options: [
    { id: "right", label: t("(−5, −3)", "(−5, −3)") },
    {
      id: "swapped",
      label: t("(−3, −5)", "(−3, −5)"),
      feedback: t(
        "That is y first: (−3, −5) is E. H is 5 units left of the y-axis, so x = −5, written first.",
        "यह y पहले है: (−3, −5) तो E है। H, y-अक्ष से 5 इकाई बाईं ओर है, इसलिए x = −5, जो पहले लिखा जाता है।",
      ),
      feedbackSays: t(
        "That is y first: minus 3, minus 5 is E. H is 5 units left of the y-axis, so x is minus 5, written first.",
        "यह वाई पहले है: माइनस 3, माइनस 5 तो E है। H, वाई-अक्ष से 5 इकाई बाईं ओर है, इसलिए एक्स माइनस 5 है, जो पहले लिखा जाता है।",
      ),
    },
    {
      id: "ySign",
      label: t("(−5, 3)", "(−5, 3)"),
      feedback: t(
        "(−5, 3) is above the x-axis. H is below it, along OY′, so its y-coordinate is negative.",
        "(−5, 3), x-अक्ष के ऊपर है। H उसके नीचे, OY′ की ओर है, इसलिए उसका y-निर्देशांक ऋणात्मक है।",
      ),
      feedbackSays: t(
        "The point minus 5, 3 is above the x-axis. H is below it, along O Y dash, so its y-coordinate is negative.",
        "बिंदु माइनस 5, 3, एक्स-अक्ष के ऊपर है। H उसके नीचे, O Y डैश की ओर है, इसलिए उसका वाई-निर्देशांक ऋणात्मक है।",
      ),
    },
    {
      id: "unsigned",
      label: t("(5, 3)", "(5, 3)"),
      feedback: t(
        "Those are H's distances without their signs. H is left of the y-axis and below the x-axis: both coordinates are negative.",
        "ये H की दूरियाँ हैं, बिना चिह्न के। H, y-अक्ष के बाईं ओर और x-अक्ष के नीचे है: दोनों निर्देशांक ऋणात्मक हैं।",
      ),
      feedbackSays: t(
        "Those are H's distances without their signs. H is left of the y-axis and below the x-axis: both coordinates are negative.",
        "ये H की दूरियाँ हैं, बिना चिह्न के। H, वाई-अक्ष के बाईं ओर और एक्स-अक्ष के नीचे है: दोनों निर्देशांक ऋणात्मक हैं।",
      ),
    },
  ],
  answer: "right",
});
const pointAt = choice({
  name: "pointAt",
  prompt: t("Which point is (5, −5)?", "बिंदु (5, −5) कौन-सा है?"),
  says: t("Which point is the point 5, minus 5?", "बिंदु 5, माइनस 5 कौन-सा है?"),
  options: [
    { id: "c", label: t("C", "C") },
    {
      id: "e",
      label: t("E", "E"),
      feedback: t(
        "E is (−3, −5): 3 units left of the y-axis. (5, −5) is 5 units right of it.",
        "E है (−3, −5): y-अक्ष से 3 इकाई बाईं ओर। (5, −5) उससे 5 इकाई दाईं ओर है।",
      ),
      feedbackSays: t(
        "E is the point minus 3, minus 5: 3 units left of the y-axis. The point 5, minus 5 is 5 units right of it.",
        "E है बिंदु माइनस 3, माइनस 5: वाई-अक्ष से 3 इकाई बाईं ओर। बिंदु 5, माइनस 5 उससे 5 इकाई दाईं ओर है।",
      ),
    },
    {
      id: "g",
      label: t("G", "G"),
      feedback: t(
        "G is (2, −4): 2 units right and 4 down. (5, −5) is further right and lower.",
        "G है (2, −4): 2 इकाई दाईं ओर और 4 नीचे। (5, −5) और दाईं ओर और और नीचे है।",
      ),
      feedbackSays: t(
        "G is the point 2, minus 4: 2 units right and 4 down. The point 5, minus 5 is further right and lower.",
        "G है बिंदु 2, माइनस 4: 2 इकाई दाईं ओर और 4 नीचे। बिंदु 5, माइनस 5 और दाईं ओर और और नीचे है।",
      ),
    },
    {
      id: "d",
      label: t("D", "D"),
      feedback: t(
        "D is (6, 2), above the x-axis. (5, −5) is below it: its y-coordinate is negative.",
        "D है (6, 2), x-अक्ष के ऊपर। (5, −5) उसके नीचे है: उसका y-निर्देशांक ऋणात्मक है।",
      ),
      feedbackSays: t(
        "D is the point 6, 2, above the x-axis. The point 5, minus 5 is below it: its y-coordinate is negative.",
        "D है बिंदु 6, 2, एक्स-अक्ष के ऊपर। बिंदु 5, माइनस 5 उसके नीचे है: उसका वाई-निर्देशांक ऋणात्मक है।",
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
      coordinatesOfH: coordinatesOfH.piece,
      pointAt: hidden(pointAt.piece),
      summary: hidden(
        words.body(
          t(
            "**In short:**\n- The **x-coordinate** (abscissa) of a point is its distance from the y-axis; the **y-coordinate** (ordinate), its distance from the x-axis; each with a sign for its side.\n- A point is written (x, y), x first.\n- On the x-axis: (x, 0). On the y-axis: (0, y). The origin: (0, 0).\n- Quadrant I: (+, +). II: (−, +). III: (−, −). IV: (+, −).",
            "**संक्षेप में:**\n- किसी बिंदु का **x-निर्देशांक** (भुज) y-अक्ष से उसकी दूरी है; **y-निर्देशांक** (कोटि) x-अक्ष से उसकी दूरी; हर एक अपनी ओर बताने वाले चिह्न के साथ।\n- बिंदु (x, y) लिखा जाता है, x पहले।\n- x-अक्ष पर: (x, 0)। y-अक्ष पर: (0, y)। मूल बिंदु: (0, 0)।\n- पहला चतुर्थांश: (+, +)। दूसरा: (−, +)। तीसरा: (−, −)। चौथा: (+, −)।",
          ),
          {
            says: t(
              "In short: the x-coordinate, the abscissa, of a point is its distance from the y-axis, and the y-coordinate, the ordinate, its distance from the x-axis, each with a sign for its side. A point is written x, y, x first. On the x-axis it is x, 0; on the y-axis, 0, y; and the origin is 0, 0. In quadrant one a point is plus, plus; in two, minus, plus; in three, minus, minus; and in four, plus, minus.",
              "संक्षेप में: किसी बिंदु का एक्स-निर्देशांक, यानी भुज, वाई-अक्ष से उसकी दूरी है, और वाई-निर्देशांक, यानी कोटि, एक्स-अक्ष से उसकी दूरी, हर एक अपनी ओर बताने वाले चिह्न के साथ। बिंदु एक्स, वाई लिखा जाता है, एक्स पहले। एक्स-अक्ष पर वह एक्स, 0 है; वाई-अक्ष पर 0, वाई; और मूल बिंदु 0, 0 है। पहले चतुर्थांश में बिंदु धन, धन होता है; दूसरे में ऋण, धन; तीसरे में ऋण, ऋण; और चौथे में धन, ऋण।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "coordinatesOfH.correct": (_, __, t) => t.self.show({ name: "pointAt" }),
      "pointAt.correct": (_, __, t) => [t.self.show({ name: "summary" }), t.self.pass()],
    },
    uses: [coordinatesOfH.use, pointAt.use],
    witness: [
      tap("coordinatesOfH", "select", { option: "right" }),
      tap("coordinatesOfH", "check"),
      tap("pointAt", "select", { option: "c" }),
      tap("pointAt", "check"),
    ],
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
