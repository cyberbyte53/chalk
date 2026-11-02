import { hidden, page, place, scene, t, tap } from "@chalk/author";
import { plane, words } from "@chalk/patterns";
import {
  Choosing,
  Marks,
  PlaceKind,
  Roads,
  Scene,
  Tone,
  coordinatePlane,
} from "@chalk/prop-coordinates";

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

/** Said when a dot is dropped where its pair doesn't say; gone once one is placed right. */
const miss = () =>
  hidden(
    words.body(
      t(
        "Not there. x first: along the x-axis; then y: up or down. Drag the dot again.",
        "वहाँ नहीं। पहले x: x-अक्ष के साथ; फिर y: ऊपर या नीचे। बिंदु को फिर से खींचो।",
      ),
      {
        says: t(
          "Not there. x first: along the x-axis; then y: up or down. Drag the dot again.",
          "वहाँ नहीं। पहले एक्स: एक्स-अक्ष के साथ; फिर वाई: ऊपर या नीचे। बिंदु को फिर से खींचो।",
        ),
      },
    ),
  );

/** A plotting piece's rules for its hint: shown on a miss, gone on a right drop. */
const missRules = (piece: string, hint: string) => ({
  [`${piece}.plotting.missed`]: (
    _: unknown,
    __: unknown,
    t: { self: { show: (p: { name: string }) => unknown } },
  ) => t.self.show({ name: hint }),
  [`${piece}.plotting.plotted`]: (
    me: { hidden: readonly string[] },
    __: unknown,
    t: { self: { hide: (p: { name: string }) => unknown } },
  ) => (me.hidden.includes(hint) ? undefined : t.self.hide({ name: hint })),
});

/** The first pair dropped swapped (a miss), then every pair right: the path a student who slips takes. */
const slipThenRight = (piece: string, pairs: readonly { x: number; y: number }[]) => {
  const [first] = pairs;
  if (first === undefined) return [];
  return [
    tap(`${piece}.plotting`, "plotAt", { x: first.y, y: first.x + 1 }),
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
            "Now plot **R (−4, 2)** yourself: **drag** the dot from O to where it goes. Riya will walk to it to check.",
            "अब **R (−4, 2)** खुद आलेखित करो: बिंदु को O से उसकी जगह तक **खींचो**। जाँचने के लिए रिया उस तक चलेगी।",
          ),
          {
            says: t(
              "Now plot R, the point minus 4, 2, yourself: drag the dot from O to where it goes. Riya will walk to it to check.",
              "अब R, बिंदु माइनस 4, 2, खुद आलेखित करो: बिंदु को O से उसकी जगह तक खींचो। जाँचने के लिए रिया उस तक चलेगी।",
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
              // Where she stands is written: after a miss, it says where the dot really was.
              showWhere: true,
              canStep: false,
            },
            // Whole squares, so Riya can walk to any drop.
            plotting: { toPlot: [{ x: -4, y: 2, name: "R" }], step: 1 },
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
            "Riya walked to your dot: where she stands is written beside her, and it isn't R. R is 4 to the **left** of the y-axis (x\u00a0=\u00a0−4) and 2 **up** (y\u00a0=\u00a02). Drag the dot again.",
            "रिया तुम्हारे बिंदु तक चली: वह कहाँ खड़ी है, उसके पास लिखा है, और वह R नहीं है। R, y-अक्ष के 4 **बाईं ओर** (x\u00a0=\u00a0−4) और 2 **ऊपर** (y\u00a0=\u00a02) है। बिंदु को फिर से खींचो।",
          ),
          {
            says: t(
              "Riya walked to your dot: where she stands is written beside her, and it isn't R. R is 4 to the left of the y-axis, x is minus 4, and 2 up, y is 2. Drag the dot again.",
              "रिया तुम्हारे बिंदु तक चली: वह कहाँ खड़ी है, उसके पास लिखा है, और वह R नहीं है। R, वाई-अक्ष के 4 बाईं ओर, एक्स माइनस 4, और 2 ऊपर, वाई 2 है। बिंदु को फिर से खींचो।",
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
      // Wherever R is dropped, Riya walks there from O: on R, it is right; anywhere else, where
      // she stands says where the dot was.
      "check.plotting.missed": (_, p, t) => [
        t.to.check.walker.walkTo({ x: p.x, y: p.y }),
        t.self.show({ name: "notR" }),
      ],
      "check.plotting.plotted": (_, __, t) => [
        t.self.hide({ name: "notR" }),
        t.to.check.walker.walkTo({ x: -4, y: 2 }),
        t.self.show({ name: "atR" }),
        t.self.pass(),
      ],
    },
    witness: [
      ...walkTo("sheet", 3, 5),
      ...walkTo("sheet", 5, -4),
      // A swapped drop first: Riya walks there and the hint shows; then the right one.
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
      miss: miss(),
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
      ...missRules("sheet", "miss"),
      "sheet.plotting.allPlotted": (_, __, t) => [t.self.show({ name: "ordered" }), t.self.pass()],
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
      missFirst: miss(),
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
      missSecond: miss(),
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
      ...missRules("first", "missFirst"),
      ...missRules("second", "missSecond"),
      "first.plotting.allPlotted": (_, __, t) => [
        t.self.show({ name: "scale" }),
        t.self.show({ name: "second" }),
      ],
      "second.plotting.allPlotted": (_, __, t) => [t.self.show({ name: "fits" }), t.self.pass()],
    },
    witness: [
      ...slipThenRight("first", EXAMPLE_4),
      tap("second.plotting", "chooseScale", { every: 2 }),
      ...slipThenRight("second", EX_3_3_Q2),
    ],
  }),
);

/** A stall on the trail's fair ground: where it stands, its sign, and its name in a sentence. */
type Stall = {
  key: string;
  x: number;
  y: number;
  sign: [string, string];
  en: string;
  hiOf: string;
};

/** The trail, in order: one stall in each quadrant, one on the x-axis, the kite last. */
const ROUTE: Stall[] = [
  { key: "snacks", x: 4, y: 1, sign: ["Snacks", "नाश्ता"], en: "snack", hiOf: "नाश्ते का" },
  { key: "books", x: -3, y: 4, sign: ["Books", "किताबें"], en: "book", hiOf: "किताबों का" },
  { key: "balloons", x: -2, y: -4, sign: ["Balloons", "गुब्बारे"], en: "balloon", hiOf: "गुब्बारों का" },
  { key: "toys", x: -2, y: 0, sign: ["Toys", "खिलौने"], en: "toy", hiOf: "खिलौनों का" },
  { key: "kites", x: 2, y: -3, sign: ["Kites", "पतंगें"], en: "kite", hiOf: "पतंगों का" },
];
/** Where a slip lands: each clue's address swapped, and the axis stop's sign flipped. */
const DECOYS: Stall[] = [
  { key: "bangles", x: 1, y: 4, sign: ["Bangles", "चूड़ियाँ"], en: "bangle", hiOf: "चूड़ियों का" },
  { key: "shoes", x: 4, y: -3, sign: ["Shoes", "जूते"], en: "shoe", hiOf: "जूतों का" },
  { key: "tea", x: -4, y: -2, sign: ["Tea", "चाय"], en: "tea", hiOf: "चाय का" },
  { key: "masks", x: 2, y: 0, sign: ["Masks", "मुखौटे"], en: "mask", hiOf: "मुखौटों का" },
  { key: "juice", x: -3, y: 2, sign: ["Juice", "जूस"], en: "juice", hiOf: "जूस का" },
];
const STALLS = [...ROUTE, ...DECOYS];

const signed = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const pairOf = (s: { x: number; y: number }) => `(${signed(s.x)}, ${signed(s.y)})`;
const saidEn = (s: { x: number; y: number }) =>
  [s.x, s.y].map((n) => (n < 0 ? `minus ${-n}` : `${n}`)).join(", ");
const saidHi = (s: { x: number; y: number }) =>
  [s.x, s.y].map((n) => (n < 0 ? `माइनस ${-n}` : `${n}`)).join(", ");
const capital = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** The clue a route stall gives: the next stall's address, or, at the last, the kite. */
const clueAt = (i: number) => {
  const here = ROUTE[i];
  const next = ROUTE[i + 1];
  if (here === undefined) throw new Error("no such stall on the route");
  return hidden(
    next === undefined
      ? words.definition(
          t(
            "**The kite stall!** Aman's lost kite is here. You found every stall from its address alone: x along, then y up or down.",
            "**पतंगों का स्टॉल!** अमन की खोई पतंग यहीं है। तुमने हर स्टॉल केवल उसके पते से ढूँढा: x आगे, फिर y ऊपर या नीचे।",
          ),
          null,
          {
            says: t(
              "The kite stall! Aman's lost kite is here. You found every stall from its address alone: x along, then y up or down.",
              "पतंगों का स्टॉल! अमन की खोई पतंग यहीं है। तुमने हर स्टॉल केवल उसके पते से ढूँढा: एक्स आगे, फिर वाई ऊपर या नीचे।",
            ),
          },
        )
      : words.body(
          t(
            `**The ${here.en} stall!** Its clue: the next stall is at **${pairOf(next)}**.`,
            `**${here.hiOf} स्टॉल!** उसका सुराग: अगला स्टॉल **${pairOf(next)}** पर है।`,
          ),
          {
            says: t(
              `The ${here.en} stall! Its clue: the next stall is at the point ${saidEn(next)}.`,
              `${here.hiOf} स्टॉल! उसका सुराग: अगला स्टॉल बिंदु ${saidHi(next)} पर है।`,
            ),
          },
        ),
  );
};

/** At a stall that isn't the clue's: what it is and where, and to read the clue again. */
const wrongStop = (s: Stall) =>
  hidden(
    words.body(
      t(
        `This is the ${s.en} stall, at **${pairOf(s)}**: not the stall your clue names. Read the clue again: x first, along; then y, up or down.`,
        `यह ${s.hiOf} स्टॉल है, **${pairOf(s)}** पर: वह स्टॉल नहीं जो तुम्हारा सुराग बताता है। सुराग फिर पढ़ो: पहले x, आगे; फिर y, ऊपर या नीचे।`,
      ),
      {
        says: t(
          `This is the ${s.en} stall, at the point ${saidEn(s)}: not the stall your clue names. Read the clue again: x first, along; then y, up or down.`,
          `यह ${s.hiOf} स्टॉल है, बिंदु ${saidHi(s)} पर: वह स्टॉल नहीं जो तुम्हारा सुराग बताता है। सुराग फिर पढ़ो: पहले एक्स, आगे; फिर वाई, ऊपर या नीचे।`,
        ),
      },
    ),
  );

/** The arrow taps that walk Riya from one point to another: along, then up or down. */
const stepsBetween = (from: { x: number; y: number }, to: { x: number; y: number }) => [
  ...Array.from({ length: Math.abs(to.x - from.x) }, () =>
    tap("ground.walker", "step", { direction: to.x > from.x ? "right" : "left" }),
  ),
  ...Array.from({ length: Math.abs(to.y - from.y) }, () =>
    tap("ground.walker", "step", { direction: to.y > from.y ? "up" : "down" }),
  ),
];

/** A treasure trail at the fair: each stall's clue is the next stall's address. */
const treasureTrail = page(
  "treasure-trail",
  scene({
    pieces: {
      title: words.title(t("The treasure trail", "ख़ज़ाने की खोज")),
      rules: words.body(
        t(
          "Aman has lost his kite at the fair. The stalls hold clues: each one gives the **address of the next stall**. Walk Riya with the arrows from the gate at O; when she stands at the stall you want, **tap it** to open it.",
          "अमन की पतंग मेले में खो गई है। स्टॉलों पर सुराग हैं: हर सुराग **अगले स्टॉल का पता** बताता है। रिया को तीरों से O वाले फाटक से ले चलो; जब वह तुम्हारे चुने स्टॉल पर खड़ी हो, उसे खोलने के लिए उस पर **दबाओ**।",
        ),
      ),
      first: words.body(
        t(
          `**The first clue:** go to the stall at **${pairOf(ROUTE[0] ?? { x: 0, y: 0 })}**.`,
          `**पहला सुराग:** **${pairOf(ROUTE[0] ?? { x: 0, y: 0 })}** वाले स्टॉल पर जाओ।`,
        ),
        {
          says: t(
            `The first clue: go to the stall at the point ${saidEn(ROUTE[0] ?? { x: 0, y: 0 })}.`,
            `पहला सुराग: बिंदु ${saidHi(ROUTE[0] ?? { x: 0, y: 0 })} वाले स्टॉल पर जाओ।`,
          ),
        },
      ),
      ...Object.fromEntries(ROUTE.map((s, i) => [`at${capital(s.key)}`, clueAt(i)])),
      // Every stall but the first clue's, which can't be reached too early.
      ...Object.fromEntries(STALLS.slice(1).map((s) => [`not${capital(s.key)}`, wrongStop(s)])),
      notThere: hidden(
        words.body(
          t(
            "Riya isn't at that stall. Walk her there first, then tap it.",
            "रिया उस स्टॉल पर नहीं है। पहले उसे वहाँ ले चलो, फिर उस पर दबाओ।",
          ),
        ),
      ),
      ground: place(
        coordinatePlane,
        setup({
          plane: {
            window: { xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 },
            ...AXES,
            scene: Scene.FairGround,
            showDirections: false,
          },
          places: {
            placeKind: PlaceKind.Stall,
            places: STALLS.map((s) => ({ x: s.x, y: s.y, label: t(...s.sign) })),
            // A stall is opened by a tap, where Riya stands: walking past one opens nothing.
            choosing: Choosing.Always,
            showAddress: false,
          },
          walker: {
            walkFrom: { x: 0, y: 0 },
            at: { x: 0, y: 0 },
            roads: Roads.Grid,
            showWhere: false,
          },
        }),
      ),
    },
    passBy: "rules",
    hear: {
      // A step on: what the last stall said goes.
      "ground.walker.stepped": (me, _, t) =>
        [...STALLS.slice(1).map((s) => `not${capital(s.key)}`), "notThere"]
          .filter((name) => !me.hidden.includes(name))
          .map((name) => t.self.hide({ name })),
      // A stall tapped: only where Riya stands. The clue's stall gives the next clue; any other
      // says what it is and where.
      "ground.places.targetChosen": (me, p, t) => {
        const shown = (name: string) => !me.hidden.includes(name);
        const notes = [...STALLS.slice(1).map((s) => `not${capital(s.key)}`), "notThere"]
          .filter(shown)
          .map((name) => t.self.hide({ name }));
        const at = me.ground.walker.at;
        if (at.x !== p.x || at.y !== p.y) return [...notes, t.self.show({ name: "notThere" })];
        // How far along: the clue showing is the last stall opened (none yet: the first clue).
        const k = ROUTE.findIndex((s) => shown(`at${capital(s.key)}`)) + 1;
        const target = ROUTE[k];
        const stall = STALLS.find((s) => s.x === p.x && s.y === p.y);
        if (target !== undefined && stall === target) {
          const before = k === 0 ? "first" : `at${capital(ROUTE[k - 1]?.key ?? "")}`;
          return [
            ...notes,
            t.self.hide({ name: before }),
            t.self.show({ name: `at${capital(target.key)}` }),
            ...(k === ROUTE.length - 1 ? [t.self.pass()] : []),
          ];
        }
        const isOpened = stall !== undefined && ROUTE.slice(0, k).includes(stall);
        if (stall === undefined || isOpened || target === undefined) return notes;
        return [...notes, t.self.show({ name: `not${capital(stall.key)}` })];
      },
    },
    // A student who slips: a stall tapped from afar, stalls opened too early, and each clue's
    // swapped address before its own.
    witness: [
      [-3, 4],
      [1, 4],
      [4, 1],
      [-2, -4],
      [-2, 0],
      [4, -3],
      [-3, 4],
      [2, -3],
      [-4, -2],
      [-2, -4],
      [2, 0],
      [-2, 0],
      [-3, 2],
      [2, -3],
    ].flatMap(([x, y], i, all) => {
      const [fx, fy] = all[i - 1] ?? [0, 0];
      const here = { x: x ?? 0, y: y ?? 0 };
      return [
        // A stall tapped from the gate, before walking there.
        ...(i === 0 ? [tap("ground.places", "chooseTarget", { x: 4, y: 1 })] : []),
        ...stepsBetween({ x: fx ?? 0, y: fy ?? 0 }, here),
        tap("ground.places", "chooseTarget", here),
      ];
    }),
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
      miss: miss(),
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
      ...missRules("sheet", "miss"),
      "sheet.plotting.allPlotted": (_, __, t) => [
        t.self.show({ name: "same" }),
        t.self.show({ name: "summary" }),
        t.self.pass(),
      ],
    },
    witness: slipThenRight("sheet", WALK),
  }),
);

/** The pages, in reading order. */
export const overview = [plotAPoint, swapTheNumbers, plotFromATable, treasureTrail, graphsYouKnow];
