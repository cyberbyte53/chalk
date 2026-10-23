import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EyeSceneKind,
  ScatterAction,
  ScatterKind,
  TyndallPlace,
  eyeSceneDef,
  scatteringDef,
} from "@chalk/prop-eye";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The walk through the misty forest to the sunrise point. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const forest = b.prop(eyeSceneDef, "forest", { scene: EyeSceneKind.MistyForest });
  b.standsFor(
    forest,
    "the family walking through a misty pine forest before dawn, pale beams of light slanting down between the trees",
  );
  return column([
    w.title(t("Beams in the mist", "धुंध में किरणें")),
    forest,
    w.body(
      t(
        "**Stop 7, the last.** At 5:30 a.m. the family walks through a pine forest to the sunrise point. The forest is misty, and the first light comes down between the trees in pale, solid-looking beams, like spotlights.",
        "**पड़ाव 7, आख़िरी।** सुबह 5:30 बजे परिवार चीड़ के जंगल से होकर सूर्योदय बिंदु की ओर जाता है। जंगल में धुंध है, और पहला प्रकाश पेड़ों के बीच से हल्की, ठोस-सी दिखती किरणों में उतरता है, स्पॉटलाइट की तरह।",
      ),
    ),
    w.body(
      t(
        "Kabir has the last questions of the notebook ready. Q4: **why can we see these beams at all?** Q5: **why is the sky blue?** Q6: **why will the Sun be red when it rises, but white at noon?**",
        "कबीर ने कॉपी के आख़िरी सवाल तैयार रखे हैं। सवाल 4: **हम इन किरणों को देख क्यों पाते हैं?** सवाल 5: **आसमान नीला क्यों है?** सवाल 6: **उगते समय सूरज लाल क्यों होगा, पर दोपहर में सफ़ेद?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Scattering and the Tyndall effect. */
const tyndall = page(
  "tyndall",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 11.6.1: fine particles in the air (smoke, droplets, dust, air molecules) scatter light, making a beam's path visible: the Tyndall effect. The colour scattered depends on particle size: very fine particles scatter mainly blue, larger ones longer wavelengths, large enough ones white.",
    );
    const room = b.prop(scatteringDef, "room", {
      kind: ScatterKind.Tyndall,
      place: TyndallPlace.Room,
      hasParticles: false,
      showNames: true,
      canChange: true,
    });
    b.studentOnly(room.action(ScatterAction.SetParticles));
    b.standsFor(
      room,
      "a dark room with sunlight coming through a small hole: with clean air the beam can't be seen, only the spot it makes on the floor; with smoke the whole beam glows",
    );
    b.witness(room.learner(ScatterAction.SetParticles, { on: true }));
    const visible = choiceQuestion(b, {
      name: "visible",
      prompt: t(
        "Add smoke. Why does the beam suddenly become visible?",
        "धुआँ डालो। किरण अचानक दिखाई क्यों देने लगती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Smoke particles scatter some of its light sideways, into your eyes",
            "धुएँ के कण उसका कुछ प्रकाश बग़ल में, तुम्हारी आँखों में बिखेरते हैं",
          ),
        },
        {
          id: "glow",
          label: t(
            "The smoke glows by itself when light falls on it",
            "प्रकाश पड़ने पर धुआँ ख़ुद चमकने लगता है",
          ),
          feedback: t(
            "Smoke makes no light. Only where the sunbeam passes do the particles light up: they are sending its light to you.",
            "धुआँ प्रकाश नहीं बनाता। केवल जहाँ किरण गुज़रती है वहीं कण चमकते हैं: वे उसका प्रकाश तुम तक भेज रहे हैं।",
          ),
        },
        {
          id: "brighter",
          label: t(
            "The smoke adds its own light to the beam, making the whole beam brighter",
            "धुआँ किरण-पुंज में अपना प्रकाश जोड़कर पूरे पुंज को तेज़ करता है",
          ),
          feedback: t(
            "The beam was just as bright in clean air. You couldn't see it because none of its light was turned towards you.",
            "साफ़ हवा में भी किरण उतनी ही चमकीली थी। तुम उसे देख नहीं पाए क्योंकि उसका कोई प्रकाश तुम्हारी ओर नहीं मुड़ा।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Seeing a beam", "किरण को देखना")),
      w.body(
        t(
          "Recall from Class 9: in a **true solution** (like salt in water) the particles are too tiny to see, and a beam passing through can't be seen. In a **colloid** the particles are bigger, though still too small to see, and the beam's path shows up.",
          "कक्षा 9 से याद करो: **वास्तविक विलयन** (जैसे पानी में नमक) में कण देखने के लिए बहुत नन्हे होते हैं, और उससे गुज़रती किरण दिखती नहीं। **कोलॉइड** में कण बड़े होते हैं, फिर भी देखने के लिए बहुत छोटे, और किरण का रास्ता दिखने लगता है।",
        ),
      ),
      room,
      w.definition(
        t(
          "**Scattering and the Tyndall effect.** When light strikes tiny particles, they send some of it off in all directions. This is **scattering** of light. The earth's air is full of fine particles: smoke, tiny water droplets, dust, and the molecules of air themselves. When a beam passes through such particles, the scattered light reaches our eyes and the **path of the beam becomes visible**: the **Tyndall effect**. You see it when a thin sunbeam enters a smoky room, or when sunlight passes through the canopy of a misty forest.",
          "**प्रकीर्णन और टिंडल प्रभाव।** जब प्रकाश नन्हे कणों से टकराता है, वे उसका कुछ हिस्सा हर दिशा में भेज देते हैं। यह प्रकाश का **प्रकीर्णन** है। पृथ्वी की हवा बारीक कणों से भरी है: धुआँ, पानी की नन्ही बूँदें, धूल, और ख़ुद हवा के अणु। जब कोई किरण ऐसे कणों से गुज़रती है, बिखरा प्रकाश हमारी आँखों तक पहुँचता है और **किरण का रास्ता दिखने लगता है**: **टिंडल प्रभाव**। यह तब दिखता है जब धुएँ भरे कमरे में एक पतली धूप की किरण आती है, या धुंध भरे जंगल की छत से धूप गुज़रती है।",
        ),
      ),
      visible,
      w.definition(
        t(
          "**Wavelength.** Light travels as a wave, and each colour has its own **wavelength**: the length of one wave. Blue light has a short wavelength; red light's is about **1.8 times longer**.",
          "**तरंगदैर्घ्य।** प्रकाश तरंग के रूप में चलता है, और हर रंग की अपनी **तरंगदैर्घ्य** होती है: एक तरंग की लंबाई। नीले प्रकाश की तरंगदैर्घ्य छोटी है; लाल की लगभग **1.8 गुना लंबी** है।",
        ),
      ),
      w.definition(
        t(
          "**Size sets the colour.** The colour of the scattered light depends on the size of the particles. **Very fine** particles scatter mainly **blue** light. Larger particles scatter light of longer wavelengths too, and if they are large enough, the scattered light looks **white**.",
          "**आकार रंग तय करता है।** बिखरे प्रकाश का रंग कणों के आकार पर निर्भर है। **बहुत बारीक** कण मुख्यतः **नीला** प्रकाश बिखेरते हैं। बड़े कण लंबी तरंगदैर्घ्य का प्रकाश भी बिखेरते हैं, और अगर वे काफ़ी बड़े हों, तो बिखरा प्रकाश **सफ़ेद** दिखता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why the sky is blue; dark for an astronaut. */
const skyBlue = page(
  "sky-blue",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 11.6.2: air molecules are smaller than the wavelength of visible light and scatter blue (shorter wavelength) much more than red (about 1.8 times longer wavelength); the scattered blue reaches our eyes from all over the sky. Without an atmosphere the sky would be dark.",
    );
    const sky = b.prop(scatteringDef, "sky", {
      kind: ScatterKind.SkyBlue,
      hasAir: true,
      showNames: true,
      canChange: true,
    });
    b.studentOnly(sky.action(ScatterAction.SetAir));
    b.standsFor(
      sky,
      "sunlight crossing the sky above an observer: air molecules scatter its blue part towards the observer from all directions, so the sky looks blue; a switch removes the air, and the sky goes black",
    );
    b.witness(sky.learner(ScatterAction.SetAir, { on: false }));
    const astronaut = choiceQuestion(b, {
      name: "astronaut",
      prompt: t(
        "Take the air away. Why does the sky look dark to an astronaut instead of blue?",
        "हवा हटाओ। अंतरिक्ष यात्री को आसमान नीले के बजाय काला क्यों दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "There's no air up there to scatter sunlight to the eye",
            "वहाँ ऊपर सूर्य के प्रकाश को आँख तक बिखेरने के लिए हवा नहीं है",
          ),
        },
        {
          id: "night",
          label: t(
            "It is always night in space, even near the Sun",
            "अंतरिक्ष में हमेशा रात होती है, सूरज के पास भी",
          ),
          feedback: t(
            "The Sun shines brightly in space. The sky is dark because nothing scatters its light.",
            "अंतरिक्ष में सूरज तेज़ चमकता है। आसमान काला है क्योंकि कुछ भी उसके प्रकाश को नहीं बिखेरता।",
          ),
        },
        {
          id: "far",
          label: t(
            "The Sun is too far away to light up the sky there",
            "सूरज वहाँ आसमान रोशन करने के लिए बहुत दूर है",
          ),
          feedback: t(
            "An astronaut is a little closer to the Sun than we are! What's missing is the air.",
            "अंतरिक्ष यात्री हमसे थोड़ा सूरज के पास ही है! जो नहीं है वह हवा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why the sky is blue", "आसमान नीला क्यों है")),
      w.body(
        t(
          "Recall from the last page: blue has a short wavelength, and red's is about 1.8 times longer.",
          "पिछले पन्ने से याद करो: नीले की तरंगदैर्घ्य छोटी है, और लाल की लगभग 1.8 गुना लंबी।",
        ),
      ),
      w.body(
        t(
          "The molecules of air are even smaller than these wavelengths. Particles that small scatter **short** wavelengths (the blue end) much more strongly than **long** ones (the red end). So as sunlight crosses the sky, its blue light is scattered in every direction, and some reaches your eyes from wherever you look. The sky looks **blue**.",
          "हवा के अणु इन तरंगदैर्घ्यों से भी छोटे हैं। इतने छोटे कण **छोटी** तरंगदैर्घ्य (नीले सिरे) को **लंबी** (लाल सिरे) से कहीं ज़्यादा बिखेरते हैं। तो धूप जब आसमान पार करती है, उसका नीला प्रकाश हर दिशा में बिखरता है, और तुम जहाँ भी देखो, कुछ तुम्हारी आँखों तक पहुँचता है। आसमान **नीला** दिखता है।",
        ),
      ),
      sky,
      w.body(
        t(
          "If the earth had no air, nothing would scatter the sunlight, and the sky would look **dark**. Passengers flying very high see a much darker sky, because there is little air left above them.",
          "अगर पृथ्वी पर हवा न होती, तो धूप को कुछ भी नहीं बिखेरता, और आसमान **काला** दिखता। बहुत ऊँचाई पर उड़ते यात्रियों को आसमान कहीं ज़्यादा गहरा दिखता है, क्योंकि उनके ऊपर बहुत कम हवा बचती है।",
        ),
      ),
      astronaut,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Danger signals are red. */
const danger = page(
  "danger",
  (b) => {
    const w = wordsOn(b);
    const red = choiceQuestion(b, {
      name: "red",
      prompt: t("Why are 'danger' signal lights red?", "'ख़तरे' के संकेत की बत्तियाँ लाल क्यों होती हैं?"),
      options: [
        {
          id: "right",
          label: t(
            "Red is scattered least by fog, so it reaches far",
            "कोहरा लाल को सबसे कम बिखेरता है, इसलिए वह दूर तक पहुँचता है",
          ),
        },
        {
          id: "bright",
          label: t(
            "Red bulbs are the brightest and cheapest to make",
            "लाल बल्ब सबसे चमकीले और सस्ते होते हैं",
          ),
          feedback: t(
            "A red bulb isn't brighter. Its light just survives the trip through fog best.",
            "लाल बल्ब ज़्यादा चमकीला नहीं होता। बस उसका प्रकाश कोहरे से होकर सबसे अच्छी तरह पहुँचता है।",
          ),
        },
        {
          id: "most",
          label: t(
            "Red is scattered the most, so it glows all around",
            "लाल सबसे ज़्यादा बिखरता है, इसलिए चारों ओर चमकता है",
          ),
          feedback: t(
            "It's the other way: blue scatters most. Red, with the longest wavelength, scatters least.",
            "उल्टा है: नीला सबसे ज़्यादा बिखरता है। लाल, सबसे लंबी तरंगदैर्घ्य वाला, सबसे कम।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Red for danger", "ख़तरे के लिए लाल")),
      w.body(
        t(
          "Turn the idea round. If short wavelengths are scattered most, then **red**, with the longest wavelength, is scattered **least**. Red light goes straight through fog or smoke where blue would be scattered away.",
          "बात को उलटो। अगर छोटी तरंगदैर्घ्य सबसे ज़्यादा बिखरती है, तो **लाल**, सबसे लंबी तरंगदैर्घ्य वाला, **सबसे कम** बिखरता है। लाल प्रकाश कोहरे या धुएँ से सीधा निकल जाता है जहाँ नीला बिखर जाता।",
        ),
      ),
      red,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The Sun's colour depends on how much air its light crosses. */
const sunColour = page(
  "sun-colour",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 11.6.3: light from the Sun near the horizon crosses much more air than at noon; most of its blue is scattered away on the way, so it looks red; at noon little is scattered, so it looks white.",
    );
    const path = b.prop(scatteringDef, "path", {
      kind: ScatterKind.SunPath,
      sunHeight: 90,
      showNames: true,
      canChange: true,
    });
    b.studentOnly(path.action(ScatterAction.SetSunHeight));
    b.standsFor(
      path,
      "the Sun at a chosen height above the horizon and the path its light takes through the curved layer of air to an observer: overhead the path is short and the Sun white; low down the path is many times longer and the Sun orange, then red",
    );
    b.witness(path.learner(ScatterAction.SetSunHeight, { deg: 0 }));
    const red = choiceQuestion(b, {
      name: "red",
      prompt: t(
        "Lower the Sun to sunrise. Why does it look red?",
        "सूरज को सूर्योदय तक नीचे लाओ। वह लाल क्यों दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Its light crosses more air, so most blue is scattered away first",
            "उसका प्रकाश ज़्यादा हवा पार करता है, इसलिए ज़्यादातर नीला पहले ही बिखर जाता है",
          ),
        },
        {
          id: "cool",
          label: t(
            "The morning Sun is cooler, so it glows red like a dying fire",
            "सुबह का सूरज ठंडा होता है, इसलिए बुझती आग की तरह लाल चमकता है",
          ),
          feedback: t(
            "The Sun itself is the same all day. What changes is the path through our air.",
            "सूरज ख़ुद दिन भर वैसा ही है। बदलता है हमारी हवा से होकर रास्ता।",
          ),
        },
        {
          id: "closer",
          label: t(
            "The Sun is closer at sunrise, so its red light is stronger",
            "सूर्योदय पर सूरज पास होता है, इसलिए उसका लाल प्रकाश तेज़ होता है",
          ),
          feedback: t(
            "Its distance doesn't change in a day. Look at the length of the path through the air.",
            "एक दिन में उसकी दूरी नहीं बदलती। हवा से होकर रास्ते की लंबाई देखो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A red Sun, a white Sun", "लाल सूरज, सफ़ेद सूरज")),
      w.body(
        t(
          "At noon the Sun is overhead, and its light crosses only a thin layer of air. Little blue is scattered, so the Sun looks **white**. Near the horizon its light comes in sideways, through much thicker layers of air. Move the Sun and watch the path grow.",
          "दोपहर में सूरज सिर के ऊपर होता है, और उसका प्रकाश हवा की केवल पतली परत पार करता है। थोड़ा ही नीला बिखरता है, इसलिए सूरज **सफ़ेद** दिखता है। क्षितिज के पास उसका प्रकाश तिरछा, हवा की कहीं मोटी परतों से आता है। सूरज को खिसकाओ और रास्ता बढ़ता देखो।",
        ),
      ),
      path,
      w.definition(
        t(
          "**Sunrise and sunset.** On its long path near the horizon, **most of the blue and the other short wavelengths are scattered away** by the particles in the air. The light that finally reaches our eyes is mostly the longer wavelengths, so the Sun, and the sky around it, look **reddish**.",
          "**सूर्योदय और सूर्यास्त।** क्षितिज के पास के लंबे रास्ते पर हवा के कण **ज़्यादातर नीला और बाक़ी छोटी तरंगदैर्घ्य बिखेर देते हैं**। जो प्रकाश आख़िर में हमारी आँखों तक पहुँचता है, वह ज़्यादातर लंबी तरंगदैर्घ्य का होता है, इसलिए सूरज, और उसके आसपास का आसमान, **लालिमा लिए** दिखते हैं।",
        ),
      ),
      red,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 11.3, the hypo tank. */
const tank = page(
  "tank",
  (b) => {
    const w = wordsOn(b);
    const hypo = b.prop(scatteringDef, "hypo", {
      kind: ScatterKind.HypoTank,
      isStarted: false,
      showNames: true,
      canChange: true,
    });
    b.studentOnly(hypo.action(ScatterAction.Start));
    b.studentOnly(hypo.action(ScatterAction.Reset));
    b.standsFor(
      hypo,
      "NCERT's set-up: a lamp at the focus of a lens sends a parallel beam through a glass tank of water, through a hole in a card and a second lens onto a screen; adding the acid makes fine sulphur particles form, the sides of the tank glow blue and the spot on the screen turns orange-red, then crimson",
    );
    b.witness(hypo.learner(ScatterAction.Start));
    const sides = choiceQuestion(b, {
      name: "sides",
      prompt: t(
        "Add the acid and wait. Which part of the experiment acts like the **sky**, and which like the **setting Sun**?",
        "अम्ल डालो और रुको। प्रयोग का कौन-सा हिस्सा **आसमान** जैसा है, और कौन-सा **डूबते सूरज** जैसा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The blue glow from the sides is the sky; the reddening spot on the screen is the setting Sun",
            "बगलों से नीली चमक आसमान है; पर्दे पर लाल होता धब्बा डूबता सूरज है",
          ),
        },
        {
          id: "swap",
          label: t(
            "The red spot is the sky; the blue sides are the Sun",
            "लाल धब्बा आसमान है; नीली बगलें सूरज",
          ),
          feedback: t(
            "The sides glow with light scattered sideways, like the sky. The spot is the light that came straight through a long path, like the Sun.",
            "बगलें बग़ल में बिखरे प्रकाश से चमकती हैं, आसमान की तरह। धब्बा वह प्रकाश है जो लंबे रास्ते से सीधा आया, सूरज की तरह।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A sunset in a tank", "टैंक में सूर्यास्त")),
      w.body(
        t(
          "NCERT's Activity 11.3 makes a sky and a sunset in the lab. A beam of white light passes through a glass tank of water onto a screen. About 200 g of hypo (sodium thiosulphate) is dissolved in 2 L of water, and 1–2 mL of concentrated sulphuric acid is added. Over 2–3 minutes, very fine particles of sulphur form in the water.",
          "एनसीईआरटी की क्रियाकलाप 11.3 प्रयोगशाला में आसमान और सूर्यास्त बनाती है। सफ़ेद प्रकाश का पुंज पानी भरे काँच के टैंक से होकर पर्दे पर पड़ता है। 2 लीटर पानी में लगभग 200 ग्राम हाइपो (सोडियम थायोसल्फ़ेट) घोला जाता है, और 1–2 मिलीलीटर सांद्र सल्फ़्यूरिक अम्ल डाला जाता है। 2–3 मिनट में पानी में सल्फ़र के बहुत बारीक कण बनते हैं।",
        ),
      ),
      hypo,
      w.body(
        t(
          "As the sulphur forms, **blue** light is seen from three sides of the tank: short wavelengths scattered by the tiny particles. The light coming straight through to the screen turns **orange-red**, then bright **crimson**: the blue has been scattered out of it.",
          "जैसे-जैसे सल्फ़र बनता है, टैंक की तीन बगलों से **नीला** प्रकाश दिखता है: नन्हे कणों से बिखरी छोटी तरंगदैर्घ्य। सीधा पर्दे तक आता प्रकाश **नारंगी-लाल**, फिर चमकीला **किरमिज़ी** हो जाता है: उसमें से नीला बिखर चुका है।",
        ),
      ),
      sides,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The sunrise point. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const point = b.prop(eyeSceneDef, "point", { scene: EyeSceneKind.SunrisePoint });
    b.standsFor(point, "the family on a ridge watching a big red Sun rise over the hills");
    const beams = choiceQuestion(b, {
      name: "beams",
      prompt: t(
        "First, Q4: why could the family see the sunbeams in the misty forest?",
        "पहले सवाल 4: परिवार धुंध भरे जंगल में धूप की किरणें क्यों देख पाया?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The mist's tiny water droplets scattered the light towards them: the Tyndall effect",
            "धुंध की नन्ही बूँदों ने प्रकाश को उनकी ओर बिखेरा: टिंडल प्रभाव",
          ),
        },
        {
          id: "refract",
          label: t("The air bent the light into beams", "हवा ने प्रकाश को मोड़कर किरणें बना दीं"),
          feedback: t(
            "Bending wouldn't make a beam visible from the side. Something has to send its light sideways: the droplets.",
            "मुड़ना किसी किरण को बग़ल से दिखने लायक़ नहीं बनाता। किसी चीज़ को उसका प्रकाश बग़ल में भेजना होता है: बूँदें।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const sun = choiceQuestion(b, {
      name: "sun",
      prompt: t(
        "At 6:08 the Sun appears, big and red, a little flattened. Which **two** effects are they seeing at once?",
        "6:08 पर सूरज दिखता है, बड़ा और लाल, थोड़ा चपटा। वे एक साथ कौन-से **दो** प्रभाव देख रहे हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Atmospheric refraction (seen 2 minutes early, flattened) and scattering (the blue removed on the long path, so red)",
            "वायुमंडलीय अपवर्तन (2 मिनट पहले दिखना, चपटापन) और प्रकीर्णन (लंबे रास्ते पर नीला हट जाना, इसलिए लाल)",
          ),
        },
        {
          id: "dispersion",
          label: t("Dispersion and the Tyndall effect", "विक्षेपण और टिंडल प्रभाव"),
          feedback: t(
            "There's no prism or raindrop splitting the light here. The early, flattened Sun is refraction by the air; the red colour is scattering.",
            "यहाँ प्रकाश को बाँटने वाला कोई प्रिज़्म या बूँद नहीं है। जल्दी दिखता, चपटा सूरज हवा का अपवर्तन है; लाल रंग प्रकीर्णन है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(beams.on(QuestionSignal.Correct), theBoard.show(sun));
    return column([
      w.title(t("Sunrise point", "सूर्योदय बिंदु")),
      point,
      w.body(
        t(
          "They reach the ridge at 6:05. Below them the valley is full of mist, and the sky above is turning from dark to pale blue. Kabir opens the notebook.",
          "वे 6:05 पर चोटी पर पहुँचते हैं। नीचे घाटी धुंध से भरी है, और ऊपर आसमान काले से हल्का नीला हो रहा है। कबीर कॉपी खोलता है।",
        ),
      ),
      beams,
      sun,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercises 12 and 13. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const clouds = choiceQuestion(b, {
      name: "clouds",
      prompt: t(
        "Clouds are made of water droplets much larger than air molecules. What colour do they scatter, and so what colour do they look?",
        "बादल हवा के अणुओं से कहीं बड़ी पानी की बूँदों से बने होते हैं। वे कौन-सा रंग बिखेरते हैं, और इसलिए किस रंग के दिखते हैं?",
      ),
      options: [
        { id: "right", label: t("All colours about equally: white", "सब रंग लगभग बराबर: सफ़ेद") },
        {
          id: "blue",
          label: t("Mostly blue: they look blue", "ज़्यादातर नीला: वे नीले दिखते हैं"),
          feedback: t(
            "Only very fine particles pick out blue. Particles as big as droplets scatter all wavelengths, which looks white.",
            "केवल बहुत बारीक कण नीला चुनते हैं। बूँदों जितने बड़े कण सब तरंगदैर्घ्य बिखेरते हैं, जो सफ़ेद दिखता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), clouds, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The finale: the notebook is full. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const point = b.prop(eyeSceneDef, "point", { scene: EyeSceneKind.SunrisePoint });
  b.standsFor(point, "the family on the ridge in the sunrise, Kabir's notebook open");
  return column([
    w.title(t("The notebook is full", "कॉपी भर गई")),
    point,
    w.body(
      t(
        "The Sun clears the hills and turns from red to orange to yellow as its path through the air gets shorter. Riya, in her new glasses, can read the signboard on the far ridge. Grandpa, in his bifocals, reads Kabir's notebook. Kabir ticks the last box.",
        "सूरज पहाड़ियों के ऊपर आता है और हवा से होकर उसका रास्ता छोटा होने के साथ लाल से नारंगी से पीला होता है। अपने नए चश्मे में रिया दूर की चोटी का बोर्ड पढ़ लेती है। अपने द्विफ़ोकसी चश्मे में दादाजी कबीर की कॉपी पढ़ते हैं। कबीर आख़िरी खाने पर निशान लगाता है।",
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** *Part A:* (1) The eye is a camera: cornea and lens make a real, inverted image on the retina; the iris sets the pupil. (2) The ciliary muscles change the lens: accommodation, from 25 cm to infinity. (3) Myopia → concave lens; hypermetropia → convex lens; presbyopia → convex lens, or bifocals. *Part B:* (4) A prism turns light through the angle of deviation. (5) It disperses white light into VIBGYOR; drops do the same, making rainbows opposite the Sun. (6) The air refracts light: stars twinkle, planets don't, the Sun rises 2 minutes early. (7) The air scatters light: the Tyndall effect, the blue sky, red danger lights and a red sunrise.",
        "**मिशन पूरा।** *भाग A:* (1) आँख एक कैमरा है: कॉर्निया और लेंस दृष्टिपटल पर वास्तविक, उल्टा प्रतिबिंब बनाते हैं; परितारिका पुतली तय करती है। (2) पक्ष्माभी पेशियाँ लेंस बदलती हैं: समंजन, 25 सेमी से अनंत तक। (3) निकट-दृष्टिता → अवतल लेंस; दूर-दृष्टिता → उत्तल लेंस; जरा-दूरदृष्टिता → उत्तल लेंस, या द्विफ़ोकसी। *भाग B:* (4) प्रिज़्म प्रकाश को विचलन कोण से मोड़ता है। (5) वह सफ़ेद प्रकाश को VIBGYOR में विक्षेपित करता है; बूँदें भी यही करती हैं, सूरज के विपरीत इंद्रधनुष बनाते हुए। (6) हवा प्रकाश का अपवर्तन करती है: तारे टिमटिमाते हैं, ग्रह नहीं, सूरज 2 मिनट पहले उगता है। (7) हवा प्रकाश का प्रकीर्णन करती है: टिंडल प्रभाव, नीला आसमान, ख़तरे की लाल बत्तियाँ और लाल सूर्योदय।",
      ),
    ),
    w.body(
      t(
        "On the way down, Kabir starts a new notebook. The first question: *how does the torch in my bag actually make light?* That's electricity, and it's the next chapter.",
        "नीचे उतरते हुए कबीर एक नई कॉपी शुरू करता है। पहला सवाल: *मेरे बैग की टॉर्च असल में प्रकाश कैसे बनाती है?* वह विद्युत है, और वही अगला अध्याय है।",
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, tyndall, skyBlue, danger, sunColour, tank, inLife, yourTurn, finale];
