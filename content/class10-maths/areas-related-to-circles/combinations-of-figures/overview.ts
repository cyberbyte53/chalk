import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CirclesSceneKind,
  CombinedAction,
  CombinedKind,
  combinedFiguresDef,
  combinedStepCountOf,
} from "@chalk/prop-circles";
import { CORNER_CIRCLES, CUT_SQUARE, LEAF, RACE_TRACK, RING_SECTOR } from "../figures";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;

/** The Next taps that take a combined figure from the question to its total. */
const toTheEnd = (kind: CombinedKind) => combinedStepCountOf({ kind }) - 1;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The poster's border: how much paint for the shaded parts? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const border = sceneOn(
    b,
    "border",
    CirclesSceneKind.PosterDesign,
    "the poster border: square tiles with four circles inside, squares with petals made by semicircles, and shaded corners; Kabir colours while Riya adds up areas",
  );
  return column([
    w.title(t("Paint for the border", "किनारे के लिए रंग")),
    border,
    w.body(
      t(
        "The poster needs a border. Riya draws two kinds of tile: a square with four circles cut out of it, and a square with a four-petal flower made of semicircles. Kabir will paint the shaded parts. The art teacher's paint is rationed by area, so they must ask for exactly enough.",
        "पोस्टर को एक किनारा चाहिए। रिया दो तरह की टाइलें बनाती है: एक वर्ग जिसमें से चार वृत्त कटे हैं, और एक वर्ग जिसमें अर्धवृत्तों से चार पंखुड़ियों वाला फूल बना है। कबीर छायांकित हिस्से रंगेगा। कला शिक्षक का रंग क्षेत्रफल के हिसाब से मिलता है, तो उन्हें ठीक उतना ही माँगना है।",
      ),
    ),
    w.body(
      t(
        "None of these shapes has a formula of its own. How do you find an area you have no formula for?",
        "इनमें से किसी आकार का अपना कोई सूत्र नहीं है। जिस क्षेत्रफल का सूत्र नहीं, उसे कैसे निकालें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Add and take away known shapes; Example 5. */
const method = page(
  "method",
  (b) => {
    const w = wordsOn(b);
    const tile = b.prop(combinedFiguresDef, "tile", {
      kind: CombinedKind.FourCircles,
      step: 0,
      canStep: true,
    });
    b.studentOnly(tile.action(CombinedAction.Next));
    b.studentOnly(tile.action(CombinedAction.Back));
    b.studentOnly(tile.action(CombinedAction.Reset));
    b.standsFor(
      tile,
      "Example 5: a square of side 14 cm with four circles of diameter 7 cm cut out; each step lights up one piece and writes its working: 196 − 154 = 42 cm²",
    );
    const goal = goalQuestion(b, {
      about: tile,
      prompt: t(
        "Step through the pieces until the total shows.",
        "टुकड़ों में क़दम-दर-क़दम चलो जब तक कुल न दिखे।",
      ),
      isMet: tile.field("step").eq(toTheEnd(CombinedKind.FourCircles)),
      solve: Array.from({ length: toTheEnd(CombinedKind.FourCircles) }, () =>
        tile.learner(CombinedAction.Next),
      ),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why are the four circles taken away, not added?",
        "चारों वृत्त घटाए क्यों गए, जोड़े क्यों नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t("They are holes in the shaded square", "वे छायांकित वर्ग में छेद हैं"),
        },
        {
          id: "small",
          label: t("They are smaller than the square", "वे वर्ग से छोटे हैं"),
          feedback: t(
            "Size doesn't decide it. A piece is taken away when it's inside the big shape but not shaded.",
            "आकार इसे तय नहीं करता। कोई टुकड़ा तब घटाया जाता है जब वह बड़े आकार के अंदर हो पर छायांकित न हो।",
          ),
        },
        {
          id: "round",
          label: t("Circles are always subtracted", "वृत्त हमेशा घटाए जाते हैं"),
          feedback: t(
            "In Example 4 the circular flower beds are added, because they're shaded. It depends on the picture.",
            "उदाहरण 4 में वृत्ताकार क्यारियाँ जोड़ी जाती हैं, क्योंकि वे छायांकित हैं। यह चित्र पर निर्भर है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Add and take away", "जोड़ो और घटाओ")),
      w.body(
        t(
          "A shaded region with no formula of its own is usually built from shapes that do have formulas: squares, triangles, circles, sectors. Find the big shape, then add the shaded pieces that stick out and take away the unshaded pieces cut out of it. One piece at a time.",
          "जिस छायांकित क्षेत्र का अपना सूत्र न हो, वह आमतौर पर ऐसे आकारों से बना होता है जिनके सूत्र हैं: वर्ग, त्रिभुज, वृत्त, त्रिज्यखंड। बड़ा आकार लो, फिर बाहर निकले छायांकित टुकड़े जोड़ो और उसमें से कटे बिना-छायांकित टुकड़े घटाओ। एक बार में एक टुकड़ा।",
        ),
      ),
      w.body(
        t(
          r`**Example 5.** A square of side 14 cm with four circles of diameter 7 cm cut out of it. $$196 - 4 \times \frac{22}{7} \times \frac{7}{2} \times \frac{7}{2} = 196 - 154 = 42 \text{ cm}^2$$`,
          r`**उदाहरण 5।** 14 cm भुजा का वर्ग जिसमें से 7 cm व्यास के चार वृत्त कटे हैं। $$196 - 4 \times \frac{22}{7} \times \frac{7}{2} \times \frac{7}{2} = 196 - 154 = 42 \text{ cm}^2$$`,
        ),
      ),
      tile,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 4: the lawn and two flower beds. */
const lawn = page(
  "lawn",
  (b) => {
    const w = wordsOn(b);
    const beds = b.prop(combinedFiguresDef, "beds", {
      kind: CombinedKind.LawnBeds,
      step: 0,
      canStep: true,
    });
    b.studentOnly(beds.action(CombinedAction.Next));
    b.studentOnly(beds.action(CombinedAction.Back));
    b.studentOnly(beds.action(CombinedAction.Reset));
    b.standsFor(
      beds,
      "Example 4: a square lawn of side 56 m with two flower beds that are segments of the circle centred where the diagonals meet; the steps add the lawn and each bed (a sector less a triangle): 3136 + 1232 − 784 + 1232 − 784 = 4032 m²",
    );
    const goal = goalQuestion(b, {
      about: beds,
      prompt: t(
        "Step through the lawn and both beds to the total.",
        "लॉन और दोनों क्यारियों में से होते हुए कुल तक चलो।",
      ),
      isMet: beds.field("step").eq(toTheEnd(CombinedKind.LawnBeds)),
      solve: Array.from({ length: toTheEnd(CombinedKind.LawnBeds) }, () =>
        beds.learner(CombinedAction.Next),
      ),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`Why is $OA^2 = 28 \times 56$?`, r`$OA^2 = 28 \times 56$ क्यों है?`),
      options: [
        {
          id: "right",
          label: t(r`$OA = OB$ and $OA^2 + OB^2 = 56^2$`, r`$OA = OB$ और $OA^2 + OB^2 = 56^2$`),
        },
        {
          id: "half",
          label: t(r`$OA$ is half of a side, $28$`, r`$OA$ एक भुजा का आधा है, $28$`),
          feedback: t(
            "O to a side's midpoint is 28 m, but A is a corner, further away. Use Pythagoras in the right triangle OAB.",
            "O से भुजा के मध्य-बिंदु तक 28 m है, पर A एक कोना है, ज़्यादा दूर। समकोण त्रिभुज OAB में पाइथागोरस लगाओ।",
          ),
        },
        {
          id: "diag",
          label: t(r`$OA$ is the whole diagonal, $56\sqrt{2}$`, r`$OA$ पूरा विकर्ण है, $56\sqrt{2}$`),
          feedback: t(
            r`O is where the diagonals meet, so OA is half a diagonal: $OA^2 = \frac{(56\sqrt{2})^2}{4} = 28 \times 56$.`,
            r`O वहाँ है जहाँ विकर्ण मिलते हैं, तो OA आधा विकर्ण है: $OA^2 = \frac{(56\sqrt{2})^2}{4} = 28 \times 56$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("A lawn with flower beds", "फूलों की क्यारियों वाला लॉन")),
      w.body(
        t(
          r`**Example 4.** Two flower beds sit on two sides of a square lawn ABCD of side 56 m. Each bed is the part of a circle centred at O, where the diagonals meet, beyond the side of the square. Let $OA = OB = x$. The diagonals are perpendicular, so $$x^2 + x^2 = 56^2, \quad x^2 = 28 \times 56$$ Each bed is a 90° segment: a sector less the triangle. $$\text{bed} = \frac{1}{4} \times \frac{22}{7} \times 28 \times 56 - \frac{1}{4} \times 56 \times 56$$ $$= 1232 - 784 = 448 \text{ m}^2$$ $$\text{total} = 3136 + 448 + 448 = 4032 \text{ m}^2$$`,
          r`**उदाहरण 4।** 56 m भुजा वाले वर्गाकार लॉन ABCD के दो ओर दो फूलों की क्यारियाँ हैं। हर क्यारी O पर केंद्रित वृत्त का वह भाग है जो वर्ग की भुजा के पार है, जहाँ O विकर्णों का प्रतिच्छेद है। मान लो $OA = OB = x$। विकर्ण लंबवत हैं, तो $$x^2 + x^2 = 56^2, \quad x^2 = 28 \times 56$$ हर क्यारी 90° का वृत्तखंड है: त्रिज्यखंड घटा त्रिभुज। $$\text{क्यारी} = \frac{1}{4} \times \frac{22}{7} \times 28 \times 56 - \frac{1}{4} \times 56 \times 56$$ $$= 1232 - 784 = 448 \text{ m}^2$$ $$\text{कुल} = 3136 + 448 + 448 = 4032 \text{ m}^2$$`,
        ),
      ),
      beds,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 6: the petal design. */
const petals = page(
  "petals",
  (b) => {
    const w = wordsOn(b);
    const flower = b.prop(combinedFiguresDef, "flower", {
      kind: CombinedKind.Petals,
      step: 0,
      canStep: true,
    });
    b.studentOnly(flower.action(CombinedAction.Next));
    b.studentOnly(flower.action(CombinedAction.Back));
    b.studentOnly(flower.action(CombinedAction.Reset));
    b.standsFor(
      flower,
      "Example 6: semicircles drawn on each side of a square of side 10 cm make four petals; the unshaded corners come in two pairs, each 100 − 78.5 = 21.5 cm², and the petals are 100 − 43 = 57 cm²",
    );
    const goal = goalQuestion(b, {
      about: flower,
      prompt: t("Step through to the petals' area.", "पंखुड़ियों के क्षेत्रफल तक क़दम-दर-क़दम चलो।"),
      isMet: flower.field("step").eq(toTheEnd(CombinedKind.Petals)),
      solve: Array.from({ length: toTheEnd(CombinedKind.Petals) }, () =>
        flower.learner(CombinedAction.Next),
      ),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why is it easier to find the four unshaded pieces than the petals?",
        "पंखुड़ियों की जगह चार बिना-छायांकित टुकड़े निकालना आसान क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Two of them are a square less two semicircles",
            "उनमें से दो, वर्ग घटा दो अर्धवृत्त हैं",
          ),
        },
        {
          id: "count",
          label: t("There are four of them but only one flower", "वे चार हैं पर फूल सिर्फ़ एक"),
          feedback: t(
            "The count isn't the reason. Opposite pieces I and III are exactly what's left of the square after two semicircles.",
            "गिनती कारण नहीं है। आमने-सामने के टुकड़े I और III ठीक वही हैं जो दो अर्धवृत्तों के बाद वर्ग में बचता है।",
          ),
        },
        {
          id: "small",
          label: t(
            "Smaller pieces always have easier areas",
            "छोटे टुकड़ों का क्षेत्रफल हमेशा आसान होता है",
          ),
          feedback: t(
            "Small isn't the point: a piece is easy when it's a known shape minus known shapes, like a square less two semicircles.",
            "छोटा होना बात नहीं: टुकड़ा तब आसान है जब वह ज्ञात आकार घटा ज्ञात आकार हो, जैसे वर्ग घटा दो अर्धवृत्त।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("A four-petal flower", "चार पंखुड़ियों वाला फूल")),
      w.body(
        t(
          r`**Example 6.** ABCD is a square of side 10 cm, and a semicircle is drawn inside on each side as diameter. ($\pi = 3.14$) Call the unshaded pieces I, II, III, IV. The square less the two semicircles on AB and CD leaves I + III: $$100 - 2 \times \tfrac{1}{2} \times 3.14 \times 5^2 = 100 - 78.5 = 21.5 \text{ cm}^2$$ In the same way II + IV = 21.5 cm². So the petals are $$100 - 2 \times 21.5 = 57 \text{ cm}^2$$`,
          r`**उदाहरण 6।** ABCD 10 cm भुजा का वर्ग है, और हर भुजा को व्यास मानकर अंदर एक अर्धवृत्त बना है। ($\pi = 3.14$) बिना-छायांकित टुकड़ों को I, II, III, IV कहो। वर्ग में से AB और CD पर बने दो अर्धवृत्त घटाने पर I + III बचते हैं: $$100 - 2 \times \tfrac{1}{2} \times 3.14 \times 5^2 = 100 - 78.5 = 21.5 \text{ cm}^2$$ इसी तरह II + IV = 21.5 cm²। तो पंखुड़ियाँ हैं $$100 - 2 \times 21.5 = 57 \text{ cm}^2$$`,
        ),
      ),
      w.note(
        t(
          "Sometimes the shaded part is hard and the unshaded part is easy. Then find the unshaded part and take it away from the whole.",
          "कभी-कभी छायांकित भाग कठिन और बिना-छायांकित भाग आसान होता है। तब बिना-छायांकित भाग निकालो और पूरे में से घटा दो।",
        ),
      ),
      flower,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 12.3 Q8 (the race track) and Q10 (circles at a triangle's corners), worked. */
const more = page(
  "more",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Exercise 12.3, Q16: two quadrants of radius 8 cm are drawn inside a square of side 8 cm, from opposite corners. What is the area common to both? (Each quadrant less the triangle is half the shared leaf.)`,
        r`प्रश्नावली 12.3, प्र 16: 8 cm भुजा के वर्ग के अंदर आमने-सामने के कोनों से 8 cm त्रिज्या के दो चतुर्थांश बने हैं। दोनों में साझा क्षेत्रफल क्या है? (हर चतुर्थांश घटा त्रिभुज साझा पत्ती का आधा है।)`,
      ),
      options: [
        { id: "right", label: t(r`$\frac{256}{7}$ cm²`, r`$\frac{256}{7}$ cm²`) },
        {
          id: "quad",
          label: t(r`$\frac{352}{7}$ cm²`, r`$\frac{352}{7}$ cm²`),
          feedback: t(
            r`$\frac{352}{7}$ is one whole quadrant. Take away the triangle, 32, to get half the leaf, then double it.`,
            r`$\frac{352}{7}$ एक पूरा चतुर्थांश है। त्रिभुज, 32, घटाकर पत्ती का आधा लो, फिर दुगुना करो।`,
          ),
        },
        {
          id: "half",
          label: t(r`$\frac{128}{7}$ cm²`, r`$\frac{128}{7}$ cm²`),
          feedback: t(
            r`$\frac{352}{7} - 32 = \frac{128}{7}$ is only half the leaf. The other quadrant gives the other half.`,
            r`$\frac{352}{7} - 32 = \frac{128}{7}$ पत्ती का सिर्फ़ आधा है। दूसरा चतुर्थांश दूसरा आधा देता है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Tracks and corners", "पथ और कोने")),
      figureOn(b, "track", RACE_TRACK),
      w.body(
        t(
          r`**Exercise 12.3, Q8.** A race track has straight inner sides 106 m long, 60 m apart, with semicircular ends; the track is 10 m wide. The inner edge is two straights and two half-circles of radius 30: $$2 \times 106 + 2\pi \times 30 = 212 + \frac{1320}{7}$$ $$= \frac{2804}{7} \text{ m}$$ The track is two strips plus a ring between radii 40 and 30: $$2 \times 106 \times 10 + \frac{22}{7}(40^2 - 30^2)$$ $$= 2120 + 2200 = 4320 \text{ m}^2$$`,
          r`**प्रश्नावली 12.3, प्र 8।** एक दौड़ पथ की अंदर की सीधी भुजाएँ 106 m लंबी और 60 m दूर हैं, सिरे अर्धवृत्ताकार हैं; पथ 10 m चौड़ा है। अंदर का किनारा दो सीधे भाग और 30 त्रिज्या के दो अर्धवृत्त है: $$2 \times 106 + 2\pi \times 30 = 212 + \frac{1320}{7}$$ $$= \frac{2804}{7} \text{ m}$$ पथ दो पट्टियाँ और 40 व 30 त्रिज्याओं के बीच एक वलय है: $$2 \times 106 \times 10 + \frac{22}{7}(40^2 - 30^2)$$ $$= 2120 + 2200 = 4320 \text{ m}^2$$`,
        ),
      ),
      figureOn(b, "corners", CORNER_CIRCLES),
      w.body(
        t(
          r`**Exercise 12.3, Q10.** An equilateral triangle of area 17320.5 cm² has a circle of radius half its side at each corner. ($\pi = 3.14$, $\sqrt{3} = 1.73205$) From $\frac{\sqrt{3}}{4}a^2 = 17320.5$, $a = 200$ and $r = 100$. The three corner sectors are 60° each, half a circle in all: $$17320.5 - \tfrac{1}{2} \times 3.14 \times 100^2$$ $$= 17320.5 - 15700 = 1620.5 \text{ cm}^2$$`,
          r`**प्रश्नावली 12.3, प्र 10।** 17320.5 cm² क्षेत्रफल वाले समबाहु त्रिभुज के हर कोने पर उसकी आधी भुजा की त्रिज्या का वृत्त है। ($\pi = 3.14$, $\sqrt{3} = 1.73205$) $\frac{\sqrt{3}}{4}a^2 = 17320.5$ से $a = 200$ और $r = 100$। तीनों कोनों के त्रिज्यखंड 60° के हैं, कुल आधा वृत्त: $$17320.5 - \tfrac{1}{2} \times 3.14 \times 100^2$$ $$= 17320.5 - 15700 = 1620.5 \text{ cm}^2$$`,
        ),
      ),
      figureOn(b, "leaf", LEAF),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The border: 6 circle tiles and 4 petal tiles. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const border = sceneOn(
      b,
      "border",
      CirclesSceneKind.PosterDesign,
      "the finished border: six square tiles with four circles cut out and four petal tiles",
    );
    const paint = choiceQuestion(b, {
      name: "paint",
      prompt: t(
        "Riya's tiles are 7 cm squares. Each of the 6 circle tiles has four circles of diameter 3.5 cm cut out; each of the 4 petal tiles has a semicircle drawn inside on every side. Using π = 22/7, how much area will Kabir paint?",
        "रिया की टाइलें 7 cm के वर्ग हैं। 6 वृत्त-टाइलों में से हर एक में 3.5 cm व्यास के चार वृत्त कटे हैं; 4 पंखुड़ी-टाइलों में से हर एक में हर भुजा पर अंदर एक अर्धवृत्त बना है। π = 22/7 लेकर, कबीर कितना क्षेत्रफल रंगेगा?",
      ),
      options: [
        { id: "right", label: t("175 cm²", "175 cm²") },
        {
          id: "one",
          label: t("38.5 cm²", "38.5 cm²"),
          feedback: t(
            "38.5 = 10.5 + 28 is one tile of each kind: 49 − 38.5 = 10.5 for a circle tile, 77 − 49 = 28 for a petal tile. There are 6 and 4 of them: 6 × 10.5 + 4 × 28.",
            "38.5 = 10.5 + 28 हर तरह की एक टाइल है: वृत्त-टाइल के लिए 49 − 38.5 = 10.5, पंखुड़ी-टाइल के लिए 77 − 49 = 28। वे 6 और 4 हैं: 6 × 10.5 + 4 × 28।",
          ),
        },
        {
          id: "whole",
          label: t("490 cm²", "490 cm²"),
          feedback: t(
            "That paints the whole squares, 10 × 49. Only the shaded parts get paint: 6 × 10.5 + 4 × 28.",
            "इसमें पूरे वर्ग रंगे, 10 × 49। रंग सिर्फ़ छायांकित भागों पर लगता है: 6 × 10.5 + 4 × 28।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The paint request", "रंग की माँग")),
      border,
      w.body(
        t(
          "Riya's border uses the two designs from the worked examples, but her own tiles are smaller, so the numbers are new. Same method: the square less the four circles, and the semicircles less the square. Kabir counts the tiles along the edge of the chart paper and writes the paint request.",
          "रिया का किनारा हल किए उदाहरणों वाली दोनों डिज़ाइनें लेता है, पर उसकी अपनी टाइलें छोटी हैं, इसलिए संख्याएँ नई हैं। तरीका वही: वर्ग घटा चार वृत्त, और अर्धवृत्त घटा वर्ग। कबीर चार्ट पेपर के किनारे पर टाइलें गिनता है और रंग की माँग लिखता है।",
        ),
      ),
      paint,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 12.3 Q5 to try. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const left = choiceQuestion(b, {
      name: "left",
      prompt: t(
        "From each corner of a 4 cm square a quadrant of radius 1 cm is cut, and a circle of diameter 2 cm is cut from the middle. What area is left?",
        "4 cm भुजा के वर्ग के हर कोने से 1 cm त्रिज्या का चतुर्थांश काटा गया, और बीच से 2 cm व्यास का वृत्त। कितना क्षेत्रफल बचा?",
      ),
      options: [
        { id: "right", label: t(r`$\frac{68}{7}$ cm²`, r`$\frac{68}{7}$ cm²`) },
        {
          id: "one",
          label: t(r`$\frac{90}{7}$ cm²`, r`$\frac{90}{7}$ cm²`),
          feedback: t(
            r`That takes away only one circle's worth. The four quadrants make one circle of radius 1, and the middle circle is another: $16 - 2 \times \frac{22}{7}$.`,
            r`इसमें सिर्फ़ एक वृत्त जितना घटाया। चार चतुर्थांश मिलकर 1 त्रिज्या का एक वृत्त बनाते हैं, और बीच का वृत्त दूसरा: $16 - 2 \times \frac{22}{7}$।`,
          ),
        },
        {
          id: "big",
          label: t(r`$\frac{2}{7}$ cm²`, r`$\frac{2}{7}$ cm²`),
          feedback: t(
            r`That uses radius 2 for the middle circle. Its diameter is 2 cm, so its radius is 1: $16 - \frac{22}{7} - \frac{22}{7}$.`,
            r`इसमें बीच के वृत्त की त्रिज्या 2 ली। उसका व्यास 2 cm है, तो त्रिज्या 1: $16 - \frac{22}{7} - \frac{22}{7}$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      figureOn(b, "ring", RING_SECTOR),
      w.body(
        t(
          r`**Worked (Exercise 12.3, Q2).** Two circles with centre O, radii 7 cm and 14 cm, and $\angle AOC = 40°$. The shaded part is the big sector less the small one: $$\frac{40}{360} \times \frac{22}{7} \times (14^2 - 7^2) = \frac{1}{9} \times 462 = \frac{154}{3} \text{ cm}^2$$`,
          r`**हल किया हुआ (प्रश्नावली 12.3, प्र 2)।** केंद्र O वाले दो वृत्त, त्रिज्याएँ 7 cm और 14 cm, और $\angle AOC = 40°$। छायांकित भाग बड़ा त्रिज्यखंड घटा छोटा है: $$\frac{40}{360} \times \frac{22}{7} \times (14^2 - 7^2) = \frac{1}{9} \times 462 = \frac{154}{3} \text{ cm}^2$$`,
        ),
      ),
      figureOn(b, "cut", CUT_SQUARE),
      left,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fair day: the mission log for Chapters 10 to 12. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const fair = sceneOn(
      b,
      "fair",
      CirclesSceneKind.FairDay,
      'science fair day: the poster "How a cycle works" over the stall, the cycle in front, Riya and Kabir explaining to a visitor, Grandpa and Mom cheering',
    );
    const visitor = choiceQuestion(b, {
      name: "visitor",
      prompt: t(
        'A visitor asks: "Why does the chain leave the sprocket in a straight line, just touching it?" What does Riya answer?',
        'एक दर्शक पूछता है: "चेन स्प्रॉकेट को बस छूते हुए सीधी रेखा में क्यों निकलती है?" रिया क्या जवाब देती है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "It's a tangent: it meets the rim at one point",
            "यह स्पर्श रेखा है: परिधि से एक बिंदु पर मिलती है",
          ),
        },
        {
          id: "secant",
          label: t(
            "It's a secant: it cuts the rim at two points",
            "यह छेदक रेखा है: परिधि को दो बिंदुओं पर काटती है",
          ),
          feedback: t(
            "A secant would cut into the sprocket. The chain's straight run just touches it at one point: a tangent.",
            "छेदक स्प्रॉकेट को काटती। चेन का सीधा भाग उसे एक ही बिंदु पर छूता है: स्पर्श रेखा।",
          ),
        },
        {
          id: "chord",
          label: t(
            "It's a chord: it joins two points of the rim",
            "यह जीवा है: परिधि के दो बिंदुओं को जोड़ती है",
          ),
          feedback: t(
            "A chord lies inside the circle. The chain runs outside the sprocket, touching it once: a tangent, from Chapter 10.",
            "जीवा वृत्त के अंदर होती है। चेन स्प्रॉकेट के बाहर चलती है, उसे एक बार छूते हुए: स्पर्श रेखा, अध्याय 10 से।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission complete.** Chapter 10: the wheel touches the road along a tangent, at right angles to the spoke, and the chain leaves the sprockets along equal tangents. Chapter 11: Riya drew the whole cycle to scale with compass and ruler. Chapter 12: one turn of the wheel is $2\pi r = 220$ cm, the mudguard's strip is a 55 cm arc, the reflector a 14 cm² segment, and the border needs 175 cm² of paint. The poster wins a blue ribbon, and Grandpa wants one for his well pulley next.`,
        r`**मिशन पूरा।** अध्याय 10: पहिया सड़क को स्पर्श रेखा के साथ छूता है, तीली पर समकोण बनाते हुए, और चेन स्प्रॉकेट से बराबर स्पर्श रेखाओं के साथ निकलती है। अध्याय 11: रिया ने परकार और रूलर से पूरी साइकिल पैमाने पर बनाई। अध्याय 12: पहिये का एक चक्कर $2\pi r = 220$ cm है, मडगार्ड की पट्टी 55 cm का चाप है, रिफ़्लेक्टर 14 cm² का वृत्तखंड, और किनारे को 175 cm² रंग चाहिए। पोस्टर को नीला रिबन मिलता है, और दादाजी अगला पोस्टर अपनी कुएँ की घिरनी पर चाहते हैं।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(visitor.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Fair day", "मेले का दिन")),
      fair,
      w.body(
        t(
          "The poster hangs over the stall, the cycle stands in front of it, and every number on it is one Riya and Kabir worked out themselves. The visitors don't stop asking questions.",
          "पोस्टर स्टॉल के ऊपर टँगा है, साइकिल उसके आगे खड़ी है, और उस पर हर संख्या रिया और कबीर ने ख़ुद निकाली है। दर्शक सवाल पूछना बंद नहीं करते।",
        ),
      ),
      visitor,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, method, lawn, petals, more, inLife, yourTurn, finale];
