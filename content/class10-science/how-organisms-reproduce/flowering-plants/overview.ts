import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Agent,
  FlowerAction,
  FlowerMode,
  FlowerType,
  GerminationAction,
  Pollination,
  ReproductionScene,
  flowerDef,
  reproductionSceneDef,
  seedGerminationDef,
} from "@chalk/prop-reproduction";

/** A flower prop in one mode, with every learner control it offers. */
function flowerIn(
  b: Parameters<Parameters<typeof page>[1]>[0],
  name: string,
  mode: FlowerMode,
  more: { flowerType?: FlowerType; pollination?: Pollination; agent?: Agent } = {},
) {
  const f = b.prop(flowerDef, name, {
    mode,
    step: 0,
    selected: null,
    flowerType: more.flowerType ?? FlowerType.Bisexual,
    pollination: more.pollination ?? Pollination.Cross,
    agent: more.agent ?? Agent.Animal,
    showNames: true,
    canTap: true,
    canStep: true,
    canChoose: true,
  });
  b.studentOnly(f.action(FlowerAction.Tap));
  b.studentOnly(f.action(FlowerAction.Next));
  b.studentOnly(f.action(FlowerAction.Reset));
  b.studentOnly(f.action(FlowerAction.SetPollination));
  b.studentOnly(f.action(FlowerAction.SetAgent));
  b.studentOnly(f.action(FlowerAction.SetType));
  return f;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** A bee on the pea flowers. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const peas = b.prop(reproductionSceneDef, "peas", { scene: ReproductionScene.BeeOnPeas });
  b.standsFor(peas, "a bee visiting Grandpa's pea flowers; Kabir watching closely");
  return column([
    w.title(t("What is the bee doing?", "मधुमक्खी क्या कर रही है?")),
    peas,
    w.body(
      t(
        "Recap: a pea seed has two parents, and their germ cells must meet. Kabir watches a bee crawl into a pea flower and come out with yellow dust on its legs. Grandpa says the remaining 21 pots will come from seeds, and seeds come from flowers. But how does a flower turn into a pod full of peas?",
        "पिछली बार: मटर के बीज के दो जनक होते हैं, और उनकी जनन कोशिकाओं को मिलना होता है। कबीर एक मधुमक्खी को मटर के फूल में घुसते और पैरों पर पीली धूल लेकर निकलते देखता है। दादाजी कहते हैं बचे 21 गमले बीजों से भरेंगे, और बीज फूलों से आते हैं। पर फूल फलियों से भरी फली में कैसे बदलता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The parts of a flower, tap to name. */
const parts = page(
  "parts",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.2, Fig 8.7: the longitudinal section of a flower. Sepals and petals; stamens (anther on a filament, making pollen) are the male part; the pistil (stigma, style, ovary with ovules, each with an egg cell) is the female part.",
    );
    const fl = flowerIn(b, "flower", FlowerMode.Parts);
    b.standsFor(
      fl,
      "a flower cut lengthwise: tap sepal, petal, anther, filament, stigma, style, ovary or ovule to see its name and job",
    );
    const anther = choiceQuestion(b, {
      name: "anther",
      prompt: t("Tap the parts. The anther contains:", "भागों पर टैप करो। परागकोश में होते हैं:"),
      options: [
        { id: "right", label: t("pollen", "पराग") },
        {
          id: "ovules",
          label: t("ovules", "बीजांड"),
          feedback: t(
            "Ovules are inside the ovary, at the bottom of the pistil. The anther, on top of the stamen, makes pollen.",
            "बीजांड स्त्रीकेसर के निचले भाग, अंडाशय, में होते हैं। पुंकेसर के ऊपर का परागकोश पराग बनाता है।",
          ),
        },
        {
          id: "sepals",
          label: t("sepals", "बाह्यदल"),
          feedback: t(
            "Sepals are the green outer parts of the flower. The anther makes pollen grains.",
            "बाह्यदल फूल के हरे बाहरी भाग हैं। परागकोश परागकण बनाता है।",
          ),
        },
        {
          id: "pistil",
          label: t("pistil", "स्त्रीकेसर"),
          feedback: t(
            "The pistil is the separate female part in the centre. The anther contains pollen grains.",
            "स्त्रीकेसर बीच में अलग मादा भाग है। परागकोश में परागकण होते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Inside a flower", "फूल के अंदर")),
      w.body(
        t(
          "The reproductive parts of flowering plants (**angiosperms**) are in the **flower**. You've met its parts before: sepals, petals, stamens and pistil.",
          "पुष्पी पादपों (**आवृतबीजी**) के जनन भाग **फूल** में होते हैं। इसके भाग तुम पहले देख चुके हो: बाह्यदल, दल, पुंकेसर और स्त्रीकेसर।",
        ),
      ),
      w.definition(
        t(
          "**Stamen and pistil.** The **stamen** is the male reproductive part: an **anther** on a stalk, the **filament**. It makes yellowish **pollen grains**. The **pistil**, in the centre, is the female part, in three pieces: the swollen bottom, the **ovary**; the long middle, the **style**; and the tip, often sticky, the **stigma**. The ovary holds **ovules**, and each ovule has an **egg cell**.",
          "**पुंकेसर और स्त्रीकेसर।** **पुंकेसर** नर जनन भाग है: एक डंठल, **तंतु**, पर **परागकोश**। यह पीले-से **परागकण** बनाता है। बीच में **स्त्रीकेसर** मादा भाग है, तीन हिस्सों में: फूला हुआ निचला भाग, **अंडाशय**; लंबा बीच का भाग, **वर्तिका**; और सिरा, जो अक्सर चिपचिपा होता है, **वर्तिकाग्र**। अंडाशय में **बीजांड** होते हैं, और हर बीजांड में एक **अंड कोशिका** होती है।",
        ),
      ),
      fl,
      w.note(
        t(
          "What could sepals and petals be for? Sepals protect the bud; bright, scented petals attract insects.",
          "बाह्यदल और दल किसलिए हो सकते हैं? बाह्यदल कली की रक्षा करते हैं; चमकीले, ख़ुशबूदार दल कीटों को आकर्षित करते हैं।",
        ),
      ),
      anther,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Unisexual and bisexual flowers; self- and cross-pollination; agents. */
const pollination = page(
  "pollination",
  (b) => {
    const w = wordsOn(b);
    const kinds = flowerIn(b, "kinds", FlowerMode.Types, { flowerType: FlowerType.Bisexual });
    b.standsFor(
      kinds,
      "a bisexual flower with both stamens and pistil, or separate male and female unisexual flowers",
    );
    const pol = flowerIn(b, "pol", FlowerMode.Pollination, {
      pollination: Pollination.Self,
      agent: Agent.Animal,
    });
    b.standsFor(
      pol,
      "pollen moving from anther to stigma in the same flower (self), or to another flower (cross), carried by wind, water or an insect",
    );
    const cross = choiceQuestion(b, {
      name: "cross",
      prompt: t(
        "A papaya plant has only male flowers or only female flowers. Which pollination must happen for it to make seeds?",
        "पपीते के पौधे में या तो केवल नर फूल होते हैं या केवल मादा फूल। बीज बनने के लिए कौन-सा परागण होना ज़रूरी है?",
      ),
      options: [
        { id: "right", label: t("Cross-pollination", "पर-परागण") },
        {
          id: "self",
          label: t("Self-pollination", "स्व-परागण"),
          feedback: t(
            "Self-pollination needs stamens and a pistil in the same flower. A unisexual flower has only one, so pollen must come from another flower.",
            "स्व-परागण के लिए एक ही फूल में पुंकेसर और स्त्रीकेसर चाहिए। एकलिंगी फूल में केवल एक होता है, इसलिए पराग दूसरे फूल से आना चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Getting pollen to the stigma", "पराग को वर्तिकाग्र तक पहुँचाना")),
      w.definition(
        t(
          "**Unisexual and bisexual flowers.** A flower with *either* stamens *or* a pistil is **unisexual** (papaya, watermelon). A flower with *both* is **bisexual** (Hibiscus, mustard).",
          "**एकलिंगी और उभयलिंगी फूल।** जिस फूल में पुंकेसर *या* स्त्रीकेसर में से *केवल एक* हो, वह **एकलिंगी** है (पपीता, तरबूज़)। जिसमें *दोनों* हों, वह **उभयलिंगी** है (गुड़हल, सरसों)।",
        ),
      ),
      kinds,
      w.definition(
        t(
          "**Pollination.** The transfer of pollen from the stamen to the stigma is **pollination**. In the same flower it is **self-pollination**; from one flower to another it is **cross-pollination**, carried by agents like **wind, water or animals** (such as insects).",
          "**परागण।** पराग का पुंकेसर से वर्तिकाग्र तक पहुँचना **परागण** है। उसी फूल में हो तो **स्व-परागण**; एक फूल से दूसरे तक हो तो **पर-परागण**, जिसे **हवा, पानी या जंतु** (जैसे कीट) पहुँचाते हैं।",
        ),
      ),
      pol,
      cross,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Pollen tube, fertilisation, zygote; then embryo, seed and fruit. */
const fertilisation = page(
  "fertilisation",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.2, Fig 8.8: after landing on the stigma, a tube grows from the pollen grain through the style to the ovary; the male germ cell fuses with the egg in the ovule (fertilisation) to form the zygote. Then the zygote divides into an embryo, the ovule becomes a seed with a tough coat, the ovary ripens into a fruit, and the other parts shrivel.",
    );
    const fert = flowerIn(b, "fert", FlowerMode.Fertilisation);
    b.standsFor(
      fert,
      "pollen on the stigma, a pollen tube growing down the style, reaching an ovule, and the male germ cell fusing with the egg: the zygote",
    );
    const fruit = flowerIn(b, "fruit", FlowerMode.Fruit);
    b.standsFor(
      fruit,
      "after fertilisation: an embryo in the ovule, the ovule becoming a seed and the ovary a fruit, petals and sepals falling",
    );
    const becomes = choiceQuestion(b, {
      name: "becomes",
      prompt: t(
        "Step through both. What does the ovary become?",
        "दोनों क़दम-दर-क़दम देखो। अंडाशय किसमें बदलता है?",
      ),
      options: [
        { id: "right", label: t("The fruit", "फल") },
        {
          id: "seed",
          label: t("The seed", "बीज"),
          feedback: t(
            "Each ovule inside becomes a seed. The ovary around them ripens into the fruit.",
            "अंदर का हर बीजांड बीज बनता है। उनके चारों ओर का अंडाशय पककर फल बनता है।",
          ),
        },
        {
          id: "embryo",
          label: t("The embryo", "भ्रूण"),
          feedback: t(
            "The embryo comes from the zygote, inside the seed. The ovary becomes the fruit.",
            "भ्रूण युग्मनज से बनता है, बीज के अंदर। अंडाशय फल बनता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("From pollen to fruit", "पराग से फल तक")),
      w.body(
        t(
          "The pollen has landed on a suitable stigma, but the egg cells are far below, in the ovary. A **tube grows out of the pollen grain** and travels down through the style to reach the ovary.",
          "पराग एक उपयुक्त वर्तिकाग्र पर पहुँच गया है, पर अंड कोशिकाएँ बहुत नीचे, अंडाशय में हैं। **परागकण से एक नली निकलती है** और वर्तिका से होकर अंडाशय तक पहुँचती है।",
        ),
      ),
      w.definition(
        t(
          "**Fertilisation.** The male germ cell from the pollen grain fuses with the female gamete (the egg) in the ovule. This fusion of germ cells is **fertilisation**, and it gives the **zygote**, which can grow into a new plant.",
          "**निषेचन।** परागकण से आई नर जनन कोशिका बीजांड में मादा युग्मक (अंड) से मिलती है। जनन कोशिकाओं का यह मिलना **निषेचन** है, और इससे **युग्मनज** बनता है, जो नए पौधे में बढ़ सकता है।",
        ),
      ),
      fert,
      w.definition(
        t(
          "**Embryo, seed and fruit.** After fertilisation the zygote divides several times to form an **embryo** inside the ovule. The ovule develops a tough coat and becomes a **seed**. The ovary grows fast and ripens into a **fruit**. Petals, sepals, stamens, style and stigma may shrivel and fall off.",
          "**भ्रूण, बीज और फल।** निषेचन के बाद युग्मनज कई बार बँटकर बीजांड के अंदर एक **भ्रूण** बनाता है। बीजांड पर एक कठोर आवरण बनता है और वह **बीज** बन जाता है। अंडाशय तेज़ी से बढ़कर **फल** में पक जाता है। दल, बाह्यदल, पुंकेसर, वर्तिका और वर्तिकाग्र मुरझाकर गिर सकते हैं।",
        ),
      ),
      fruit,
      becomes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Germination; Activity 8.7 with soaked chana. */
const germination = page(
  "germination",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig 8.9, Activity 8.7: the seed holds the future plant (embryo), which grows into a seedling under the right conditions (germination). In a soaked Bengal gram: plumule (future shoot), radicle (future root), cotyledons (food store).",
    );
    const sprout = b.prop(seedGerminationDef, "sprout", {
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(sprout.action(GerminationAction.Next));
    b.studentOnly(sprout.action(GerminationAction.Reset));
    b.standsFor(
      sprout,
      "a Bengal gram seed soaking, swelling and sprouting, then cut open: plumule, radicle and cotyledons",
    );
    const root = choiceQuestion(b, {
      name: "root",
      prompt: t(
        "In the cut-open seed, which part becomes the root?",
        "कटे हुए बीज में कौन-सा भाग जड़ बनता है?",
      ),
      options: [
        { id: "right", label: t("The radicle", "मूलांकुर") },
        {
          id: "plumule",
          label: t("The plumule", "प्रांकुर"),
          feedback: t(
            "The plumule becomes the shoot. The radicle becomes the root.",
            "प्रांकुर प्ररोह बनता है। मूलांकुर जड़ बनता है।",
          ),
        },
        {
          id: "cotyledon",
          label: t("The cotyledon", "बीजपत्र"),
          feedback: t(
            "Cotyledons store food for the young plant. The radicle becomes the root.",
            "बीजपत्र नन्हे पौधे के लिए भोजन संग्रह करते हैं। मूलांकुर जड़ बनता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("From seed to seedling", "बीज से नवोद्भिद तक")),
      w.definition(
        t(
          "**Germination.** The seed contains the future plant, the embryo. Under the right conditions (water, air, warmth) the embryo grows into a **seedling**. This is **germination**. Inside the seed are the **plumule** (the future shoot), the **radicle** (the future root) and the **cotyledons** (the stored food).",
          "**अंकुरण।** बीज में भावी पौधा, भ्रूण, होता है। सही परिस्थितियों में (पानी, हवा, गरमी) भ्रूण एक **नवोद्भिद** में बढ़ता है। यह **अंकुरण** है। बीज के अंदर **प्रांकुर** (भावी प्ररोह), **मूलांकुर** (भावी जड़) और **बीजपत्र** (संग्रहित भोजन) होते हैं।",
        ),
      ),
      w.body(
        t(
          "Activity 8.7: soak a few chana seeds overnight, drain them, cover with a wet cloth for a day, then cut one open.",
          "क्रियाकलाप 8.7: कुछ चने के बीज रात भर भिगोओ, पानी निकाल दो, एक दिन गीले कपड़े से ढको, फिर एक को काटकर खोलो।",
        ),
      ),
      sprout,
      root,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Why Grandpa leaves the pods to dry on the plant. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const sprouts = b.prop(reproductionSceneDef, "sprouts", {
      scene: ReproductionScene.ChanaSprouts,
    });
    b.standsFor(sprouts, "a plate of sprouted chana on the kitchen table; Kabir and Mom");
    const dry = choiceQuestion(b, {
      name: "dry",
      prompt: t(
        "Grandpa leaves some pea pods on the plant until they are dry and papery. Why?",
        "दादाजी कुछ मटर की फलियों को पौधे पर ही तब तक छोड़ते हैं जब तक वे सूखी और काग़ज़ जैसी न हो जाएँ। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "So the seeds inside fully develop their embryo and tough coat, and can be sown",
            "ताकि अंदर के बीजों का भ्रूण और कठोर आवरण पूरा बन जाए, और उन्हें बोया जा सके",
          ),
        },
        {
          id: "taste",
          label: t("Dry peas taste better", "सूखी मटर ज़्यादा स्वादिष्ट होती है"),
          feedback: t(
            "Grandpa wants seeds, not a snack. A seed is ready to sow when its ovule has become a seed with a tough coat around the embryo.",
            "दादाजी को बीज चाहिए, नाश्ता नहीं। बीज बोने के लिए तब तैयार होता है जब बीजांड भ्रूण के चारों ओर कठोर आवरण वाला बीज बन जाए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 5 done.** A flower's stamens make pollen; pollination brings it to the stigma; a pollen tube carries the male germ cell to the egg in the ovule; fertilisation makes a zygote; the ovule becomes a seed and the ovary a fruit; the seed germinates. Pots so far: 29 + 21 pots of sprouting peas and chana = 50!",
        "**पड़ाव 5 पूरा।** फूल के पुंकेसर पराग बनाते हैं; परागण उसे वर्तिकाग्र तक लाता है; पराग नली नर जनन कोशिका को बीजांड के अंड तक ले जाती है; निषेचन से युग्मनज बनता है; बीजांड बीज बनता है और अंडाशय फल; बीज अंकुरित होता है। अब तक गमले: 29 + अंकुरित मटर और चने के 21 गमले = 50!",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(dry.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Seeds for the last 21 pots", "आख़िरी 21 गमलों के लिए बीज")),
      sprouts,
      w.body(
        t(
          "Mom's sprouted chana has tiny white radicles poking out. Grandpa sows some, along with dried pea seeds from last season, into the last 21 pots.",
          "मम्मी के अंकुरित चनों से नन्हे सफ़ेद मूलांकुर निकल रहे हैं। दादाजी कुछ चने, और पिछले मौसम के सूखे मटर के बीज, आख़िरी 21 गमलों में बो देते हैं।",
        ),
      ),
      dry,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1 (pollination vs fertilisation), Exercise 7 (labelled section). */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t("How is pollination different from fertilisation?", "परागण, निषेचन से कैसे भिन्न है?"),
      options: [
        {
          id: "right",
          label: t(
            "Pollination moves pollen to the stigma; fertilisation is the fusion of male and female germ cells in the ovule",
            "परागण पराग को वर्तिकाग्र तक ले जाता है; निषेचन बीजांड में नर और मादा जनन कोशिकाओं का मिलना है",
          ),
        },
        {
          id: "same",
          label: t("They are two names for the same thing", "ये एक ही चीज़ के दो नाम हैं"),
          feedback: t(
            "They are two steps. First pollination brings the pollen to the stigma; later, after the pollen tube grows, fertilisation joins the germ cells.",
            "ये दो चरण हैं। पहले परागण पराग को वर्तिकाग्र तक लाता है; बाद में, पराग नली बढ़ने के बाद, निषेचन जनन कोशिकाओं को मिलाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const label = flowerIn(b, "label", FlowerMode.Parts);
    b.standsFor(label, "the longitudinal section of a flower to label by tapping each part");
    const style = choiceQuestion(b, {
      name: "style",
      prompt: t(
        "Label the section by tapping each part. Through which part does the pollen tube grow?",
        "हर भाग पर टैप करके काट का नामांकन करो। पराग नली किस भाग से होकर बढ़ती है?",
      ),
      options: [
        { id: "right", label: t("The style", "वर्तिका") },
        {
          id: "filament",
          label: t("The filament", "तंतु"),
          feedback: t(
            "The filament is the stalk of the stamen. The pollen tube grows down the style, from stigma to ovary.",
            "तंतु पुंकेसर का डंठल है। पराग नली वर्तिका से होकर, वर्तिकाग्र से अंडाशय तक बढ़ती है।",
          ),
        },
        {
          id: "petal",
          label: t("A petal", "एक दल"),
          feedback: t(
            "Petals aren't part of the pollen's path. It grows down the style of the pistil.",
            "दल पराग के रास्ते का हिस्सा नहीं हैं। यह स्त्रीकेसर की वर्तिका से होकर बढ़ती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Flower parts: sepals, petals, stamens (anther, filament), pistil (stigma, style, ovary, ovules). ✓ Pollination: self or cross, by wind, water, animals. ✓ Fertilisation in the ovule gives the zygote; ovule → seed, ovary → fruit; seeds germinate. All 50 pots are planted! Next: the same story in human beings, in a health class.",
        "**मिशन लॉग।** ✓ फूल के भाग: बाह्यदल, दल, पुंकेसर (परागकोश, तंतु), स्त्रीकेसर (वर्तिकाग्र, वर्तिका, अंडाशय, बीजांड)। ✓ परागण: स्व या पर, हवा, पानी, जंतुओं से। ✓ बीजांड में निषेचन से युग्मनज; बीजांड → बीज, अंडाशय → फल; बीज अंकुरित होते हैं। पचासों गमले लग गए! आगे: यही कहानी मनुष्यों में, एक स्वास्थ्य कक्षा में।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(style.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), differ, label, style, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, parts, pollination, fertilisation, germination, inLife, yourTurn];
