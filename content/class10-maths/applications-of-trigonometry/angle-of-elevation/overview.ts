import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ClinoAction,
  ClinoDerived,
  ClinoTarget,
  Problem,
  TrigSceneKind,
  clinometerDef,
} from "@chalk/prop-trigonometry";
import { figureOn, sceneOn, workedOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Sankranti on Kite Hill: the questions the day will ask. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const hill = sceneOn(
    b,
    "hill",
    TrigSceneKind.FortHill,
    "the old fort on Kite Hill on Makar Sankranti morning: the watch-tower, the fort wall above the river, the temple across the valley, and the family climbing up with kites",
  );
  return column([
    w.title(t("Festival day on Kite Hill", "काइट हिल पर त्योहार का दिन")),
    hill,
    w.body(
      t(
        "It is Makar Sankranti. Riya, Kabir, Mom and Grandpa climb the old fort on Kite Hill with a bag of kites, Grandpa's homemade clinometer and Riya's ratio card from the last chapter. From the top you can see the watch-tower, the river far below, and a temple with a flag across the valley.",
        "आज मकर संक्रांति है। रिया, कबीर, मम्मी और दादाजी पतंगों का थैला, दादाजी का घर का बना क्लाइनोमीटर और पिछले अध्याय वाला रिया का अनुपात-कार्ड लेकर काइट हिल के पुराने किले पर चढ़ते हैं। ऊपर से प्रहरी-मीनार दिखती है, बहुत नीचे नदी, और घाटी के पार झंडे वाला एक मंदिर।",
      ),
    ),
    w.body(
      t(
        'Kabir has a bet with his cousin: whose kite flies highest today. But nobody can climb up to a kite with a tape. Grandpa smiles: "You don\'t need to climb. You need an angle and a ratio."',
        'कबीर ने अपने चचेरे भाई से शर्त लगाई है: आज किसकी पतंग सबसे ऊँची उड़ेगी। पर कोई फ़ीता लेकर पतंग तक तो चढ़ नहीं सकता। दादाजी मुस्कुराते हैं: "चढ़ने की ज़रूरत नहीं। एक कोण और एक अनुपात चाहिए।"',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: heights without climbing. The stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Heights you can't reach", "ऊँचाइयाँ जहाँ पहुँच नहीं सकते")),
    w.body(
      t(
        "In the last chapter Riya and Kabir learnt the trigonometric ratios: for an angle in a right triangle, sin, cos and tan compare its sides. This chapter uses them for the thing they were invented for: finding heights and distances **without measuring them directly**.",
        "पिछले अध्याय में रिया और कबीर ने त्रिकोणमितीय अनुपात सीखे: किसी समकोण त्रिभुज के एक कोण के लिए sin, cos और tan उसकी भुजाओं की तुलना करते हैं। यह अध्याय उनका उपयोग उसी काम के लिए करता है जिसके लिए उनका आविष्कार हुआ: ऊँचाइयाँ और दूरियाँ **सीधे नापे बिना** ज्ञात करना।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Looking up: the angle of elevation, and the watch-tower's height: *this lesson*. (2) Looking down: the angle of depression, and the temple across the river. (3) Two observations: the flag on the temple roof, and the drifting balloon. (4) Looking down from a height: the river under the bridge, and the highest kite of the day.",
        "**रास्ते के पड़ाव।** (1) ऊपर देखना: उन्नयन कोण, और प्रहरी-मीनार की ऊँचाई: *यह पाठ*। (2) नीचे देखना: अवनमन कोण, और नदी पार का मंदिर। (3) दो प्रेक्षण: मंदिर की छत का झंडा, और बहता गुब्बारा। (4) ऊँचाई से नीचे देखना: पुल के नीचे की नदी, और दिन की सबसे ऊँची पतंग।",
      ),
    ),
    w.note(
      t(
        "Surveyors have done this for centuries. In the Great Trigonometric Survey of British India, the two largest theodolites ever built (instruments that measure angles with a turning telescope) were used. In 1852 the highest mountain in the world was found by sighting it from six stations more than 160 km away. It was named after Sir George Everest in 1856, and the theodolites are now in the Survey of India museum in Dehradun.",
        "सर्वेक्षक सदियों से यही करते आए हैं। ब्रिटिश भारत के 'महान त्रिकोणमितीय सर्वेक्षण' में अब तक के दो सबसे बड़े थियोडोलाइट (घूमती दूरबीन से कोण नापने वाले यंत्र) इस्तेमाल हुए। 1852 में दुनिया का सबसे ऊँचा पर्वत 160 km से भी ज़्यादा दूर के छह स्थानों से देखकर खोजा गया। 1856 में इसका नाम सर जॉर्ज एवरेस्ट के नाम पर रखा गया, और वे थियोडोलाइट अब देहरादून में भारतीय सर्वेक्षण विभाग के संग्रहालय में हैं।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Line of sight, horizontal, angle of elevation, with the clinometer. */
const sight = page(
  "sight",
  (b) => {
    const w = wordsOn(b);
    const clino = b.prop(clinometerDef, "clino", {
      target: ClinoTarget.Tree,
      targetHeight: 11.5,
      distance: 10,
      eyeHeight: 1.5,
      tilt: 10,
      tiltStep: 5,
      walkStep: 5,
      canTilt: true,
      canWalk: false,
      showWorking: false,
    });
    b.studentOnly(clino.action(ClinoAction.Tilt));
    b.standsFor(
      clino,
      "an observer 10 m from a tree holding a clinometer: a protractor with a sighting straw and a plumb line; tilting the straw raises the dashed line of sight, and the dial reads the angle it makes with the horizontal",
    );
    const goal = goalQuestion(b, {
      about: clino,
      prompt: t(
        "Tilt the sight up until the line of sight meets the top of the tree.",
        "दृष्टि को तब तक ऊपर झुकाओ जब तक दृष्टि रेखा पेड़ के शीर्ष से न मिल जाए।",
      ),
      isMet: clino.derived(ClinoDerived.IsSighted).eq(true),
      solve: Array.from({ length: 7 }, () => clino.learner(ClinoAction.Tilt, { by: 1 })),
    });
    const sighted = w.body(
      t(
        r`The sight meets the top at 45°. The line of sight, the horizontal and the tree make a right triangle, and that is all trigonometry needs.`,
        r`दृष्टि 45° पर शीर्ष से मिलती है। दृष्टि रेखा, क्षैतिज और पेड़ मिलकर एक समकोण त्रिभुज बनाते हैं, और त्रिकोणमिति को बस इतना ही चाहिए।`,
      ),
      "sighted",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(sighted));
    return column([
      w.title(t("Looking up at something", "किसी चीज़ को ऊपर देखना")),
      w.definition(
        t(
          "**Line of sight and horizontal.** The **line of sight** is the line drawn from the eye of an observer to the point being looked at. The **horizontal** through the eye is the level line from the eye, parallel to the ground.",
          "**दृष्टि रेखा और क्षैतिज।** प्रेक्षक की आँख से देखी जा रही वस्तु के बिंदु तक खींची गई रेखा **दृष्टि रेखा** है। आँख से होकर जाने वाली **क्षैतिज रेखा** आँख से निकलने वाली समतल रेखा है, ज़मीन के समांतर।",
        ),
      ),
      w.definition(
        t(
          "**Angle of elevation.** When the point you look at is **above** the horizontal, so you raise your head, the angle between the line of sight and the horizontal is the **angle of elevation** of that point.",
          "**उन्नयन कोण।** जब देखा जा रहा बिंदु क्षैतिज से **ऊपर** हो, यानी तुम सिर उठाते हो, तब दृष्टि रेखा और क्षैतिज के बीच का कोण उस बिंदु का **उन्नयन कोण** होता है।",
        ),
      ),
      w.body(
        t(
          "A clinometer measures it: sight along the straw at the top, and the plumb line, hanging straight down, reads the angle on the protractor.",
          "क्लाइनोमीटर इसे नापता है: स्ट्रॉ से शीर्ष की ओर देखो, और सीधा नीचे लटकता साहुल चाँदे पर कोण पढ़ देता है।",
        ),
      ),
      clino,
      goal,
      sighted,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** What you need to find a height, and which ratio to use. */
const needs = page(
  "needs",
  (b) => {
    const w = wordsOn(b);
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "You know the distance along the ground and the angle at your eye, and you want the height above your eye. Which ratios link them?",
        "तुम्हें ज़मीन पर दूरी और अपनी आँख पर कोण पता है, और आँख से ऊपर की ऊँचाई चाहिए। कौन-से अनुपात इन्हें जोड़ते हैं?",
      ),
      options: [
        { id: "right", label: t("tan A or cot A", "tan A या cot A") },
        {
          id: "sin",
          label: t("sin A or cosec A", "sin A या cosec A"),
          feedback: t(
            "sin A = BC/AC uses the line of sight AC, which you don't know. The ground distance is AB and the height above the eye is BC.",
            "sin A = BC/AC में दृष्टि रेखा AC है, जो तुम्हें पता नहीं। ज़मीन की दूरी AB है और आँख से ऊपर की ऊँचाई BC।",
          ),
        },
        {
          id: "cos",
          label: t("cos A or sec A", "cos A या sec A"),
          feedback: t(
            "cos A = AB/AC also needs AC. Choose the ratio with the two sides you have and want.",
            "cos A = AB/AC को भी AC चाहिए। वह अनुपात चुनो जिसमें वही दो भुजाएँ हों जो पता हैं और जो चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What you need to find a height", "ऊँचाई निकालने के लिए क्या चाहिए")),
      w.body(
        t(
          "A student looks at the top C of a minar from her eye A. To find the height CD of the minar without climbing it, she needs three things:",
          "एक छात्रा अपनी आँख A से मीनार के शीर्ष C को देखती है। मीनार की ऊँचाई CD बिना चढ़े निकालने के लिए उसे तीन चीज़ें चाहिए:",
        ),
      ),
      w.definition(
        t(
          "**Three things to know.** (i) The distance DE from her to the foot of the minar. (ii) The angle of elevation ∠BAC of the top. (iii) The height AE of her eye above the ground.",
          "**तीन बातें जो पता हों।** (i) उससे मीनार के आधार तक की दूरी DE। (ii) शीर्ष का उन्नयन कोण ∠BAC। (iii) ज़मीन से उसकी आँख की ऊँचाई AE।",
        ),
      ),
      figureOn(b, "figure", {
        points: [
          { name: "E", at: [0, 0] },
          { name: "A", at: [0, 1.5] },
          { name: "D", at: [10, 0] },
          { name: "B", at: [10, 1.5] },
          { name: "C", at: [10, 8] },
        ],
        items: [
          { kind: "seg", a: "E", b: "D", tone: "muted" },
          { kind: "seg", a: "A", b: "E" },
          { kind: "seg", a: "D", b: "C" },
          { kind: "seg", a: "A", b: "B", tone: "construction", dashed: true },
          { kind: "seg", a: "A", b: "C", tone: "accent" },
          { kind: "right", at: "B", p: "A", q: "C" },
          { kind: "angle", at: "A", p: "B", q: "C", tone: "accent" },
          { kind: "note", at: [5, 1.5], text: "AB = DE", prefer: 90 },
          { kind: "note", at: [10, 4.75], text: "BC", prefer: 0 },
          { kind: "note", at: [10, 0.75], text: "BD = AE", prefer: 0 },
        ],
        captions: [
          {
            en: "Eye A, height AE; the minar CD, with B on it level with her eye. The right angle is at B.",
            hi: "आँख A, ऊँचाई AE; मीनार CD, जिस पर B उसकी आँख के स्तर पर है। समकोण B पर है।",
          },
        ],
        about:
          "A student at E with her eye at A, looking up at the top C of a minar CD; B is the point on the minar level with her eye, the dashed horizontal AB equals the ground distance DE, the right angle is at B, and the angle of elevation is marked at A.",
        height: 220,
      }),
      w.body(
        t(
          r`B is the point on the minar level with her eye, so BD = AE and AB = DE. Then $$CD = CB + BD$$ In the right triangle ABC, BC is opposite the known angle A and AB is next to it. The ratio that contains exactly these two sides is $$\tan A = \frac{BC}{AB}$$ Solve it for BC, then add her eye height AE.`,
          r`B मीनार पर उसकी आँख के स्तर वाला बिंदु है, इसलिए BD = AE और AB = DE। तब $$CD = CB + BD$$ समकोण त्रिभुज ABC में BC ज्ञात कोण A के सामने है और AB उसके पास। ठीक इन्हीं दो भुजाओं वाला अनुपात है $$\tan A = \frac{BC}{AB}$$ इसे BC के लिए हल करो, फिर उसकी आँख की ऊँचाई AE जोड़ो।`,
        ),
      ),
      which,
      w.definition(
        t(
          "**Every problem, the same steps.** (1) Draw the figure. (2) Mark the right angle and the known angle. (3) Choose the ratio that links what you know to what you want. (4) Solve. (5) Add the eye height, if there is one.",
          "**हर प्रश्न, वही चरण।** (1) आकृति बनाओ। (2) समकोण और ज्ञात कोण पर निशान लगाओ। (3) वह अनुपात चुनो जो ज्ञात को अज्ञात से जोड़े। (4) हल करो। (5) आँख की ऊँचाई हो, तो जोड़ो।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 1: the tower, tan 60°. */
const tower = page(
  "tower",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Ex1Tower,
      "Example 1 to scale: a tower AB, a point C on the ground 15 m from its foot B, the line of sight CA at 60° to the ground, the right angle at B",
    );
    return column([
      w.title(t("A tower, from 15 m away", "15 m दूर से एक मीनार")),
      w.body(
        t(
          "**Example 1.** A tower stands vertically on the ground. From a point on the ground 15 m from its foot, the angle of elevation of the top is 60°. Find the height of the tower.",
          "**उदाहरण 1।** एक मीनार ज़मीन पर ऊर्ध्वाधर खड़ी है। उसके आधार से 15 m दूर ज़मीन के एक बिंदु से शीर्ष का उन्नयन कोण 60° है। मीनार की ऊँचाई ज्ञात करो।",
        ),
      ),
      fig,
      goal,
      w.body(
        t(
          r`The point is on the ground, so there is no eye height to add. Triangle ACB is right-angled at B, and tan links AB with BC: $$\tan 60^\circ = \frac{AB}{BC}$$ $$\sqrt{3} = \frac{AB}{15}$$ $$AB = 15\sqrt{3} \text{ m}$$`,
          r`बिंदु ज़मीन पर है, इसलिए आँख की कोई ऊँचाई नहीं जोड़नी। त्रिभुज ACB, B पर समकोण है, और tan, AB को BC से जोड़ता है: $$\tan 60^\circ = \frac{AB}{BC}$$ $$\sqrt{3} = \frac{AB}{15}$$ $$AB = 15\sqrt{3} \text{ m}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2: the electrician's ladder, sin 60° and cot 60°. */
const ladder = page(
  "ladder",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Ex2Ladder,
      "Example 2 to scale: a 5 m pole AD, the point B 1.3 m below its top, a ladder BC leaning at 60° to the ground with its foot C, the right angle at D",
    );
    const ratio = choiceQuestion(b, {
      name: "ratio",
      prompt: t(
        "You know BD = 3.7 m and the angle at C. The ladder BC is the hypotenuse. Which ratio gives BC?",
        "तुम्हें BD = 3.7 m और C पर कोण पता है। सीढ़ी BC कर्ण है। कौन-सा अनुपात BC देता है?",
      ),
      options: [
        { id: "right", label: t("sin 60° = BD / BC", "sin 60° = BD / BC") },
        {
          id: "tan",
          label: t("tan 60° = BD / BC", "tan 60° = BD / BC"),
          feedback: t(
            "tan is opposite over adjacent, BD/DC. The ladder is the hypotenuse, so use sin.",
            "tan सम्मुख/आसन्न है, BD/DC। सीढ़ी कर्ण है, इसलिए sin लो।",
          ),
        },
        {
          id: "cos",
          label: t("cos 60° = BD / BC", "cos 60° = BD / BC"),
          feedback: t(
            "cos uses the side next to the angle, DC. BD is opposite the angle at C.",
            "cos में कोण के पास वाली भुजा DC आती है। BD, C के कोण के सामने है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        r`$$BD = 5 - 1.3 = 3.7 \text{ m}$$ $$\frac{BD}{BC} = \sin 60^\circ \quad\Rightarrow\quad \frac{3.7}{BC} = \frac{\sqrt{3}}{2}$$ $$BC = \frac{3.7 \times 2}{\sqrt{3}} \approx 4.28 \text{ m}$$ For the foot, use the side next to the angle: $$\frac{DC}{BD} = \cot 60^\circ = \frac{1}{\sqrt{3}}$$ $$DC = \frac{3.7}{\sqrt{3}} \approx 2.14 \text{ m}$$ (taking √3 = 1.73).`,
        r`$$BD = 5 - 1.3 = 3.7 \text{ m}$$ $$\frac{BD}{BC} = \sin 60^\circ \quad\Rightarrow\quad \frac{3.7}{BC} = \frac{\sqrt{3}}{2}$$ $$BC = \frac{3.7 \times 2}{\sqrt{3}} \approx 4.28 \text{ m}$$ पैर के लिए कोण के पास वाली भुजा लो: $$\frac{DC}{BD} = \cot 60^\circ = \frac{1}{\sqrt{3}}$$ $$DC = \frac{3.7}{\sqrt{3}} \approx 2.14 \text{ m}$$ (√3 = 1.73 लेकर)।`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(ratio.on(QuestionSignal.Correct), theBoard.show(after));
    return column([
      w.title(t("The electrician's ladder", "बिजली मिस्त्री की सीढ़ी")),
      w.body(
        t(
          "**Example 2.** An electrician must repair a fault 1.3 m below the top of a 5 m pole. Her ladder will lean at 60° to the horizontal. How long must the ladder be, and how far from the pole should its foot be?",
          "**उदाहरण 2।** एक बिजली मिस्त्री को 5 m ऊँचे खंभे के शीर्ष से 1.3 m नीचे खराबी ठीक करनी है। उसकी सीढ़ी क्षैतिज से 60° पर टिकेगी। सीढ़ी कितनी लंबी हो, और उसका पैर खंभे से कितनी दूर हो?",
        ),
      ),
      fig,
      ratio,
      after,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 3: the chimney, with the observer's eye height. */
const chimney = page(
  "chimney",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Ex3Chimney,
      "Example 3 to scale: a chimney AB, an observer CD 1.5 m tall standing 28.5 m away, the horizontal DE from her eye to the chimney, and the line of sight DA at 45°",
    );
    const add = choiceQuestion(b, {
      name: "add",
      prompt: t(
        "tan 45° gives AE = 28.5 m. Why isn't that the chimney's height?",
        "tan 45° से AE = 28.5 m मिलता है। यह चिमनी की ऊँचाई क्यों नहीं है?",
      ),
      options: [
        {
          id: "right",
          label: t("AE starts at her eye, 1.5 m up", "AE उसकी आँख से शुरू होता है, 1.5 m ऊपर"),
        },
        {
          id: "slant",
          label: t("AE is the slanting line of sight", "AE तिरछी दृष्टि रेखा है"),
          feedback: t(
            "AE is upright: it is part of the chimney, from eye level to the top. The line of sight is DA.",
            "AE सीधी खड़ी है: यह चिमनी का हिस्सा है, आँख के स्तर से शीर्ष तक। दृष्टि रेखा DA है।",
          ),
        },
        {
          id: "angle",
          label: t("tan 45° is not exactly 1", "tan 45° ठीक 1 नहीं होता"),
          feedback: t(
            "tan 45° is exactly 1. What's missing is the bit of chimney below her eye level.",
            "tan 45° ठीक 1 है। जो छूट गया है वह आँख के स्तर के नीचे का चिमनी का हिस्सा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Don't forget the eye", "आँख को मत भूलो")),
      w.body(
        t(
          "**Example 3.** An observer 1.5 m tall is 28.5 m from a chimney. The angle of elevation of its top from her eyes is 45°. What is the height of the chimney?",
          "**उदाहरण 3।** 1.5 m लंबी एक प्रेक्षक एक चिमनी से 28.5 m दूर है। उसकी आँखों से चिमनी के शीर्ष का उन्नयन कोण 45° है। चिमनी की ऊँचाई कितनी है?",
        ),
      ),
      fig,
      goal,
      w.body(
        t(
          r`The right triangle is ADE, with DE = 28.5 m at eye level: $$\tan 45^\circ = \frac{AE}{DE} \quad\Rightarrow\quad 1 = \frac{AE}{28.5}$$ $$AE = 28.5 \text{ m}$$ $$AB = AE + EB = 28.5 + 1.5 = 30 \text{ m}$$`,
          r`समकोण त्रिभुज ADE है, जिसमें आँख के स्तर पर DE = 28.5 m: $$\tan 45^\circ = \frac{AE}{DE} \quad\Rightarrow\quad 1 = \frac{AE}{28.5}$$ $$AE = 28.5 \text{ m}$$ $$AB = AE + EB = 28.5 + 1.5 = 30 \text{ m}$$`,
        ),
      ),
      add,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir measures the watch-tower with the clinometer. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const scene = sceneOn(
      b,
      "scene",
      TrigSceneKind.TowerSighting,
      "Kabir at the foot of the fort's watch-tower, 30 m away, sighting its top through the clinometer while Riya holds the tape",
    );
    const clino = b.prop(clinometerDef, "clino", {
      target: ClinoTarget.Tower,
      targetHeight: 31.5,
      distance: 30,
      eyeHeight: 1.5,
      tilt: 20,
      tiltStep: 5,
      walkStep: 5,
      canTilt: true,
      canWalk: false,
      showWorking: true,
    });
    b.studentOnly(clino.action(ClinoAction.Tilt));
    b.standsFor(
      clino,
      "Kabir 30 m from the watch-tower with his eye 1.5 m up; the learner tilts the clinometer to sight the top, and the working h = 30 × tan θ, height = h + 1.5 appears under it",
    );
    const goal = goalQuestion(b, {
      about: clino,
      prompt: t(
        "Tilt Kabir's clinometer until the line of sight meets the top of the tower.",
        "कबीर का क्लाइनोमीटर तब तक झुकाओ जब तक दृष्टि रेखा मीनार के शीर्ष से न मिल जाए।",
      ),
      isMet: clino.derived(ClinoDerived.IsSighted).eq(true),
      solve: Array.from({ length: 5 }, () => clino.learner(ClinoAction.Tilt, { by: 1 })),
    });
    const height = choiceQuestion(b, {
      name: "height",
      prompt: t(
        "The clinometer reads 45° from 30 m, with Kabir's eye 1.5 m up. How tall is the watch-tower?",
        "30 m से क्लाइनोमीटर 45° पढ़ता है, और कबीर की आँख 1.5 m ऊपर है। प्रहरी-मीनार कितनी ऊँची है?",
      ),
      options: [
        { id: "right", label: t("31.5 m", "31.5 m") },
        {
          id: "noeye",
          label: t("30 m", "30 m"),
          feedback: t(
            "30 m is the part above Kabir's eye. Add the 1.5 m below it.",
            "30 m कबीर की आँख के ऊपर वाला हिस्सा है। उसके नीचे का 1.5 m जोड़ो।",
          ),
        },
        {
          id: "slant",
          label: t("43.9 m", "43.9 m"),
          feedback: t(
            "That is about the length of the line of sight, 30√2 + 1.5. The height uses tan, not the slant.",
            "यह लगभग दृष्टि रेखा की लंबाई है, 30√2 + 1.5। ऊँचाई के लिए tan चाहिए, तिरछी रेखा नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        r`$$\tan 45^\circ = \frac{h}{30} \quad\Rightarrow\quad h = 30 \text{ m}$$ $$\text{height} = 30 + 1.5 = 31.5 \text{ m}$$ The watch-tower is 31.5 m tall, measured without a single step up it. **Stop 1 done.**`,
        r`$$\tan 45^\circ = \frac{h}{30} \quad\Rightarrow\quad h = 30 \text{ m}$$ $$\text{ऊँचाई} = 30 + 1.5 = 31.5 \text{ m}$$ प्रहरी-मीनार 31.5 m ऊँची है, उस पर एक भी सीढ़ी चढ़े बिना नापी गई। **पड़ाव 1 पूरा।**`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(height.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("How tall is the watch-tower?", "प्रहरी-मीनार कितनी ऊँची है?")),
      scene,
      w.body(
        t(
          "Kabir paces 30 m from the foot of the watch-tower. Riya checks it with the tape. Then Kabir sights the top.",
          "कबीर प्रहरी-मीनार के आधार से 30 m कदम नापता है। रिया फ़ीते से जाँचती है। फिर कबीर शीर्ष को देखता है।",
        ),
      ),
      clino,
      goal,
      height,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 9.1 Q4 and Q5, and Kabir's kite; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const kite = sceneOn(
      b,
      "kite",
      TrigSceneKind.KiteFlying,
      "Kabir flying his kite from the fort wall, the string running up from his hand at an angle to the horizontal",
    );
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "Exercise 9.1 Q4: from a point 30 m from a tower's foot, the angle of elevation of its top is 30°. How tall is the tower?",
        "प्रश्नावली 9.1 प्र4: एक मीनार के आधार से 30 m दूर के बिंदु से उसके शीर्ष का उन्नयन कोण 30° है। मीनार कितनी ऊँची है?",
      ),
      options: [
        { id: "right", label: t("10√3 m", "10√3 m") },
        {
          id: "cot",
          label: t("30√3 m", "30√3 m"),
          feedback: t(
            "That multiplies by cot 30°. Height = 30 × tan 30° = 30/√3 = 10√3.",
            "इसमें cot 30° से गुणा हुआ। ऊँचाई = 30 × tan 30° = 30/√3 = 10√3।",
          ),
        },
        {
          id: "sin",
          label: t("15 m", "15 m"),
          feedback: t(
            "15 = 30 × sin 30° treats 30 m as the line of sight. 30 m is along the ground, so use tan.",
            "15 = 30 × sin 30° में 30 m को दृष्टि रेखा मान लिया। 30 m ज़मीन पर है, इसलिए tan लो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q5 = choiceQuestion(b, {
      name: "q5",
      prompt: t(
        "Exercise 9.1 Q5: a kite flies 60 m above the ground; its string, tied to the ground, makes 60° with it. How long is the string?",
        "प्रश्नावली 9.1 प्र5: एक पतंग ज़मीन से 60 m ऊपर उड़ रही है; ज़मीन पर बँधी उसकी डोर ज़मीन से 60° बनाती है। डोर कितनी लंबी है?",
      ),
      options: [
        { id: "right", label: t("40√3 m", "40√3 m") },
        {
          id: "tan",
          label: t("20√3 m", "20√3 m"),
          feedback: t(
            "20√3 = 60/√3 is the distance along the ground. The string is the hypotenuse: 60 / sin 60°.",
            "20√3 = 60/√3 ज़मीन पर की दूरी है। डोर कर्ण है: 60 / sin 60°।",
          ),
        },
        {
          id: "cos",
          label: t("120 m", "120 m"),
          feedback: t(
            "120 = 60 / cos 60° uses the wrong side. 60 m is opposite the angle, so use sin.",
            "120 = 60 / cos 60° में ग़लत भुजा ली गई। 60 m कोण के सामने है, इसलिए sin लो।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Line of sight, horizontal, angle of elevation. ✓ Choose the ratio that links the two sides you have and want. ✓ The watch-tower is 31.5 m. Next stop: looking down, from the fort wall to the temple across the river.",
        "**मिशन लॉग।** ✓ दृष्टि रेखा, क्षैतिज, उन्नयन कोण। ✓ वह अनुपात चुनो जो ज्ञात और अज्ञात दोनों भुजाओं को जोड़े। ✓ प्रहरी-मीनार 31.5 m है। अगला पड़ाव: नीचे देखना, किले की दीवार से नदी पार के मंदिर तक।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q5.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q4, kite, q5, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, why, sight, needs, tower, ladder, chimney, inLife, yourTurn];
