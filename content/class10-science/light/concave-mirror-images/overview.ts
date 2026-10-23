import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  MirrorKind,
  Place,
  Ray,
  SphericalMirrorAction,
  SphericalMirrorDerived,
  sphericalMirrorDef,
} from "@chalk/prop-light";

/** The concave mirror every page uses: f = 10 cm, so C is at 20 cm. */
const mirror = { kind: MirrorKind.Concave, focalLength: 10, showLabels: true } as const;

/** The story: bring the object in from far away and find where the image flips from in front to behind. */
const story = page(
  "story",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Feel the concave mirror's two behaviours before the six cases are named: a real, inverted image in front while the object is outside F, flipping to a virtual, erect, enlarged one behind the mirror once the object crosses F.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x: -35, height: 5 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(
      m,
      "the spoon's hollow side as a concave mirror (f = 10 cm): the object is the student's face, the orange arrow its image",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "Your face in the hollow of the spoon is upside down. You bring the spoon closer and closer. What happens to your face?",
        "चम्मच के खोखले हिस्से में तुम्हारा चेहरा उल्टा है। तुम चम्मच को पास, और पास लाते हो। चेहरे का क्या होता है?",
      ),
      options: [
        {
          id: "stays",
          label: t("It stays upside down, getting smaller", "उल्टा ही रहता है, छोटा होता जाता है"),
          feedback: t(
            "Try it with a real spoon: very close, it turns the right way up. Something changes on the way in.",
            "असली चम्मच से आज़माओ: बहुत पास लाने पर वह सीधा हो जाता है। रास्ते में कुछ बदलता है।",
          ),
        },
        {
          id: "flips",
          label: t("At some point it flips the right way up", "किसी जगह वह पलटकर सीधा हो जाता है"),
        },
        {
          id: "vanishes",
          label: t("It slowly fades away", "धीरे-धीरे धुँधला होकर ग़ायब हो जाता है"),
          feedback: t(
            "It does get huge and blurry at one spot, but it comes back, the right way up. Find that spot.",
            "एक जगह वह बहुत बड़ा और धुँधला ज़रूर हो जाता है, पर फिर लौटता है, सीधा। वह जगह ढूँढो।",
          ),
        },
      ],
      answer: "flips",
      passes: false,
    });
    const goal = goalQuestion(b, {
      about: m,
      prompt: t(
        "Drag the object towards the mirror until its image is **behind** the mirror and the right way up.",
        "वस्तु को दर्पण की ओर खिसकाओ, जब तक उसका प्रतिबिंब दर्पण के **पीछे** और सीधा न हो जाए।",
      ),
      isMet: m
        .derived(SphericalMirrorDerived.IsReal)
        .not()
        .and(m.derived(SphericalMirrorDerived.V).neq(null)),
      solve: [m.learner(SphericalMirrorAction.MoveObject, { x: -5 })],
      notes: [
        {
          when: m.derived(SphericalMirrorDerived.U).lt(-10.5),
          say: t(
            "The image is still in front of the mirror and upside down. Keep coming in, past F.",
            "प्रतिबिंब अभी भी दर्पण के सामने और उल्टा है। और पास आओ, F के पार।",
          ),
          reach: [m.learner(SphericalMirrorAction.MoveObject, { x: -14 })],
        },
      ],
    });
    const wrap = w.definition(
      t(
        "**F is the switch.** Outside F the image is **real** (in front, where the rays really meet) and **inverted**. Inside F the reflected rays spread apart; only their extensions meet, **behind** the mirror, giving a **virtual, erect, enlarged** image. The spoon close to your face is a mirror with your face inside F.",
        "**F ही स्विच है।** F के बाहर प्रतिबिंब **वास्तविक** (सामने, जहाँ किरणें सचमुच मिलती हैं) और **उल्टा** होता है। F के अंदर परावर्तित किरणें फैल जाती हैं; केवल उनके विस्तार मिलते हैं, दर्पण के **पीछे**, जिससे **आभासी, सीधा, बड़ा** प्रतिबिंब बनता है। चेहरे के पास की चम्मच ऐसा दर्पण है जिसके F के अंदर तुम्हारा चेहरा है।",
      ),
      "wrap",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(wrap));
    return column([
      w.title(t("Images in a concave mirror", "अवतल दर्पण में प्रतिबिंब")),
      w.body(
        t(
          "Back to the spoon. The hollow side is a concave mirror, and your face is the object. In the picture, the blue arrow is your face and the orange arrow is where the mirror puts its image.",
          "वापस चम्मच पर। खोखला हिस्सा अवतल दर्पण है, और तुम्हारा चेहरा वस्तु। चित्र में नीला तीर तुम्हारा चेहरा है और नारंगी तीर वह जगह जहाँ दर्पण उसका प्रतिबिंब बनाता है।",
        ),
      ),
      guess,
      m,
      goal,
      wrap,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The rules: three standard rays, any two of which find the image. */
const rules = page("rules", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    ...mirror,
    object: { x: -30, height: 5 },
    rays: [Ray.Parallel, Ray.Focal, Ray.Centre, Ray.Pole],
    showImage: true,
  });
  b.standsFor(
    m,
    "an object beyond C with all four standard rays drawn, all meeting at the image tip",
  );
  return column([
    w.title(t("How to find an image", "प्रतिबिंब कैसे ढूँढें")),
    w.body(
      t(
        "Every point of the object sends out rays in all directions. To find where its image is, we only need to follow **two** of them from one point, the tip of the arrow, and see where they meet after reflecting. Four rays are easy to draw, because each follows one rule you already know:",
        "वस्तु का हर बिंदु हर दिशा में किरणें भेजता है। उसका प्रतिबिंब कहाँ है, यह जानने के लिए हमें एक बिंदु, तीर की नोक, से केवल **दो** किरणों का पीछा करना है और देखना है कि परावर्तन के बाद वे कहाँ मिलती हैं। चार किरणें बनाना आसान है, क्योंकि हर एक उस नियम पर चलती है जो तुम पहले से जानते हो:",
      ),
    ),
    m,
    w.definition(
      t(
        "**1.** A ray **parallel to the principal axis** reflects **through F**. **2.** A ray **through F** reflects **parallel** to the axis (the first rule run backwards). **3.** A ray **through C** hits the mirror along its normal, so it reflects **straight back along itself**. **4.** A ray to the **pole** reflects making the same angle with the axis on the other side, as off a plane mirror.",
        "**1.** **मुख्य अक्ष के समानांतर** किरण **F से होकर** परावर्तित होती है। **2.** **F से होकर** आने वाली किरण अक्ष के **समानांतर** परावर्तित होती है (पहला नियम उल्टा)। **3.** **C से होकर** आने वाली किरण दर्पण पर अभिलंब के साथ-साथ पड़ती है, इसलिए **उसी रास्ते सीधी वापस** लौटती है। **4.** **ध्रुव** पर पड़ने वाली किरण अक्ष के दूसरी ओर उतना ही कोण बनाकर परावर्तित होती है, जैसे समतल दर्पण से।",
      ),
    ),
    w.body(
      t(
        "All four meet at one point: the tip of the image. In exams, draw the first two; they work for every position. Drag the object and watch all four keep agreeing.",
        "चारों एक ही बिंदु पर मिलती हैं: प्रतिबिंब की नोक। परीक्षा में पहली दो बनाओ; वे हर स्थिति में काम करती हैं। वस्तु को खिसकाओ और देखो कि चारों सहमत रहती हैं।",
      ),
    ),
    space(),
  ]);
});

/** One of the textbook's cases: the object placed by name, two rays, the image, and its nature in a line. */
function casePage(name: string, at: Place, title: Localized, nature: Localized, note: Localized) {
  return page(name, (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x: xOf(at), height: 5 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: true,
    });
    b.standsFor(
      m,
      `the textbook case: object ${at}, with the parallel and focal rays and the image`,
    );
    return column([w.title(title), m, w.definition(nature), w.body(note), space()]);
  });
}

/** Where each named case puts the object for f = 10 (the prop's own `placeObject` uses the same spots). */
function xOf(at: Place): number {
  switch (at) {
    case Place.BeyondCentre:
      return -30;
    case Place.AtCentre:
      return -20;
    case Place.BetweenCentreAndFocus:
      return -15;
    case Place.AtFocus:
      return -10;
    case Place.BetweenFocusAndPole:
      return -5;
  }
}

const caseBeyondC = casePage(
  "case-beyond-c",
  Place.BeyondCentre,
  t("Case 1: object beyond C", "स्थिति 1: वस्तु C से परे"),
  t(
    "**Image between F and C: real, inverted, diminished.** The farther the object, the closer the image creeps to F and the smaller it gets; an object **at infinity** gives a point image **at F** itself.",
    "**प्रतिबिंब F और C के बीच: वास्तविक, उल्टा, छोटा।** वस्तु जितनी दूर, प्रतिबिंब उतना F के पास सरकता है और छोटा होता जाता है; **अनंत** पर रखी वस्तु का बिंदु-प्रतिबिंब ठीक **F पर** बनता है।",
  ),
  t(
    "This is the spoon held at arm's length: a small upside-down face. Drag the object far away and watch the image shrink into F.",
    "यह बाँह भर दूर पकड़ी चम्मच है: छोटा उल्टा चेहरा। वस्तु को दूर खींचो और देखो प्रतिबिंब सिकुड़कर F में समा जाता है।",
  ),
);

const caseAtC = casePage(
  "case-at-c",
  Place.AtCentre,
  t("Case 2: object at C", "स्थिति 2: वस्तु C पर"),
  t(
    "**Image at C: real, inverted, same size.** The one place where the mirror neither enlarges nor shrinks.",
    "**प्रतिबिंब C पर: वास्तविक, उल्टा, बराबर आकार।** अकेली जगह जहाँ दर्पण न बड़ा करता है न छोटा।",
  ),
  t(
    "Object and image stand on the same spot, one up and one down. Nudge the object a little either way and see which side the image goes to.",
    "वस्तु और प्रतिबिंब एक ही जगह खड़े हैं, एक ऊपर और एक नीचे। वस्तु को थोड़ा इधर-उधर खिसकाओ और देखो प्रतिबिंब किस ओर जाता है।",
  ),
);

const caseBetweenCF = casePage(
  "case-between-c-f",
  Place.BetweenCentreAndFocus,
  t("Case 3: object between C and F", "स्थिति 3: वस्तु C और F के बीच"),
  t(
    "**Image beyond C: real, inverted, enlarged.** Case 1 run backwards: object and image have swapped places.",
    "**प्रतिबिंब C से परे: वास्तविक, उल्टा, बड़ा।** स्थिति 1 उल्टी: वस्तु और प्रतिबिंब ने जगह बदल ली है।",
  ),
  t(
    "This is how a concave mirror throws a large picture of a small object onto a screen. The closer the object gets to F, the bigger and farther the image.",
    "ऐसे ही अवतल दर्पण छोटी वस्तु की बड़ी तस्वीर पर्दे पर डालता है। वस्तु F के जितने पास, प्रतिबिंब उतना बड़ा और दूर।",
  ),
);

const caseAtF = casePage(
  "case-at-f",
  Place.AtFocus,
  t("Case 4: object at F", "स्थिति 4: वस्तु F पर"),
  t(
    "**Image at infinity: real, inverted, highly enlarged.** The reflected rays come out parallel; they never meet, so no image arrow is drawn.",
    "**प्रतिबिंब अनंत पर: वास्तविक, उल्टा, बहुत बड़ा।** परावर्तित किरणें समानांतर निकलती हैं; वे कभी नहीं मिलतीं, इसलिए प्रतिबिंब का तीर नहीं बना।",
  ),
  t(
    "This is case 1 of the previous concept run backwards: light from F leaves parallel. It is also why a torch bulb sits at the focus of its reflector: the beam comes out straight.",
    "यह पिछली अवधारणा की स्थिति 1 उल्टी है: F से आया प्रकाश समानांतर निकलता है। इसीलिए टॉर्च का बल्ब अपने परावर्तक के फोकस पर बैठता है: किरण-पुंज सीधा निकलता है।",
  ),
);

const caseInsideF = casePage(
  "case-inside-f",
  Place.BetweenFocusAndPole,
  t("Case 5: object between F and P", "स्थिति 5: वस्तु F और P के बीच"),
  t(
    "**Image behind the mirror: virtual, erect, enlarged.** The reflected rays spread apart; the image is where their dashed extensions meet.",
    "**प्रतिबिंब दर्पण के पीछे: आभासी, सीधा, बड़ा।** परावर्तित किरणें फैल जाती हैं; प्रतिबिंब वहाँ है जहाँ उनके बिंदुदार विस्तार मिलते हैं।",
  ),
  t(
    "The spoon close to your face, and a shaving mirror: a large face the right way up. It can't be caught on a screen, because no light actually goes behind the mirror.",
    "चेहरे के पास की चम्मच, और शेविंग दर्पण: बड़ा, सीधा चेहरा। इसे पर्दे पर नहीं लिया जा सकता, क्योंकि प्रकाश सचमुच दर्पण के पीछे नहीं जाता।",
  ),
);

/** The six cases in one table, the way the textbook has it. */
const summary = page("summary", (b) => {
  const w = wordsOn(b);
  const row = (en: string, hi: string) => w.body(t(en, hi));
  return column([
    w.title(t("All six cases", "सभी छह स्थितियाँ")),
    w.body(
      t(
        "Read the table top to bottom and watch the pattern: as the object comes in from infinity, the image goes out from F, passes C when the object does, runs off to infinity when the object reaches F, and then reappears behind the mirror, erect.",
        "तालिका को ऊपर से नीचे पढ़ो और पैटर्न देखो: जैसे-जैसे वस्तु अनंत से अंदर आती है, प्रतिबिंब F से बाहर जाता है, वस्तु के साथ C को पार करता है, वस्तु के F पर पहुँचते ही अनंत में चला जाता है, और फिर दर्पण के पीछे सीधा प्रकट होता है।",
      ),
    ),
    row(
      "**At infinity** → image at F: real, inverted, highly diminished (a point)",
      "**अनंत पर** → प्रतिबिंब F पर: वास्तविक, उल्टा, बहुत छोटा (एक बिंदु)",
    ),
    row(
      "**Beyond C** → between F and C: real, inverted, diminished",
      "**C से परे** → F और C के बीच: वास्तविक, उल्टा, छोटा",
    ),
    row("**At C** → at C: real, inverted, same size", "**C पर** → C पर: वास्तविक, उल्टा, बराबर आकार"),
    row(
      "**Between C and F** → beyond C: real, inverted, enlarged",
      "**C और F के बीच** → C से परे: वास्तविक, उल्टा, बड़ा",
    ),
    row(
      "**At F** → at infinity: real, inverted, highly enlarged",
      "**F पर** → अनंत पर: वास्तविक, उल्टा, बहुत बड़ा",
    ),
    row(
      "**Between F and P** → behind the mirror: virtual, erect, enlarged",
      "**F और P के बीच** → दर्पण के पीछे: आभासी, सीधा, बड़ा",
    ),
    w.definition(
      t(
        "Two things to carry away. **Real images are always inverted; the one virtual image is erect.** And **the image is enlarged whenever the object is closer than C.**",
        "दो बातें साथ ले जाओ। **वास्तविक प्रतिबिंब हमेशा उल्टे होते हैं; अकेला आभासी प्रतिबिंब सीधा है।** और **प्रतिबिंब तब-तब बड़ा होता है जब वस्तु C से पास हो।**",
      ),
    ),
    space(),
  ]);
});

/** Example: an object at twice the focal length. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**A 3 cm tall object is placed 30 cm in front of a concave mirror of focal length 15 cm. Describe the image, with a ray diagram.**",
        "**3 सेमी ऊँची वस्तु 15 सेमी फोकस दूरी वाले अवतल दर्पण के सामने 30 सेमी पर रखी है। किरण आरेख के साथ प्रतिबिंब का वर्णन करो।**",
      ),
    ),
    w.body(
      t(
        "First find where the object stands. The focal length is 15 cm, so C is at 2 × 15 = 30 cm. The object is 30 cm away: it is **at C**, case 2.",
        "पहले देखो वस्तु कहाँ खड़ी है। फोकस दूरी 15 सेमी है, इसलिए C, 2 × 15 = 30 सेमी पर है। वस्तु 30 सेमी दूर है: वह **C पर** है, स्थिति 2।",
      ),
    ),
    w.body(
      t(
        "Draw the mirror, the axis, P, F at 15 cm and C at 30 cm, and the object standing on C. From its tip draw the parallel ray, reflected through F, and the ray through F, reflected parallel. They cross at C, below the axis. So the image is **at C, 30 cm in front: real, inverted, and the same size, 3 cm tall**.",
        "दर्पण, अक्ष, P, 15 सेमी पर F और 30 सेमी पर C बनाओ, और वस्तु C पर खड़ी करो। उसकी नोक से समानांतर किरण बनाओ, जो F से होकर परावर्तित होती है, और F से होकर जाने वाली किरण, जो समानांतर परावर्तित होती है। वे C पर, अक्ष के नीचे मिलती हैं। इसलिए प्रतिबिंब **C पर, 30 सेमी सामने: वास्तविक, उल्टा, और बराबर आकार, 3 सेमी ऊँचा** है।",
      ),
    ),
    space(),
  ]);
});

/** Question: the nature of the image for an object between C and F. */
const questionNature = page(
  "question-nature",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "nature",
      prompt: t(
        "An object is placed 18 cm in front of a concave mirror of focal length 12 cm. The image is…",
        "12 सेमी फोकस दूरी वाले अवतल दर्पण के सामने 18 सेमी पर वस्तु रखी है। प्रतिबिंब है…",
      ),
      options: [
        {
          id: "small",
          label: t("real, inverted, diminished", "वास्तविक, उल्टा, छोटा"),
          feedback: t(
            "That is an object beyond C. Here C is at 24 cm and the object is at 18 cm, inside C.",
            "यह C से परे वाली वस्तु है। यहाँ C, 24 सेमी पर है और वस्तु 18 सेमी पर, C के अंदर।",
          ),
        },
        { id: "big", label: t("real, inverted, enlarged", "वास्तविक, उल्टा, बड़ा") },
        {
          id: "virtual",
          label: t("virtual, erect, enlarged", "आभासी, सीधा, बड़ा"),
          feedback: t(
            "A virtual image needs the object inside F, closer than 12 cm. At 18 cm it is between F and C.",
            "आभासी प्रतिबिंब के लिए वस्तु F के अंदर, 12 सेमी से पास, चाहिए। 18 सेमी पर वह F और C के बीच है।",
          ),
        },
      ],
      answer: "big",
    });
    return column([w.title(t("Question", "प्रश्न")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Question: where to put an object for a given use. */
const questionUse = page(
  "question-use",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "use",
      prompt: t(
        "You want a concave mirror to give an erect, enlarged image of your face. Where should your face be?",
        "तुम चाहते हो कि अवतल दर्पण तुम्हारे चेहरे का सीधा, बड़ा प्रतिबिंब दे। चेहरा कहाँ होना चाहिए?",
      ),
      options: [
        {
          id: "beyond",
          label: t("Beyond C", "C से परे"),
          feedback: t(
            "Beyond C the image is real and upside down, and smaller than you.",
            "C से परे प्रतिबिंब वास्तविक और उल्टा होता है, और तुमसे छोटा।",
          ),
        },
        {
          id: "between",
          label: t("Between C and F", "C और F के बीच"),
          feedback: t(
            "Enlarged, yes, but real and inverted. The only erect image comes from inside F.",
            "बड़ा तो है, पर वास्तविक और उल्टा। अकेला सीधा प्रतिबिंब F के अंदर से बनता है।",
          ),
        },
        { id: "inside", label: t("Between F and P", "F और P के बीच") },
      ],
      answer: "inside",
    });
    return column([w.title(t("Question", "प्रश्न")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [
  story,
  rules,
  caseBeyondC,
  caseAtC,
  caseBetweenCF,
  caseAtF,
  caseInsideF,
  summary,
  example,
  questionNature,
  questionUse,
];
