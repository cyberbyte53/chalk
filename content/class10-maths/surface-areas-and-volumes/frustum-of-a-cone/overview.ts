import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { FrustumAction, FrustumMeasure, SolidsSceneKind } from "@chalk/prop-solids";
import { frustumOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The jaggery moulds: cones with their tips cut off. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const yard = sceneOn(
    b,
    "yard",
    SolidsSceneKind.Jaggery,
    "the village yard: bubbling sugarcane juice, a metal bucket wider at the top, and jaggery moulds that are cones with their tips cut off",
  );
  return column([
    w.title(t("A cone with its tip cut off", "सिरा कटा शंकु")),
    yard,
    w.body(
      t(
        "In the village, Grandpa and Mom boil sugarcane juice into thick molasses and pour it into moulds to set as jaggery. Each mould is wide at the top, narrower at the bottom, and flat at both ends.",
        "गाँव में दादाजी और मम्मी गन्ने का रस उबालकर गाढ़ा शीरा बनाते हैं और उसे साँचों में डालते हैं ताकि वह गुड़ बनकर जम जाए। हर साँचा ऊपर चौड़ा, नीचे पतला, और दोनों सिरों पर सपाट है।",
      ),
    ),
    w.body(
      t(
        "It's not a cylinder (the ends differ) and not a cone (there's no point). The water bucket and the drinking glass have the same shape. How much does one mould hold?",
        "यह बेलन नहीं है (सिरे अलग हैं) और शंकु भी नहीं (कोई नोक नहीं)। पानी की बाल्टी और पीने का गिलास भी इसी आकार के हैं। एक साँचे में कितना आता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 1 and the definition. */
const cut = page(
  "cut",
  (b) => {
    const w = wordsOn(b);
    const cone = frustumOn(
      b,
      "cone",
      {},
      "a clay cone cut by a plane parallel to its base, the small cone on top lifted off to leave a frustum",
    );
    const goal = goalQuestion(b, {
      about: cone,
      prompt: t(
        "Cut the cone parallel to its base and lift the small cone off.",
        "शंकु को आधार के समांतर काटो और ऊपर का छोटा शंकु हटाओ।",
      ),
      isMet: cone.field("step").eq(3),
      solve: [0, 1, 2].map(() => cone.learner(FrustumAction.Step, {})),
    });
    return column([
      w.title(t("The frustum", "छिन्नक")),
      w.body(
        t(
          "**Activity 1.** Make a cone of clay. Cut it with a knife **parallel to its base**, and remove the small cone on top. What is left?",
          "**क्रियाकलाप 1।** मिट्टी का एक शंकु बनाओ। उसे चाकू से **आधार के समांतर** काटो, और ऊपर का छोटा शंकु हटा दो। क्या बचा?",
        ),
      ),
      cone,
      goal,
      w.definition(
        t(
          "**Frustum of a cone.** When a cone is cut by a plane parallel to its base and the small cone on one side is removed, the part left on the other side is a **frustum** of the cone. It has two circular ends of different radii, $r_1$ (the larger) and $r_2$. (Frustum is Latin for 'piece cut off'; the plural is frusta.)",
          "**शंकु का छिन्नक।** जब किसी शंकु को उसके आधार के समांतर तल से काटकर एक ओर का छोटा शंकु हटा दिया जाता है, तो दूसरी ओर बचा भाग शंकु का **छिन्नक** है। इसके दो वृत्ताकार सिरे हैं जिनकी त्रिज्याएँ अलग हैं, $r_1$ (बड़ी) और $r_2$। (Frustum लैटिन का शब्द है, अर्थ 'काटा हुआ टुकड़ा'; बहुवचन frusta।)",
        ),
      ),
      w.body(
        t(
          "The frustum's **height** $h$ is the straight distance between the two ends, and its **slant height** $l$ is measured along the sloping side.",
          "छिन्नक की **ऊँचाई** $h$ दोनों सिरों के बीच की सीधी दूरी है, और उसकी **तिर्यक ऊँचाई** $l$ ढलान वाली भुजा के साथ नापी जाती है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 12 the long way: big cone minus small cone. */
const longWay = page(
  "long-way",
  (b) => {
    const w = wordsOn(b);
    const ex = frustumOn(
      b,
      "ex",
      { step: 3, canPick: true },
      "Example 12's frustum: ends of radius 28 cm and 7 cm, 45 cm high, worked out as the big cone minus the small cone",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        r`Why is $\dfrac{h_1}{h_2} = \dfrac{28}{7}$?`,
        r`$\dfrac{h_1}{h_2} = \dfrac{28}{7}$ क्यों है?`,
      ),
      options: [
        {
          id: "right",
          label: t("The big and small cones' triangles are similar", "बड़े और छोटे शंकु के त्रिभुज समरूप हैं"),
        },
        {
          id: "half",
          label: t("The cut is made exactly halfway up the cone", "कटाव शंकु की ठीक आधी ऊँचाई पर है"),
          feedback: t(
            "The cut can be anywhere. What fixes the ratio is that the cut is parallel to the base.",
            "कटाव कहीं भी हो सकता है। अनुपात इसलिए तय है कि कटाव आधार के समांतर है।",
          ),
        },
        {
          id: "slant",
          label: t("The two cones have the same slant height", "दोनों शंकुओं की तिर्यक ऊँचाई बराबर है"),
          feedback: t(
            r`The big cone's slant height is 4 times the small one's too: $l_1 = 4 l_2$. That comes from the same similarity.`,
            r`बड़े शंकु की तिर्यक ऊँचाई भी छोटे की 4 गुना है: $l_1 = 4 l_2$। यह भी उसी समरूपता से आता है।`,
          ),
        },
      ],
      answer: "right",
    });
    const goal = goalQuestion(b, {
      about: ex,
      prompt: t(
        "Now switch the working to the curved surface area.",
        "अब हल को वक्र पृष्ठीय क्षेत्रफल पर बदलो।",
      ),
      isMet: ex.field("measure").eq(FrustumMeasure.Curved),
      solve: [ex.learner(FrustumAction.Pick, { measure: FrustumMeasure.Curved })],
    });
    return column([
      w.title(t("Example 12: big cone minus small cone", "उदाहरण 12: बड़ा शंकु घटा छोटा शंकु")),
      w.body(
        t(
          r`A frustum is 45 cm high, with ends of radius $r_1 = 28$ cm and $r_2 = 7$ cm. It is a big cone (height $h_1$) with a small cone (height $h_2$) taken off, so $h_1 = 45 + h_2$. The cut is parallel to the base, so the two cones' triangles are similar: $$\frac{h_1}{h_2} = \frac{28}{7} = 4 \quad\Rightarrow\quad h_2 = 15, \quad h_1 = 60$$`,
          r`एक छिन्नक 45 cm ऊँचा है, सिरों की त्रिज्याएँ $r_1 = 28$ cm और $r_2 = 7$ cm। यह एक बड़ा शंकु (ऊँचाई $h_1$) है जिसमें से छोटा शंकु (ऊँचाई $h_2$) हटाया गया है, इसलिए $h_1 = 45 + h_2$। कटाव आधार के समांतर है, इसलिए दोनों शंकुओं के त्रिभुज समरूप हैं: $$\frac{h_1}{h_2} = \frac{28}{7} = 4 \quad\Rightarrow\quad h_2 = 15, \quad h_1 = 60$$`,
        ),
      ),
      why,
      ex,
      w.body(
        t(
          r`$$V = \tfrac{1}{3} \cdot \tfrac{22}{7} \cdot 28^2 \cdot 60$$ $$- \tfrac{1}{3} \cdot \tfrac{22}{7} \cdot 7^2 \cdot 15$$ $$= 48510 \text{ cm}^3$$ $$l_2 = \sqrt{7^2 + 15^2} = 16.55$$ $$l_1 = 4 \times 16.55 = 66.20 \text{ cm}$$ $$\text{CSA} = \pi r_1 l_1 - \pi r_2 l_2$$ $$= 5461.5 \text{ cm}^2$$ $$\text{TSA} = 5461.5 + \pi(28)^2 + \pi(7)^2$$ $$= 5461.5 + 2464 + 154 = 8079.5 \text{ cm}^2$$`,
          r`$$V = \tfrac{1}{3} \cdot \tfrac{22}{7} \cdot 28^2 \cdot 60$$ $$- \tfrac{1}{3} \cdot \tfrac{22}{7} \cdot 7^2 \cdot 15$$ $$= 48510 \text{ cm}^3$$ $$l_2 = \sqrt{7^2 + 15^2} = 16.55$$ $$l_1 = 4 \times 16.55 = 66.20 \text{ cm}$$ $$\text{CSA} = \pi r_1 l_1 - \pi r_2 l_2$$ $$= 5461.5 \text{ cm}^2$$ $$\text{TSA} = 5461.5 + \pi(28)^2 + \pi(7)^2$$ $$= 5461.5 + 2464 + 154 = 8079.5 \text{ cm}^2$$`,
        ),
      ),
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The formulas, checked on Example 12. */
const formulas = page(
  "formulas",
  (b) => {
    const w = wordsOn(b);
    const check = frustumOn(
      b,
      "check",
      { step: 3, canPick: true, measure: FrustumMeasure.Curved },
      "Example 12's frustum again, with the frustum formulas giving the same volume, curved and total surface area",
    );
    const goal = goalQuestion(b, {
      about: check,
      prompt: t(
        "Switch to the total surface area and check it's 8079.5 cm².",
        "कुल पृष्ठीय क्षेत्रफल पर बदलो और जाँचो कि यह 8079.5 cm² है।",
      ),
      isMet: check.field("measure").eq(FrustumMeasure.Total),
      solve: [check.learner(FrustumAction.Pick, { measure: FrustumMeasure.Total })],
    });
    return column([
      w.title(t("The frustum formulas", "छिन्नक के सूत्र")),
      w.body(
        t(
          r`Working with two cones every time is long. These formulas come from the same big-cone-minus-small-cone working, done once with letters instead of numbers; you'll do it yourself in the last chapter challenge. For a frustum of height $h$, slant height $l$ and end radii $r_1 > r_2$:`,
          r`हर बार दो शंकुओं से हल करना लंबा है। ये सूत्र उसी बड़ा-शंकु-घटा-छोटा-शंकु वाले काम से आते हैं, बस एक बार संख्याओं की जगह अक्षरों से; अध्याय की आख़िरी चुनौती में तुम इसे ख़ुद करोगे। ऊँचाई $h$, तिर्यक ऊँचाई $l$ और सिरों की त्रिज्याओं $r_1 > r_2$ वाले छिन्नक के लिए:`,
        ),
      ),
      w.definition(
        t(
          r`$$V = \tfrac{1}{3}\pi h\left(r_1^2 + r_2^2 + r_1 r_2\right)$$ $$\text{CSA} = \pi(r_1 + r_2)\,l$$ $$l = \sqrt{h^2 + (r_1 - r_2)^2}$$ $$\text{TSA} = \pi(r_1 + r_2)\,l + \pi r_1^2 + \pi r_2^2$$`,
          r`$$V = \tfrac{1}{3}\pi h\left(r_1^2 + r_2^2 + r_1 r_2\right)$$ $$\text{CSA} = \pi(r_1 + r_2)\,l$$ $$l = \sqrt{h^2 + (r_1 - r_2)^2}$$ $$\text{TSA} = \pi(r_1 + r_2)\,l + \pi r_1^2 + \pi r_2^2$$`,
        ),
      ),
      w.body(
        t(
          r`The slant height comes from a right triangle along the side: its legs are the height $h$ and the difference of the radii $r_1 - r_2$. For Example 12: $$l = \sqrt{45^2 + 21^2} = 3\sqrt{15^2 + 7^2}$$ $$= 49.65 \text{ cm}$$ $$\text{CSA} = \tfrac{22}{7} \times 35 \times 49.65 = 5461.5 \text{ cm}^2$$ The same answers, in one line each.`,
          r`तिर्यक ऊँचाई भुजा के साथ बने समकोण त्रिभुज से आती है: उसकी भुजाएँ ऊँचाई $h$ और त्रिज्याओं का अंतर $r_1 - r_2$ हैं। उदाहरण 12 के लिए: $$l = \sqrt{45^2 + 21^2} = 3\sqrt{15^2 + 7^2}$$ $$= 49.65 \text{ cm}$$ $$\text{CSA} = \tfrac{22}{7} \times 35 \times 49.65 = 5461.5 \text{ cm}^2$$ वही उत्तर, हर एक एक पंक्ति में।`,
        ),
      ),
      check,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 14: a bucket on a hollow cylindrical base. */
const bucket = page(
  "bucket",
  (b) => {
    const w = wordsOn(b);
    const pail = frustumOn(
      b,
      "pail",
      { r1: 22.5, r2: 12.5, h: 34, step: 3, canPick: true },
      "Example 14's bucket: a frustum with ends 45 cm and 25 cm across and 34 cm high, standing on a hollow cylinder 6 cm high",
    );
    const goal = goalQuestion(b, {
      about: pail,
      prompt: t(
        "Switch to the curved surface: that's the sheet in the bucket's side.",
        "वक्र पृष्ठ पर बदलो: यही बाल्टी की दीवार की चादर है।",
      ),
      isMet: pail.field("measure").eq(FrustumMeasure.Curved),
      solve: [pail.learner(FrustumAction.Pick, { measure: FrustumMeasure.Curved })],
    });
    return column([
      w.title(t("Example 14: the metal bucket", "उदाहरण 14: धातु की बाल्टी")),
      w.body(
        t(
          "An open metal bucket is a frustum, 45 cm across at the top and 25 cm at the bottom, on a hollow cylindrical base 6 cm high. The whole bucket is 40 cm high, so the frustum is 40 − 6 = 34 cm high.",
          "एक खुली धातु की बाल्टी एक छिन्नक है, ऊपर 45 cm चौड़ी और नीचे 25 cm, जो 6 cm ऊँचे खोखले बेलनाकार आधार पर है। पूरी बाल्टी 40 cm ऊँची है, तो छिन्नक 40 − 6 = 34 cm ऊँचा है।",
        ),
      ),
      pail,
      goal,
      w.body(
        t(
          r`$$l = \sqrt{34^2 + (22.5 - 12.5)^2} = 35.44 \text{ cm}$$ The sheet is the frustum's curved side, the bottom circle, and the base's curved side (open at both ends): $$\tfrac{22}{7}\left(35.44 \times 35 + 12.5^2 + 2 \times 12.5 \times 6\right)$$ $$= \tfrac{22}{7}(1240.4 + 156.25 + 150)$$ $$= 4860.9 \text{ cm}^2$$ $$\text{capacity} = \tfrac{22}{7} \times \tfrac{34}{3} \times 943.75$$ $$= 33615.48 \text{ cm}^3 \approx 33.62 \text{ litres}$$`,
          r`$$l = \sqrt{34^2 + (22.5 - 12.5)^2} = 35.44 \text{ cm}$$ चादर छिन्नक की वक्र दीवार, नीचे का वृत्त, और आधार की वक्र दीवार (दोनों ओर खुली) है: $$\tfrac{22}{7}\left(35.44 \times 35 + 12.5^2 + 2 \times 12.5 \times 6\right)$$ $$= \tfrac{22}{7}(1240.4 + 156.25 + 150)$$ $$= 4860.9 \text{ cm}^2$$ $$\text{धारिता} = \tfrac{22}{7} \times \tfrac{34}{3} \times 943.75$$ $$= 33615.48 \text{ cm}^3 \approx 33.62 \text{ लीटर}$$`,
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

/** Example 13: the jaggery mould. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const mould = frustumOn(
      b,
      "mould",
      { r1: 17.5, r2: 15, h: 14, step: 3, canPick: true, measure: FrustumMeasure.Curved },
      "Example 13's jaggery mould: a frustum with faces 35 cm and 30 cm across, 14 cm high",
    );
    const goal = goalQuestion(b, {
      about: mould,
      prompt: t(
        "How much molasses fits? Switch the working to the volume.",
        "कितना शीरा आएगा? हल को आयतन पर बदलो।",
      ),
      isMet: mould.field("measure").eq(FrustumMeasure.Volume),
      solve: [mould.learner(FrustumAction.Pick, { measure: FrustumMeasure.Volume })],
    });
    return column([
      w.title(t("Filling the jaggery moulds", "गुड़ के साँचे भरना")),
      w.body(
        t(
          "Back in the village yard (Example 13, where Hanumappa and Gangamma make jaggery). Each mould's faces are 35 cm and 30 cm across, and it is 14 cm high. 1 cm³ of molasses is about 1.2 g.",
          "वापस गाँव के आँगन में (उदाहरण 13, जहाँ हनुमप्पा और गंगम्मा गुड़ बनाते हैं)। हर साँचे के फलक 35 cm और 30 cm चौड़े हैं, और वह 14 cm ऊँचा है। 1 cm³ शीरा लगभग 1.2 g का है।",
        ),
      ),
      mould,
      goal,
      w.body(
        t(
          r`$$V = \tfrac{1}{3} \times \tfrac{22}{7} \times 14$$ $$\times \left(17.5^2 + 15^2 + 17.5 \times 15\right)$$ $$= 11641.7 \text{ cm}^3$$ $$\text{mass} = 11641.7 \times 1.2 = 13970.04 \text{ g}$$ $$\approx 14 \text{ kg}$$ Each mould sets about 14 kg of jaggery.`,
          r`$$V = \tfrac{1}{3} \times \tfrac{22}{7} \times 14$$ $$\times \left(17.5^2 + 15^2 + 17.5 \times 15\right)$$ $$= 11641.7 \text{ cm}^3$$ $$\text{द्रव्यमान} = 11641.7 \times 1.2$$ $$= 13970.04 \text{ g} \approx 14 \text{ kg}$$ हर साँचे में लगभग 14 kg गुड़ जमता है।`,
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

/** Exercise 13.4 Q1 and Q2, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const glass = choiceQuestion(b, {
      name: "glass",
      prompt: t(
        "Exercise 13.4 Q1. A drinking glass is a frustum 14 cm high, its ends 4 cm and 2 cm across. Its capacity is",
        "प्रश्नावली 13.4 प्र1। पीने का एक गिलास 14 cm ऊँचा छिन्नक है, सिरे 4 cm और 2 cm चौड़े। उसकी धारिता है",
      ),
      options: [
        { id: "right", label: t(r`$102\tfrac{2}{3}$ cm³`, r`$102\tfrac{2}{3}$ cm³`) },
        {
          id: "410",
          label: t(r`$410\tfrac{2}{3}$ cm³`, r`$410\tfrac{2}{3}$ cm³`),
          feedback: t(
            "4 cm and 2 cm are diameters: the radii are 2 cm and 1 cm.",
            "4 cm और 2 cm व्यास हैं: त्रिज्याएँ 2 cm और 1 cm हैं।",
          ),
        },
        {
          id: "73",
          label: t(r`$73\tfrac{1}{3}$ cm³`, r`$73\tfrac{1}{3}$ cm³`),
          feedback: t(
            r`The bracket has three terms: $r_1^2 + r_2^2 + r_1 r_2$. The $r_1 r_2$ was left out.`,
            r`कोष्ठक में तीन पद हैं: $r_1^2 + r_2^2 + r_1 r_2$। $r_1 r_2$ छूट गया।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ends = choiceQuestion(b, {
      name: "ends",
      prompt: t(
        "Exercise 13.4 Q2. A frustum's slant height is 4 cm and the circumferences of its ends are 18 cm and 6 cm. Its curved surface area is",
        "प्रश्नावली 13.4 प्र2। एक छिन्नक की तिर्यक ऊँचाई 4 cm है और उसके सिरों की परिधियाँ 18 cm और 6 cm हैं। उसका वक्र पृष्ठीय क्षेत्रफल है",
      ),
      options: [
        { id: "right", label: t("48 cm²", "48 cm²") },
        {
          id: "96",
          label: t("96 cm²", "96 cm²"),
          feedback: t(
            r`A circumference is $2\pi r$, so $\pi r = \tfrac{18}{2}$. That's $\pi(r_1 + r_2) = 12$, not 24.`,
            r`परिधि $2\pi r$ है, तो $\pi r = \tfrac{18}{2}$। यानी $\pi(r_1 + r_2) = 12$, 24 नहीं।`,
          ),
        },
        {
          id: "24",
          label: t("24 cm²", "24 cm²"),
          feedback: t(
            r`That used the difference of the ends. The curved surface uses the sum: $\pi(r_1 + r_2)\,l$.`,
            r`इसमें सिरों का अंतर लिया। वक्र पृष्ठ में योग आता है: $\pi(r_1 + r_2)\,l$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A frustum is a cone with a smaller cone cut off parallel to its base; its volume and surfaces come straight from the formulas. ✓ Each jaggery mould holds about 14 kg. ✓ Paint, syrup, kulfi and jaggery are all worked out. One last stop: the challenge, and market day.",
        "**मिशन लॉग।** ✓ छिन्नक वह शंकु है जिसमें से आधार के समांतर एक छोटा शंकु काटा गया हो; उसका आयतन और पृष्ठ सीधे सूत्रों से आते हैं। ✓ गुड़ के हर साँचे में लगभग 14 kg आता है। ✓ पेंट, चाशनी, कुल्फ़ी और गुड़, सब हल हो गए। एक आख़िरी पड़ाव: चुनौती, और बाज़ार का दिन।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(glass.on(QuestionSignal.Correct), theBoard.show(ends));
    b.when(ends.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), glass, ends, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, cut, longWay, formulas, bucket, inLife, yourTurn];
