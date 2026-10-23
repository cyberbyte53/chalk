import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Deed, FiveRAction, FiveRDerived, R_OF, ResScene, fiveRsDef } from "@chalk/prop-resources";
import { ask, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Activity 16.4: the new road and houses, and where they came from. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const back = sceneOn(
    b,
    "back",
    ResScene.VillageReturn,
    "the village's new tar road and concrete houses, with Grandpa looking around",
  );
  return column([
    w.title(t("Where did the road come from?", "सड़क कहाँ से आई?")),
    back,
    w.body(
      t(
        'Walking the new road, Kabir asks the question NCERT asks in Activity 16.4: **where did all this come from?** The tar, the stone chips, the cement, the iron rods, the bricks. Riya starts a list with a column for each material\'s source. Grandpa watches the lorries pass and says, "Twenty years ago that hill had trees on it."',
        'नई सड़क पर चलते हुए कबीर वही सवाल पूछता है जो NCERT क्रियाकलाप 16.4 में पूछता है: **यह सब आया कहाँ से?** डामर, पत्थर की रोड़ी, सीमेंट, लोहे की छड़ें, ईंटें। रिया एक सूची बनाने लगती है, हर पदार्थ के स्रोत का एक कॉलम। दादाजी गुज़रते ट्रकों को देखकर कहते हैं, "बीस साल पहले उस पहाड़ी पर पेड़ थे।"',
      ),
    ),
    w.body(
      t(
        "Stop 2 asks the question behind the whole audit: if everything comes from somewhere, why does it need managing?",
        "पड़ाव 2 वह सवाल पूछता है जो पूरे ऑडिट के पीछे है: अगर हर चीज़ कहीं से आती है, तो उसके प्रबंधन की ज़रूरत क्यों है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Everything comes from the earth, except sunlight. */
const fromEarth = page(
  "from-earth",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "outside",
      prompt: t(
        "What is the one thing we get from outside the earth?",
        "वह एक चीज़ क्या है जो हमें धरती के बाहर से मिलती है?",
      ),
      right: t("Energy from the Sun", "सूर्य से ऊर्जा"),
      wrong: [
        [
          t("Water from the clouds", "बादलों से पानी"),
          t(
            "Clouds are part of the earth's own water cycle. Only the Sun's energy comes from outside.",
            "बादल धरती के अपने जल-चक्र का हिस्सा हैं। केवल सूर्य की ऊर्जा बाहर से आती है।",
          ),
        ],
        [
          t("Oxygen from the sky", "आसमान से ऑक्सीजन"),
          t(
            "The air is part of the earth. Only the Sun's energy comes from outside.",
            "हवा धरती का ही हिस्सा है। केवल सूर्य की ऊर्जा बाहर से आती है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("All of it comes from the earth", "सब कुछ धरती से आता है")),
      w.body(
        t(
          "Not just roads and buildings: everything we use or eat (food, clothes, books, toys, furniture, tools, vehicles) is made from the earth's resources. The **only** thing we get from outside is **energy from the Sun**, and even that is processed by living things and by physical and chemical processes on the earth before we can use it.",
          "केवल सड़कें और इमारतें नहीं: जो कुछ हम इस्तेमाल करते या खाते हैं (भोजन, कपड़े, किताबें, खिलौने, फ़र्नीचर, औज़ार, वाहन) सब धरती के संसाधनों से बनता है। बाहर से हमें **केवल** **सूर्य की ऊर्जा** मिलती है, और उसे भी इस्तेमाल लायक़ बनाने में धरती के जीव और भौतिक-रासायनिक प्रक्रम काम करते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Not unlimited; long-term vs short-term. */
const limited = page(
  "limited",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "short",
      prompt: t(
        "A contractor cuts the whole hill's trees in one year for a quick profit. What does that gain, and lose?",
        "एक ठेकेदार जल्दी मुनाफ़े के लिए एक साल में पहाड़ी के सारे पेड़ काट देता है। इससे क्या मिलता है, और क्या खोता है?",
      ),
      right: t(
        "Gains a big profit now; loses all future harvests",
        "अभी बड़ा मुनाफ़ा; आगे की सारी फ़सल ख़त्म",
      ),
      wrong: [
        [
          t("Gains nothing at all; loses nothing either", "कुछ नहीं मिलता; कुछ खोता भी नहीं"),
          t(
            "A short-term aim does give quick gains, here a big profit, but nothing is left for later.",
            "अल्पकालिक लक्ष्य से जल्दी लाभ मिलता है, यहाँ बड़ा मुनाफ़ा, पर बाद के लिए कुछ नहीं बचता।",
          ),
        ],
        [
          t(
            "Gains timber for ever; loses only a single season's crop",
            "हमेशा के लिए लकड़ी; केवल एक मौसम की फ़सल का नुक़सान",
          ),
          t(
            "Felled trees don't come back next season. The future harvests are gone.",
            "काटे गए पेड़ अगले मौसम लौट नहीं आते। आगे की फ़सलें ख़त्म हो जाती हैं।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Not unlimited", "असीमित नहीं")),
      w.body(
        t(
          "Why use resources carefully? Because they are **not unlimited**, and the human population is rising very fast thanks to better health care, so the demand for every resource is growing faster and faster.",
          "संसाधनों को सावधानी से क्यों इस्तेमाल करें? क्योंकि वे **असीमित नहीं हैं**, और बेहतर स्वास्थ्य सेवाओं के कारण मनुष्यों की आबादी बहुत तेज़ी से बढ़ रही है, इसलिए हर संसाधन की माँग और तेज़ी से बढ़ रही है।",
        ),
      ),
      w.definition(
        t(
          "**A long-term view.** Managing natural resources means planning so they **last for the generations to come**, not squeezing everything out of them for short-term gains.",
          "**दीर्घकालिक दृष्टि।** प्राकृतिक संसाधनों के प्रबंधन का अर्थ है ऐसी योजना जिससे वे **आने वाली पीढ़ियों तक चलें**, न कि अल्पकालिक लाभ के लिए उनमें से सब कुछ निचोड़ लेना।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Equitable distribution, and what works against it. */
const fair = page(
  "fair",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "against",
      prompt: t(
        "In-text Q4: which force works against a fair share of resources?",
        "पाठ्य प्रश्न 4: कौन-सी ताक़त संसाधनों के न्यायसंगत बँटवारे के ख़िलाफ़ काम करती है?",
      ),
      right: t(
        "The rich and powerful taking the biggest share",
        "अमीर और ताक़तवर लोगों का सबसे बड़ा हिस्सा ले लेना",
      ),
      wrong: [
        [
          t(
            "Villagers agreeing on turns to use the water",
            "गाँव वालों का पानी इस्तेमाल करने की बारी तय करना",
          ),
          t(
            "Agreeing on turns makes sharing fairer, not less fair.",
            "बारी तय करने से बँटवारा ज़्यादा न्यायसंगत होता है, कम नहीं।",
          ),
        ],
        [
          t(
            "A law that gives every single family the same amount",
            "एक क़ानून जो हर एक परिवार को बराबर हिस्सा दे",
          ),
          t(
            "An equal share for every family is what equitable distribution aims at.",
            "हर परिवार को बराबर हिस्सा, यही तो न्यायसंगत बँटवारे का लक्ष्य है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("A fair share for all", "सबके लिए उचित हिस्सा")),
      w.definition(
        t(
          "**Equitable distribution.** Managing resources so that **everyone** benefits from developing them, not just a handful of rich and powerful people.",
          "**न्यायसंगत वितरण।** संसाधनों का ऐसा प्रबंधन कि उनके विकास का लाभ **सबको** मिले, न कि केवल मुट्ठी भर अमीर और ताक़तवर लोगों को।",
        ),
      ),
      w.body(
        t(
          "Without a fair share, the people with the least lose most: the ones who live closest to the forest or the river and have nothing else to fall back on.",
          "उचित हिस्से के बिना सबसे ज़्यादा वे खोते हैं जिनके पास सबसे कम है: वे जो जंगल या नदी के सबसे पास रहते हैं और जिनके पास कोई दूसरा सहारा नहीं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Damage done while extracting: mining slag. */
const waste = page(
  "waste",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "slag",
      prompt: t(
        "Why does mining pollute, according to NCERT?",
        "NCERT के अनुसार खनन प्रदूषण क्यों करता है?",
      ),
      right: t(
        "Lots of slag is thrown away per tonne of metal",
        "हर टन धातु पर बहुत सारा धातुमल फेंका जाता है",
      ),
      wrong: [
        [
          t(
            "The metal itself slowly rusts away inside the mine",
            "धातु ख़ुद खान के अंदर धीरे-धीरे जंग खाकर ख़त्म होती है",
          ),
          t(
            "The problem is the waste: a large amount of slag for every tonne of metal.",
            "समस्या अपशिष्ट है: हर टन धातु पर बहुत सारा धातुमल।",
          ),
        ],
        [
          t("Miners burn the ore to keep themselves warm", "खनिक ख़ुद को गर्म रखने के लिए अयस्क जलाते हैं"),
          t(
            "The pollution comes from the slag thrown away for every tonne of metal extracted.",
            "प्रदूषण हर टन धातु निकालने पर फेंके गए धातुमल से आता है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Damage on the way", "रास्ते का नुक़सान")),
      w.body(
        t(
          "Using a resource can harm the environment even before we use it, while it is being **extracted**. Mining pollutes because a large amount of **slag** (rock waste) is thrown away for every tonne of metal taken out. So sustainable management must also plan the **safe disposal** of such waste.",
          "किसी संसाधन को इस्तेमाल करने से पहले ही, जब उसे **निकाला** जा रहा होता है, पर्यावरण को नुक़सान हो सकता है। खनन प्रदूषण करता है क्योंकि हर टन धातु निकालने पर बहुत सारा **धातुमल** (चट्टान का अपशिष्ट) फेंका जाता है। इसलिए संपोषित प्रबंधन में ऐसे अपशिष्ट के **सुरक्षित निपटान** की योजना भी होनी चाहिए।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Old roots: the Atharva Veda hymns and sacred groves. */
const tradition = page(
  "tradition",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "hymn",
      prompt: t(
        "The hymn says 'Whatever I dig out of you, O Earth, may that have quick regeneration again.' Which idea is that?",
        "भजन कहता है 'हे पृथ्वी! जो कुछ मैं तुझसे खोदूँ, वह फिर जल्दी उग आए।' यह कौन-सा विचार है?",
      ),
      right: t("Take only what can grow back", "केवल उतना लो जितना फिर उग सके"),
      wrong: [
        [
          t("Dig out as much as you need", "जितना चाहिए उतना खोद लो"),
          t(
            "It asks that what is taken should regrow: the idea of sustainable use.",
            "यह माँगता है कि जो लिया जाए वह फिर उगे: संपोषित उपयोग का विचार।",
          ),
        ],
        [
          t("Never touch the earth at all", "धरती को कभी छुओ ही मत"),
          t(
            "It accepts that we dig; it asks that the earth regenerates quickly.",
            "यह मानता है कि हम खोदते हैं; यह माँगता है कि धरती जल्दी फिर से भर जाए।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("An old idea", "एक पुराना विचार")),
      w.body(
        t(
          'Worldwide concern for sustainable development is recent. In India, the culture of caring for nature is very old: the Upanishads and Smritis describe how forests were used and managed. A hymn from the **Atharva Veda** (12.1.35) reads: "Whatever I dig out of you, O Earth! May that have quick regeneration again; may we not damage thy vital habitat and heart."',
          'संपोषित विकास की दुनिया भर में चिंता नई है। भारत में प्रकृति की देखभाल की संस्कृति बहुत पुरानी है: उपनिषदों और स्मृतियों में वनों के उपयोग और प्रबंधन का वर्णन है। **अथर्ववेद** (12.1.35) का एक भजन कहता है: "हे पृथ्वी! जो कुछ मैं तुझसे खोदूँ, वह फिर जल्दी उग आए; हम तेरे जीवन-स्थल और हृदय को हानि न पहुँचाएँ।"',
        ),
      ),
      w.body(
        t(
          "In the later Vedic period, as farming grew, people kept **sacred forests and groves** and sacred corridors, and many forest practices bound up with customs and rituals protected nature. NCERT Activity 16.5: look for such practices in your own day-to-day life.",
          "उत्तर वैदिक काल में, जब खेती बढ़ी, लोगों ने **पवित्र वन और उपवन** और पवित्र गलियारे बचाए, और रीति-रिवाज़ों से जुड़े कई वन-व्यवहारों ने प्रकृति की रक्षा की। NCERT क्रियाकलाप 16.5: अपने रोज़ के जीवन में ऐसे व्यवहार खोजो।",
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

/** Back to the road: how could the village use less? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const deeds = [
      Deed.RefuseFreebie,
      Deed.NoFoodWaste,
      Deed.PickleJar,
      Deed.TyreSwing,
      Deed.OldBottlesToKabadi,
    ] as const;
    const sorter = b.prop(fiveRsDef, "sorter", {
      deeds: [...deeds],
      placed: [],
      showMeaning: false,
      showFeedback: true,
    });
    b.studentOnly(sorter.action(FiveRAction.Put));
    b.studentOnly(sorter.action(FiveRAction.Reset));
    b.standsFor(
      sorter,
      "five more of the family's actions in the village, to be put into the five R's, this time without the meanings shown",
    );
    const goal = goalQuestion(b, {
      about: sorter,
      prompt: t(
        "Without the meanings this time: put each of the family's actions into its R.",
        "इस बार अर्थ के बिना: परिवार के हर काम को उसके R में रखो।",
      ),
      isMet: sorter.derived(FiveRDerived.AllRight),
      solve: deeds.map((d) => sorter.learner(FiveRAction.Put, { r: R_OF[d] })),
    });
    const row = w.body(
      t(
        "**Audit sheet, row 2: our habits.** Riya's list has the answer to Activity 16.4: the road's stone came from the hill, the cement from limestone, the iron from ore, the bricks from the fields' clay. None of it comes back. So the first fix is in every house: refuse what we don't need, reduce, reuse, repurpose, and recycle the rest.",
        "**ऑडिट शीट, पंक्ति 2: हमारी आदतें।** रिया की सूची में क्रियाकलाप 16.4 का उत्तर है: सड़क का पत्थर पहाड़ी से, सीमेंट चूना-पत्थर से, लोहा अयस्क से, ईंटें खेतों की मिट्टी से आईं। इनमें से कुछ भी लौटता नहीं। इसलिए पहला सुधार हर घर में है: जो नहीं चाहिए उसे मना करो, कम करो, दोबारा इस्तेमाल करो, नया उपयोग करो, और बाक़ी का पुनर्चक्रण करो।",
      ),
      "row",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(row));
    return column([w.title(t("The road, again", "फिर वही सड़क")), sorter, goal, row, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q2–Q3; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const longView = ask(b, {
      name: "long",
      prompt: t(
        "In-text Q3: how does a long-term view differ from short-term aims?",
        "पाठ्य प्रश्न 3: दीर्घकालिक दृष्टि अल्पकालिक लक्ष्यों से कैसे अलग है?",
      ),
      right: t(
        "Smaller gains each year, but they keep coming",
        "हर साल कम लाभ, पर लगातार मिलता रहता है",
      ),
      wrong: [
        [
          t("Bigger gains at once, and nothing for later", "एक साथ बड़ा लाभ, और बाद के लिए कुछ नहीं"),
          t(
            "That is the short-term aim. A long-term view keeps the resource going for generations.",
            "यह अल्पकालिक लक्ष्य है। दीर्घकालिक दृष्टि संसाधन को पीढ़ियों तक चलाती है।",
          ),
        ],
        [
          t("No gains at all, so the resource stays untouched", "कोई लाभ नहीं, ताकि संसाधन अछूता रहे"),
          t(
            "A long-term view still uses the resource, just in a way that lets it last.",
            "दीर्घकालिक दृष्टि भी संसाधन इस्तेमाल करती है, बस ऐसे कि वह टिके।",
          ),
        ],
      ],
      passes: false,
    });
    const log = w.definition(
      t(
        "**Audit log, stop 2.** ✓ Resources aren't unlimited, demand keeps growing, and extracting them does damage too. ✓ Managing them means a long-term view and a fair share for all. ✗ The half-cut grove: who decides what happens to it? Next: forests and their stakeholders.",
        "**ऑडिट लॉग, पड़ाव 2।** ✓ संसाधन असीमित नहीं, माँग बढ़ती जा रही है, और उन्हें निकालने से भी नुक़सान होता है। ✓ उनके प्रबंधन का अर्थ है दीर्घकालिक दृष्टि और सबके लिए उचित हिस्सा। ✗ आधा कटा उपवन: उसके बारे में फ़ैसला कौन करता है? आगे: वन और उनके दावेदार।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(longView.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), longView, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, fromEarth, limited, fair, waste, tradition, inLife, yourTurn];
