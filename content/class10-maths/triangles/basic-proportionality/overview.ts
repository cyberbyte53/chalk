import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BptAction,
  BptDerived,
  BptMode,
  TrianglesSceneKind,
  proportionLineDef,
} from "@chalk/prop-triangles";
import { BPT_PROOF, EXAMPLE_1, EXAMPLE_3 } from "../figures";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The triangular pennants, and a stripe ruled parallel to the base. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = sceneOn(
    b,
    "notice",
    TrianglesSceneKind.NoticeBoard,
    "the colony gate's notice board, with the water tank behind it",
  );
  return column([
    w.title(t("A stripe on the flags", "झंडियों पर पट्टी")),
    notice,
    w.body(
      t(
        "The photo is sorted. Next, Kabir is cutting triangular paper flags for the gate, and he wants a saffron stripe across each one, **parallel to the bottom edge**. He rules the stripe 3 cm down one slanting edge, which is 5 cm long. Where must it meet the other slanting edge, so that it really is parallel?",
        "फ़ोटो तय हो गई। अब कबीर गेट के लिए काग़ज़ की तिकोनी झंडियाँ काट रहा है, और हर एक पर **निचले किनारे के समांतर** एक केसरिया पट्टी चाहता है। वह पट्टी 5 cm लंबे एक तिरछे किनारे पर 3 cm नीचे खींचता है। दूसरे तिरछे किनारे पर उसे कहाँ मिलना चाहिए, ताकि वह सच में समांतर हो?",
      ),
    ),
    w.body(
      t(
        "This lesson answers that, and it is also the first tool for measuring the tank: what a line parallel to one side does to the other two sides.",
        "यह पाठ इसका जवाब देता है, और यही टंकी नापने का पहला औज़ार भी है: एक भुजा के समांतर रेखा बाक़ी दो भुजाओं के साथ क्या करती है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Similar triangles; equiangular; Thales; Activity 2 with the parallel line. */
const activity = page(
  "activity",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(proportionLineDef, "line", {
      mode: BptMode.Parallel,
      ab: 5,
      ac: 6,
      angleA: 55,
      d: 0.4,
      e: 0.4,
      parts: 5,
      names: ["A", "B", "C", "D", "E"],
      canMoveD: true,
      canMoveE: false,
      showRatios: true,
      showLengths: false,
    });
    b.studentOnly(line.action(BptAction.MoveD));
    b.standsFor(
      line,
      "a triangle ABC with AB marked in 5 equal parts and a line DE parallel to BC; the learner slides D along AB and reads AD/DB and AE/EC",
    );
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(
        "Activity 2: slide D to the third mark from A, so that AD : DB = 3 : 2.",
        "क्रियाकलाप 2: D को A से तीसरे निशान पर ले जाओ, ताकि AD : DB = 3 : 2 हो।",
      ),
      isMet: line.field("d").eq(0.6),
      solve: [line.learner(BptAction.MoveD, { by: 1 })],
    });
    return column([
      w.title(t("A line parallel to one side", "एक भुजा के समांतर रेखा")),
      w.definition(
        t(
          "**Similar triangles.** A triangle is a polygon, so the same test applies: two triangles are similar if their corresponding angles are equal and their corresponding sides are in the same ratio. Triangles whose corresponding angles are equal are called **equiangular**.",
          "**समरूप त्रिभुज।** त्रिभुज एक बहुभुज है, तो वही कसौटी लगती है: दो त्रिभुज समरूप हैं यदि उनके संगत कोण बराबर हों और संगत भुजाएँ एक ही अनुपात में हों। जिन त्रिभुजों के संगत कोण बराबर हों, उन्हें **समकोणिक** कहते हैं।",
        ),
      ),
      w.body(
        t(
          "The Greek mathematician Thales (640–546 BC) found that in two equiangular triangles the ratio of any two corresponding sides is always the same. He is believed to have used the result below. To see it, mark the arm AB of a triangle in five equal parts and draw a line through D parallel to BC.",
          "यूनानी गणितज्ञ थेल्स (640–546 ई.पू.) ने पाया कि दो समकोणिक त्रिभुजों में किन्हीं दो संगत भुजाओं का अनुपात हमेशा एक ही होता है। माना जाता है कि उन्होंने नीचे वाले परिणाम का उपयोग किया। इसे देखने के लिए, त्रिभुज की भुजा AB को पाँच बराबर भागों में बाँटो और D से BC के समांतर एक रेखा खींचो।",
        ),
      ),
      line,
      goal,
      w.body(
        t(
          r`With D at the third mark, $$\frac{AD}{DB} = \frac{3}{2}$$ and the parallel line also cuts AC so that $$\frac{AE}{EC} = \frac{3}{2}$$ Move D anywhere: the two ratios stay equal.`,
          r`D तीसरे निशान पर हो, तो $$\frac{AD}{DB} = \frac{3}{2}$$ और समांतर रेखा AC को भी ऐसे काटती है कि $$\frac{AE}{EC} = \frac{3}{2}$$ D को कहीं भी ले जाओ: दोनों अनुपात बराबर रहते हैं।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Theorem 6.1 (BPT), proved via areas, one step per line. */
const theorem = page(
  "theorem",
  (b) => {
    const w = wordsOn(b);
    const step = choiceQuestion(b, {
      name: "step",
      prompt: t("Why is ar(BDE) = ar(DEC) in the proof?", "उपपत्ति में ar(BDE) = ar(DEC) क्यों है?"),
      options: [
        {
          id: "right",
          label: t(
            "Same base DE, between parallels DE and BC",
            "एक ही आधार DE, समांतर रेखाओं DE और BC के बीच",
          ),
        },
        {
          id: "cong",
          label: t("The two triangles are congruent", "दोनों त्रिभुज सर्वांगसम हैं"),
          feedback: t(
            "They aren't congruent; their shapes differ. Equal area comes from the same base and the same height.",
            "वे सर्वांगसम नहीं हैं; उनके आकार अलग हैं। बराबर क्षेत्रफल एक ही आधार और एक ही ऊँचाई से आता है।",
          ),
        },
        {
          id: "mid",
          label: t("D and E are the mid-points", "D और E मध्य-बिंदु हैं"),
          feedback: t(
            "D and E can be anywhere on the sides. The reason is the shared base DE and equal heights.",
            "D और E भुजाओं पर कहीं भी हो सकते हैं। कारण साझा आधार DE और बराबर ऊँचाइयाँ हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The basic proportionality theorem", "आधारभूत समानुपातिकता प्रमेय")),
      w.definition(
        t(
          "**Theorem 6.1 (basic proportionality theorem, or Thales theorem).** If a line is drawn parallel to one side of a triangle to meet the other two sides at two different points, it divides those two sides in the same ratio.",
          "**प्रमेय 6.1 (आधारभूत समानुपातिकता प्रमेय, या थेल्स प्रमेय)।** यदि किसी त्रिभुज की एक भुजा के समांतर एक रेखा खींची जाए जो बाक़ी दो भुजाओं को दो अलग बिंदुओं पर काटे, तो वह उन दोनों भुजाओं को एक ही अनुपात में बाँटती है।",
        ),
      ),
      w.body(
        t(
          r`**Given:** triangle ABC with DE ∥ BC, D on AB and E on AC. **To prove:** $$\frac{AD}{DB} = \frac{AE}{EC}$$ **Construction:** join BE and CD; draw DM ⊥ AC and EN ⊥ AB. Write ar(ADE) for the area of triangle ADE.`,
          r`**दिया है:** त्रिभुज ABC जिसमें DE ∥ BC, D भुजा AB पर और E भुजा AC पर। **सिद्ध करना है:** $$\frac{AD}{DB} = \frac{AE}{EC}$$ **रचना:** BE और CD मिलाओ; DM ⊥ AC और EN ⊥ AB खींचो। त्रिभुज ADE के क्षेत्रफल को ar(ADE) लिखो।`,
        ),
      ),
      figureOn(b, "figure", BPT_PROOF),
      w.body(
        t(
          r`**Proof.** Area is half base times height. With base AD and height EN: $$\text{ar}(ADE) = \tfrac{1}{2}\, AD \times EN$$ With base DB and the same height EN: $$\text{ar}(BDE) = \tfrac{1}{2}\, DB \times EN$$ Dividing, the ½ and EN cancel: $$\frac{\text{ar}(ADE)}{\text{ar}(BDE)} = \frac{AD}{DB} \quad (1)$$ In the same way, with height DM: $$\frac{\text{ar}(ADE)}{\text{ar}(DEC)} = \frac{AE}{EC} \quad (2)$$ Triangles BDE and DEC stand on the same base DE, between the same parallels DE and BC, so $$\text{ar}(BDE) = \text{ar}(DEC) \quad (3)$$ So the left sides of (1) and (2) are equal, and therefore $$\frac{AD}{DB} = \frac{AE}{EC}$$`,
          r`**उपपत्ति।** क्षेत्रफल आधा आधार गुणा ऊँचाई है। आधार AD और ऊँचाई EN से: $$\text{ar}(ADE) = \tfrac{1}{2}\, AD \times EN$$ आधार DB और वही ऊँचाई EN से: $$\text{ar}(BDE) = \tfrac{1}{2}\, DB \times EN$$ भाग देने पर ½ और EN कट जाते हैं: $$\frac{\text{ar}(ADE)}{\text{ar}(BDE)} = \frac{AD}{DB} \quad (1)$$ इसी तरह, ऊँचाई DM से: $$\frac{\text{ar}(ADE)}{\text{ar}(DEC)} = \frac{AE}{EC} \quad (2)$$ त्रिभुज BDE और DEC एक ही आधार DE पर, एक ही समांतर रेखाओं DE और BC के बीच हैं, इसलिए $$\text{ar}(BDE) = \text{ar}(DEC) \quad (3)$$ तो (1) और (2) के बाएँ पक्ष बराबर हैं, और इसलिए $$\frac{AD}{DB} = \frac{AE}{EC}$$`,
        ),
      ),
      step,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 3 and Theorem 6.2: the converse. */
const converse = page(
  "converse",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(proportionLineDef, "free", {
      mode: BptMode.Free,
      ab: 5,
      ac: 6,
      angleA: 55,
      d: 0.6,
      e: 0.2,
      parts: 5,
      names: ["A", "B", "C", "D", "E"],
      canMoveD: false,
      canMoveE: true,
      showRatios: true,
      showLengths: false,
    });
    b.studentOnly(line.action(BptAction.MoveE));
    b.standsFor(
      line,
      "a triangle ABC with AB and AC each marked in 5 equal parts; D fixed at the third mark of AB, and E which the learner slides along AC, with the two ratios shown and whether DE is parallel to BC",
    );
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(
        "Activity 3: slide E along AC until DE is parallel to BC.",
        "क्रियाकलाप 3: E को AC पर तब तक खिसकाओ जब तक DE, BC के समांतर न हो जाए।",
      ),
      isMet: line.derived(BptDerived.IsParallel).eq(true),
      solve: [line.learner(BptAction.MoveE, { by: 1 }), line.learner(BptAction.MoveE, { by: 1 })],
    });
    return column([
      w.title(t("The other way round", "उल्टी दिशा में")),
      w.definition(
        t(
          '**Converse.** The converse of "if P, then Q" is "if Q, then P". A converse may or may not be true; it has to be checked.',
          '**विलोम।** "यदि P, तो Q" का विलोम है "यदि Q, तो P"। विलोम सच भी हो सकता है और नहीं भी; उसे जाँचना पड़ता है।',
        ),
      ),
      w.body(
        t(
          "Mark both arms AB and AC in five equal parts. D is fixed at the third mark of AB. Where on AC must E go?",
          "दोनों भुजाओं AB और AC को पाँच बराबर भागों में बाँटो। D, AB के तीसरे निशान पर तय है। E को AC पर कहाँ जाना चाहिए?",
        ),
      ),
      line,
      goal,
      w.body(
        t(
          r`DE becomes parallel exactly when $$\frac{AE}{EC} = \frac{AD}{DB} = \frac{3}{2}$$ Try other marks and other angles: every time the ratios match, the line is parallel.`,
          r`DE ठीक तब समांतर होती है जब $$\frac{AE}{EC} = \frac{AD}{DB} = \frac{3}{2}$$ दूसरे निशान और दूसरे कोण आज़माओ: हर बार जब अनुपात मिलते हैं, रेखा समांतर होती है।`,
        ),
      ),
      w.definition(
        t(
          "**Theorem 6.2 (converse of BPT).** If a line divides any two sides of a triangle in the same ratio, then the line is parallel to the third side.",
          "**प्रमेय 6.2 (BPT का विलोम)।** यदि कोई रेखा किसी त्रिभुज की किन्हीं दो भुजाओं को एक ही अनुपात में बाँटे, तो वह रेखा तीसरी भुजा के समांतर होती है।",
        ),
      ),
      w.body(
        t(
          r`**Why.** Suppose AD/DB = AE/EC but DE is not parallel to BC. Draw DE′ parallel to BC, with E′ on AC. By Theorem 6.1, $$\frac{AD}{DB} = \frac{AE'}{E'C}$$ so $$\frac{AE}{EC} = \frac{AE'}{E'C}$$ Add 1 to both sides: $$\frac{AC}{EC} = \frac{AC}{E'C}$$ so EC = E′C, and E and E′ are the same point. So DE was parallel to BC after all.`,
          r`**क्यों।** मान लो AD/DB = AE/EC है पर DE, BC के समांतर नहीं है। DE′ को BC के समांतर खींचो, E′ भुजा AC पर। प्रमेय 6.1 से $$\frac{AD}{DB} = \frac{AE'}{E'C}$$ इसलिए $$\frac{AE}{EC} = \frac{AE'}{E'C}$$ दोनों पक्षों में 1 जोड़ो: $$\frac{AC}{EC} = \frac{AC}{E'C}$$ तो EC = E′C, और E तथा E′ एक ही बिंदु हैं। यानी DE, BC के समांतर ही थी।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 1 and 3. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const ex3 = choiceQuestion(b, {
      name: "ex3",
      prompt: t(
        "Example 3: PS/SQ = PT/TR and ∠PST = ∠PRQ. Which result gives ST ∥ QR?",
        "उदाहरण 3: PS/SQ = PT/TR और ∠PST = ∠PRQ। कौन-सा परिणाम ST ∥ QR देता है?",
      ),
      options: [
        { id: "right", label: t("Theorem 6.2, the converse", "प्रमेय 6.2, विलोम") },
        {
          id: "bpt",
          label: t("Theorem 6.1, the BPT itself", "प्रमेय 6.1, स्वयं BPT"),
          feedback: t(
            "Theorem 6.1 starts from a parallel line. Here we start from equal ratios and want the parallel: that's the converse.",
            "प्रमेय 6.1 समांतर रेखा से शुरू होता है। यहाँ हम बराबर अनुपातों से शुरू करके समांतर चाहते हैं: यह विलोम है।",
          ),
        },
        {
          id: "angles",
          label: t("Angle sum of a triangle", "त्रिभुज का कोण योग"),
          feedback: t(
            "The angle sum doesn't give parallel lines. The equal ratios do, by the converse.",
            "कोण योग से समांतर रेखाएँ नहीं मिलतीं। बराबर अनुपात देते हैं, विलोम से।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two examples", "दो उदाहरण")),
      figureOn(b, "ex1Figure", EXAMPLE_1),
      w.body(
        t(
          r`**Example 1.** A line meets AB and AC at D and E and is parallel to BC. Prove AD/AB = AE/AC. By Theorem 6.1: $$\frac{AD}{DB} = \frac{AE}{EC}$$ Turn both fractions upside down: $$\frac{DB}{AD} = \frac{EC}{AE}$$ Add 1 to each side: $$\frac{DB}{AD} + 1 = \frac{EC}{AE} + 1$$ Since AD + DB = AB and AE + EC = AC: $$\frac{AB}{AD} = \frac{AC}{AE}$$ Turn upside down again: $$\frac{AD}{AB} = \frac{AE}{AC}$$`,
          r`**उदाहरण 1।** एक रेखा AB और AC को D और E पर काटती है और BC के समांतर है। सिद्ध करो AD/AB = AE/AC। प्रमेय 6.1 से: $$\frac{AD}{DB} = \frac{AE}{EC}$$ दोनों भिन्नों को उलटो: $$\frac{DB}{AD} = \frac{EC}{AE}$$ हर पक्ष में 1 जोड़ो: $$\frac{DB}{AD} + 1 = \frac{EC}{AE} + 1$$ चूँकि AD + DB = AB और AE + EC = AC: $$\frac{AB}{AD} = \frac{AC}{AE}$$ फिर से उलटो: $$\frac{AD}{AB} = \frac{AE}{AC}$$`,
        ),
      ),
      figureOn(b, "ex3Figure", EXAMPLE_3),
      w.body(
        t(
          r`**Example 3.** Given PS/SQ = PT/TR and ∠PST = ∠PRQ; prove PQR is isosceles. Since the ratios are equal, ST ∥ QR. So ∠PST = ∠PQR (corresponding angles). Also ∠PST = ∠PRQ (given). So ∠PRQ = ∠PQR, and the sides opposite equal angles are equal: $$PQ = PR$$ So PQR is isosceles.`,
          r`**उदाहरण 3।** दिया है PS/SQ = PT/TR और ∠PST = ∠PRQ; सिद्ध करो PQR समद्विबाहु है। अनुपात बराबर हैं, इसलिए ST ∥ QR। तो ∠PST = ∠PQR (संगत कोण)। साथ ही ∠PST = ∠PRQ (दिया है)। तो ∠PRQ = ∠PQR, और बराबर कोणों की सम्मुख भुजाएँ बराबर होती हैं: $$PQ = PR$$ तो PQR समद्विबाहु है।`,
        ),
      ),
      ex3,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's flag stripe. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const flag = b.prop(proportionLineDef, "flag", {
      mode: BptMode.Parallel,
      ab: 5,
      ac: 7.5,
      angleA: 35,
      d: 0.6,
      e: 0.6,
      parts: 5,
      names: ["A", "B", "C", "D", "E"],
      canMoveD: false,
      canMoveE: false,
      showRatios: false,
      showLengths: true,
    });
    b.standsFor(
      flag,
      "Kabir's flag as triangle ABC with AB = 5 cm and AC = 7.5 cm, and the stripe DE parallel to BC, 3 cm down AB",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "The flag's edges are AB = 5 cm and AC = 7.5 cm. The stripe starts at D with AD = 3 cm. How far down AC must E be?",
        "झंडी के किनारे AB = 5 cm और AC = 7.5 cm हैं। पट्टी D से शुरू होती है जहाँ AD = 3 cm। E को AC पर कितना नीचे होना चाहिए?",
      ),
      options: [
        { id: "right", label: t("AE = 4.5 cm", "AE = 4.5 cm") },
        {
          id: "same",
          label: t("AE = 3 cm", "AE = 3 cm"),
          feedback: t(
            "Equal lengths would only work if AB = AC. The ratios must match: AE/AC = AD/AB = 3/5.",
            "बराबर लंबाइयाँ तभी चलतीं जब AB = AC हो। अनुपात मिलने चाहिए: AE/AC = AD/AB = 3/5।",
          ),
        },
        {
          id: "diff",
          label: t("AE = 5.5 cm", "AE = 5.5 cm"),
          feedback: t(
            "That keeps the same 2 cm gap above the bottom edge, not the same ratio. AE = 3/5 × 7.5 = 4.5 cm.",
            "यह निचले किनारे से ऊपर वही 2 cm की दूरी रखता है, वही अनुपात नहीं। AE = 3/5 × 7.5 = 4.5 cm।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        r`By Example 1, $$\frac{AE}{AC} = \frac{AD}{AB} = \frac{3}{5}$$ so $$AE = \frac{3}{5} \times 7.5 = 4.5 \text{ cm}$$ Kabir marks 4.5 cm and his stripes come out perfectly parallel. **Stop 2 done.** The same idea, two triangles sharing a corner, will measure the tank.`,
        r`उदाहरण 1 से, $$\frac{AE}{AC} = \frac{AD}{AB} = \frac{3}{5}$$ इसलिए $$AE = \frac{3}{5} \times 7.5 = 4.5 \text{ cm}$$ कबीर 4.5 cm पर निशान लगाता है और उसकी पट्टियाँ एकदम समांतर बनती हैं। **पड़ाव 2 पूरा।** यही विचार, एक कोना साझा करने वाले दो त्रिभुज, टंकी नापेगा।`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(where.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.pass()]);
    return column([w.title(t("Kabir's stripe", "कबीर की पट्टी")), flag, where, why, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6.2 Q1 and Q2; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ec = choiceQuestion(b, {
      name: "ec",
      prompt: t(
        "Exercise 6.2 Q1 (i): DE ∥ BC, AD = 1.5 cm, DB = 3 cm, AE = 1 cm. Find EC.",
        "प्रश्नावली 6.2 प्र1 (i): DE ∥ BC, AD = 1.5 cm, DB = 3 cm, AE = 1 cm। EC ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("2 cm", "2 cm") },
        {
          id: "half",
          label: t("0.5 cm", "0.5 cm"),
          feedback: t(
            "That flips the ratio. AD/DB = AE/EC, so 1.5/3 = 1/EC, and EC = 2.",
            "इससे अनुपात उलट जाता है। AD/DB = AE/EC, तो 1.5/3 = 1/EC, और EC = 2।",
          ),
        },
        {
          id: "three",
          label: t("3 cm", "3 cm"),
          feedback: t(
            "EC isn't DB: the two sides are cut in the same ratio, not into equal pieces.",
            "EC, DB नहीं है: दोनों भुजाएँ एक ही अनुपात में कटती हैं, बराबर टुकड़ों में नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const parallel = choiceQuestion(b, {
      name: "parallel",
      prompt: t(
        "Exercise 6.2 Q2 (ii): PE = 4 cm, QE = 4.5 cm, PF = 8 cm, RF = 9 cm. Is EF ∥ QR?",
        "प्रश्नावली 6.2 प्र2 (ii): PE = 4 cm, QE = 4.5 cm, PF = 8 cm, RF = 9 cm। क्या EF ∥ QR है?",
      ),
      options: [
        { id: "right", label: t("Yes: both ratios are 8/9", "हाँ: दोनों अनुपात 8/9 हैं") },
        {
          id: "no",
          label: t("No: 4 is not 8", "नहीं: 4, 8 के बराबर नहीं"),
          feedback: t(
            "The pieces needn't be equal, only the ratios: 4/4.5 = 8/9 and 8/9 = 8/9.",
            "टुकड़े बराबर होना ज़रूरी नहीं, केवल अनुपात: 4/4.5 = 8/9 और 8/9 = 8/9।",
          ),
        },
        {
          id: "cant",
          label: t("Can't tell without angles", "कोणों के बिना नहीं कह सकते"),
          feedback: t(
            "Theorem 6.2 needs only the two ratios. They match, so EF ∥ QR.",
            "प्रमेय 6.2 को केवल दो अनुपात चाहिए। वे मिलते हैं, इसलिए EF ∥ QR।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A line parallel to one side cuts the other two in the same ratio, and the other way round. ✓ The flags have their stripes. Next: when are two whole triangles similar? That's what will give the tank's height.",
        "**मिशन लॉग।** ✓ एक भुजा के समांतर रेखा बाक़ी दोनों को एक ही अनुपात में काटती है, और उल्टा भी। ✓ झंडियों पर पट्टियाँ लग गईं। आगे: दो पूरे त्रिभुज कब समरूप होते हैं? इसी से टंकी की ऊँचाई मिलेगी।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(parallel.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ec, parallel, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, activity, theorem, converse, examples, inLife, yourTurn];
