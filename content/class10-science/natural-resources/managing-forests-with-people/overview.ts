import { type BoardKit, PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ForestCase,
  ResScene,
  StakeAction,
  StakeDerived,
  StakeMode,
  stakeholdersDef,
} from "@chalk/prop-resources";
import { ask, sceneOn } from "../kit";

/** A forest story, stepped by the learner, with the goal of reaching its end. */
function caseStory(b: BoardKit, c: ForestCase, steps: number) {
  const story = b.prop(stakeholdersDef, "story", {
    mode: StakeMode.Cases,
    case: c,
    cases: [c],
    step: 0,
    canTap: false,
    canStep: true,
    canPickCase: false,
  });
  b.studentOnly(story.action(StakeAction.Next));
  return {
    story,
    solve: Array.from({ length: steps - 1 }, () => story.learner(StakeAction.Next)),
  };
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandma's story of the women who hugged the trees. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const chipko = sceneOn(
    b,
    "chipko",
    ResScene.Chipko,
    "village women in the hills hugging tree trunks while workers with axes stand back",
  );
  return column([
    w.title(t("The women who hugged the trees", "पेड़ों से लिपटी औरतें")),
    chipko,
    w.body(
      t(
        'That evening the woman who was gathering twigs, Kamla Didi, tells the kids a story her mother told her: of women in the hills who held on to the trees so the axes couldn\'t reach them. "We can\'t hug every tree in our grove," she laughs. "But maybe there\'s another way."',
        'उस शाम टहनियाँ बीनने वाली महिला, कमला दीदी, बच्चों को वह कहानी सुनाती हैं जो उनकी माँ ने उन्हें सुनाई थी: पहाड़ों की उन औरतों की, जो पेड़ों से लिपट गईं ताकि कुल्हाड़ियाँ उन तक न पहुँचें। "हम अपने उपवन का हर पेड़ तो नहीं पकड़ सकते," वे हँसती हैं। "पर शायद कोई और रास्ता हो।"',
      ),
    ),
    w.body(
      t(
        "Stop 4: how did people actually save forests, and could the village do the same?",
        "पड़ाव 4: लोगों ने असल में जंगल कैसे बचाए, और क्या गाँव भी ऐसा कर सकता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Chipko Andolan, stepped. */
const chipko = page(
  "chipko",
  (b) => {
    const w = wordsOn(b);
    const { story, solve } = caseStory(b, ForestCase.Chipko, 3);
    b.standsFor(story, "the Chipko story from Reni village, told in steps");
    const goal = goalQuestion(b, {
      about: story,
      prompt: t("Step through the Chipko story.", "चिपको की कहानी आगे बढ़ाओ।"),
      isMet: story.derived(StakeDerived.IsDone),
      solve,
    });
    return column([
      w.title(t("Chipko Andolan", "चिपको आंदोलन")),
      w.body(
        t(
          "Do all the stakeholders want the same thing? Forest produce was often given to industry at rates far below its market value, while local people were denied it. The **Chipko Andolan** ('Hug the Trees Movement') was a grassroots effort to end this separation of people from their forests.",
          "क्या सभी दावेदार एक ही चीज़ चाहते हैं? वन-उपज अक्सर उद्योगों को बाज़ार भाव से बहुत कम दामों पर दी जाती थी, जबकि स्थानीय लोगों को उससे वंचित रखा जाता था। **चिपको आंदोलन** ('पेड़ों से लिपटो आंदोलन') लोगों को उनके जंगलों से अलग करने की इस प्रक्रिया को ख़त्म करने का एक ज़मीनी प्रयास था।",
        ),
      ),
      story,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Lopping vs felling: a replenishable resource. */
const lop = page(
  "lop",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "lop",
      prompt: t(
        "Why does lopping branches keep a forest, while felling destroys it?",
        "डालियाँ छाँटने से जंगल बचा रहता है पर पेड़ काटने से नष्ट क्यों होता है?",
      ),
      right: t(
        "A lopped tree regrows; a felled one is gone for good",
        "छाँटा हुआ पेड़ फिर बढ़ता है; कटा पेड़ हमेशा के लिए गया",
      ),
      wrong: [
        [
          t(
            "Lopping takes more wood out of the forest every year",
            "छाँटने में हर साल जंगल से ज़्यादा लकड़ी निकलती है",
          ),
          t(
            "The point isn't how much wood: a lopped tree lives and replenishes, a felled one doesn't.",
            "बात लकड़ी की मात्रा की नहीं: छाँटा पेड़ जीवित रहकर फिर भरता है, कटा नहीं।",
          ),
        ],
        [
          t(
            "Felled trees are always replanted by the contractors",
            "काटे गए पेड़ ठेकेदार हमेशा फिर से लगा देते हैं",
          ),
          t(
            "NCERT says felling destroys trees for ever; lopping lets the resource replenish.",
            "NCERT कहता है कि काटने से पेड़ हमेशा के लिए नष्ट होते हैं; छाँटने से संसाधन फिर भरता है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Lop, don't fell", "छाँटो, काटो मत")),
      w.definition(
        t(
          "**Replenishable resource.** A resource that renews itself over time if it is used the right way. A forest is one: communities traditionally **lop** branches and pluck leaves, so the trees grow back. A contractor **fells** the trees, destroying them for ever.",
          "**पुनःपूर्ति योग्य संसाधन।** ऐसा संसाधन जो सही ढंग से इस्तेमाल हो तो समय के साथ फिर भर जाए। जंगल ऐसा ही है: समुदाय पारंपरिक रूप से डालियाँ **छाँटते** और पत्ते तोड़ते हैं, जिससे पेड़ फिर बढ़ जाते हैं। ठेकेदार पेड़ **काट** देता है, उन्हें हमेशा के लिए नष्ट करके।",
        ),
      ),
      w.body(
        t(
          "Chipko spread quickly across communities and the media, and made the government, which owns the forests, rethink how forest produce is used. People had learnt that destroying forests harms not just forest products but also the **soil** and the **sources of water**. Local people's participation can make forest management efficient.",
          "चिपको तेज़ी से समुदायों और मीडिया में फैला, और उसने जंगलों की मालिक सरकार को वन-उपज के उपयोग पर फिर से सोचने पर मजबूर किया। लोगों ने सीखा था कि जंगल नष्ट करने से केवल वन-उत्पाद ही नहीं, **मिट्टी** और **पानी के स्रोत** भी बिगड़ते हैं। स्थानीय लोगों की भागीदारी से वन-प्रबंधन कुशल हो सकता है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Arabari: a forest officer brings the villagers in. */
const arabari = page(
  "arabari",
  (b) => {
    const w = wordsOn(b);
    const { story, solve } = caseStory(b, ForestCase.Arabari, 4);
    b.standsFor(story, "the Arabari sal forest story from West Bengal, told in steps");
    const goal = goalQuestion(b, {
      about: story,
      prompt: t("Step through the Arabari story.", "अराबाड़ी की कहानी आगे बढ़ाओ।"),
      isMet: story.derived(StakeDerived.IsDone),
      solve,
    });
    return column([
      w.title(t("Arabari: the people as protectors", "अराबाड़ी: रक्षक बने लोग")),
      w.body(
        t(
          "In 1972 the West Bengal Forest Department admitted it had failed to revive the degraded **sal** forests of the state's south-western districts. Policing had completely alienated the people, and forest officials and villagers clashed often. So the department changed its strategy.",
          "1972 में पश्चिम बंगाल वन विभाग ने माना कि वह राज्य के दक्षिण-पश्चिमी ज़िलों के ख़राब हो चुके **साल** के जंगलों को फिर से हरा करने में विफल रहा। पहरेदारी ने लोगों को पूरी तरह दूर कर दिया था, और वन अधिकारियों और गाँव वालों में अक्सर झगड़े होते थे। इसलिए विभाग ने अपनी रणनीति बदली।",
        ),
      ),
      story,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** What the villagers got, and what it achieved. */
const terms = page(
  "terms",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "share",
      prompt: t(
        "What share of the final harvest did Arabari's villagers get?",
        "अराबाड़ी के गाँव वालों को अंतिम उपज का कितना हिस्सा मिला?",
      ),
      right: t("25 per cent", "25 प्रतिशत"),
      wrong: [
        [
          t("10 per cent", "10 प्रतिशत"),
          t(
            "They got 25 per cent of the final harvest, plus jobs and fuelwood and fodder for a nominal fee.",
            "उन्हें अंतिम उपज का 25 प्रतिशत मिला, साथ में काम और मामूली शुल्क पर जलावन और चारा।",
          ),
        ],
        [
          t("50 per cent", "50 प्रतिशत"),
          t(
            "It was 25 per cent of the final harvest, not half.",
            "यह अंतिम उपज का 25 प्रतिशत था, आधा नहीं।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("A deal that worked", "एक समझौता जो चला")),
      w.body(
        t(
          "In return for protecting 1,272 hectares of badly degraded sal forest, the villagers got jobs in planting and harvesting, **25 per cent of the final harvest**, and fuelwood and fodder for a nominal fee. With their willing help the forest recovered remarkably: by **1983**, a forest once worth nothing was valued at **Rs 12.5 crores**.",
          "1,272 हेक्टेयर बुरी तरह ख़राब साल के जंगल की रक्षा के बदले गाँव वालों को रोपाई और कटाई में काम, **अंतिम उपज का 25 प्रतिशत**, और मामूली शुल्क पर जलावन और चारा मिला। उनकी इच्छा से मिली मदद से जंगल ग़ज़ब ढंग से उबरा: **1983** तक, कभी बेकार रहे जंगल की क़ीमत **12.5 करोड़ रुपये** थी।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 16.8: what damages a national park. */
const debate = page(
  "debate",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "litter",
      prompt: t(
        "Activity 16.8: tourists leave plastic bottles in a national park. What is the harm?",
        "क्रियाकलाप 16.8: पर्यटक राष्ट्रीय उद्यान में प्लास्टिक की बोतलें छोड़ते हैं। क्या नुक़सान है?",
      ),
      right: t(
        "Plastic doesn't rot and can harm the animals",
        "प्लास्टिक सड़ता नहीं और जानवरों को नुक़सान कर सकता है",
      ),
      wrong: [
        [
          t(
            "None, as long as the bottles are left in one heap",
            "कोई नहीं, अगर बोतलें एक ही ढेर में छोड़ी जाएँ",
          ),
          t(
            "A heap of plastic still doesn't break down, and animals can swallow or get caught in it.",
            "प्लास्टिक का ढेर भी नहीं गलता, और जानवर उसे निगल सकते हैं या उसमें फँस सकते हैं।",
          ),
        ],
        [
          t(
            "It only spoils the view; nature is not affected",
            "केवल नज़ारा ख़राब होता है; प्रकृति पर असर नहीं",
          ),
          t(
            "Recall Ch15: plastic is non-biodegradable and harms the ecosystem it is left in.",
            "अध्याय 15 याद करो: प्लास्टिक जैव-अनिम्नीकरणीय है और जिस पारितंत्र में छोड़ा जाए उसे नुक़सान करता है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Who harms a park?", "उद्यान को कौन नुक़सान करता है?")),
      w.body(
        t(
          "NCERT asks us to debate three kinds of damage to forests: building rest houses for tourists inside national parks; grazing domestic animals in them; and tourists throwing plastic bottles, covers and other litter. Each harms the forest in a different way, and the people causing it are often not the local people.",
          "NCERT हमसे जंगलों को होने वाले तीन तरह के नुक़सान पर बहस करने को कहता है: राष्ट्रीय उद्यानों के अंदर पर्यटकों के लिए विश्राम-गृह बनाना; उनमें पालतू पशु चराना; और पर्यटकों का प्लास्टिक की बोतलें, पन्नियाँ और दूसरा कचरा फेंकना। हर एक जंगल को अलग ढंग से नुक़सान करता है, और नुक़सान करने वाले अक्सर स्थानीय लोग नहीं होते।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** A grove committee for the village. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "committee",
      prompt: t(
        "Which plan for the grove follows Arabari's idea?",
        "उपवन की कौन-सी योजना अराबाड़ी के विचार पर चलती है?",
      ),
      right: t("Villagers guard it and share its produce", "गाँव वाले रक्षा करें और उपज बाँटें"),
      wrong: [
        [
          t("A wall around it that keeps villagers out", "चारों ओर दीवार जो गाँव वालों को बाहर रखे"),
          t(
            "That's policing, which failed in Bengal. Arabari worked by bringing the villagers in.",
            "यह पहरेदारी है, जो बंगाल में विफल रही। अराबाड़ी गाँव वालों को साथ लेकर सफल हुआ।",
          ),
        ],
        [
          t("Selling it to the timber company in one go", "उसे एक बार में लकड़ी कंपनी को बेचना"),
          t(
            "That ends the grove for ever. Arabari gave the villagers a share so they protected it.",
            "इससे उपवन हमेशा के लिए ख़त्म। अराबाड़ी ने गाँव वालों को हिस्सा दिया ताकि वे रक्षा करें।",
          ),
        ],
      ],
    });
    const row = w.body(
      t(
        "**Audit sheet, row 3, the fix:** a **grove committee**. Kamla Didi and the twig-gatherers guard the grove; they may lop branches and gather fallen wood, never fell; and they get a share of whatever it yields, with the forest guard on the committee too. Chipko's lesson and Arabari's deal, in one village.",
        "**ऑडिट शीट, पंक्ति 3, सुधार:** एक **उपवन समिति**। कमला दीदी और टहनियाँ बीनने वाले उपवन की रक्षा करें; वे डालियाँ छाँट सकें और गिरी लकड़ी उठा सकें, पेड़ कभी न काटें; और जो भी उपज हो उसमें उनका हिस्सा हो, वन रक्षक भी समिति में। चिपको की सीख और अराबाड़ी का समझौता, एक गाँव में।",
      ),
      "row",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), theBoard.show(row));
    return column([w.title(t("A grove committee", "उपवन समिति")), q, row, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q1–Q2 on forests; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const why = ask(b, {
      name: "why",
      prompt: t(
        "In-text Q1: why should we conserve forests and wildlife?",
        "पाठ्य प्रश्न 1: हमें वनों और वन्यजीवों का संरक्षण क्यों करना चाहिए?",
      ),
      right: t(
        "Losing biodiversity may destabilise the ecosystem",
        "जैव विविधता घटने से पारितंत्र अस्थिर हो सकता है",
      ),
      wrong: [
        [
          t("Forests only matter for the timber they supply", "जंगल केवल अपनी लकड़ी के लिए ज़रूरी हैं"),
          t(
            "That's the industrial view. Forests are biodiversity hotspots and protect soil and water.",
            "यह उद्योगों की दृष्टि है। जंगल जैव विविधता के हॉटस्पॉट हैं और मिट्टी और पानी को बचाते हैं।",
          ),
        ],
        [
          t(
            "Wild animals are useful only as tourist attractions",
            "जंगली जानवर केवल पर्यटकों के आकर्षण के लिए उपयोगी हैं",
          ),
          t(
            "Conservation aims to keep the biodiversity we inherited, because losing it may cost stability.",
            "संरक्षण का लक्ष्य विरासत में मिली जैव विविधता बचाना है, क्योंकि उसके घटने से स्थिरता जा सकती है।",
          ),
        ],
      ],
      passes: false,
    });
    const approach = ask(b, {
      name: "approach",
      prompt: t(
        "In-text Q2: which is a sound approach to conserving forests?",
        "पाठ्य प्रश्न 2: वनों के संरक्षण का कौन-सा तरीक़ा ठीक है?",
      ),
      right: t(
        "Involve local people and share the benefits",
        "स्थानीय लोगों को शामिल करना और लाभ बाँटना",
      ),
      wrong: [
        [
          t("Replace mixed forest with a single fast crop", "मिश्रित जंगल की जगह एक ही तेज़ फ़सल लगाना"),
          t(
            "Monocultures destroy biodiversity and can't meet local needs.",
            "एकल कृषि जैव विविधता नष्ट करती है और स्थानीय ज़रूरतें पूरी नहीं कर पाती।",
          ),
        ],
        [
          t(
            "Keep all people out of every forest by force",
            "ज़बरदस्ती हर जंगल से सब लोगों को बाहर रखना",
          ),
          t(
            "NCERT says keeping people out by force cannot succeed in the long run.",
            "NCERT कहता है कि लोगों को ज़बरदस्ती बाहर रखना लंबे समय तक सफल नहीं हो सकता।",
          ),
        ],
      ],
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Audit log, stop 4.** ✓ Chipko: felling destroys, lopping lets a forest renew. ✓ Arabari: bring people in, share the harvest, and a dead forest comes back. ✓ The grove gets a committee. ✗ Next row: the canal that never reaches the far farms. Next: water for all.",
        "**ऑडिट लॉग, पड़ाव 4।** ✓ चिपको: काटना नष्ट करता है, छाँटने से जंगल फिर भरता है। ✓ अराबाड़ी: लोगों को साथ लो, उपज बाँटो, और मरा जंगल लौट आता है। ✓ उपवन को समिति मिली। ✗ अगली पंक्ति: वह नहर जो दूर के खेतों तक कभी नहीं पहुँचती। आगे: सबके लिए पानी।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(why.on(QuestionSignal.Correct), theBoard.show(approach));
    b.when(approach.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), why, approach, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, chipko, lop, arabari, terms, debate, inLife, yourTurn];
