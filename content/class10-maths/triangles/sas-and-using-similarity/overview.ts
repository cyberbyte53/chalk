import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  MatchAction,
  MatchDerived,
  MatchEdit,
  ShadowAction,
  ShadowMode,
  ShadowObject,
  TrianglesSceneKind,
  oppositeSide,
  shadowHeightDef,
  triangleMatchDef,
} from "@chalk/prop-triangles";
import { EXAMPLE_4, EXAMPLE_6, EXAMPLE_8 } from "../figures";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The tank, a stick and a sunny afternoon. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stick = sceneOn(
    b,
    "stick",
    TrianglesSceneKind.StickShadow,
    "a sunny afternoon by the tank: Riya holding a stick upright and marking its shadow, Kabir stretching a tape along the tank's long shadow",
  );
  return column([
    w.title(t("Measuring what you can't reach", "जहाँ पहुँच नहीं, उसे नापना")),
    stick,
    w.body(
      t(
        "A sunny afternoon. Riya stands a 1.5 m stick upright next to the tank and Kabir runs a tape along the ground. The stick's shadow is 1 m long. The tank's shadow is 10 m long. Grandpa, watching: \"And how does that tell you the height?\"",
        'धूप वाली दोपहर। रिया टंकी के पास 1.5 m की छड़ी सीधी खड़ी करती है और कबीर ज़मीन पर फ़ीता फैलाता है। छड़ी की छाया 1 m लंबी है। टंकी की छाया 10 m लंबी है। दादाजी देखते हुए: "और इससे ऊँचाई कैसे पता चलेगी?"',
      ),
    ),
    w.body(
      t(
        "First, one more test for similar triangles; then the tank.",
        "पहले, समरूप त्रिभुजों की एक और कसौटी; फिर टंकी।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 6 and Theorem 6.5: SAS similarity. */
const sas = page(
  "sas",
  (b) => {
    const w = wordsOn(b);
    const pair = b.prop(triangleMatchDef, "pair", {
      first: { ab: 2, ca: 4, bc: oppositeSide(2, 4, 50) },
      second: { ab: 3, ca: 6, bc: oppositeSide(3, 6, 60) },
      edit: MatchEdit.Sas,
      step: 0.5,
      names: ["A", "B", "C", "D", "E", "F"],
      showSides: true,
      showAngles: true,
      showRatios: true,
      showVerdict: true,
    });
    b.studentOnly(pair.action(MatchAction.NudgeAngle));
    b.studentOnly(pair.action(MatchAction.NudgeSide));
    b.standsFor(
      pair,
      "triangle ABC with AB = 2 cm, AC = 4 cm and ∠A = 50°, and triangle DEF with DE = 3 cm and DF = 6 cm whose angle D the learner can open or close, with angles and ratios shown",
    );
    const goal = goalQuestion(b, {
      about: pair,
      prompt: t(
        "Activity 6: AB/DE = AC/DF = 2/3 already. Change ∠D until it equals ∠A = 50°.",
        "क्रियाकलाप 6: AB/DE = AC/DF = 2/3 पहले से है। ∠D को तब तक बदलो जब तक वह ∠A = 50° के बराबर न हो।",
      ),
      isMet: pair.derived(MatchDerived.IsSimilar).eq(true),
      solve: [
        pair.learner(MatchAction.NudgeAngle, { at: 0, by: -1 }),
        pair.learner(MatchAction.NudgeAngle, { at: 0, by: -1 }),
      ],
    });
    return column([
      w.title(t("Two sides and the angle between", "दो भुजाएँ और उनके बीच का कोण")),
      w.definition(
        t(
          "**Included angle.** The angle between two sides, at the corner where they meet, is the angle **included** by them. In triangle ABC, ∠A is included by AB and AC.",
          "**अंतर्गत कोण।** दो भुजाओं के बीच का कोण, उस कोने पर जहाँ वे मिलती हैं, उनके द्वारा **अंतर्गत** कोण है। त्रिभुज ABC में ∠A, भुजाओं AB और AC का अंतर्गत कोण है।",
        ),
      ),
      w.body(
        t(
          "Activity 6. AB = 2 cm, AC = 4 cm, ∠A = 50°; DE = 3 cm, DF = 6 cm. The two pairs of sides are already in one ratio.",
          "क्रियाकलाप 6। AB = 2 cm, AC = 4 cm, ∠A = 50°; DE = 3 cm, DF = 6 cm। भुजाओं के दोनों जोड़े पहले से एक अनुपात में हैं।",
        ),
      ),
      pair,
      goal,
      w.body(
        t(
          "With ∠D = ∠A, the other angles match too, ∠B = ∠E and ∠C = ∠F, and the third sides come out in the same ratio 2/3.",
          "∠D = ∠A होने पर बाक़ी कोण भी मिल जाते हैं, ∠B = ∠E और ∠C = ∠F, और तीसरी भुजाएँ भी उसी अनुपात 2/3 में आ जाती हैं।",
        ),
      ),
      w.definition(
        t(
          "**Theorem 6.5 (SAS similarity).** If one angle of a triangle is equal to one angle of another triangle and the sides including these angles are proportional, then the two triangles are similar.",
          "**प्रमेय 6.5 (SAS समरूपता)।** यदि एक त्रिभुज का एक कोण दूसरे त्रिभुज के एक कोण के बराबर हो और इन कोणों को अंतर्गत करने वाली भुजाएँ समानुपाती हों, तो दोनों त्रिभुज समरूप होते हैं।",
        ),
      ),
      w.note(
        t(
          "The three tests: **AA** (two angles), **SSS** (three sides in one ratio), **SAS** (two sides in one ratio and the angle between them equal).",
          "तीन कसौटियाँ: **AA** (दो कोण), **SSS** (एक अनुपात में तीन भुजाएँ), **SAS** (एक अनुपात में दो भुजाएँ और उनके बीच का कोण बराबर)।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 4 and 6: picking the right test. */
const choosing = page(
  "choosing",
  (b) => {
    const w = wordsOn(b);
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Example 6: OA·OB = OC·OD, and AB, CD cross at O. Which test proves ∆ AOD ~ ∆ COB?",
        "उदाहरण 6: OA·OB = OC·OD, और AB, CD बिंदु O पर काटती हैं। कौन-सी कसौटी ∆ AOD ~ ∆ COB सिद्ध करती है?",
      ),
      options: [
        { id: "right", label: t("SAS", "SAS") },
        {
          id: "aa",
          label: t("AA", "AA"),
          feedback: t(
            "We only know one angle pair (vertically opposite at O). With two sides in a ratio around it, that's SAS.",
            "हमें केवल एक कोण-जोड़ा पता है (O पर शीर्षाभिमुख)। उसके दोनों ओर अनुपात वाली दो भुजाओं के साथ यह SAS है।",
          ),
        },
        {
          id: "sss",
          label: t("SSS", "SSS"),
          feedback: t(
            "We know nothing about AD and CB. Two sides and the included angle: SAS.",
            "AD और CB के बारे में हमें कुछ पता नहीं। दो भुजाएँ और अंतर्गत कोण: SAS।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Choosing a test", "कसौटी चुनना")),
      figureOn(b, "ex4", EXAMPLE_4),
      w.body(
        t(
          r`**Example 4.** PQ ∥ RS, and PS and QR cross at O; prove ∆ POQ ~ ∆ SOR. Since PQ ∥ RS: $$\angle P = \angle S, \quad \angle Q = \angle R \quad \text{(alternate angles)}$$ $$\angle POQ = \angle SOR \quad \text{(vertically opposite angles)}$$ So by AAA, $$\triangle POQ \sim \triangle SOR$$`,
          r`**उदाहरण 4।** PQ ∥ RS, और PS तथा QR बिंदु O पर काटती हैं; सिद्ध करो ∆ POQ ~ ∆ SOR। चूँकि PQ ∥ RS: $$\angle P = \angle S, \quad \angle Q = \angle R \quad \text{(एकांतर कोण)}$$ $$\angle POQ = \angle SOR \quad \text{(शीर्षाभिमुख कोण)}$$ तो AAA से, $$\triangle POQ \sim \triangle SOR$$`,
        ),
      ),
      figureOn(b, "ex6", EXAMPLE_6),
      w.body(
        t(
          r`**Example 6.** Given OA·OB = OC·OD. Divide both sides by OC·OB: $$\frac{OA}{OC} = \frac{OD}{OB} \quad (1)$$ $$\angle AOD = \angle COB \quad \text{(vertically opposite)} \quad (2)$$ From (1) and (2), by SAS: $$\triangle AOD \sim \triangle COB$$ so ∠A = ∠C and ∠D = ∠B (corresponding angles of similar triangles).`,
          r`**उदाहरण 6।** दिया है OA·OB = OC·OD। दोनों पक्षों को OC·OB से भाग दो: $$\frac{OA}{OC} = \frac{OD}{OB} \quad (1)$$ $$\angle AOD = \angle COB \quad \text{(शीर्षाभिमुख)} \quad (2)$$ (1) और (2) से, SAS द्वारा: $$\triangle AOD \sim \triangle COB$$ इसलिए ∠A = ∠C और ∠D = ∠B (समरूप त्रिभुजों के संगत कोण)।`,
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 7: a shadow under a street lamp, by AA. */
const lamp = page(
  "lamp",
  (b) => {
    const w = wordsOn(b);
    const walk = b.prop(shadowHeightDef, "walk", {
      mode: ShadowMode.Lamp,
      object: ShadowObject.Pole,
      lampHeight: 3.6,
      personHeight: 0.9,
      distance: 0,
      walkStep: 1.2,
      step: 0,
      canMove: true,
      canStep: true,
    });
    b.studentOnly(walk.action(ShadowAction.Walk));
    b.studentOnly(walk.action(ShadowAction.Next));
    b.standsFor(
      walk,
      "a lamp-post 3.6 m tall and a girl 90 cm tall walking away from its foot, 1.2 m each second; her shadow on the ground and the two similar triangles it makes, with working the learner can reveal",
    );
    const goal = goalQuestion(b, {
      about: walk,
      prompt: t(
        "Example 7: the girl walks away at 1.2 m each second. Walk her for 4 seconds.",
        "उदाहरण 7: लड़की हर सेकंड 1.2 m दूर चलती है। उसे 4 सेकंड चलाओ।",
      ),
      isMet: walk.field("distance").eq(4.8),
      solve: Array.from({ length: 4 }, () => walk.learner(ShadowAction.Walk, { by: 1 })),
    });
    return column([
      w.title(t("A shadow under a lamp", "लैंप के नीचे छाया")),
      w.body(
        t(
          "**Example 7.** A girl 90 cm tall walks away from the base of a lamp-post at 1.2 m/s. The lamp is 3.6 m above the ground. How long is her shadow after 4 seconds?",
          "**उदाहरण 7।** 90 cm लंबी एक लड़की एक लैंप-पोस्ट के आधार से 1.2 m/s की चाल से दूर चलती है। लैंप ज़मीन से 3.6 m ऊपर है। 4 सेकंड बाद उसकी छाया कितनी लंबी है?",
        ),
      ),
      walk,
      goal,
      w.body(
        t(
          r`Let AB be the lamp-post, CD the girl and DE her shadow, x m. She has walked BD = 1.2 × 4 = 4.8 m. In ∆ ABE and ∆ CDE: $$\angle B = \angle D = 90^\circ \quad \text{(both stand upright)}$$ $$\angle E = \angle E \quad \text{(the same angle)}$$ So by AA, ∆ ABE ~ ∆ CDE, and $$\frac{BE}{DE} = \frac{AB}{CD}$$ With 90 cm = 0.9 m: $$\frac{4.8 + x}{x} = \frac{3.6}{0.9} = 4$$ $$4.8 + x = 4x$$ $$3x = 4.8$$ $$x = 1.6$$ Her shadow is 1.6 m long.`,
          r`मान लो AB लैंप-पोस्ट है, CD लड़की और DE उसकी छाया, x m। वह BD = 1.2 × 4 = 4.8 m चल चुकी है। ∆ ABE और ∆ CDE में: $$\angle B = \angle D = 90^\circ \quad \text{(दोनों सीधे खड़े हैं)}$$ $$\angle E = \angle E \quad \text{(वही कोण)}$$ तो AA से ∆ ABE ~ ∆ CDE, और $$\frac{BE}{DE} = \frac{AB}{CD}$$ 90 cm = 0.9 m लेकर: $$\frac{4.8 + x}{x} = \frac{3.6}{0.9} = 4$$ $$4.8 + x = 4x$$ $$3x = 4.8$$ $$x = 1.6$$ उसकी छाया 1.6 m लंबी है।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 8, worked: medians of similar triangles. */
const medians = page(
  "medians",
  (b) => {
    const w = wordsOn(b);
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t("In Example 8 (i), why is AM/PN = AB/PQ?", "उदाहरण 8 (i) में AM/PN = AB/PQ क्यों है?"),
      options: [
        {
          id: "right",
          label: t("AM = ½ AB and PN = ½ PQ", "AM = ½ AB और PN = ½ PQ"),
        },
        {
          id: "equal",
          label: t("AM and PN are equal lengths", "AM और PN बराबर लंबाई के हैं"),
          feedback: t(
            "They aren't equal; the triangles are different sizes. Each is half its side, so their ratio is the sides' ratio.",
            "वे बराबर नहीं हैं; त्रिभुजों के माप अलग हैं। हर एक अपनी भुजा का आधा है, इसलिए उनका अनुपात भुजाओं का अनुपात है।",
          ),
        },
        {
          id: "perp",
          label: t("CM and RN are perpendicular", "CM और RN लंब हैं"),
          feedback: t(
            "Medians aren't perpendicular in general. A median meets the mid-point, so AM is half of AB.",
            "माध्यिकाएँ आम तौर पर लंब नहीं होतीं। माध्यिका मध्य-बिंदु से मिलती है, इसलिए AM, AB का आधा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Medians follow the sides", "माध्यिकाएँ भुजाओं के साथ चलती हैं")),
      w.definition(
        t(
          "**Median.** A median of a triangle joins a vertex to the mid-point of the opposite side.",
          "**माध्यिका।** त्रिभुज की माध्यिका एक शीर्ष को सामने वाली भुजा के मध्य-बिंदु से जोड़ती है।",
        ),
      ),
      figureOn(b, "ex8", EXAMPLE_8),
      w.body(
        t(
          r`**Example 8.** CM and RN are medians of ∆ ABC and ∆ PQR, and ∆ ABC ~ ∆ PQR. Prove (i) ∆ AMC ~ ∆ PNR and (ii) CM/RN = AB/PQ. From the similar triangles: $$\frac{AB}{PQ} = \frac{CA}{RP}, \quad \angle A = \angle P$$ M and N are mid-points, so AB = 2AM and PQ = 2PN: $$\frac{2\,AM}{2\,PN} = \frac{CA}{RP}, \text{ i.e. } \frac{AM}{PN} = \frac{CA}{RP}$$ With ∠MAC = ∠NPR, by SAS: $$\triangle AMC \sim \triangle PNR$$ So $$\frac{CM}{RN} = \frac{CA}{RP} = \frac{AB}{PQ}$$`,
          r`**उदाहरण 8।** CM और RN, ∆ ABC और ∆ PQR की माध्यिकाएँ हैं, और ∆ ABC ~ ∆ PQR। सिद्ध करो (i) ∆ AMC ~ ∆ PNR और (ii) CM/RN = AB/PQ। समरूप त्रिभुजों से: $$\frac{AB}{PQ} = \frac{CA}{RP}, \quad \angle A = \angle P$$ M और N मध्य-बिंदु हैं, इसलिए AB = 2AM और PQ = 2PN: $$\frac{2\,AM}{2\,PN} = \frac{CA}{RP}, \text{ अर्थात् } \frac{AM}{PN} = \frac{CA}{RP}$$ ∠MAC = ∠NPR के साथ, SAS से: $$\triangle AMC \sim \triangle PNR$$ इसलिए $$\frac{CM}{RN} = \frac{CA}{RP} = \frac{AB}{PQ}$$`,
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The tank's height from the stick's shadow. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const sun = b.prop(shadowHeightDef, "sun", {
      mode: ShadowMode.Sun,
      object: ShadowObject.Tank,
      stickHeight: 1.5,
      stickShadow: 1,
      objectHeight: 15,
      step: 0,
      canMove: false,
      canStep: true,
    });
    b.studentOnly(sun.action(ShadowAction.Next));
    b.standsFor(
      sun,
      "the tank and Riya's 1.5 m stick in the same sunlight, the stick's shadow 1 m and the tank's 10 m, the two similar right triangles, and the working revealed line by line",
    );
    const goal = goalQuestion(b, {
      about: sun,
      prompt: t(
        "Work out the tank's height: show the working one line at a time.",
        "टंकी की ऊँचाई निकालो: हल एक-एक पंक्ति करके दिखाओ।",
      ),
      isMet: sun.field("step").eq(3),
      solve: Array.from({ length: 3 }, () => sun.learner(ShadowAction.Next, {})),
    });
    const tower = choiceQuestion(b, {
      name: "tower",
      prompt: t(
        "Exercise 6.3 Q15: a 6 m pole casts a 4 m shadow; at the same time a tower casts a 28 m shadow. How tall is the tower?",
        "प्रश्नावली 6.3 प्र15: 6 m का खंभा 4 m की छाया डालता है; उसी समय एक मीनार 28 m की छाया डालती है। मीनार कितनी ऊँची है?",
      ),
      options: [
        { id: "right", label: t("42 m", "42 m") },
        {
          id: "flip",
          label: t("18.7 m", "18.7 m"),
          feedback: t(
            "That uses shadow/height upside down. Height/shadow is the same for both: h/28 = 6/4, so h = 42.",
            "इसमें छाया/ऊँचाई उल्टा लिया गया। ऊँचाई/छाया दोनों के लिए बराबर है: h/28 = 6/4, तो h = 42।",
          ),
        },
        {
          id: "add",
          label: t("30 m", "30 m"),
          feedback: t(
            "Similar triangles multiply, they don't add: 28 is 7 times 4, so the tower is 7 times 6.",
            "समरूप त्रिभुज गुणा करते हैं, जोड़ते नहीं: 28, 4 का 7 गुना है, तो मीनार 6 की 7 गुनी है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        "**Stop 4 done.** The tank is 15 m tall, and nobody had to climb it. That number goes straight into the wire plan.",
        "**पड़ाव 4 पूरा।** टंकी 15 m ऊँची है, और किसी को उस पर चढ़ना नहीं पड़ा। यह संख्या सीधे तार की योजना में जाती है।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(tower.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("How tall is the tank?", "टंकी कितनी ऊँची है?")),
      w.body(
        t(
          "At the same moment the sun's rays hit the stick and the tank at the same slant. Both stand upright on level ground. So the stick with its shadow and the tank with its shadow make two right triangles with equal angles: similar, by AA.",
          "उसी पल सूरज की किरणें छड़ी और टंकी पर एक ही तिरछेपन से पड़ती हैं। दोनों समतल ज़मीन पर सीधी खड़ी हैं। तो छड़ी अपनी छाया के साथ और टंकी अपनी छाया के साथ बराबर कोणों वाले दो समकोण त्रिभुज बनाती हैं: AA से समरूप।",
        ),
      ),
      sun,
      goal,
      w.body(
        t(
          r`$$\frac{h}{10} = \frac{1.5}{1}$$ $$h = 10 \times 1.5 = 15 \text{ m}$$`,
          r`$$\frac{h}{10} = \frac{1.5}{1}$$ $$h = 10 \times 1.5 = 15 \text{ m}$$`,
        ),
      ),
      tower,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6.3 Q1-style criteria, and the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const crit = choiceQuestion(b, {
      name: "crit",
      prompt: t(
        "In ∆ PQR and ∆ LMN, PQ = 6, QR = 10, ∠Q = 70°; LM = 3, MN = 5, ∠M = 70°. Are they similar, and by which test?",
        "∆ PQR और ∆ LMN में PQ = 6, QR = 10, ∠Q = 70°; LM = 3, MN = 5, ∠M = 70°। क्या वे समरूप हैं, और किस कसौटी से?",
      ),
      options: [
        { id: "right", label: t("Yes, by SAS: ∆ PQR ~ ∆ LMN", "हाँ, SAS से: ∆ PQR ~ ∆ LMN") },
        {
          id: "sss",
          label: t("Yes, by SSS: ∆ PQR ~ ∆ LMN", "हाँ, SSS से: ∆ PQR ~ ∆ LMN"),
          feedback: t(
            "Only two sides of each are given, so SSS can't be used. Two sides in ratio 2 with the included angle equal: SAS.",
            "हर एक की केवल दो भुजाएँ दी हैं, इसलिए SSS नहीं लग सकता। अनुपात 2 में दो भुजाएँ और अंतर्गत कोण बराबर: SAS।",
          ),
        },
        {
          id: "no",
          label: t("No: the sides are not equal", "नहीं: भुजाएँ बराबर नहीं"),
          feedback: t(
            "Similar triangles needn't have equal sides, only sides in one ratio: 6/3 = 10/5 = 2.",
            "समरूप त्रिभुजों की भुजाएँ बराबर होना ज़रूरी नहीं, केवल एक अनुपात में: 6/3 = 10/5 = 2।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ SAS: two sides in one ratio and the included angle equal. ✓ Shadows give heights: the tank is 15 m. Next: the banner. A bigger print costs more ink, but how much more?",
        "**मिशन लॉग।** ✓ SAS: एक अनुपात में दो भुजाएँ और अंतर्गत कोण बराबर। ✓ छाया से ऊँचाई मिलती है: टंकी 15 m है। आगे: बैनर। बड़े प्रिंट में ज़्यादा स्याही लगती है, पर कितनी ज़्यादा?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(crit.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), crit, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, sas, choosing, lamp, medians, inLife, yourTurn];
