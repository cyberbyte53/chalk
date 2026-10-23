import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { MirrorKind, Ray, sphericalMirrorDef } from "@chalk/prop-light";

const r = String.raw;

/** The story: the two faces of a steel spoon, and the question of what the curve does to parallel light. */
const story = page(
  "story",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Feel that a curved mirror gathers or spreads light: parallel rays off the hollow side meet at one point in front, off the bulging side they spread as if from a point behind. That point is the focus.",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "Sunlight comes in as parallel rays. After bouncing off the **hollow** side of the spoon, the rays will…",
        "सूरज की रोशनी समानांतर किरणों में आती है। चम्मच के **खोखले** हिस्से से उछलने के बाद किरणें…",
      ),
      options: [
        {
          id: "parallel",
          label: t("Stay parallel", "समानांतर ही रहेंगी"),
          feedback: t(
            "That is what a flat mirror does. A curved one tilts each ray by a different amount.",
            "यह समतल दर्पण करता है। मुड़ा हुआ दर्पण हर किरण को अलग-अलग मात्रा में मोड़ता है।",
          ),
        },
        { id: "meet", label: t("Come together at a point", "एक बिंदु पर मिल जाएँगी") },
        {
          id: "spread",
          label: t("Spread out", "फैल जाएँगी"),
          feedback: t(
            "Spreading is what the bulging back of the spoon does. The hollow side curves the other way.",
            "फैलाना चम्मच का उभरा हुआ पिछला हिस्सा करता है। खोखला हिस्सा दूसरी ओर मुड़ा है।",
          ),
        },
      ],
      answer: "meet",
      passes: false,
    });
    const concave = b.prop(
      sphericalMirrorDef,
      "concave",
      {
        kind: MirrorKind.Concave,
        focalLength: 10,
        object: { x: -40, height: 5 },
        rays: [Ray.Parallel],
        showImage: false,
        showLabels: false,
      },
      { isHidden: true },
    );
    b.standsFor(
      concave,
      "the hollow (concave) side of the spoon: one parallel ray reflecting through a point in front, with no labels yet",
    );
    const seen = w.body(
      t(
        "**Yes.** Every parallel ray off the hollow side bends in and passes through **one point in front of the mirror**. Drag the arrow up and down and watch: whatever height the ray comes in at, it goes through the same point. The bulging side does the opposite, and we will meet it on the next page.",
        "**हाँ।** खोखले हिस्से से हर समानांतर किरण अंदर की ओर मुड़कर **दर्पण के सामने एक ही बिंदु** से गुज़रती है। तीर को ऊपर-नीचे खिसकाओ और देखो: किरण चाहे जिस ऊँचाई से आए, उसी बिंदु से गुज़रती है। उभरा हुआ हिस्सा इसका उल्टा करता है, और उससे हम अगले पन्ने पर मिलेंगे।",
      ),
      "seen",
      { isHidden: true },
    );
    b.when(guess.on(QuestionSignal.Correct), [
      theBoard.show(concave),
      theBoard.show(seen),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Spherical mirrors", "गोलीय दर्पण")),
      w.body(
        t(
          "Hold a steel spoon up to your face. On the **back** of the spoon you are small and the right way up. Turn it over: in the **hollow** you are upside down, and if you bring it very close you suddenly become large and upright. Same spoon, two different mirrors. The only difference is **which way the surface curves**.",
          "एक स्टील की चम्मच अपने चेहरे के सामने पकड़ो। चम्मच की **पीठ** पर तुम छोटे और सीधे दिखते हो। उसे पलटो: **खोखले** हिस्से में तुम उल्टे दिखते हो, और बहुत पास लाओ तो अचानक बड़े और सीधे हो जाते हो। एक ही चम्मच, दो अलग दर्पण। फ़र्क़ बस इतना है कि **सतह किस ओर मुड़ी है**।",
        ),
      ),
      w.body(
        t(
          "A mirror whose surface is a piece of a sphere is a **spherical mirror**. Before we can say what it does to your face, we need its parts, and one experiment with parallel light.",
          "जिस दर्पण की सतह किसी गोले का टुकड़ा हो, वह **गोलीय दर्पण** है। यह तुम्हारे चेहरे का क्या करता है, यह कहने से पहले हमें इसके हिस्से चाहिए, और समानांतर प्रकाश के साथ एक प्रयोग।",
        ),
      ),
      guess,
      concave,
      seen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The two kinds, the parts, and R = 2f, with the parts labelled live on both mirrors. */
const parts = page("parts", (b) => {
  const w = wordsOn(b);
  const concave = b.prop(sphericalMirrorDef, "concave", {
    kind: MirrorKind.Concave,
    focalLength: 10,
    object: { x: -40, height: 5 },
    rays: [Ray.Parallel],
    showImage: false,
    showLabels: true,
  });
  const convex = b.prop(sphericalMirrorDef, "convex", {
    kind: MirrorKind.Convex,
    focalLength: 10,
    object: { x: -40, height: 5 },
    rays: [Ray.Parallel],
    showImage: false,
    showLabels: true,
  });
  b.standsFor(
    concave,
    "a concave mirror with P, F and C labelled and one parallel ray reflecting through F",
  );
  b.standsFor(
    convex,
    "a convex mirror with P, F and C labelled behind it and one parallel ray reflecting as if from F",
  );
  return column([
    w.title(t("The parts of a spherical mirror", "गोलीय दर्पण के हिस्से")),
    w.body(
      t(
        "If the reflecting surface curves **inwards**, like the hollow of the spoon, the mirror is **concave**. If it curves **outwards**, like the back, it is **convex**. Light always comes from the left in our pictures; the shaded side is the back of the mirror.",
        "यदि परावर्तक सतह **अंदर** की ओर मुड़ी हो, चम्मच के खोखले हिस्से की तरह, तो दर्पण **अवतल** है। यदि **बाहर** की ओर मुड़ी हो, पीठ की तरह, तो **उत्तल** है। हमारे चित्रों में प्रकाश हमेशा बाईं ओर से आता है; छायादार हिस्सा दर्पण की पीठ है।",
      ),
    ),
    concave,
    w.definition(
      t(
        r`The centre of the mirror's surface is its **pole**, $P$. The mirror is a piece of a sphere; the centre of that sphere is the **centre of curvature**, $C$, and the sphere's radius is the **radius of curvature**, $R$. The straight line through $P$ and $C$ is the **principal axis**. The point where parallel rays meet after reflection (or seem to come from) is the **principal focus**, $F$, and its distance from the pole is the **focal length**, $f$.`,
        r`दर्पण की सतह का केंद्र उसका **ध्रुव** $P$ है। दर्पण एक गोले का टुकड़ा है; उस गोले का केंद्र **वक्रता केंद्र** $C$ है, और गोले की त्रिज्या **वक्रता त्रिज्या** $R$ है। $P$ और $C$ से होकर जाने वाली सीधी रेखा **मुख्य अक्ष** है। जहाँ समानांतर किरणें परावर्तन के बाद मिलती हैं (या जहाँ से आती हुई लगती हैं), वह **मुख्य फोकस** $F$ है, और ध्रुव से उसकी दूरी **फोकस दूरी** $f$ है।`,
      ),
    ),
    w.body(
      t(
        "For a **concave** mirror the focus is in front, where the light really goes. For a **convex** mirror the reflected rays spread apart, and only their dashed extensions meet: its focus is **behind** the mirror, and so is its centre of curvature.",
        "**अवतल** दर्पण के लिए फोकस सामने होता है, जहाँ प्रकाश सचमुच जाता है। **उत्तल** दर्पण के लिए परावर्तित किरणें फैल जाती हैं, और केवल उनके बिंदुदार विस्तार मिलते हैं: उसका फोकस दर्पण के **पीछे** है, और वक्रता केंद्र भी।",
      ),
    ),
    convex,
    w.definition(
      t(
        r`The focus lies exactly halfway between the pole and the centre of curvature: $$R = 2f$$ This holds for both kinds of mirror, and it is why the dots for $F$ and $C$ sit where they do. (It is exact only for mirrors whose aperture is small compared with $R$; ours always are.)`,
        r`फोकस ध्रुव और वक्रता केंद्र के ठीक बीच में होता है: $$R = 2f$$ यह दोनों तरह के दर्पणों के लिए सही है, और इसीलिए $F$ और $C$ के बिंदु वहीं हैं जहाँ हैं। (यह केवल उन दर्पणों के लिए ठीक-ठीक सही है जिनका द्वारक $R$ की तुलना में छोटा हो; हमारे हमेशा होते हैं।)`,
      ),
    ),
    space(),
  ]);
});

/** Why a parallel ray goes through F: the mirror is a sphere, so the normal at every point passes through C. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Why parallel rays meet at F", "समानांतर किरणें F पर क्यों मिलती हैं")),
    w.body(
      t(
        r`A spherical mirror is a sphere, so the **normal at any point of it passes through $C$**, the sphere's centre. A ray parallel to the axis strikes the mirror at some point $M$; its normal is the line $MC$. By the law of reflection it bounces off at the same angle on the other side of $MC$.`,
        r`गोलीय दर्पण एक गोला है, इसलिए **उसके किसी भी बिंदु पर अभिलंब $C$ से गुज़रता है**, जो गोले का केंद्र है। अक्ष के समानांतर एक किरण दर्पण पर किसी बिंदु $M$ पर पड़ती है; उसका अभिलंब रेखा $MC$ है। परावर्तन के नियम से वह $MC$ के दूसरी ओर उसी कोण पर उछलती है।`,
      ),
    ),
    w.body(
      t(
        r`The incoming ray is parallel to the axis $PC$, so the angle it makes with the normal $MC$ equals the angle $MCP$ (alternate angles). The reflected ray makes that same angle with $MC$. So the little triangle with corners $M$, $C$ and the point where the reflected ray crosses the axis has two equal angles: it is isosceles, and the reflected ray crosses the axis at a point as far from $M$ as $C$ is. For rays close to the axis, $M$ is almost at $P$, and that point is **halfway between $P$ and $C$**. That is $F$, and $R = 2f$.`,
        r`आने वाली किरण अक्ष $PC$ के समानांतर है, इसलिए अभिलंब $MC$ से उसका कोण, कोण $MCP$ के बराबर है (एकांतर कोण)। परावर्तित किरण $MC$ से वही कोण बनाती है। तो $M$, $C$ और उस बिंदु, जहाँ परावर्तित किरण अक्ष को काटती है, वाले छोटे त्रिभुज के दो कोण बराबर हैं: वह समद्विबाहु है, और परावर्तित किरण अक्ष को उस बिंदु पर काटती है जो $M$ से उतना ही दूर है जितना $C$ है। अक्ष के पास की किरणों के लिए $M$ लगभग $P$ पर है, और वह बिंदु **$P$ और $C$ के ठीक बीच** है। वही $F$ है, और $R = 2f$।`,
      ),
    ),
    w.body(
      t(
        "You don't need to reproduce this argument in an exam. What you need is the picture it gives: a parallel ray always turns towards F, because the mirror's normal always points at C.",
        "यह तर्क परीक्षा में दोहराने की ज़रूरत नहीं है। जो चाहिए वह इसकी दी हुई तस्वीर है: समानांतर किरण हमेशा F की ओर मुड़ती है, क्योंकि दर्पण का अभिलंब हमेशा C की ओर इशारा करता है।",
      ),
    ),
    space(),
  ]);
});

/** Example: f from R, and R from f. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**The radius of curvature of a spherical mirror is 20 cm. What is its focal length?** (NCERT in-text question)",
        "**एक गोलीय दर्पण की वक्रता त्रिज्या 20 सेमी है। उसकी फोकस दूरी क्या है?** (NCERT पाठ्य प्रश्न)",
      ),
    ),
    w.body(
      t(
        r`The focus is halfway from the pole to the centre of curvature: $$f = \frac{R}{2} = \frac{20}{2} = 10 \text{ cm}$$`,
        r`फोकस ध्रुव से वक्रता केंद्र के बीच आधे रास्ते पर है: $$f = \frac{R}{2} = \frac{20}{2} = 10 \text{ सेमी}$$`,
      ),
    ),
    w.body(
      t(
        r`**And the other way:** a concave mirror has a focal length of 15 cm. Its radius of curvature is $R = 2f = 30$ cm, so its centre of curvature is 30 cm in front of the pole.`,
        r`**और उल्टी दिशा में:** एक अवतल दर्पण की फोकस दूरी 15 सेमी है। उसकी वक्रता त्रिज्या $R = 2f = 30$ सेमी है, इसलिए उसका वक्रता केंद्र ध्रुव से 30 सेमी सामने है।`,
      ),
    ),
    space(),
  ]);
});

/** Question: which mirror gathers, and where F is for each. */
const question = page(
  "question",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "A mirror's focus and centre of curvature are both behind it. The mirror is…",
        "एक दर्पण का फोकस और वक्रता केंद्र दोनों उसके पीछे हैं। दर्पण है…",
      ),
      options: [
        {
          id: "concave",
          label: t("concave", "अवतल"),
          feedback: t(
            "A concave mirror gathers parallel rays to a real point in front of it. Rays only seem to come from behind a mirror that spreads them.",
            "अवतल दर्पण समानांतर किरणों को सामने एक वास्तविक बिंदु पर इकट्ठा करता है। किरणें उसी दर्पण के पीछे से आती हुई लगती हैं जो उन्हें फैलाता है।",
          ),
        },
        { id: "convex", label: t("convex", "उत्तल") },
        {
          id: "plane",
          label: t("plane", "समतल"),
          feedback: t(
            "A plane mirror has no focus: parallel rays stay parallel after reflecting off it.",
            "समतल दर्पण का कोई फोकस नहीं होता: समानांतर किरणें उससे परावर्तित होकर समानांतर ही रहती हैं।",
          ),
        },
      ],
      answer: "convex",
    });
    return column([w.title(t("Question", "प्रश्न")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [story, parts, why, example, question];
