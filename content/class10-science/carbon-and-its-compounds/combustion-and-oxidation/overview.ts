import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { CarbonScene, Flame, Fuel, LabAction, LabDerived, LabKind } from "@chalk/prop-carbon";
import { ask, ce, ceTwo, labOn, oneByOne, sceneOn } from "../kit";

/** The blackened pan. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pan = sceneOn(
    b,
    "pan",
    CarbonScene.BlackPan,
    "Mom holding up a pan whose bottom is coated black with soot, the gas stove flame yellow and flickering behind her",
  );
  return column([
    w.title(t("A black pan", "एक काला बर्तन")),
    pan,
    w.body(
      t(
        'Last time: names describe molecules. Now the test batch of soap needs warming, but the pan Mom lends them comes off the stove **black underneath**. The flame looks yellow instead of the usual blue. Mom: "The stove needs cleaning. When the flame turns yellow, the pans turn black."',
        'पिछली बार: नाम अणुओं का वर्णन करते हैं। अब साबुन के परीक्षण बैच को गर्म करना है, पर मम्मी का दिया बर्तन चूल्हे से **नीचे से काला** होकर उतरता है। लौ हमेशा की नीली की जगह पीली दिखती है। मम्मी: "चूल्हा साफ़ करना होगा। जब लौ पीली होती है, बर्तन काले हो जाते हैं।"',
      ),
    ),
    w.body(
      t(
        "Stop 7: what is burning, chemically, and why is a flame sometimes blue and sometimes yellow and sooty?",
        "पड़ाव 7: रासायनिक रूप से जलना क्या है, और लौ कभी नीली और कभी पीली और कालिख भरी क्यों होती है?",
      ),
    ),
    space(),
  ]);
});

/** Combustion equations. */
const combustion = page(
  "combustion",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      [
        "What do carbon compounds give when they burn completely in oxygen?",
        "कार्बन यौगिक ऑक्सीजन में पूरी तरह जलने पर क्या देते हैं?",
      ],
      ["Carbon dioxide, water, heat and light", "कार्बन डाइऑक्साइड, जल, ऊष्मा और प्रकाश"],
      [
        [
          "Only soot and a little smoke",
          "केवल कालिख और थोड़ा धुआँ",
          "Soot comes from incomplete burning. Complete burning gives CO₂.",
          "कालिख अधूरे दहन से आती है। पूरा दहन CO₂ देता है।",
        ],
        [
          "Hydrogen, oxygen, and a little grey ash",
          "हाइड्रोजन, ऑक्सीजन, और थोड़ी स्लेटी राख",
          "Oxygen is used up, not given out.",
          "ऑक्सीजन ख़र्च होती है, निकलती नहीं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Combustion", "दहन")),
      w.definition(
        t(
          "**Combustion.** Carbon, in all its forms, burns in oxygen to give carbon dioxide along with **heat and light**. Most carbon compounds do the same, giving carbon dioxide and water. Burning in oxygen with heat and light is **combustion**.",
          "**दहन।** कार्बन, अपने सभी रूपों में, ऑक्सीजन में जलकर **ऊष्मा और प्रकाश** के साथ कार्बन डाइऑक्साइड देता है। अधिकांश कार्बन यौगिक भी ऐसा ही करते हैं, कार्बन डाइऑक्साइड और जल देते हुए। ऊष्मा और प्रकाश के साथ ऑक्सीजन में जलना **दहन** है।",
        ),
      ),
      w.body(t("Carbon:", "कार्बन:")),
      w.body(ce("C + O2 -> CO2")),
      w.body(t("Methane (CNG, biogas):", "मेथेन (CNG, बायोगैस):")),
      w.body(ce("CH4 + 2O2 -> CO2 + 2H2O")),
      w.body(t("Ethanol:", "एथेनॉल:")),
      w.body(ceTwo("CH3CH2OH + 3O2", "2CO2 + 3H2O")),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 4.3: clean vs sooty flames on a spatula. */
const spatula = page(
  "spatula",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.Spatula, { showEquation: false });
    b.standsFor(
      lab,
      "a spatula holding a sample (alcohol, camphor or naphthalene) burning under a metal plate; the flame is clean blue or yellow and sooty, and soot collects on the plate",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t(
        "Choose naphthalene and light it. What collects on the plate?",
        "नैफ़्थलीन चुनो और जलाओ। प्लेट पर क्या जमता है?",
      ),
      isMet: lab.derived(LabDerived.Flame).eq(Flame.Sooty),
      solve: [
        lab.learner(LabAction.SetFuel, { fuel: Fuel.Naphthalene }),
        lab.learner(LabAction.Next),
      ],
    });
    return column([
      w.title(t("Clean and sooty flames", "साफ़ और कालिख वाली लौ")),
      w.body(
        t(
          "NCERT Activity 4.3 (with a teacher). Burn a little of each on a spatula and hold a metal plate above.",
          "NCERT क्रियाकलाप 4.3 (शिक्षक के साथ)। हर एक को थोड़ा-सा स्पैचुला पर जलाओ और ऊपर एक धातु की प्लेट रखो।",
        ),
      ),
      lab,
      goal,
      w.definition(
        t(
          "**What decides the flame.** **Saturated** hydrocarbons generally give a **clean, blue flame**. **Unsaturated** ones (like naphthalene) give a **yellow flame with lots of black smoke**: the soot is unburnt carbon. Even a saturated fuel burns sooty when the **supply of air is limited**.",
          "**लौ किससे तय होती है।** **संतृप्त** हाइड्रोकार्बन सामान्यतः **साफ़, नीली लौ** देते हैं। **असंतृप्त** (जैसे नैफ़्थलीन) **बहुत काले धुएँ वाली पीली लौ** देते हैं: कालिख बिना जला कार्बन है। संतृप्त ईंधन भी **हवा की आपूर्ति कम** होने पर कालिख से जलता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 4.4: the burner's air hole. Pollutants; flames and glows; coal and petroleum. */
const burner = page(
  "burner",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.Burner, { showEquation: false });
    b.standsFor(
      lab,
      "a burner with an air hole at its base that can be opened or closed; the flame turns from blue to yellow and sooty when the hole is closed",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t("Light the burner, then close the air hole.", "बर्नर जलाओ, फिर हवा का छेद बंद करो।"),
      isMet: lab.derived(LabDerived.Flame).eq(Flame.Sooty),
      solve: [lab.learner(LabAction.Next), lab.learner(LabAction.SetAir, { isOpen: false })],
    });
    return column([
      w.title(t("Air makes the difference", "हवा से अंतर पड़ता है")),
      w.body(
        t(
          "NCERT Activity 4.4. A gas burner has an **air hole** at its base. Open, the gas mixes with plenty of air before it burns.",
          "NCERT क्रियाकलाप 4.4। गैस बर्नर के आधार पर **हवा का छेद** होता है। खुला हो तो गैस जलने से पहले भरपूर हवा से मिल जाती है।",
        ),
      ),
      lab,
      goal,
      w.body(
        t(
          "Fuels like coal and petroleum contain some nitrogen and sulphur. Burning them gives **oxides of sulphur and nitrogen**: major pollutants. A flame forms only when gases burn: wood and charcoal ignite because they give off gases. Charcoal burning with no gas left only **glows** red.",
          "कोयला और पेट्रोलियम जैसे ईंधनों में कुछ नाइट्रोजन और सल्फ़र होता है। इन्हें जलाने से **सल्फ़र और नाइट्रोजन के ऑक्साइड** बनते हैं: बड़े प्रदूषक। लौ तभी बनती है जब गैसें जलती हैं: लकड़ी और लकड़ी का कोयला गैसें छोड़ने से जलते हैं। गैस न बची हो तो जलता लकड़ी का कोयला केवल लाल **दहकता** है।",
        ),
      ),
      w.note(
        t(
          "**Coal and petroleum.** Coal formed from trees, ferns and other plants buried millions of years ago and compressed under earth and rock. Oil and gas formed from tiny sea plants and animals buried under the sea, acted on by bacteria, heat and pressure.",
          "**कोयला और पेट्रोलियम।** कोयला लाखों वर्ष पहले दबे पेड़ों, फ़र्न और दूसरे पौधों से बना, जो मिट्टी और चट्टानों के नीचे दबते गए। तेल और गैस समुद्र के नीचे दबे छोटे समुद्री पौधों और जंतुओं से बने, जिन पर जीवाणुओं, ऊष्मा और दाब ने काम किया।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 4.5: oxidation with alkaline KMnO₄. */
const oxidation = page(
  "oxidation",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.Permanganate, { showEquation: false });
    b.standsFor(
      lab,
      "warm ethanol in a test tube; purple potassium permanganate is added drop by drop; at first the purple disappears, later it stays",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t("Add drops until the purple colour stays.", "बूँदें डालते रहो जब तक बैंगनी रंग बना न रहे।"),
      isMet: lab.derived(LabDerived.ColourStays),
      solve: [
        lab.learner(LabAction.AddDrop),
        lab.learner(LabAction.AddDrop),
        lab.learner(LabAction.AddDrop),
        lab.learner(LabAction.AddDrop),
      ],
    });
    return column([
      w.title(t("Oxidation without fire", "बिना आग के ऑक्सीकरण")),
      w.body(
        t(
          "NCERT Activity 4.5. Add a 5% solution of alkaline potassium permanganate drop by drop to warm ethanol.",
          "NCERT क्रियाकलाप 4.5। गर्म एथेनॉल में क्षारीय पोटैशियम परमैंगनेट का 5% घोल बूँद-बूँद डालो।",
        ),
      ),
      lab,
      goal,
      w.definition(
        t(
          "**Oxidising agent.** At first the purple colour disappears: the permanganate is giving oxygen to the ethanol and is used up. Once all the ethanol has reacted, extra drops stay purple. A substance that can add oxygen to others is an **oxidising agent**. Alkaline potassium permanganate and acidified potassium dichromate oxidise alcohols to acids:",
          "**ऑक्सीकारक।** पहले बैंगनी रंग ग़ायब हो जाता है: परमैंगनेट एथेनॉल को ऑक्सीजन दे रहा है और ख़र्च हो रहा है। सारा एथेनॉल अभिक्रिया कर ले, तो और बूँदें बैंगनी रहती हैं। जो पदार्थ दूसरों को ऑक्सीजन दे सके वह **ऑक्सीकारक** है। क्षारीय पोटैशियम परमैंगनेट और अम्लीकृत पोटैशियम डाइक्रोमेट ऐल्कोहॉल को अम्ल में ऑक्सीकृत करते हैं:",
        ),
      ),
      w.body(
        t(
          String.raw`$$\ce{CH3CH2OH ->[alkaline KMnO4][heat] CH3COOH}$$`,
          String.raw`$$\ce{CH3CH2OH ->[\text{क्षारीय} KMnO4][\text{ऊष्मा}] CH3COOH}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the pan. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pan = sceneOn(b, "pan", CarbonScene.BlackPan, "the blackened pan again");
    const q = ask(
      b,
      "q",
      [
        "NCERT Exercise: the bottoms of vessels turn black on a gas stove whose flame is yellow. What should be done?",
        "NCERT अभ्यास: पीली लौ वाले गैस चूल्हे पर बर्तनों के तले काले हो जाते हैं। क्या करना चाहिए?",
      ],
      [
        "Clean the burner's air holes: the fuel needs more air",
        "बर्नर के हवा वाले छेद साफ़ करो: ईंधन को ज़्यादा हवा चाहिए",
      ],
      [
        [
          "Turn the gas up so the flame gets hotter",
          "गैस तेज़ करो ताकि लौ ज़्यादा गर्म हो",
          "More gas with the same air makes it burn even less completely.",
          "उसी हवा में ज़्यादा गैस, दहन और अधूरा कर देगी।",
        ],
        [
          "Use a thicker pan so the soot doesn't stick to it",
          "मोटा बर्तन लो ताकि उस पर कालिख न चिपके",
          "The pan isn't the problem: unburnt carbon from the flame is.",
          "बर्तन समस्या नहीं: लौ का बिना जला कार्बन समस्या है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "NCERT in-text Q: why is the conversion of ethanol to ethanoic acid called an oxidation?",
        "NCERT पाठ्य प्रश्न: एथेनॉल का एथेनॉइक अम्ल में बदलना ऑक्सीकरण क्यों कहलाता है?",
      ],
      ["Oxygen is added to the ethanol", "एथेनॉल में ऑक्सीजन जुड़ती है"],
      [
        [
          "Ethanol burns away in the flask",
          "फ़्लास्क में एथेनॉल जल जाता है",
          "Nothing burns here: the oxygen comes from an oxidising agent.",
          "यहाँ कुछ नहीं जलता: ऑक्सीजन ऑक्सीकारक से आती है।",
        ],
        [
          "Hydrogen is added to ethanol",
          "एथेनॉल में हाइड्रोजन जुड़ती है",
          "Adding hydrogen is reduction. Here oxygen is added.",
          "हाइड्रोजन जुड़ना अपचयन है। यहाँ ऑक्सीजन जुड़ती है।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Combustion gives CO₂, water, heat and light. ✓ Blue flame: enough air, saturated fuel. Yellow and sooty: too little air, or unsaturated fuel. ✓ Oxidising agents turn alcohols into acids. Next: adding and swapping atoms, and why oil can become ghee.",
        "**मिशन लॉग।** ✓ दहन से CO₂, जल, ऊष्मा और प्रकाश मिलते हैं। ✓ नीली लौ: पर्याप्त हवा, संतृप्त ईंधन। पीली और कालिख: कम हवा, या असंतृप्त ईंधन। ✓ ऑक्सीकारक ऐल्कोहॉल को अम्ल बनाते हैं। आगे: परमाणु जोड़ना और बदलना, और तेल घी कैसे बन सकता है।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([w.title(t("Fixing the stove", "चूल्हा ठीक करना")), pan, q, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      ["Which fuel burns with a yellow, sooty flame?", "कौन-सा ईंधन पीली, कालिख वाली लौ से जलता है?"],
      ["Naphthalene", "नैफ़्थलीन"],
      [
        ["Alcohol", "ऐल्कोहॉल", "Alcohol burns with a clean flame.", "ऐल्कोहॉल साफ़ लौ से जलता है।"],
        [
          "Methane with plenty of air",
          "भरपूर हवा के साथ मेथेन",
          "With enough air methane burns blue.",
          "पर्याप्त हवा में मेथेन नीली जलती है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Why does charcoal glow instead of burning with a flame?",
        "लकड़ी का कोयला लौ से जलने की बजाय दहकता क्यों है?",
      ],
      [
        "A flame needs gas, and charcoal gives off none",
        "लौ को गैस चाहिए, और चारकोल कोई गैस नहीं देता",
      ],
      [
        [
          "It has no carbon left in it to burn with a flame",
          "उसमें लौ के साथ जलने को कार्बन नहीं बचा",
          "Charcoal is mostly carbon.",
          "लकड़ी का कोयला ज़्यादातर कार्बन है।",
        ],
        [
          "It is too damp to catch a flame",
          "वह लौ पकड़ने के लिए बहुत नम है",
          "Dry charcoal still glows: there are no gases left to make a flame.",
          "सूखा कोयला भी दहकता है: लौ बनाने को गैसें नहीं बचीं।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      ["Which of these is an oxidising agent?", "इनमें से कौन ऑक्सीकारक है?"],
      ["Alkaline potassium permanganate", "क्षारीय पोटैशियम परमैंगनेट"],
      [
        [
          "Ethanol with a little water",
          "थोड़े पानी के साथ एथेनॉल",
          "Ethanol is what gets oxidised.",
          "एथेनॉल वह है जो ऑक्सीकृत होता है।",
        ],
        [
          "Hot water with a pinch of salt",
          "चुटकी भर नमक वाला गर्म पानी",
          "Water doesn't add oxygen to alcohols.",
          "जल ऐल्कोहॉल में ऑक्सीजन नहीं जोड़ता।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, combustion, spatula, burner, oxidation, inLife, yourTurn];
