import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ComboAction, ComboKind, SolidsSceneKind } from "@chalk/prop-solids";
import { comboOn, revealAll, sceneOn, termsOf } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's lattus, and Kabir's wrong first try at the paint. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const shop = sceneOn(
    b,
    "shop",
    SolidsSceneKind.Workshop,
    "Grandpa's workshop: a row of unpainted wooden lattus, each a cone on a hemisphere",
  );
  return column([
    w.title(t("How much paint for a lattu?", "एक लट्टू के लिए कितना पेंट?")),
    shop,
    w.body(
      t(
        "Grandpa's lattus are a cone stuck on a hemisphere, the flat faces glued together. Kabir has to buy paint for twenty of them. He works out the total surface area of the cone, adds the total surface area of the hemisphere, and multiplies by twenty.",
        "दादाजी के लट्टू एक अर्धगोले पर चिपका शंकु हैं, सपाट फलक आपस में चिपके हुए। कबीर को इनमें से बीस के लिए पेंट ख़रीदना है। वह शंकु का कुल पृष्ठीय क्षेत्रफल निकालता है, उसमें अर्धगोले का कुल पृष्ठीय क्षेत्रफल जोड़ता है, और बीस से गुणा करता है।",
      ),
    ),
    w.body(
      t(
        "Riya looks over his sum. \"You're paying for paint on two circles that nobody will ever see. They're glued together, inside the toy.\" So how do you find the surface of a joined solid?",
        'रिया उसका जोड़ देखती है। "तुम दो ऐसे वृत्तों के पेंट के पैसे दे रहे हो जिन्हें कोई कभी नहीं देखेगा। वे आपस में चिपके हैं, खिलौने के अंदर।" तो जुड़े हुए ठोस का पृष्ठ कैसे निकालें?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The idea: break the solid into basic ones; only the faces still showing count. */
const joined = page(
  "joined",
  (b) => {
    const w = wordsOn(b);
    const capsule = comboOn(
      b,
      "capsule",
      { kind: ComboKind.Capsule, canReveal: false },
      "a capsule shape: a cylinder with a hemisphere stuck on each end, which can be pulled apart and joined",
    );
    const goal = goalQuestion(b, {
      about: capsule,
      prompt: t(
        "Pull the parts apart, and look at the faces that were hidden where they joined.",
        "भागों को अलग करो, और उन फलकों को देखो जो जोड़ पर छिपे हुए थे।",
      ),
      isMet: capsule.field("isApart").eq(true),
      solve: [capsule.learner(ComboAction.Split, { apart: true })],
    });
    return column([
      w.title(t("Breaking a solid into pieces", "ठोस को टुकड़ों में तोड़ना")),
      w.body(
        t(
          "A milk tanker's container, a test tube, a medicine capsule: none of these is one of the basic solids. But each is made of basic solids **joined** together. The capsule is a cylinder with a hemisphere stuck on each end.",
          "दूध के टैंकर का कंटेनर, परखनली, दवा का कैप्सूल: इनमें से कोई भी मूल ठोस नहीं है। पर हर एक मूल ठोसों को **जोड़कर** बना है। कैप्सूल एक बेलन है जिसके हर सिरे पर एक अर्धगोला चिपका है।",
        ),
      ),
      capsule,
      goal,
      w.definition(
        t(
          "**Surface area of a combination.** When two solids are joined face to face, the faces that touch go inside and are no longer part of the surface. So the surface area of the new solid is the area of the parts that **still show**, not the sum of the parts' total surface areas.",
          "**संयोजन का पृष्ठीय क्षेत्रफल।** जब दो ठोस फलक से फलक जोड़े जाते हैं, तो छूने वाले फलक अंदर चले जाते हैं और पृष्ठ का हिस्सा नहीं रहते। इसलिए नए ठोस का पृष्ठीय क्षेत्रफल उन भागों का क्षेत्रफल है जो **अब भी दिखते** हैं, भागों के कुल पृष्ठीय क्षेत्रफलों का योग नहीं।",
        ),
      ),
      w.body(
        t(
          r`For the capsule, only the three curved surfaces show: $$\text{TSA} = \text{CSA of hemisphere}$$ $$+ \text{CSA of cylinder}$$ $$+ \text{CSA of hemisphere}$$`,
          r`कैप्सूल में केवल तीन वक्र पृष्ठ दिखते हैं: $$\text{TSA} = \text{अर्धगोले का CSA}$$ $$+ \text{बेलन का CSA}$$ $$+ \text{अर्धगोले का CSA}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 1: the lattu, worked term by term. */
const lattu = page(
  "lattu",
  (b) => {
    const w = wordsOn(b);
    const top = comboOn(
      b,
      "top",
      { kind: ComboKind.Lattu, canSplit: true },
      "Example 1's top: a cone on a hemisphere, 5 cm tall and 3.5 cm across, with its surface area built up term by term",
    );
    const n = termsOf(ComboKind.Lattu);
    const goal = goalQuestion(b, {
      about: top,
      prompt: t(
        "Build the area to colour, one term at a time, until the total shows.",
        "रंगने वाला क्षेत्रफल एक-एक पद करके बनाओ, जब तक कुल न दिख जाए।",
      ),
      isMet: top.field("revealed").eq(n),
      solve: revealAll(top, n),
    });
    return column([
      w.title(t("Example 1: Rasheed's top", "उदाहरण 1: रशीद का लट्टू")),
      w.body(
        t(
          r`Rasheed's top is a cone on a hemisphere. The whole top is 5 cm high and 3.5 cm across. ($\pi = \tfrac{22}{7}$.) Only the hemisphere's curved surface and the cone's curved surface show: $$\text{TSA} = \text{CSA of hemisphere} + \text{CSA of cone}$$`,
          r`रशीद का लट्टू एक अर्धगोले पर शंकु है। पूरा लट्टू 5 cm ऊँचा और 3.5 cm चौड़ा है। ($\pi = \tfrac{22}{7}$।) केवल अर्धगोले का वक्र पृष्ठ और शंकु का वक्र पृष्ठ दिखते हैं: $$\text{TSA} = \text{अर्धगोले का CSA} + \text{शंकु का CSA}$$`,
        ),
      ),
      top,
      goal,
      w.body(
        t(
          r`The radius is $r = 1.75$ cm. The cone's height is the whole height minus the hemisphere's: $$h = 5 - 1.75 = 3.25 \text{ cm}$$ $$l = \sqrt{1.75^2 + 3.25^2} \approx 3.7 \text{ cm}$$ $$\text{TSA} = 2\pi r^2 + \pi r l$$ $$= \tfrac{22}{7} \times 1.75\,(3.5 + 3.7) \approx 39.6 \text{ cm}^2$$ Grandpa's lattus are exactly this size.`,
          r`त्रिज्या $r = 1.75$ cm है। शंकु की ऊँचाई पूरी ऊँचाई घटा अर्धगोले की ऊँचाई है: $$h = 5 - 1.75 = 3.25 \text{ cm}$$ $$l = \sqrt{1.75^2 + 3.25^2} \approx 3.7 \text{ cm}$$ $$\text{TSA} = 2\pi r^2 + \pi r l$$ $$= \tfrac{22}{7} \times 1.75\,(3.5 + 3.7) \approx 39.6 \text{ cm}^2$$ दादाजी के लट्टू ठीक इसी माप के हैं।`,
        ),
      ),
      w.note(
        t(
          "The top's total surface area is not the cone's total plus the hemisphere's total: the circle where they join is left out.",
          "लट्टू का कुल पृष्ठीय क्षेत्रफल शंकु के कुल और अर्धगोले के कुल का योग नहीं है: जोड़ वाला वृत्त छोड़ दिया जाता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2: a small solid on a bigger face; take the covered circle away. */
const block = page(
  "block",
  (b) => {
    const w = wordsOn(b);
    const cube = comboOn(
      b,
      "cube",
      { kind: ComboKind.Block },
      "Example 2's decorative block: a cube of edge 5 cm with a hemisphere 4.2 cm across fixed on top",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        r`Why is the block's area $150 - \pi r^2 + 2\pi r^2$, and not $150 + 2\pi r^2$?`,
        r`ब्लॉक का क्षेत्रफल $150 - \pi r^2 + 2\pi r^2$ क्यों है, $150 + 2\pi r^2$ क्यों नहीं?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            "The hemisphere covers a circle of the cube's top face",
            "अर्धगोला घन के ऊपरी फलक का एक वृत्त ढक लेता है",
          ),
        },
        {
          id: "flat",
          label: t(
            "The hemisphere's own flat face also shows on top",
            "अर्धगोले का अपना सपाट फलक भी ऊपर दिखता है",
          ),
          feedback: t(
            "The hemisphere's flat face is glued down onto the cube: it doesn't show either.",
            "अर्धगोले का सपाट फलक घन पर चिपका है: वह भी नहीं दिखता।",
          ),
        },
        {
          id: "curve",
          label: t(
            "The curved part needs less paint than its formula says",
            "वक्र भाग को सूत्र से कम पेंट चाहिए",
          ),
          feedback: t(
            r`The curved part is exactly $2\pi r^2$. The $-\pi r^2$ is the bit of the cube's face that got covered.`,
            r`वक्र भाग ठीक $2\pi r^2$ है। $-\pi r^2$ घन के फलक का वह भाग है जो ढक गया।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 2: a dome on a cube", "उदाहरण 2: घन पर गुंबद")),
      w.body(
        t(
          "When a smaller solid sits on a bigger flat face, it covers a circle of that face. The cube's face loses that circle, and the hemisphere adds its curved surface.",
          "जब कोई छोटा ठोस किसी बड़े सपाट फलक पर बैठता है, तो वह उस फलक का एक वृत्त ढक लेता है। घन का फलक वह वृत्त खो देता है, और अर्धगोला अपना वक्र पृष्ठ जोड़ता है।",
        ),
      ),
      cube,
      w.body(
        t(
          r`The cube's TSA is $6 \times 5^2 = 150 \text{ cm}^2$, and $r = 2.1$ cm: $$\text{TSA} = 150 - \pi r^2 + 2\pi r^2 = 150 + \pi r^2$$ $$= 150 + \tfrac{22}{7} \times 2.1 \times 2.1 = 150 + 13.86$$ $$= 163.86 \text{ cm}^2$$`,
          r`घन का TSA $6 \times 5^2 = 150 \text{ cm}^2$ है, और $r = 2.1$ cm: $$\text{TSA} = 150 - \pi r^2 + 2\pi r^2 = 150 + \pi r^2$$ $$= 150 + \tfrac{22}{7} \times 2.1 \times 2.1 = 150 + 13.86$$ $$= 163.86 \text{ cm}^2$$`,
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 4: a hollow is surface too. */
const hollow = page(
  "hollow",
  (b) => {
    const w = wordsOn(b);
    const bath = comboOn(
      b,
      "bath",
      { kind: ComboKind.BirdBath },
      "Example 4's bird-bath: a cylinder 1.45 m high and 30 cm in radius, with a hemispherical hollow scooped out of the top",
    );
    const n = termsOf(ComboKind.BirdBath);
    const goal = goalQuestion(b, {
      about: bath,
      prompt: t(
        "Build the bird-bath's surface area term by term.",
        "चिड़ियों के स्नान-पात्र का पृष्ठीय क्षेत्रफल पद-पद करके बनाओ।",
      ),
      isMet: bath.field("revealed").eq(n),
      solve: revealAll(bath, n),
    });
    return column([
      w.title(t("Example 4: a hollow counts too", "उदाहरण 4: खोखला भाग भी गिना जाता है")),
      w.body(
        t(
          "Mayank's bird-bath is a cylinder with a hemispherical hollow scooped out of its top. The top circle is gone, but the inside of the hollow is now surface: water and birds touch it.",
          "मयंक का चिड़ियों का स्नान-पात्र एक बेलन है जिसके ऊपर से एक अर्धगोलाकार गड्ढा निकाला गया है। ऊपर का वृत्त चला गया, पर गड्ढे का अंदरूनी भाग अब पृष्ठ है: पानी और चिड़ियाँ उसे छूते हैं।",
        ),
      ),
      bath,
      goal,
      w.body(
        t(
          r`With $h = 145$ cm and $r = 30$ cm: $$\text{TSA} = 2\pi r h + 2\pi r^2 = 2\pi r(h + r)$$ $$= 2 \times \tfrac{22}{7} \times 30 \times 175 = 33000 \text{ cm}^2$$ $$= 3.3 \text{ m}^2$$`,
          r`$h = 145$ cm और $r = 30$ cm से: $$\text{TSA} = 2\pi r h + 2\pi r^2 = 2\pi r(h + r)$$ $$= 2 \times \tfrac{22}{7} \times 30 \times 175 = 33000 \text{ cm}^2$$ $$= 3.3 \text{ m}^2$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Example 3: Kabir paints the rocket in two colours. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const paint = sceneOn(
      b,
      "paint",
      SolidsSceneKind.RocketPaint,
      "Kabir painting Grandpa's toy rocket: the cone on top orange, the cylinder body yellow",
    );
    const rocket = comboOn(
      b,
      "rocket",
      { kind: ComboKind.Rocket },
      "Example 3's rocket: a cone 6 cm high and 5 cm across on a cylinder 20 cm high and 3 cm across, with each colour's area built up",
    );
    const n = termsOf(ComboKind.Rocket);
    const goal = goalQuestion(b, {
      about: rocket,
      prompt: t(
        "Work out both colours: show every term.",
        "दोनों रंगों का क्षेत्रफल निकालो: हर पद दिखाओ।",
      ),
      isMet: rocket.field("revealed").eq(n),
      solve: revealAll(rocket, n),
    });
    return column([
      w.title(t("Kabir paints the rocket", "कबीर रॉकेट रंगता है")),
      paint,
      w.body(
        t(
          r`So twenty lattus need $20 \times 39.6 = 792 \text{ cm}^2$ of paint, not the 20 × (two full TSAs) Kabir first worked out. Riya was right about the hidden faces. Grandpa's rocket (Example 3, $\pi = 3.14$) is a cone, 6 cm high and 5 cm across, on a thinner cylinder 20 cm high and 3 cm across. The cone's base is wider than the cylinder, so a **ring** of the cone's base shows and gets painted orange.`,
          r`तो बीस लट्टुओं को $20 \times 39.6 = 792 \text{ cm}^2$ पेंट चाहिए, न कि 20 × (दो पूरे TSA) जो कबीर ने पहले निकाला था। छिपे फलकों के बारे में रिया सही थी। दादाजी का रॉकेट (उदाहरण 3, $\pi = 3.14$) एक शंकु है, 6 cm ऊँचा और 5 cm चौड़ा, जो 20 cm ऊँचे और 3 cm चौड़े पतले बेलन पर रखा है। शंकु का आधार बेलन से चौड़ा है, इसलिए शंकु के आधार का एक **छल्ला** दिखता है और नारंगी रंगा जाता है।`,
        ),
      ),
      rocket,
      goal,
      w.body(
        t(
          r`With $r = 2.5$, $l = 6.5$ and $r' = 1.5$: $$\text{orange} = \pi r l + \pi r^2 - \pi r'^2$$ $$= 3.14 \times 20.25 = 63.585 \text{ cm}^2$$ $$\text{yellow} = 2\pi r' h' + \pi r'^2 = 4.71 \times 41.5$$ $$= 195.465 \text{ cm}^2$$`,
          r`$r = 2.5$, $l = 6.5$ और $r' = 1.5$ से: $$\text{नारंगी} = \pi r l + \pi r^2 - \pi r'^2$$ $$= 3.14 \times 20.25 = 63.585 \text{ cm}^2$$ $$\text{पीला} = 2\pi r' h' + \pi r'^2 = 4.71 \times 41.5$$ $$= 195.465 \text{ cm}^2$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 13.1 Q1 and Q6, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const cubes = choiceQuestion(b, {
      name: "cubes",
      prompt: t(
        "Exercise 13.1 Q1. Two cubes, each of volume 64 cm³, are joined end to end. The surface area of the cuboid formed is",
        "प्रश्नावली 13.1 प्र1। 64 cm³ आयतन वाले दो घन सिरे से सिरा जोड़े जाते हैं। बने घनाभ का पृष्ठीय क्षेत्रफल है",
      ),
      options: [
        { id: "right", label: t("160 cm²", "160 cm²") },
        {
          id: "192",
          label: t("192 cm²", "192 cm²"),
          feedback: t(
            "That's 2 × 96, both cubes' totals. The two faces glued together are hidden: 192 − 2 × 16.",
            "यह 2 × 96 है, दोनों घनों का कुल। आपस में चिपके दो फलक छिप जाते हैं: 192 − 2 × 16।",
          ),
        },
        {
          id: "176",
          label: t("176 cm²", "176 cm²"),
          feedback: t(
            "Only one face was taken away. Each cube loses a face where they touch: two faces of 16 cm².",
            "केवल एक फलक घटाया। छूने की जगह हर घन एक फलक खोता है: 16 cm² के दो फलक।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const capsule = choiceQuestion(b, {
      name: "capsule",
      prompt: t(
        "Exercise 13.1 Q6. A capsule is 14 mm long and 5 mm across (a cylinder with a hemisphere at each end). Its surface area is",
        "प्रश्नावली 13.1 प्र6। एक कैप्सूल 14 mm लंबा और 5 mm चौड़ा है (बेलन जिसके हर सिरे पर अर्धगोला है)। उसका पृष्ठीय क्षेत्रफल है",
      ),
      options: [
        { id: "right", label: t("220 mm²", "220 mm²") },
        {
          id: "299",
          label: t("298.6 mm²", "298.6 mm²"),
          feedback: t(
            "That used the whole 14 mm as the cylinder. The cylinder is 14 − 2.5 − 2.5 = 9 mm long.",
            "इसमें पूरे 14 mm को बेलन लिया। बेलन 14 − 2.5 − 2.5 = 9 mm लंबा है।",
          ),
        },
        {
          id: "180",
          label: t("180.7 mm²", "180.7 mm²"),
          feedback: t(
            r`That's two hemispheres counted as one: the two ends together make a whole sphere, $4\pi r^2$.`,
            r`इसमें दो अर्धगोलों को एक गिना: दोनों सिरे मिलकर पूरा गोला, $4\pi r^2$, बनाते हैं।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A joined solid's surface is only what still shows: glued faces go, covered circles are taken away, hollows are added. ✓ One lattu needs about 39.6 cm² of paint, and the rocket 63.585 cm² orange and 195.465 cm² yellow. ✗ Mom still doesn't know how much syrup her gulab jamuns hold. Next stop: filling joined solids.",
        "**मिशन लॉग।** ✓ जुड़े ठोस का पृष्ठ केवल वह है जो अब भी दिखता है: चिपके फलक हटते हैं, ढके वृत्त घटते हैं, गड्ढे जुड़ते हैं। ✓ एक लट्टू को लगभग 39.6 cm² पेंट चाहिए, और रॉकेट को 63.585 cm² नारंगी और 195.465 cm² पीला। ✗ मम्मी अभी नहीं जानतीं कि उनके गुलाब जामुनों में कितनी चाशनी आती है। अगला पड़ाव: जुड़े ठोसों को भरना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(cubes.on(QuestionSignal.Correct), theBoard.show(capsule));
    b.when(capsule.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: Exercise 13.1 Q5.** A hemisphere of diameter $l$ is scooped out of one face of a cube of edge $l$. The face loses a circle of radius $\tfrac{l}{2}$, and the hollow adds a curved surface: $$\text{SA} = 6l^2 - \pi\left(\tfrac{l}{2}\right)^2 + 2\pi\left(\tfrac{l}{2}\right)^2$$ $$= 6l^2 + \tfrac{\pi l^2}{4} = \tfrac{l^2}{4}(24 + \pi)$$`,
          r`**हल किया हुआ: प्रश्नावली 13.1 प्र5।** किनारे $l$ वाले घन के एक फलक से व्यास $l$ का अर्धगोला निकाला जाता है। फलक त्रिज्या $\tfrac{l}{2}$ का वृत्त खोता है, और गड्ढा एक वक्र पृष्ठ जोड़ता है: $$\text{SA} = 6l^2 - \pi\left(\tfrac{l}{2}\right)^2 + 2\pi\left(\tfrac{l}{2}\right)^2$$ $$= 6l^2 + \tfrac{\pi l^2}{4} = \tfrac{l^2}{4}(24 + \pi)$$`,
        ),
      ),
      cubes,
      capsule,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, joined, lattu, block, hollow, inLife, yourTurn];
