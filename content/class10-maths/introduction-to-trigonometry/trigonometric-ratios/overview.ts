import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Ratio,
  RatioReference,
  RatiosAction,
  RatiosDerived,
  TrigSceneKind,
  trigRatiosDef,
} from "@chalk/prop-trigonometry";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: kites over the old fort, and a question nobody can answer by climbing. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const fort = sceneOn(
    b,
    "fort",
    TrigSceneKind.FortHill,
    "the old fort on a hill above the town with kites flying over its tower; Kabir pointing up at a kite, Riya and Grandpa beside him",
  );
  return column([
    w.title(t("The Kite Hill", "पतंग वाली पहाड़ी")),
    fort,
    w.body(
      t(
        'Makar Sankranti is a month away. This year the family will fly kites from the old fort on the hill, the way Grandpa did when he was a boy. On a practice evening Kabir lets out his whole reel of string, squints up at his kite and asks: "How high is it, really?"',
        'मकर संक्रांति एक महीना दूर है। इस साल परिवार पहाड़ी वाले पुराने क़िले से पतंग उड़ाएगा, जैसे दादाजी बचपन में उड़ाते थे। अभ्यास वाली एक शाम कबीर अपनी पूरी चरखी की डोर छोड़ देता है, आँखें सिकोड़कर पतंग को देखता है और पूछता है: "यह असल में कितनी ऊँची है?"',
      ),
    ),
    w.body(
      t(
        "Nobody can climb a kite string. Nobody is allowed up the fort's tower either. Riya wants to know the tower's height too, and the river far below the walls looks very far away.",
        "पतंग की डोर पर कोई चढ़ नहीं सकता। क़िले की मीनार पर चढ़ने की भी इजाज़त नहीं। रिया को मीनार की ऊँचाई भी जाननी है, और दीवारों के बहुत नीचे बहती नदी बहुत दूर लगती है।",
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: angles tell you lengths. Grandpa's clinometer; the stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const clino = sceneOn(
    b,
    "clino",
    TrigSceneKind.Clinometer,
    "Grandpa's homemade clinometer: a protractor with a straw taped along its edge and a thread with a nut hanging from the centre; Grandpa sighting through the straw while the kids watch",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    clino,
    w.body(
      t(
        "Grandpa says the surveyors who measured Mount Everest never climbed it: they measured **angles**. He makes a **clinometer** from a protractor, a drinking straw and a thread with a nut tied on. Look at the top of something through the straw, and the thread shows how steeply you are looking up.",
        "दादाजी बताते हैं कि माउंट एवरेस्ट को नापने वाले सर्वेक्षक उस पर कभी चढ़े नहीं: उन्होंने **कोण** नापे थे। वे एक चाँदा, एक स्ट्रॉ और नट बँधे धागे से एक **क्लाइनोमीटर** बनाते हैं। स्ट्रॉ से किसी चीज़ के ऊपरी सिरे को देखो, और धागा बताता है कि तुम कितनी ढलान से ऊपर देख रहे हो।",
      ),
    ),
    w.body(
      t(
        "But an angle is not a length. To turn one into the other you need **trigonometry**: the study of the relations between the sides and the angles of a triangle. The word comes from Greek: *tri* (three), *gon* (sides), *metron* (measure).",
        "पर कोण कोई लंबाई नहीं है। एक को दूसरे में बदलने के लिए **त्रिकोणमिति** चाहिए: त्रिभुज की भुजाओं और कोणों के बीच के संबंधों का अध्ययन। यह शब्द यूनानी से आया है: *ट्राई* (तीन), *गॉन* (भुजाएँ), *मेट्रॉन* (माप)।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** This chapter builds the tool. (1) The six trigonometric ratios: *this lesson*. (2) All the ratios from just one. (3) The ratios of 0°, 30°, 45°, 60° and 90°: Riya's ratio card. (4) Complementary angles. (5) Identities, and the card is complete. The next chapter is festival day on the hill: (6) heights from angles of elevation, (7) angles of depression, (8) two sightings, (9) the river from above.",
        "**रास्ते के पड़ाव।** यह अध्याय औज़ार बनाता है। (1) छह त्रिकोणमितीय अनुपात: *यह पाठ*। (2) केवल एक अनुपात से सारे अनुपात। (3) 0°, 30°, 45°, 60° और 90° के अनुपात: रिया का अनुपात-कार्ड। (4) पूरक कोण। (5) सर्वसमिकाएँ, और कार्ड पूरा। अगला अध्याय पहाड़ी पर त्योहार का दिन है: (6) उन्नयन कोण से ऊँचाइयाँ, (7) अवनमन कोण, (8) दो बार देखना, (9) ऊपर से नदी।",
      ),
    ),
    w.body(
      t(
        "First stop: inside a right triangle, what exactly can an angle tell us about the sides?",
        "पहला पड़ाव: एक समकोण त्रिभुज के अंदर, कोई कोण भुजाओं के बारे में ठीक-ठीक क्या बता सकता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Right triangle words; opposite, adjacent and hypotenuse relative to an acute angle; swapping. */
const sides = page(
  "sides",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      angle: 35,
      size: 8,
      shown: [],
      showSides: true,
      showValues: false,
      canSetAngle: false,
      canScale: false,
      canSwap: true,
    });
    b.studentOnly(tri.action(RatiosAction.Swap));
    b.standsFor(
      tri,
      "a right triangle ABC, right-angled at B, with each side labelled opposite, adjacent or hypotenuse relative to the chosen acute angle; a button swaps the chosen angle between A and C",
    );
    const goal = goalQuestion(b, {
      about: tri,
      prompt: t(
        "Swap the angle to C. Which two labels trade places?",
        "कोण बदलकर C करो। कौन-से दो नाम आपस में जगह बदलते हैं?",
      ),
      isMet: tri.field("reference").eq(RatioReference.C),
      solve: [tri.learner(RatiosAction.Swap, {})],
    });
    const after = w.body(
      t(
        'Opposite and adjacent swap; the hypotenuse stays the hypotenuse. BC was opposite A, and it is adjacent to C. So the names "opposite" and "adjacent" only make sense once you say **which angle** you mean.',
        'सम्मुख और संलग्न आपस में बदल जाते हैं; कर्ण कर्ण ही रहता है। BC, A के सम्मुख था, और C के संलग्न है। तो "सम्मुख" और "संलग्न" नामों का तभी मतलब है जब तुम बताओ कि **कौन-सा कोण** ले रहे हो।',
      ),
      "after",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(after));
    return column([
      w.title(t("Sides, named from an angle", "किसी कोण से भुजाओं के नाम")),
      w.definition(
        t(
          "**Right triangle words.** In ∆ ABC right-angled at B, the side AC opposite the right angle is the **hypotenuse**, the longest side. The other two angles, A and C, are **acute**: less than 90°.",
          "**समकोण त्रिभुज के शब्द।** ∆ ABC में, जो B पर समकोण है, समकोण के सामने वाली भुजा AC **कर्ण** है, सबसे लंबी भुजा। बाक़ी दो कोण, A और C, **न्यून** हैं: 90° से कम।",
        ),
      ),
      w.definition(
        t(
          "**Opposite and adjacent.** Pick an acute angle, say A. The side across from it, BC, is the **side opposite** to angle A. The other side that touches A, AB, is the **side adjacent** to angle A.",
          "**सम्मुख और संलग्न।** कोई न्यून कोण चुनो, जैसे A। उसके सामने वाली भुजा, BC, कोण A की **सम्मुख भुजा** है। A को छूने वाली दूसरी भुजा, AB, कोण A की **संलग्न भुजा** है।",
        ),
      ),
      tri,
      goal,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The six ratios, their reciprocals, tan = sin/cos, and "sin A is not sin × A". */
const ratios = page(
  "ratios",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      angle: 35,
      size: 8,
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan],
      showSides: true,
      showValues: true,
      canSetAngle: true,
      canScale: false,
    });
    b.studentOnly(tri.action(RatiosAction.NudgeAngle));
    b.standsFor(
      tri,
      "the right triangle ABC with sin, cos and tan of angle A listed as side ÷ side with their values; the learner can turn angle A",
    );
    const cos = choiceQuestion(b, {
      name: "cos",
      prompt: t(
        "In ∆ ABC, right-angled at B, which fraction is cos A?",
        "∆ ABC में, जो B पर समकोण है, कौन-सी भिन्न cos A है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{AB}{AC}$`, r`$\dfrac{AB}{AC}$`) },
        {
          id: "sin",
          label: t(r`$\dfrac{BC}{AC}$`, r`$\dfrac{BC}{AC}$`),
          feedback: t(
            "BC is opposite A, so BC/AC is sin A. Cosine uses the adjacent side, AB.",
            "BC, A के सम्मुख है, इसलिए BC/AC, sin A है। कोसाइन संलग्न भुजा AB लेता है।",
          ),
        },
        {
          id: "tan",
          label: t(r`$\dfrac{BC}{AB}$`, r`$\dfrac{BC}{AB}$`),
          feedback: t(
            "Opposite over adjacent is tan A. Cosine is adjacent over hypotenuse: AB/AC.",
            "सम्मुख बटा संलग्न tan A है। कोसाइन संलग्न बटा कर्ण है: AB/AC।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Three ratios", "तीन अनुपात")),
      w.definition(
        t(
          r`**The trigonometric ratios of angle A** in ∆ ABC, right-angled at B: $$\sin A = \dfrac{BC}{AC} = \dfrac{\text{opposite}}{\text{hypotenuse}}$$ $$\cos A = \dfrac{AB}{AC} = \dfrac{\text{adjacent}}{\text{hypotenuse}}$$ $$\tan A = \dfrac{BC}{AB} = \dfrac{\text{opposite}}{\text{adjacent}}$$ We say "sine A", "cosine A" and "tangent A".`,
          r`**कोण A के त्रिकोणमितीय अनुपात** ∆ ABC में, जो B पर समकोण है: $$\sin A = \dfrac{BC}{AC} = \dfrac{\text{सम्मुख}}{\text{कर्ण}}$$ $$\cos A = \dfrac{AB}{AC} = \dfrac{\text{संलग्न}}{\text{कर्ण}}$$ $$\tan A = \dfrac{BC}{AB} = \dfrac{\text{सम्मुख}}{\text{संलग्न}}$$ इन्हें "साइन A", "कोसाइन A" और "टैंजेंट A" पढ़ते हैं।`,
        ),
      ),
      tri,
      w.note(
        t(
          '**sin A is one symbol.** It means the sine of the angle A. It is not "sin" multiplied by A: "sin" on its own means nothing.',
          '**sin A एक ही चिह्न है।** इसका अर्थ है कोण A की साइन। यह "sin" गुणा A नहीं है: अकेले "sin" का कोई अर्थ नहीं।',
        ),
      ),
      cos,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The three reciprocals, and tan A = sin A / cos A. */
const reciprocals = page(
  "reciprocals",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      angle: 35,
      size: 8,
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan, Ratio.Cosec, Ratio.Sec, Ratio.Cot],
      showSides: true,
      showValues: true,
      canSetAngle: true,
      canScale: false,
    });
    b.studentOnly(tri.action(RatiosAction.NudgeAngle));
    b.standsFor(
      tri,
      "the right triangle ABC with all six ratios of angle A listed as side ÷ side with their values; the learner can turn angle A",
    );
    const tan = choiceQuestion(b, {
      name: "tan",
      prompt: t("Which of these is equal to tan A?", "इनमें से कौन tan A के बराबर है?"),
      options: [
        { id: "right", label: t(r`$\dfrac{\sin A}{\cos A}$`, r`$\dfrac{\sin A}{\cos A}$`) },
        {
          id: "flip",
          label: t(r`$\dfrac{\cos A}{\sin A}$`, r`$\dfrac{\cos A}{\sin A}$`),
          feedback: t(
            "That is adjacent ÷ opposite, which is cot A, the reciprocal of tan A.",
            "यह संलग्न ÷ सम्मुख है, यानी cot A, जो tan A का व्युत्क्रम है।",
          ),
        },
        {
          id: "times",
          label: t(r`$\sin A \times \cos A$`, r`$\sin A \times \cos A$`),
          feedback: t(
            "Multiplying gives (BC × AB) ÷ AC², not BC ÷ AB. Divide sin A by cos A instead.",
            "गुणा करने से (BC × AB) ÷ AC² मिलता है, BC ÷ AB नहीं। इसके बजाय sin A को cos A से भाग दो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Three more, upside down", "तीन और, उलटे")),
      w.definition(
        t(
          r`**The reciprocals.** Turning each ratio upside down gives three more: $$\operatorname{cosec} A = \dfrac{1}{\sin A}$$ $$\sec A = \dfrac{1}{\cos A}$$ $$\cot A = \dfrac{1}{\tan A}$$ (cosecant, secant, cotangent). Also, dividing sin A by cos A, the AC cancels: $$\tan A = \dfrac{\sin A}{\cos A}, \quad \cot A = \dfrac{\cos A}{\sin A}$$`,
          r`**व्युत्क्रम।** हर अनुपात को उलटने से तीन और मिलते हैं: $$\operatorname{cosec} A = \dfrac{1}{\sin A}$$ $$\sec A = \dfrac{1}{\cos A}$$ $$\cot A = \dfrac{1}{\tan A}$$ (कोसेकेंट, सेकेंट, कोटैंजेंट)। साथ ही, sin A को cos A से भाग देने पर AC कट जाता है: $$\tan A = \dfrac{\sin A}{\cos A}, \quad \cot A = \dfrac{\cos A}{\sin A}$$`,
        ),
      ),
      tri,
      tan,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fig 8.6: the same angle in a bigger triangle gives the same ratios. */
const sizes = page(
  "sizes",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      angle: 35,
      size: 6,
      sizeStep: 2,
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan],
      showSides: true,
      showValues: true,
      canSetAngle: false,
      canScale: true,
    });
    b.studentOnly(tri.action(RatiosAction.NudgeSize));
    b.standsFor(
      tri,
      "the right triangle with its side lengths and sin, cos and tan of angle A; the learner scales the whole triangle, keeping its angles",
    );
    const grow = goalQuestion(b, {
      about: tri,
      prompt: t(
        "Make the triangle as big as it goes, without changing angle A. Watch sin A.",
        "कोण A बदले बिना त्रिभुज को जितना हो सके बड़ा करो। sin A को देखते रहो।",
      ),
      isMet: tri.field("size").eq(12),
      solve: Array.from({ length: 3 }, () => tri.learner(RatiosAction.NudgeSize, { by: 1 })),
    });
    const why = w.body(
      t(
        r`Every side doubled, but the ratios didn't move. Two right triangles with the same angle A are similar (AA, from the Triangles chapter), so their sides are in one ratio. Call the bigger triangle AB′C′ (B and C moved out to B′ and C′; A stays). Then $$\dfrac{BC}{AC} = \dfrac{B'C'}{AC'}$$ So **the ratios depend only on the angle**, not on the size of the triangle.`,
        r`हर भुजा दुगुनी हो गई, पर अनुपात नहीं हिले। एक ही कोण A वाले दो समकोण त्रिभुज समरूप हैं (AA, त्रिभुज वाले अध्याय से), इसलिए उनकी भुजाएँ एक अनुपात में हैं। बड़े त्रिभुज को AB′C′ कहो (B और C खिसककर B′ और C′ पर गए; A वहीं रहा)। तब $$\dfrac{BC}{AC} = \dfrac{B'C'}{AC'}$$ इसलिए **अनुपात केवल कोण पर निर्भर करते हैं**, त्रिभुज के माप पर नहीं।`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(grow.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Size doesn't matter", "माप से फ़र्क़ नहीं पड़ता")),
      w.body(
        t(
          "Does a bigger triangle with the same angle have bigger ratios? Try it.",
          "क्या उसी कोण वाले बड़े त्रिभुज के अनुपात बड़े होते हैं? आज़माकर देखो।",
        ),
      ),
      tri,
      grow,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A different angle gives different ratios; at 45° tan A = 1. */
const angle = page(
  "angle",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      angle: 35,
      size: 8,
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan],
      showSides: true,
      showValues: true,
      canSetAngle: true,
      canScale: false,
    });
    b.studentOnly(tri.action(RatiosAction.NudgeAngle));
    b.standsFor(
      tri,
      "the right triangle with sin, cos and tan of angle A; the learner turns angle A",
    );
    const turn = goalQuestion(b, {
      about: tri,
      prompt: t(
        "Turn angle A to 45°. What happens to the two shorter sides, and to tan A?",
        "कोण A को 45° तक घुमाओ। दोनों छोटी भुजाओं का, और tan A का क्या होता है?",
      ),
      isMet: tri.derived(RatiosDerived.Angle).eq(45),
      solve: Array.from({ length: 2 }, () => tri.learner(RatiosAction.NudgeAngle, { by: 1 })),
    });
    const why = w.body(
      t(
        "A different angle gives a different shape, so different ratios: as A grows, sin A grows and cos A shrinks. At 45° the two shorter sides are equal, so tan 45° = 1. One angle, one set of ratios.",
        "अलग कोण से अलग आकार बनता है, इसलिए अलग अनुपात: A बढ़ने पर sin A बढ़ता है और cos A घटता है। 45° पर दोनों छोटी भुजाएँ बराबर होती हैं, इसलिए tan 45° = 1। एक कोण, अनुपातों का एक ही सेट।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(turn.on(QuestionSignal.Correct), theBoard.show(why));
    return column([w.title(t("The angle decides", "कोण तय करता है")), tri, turn, why, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Notation: sin²A, θ; where the word "sine" came from (Aryabhata). */
const notation = page(
  "notation",
  (b) => {
    const w = wordsOn(b);
    const square = choiceQuestion(b, {
      name: "square",
      prompt: t(r`What does $\sin^2 A$ mean?`, r`$\sin^2 A$ का क्या अर्थ है?`),
      options: [
        {
          id: "right",
          label: t(r`$(\sin A)^2$, the sine squared`, r`$(\sin A)^2$, साइन का वर्ग`),
        },
        {
          id: "angle",
          label: t(r`$\sin (A^2)$, the sine of A squared`, r`$\sin (A^2)$, A के वर्ग की साइन`),
          feedback: t(
            'The 2 is written on "sin", so it squares the sine, not the angle.',
            '2 "sin" पर लिखा है, इसलिए यह साइन का वर्ग करता है, कोण का नहीं।',
          ),
        },
        {
          id: "double",
          label: t(r`$\sin 2A$, the sine of twice A`, r`$\sin 2A$, A के दुगुने की साइन`),
          feedback: t(
            "sin 2A is a different angle's sine. sin²A is (sin A) × (sin A).",
            "sin 2A किसी दूसरे कोण की साइन है। sin²A = (sin A) × (sin A)।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A little notation", "थोड़ा-सा संकेत")),
      w.definition(
        t(
          r`**Powers of a ratio.** We write $(\sin A)^2$ as $\sin^2 A$, and $(\cos A)^2$ as $\cos^2 A$. Angles are often named with Greek letters too, such as θ (theta): sin θ, cos θ.`,
          r`**अनुपात की घात।** $(\sin A)^2$ को हम $\sin^2 A$ लिखते हैं, और $(\cos A)^2$ को $\cos^2 A$। कोणों को अक्सर यूनानी अक्षरों से भी नाम देते हैं, जैसे θ (थीटा): sin θ, cos θ।`,
        ),
      ),
      w.note(
        t(
          '**Where "sine" comes from.** Aryabhata (476–550 CE) used the word *ardha-jya*, half-chord, which became *jya*. Arab writers carried it as *jiba*, it was read as *jaib*, and when that was put into Latin it became *sinus*, then sine. The words cosine and tangent came much later.',
          '**"साइन" कहाँ से आया।** आर्यभट (476–550 ई.) ने *अर्ध-ज्या* शब्द इस्तेमाल किया, जो *ज्या* बना। अरब लेखकों ने इसे *जिबा* लिखा, जिसे *जैब* पढ़ा गया, और लैटिन में अनुवाद होकर यह *साइनस* बना, फिर साइन। कोसाइन और टैंजेंट शब्द बहुत बाद में आए।',
        ),
      ),
      square,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's kite string as a right triangle: same angle, longer string, same height ÷ string. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const kite = sceneOn(
      b,
      "kite",
      TrigSceneKind.KiteFlying,
      "Kabir flying a kite from the fort wall, the taut string, the kite's height and the ground beneath forming a right triangle",
    );
    const string = choiceQuestion(b, {
      name: "string",
      prompt: t(
        "Kabir's kite is 30 m up on 60 m of string. He lets out string to 120 m, and the string makes the same angle with the ground. How high is the kite now?",
        "कबीर की पतंग 60 m डोर पर 30 m ऊँची है। वह डोर 120 m तक छोड़ता है, और डोर ज़मीन से वही कोण बनाती है। अब पतंग कितनी ऊँची है?",
      ),
      options: [
        {
          id: "right",
          label: t("60 m, the same ratio of height to string", "60 m, ऊँचाई और डोर का वही अनुपात"),
        },
        {
          id: "add",
          label: t("90 m, the extra 60 m of string added on", "90 m, बढ़ी हुई 60 m डोर जोड़कर"),
          feedback: t(
            "The extra string goes along the slope, not straight up. Same angle means height ÷ string stays 30 ÷ 60 = 1/2.",
            "बढ़ी हुई डोर ढलान के साथ जाती है, सीधे ऊपर नहीं। वही कोण होने से ऊँचाई ÷ डोर 30 ÷ 60 = 1/2 ही रहता है।",
          ),
        },
        {
          id: "same",
          label: t("30 m, as the angle has not changed", "30 m, क्योंकि कोण नहीं बदला"),
          feedback: t(
            "The ratio stays the same, not the height. Half of 120 m is 60 m.",
            "अनुपात वही रहता है, ऊँचाई नहीं। 120 m का आधा 60 m है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        "The string, the height and the ground make a right triangle. Height ÷ string is the **sine** of the string's angle with the ground, and it depends only on that angle. So if Riya can measure the angle and knows the sine of it, the string's length gives the height. **Stop 1 done.** But she still needs the sine of each angle she measures.",
        "डोर, ऊँचाई और ज़मीन एक समकोण त्रिभुज बनाते हैं। ऊँचाई ÷ डोर, ज़मीन के साथ डोर के कोण की **साइन** है, और यह केवल उस कोण पर निर्भर है। तो अगर रिया कोण नाप सके और उसकी साइन जानती हो, तो डोर की लंबाई से ऊँचाई मिल जाएगी। **पड़ाव 1 पूरा।** पर उसे हर नापे गए कोण की साइन अभी भी चाहिए।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(string.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("The kite string", "पतंग की डोर")), kite, string, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 8.1 Q11: true or false; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const tanBig = choiceQuestion(b, {
      name: "tanBig",
      prompt: t(
        "Exercise 8.1 Q11 (i): the value of tan A is always less than 1. True or false?",
        "प्रश्नावली 8.1 प्र11 (i): tan A का मान हमेशा 1 से कम होता है। सत्य या असत्य?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "False: opposite can be longer than adjacent",
            "असत्य: सम्मुख, संलग्न से लंबी हो सकती है",
          ),
        },
        {
          id: "true",
          label: t("True: tan A is a ratio of two sides", "सत्य: tan A दो भुजाओं का अनुपात है"),
          feedback: t(
            "A ratio of sides can be bigger than 1. Turn A past 45°: BC grows longer than AB and tan A goes past 1.",
            "भुजाओं का अनुपात 1 से बड़ा हो सकता है। A को 45° से आगे घुमाओ: BC, AB से लंबी हो जाती है और tan A 1 से आगे निकल जाता है।",
          ),
        },
        {
          id: "hyp",
          label: t(
            "True: no side is longer than the hypotenuse",
            "सत्य: कोई भुजा कर्ण से लंबी नहीं होती",
          ),
          feedback: t(
            "That is why sin and cos stay below 1. tan doesn't use the hypotenuse at all.",
            "इसी कारण sin और cos 1 से कम रहते हैं। tan में कर्ण आता ही नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const sinBig = choiceQuestion(b, {
      name: "sinBig",
      prompt: t(
        r`Exercise 8.1 Q11 (v): $\sin \theta = \tfrac{4}{3}$ for some angle θ. True or false?`,
        r`प्रश्नावली 8.1 प्र11 (v): किसी कोण θ के लिए $\sin \theta = \tfrac{4}{3}$। सत्य या असत्य?`,
      ),
      options: [
        {
          id: "right",
          label: t("False: the hypotenuse is the longest side", "असत्य: कर्ण सबसे लंबी भुजा है"),
        },
        {
          id: "true",
          label: t("True: take opposite 4 and hypotenuse 3", "सत्य: सम्मुख 4 और कर्ण 3 लो"),
          feedback: t(
            "No right triangle has a side longer than its hypotenuse, so opposite ÷ hypotenuse can't pass 1.",
            "किसी समकोण त्रिभुज की कोई भुजा कर्ण से लंबी नहीं होती, इसलिए सम्मुख ÷ कर्ण 1 से आगे नहीं जा सकता।",
          ),
        },
        {
          id: "big",
          label: t("True: if θ is close to 90°", "सत्य: अगर θ, 90° के क़रीब हो"),
          feedback: t(
            "Near 90° sin θ gets close to 1, but never past it.",
            "90° के पास sin θ, 1 के क़रीब पहुँचता है, पर उससे आगे कभी नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const cot = choiceQuestion(b, {
      name: "cot",
      prompt: t(
        "Exercise 8.1 Q11 (iv): cot A is the product of cot and A. True or false?",
        "प्रश्नावली 8.1 प्र11 (iv): cot A, cot और A का गुणनफल है। सत्य या असत्य?",
      ),
      options: [
        { id: "right", label: t("False: cot A is one symbol", "असत्य: cot A एक ही चिह्न है") },
        {
          id: "true",
          label: t("True: it is written next to A", "सत्य: यह A के बग़ल में लिखा है"),
          feedback: t(
            'Written side by side doesn\'t mean multiplied here. "cot" alone means nothing.',
            'यहाँ साथ-साथ लिखने का मतलब गुणा नहीं। अकेले "cot" का कोई अर्थ नहीं।',
          ),
        },
        {
          id: "half",
          label: t("True: only for whole-number A", "सत्य: केवल पूर्ण संख्या वाले A के लिए"),
          feedback: t(
            "No angle makes it a product. cot A is adjacent ÷ opposite for the angle A.",
            "कोई भी कोण इसे गुणनफल नहीं बनाता। cot A, कोण A के लिए संलग्न ÷ सम्मुख है।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Opposite, adjacent and hypotenuse, named from an angle. ✓ The six ratios. ✓ They depend only on the angle. Next stop: if you know just one ratio, can you find all the others?",
        "**मिशन लॉग।** ✓ सम्मुख, संलग्न और कर्ण, किसी कोण से नाम। ✓ छह अनुपात। ✓ ये केवल कोण पर निर्भर करते हैं। अगला पड़ाव: अगर केवल एक अनुपात पता हो, तो क्या बाक़ी सब मिल सकते हैं?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(cot.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), tanBig, sinBig, cot, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [
  hook,
  why,
  sides,
  ratios,
  reciprocals,
  sizes,
  angle,
  notation,
  inLife,
  yourTurn,
];
