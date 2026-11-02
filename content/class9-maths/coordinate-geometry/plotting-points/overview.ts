import { hidden, page, place, scene, t, tap } from "@chalk/author";
import { plane, words } from "@chalk/patterns";
import { Marks, Roads, Tone, coordinatePlane } from "@chalk/prop-coordinates";

const { setup, walkTo } = plane;

/** The axes as the last lesson left them: numbered, on graph paper, the directions named. */
const AXES = {
  marks: Marks.Numbers,
  numbered: ["x", "y"] as ("x" | "y")[],
  hasGrid: true,
  showAxisNames: false,
  showDirections: true,
};

/** A point a figure names, hidden until the board shows it. */
const marker = (name: string, x: number, y: number) => ({
  name,
  x,
  y,
  isShown: false,
  hasDropLines: false,
  tone: Tone.Main,
});

/** Fig. 3.15: P (3, 5) by way of A, Q (5, −4) by way of B, and room for R (−4, 2). */
const FIG_3_15 = { xMin: -5.5, xMax: 6.5, yMin: -5.5, yMax: 6.5 };

/** Every dot where its pair says. */
const allRight = (dots: readonly { isRight: boolean }[]) => dots.every((d) => d.isRight);

/** Said when every pair has a dot but some are red: they plot the lot again. */
const redo = () =>
  hidden(
    words.body(
      t(
        "The red dots aren't where their pairs say. Press ↺ and plot them again.",
        "लाल बिंदु अपनी जोड़ी वाली जगह पर नहीं हैं। ↺ दबाओ और उन्हें फिर से आलेखित करो।",
      ),
      {
        says: t(
          "The red dots aren't where their pairs say. Press the start-again button and plot them again.",
          "लाल बिंदु अपनी जोड़ी वाली जगह पर नहीं हैं। फिर से शुरू वाला बटन दबाओ और उन्हें फिर से आलेखित करो।",
        ),
      },
    ),
  );

/** A wrong first dot, all of them again from ↺, right: the path a student who slips takes. */
const slipThenRight = (piece: string, pairs: readonly { x: number; y: number }[]) => {
  const [first, ...rest] = pairs;
  if (first === undefined) return [];
  return [
    tap(`${piece}.plotting`, "plotAt", { x: first.y, y: first.x + 1 }),
    ...rest.map((p) => tap(`${piece}.plotting`, "plotAt", p)),
    tap(`${piece}.plotting`, "clearPlotted", {}),
    ...pairs.map((p) => tap(`${piece}.plotting`, "plotAt", p)),
  ];
};

/** Plotting, as Riya's walk: along the x-axis, then up or down; then the student plots, and her walk checks. */
const plotAPoint = page(
  "plot-a-point",
  scene({
    pieces: {
      title: words.title(t("Plotting a point", "बिंदु आलेखित करना")),
      link: words.body(
        t(
          "On fair day, volunteers set up the stalls from Riya's plan, from the numbers alone. Placing a point in the plane from its coordinates is called **plotting** the point.",
          "मेले के दिन स्वयंसेवक रिया के नक्शे से, केवल संख्याओं से, स्टॉल लगाते हैं। तल में किसी बिंदु को उसके निर्देशांकों से रखना उस बिंदु को **आलेखित करना** कहलाता है।",
        ),
      ),
      toP: words.body(
        t(
          "To plot P (3, 5): from O, walk **3 units along the x-axis** to A, then **5 units up**. Walk Riya there.",
          "P (3, 5) आलेखित करने के लिए: O से **x-अक्ष के साथ 3 इकाई** चलकर A तक, फिर **5 इकाई ऊपर**। रिया को वहाँ ले चलो।",
        ),
        {
          says: t(
            "To plot P, the point 3, 5: from O, walk 3 units along the x-axis to A, then 5 units up. Walk Riya there.",
            "बिंदु P, 3, 5 आलेखित करने के लिए: O से एक्स-अक्ष के साथ 3 इकाई चलकर A तक, फिर 5 इकाई ऊपर। रिया को वहाँ ले चलो।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            window: FIG_3_15,
            ...AXES,
            points: [marker("A", 3, 0), marker("P", 3, 5), marker("B", 5, 0), marker("Q", 5, -4)],
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
            "**P is 3 units from the y-axis and 5 units from the x-axis: it is (3, 5).** Both are positive, so P is in quadrant I.",
            "**P, y-अक्ष से 3 इकाई और x-अक्ष से 5 इकाई दूर है: वह (3, 5) है।** दोनों धनात्मक हैं, इसलिए P पहले चतुर्थांश में है।",
          ),
          null,
          {
            says: t(
              "P is 3 units from the y-axis and 5 units from the x-axis: it is the point 3, 5. Both are positive, so P is in quadrant one.",
              "P, वाई-अक्ष से 3 इकाई और एक्स-अक्ष से 5 इकाई दूर है: वह बिंदु 3, 5 है। दोनों धनात्मक हैं, इसलिए P पहले चतुर्थांश में है।",
            ),
          },
        ),
      ),
      toQ: hidden(
        words.body(
          t(
            "She is back at O. Now plot Q (5, −4): **5 along**, then **4 down**, since −4 is below the x-axis.",
            "वह फिर O पर है। अब Q (5, −4) आलेखित करो: **5 आगे**, फिर **4 नीचे**, क्योंकि −4, x-अक्ष के नीचे है।",
          ),
          {
            says: t(
              "She is back at O. Now plot Q, the point 5, minus 4: 5 along, then 4 down, since minus 4 is below the x-axis.",
              "वह फिर O पर है। अब Q, बिंदु 5, माइनस 4 आलेखित करो: 5 आगे, फिर 4 नीचे, क्योंकि माइनस 4, एक्स-अक्ष के नीचे है।",
            ),
          },
        ),
      ),
      atQ: hidden(
        words.definition(
          t(
            "**Q is (5, −4): x positive, y negative, so Q is in quadrant IV.**",
            "**Q है (5, −4): x धनात्मक, y ऋणात्मक, इसलिए Q चौथे चतुर्थांश में है।**",
          ),
          null,
          {
            says: t(
              "Q is the point 5, minus 4: x positive, y negative, so Q is in quadrant four.",
              "Q है बिंदु 5, माइनस 4: एक्स धनात्मक, वाई ऋणात्मक, इसलिए Q चौथे चतुर्थांश में है।",
            ),
          },
        ),
      ),
      toR: hidden(
        words.body(
          t(
            "Now plot **R (−4, 2)** yourself: **tap** where it goes. Riya will walk there to check.",
            "अब **R (−4, 2)** खुद आलेखित करो: जहाँ वह है वहाँ **दबाओ**। जाँचने के लिए रिया वहाँ चलेगी।",
          ),
          {
            says: t(
              "Now plot R, the point minus 4, 2, yourself: tap where it goes. Riya will walk there to check.",
              "अब R, बिंदु माइनस 4, 2, खुद आलेखित करो: जहाँ वह है वहाँ दबाओ। जाँचने के लिए रिया वहाँ चलेगी।",
            ),
          },
        ),
      ),
      // R on a plane of its own, P and Q already marked: it takes taps only once R is asked for.
      check: hidden(
        place(
          coordinatePlane,
          setup({
            plane: {
              window: FIG_3_15,
              ...AXES,
              points: [
                { ...marker("A", 3, 0), isShown: true },
                { ...marker("P", 3, 5), isShown: true },
                { ...marker("B", 5, 0), isShown: true },
                { ...marker("Q", 5, -4), isShown: true },
              ],
            },
            walker: {
              walkFrom: { x: 0, y: 0 },
              at: { x: 0, y: 0 },
              roads: Roads.Grid,
              showWhere: false,
              canStep: false,
            },
            plotting: { toPlot: [{ x: -4, y: 2, name: "R" }] },
          }),
        ),
      ),
      atR: hidden(
        words.body(
          t(
            "Her walk, 4 to the left and 2 up, ends on your dot: **R is (−4, 2)**, in quadrant II.",
            "उसकी चाल, 4 बाईं ओर और 2 ऊपर, तुम्हारे बिंदु पर ख़त्म होती है: **R है (−4, 2)**, दूसरे चतुर्थांश में।",
          ),
          {
            says: t(
              "Her walk, 4 to the left and 2 up, ends on your dot: R is the point minus 4, 2, in quadrant two.",
              "उसकी चाल, 4 बाईं ओर और 2 ऊपर, तुम्हारे बिंदु पर ख़त्म होती है: R है बिंदु माइनस 4, 2, दूसरे चतुर्थांश में।",
            ),
          },
        ),
      ),
      notR: hidden(
        words.body(
          t(
            "Not there: R is 4 to the **left** of the y-axis (x\u00a0=\u00a0−4) and 2 **up** (y\u00a0=\u00a02). Tap again.",
            "वहाँ नहीं: R, y-अक्ष के 4 **बाईं ओर** (x\u00a0=\u00a0−4) और 2 **ऊपर** (y\u00a0=\u00a02) है। फिर से दबाओ।",
          ),
          {
            says: t(
              "Not there: R is 4 to the left of the y-axis, x is minus 4, and 2 up, y is 2. Tap again.",
              "वहाँ नहीं: R, वाई-अक्ष के 4 बाईं ओर, एक्स माइनस 4, और 2 ऊपर, वाई 2 है। फिर से दबाओ।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      // P first, then Q: each marked as she reaches its corner and its end.
      "sheet.walker.stepped": (me, p, t) => {
        if (me.hidden.includes("atP")) {
          if (p.x === 3 && p.y === 0) return t.to.sheet.plane.showPoint({ name: "A" });
          return (
            p.x === 3 &&
            p.y === 5 && [
              t.to.sheet.plane.showPoint({ name: "P" }),
              t.self.show({ name: "atP" }),
              t.to.sheet.walker.backToStart({}),
              t.self.show({ name: "toQ" }),
            ]
          );
        }
        if (!me.hidden.includes("atQ")) return;
        if (p.x === 5 && p.y === 0) return t.to.sheet.plane.showPoint({ name: "B" });
        return (
          p.x === 5 &&
          p.y === -4 && [
            t.to.sheet.plane.showPoint({ name: "Q" }),
            t.self.show({ name: "atQ" }),
            t.self.hide({ name: "sheet" }),
            t.self.show({ name: "toR" }),
            t.self.show({ name: "check" }),
          ]
        );
      },
      // The student's dot for R: right, and Riya walks to it; wrong, it comes off to try again.
      "check.plotting.plotted": (_, p, t) =>
        p.isRight
          ? [
              t.self.hide({ name: "notR" }),
              t.to.check.walker.walkTo({ x: -4, y: 2 }),
              t.self.show({ name: "atR" }),
              t.self.pass(),
            ]
          : [t.to.check.plotting.clearPlotted(), t.self.show({ name: "notR" })],
    },
    witness: [
      ...walkTo("sheet", 3, 5),
      ...walkTo("sheet", 5, -4),
      // A swapped tap first: the dot comes off and the hint shows; then the right one.
      tap("check.plotting", "plotAt", { x: 2, y: -4 }),
      tap("check.plotting", "plotAt", { x: -4, y: 2 }),
    ],
  }),
);

/** Example 3's eight points, its three swapped pairs each plotted one after the other, then an equal pair. */
const EXAMPLE_3 = [
  { x: 5, y: 0 },
  { x: 0, y: 5 },
  { x: 2, y: 5 },
  { x: 5, y: 2 },
  { x: -3, y: 5 },
  { x: 5, y: -3 },
  { x: -3, y: -5 },
  { x: 6, y: 1 },
  { x: 3, y: 3 },
];

const swapTheNumbers = page(
  "swap-the-numbers",
  scene({
    pieces: {
      title: words.title(t("Swap the numbers", "संख्याएँ उलटो")),
      story: words.body(
        t(
          "Aman wrote the games stall's place as (2, 5). The volunteers set it up **2 along and 5 up**, but Riya's plan says (5, 2): **5 along and 2 up**. Does the order matter? Plot each point in turn: a pair and its swap come one after the other.",
          "अमन ने खेल वाले स्टॉल की जगह (2, 5) लिखी। स्वयंसेवकों ने उसे **2 आगे और 5 ऊपर** लगाया, पर रिया का नक्शा (5, 2) कहता है: **5 आगे और 2 ऊपर**। क्या क्रम मायने रखता है? हर बिंदु बारी-बारी से आलेखित करो: हर जोड़ी के ठीक बाद उसकी उलटी जोड़ी आती है।",
        ),
        {
          says: t(
            "Aman wrote the games stall's place as 2, 5. The volunteers set it up 2 along and 5 up, but Riya's plan says 5, 2: 5 along and 2 up. Does the order matter? Plot each point in turn: a pair and its swap come one after the other.",
            "अमन ने खेल वाले स्टॉल की जगह 2, 5 लिखी। स्वयंसेवकों ने उसे 2 आगे और 5 ऊपर लगाया, पर रिया का नक्शा 5, 2 कहता है: 5 आगे और 2 ऊपर। क्या क्रम मायने रखता है? हर बिंदु बारी-बारी से आलेखित करो: हर जोड़ी के ठीक बाद उसकी उलटी जोड़ी आती है।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: { window: { xMin: -6.5, xMax: 6.5, yMin: -6.5, yMax: 6.5 }, ...AXES },
          plotting: { toPlot: EXAMPLE_3, showTable: true },
        }),
      ),
      redo: redo(),
      ordered: hidden(
        words.definition(
          t(
            "**(5, 0) and (0, 5), (5, 2) and (2, 5), (−3, 5) and (5, −3) are at different places. If x\u00a0≠\u00a0y, (x, y) and (y, x) are different points: the order matters, so (x, y) is called an ordered pair.** Only when x\u00a0=\u00a0y, as in (3, 3), is the swap the same point.",
            "**(5, 0) और (0, 5), (5, 2) और (2, 5), (−3, 5) और (5, −3) अलग-अलग जगहों पर हैं। यदि x\u00a0≠\u00a0y, तो (x, y) और (y, x) अलग बिंदु हैं: क्रम मायने रखता है, इसलिए (x, y) को क्रमित युग्म कहते हैं।** केवल जब x\u00a0=\u00a0y, जैसे (3, 3) में, तब उलटा जोड़ा वही बिंदु है।",
          ),
          null,
          {
            says: t(
              "5, 0 and 0, 5; 5, 2 and 2, 5; minus 3, 5 and 5, minus 3 are at different places. If x is not equal to y, x, y and y, x are different points: the order matters, so x, y is called an ordered pair. Only when x equals y, as in 3, 3, is the swap the same point.",
              "5, 0 और 0, 5; 5, 2 और 2, 5; माइनस 3, 5 और 5, माइनस 3 अलग-अलग जगहों पर हैं। यदि एक्स, वाई के बराबर नहीं है, तो एक्स, वाई और वाई, एक्स अलग बिंदु हैं: क्रम मायने रखता है, इसलिए एक्स, वाई को क्रमित युग्म कहते हैं। केवल जब एक्स बराबर वाई, जैसे 3, 3 में, तब उलटा जोड़ा वही बिंदु है।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "sheet.plotting.allPlotted": (me, _, t) =>
        allRight(me.sheet.plotting.plotted)
          ? [t.self.hide({ name: "redo" }), t.self.show({ name: "ordered" }), t.self.pass()]
          : t.self.show({ name: "redo" }),
    },
    witness: slipThenRight("sheet", EXAMPLE_3),
  }),
);

/** Example 4's table, (0, −3.5) between the marks. */
const EXAMPLE_4 = [
  { x: -3, y: 7 },
  { x: 0, y: -3.5 },
  { x: -1, y: -3 },
  { x: 4, y: 4 },
  { x: 2, y: -3 },
];
/** Ex 3.3 Q2's table: y = 8 is off a plane numbered to 4, until the scale is chosen. */
const EX_3_3_Q2 = [
  { x: -2, y: 8 },
  { x: -1, y: 7 },
  { x: 0, y: -1.25 },
  { x: 1, y: 3 },
  { x: 3, y: -1 },
];

const plotFromATable = page(
  "plot-from-a-table",
  scene({
    pieces: {
      title: words.title(t("Points from a table", "सारणी से बिंदु")),
      table: words.body(
        t(
          "Points often come as a table: each column is one point, x on top, y below. Plot each pair; (0, −3.5) falls **halfway between** −3 and −4.",
          "बिंदु अक्सर सारणी में आते हैं: हर स्तंभ एक बिंदु है, ऊपर x, नीचे y। हर जोड़ा आलेखित करो; (0, −3.5), −3 और −4 के **ठीक बीच** में आता है।",
        ),
        {
          says: t(
            "Points often come as a table: each column is one point, x on top, y below. Plot each pair; 0, minus 3.5 falls halfway between minus 3 and minus 4.",
            "बिंदु अक्सर सारणी में आते हैं: हर स्तंभ एक बिंदु है, ऊपर एक्स, नीचे वाई। हर जोड़ा आलेखित करो; 0, माइनस 3.5, माइनस 3 और माइनस 4 के ठीक बीच में आता है।",
          ),
        },
      ),
      first: place(
        coordinatePlane,
        setup({
          plane: { window: { xMin: -4.5, xMax: 5.5, yMin: -4.5, yMax: 7.5 }, ...AXES },
          plotting: { toPlot: EXAMPLE_4, showTable: true },
        }),
      ),
      redoFirst: redo(),
      scale: hidden(
        words.body(
          t(
            "Now this table. With one unit to each mark, (−2, 8) and (−1, 7) don't fit on the plane. **Choose a scale** where each mark stands for more units, so every point fits; then plot them.",
            "अब यह सारणी। हर निशान पर एक इकाई से (−2, 8) और (−1, 7) तल पर नहीं आते। ऐसा **पैमाना चुनो** जिसमें हर निशान ज़्यादा इकाइयों का हो, ताकि हर बिंदु आ जाए; फिर उन्हें आलेखित करो।",
          ),
          {
            says: t(
              "Now this table. With one unit to each mark, minus 2, 8 and minus 1, 7 don't fit on the plane. Choose a scale where each mark stands for more units, so every point fits; then plot them.",
              "अब यह सारणी। हर निशान पर एक इकाई से माइनस 2, 8 और माइनस 1, 7 तल पर नहीं आते। ऐसा पैमाना चुनो जिसमें हर निशान ज़्यादा इकाइयों का हो, ताकि हर बिंदु आ जाए; फिर उन्हें आलेखित करो।",
            ),
          },
        ),
      ),
      second: hidden(
        place(
          coordinatePlane,
          setup({
            plane: { window: { xMin: -4.5, xMax: 4.5, yMin: -4.5, yMax: 4.5 }, ...AXES },
            plotting: { toPlot: EX_3_3_Q2, showTable: true, scaleChoices: [1, 2] },
          }),
        ),
      ),
      redoSecond: redo(),
      fits: hidden(
        words.body(
          t(
            "Every point fits once each mark stands for 2 units. A scale is chosen from the table: the largest number has to fit on the plane.",
            "हर निशान 2 इकाई का होते ही हर बिंदु आ जाता है। पैमाना सारणी देखकर चुना जाता है: सबसे बड़ी संख्या तल पर आनी चाहिए।",
          ),
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "first.plotting.allPlotted": (me, _, t) =>
        allRight(me.first.plotting.plotted)
          ? [
              t.self.hide({ name: "redoFirst" }),
              t.self.show({ name: "scale" }),
              t.self.show({ name: "second" }),
            ]
          : t.self.show({ name: "redoFirst" }),
      // The scale they choose is the plane's: its marks, and the window with them.
      "second.plotting.scaleChosen": (_, { every }, t) => t.to.second.plane.setScale({ every }),
      "second.plotting.allPlotted": (me, _, t) =>
        allRight(me.second.plotting.plotted)
          ? [t.self.hide({ name: "redoSecond" }), t.self.show({ name: "fits" }), t.self.pass()]
          : t.self.show({ name: "redoSecond" }),
    },
    witness: [
      ...slipThenRight("first", EXAMPLE_4),
      tap("second.plotting", "chooseScale", { every: 2 }),
      ...slipThenRight("second", EX_3_3_Q2),
    ],
  }),
);

/** Activity 2 at the fair's game stall: red along, green up, first to (10, 10). */
const diceGame = page(
  "dice-game",
  scene({
    pieces: {
      title: words.title(t("The dice game", "पासों का खेल")),
      rules: words.body(
        t(
          "At the fair's game stall, Riya and Aman play. Both counters start at (0, 0). Each throw of a **red** and a **green** die: the red number is added to **x**, the green to **y**. First to **(10, 10)** wins. A die that would take a coordinate past 10 isn't used, and landing on the other counter sends it back to (0, 0).",
          "मेले के खेल वाले स्टॉल पर रिया और अमन खेलते हैं। दोनों गोटियाँ (0, 0) से शुरू होती हैं। हर बार **लाल** और **हरा** पासा फेंकने पर: लाल संख्या **x** में जुड़ती है, हरी **y** में। जो पहले **(10, 10)** पहुँचे, वह जीतता है। जो पासा किसी निर्देशांक को 10 से आगे ले जाए, वह काम नहीं आता, और दूसरी गोटी पर उतरने से वह (0, 0) पर वापस चली जाती है।",
        ),
        {
          says: t(
            "At the fair's game stall, Riya and Aman play. Both counters start at 0, 0. Each throw of a red and a green die: the red number is added to x, the green to y. First to 10, 10 wins. A die that would take a coordinate past 10 isn't used, and landing on the other counter sends it back to 0, 0.",
            "मेले के खेल वाले स्टॉल पर रिया और अमन खेलते हैं। दोनों गोटियाँ 0, 0 से शुरू होती हैं। हर बार लाल और हरा पासा फेंकने पर: लाल संख्या एक्स में जुड़ती है, हरी वाई में। जो पहले 10, 10 पहुँचे, वह जीतता है। जो पासा किसी निर्देशांक को 10 से आगे ले जाए, वह काम नहीं आता, और दूसरी गोटी पर उतरने से वह 0, 0 पर वापस चली जाती है।",
          ),
        },
      ),
      game: place(
        coordinatePlane,
        setup({
          plane: {
            window: { xMin: -0.5, xMax: 10.5, yMin: -0.5, yMax: 10.5 },
            ...AXES,
            showDirections: false,
          },
          dice: {
            counters: [
              { x: 0, y: 0 },
              { x: 0, y: 0 },
            ],
            playerNames: [t("Riya", "रिया"), t("Aman", "अमन")],
            goal: 10,
          },
        }),
      ),
      playOn: hidden(
        words.body(
          t(
            "Each move is a plot: along by red, then up by green. **Play on** to (10, 10).",
            "हर चाल एक आलेखन है: लाल से आगे, फिर हरे से ऊपर। (10, 10) तक **खेलते रहो**।",
          ),
          {
            says: t(
              "Each move is a plot: along by red, then up by green. Play on to 10, 10.",
              "हर चाल एक आलेखन है: लाल से आगे, फिर हरे से ऊपर। 10, 10 तक खेलते रहो।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      // A few throws make the rule plain; the game goes on as long as they like.
      "game.dice.thrown": (me, _, t) =>
        me.game.dice.throwsMade >= 3 &&
        me.hidden.includes("playOn") && [t.self.show({ name: "playOn" }), t.self.pass()],
    },
    witness: [
      tap("game.dice", "throwDice", {}),
      tap("game.dice", "throwDice", {}),
      tap("game.dice", "throwDice", {}),
    ],
  }),
);

/** Riya's walk timed: minutes and blocks as a table, plotted on axes named t and d. */
const WALK = [
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
  { x: 4, y: 8 },
];

const graphsYouKnow = page(
  "graphs-you-know",
  scene({
    pieces: {
      title: words.title(t("Graphs you already know", "ग्राफ़ जो तुम जानते हो")),
      walk: words.body(
        t(
          "On her way to Aman's house, Riya walks 2 blocks every minute. Her time t (in minutes) and her distance d (in blocks) make a table. Plot each pair: **t along, d up**.",
          "अमन के घर जाते हुए रिया हर मिनट 2 ब्लॉक चलती है। उसका समय t (मिनट में) और दूरी d (ब्लॉक में) एक सारणी बनाते हैं। हर जोड़ा आलेखित करो: **t आगे, d ऊपर**।",
        ),
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            window: { xMin: -0.5, xMax: 5.5, yMin: -0.5, yMax: 9.5 },
            ...AXES,
            showDirections: false,
            axisNames: [t("t", "t"), t("d", "d")],
            showAxisNames: true,
          },
          plotting: { toPlot: WALK, showTable: true },
        }),
      ),
      redo: redo(),
      same: hidden(
        words.body(
          t(
            "This is the time-distance graph of earlier classes: the same plotting, with the axes called t and d instead of x and y.",
            "यह पिछली कक्षाओं का समय-दूरी ग्राफ़ है: वही आलेखन, बस अक्षों के नाम x और y की जगह t और d।",
          ),
        ),
      ),
      summary: hidden(
        words.body(
          t(
            "**In short:** to plot (x, y), go x along the x-axis, then y up or down. If x\u00a0≠\u00a0y, then (x, y) ≠ (y, x); if x\u00a0=\u00a0y, they are the same point.",
            "**संक्षेप में:** (x, y) आलेखित करने के लिए x-अक्ष के साथ x चलो, फिर y ऊपर या नीचे। यदि x\u00a0≠\u00a0y, तो (x, y) ≠ (y, x); यदि x\u00a0=\u00a0y, तो दोनों एक ही बिंदु हैं।",
          ),
          {
            says: t(
              "In short: to plot x, y, go x along the x-axis, then y up or down. If x is not equal to y, then x, y is not equal to y, x; if x equals y, they are the same point.",
              "संक्षेप में: एक्स, वाई आलेखित करने के लिए एक्स-अक्ष के साथ एक्स चलो, फिर वाई ऊपर या नीचे। यदि एक्स, वाई के बराबर नहीं है, तो एक्स, वाई और वाई, एक्स बराबर नहीं; यदि एक्स बराबर वाई, तो दोनों एक ही बिंदु हैं।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "sheet.plotting.allPlotted": (me, _, t) =>
        allRight(me.sheet.plotting.plotted)
          ? [
              t.self.hide({ name: "redo" }),
              t.self.show({ name: "same" }),
              t.self.show({ name: "summary" }),
              t.self.pass(),
            ]
          : t.self.show({ name: "redo" }),
    },
    witness: slipThenRight("sheet", WALK),
  }),
);

/** The pages, in reading order. */
export const overview = [plotAPoint, swapTheNumbers, plotFromATable, diceGame, graphsYouKnow];
