import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CrossAction,
  GrowMode,
  HeredityScene,
  Parent,
  Trait,
  crossSimulatorDef,
  heredityStoryDef,
} from "@chalk/prop-heredity";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap, and Riya finds a name: Mendel. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const surprise = b.prop(heredityStoryDef, "surprise", { scene: HeredityScene.ShortSurprise });
  b.standsFor(surprise, "Grandpa's new pea plants: most tall, a few short");
  return column([
    w.title(t("A monk with a pea garden", "मटर के बगीचे वाला साधु")),
    surprise,
    w.body(
      t(
        "**Stop 2.** Last time: children inherit traits through DNA, and sexual reproduction mixes the parents' DNA. But that doesn't explain Grandpa's row. Every parent plant was tall, yet about a quarter of the children are short.",
        "**पड़ाव 2।** पिछली बार: बच्चे DNA के ज़रिए लक्षण पाते हैं, और लैंगिक जनन माता-पिता का DNA मिलाता है। पर इससे दादाजी की क्यारी समझ नहीं आती। हर जनक पौधा लंबा था, फिर भी लगभग एक चौथाई बच्चे बौने हैं।",
      ),
    ),
    w.body(
      t(
        'Riya looks it up and laughs. "Grandpa, someone had exactly your problem 160 years ago, with exactly your plant. His name was Mendel." This lesson follows his experiments, one step at a time.',
        'रिया खोजती है और हँस पड़ती है। "दादाजी, 160 साल पहले किसी को ठीक यही दिक़्क़त थी, ठीक इसी पौधे के साथ। उनका नाम था मेंडल।" यह पाठ उनके प्रयोगों को एक-एक कदम चलकर देखता है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Mendel, contrasting characters, and the words: cross, self-pollinate, P/F1/F2. */
const mendel = page(
  "mendel",
  (b) => {
    const w = wordsOn(b);
    const pick = choiceQuestion(b, {
      name: "pick",
      prompt: t(
        "What did Mendel do that the people before him hadn't?",
        "मेंडल ने ऐसा क्या किया जो उनसे पहले के लोगों ने नहीं किया था?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "He counted how many plants showed each trait, in each generation",
            "उन्होंने हर पीढ़ी में गिना कि कितने पौधों में कौन सा लक्षण है",
          ),
        },
        {
          id: "first",
          label: t("He was the first to grow peas", "उन्होंने पहली बार मटर उगाई"),
          feedback: t(
            "Many people had studied peas before. Mendel's new step was using maths: he kept count, generation after generation.",
            "पहले भी कई लोगों ने मटर का अध्ययन किया था। मेंडल का नया कदम गणित था: उन्होंने पीढ़ी-दर-पीढ़ी गिनती रखी।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Mendel and his peas", "मेंडल और उनकी मटर")),
      w.body(
        t(
          "Gregor Mendel (1822–1884) studied science and mathematics, failed his teaching exam, and went back to his monastery to grow peas. Others had studied inheritance in peas before, but Mendel was the first to **count** the plants showing each trait in every generation. The counts showed him the rules.",
          "ग्रेगर मेंडल (1822–1884) ने विज्ञान और गणित पढ़ा, शिक्षक की परीक्षा में असफल हुए, और मटर उगाने अपने मठ लौट गए। उनसे पहले भी लोगों ने मटर में वंशागति का अध्ययन किया था, पर मेंडल ने पहली बार हर पीढ़ी में हर लक्षण वाले पौधों को **गिना**। गिनती ने उन्हें नियम दिखाए।",
        ),
      ),
      w.body(
        t(
          "He chose traits that come in two clear, contrasting forms: tall or short plants, round or wrinkled seeds, violet or white flowers. Nothing in between to argue about.",
          "उन्होंने ऐसे लक्षण चुने जो दो साफ़, विपरीत रूपों में आते हैं: लंबे या बौने पौधे, गोल या झुर्रीदार बीज, बैंगनी या सफ़ेद फूल। बीच का कुछ नहीं जिस पर बहस हो।",
        ),
      ),
      w.definition(
        t(
          "**Cross, self-pollination, generations.** To **cross** two plants is to put the pollen of one on the flower of the other, so their seeds have two different parents. In **self-pollination** a plant's own pollen fertilises its own flowers. The plants we start with are the **parent** generation, **P**. Their children (the **progeny**) are the **first generation, F₁**. The children of F₁ plants are the **second generation, F₂**.",
          "**संकरण, स्व-परागण, पीढ़ियाँ।** दो पौधों का **संकरण** करना यानी एक का पराग दूसरे के फूल पर डालना, ताकि उनके बीजों के दो अलग जनक हों। **स्व-परागण** में पौधे का अपना पराग उसके अपने फूलों को निषेचित करता है। जिन पौधों से हम शुरू करते हैं, वे **जनक** पीढ़ी, **P**, हैं। उनके बच्चे (**संतति**) **पहली पीढ़ी, F₁**, हैं। F₁ पौधों के बच्चे **दूसरी पीढ़ी, F₂**, हैं।",
        ),
      ),
      pick,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** P: tall × short → F1 all tall, no medium plants. */
const f1 = page(
  "f1",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Mendel's first cross: a pure tall plant with a pure short one. Every F1 plant is tall: no medium plants, so the traits don't blend. Genotypes and the Punnett square are hidden until genes are introduced.",
    );
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.Height],
      parentA: "TT",
      parentB: "tt",
      showGametes: false,
      showPunnett: false,
      showGenotypes: false,
      canSelf: false,
      canGrow: true,
      growCount: 100,
    });
    b.standsFor(
      cross,
      "a tall pea plant and a short one, ready to be crossed and their seeds grown",
    );
    const howTall = choiceQuestion(b, {
      name: "howTall",
      prompt: t(
        "Cross them and grow the seeds. What are the F₁ plants like?",
        "उनका संकरण करो और बीज उगाओ। F₁ पौधे कैसे हैं?",
      ),
      options: [
        { id: "right", label: t("All tall", "सब लंबे") },
        {
          id: "medium",
          label: t("All medium height", "सब मध्यम ऊँचाई के"),
          feedback: t(
            "Grow them and look: not one is in between. The traits don't blend like paint.",
            "उगाकर देखो: एक भी बीच का नहीं। लक्षण रंगों की तरह नहीं घुलते।",
          ),
        },
        {
          id: "half",
          label: t("Half tall, half short", "आधे लंबे, आधे बौने"),
          feedback: t(
            "Grow them and count: every F₁ plant is tall.",
            "उगाकर गिनो: हर F₁ पौधा लंबा है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(cross.learner(CrossAction.Cross), cross.learner(CrossAction.Grow));
    const hidden = w.body(
      t(
        "Only one of the parents' traits shows up, and there are **no halfway plants**. So is the short trait gone for good? Or is it hiding inside the tall F₁ plants?",
        "जनकों के लक्षणों में से केवल एक दिखता है, और **बीच के कोई पौधे नहीं** हैं। तो क्या बौनेपन का लक्षण हमेशा के लिए चला गया? या वह लंबे F₁ पौधों के अंदर छिपा है?",
      ),
      "hidden",
      { isHidden: true },
    );
    b.when(howTall.on(QuestionSignal.Correct), theBoard.show(hidden));
    return column([
      w.title(t("First cross: tall × short", "पहला संकरण: लंबा × बौना")),
      w.body(
        t(
          "Mendel took a tall plant whose family had been tall for generations, and a short one whose family had always been short, and crossed them. Do the same: **Cross them**, then **Grow** the seeds.",
          "मेंडल ने एक लंबा पौधा लिया जिसका परिवार पीढ़ियों से लंबा था, और एक बौना जिसका परिवार हमेशा बौना था, और उनका संकरण किया। तुम भी यही करो: **संकरण करो**, फिर बीज **उगाओ**।",
        ),
      ),
      cross,
      howTall,
      hidden,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** F1 self-pollinated → F2: a quarter short. */
const f2 = page(
  "f2",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Mendel self-pollinated the tall F1 plants. In F2 about a quarter are short: the short trait was inherited by F1 but not shown.",
    );
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.Height],
      parentA: "Tt",
      parentB: "Tt",
      generation: 1,
      showGametes: false,
      showPunnett: false,
      showGenotypes: false,
      canSelf: false,
      canGrow: true,
      growCount: 400,
      growMode: GrowMode.Chance,
    });
    b.standsFor(cross, "two tall F1 plants, self-pollinated: cross them and grow 400 F2 plants");
    const quarter = choiceQuestion(b, {
      name: "quarter",
      prompt: t(
        "Cross the F₁ plants and grow 400 seeds. About what fraction of the F₂ plants are short?",
        "F₁ पौधों का संकरण करो और 400 बीज उगाओ। F₂ के लगभग कितने हिस्से पौधे बौने हैं?",
      ),
      options: [
        { id: "right", label: t("About a quarter", "लगभग एक चौथाई") },
        {
          id: "none",
          label: t("None of them", "उनमें से कोई नहीं"),
          feedback: t(
            "Grow them and count the short ones: about 100 out of 400.",
            "उगाकर बौने गिनो: 400 में से लगभग 100।",
          ),
        },
        {
          id: "half",
          label: t("About a half", "लगभग आधे"),
          feedback: t(
            "Count again: short plants are about 1 in 4, not 1 in 2.",
            "फिर गिनो: बौने पौधे लगभग 4 में 1 हैं, 2 में 1 नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(cross.learner(CrossAction.Cross), cross.learner(CrossAction.Grow));
    const both = w.body(
      t(
        r`Tall to short comes out close to $$3 : 1$$ The short plants are back, though their F₁ parents were all tall. So the F₁ plants **inherited both** tallness and shortness, but only tallness **showed**.`,
        r`लंबे और बौने का अनुपात लगभग $$3 : 1$$ आता है। बौने पौधे लौट आए, जबकि उनके F₁ जनक सब लंबे थे। तो F₁ पौधों ने लंबापन और बौनापन **दोनों पाए**, पर **दिखा** केवल लंबापन।`,
      ),
      "both",
      { isHidden: true },
    );
    b.when(quarter.on(QuestionSignal.Correct), theBoard.show(both));
    return column([
      w.title(t("Second generation: F₂", "दूसरी पीढ़ी: F₂")),
      w.body(
        t(
          "Were the tall F₁ plants just like the tall parent? To test it, Mendel let the F₁ plants self-pollinate and grew their seeds. Self-pollinating means one plant is both parents, so below, **Cross** two Tt parents: that is the same as one Tt plant pollinating itself.",
          "क्या लंबे F₁ पौधे लंबे जनक जैसे ही थे? यह जाँचने के लिए मेंडल ने F₁ पौधों का स्व-परागण होने दिया और उनके बीज उगाए। स्व-परागण में एक ही पौधा दोनों जनक होता है, इसलिए नीचे दो Tt जनकों का **संकरण** करो: यह एक Tt पौधे के ख़ुद को परागित करने जैसा ही है।",
        ),
      ),
      cross,
      quarter,
      both,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Mendel's idea: two copies of a factor (gene); dominant and recessive; TT, Tt, tt. */
const genes = page(
  "genes",
  (b) => {
    const w = wordsOn(b);
    const tt = choiceQuestion(b, {
      name: "tt",
      prompt: t("Which plants are short?", "कौन से पौधे बौने हैं?"),
      options: [
        { id: "right", label: t("Only tt", "केवल tt") },
        {
          id: "tT",
          label: t("Tt and tt", "Tt और tt"),
          feedback: t(
            "One T is enough to make a plant tall, because tallness is dominant. A plant is short only with no T at all: tt.",
            "पौधे को लंबा बनाने के लिए एक T काफ़ी है, क्योंकि लंबापन प्रभावी है। पौधा तभी बौना होता है जब कोई T न हो: tt।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two copies, one shows", "दो प्रतियाँ, एक दिखती है")),
      w.definition(
        t(
          "**Gene.** Mendel proposed that every trait is controlled by a **factor**, today called a **gene**, and that a plant has **two copies** of it: one from each parent. The two copies may be the same or different.",
          "**जीन।** मेंडल ने कहा कि हर लक्षण एक **कारक** से नियंत्रित होता है, जिसे आज **जीन** कहते हैं, और पौधे में उसकी **दो प्रतियाँ** होती हैं: हर जनक से एक। दोनों प्रतियाँ एक जैसी या अलग हो सकती हैं।",
        ),
      ),
      w.definition(
        t(
          "**Dominant and recessive.** We write the tall version T and the short version t. A plant can be TT, Tt or tt. Both TT and Tt are tall: **one T is enough**. Only tt is short. A gene version like T, whose trait (tallness) shows even with one copy, is **dominant**. One like t, whose trait (shortness) shows only when both copies are t, is **recessive**.",
          "**प्रभावी और अप्रभावी।** लंबे रूप को T और बौने को t लिखते हैं। पौधा TT, Tt या tt हो सकता है। TT और Tt दोनों लंबे हैं: **एक T काफ़ी है**। केवल tt बौना है। T जैसा जीन-रूप, जिसका लक्षण (लंबाई) एक प्रति से भी दिखे, **प्रभावी** है। t जैसा रूप, जिसका लक्षण (बौनापन) केवल तब दिखे जब दोनों प्रतियाँ t हों, **अप्रभावी** है।",
        ),
      ),
      w.body(
        t(
          "Now the F₁ makes sense. The tall parent was TT and the short one tt. Each child got a T from one parent and a t from the other: Tt. Tall, but carrying a hidden t.",
          "अब F₁ समझ आता है। लंबा जनक TT था और बौना tt। हर बच्चे को एक जनक से T और दूसरे से t मिला: Tt। लंबा, पर एक छिपा हुआ t लिए हुए।",
        ),
      ),
      tt,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The Punnett square: germ cells carry one copy; TT:Tt:tt = 1:2:1, tall:short = 3:1 (Fig. 9.3). */
const punnett = page(
  "punnett",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 9.3 as a Punnett square: each F1 germ cell carries T or t; the four ways they meet give TT, Tt, Tt, tt: 1:2:1 by genes, 3:1 by look.",
    );
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.Height],
      parentA: "Tt",
      parentB: "Tt",
      generation: 1,
      showGametes: true,
      showPunnett: true,
      showGenotypes: true,
      canSelf: false,
      canGrow: false,
    });
    b.standsFor(
      cross,
      "two Tt plants, their germ cells (T or t) and the Punnett square of their children",
    );
    const ratio = choiceQuestion(b, {
      name: "ratio",
      prompt: t(
        "Cross them. In the square, what is TT : Tt : tt?",
        "संकरण करो। वर्ग में TT : Tt : tt क्या है?",
      ),
      options: [
        { id: "right", label: t("1 : 2 : 1", "1 : 2 : 1") },
        {
          id: "three",
          label: t("3 : 1", "3 : 1"),
          feedback: t(
            "3 : 1 is tall to short, by look. By genes, count the boxes: one TT, two Tt, one tt.",
            "3 : 1 दिखने में लंबे और बौने का है। जीन से, खाने गिनो: एक TT, दो Tt, एक tt।",
          ),
        },
        {
          id: "even",
          label: t("1 : 1 : 1", "1 : 1 : 1"),
          feedback: t(
            "Tt appears twice: T from the first parent with t from the second, and t from the first with T from the second.",
            "Tt दो बार आता है: पहले जनक का T दूसरे के t के साथ, और पहले का t दूसरे के T के साथ।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(cross.learner(CrossAction.Cross));
    return column([
      w.title(t("Where the 3 : 1 comes from", "3 : 1 कहाँ से आता है")),
      w.definition(
        t(
          "**Germ cells.** The cells that join to make a new plant (pollen and egg) are **germ cells**. Each germ cell carries **only one copy** of each gene. A Tt plant makes germ cells of two kinds: half with T, half with t.",
          "**जनन कोशिकाएँ।** जो कोशिकाएँ मिलकर नया पौधा बनाती हैं (पराग और अंडा), वे **जनन कोशिकाएँ** हैं। हर जनन कोशिका में हर जीन की **केवल एक प्रति** होती है। Tt पौधा दो तरह की जनन कोशिकाएँ बनाता है: आधी T वाली, आधी t वाली।",
        ),
      ),
      w.body(
        t(
          "A **Punnett square** lists one parent's germ cells across the top and the other's down the side; each box is a child they could make. Cross the two Tt plants.",
          "**पनेट वर्ग** में एक जनक की जनन कोशिकाएँ ऊपर और दूसरे की बाईं ओर लिखी जाती हैं; हर खाना एक बच्चा है जो वे बना सकते हैं। दोनों Tt पौधों का संकरण करो।",
        ),
      ),
      cross,
      ratio,
      w.body(
        t(
          r`By genes the F₂ is $$\text{TT} : \text{Tt} : \text{tt} = 1 : 2 : 1$$ TT and Tt are both tall, so by look $$\text{tall} : \text{short} = 3 : 1$$`,
          r`जीन से F₂ है $$\text{TT} : \text{Tt} : \text{tt} = 1 : 2 : 1$$ TT और Tt दोनों लंबे हैं, इसलिए दिखने में $$\text{लंबे} : \text{बौने} = 3 : 1$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 9.2: how would we confirm the 1:2:1? Self the F2 tall plants. */
const confirm = page(
  "confirm",
  (b) => {
    const w = wordsOn(b);
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.Height],
      parentA: "TT",
      parentB: "TT",
      showGametes: true,
      showPunnett: true,
      showGenotypes: true,
      canSetParents: true,
      canSelf: false,
      canGrow: true,
      growCount: 100,
    });
    b.standsFor(
      cross,
      "a cross whose two parents the learner can set to TT, Tt or tt, to see what self-pollinating each kind of tall plant gives",
    );
    const test = choiceQuestion(b, {
      name: "test",
      prompt: t(
        "A tall F₂ plant is self-pollinated, and all of its children are tall. What was it?",
        "एक लंबे F₂ पौधे का स्व-परागण होता है, और उसके सारे बच्चे लंबे हैं। वह क्या था?",
      ),
      options: [
        { id: "right", label: t("TT", "TT") },
        {
          id: "Tt",
          label: t("Tt", "Tt"),
          feedback: t(
            "Set both parents to Tt and cross: about a quarter of the children are short. A Tt plant can't give all-tall children every time.",
            "दोनों जनक Tt करके संकरण करो: लगभग एक चौथाई बच्चे बौने हैं। Tt पौधा हर बार सारे लंबे बच्चे नहीं दे सकता।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      cross.learner(CrossAction.SetParent, { which: Parent.A, genotype: "Tt" }),
      cross.learner(CrossAction.SetParent, { which: Parent.B, genotype: "Tt" }),
      cross.learner(CrossAction.Cross),
    );
    return column([
      w.title(t("Checking the 1 : 2 : 1", "1 : 2 : 1 की जाँच")),
      w.body(
        t(
          "NCERT Activity 9.2 asks: TT and Tt plants look the same, so how could we show that the F₂ really is 1 TT : 2 Tt : 1 tt? Self-pollinate each tall F₂ plant and look at its children. Self-pollinating means both parents are the same plant: set both parents to TT and cross, then both to Tt.",
          "NCERT क्रियाकलाप 9.2 पूछता है: TT और Tt पौधे एक जैसे दिखते हैं, तो हम कैसे दिखाएँ कि F₂ सचमुच 1 TT : 2 Tt : 1 tt है? हर लंबे F₂ पौधे का स्व-परागण करो और उसके बच्चे देखो। स्व-परागण में दोनों जनक एक ही पौधा होते हैं: दोनों जनक TT करके संकरण करो, फिर दोनों Tt।",
        ),
      ),
      cross,
      test,
      w.body(
        t(
          "So among the tall F₂ plants, those that **breed true** (all tall children) are TT, and those that give some short children are Tt. Mendel found the Tt kind twice as common as the TT kind: just what the square predicts.",
          "तो लंबे F₂ पौधों में जो **शुद्ध प्रजनन** करते हैं (सारे बच्चे लंबे), वे TT हैं, और जो कुछ बौने बच्चे देते हैं, वे Tt हैं। मेंडल ने पाया कि Tt वाले TT वालों से दुगुने हैं: ठीक जैसा वर्ग बताता है।",
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

/** Grandpa's mystery, solved. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const garden = b.prop(heredityStoryDef, "garden", { scene: HeredityScene.ShortSurprise });
    b.standsFor(garden, "Grandpa's row: mostly tall plants, a few short");
    const what = choiceQuestion(b, {
      name: "what",
      prompt: t(
        "Grandpa's tall parents gave about one short child in four. So what were those parent plants?",
        "दादाजी के लंबे जनकों से हर चार में लगभग एक बच्चा बौना हुआ। तो वे जनक पौधे क्या थे?",
      ),
      options: [
        { id: "right", label: t("Tt: tall, carrying a hidden t", "Tt: लंबे, एक छिपा t लिए हुए") },
        {
          id: "TT",
          label: t("TT: tall, with two T copies", "TT: लंबे, दो T प्रतियों के साथ"),
          feedback: t(
            "TT plants have no t to pass on, so all their children would be tall.",
            "TT पौधों के पास देने को कोई t नहीं, इसलिए उनके सारे बच्चे लंबे होते।",
          ),
        },
        {
          id: "tt",
          label: t("tt: short, so no tall gene at all", "tt: बौने, इसलिए कोई लंबा जीन नहीं"),
          feedback: t(
            "tt plants are short themselves. Grandpa's parents were tall.",
            "tt पौधे ख़ुद बौने होते हैं। दादाजी के जनक लंबे थे।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const next = choiceQuestion(b, {
      name: "next",
      prompt: t(
        "Grandpa wants a row that is tall every year. Which seeds should he save from now on?",
        "दादाजी ऐसी क्यारी चाहते हैं जो हर साल लंबी हो। अब से उन्हें कौन से बीज बचाने चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Seeds from tall plants whose own children are all tall (TT)",
            "उन लंबे पौधों के बीज जिनके अपने सारे बच्चे लंबे हों (TT)",
          ),
        },
        {
          id: "tallest",
          label: t("Seeds from the very tallest plants", "सबसे ज़्यादा लंबे पौधों के बीज"),
          feedback: t(
            "That's what he did last year. TT and Tt plants look equally tall, so height alone can't tell them apart.",
            "यही उन्होंने पिछले साल किया था। TT और Tt पौधे बराबर लंबे दिखते हैं, इसलिए केवल ऊँचाई से उनमें फ़र्क नहीं होता।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 2 done.** Short wasn't new: it was **recessive**, hiding as t inside tall Tt plants, and it shows again when two t's meet. Next, Riya opens Grandpa's seed jar: round and wrinkled, yellow and green. Do two traits travel together?",
        "**पड़ाव 2 पूरा।** बौनापन नया नहीं था: वह **अप्रभावी** था, लंबे Tt पौधों में t बनकर छिपा था, और दो t मिलने पर फिर दिखता है। आगे, रिया दादाजी के बीजों का डिब्बा खोलती है: गोल और झुर्रीदार, पीले और हरे। क्या दो लक्षण साथ-साथ चलते हैं?",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(what.on(QuestionSignal.Correct), theBoard.show(next));
    b.when(next.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Grandpa's mystery, solved", "दादाजी की पहेली, सुलझी")),
      garden,
      what,
      next,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1, Q3 and Exercise 4. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two worked questions", "दो हल किए प्रश्न")),
    w.body(
      t(
        "**A man with blood group A marries a woman with blood group O, and their daughter has blood group O. Is this enough to tell which of A or O is dominant?**",
        "**रक्त समूह A वाला पुरुष रक्त समूह O वाली स्त्री से विवाह करता है, और उनकी बेटी का रक्त समूह O है। क्या इससे पता चलता है कि A और O में कौन प्रभावी है?**",
      ),
    ),
    w.body(
      t(
        "No. The daughter got one copy from each parent. If A were dominant, the father could be carrying a hidden O (like Tt), pass it on, and the daughter would be OO: blood group O. If O were dominant, a single O from her mother would also make her O. Both ideas fit the facts, so one family can't decide it. We'd need many families and counts, as Mendel did.",
        "नहीं। बेटी को हर जनक से एक प्रति मिली। अगर A प्रभावी होता, तो पिता में एक छिपा O हो सकता था (Tt की तरह), वह उसे दे सकते थे, और बेटी OO होती: रक्त समूह O। अगर O प्रभावी होता, तो माँ से मिला एक O भी उसे O बना देता। दोनों विचार तथ्यों से मेल खाते हैं, इसलिए एक परिवार से तय नहीं होता। हमें कई परिवार और गिनती चाहिए, जैसे मेंडल ने की।",
      ),
    ),
    w.body(
      t(
        "**Children with light-coloured eyes are likely to have parents with light-coloured eyes. Can we say whether light eye colour is dominant or recessive?**",
        "**हल्के रंग की आँखों वाले बच्चों के माता-पिता की आँखें भी अक्सर हल्के रंग की होती हैं। क्या हम कह सकते हैं कि हल्का रंग प्रभावी है या अप्रभावी?**",
      ),
    ),
    w.body(
      t(
        'No. "Like parents, like children" happens either way. To tell, we\'d need crosses where the parents differ, and to count which trait the children show, and in what ratio.',
        'नहीं। "जैसे माता-पिता, वैसे बच्चे" दोनों हालात में होता है। पता करने के लिए ऐसे संकरण चाहिए जिनमें जनक अलग हों, और गिनना होगा कि बच्चों में कौन सा लक्षण किस अनुपात में दिखता है।',
      ),
    ),
    space(),
  ]);
});

/** Your turn: Tt × tt, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.Height],
      parentA: "Tt",
      parentB: "tt",
      showGametes: true,
      showPunnett: true,
      showGenotypes: true,
      canSelf: false,
      canGrow: true,
      growCount: 100,
    });
    b.standsFor(cross, "a Tt plant crossed with a tt plant");
    const half = choiceQuestion(b, {
      name: "half",
      prompt: t(
        "A Tt plant is crossed with a short tt plant. Tall : short among the children is about…",
        "एक Tt पौधे का बौने tt पौधे से संकरण होता है। बच्चों में लंबे : बौने लगभग है…",
      ),
      options: [
        { id: "right", label: t("1 : 1", "1 : 1") },
        {
          id: "three",
          label: t("3 : 1", "3 : 1"),
          feedback: t(
            "3 : 1 needs both parents to be Tt. Here one parent only has t's: cross them and count the boxes.",
            "3 : 1 के लिए दोनों जनक Tt होने चाहिए। यहाँ एक जनक के पास केवल t हैं: संकरण करके खाने गिनो।",
          ),
        },
        {
          id: "all",
          label: t("All tall", "सब लंबे"),
          feedback: t(
            "Half the children get the t from the Tt parent, plus a t from the tt parent: tt, short.",
            "आधे बच्चों को Tt जनक से t मिलता है, और tt जनक से भी t: tt, बौने।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Traits don't blend: F₁ of tall × short is all tall. ✓ Genes come in two copies, one from each parent; germ cells carry one. ✓ Dominant shows with one copy, recessive only with two. ✓ Tt × Tt gives 1 TT : 2 Tt : 1 tt, so 3 tall : 1 short. ✓ Grandpa's short plants: solved. Next: two traits at once.",
        "**मिशन लॉग।** ✓ लक्षण घुलते नहीं: लंबे × बौने का F₁ सब लंबा। ✓ जीन की दो प्रतियाँ होती हैं, हर जनक से एक; जनन कोशिका में एक। ✓ प्रभावी एक प्रति से दिखता है, अप्रभावी केवल दो से। ✓ Tt × Tt से 1 TT : 2 Tt : 1 tt, यानी 3 लंबे : 1 बौना। ✓ दादाजी के बौने पौधे: सुलझे। आगे: एक साथ दो लक्षण।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(half.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), cross, half, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, mendel, f1, f2, genes, punnett, confirm, inLife, examples, yourTurn];
