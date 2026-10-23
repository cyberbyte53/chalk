import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Problem, TrigSceneKind } from "@chalk/prop-trigonometry";
import { sceneOn, workedOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The flag on the temple roof: one angle isn't enough. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const view = sceneOn(
    b,
    "view",
    TrigSceneKind.TempleAcrossRiver,
    "the temple across the valley with a tall saffron flag on a pole on its roof",
  );
  return column([
    w.title(t("A flag on a roof", "छत पर एक झंडा")),
    view,
    w.body(
      t(
        "The temple across the valley has a tall saffron flag on a pole on its roof. Kabir wants to know how long the pole is, because his kite string is tangled near it. But the pole doesn't start on the ground. It starts on the roof.",
        "घाटी के पार मंदिर की छत पर एक खंभे पर लंबा भगवा झंडा है। कबीर जानना चाहता है कि खंभा कितना लंबा है, क्योंकि उसकी पतंग की डोर उसके पास उलझी है। पर खंभा ज़मीन से शुरू नहीं होता। वह छत से शुरू होता है।",
      ),
    ),
    w.body(
      t(
        "One sighting gives one angle. Riya takes two: one to the roof, one to the top of the flag. Can two angles find a length that starts in mid-air?",
        "एक बार देखने से एक कोण मिलता है। रिया दो बार देखती है: एक बार छत को, एक बार झंडे के शीर्ष को। क्या दो कोण हवा में शुरू होने वाली लंबाई निकाल सकते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Two right triangles that share a side. */
const method = page(
  "method",
  (b) => {
    const w = wordsOn(b);
    const shared = choiceQuestion(b, {
      name: "shared",
      prompt: t(
        "Two sightings from the same point P: the roof at 30°, the flag top at 45°. Which length is shared by both right triangles?",
        "एक ही बिंदु P से दो बार देखा: छत 30° पर, झंडे का शीर्ष 45° पर। दोनों समकोण त्रिभुजों में कौन-सी लंबाई साझा है?",
      ),
      options: [
        {
          id: "right",
          label: t("The distance from P to the building", "P से इमारत तक की दूरी"),
        },
        {
          id: "flag",
          label: t("The length of the flagstaff", "झंडे के खंभे की लंबाई"),
          feedback: t(
            "The flagstaff is only in the bigger triangle. Both triangles stand on the same base along the ground.",
            "खंभा केवल बड़े त्रिभुज में है। दोनों त्रिभुज ज़मीन पर एक ही आधार पर खड़े हैं।",
          ),
        },
        {
          id: "sight",
          label: t("The line of sight from P to the roof", "P से छत तक की दृष्टि रेखा"),
          feedback: t(
            "Each triangle has its own line of sight, at its own angle. The base along the ground is the side they share.",
            "हर त्रिभुज की अपनी दृष्टि रेखा है, अपने कोण पर। ज़मीन पर का आधार वह भुजा है जो दोनों में साझा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two triangles, one shared side", "दो त्रिभुज, एक साझा भुजा")),
      w.body(
        t(
          "When one sighting isn't enough, take two. Each sighting gives its own right triangle, and the two triangles share a side, usually the distance along the ground or the height.",
          "जब एक बार देखना काफ़ी न हो, तो दो बार देखो। हर प्रेक्षण अपना समकोण त्रिभुज देता है, और दोनों त्रिभुजों में एक भुजा साझा होती है, आमतौर पर ज़मीन पर की दूरी या ऊँचाई।",
        ),
      ),
      w.definition(
        t(
          "**The two-triangle method.** (1) Draw both right triangles. (2) Name the unknowns, say h and x. (3) Write one trigonometric equation for each triangle. (4) Solve the two equations together: put one into the other to eliminate an unknown.",
          "**दो-त्रिभुज विधि।** (1) दोनों समकोण त्रिभुज बनाओ। (2) अज्ञातों के नाम रखो, जैसे h और x। (3) हर त्रिभुज के लिए एक त्रिकोणमितीय समीकरण लिखो। (4) दोनों समीकरणों को साथ हल करो: एक को दूसरे में रखकर एक अज्ञात हटाओ।",
        ),
      ),
      shared,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 4: the flagstaff on a 10 m building. */
const flagstaff = page(
  "flagstaff",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Ex4Flagstaff,
      "Example 4 to scale: a 10 m building AB with a flagstaff BD on top, a point P on the ground, the line of sight to B at 30° and to D at 45°, both triangles right-angled at A",
    );
    return column([
      w.title(t("The flagstaff", "झंडे का खंभा")),
      w.body(
        t(
          "**Example 4.** From a point P on the ground, the angle of elevation of the top of a 10 m building is 30°. A flag is hoisted on top of the building, and the angle of elevation of the top of the flagstaff from P is 45°. Find the length of the flagstaff and the distance of the building from P. (Take √3 = 1.732.)",
          "**उदाहरण 4।** ज़मीन के एक बिंदु P से 10 m ऊँची इमारत के शीर्ष का उन्नयन कोण 30° है। इमारत के ऊपर एक झंडा फहराया गया है, और P से झंडे के खंभे के शीर्ष का उन्नयन कोण 45° है। खंभे की लंबाई और P से इमारत की दूरी ज्ञात करो। (√3 = 1.732 लो।)",
        ),
      ),
      fig,
      goal,
      w.body(
        t(
          r`Start with the triangle where you know two things, ∆ PAB: $$\tan 30^\circ = \frac{AB}{AP} \quad\Rightarrow\quad \frac{1}{\sqrt{3}} = \frac{10}{AP}$$ $$AP = 10\sqrt{3} \approx 17.32 \text{ m}$$ Now let BD = x, so AD = 10 + x. In ∆ PAD: $$\tan 45^\circ = \frac{10 + x}{10\sqrt{3}} = 1$$ $$x = 10\sqrt{3} - 10 = 10(\sqrt{3} - 1) \approx 7.32 \text{ m}$$`,
          r`उस त्रिभुज से शुरू करो जिसमें दो बातें पता हैं, ∆ PAB: $$\tan 30^\circ = \frac{AB}{AP} \quad\Rightarrow\quad \frac{1}{\sqrt{3}} = \frac{10}{AP}$$ $$AP = 10\sqrt{3} \approx 17.32 \text{ m}$$ अब मानो BD = x, तो AD = 10 + x। ∆ PAD में: $$\tan 45^\circ = \frac{10 + x}{10\sqrt{3}} = 1$$ $$x = 10\sqrt{3} - 10 = 10(\sqrt{3} - 1) \approx 7.32 \text{ m}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 5: the shadow 40 m longer. */
const shadow = page(
  "shadow",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Ex5Shadow,
      "Example 5 to scale: a tower AB with two shadow tips, C when the Sun is at 60° and D, 40 m farther, when it is at 30°; two right triangles share the height AB",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "After h = x√3, the working writes (x√3)√3 = x + 40. Where does that come from?",
        "h = x√3 के बाद हल (x√3)√3 = x + 40 लिखता है। यह कहाँ से आया?",
      ),
      options: [
        {
          id: "right",
          label: t("Putting h = x√3 into h√3 = x + 40", "h√3 = x + 40 में h = x√3 रखने से"),
        },
        {
          id: "add",
          label: t("Adding the two equations together", "दोनों समीकरणों को जोड़ने से"),
          feedback: t(
            "Nothing is added. Equation (2), cross-multiplied, says h√3 = x + 40; then h is replaced by x√3.",
            "कुछ जोड़ा नहीं गया। समीकरण (2) को वज्र-गुणन करने पर h√3 = x + 40 आता है; फिर h की जगह x√3 रखा गया।",
          ),
        },
        {
          id: "square",
          label: t("Squaring both sides of h = x√3", "h = x√3 के दोनों पक्षों का वर्ग करने से"),
          feedback: t(
            "Squaring would give h² = 3x². Here h is substituted into the other triangle's equation.",
            "वर्ग करने पर h² = 3x² आता। यहाँ h को दूसरे त्रिभुज के समीकरण में रखा गया है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A shadow 40 m longer", "40 m लंबी परछाई")),
      w.body(
        t(
          "**Example 5.** The shadow of a tower on level ground is 40 m longer when the Sun's altitude is 30° than when it is 60°. Find the height of the tower.",
          "**उदाहरण 5।** समतल ज़मीन पर एक मीनार की परछाई तब 40 m ज़्यादा लंबी होती है जब सूर्य का उन्नतांश 30° हो, बजाय उसके जब वह 60° हो। मीनार की ऊँचाई ज्ञात करो।",
        ),
      ),
      w.definition(
        t(
          "**Sun's altitude.** The Sun's **altitude** is the angle of elevation of the Sun. It is also the angle of elevation of the tower's top from the tip of its shadow.",
          "**सूर्य का उन्नतांश।** सूर्य का **उन्नतांश** सूर्य का उन्नयन कोण है। यही परछाई के सिरे से मीनार के शीर्ष का उन्नयन कोण भी है।",
        ),
      ),
      fig,
      goal,
      w.body(
        t(
          r`Let AB = h and the short shadow BC = x, so the long one is x + 40. $$\tan 60^\circ = \frac{h}{x} \quad\Rightarrow\quad h = x\sqrt{3} \qquad (1)$$ $$\tan 30^\circ = \frac{h}{x + 40} \quad\Rightarrow\quad h\sqrt{3} = x + 40 \qquad (2)$$ Put (1) into (2): $$(x\sqrt{3})\sqrt{3} = x + 40$$ $$3x = x + 40 \quad\Rightarrow\quad x = 20$$ $$h = 20\sqrt{3} \text{ m}$$`,
          r`मानो AB = h और छोटी परछाई BC = x, तो लंबी x + 40 है। $$\tan 60^\circ = \frac{h}{x} \quad\Rightarrow\quad h = x\sqrt{3} \qquad (1)$$ $$\tan 30^\circ = \frac{h}{x + 40} \quad\Rightarrow\quad h\sqrt{3} = x + 40 \qquad (2)$$ (1) को (2) में रखो: $$(x\sqrt{3})\sqrt{3} = x + 40$$ $$3x = x + 40 \quad\Rightarrow\quad x = 20$$ $$h = 20\sqrt{3} \text{ m}$$`,
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The temple flag, then the balloon (Exercise 9.1 Q14). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const flag = choiceQuestion(b, {
      name: "flag",
      prompt: t(
        "From where Riya stands, the temple roof, 12 m up, is at 30° and the top of the flag pole at 45°. How long is the flag pole?",
        "रिया जहाँ खड़ी है वहाँ से 12 m ऊँची मंदिर की छत 30° पर और झंडे के खंभे का शीर्ष 45° पर है। खंभा कितना लंबा है?",
      ),
      options: [
        { id: "right", label: t("12(√3 − 1) ≈ 8.78 m", "12(√3 − 1) ≈ 8.78 m") },
        {
          id: "whole",
          label: t("12√3 ≈ 20.78 m", "12√3 ≈ 20.78 m"),
          feedback: t(
            "12√3 is the whole height to the flag top (and the distance). Subtract the 12 m roof.",
            "12√3 झंडे के शीर्ष तक की पूरी ऊँचाई है (और दूरी भी)। 12 m की छत घटाओ।",
          ),
        },
        {
          id: "diff",
          label: t("12(√3 + 1) ≈ 32.8 m", "12(√3 + 1) ≈ 32.8 m"),
          feedback: t(
            "The pole is the top part only: 12√3 − 12, a minus, not a plus.",
            "खंभा केवल ऊपर का हिस्सा है: 12√3 − 12, ऋण, धन नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const balloon = sceneOn(
      b,
      "balloon",
      TrigSceneKind.BalloonDrift,
      "a hot-air balloon drifting along a level line high above the hill, Riya sighting it twice as it moves away",
    );
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.Q14Balloon,
      "Exercise 9.1 Q14 to scale: a girl 1.2 m tall, a balloon moving along a horizontal line 88.2 m above the ground, seen first at 60° and later at 30°, two right triangles with the same height 87 m above her eye",
    );
    const done = w.body(
      t(
        r`Both triangles have the same height above her eye: $$88.2 - 1.2 = 87 \text{ m}$$ $$x_1 = \frac{87}{\tan 60^\circ} = \frac{87}{\sqrt{3}} = 29\sqrt{3}$$ $$x_2 = \frac{87}{\tan 30^\circ} = 87\sqrt{3}$$ $$\text{distance} = 87\sqrt{3} - 29\sqrt{3} = 58\sqrt{3} \approx 100.46 \text{ m}$$ The pole is about 8.8 m, and the balloon drifted about 100 m. **Stop 3 done.**`,
        r`दोनों त्रिभुजों में उसकी आँख के ऊपर ऊँचाई एक ही है: $$88.2 - 1.2 = 87 \text{ m}$$ $$x_1 = \frac{87}{\tan 60^\circ} = \frac{87}{\sqrt{3}} = 29\sqrt{3}$$ $$x_2 = \frac{87}{\tan 30^\circ} = 87\sqrt{3}$$ $$\text{दूरी} = 87\sqrt{3} - 29\sqrt{3} = 58\sqrt{3} \approx 100.46 \text{ m}$$ खंभा लगभग 8.8 m है, और गुब्बारा लगभग 100 m बहा। **पड़ाव 3 पूरा।**`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(done));
    return column([
      w.title(t("The flag, and a balloon", "झंडा, और एक गुब्बारा")),
      flag,
      balloon,
      w.body(
        t(
          "Just then a hot-air balloon drifts over the hill in a straight, level line, 88.2 m up. Riya, whose eyes are 1.2 m above the ground, sights it at 60°. A little later it is at 30°. How far did it travel?",
          "तभी एक गर्म हवा का गुब्बारा पहाड़ी के ऊपर सीधी, समतल रेखा में 88.2 m ऊँचाई पर बहता आता है। रिया, जिसकी आँखें ज़मीन से 1.2 m ऊपर हैं, उसे 60° पर देखती है। थोड़ी देर बाद वह 30° पर है। वह कितनी दूर गया?",
        ),
      ),
      fig,
      goal,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 9.1 Q6 and Q11; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q6 = choiceQuestion(b, {
      name: "q6",
      prompt: t(
        "Exercise 9.1 Q6: a 1.5 m tall boy walks towards a 30 m building, and the elevation of its top from his eyes rises from 30° to 60°. How far did he walk?",
        "प्रश्नावली 9.1 प्र6: 1.5 m लंबा लड़का 30 m ऊँची इमारत की ओर चलता है, और उसकी आँखों से इमारत के शीर्ष का उन्नयन कोण 30° से 60° हो जाता है। वह कितना चला?",
      ),
      options: [
        { id: "right", label: t("19√3 m", "19√3 m") },
        {
          id: "noeye",
          label: t("20√3 m", "20√3 m"),
          feedback: t(
            "That uses the full 30 m. Above his eye the building is only 30 − 1.5 = 28.5 m.",
            "इसमें पूरी 30 m ली गई। उसकी आँख के ऊपर इमारत केवल 30 − 1.5 = 28.5 m है।",
          ),
        },
        {
          id: "far",
          label: t("28.5√3 m", "28.5√3 m"),
          feedback: t(
            "28.5√3 is where he started. He walked the difference: 28.5√3 − 28.5/√3 = 19√3.",
            "28.5√3 वह जगह है जहाँ से उसने शुरू किया। वह अंतर जितना चला: 28.5√3 − 28.5/√3 = 19√3।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q11 = choiceQuestion(b, {
      name: "q11",
      prompt: t(
        "Exercise 9.1 Q11: a TV tower stands on a canal bank. From the opposite bank its top is at 60°; from 20 m farther back, at 30°. How wide is the canal?",
        "प्रश्नावली 9.1 प्र11: एक नहर के किनारे टीवी टावर खड़ा है। सामने वाले किनारे से उसका शीर्ष 60° पर है; 20 m और पीछे से 30° पर। नहर कितनी चौड़ी है?",
      ),
      options: [
        { id: "right", label: t("10 m", "10 m") },
        {
          id: "twenty",
          label: t("20 m", "20 m"),
          feedback: t(
            "20 m is how far back the second point is. From h = x√3 and h√3 = x + 20: 3x = x + 20, so x = 10.",
            "20 m दूसरा बिंदु कितना पीछे है, वह है। h = x√3 और h√3 = x + 20 से: 3x = x + 20, तो x = 10।",
          ),
        },
        {
          id: "height",
          label: t("10√3 m", "10√3 m"),
          feedback: t(
            "10√3 m is the height of the tower. The width is x = 10 m.",
            "10√3 m टावर की ऊँचाई है। चौड़ाई x = 10 m है।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Two sightings make two right triangles that share a side. ✓ One equation each; put one into the other. ✓ The temple flag pole is about 8.8 m; the balloon drifted 58√3 m. Last stop: looking down from a height, and the highest kite of the day.",
        "**मिशन लॉग।** ✓ दो प्रेक्षण दो समकोण त्रिभुज बनाते हैं जिनकी एक भुजा साझा होती है। ✓ हर एक का एक समीकरण; एक को दूसरे में रखो। ✓ मंदिर का झंडा-खंभा लगभग 8.8 m है; गुब्बारा 58√3 m बहा। अंतिम पड़ाव: ऊँचाई से नीचे देखना, और दिन की सबसे ऊँची पतंग।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q11.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q6, q11, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, method, flagstaff, shadow, inLife, yourTurn];
