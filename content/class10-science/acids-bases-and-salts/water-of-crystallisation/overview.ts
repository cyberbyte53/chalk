import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AcidBenchAction,
  AcidBenchDerived,
  AcidBenchKind,
  AcidSceneKind,
} from "@chalk/prop-chemistry";
import { benchOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The handprint keepsake, and the puzzle of 10H₂O. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const hand = sceneOn(
    b,
    "hand",
    AcidSceneKind.Handprint,
    "Kabir pressing his hand into a tray of wet white plaster while Riya holds the bag of plaster of Paris powder",
  );
  return column([
    w.title(t("A hand set in stone", "पत्थर में जमा हाथ")),
    hand,
    w.body(
      t(
        'The last act: a keepsake. Riya mixes a white powder from the hardware shop, **plaster of Paris**, with water. Kabir presses his hand into it, and in a few minutes it sets hard as stone. Meanwhile Kabir has a question from last lesson: "Washing soda has 10H₂O in it. So is it wet?"',
        'आख़िरी करतब: एक यादगार। रिया हार्डवेयर की दुकान से लाया एक सफ़ेद चूर्ण, **प्लास्टर ऑफ़ पेरिस**, पानी में मिलाती है। कबीर उसमें अपना हाथ दबाता है, और कुछ ही मिनटों में वह पत्थर जैसा सख़्त हो जाता है। इस बीच कबीर के पास पिछले पाठ का एक सवाल है: "धावन सोडे में 10H₂O है। तो क्या वह गीला है?"',
      ),
    ),
    w.body(
      t(
        "Stop 9, the last: are salt crystals really dry, and how does plaster set?",
        "पड़ाव 9, आख़िरी: क्या लवण के क्रिस्टल सचमुच सूखे होते हैं, और प्लास्टर कैसे जमता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 2.15: blue copper sulphate heated, then re-wetted. */
const crystals = page(
  "crystals",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.CopperSulphateHeat);
    b.standsFor(
      bench,
      "blue copper sulphate crystals heated in a dry boiling tube turn white, with water droplets on the cooler glass; a few drops of water turn them blue again",
    );
    const goal = goalQuestion(b, {
      about: bench,
      prompt: t(
        "Heat the crystals, then add a few drops of water.",
        "क्रिस्टलों को गर्म करो, फिर पानी की कुछ बूँदें डालो।",
      ),
      isMet: bench.derived(AcidBenchDerived.IsDone),
      solve: [bench.learner(AcidBenchAction.Next), bench.learner(AcidBenchAction.Next)],
    });
    return column([
      w.title(t("Are crystals really dry?", "क्या क्रिस्टल सचमुच सूखे हैं?")),
      w.body(
        t(
          "NCERT Activity 2.15: heat a few crystals of copper sulphate in a dry boiling tube, then add 2–3 drops of water.",
          "NCERT क्रियाकलाप 2.15: कॉपर सल्फ़ेट के कुछ क्रिस्टल एक सूखी क्वथन नली में गर्म करो, फिर पानी की 2–3 बूँदें डालो।",
        ),
      ),
      bench,
      goal,
      w.body(
        t(
          "The crystals looked dry, yet water droplets appeared on the glass and the blue turned white. The water was **inside** the crystals. Wet them again and the blue comes back.",
          "क्रिस्टल सूखे दिखते थे, फिर भी काँच पर पानी की बूँदें आईं और नीला रंग सफ़ेद हो गया। पानी क्रिस्टलों के **अंदर** था। उन्हें फिर गीला करो तो नीला रंग लौट आता है।",
        ),
      ),
      w.definition(
        t(
          "**Water of crystallisation.** The fixed number of water molecules present in one formula unit of a salt is its **water of crystallisation**. Copper sulphate has five: CuSO₄·5H₂O. The dot means the water is part of the crystal, not wetness on it.",
          "**क्रिस्टलन का जल।** किसी लवण की एक सूत्र इकाई में मौजूद जल के अणुओं की निश्चित संख्या उसका **क्रिस्टलन का जल** है। कॉपर सल्फ़ेट में पाँच हैं: CuSO₄·5H₂O। बिंदु का अर्थ है कि पानी क्रिस्टल का हिस्सा है, उस पर का गीलापन नहीं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Gypsum and plaster of Paris; the half water molecule. */
const plaster = page(
  "plaster",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.GypsumHeat);
    b.standsFor(
      bench,
      "gypsum heated at 373 K becomes white plaster of Paris powder; mixed with water it sets back into hard gypsum",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "How can a formula have half a water molecule, CaSO₄·½H₂O?",
        "किसी सूत्र में आधा जल अणु, CaSO₄·½H₂O, कैसे हो सकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Two formula units of CaSO₄ share one water molecule",
            "CaSO₄ की दो सूत्र इकाइयाँ एक जल अणु साझा करती हैं",
          ),
        },
        {
          id: "split",
          label: t("Heating splits water molecules in half", "गर्म करने से जल अणु आधे में टूट जाते हैं"),
          feedback: t(
            "A water molecule can't be split in half. It's shared: one H₂O for every two CaSO₄.",
            "जल अणु आधे में नहीं टूट सकता। यह साझा है: हर दो CaSO₄ पर एक H₂O।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Gypsum and plaster of Paris", "जिप्सम और प्लास्टर ऑफ़ पेरिस")),
      w.body(
        t(
          "Another salt with water of crystallisation is **gypsum**, CaSO₄·2H₂O. Heated at **373 K**, it loses some of its water and becomes calcium sulphate hemihydrate: **plaster of Paris**.",
          "क्रिस्टलन का जल रखने वाला एक और लवण **जिप्सम**, CaSO₄·2H₂O, है। **373 K** पर गर्म करने पर यह अपना कुछ पानी खो देता है और कैल्सियम सल्फ़ेट हेमीहाइड्रेट बन जाता है: **प्लास्टर ऑफ़ पेरिस**।",
        ),
      ),
      bench,
      w.body(
        t(
          "Mixed with water, plaster of Paris turns back into gypsum, a hard solid mass:",
          "पानी में मिलाने पर प्लास्टर ऑफ़ पेरिस फिर जिप्सम बन जाता है, एक कठोर ठोस पिंड:",
        ),
      ),
      w.body(
        t(
          r`$$\ce{CaSO4.\frac{1}{2}H2O + 1\frac{1}{2}H2O -> CaSO4.2H2O}$$`,
          r`$$\ce{CaSO4.\frac{1}{2}H2O + 1\frac{1}{2}H2O -> CaSO4.2H2O}$$`,
        ),
      ),
      w.body(
        t(
          "Doctors use it to hold broken bones in place. It is also used for toys, decorations, and to make surfaces smooth.",
          "डॉक्टर इसे टूटी हड्डियों को सही जगह पर टिकाने में इस्तेमाल करते हैं। यह खिलौनों, सजावट के सामान, और सतहों को चिकना करने में भी काम आता है।",
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

/** The handprint and the leftover powder (Exercise 13). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "NCERT Exercise 13. Riya has half a bag of plaster of Paris left. Why must it go in a moisture-proof container?",
        "NCERT अभ्यास 13। रिया के पास आधा थैला प्लास्टर ऑफ़ पेरिस बचा है। इसे नमी-रोधी डिब्बे में क्यों रखना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Moisture from the air would slowly turn it back into hard gypsum",
            "हवा की नमी इसे धीरे-धीरे फिर से कठोर जिप्सम बना देगी",
          ),
        },
        {
          id: "colour",
          label: t("Moisture turns it blue", "नमी इसे नीला कर देती है"),
          feedback: t(
            "That's copper sulphate. Plaster of Paris just sets hard with water.",
            "वह कॉपर सल्फ़ेट है। प्लास्टर ऑफ़ पेरिस पानी से बस सख़्त जम जाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        "And Kabir's question: washing soda isn't wet. Its 10H₂O is water of crystallisation, locked inside each crystal. The handprint sets because the powder takes water back into its crystals and becomes gypsum again.",
        "और कबीर का सवाल: धावन सोडा गीला नहीं है। उसका 10H₂O क्रिस्टलन का जल है, हर क्रिस्टल के अंदर बंद। हाथ की छाप इसलिए जमती है क्योंकि चूर्ण पानी को वापस अपने क्रिस्टलों में ले लेता है और फिर जिप्सम बन जाता है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.pass()]);
    return column([w.title(t("The keepsake", "यादगार")), ask, why, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q5; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Which equation shows plaster of Paris reacting with water?",
        "कौन-सा समीकरण प्लास्टर ऑफ़ पेरिस की पानी से अभिक्रिया दिखाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            r`$\ce{CaSO4.\frac{1}{2}H2O + 1\frac{1}{2}H2O -> CaSO4.2H2O}$`,
            r`$\ce{CaSO4.\frac{1}{2}H2O + 1\frac{1}{2}H2O -> CaSO4.2H2O}$`,
          ),
        },
        {
          id: "cuso4",
          label: t(r`$\ce{CuSO4 + 5H2O -> CuSO4.5H2O}$`, r`$\ce{CuSO4 + 5H2O -> CuSO4.5H2O}$`),
          feedback: t(
            "That's copper sulphate taking its water back. Plaster of Paris is calcium sulphate.",
            "वह कॉपर सल्फ़ेट का पानी वापस लेना है। प्लास्टर ऑफ़ पेरिस कैल्सियम सल्फ़ेट है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "How many molecules of water of crystallisation are in one formula unit of washing soda?",
        "धावन सोडे की एक सूत्र इकाई में क्रिस्टलन के जल के कितने अणु हैं?",
      ),
      options: [
        { id: "right", label: t("10", "10") },
        {
          id: "5",
          label: t("5", "5"),
          feedback: t(
            "Five is copper sulphate. Washing soda is Na₂CO₃·10H₂O.",
            "पाँच कॉपर सल्फ़ेट में हैं। धावन सोडा Na₂CO₃·10H₂O है।",
          ),
        },
        {
          id: "2",
          label: t("2", "2"),
          feedback: t(
            "Two is gypsum. Washing soda is Na₂CO₃·10H₂O.",
            "दो जिप्सम में हैं। धावन सोडा Na₂CO₃·10H₂O है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Salt crystals hold a fixed number of water molecules: water of crystallisation. ✓ CuSO₄·5H₂O is blue; heated, it turns white. ✓ Gypsum, CaSO₄·2H₂O, heated at 373 K gives plaster of Paris, CaSO₄·½H₂O, which sets back to gypsum with water. ✓ Act 5, the handprint: ready.",
        "**मिशन लॉग।** ✓ लवण के क्रिस्टल जल के अणुओं की एक निश्चित संख्या रखते हैं: क्रिस्टलन का जल। ✓ CuSO₄·5H₂O नीला है; गर्म करने पर सफ़ेद हो जाता है। ✓ जिप्सम, CaSO₄·2H₂O, 373 K पर गर्म करने से प्लास्टर ऑफ़ पेरिस, CaSO₄·½H₂O, देता है, जो पानी से फिर जिप्सम बन जाता है। ✓ करतब 5, हाथ की छाप: तैयार।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The finale: party night, every act explained. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const night = sceneOn(
    b,
    "night",
    AcidSceneKind.PartyNight,
    "the birthday party at night: guests watching Riya's magic show, colour-changing potions, a foaming volcano, a spray putting out candles, and Kabir proudly holding his plaster handprint",
  );
  return column([
    w.title(t("Party night", "पार्टी की रात")),
    night,
    w.body(
      t(
        'The guests gasp at every act, and when Kabir\'s friends shout "magic!", Riya explains each one.',
        'हर करतब पर मेहमान हैरान होते हैं, और जब कबीर के दोस्त "जादू!" चिल्लाते हैं, तो रिया हर एक समझाती है।',
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) **Potions**: red cabbage is an indicator, pink in acid, green in base. (2) **Volcano**: acid + hydrogencarbonate gives carbon dioxide. (3) **Grandpa's acidity**: neutralisation by a base. (4) **No acid without water**: H⁺ ions form only in water. (5) **Rainbow**: the pH scale. (6) **Sting and teeth**: pH in living things. (7) **Two white powders**: salts take the nature of their stronger parent. (8) **Extinguisher**: baking soda, made from common salt. (9) **Handprint**: plaster of Paris taking back its water of crystallisation.",
        "**मिशन पूरा।** (1) **घोल**: लाल पत्तागोभी एक सूचक है, अम्ल में गुलाबी, क्षारक में हरा। (2) **ज्वालामुखी**: अम्ल + हाइड्रोजनकार्बोनेट कार्बन डाइऑक्साइड देता है। (3) **दादाजी की एसिडिटी**: क्षारक से उदासीनीकरण। (4) **पानी के बिना अम्ल नहीं**: H⁺ आयन केवल पानी में बनते हैं। (5) **इंद्रधनुष**: pH स्केल। (6) **डंक और दाँत**: सजीवों में pH। (7) **दो सफ़ेद चूर्ण**: लवण अपने प्रबल जनक की प्रकृति लेते हैं। (8) **अग्निशामक**: साधारण नमक से बना खाने का सोडा। (9) **हाथ की छाप**: प्लास्टर ऑफ़ पेरिस का अपना क्रिस्टलन का जल वापस लेना।",
      ),
    ),
    w.body(
      t(
        'Grandpa claps loudest. "No magic," he says. "Just acids, bases and salts."',
        'दादाजी सबसे ज़ोर से ताली बजाते हैं। "कोई जादू नहीं," वे कहते हैं। "बस अम्ल, क्षारक और लवण।"',
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, crystals, plaster, inLife, yourTurn, finale];
