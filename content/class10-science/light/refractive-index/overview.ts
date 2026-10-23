import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Medium,
  RefractionAction,
  RefractionMode,
  SceneKind,
  lightSceneDef,
  refractionDef,
} from "@chalk/prop-light";

const r = String.raw;
const still = { isLit: true, canToggle: false } as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Where the mission stands, and the question: which material bends light the most? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const glass = b.prop(lightSceneDef, "glass", { scene: SceneKind.GlassOfWater, ...still });
  b.standsFor(
    glass,
    "the glass of water from last time: the lemon inside looks bigger, and the straw looks broken where it enters the water",
  );
  return column([
    w.title(t("Which bends light the most?", "प्रकाश को सबसे ज़्यादा कौन मोड़ता है?")),
    glass,
    w.body(
      t(
        "**Stop 3: bending, continued.** Last time Riya and Kabir found that water and glass bend light where it crosses their surface. A flat slab bends it in and straight back out, so it can't make a picture. A **curved** piece of see-through material might bend all the rays to one point. But curved out of **what**?",
        "**पड़ाव 3: मोड़ना, आगे।** पिछली बार रिया और कबीर ने पाया कि पानी और काँच प्रकाश को वहाँ मोड़ते हैं जहाँ वह उनकी सतह पार करता है। सपाट गुटका उसे अंदर मोड़कर सीधा वापस बाहर मोड़ देता है, इसलिए तस्वीर नहीं बना सकता। कोई **मुड़ा हुआ** पारदर्शी टुकड़ा शायद सारी किरणों को एक बिंदु पर मोड़ दे। पर **किस चीज़** का मुड़ा हुआ?",
      ),
    ),
    w.body(
      t(
        'Kabir has one question for the whole day: **"Which stuff bends light the most?"** To compare materials fairly, they need **one number** for each. This lesson finds that number.',
        'कबीर के पास पूरे दिन के लिए एक ही सवाल है: **"कौन-सी चीज़ प्रकाश को सबसे ज़्यादा मोड़ती है?"** पदार्थों की ठीक से तुलना के लिए उन्हें हर एक के लिए **एक संख्या** चाहिए। यह पाठ वही संख्या ढूँढता है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Snell's constant is a ratio of speeds: n21 = v1 / v2. */
const name = page(
  "name",
  (b) => {
    const w = wordsOn(b);
    const flip = choiceQuestion(b, {
      name: "flip",
      prompt: t(
        r`For light from air into crown glass, $n_{21} = 1.52$. What is the refractive index of air with respect to glass?`,
        r`वायु से क्राउन काँच में जाते प्रकाश के लिए $n_{21} = 1.52$ है। काँच के सापेक्ष वायु का अपवर्तनांक क्या है?`,
      ),
      options: [
        {
          id: "right",
          label: t(r`$\frac{1}{1.52} \approx 0.66$`, r`$\frac{1}{1.52} \approx 0.66$`),
        },
        {
          id: "same",
          label: t("1.52", "1.52"),
          feedback: t(
            r`The other way round the speeds swap places: $n_{12} = \frac{v_2}{v_1}$, which is $1 \div 1.52$.`,
            r`उल्टी दिशा में चालें जगह बदल लेती हैं: $n_{12} = \frac{v_2}{v_1}$, जो $1 \div 1.52$ है।`,
          ),
        },
        {
          id: "minus",
          label: t("−1.52", "−1.52"),
          feedback: t(
            "A ratio of two speeds can't be negative.",
            "दो चालों का अनुपात ऋणात्मक नहीं हो सकता।",
          ),
        },
      ],
      answer: "right",
    });
    const pair = b.prop(refractionDef, "pair", {
      mode: RefractionMode.Boundary,
      top: Medium.Air,
      bottom: Medium.CrownGlass,
      incidence: 40,
      showNormal: true,
      showAngles: true,
      showSpeeds: true,
    });
    b.studentOnly(pair.action(RefractionAction.SetIncidence));
    b.standsFor(
      pair,
      "medium 1 (air, on top, where the light comes from) and medium 2 (crown glass, below), each labelled with the speed of light in it",
    );
    return column([
      w.title(t("The refractive index", "अपवर्तनांक")),
      w.body(
        t(
          r`Snell's law says that for light going from air into crown glass, at every angle, $$\frac{\sin i}{\sin r} = 1.52$$ Where does 1.52 come from? Light is **slower** in glass than in air. It travels at about $3.00 \times 10^8$ m/s in air and $1.97 \times 10^8$ m/s in crown glass. Divide one by the other: $$\frac{3.00}{1.97} = 1.52$$ The same number. The constant in Snell's law is the ratio of the two speeds.`,
          r`स्नेल का नियम कहता है कि वायु से क्राउन काँच में जाते प्रकाश के लिए, हर कोण पर, $$\frac{\sin i}{\sin r} = 1.52$$ 1.52 कहाँ से आता है? काँच में प्रकाश वायु से **धीमा** होता है। वह वायु में लगभग $3.00 \times 10^8$ मीटर/सेकंड और क्राउन काँच में $1.97 \times 10^8$ मीटर/सेकंड से चलता है। एक को दूसरे से भाग दो: $$\frac{3.00}{1.97} = 1.52$$ वही संख्या। स्नेल के नियम का स्थिरांक दोनों चालों का अनुपात है।`,
        ),
      ),
      pair,
      w.body(
        t(
          "In the picture, **medium 1** is the one the light comes from (air, on top) and **medium 2** is the one it goes into (glass, below). Each is labelled with the speed of light in it. Change the angle: the speeds, and their ratio, never change.",
          "चित्र में **माध्यम 1** वह है जिससे प्रकाश आता है (वायु, ऊपर) और **माध्यम 2** वह जिसमें वह जाता है (काँच, नीचे)। हर एक पर उसमें प्रकाश की चाल लिखी है। कोण बदलो: चालें, और उनका अनुपात, कभी नहीं बदलते।",
        ),
      ),
      w.definition(
        t(
          r`**Refractive index.** Light goes from medium 1, where its speed is $v_1$, into medium 2, where its speed is $v_2$. The **refractive index of medium 2 with respect to medium 1** is $$n_{21} = \frac{\text{speed of light in medium 1}}{\text{speed of light in medium 2}} = \frac{v_1}{v_2}$$ Read $n_{21}$ as "medium 2 compared with medium 1". It is the same number as $\frac{\sin i}{\sin r}$. The other way round, light going from medium 2 into medium 1, the speeds swap places: $$n_{12} = \frac{v_2}{v_1}$$`,
          r`**अपवर्तनांक।** प्रकाश माध्यम 1 से, जहाँ उसकी चाल $v_1$ है, माध्यम 2 में जाता है, जहाँ उसकी चाल $v_2$ है। **माध्यम 1 के सापेक्ष माध्यम 2 का अपवर्तनांक** है $$n_{21} = \frac{\text{माध्यम 1 में प्रकाश की चाल}}{\text{माध्यम 2 में प्रकाश की चाल}} = \frac{v_1}{v_2}$$ $n_{21}$ को पढ़ो "माध्यम 1 की तुलना में माध्यम 2"। यह वही संख्या है जो $\frac{\sin i}{\sin r}$। उल्टी दिशा में, यानी माध्यम 2 से माध्यम 1 में जाते प्रकाश के लिए, चालें जगह बदल लेती हैं: $$n_{12} = \frac{v_2}{v_1}$$`,
        ),
      ),
      flip,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Absolute refractive index n = c / v, with Table 10.3 on the prop. */
const absolute = page(
  "absolute",
  (b) => {
    const w = wordsOn(b);
    const edge = b.prop(refractionDef, "edge", {
      mode: RefractionMode.Boundary,
      top: Medium.Air,
      bottom: Medium.Water,
      incidence: 45,
      showNormal: true,
      showAngles: true,
      showSpeeds: true,
      showIndex: true,
      canChooseMedium: true,
    });
    b.studentOnly(edge.action(RefractionAction.SetIncidence));
    b.studentOnly(edge.action(RefractionAction.SetMedium));
    b.standsFor(
      edge,
      "a ray from air into a medium the learner picks from NCERT Table 10.3, with its refractive index and the speed of light in it",
    );
    const diamond = choiceQuestion(b, {
      name: "diamond",
      prompt: t(
        "The refractive index of diamond is 2.42. What does that mean?",
        "हीरे का अपवर्तनांक 2.42 है। इसका क्या अर्थ है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Light in air is 2.42 times as fast as in diamond",
            "वायु में प्रकाश हीरे की तुलना में 2.42 गुना तेज़ चलता है",
          ),
        },
        {
          id: "faster",
          label: t(
            "Light in diamond is 2.42 times as fast as in air",
            "हीरे में प्रकाश वायु की तुलना में 2.42 गुना तेज़ चलता है",
          ),
          feedback: t(
            r`$n = \frac{c}{v}$ is the speed in air divided by the speed in diamond. 2.42 means the air speed is the bigger one.`,
            r`$n = \frac{c}{v}$, वायु की चाल भाग हीरे की चाल है। 2.42 का अर्थ है वायु वाली चाल बड़ी है।`,
          ),
        },
        {
          id: "heavy",
          label: t("Diamond is 2.42 times heavier than water", "हीरा पानी से 2.42 गुना भारी है"),
          feedback: t(
            "The refractive index is about the speed of light, not about weight.",
            "अपवर्तनांक प्रकाश की चाल के बारे में है, भार के बारे में नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A medium's own number", "माध्यम की अपनी संख्या")),
      w.definition(
        t(
          r`**Absolute refractive index.** If medium 1 is a vacuum or air, we just call it the **refractive index** of the medium, $n$: $$n = \frac{\text{speed of light in air}}{\text{speed of light in the medium}} = \frac{c}{v}$$ Here $c$ is the speed of light in a vacuum: $$c = 3 \times 10^8 \text{ m/s}$$ Light in air is almost as fast, so we use the same $c$ for air.`,
          r`**निरपेक्ष अपवर्तनांक।** यदि माध्यम 1 निर्वात या वायु हो, तो हम इसे बस माध्यम का **अपवर्तनांक** $n$ कहते हैं: $$n = \frac{\text{वायु में प्रकाश की चाल}}{\text{माध्यम में प्रकाश की चाल}} = \frac{c}{v}$$ यहाँ $c$ निर्वात में प्रकाश की चाल है: $$c = 3 \times 10^8 \text{ मीटर/सेकंड}$$ वायु में प्रकाश लगभग उतना ही तेज़ है, इसलिए वायु के लिए भी यही $c$ लेते हैं।`,
        ),
      ),
      w.body(
        t(
          'Every material in this list from the textbook (NCERT Table 10.3) has its own refractive index. You don\'t need to learn the numbers. Change the medium with the "light goes into" picker and watch the speed and the bend: the bigger the number, the slower the light, and the more it bends.',
          'पाठ्यपुस्तक की इस सूची (NCERT तालिका 10.3) के हर पदार्थ का अपना अपवर्तनांक है। संख्याएँ याद करने की ज़रूरत नहीं। "प्रकाश यहाँ जाता है" वाले बटन से माध्यम बदलो और चाल और मोड़ देखो: संख्या जितनी बड़ी, प्रकाश उतना धीमा, और वह उतना ज़्यादा मुड़ता है।',
        ),
      ),
      edge,
      w.body(
        t(
          r`$$\begin{array}{lr} \text{air} & 1.0003 \\ \text{ice} & 1.31 \\ \text{water} & 1.33 \\ \text{alcohol} & 1.36 \\ \text{kerosene} & 1.44 \\ \text{fused quartz} & 1.46 \\ \text{turpentine oil} & 1.47 \\ \text{benzene} & 1.50 \\ \text{crown glass} & 1.52 \\ \text{Canada balsam} & 1.53 \\ \text{rock salt} & 1.54 \\ \text{carbon disulphide} & 1.63 \\ \text{dense flint glass} & 1.65 \\ \text{ruby} & 1.71 \\ \text{sapphire} & 1.77 \\ \text{diamond} & 2.42 \end{array}$$`,
          r`$$\begin{array}{lr} \text{वायु} & 1.0003 \\ \text{बर्फ़} & 1.31 \\ \text{जल} & 1.33 \\ \text{ऐल्कोहॉल} & 1.36 \\ \text{किरोसिन} & 1.44 \\ \text{पिघला क्वार्ट्ज़} & 1.46 \\ \text{तारपीन का तेल} & 1.47 \\ \text{बेंज़ीन} & 1.50 \\ \text{क्राउन काँच} & 1.52 \\ \text{कनाडा बालसम} & 1.53 \\ \text{खनिज नमक} & 1.54 \\ \text{कार्बन डाइसल्फ़ाइड} & 1.63 \\ \text{सघन फ्लिंट काँच} & 1.65 \\ \text{माणिक्य} & 1.71 \\ \text{नीलम} & 1.77 \\ \text{हीरा} & 2.42 \end{array}$$`,
        ),
      ),
      diamond,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Optically denser = larger n = slower = bends towards the normal; not mass density. */
const denser = page(
  "denser",
  (b) => {
    const w = wordsOn(b);
    const most = choiceQuestion(b, {
      name: "most",
      prompt: t(
        "From the table, which medium has the highest optical density, and which the lowest?",
        "तालिका से, किस माध्यम का प्रकाशिक घनत्व सबसे ज़्यादा है, और किसका सबसे कम?",
      ),
      options: [
        { id: "right", label: t("Highest diamond, lowest air", "सबसे ज़्यादा हीरा, सबसे कम वायु") },
        {
          id: "ice",
          label: t("Highest diamond, lowest ice", "सबसे ज़्यादा हीरा, सबसे कम बर्फ़"),
          feedback: t(
            "Air's refractive index, 1.0003, is lower than ice's, 1.31.",
            "वायु का अपवर्तनांक, 1.0003, बर्फ़ के 1.31 से कम है।",
          ),
        },
        {
          id: "swap",
          label: t("Highest air, lowest diamond", "सबसे ज़्यादा वायु, सबसे कम हीरा"),
          feedback: t(
            "Optically denser means a larger refractive index. Diamond's is the largest.",
            "प्रकाशिक रूप से सघन का अर्थ है बड़ा अपवर्तनांक। हीरे का सबसे बड़ा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const fastest = choiceQuestion(b, {
      name: "fastest",
      prompt: t(
        "In which of kerosene, turpentine and water does light travel fastest?",
        "किरोसिन, तारपीन और पानी में से किसमें प्रकाश सबसे तेज़ चलता है?",
      ),
      options: [
        { id: "right", label: t("Water", "पानी") },
        {
          id: "turp",
          label: t("Turpentine", "तारपीन"),
          feedback: t(
            r`Turpentine has the largest refractive index of the three, 1.47, so light is slowest in it. $v = \frac{c}{n}$: the smallest $n$ gives the fastest light.`,
            r`तीनों में तारपीन का अपवर्तनांक सबसे बड़ा, 1.47, है, इसलिए उसमें प्रकाश सबसे धीमा है। $v = \frac{c}{n}$: सबसे छोटा $n$ सबसे तेज़ प्रकाश देता है।`,
          ),
        },
        {
          id: "kero",
          label: t("Kerosene", "किरोसिन"),
          feedback: t(
            "Kerosene, 1.44, has a larger refractive index than water, 1.33, so light is slower in it.",
            "किरोसिन (1.44) का अपवर्तनांक पानी (1.33) से बड़ा है, इसलिए उसमें प्रकाश धीमा है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(most.on(QuestionSignal.Correct), theBoard.show(fastest));
    return column([
      w.title(t("Optically denser", "प्रकाशिक रूप से सघन")),
      w.definition(
        t(
          "**Optical density.** Of two media, the one with the **larger refractive index** is **optically denser**, and the other is **optically rarer**. Light is slower in the denser one. So going from rarer to denser, light slows down and bends **towards** the normal. Going from denser to rarer, it speeds up and bends **away** from the normal.",
          "**प्रकाशिक घनत्व।** दो माध्यमों में से जिसका **अपवर्तनांक बड़ा** है, वह **प्रकाशिक रूप से सघन** है, और दूसरा **प्रकाशिक रूप से विरल**। सघन में प्रकाश धीमा होता है। इसलिए विरल से सघन में जाते समय प्रकाश धीमा होकर अभिलंब की **ओर** मुड़ता है। सघन से विरल में जाते समय वह तेज़ होकर अभिलंब से **दूर** मुड़ता है।",
        ),
      ),
      w.body(
        t(
          "Careful: this is not about heaviness. Kerosene floats on water, so it's lighter, yet its refractive index, 1.44, is **larger** than water's, 1.33. Kerosene is lighter than water but optically denser. Optical density is not the same as mass density.",
          "ध्यान रहे: यह भारीपन के बारे में नहीं है। किरोसिन पानी पर तैरता है, यानी वह हल्का है, फिर भी उसका अपवर्तनांक, 1.44, पानी के 1.33 से **बड़ा** है। किरोसिन पानी से हल्का है पर प्रकाशिक रूप से सघन। प्रकाशिक घनत्व द्रव्यमान घनत्व जैसा नहीं है।",
        ),
      ),
      most,
      fastest,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to Kabir's question: the champion, and the material they actually need. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pick = choiceQuestion(b, {
      name: "pick",
      prompt: t(
        "The lens has to be clear, keep its shape, be cheap, and bend light well. Which material from the table should Riya and Kabir use?",
        "लेंस को साफ़ होना चाहिए, अपना आकार बनाए रखना चाहिए, सस्ता होना चाहिए, और प्रकाश को अच्छे से मोड़ना चाहिए। तालिका के किस पदार्थ का उपयोग रिया और कबीर करें?",
      ),
      options: [
        { id: "right", label: t("Glass, about 1.5", "काँच, लगभग 1.5") },
        {
          id: "diamond",
          label: t("Diamond, 2.42", "हीरा, 2.42"),
          feedback: t(
            "It bends light the most, but a diamond the size of a lens would cost more than the whole house.",
            "यह प्रकाश को सबसे ज़्यादा मोड़ता है, पर लेंस के आकार का हीरा पूरे घर से भी महँगा होगा।",
          ),
        },
        {
          id: "water",
          label: t("Water, 1.33", "पानी, 1.33"),
          feedback: t(
            "Water is clear, but it spills and sags: it can't hold a curved shape by itself.",
            "पानी साफ़ है, पर गिर जाता है और बहता है: वह अपने आप मुड़ा आकार नहीं रख सकता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const verdict = w.body(
      t(
        'Kabir, after reading the table: **"Diamond wins. We make our lens out of diamond."** Mom, from the kitchen: **"No."** They don\'t need the champion anyway. Glass, at about 1.5, is clear, cheap, keeps its shape and bends light plenty. That\'s why real lenses, in spectacles, cameras and projectors, are made of glass.',
        'तालिका पढ़कर कबीर: **"हीरा जीतता है। हम अपना लेंस हीरे का बनाएँगे।"** माँ, रसोई से: **"नहीं।"** वैसे भी उन्हें विजेता की ज़रूरत नहीं। काँच, लगभग 1.5 के साथ, साफ़ है, सस्ता है, आकार बनाए रखता है और प्रकाश को काफ़ी मोड़ता है। इसीलिए असली लेंस, चश्मे, कैमरे और प्रोजेक्टर में, काँच के बनते हैं।',
      ),
      "verdict",
      { isHidden: true },
    );
    b.when(pick.on(QuestionSignal.Correct), [theBoard.show(verdict), theBoard.pass()]);
    return column([
      w.title(t("Back to Kabir's question", "फिर कबीर का सवाल")),
      w.body(
        t(
          "Now Kabir has his number for every material: the refractive index. The bigger it is, the more the material slows light down, and the more strongly it bends it. So which one goes into the projector?",
          "अब कबीर के पास हर पदार्थ की संख्या है: अपवर्तनांक। जितना बड़ा, पदार्थ प्रकाश को उतना धीमा करता है, और उतनी ज़ोर से मोड़ता है। तो प्रोजेक्टर में कौन-सा लगेगा?",
        ),
      ),
      pick,
      verdict,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2: glass of n = 1.50; then water, and the mission log. */
const example = page(
  "example",
  (b) => {
    const w = wordsOn(b);
    const slab = b.prop(refractionDef, "slab", {
      mode: RefractionMode.Boundary,
      top: Medium.Air,
      bottom: Medium.CrownGlass,
      incidence: 40,
      showNormal: true,
      showAngles: false,
      showSpeeds: false,
    });
    b.standsFor(slab, "a ray going from air into glass, bending towards the normal");
    const water = choiceQuestion(b, {
      name: "water",
      prompt: t(
        r`Your turn. The refractive index of water is 1.33. What is the speed of light in water? Take $c = 3 \times 10^8$ m/s.`,
        r`अब तुम्हारी बारी। पानी का अपवर्तनांक 1.33 है। पानी में प्रकाश की चाल क्या है? $c = 3 \times 10^8$ मीटर/सेकंड लो।`,
      ),
      options: [
        { id: "right", label: t(r`$2.26 \times 10^8$ m/s`, r`$2.26 \times 10^8$ मीटर/सेकंड`) },
        {
          id: "times",
          label: t(r`$3.99 \times 10^8$ m/s`, r`$3.99 \times 10^8$ मीटर/सेकंड`),
          feedback: t(
            r`Light can't be faster in water than in air. $v = \frac{c}{n}$: divide by 1.33, don't multiply.`,
            r`पानी में प्रकाश वायु से तेज़ नहीं हो सकता। $v = \frac{c}{n}$: 1.33 से भाग दो, गुणा नहीं।`,
          ),
        },
        {
          id: "same",
          label: t(r`$3 \times 10^8$ m/s`, r`$3 \times 10^8$ मीटर/सेकंड`),
          feedback: t(
            "That's the speed in air. In water it is slower.",
            "यह वायु में चाल है। पानी में यह धीमी है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Each material's refractive index says how much it slows light, and so how strongly it bends it. ✗ Diamond bends light the most, but Mom said no, and we don't need it. ✓ Glass, at about 1.5, is cheap, clear and bends light well. The lens will be **glass**. And Grandpa has one. **Stop 3 done.** Next stop: lenses.",
        "**मिशन लॉग।** ✓ हर पदार्थ का अपवर्तनांक बताता है कि वह प्रकाश को कितना धीमा करता है, और इसलिए कितनी ज़ोर से मोड़ता है। ✗ हीरा प्रकाश को सबसे ज़्यादा मोड़ता है, पर माँ ने मना कर दिया, और उसकी ज़रूरत भी नहीं। ✓ काँच, लगभग 1.5 के साथ, सस्ता, साफ़ है और प्रकाश को अच्छे से मोड़ता है। लेंस **काँच** का होगा। और दादाजी के पास एक है। **पड़ाव 3 पूरा।** अगला पड़ाव: लेंस।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(water.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Example", "उदाहरण")),
      w.body(
        t(
          r`**Light enters glass of refractive index 1.50 from air. What is its speed in the glass? The speed of light in a vacuum is** $3 \times 10^8$ **m/s.**`,
          r`**प्रकाश वायु से 1.50 अपवर्तनांक वाले काँच में जाता है। काँच में उसकी चाल क्या है? निर्वात में प्रकाश की चाल** $3 \times 10^8$ **मीटर/सेकंड है।**`,
        ),
      ),
      slab,
      w.body(
        t(
          r`From the definition, $$n = \frac{c}{v}$$ so the speed in the glass is $$v = \frac{c}{n} = \frac{3 \times 10^8}{1.50} = 2 \times 10^8 \text{ m/s}$$ Light in air is 1.5 times as fast as in the glass.`,
          r`परिभाषा से, $$n = \frac{c}{v}$$ इसलिए काँच में चाल है $$v = \frac{c}{n} = \frac{3 \times 10^8}{1.50} = 2 \times 10^8 \text{ मीटर/सेकंड}$$ वायु में प्रकाश काँच की तुलना में 1.5 गुना तेज़ चलता है।`,
        ),
      ),
      w.note(
        t(
          r`To find a speed, divide $c$ by $n$. The answer must always come out smaller than $c$.`,
          r`चाल निकालने के लिए $c$ को $n$ से भाग दो। उत्तर हमेशा $c$ से छोटा आना चाहिए।`,
        ),
      ),
      water,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, name, absolute, denser, inLife, example];
