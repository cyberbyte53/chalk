import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BurialAction,
  EnvScene,
  WasteItem,
  environmentSceneDef,
  wasteBurialDef,
} from "@chalk/prop-environment";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's burial pit (Activity 15.5). */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pit = b.prop(environmentSceneDef, "pit", { scene: EnvScene.BuryPit });
  b.standsFor(
    pit,
    "Grandpa and Kabir burying a day's household waste in a small pit in the garden",
  );
  return column([
    w.title(t("The burial pit", "दफ़नाने का गड्ढा")),
    pit,
    w.body(
      t(
        "Second half of the challenge: halve the family's garbage. \"First find out what our garbage does when we throw it away,\" says Grandpa. He digs a pit in the garden, and Kabir drops in one day's waste: peels, used tea leaves, a milk packet, old paper, a torn shirt, a medicine strip, a glass bottle, a broken slipper. They cover it with soil and keep it damp.",
        'चुनौती का दूसरा हिस्सा: परिवार का कचरा आधा करना। "पहले पता करो कि फेंकने के बाद हमारे कचरे का क्या होता है," दादाजी कहते हैं। वे बगीचे में गड्ढा खोदते हैं, और कबीर एक दिन का कचरा उसमें डालता है: छिलके, इस्तेमाल हुई चाय पत्ती, दूध की थैली, पुराना काग़ज़, फटी कमीज़, दवा की पट्टी, काँच की बोतल, टूटी चप्पल। वे इसे मिट्टी से ढकते हैं और नम रखते हैं।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 15.5: check the pit every 15 days. */
const pit = page(
  "pit",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 15.5: bury household waste under at least 15 cm of soil, keep it moist and observe at 15-day intervals: which materials change, which stay unchanged, and which change fastest.",
    );
    const dig = b.prop(wasteBurialDef, "dig", {
      items: [
        WasteItem.Peels,
        WasteItem.TeaLeaves,
        WasteItem.Paper,
        WasteItem.Cloth,
        WasteItem.MilkPacket,
        WasteItem.MedicineStrip,
        WasteItem.GlassBottle,
        WasteItem.Slipper,
      ],
      days: 0,
      showKinds: false,
    });
    b.studentOnly(dig.action(BurialAction.Wait));
    b.studentOnly(dig.action(BurialAction.Reset));
    b.standsFor(
      dig,
      "a burial pit with eight kinds of household waste; wait 15 days at a time and see what has changed",
    );
    const ask = choiceQuestion(b, {
      name: "fastest",
      prompt: t(
        "Wait 15 days at a time, up to 60. Which things changed fastest?",
        "एक बार में 15 दिन रुको, 60 तक। कौन-सी चीज़ें सबसे जल्दी बदलीं?",
      ),
      options: [
        { id: "right", label: t("Peels and tea leaves", "छिलके और चाय पत्ती") },
        {
          id: "cloth",
          label: t("Paper and the cloth", "काग़ज़ और कपड़ा"),
          feedback: t(
            "They change too, but slowly. The peels and tea leaves were gone after the first check.",
            "ये भी बदलते हैं, पर धीरे। छिलके और चाय पत्ती पहली जाँच में ही ग़ायब थे।",
          ),
        },
        {
          id: "packet",
          label: t("Milk packet and strip", "दूध की थैली और पट्टी"),
          feedback: t(
            "Look again: these haven't changed at all, even after 60 days.",
            "फिर देखो: ये 60 दिन बाद भी बिल्कुल नहीं बदले।",
          ),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Check every 15 days", "हर 15 दिन में जाँचो")), dig, ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Enzymes are specific; that's why plastics persist. */
const enzymes = page(
  "enzymes",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "coal",
      prompt: t(
        "Why would we get no energy from eating coal?",
        "कोयला खाने से हमें कोई ऊर्जा क्यों नहीं मिलेगी?",
      ),
      options: [
        {
          id: "right",
          label: t("We have no enzyme to break it down", "हमारे पास उसे तोड़ने वाला एंज़ाइम नहीं"),
        },
        {
          id: "energy",
          label: t("Coal has no energy stored in it", "कोयले में कोई ऊर्जा भरी नहीं है"),
          feedback: t(
            "Coal is full of energy: we burn it. We just can't digest it.",
            "कोयला ऊर्जा से भरा है: हम उसे जलाते हैं। बस हम उसे पचा नहीं सकते।",
          ),
        },
        {
          id: "hard",
          label: t("It is too hard for us to chew", "यह चबाने के लिए बहुत सख़्त है"),
          feedback: t(
            "Even powdered coal gives nothing. Digestion needs the right enzyme.",
            "पिसा हुआ कोयला भी कुछ नहीं देता। पाचन के लिए सही एंज़ाइम चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why some things don't rot", "कुछ चीज़ें क्यों नहीं सड़तीं")),
      w.definition(
        t(
          "**Enzymes are specific.** An **enzyme** is a substance that speeds up the breaking down of food. Each enzyme works on one particular kind of substance only. That's why we'd get no energy from eating coal: we have no enzyme for it.",
          "**एंज़ाइम विशिष्ट होते हैं।** **एंज़ाइम** ऐसा पदार्थ है जो भोजन के टूटने को तेज़ करता है। हर एंज़ाइम केवल एक ख़ास तरह के पदार्थ पर काम करता है। इसीलिए कोयला खाने से हमें कोई ऊर्जा नहीं मिलेगी: उसके लिए हमारे पास कोई एंज़ाइम नहीं।",
        ),
      ),
      w.body(
        t(
          "In the same way, bacteria and other decomposers have no enzymes for many human-made materials like plastics. Heat and pressure can act on them, but in ordinary conditions they **persist** for a long time.",
          "इसी तरह, जीवाणुओं और दूसरे अपघटकों के पास प्लास्टिक जैसी कई मानव-निर्मित चीज़ों के लिए एंज़ाइम नहीं होते। ऊष्मा और दाब उन पर असर कर सकते हैं, पर सामान्य परिस्थितियों में वे लंबे समय तक **बने रहते** हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The definitions; Activity 15.6. */
const define = page(
  "define",
  (b) => {
    const w = wordsOn(b);
    const dig = b.prop(wasteBurialDef, "dig", {
      items: [WasteItem.Leaves, WasteItem.SpoiltFood, WasteItem.Wrapper, WasteItem.Battery],
      days: 0,
      showKinds: true,
    });
    b.studentOnly(dig.action(BurialAction.Wait));
    b.studentOnly(dig.action(BurialAction.Reset));
    b.standsFor(
      dig,
      "a pit with leaves, spoilt food, a wrapper and a battery, each labelled biodegradable or not",
    );
    const ask = choiceQuestion(b, {
      name: "wrapper",
      prompt: t("Which of these is non-biodegradable?", "इनमें से कौन-सा जैव अनिम्नीकरणीय है?"),
      options: [
        { id: "right", label: t("A plastic wrapper", "प्लास्टिक का रैपर") },
        {
          id: "leaves",
          label: t("A heap of dry leaves", "सूखी पत्तियों का ढेर"),
          feedback: t(
            "Leaves are broken down by decomposers: biodegradable.",
            "पत्तियों को अपघटक तोड़ देते हैं: जैव निम्नीकरणीय।",
          ),
        },
        {
          id: "food",
          label: t("A bowl of spoilt food", "ख़राब भोजन का कटोरा"),
          feedback: t(
            "Food is broken down quickly by bacteria and fungi: biodegradable.",
            "भोजन को जीवाणु और कवक जल्दी तोड़ देते हैं: जैव निम्नीकरणीय।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two kinds of waste", "दो तरह का कचरा")),
      w.definition(
        t(
          "**Biodegradable and non-biodegradable.** Substances broken down by biological processes (by decomposers) are **biodegradable**. Substances not broken down this way are **non-biodegradable**. These may simply persist in the environment for a long time, or they may harm the members of an ecosystem.",
          "**जैव निम्नीकरणीय और जैव अनिम्नीकरणीय।** जो पदार्थ जैविक प्रक्रमों से (अपघटकों द्वारा) टूट जाते हैं, वे **जैव निम्नीकरणीय** हैं। जो इस तरह नहीं टूटते, वे **जैव अनिम्नीकरणीय** हैं। ये पर्यावरण में बस लंबे समय तक बने रह सकते हैं, या पारितंत्र के सदस्यों को नुकसान पहुँचा सकते हैं।",
        ),
      ),
      dig,
      ask,
      w.note(
        t(
          'Activity 15.6: some new plastics are sold as "biodegradable". Whether they really break down, and whether they harm the environment, is worth finding out.',
          'क्रियाकलाप 15.6: कुछ नए प्लास्टिक "जैव निम्नीकरणीय" कहकर बेचे जाते हैं। वे सच में टूटते हैं या नहीं, और पर्यावरण को नुकसान पहुँचाते हैं या नहीं, यह पता करने लायक है।',
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** How each kind affects the environment (in-text Q2, Q3). */
const effects = page(
  "effects",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "nonBio",
      prompt: t(
        "Which is a way non-biodegradable waste harms the environment?",
        "जैव अनिम्नीकरणीय कचरा पर्यावरण को किस तरह नुकसान पहुँचाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It stays for years and harms living things",
            "यह सालों रहता है और जीवों को नुकसान पहुँचाता है",
          ),
        },
        {
          id: "rot",
          label: t("It rots quickly and gives off a foul smell", "यह जल्दी सड़ता है और बदबू देता है"),
          feedback: t(
            "Rotting and smelling are what heaped-up biodegradable waste does. Non-biodegradable waste doesn't rot.",
            "सड़ना और बदबू देना ढेर लगे जैव निम्नीकरणीय कचरे का काम है। जैव अनिम्नीकरणीय कचरा सड़ता नहीं।",
          ),
        },
        {
          id: "soil",
          label: t(
            "It returns too many nutrients to the soil",
            "यह मिट्टी में बहुत ज़्यादा पोषक लौटाता है",
          ),
          feedback: t(
            "It returns nothing: decomposers can't break it down.",
            "यह कुछ नहीं लौटाता: अपघटक इसे तोड़ नहीं सकते।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What each kind does", "हर तरह का कचरा क्या करता है")),
      w.body(
        t(
          "**Biodegradable** waste is broken down and its substances go back into the soil. But piled up in heaps, it rots, smells, and breeds flies and germs until decomposers finish their work.",
          "**जैव निम्नीकरणीय** कचरा टूट जाता है और उसके पदार्थ मिट्टी में लौट जाते हैं। पर ढेर में जमा हो तो, अपघटकों के काम पूरा करने तक, यह सड़ता है, बदबू देता है, और मक्खियाँ व रोगाणु पैदा करता है।",
        ),
      ),
      w.body(
        t(
          "**Non-biodegradable** waste persists for a long time: it piles up, clogs drains, and can harm the animals and plants of an ecosystem.",
          "**जैव अनिम्नीकरणीय** कचरा लंबे समय तक बना रहता है: यह जमा होता जाता है, नालियाँ बंद करता है, और पारितंत्र के जंतुओं और पौधों को नुकसान पहुँचा सकता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Day 60: digging up the pit. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "bin",
      prompt: t(
        "On day 60 the milk packet comes out of the pit unchanged. What does that tell Kabir about his bin?",
        "60वें दिन दूध की थैली गड्ढे से बिना बदले निकलती है। इससे कबीर को अपने कूड़ेदान के बारे में क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Packets thrown away just pile up", "फेंकी गई थैलियाँ बस जमा होती जाती हैं"),
        },
        {
          id: "deeper",
          label: t("The pit should just be dug deeper", "बस गड्ढा और गहरा खोदना चाहिए"),
          feedback: t(
            "Depth doesn't help: no decomposer can break plastic down, however deep it is buried.",
            "गहराई से मदद नहीं मिलती: कितना भी गहरा दबाओ, कोई अपघटक प्लास्टिक को नहीं तोड़ सकता।",
          ),
        },
        {
          id: "water",
          label: t("The soil needs a lot more water", "मिट्टी को बहुत ज़्यादा पानी चाहिए"),
          feedback: t(
            "The pit was kept damp, and the peels rotted fine. The packet is non-biodegradable.",
            "गड्ढा नम रखा गया था, और छिलके ठीक से सड़े। थैली जैव अनिम्नीकरणीय है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const then = w.body(
      t(
        "Half of what the family throws away would be gone in weeks if it went to a compost pit. The other half will still be there when Kabir is Grandpa's age. That's the half to cut.",
        "परिवार जो फेंकता है उसका आधा, अगर खाद के गड्ढे में जाए, तो हफ़्तों में ख़त्म हो जाएगा। बाकी आधा तब भी वहीं होगा जब कबीर दादाजी की उम्र का होगा। यही आधा कम करना है।",
      ),
      "then",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(then), theBoard.pass()]);
    return column([w.title(t("Digging it up", "गड्ढा खोदना")), ask, then, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 1 (as a non-biodegradable spotter); the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ex1",
      prompt: t(
        "Exercise 1: which group has an item that is NOT biodegradable?",
        "अभ्यास 1: किस समूह में ऐसी चीज़ है जो जैव निम्नीकरणीय नहीं है?",
      ),
      options: [
        { id: "right", label: t("Grass, wood and plastic", "घास, लकड़ी और प्लास्टिक") },
        {
          id: "peels",
          label: t("Fruit peels, cake and lime juice", "फलों के छिलके, केक और नींबू रस"),
          feedback: t(
            "All three are from living things and break down. Plastic is the odd one out elsewhere.",
            "तीनों जीवों से बने हैं और टूट जाते हैं। प्लास्टिक कहीं और है।",
          ),
        },
        {
          id: "cake",
          label: t("Cake, wood and grass", "केक, लकड़ी और घास"),
          feedback: t(
            "Wood decays slowly, but decomposers do break it down. All three are biodegradable.",
            "लकड़ी धीरे सड़ती है, पर अपघटक उसे तोड़ देते हैं। तीनों जैव निम्नीकरणीय हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log, day 20.** ✓ Biodegradable waste is broken down by decomposers; non-biodegradable waste stays. ✓ The jar is still clear. ✗ The bin is still full. Next: changing how the family throws things away.",
        "**मिशन लॉग, दिन 20।** ✓ जैव निम्नीकरणीय कचरे को अपघटक तोड़ देते हैं; जैव अनिम्नीकरणीय कचरा बना रहता है। ✓ जार अब भी साफ़ है। ✗ कूड़ेदान अब भी भरा है। आगे: परिवार के चीज़ें फेंकने का तरीक़ा बदलना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, pit, enzymes, define, effects, inLife, yourTurn];
