import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CoordinatesSceneKind, PlaneAction, PlaneDerived } from "@chalk/prop-coordinates";
import { figureOn, planeOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The mission: the colony treasure hunt, on Grandpa's graph-paper map. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const map = sceneOn(
    b,
    "map",
    CoordinatesSceneKind.ParkMap,
    "Grandpa's graph-paper map of the colony park on the table: two lines cross at the gate, marked O, one along the wall and one up the central path, with dots for the swing, the slide and the banyan; Riya and Kabir lean in with clue cards",
  );
  return column([
    w.title(t("Grandpa's map of the park", "दादाजी का पार्क का नक्शा")),
    map,
    w.body(
      t(
        "Riya and Kabir have promised the colony's little kids a treasure hunt in the park on Sunday. A trail of clue cards will lead from the gate to a buried box of sweets.",
        "रिया और कबीर ने कॉलोनी के छोटे बच्चों से रविवार को पार्क में खज़ाने की खोज का वादा किया है। सुराग वाले कार्डों का एक रास्ता गेट से ज़मीन में गड़े मिठाई के डिब्बे तक ले जाएगा।",
      ),
    ),
    w.body(
      t(
        'Grandpa brings out a sheet of graph paper: the map of the park he drew when the colony was built. One square is 1 m. "On this map," he says, "every place is just two numbers."',
        'दादाजी ग्राफ़ पेपर की एक शीट लाते हैं: पार्क का नक्शा, जो उन्होंने कॉलोनी बनते समय बनाया था। एक खाना 1 m है। "इस नक्शे पर," वे कहते हैं, "हर जगह बस दो संख्याएँ है।"',
      ),
    ),
    w.definition(
      t(
        "**The mission, stop by stop.** 1. Give every place two numbers. 2. Find how far apart two places are. 3. Check shapes and straight trails, and find fair spots. 4. Find the point a given part of the way along a path. 5. Use it to find a missing corner. 6. Find the area of Mom's herb patch. 7. Hunt day.",
        "**मिशन, पड़ाव दर पड़ाव।** 1. हर जगह को दो संख्याएँ देना। 2. दो जगहों के बीच की दूरी निकालना। 3. आकृतियाँ और सीधे रास्ते जाँचना, और बराबर दूरी वाली जगहें ढूँढना। 4. रास्ते पर दिए गए हिस्से जितनी दूर का बिंदु ढूँढना। 5. उससे छूटा हुआ कोना ढूँढना। 6. मम्मी की जड़ी-बूटी की क्यारी का क्षेत्रफल निकालना। 7. खोज का दिन।",
      ),
    ),
    w.body(
      t(
        "Kabir writes the first two clues. The bench is 4 m along the wall from the gate; the tap is 3 m up the central path. The kids will run straight from the bench to the tap. How far is that?",
        "कबीर पहले दो सुराग लिखता है। बेंच गेट से दीवार के साथ 4 m दूर है; नल बीच वाले रास्ते पर 3 m ऊपर है। बच्चे बेंच से सीधे नल तक दौड़ेंगे। यह कितनी दूरी है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Class 9 recap: axes, origin, quadrants. */
const axes = page(
  "axes",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "A", x: 3, y: 2 },
          { name: "B", x: -4, y: 3 },
          { name: "C", x: -2, y: -3 },
          { name: "D", x: 4, y: -2 },
        ],
        window: [-6, 6, -5, 5],
        join: "none",
        showCoords: false,
        showQuadrants: true,
      },
      "graph paper with the x-axis across and the y-axis up, crossing at O, and one point in each quadrant: A top right, B top left, C bottom left, D bottom right",
    );
    const which = choiceQuestion(b, {
      prompt: t(
        "On this paper, point C is left of the y-axis and below the x-axis. Which quadrant is it in?",
        "इस कागज़ पर बिंदु C, y-अक्ष के बाएँ और x-अक्ष के नीचे है। यह किस चतुर्थांश में है?",
      ),
      options: [
        { id: "right", label: t("Quadrant III", "चतुर्थांश III") },
        {
          id: "two",
          label: t("Quadrant II", "चतुर्थांश II"),
          feedback: t(
            "Quadrant II is left of the y-axis but above the x-axis, where B is. Count anticlockwise from the top right: I, II, III, IV.",
            "चतुर्थांश II, y-अक्ष के बाएँ पर x-अक्ष के ऊपर है, जहाँ B है। ऊपर दाएँ से वामावर्त गिनो: I, II, III, IV।",
          ),
        },
        {
          id: "four",
          label: t("Quadrant IV", "चतुर्थांश IV"),
          feedback: t(
            "Quadrant IV is below the x-axis but right of the y-axis, where D is. C is on the left.",
            "चतुर्थांश IV, x-अक्ष के नीचे पर y-अक्ष के दाएँ है, जहाँ D है। C बाईं ओर है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two number lines at right angles", "समकोण पर दो संख्या रेखाएँ")),
      w.body(
        t(
          "You met this in Class 9. To fix where a point is on a flat sheet, we draw two number lines.",
          "यह तुमने कक्षा 9 में देखा था। समतल कागज़ पर किसी बिंदु की जगह तय करने के लिए हम दो संख्या रेखाएँ खींचते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Coordinate axes.** The horizontal line is the **x-axis** and the vertical line is the **y-axis**. They cross at right angles at the **origin** O. They split the plane into four **quadrants**, numbered I, II, III, IV anticlockwise from the top right.",
          "**निर्देशांक अक्ष।** क्षैतिज रेखा **x-अक्ष** है और ऊर्ध्वाधर रेखा **y-अक्ष**। ये **मूलबिंदु** O पर समकोण पर काटती हैं। ये समतल को चार **चतुर्थांशों** में बाँटती हैं, जिन्हें ऊपर दाएँ से वामावर्त I, II, III, IV गिना जाता है।",
        ),
      ),
      plane,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Coordinates: abscissa and ordinate; put a point there. */
const coordinates = page(
  "coordinates",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [{ name: "A", x: 3, y: 2 }],
        movable: [0],
        window: [-6, 6, -5, 5],
        join: "none",
      },
      "graph paper with the axes and one point A that the learner drags; its coordinates are written beside it",
    );
    const goal = goalQuestion(b, {
      about: plane,
      prompt: t(
        "Drag A to the point (−4, 3): 4 to the left of the y-axis and 3 above the x-axis.",
        "A को बिंदु (−4, 3) पर ले जाओ: y-अक्ष से 4 बाएँ और x-अक्ष से 3 ऊपर।",
      ),
      isMet: plane.derived(PlaneDerived.X0).eq(-4).and(plane.derived(PlaneDerived.Y0).eq(3)),
      solve: [plane.learner(PlaneAction.SetPoint, { i: 0, x: -4, y: 3, isSnapped: true })],
      notes: [
        {
          when: plane.derived(PlaneDerived.X0).eq(3).and(plane.derived(PlaneDerived.Y0).eq(-4)),
          say: t(
            "That's (3, −4): the numbers swapped. The first number is x, measured across; the second is y, measured up.",
            "यह (3, −4) है: संख्याएँ उलट गईं। पहली संख्या x है, जो आड़ी नापी जाती है; दूसरी y, जो ऊपर नापी जाती है।",
          ),
          reach: [plane.learner(PlaneAction.SetPoint, { i: 0, x: 3, y: -4, isSnapped: true })],
        },
        {
          when: plane.derived(PlaneDerived.X0).eq(4).and(plane.derived(PlaneDerived.Y0).eq(3)),
          say: t(
            "That's (4, 3). The minus sign in −4 means left of the y-axis.",
            "यह (4, 3) है। −4 के ऋण चिह्न का मतलब है y-अक्ष के बाएँ।",
          ),
          reach: [plane.learner(PlaneAction.SetPoint, { i: 0, x: 4, y: 3, isSnapped: true })],
        },
      ],
    });
    return column([
      w.title(t("Every point is two numbers", "हर बिंदु दो संख्याएँ है")),
      w.definition(
        t(
          "**Coordinates.** A point is named by a pair (x, y). Its **x-coordinate** (or **abscissa**) is its distance from the y-axis: + to the right, − to the left. Its **y-coordinate** (or **ordinate**) is its distance from the x-axis: + above, − below.",
          "**निर्देशांक।** किसी बिंदु को युग्म (x, y) से बताते हैं। उसका **x-निर्देशांक** (या **भुज**) y-अक्ष से उसकी दूरी है: दाएँ +, बाएँ −। उसका **y-निर्देशांक** (या **कोटि**) x-अक्ष से उसकी दूरी है: ऊपर +, नीचे −।",
        ),
      ),
      w.body(
        t(
          "Drag the point, or tap it and use the arrow keys. Its coordinates change as it moves.",
          "बिंदु को खींचो, या उसे टैप करके तीर वाली कुंजियाँ दबाओ। चलने पर उसके निर्देशांक बदलते हैं।",
        ),
      ),
      plane,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Points on the axes are (x, 0) and (0, y). */
const onAxes = page(
  "on-axes",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "A", x: 4, y: 0 },
          { name: "C", x: 0, y: 3 },
        ],
        window: [-2, 8, -2, 6],
        join: "none",
      },
      "graph paper with A(4, 0) on the x-axis and C(0, 3) on the y-axis",
    );
    const which = choiceQuestion(b, {
      prompt: t("Which of these points lies on the y-axis?", "इनमें से कौन-सा बिंदु y-अक्ष पर है?"),
      options: [
        { id: "right", label: t("(0, −4)", "(0, −4)") },
        {
          id: "x",
          label: t("(−4, 0)", "(−4, 0)"),
          feedback: t(
            "Here y = 0, so the point is 0 from the x-axis: it's on the x-axis. On the y-axis, x = 0.",
            "यहाँ y = 0 है, तो बिंदु x-अक्ष से 0 दूर है: यह x-अक्ष पर है। y-अक्ष पर x = 0 होता है।",
          ),
        },
        {
          id: "both",
          label: t("(4, 4)", "(4, 4)"),
          feedback: t(
            "This point is 4 from each axis, so it's on neither. A point on the y-axis has x = 0.",
            "यह बिंदु दोनों अक्षों से 4 दूर है, तो किसी पर नहीं। y-अक्ष पर के बिंदु का x = 0 होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Points on the axes", "अक्षों पर बिंदु")),
      w.definition(
        t(
          "**On an axis.** A point on the x-axis is 0 from the x-axis, so its y-coordinate is 0: it is **(x, 0)**. A point on the y-axis is **(0, y)**. The origin is (0, 0).",
          "**अक्ष पर।** x-अक्ष पर का बिंदु x-अक्ष से 0 दूर है, तो उसका y-निर्देशांक 0 है: वह **(x, 0)** है। y-अक्ष पर का बिंदु **(0, y)** है। मूलबिंदु (0, 0) है।",
        ),
      ),
      plane,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT's plotting play: the cat's face. */
const play = page(
  "play",
  (b) => {
    const w = wordsOn(b);
    const outline: [string, number, number][] = [
      ["A", 4, 8],
      ["B", 3, 9],
      ["C", 3, 8],
      ["D", 1, 6],
      ["E", 1, 5],
      ["F", 3, 3],
      ["G", 6, 3],
      ["H", 8, 5],
      ["I", 8, 6],
      ["J", 6, 8],
      ["K", 6, 9],
      ["L", 5, 8],
    ];
    const small: [string, number, number][] = [
      ["P", 3.5, 7],
      ["Q", 3, 6],
      ["R", 4, 6],
      ["X", 5.5, 7],
      ["Y", 5, 6],
      ["Z", 6, 6],
      ["S", 4, 5],
      ["T", 4.5, 4],
      ["U", 5, 5],
    ];
    const ring = outline.map(([n]) => n);
    const fig = figureOn(b, "figure", {
      points: [...outline, ...small].map(([name, x, y]) => ({
        name,
        at: [x, y] as [number, number],
        isUnnamed: true,
        step: ["P", "Q", "R", "X", "Y", "Z"].includes(name)
          ? 1
          : ["S", "T", "U"].includes(name)
            ? 2
            : 0,
      })),
      items: [
        ...ring.map((n, i) => ({
          kind: "seg" as const,
          a: n,
          b: ring[(i + 1) % ring.length] as string,
        })),
        { kind: "poly" as const, pts: ["P", "Q", "R"], tone: "accent" as const, step: 1 },
        { kind: "poly" as const, pts: ["X", "Y", "Z"], tone: "accent" as const, step: 1 },
        { kind: "poly" as const, pts: ["S", "T", "U"], tone: "wrong" as const, step: 2 },
        { kind: "seg" as const, a: "S", b: [0, 5] as [number, number], step: 3 },
        { kind: "seg" as const, a: "S", b: [0, 6] as [number, number], step: 3 },
        { kind: "seg" as const, a: "U", b: [9, 5] as [number, number], step: 3 },
        { kind: "seg" as const, a: "U", b: [9, 6] as [number, number], step: 3 },
      ],
      captions: [
        t(
          "Join A(4, 8) → B(3, 9) → C(3, 8) → D(1, 6) → E(1, 5) → F(3, 3) → G(6, 3) → H(8, 5) → I(8, 6) → J(6, 8) → K(6, 9) → L(5, 8) → back to A.",
          "A(4, 8) → B(3, 9) → C(3, 8) → D(1, 6) → E(1, 5) → F(3, 3) → G(6, 3) → H(8, 5) → I(8, 6) → J(6, 8) → K(6, 9) → L(5, 8) → वापस A को मिलाओ।",
        ),
        t(
          "Join P(3.5, 7), Q(3, 6), R(4, 6) into a triangle, and X(5.5, 7), Y(5, 6), Z(6, 6) into another.",
          "P(3.5, 7), Q(3, 6), R(4, 6) को मिलाकर एक त्रिभुज बनाओ, और X(5.5, 7), Y(5, 6), Z(6, 6) से दूसरा।",
        ),
        t(
          "Join S(4, 5), T(4.5, 4), U(5, 5) into a triangle.",
          "S(4, 5), T(4.5, 4), U(5, 5) को मिलाकर त्रिभुज बनाओ।",
        ),
        t(
          "Last, join S to (0, 5) and (0, 6), and U to (9, 5) and (9, 6).",
          "अंत में S को (0, 5) और (0, 6) से, और U को (9, 5) और (9, 6) से मिलाओ।",
        ),
      ],
      about:
        "NCERT's plotting play, drawn in four steps: an outline through twelve points, two small triangles, a third small triangle, and four lines out to the sides",
      height: 240,
    });
    const what = choiceQuestion(b, {
      prompt: t(
        "Tap through all four steps. What picture have you got?",
        "चारों चरणों से गुज़रो। तुम्हें कौन-सा चित्र मिला?",
      ),
      options: [
        { id: "right", label: t("A cat's face", "बिल्ली का चेहरा") },
        {
          id: "fish",
          label: t("A fish", "एक मछली"),
          feedback: t(
            "Look at the two points at the top, B and K: they stick up like ears. The lines from S and U are whiskers.",
            "ऊपर के दो बिंदु B और K देखो: ये कानों की तरह ऊपर उठे हैं। S और U से निकली रेखाएँ मूँछें हैं।",
          ),
        },
        {
          id: "house",
          label: t("A house", "एक घर"),
          feedback: t(
            "A house has a flat floor and one roof point. This has two ears, two eyes, a nose and whiskers.",
            "घर का फ़र्श सपाट और छत की एक नोक होती है। इसमें दो कान, दो आँखें, एक नाक और मूँछें हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A play with points", "बिंदुओं का एक खेल")),
      w.body(
        t(
          "Grandpa sets the kids a warm-up from the textbook. Plot the points and join them as directed.",
          "दादाजी बच्चों को पाठ्यपुस्तक से एक अभ्यास देते हैं। बिंदु अंकित करो और बताए अनुसार मिलाओ।",
        ),
      ),
      fig,
      what,
      w.note(
        t(
          "Pairs of numbers can draw any shape. In Chapter 3 the graph of a linear equation was a straight line, and in Chapter 2 the graph of y = ax² + bx + c was a parabola. **Coordinate geometry** studies shapes with algebra, and algebra with shapes.",
          "संख्याओं के युग्म कोई भी आकृति बना सकते हैं। अध्याय 3 में रैखिक समीकरण का आलेख एक सीधी रेखा था, और अध्याय 2 में y = ax² + bx + c का आलेख एक परवलय। **निर्देशांक ज्यामिति** आकृतियों को बीजगणित से, और बीजगणित को आकृतियों से समझती है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Distances along an axis: subtract. */
const alongAxis = page(
  "along-an-axis",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "A", x: 4, y: 0 },
          { name: "B", x: 6, y: 0 },
          { name: "C", x: 0, y: 3 },
          { name: "D", x: 0, y: 8 },
        ],
        window: [-1, 9, -1, 9],
        join: "none",
      },
      "graph paper with A(4, 0) and B(6, 0) on the x-axis and C(0, 3) and D(0, 8) on the y-axis",
    );
    const ef = choiceQuestion(b, {
      prompt: t(
        "E(−2, 0) and F(5, 0) are on the x-axis. How far apart are they?",
        "E(−2, 0) और F(5, 0), x-अक्ष पर हैं। वे कितनी दूर हैं?",
      ),
      options: [
        { id: "right", label: t("7 units", "7 इकाई") },
        {
          id: "three",
          label: t("3 units", "3 इकाई"),
          feedback: t(
            "E is on the other side of O. Subtract with the sign: 5 − (−2) = 7.",
            "E, O के दूसरी ओर है। चिह्न के साथ घटाओ: 5 − (−2) = 7।",
          ),
        },
        {
          id: "neg",
          label: t("−7 units", "−7 इकाई"),
          feedback: t(
            "A distance is never negative. Take the bigger coordinate minus the smaller: 5 − (−2) = 7.",
            "दूरी कभी ऋणात्मक नहीं होती। बड़े निर्देशांक में से छोटा घटाओ: 5 − (−2) = 7।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Distance along an axis", "अक्ष के साथ दूरी")),
      w.body(
        t(
          "Two points on the x-axis, A(4, 0) and B(6, 0). From the picture, OA = 4 units and OB = 6 units. So",
          "x-अक्ष पर दो बिंदु, A(4, 0) और B(6, 0)। चित्र से OA = 4 इकाई और OB = 6 इकाई। इसलिए",
        ),
      ),
      w.body(
        t(
          r`$$AB = OB - OA = 6 - 4 = 2 \text{ units}$$`,
          r`$$AB = OB - OA = 6 - 4 = 2 \text{ इकाई}$$`,
        ),
      ),
      w.body(
        t(
          "On the y-axis it works the same way. For C(0, 3) and D(0, 8),",
          "y-अक्ष पर भी ऐसे ही होता है। C(0, 3) और D(0, 8) के लिए,",
        ),
      ),
      w.body(t(r`$$CD = 8 - 3 = 5 \text{ units}$$`, r`$$CD = 8 - 3 = 5 \text{ इकाई}$$`)),
      plane,
      ef,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A to C: one point on each axis, by Pythagoras. */
const acrossAxes = page(
  "across-the-axes",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "A", x: 4, y: 0 },
          { name: "C", x: 0, y: 3 },
        ],
        window: [-1, 7, -1, 6],
        join: "segment",
        showLengths: true,
      },
      "graph paper with A(4, 0) on the x-axis, C(0, 3) on the y-axis and the segment AC, whose length 5 is written on it; with O they make a right triangle",
    );
    const bd = choiceQuestion(b, {
      prompt: t(
        "Now B(6, 0) and D(0, 8). Find BD the same way.",
        "अब B(6, 0) और D(0, 8)। इसी तरह BD ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("10 units", "10 इकाई") },
        {
          id: "sum",
          label: t("14 units", "14 इकाई"),
          feedback: t(
            "That's OB + OD, the way round two sides. The straight line is the hypotenuse: √(6² + 8²).",
            "यह OB + OD है, दो भुजाओं से घूमकर। सीधी रेखा कर्ण है: √(6² + 8²)।",
          ),
        },
        {
          id: "diff",
          label: t("2 units", "2 इकाई"),
          feedback: t(
            "Subtracting works only when both points are on the same axis. Here use Pythagoras: √(36 + 64).",
            "घटाना तभी चलता है जब दोनों बिंदु एक ही अक्ष पर हों। यहाँ पाइथागोरस लो: √(36 + 64)।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One point on each axis", "हर अक्ष पर एक बिंदु")),
      w.body(
        t(
          "How far is A(4, 0) from C(0, 3)? Now we can't just subtract. But OA = 4, OC = 3 and the axes meet at a right angle, so OAC is a right triangle with AC as its hypotenuse. By the Pythagoras theorem (Chapter 6):",
          "A(4, 0) से C(0, 3) कितनी दूर है? अब सीधे घटा नहीं सकते। पर OA = 4, OC = 3 और अक्ष समकोण पर मिलते हैं, तो OAC एक समकोण त्रिभुज है जिसका कर्ण AC है। पाइथागोरस प्रमेय से (अध्याय 6):",
        ),
      ),
      w.body(
        t(
          r`$$AC^2 = OA^2 + OC^2$$ $$AC^2 = 4^2 + 3^2 = 16 + 9 = 25$$ $$AC = 5 \text{ units}$$`,
          r`$$AC^2 = OA^2 + OC^2$$ $$AC^2 = 4^2 + 3^2 = 16 + 9 = 25$$ $$AC = 5 \text{ इकाई}$$`,
        ),
      ),
      plane,
      bd,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The bench and the tap. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "park",
      {
        points: [
          { name: "B", x: 4, y: 0 },
          { name: "T", x: 0, y: 3 },
        ],
        window: [-5, 9, -1, 8],
        join: "segment",
        showLengths: true,
      },
      "Grandpa's map: the gate at O, the bench B at (4, 0) on the wall and the tap T at (0, 3) on the central path, joined by the kids' 5 m run",
    );
    const swing = choiceQuestion(b, {
      prompt: t(
        "Another run: from the water cooler at (0, 6) on the path to the far bench at (8, 0) on the wall. How long is it?",
        "एक और दौड़: रास्ते पर वाटर कूलर (0, 6) से दीवार पर दूर वाली बेंच (8, 0) तक। यह कितनी लंबी है?",
      ),
      options: [
        { id: "right", label: t("10 m", "10 m") },
        {
          id: "fourteen",
          label: t("14 m", "14 m"),
          feedback: t(
            "That's 6 + 8, walking along the path and then the wall. The straight run is √(6² + 8²).",
            "यह 6 + 8 है, रास्ते और फिर दीवार के साथ चलना। सीधी दौड़ √(6² + 8²) है।",
          ),
        },
        {
          id: "two",
          label: t("2 m", "2 m"),
          feedback: t(
            "The two places are on different axes, so use Pythagoras, not 8 − 6.",
            "दोनों जगहें अलग-अलग अक्षों पर हैं, तो 8 − 6 नहीं, पाइथागोरस लो।",
          ),
        },
      ],
      answer: "right",
    });
    const answer = w.body(
      t(
        'Kabir writes on the card: **from the bench, run 5 m straight to the tap.** "And every other clue is two numbers too," says Riya.',
        'कबीर कार्ड पर लिखता है: **बेंच से 5 m सीधे नल तक दौड़ो।** "और बाक़ी हर सुराग भी दो संख्याएँ है," रिया कहती है।',
      ),
      "answer",
      { isHidden: true },
    );
    b.when(swing.on(QuestionSignal.Correct), [theBoard.show(answer), theBoard.pass()]);
    return column([
      w.title(t("The bench and the tap", "बेंच और नल")),
      w.body(
        t(
          "On Grandpa's map the gate is the origin, the wall is the x-axis and the central path is the y-axis. So the bench is B(4, 0) and the tap is T(0, 3). That's the triangle we just solved: the run from the bench to the tap is 5 m.",
          "दादाजी के नक्शे पर गेट मूलबिंदु है, दीवार x-अक्ष और बीच का रास्ता y-अक्ष। तो बेंच B(4, 0) है और नल T(0, 3)। यह वही त्रिभुज है जो हमने अभी हल किया: बेंच से नल तक की दौड़ 5 m है।",
        ),
      ),
      plane,
      swing,
      answer,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Your turn, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t("Which point is in quadrant II?", "कौन-सा बिंदु चतुर्थांश II में है?"),
      options: [
        { id: "right", label: t("(−3, 5)", "(−3, 5)") },
        {
          id: "iv",
          label: t("(3, −5)", "(3, −5)"),
          feedback: t(
            "x is +, y is −: right and down, so quadrant IV.",
            "x धन है, y ऋण: दाएँ और नीचे, तो चतुर्थांश IV।",
          ),
        },
        {
          id: "iii",
          label: t("(−3, −5)", "(−3, −5)"),
          feedback: t(
            "Both are −: left and down, so quadrant III. Quadrant II is left and up.",
            "दोनों ऋण हैं: बाएँ और नीचे, तो चतुर्थांश III। चतुर्थांश II बाएँ और ऊपर है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t("P(5, 0) and Q(0, 12). Find PQ.", "P(5, 0) और Q(0, 12)। PQ ज्ञात करो।"),
      options: [
        { id: "right", label: t("13 units", "13 इकाई") },
        {
          id: "seventeen",
          label: t("17 units", "17 इकाई"),
          feedback: t(
            "That's 5 + 12. The straight line is the hypotenuse: √(25 + 144).",
            "यह 5 + 12 है। सीधी रेखा कर्ण है: √(25 + 144)।",
          ),
        },
        {
          id: "seven",
          label: t("7 units", "7 इकाई"),
          feedback: t(
            "That's 12 − 5. The points are on different axes: use Pythagoras.",
            "यह 12 − 5 है। बिंदु अलग अक्षों पर हैं: पाइथागोरस लो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Stop 1: every place in the park is two numbers from the gate. ✓ Two places on the axes: subtract, or use Pythagoras when they're on different axes. Not yet: the banyan is off both axes. Next: a formula for any two points.",
        "**मिशन लॉग।** ✓ पड़ाव 1: पार्क की हर जगह गेट से दो संख्याएँ है। ✓ अक्षों पर दो जगहें: घटाओ, या अलग अक्षों पर हों तो पाइथागोरस। अभी नहीं: बरगद किसी अक्ष पर नहीं है। आगे: किन्हीं भी दो बिंदुओं के लिए एक सूत्र।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [
  hook,
  axes,
  coordinates,
  onAxes,
  play,
  alongAxis,
  acrossAxes,
  inLife,
  yourTurn,
];
