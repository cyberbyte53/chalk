import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EnvScene,
  OzoneAction,
  OzoneMode,
  environmentSceneDef,
  ozoneLayerDef,
} from "@chalk/prop-environment";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The old fridge goes for scrap. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const fridge = b.prop(environmentSceneDef, "fridge", { scene: EnvScene.OldFridge });
  b.standsFor(fridge, "the family's old fridge being wheeled out to the scrap dealer's cart");
  return column([
    w.title(t("The old fridge", "पुराना फ़्रिज")),
    fridge,
    w.body(
      t(
        'The family\'s thirty-year-old fridge is finally going to the scrap dealer. Grandpa stops him at the door. "Don\'t cut its pipes open in the lane," he says. "What\'s inside them is bad for the sky." Kabir looks up. "How can a fridge hurt the sky?"',
        'परिवार का तीस साल पुराना फ़्रिज आख़िरकार कबाड़ी के पास जा रहा है। दादाजी उसे दरवाज़े पर रोकते हैं। "इसकी नलियाँ गली में मत काटना," वे कहते हैं। "इनके अंदर जो है वह आसमान के लिए बुरा है।" कबीर ऊपर देखता है। "फ़्रिज आसमान को कैसे नुकसान पहुँचा सकता है?"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Ozone vs oxygen; the UV shield. */
const what = page(
  "what",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "shield",
      prompt: t(
        "What does the ozone high up in the atmosphere do for us?",
        "वायुमंडल में ऊपर की ओज़ोन हमारे लिए क्या करती है?",
      ),
      options: [
        {
          id: "right",
          label: t("Shields us from the Sun's UV rays", "हमें सूर्य की UV किरणों से बचाती है"),
        },
        {
          id: "breathe",
          label: t("Gives us oxygen to breathe in", "हमें साँस लेने को ऑक्सीजन देती है"),
          feedback: t(
            "We breathe ordinary oxygen, O₂. Ozone is O₃, and at ground level it's a poison.",
            "हम साधारण ऑक्सीजन, O₂, साँस में लेते हैं। ओज़ोन O₃ है, और ज़मीन पर यह ज़हर है।",
          ),
        },
        {
          id: "warm",
          label: t("Keeps the Earth warm at night", "रात में पृथ्वी को गर्म रखती है"),
          feedback: t(
            "Its job is shielding: it stops harmful ultraviolet radiation from reaching the ground.",
            "इसका काम ढाल बनना है: यह हानिकारक पराबैंगनी विकिरण को ज़मीन तक पहुँचने से रोकती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Ozone: poison and shield", "ओज़ोन: ज़हर भी, ढाल भी")),
      w.definition(
        t(
          r`**Ozone.** A molecule of three oxygen atoms. Its formula:
$$\mathrm{O_3}$$
Ordinary oxygen, which all aerobic life needs, is $\mathrm{O_2}$. At ground level ozone is a **deadly poison**.`,
          r`**ओज़ोन।** तीन ऑक्सीजन परमाणुओं का अणु। इसका सूत्र:
$$\mathrm{O_3}$$
साधारण ऑक्सीजन, जो सभी वायवीय जीवों को चाहिए, $\mathrm{O_2}$ है। ज़मीन पर ओज़ोन एक **घातक ज़हर** है।`,
        ),
      ),
      w.definition(
        t(
          "**Ultraviolet (UV) radiation and the ozone layer.** The Sun also sends **ultraviolet (UV) radiation**, which is highly damaging to living things; in people it is known to cause skin cancer. High up in the atmosphere, a layer of ozone shields the Earth's surface from it: the **ozone layer**.",
          "**पराबैंगनी (UV) विकिरण और ओज़ोन परत।** सूर्य **पराबैंगनी (UV) विकिरण** भी भेजता है, जो जीवों के लिए बहुत हानिकारक है; मनुष्यों में इससे त्वचा का कैंसर होता है। वायुमंडल में बहुत ऊपर, ओज़ोन की एक परत पृथ्वी की सतह को इससे बचाती है: **ओज़ोन परत**।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** How ozone forms: UV splits O₂, O + O₂ → O₃. */
const forms = page(
  "forms",
  (b) => {
    const w = wordsOn(b);
    const sky = b.prop(ozoneLayerDef, "sky", {
      mode: OzoneMode.Formation,
      step: 0,
      canSetCfc: false,
    });
    b.studentOnly(sky.action(OzoneAction.Next));
    b.studentOnly(sky.action(OzoneAction.Reset));
    b.standsFor(
      sky,
      "ozone forming high up: UV splits O₂ into two O atoms, and each O joins an O₂ to make O₃",
    );
    const ask = choiceQuestion(b, {
      name: "join",
      prompt: t(
        "Step through. What joins with an O₂ molecule to make ozone?",
        "आगे बढ़ो। ओज़ोन बनाने के लिए O₂ अणु से क्या जुड़ता है?",
      ),
      options: [
        { id: "right", label: t("A free oxygen atom, O", "एक मुक्त ऑक्सीजन परमाणु, O") },
        {
          id: "o2",
          label: t("A second oxygen molecule, O₂", "एक दूसरा ऑक्सीजन अणु, O₂"),
          feedback: t(
            "Two O₂ would have four atoms. Ozone has three: one O₂ plus one free O atom.",
            "दो O₂ में चार परमाणु होंगे। ओज़ोन में तीन हैं: एक O₂ और एक मुक्त O परमाणु।",
          ),
        },
        {
          id: "uv",
          label: t("A ray of UV light from the Sun", "सूर्य की UV प्रकाश की एक किरण"),
          feedback: t(
            "UV splits the O₂ apart; it doesn't join. The free O atom joins an O₂.",
            "UV, O₂ को तोड़ती है; वह जुड़ती नहीं। मुक्त O परमाणु एक O₂ से जुड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How ozone forms", "ओज़ोन कैसे बनती है")),
      w.body(
        t(
          "High up, the high-energy UV radiation splits some oxygen molecules into free oxygen atoms.",
          "बहुत ऊपर, उच्च ऊर्जा वाला UV विकिरण कुछ ऑक्सीजन अणुओं को मुक्त ऑक्सीजन परमाणुओं में तोड़ देता है।",
        ),
      ),
      w.body(
        t(r`$$\mathrm{O_2 \xrightarrow{UV} O + O}$$`, r`$$\mathrm{O_2 \xrightarrow{UV} O + O}$$`),
      ),
      w.body(
        t(
          "Each free atom then joins an oxygen molecule to make ozone.",
          "फिर हर मुक्त परमाणु एक ऑक्सीजन अणु से जुड़कर ओज़ोन बनाता है।",
        ),
      ),
      w.body(t(r`$$\mathrm{O + O_2 \rightarrow O_3}$$`, r`$$\mathrm{O + O_2 \rightarrow O_3}$$`)),
      sky,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** CFCs thin the layer; the 1987 agreement. */
const cfc = page(
  "cfc",
  (b) => {
    const w = wordsOn(b);
    const sky = b.prop(ozoneLayerDef, "sky", { mode: OzoneMode.Shield, cfc: 0, canStep: false });
    b.studentOnly(sky.action(OzoneAction.SetCfc));
    b.standsFor(
      sky,
      "the ozone layer shielding the ground from UV; adding CFCs thins it and lets UV rays through",
    );
    const ask = choiceQuestion(b, {
      name: "more",
      prompt: t("Raise the CFCs. What happens at the ground?", "CFC बढ़ाओ। ज़मीन पर क्या होता है?"),
      options: [
        { id: "right", label: t("More UV rays reach it", "ज़्यादा UV किरणें पहुँचती हैं") },
        {
          id: "less",
          label: t("Fewer UV rays reach it", "कम UV किरणें पहुँचती हैं"),
          feedback: t(
            "CFCs thin the layer, so the shield lets more UV through.",
            "CFC परत को पतला करते हैं, इसलिए ढाल ज़्यादा UV को आने देती है।",
          ),
        },
        {
          id: "same",
          label: t("Nothing at all changes", "कुछ भी नहीं बदलता"),
          feedback: t(
            "Watch the rays: as the layer thins, more of them get through.",
            "किरणें देखो: परत पतली होने पर ज़्यादा किरणें पार हो जाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Thinning the shield", "पतली होती ढाल")),
      w.definition(
        t(
          "**CFCs.** **Chlorofluorocarbons (CFCs)** are human-made chemicals used as refrigerants (the cooling gas in fridges) and in fire extinguishers. The amount of ozone began to drop sharply in the 1980s, and this was linked to CFCs.",
          "**CFC।** **क्लोरोफ़्लोरोकार्बन (CFC)** मानव-निर्मित रसायन हैं जो प्रशीतक (फ़्रिज की ठंडक देने वाली गैस) और अग्निशामकों में इस्तेमाल होते थे। 1980 के दशक में ओज़ोन की मात्रा तेज़ी से घटने लगी, और इसे CFC से जोड़ा गया।",
        ),
      ),
      sky,
      ask,
      w.body(
        t(
          "In 1987 the United Nations Environment Programme (UNEP) got countries to agree to freeze CFC production at 1986 levels. Now all companies must make **CFC-free** refrigerators.",
          "1987 में संयुक्त राष्ट्र पर्यावरण कार्यक्रम (UNEP) ने देशों को CFC उत्पादन 1986 के स्तर पर रोकने के लिए सहमत किया। अब सभी कंपनियों को **CFC-मुक्त** रेफ़्रिजरेटर बनाने होते हैं।",
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

/** Why Grandpa stopped the scrap dealer. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "fridge",
      prompt: t(
        "Why did Grandpa not want the old fridge's pipes cut open in the lane?",
        "दादाजी पुराने फ़्रिज की नलियाँ गली में क्यों नहीं कटवाना चाहते थे?",
      ),
      options: [
        {
          id: "right",
          label: t("Its old CFC gas would escape", "उसकी पुरानी CFC गैस निकल जाती"),
        },
        {
          id: "shock",
          label: t("Its wires could still give a shock", "उसके तार अब भी झटका दे सकते थे"),
          feedback: t(
            "Unplugged, it can't shock anyone. He was worried about the gas in the pipes.",
            "प्लग निकला हो तो झटका नहीं लगेगा। उन्हें नलियों की गैस की चिंता थी।",
          ),
        },
        {
          id: "ozone",
          label: t("Its pipes are full of poisonous ozone", "उसकी नलियाँ ज़हरीली ओज़ोन से भरी हैं"),
          feedback: t(
            "A fridge's pipes held the refrigerant: in an old one, a CFC that damages the ozone layer.",
            "फ़्रिज की नलियों में प्रशीतक था: पुराने फ़्रिज में CFC, जो ओज़ोन परत को नुकसान पहुँचाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const then = w.body(
      t(
        "A thirty-year-old fridge was made before the 1987 agreement, so it most likely used a CFC. Let out, the gas would rise and thin the ozone layer. The new fridge's label says CFC-free.",
        "तीस साल पुराना फ़्रिज 1987 के समझौते से पहले बना था, इसलिए उसमें शायद CFC थी। बाहर निकलने पर गैस ऊपर उठती और ओज़ोन परत को पतला करती। नए फ़्रिज के लेबल पर लिखा है: CFC-मुक्त।",
      ),
      "then",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(then), theBoard.pass()]);
    return column([w.title(t("Back to the fridge", "फिर फ़्रिज पर")), ask, then, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 9 and in-text Q1; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ex9",
      prompt: t(
        "Exercise 9: which step was taken to limit damage to the ozone layer?",
        "अभ्यास 9: ओज़ोन परत को नुकसान रोकने के लिए कौन-सा कदम उठाया गया?",
      ),
      options: [
        {
          id: "right",
          label: t("CFC output frozen; CFC-free fridges", "CFC उत्पादन रोका; CFC-मुक्त फ़्रिज"),
        },
        {
          id: "oxygen",
          label: t("Oxygen pumped up into the sky", "ऑक्सीजन आसमान तक भेजी गई"),
          feedback: t(
            "The fix was to stop the cause: UNEP's 1987 agreement froze CFC production.",
            "उपाय कारण को रोकना था: UNEP के 1987 समझौते ने CFC उत्पादन रोका।",
          ),
        },
        {
          id: "ban",
          label: t("Fridges banned in every country", "हर देश में फ़्रिज पर रोक"),
          feedback: t(
            "Fridges are still made; they just have to be CFC-free.",
            "फ़्रिज अब भी बनते हैं; बस उन्हें CFC-मुक्त होना होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log, day 15.** ✓ Ozone up high shields us from UV, and CFCs thin it. ✓ The old fridge went to a proper recycler. ✗ Half the challenge is still untouched: our garbage. Grandpa is digging a pit. Next: what rots and what stays.",
        "**मिशन लॉग, दिन 15।** ✓ ऊपर की ओज़ोन हमें UV से बचाती है, और CFC उसे पतला करते हैं। ✓ पुराना फ़्रिज सही रीसाइक्लर के पास गया। ✗ चुनौती का आधा हिस्सा अभी बाकी है: हमारा कचरा। दादाजी एक गड्ढा खोद रहे हैं। आगे: क्या सड़ता है और क्या बचा रहता है।",
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
export const overview = [hook, what, forms, cfc, inLife, yourTurn];
