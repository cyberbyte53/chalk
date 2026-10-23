import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CirclesSceneKind, ConstructionKind } from "@chalk/prop-circles";
import { constructionOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The poster copy: Kabir's sketch at five-thirds size. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const desk = sceneOn(
    b,
    "desk",
    CirclesSceneKind.PosterDesk,
    "the chart paper with Kabir's small sketch and Riya's bigger copy of the same shape, with ruler lines and compass arcs",
  );
  return column([
    w.title(t("Now make it bigger", "अब इसे बड़ा करो")),
    desk,
    w.body(
      t(
        "The handout copy shrank the frame. The poster needs the opposite: Kabir's triangle at **5/3** of its size, so it can be seen from across the hall. The new sides will be longer than the old ones, so the new corners land **outside** the sketch. Does the same method still work when the parallels have to go past C and A?",
        "पर्चे वाली नक़ल ने फ़्रेम छोटा किया। पोस्टर को उलटा चाहिए: कबीर का त्रिभुज उसके **5/3** नाप का, ताकि हॉल के उस पार से दिखे। नई भुजाएँ पुरानी से लंबी होंगी, तो नए कोने स्केच के **बाहर** पड़ेंगे। क्या समांतर रेखाएँ C और A के आगे जाएँ, तब भी वही विधि काम करती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 2: scale factor 5/3, stepped, with the justification. */
const construct = page(
  "construct",
  (b) => {
    const w = wordsOn(b);
    const { figure, goal } = constructionOn(
      b,
      "larger",
      { kind: ConstructionKind.Similar, ab: 5, bc: 6, ca: 7, m: 5, n: 3 },
      "Example 2: triangle ABC with AB 5, BC 6, CA 7 cm; ray BX below BC with five equal steps; B₃C joined; the parallel through B₅ meets BC extended at C′; the parallel to CA through C′ meets BA extended at A′, giving the larger triangle A′BC′",
      t(
        "Tap next until the larger triangle A′BC′ is drawn.",
        "आगे दबाते रहो जब तक बड़ा त्रिभुज A′BC′ न बन जाए।",
      ),
    );
    const why = w.body(
      t(
        r`**Why it works.** C′A′ ∥ CA and $\angle B$ is common, so by AA, $$\triangle ABC \sim \triangle A'BC'$$ which gives $$\frac{AB}{A'B} = \frac{AC}{A'C'} = \frac{BC}{BC'}$$ B₃C ∥ B₅C′, so by the basic proportionality theorem in $\triangle BB_5C'$, $$\frac{BC}{BC'} = \frac{BB_3}{BB_5} = \frac{3}{5}$$ So $$\frac{BC'}{BC} = \frac{5}{3}$$ and therefore $$\frac{A'B}{AB} = \frac{A'C'}{AC} = \frac{BC'}{BC} = \frac{5}{3}$$`,
        r`**यह क्यों काम करता है।** C′A′ ∥ CA और $\angle B$ उभयनिष्ठ, तो AA से, $$\triangle ABC \sim \triangle A'BC'$$ जिससे $$\frac{AB}{A'B} = \frac{AC}{A'C'} = \frac{BC}{BC'}$$ B₃C ∥ B₅C′, तो $\triangle BB_5C'$ में आधारभूत समानुपातिकता प्रमेय से, $$\frac{BC}{BC'} = \frac{BB_3}{BB_5} = \frac{3}{5}$$ इसलिए $$\frac{BC'}{BC} = \frac{5}{3}$$ और अतः $$\frac{A'B}{AB} = \frac{A'C'}{AC} = \frac{BC'}{BC} = \frac{5}{3}$$`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Example 2: scale factor 5/3", "उदाहरण 2: स्केल गुणक 5/3")),
      w.body(
        t(
          r`The steps: draw ray BX at an acute angle to BC, away from A. Mark 5 equal steps (5 is the greater number in $\frac{5}{3}$). Join B₃ to C (3 is the smaller). Through B₅, draw a line parallel to B₃C: it meets BC **extended** at C′. Through C′, draw a line parallel to CA, meeting BA **extended** at A′.`,
          r`चरण: BC के साथ न्यून कोण पर किरण BX खींचो, A से उलटी ओर। 5 बराबर कदम लगाओ ($\frac{5}{3}$ में 5 बड़ी संख्या है)। B₃ को C से मिलाओ (3 छोटी है)। B₅ से B₃C के समांतर रेखा खींचो: यह **बढ़ाई गई** BC को C′ पर मिलती है। C′ से CA के समांतर रेखा खींचो, जो **बढ़ाई गई** BA को A′ पर मिले।`,
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

/** Smaller vs larger: which mark is joined to C, which carries the parallel. */
const compare = page(
  "compare",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "For scale factor 7/5: which mark is joined to C, and through which mark is the parallel drawn?",
        "स्केल गुणक 7/5 के लिए: किस निशान को C से मिलाते हैं, और समांतर रेखा किस निशान से?",
      ),
      options: [
        {
          id: "right",
          label: t("Join B₅ to C; parallel through B₇", "B₅ को C से मिलाओ; समांतर B₇ से"),
        },
        {
          id: "swap",
          label: t("Join B₇ to C; parallel through B₅", "B₇ को C से मिलाओ; समांतर B₅ से"),
          feedback: t(
            "That gives a copy 5/7 the size, smaller. For a larger copy, C is joined to the mark for the denominator, B₅.",
            "इससे 5/7 नाप की, छोटी नक़ल बनेगी। बड़ी नक़ल के लिए C को हर वाले निशान, B₅, से मिलाते हैं।",
          ),
        },
        {
          id: "twelve",
          label: t("Join B₁₂ to C; parallel through B₇", "B₁₂ को C से मिलाओ; समांतर B₇ से"),
          feedback: t(
            "12 = 7 + 5 is for dividing a segment in 7 : 5. A scale factor needs only 7 steps.",
            "12 = 7 + 5 रेखाखंड को 7 : 5 में बाँटने के लिए है। स्केल गुणक के लिए बस 7 कदम चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Smaller or larger: one rule", "छोटा या बड़ा: एक नियम")),
      w.definition(
        t(
          r`**The rule for scale factor** $\frac{m}{n}$**.** Mark as many equal steps on BX as the greater of m and n. Join $B_n$ (the denominator's mark) to C. Draw the parallel to $B_nC$ through $B_m$ (the numerator's mark) to find C′. If $m < n$, C′ falls between B and C (smaller). If $m > n$, C′ falls on BC extended (larger).`,
          r`**स्केल गुणक** $\frac{m}{n}$ **का नियम।** BX पर m और n में से बड़ी संख्या जितने बराबर कदम लगाओ। $B_n$ (हर वाला निशान) को C से मिलाओ। $B_m$ (अंश वाले निशान) से $B_nC$ के समांतर रेखा खींचकर C′ पाओ। $m < n$ हो तो C′, B और C के बीच पड़ता है (छोटा)। $m > n$ हो तो C′ बढ़ाई गई BC पर पड़ता है (बड़ा)।`,
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

/** The poster frame's sides. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "On the poster, the copy of BC = 6 cm at scale factor 5/3 is how long?",
        "पोस्टर पर, स्केल गुणक 5/3 से BC = 6 cm की नक़ल कितनी लंबी है?",
      ),
      options: [
        { id: "right", label: t("10 cm", "10 cm") },
        {
          id: "inv",
          label: t("3.6 cm", "3.6 cm"),
          feedback: t(
            "That's 6 × 3/5, a smaller copy. Larger means 6 × 5/3.",
            "वह 6 × 3/5 है, छोटी नक़ल। बड़ी नक़ल यानी 6 × 5/3।",
          ),
        },
        {
          id: "add",
          label: t("8 cm", "8 cm"),
          feedback: t(
            "Adding 2 cm keeps the gap, not the shape. Every side is multiplied by 5/3.",
            "2 cm जोड़ने से अंतर बचता है, आकार नहीं। हर भुजा 5/3 से गुणा होती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The poster frame", "पोस्टर वाला फ़्रेम")),
      w.body(
        t(
          "Riya's poster triangle has sides 25/3, 10 and 35/3 cm, about 8.3, 10 and 11.7 cm. The same three moves that shrank the handout copy now grew the poster copy: one shared angle, parallels, and equal steps on a ray.",
          "रिया के पोस्टर त्रिभुज की भुजाएँ 25/3, 10 और 35/3 cm हैं, लगभग 8.3, 10 और 11.7 cm। जिन तीन चालों ने पर्चे वाली नक़ल छोटी की थी, उन्हीं ने पोस्टर वाली बड़ी की: एक साझा कोण, समांतर रेखाएँ, और किरण पर बराबर कदम।",
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

/** Exercise 11.1 Q3, Q4, Q6, Q7. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "Exercise 11.1 Q4: an isosceles triangle with base 8 cm and altitude 4 cm is copied at 1½ times. What are the new base and altitude?",
        "प्रश्नावली 11.1 प्र.4: आधार 8 cm और शीर्षलंब 4 cm वाले समद्विबाहु त्रिभुज की 1½ गुना नक़ल बनती है। नया आधार और शीर्षलंब क्या हैं?",
      ),
      options: [
        { id: "right", label: t("12 cm and 6 cm", "12 cm और 6 cm") },
        {
          id: "base",
          label: t("12 cm and 4 cm", "12 cm और 4 cm"),
          feedback: t(
            "In a similar triangle every length scales, the altitude too: 4 × 3/2 = 6.",
            "समरूप त्रिभुज में हर लंबाई बदलती है, शीर्षलंब भी: 4 × 3/2 = 6।",
          ),
        },
        {
          id: "plus",
          label: t("9.5 cm and 5.5 cm", "9.5 cm और 5.5 cm"),
          feedback: t(
            "Adding 1½ doesn't keep the shape. Multiply each length by 1½.",
            "1½ जोड़ने से आकार नहीं बचता। हर लंबाई को 1½ से गुणा करो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q6 = choiceQuestion(b, {
      name: "q6",
      prompt: t(
        "Exercise 11.1 Q6: BC = 7 cm, ∠B = 45°, ∠A = 105°, scale factor 4/3. What is ∠C, and how long is BC′?",
        "प्रश्नावली 11.1 प्र.6: BC = 7 cm, ∠B = 45°, ∠A = 105°, स्केल गुणक 4/3। ∠C क्या है, और BC′ कितना लंबा?",
      ),
      options: [
        { id: "right", label: t("30°, and 28/3 cm", "30°, और 28/3 cm") },
        {
          id: "angle",
          label: t("40°, and 28/3 cm", "40°, और 28/3 cm"),
          feedback: t(
            "The angles of a triangle add to 180°: 180 − 45 − 105 = 30.",
            "त्रिभुज के कोणों का योग 180° है: 180 − 45 − 105 = 30।",
          ),
        },
        {
          id: "side",
          label: t("30°, and 21/4 cm", "30°, और 21/4 cm"),
          feedback: t(
            "21/4 is 7 × 3/4, a smaller copy. The scale factor is 4/3.",
            "21/4, 7 × 3/4 है, छोटी नक़ल। स्केल गुणक 4/3 है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q7 = choiceQuestion(b, {
      name: "q7",
      prompt: t(
        "Exercise 11.1 Q7: a right triangle with legs 4 cm and 3 cm is copied at 5/3. How long is the new hypotenuse?",
        "प्रश्नावली 11.1 प्र.7: 4 cm और 3 cm पादों वाले समकोण त्रिभुज की 5/3 नक़ल बनती है। नया कर्ण कितना लंबा है?",
      ),
      options: [
        { id: "right", label: t("25/3 cm", "25/3 cm") },
        {
          id: "five",
          label: t("5 cm", "5 cm"),
          feedback: t(
            "5 cm is the hypotenuse of the given triangle (3, 4, 5). The copy's is 5 × 5/3.",
            "5 cm दिए गए त्रिभुज (3, 4, 5) का कर्ण है। नक़ल का कर्ण 5 × 5/3 है।",
          ),
        },
        {
          id: "sum",
          label: t("35/3 cm", "35/3 cm"),
          feedback: t(
            "35/3 is (3 + 4) × 5/3. The hypotenuse is 5 cm, not 3 + 4.",
            "35/3 = (3 + 4) × 5/3 है। कर्ण 5 cm है, 3 + 4 नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The poster frame is drawn at 5/3 size. ✓ One rule does both: the greater number gives the steps, the denominator's mark joins C, the numerator's mark carries the parallel. Next: the chain, drawn as tangents to the sprockets.",
        "**मिशन लॉग।** ✓ पोस्टर वाला फ़्रेम 5/3 नाप में बन गया। ✓ एक ही नियम दोनों करता है: बड़ी संख्या से कदम, हर वाला निशान C से जुड़ता है, अंश वाले निशान से समांतर रेखा। आगे: चेन, स्प्रॉकेट की स्पर्श रेखाओं की तरह।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q7.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q4, q6, q7, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, construct, compare, inLife, yourTurn];
