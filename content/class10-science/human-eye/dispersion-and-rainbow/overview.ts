import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AtmosphereAction,
  AtmosphereDerived,
  AtmosphereKind,
  AtmosphereSignal,
  EyeSceneKind,
  PrismAction,
  PrismMode,
  atmosphereDef,
  eyeSceneDef,
  prismDef,
} from "@chalk/prop-eye";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The waterfall and its rainbow. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const fall = b.prop(eyeSceneDef, "fall", { scene: EyeSceneKind.Waterfall });
  b.standsFor(
    fall,
    "the family at the foot of a waterfall with the Sun behind them; a rainbow arcs across the spray",
  );
  return column([
    w.title(t("A rainbow in the spray", "फुहार में इंद्रधनुष")),
    fall,
    w.body(
      t(
        "**Stop 5.** On the way up, the family stops at a waterfall. It's sunny, the Sun is behind them, and in the spray there is a perfect rainbow. Kabir holds up his chandelier crystal: it makes the same colours, in the same order, on his palm.",
        "**पड़ाव 5।** ऊपर जाते हुए परिवार एक झरने पर रुकता है। धूप है, सूरज उनके पीछे है, और फुहार में एक पूरा इंद्रधनुष है। कबीर अपना झाड़-फ़ानूस वाला क्रिस्टल उठाता है: वह उसकी हथेली पर वही रंग, उसी क्रम में बनाता है।",
      ),
    ),
    w.body(
      t(
        "Sunlight looks white. So where do the colours come from, in the crystal and in the sky? And why are they always in the same order?",
        "धूप सफ़ेद दिखती है। तो रंग कहाँ से आते हैं, क्रिस्टल में भी और आसमान में भी? और वे हमेशा एक ही क्रम में क्यों होते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 11.2: white light splits into a spectrum; red bends least, violet most. */
const spectrum = page(
  "spectrum",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 11.4, Activity 11.2: a narrow beam of white light through a prism gives a band of colours, the spectrum, VIBGYOR; this splitting is dispersion, because each colour bends through a different angle: red the least, violet the most.",
    );
    const prism = b.prop(prismDef, "prism", {
      mode: PrismMode.Dispersion,
      incidence: 50,
      showNormals: false,
      showAngles: false,
      showNames: true,
      showColourNames: true,
      canSetIncidence: true,
      canSetMode: false,
    });
    b.studentOnly(prism.action(PrismAction.SetIncidence));
    b.standsFor(
      prism,
      "a narrow beam of white light enters a prism and leaves as a fan of colours landing on a screen, violet at the bottom (bent most) and red at the top (bent least)",
    );
    const most = choiceQuestion(b, {
      name: "most",
      prompt: t(
        "Which colour is bent the **most** by the prism?",
        "प्रिज़्म किस रंग को **सबसे ज़्यादा** मोड़ता है?",
      ),
      options: [
        { id: "right", label: t("Violet", "बैंगनी") },
        {
          id: "red",
          label: t("Red", "लाल"),
          feedback: t(
            "Red is bent the least: it lands closest to where the beam was heading. Look at the other end.",
            "लाल सबसे कम मुड़ता है: वह वहीं के सबसे पास पड़ता है जहाँ किरण-पुंज जा रहा था। दूसरे सिरे को देखो।",
          ),
        },
        {
          id: "green",
          label: t("Green", "हरा"),
          feedback: t("Green is in the middle of the band.", "हरा पट्टी के बीच में है।"),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("White light splits", "सफ़ेद प्रकाश बँटता है")),
      w.body(
        t(
          "Make a narrow slit in a piece of cardboard and let sunlight through it onto a glass prism. Turn the prism until the light coming out falls on a screen. You get a band of colours.",
          "गत्ते में एक पतली झिरी बनाओ और उससे धूप को काँच के प्रिज़्म पर पड़ने दो। प्रिज़्म को तब तक घुमाओ जब तक निकलता प्रकाश पर्दे पर न पड़े। तुम्हें रंगों की एक पट्टी मिलती है।",
        ),
      ),
      prism,
      w.definition(
        t(
          "**Spectrum and dispersion.** The colours are **violet, indigo, blue, green, yellow, orange and red**: remember them as **VIBGYOR**. The band of colours a beam of light is made of is its **spectrum**. The splitting of light into its colours is called **dispersion**.",
          "**स्पेक्ट्रम और विक्षेपण।** रंग हैं **बैंगनी, जामुनी, नीला, हरा, पीला, नारंगी और लाल**: इन्हें **VIBGYOR** (हिंदी में बैजानीहपीनाला) के रूप में याद रखो। किसी प्रकाश-पुंज के रंगों की पट्टी उसका **स्पेक्ट्रम** है। प्रकाश का उसके रंगों में बँटना **विक्षेपण** कहलाता है।",
        ),
      ),
      w.definition(
        t(
          "**Why it splits.** Each colour bends through a **different angle** as it passes through the prism: **red the least, violet the most**. So each colour comes out along its own path, and they separate.",
          "**यह क्यों बँटता है।** प्रिज़्म से गुज़रते समय हर रंग **अलग कोण** से मुड़ता है: **लाल सबसे कम, बैंगनी सबसे ज़्यादा**। इसलिए हर रंग अपने रास्ते से निकलता है, और वे अलग हो जाते हैं।",
        ),
      ),
      most,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Newton's two prisms: the colours recombine into white. */
const newton = page(
  "newton",
  (b) => {
    const w = wordsOn(b);
    const prism = b.prop(prismDef, "prism", {
      mode: PrismMode.Dispersion,
      incidence: 50,
      showNormals: false,
      showAngles: false,
      showNames: true,
      showColourNames: false,
      canSetIncidence: false,
      canSetMode: true,
    });
    b.studentOnly(prism.action(PrismAction.SetMode));
    b.standsFor(
      prism,
      "one prism splitting white light into colours, with a button to add a second, identical prism upside down, which bends the colours back together into white light",
    );
    b.witness(prism.learner(PrismAction.SetMode, { mode: PrismMode.Recombine }));
    const proves = choiceQuestion(b, {
      name: "proves",
      prompt: t(
        "Add the second prism, upside down. What does Newton's experiment show?",
        "दूसरा प्रिज़्म उल्टा लगाओ। न्यूटन का प्रयोग क्या दिखाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "White light is the seven colours together, so joined they make white",
            "श्वेत प्रकाश सात रंगों का मेल है, इसलिए मिलकर वे सफ़ेद बनाते हैं",
          ),
        },
        {
          id: "glass",
          label: t(
            "The glass paints the colours onto the light as it passes",
            "गुज़रते समय काँच प्रकाश पर रंग चढ़ा देता है",
          ),
          feedback: t(
            "If the glass added colours, a second prism would add more. Instead it gives white back: the colours were in the sunlight all along.",
            "अगर काँच रंग मिलाता, तो दूसरा प्रिज़्म और रंग मिलाता। इसके बजाय वह सफ़ेद लौटा देता है: रंग शुरू से धूप में ही थे।",
          ),
        },
        {
          id: "more",
          label: t(
            "A second prism splits the colours into even more, finer colours",
            "दूसरा प्रिज़्म रंगों को और ज़्यादा, बारीक रंगों में बाँट देता है",
          ),
          feedback: t(
            "Newton tried that first, with a second prism the same way up: no new colours appeared. Upside down, it recombines them.",
            "न्यूटन ने पहले यही आज़माया, दूसरा प्रिज़्म सीधा रखकर: कोई नया रंग नहीं आया। उल्टा रखने पर वह उन्हें फिर मिला देता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Newton puts it back together", "न्यूटन उसे फिर जोड़ते हैं")),
      w.body(
        t(
          "Isaac Newton was the first to get the spectrum of sunlight with a glass prism. He tried to split one of the colours further with another prism, and got no new colours. Then he placed a second, identical prism **upside down** after the first.",
          "आइज़ैक न्यूटन ने सबसे पहले काँच के प्रिज़्म से धूप का स्पेक्ट्रम पाया। उन्होंने एक रंग को दूसरे प्रिज़्म से और बाँटने की कोशिश की, पर कोई नया रंग नहीं मिला। फिर उन्होंने पहले के बाद एक दूसरा, वैसा ही प्रिज़्म **उल्टा** रखा।",
        ),
      ),
      prism,
      w.definition(
        t(
          "**White light.** A beam of white light comes out of the second prism. So sunlight is made up of the seven colours. Any light that gives a spectrum like sunlight's is called **white light**.",
          "**सफ़ेद प्रकाश।** दूसरे प्रिज़्म से सफ़ेद प्रकाश का पुंज निकलता है। तो धूप सात रंगों से बनी है। जो भी प्रकाश धूप जैसा स्पेक्ट्रम दे, उसे **सफ़ेद प्रकाश** कहते हैं।",
        ),
      ),
      proves,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The rainbow: raindrops as tiny prisms, stepped. */
const rainbow = page(
  "rainbow",
  (b) => {
    const w = wordsOn(b);
    const drop = b.prop(atmosphereDef, "drop", {
      kind: AtmosphereKind.Raindrop,
      step: 0,
      canStep: true,
      canToggle: false,
      showNames: true,
    });
    b.studentOnly(drop.action(AtmosphereAction.Next));
    b.standsFor(
      drop,
      "one raindrop, step by step: white sunlight enters and refracts, splitting into colours; the colours reflect off the inside of the back of the drop; they refract again coming out, each colour towards the observer in its own direction",
    );
    const opposite = choiceQuestion(b, {
      name: "opposite",
      prompt: t(
        "Step through the drop to the end. Where must the Sun be for you to see a rainbow?",
        "बूँद के अंत तक क़दम बढ़ाओ। इंद्रधनुष देखने के लिए सूरज कहाँ होना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Behind you: a rainbow is always opposite the Sun",
            "तुम्हारे पीछे: इंद्रधनुष हमेशा सूरज के विपरीत होता है",
          ),
        },
        {
          id: "front",
          label: t("In front of you, behind the falling rain", "तुम्हारे सामने, गिरती बारिश के पीछे"),
          feedback: t(
            "The light reflects off the back of each drop and comes back out the way it came in. So the Sun has to be behind you.",
            "प्रकाश हर बूँद के पिछले हिस्से से परावर्तित होकर उसी ओर निकलता है जिधर से आया था। इसलिए सूरज तुम्हारे पीछे होना चाहिए।",
          ),
        },
        {
          id: "overhead",
          label: t("Straight overhead, on the same side as the Sun", "ठीक ऊपर, सूरज की ही ओर"),
          feedback: t(
            "Then the light would come back towards the sky, not to you. Rainbows are seen with a low Sun behind you.",
            "तब प्रकाश आसमान की ओर लौटता, तुम्हारी ओर नहीं। इंद्रधनुष तब दिखते हैं जब नीचा सूरज तुम्हारे पीछे हो।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(
      drop.on(AtmosphereSignal.Stepped),
      theBoard.show(opposite),
      drop.derived(AtmosphereDerived.IsLastStep),
    );
    b.witness(...Array.from({ length: 3 }, () => drop.learner(AtmosphereAction.Next)));
    return column([
      w.title(t("A sky full of prisms", "प्रिज़्मों से भरा आसमान")),
      w.definition(
        t(
          "**Rainbow.** A rainbow is a natural spectrum in the sky after a shower. It is made by tiny water droplets in the air, which act like small prisms. Each drop **refracts** and **disperses** the sunlight going in, **reflects it internally** off its back, and **refracts** it again coming out. Because of the dispersion and the internal reflection, different colours reach your eye from different drops.",
          "**इंद्रधनुष।** इंद्रधनुष बारिश के बाद आसमान में एक प्राकृतिक स्पेक्ट्रम है। यह हवा में पानी की नन्ही बूँदों से बनता है, जो छोटे प्रिज़्मों की तरह काम करती हैं। हर बूँद अंदर जाती धूप का **अपवर्तन** और **विक्षेपण** करती है, उसे अपने पिछले हिस्से से **आंतरिक परावर्तित** करती है, और बाहर निकलते समय फिर **अपवर्तित** करती है। विक्षेपण और आंतरिक परावर्तन के कारण अलग-अलग बूँदों से अलग-अलग रंग तुम्हारी आँख तक पहुँचते हैं।",
        ),
      ),
      w.body(
        t(
          "Step through what happens inside one drop:",
          "एक बूँद के अंदर जो होता है, उसे क़दम-दर-क़दम देखो:",
        ),
      ),
      drop,
      opposite,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back at the waterfall. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const fall = b.prop(eyeSceneDef, "fall", { scene: EyeSceneKind.Waterfall });
    b.standsFor(fall, "the family at the waterfall, the Sun behind them, the rainbow in the spray");
    const turn = choiceQuestion(b, {
      name: "turn",
      prompt: t(
        "Kabir turns round to face the Sun, hoping to see the rainbow better. What happens?",
        "कबीर इंद्रधनुष बेहतर देखने की उम्मीद में मुड़कर सूरज की ओर मुँह करता है। क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The rainbow is behind him now: he can't see it",
            "इंद्रधनुष अब उसके पीछे है: उसे नहीं दिखता",
          ),
        },
        {
          id: "brighter",
          label: t("It looks brighter", "वह ज़्यादा चमकीला दिखता है"),
          feedback: t(
            "A rainbow is always opposite the Sun. Facing the Sun, he is facing away from it.",
            "इंद्रधनुष हमेशा सूरज के विपरीत होता है। सूरज की ओर मुँह करके वह उससे दूर देख रहा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const answer = w.body(
      t(
        "Notebook Q2 answered: the colours were in the sunlight all along. The crystal and the drops just **split** them, bending each colour by a different amount, and always in the same order, VIBGYOR. That evening, at the guest house on the hill, Kabir starts Q3.",
        "कॉपी का सवाल 2 हल: रंग शुरू से धूप में ही थे। क्रिस्टल और बूँदें बस उन्हें **बाँटती** हैं, हर रंग को अलग मात्रा में मोड़कर, और हमेशा एक ही क्रम में, VIBGYOR। उस शाम पहाड़ी के गेस्ट हाउस में कबीर सवाल 3 शुरू करता है।",
      ),
      "answer",
      { isHidden: true },
    );
    b.when(turn.on(QuestionSignal.Correct), [theBoard.show(answer), theBoard.pass()]);
    return column([
      w.title(t("The rainbow, explained", "इंद्रधनुष, समझा हुआ")),
      fall,
      turn,
      answer,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** VIBGYOR, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const next = choiceQuestion(b, {
      name: "next",
      prompt: t(
        "In the spectrum from a prism, which colour lies between **green** and **orange**?",
        "प्रिज़्म के स्पेक्ट्रम में **हरे** और **नारंगी** के बीच कौन-सा रंग है?",
      ),
      options: [
        { id: "right", label: t("Yellow", "पीला") },
        {
          id: "blue",
          label: t("Blue", "नीला"),
          feedback: t(
            "Blue is on the other side of green: V I **B** G Y O R.",
            "नीला हरे की दूसरी ओर है: V I **B** G Y O R।",
          ),
        },
        {
          id: "indigo",
          label: t("Indigo", "जामुनी"),
          feedback: t(
            "Indigo is next to violet, at the far end: V **I** B G Y O R.",
            "जामुनी बैंगनी के पास, दूसरे सिरे पर है: V **I** B G Y O R।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Notebook Q2: white light is made of seven colours; a prism or a raindrop disperses it, red bent least and violet most. ✓ A rainbow forms in drops opposite the Sun. ? Notebook Q3: why does the air above the chai stove shimmer, and why do stars twinkle? Next stop: the air bends light.",
        "**मिशन लॉग।** ✓ कॉपी का सवाल 2: सफ़ेद प्रकाश सात रंगों से बना है; प्रिज़्म या बारिश की बूँद उसका विक्षेपण करती है, लाल सबसे कम और बैंगनी सबसे ज़्यादा मुड़ता है। ✓ इंद्रधनुष सूरज के विपरीत बूँदों में बनता है। ? कॉपी का सवाल 3: चाय के चूल्हे के ऊपर की हवा क्यों झिलमिलाती है, और तारे क्यों टिमटिमाते हैं? अगला पड़ाव: हवा प्रकाश को मोड़ती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(next.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), next, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, spectrum, newton, rainbow, inLife, yourTurn];
