import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AreaAction,
  AreaDerived,
  AreaMode,
  TrianglesSceneKind,
  areaTilesDef,
} from "@chalk/prop-triangles";
import { AREAS_PROOF } from "../figures";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The banner: three times as wide, how much more ink? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const shop = sceneOn(
    b,
    "shop",
    TrianglesSceneKind.PhotoShop,
    "the photo shop counter with prints of the colony photo in different sizes",
  );
  return column([
    w.title(t("A bigger banner", "बड़ा बैनर")),
    shop,
    w.body(
      t(
        'The colony likes the photo so much that it wants it as a banner on the gate, 3 times as wide and 3 times as tall as the notice-board print. The shop says the notice-board print used ₹40 of ink. Kabir: "Three times as big, so ₹120." Mom isn\'t so sure.',
        'कॉलोनी को फ़ोटो इतनी पसंद आती है कि वह उसे गेट पर बैनर के रूप में चाहती है, नोटिस-बोर्ड वाले प्रिंट से 3 गुना चौड़ा और 3 गुना ऊँचा। दुकान बताती है कि नोटिस-बोर्ड वाले प्रिंट में ₹40 की स्याही लगी। कबीर: "तीन गुना बड़ा, तो ₹120।" मम्मी को उतना यक़ीन नहीं।',
      ),
    ),
    w.body(
      t(
        "Ink covers area. So the question is: when the sides of a shape are multiplied by 3, what happens to its area?",
        "स्याही क्षेत्रफल ढकती है। तो सवाल यह है: जब किसी आकृति की भुजाएँ 3 से गुणा होती हैं, तो उसके क्षेत्रफल का क्या होता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Tiles: side ratio n gives n² small triangles. */
const tiles = page(
  "tiles",
  (b) => {
    const w = wordsOn(b);
    const grid = b.prop(areaTilesDef, "grid", {
      mode: AreaMode.Tiles,
      small: 2,
      big: 3,
      names: ["A", "B", "C", "P", "Q", "R"],
      canSetSmall: true,
      canSetBig: false,
      canMoveLine: false,
      showCounts: true,
    });
    b.studentOnly(grid.action(AreaAction.NudgeSmall));
    b.standsFor(
      grid,
      "two similar triangles tiled with equal small triangles: a side of n units holds n × n tiles; the learner changes the first triangle's side",
    );
    const goal = goalQuestion(b, {
      about: grid,
      prompt: t(
        "Make the second triangle's sides exactly 3 times the first's. Then count the tiles in each.",
        "दूसरे त्रिभुज की भुजाएँ पहले की ठीक 3 गुनी बनाओ। फिर हर एक में टाइलें गिनो।",
      ),
      isMet: grid.field("small").eq(1),
      solve: [grid.learner(AreaAction.NudgeSmall, { by: -1 })],
    });
    return column([
      w.title(t("Count the tiles", "टाइलें गिनो")),
      w.body(
        t(
          "Area is measured in square units, so it should grow faster than the sides. Fill two similar triangles with equal small triangles and count.",
          "क्षेत्रफल वर्ग इकाइयों में नापा जाता है, इसलिए उसे भुजाओं से तेज़ बढ़ना चाहिए। दो समरूप त्रिभुजों को बराबर छोटे त्रिभुजों से भरो और गिनो।",
        ),
      ),
      grid,
      goal,
      w.body(
        t(
          r`A side of 1 unit holds 1 tile; a side of 3 units holds $3 \times 3 = 9$. Sides 3 times as long, area 9 times as big: $$\frac{\text{area}}{\text{area}} = 3^2$$`,
          r`1 इकाई की भुजा में 1 टाइल आती है; 3 इकाई की भुजा में $3 \times 3 = 9$। भुजाएँ 3 गुनी लंबी, क्षेत्रफल 9 गुना बड़ा: $$\frac{\text{क्षेत्रफल}}{\text{क्षेत्रफल}} = 3^2$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Theorem 6.6 with its proof. */
const theorem = page(
  "theorem",
  (b) => {
    const w = wordsOn(b);
    const step = choiceQuestion(b, {
      name: "step",
      prompt: t("In the proof, why is AM/PN = AB/PQ?", "उपपत्ति में AM/PN = AB/PQ क्यों है?"),
      options: [
        {
          id: "right",
          label: t("∆ ABM ~ ∆ PQN, by AA", "∆ ABM ~ ∆ PQN, AA से"),
        },
        {
          id: "mid",
          label: t("M, N are mid-points of BC, QR", "M, N भुजाओं BC, QR के मध्य-बिंदु हैं"),
          feedback: t(
            "M and N are the feet of the altitudes, not mid-points. ∠B = ∠Q and both have a right angle, so ∆ ABM ~ ∆ PQN.",
            "M और N शीर्षलंबों के पाद हैं, मध्य-बिंदु नहीं। ∠B = ∠Q और दोनों में समकोण है, इसलिए ∆ ABM ~ ∆ PQN।",
          ),
        },
        {
          id: "bpt",
          label: t("AM ∥ PN, by the BPT", "AM ∥ PN, BPT से"),
          feedback: t(
            "The two altitudes are in different triangles, so the BPT doesn't apply. The small right triangles are similar by AA.",
            "दोनों शीर्षलंब अलग त्रिभुजों में हैं, इसलिए BPT नहीं लगता। छोटे समकोण त्रिभुज AA से समरूप हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The areas theorem", "क्षेत्रफलों का प्रमेय")),
      w.definition(
        t(
          "**Theorem 6.6.** The ratio of the areas of two similar triangles is equal to the square of the ratio of their corresponding sides.",
          "**प्रमेय 6.6।** दो समरूप त्रिभुजों के क्षेत्रफलों का अनुपात उनकी संगत भुजाओं के अनुपात के वर्ग के बराबर होता है।",
        ),
      ),
      w.body(
        t(
          r`**Given:** ∆ ABC ~ ∆ PQR. **To prove:** $$\frac{\text{ar}(ABC)}{\text{ar}(PQR)} = \left(\frac{AB}{PQ}\right)^2 = \left(\frac{BC}{QR}\right)^2 = \left(\frac{CA}{RP}\right)^2$$ **Construction:** draw the altitudes AM ⊥ BC and PN ⊥ QR. An **altitude** is the perpendicular from a vertex to the opposite side.`,
          r`**दिया है:** ∆ ABC ~ ∆ PQR। **सिद्ध करना है:** $$\frac{\text{ar}(ABC)}{\text{ar}(PQR)} = \left(\frac{AB}{PQ}\right)^2 = \left(\frac{BC}{QR}\right)^2 = \left(\frac{CA}{RP}\right)^2$$ **रचना:** शीर्षलंब AM ⊥ BC और PN ⊥ QR खींचो। **शीर्षलंब** किसी शीर्ष से सामने वाली भुजा पर डाला गया लंब है।`,
        ),
      ),
      figureOn(b, "figure", AREAS_PROOF),
      w.body(
        t(
          r`**Proof.** Half base times height: $$\frac{\text{ar}(ABC)}{\text{ar}(PQR)} = \frac{\tfrac12\, BC \times AM}{\tfrac12\, QR \times PN} = \frac{BC}{QR} \times \frac{AM}{PN} \quad (1)$$ In ∆ ABM and ∆ PQN, ∠B = ∠Q (similar triangles) and ∠M = ∠N = 90°, so by AA, ∆ ABM ~ ∆ PQN, and $$\frac{AM}{PN} = \frac{AB}{PQ} \quad (2)$$ From ∆ ABC ~ ∆ PQR, $$\frac{AB}{PQ} = \frac{BC}{QR} = \frac{CA}{RP} \quad (3)$$ Put (2) and (3) into (1): $$\frac{\text{ar}(ABC)}{\text{ar}(PQR)} = \frac{AB}{PQ} \times \frac{AB}{PQ} = \left(\frac{AB}{PQ}\right)^2$$ and by (3) this equals the square of each side ratio.`,
          r`**उपपत्ति।** आधा आधार गुणा ऊँचाई: $$\frac{\text{ar}(ABC)}{\text{ar}(PQR)} = \frac{\tfrac12\, BC \times AM}{\tfrac12\, QR \times PN} = \frac{BC}{QR} \times \frac{AM}{PN} \quad (1)$$ ∆ ABM और ∆ PQN में ∠B = ∠Q (समरूप त्रिभुज) और ∠M = ∠N = 90°, तो AA से ∆ ABM ~ ∆ PQN, और $$\frac{AM}{PN} = \frac{AB}{PQ} \quad (2)$$ ∆ ABC ~ ∆ PQR से, $$\frac{AB}{PQ} = \frac{BC}{QR} = \frac{CA}{RP} \quad (3)$$ (2) और (3) को (1) में रखो: $$\frac{\text{ar}(ABC)}{\text{ar}(PQR)} = \frac{AB}{PQ} \times \frac{AB}{PQ} = \left(\frac{AB}{PQ}\right)^2$$ और (3) से यह हर भुजा-अनुपात के वर्ग के बराबर है।`,
        ),
      ),
      step,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 9: the line that halves the area. */
const half = page(
  "half",
  (b) => {
    const w = wordsOn(b);
    const cut = b.prop(areaTilesDef, "cut", {
      mode: AreaMode.Half,
      t: 0.5,
      names: ["A", "B", "C", "X", "Y"],
      canSetSmall: false,
      canSetBig: false,
      canMoveLine: true,
      showCounts: true,
    });
    b.studentOnly(cut.action(AreaAction.MoveLine));
    b.standsFor(
      cut,
      "triangle ABC with a line XY parallel to AC that the learner moves along; the small triangle XBY's share of the area is shown",
    );
    const goal = goalQuestion(b, {
      about: cut,
      prompt: t(
        "Example 9: move XY (kept parallel to AC) until triangle XBY has exactly half the area of ABC.",
        "उदाहरण 9: XY को (AC के समांतर रखते हुए) तब तक खिसकाओ जब तक त्रिभुज XBY का क्षेत्रफल ABC का ठीक आधा न हो।",
      ),
      isMet: cut.derived(AreaDerived.IsHalf).eq(true),
      solve: [
        ...Array.from({ length: 4 }, () => cut.learner(AreaAction.MoveLine, { by: 1, size: 5 })),
        cut.learner(AreaAction.MoveLine, { by: 1 }),
      ],
    });
    return column([
      w.title(t("Cutting a triangle in half", "त्रिभुज को आधा काटना")),
      w.body(
        t(
          "**Example 9.** XY is parallel to side AC of ∆ ABC and divides it into two parts of equal area. Find AX/AB. Try it first: at XB = ½ AB, is the area halved?",
          "**उदाहरण 9।** XY, ∆ ABC की भुजा AC के समांतर है और उसे बराबर क्षेत्रफल वाले दो भागों में बाँटती है। AX/AB ज्ञात करो। पहले आज़माओ: XB = ½ AB पर, क्या क्षेत्रफल आधा होता है?",
        ),
      ),
      cut,
      goal,
      w.body(
        t(
          r`At halfway the small triangle has only $(\tfrac12)^2 = \tfrac14$ of the area. The line has to go further. Since XY ∥ AC, ∠BXY = ∠A and ∠BYX = ∠C, so ∆ ABC ~ ∆ XBY by AA, and $$\frac{\text{ar}(ABC)}{\text{ar}(XBY)} = \left(\frac{AB}{XB}\right)^2 = 2$$ $$\frac{XB}{AB} = \frac{1}{\sqrt2}$$ $$\frac{AX}{AB} = 1 - \frac{1}{\sqrt2} = \frac{\sqrt2 - 1}{\sqrt2} = \frac{2 - \sqrt2}{2}$$ So XB is about 0.71 of AB, just where you put it.`,
          r`आधे पर छोटे त्रिभुज का क्षेत्रफल केवल $(\tfrac12)^2 = \tfrac14$ है। रेखा को और आगे जाना होगा। चूँकि XY ∥ AC, ∠BXY = ∠A और ∠BYX = ∠C, तो AA से ∆ ABC ~ ∆ XBY, और $$\frac{\text{ar}(ABC)}{\text{ar}(XBY)} = \left(\frac{AB}{XB}\right)^2 = 2$$ $$\frac{XB}{AB} = \frac{1}{\sqrt2}$$ $$\frac{AX}{AB} = 1 - \frac{1}{\sqrt2} = \frac{\sqrt2 - 1}{\sqrt2} = \frac{2 - \sqrt2}{2}$$ तो XB, AB का लगभग 0.71 है, ठीक जहाँ तुमने रखा।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 6.4 Q5: the mid-point triangle is a quarter. */
const midpoints = page(
  "midpoints",
  (b) => {
    const w = wordsOn(b);
    const mid = b.prop(areaTilesDef, "mid", {
      mode: AreaMode.Midpoints,
      names: ["A", "B", "C", "D", "E", "F"],
      canSetSmall: false,
      canSetBig: false,
      canMoveLine: false,
      showCounts: true,
    });
    b.standsFor(
      mid,
      "triangle ABC with D, E, F the mid-points of AB, BC, CA, and the triangle DEF inside it",
    );
    const q5 = choiceQuestion(b, {
      name: "q5",
      prompt: t(
        "Exercise 6.4 Q5: D, E, F are the mid-points of AB, BC, CA. Find ar(DEF) : ar(ABC).",
        "प्रश्नावली 6.4 प्र5: D, E, F भुजाओं AB, BC, CA के मध्य-बिंदु हैं। ar(DEF) : ar(ABC) ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("1 : 4", "1 : 4") },
        {
          id: "half",
          label: t("1 : 2", "1 : 2"),
          feedback: t(
            "The sides are halved (mid-point theorem), so the area goes by (½)² = ¼.",
            "भुजाएँ आधी होती हैं (मध्य-बिंदु प्रमेय), इसलिए क्षेत्रफल (½)² = ¼ से जाता है।",
          ),
        },
        {
          id: "third",
          label: t("1 : 3", "1 : 3"),
          feedback: t(
            "The four small triangles are all congruent, so DEF is one of four equal parts.",
            "चारों छोटे त्रिभुज सर्वांगसम हैं, इसलिए DEF चार बराबर भागों में से एक है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The mid-point triangle", "मध्य-बिंदु त्रिभुज")),
      mid,
      w.body(
        t(
          r`By the mid-point theorem (Class IX), each side of DEF is half a side of ABC: $$\frac{DE}{CA} = \frac{EF}{AB} = \frac{FD}{BC} = \frac12$$ So ∆ DEF ~ ∆ ABC by SSS, and the areas are in the ratio of the squares.`,
          r`मध्य-बिंदु प्रमेय (कक्षा IX) से, DEF की हर भुजा ABC की एक भुजा की आधी है: $$\frac{DE}{CA} = \frac{EF}{AB} = \frac{FD}{BC} = \frac12$$ तो SSS से ∆ DEF ~ ∆ ABC, और क्षेत्रफल वर्गों के अनुपात में हैं।`,
        ),
      ),
      q5,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The banner's ink. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const cost = choiceQuestion(b, {
      name: "cost",
      prompt: t(
        "The notice-board print used ₹40 of ink. The banner is 3 times as wide and 3 times as tall. How much ink will it need?",
        "नोटिस-बोर्ड प्रिंट में ₹40 की स्याही लगी। बैनर 3 गुना चौड़ा और 3 गुना ऊँचा है। उसमें कितनी स्याही लगेगी?",
      ),
      options: [
        { id: "right", label: t("₹360", "₹360") },
        {
          id: "120",
          label: t("₹120", "₹120"),
          feedback: t(
            "That's Kabir's guess: it triples the length only. The area is 3 × 3 = 9 times, so 9 × ₹40.",
            "यह कबीर का अंदाज़ा है: यह केवल लंबाई को तिगुना करता है। क्षेत्रफल 3 × 3 = 9 गुना है, तो 9 × ₹40।",
          ),
        },
        {
          id: "240",
          label: t("₹240", "₹240"),
          feedback: t(
            "That adds the two stretches (3 + 3). Areas multiply them: 3 × 3 = 9 times the ink.",
            "यह दोनों खिंचावों को जोड़ता है (3 + 3)। क्षेत्रफल उन्हें गुणा करता है: 3 × 3 = 9 गुना स्याही।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        "Mom was right to be careful. The colony settles on a banner twice as wide and twice as tall instead: 2² = 4 times the ink, ₹160. **Stop 5 done.**",
        "मम्मी का सावधान रहना सही था। कॉलोनी उसकी जगह दोगुना चौड़ा और दोगुना ऊँचा बैनर तय करती है: 2² = 4 गुना स्याही, ₹160। **पड़ाव 5 पूरा।**",
      ),
      "done",
      { isHidden: true },
    );
    b.when(cost.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("Back to the banner", "फिर बैनर पर")),
      w.body(
        t(
          "The theorem was about triangles, and the banner is a rectangle. A rectangle is two triangles along its diagonal, and each one grows the same way, so the same rule holds.",
          "प्रमेय त्रिभुजों के बारे में था, और बैनर एक आयत है। आयत अपने विकर्ण के साथ दो त्रिभुज है, और हर त्रिभुज एक ही तरह बढ़ता है, इसलिए वही नियम लागू होता है।",
        ),
      ),
      cost,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6.4 Q1 and Q9; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Exercise 6.4 Q1: ∆ ABC ~ ∆ DEF with areas 64 cm² and 121 cm². EF = 15.4 cm. Find BC.",
        "प्रश्नावली 6.4 प्र1: ∆ ABC ~ ∆ DEF, क्षेत्रफल 64 cm² और 121 cm²। EF = 15.4 cm। BC ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("11.2 cm", "11.2 cm") },
        {
          id: "sq",
          label: t("8.1 cm", "8.1 cm"),
          feedback: t(
            "That uses 64/121 directly. Sides go by the square root: BC/15.4 = 8/11, so BC = 11.2.",
            "इसमें 64/121 सीधे लिया गया। भुजाएँ वर्गमूल से चलती हैं: BC/15.4 = 8/11, तो BC = 11.2।",
          ),
        },
        {
          id: "flip",
          label: t("21.2 cm", "21.2 cm"),
          feedback: t(
            "ABC is the smaller triangle (64 < 121), so BC must be shorter than EF: 15.4 × 8/11 = 11.2.",
            "ABC छोटा त्रिभुज है (64 < 121), इसलिए BC, EF से छोटा होना चाहिए: 15.4 × 8/11 = 11.2।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q9 = choiceQuestion(b, {
      name: "q9",
      prompt: t(
        "Exercise 6.4 Q9: sides of two similar triangles are in the ratio 4 : 9. Their areas are in the ratio…",
        "प्रश्नावली 6.4 प्र9: दो समरूप त्रिभुजों की भुजाएँ 4 : 9 के अनुपात में हैं। उनके क्षेत्रफल किस अनुपात में हैं…",
      ),
      options: [
        { id: "right", label: t("16 : 81", "16 : 81") },
        {
          id: "same",
          label: t("4 : 9", "4 : 9"),
          feedback: t(
            "Areas go by the square of the side ratio.",
            "क्षेत्रफल भुजा-अनुपात के वर्ग से चलते हैं।",
          ),
        },
        {
          id: "root",
          label: t("2 : 3", "2 : 3"),
          feedback: t(
            "That's the square root, the wrong way. Square it: 4² : 9².",
            "यह वर्गमूल है, उल्टी दिशा। वर्ग करो: 4² : 9²।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Areas of similar triangles go by the square of the side ratio. ✓ The banner is ordered. Next: the wire itself, from the top of the tank to the pillar.",
        "**मिशन लॉग।** ✓ समरूप त्रिभुजों के क्षेत्रफल भुजा-अनुपात के वर्ग से चलते हैं। ✓ बैनर का ऑर्डर हो गया। आगे: ख़ुद तार, टंकी के ऊपर से खंभे तक।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q9.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q9, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, tiles, theorem, half, midpoints, inLife, yourTurn];
