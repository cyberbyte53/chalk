import { page, t } from "@chalk/author";
import { wordsOn } from "@chalk/patterns";
import { coordinatePlaneDef } from "@chalk/prop-coordinates";

const r = String.raw;

/**
 * NCERT 3.2 from Fig 3.10: a point's distances from the two axes, with signs, are its coordinates.
 * Discover → state: the student drags P and reads its distances from the axes, then the
 * definitions (x-coordinate or abscissa, y-coordinate or ordinate, (x, y)); then Example 1, points
 * on the axes (Example 2), and the signs in each quadrant, with why.
 */

/** Fig 3.10: P's and Q's distances from the axes, each with its direction. */
const distances = page("distances", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Discover: a point's perpendicular distances from the two axes, each measured along an axis and signed by its direction (Fig 3.10: P is 4 right and 3 up; Q is 6 left and 2 down).",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    x: 4,
    y: 3,
    showCoordinates: false,
    showQuadrants: false,
  });
  b.standsFor(
    plane,
    "P with dotted perpendiculars to both axes, each labelled with its signed length",
  );
  return [
    w.title(t("Coordinates of a point", "बिंदु के निर्देशांक")),
    w.body(
      t(
        "How do we write down where a point is, so there is no confusion? Draw **perpendiculars** from P to the two axes (the dotted lines) and look at their lengths.",
        "बिंदु कहाँ है, यह ऐसे कैसे लिखें कि कोई भ्रम न हो? P से दोनों अक्षों पर **लंब** डालो (बिंदुदार रेखाएँ) और उनकी लंबाइयाँ देखो।",
      ),
    ),
    plane,
    w.body(
      t(
        "P is **4** units from the y-axis, to the right, and **3** units from the x-axis, upwards. Now drag P to 6 units **left** of the y-axis and 2 units **below** the x-axis. Its distances are 6 units and 2 units: lengths are never negative. But they are to the **left** and **downwards**, and the next page shows how we write that.",
        "P, y-अक्ष से **4** इकाई दाईं ओर है, और x-अक्ष से **3** इकाई ऊपर। अब P को y-अक्ष से 6 इकाई **बाईं** ओर और x-अक्ष से 2 इकाई **नीचे** ले जाओ। उसकी दूरियाँ 6 इकाई और 2 इकाई हैं: लंबाई कभी ऋणात्मक नहीं होती। पर वे **बाईं** ओर और **नीचे** की ओर हैं, और अगला पन्ना बताता है कि इसे कैसे लिखते हैं।",
      ),
    ),
  ];
});

/** The definitions: x-coordinate (abscissa), y-coordinate (ordinate), written (x, y). */
const definition = page("definition", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "State: the x-coordinate (abscissa) is the signed distance from the y-axis, the y-coordinate (ordinate) the signed distance from the x-axis; written (x, y), x first, in brackets. P(4, 3), Q(−6, −2); (3, 4) is not (4, 3).",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", { x: -6, y: -2, pointName: "Q" });
  b.standsFor(plane, "Q at (−6, −2) with its coordinates written; drag it anywhere");
  return [
    w.title(t("x-coordinate and y-coordinate", "x-निर्देशांक और y-निर्देशांक")),
    w.definition(
      t(
        "The **x-coordinate** of a point is its distance from the **y-axis**, measured along the x-axis: positive to the right, negative to the left. It is also called the **abscissa**.",
        "किसी बिंदु का **x-निर्देशांक** उसकी **y-अक्ष** से दूरी है, x-अक्ष के साथ नापी गई: दाईं ओर धनात्मक, बाईं ओर ऋणात्मक। इसे **भुज** भी कहते हैं।",
      ),
      "abscissa",
    ),
    w.definition(
      t(
        "The **y-coordinate** of a point is its distance from the **x-axis**, measured along the y-axis: positive upwards, negative downwards. It is also called the **ordinate**.",
        "किसी बिंदु का **y-निर्देशांक** उसकी **x-अक्ष** से दूरी है, y-अक्ष के साथ नापी गई: ऊपर धनात्मक, नीचे ऋणात्मक। इसे **कोटि** भी कहते हैं।",
      ),
      "ordinate",
    ),
    w.definition(
      t(
        "We write the **coordinates** of a point in brackets, **x-coordinate first**: P is $(4, 3)$ and Q is $(-6, -2)$.",
        "किसी बिंदु के **निर्देशांक** कोष्ठक में लिखते हैं, **x-निर्देशांक पहले**: P है $(4, 3)$ और Q है $(-6, -2)$।",
      ),
      "pair",
    ),
    plane,
    w.note(
      t(
        "The coordinates fix a point exactly. $(3, 4)$ is not the same point as $(4, 3)$.",
        "निर्देशांक बिंदु को ठीक-ठीक तय करते हैं। $(3, 4)$ और $(4, 3)$ एक ही बिंदु नहीं हैं।",
      ),
    ),
  ];
});

/** The coordinates are two moves from O: along x then up y, or up y then along x; same point. */
const twoWays = page("two-ways", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "A point's coordinates are two moves from O: x along the x-axis and y along the y-axis. Two friends walk them in opposite orders (x first, y first) and meet at the same point, so the order of the moves doesn't matter; which number goes with which axis does.",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    x: 4,
    y: 3,
    canPick: true,
    canWalkBoth: true,
    showPerpendiculars: false,
  });
  b.standsFor(plane, "tap a point; two friends walk to it from O, one x first, the other y first");
  return [
    w.title(t("Two ways to get there", "वहाँ पहुँचने के दो रास्ते")),
    w.body(
      t(
        "Tap any point on the plane. Two friends start at O. One walks along the x-axis first, then up. The other walks up the y-axis first, then along.",
        "तल पर कोई भी बिंदु दबाओ। दो दोस्त O से शुरू करते हैं। एक पहले x-अक्ष के साथ चलता है, फिर ऊपर। दूसरा पहले y-अक्ष के साथ ऊपर चलता है, फिर आड़ा।",
      ),
    ),
    plane,
    w.note(
      t(
        "Both reach the same point. Its coordinates are just these two moves from O: $x$ along the x-axis and $y$ along the y-axis, in either order.",
        "दोनों एक ही बिंदु पर पहुँचते हैं। उसके निर्देशांक O से बस ये दो चालें हैं: x-अक्ष के साथ $x$ और y-अक्ष के साथ $y$, किसी भी क्रम में।",
      ),
    ),
  ];
});

/** Each coordinate alone is a line; the two lines meet at the point. */
const lines = page("each-number-a-line", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Why two coordinates fix one point: x = 3 alone is every point 3 units right of the y-axis, a vertical line; y = −2 is a horizontal line; the two lines meet at exactly one point, (3, −2).",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    x: 3,
    y: -2,
    isXKnown: false,
    isYKnown: false,
    canSetNumbers: true,
    showLines: true,
    showQuadrants: false,
    showPerpendiculars: false,
  });
  b.standsFor(
    plane,
    "give x and a vertical line of places lights up; give y and the lines meet at P",
  );
  return [
    w.title(t("Why two numbers are enough", "दो संख्याएँ काफ़ी क्यों हैं")),
    w.body(
      t(
        "Give only the x-coordinate, 3. Where could the point be? Then give the y-coordinate, −2.",
        "केवल x-निर्देशांक दो, 3। बिंदु कहाँ हो सकता है? फिर y-निर्देशांक दो, −2।",
      ),
    ),
    plane,
    w.note(
      t(
        "All points with x-coordinate 3 make a vertical line. All points with y-coordinate −2 make a horizontal line. The two lines cross at exactly **one** point, $(3, -2)$.",
        "x-निर्देशांक 3 वाले सारे बिंदु एक ऊर्ध्वाधर रेखा बनाते हैं। y-निर्देशांक −2 वाले सारे बिंदु एक क्षैतिज रेखा। दोनों रेखाएँ ठीक **एक** बिंदु पर काटती हैं, $(3, -2)$।",
      ),
    ),
  ];
});

/** Example 1 (Fig 3.11): read the coordinates of B, M, L and S. */
const example1 = page("example-reading", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Example 1 worked: read each point's coordinates from its distances to the axes, one point per quadrant: B(4, 3), M(−3, 4), L(−5, −4), S(3, −4).",
  );
  const plane = b.prop(coordinatePlaneDef, "figure", {
    isXKnown: false,
    isYKnown: false,
    showReadout: false,
    showQuadrants: false,
    showPerpendiculars: false,
    showCoordinates: false,
    marks: [
      { x: 4, y: 3, name: "B" },
      { x: -3, y: 4, name: "M" },
      { x: -5, y: -4, name: "L" },
      { x: 3, y: -4, name: "S" },
    ],
  });
  b.standsFor(plane, "Example 1's figure: points B, M, L and S on the plane");
  return [
    w.title(t("Reading coordinates", "निर्देशांक पढ़ना")),
    w.body(
      t(
        "**Example 1.** Write the coordinates of B, M, L and S.",
        "**उदाहरण 1.** B, M, L और S के निर्देशांक लिखो।",
      ),
    ),
    plane,
    w.body(
      t(
        "**B** is 4 units right of the y-axis, so its x-coordinate (abscissa) is 4. It is 3 units above the x-axis, so its y-coordinate (ordinate) is 3. B is $(4, 3)$.",
        "**B**, y-अक्ष से 4 इकाई दाईं ओर है, तो उसका x-निर्देशांक (भुज) 4 है। वह x-अक्ष से 3 इकाई ऊपर है, तो उसका y-निर्देशांक (कोटि) 3 है। B है $(4, 3)$।",
      ),
    ),
    w.body(
      t(
        "**M** is 3 units **left** of the y-axis and 4 units above the x-axis. M is $(-3, 4)$.",
        "**M**, y-अक्ष से 3 इकाई **बाईं** ओर और x-अक्ष से 4 इकाई ऊपर है। M है $(-3, 4)$।",
      ),
    ),
    w.body(
      t(
        "**L** is 5 units left and 4 units **below**. L is $(-5, -4)$.",
        "**L**, 5 इकाई बाईं ओर और 4 इकाई **नीचे** है। L है $(-5, -4)$।",
      ),
    ),
    w.body(
      t(
        "**S** is 3 units right and 4 units below. S is $(3, -4)$.",
        "**S**, 3 इकाई दाईं ओर और 4 इकाई नीचे है। S है $(3, -4)$।",
      ),
    ),
  ];
});

/** Example 2 (Fig 3.12): points on the axes, and the origin. */
const onAxes = page("points-on-the-axes", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Example 2 worked: a point on the x-axis is 0 from it, so its y-coordinate is 0, (x, 0); on the y-axis, (0, y); the origin is (0, 0). Includes E(2/3, 0).",
  );
  const plane = b.prop(coordinatePlaneDef, "figure", {
    isXKnown: false,
    isYKnown: false,
    showReadout: false,
    showQuadrants: false,
    showPerpendiculars: false,
    showCoordinates: false,
    marks: [
      { x: 4, y: 0, name: "A" },
      { x: 0, y: 3, name: "B" },
      { x: -5, y: 0, name: "C" },
      { x: 0, y: -4, name: "D" },
      { x: 2 / 3, y: 0, name: "E" },
    ],
  });
  b.standsFor(plane, "Example 2's figure: points A to E on the axes");
  return [
    w.title(t("Points on the axes", "अक्षों पर बिंदु")),
    w.body(
      t(
        "**Example 2.** Write the coordinates of the points marked on the axes.",
        "**उदाहरण 2.** अक्षों पर अंकित बिंदुओं के निर्देशांक लिखो।",
      ),
    ),
    plane,
    w.body(
      t(
        "**A** is 4 units from the y-axis and **0** from the x-axis, because it lies on the x-axis. A is $(4, 0)$. In the same way C is $(-5, 0)$. E is two-thirds of a unit right of O, between 0 and 1: E is $\\left(\\frac{2}{3}, 0\\right)$.",
        "**A**, y-अक्ष से 4 इकाई और x-अक्ष से **0** दूर है, क्योंकि वह x-अक्ष पर ही है। A है $(4, 0)$। इसी तरह C है $(-5, 0)$। E, O से एक इकाई के दो-तिहाई दाईं ओर है, 0 और 1 के बीच: E है $\\left(\\frac{2}{3}, 0\\right)$।",
      ),
    ),
    w.body(
      t(
        "**B** is 0 from the y-axis and 3 above the x-axis. B is $(0, 3)$, and D is $(0, -4)$.",
        "**B**, y-अक्ष से 0 और x-अक्ष से 3 ऊपर है। B है $(0, 3)$, और D है $(0, -4)$।",
      ),
    ),
    w.definition(
      t(
        r`Every point on the **x-axis** is $(x, 0)$, where $x$ is its distance from the y-axis. Every point on the **y-axis** is $(0, y)$, where $y$ is its distance from the x-axis. The **origin** is 0 from both axes, so it is $(0, 0)$.`,
        r`**x-अक्ष** पर हर बिंदु $(x, 0)$ है, जहाँ $x$ उसकी y-अक्ष से दूरी है। **y-अक्ष** पर हर बिंदु $(0, y)$ है, जहाँ $y$ उसकी x-अक्ष से दूरी है। **मूलबिंदु** दोनों अक्षों से 0 दूर है, इसलिए वह $(0, 0)$ है।`,
      ),
      "onAxes",
    ),
  ];
});

/** Fig 3.13: the signs of the coordinates in each quadrant, and why; the Remark. */
const signs = page("signs", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "The signs of a point's coordinates tell its quadrant, because each quadrant is enclosed by one half of each axis: I (+, +), II (−, +), III (−, −), IV (+, −) (Fig 3.13). Dragging P shows the signs change exactly at the axes. The Remark: x first is a convention the world agrees on.",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", { x: -3, y: 4, showSigns: true });
  b.standsFor(plane, "P to drag through all four quadrants, each showing its signs");
  return [
    w.title(t("Signs in each quadrant", "हर चतुर्थांश में चिह्न")),
    w.body(
      t(
        "Drag P through all four quadrants and onto the axes. Watch the signs of its coordinates.",
        "P को चारों चतुर्थांशों से और अक्षों पर ले जाओ। उसके निर्देशांकों के चिह्न देखो।",
      ),
    ),
    plane,
    w.definition(
      t(
        r`A point in quadrant **I** is $(+, +)$, in **II** $(-, +)$, in **III** $(-, -)$ and in **IV** $(+, -)$.`,
        r`चतुर्थांश **I** में बिंदु $(+, +)$ होता है, **II** में $(-, +)$, **III** में $(-, -)$ और **IV** में $(+, -)$।`,
      ),
      "signs",
    ),
    w.body(
      t(
        "Why? Quadrant II lies between the **negative** x-axis and the **positive** y-axis. So every point in it is to the left (x negative) and above (y positive). Each quadrant works the same way.",
        "क्यों? चतुर्थांश II **ऋणात्मक** x-अक्ष और **धनात्मक** y-अक्ष के बीच है। तो उसका हर बिंदु बाईं ओर (x ऋणात्मक) और ऊपर (y धनात्मक) है। हर चतुर्थांश ऐसे ही है।",
      ),
    ),
    w.note(
      t(
        "Writing x first and y second is a **convention**. It could have been the other way round, but the whole world uses this one, so nobody is confused.",
        "x पहले और y बाद में लिखना एक **परिपाटी** है। यह उलटा भी हो सकता था, पर पूरी दुनिया यही मानती है, ताकि किसी को भ्रम न हो।",
      ),
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [distances, definition, twoWays, lines, example1, onAxes, signs];
