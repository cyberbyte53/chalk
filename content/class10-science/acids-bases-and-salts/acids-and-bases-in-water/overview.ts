import { type BoardKit, PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AcidBenchKind,
  AcidSceneKind,
  ConductAction,
  type ConductSolution,
  SubstanceId,
  conductivityTesterDef,
} from "@chalk/prop-chemistry";
import { benchOn, sceneOn } from "../kit";

const r = String.raw;

/** A conductivity tester the learner can switch and refill. */
function tester(b: BoardKit, name: string, solutions: ConductSolution[], showIons: boolean) {
  const first = solutions[0] ?? SubstanceId.HydrochloricAcid;
  const prop = b.prop(conductivityTesterDef, name, {
    solution: first,
    solutions,
    isOn: false,
    showIons,
    canChoose: true,
    canSwitch: true,
  });
  b.studentOnly(prop.action(ConductAction.Choose));
  b.studentOnly(prop.action(ConductAction.Switch));
  return prop;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir's dry potion: litmus does nothing on dry citric acid crystals. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const potions = sceneOn(
    b,
    "potions",
    AcidSceneKind.MagicPotions,
    "glasses of red-cabbage potion on the table; Kabir holds a dry litmus strip against a heap of dry citric acid crystals",
  );
  return column([
    w.title(t("A trick that fails", "एक करतब जो नहीं चला")),
    potions,
    w.body(
      t(
        "Kabir wants his own trick. He presses a dry strip of blue litmus onto a heap of dry **citric acid** crystals, the sour powder Mom uses in cooking. Nothing happens. He adds one drop of water, and the strip turns red at once.",
        "कबीर अपना एक करतब चाहता है। वह नीले लिटमस की सूखी पट्टी सूखे **साइट्रिक अम्ल** के क्रिस्टलों के ढेर पर दबाता है, वह खट्टा चूर्ण जो मम्मी खाने में डालती हैं। कुछ नहीं होता। वह पानी की एक बूँद डालता है, और पट्टी तुरंत लाल हो जाती है।",
      ),
    ),
    w.body(
      t(
        "Stop 4: what do all acids have in common, and why do they need water to show it?",
        "पड़ाव 4: सभी अम्लों में साझा क्या है, और उसे दिखाने के लिए उन्हें पानी क्यों चाहिए?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 2.8: acids conduct; glucose and alcohol don't. Ions. */
const conduct = page(
  "conduct",
  (b) => {
    const w = wordsOn(b);
    const lab = tester(
      b,
      "lab",
      [
        SubstanceId.HydrochloricAcid,
        SubstanceId.SulphuricAcid,
        SubstanceId.GlucoseSolution,
        SubstanceId.Alcohol,
      ],
      true,
    );
    b.standsFor(
      lab,
      "two nails in a cork dipped in a beaker of solution, wired to a 6 V battery, a bulb and a switch; a close-up shows the particles in the solution",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Switch on with each solution. Which ones light the bulb?",
        "हर घोल के साथ स्विच चालू करो। कौन-से बल्ब जलाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Only the two acids, not glucose or alcohol",
            "केवल दोनों अम्ल, ग्लूकोज़ या ऐल्कोहॉल नहीं",
          ),
        },
        {
          id: "all",
          label: t("All four: they all contain hydrogen", "चारों: सबमें हाइड्रोजन है"),
          feedback: t(
            "Glucose and alcohol do contain hydrogen, but the bulb stays dark. Containing hydrogen isn't enough.",
            "ग्लूकोज़ और ऐल्कोहॉल में हाइड्रोजन है, पर बल्ब बुझा रहता है। हाइड्रोजन होना काफ़ी नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Do all hydrogen compounds act as acids?", "क्या हाइड्रोजन वाले सब यौगिक अम्ल हैं?")),
      w.body(
        t(
          "Every acid gave hydrogen gas with a metal, so hydrogen seems to be what acids share. But glucose and alcohol contain hydrogen too. NCERT Activity 2.8 tests them all.",
          "हर अम्ल ने धातु के साथ हाइड्रोजन गैस दी, तो लगता है हाइड्रोजन ही अम्लों में साझा है। पर ग्लूकोज़ और ऐल्कोहॉल में भी हाइड्रोजन है। NCERT क्रियाकलाप 2.8 सबको जाँचता है।",
        ),
      ),
      lab,
      ask,
      w.definition(
        t(
          "**Ion.** An **ion** is an atom or group of atoms carrying an electric charge: positive (a **cation**, like H⁺ or Na⁺) or negative (an **anion**, like Cl⁻). In a solution, moving ions carry the electric current. A glowing bulb means the solution has ions.",
          "**आयन।** **आयन** विद्युत आवेश वाला परमाणु या परमाणुओं का समूह है: धनात्मक (**धनायन**, जैसे H⁺ या Na⁺) या ऋणात्मक (**ऋणायन**, जैसे Cl⁻)। घोल में चलते आयन विद्युत धारा ले जाते हैं। जलता बल्ब बताता है कि घोल में आयन हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Every acid has the same cation, H⁺. */
const hions = page(
  "h-ions",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Which ion do all acids give in water?", "सभी अम्ल जल में कौन-सा आयन देते हैं?"),
      options: [
        { id: "right", label: t("H⁺, the hydrogen ion", "H⁺, हाइड्रोजन आयन") },
        {
          id: "cl",
          label: t("Cl⁻, the chloride ion", "Cl⁻, क्लोराइड आयन"),
          feedback: t(
            "Only hydrochloric acid gives Cl⁻. Sulphuric acid gives sulphate instead.",
            "केवल हाइड्रोक्लोरिक अम्ल Cl⁻ देता है। सल्फ़्यूरिक अम्ल सल्फ़ेट देता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What every acid shares", "हर अम्ल में साझा क्या है")),
      w.body(
        t(
          "Each acid has a different anion, but the same cation:",
          "हर अम्ल का ऋणायन अलग है, पर धनायन एक ही:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}\ce{HCl} &\to \ce{H+} \text{ and } \ce{Cl-}\\ \ce{HNO3} &\to \ce{H+} \text{ and } \ce{NO3-}\\ \ce{H2SO4} &\to \ce{H+} \text{ and } \ce{SO4^2-}\\ \ce{CH3COOH} &\to \ce{H+} \text{ and } \ce{CH3COO-}\end{aligned}$$`,
          r`$$\begin{aligned}\ce{HCl} &\to \ce{H+} \text{ और } \ce{Cl-}\\ \ce{HNO3} &\to \ce{H+} \text{ और } \ce{NO3-}\\ \ce{H2SO4} &\to \ce{H+} \text{ और } \ce{SO4^2-}\\ \ce{CH3COOH} &\to \ce{H+} \text{ और } \ce{CH3COO-}\end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "So acids produce **hydrogen ions, H⁺(aq)**, in solution, and these are what make them acidic. Glucose and alcohol hold on to their hydrogen: no ions, no current, not acids.",
          "तो अम्ल घोल में **हाइड्रोजन आयन, H⁺(aq)**, बनाते हैं, और यही उन्हें अम्लीय बनाते हैं। ग्लूकोज़ और ऐल्कोहॉल अपना हाइड्रोजन पकड़े रहते हैं: न आयन, न धारा, न अम्ल।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2.9: dry and wet HCl gas; hydronium. */
const dryWet = page(
  "dry-wet",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.DryWetHcl);
    b.standsFor(
      bench,
      "hydrogen chloride gas from salt and concentrated sulphuric acid, tested first with dry blue litmus (no change) then with wet blue litmus (turns red)",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why does dry HCl gas not change dry blue litmus?",
        "सूखी HCl गैस सूखे नीले लिटमस को क्यों नहीं बदलती?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Without water, HCl does not split into H⁺ ions",
            "पानी के बिना HCl, H⁺ आयनों में नहीं टूटता",
          ),
        },
        {
          id: "weak",
          label: t("HCl gas is too weak", "HCl गैस बहुत कमज़ोर है"),
          feedback: t(
            "The same gas turns wet litmus red at once. What's missing is water.",
            "वही गैस गीले लिटमस को तुरंत लाल कर देती है। कमी पानी की है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Acids need water", "अम्लों को पानी चाहिए")),
      w.body(
        t(
          "NCERT Activity 2.9 (with a teacher): hydrogen chloride gas is made from salt and concentrated sulphuric acid, and tested with dry, then wet, blue litmus.",
          "NCERT क्रियाकलाप 2.9 (शिक्षक के साथ): नमक और सांद्र सल्फ़्यूरिक अम्ल से हाइड्रोजन क्लोराइड गैस बनाई जाती है, और पहले सूखे, फिर गीले नीले लिटमस से जाँची जाती है।",
        ),
      ),
      bench,
      w.body(
        t(
          "Only the wet paper turns red. The H⁺ ion cannot separate from HCl without water. And once it does, it doesn't stay alone: it joins a water molecule.",
          "केवल गीला पत्र लाल होता है। पानी के बिना H⁺ आयन HCl से अलग नहीं हो सकता। और अलग होते ही यह अकेला नहीं रहता: यह पानी के एक अणु से जुड़ जाता है।",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}&\ce{HCl + H2O -> H3O+ + Cl-}\\&\ce{H+ + H2O -> H3O+}\end{aligned}$$`,
          r`$$\begin{aligned}&\ce{HCl + H2O -> H3O+ + Cl-}\\&\ce{H+ + H2O -> H3O+}\end{aligned}$$`,
        ),
      ),
      w.definition(
        t(
          "**Hydronium ion.** H⁺ joined to a water molecule is the **hydronium ion**, H₃O⁺. So the hydrogen ion of an acid is always written H⁺(aq) or H₃O⁺.",
          "**हाइड्रोनियम आयन।** पानी के अणु से जुड़ा H⁺ **हाइड्रोनियम आयन**, H₃O⁺, है। इसलिए अम्ल का हाइड्रोजन आयन हमेशा H⁺(aq) या H₃O⁺ लिखा जाता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Bases give OH⁻; alkalis. */
const bases = page(
  "bases",
  (b) => {
    const w = wordsOn(b);
    const lab = tester(
      b,
      "lab",
      [SubstanceId.SodiumHydroxide, SubstanceId.CalciumHydroxide, SubstanceId.SugarSolution],
      true,
    );
    b.standsFor(
      lab,
      "the same circuit with sodium hydroxide, calcium hydroxide and sugar solutions to choose from; the close-up shows Na⁺ and OH⁻ ions in the alkali",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Which of these is an alkali?", "इनमें से कौन-सा क्षार है?"),
      options: [
        {
          id: "right",
          label: t(
            "Sodium hydroxide: a base that dissolves in water",
            "सोडियम हाइड्रॉक्साइड: एक क्षारक जो जल में घुलता है",
          ),
        },
        {
          id: "sugar",
          label: t("Sugar", "चीनी"),
          feedback: t(
            "Sugar dissolves, but it isn't a base: it gives no OH⁻ ions and doesn't conduct.",
            "चीनी घुलती है, पर क्षारक नहीं है: यह OH⁻ आयन नहीं देती और धारा नहीं बहाती।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What every base shares", "हर क्षारक में साझा क्या है")),
      w.body(
        t(
          "Dissolve a base in water and it gives **hydroxide ions, OH⁻**:",
          "क्षारक को जल में घोलो तो वह **हाइड्रॉक्साइड आयन, OH⁻** देता है:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}\ce{NaOH(s)} &\xrightarrow{\ce{H2O}} \ce{Na+(aq) + OH-(aq)}\\ \ce{KOH(s)} &\xrightarrow{\ce{H2O}} \ce{K+(aq) + OH-(aq)}\\ \ce{Mg(OH)2(s)} &\xrightarrow{\ce{H2O}} \ce{Mg^2+(aq) + 2OH-(aq)}\end{aligned}$$`,
          r`$$\begin{aligned}\ce{NaOH(s)} &\xrightarrow{\ce{H2O}} \ce{Na+(aq) + OH-(aq)}\\ \ce{KOH(s)} &\xrightarrow{\ce{H2O}} \ce{K+(aq) + OH-(aq)}\\ \ce{Mg(OH)2(s)} &\xrightarrow{\ce{H2O}} \ce{Mg^2+(aq) + 2OH-(aq)}\end{aligned}$$`,
        ),
      ),
      w.definition(
        t(
          "**Alkali.** Not every base dissolves in water. A base that **does dissolve in water** is an **alkali**. Alkalis feel soapy, taste bitter and are corrosive: never taste or touch them.",
          "**क्षार।** हर क्षारक जल में नहीं घुलता। जो क्षारक **जल में घुल जाता है** वह **क्षार** है। क्षार साबुन जैसे चिकने, कड़वे और संक्षारक होते हैं: इन्हें कभी चखो या छुओ मत।",
        ),
      ),
      lab,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Neutralisation as H⁺ + OH⁻ → H₂O; dilution. */
const together = page(
  "together",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "In every neutralisation, which two ions join, and what do they make?",
        "हर उदासीनीकरण में कौन-से दो आयन जुड़ते हैं, और क्या बनाते हैं?",
      ),
      options: [
        { id: "right", label: t("H⁺ and OH⁻, making water", "H⁺ और OH⁻, जल बनाते हुए") },
        {
          id: "nacl",
          label: t("Na⁺ and Cl⁻, making salt", "Na⁺ और Cl⁻, नमक बनाते हुए"),
          feedback: t(
            "Na⁺ and Cl⁻ just stay in the water. The two that actually join are H⁺ and OH⁻.",
            "Na⁺ और Cl⁻ बस पानी में बने रहते हैं। जो सचमुच जुड़ते हैं वे H⁺ और OH⁻ हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Neutralisation, seen as ions", "आयनों के रूप में उदासीनीकरण")),
      w.body(
        t(
          "Acids give H⁺(aq) and bases give OH⁻(aq). Write an acid as HX and a base as MOH, where X and M stand for any anion and cation:",
          "अम्ल H⁺(aq) देते हैं और क्षारक OH⁻(aq)। अम्ल को HX और क्षारक को MOH लिखो, जहाँ X और M कोई भी ऋणायन और धनायन हैं:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}\text{Acid} + \text{Base} &\rightarrow \text{Salt} + \text{Water}\\ \ce{HX + MOH} &\rightarrow \ce{MX + HOH}\end{aligned}$$`,
          r`$$\begin{aligned}\text{अम्ल} + \text{क्षारक} &\rightarrow \text{लवण} + \text{जल}\\ \ce{HX + MOH} &\rightarrow \ce{MX + HOH}\end{aligned}$$`,
        ),
      ),
      w.body(t("The heart of every neutralisation is the same:", "हर उदासीनीकरण का मूल एक ही है:")),
      w.body(t(r`$$\ce{H+(aq) + OH-(aq) -> H2O(l)}$$`, r`$$\ce{H+(aq) + OH-(aq) -> H2O(l)}$$`)),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's dry trick explained; distilled water vs rain water (Exercise 7). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const lab = tester(b, "lab", [SubstanceId.DistilledWater, SubstanceId.RainWater], true);
    b.standsFor(
      lab,
      "the circuit with distilled water and with rain water: the bulb glows dimly only for rain water",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "So why did the dry citric acid do nothing to the dry litmus?",
        "तो सूखे साइट्रिक अम्ल ने सूखे लिटमस पर कुछ क्यों नहीं किया?",
      ),
      options: [
        {
          id: "right",
          label: t("With no water, the acid gives no H⁺ ions", "पानी के बिना अम्ल H⁺ आयन नहीं देता"),
        },
        {
          id: "old",
          label: t("The litmus was old", "लिटमस पुराना था"),
          feedback: t(
            "One drop of water and the same strip turned red. The strip was fine.",
            "पानी की एक बूँद और वही पट्टी लाल हो गई। पट्टी ठीक थी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const rain = choiceQuestion(b, {
      name: "rain",
      prompt: t(
        "NCERT Exercise 7. Try both waters. Why does rain water conduct but distilled water does not?",
        "NCERT अभ्यास 7। दोनों पानी आज़माओ। वर्षा का जल धारा क्यों बहाता है पर आसुत जल नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Rain water has dissolved gases and salts that give ions; distilled water has none",
            "वर्षा के जल में घुली गैसें और लवण आयन देते हैं; आसुत जल में ये नहीं हैं",
          ),
        },
        {
          id: "cold",
          label: t("Rain water is colder", "वर्षा का जल ठंडा होता है"),
          feedback: t(
            "Temperature isn't it. A current needs ions, and pure water has almost none.",
            "ताप कारण नहीं है। धारा के लिए आयन चाहिए, और शुद्ध जल में लगभग नहीं होते।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(rain));
    b.when(rain.on(QuestionSignal.Correct), theBoard.pass());
    return column([
      w.title(t("Kabir's trick, explained", "कबीर का करतब, समझाया गया")),
      ask,
      lab,
      rain,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text questions; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Why does an aqueous solution of an acid conduct electricity?",
        "अम्ल का जलीय विलयन विद्युत क्यों चालित करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It contains ions (H⁺ and an anion) that carry the current",
            "इसमें आयन (H⁺ और एक ऋणायन) होते हैं जो धारा ले जाते हैं",
          ),
        },
        {
          id: "metal",
          label: t("Acids contain metal", "अम्लों में धातु होती है"),
          feedback: t(
            "Acids like HCl contain no metal. The current is carried by ions.",
            "HCl जैसे अम्लों में कोई धातु नहीं। धारा आयन ले जाते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "NCERT Exercise 8. Why don't acids behave as acids without water?",
        "NCERT अभ्यास 8। पानी के बिना अम्ल अम्ल जैसा व्यवहार क्यों नहीं करते?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "H⁺ ions separate from the acid only in water",
            "H⁺ आयन अम्ल से केवल पानी में अलग होते हैं",
          ),
        },
        {
          id: "solid",
          label: t("Acids are solids without water", "पानी के बिना अम्ल ठोस होते हैं"),
          feedback: t(
            "HCl is a gas, and dry HCl gas still doesn't act as an acid. It's about ions, not state.",
            "HCl एक गैस है, और सूखी HCl गैस फिर भी अम्ल का काम नहीं करती। बात आयनों की है, अवस्था की नहीं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Acids give H⁺(aq) (as H₃O⁺) in water; bases give OH⁻(aq). ✓ An alkali is a base that dissolves in water. ✓ Neutralisation: H⁺ + OH⁻ → H₂O. ✓ Kabir's trick works now: one drop of water. Next: how strong is an acid?",
        "**मिशन लॉग।** ✓ अम्ल जल में H⁺(aq) (H₃O⁺ के रूप में) देते हैं; क्षारक OH⁻(aq) देते हैं। ✓ क्षार वह क्षारक है जो जल में घुलता है। ✓ उदासीनीकरण: H⁺ + OH⁻ → H₂O। ✓ कबीर का करतब अब चलता है: पानी की एक बूँद। आगे: अम्ल कितना प्रबल है?",
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

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, conduct, hions, dryWet, bases, together, inLife, yourTurn];
