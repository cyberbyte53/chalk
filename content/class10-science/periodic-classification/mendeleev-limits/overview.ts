import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { Anomaly, MendeleevAction, MendeleevMode, PeriodicScene } from "@chalk/prop-periodic";
import { ask, mendeleevOn, oneByOne, sceneOn } from "../kit";

/** The hydrogen card won't stay put. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const h = sceneOn(
    b,
    "h",
    PeriodicScene.HydrogenCard,
    "Kabir holding the hydrogen card, pinning it above lithium, then above fluorine, unable to decide",
  );
  return column([
    w.title(t("The card that won't sit still", "वह कार्ड जो टिकता नहीं")),
    h,
    w.body(
      t(
        "Last time: Mendeléev's wall left gaps, and the gaps predicted new elements. Kabir has almost every card pinned. Then he picks up **hydrogen**. He pins it above lithium. Then he moves it above fluorine. Then back again.",
        "पिछली बार: मेंडेलीफ़ की दीवार ने ख़ाली जगहें छोड़ीं, और उन जगहों ने नए तत्वों का अनुमान लगाया। कबीर ने लगभग हर कार्ड लगा दिया है। फिर वह **हाइड्रोजन** उठाता है। उसे लीथियम के ऊपर लगाता है। फिर फ़्लुओरीन के ऊपर खिसका देता है। फिर वापस।",
      ),
    ),
    w.body(
      t("Stop 4: where does Mendeléev's table fall short?", "पड़ाव 4: मेंडेलीफ़ की सारणी कहाँ चूकती है?"),
    ),
    space(),
  ]);
});

/** Hydrogen: like the alkali metals, and like the halogens. */
const hydrogen = page(
  "hydrogen",
  (b) => {
    const w = wordsOn(b);
    const p = mendeleevOn(b, "p", MendeleevMode.Anomalies, { anomaly: Anomaly.Hydrogen });
    b.standsFor(
      p,
      "the hydrogen card in the middle, with arrows to two families it resembles: Li, Na, K (alkali metals) on one side and F, Cl, Br (halogens) on the other",
    );
    const q = ask(
      b,
      "q",
      ["So where did Mendeléev's table put hydrogen?", "तो मेंडेलीफ़ की सारणी ने हाइड्रोजन को कहाँ रखा?"],
      ["Nowhere fixed: it fits two families", "कहीं पक्का नहीं: यह दो परिवारों में फ़िट होता है"],
      [
        [
          "Firmly with the halogens, in group VII",
          "पक्के तौर पर हैलोजनों के साथ, समूह VII में",
          "Its compounds like HCl and H₂O look like the alkali metals' too.",
          "इसके यौगिक, जैसे HCl और H₂O, क्षार धातुओं जैसे भी दिखते हैं।",
        ],
        [
          "Firmly with the alkali metals, in group I",
          "पक्के तौर पर क्षार धातुओं के साथ, समूह I में",
          "It is also diatomic and makes covalent compounds, like the halogens.",
          "यह द्विपरमाणुक भी है और सहसंयोजी यौगिक बनाता है, हैलोजनों जैसे।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Hydrogen has no home", "हाइड्रोजन का कोई घर नहीं")),
      w.definition(
        t(
          "**Alkali metals, halogens.** Lithium, sodium and potassium are called the **alkali metals**. Fluorine, chlorine, bromine and iodine are called the **halogens**.",
          "**क्षार धातुएँ, हैलोजन।** लीथियम, सोडियम और पोटैशियम को **क्षार धातुएँ** कहते हैं। फ़्लुओरीन, क्लोरीन, ब्रोमीन और आयोडीन को **हैलोजन** कहते हैं।",
        ),
      ),
      w.body(
        t(
          "Hydrogen's electronic configuration is like the alkali metals', and it forms compounds with matching formulae: HCl like NaCl, H₂O like Na₂O, H₂S like Na₂S.",
          "हाइड्रोजन का इलेक्ट्रॉनिक विन्यास क्षार धातुओं जैसा है, और यह मिलते-जुलते सूत्रों वाले यौगिक बनाता है: HCl, NaCl जैसा; H₂O, Na₂O जैसा; H₂S, Na₂S जैसा।",
        ),
      ),
      w.body(
        t(
          "But like the halogens, hydrogen exists as **diatomic** molecules (H₂, two atoms joined), and it forms **covalent** compounds with metals and non-metals.",
          "पर हैलोजनों की तरह, हाइड्रोजन **द्विपरमाणुक** अणुओं (H₂, दो परमाणु जुड़े) के रूप में रहता है, और धातुओं व अधातुओं के साथ **सहसंयोजी** यौगिक बनाता है।",
        ),
      ),
      p,
      w.body(
        t(
          "No fixed position could be given to hydrogen. This was the **first limitation** of Mendeléev's table.",
          "हाइड्रोजन को कोई पक्की जगह नहीं दी जा सकी। यह मेंडेलीफ़ की सारणी की **पहली सीमा** थी।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Isotopes: same chemistry, different mass. */
const isotopes = page(
  "isotopes",
  (b) => {
    const w = wordsOn(b);
    const p = mendeleevOn(b, "p", MendeleevMode.Anomalies, { anomaly: Anomaly.CoNi });
    b.standsFor(
      p,
      "the table's three problems to pick: cobalt before nickel, hydrogen, and the two chlorine isotopes Cl-35 and Cl-37 with the same chemistry but different masses",
    );
    const goal = goalQuestion(b, {
      about: p,
      prompt: t(
        "Pick the isotopes. Should Cl-35 and Cl-37 get one slot or two?",
        "समस्थानिक चुनो। Cl-35 और Cl-37 को एक खाना मिले या दो?",
      ),
      isMet: p.field("anomaly").eq(Anomaly.Isotopes),
      solve: [p.learner(MendeleevAction.PickAnomaly, { anomaly: Anomaly.Isotopes })],
    });
    return column([
      w.title(t("Isotopes and uneven masses", "समस्थानिक और असमान द्रव्यमान")),
      w.definition(
        t(
          "**Isotopes.** Atoms of the same element with **different atomic masses** are its **isotopes**. They have **the same chemical properties**. Chlorine has two: **Cl-35** and **Cl-37**. Isotopes were discovered long after Mendeléev made his table.",
          "**समस्थानिक।** एक ही तत्व के ऐसे परमाणु जिनके **परमाणु द्रव्यमान अलग** हों, उसके **समस्थानिक** हैं। उनके **रासायनिक गुण समान** होते हैं। क्लोरीन के दो हैं: **Cl-35** और **Cl-37**। समस्थानिक मेंडेलीफ़ की सारणी बनने के बहुत बाद खोजे गए।",
        ),
      ),
      p,
      goal,
      w.body(
        t(
          "By mass, Cl-35 and Cl-37 need different slots. By chemistry, they need the same one. Isotopes of every element posed this challenge to a law based on atomic mass.",
          "द्रव्यमान से, Cl-35 और Cl-37 को अलग खाने चाहिए। रसायन से, उन्हें एक ही खाना चाहिए। हर तत्व के समस्थानिकों ने परमाणु द्रव्यमान पर आधारित नियम के सामने यही चुनौती रखी।",
        ),
      ),
      w.body(
        t(
          "One more problem: atomic masses do **not increase in regular steps** from one element to the next. So Mendeléev couldn't say how many elements were still to be found between two known ones, especially among the heavy elements.",
          "एक और समस्या: परमाणु द्रव्यमान एक तत्व से अगले तक **नियमित क़दमों में नहीं बढ़ते**। इसलिए मेंडेलीफ़ नहीं बता सकते थे कि दो ज्ञात तत्वों के बीच कितने तत्व अभी मिलने बाक़ी हैं, ख़ासकर भारी तत्वों में।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to Kabir and his hydrogen card. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const h = sceneOn(b, "h", PeriodicScene.HydrogenCard, "Kabir with the hydrogen card again");
    const q = ask(
      b,
      "q",
      [
        "Kabir also has two chlorine cards: Cl-35 and Cl-37. With a wall ordered by mass, what goes wrong?",
        "कबीर के पास क्लोरीन के दो कार्ड भी हैं: Cl-35 और Cl-37। द्रव्यमान से सजी दीवार पर क्या गड़बड़ होती है?",
      ],
      ["They'd be split apart, though they behave alike", "वे अलग हो जाएँगे, जबकि वे एक जैसे हैं"],
      [
        [
          "They'd sit together, though they behave differently",
          "वे साथ बैठेंगे, जबकि वे अलग व्यवहार करते हैं",
          "Isotopes have the same chemistry. Mass is what pulls them apart.",
          "समस्थानिकों का रसायन एक है। द्रव्यमान उन्हें अलग करता है।",
        ],
        [
          "Nothing: they have the same atomic mass",
          "कुछ नहीं: उनका परमाणु द्रव्यमान एक है",
          "Their masses differ, 35 and 37. That's what isotopes are.",
          "उनके द्रव्यमान अलग हैं, 35 और 37। समस्थानिक यही हैं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Two awkward cards", "दो उलझे कार्ड")),
      h,
      w.body(
        t(
          "Kabir gives up and pins hydrogen on its own, above both columns, with a question mark. Grandpa nods. **\"That's honest. Mendeléev couldn't place it either.\"**",
          'कबीर हार मानकर हाइड्रोजन को अकेले, दोनों स्तंभों के ऊपर, एक प्रश्नचिह्न के साथ लगा देता है। दादाजी सिर हिलाते हैं। **"यह ईमानदार है। मेंडेलीफ़ भी इसे नहीं रख पाए।"**',
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Practice: the limits; the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      ["Which is NOT a limitation of Mendeléev's table?", "कौन-सी मेंडेलीफ़ की सारणी की सीमा नहीं है?"],
      ["It left gaps for undiscovered elements", "इसने अज्ञात तत्वों के लिए ख़ाली जगहें छोड़ीं"],
      [
        [
          "It gave hydrogen no fixed position",
          "इसने हाइड्रोजन को कोई पक्की जगह नहीं दी",
          "That is a limitation: hydrogen fits two families.",
          "यह एक सीमा है: हाइड्रोजन दो परिवारों में फ़िट होता है।",
        ],
        [
          "It had no clear place for isotopes",
          "इसमें समस्थानिकों के लिए कोई साफ़ जगह नहीं थी",
          "That is a limitation: their masses differ, their chemistry doesn't.",
          "यह एक सीमा है: उनके द्रव्यमान अलग हैं, रसायन नहीं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Why couldn't Mendeléev say how many elements were missing between two heavy ones?",
        "मेंडेलीफ़ क्यों नहीं बता सकते थे कि दो भारी तत्वों के बीच कितने तत्व छूटे हैं?",
      ],
      ["Masses don't rise in regular steps", "द्रव्यमान नियमित क़दमों में नहीं बढ़ते"],
      [
        [
          "Heavy elements have no oxides",
          "भारी तत्वों के ऑक्साइड नहीं होते",
          "They do form oxides. The trouble is the uneven jumps in mass.",
          "वे ऑक्साइड बनाते हैं। समस्या द्रव्यमान की असमान छलाँगें हैं।",
        ],
        [
          "Heavy elements all have isotopes",
          "सभी भारी तत्वों के समस्थानिक होते हैं",
          "Isotopes are a separate problem. Here it's the uneven mass steps.",
          "समस्थानिक अलग समस्या है। यहाँ बात असमान द्रव्यमान क़दमों की है।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✗ Hydrogen has no fixed place. ✗ Isotopes would need two slots by mass but one by chemistry. ✗ Uneven masses hide how many elements are missing. All three come from ordering by **mass**. Next: a better number to order the cards by.",
        "**मिशन लॉग।** ✗ हाइड्रोजन की कोई पक्की जगह नहीं। ✗ समस्थानिकों को द्रव्यमान से दो खाने चाहिए, रसायन से एक। ✗ असमान द्रव्यमान छिपाते हैं कि कितने तत्व छूटे हैं। तीनों **द्रव्यमान** से क्रम देने के कारण हैं। आगे: कार्डों को सजाने के लिए एक बेहतर संख्या।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q1, q2], [log]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, hydrogen, isotopes, inLife, yourTurn];
