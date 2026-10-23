import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CarbonScene, SoapAction, SoapDerived, SoapMode, Water } from "@chalk/prop-carbon";
import { ask, oneByOne, sceneOn, soapOn } from "../kit";

/** The hand-pump test. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pump = sceneOn(
    b,
    "pump",
    CarbonScene.HandPump,
    "Riya washing her hands with their new soap at Grandpa's village hand pump; the water is cloudy with white flakes and there is hardly any lather",
  );
  return column([
    w.title(t("Grandpa's warning comes true", "दादाजी की चेतावनी सच हुई")),
    pump,
    w.body(
      t(
        "Last time: oil boiled with sodium hydroxide becomes soap. The first bars are ready, and they smell of fruit. At home they lather beautifully. Then Riya tries one at Grandpa's village hand pump: **hardly any lather**, and a white, curdy scum floats on the water. Grandpa just smiles.",
        "पिछली बार: सोडियम हाइड्रॉक्साइड के साथ उबाला तेल साबुन बनता है। पहली टिकियाँ तैयार हैं, और उनसे फलों की खुशबू आती है। घर पर उनमें बढ़िया झाग बनता है। फिर रिया दादाजी के गाँव के हैंडपंप पर एक आज़माती है: **बहुत कम झाग**, और पानी पर सफ़ेद, दही जैसा मैल तैरता है। दादाजी बस मुस्कुराते हैं।",
      ),
    ),
    w.body(
      t(
        "Last stop: how does soap clean at all, and why does it fail in some water?",
        "आख़िरी पड़ाव: साबुन साफ़ करता ही कैसे है, और कुछ पानी में असफल क्यों होता है?",
      ),
    ),
    space(),
  ]);
});

/** Activity 4.10 and the soap molecule. */
const molecule = page(
  "molecule",
  (b) => {
    const w = wordsOn(b);
    const s = soapOn(b, "s", SoapMode.Molecule);
    b.standsFor(s, "a soap molecule: a charged ionic head and a long hydrocarbon tail");
    const q = ask(
      b,
      "q",
      ["Which end of a soap molecule dissolves in water?", "साबुन के अणु का कौन-सा सिरा जल में घुलता है?"],
      ["The ionic head: it is hydrophilic", "आयनिक सिरा: वह जलरागी है"],
      [
        [
          "The hydrocarbon tail",
          "हाइड्रोकार्बन पूँछ",
          "The tail is hydrophobic: it dissolves in oil, not water.",
          "पूँछ जलविरागी है: वह तेल में घुलती है, जल में नहीं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Two ends", "दो सिरे")),
      w.body(
        t(
          "NCERT Activity 4.10. Shake a few mL of oil in water in two test tubes, one with a few drops of soap solution. Without soap, the oil separates out again at once. With soap, it stays mixed for a long time.",
          "NCERT क्रियाकलाप 4.10। दो परखनलियों में पानी में कुछ mL तेल हिलाओ, एक में साबुन के घोल की कुछ बूँदें डालकर। बिना साबुन तेल तुरंत फिर अलग हो जाता है। साबुन के साथ वह देर तक मिला रहता है।",
        ),
      ),
      s,
      w.definition(
        t(
          "**Soap.** Soaps are **sodium or potassium salts of long-chain carboxylic acids**. Each molecule has two ends with different properties: an **ionic** end that dissolves in water, called **hydrophilic** (water-loving), and a long **hydrocarbon chain** that dissolves in oil, called **hydrophobic** (water-hating). Our soap's long chains came from the cooking oil.",
          "**साबुन।** साबुन **लंबी शृंखला वाले कार्बोक्सिलिक अम्लों के सोडियम या पोटैशियम लवण** हैं। हर अणु के अलग गुणों वाले दो सिरे हैं: एक **आयनिक** सिरा जो जल में घुलता है, **जलरागी** कहलाता है, और एक लंबी **हाइड्रोकार्बन शृंखला** जो तेल में घुलती है, **जलविरागी** कहलाती है। हमारे साबुन की लंबी शृंखलाएँ खाने के तेल से आईं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** At the surface, and the micelle. */
const micelle = page(
  "micelle",
  (b) => {
    const w = wordsOn(b);
    const s = soapOn(b, "s", SoapMode.Micelle);
    b.standsFor(
      s,
      "an oily dirt spot on cloth in soapy water; soap tails dig into the oil and the heads face out into the water, forming a ball (a micelle) that lifts off and rinses away",
    );
    const goal = goalQuestion(b, {
      about: s,
      prompt: t("Step through until the cloth is clean.", "आगे बढ़ो जब तक कपड़ा साफ़ न हो जाए।"),
      isMet: s.derived(SoapDerived.IsClean),
      solve: [s.learner(SoapAction.Next), s.learner(SoapAction.Next), s.learner(SoapAction.Next)],
    });
    return column([
      w.title(t("How soap lifts dirt", "साबुन मैल कैसे उठाता है")),
      w.body(
        t(
          "At the surface of water, soap molecules line up with the ionic heads in the water and the tails sticking out. **Inside** the water, they cluster so that the tails are hidden away from the water.",
          "जल की सतह पर साबुन के अणु ऐसे सजते हैं कि आयनिक सिरे पानी में हों और पूँछें बाहर निकली हों। पानी के **अंदर** वे झुंड बनाते हैं ताकि पूँछें पानी से छिपी रहें।",
        ),
      ),
      s,
      goal,
      w.definition(
        t(
          "**Micelle.** A cluster of soap molecules with the tails inside and the ionic ends on the surface is a **micelle**. Most dirt is oily. The tails dissolve into the oily dirt and the micelle forms around it, with the oil in the middle. The micelle stays in solution, so the dirt is easily **rinsed away** with water.",
          "**मिसेल।** साबुन के अणुओं का झुंड जिसमें पूँछें अंदर और आयनिक सिरे सतह पर हों, **मिसेल** है। अधिकांश मैल तैलीय होता है। पूँछें तैलीय मैल में घुल जाती हैं और उसके चारों ओर मिसेल बनता है, तेल बीच में। मिसेल घोल में रहता है, इसलिए मैल पानी से आसानी से **धुल** जाता है।",
        ),
      ),
      w.body(
        t(
          "Micelles are big enough to scatter light, which is why soap solution looks **cloudy**. Scrubbing, beating or rubbing the clothes helps the micelles pull the oily dirt off.",
          "मिसेल प्रकाश को फैलाने जितने बड़े होते हैं, इसीलिए साबुन का घोल **धुँधला** दिखता है। कपड़ों को रगड़ना, पीटना या मसलना मिसेलों को तैलीय मैल खींचने में मदद करता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activities 4.11–4.12: hard water, scum, detergents. */
const hard = page(
  "hard",
  (b) => {
    const w = wordsOn(b);
    const s = soapOn(b, "s", SoapMode.HardWater);
    b.standsFor(
      s,
      "a test tube of water with a cleaner; the water can be soft or hard and the cleaner soap or detergent; shaking shows how much foam forms and whether white scum appears",
    );
    const goal = goalQuestion(b, {
      about: s,
      prompt: t(
        "Make the water hard, use soap, and shake. What forms?",
        "पानी को कठोर बनाओ, साबुन लो, और हिलाओ। क्या बनता है?",
      ),
      isMet: s.derived(SoapDerived.Scum),
      solve: [s.learner(SoapAction.SetWater, { water: Water.Hard }), s.learner(SoapAction.Shake)],
    });
    const q = ask(
      b,
      "q",
      [
        "Now try detergent in the same hard water. What happens?",
        "अब उसी कठोर पानी में अपमार्जक आज़माओ। क्या होता है?",
      ],
      ["Plenty of foam, no scum", "भरपूर झाग, कोई मैल नहीं"],
      [
        [
          "Scum, like soap",
          "साबुन जैसा मैल",
          "Detergents don't form scum with calcium and magnesium.",
          "अपमार्जक कैल्शियम और मैग्नीशियम के साथ मैल नहीं बनाते।",
        ],
      ],
      { isHidden: true },
    );
    const det = w.definition(
      t(
        "**Detergents.** Detergents are generally sodium salts of **sulphonic acids**, or ammonium salts with chloride or bromide ions. They also have a long hydrocarbon chain, but their charged ends **don't form insoluble precipitates** with calcium and magnesium. So they work in hard water. They are used in shampoos and products for washing clothes.",
        "**अपमार्जक।** अपमार्जक सामान्यतः **सल्फ़ोनिक अम्लों** के सोडियम लवण, या क्लोराइड या ब्रोमाइड आयनों के साथ अमोनियम लवण होते हैं। इनमें भी लंबी हाइड्रोकार्बन शृंखला होती है, पर इनके आवेशित सिरे कैल्शियम और मैग्नीशियम के साथ **अघुलनशील अवक्षेप नहीं बनाते**। इसलिए ये कठोर जल में काम करते हैं। इनका उपयोग शैम्पू और कपड़े धोने के उत्पादों में होता है।",
      ),
      "det",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    oneByOne(b, [q], [det]);
    return column([
      w.title(t("Hard water", "कठोर जल")),
      w.definition(
        t(
          "**Hard water.** Water with calcium and magnesium salts dissolved in it is **hard water**. Soap reacts with these salts to form an insoluble, curdy substance called **scum**, so a lot of soap is wasted before any lather forms.",
          "**कठोर जल।** जिस जल में कैल्शियम और मैग्नीशियम के लवण घुले हों, वह **कठोर जल** है। साबुन इन लवणों से अभिक्रिया करके एक अघुलनशील, दही जैसा पदार्थ बनाता है जिसे **मैल (स्कम)** कहते हैं, इसलिए झाग बनने से पहले बहुत साबुन बर्बाद होता है।",
        ),
      ),
      w.body(
        t(
          "NCERT Activities 4.11 and 4.12: compare distilled water with hard water, using soap and then detergent.",
          "NCERT क्रियाकलाप 4.11 और 4.12: आसुत जल की तुलना कठोर जल से करो, साबुन और फिर अपमार्जक से।",
        ),
      ),
      s,
      goal,
      q,
      det,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the hand pump. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pump = sceneOn(b, "pump", CarbonScene.HandPump, "the hand pump and the scum again");
    const q = ask(
      b,
      "q",
      ["Why did the soap fail at the hand pump?", "हैंडपंप पर साबुन असफल क्यों हुआ?"],
      [
        "The water is hard: its calcium salts turn soap to scum",
        "पानी कठोर है: उसके कैल्सियम लवण साबुन को झाग-मैल बना देते हैं",
      ],
      [
        [
          "The soap was made wrong: too much alkali",
          "साबुन ग़लत बना: क्षार ज़्यादा था",
          "It lathered well at home. The water is different, not the soap.",
          "घर पर अच्छा झाग बना। पानी अलग है, साबुन नहीं।",
        ],
        [
          "Pump water is too cold for the soap to dissolve in",
          "पंप का पानी साबुन घुलने के लिए बहुत ठंडा है",
          "Temperature isn't it: the dissolved salts are.",
          "ताप कारण नहीं: घुले लवण हैं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "NCERT Exercise: will micelles form if soap is added to ethanol instead of water?",
        "NCERT अभ्यास: यदि साबुन को पानी की बजाय एथेनॉल में डाला जाए तो क्या मिसेल बनेंगे?",
      ],
      [
        "No: the hydrocarbon tail dissolves in ethanol, so there's no reason to hide it",
        "नहीं: हाइड्रोकार्बन पूँछ एथेनॉल में घुल जाती है, इसलिए उसे छिपाने की ज़रूरत नहीं",
      ],
      [
        [
          "Yes, the same as in water",
          "हाँ, पानी जैसे ही",
          "Micelles form to hide the tails from water. In ethanol the tails are happy.",
          "मिसेल पूँछों को पानी से छिपाने के लिए बनते हैं। एथेनॉल में पूँछें ठीक रहती हैं।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Soap: hydrophilic head, hydrophobic tail; micelles carry oily dirt away. ✓ Hard water turns soap to scum; detergents work anyway. ✓ The stall will sell our soap for soft water, plus a shop-bought detergent bar for hard water. Next: fair day.",
        "**मिशन लॉग।** ✓ साबुन: जलरागी सिरा, जलविरागी पूँछ; मिसेल तैलीय मैल ले जाते हैं। ✓ कठोर जल साबुन को मैल बना देता है; अपमार्जक फिर भी काम करते हैं। ✓ स्टॉल मृदु जल के लिए हमारा साबुन, और कठोर जल के लिए दुकान से ख़रीदी अपमार्जक टिकिया बेचेगा। आगे: मेले का दिन।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([w.title(t("Back at the pump", "पंप पर वापस")), pump, q, q2, log, space()]);
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
      [
        "NCERT Exercise: why is agitation (scrubbing, beating) needed to get clothes clean?",
        "NCERT अभ्यास: कपड़े साफ़ करने के लिए रगड़ना या पीटना क्यों ज़रूरी है?",
      ],
      [
        "It helps the micelles pull the oily dirt off the cloth",
        "यह मिसेलों को कपड़े से तैलीय मैल खींचने में मदद करता है",
      ],
      [
        [
          "It makes the soap react with the cloth and bleach the stain",
          "वह साबुन को कपड़े से अभिक्रिया कराकर दाग़ उड़ाता है",
          "Soap doesn't react with the cloth; it surrounds the dirt.",
          "साबुन कपड़े से अभिक्रिया नहीं करता; वह मैल को घेरता है।",
        ],
        [
          "It heats the water so dirt melts",
          "पानी गर्म करता है ताकि मैल पिघले",
          "Rubbing doesn't heat the water noticeably.",
          "रगड़ने से पानी ख़ास गर्म नहीं होता।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["Soaps are salts of what?", "साबुन किसके लवण हैं?"],
      ["Long-chain carboxylic acids", "लंबी शृंखला वाले कार्बोक्सिलिक अम्लों के"],
      [
        [
          "Sulphonic acids and ammonia",
          "सल्फ़ोनिक अम्ल और अमोनिया",
          "Those are detergents.",
          "वे अपमार्जक हैं।",
        ],
        [
          "Hydrochloric acid from salt",
          "नमक से हाइड्रोक्लोरिक अम्ल",
          "That gives common salt, which doesn't clean.",
          "उससे साधारण नमक बनता है, जो साफ़ नहीं करता।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "How could you test whether a water sample is hard, with soap?",
        "साबुन से कैसे जाँचोगे कि पानी का नमूना कठोर है?",
      ],
      [
        "Shake it with soap: scum and little lather mean hard",
        "साबुन के साथ हिलाओ: मैल और कम झाग का अर्थ कठोर",
      ],
      [
        [
          "Taste it: hard water tastes of salt",
          "चखो: कठोर पानी नमकीन लगता है",
          "Never taste lab samples, and taste doesn't show hardness.",
          "प्रयोगशाला के नमूने कभी मत चखो, और स्वाद कठोरता नहीं दिखाता।",
        ],
        [
          "Boil it and see if it bubbles faster than tap water",
          "उबालकर देखो कि क्या नल के पानी से जल्दी बुलबुले आते हैं",
          "All water bubbles when it boils.",
          "उबलने पर हर पानी में बुलबुले आते हैं।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Fair day: the mission complete. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const fair = sceneOn(
    b,
    "fair",
    CarbonScene.FairDay,
    "the soap stall at the Green Fair: fruit-shaped soaps and a stack of detergent bars, a sign reading 'For soft water / For hard water', and a queue of customers",
  );
  return column([
    w.title(t("Fair day", "मेले का दिन")),
    fair,
    w.body(
      t(
        'The stall sells out by noon. A sign says **"For soft water: fruity soap. For hard water: a detergent bar from the shop."** When a teacher asks why, Kabir explains micelles with his hands, and Grandpa, for once, says nothing.',
        'दोपहर तक स्टॉल का सारा माल बिक जाता है। एक तख़्ती पर लिखा है **"मृदु जल के लिए: फलों वाला साबुन। कठोर जल के लिए: दुकान की अपमार्जक टिकिया।"** जब एक शिक्षक कारण पूछते हैं, कबीर हाथों से मिसेल समझाता है, और दादाजी इस बार कुछ नहीं कहते।',
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) Carbon shares electrons: covalent bonds. (2) Allotropes: diamond, graphite, C-60. (3) Catenation and tetravalency: millions of compounds. (4) Chains, branches (isomers) and rings. (5) Functional groups and homologous series. (6) Names that describe molecules. (7) Combustion: blue vs sooty flames; oxidation. (8) Addition (oil to vanaspati) and substitution. (9) Ethanol, ethanoic acid, esters (the scent) and saponification (the soap). (10) Micelles, hard water and detergents.",
        "**मिशन पूरा।** (1) कार्बन इलेक्ट्रॉन साझा करता है: सहसंयोजक आबंध। (2) अपररूप: हीरा, ग्रेफ़ाइट, C-60। (3) शृंखलन और चतुःसंयोजकता: लाखों यौगिक। (4) शृंखलाएँ, शाखाएँ (समावयव) और वलय। (5) प्रकार्यात्मक समूह और समजातीय श्रेणी। (6) अणुओं का वर्णन करने वाले नाम। (7) दहन: नीली बनाम कालिख वाली लौ; ऑक्सीकरण। (8) संकलन (तेल से वनस्पति) और प्रतिस्थापन। (9) एथेनॉल, एथेनॉइक अम्ल, एस्टर (खुशबू) और साबुनीकरण (साबुन)। (10) मिसेल, कठोर जल और अपमार्जक।",
      ),
    ),
    space(),
  ]);
});

export const overview = [hook, molecule, micelle, hard, inLife, yourTurn, finale];
