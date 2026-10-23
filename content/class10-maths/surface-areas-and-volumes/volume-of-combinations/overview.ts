import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ComboKind, SolidsSceneKind, Sum } from "@chalk/prop-solids";
import { comboOn, revealAll, sceneOn, termsOf } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Mom's syrup: how much fits inside the sweets? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const kitchen = sceneOn(
    b,
    "kitchen",
    SolidsSceneKind.Kitchen,
    "Mom's kitchen: gulab jamuns, each a cylinder with rounded ends, in a bowl of syrup; Mom stirs and Riya counts",
  );
  return column([
    w.title(t("How much syrup?", "कितनी चाशनी?")),
    kitchen,
    w.body(
      t(
        "Mom is making 45 gulab jamuns for the stall. Each soaks up syrup until about 30% of it is syrup. If she boils too little, the last tray stays dry; too much, and the sugar is wasted.",
        "मम्मी स्टॉल के लिए 45 गुलाब जामुन बना रही हैं। हर एक इतनी चाशनी सोखता है कि उसका लगभग 30% चाशनी हो जाता है। चाशनी कम बनी तो आख़िरी ट्रे सूखी रह जाएगी; ज़्यादा बनी तो चीनी बेकार।",
      ),
    ),
    w.body(
      t(
        "A gulab jamun isn't a sphere or a cylinder: it's a cylinder with rounded ends. To fill it, we need the **space inside** a joined solid, not its surface.",
        "गुलाब जामुन न गोला है न बेलन: यह गोल सिरों वाला बेलन है। इसे भरने के लिए हमें जुड़े हुए ठोस के **अंदर की जगह** चाहिए, उसका पृष्ठ नहीं।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Volumes add: nothing is lost where solids join. */
const add = page(
  "add",
  (b) => {
    const w = wordsOn(b);
    const solid = comboOn(
      b,
      "solid",
      { kind: ComboKind.ConeOnDome, sum: Sum.Volume },
      "Exercise 13.2 Q1's solid: a cone on a hemisphere, both of radius 1 cm, the cone 1 cm high, with its volume built up term by term",
    );
    const n = termsOf(ComboKind.ConeOnDome, Sum.Volume);
    const goal = goalQuestion(b, {
      about: solid,
      prompt: t("Build the volume: show every term.", "आयतन बनाओ: हर पद दिखाओ।"),
      isMet: solid.field("revealed").eq(n),
      solve: revealAll(solid, n),
    });
    return column([
      w.title(t("Volumes simply add", "आयतन सीधे जुड़ते हैं")),
      w.definition(
        t(
          "**Volume of a combination.** When solids are joined, the faces that touch disappear from the surface, but no space disappears. So the volume of the new solid is the **sum of the volumes** of its parts. A part that is hollowed out is taken away.",
          "**संयोजन का आयतन।** ठोस जोड़ने पर छूने वाले फलक पृष्ठ से ग़ायब हो जाते हैं, पर कोई जगह ग़ायब नहीं होती। इसलिए नए ठोस का आयतन उसके भागों के **आयतनों का योग** है। जो भाग खोखला किया गया हो, वह घटा दिया जाता है।",
        ),
      ),
      solid,
      goal,
      w.body(
        t(
          r`With $r = h = 1$ cm: $$V = \tfrac{2}{3}\pi r^3 + \tfrac{1}{3}\pi r^2 h = \tfrac{2}{3}\pi + \tfrac{1}{3}\pi$$ $$= \pi \text{ cm}^3$$`,
          r`$r = h = 1$ cm से: $$V = \tfrac{2}{3}\pi r^3 + \tfrac{1}{3}\pi r^2 h = \tfrac{2}{3}\pi + \tfrac{1}{3}\pi$$ $$= \pi \text{ cm}^3$$`,
        ),
      ),
      w.body(
        t(
          r`**Example 5: Shanta's shed.** The shed is a cuboid 15 m × 7 m × 8 m with a half cylinder on top (diameter 7 m, length 15 m): $$V = 15 \times 7 \times 8 + \tfrac{1}{2} \times \tfrac{22}{7} \times \tfrac{7}{2} \times \tfrac{7}{2} \times 15$$ $$= 1128.75 \text{ m}^3$$ The machinery takes 300 m³. Each worker takes up about 0.08 m³, so 20 workers take 20 × 0.08 = 1.6 m³, so the air left is $$1128.75 - (300.00 + 1.60)$$ $$= 827.15 \text{ m}^3$$`,
          r`**उदाहरण 5: शांता का शेड।** शेड 15 m × 7 m × 8 m का घनाभ है जिसके ऊपर आधा बेलन है (व्यास 7 m, लंबाई 15 m): $$V = 15 \times 7 \times 8 + \tfrac{1}{2} \times \tfrac{22}{7} \times \tfrac{7}{2} \times \tfrac{7}{2} \times 15$$ $$= 1128.75 \text{ m}^3$$ मशीनें 300 m³ लेती हैं। हर मज़दूर लगभग 0.08 m³ जगह घेरता है, तो 20 मज़दूर 20 × 0.08 = 1.6 m³ लेते हैं, तो बची हवा है $$1128.75 - (300.00 + 1.60)$$ $$= 827.15 \text{ m}^3$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 6: the juice glass; a raised bottom takes volume away. */
const glass = page(
  "glass",
  (b) => {
    const w = wordsOn(b);
    const cup = comboOn(
      b,
      "cup",
      { kind: ComboKind.Glass, sum: Sum.Volume },
      "Example 6's juice glass: a cylinder 10 cm high and 5 cm across inside, with a raised hemisphere in its bottom, its two capacities built up",
    );
    const n = termsOf(ComboKind.Glass, Sum.Volume);
    const goal = goalQuestion(b, {
      about: cup,
      prompt: t("Find both capacities: show every term.", "दोनों धारिताएँ निकालो: हर पद दिखाओ।"),
      isMet: cup.field("revealed").eq(n),
      solve: revealAll(cup, n),
    });
    return column([
      w.title(t("Example 6: the juice seller's glass", "उदाहरण 6: जूस वाले का गिलास")),
      w.body(
        t(
          r`A juice seller's glass looks like a cylinder 10 cm high, 5 cm across inside. But its bottom has a raised hemisphere, so it holds less than it seems. ($\pi = 3.14$.)`,
          r`एक जूस वाले का गिलास 10 cm ऊँचे, अंदर से 5 cm चौड़े बेलन जैसा दिखता है। पर उसकी तली में उभरा हुआ अर्धगोला है, इसलिए उसमें दिखने से कम आता है। ($\pi = 3.14$।)`,
        ),
      ),
      cup,
      goal,
      w.body(
        t(
          r`$$\text{apparent capacity} = \pi r^2 h$$ $$= 3.14 \times 2.5 \times 2.5 \times 10 = 196.25 \text{ cm}^3$$ $$\text{hemisphere} = \tfrac{2}{3}\pi r^3$$ $$= \tfrac{2}{3} \times 3.14 \times 2.5^3 = 32.71 \text{ cm}^3$$ $$\text{actual capacity} = 196.25 - 32.71$$ $$= 163.54 \text{ cm}^3$$`,
          r`$$\text{दिखने वाली धारिता} = \pi r^2 h$$ $$= 3.14 \times 2.5 \times 2.5 \times 10 = 196.25 \text{ cm}^3$$ $$\text{अर्धगोला} = \tfrac{2}{3}\pi r^3$$ $$= \tfrac{2}{3} \times 3.14 \times 2.5^3 = 32.71 \text{ cm}^3$$ $$\text{असली धारिता} = 196.25 - 32.71$$ $$= 163.54 \text{ cm}^3$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 7: a toy and the cylinder round it. */
const toy = page(
  "toy",
  (b) => {
    const w = wordsOn(b);
    const box = comboOn(
      b,
      "box",
      { kind: ComboKind.ToyInCylinder, sum: Sum.Volume },
      "Example 7: a toy (a cone 2 cm high on a hemisphere 4 cm across) inside the cylinder that just fits round it",
    );
    const tall = choiceQuestion(b, {
      name: "tall",
      prompt: t(
        "How tall is the cylinder that just fits round the toy?",
        "खिलौने के चारों ओर ठीक बैठने वाला बेलन कितना ऊँचा है?",
      ),
      options: [
        {
          id: "right",
          label: t("4 cm: the cone's 2 plus the radius 2", "4 cm: शंकु के 2 और त्रिज्या के 2"),
        },
        {
          id: "two",
          label: t("2 cm: the same as the cone's height", "2 cm: शंकु की ऊँचाई जितना"),
          feedback: t(
            "The hemisphere hangs below the cone, another 2 cm (its radius). The cylinder must hold both.",
            "अर्धगोला शंकु के नीचे और 2 cm (अपनी त्रिज्या) लटकता है। बेलन को दोनों समाने हैं।",
          ),
        },
        {
          id: "six",
          label: t("6 cm: the cone's 2 plus the width 4", "6 cm: शंकु के 2 और चौड़ाई के 4"),
          feedback: t(
            "A hemisphere is only half a sphere: it's as deep as its radius, 2 cm, not its diameter.",
            "अर्धगोला आधा गोला है: वह अपनी त्रिज्या, 2 cm, जितना गहरा है, व्यास जितना नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    const n = termsOf(ComboKind.ToyInCylinder, Sum.Volume);
    const goal = goalQuestion(b, {
      about: box,
      prompt: t(
        "Now build the toy's volume and the space left round it.",
        "अब खिलौने का आयतन और उसके चारों ओर बची जगह बनाओ।",
      ),
      isMet: box.field("revealed").eq(n),
      solve: revealAll(box, n),
    });
    return column([
      w.title(t("Example 7: the toy in its box", "उदाहरण 7: डिब्बे में खिलौना")),
      w.body(
        t(
          r`A solid toy is a cone 2 cm high on a hemisphere 4 cm across. A cylinder is made to just fit round it. How much empty space is left? ($\pi = 3.14$.)`,
          r`एक ठोस खिलौना 4 cm चौड़े अर्धगोले पर 2 cm ऊँचा शंकु है। उसके चारों ओर ठीक बैठने वाला बेलन बनाया जाता है। कितनी ख़ाली जगह बचती है? ($\pi = 3.14$।)`,
        ),
      ),
      box,
      tall,
      goal,
      w.body(
        t(
          r`With $r = 2$ cm: $$\text{toy} = \tfrac{2}{3}\pi r^3 + \tfrac{1}{3}\pi r^2 h$$ $$= \tfrac{2}{3} \times 3.14 \times 8 + \tfrac{1}{3} \times 3.14 \times 4 \times 2$$ $$= 25.12 \text{ cm}^3$$ $$\text{cylinder} - \text{toy}$$ $$= 3.14 \times 2^2 \times 4 - 25.12 = 25.12 \text{ cm}^3$$`,
          r`$r = 2$ cm से: $$\text{खिलौना} = \tfrac{2}{3}\pi r^3 + \tfrac{1}{3}\pi r^2 h$$ $$= \tfrac{2}{3} \times 3.14 \times 8 + \tfrac{1}{3} \times 3.14 \times 4 \times 2$$ $$= 25.12 \text{ cm}^3$$ $$\text{बेलन} - \text{खिलौना} = 3.14 \times 2^2 \times 4 - 25.12$$ $$= 25.12 \text{ cm}^3$$`,
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

/** Exercise 13.2 Q3: Mom's syrup, answered. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const jamun = comboOn(
      b,
      "jamun",
      { kind: ComboKind.GulabJamun, sum: Sum.Volume },
      "a gulab jamun: a cylinder with hemispherical ends, 5 cm long and 2.8 cm across, its volume built up term by term",
    );
    const n = termsOf(ComboKind.GulabJamun, Sum.Volume);
    const goal = goalQuestion(b, {
      about: jamun,
      prompt: t("Build one gulab jamun's volume.", "एक गुलाब जामुन का आयतन बनाओ।"),
      isMet: jamun.field("revealed").eq(n),
      solve: revealAll(jamun, n),
    });
    return column([
      w.title(t("Mom's syrup", "मम्मी की चाशनी")),
      w.body(
        t(
          "Back to the kitchen (Exercise 13.2 Q3). Each gulab jamun is 5 cm long and 2.8 cm across: a cylinder with a hemisphere at each end. The two ends make one whole sphere of radius 1.4 cm, and the cylinder between them is 5 − 2.8 = 2.2 cm long.",
          "वापस रसोई में (प्रश्नावली 13.2 प्र3)। हर गुलाब जामुन 5 cm लंबा और 2.8 cm चौड़ा है: एक बेलन जिसके हर सिरे पर अर्धगोला है। दोनों सिरे मिलकर त्रिज्या 1.4 cm का पूरा गोला बनाते हैं, और बीच का बेलन 5 − 2.8 = 2.2 cm लंबा है।",
        ),
      ),
      jamun,
      goal,
      w.body(
        t(
          r`$$\text{one} = \pi r^2 h + \tfrac{4}{3}\pi r^3$$ $$= \tfrac{22}{7}\left(1.96 \times 2.2 + \tfrac{4}{3} \times 2.744\right)$$ $$\approx 25.05 \text{ cm}^3$$ $$\text{syrup} = 45 \times 25.05 \times \tfrac{30}{100}$$ $$\approx 338 \text{ cm}^3$$ So Mom boils about 338 cm³ (a third of a litre) of syrup.`,
          r`$$\text{एक} = \pi r^2 h + \tfrac{4}{3}\pi r^3$$ $$= \tfrac{22}{7}\left(1.96 \times 2.2 + \tfrac{4}{3} \times 2.744\right)$$ $$\approx 25.05 \text{ cm}^3$$ $$\text{चाशनी} = 45 \times 25.05 \times \tfrac{30}{100}$$ $$\approx 338 \text{ cm}^3$$ तो मम्मी लगभग 338 cm³ (एक लीटर का तिहाई) चाशनी उबालती हैं।`,
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

/** Exercise 13.2 Q2 and Q6, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const model = choiceQuestion(b, {
      name: "model",
      prompt: t(
        "Exercise 13.2 Q2. Rachel's model is a cylinder with a cone at each end: 3 cm across, 12 cm long in all, each cone 2 cm high. The air inside is",
        "प्रश्नावली 13.2 प्र2। रेचल का मॉडल एक बेलन है जिसके हर सिरे पर शंकु है: 3 cm चौड़ा, कुल 12 cm लंबा, हर शंकु 2 cm ऊँचा। अंदर की हवा है",
      ),
      options: [
        { id: "right", label: t("66 cm³", "66 cm³") },
        {
          id: "94",
          label: t("94.3 cm³", "94.3 cm³"),
          feedback: t(
            "That took the cylinder as the full 12 cm. The cones use 2 cm at each end: the cylinder is 8 cm.",
            "इसमें बेलन को पूरा 12 cm लिया। शंकु हर सिरे पर 2 cm लेते हैं: बेलन 8 cm है।",
          ),
        },
        {
          id: "85",
          label: t("84.9 cm³", "84.9 cm³"),
          feedback: t(
            r`The cones were counted as cylinders. A cone holds a third: $\tfrac{1}{3}\pi r^2 h$.`,
            r`शंकुओं को बेलन गिना। शंकु में एक-तिहाई आता है: $\tfrac{1}{3}\pi r^2 h$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const pole = choiceQuestion(b, {
      name: "pole",
      prompt: t(
        "Exercise 13.2 Q6. An iron pole is a cylinder 220 cm high and 24 cm across, with a cylinder 60 cm high and 8 cm in radius on top. 1 cm³ of iron is 8 g (π = 3.14). The pole's mass is",
        "प्रश्नावली 13.2 प्र6। लोहे का एक खंभा 220 cm ऊँचा और 24 cm चौड़ा बेलन है, जिसके ऊपर 60 cm ऊँचा और 8 cm त्रिज्या वाला बेलन है। 1 cm³ लोहा 8 g का है (π = 3.14)। खंभे का द्रव्यमान है",
      ),
      options: [
        { id: "right", label: t("892.26 kg", "892.26 kg") },
        {
          id: "3280",
          label: t("3279.66 kg", "3279.66 kg"),
          feedback: t(
            "24 cm is the diameter: the radius is 12 cm, not 24.",
            "24 cm व्यास है: त्रिज्या 12 cm है, 24 नहीं।",
          ),
        },
        {
          id: "111",
          label: t("111.53 kg", "111.53 kg"),
          feedback: t(
            "That counts each of the 111532.8 cm³ as 1 g. Each cm³ is 8 g: multiply by 8.",
            "इसमें 111532.8 cm³ में से हर एक को 1 g गिना। हर cm³ 8 g है: 8 से गुणा करो।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Joined solids' volumes add; a hollow or raised part is taken away. ✓ Mom needs about 338 cm³ of syrup for 45 gulab jamuns. ✗ Kabir still doesn't know how many cones one can of kulfi fills. Next stop: changing a solid's shape.",
        "**मिशन लॉग।** ✓ जुड़े ठोसों के आयतन जुड़ते हैं; खोखला या उभरा भाग घटाया जाता है। ✓ मम्मी को 45 गुलाब जामुनों के लिए लगभग 338 cm³ चाशनी चाहिए। ✗ कबीर अभी नहीं जानता कि एक डिब्बे की कुल्फ़ी से कितने कोन भरेंगे। अगला पड़ाव: ठोस का आकार बदलना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(model.on(QuestionSignal.Correct), theBoard.show(pole));
    b.when(pole.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), model, pole, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, add, glass, toy, inLife, yourTurn];
