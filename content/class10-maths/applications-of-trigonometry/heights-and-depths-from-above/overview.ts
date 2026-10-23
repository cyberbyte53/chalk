import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Problem, TrigSceneKind } from "@chalk/prop-trigonometry";
import { sceneOn, workedOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The walk down: the old bridge, and the kite bet still open. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const hill = sceneOn(
    b,
    "hill",
    TrigSceneKind.FortHill,
    "the fort on Kite Hill in the afternoon, the path winding down to an old bridge over the river, kites in the sky",
  );
  return column([
    w.title(t("From up high", "ऊँचाई से")),
    hill,
    w.body(
      t(
        'In the afternoon the family walks down to the old bridge over the river. Mom stops halfway across: "How wide is this river, anyway?" From the bridge you can see both banks, but they are below you, on either side.',
        'दोपहर में परिवार नदी पर बने पुराने पुल तक उतरता है। मम्मी बीच पुल पर रुकती हैं: "वैसे यह नदी कितनी चौड़ी है?" पुल से दोनों किनारे दिखते हैं, पर वे तुम्हारे नीचे हैं, दोनों ओर।',
      ),
    ),
    w.body(
      t(
        "And Kabir's bet is still open: whose kite is highest? Before sunset, this lesson settles both.",
        "और कबीर की शर्त अभी बाक़ी है: किसकी पतंग सबसे ऊँची है? सूर्यास्त से पहले यह पाठ दोनों का फ़ैसला करता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 6: two buildings, depressions 30° and 45°. */
const buildings = page(
  "buildings",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Ex6Buildings,
      "Example 6 to scale: a tall building PC and an 8 m building AB, the horizontal PQ at P's top, lines of sight from P to B at a depression of 30° and to A at 45°, and the point D on PC level with B",
    );
    const alt = choiceQuestion(b, {
      name: "alt",
      prompt: t(
        "The working writes ∠PBD = 30°. Why is the angle at B equal to the depression at P?",
        "हल में ∠PBD = 30° लिखा है। B पर कोण P पर अवनमन कोण के बराबर क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t("PQ ∥ BD, so they are alternate angles", "PQ ∥ BD, इसलिए ये एकांतर कोण हैं"),
        },
        {
          id: "vert",
          label: t("PB ⊥ BD, so they are equal angles", "PB ⊥ BD, इसलिए ये बराबर कोण हैं"),
          feedback: t(
            "PB isn't perpendicular to anything here. The two horizontals PQ and BD are parallel, and PB crosses both.",
            "यहाँ PB किसी पर लंब नहीं है। दोनों क्षैतिज PQ और BD समांतर हैं, और PB दोनों को काटती है।",
          ),
        },
        {
          id: "sum",
          label: t("They add up to 90°, so they are equal", "उनका योग 90° है, इसलिए वे बराबर हैं"),
          feedback: t(
            "Angles adding to 90° are complementary, not equal. These are equal because they are alternate angles.",
            "90° योग वाले कोण पूरक होते हैं, बराबर नहीं। ये एकांतर कोण होने के कारण बराबर हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two buildings, seen from the top", "शीर्ष से दिखती दो इमारतें")),
      w.body(
        t(
          "**Example 6.** From the top of a multi-storeyed building, the angles of depression of the top and the bottom of an 8 m tall building are 30° and 45°. Find the height of the multi-storeyed building and the distance between the two buildings.",
          "**उदाहरण 6।** एक बहुमंज़िला इमारत के शीर्ष से 8 m ऊँची इमारत के शीर्ष और आधार के अवनमन कोण 30° और 45° हैं। बहुमंज़िला इमारत की ऊँचाई और दोनों इमारतों के बीच की दूरी ज्ञात करो।",
        ),
      ),
      fig,
      goal,
      w.body(
        t(
          r`By alternate angles, ∠PBD = 30° and ∠PAC = 45°. $$\text{In } \triangle PBD: \quad \frac{PD}{BD} = \tan 30^\circ \quad\Rightarrow\quad BD = PD\sqrt{3}$$ $$\text{In } \triangle PAC: \quad \frac{PC}{AC} = \tan 45^\circ = 1 \quad\Rightarrow\quad PC = AC$$ Since PC = PD + 8 and AC = BD: $$PD + 8 = PD\sqrt{3}$$ $$PD = \frac{8}{\sqrt{3} - 1}$$`,
          r`एकांतर कोणों से ∠PBD = 30° और ∠PAC = 45°। $$\triangle PBD \text{ में}: \quad \frac{PD}{BD} = \tan 30^\circ \quad\Rightarrow\quad BD = PD\sqrt{3}$$ $$\triangle PAC \text{ में}: \quad \frac{PC}{AC} = \tan 45^\circ = 1 \quad\Rightarrow\quad PC = AC$$ क्योंकि PC = PD + 8 और AC = BD: $$PD + 8 = PD\sqrt{3}$$ $$PD = \frac{8}{\sqrt{3} - 1}$$`,
        ),
      ),
      alt,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Rationalising the denominator, one step per line. */
const rationalise = page(
  "rationalise",
  (b) => {
    const w = wordsOn(b);
    const times = choiceQuestion(b, {
      name: "times",
      prompt: t(
        "To clear √3 − 1 from the bottom of 8/(√3 − 1), multiply top and bottom by…",
        "8/(√3 − 1) के हर से √3 − 1 हटाने के लिए अंश और हर दोनों को किससे गुणा करें?",
      ),
      options: [
        { id: "right", label: t("√3 + 1", "√3 + 1") },
        {
          id: "same",
          label: t("√3 − 1", "√3 − 1"),
          feedback: t(
            "(√3 − 1)² = 4 − 2√3 still has a root in it. Use √3 + 1, so (√3 − 1)(√3 + 1) = 3 − 1 = 2.",
            "(√3 − 1)² = 4 − 2√3 में अब भी मूल है। √3 + 1 लो, ताकि (√3 − 1)(√3 + 1) = 3 − 1 = 2।",
          ),
        },
        {
          id: "root",
          label: t("√3", "√3"),
          feedback: t(
            "√3(√3 − 1) = 3 − √3 still has a root. Only the pair with the opposite sign removes it.",
            "√3(√3 − 1) = 3 − √3 में अब भी मूल है। केवल उल्टे चिह्न वाला जोड़ा उसे हटाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Clearing the root from the bottom", "हर से मूल हटाना")),
      w.definition(
        t(
          "**Rationalising the denominator.** To remove a root like √3 − 1 from the bottom of a fraction, multiply the top and the bottom by √3 + 1. The bottom becomes a whole number, because $$(a - b)(a + b) = a^2 - b^2$$",
          "**हर का परिमेयकरण।** भिन्न के हर से √3 − 1 जैसा मूल हटाने के लिए अंश और हर दोनों को √3 + 1 से गुणा करो। हर पूर्ण संख्या बन जाता है, क्योंकि $$(a - b)(a + b) = a^2 - b^2$$",
        ),
      ),
      w.body(
        t(
          r`Finish Example 6: $$PD = \frac{8}{\sqrt{3} - 1} \times \frac{\sqrt{3} + 1}{\sqrt{3} + 1}$$ $$= \frac{8(\sqrt{3} + 1)}{3 - 1}$$ $$= 4(\sqrt{3} + 1) \text{ m}$$ $$PC = PD + 8 = 4(\sqrt{3} + 1) + 8 = 4(3 + \sqrt{3}) \text{ m}$$ and since PC = AC, the buildings are also 4(3 + √3) m apart, about 18.93 m.`,
          r`उदाहरण 6 पूरा करो: $$PD = \frac{8}{\sqrt{3} - 1} \times \frac{\sqrt{3} + 1}{\sqrt{3} + 1}$$ $$= \frac{8(\sqrt{3} + 1)}{3 - 1}$$ $$= 4(\sqrt{3} + 1) \text{ m}$$ $$PC = PD + 8 = 4(\sqrt{3} + 1) + 8 = 4(3 + \sqrt{3}) \text{ m}$$ और क्योंकि PC = AC, इमारतें भी 4(3 + √3) m दूर हैं, लगभग 18.93 m।`,
        ),
      ),
      times,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 7: the river under the bridge. */
const bridge = page(
  "bridge",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Ex7Bridge,
      "Example 7 to scale: a point P on a bridge 3 m above the banks, D the point on the river level straight below P, the banks A and B on opposite sides seen at depressions of 30° and 45°",
    );
    return column([
      w.title(t("How wide is the river?", "नदी कितनी चौड़ी है?")),
      w.body(
        t(
          "On the way down the family crosses the old bridge, and Mom asks how wide the river is. Riya stands at the railing, 3 m above the banks, and sights both banks with the clinometer turned downwards: 30° to one bank, 45° to the other. Those are exactly Example 7's numbers, so its working is her answer.",
          "नीचे उतरते हुए परिवार पुराना पुल पार करता है, और मम्मी पूछती हैं कि नदी कितनी चौड़ी है। रिया रेलिंग पर खड़ी होती है, किनारों से 3 m ऊपर, और नीचे की ओर मुड़े क्लाइनोमीटर से दोनों किनारों को देखती है: एक किनारे तक 30°, दूसरे तक 45°। ये ठीक उदाहरण 7 की संख्याएँ हैं, इसलिए उसका हल ही उसका उत्तर है।",
        ),
      ),
      w.body(
        t(
          "**Example 7.** From a point on a bridge across a river, the angles of depression of the banks on opposite sides are 30° and 45°. The bridge is 3 m above the banks. Find the width of the river.",
          "**उदाहरण 7।** नदी पर बने पुल के एक बिंदु से दोनों ओर के किनारों के अवनमन कोण 30° और 45° हैं। पुल किनारों से 3 m ऊपर है। नदी की चौड़ाई ज्ञात करो।",
        ),
      ),
      fig,
      goal,
      w.body(
        t(
          r`Here the two triangles lie on **opposite** sides of PD and share the height PD = 3 m. $$\tan 30^\circ = \frac{PD}{AD} \quad\Rightarrow\quad AD = 3\sqrt{3} \text{ m}$$ $$\tan 45^\circ = \frac{PD}{DB} \quad\Rightarrow\quad DB = 3 \text{ m}$$ $$AB = AD + DB = 3\sqrt{3} + 3 = 3(\sqrt{3} + 1) \text{ m}$$`,
          r`यहाँ दोनों त्रिभुज PD के **विपरीत** ओर हैं और ऊँचाई PD = 3 m साझा करते हैं। $$\tan 30^\circ = \frac{PD}{AD} \quad\Rightarrow\quad AD = 3\sqrt{3} \text{ m}$$ $$\tan 45^\circ = \frac{PD}{DB} \quad\Rightarrow\quad DB = 3 \text{ m}$$ $$AB = AD + DB = 3\sqrt{3} + 3 = 3(\sqrt{3} + 1) \text{ m}$$`,
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

/** The ships from the lighthouse (Q13) and the car on the highway (Q15). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Q13Ships,
      "Exercise 9.1 Q13 to scale: a 75 m lighthouse, the horizontal at its top, two ships one behind the other on the same side, seen at depressions of 45° (the nearer) and 30° (the farther)",
    );
    const car = choiceQuestion(b, {
      name: "car",
      prompt: t(
        "Exercise 9.1 Q15: from the top of a tower, a car on a straight highway towards it is first at a depression of 30°, then 6 s later at 60°. At the same speed, how long until it reaches the foot?",
        "प्रश्नावली 9.1 प्र15: एक मीनार के शीर्ष से, उसकी ओर आती सीधी सड़क पर एक कार पहले 30° अवनमन पर, फिर 6 s बाद 60° पर दिखती है। उसी चाल से, आधार तक पहुँचने में कितना समय लगेगा?",
      ),
      options: [
        { id: "right", label: t("3 s", "3 s") },
        {
          id: "six",
          label: t("6 s", "6 s"),
          feedback: t(
            "The first stretch is h√3 − h/√3 = 2h/√3; what's left is h/√3, half of it. Half the distance takes half the time: 3 s.",
            "पहला हिस्सा h√3 − h/√3 = 2h/√3 है; बचा हुआ h/√3, उसका आधा। आधी दूरी में आधा समय: 3 s।",
          ),
        },
        {
          id: "twelve",
          label: t("12 s", "12 s"),
          feedback: t(
            "The remaining stretch is shorter than the first, not longer: h/√3 against 2h/√3.",
            "बचा हुआ हिस्सा पहले वाले से छोटा है, बड़ा नहीं: h/√3 बनाम 2h/√3।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        r`And Mom's river, from Riya's 30° and 45° on the bridge: 3(√3 + 1) ≈ 8.2 m wide. Mom is impressed. **Stop 4 almost done:** just the kites left.`,
        r`और मम्मी की नदी, पुल पर रिया के 30° और 45° से: 3(√3 + 1) ≈ 8.2 m चौड़ी। मम्मी प्रभावित हैं। **पड़ाव 4 लगभग पूरा:** बस पतंगें बाक़ी।`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(done));
    return column([
      w.title(t("Ships, a car, and the river", "जहाज़, एक कार, और नदी")),
      w.body(
        t(
          "**Exercise 9.1 Q13.** From the top of a 75 m lighthouse, the angles of depression of two ships, one exactly behind the other, are 30° and 45°. How far apart are they?",
          "**प्रश्नावली 9.1 प्र13।** 75 m ऊँचे प्रकाश-स्तंभ के शीर्ष से दो जहाज़ों के अवनमन कोण, एक ठीक दूसरे के पीछे, 30° और 45° हैं। वे कितनी दूर हैं?",
        ),
      ),
      fig,
      goal,
      done,
      car,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 9.1 Q12 and Q16. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q12 = choiceQuestion(b, {
      name: "q12",
      prompt: t(
        "Exercise 9.1 Q12: from the top of a 7 m building, the elevation of the top of a cable tower is 60° and the depression of its foot is 45°. How tall is the tower?",
        "प्रश्नावली 9.1 प्र12: 7 m ऊँची इमारत के शीर्ष से एक केबल टावर के शीर्ष का उन्नयन कोण 60° और उसके आधार का अवनमन कोण 45° है। टावर कितना ऊँचा है?",
      ),
      options: [
        { id: "right", label: t("7(√3 + 1) m", "7(√3 + 1) m") },
        {
          id: "part",
          label: t("7√3 m", "7√3 m"),
          feedback: t(
            "7√3 m is only the part above the building's top. Add the 7 m below it.",
            "7√3 m केवल इमारत के शीर्ष के ऊपर का हिस्सा है। उसके नीचे का 7 m जोड़ो।",
          ),
        },
        {
          id: "minus",
          label: t("7(√3 − 1) m", "7(√3 − 1) m"),
          feedback: t(
            "The 7 m sits under the 7√3 m part, so the two add: 7√3 + 7.",
            "7 m वाला हिस्सा 7√3 m के नीचे है, इसलिए दोनों जुड़ते हैं: 7√3 + 7।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q16 = choiceQuestion(b, {
      name: "q16",
      prompt: t(
        "Exercise 9.1 Q16: from 4 m and 9 m away, a tower's top is at complementary angles θ and 90° − θ. Why is h² = 4 × 9?",
        "प्रश्नावली 9.1 प्र16: 4 m और 9 m दूर से एक मीनार का शीर्ष पूरक कोणों θ और 90° − θ पर है। h² = 4 × 9 क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t("tan θ · tan(90° − θ) = 1", "tan θ · tan(90° − θ) = 1"),
        },
        {
          id: "sum",
          label: t("tan θ + tan(90° − θ) = 1", "tan θ + tan(90° − θ) = 1"),
          feedback: t(
            "It's the product: tan(90° − θ) = cot θ, and tan θ · cot θ = 1. So (h/4)(h/9) = 1.",
            "यह गुणनफल है: tan(90° − θ) = cot θ, और tan θ · cot θ = 1। तो (h/4)(h/9) = 1।",
          ),
        },
        {
          id: "sin",
          label: t("sin θ · cos(90° − θ) = 1", "sin θ · cos(90° − θ) = 1"),
          feedback: t(
            "cos(90° − θ) = sin θ, so that product is sin²θ, not 1. The tans give h/4 and h/9.",
            "cos(90° − θ) = sin θ, तो वह गुणनफल sin²θ है, 1 नहीं। tan से h/4 और h/9 मिलते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    const proof = w.body(
      t(
        r`$$\tan\theta = \frac{h}{4}, \qquad \tan(90^\circ - \theta) = \cot\theta = \frac{h}{9}$$ $$\frac{h}{4} \times \frac{h}{9} = \tan\theta \cdot \cot\theta = 1$$ $$h^2 = 36 \quad\Rightarrow\quad h = 6 \text{ m}$$`,
        r`$$\tan\theta = \frac{h}{4}, \qquad \tan(90^\circ - \theta) = \cot\theta = \frac{h}{9}$$ $$\frac{h}{4} \times \frac{h}{9} = \tan\theta \cdot \cot\theta = 1$$ $$h^2 = 36 \quad\Rightarrow\quad h = 6 \text{ m}$$`,
      ),
      "proof",
      { isHidden: true },
    );
    b.when(q16.on(QuestionSignal.Correct), theBoard.show(proof));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q12, q16, proof, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Finale: the highest kite of the day, and the mission log. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const sunset = sceneOn(
      b,
      "sunset",
      TrigSceneKind.SankrantiSunset,
      "Sankranti sunset over Kite Hill: the sky full of kites, Kabir's kite highest, the family on the fort wall",
    );
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.KiteString,
      "Kabir's kite: 60 m of string from his hand 1.5 m above the ground, the string at 30° to the horizontal, the kite's height marked ?",
    );
    const kabir = choiceQuestion(b, {
      name: "kabir",
      prompt: t(
        "Kabir's kite first: 60 m of string at 30°, from his hand 1.5 m up. How high is it?",
        "पहले कबीर की पतंग: 30° पर 60 m डोर, ज़मीन से 1.5 m ऊपर उसके हाथ से। वह कितनी ऊँची है?",
      ),
      options: [
        { id: "right", label: t("60 × sin 30° + 1.5 = 31.5 m", "60 × sin 30° + 1.5 = 31.5 m") },
        {
          id: "noeye",
          label: t("60 × sin 30° = 30 m", "60 × sin 30° = 30 m"),
          feedback: t(
            "That's the height above his hand. Add the 1.5 m from the ground to his hand: 31.5 m.",
            "यह उसके हाथ के ऊपर की ऊँचाई है। ज़मीन से हाथ तक का 1.5 m जोड़ो: 31.5 m।",
          ),
        },
        {
          id: "cos",
          label: t("60 × cos 30° + 1.5 ≈ 53.5 m", "60 × cos 30° + 1.5 ≈ 53.5 m"),
          feedback: t(
            "cos 30° gives the stretch along the ground. The height is opposite the 30°: 60 × sin 30° = 30, plus 1.5.",
            "cos 30° ज़मीन के साथ की दूरी देता है। ऊँचाई 30° के सामने है: 60 × sin 30° = 30, और 1.5 जोड़ो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const cousin = choiceQuestion(b, {
      name: "cousin",
      prompt: t(
        "Now the cousin: 40 m of string at 45°, also from 1.5 m up. How high is the cousin's kite?",
        "अब चचेरा भाई: 45° पर 40 m डोर, वह भी 1.5 m ऊपर से। चचेरे भाई की पतंग कितनी ऊँची है?",
      ),
      options: [
        { id: "right", label: t("20√2 + 1.5 ≈ 29.8 m", "20√2 + 1.5 ≈ 29.8 m") },
        {
          id: "noeye",
          label: t("20√2 ≈ 28.3 m", "20√2 ≈ 28.3 m"),
          feedback: t(
            "That's the height above his hand. Add the 1.5 m from the ground to his hand.",
            "यह उसके हाथ के ऊपर की ऊँचाई है। ज़मीन से हाथ तक का 1.5 m जोड़ो।",
          ),
        },
        {
          id: "string",
          label: t("40 + 1.5 = 41.5 m", "40 + 1.5 = 41.5 m"),
          feedback: t(
            "The string slants, so the kite is lower than the string is long: 40 × sin 45° = 20√2.",
            "डोर तिरछी है, इसलिए पतंग डोर की लंबाई से नीचे है: 40 × sin 45° = 20√2।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log: Kite Hill, complete.** (1) Angle of elevation: the watch-tower is 31.5 m. (2) Angle of depression: the temple steps are 20√3 m away. (3) Two observations: the flag pole is about 8.8 m, and the balloon drifted 58√3 m. (4) From a height: the river is 3(√3 + 1) m wide. And the kites: Kabir's at 31.5 m beats his cousin's at about 29.8 m. Exactly as high as the watch-tower. Every height today was found without climbing anything.",
        "**मिशन लॉग: काइट हिल, पूरा।** (1) उन्नयन कोण: प्रहरी-मीनार 31.5 m है। (2) अवनमन कोण: मंदिर की सीढ़ियाँ 20√3 m दूर हैं। (3) दो प्रेक्षण: झंडे का खंभा लगभग 8.8 m है, और गुब्बारा 58√3 m बहा। (4) ऊँचाई से: नदी 3(√3 + 1) m चौड़ी है। और पतंगें: कबीर की 31.5 m वाली, चचेरे भाई की लगभग 29.8 m वाली से ऊपर। ठीक प्रहरी-मीनार जितनी ऊँची। आज हर ऊँचाई बिना कुछ चढ़े निकाली गई।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(cousin.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("The highest kite", "सबसे ऊँची पतंग")),
      sunset,
      w.body(
        t(
          "The sun is setting and the sky is full of kites. Time to settle the bet. Kabir's kite is on 60 m of string, held 1.5 m above the ground, and the string makes 30° with the horizontal.",
          "सूरज ढल रहा है और आसमान पतंगों से भरा है। शर्त का फ़ैसला करने का समय। कबीर की पतंग 60 m डोर पर है, ज़मीन से 1.5 m ऊपर पकड़ी, और डोर क्षैतिज से 30° बनाती है।",
        ),
      ),
      kabir,
      fig,
      goal,
      cousin,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, buildings, rationalise, bridge, inLife, yourTurn, finale];
