import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ForestCase,
  ResScene,
  StakeAction,
  StakeDerived,
  StakeMode,
  Stakeholder,
  stakeholdersDef,
} from "@chalk/prop-resources";
import { ask, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The half-cut grove behind the temple. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const grove = sceneOn(
    b,
    "grove",
    ResScene.CutGrove,
    "the grove behind the temple, half of it cut down to stumps",
  );
  return column([
    w.title(t("The half-cut grove", "आधा कटा उपवन")),
    grove,
    w.body(
      t(
        "Behind the temple there used to be a thick grove where Grandpa played as a boy. Now half of it is stumps. A woman collecting dry twigs says the trees were sold to a timber company. A forest guard says the land belongs to the department. Kabir, standing between the stumps, asks the obvious question: **whose grove is it, anyway?**",
        "मंदिर के पीछे एक घना उपवन हुआ करता था जहाँ दादाजी बचपन में खेलते थे। अब उसका आधा हिस्सा ठूँठ है। सूखी टहनियाँ बीनती एक महिला बताती है कि पेड़ एक लकड़ी कंपनी को बेचे गए। एक वन रक्षक कहता है कि ज़मीन विभाग की है। ठूँठों के बीच खड़ा कबीर सीधा सवाल पूछता है: **आख़िर यह उपवन है किसका?**",
      ),
    ),
    w.body(t("Stop 3: who wants a forest, and for what?", "पड़ाव 3: जंगल किसे चाहिए, और किसलिए?")),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Forests as biodiversity hotspots. */
const hotspot = page(
  "hotspot",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "stability",
      prompt: t(
        "What do field studies suggest happens when biodiversity is lost?",
        "क्षेत्र-अध्ययन क्या बताते हैं, जैव विविधता घटने पर क्या होता है?",
      ),
      right: t("The ecosystem loses stability", "पारितंत्र की स्थिरता घटती है"),
      wrong: [
        [
          t("The forest grows back faster", "जंगल और तेज़ी से फिर उगता है"),
          t(
            "NCERT says the opposite: loss of diversity may lead to loss of ecological stability.",
            "NCERT उल्टा कहता है: विविधता घटने से पारिस्थितिक स्थिरता घट सकती है।",
          ),
        ],
        [
          t("Nothing changes for the others", "बाक़ियों के लिए कुछ नहीं बदलता"),
          t(
            "Species depend on one another; losing diversity may make the whole system unstable.",
            "जातियाँ एक-दूसरे पर निर्भर हैं; विविधता घटने से पूरा तंत्र अस्थिर हो सकता है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Why forests matter", "जंगल क्यों ज़रूरी हैं")),
      w.definition(
        t(
          "**Biodiversity hotspot.** A **biodiversity hotspot** is an area very rich in different kinds of living things, and forests are such places. One measure of an area's **biodiversity** is the number of species found there; the **range** of different life forms (bacteria, fungi, ferns, flowering plants, nematodes, insects, birds, reptiles and so on) matters too.",
          "**जैव विविधता का विशिष्ट स्थल (हॉटस्पॉट)।** **जैव विविधता हॉटस्पॉट** वह क्षेत्र है जो अलग-अलग तरह के जीवों से बहुत समृद्ध हो, और जंगल ऐसी जगहें हैं। किसी क्षेत्र की **जैव विविधता** का एक माप वहाँ पाई जाने वाली जातियों की संख्या है; अलग-अलग जीव-रूपों (जीवाणु, कवक, फ़र्न, पुष्पी पौधे, सूत्रकृमि, कीट, पक्षी, सरीसृप आदि) का **दायरा** भी मायने रखता है।",
        ),
      ),
      w.body(
        t(
          "One of the main aims of conservation is to keep the biodiversity we have inherited. Experiments and field studies suggest that **loss of diversity may lead to loss of ecological stability**.",
          "संरक्षण का एक मुख्य उद्देश्य है विरासत में मिली जैव विविधता को बचाए रखना। प्रयोग और क्षेत्र-अध्ययन बताते हैं कि **विविधता घटने से पारिस्थितिक स्थिरता घट सकती है**।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The four stakeholders: tap each. */
const stakeholders = page(
  "stakeholders",
  (b) => {
    const w = wordsOn(b);
    const map = b.prop(stakeholdersDef, "map", {
      mode: StakeMode.Map,
      selected: null,
      showNeeds: true,
      canTap: true,
      canStep: false,
      canPickCase: false,
    });
    b.studentOnly(map.action(StakeAction.Pick));
    b.standsFor(
      map,
      "a forest in the middle with its four stakeholders around it; tapping one shows what they need, how much they depend on the forest, and whether they need this forest to last",
    );
    const goal = goalQuestion(b, {
      about: map,
      prompt: t(
        "Find the stakeholder who doesn't depend on this forest and has no stake in it lasting.",
        "वह दावेदार खोजो जो इस जंगल पर निर्भर नहीं और जिसका इसके टिके रहने में कोई हित नहीं।",
      ),
      isMet: map.field("selected").eq(Stakeholder.Industry),
      solve: [map.learner(StakeAction.Pick, { who: Stakeholder.Industry })],
    });
    return column([
      w.title(t("Who has a stake?", "किसका दावा है?")),
      w.definition(
        t(
          "**Stakeholder.** Anyone who uses, needs or has a say in a resource. A forest has four: **(i)** the people who live in or around it and depend on its produce; **(ii)** the **Forest Department**, which owns the land and controls its resources; **(iii)** **industrialists**, from those who use tendu leaves for bidis to paper mills, who use forest produce but don't depend on any one forest; **(iv)** **wildlife and nature enthusiasts**, who want nature conserved as it is.",
          "**दावेदार (स्टेकहोल्डर)।** कोई भी जो किसी संसाधन का उपयोग करता है, उसकी ज़रूरत रखता है या उस पर कुछ कहने का हक़ रखता है। जंगल के चार दावेदार हैं: **(i)** उसमें या उसके पास रहने वाले लोग, जो उसकी उपज पर निर्भर हैं; **(ii)** **वन विभाग**, जो ज़मीन का मालिक है और उसके संसाधनों पर नियंत्रण रखता है; **(iii)** **उद्योगपति**, बीड़ी के लिए तेंदू पत्ते लेने वालों से लेकर काग़ज़ मिलों तक, जो वन-उपज इस्तेमाल करते हैं पर किसी एक जंगल पर निर्भर नहीं; **(iv)** **वन्यजीव और प्रकृति प्रेमी**, जो प्रकृति को जैसी है वैसी बचाना चाहते हैं।",
        ),
      ),
      w.body(
        t(
          "Tap each one to see what they need or get from the forest.",
          "हर एक पर टैप करके देखो कि उन्हें जंगल से क्या चाहिए या क्या मिलता है।",
        ),
      ),
      map,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Local people, the British, monocultures. */
const locals = page(
  "locals",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "monoculture",
      prompt: t(
        "A forest is cleared and planted with only eucalyptus. Who loses most?",
        "एक जंगल साफ़ करके केवल यूकेलिप्टस लगाया जाता है। सबसे ज़्यादा कौन खोता है?",
      ),
      right: t(
        "Local people who needed fodder, herbs and fruit",
        "स्थानीय लोग जिन्हें चारा, जड़ी-बूटी और फल चाहिए थे",
      ),
      wrong: [
        [
          t(
            "The Forest Department, which earns money from it",
            "वन विभाग, जिसे इससे पैसों की आय होती है",
          ),
          t(
            "Plantations are an important source of revenue for the department; it gains.",
            "बागान विभाग के लिए आय का अहम स्रोत हैं; उसे लाभ होता है।",
          ),
        ],
        [
          t("The paper mill that needs eucalyptus wood", "काग़ज़ मिल जिसे यूकेलिप्टस की लकड़ी चाहिए"),
          t(
            "Such plantations suit industries that want one product; the mill gains.",
            "ऐसे बागान उन उद्योगों के काम के हैं जिन्हें एक ही उत्पाद चाहिए; मिल को लाभ होता है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("People of the forest", "जंगल के लोग")),
      w.body(
        t(
          "Local people need large amounts of firewood, small timber and thatch. Bamboo makes slats for huts and baskets for storing food. Tools for farming, fishing and hunting are mostly wood. They gather fruits, nuts and medicines, and their cattle graze in the forest or eat fodder collected from it.",
          "स्थानीय लोगों को बहुत सारा जलावन, छोटी लकड़ी और छप्पर चाहिए। बाँस से झोपड़ियों की खपच्चियाँ और भोजन रखने की टोकरियाँ बनती हैं। खेती, मछली पकड़ने और शिकार के औज़ार ज़्यादातर लकड़ी के होते हैं। वे फल, मेवे और दवाइयाँ इकट्ठा करते हैं, और उनके पशु जंगल में चरते हैं या वहाँ से लाया चारा खाते हैं।",
        ),
      ),
      w.body(
        t(
          "Before the British took over most forests, people had lived in them for centuries and used them sustainably. After the takeover they were pushed into much smaller areas, which then got over-used. Independent India's Forest Department carried on ignoring local knowledge and needs.",
          "अंग्रेज़ों के ज़्यादातर जंगलों पर क़ब्ज़ा करने से पहले लोग सदियों से उनमें रहते थे और उन्हें संपोषित ढंग से इस्तेमाल करते थे। क़ब्ज़े के बाद उन्हें बहुत छोटे इलाक़ों में धकेल दिया गया, जिनका फिर ज़रूरत से ज़्यादा उपयोग होने लगा। स्वतंत्र भारत का वन विभाग भी स्थानीय ज्ञान और ज़रूरतों की अनदेखी करता रहा।",
        ),
      ),
      w.definition(
        t(
          "**Monoculture.** A plantation of a single kind of tree, such as pine, teak or eucalyptus. To plant it, a huge area is first cleared of everything, destroying much biodiversity, and the local people's varied needs can no longer be met from it.",
          "**एकल कृषि (मोनोकल्चर)।** एक ही तरह के पेड़ का बागान, जैसे चीड़, सागौन या यूकेलिप्टस। इसे लगाने से पहले बहुत बड़ा इलाक़ा पूरी तरह साफ़ किया जाता है, जिससे बहुत सी जैव विविधता नष्ट होती है, और स्थानीय लोगों की तरह-तरह की ज़रूरतें फिर उससे पूरी नहीं हो पातीं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Industry: raw material, no stake in one place. */
const industry = page(
  "industry",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "teak",
      prompt: t(
        "After cutting all the teak in one area, what does a timber company usually do?",
        "एक इलाक़े का सारा सागौन काटने के बाद लकड़ी कंपनी आमतौर पर क्या करती है?",
      ),
      right: t("Gets teak from a forest farther away", "और दूर के जंगल से सागौन लाती है"),
      wrong: [
        [
          t("Replants the same area with teak", "उसी इलाक़े में फिर सागौन लगाती है"),
          t(
            "It has no stake in one area lasting, so it simply moves on to another forest.",
            "किसी एक इलाक़े के टिकने में उसका हित नहीं, इसलिए वह बस दूसरे जंगल चली जाती है।",
          ),
        ],
        [
          t("Hands the area back to the villagers", "इलाक़ा गाँव वालों को लौटा देती है"),
          t(
            "NCERT's point is that it just takes teak from a forest farther away.",
            "NCERT की बात यह है कि वह बस और दूर के जंगल से सागौन ले आती है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("A forest as raw material", "कच्चा माल बना जंगल")),
      w.body(
        t(
          "A short count of industries based on forest produce: timber, paper, lac and sports goods. Industries see a forest merely as raw material for their factories, and powerful groups lobby the government for it at artificially low rates. Because industries reach far, they have no interest in one forest lasting.",
          "वन-उपज पर आधारित उद्योगों की एक छोटी गिनती: लकड़ी, काग़ज़, लाख और खेल का सामान। उद्योग जंगल को केवल अपने कारख़ानों का कच्चा माल मानते हैं, और ताक़तवर समूह सरकार से इसे बनावटी रूप से कम दामों पर लेने की पैरवी करते हैं। उद्योगों की पहुँच दूर तक है, इसलिए किसी एक जंगल के टिके रहने में उनकी कोई रुचि नहीं।",
        ),
      ),
      w.body(
        t(
          "The **wildlife and nature enthusiasts** don't depend on forests at all, but may have a big say in managing them. They first cared mostly about large animals like lions, tigers, elephants and rhinos; now they see the need to keep biodiversity as a whole.",
          "**वन्यजीव और प्रकृति प्रेमी** जंगलों पर बिल्कुल निर्भर नहीं, पर उनके प्रबंधन में उनकी बड़ी आवाज़ हो सकती है। पहले उन्हें ज़्यादातर बड़े जानवरों की चिंता थी, जैसे शेर, बाघ, हाथी और गैंडे; अब वे पूरी जैव विविधता बचाने की ज़रूरत समझते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The Bishnois and Amrita Devi, stepped. */
const bishnoi = page(
  "bishnoi",
  (b) => {
    const w = wordsOn(b);
    const story = b.prop(stakeholdersDef, "story", {
      mode: StakeMode.Cases,
      case: ForestCase.Bishnoi,
      cases: [ForestCase.Bishnoi],
      step: 0,
      canTap: false,
      canStep: true,
      canPickCase: false,
    });
    b.studentOnly(story.action(StakeAction.Next));
    b.standsFor(story, "the story of the Bishnois and Amrita Devi, told in steps");
    const goal = goalQuestion(b, {
      about: story,
      prompt: t("Step through the Bishnois' story.", "बिश्नोई समुदाय की कहानी आगे बढ़ाओ।"),
      isMet: story.derived(StakeDerived.IsDone),
      solve: [story.learner(StakeAction.Next), story.learner(StakeAction.Next)],
    });
    const khejri = sceneOn(
      b,
      "khejri",
      ResScene.Khejri,
      "a khejri tree in the desert, the tree the Bishnois protected",
    );
    return column([
      w.title(t("People who protected the forest", "जंगल की रक्षा करने वाले लोग")),
      w.body(
        t(
          "Shouldn't people be counted as part of the forest system? Local people have long worked to conserve forests. The **Bishnoi** community of western Rajasthan hold that all living things have a right to survive and share all resources.",
          "क्या लोगों को भी जंगल के तंत्र का हिस्सा नहीं माना जाना चाहिए? स्थानीय लोगों ने लंबे समय से जंगलों को बचाया है। पश्चिमी राजस्थान का **बिश्नोई** समुदाय मानता है कि सभी जीवों को जीने और सारे संसाधनों में हिस्से का हक़ है।",
        ),
      ),
      khejri,
      story,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The Great Himalayan National Park: keeping people out by force fails. */
const himalaya = page(
  "himalaya",
  (b) => {
    const w = wordsOn(b);
    const story = b.prop(stakeholdersDef, "story", {
      mode: StakeMode.Cases,
      case: ForestCase.Himalayan,
      cases: [ForestCase.Himalayan],
      step: 0,
      canTap: false,
      canStep: true,
      canPickCase: false,
    });
    b.studentOnly(story.action(StakeAction.Next));
    b.standsFor(story, "the alpine meadows of the Great Himalayan National Park, told in steps");
    const q = ask(b, {
      name: "meadow",
      prompt: t(
        "What happened to the meadows when sheep grazing was stopped?",
        "भेड़ों की चराई बंद होने पर घास के मैदानों का क्या हुआ?",
      ),
      right: t(
        "The grass grew tall, fell over and blocked new growth",
        "घास लंबी होकर गिर गई और नई घास रुक गई",
      ),
      wrong: [
        [
          t(
            "The grass grew back thicker and healthier than before",
            "घास पहले से घनी और स्वस्थ होकर उगी",
          ),
          t(
            "Without grazing the grass grew very tall, then fell over and prevented fresh growth.",
            "चराई के बिना घास बहुत लंबी हुई, फिर गिरकर नई घास को उगने से रोकने लगी।",
          ),
        ],
        [
          t("The meadows quickly turned into a thick forest", "मैदान जल्दी ही घने जंगल में बदल गए"),
          t(
            "NCERT describes tall grass falling over and blocking fresh growth, not a new forest.",
            "NCERT लंबी घास के गिरकर नई घास रोकने की बात करता है, नए जंगल की नहीं।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Keeping people out", "लोगों को बाहर रखना")),
      w.body(
        t(
          "Studies show the prejudice against traditional use of forests has no basis. Step through NCERT's example.",
          "अध्ययन बताते हैं कि जंगल के पारंपरिक उपयोग के प्रति पूर्वाग्रह का कोई आधार नहीं। NCERT का उदाहरण आगे बढ़ाओ।",
        ),
      ),
      story,
      w.body(
        t(
          "Managing protected areas by keeping local people out, or by force, can't succeed in the long run. And the damage can't be blamed only on local people: industry, development projects like roads and dams, and tourists (and the hotels built for them) cause damage too.",
          "संरक्षित क्षेत्रों का प्रबंधन स्थानीय लोगों को बाहर रखकर, या ज़बरदस्ती, लंबे समय तक सफल नहीं हो सकता। और नुक़सान का दोष केवल स्थानीय लोगों पर नहीं डाला जा सकता: उद्योग, सड़कें और बाँध जैसी विकास परियोजनाएँ, और पर्यटक (और उनके लिए बनी सुविधाएँ) भी नुक़सान करते हैं।",
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

/** Who wants the village grove, and who should decide (Exercise 3). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const grove = sceneOn(b, "grove", ResScene.CutGrove, "the half-cut grove behind the temple");
    const q = ask(b, {
      name: "decide",
      prompt: t(
        "Exercise 3: who should have the authority to decide how forest produce is managed?",
        "अभ्यास 3: वन-उपज का प्रबंधन कैसे हो, यह तय करने का अधिकार किसे होना चाहिए?",
      ),
      right: t(
        "Local people, working with the Forest Department",
        "स्थानीय लोग, वन विभाग के साथ मिलकर",
      ),
      wrong: [
        [
          t(
            "Industries alone, since they use the most produce",
            "केवल उद्योग, क्योंकि वे सबसे ज़्यादा उपज इस्तेमाल करते हैं",
          ),
          t(
            "Industries have no stake in one forest lasting; they move on once it's used up.",
            "उद्योगों का किसी एक जंगल के टिकने में हित नहीं; उसके ख़त्म होने पर वे आगे बढ़ जाते हैं।",
          ),
        ],
        [
          t("Visitors from the city who love wildlife", "शहर से आए वन्यजीव-प्रेमी पर्यटक"),
          t(
            "They don't depend on the forest. The people who live from it, with the department, have the most at stake.",
            "वे जंगल पर निर्भर नहीं। जो इससे जीते हैं, विभाग के साथ, उनका सबसे ज़्यादा दाँव पर है।",
          ),
        ],
      ],
    });
    const row = w.body(
      t(
        "**Audit sheet, row 3: the grove.** Four stakeholders want it: the twig-gatherers, the department, the timber company, and Kabir's eco-club. Only the villagers and the department need *this* grove to last; the company has already moved on. So the people who live from it should have a real say. But how would that work? Next stop.",
        "**ऑडिट शीट, पंक्ति 3: उपवन।** चार दावेदार इसे चाहते हैं: टहनियाँ बीनने वाले, विभाग, लकड़ी कंपनी, और कबीर का इको-क्लब। केवल गाँव वालों और विभाग को *इसी* उपवन का टिकना ज़रूरी है; कंपनी तो आगे बढ़ चुकी है। इसलिए जो इससे जीते हैं उनकी सच्ची आवाज़ होनी चाहिए। पर यह होगा कैसे? अगला पड़ाव।",
      ),
      "row",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), theBoard.show(row));
    return column([w.title(t("Whose grove?", "उपवन किसका?")), grove, q, row, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Activity 16.6 and the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "depend",
      prompt: t(
        "Which stakeholder depends most on the forest for daily life?",
        "रोज़ के जीवन के लिए कौन-सा दावेदार जंगल पर सबसे ज़्यादा निर्भर है?",
      ),
      right: t("People who live in or near it", "उसमें या उसके पास रहने वाले लोग"),
      wrong: [
        [
          t("Wildlife and nature enthusiasts", "वन्यजीव और प्रकृति प्रेमी"),
          t(
            "They are in no way dependent on the forest, though they may have a big say.",
            "वे जंगल पर बिल्कुल निर्भर नहीं, हालाँकि उनकी बड़ी आवाज़ हो सकती है।",
          ),
        ],
        [
          t("Industrialists and their factories", "उद्योगपति और उनके कारख़ाने"),
          t(
            "Industries use forest produce but don't depend on any one forest.",
            "उद्योग वन-उपज इस्तेमाल करते हैं पर किसी एक जंगल पर निर्भर नहीं।",
          ),
        ],
      ],
      passes: false,
    });
    const log = w.definition(
      t(
        "**Audit log, stop 3.** ✓ Forests are biodiversity hotspots, and four stakeholders want different things from them. ✓ Keeping local people out by force fails; they can be the best protectors. ✗ How do you actually hand a forest's care to the people? Next: people who saved forests.",
        "**ऑडिट लॉग, पड़ाव 3।** ✓ जंगल जैव विविधता के हॉटस्पॉट हैं, और चार दावेदार उनसे अलग-अलग चीज़ें चाहते हैं। ✓ स्थानीय लोगों को ज़बरदस्ती बाहर रखना विफल होता है; वे सबसे अच्छे रक्षक हो सकते हैं। ✗ असल में जंगल की देखभाल लोगों को सौंपी कैसे जाए? आगे: जंगल बचाने वाले लोग।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  hotspot,
  stakeholders,
  locals,
  industry,
  bishnoi,
  himalaya,
  inLife,
  yourTurn,
];
