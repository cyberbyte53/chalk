import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CirclesSceneKind, ConstructionKind } from "@chalk/prop-circles";
import { constructionOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The handout copy: Kabir's sketch at three-quarters size. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const desk = sceneOn(
    b,
    "desk",
    CirclesSceneKind.PosterDesk,
    "the chart paper with Kabir's small sketch of the cycle frame and Riya's scaled copy beside it",
  );
  return column([
    w.title(t("A copy for the handout", "पर्चे के लिए नक़ल")),
    desk,
    w.body(
      t(
        "The tube is split. Next, the handout. Kabir has sketched the cycle frame's main triangle with AB = 5 cm, BC = 6 cm and CA = 7 cm, but the handout box is small. Riya needs the **same shape**, with every side **3/4** as long. Can the compass and ruler shrink a triangle without changing its shape, and without measuring a single angle?",
        "नली बँट गई। अब पर्चा। कबीर ने साइकिल के फ़्रेम का मुख्य त्रिभुज AB = 5 cm, BC = 6 cm और CA = 7 cm भुजाओं से बनाया है, पर पर्चे का खाना छोटा है। रिया को **वही आकार** चाहिए, हर भुजा **3/4** लंबी। क्या परकार और रूलर बिना एक भी कोण नापे, आकार बदले बिना, त्रिभुज को छोटा कर सकते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Scale factor recalled; which point and how many. */
const scaleFactor = page("scale-factor", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Scale factor", "स्केल गुणक")),
    w.definition(
      t(
        r`**Scale factor.** When we make a triangle similar to a given one, the **scale factor** is the ratio of each side of the new triangle to the corresponding side of the given triangle. A scale factor $\frac{m}{n}$ less than 1 makes a **smaller** triangle; more than 1 makes a **larger** one.`,
        r`**स्केल गुणक।** जब किसी दिए गए त्रिभुज के समरूप त्रिभुज बनाते हैं, तो नए त्रिभुज की हर भुजा और दिए गए त्रिभुज की संगत भुजा का अनुपात **स्केल गुणक** कहलाता है। $\frac{m}{n}$ स्केल गुणक 1 से कम हो तो **छोटा** त्रिभुज बनता है; 1 से ज़्यादा हो तो **बड़ा**।`,
      ),
    ),
    w.body(
      t(
        r`Recall from Chapter 6: two triangles are similar when their corresponding angles are equal, and then their corresponding sides are in the same ratio. So if we keep $\angle B$ and make the new sides parallel to the old ones, the angles cannot change. We want the new side BC′ (C′ a point on BC) to be 3 of 4 equal parts of BC, i.e. divide BC in **3 : 1**. That is Construction 11.1 with 3 + 1 = 4 steps, and it's why the steps go to the **greater** number, 4.`,
        r`अध्याय 6 से याद करो: दो त्रिभुज तब समरूप होते हैं जब उनके संगत कोण बराबर हों, और तब संगत भुजाएँ एक ही अनुपात में होती हैं। तो यदि $\angle B$ वैसा ही रखें और नई भुजाएँ पुरानी के समांतर बनाएँ, तो कोण बदल ही नहीं सकते। हमें नई भुजा BC′ (C′, BC पर एक बिंदु) चाहिए जो BC के 4 बराबर भागों में से 3 हो, यानी BC को **3 : 1** में बाँटना है। यह 3 + 1 = 4 कदमों वाली रचना 11.1 है, और इसीलिए कदम **बड़ी** संख्या, 4, तक जाते हैं।`,
      ),
    ),
    space(),
  ]);
});

/** Construction 11.2, Example 1: scale factor 3/4, stepped, then the justification. */
const construct = page(
  "construct",
  (b) => {
    const w = wordsOn(b);
    const { figure, goal } = constructionOn(
      b,
      "smaller",
      { kind: ConstructionKind.Similar, ab: 5, bc: 6, ca: 7, m: 3, n: 4 },
      "Example 1: triangle ABC with AB 5, BC 6, CA 7 cm; ray BX below BC with four equal steps; B₄C joined; the parallel through B₃ meets BC at C′; the parallel to CA through C′ meets BA at A′, giving the smaller triangle A′BC′",
      t(
        "Tap next until the smaller triangle A′BC′ is drawn.",
        "आगे दबाते रहो जब तक छोटा त्रिभुज A′BC′ न बन जाए।",
      ),
    );
    const why = w.body(
      t(
        r`**Why it works.** By Construction 11.1, the parallel through B₃ cuts BC so that $$\frac{BC'}{C'C} = \frac{3}{1}$$ Adding, $$\frac{BC}{BC'} = \frac{BC' + C'C}{BC'} = 1 + \frac{1}{3} = \frac{4}{3}$$ so $$\frac{BC'}{BC} = \frac{3}{4}$$ Also C′A′ ∥ CA, so $\angle BC'A' = \angle BCA$ (corresponding angles), and $\angle B$ is common. By AA, $$\triangle A'BC' \sim \triangle ABC$$ Therefore $$\frac{A'B}{AB} = \frac{A'C'}{AC} = \frac{BC'}{BC} = \frac{3}{4}$$`,
        r`**यह क्यों काम करता है।** रचना 11.1 से, B₃ से गई समांतर रेखा BC को ऐसे काटती है कि $$\frac{BC'}{C'C} = \frac{3}{1}$$ जोड़ने पर, $$\frac{BC}{BC'} = \frac{BC' + C'C}{BC'} = 1 + \frac{1}{3} = \frac{4}{3}$$ इसलिए $$\frac{BC'}{BC} = \frac{3}{4}$$ साथ ही C′A′ ∥ CA, तो $\angle BC'A' = \angle BCA$ (संगत कोण), और $\angle B$ उभयनिष्ठ है। AA से, $$\triangle A'BC' \sim \triangle ABC$$ अतः $$\frac{A'B}{AB} = \frac{A'C'}{AC} = \frac{BC'}{BC} = \frac{3}{4}$$`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Construction 11.2: scale factor 3/4", "रचना 11.2: स्केल गुणक 3/4")),
      w.body(
        t(
          r`The steps: draw a ray BX making an acute angle with BC, on the side away from A. Mark 4 equal steps on it (4 is the **greater** of 3 and 4 in $\frac{3}{4}$). Join B₄ to C. Through B₃ (3 is the **smaller**), draw a line parallel to B₄C, meeting BC at C′. Through C′, draw a line parallel to CA, meeting BA at A′.`,
          r`चरण: BC के साथ न्यून कोण बनाती किरण BX खींचो, A से उलटी ओर। उस पर 4 बराबर कदम लगाओ ($\frac{3}{4}$ में 3 और 4 में से **बड़ी** संख्या 4)। B₄ को C से मिलाओ। B₃ से (3 **छोटी** संख्या है) B₄C के समांतर रेखा खींचो, जो BC को C′ पर मिले। C′ से CA के समांतर रेखा खींचो, जो BA को A′ पर मिले।`,
        ),
      ),
      figure,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why the triangles are similar: the AA reason picked out. */
const reason = page(
  "reason",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Which reason shows that ∆A′BC′ ~ ∆ABC?", "कौन-सा कारण दिखाता है कि ∆A′BC′ ~ ∆ABC?"),
      options: [
        {
          id: "right",
          label: t("∠B is shared and C′A′ ∥ CA (AA)", "∠B उभयनिष्ठ और C′A′ ∥ CA (AA)"),
        },
        {
          id: "sss",
          label: t("All three sides were measured (SSS)", "तीनों भुजाएँ नापी गईं (SSS)"),
          feedback: t(
            "Nothing was measured. The angles match because of the parallel lines.",
            "कुछ भी नापा नहीं गया। कोण समांतर रेखाओं के कारण मिलते हैं।",
          ),
        },
        {
          id: "cong",
          label: t("Both triangles share side BC (SAS)", "दोनों त्रिभुजों की भुजा BC साझा है (SAS)"),
          feedback: t(
            "They share ∠B, not a side: BC′ is only part of BC. The second angle comes from C′A′ ∥ CA.",
            "वे ∠B साझा करते हैं, भुजा नहीं: BC′, BC का केवल एक भाग है। दूसरा कोण C′A′ ∥ CA से आता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The reason in one line", "एक पंक्ति में कारण")),
      w.body(
        t(
          "Every similar-triangle construction in this chapter rests on the same idea: keep one angle, draw parallels, and the shape cannot change. The ratio comes from the equal steps on the ray.",
          "इस अध्याय की हर समरूप-त्रिभुज रचना एक ही विचार पर टिकी है: एक कोण रखो, समांतर रेखाएँ खींचो, और आकार बदल ही नहीं सकता। अनुपात किरण पर लगे बराबर कदमों से आता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The handout copy's sides. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Kabir's frame triangle has BC = 6 cm. In Riya's 3/4 copy, how long is BC′?",
        "कबीर के फ़्रेम त्रिभुज में BC = 6 cm है। रिया की 3/4 नक़ल में BC′ कितना है?",
      ),
      options: [
        { id: "right", label: t("4.5 cm", "4.5 cm") },
        {
          id: "eight",
          label: t("8 cm", "8 cm"),
          feedback: t(
            "That's 6 × 4/3, a bigger copy. The handout copy is 3/4 of each side.",
            "वह 6 × 4/3 है, बड़ी नक़ल। पर्चे वाली नक़ल हर भुजा का 3/4 है।",
          ),
        },
        {
          id: "minus",
          label: t("5.25 cm", "5.25 cm"),
          feedback: t(
            "That's 7 × 3/4, the copy of CA. BC′ is 6 × 3/4.",
            "वह 7 × 3/4 है, CA की नक़ल। BC′ = 6 × 3/4।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The handout triangle", "पर्चे वाला त्रिभुज")),
      w.body(
        t(
          "Riya never measured an angle, yet the handout frame has exactly the same shape as Kabir's sketch. Each side came out 3/4 as long: the copies of 5, 6 and 7 cm are 3.75, 4.5 and 5.25 cm.",
          "रिया ने एक भी कोण नहीं नापा, फिर भी पर्चे वाले फ़्रेम का आकार ठीक कबीर के स्केच जैसा है। हर भुजा 3/4 लंबी बनी: 5, 6 और 7 cm की नक़लें 3.75, 4.5 और 5.25 cm हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 11.1 Q2 and Q5. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Exercise 11.1 Q2: sides 4, 5 and 6 cm, scale factor 2/3. How many equal steps on BX, and through which mark is the parallel to B₃C drawn?",
        "प्रश्नावली 11.1 प्र.2: भुजाएँ 4, 5 और 6 cm, स्केल गुणक 2/3। BX पर कितने बराबर कदम, और B₃C के समांतर रेखा किस निशान से?",
      ),
      options: [
        { id: "right", label: t("3 steps; through B₂", "3 कदम; B₂ से") },
        {
          id: "two",
          label: t("2 steps; through B₃", "2 कदम; B₃ से"),
          feedback: t(
            "The steps go to the greater number, 3, and the parallel goes through the smaller, B₂.",
            "कदम बड़ी संख्या, 3, तक जाते हैं, और समांतर रेखा छोटी संख्या, B₂, से।",
          ),
        },
        {
          id: "five",
          label: t("5 steps; through B₂", "5 कदम; B₂ से"),
          feedback: t(
            "Adding 2 + 3 is for dividing a segment in 2 : 3. For a scale factor 2/3, mark 3 steps.",
            "2 + 3 जोड़ना रेखाखंड को 2 : 3 में बाँटने के लिए है। स्केल गुणक 2/3 के लिए 3 कदम लगाओ।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q5 = choiceQuestion(b, {
      name: "q5",
      prompt: t(
        "Exercise 11.1 Q5: BC = 6 cm, AB = 5 cm, ∠ABC = 60°, scale factor 3/4. What are BC′ and ∠A′BC′ in the new triangle?",
        "प्रश्नावली 11.1 प्र.5: BC = 6 cm, AB = 5 cm, ∠ABC = 60°, स्केल गुणक 3/4। नए त्रिभुज में BC′ और ∠A′BC′ क्या हैं?",
      ),
      options: [
        { id: "right", label: t("4.5 cm and 60°", "4.5 cm और 60°") },
        {
          id: "angle",
          label: t("4.5 cm and 45°", "4.5 cm और 45°"),
          feedback: t(
            "Angles don't scale. ∠B is the same angle in both triangles: 60°.",
            "कोण छोटे-बड़े नहीं होते। ∠B दोनों त्रिभुजों में वही कोण है: 60°।",
          ),
        },
        {
          id: "side",
          label: t("3.75 cm and 60°", "3.75 cm और 60°"),
          feedback: t(
            "3.75 is the copy of AB = 5. BC′ is 6 × 3/4.",
            "3.75, AB = 5 की नक़ल है। BC′ = 6 × 3/4।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The handout frame is drawn at 3/4 size, the same shape, with no angle measured. ✓ Rule: mark the greater number of steps, join the last to C, draw the parallel through the smaller. Next: the poster copy, which must be larger.",
        "**मिशन लॉग।** ✓ पर्चे वाला फ़्रेम 3/4 नाप में बन गया, वही आकार, बिना कोई कोण नापे। ✓ नियम: बड़ी संख्या जितने कदम लगाओ, आख़िरी को C से मिलाओ, छोटी संख्या वाले निशान से समांतर खींचो। आगे: पोस्टर वाली नक़ल, जो बड़ी होनी है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q5.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q2, q5, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, scaleFactor, construct, reason, inLife, yourTurn];
