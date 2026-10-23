import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Problem, TrigSceneKind } from "@chalk/prop-trigonometry";
import { sceneOn, workedOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** On the fort wall, looking down at the temple across the river. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const view = sceneOn(
    b,
    "view",
    TrigSceneKind.TempleAcrossRiver,
    "Riya on the fort wall high above the river, looking down at the temple steps on the far bank",
  );
  return column([
    w.title(t("Looking down", "नीचे देखना")),
    view,
    w.body(
      t(
        "The watch-tower is done: 31.5 m. Now Riya leans over the fort wall. Far below, across the river, are the temple steps where Mom wants to light a lamp this evening. How far away are they? There is no bridge here and no tape long enough.",
        "प्रहरी-मीनार हो गई: 31.5 m। अब रिया किले की दीवार से झाँकती है। बहुत नीचे, नदी के पार, मंदिर की सीढ़ियाँ हैं जहाँ मम्मी आज शाम दीया जलाना चाहती हैं। वे कितनी दूर हैं? यहाँ न पुल है, न इतना लंबा फ़ीता।",
      ),
    ),
    w.body(
      t(
        "This time Riya has to look *down*, not up. Does the same trick still work?",
        "इस बार रिया को ऊपर नहीं, *नीचे* देखना है। क्या वही तरीक़ा अब भी काम करेगा?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The angle of depression, against the angle of elevation. */
const depression = page(
  "depression",
  (b) => {
    const w = wordsOn(b);
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "A girl on a balcony looks down at a flower pot on a temple step. The angle her line of sight makes with the horizontal is…",
        "बालकनी पर बैठी एक लड़की मंदिर की सीढ़ी पर रखे गमले को नीचे देखती है। उसकी दृष्टि रेखा क्षैतिज से जो कोण बनाती है, वह…",
      ),
      options: [
        { id: "right", label: t("an angle of depression", "एक अवनमन कोण") },
        {
          id: "elev",
          label: t("an angle of elevation", "एक उन्नयन कोण"),
          feedback: t(
            "The pot is below her horizontal: she lowers her head. That is depression.",
            "गमला उसकी क्षैतिज रेखा से नीचे है: वह सिर झुकाती है। यह अवनमन है।",
          ),
        },
        {
          id: "right90",
          label: t("a right angle at her eye", "उसकी आँख पर एक समकोण"),
          feedback: t(
            "The right angle is between the wall and the ground. The angle at her eye is between the line of sight and the horizontal.",
            "समकोण दीवार और ज़मीन के बीच है। उसकी आँख पर कोण दृष्टि रेखा और क्षैतिज के बीच है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The angle of depression", "अवनमन कोण")),
      w.definition(
        t(
          "**Angle of depression.** When the point you look at is **below** the horizontal through your eye, so you lower your head, the angle between the line of sight and the horizontal is the **angle of depression** of that point.",
          "**अवनमन कोण।** जब देखा जा रहा बिंदु तुम्हारी आँख से होकर जाने वाली क्षैतिज रेखा से **नीचे** हो, यानी तुम सिर झुकाते हो, तब दृष्टि रेखा और क्षैतिज के बीच का कोण उस बिंदु का **अवनमन कोण** होता है।",
        ),
      ),
      w.body(
        t(
          "Both angles are measured **from the horizontal at the eye**: elevation when you look up, depression when you look down. Neither is measured from the wall or from the ground.",
          "दोनों कोण **आँख पर क्षैतिज रेखा से** नापे जाते हैं: ऊपर देखो तो उन्नयन, नीचे देखो तो अवनमन। कोई भी दीवार से या ज़मीन से नहीं नापा जाता।",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Alternate angles: the depression at the top equals the elevation at the bottom. */
const alternate = page(
  "alternate",
  (b) => {
    const w = wordsOn(b);
    const equal = choiceQuestion(b, {
      name: "equal",
      prompt: t(
        "From P at the top of a wall the angle of depression of a point B on the ground is 30°. What is the angle of elevation of P from B?",
        "दीवार के शीर्ष P से ज़मीन के बिंदु B का अवनमन कोण 30° है। B से P का उन्नयन कोण कितना है?",
      ),
      options: [
        { id: "right", label: t("30°", "30°") },
        {
          id: "comp",
          label: t("60°", "60°"),
          feedback: t(
            "60° is the angle between the line of sight and the wall. The two horizontals are parallel, so the alternate angles are both 30°.",
            "60° दृष्टि रेखा और दीवार के बीच का कोण है। दोनों क्षैतिज रेखाएँ समांतर हैं, इसलिए एकांतर कोण दोनों 30° हैं।",
          ),
        },
        {
          id: "supp",
          label: t("150°", "150°"),
          feedback: t(
            "150° would be the angle on the other side of the line of sight. Alternate angles are equal, not supplementary.",
            "150° दृष्टि रेखा के दूसरी ओर का कोण होता। एकांतर कोण बराबर होते हैं, संपूरक नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The same angle, seen from both ends", "दोनों सिरों से एक ही कोण")),
      w.definition(
        t(
          "**Alternate angles.** When a line (a **transversal**) crosses two parallel lines, the angles it makes on opposite sides, between the parallels, are **alternate angles**, and they are equal.",
          "**एकांतर कोण।** जब कोई रेखा (एक **तिर्यक रेखा**) दो समांतर रेखाओं को काटती है, तो समांतर रेखाओं के बीच उसके विपरीत ओर बनने वाले कोण **एकांतर कोण** होते हैं, और वे बराबर होते हैं।",
        ),
      ),
      w.body(
        t(
          r`Stand at P on the wall and look down at B on the ground. The horizontal through P and the ground through B are parallel, and the line of sight PB crosses both. So the depression of B seen from P equals the elevation of P seen from B: $$\angle \text{depression at P} = \angle \text{elevation at B}$$ That is what makes depression problems easy: move the angle down to the ground and the usual right triangle appears.`,
          r`दीवार पर P पर खड़े होकर ज़मीन पर B को नीचे देखो। P से होकर जाने वाली क्षैतिज रेखा और B से होकर जाती ज़मीन समांतर हैं, और दृष्टि रेखा PB दोनों को काटती है। इसलिए P से देखे B का अवनमन कोण, B से देखे P के उन्नयन कोण के बराबर है: $$\angle \text{P पर अवनमन} = \angle \text{B पर उन्नयन}$$ यही अवनमन वाले प्रश्नों को आसान बनाता है: कोण को नीचे ज़मीन पर ले आओ और जाना-पहचाना समकोण त्रिभुज दिख जाता है।`,
        ),
      ),
      equal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The temple steps across the river: 20 m wall, depression 30°. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const [fig, goal] = workedOn(
      b,
      "fig",
      Problem.TempleRiver,
      "the fort wall 20 m above the river level, the horizontal through Riya's eye at its top, the line of sight down to the temple steps on the far bank at an angle of depression of 30°, and the distance along the ground marked ?",
    );
    const far = choiceQuestion(b, {
      name: "far",
      prompt: t(
        "The wall is 20 m above the river level and the depression of the steps is 30°. How far are the steps from the foot of the wall?",
        "दीवार नदी के स्तर से 20 m ऊपर है और सीढ़ियों का अवनमन कोण 30° है। सीढ़ियाँ दीवार के आधार से कितनी दूर हैं?",
      ),
      options: [
        { id: "right", label: t("20√3 m", "20√3 m") },
        {
          id: "tan",
          label: t("20/√3 m", "20/√3 m"),
          feedback: t(
            "That uses tan 30° the wrong way up. tan 30° = 20/d, so d = 20/tan 30° = 20√3.",
            "इसमें tan 30° उल्टा लिया। tan 30° = 20/d, इसलिए d = 20/tan 30° = 20√3।",
          ),
        },
        {
          id: "sin",
          label: t("40 m", "40 m"),
          feedback: t(
            "40 = 20/sin 30° is the slanting line of sight. The question asks the distance along the ground.",
            "40 = 20/sin 30° तिरछी दृष्टि रेखा है। प्रश्न ज़मीन पर की दूरी पूछता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        r`Move the 30° down to the steps (alternate angles). Then $$\tan 30^\circ = \frac{20}{d} \quad\Rightarrow\quad \frac{1}{\sqrt{3}} = \frac{20}{d}$$ $$d = 20\sqrt{3} \approx 34.64 \text{ m}$$ Mom's lamp will be about 35 m away. **Stop 2 done.**`,
        r`30° को नीचे सीढ़ियों तक ले आओ (एकांतर कोण)। तब $$\tan 30^\circ = \frac{20}{d} \quad\Rightarrow\quad \frac{1}{\sqrt{3}} = \frac{20}{d}$$ $$d = 20\sqrt{3} \approx 34.64 \text{ m}$$ मम्मी का दीया लगभग 35 m दूर होगा। **पड़ाव 2 पूरा।**`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(far.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("How far are the temple steps?", "मंदिर की सीढ़ियाँ कितनी दूर हैं?")),
      w.body(
        t(
          "Grandpa knows the wall stands 20 m above the river level. Riya lies flat on the wall and sights the steps: the clinometer, turned downwards, reads 30°.",
          "दादाजी जानते हैं कि दीवार नदी के स्तर से 20 m ऊपर है। रिया दीवार पर लेटकर सीढ़ियों को देखती है: नीचे की ओर मोड़ा गया क्लाइनोमीटर 30° पढ़ता है।",
        ),
      ),
      fig,
      goal,
      far,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Depression from a cliff and from a tower; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const boat = choiceQuestion(b, {
      name: "boat",
      prompt: t(
        "From the top of a 50 m cliff, the angle of depression of a boat is 45°. How far is the boat from the foot of the cliff?",
        "50 m ऊँची चट्टान के शीर्ष से एक नाव का अवनमन कोण 45° है। नाव चट्टान के आधार से कितनी दूर है?",
      ),
      options: [
        { id: "right", label: t("50 m", "50 m") },
        {
          id: "root",
          label: t("50√2 m", "50√2 m"),
          feedback: t(
            "50√2 is the line of sight. At 45° the height and the distance along the water are equal: tan 45° = 1.",
            "50√2 दृष्टि रेखा है। 45° पर ऊँचाई और पानी पर की दूरी बराबर होती हैं: tan 45° = 1।",
          ),
        },
        {
          id: "half",
          label: t("25 m", "25 m"),
          feedback: t(
            "Halving would be right for sin 30°, not here. tan 45° = 50/d = 1, so d = 50.",
            "आधा करना sin 30° के लिए सही होता, यहाँ नहीं। tan 45° = 50/d = 1, इसलिए d = 50।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const steeper = choiceQuestion(b, {
      name: "steeper",
      prompt: t(
        "From the top of a tower, a car's angle of depression grows from 30° to 60°. Is the car moving towards the tower or away from it?",
        "एक मीनार के शीर्ष से एक कार का अवनमन कोण 30° से बढ़कर 60° हो जाता है। कार मीनार की ओर जा रही है या उससे दूर?",
      ),
      options: [
        { id: "right", label: t("Towards the tower", "मीनार की ओर") },
        {
          id: "away",
          label: t("Away from the tower", "मीनार से दूर"),
          feedback: t(
            "Farther things sit closer to the horizontal, at a smaller angle. A bigger angle means you look more steeply down, so it's nearer.",
            "दूर की चीज़ें क्षैतिज के ज़्यादा पास, छोटे कोण पर दिखती हैं। बड़ा कोण मतलब ज़्यादा खड़ी नज़र नीचे, यानी वह पास है।",
          ),
        },
        {
          id: "same",
          label: t("Neither: it's still", "कोई नहीं: वह रुकी है"),
          feedback: t(
            "The angle changes only if the car moves. Since it grows, the car is getting nearer.",
            "कोण तभी बदलता है जब कार चले। वह बढ़ रहा है, तो कार पास आ रही है।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Angle of depression: from the horizontal at the eye, looking down. ✓ Alternate angles move it to the ground. ✓ The temple steps are 20√3 m away. Next stop: two observations, and the flag on the temple roof.",
        "**मिशन लॉग।** ✓ अवनमन कोण: आँख पर क्षैतिज से, नीचे देखते हुए। ✓ एकांतर कोण उसे ज़मीन तक ले आते हैं। ✓ मंदिर की सीढ़ियाँ 20√3 m दूर हैं। अगला पड़ाव: दो प्रेक्षण, और मंदिर की छत का झंडा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(steeper.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), boat, steeper, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, depression, alternate, inLife, yourTurn];
