import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AtmosphereAction,
  AtmosphereDerived,
  AtmosphereKind,
  AtmosphereSignal,
  EyeSceneKind,
  SkySource,
  atmosphereDef,
  eyeSceneDef,
} from "@chalk/prop-eye";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The chai stove, then the night sky. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const sky = b.prop(eyeSceneDef, "sky", { scene: EyeSceneKind.StarryNight });
  b.standsFor(
    sky,
    "night at a roadside dhaba in the hills: a sky full of stars, one bright steady one low in the west; Kabir points up while Grandpa holds a cup of chai by the glowing stove",
  );
  return column([
    w.title(t("Shimmer and twinkle", "झिलमिलाहट और टिमटिमाहट")),
    w.body(
      t(
        "**Stop 6.** At a roadside stall, the family stops for chai. Looking past the stove at a signboard, Kabir notices the sign seems to wobble, as if it's under water. Only above the stove, though.",
        "**पड़ाव 6।** सड़क किनारे एक ठेले पर परिवार चाय के लिए रुकता है। चूल्हे के पार एक बोर्ड को देखते हुए कबीर देखता है कि बोर्ड डोलता-सा लगता है, जैसे पानी के नीचे हो। पर केवल चूल्हे के ऊपर से देखने पर।",
      ),
    ),
    sky,
    w.body(
      t(
        "That night they eat at a dhaba near the guest house. The sky is full of stars, far more than in the city, and they all twinkle. All except one very bright one low in the west, which shines steady. Grandpa says it isn't a star at all. Notebook Q3: **why do things shimmer above a stove, why do stars twinkle, and why doesn't that bright one?**",
        "उस रात वे गेस्ट हाउस के पास एक ढाबे पर खाना खाते हैं। आसमान तारों से भरा है, शहर से कहीं ज़्यादा, और सब टिमटिमा रहे हैं। सिवाय पश्चिम में नीचे के एक बहुत चमकीले के, जो स्थिर चमक रहा है। दादाजी कहते हैं कि वह तारा है ही नहीं। कॉपी का सवाल 3: **चूल्हे के ऊपर चीज़ें क्यों झिलमिलाती हैं, तारे क्यों टिमटिमाते हैं, और वह चमकीला क्यों नहीं?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Hot air: lower refractive index, changing all the time. */
const hotAir = page(
  "hot-air",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 11.5: air above a fire is hotter, less dense, and has a slightly lower refractive index than the cooler air above; since the conditions keep changing, the apparent position of objects seen through it fluctuates. This is atmospheric refraction on a small scale.",
    );
    const stove = b.prop(atmosphereDef, "stove", {
      kind: AtmosphereKind.HotAir,
      isHot: false,
      canStep: false,
      canToggle: true,
      showNames: true,
    });
    b.studentOnly(stove.action(AtmosphereAction.SetHeat));
    b.standsFor(
      stove,
      "a chai stove with a signboard behind it and a stove on/off switch: when the stove is lit, hot air rises and the sign seen through it wavers",
    );
    b.witness(stove.learner(AtmosphereAction.SetHeat, { on: true }));
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Light the stove. Why does the sign seen through the hot air waver?",
        "चूल्हा जलाओ। गर्म हवा से दिखता बोर्ड क्यों डोलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Moving hot air has a changing refractive index, so bending keeps changing",
            "चलती गर्म हवा का अपवर्तनांक बदलता है, इसलिए मोड़ बदलता रहता है",
          ),
        },
        {
          id: "smoke",
          label: t(
            "Smoke from the fire blocks part of the light and then lets it through",
            "आग का धुआँ प्रकाश का कुछ भाग रोकता है और फिर जाने देता है",
          ),
          feedback: t(
            "Smoke would make the sign dimmer, not make it move. A clean flame does it too: it's the hot air.",
            "धुआँ बोर्ड को धुँधला करता, उसे हिलाता नहीं। साफ़ लौ से भी ऐसा होता है: यह गर्म हवा है।",
          ),
        },
        {
          id: "eyes",
          label: t(
            "The heat dries his eyes, so his own vision wobbles",
            "गर्मी उसकी आँखें सुखा देती है, इसलिए उसकी अपनी दृष्टि डगमगाती है",
          ),
          feedback: t(
            "Only the part of the sign seen above the stove wobbles. It's the light's path that's changing, not his eyes.",
            "केवल चूल्हे के ऊपर से दिखता बोर्ड का हिस्सा डोलता है। बदल रहा है प्रकाश का रास्ता, उसकी आँखें नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The air bends light too", "हवा भी प्रकाश को मोड़ती है")),
      w.body(
        t(
          "From the light chapter: light bends when it passes between materials with different **refractive indices**. Air is a material too. The air just above a fire is hotter and **less dense** than the air higher up, and its refractive index is slightly **less**.",
          "प्रकाश वाले अध्याय से: प्रकाश तब मुड़ता है जब वह अलग **अपवर्तनांक** वाले पदार्थों के बीच से गुज़रता है। हवा भी एक पदार्थ है। आग के ठीक ऊपर की हवा ऊपर की हवा से ज़्यादा गर्म और **कम सघन** है, और उसका अपवर्तनांक थोड़ा **कम** है।",
        ),
      ),
      stove,
      w.definition(
        t(
          "**Atmospheric refraction.** The bending of light by the earth's air is **atmospheric refraction**. Above a fire the hot air keeps rising and mixing, so its refractive index is never still. The light from an object behind it is bent first one way and then another, and the object's apparent position flickers.",
          "**वायुमंडलीय अपवर्तन।** पृथ्वी की हवा द्वारा प्रकाश का मुड़ना **वायुमंडलीय अपवर्तन** है। आग के ऊपर गर्म हवा लगातार उठती और मिलती रहती है, इसलिए उसका अपवर्तनांक कभी स्थिर नहीं रहता। उसके पीछे की वस्तु का प्रकाश कभी एक ओर, कभी दूसरी ओर मुड़ता है, और वस्तु की दिखती स्थिति झिलमिलाती है।",
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Stars twinkle; planets don't. */
const twinkle = page(
  "twinkle",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Twinkling of stars: starlight bends gradually towards the normal through layers of air of changing refractive index, so a star appears higher than it really is; the conditions keep changing, so its apparent position and brightness flicker. Stars are point sources; planets are nearer, extended sources whose flickers average out.",
    );
    const night = b.prop(atmosphereDef, "night", {
      kind: AtmosphereKind.Twinkle,
      source: SkySource.Star,
      canStep: false,
      canToggle: true,
      showNames: true,
    });
    b.studentOnly(night.action(AtmosphereAction.SetSource));
    b.standsFor(
      night,
      "layers of air above an observer, thinner high up and denser low down; light from a star near the horizon curves down through them, so the star is seen higher than its actual position and flickers; a switch shows a planet instead, which shines steady",
    );
    const higher = choiceQuestion(b, {
      name: "higher",
      prompt: t(
        "Where does a star near the horizon **seem** to be, compared with where it really is?",
        "क्षितिज के पास का कोई तारा, अपनी असली जगह की तुलना में कहाँ **दिखता** है?",
      ),
      options: [
        { id: "right", label: t("Slightly higher", "थोड़ा ऊपर") },
        {
          id: "lower",
          label: t("Slightly lower", "थोड़ा नीचे"),
          feedback: t(
            "The light curves downwards on its way through denser and denser air. Your eye traces it straight back, to a point above the real star.",
            "प्रकाश सघन से सघन होती हवा में से आते हुए नीचे की ओर मुड़ता है। तुम्हारी आँख उसे सीधा पीछे ले जाती है, असली तारे से ऊपर के बिंदु तक।",
          ),
        },
        {
          id: "same",
          label: t("Exactly where it is", "ठीक वहीं जहाँ वह है"),
          feedback: t(
            "That would be true with no air. The air bends starlight, so the star is seen a little higher.",
            "बिना हवा के यह सही होता। हवा तारे के प्रकाश को मोड़ती है, इसलिए तारा थोड़ा ऊपर दिखता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const planet = choiceQuestion(b, {
      name: "planet",
      prompt: t(
        "Switch to the planet. Why doesn't it twinkle?",
        "ग्रह पर बदलो। वह क्यों नहीं टिमटिमाता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It's nearer, so it's a small disc whose many points' flickers cancel",
            "वह पास है, इसलिए एक छोटी चकती है जिसके कई बिंदुओं की टिमटिमाहट मिट जाती है",
          ),
        },
        {
          id: "own",
          label: t(
            "It makes its own steady light, unlike stars, which only reflect light",
            "वह अपना स्थिर प्रकाश बनाता है, तारों के उलट, जो केवल प्रकाश परावर्तित करते हैं",
          ),
          feedback: t(
            "Planets don't make light at all; they reflect sunlight. The difference is their size in the sky.",
            "ग्रह प्रकाश बनाते ही नहीं; वे सूर्य का प्रकाश परावर्तित करते हैं। फ़र्क़ आसमान में उनके आकार का है।",
          ),
        },
        {
          id: "above",
          label: t(
            "Its light reaches us without passing through much air",
            "उसका प्रकाश ज़्यादा हवा से गुज़रे बिना हम तक आता है",
          ),
          feedback: t(
            "Its light comes through the same air as the stars'. But it comes from a disc, not a point.",
            "उसका प्रकाश तारों वाली उसी हवा से आता है। पर वह एक बिंदु से नहीं, चकती से आता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(higher.on(QuestionSignal.Correct), theBoard.show(planet));
    b.witness(night.learner(AtmosphereAction.SetSource, { source: SkySource.Planet }));
    return column([
      w.title(t("Why stars twinkle", "तारे क्यों टिमटिमाते हैं")),
      w.body(
        t(
          "Starlight entering the earth's air passes through layers that get denser lower down, so their refractive index changes gradually. The light keeps bending, little by little, **towards the normal** (here, the up-down line at right angles to the flat layers of air). Its path curves.",
          "पृथ्वी की हवा में आता तारे का प्रकाश ऐसी परतों से गुज़रता है जो नीचे की ओर सघन होती जाती हैं, इसलिए उनका अपवर्तनांक धीरे-धीरे बदलता है। प्रकाश थोड़ा-थोड़ा करके **अभिलंब की ओर** (यहाँ, हवा की सपाट परतों के लंबवत ऊपर-नीचे वाली रेखा) मुड़ता रहता है। उसका रास्ता वक्र हो जाता है।",
        ),
      ),
      night,
      w.definition(
        t(
          "**Twinkling.** So the **apparent position** of a star (where it seems to be) is slightly different from its actual position: near the horizon it appears a little **higher**. And because the air is never still, this apparent position keeps shifting slightly. A star is so far away that it is a **point** of light, so as its light's path wavers, the amount reaching your eye flickers too: the star looks brighter, then fainter. That is **twinkling**.",
          "**टिमटिमाना।** तो किसी तारे की **आभासी स्थिति** (जहाँ वह दिखता है) उसकी असली स्थिति से थोड़ी अलग होती है: क्षितिज के पास वह थोड़ा **ऊपर** दिखता है। और क्योंकि हवा कभी स्थिर नहीं होती, यह आभासी स्थिति थोड़ी-थोड़ी बदलती रहती है। तारा इतना दूर है कि वह प्रकाश का एक **बिंदु** है, इसलिए उसके प्रकाश का रास्ता डोलने पर तुम्हारी आँख तक पहुँचने वाली मात्रा भी झिलमिलाती है: तारा कभी चमकीला, कभी धुँधला दिखता है। यही **टिमटिमाना** है।",
        ),
      ),
      higher,
      w.definition(
        t(
          "**Planets.** Planets are much closer, so they are seen as **extended sources**: tiny discs. Think of a disc as many point sources together. Their flickers go up and down at different moments and **average out**, so a planet shines steadily.",
          "**ग्रह।** ग्रह बहुत पास हैं, इसलिए वे **विस्तृत स्रोत** दिखते हैं: नन्ही चकतियाँ। चकती को एक साथ कई बिंदु-स्रोत मानो। उनकी झिलमिलाहटें अलग-अलग पलों में ऊपर-नीचे होती हैं और **औसत में मिट जाती** हैं, इसलिए ग्रह स्थिर चमकता है।",
        ),
      ),
      planet,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Advance sunrise and delayed sunset. */
const sunrise = page(
  "sunrise",
  (b) => {
    const w = wordsOn(b);
    const dawn = b.prop(atmosphereDef, "dawn", {
      kind: AtmosphereKind.Sunrise,
      step: 0,
      canStep: true,
      canToggle: false,
      showNames: true,
    });
    b.studentOnly(dawn.action(AtmosphereAction.Next));
    b.standsFor(
      dawn,
      "dawn, in two steps: without air, the Sun just below the horizon can't be seen; with air, its light bends over the horizon and the Sun is seen about 2 minutes early, slightly flattened",
    );
    const minutes = choiceQuestion(b, {
      name: "minutes",
      prompt: t(
        "The Sun is seen about 2 minutes before it really rises and about 2 minutes after it really sets. Because of the air, how much longer is our day?",
        "सूरज असल में उगने से लगभग 2 मिनट पहले और असल में डूबने के लगभग 2 मिनट बाद तक दिखता है। हवा के कारण हमारा दिन कितना लंबा है?",
      ),
      options: [
        { id: "right", label: t("About 4 minutes", "लगभग 4 मिनट") },
        {
          id: "two",
          label: t("About 2 minutes", "लगभग 2 मिनट"),
          feedback: t(
            "The air gains 2 minutes at sunrise **and** 2 at sunset.",
            "हवा सूर्योदय पर 2 मिनट **और** सूर्यास्त पर 2 मिनट जोड़ती है।",
          ),
        },
        {
          id: "none",
          label: t("No longer: the Sun moves the same", "ज़्यादा नहीं: सूरज वैसे ही चलता है"),
          feedback: t(
            "The Sun's real motion doesn't change, but we see it for longer, because its light is bent over the horizon.",
            "सूरज की असली चाल नहीं बदलती, पर हम उसे ज़्यादा देर देखते हैं, क्योंकि उसका प्रकाश क्षितिज के ऊपर मुड़ जाता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(
      dawn.on(AtmosphereSignal.Stepped),
      theBoard.show(minutes),
      dawn.derived(AtmosphereDerived.IsLastStep),
    );
    b.witness(dawn.learner(AtmosphereAction.Next));
    return column([
      w.title(t("The Sun, two minutes early", "दो मिनट पहले सूरज")),
      w.definition(
        t(
          "**Advance sunrise and delayed sunset.** By **actual sunrise** we mean the moment the Sun really crosses the horizon. Because the air bends sunlight over the horizon, we see the Sun about **2 minutes before** actual sunrise, and about **2 minutes after** actual sunset. The same bending makes the Sun's disc look slightly **flattened** at sunrise and sunset. Step through it:",
          "**जल्दी सूर्योदय और देर से सूर्यास्त।** **असली सूर्योदय** से हमारा मतलब वह पल है जब सूरज सचमुच क्षितिज पार करता है। क्योंकि हवा धूप को क्षितिज के ऊपर मोड़ देती है, हम सूरज को असली सूर्योदय से लगभग **2 मिनट पहले** देखते हैं, और असली सूर्यास्त के लगभग **2 मिनट बाद** तक। यही मुड़ना सूर्योदय और सूर्यास्त पर सूरज की चकती को थोड़ा **चपटा** दिखाता है। क़दम-दर-क़दम देखो:",
        ),
      ),
      dawn,
      minutes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's telescope on the steady "star". */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const sky = b.prop(eyeSceneDef, "sky", { scene: EyeSceneKind.StarryNight });
    b.standsFor(
      sky,
      "the starry night at the dhaba, Kabir pointing up at the bright steady 'star' low in the west, Grandpa beside him",
    );
    const telescope = choiceQuestion(b, {
      name: "telescope",
      prompt: t(
        "Grandpa fetches his small telescope from the car and points it at the steady bright 'star'. Kabir sees a tiny round disc. What is it, and why doesn't it twinkle?",
        "दादाजी कार से अपनी छोटी दूरबीन लाकर स्थिर चमकते 'तारे' की ओर करते हैं। कबीर को एक नन्ही गोल चकती दिखती है। वह क्या है, और क्यों नहीं टिमटिमाता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A planet: a disc of many points of light, so the flicker averages out",
            "एक ग्रह: प्रकाश के कई बिंदुओं की चकती, इसलिए झिलमिलाहट औसत में मिट जाती है",
          ),
        },
        {
          id: "star",
          label: t("A very close star", "एक बहुत पास का तारा"),
          feedback: t(
            "Even the nearest stars look like points, even through a telescope. A disc means a planet.",
            "सबसे पास के तारे भी बिंदु ही दिखते हैं, दूरबीन से भी। चकती का मतलब ग्रह है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const note = w.body(
      t(
        "It's Venus. And Kabir works out the shimmer above the chai stove for himself: the same thing on a small scale, hot air instead of the whole sky. Notebook Q3 done. Grandpa reminds everyone to set an alarm: sunrise is at 6:10 tomorrow, but they'll see it at about 6:08.",
        "वह शुक्र है। और चाय के चूल्हे के ऊपर की झिलमिलाहट कबीर ख़ुद समझ लेता है: वही बात छोटे पैमाने पर, पूरे आसमान के बजाय गर्म हवा। कॉपी का सवाल 3 पूरा। दादाजी सबको अलार्म लगाने की याद दिलाते हैं: कल सूर्योदय 6:10 पर है, पर वे उसे लगभग 6:08 पर देखेंगे।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(telescope.on(QuestionSignal.Correct), [theBoard.show(note), theBoard.pass()]);
    return column([w.title(t("Not a star", "तारा नहीं")), sky, telescope, note, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercises 10 and 11, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ten = choiceQuestion(b, {
      name: "ten",
      prompt: t("Why do stars twinkle?", "तारे क्यों टिमटिमाते हैं?"),
      options: [
        {
          id: "right",
          label: t(
            "Changing air keeps refracting starlight differently, so it flickers",
            "बदलती हवा तारे के प्रकाश को अलग-अलग अपवर्तित करती है, इसलिए वह टिमटिमाता है",
          ),
        },
        {
          id: "burn",
          label: t(
            "Stars really burn brighter and fainter every second, like a candle flame",
            "तारे सचमुच हर पल तेज़ और मंद जलते हैं, मोमबत्ती की लौ की तरह",
          ),
          feedback: t(
            "Seen from space, above the air, stars shine steadily. The twinkle is made by our air.",
            "अंतरिक्ष से, हवा के ऊपर से, तारे स्थिर चमकते हैं। टिमटिमाहट हमारी हवा बनाती है।",
          ),
        },
        {
          id: "clouds",
          label: t(
            "Thin clouds keep drifting in front of them and dim them",
            "पतले बादल उनके सामने से गुज़रते रहते हैं और उन्हें धुँधला करते हैं",
          ),
          feedback: t(
            "Stars twinkle on perfectly clear nights too. It's the shifting refraction of the air.",
            "पूरी तरह साफ़ रातों में भी तारे टिमटिमाते हैं। यह हवा का बदलता अपवर्तन है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Notebook Q3: air with a changing refractive index bends light: hot air shimmers, stars twinkle, planets don't. ✓ We see the Sun about 2 minutes early at sunrise and 2 minutes late at sunset. ? Notebook Q4–Q6: why do sunbeams show in mist, why is the sky blue, and why is the Sun red at sunrise? Next stop: the air scatters light.",
        "**मिशन लॉग।** ✓ कॉपी का सवाल 3: बदलते अपवर्तनांक वाली हवा प्रकाश को मोड़ती है: गर्म हवा झिलमिलाती है, तारे टिमटिमाते हैं, ग्रह नहीं। ✓ हम सूरज को सूर्योदय पर लगभग 2 मिनट पहले और सूर्यास्त पर 2 मिनट बाद तक देखते हैं। ? कॉपी के सवाल 4–6: धुंध में धूप की किरणें क्यों दिखती हैं, आसमान नीला क्यों है, और सूर्योदय पर सूरज लाल क्यों? अगला पड़ाव: हवा प्रकाश को बिखेरती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ten.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ten, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, hotAir, twinkle, sunrise, inLife, yourTurn];
