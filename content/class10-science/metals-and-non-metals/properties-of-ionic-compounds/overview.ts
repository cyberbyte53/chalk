import type { BoardKit } from "@chalk/author";
import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { IonicSalt, SaltForm, TesterAction, ionicTesterDef } from "@chalk/prop-chemistry";
import { MetalSceneKind, sceneOn } from "../kit";

/** The salt tester: a salt as a solid, in water, in kerosene, or molten, in a circuit with a bulb. */
function testerOn(
  b: BoardKit,
  name: string,
  options: { forms: SaltForm[]; form?: SaltForm; salts?: IonicSalt[] },
) {
  const tester = b.prop(ionicTesterDef, name, {
    salt: options.salts?.[0] ?? IonicSalt.SodiumChloride,
    form: options.form ?? options.forms[0] ?? SaltForm.Solid,
    isOn: false,
    forms: options.forms,
    salts: options.salts ?? [],
    showIons: true,
  });
  b.studentOnly(tester.action(TesterAction.SetForm));
  b.studentOnly(tester.action(TesterAction.Switch));
  if ((options.salts ?? []).length > 0) b.studentOnly(tester.action(TesterAction.Choose));
  return tester;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pans = sceneOn(
    b,
    "pans",
    MetalSceneKind.KitchenPans,
    "Mom in the kitchen at the stove, Kabir at the sink with wet hands",
  );
  return column([
    w.title(t("Don't touch the switch!", "स्विच मत छूना!")),
    pans,
    w.body(
      t(
        'Kabir comes from the sink with salty, wet hands and reaches for the light switch. Mom: **"Dry your hands first!"** Kabir: "It\'s only water." Riya isn\'t so sure: pure water hardly conducts, but water with salt in it might.',
        'कबीर नमकीन, गीले हाथों से सिंक से आता है और बत्ती के स्विच की ओर हाथ बढ़ाता है। मम्मी: **"पहले हाथ सुखाओ!"** कबीर: "यह तो बस पानी है।" रिया को इतना यक़ीन नहीं: शुद्ध पानी मुश्किल से चालन करता है, पर नमक मिला पानी शायद करे।',
      ),
    ),
    w.body(
      t(
        "Clue 6: what are ionic compounds like, and when do they conduct electricity?",
        "सुराग 6: आयनिक यौगिक कैसे होते हैं, और वे विद्युत का चालन कब करते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 3.13: solid, hard but brittle; high melting and boiling points (Table 3.4). */
const physical = page(
  "physical",
  (b) => {
    const w = wordsOn(b);
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why do ionic compounds have high melting points?",
        "आयनिक यौगिकों के गलनांक ऊँचे क्यों होते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A lot of energy is needed to break the strong attraction between the ions",
            "आयनों के बीच के प्रबल आकर्षण को तोड़ने में बहुत ऊर्जा लगती है",
          ),
        },
        {
          id: "heavy",
          label: t("Their ions are very heavy", "उनके आयन बहुत भारी हैं"),
          feedback: t(
            "Weight isn't the reason. The strong pull between opposite charges must be overcome.",
            "भार कारण नहीं है। विपरीत आवेशों के बीच के प्रबल खिंचाव को पार करना होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Hard, brittle, hard to melt", "कठोर, भंगुर, पिघलाना कठिन")),
      w.body(
        t(
          "NCERT Activity 3.13: take sodium chloride, potassium iodide and barium chloride. All three are solids. Heat a little on a spatula in a flame: they don't melt easily.",
          "NCERT क्रियाकलाप 3.13: सोडियम क्लोराइड, पोटैशियम आयोडाइड और बेरियम क्लोराइड लो। तीनों ठोस हैं। थोड़ा-सा चम्मच पर आँच में गर्म करो: वे आसानी से नहीं पिघलते।",
        ),
      ),
      w.definition(
        t(
          "**Physical nature.** Ionic compounds are **solids** and somewhat **hard**, because of the strong attraction between the positive and negative ions. They are generally **brittle**: they break into pieces when pressure is applied.",
          "**भौतिक प्रकृति।** आयनिक यौगिक **ठोस** और कुछ **कठोर** होते हैं, क्योंकि धनायनों और ऋणायनों के बीच प्रबल आकर्षण होता है। वे सामान्यतः **भंगुर** होते हैं: दबाव डालने पर टुकड़ों में टूट जाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Melting and boiling points.** Ionic compounds have **high** melting and boiling points, because a lot of energy is needed to break the strong attraction between the ions. From NCERT's Table 3.4 (in kelvin, K): NaCl melts at 1074 K and boils at 1686 K; CaO melts at 2850 K and boils at 3120 K.",
          "**गलनांक और क्वथनांक।** आयनिक यौगिकों के गलनांक और क्वथनांक **ऊँचे** होते हैं, क्योंकि आयनों के बीच के प्रबल आकर्षण को तोड़ने में बहुत ऊर्जा लगती है। NCERT की तालिका 3.4 से (केल्विन, K में): NaCl 1074 K पर पिघलता और 1686 K पर उबलता है; CaO 2850 K पर पिघलता और 3120 K पर उबलता है।",
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Soluble in water, not in kerosene or petrol. */
const dissolve = page(
  "dissolve",
  (b) => {
    const w = wordsOn(b);
    const tester = testerOn(b, "tester", {
      forms: [SaltForm.Water, SaltForm.Kerosene],
      salts: [IonicSalt.SodiumChloride, IonicSalt.CalciumChloride, IonicSalt.MagnesiumChloride],
    });
    b.standsFor(
      tester,
      "a beaker with a salt stirred into water or into kerosene; in water the crystals disappear and the ions spread out, in kerosene the crystals just sit at the bottom",
    );
    const ker = choiceQuestion(b, {
      name: "ker",
      prompt: t(
        "Try each salt in kerosene. What happens?",
        "हर लवण को केरोसिन में आज़माओ। क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It doesn't dissolve", "यह नहीं घुलता") },
        {
          id: "yes",
          label: t("It dissolves, as in water", "यह पानी की तरह घुल जाता है"),
          feedback: t(
            "Look at the beaker: the crystals stay at the bottom of the kerosene.",
            "बीकर देखो: क्रिस्टल केरोसिन की तली में ही पड़े रहते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Water yes, kerosene no", "पानी हाँ, केरोसिन नहीं")),
      w.body(
        t(
          "Try to dissolve each salt in water, and in kerosene.",
          "हर लवण को पानी में, और केरोसिन में, घोलने की कोशिश करो।",
        ),
      ),
      tester,
      w.definition(
        t(
          "**Solubility.** Ionic (electrovalent) compounds are generally **soluble in water** and **insoluble** in solvents such as **kerosene and petrol**. A **solvent** is the liquid that does the dissolving.",
          "**विलेयता।** आयनिक (वैद्युत संयोजक) यौगिक सामान्यतः **पानी में घुलनशील** और **केरोसिन और पेट्रोल** जैसे विलायकों में **अघुलनशील** होते हैं। **विलायक** वह द्रव है जो घोलता है।",
        ),
      ),
      ker,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Conduction: ions must be free to move. Solid no; dissolved or molten yes. */
const conduct = page(
  "conduct",
  (b) => {
    const w = wordsOn(b);
    const tester = testerOn(b, "tester", {
      forms: [SaltForm.Solid, SaltForm.Water, SaltForm.Molten],
    });
    b.standsFor(
      tester,
      "a circuit with a battery, a bulb and two electrodes dipped into sodium chloride as a solid, dissolved in water, or melted; the ions are drawn locked in place in the solid and moving freely in the solution and the melt",
    );
    const solid = multiChoiceQuestion(b, {
      name: "solid",
      prompt: t(
        "Switch on in each form. When does the bulb glow? Tick all.",
        "हर रूप में स्विच चालू करो। बल्ब कब जलता है? सभी पर निशान लगाओ।",
      ),
      options: [
        {
          id: "solid",
          label: t("Solid salt", "ठोस नमक"),
          feedback: t(
            "In the solid the ions are locked in place, so no charge can flow.",
            "ठोस में आयन अपनी जगह जकड़े रहते हैं, इसलिए कोई आवेश नहीं बह सकता।",
          ),
        },
        { id: "water", label: t("Salt dissolved in water", "पानी में घुला नमक") },
        { id: "molten", label: t("Molten salt", "पिघला नमक") },
      ],
      answers: ["water", "molten"],
      missing: t("Right so far: one more form conducts.", "अब तक सही: एक और रूप चालन करता है।"),
    });
    return column([
      w.title(t("When does it conduct?", "यह चालन कब करता है?")),
      w.body(
        t(
          "Put the electrodes into sodium chloride as a solid, dissolved in water, and melted. Switch on each time.",
          "इलेक्ट्रोड सोडियम क्लोराइड में डालो: ठोस, पानी में घुला, और पिघला। हर बार स्विच चालू करो।",
        ),
      ),
      tester,
      w.definition(
        t(
          "**Conduction of electricity.** Electricity flows through a liquid when **charged particles move**. A solution of an ionic compound in water contains ions, which move to the opposite electrodes, so it **conducts**. In the **solid**, the ions can't move because the structure is rigid, so it **does not conduct**. When **molten**, the heat overcomes the attraction between the ions, they move freely, and it **conducts** again.",
          "**विद्युत चालन।** किसी द्रव में से विद्युत तब बहती है जब **आवेशित कण चलते हैं**। पानी में आयनिक यौगिक के विलयन में आयन होते हैं, जो विपरीत इलेक्ट्रोडों की ओर चलते हैं, इसलिए यह **चालन करता है**। **ठोस** में ढाँचा कठोर है, इसलिए आयन नहीं चल सकते, और यह **चालन नहीं करता**। **पिघलने** पर ऊष्मा आयनों के बीच के आकर्षण को पार कर लेती है, वे आज़ादी से चलते हैं, और यह फिर **चालन करता है**।",
        ),
      ),
      solid,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const tester = testerOn(b, "tester", {
      forms: [SaltForm.Solid, SaltForm.Water],
      form: SaltForm.Water,
    });
    b.standsFor(tester, "salt dry and salt dissolved in water, in the bulb circuit");
    const hands = choiceQuestion(b, {
      name: "hands",
      prompt: t(
        "Why was Mom right to stop Kabir touching the switch with salty, wet hands?",
        "मम्मी का कबीर को नमकीन, गीले हाथों से स्विच छूने से रोकना सही क्यों था?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Salt dissolved in the water on his hands gives free ions, so the water can conduct electricity",
            "उसके हाथों के पानी में घुला नमक मुक्त आयन देता है, इसलिए वह पानी विद्युत का चालन कर सकता है",
          ),
        },
        {
          id: "dry",
          label: t("Dry salt conducts electricity", "सूखा नमक विद्युत का चालन करता है"),
          feedback: t(
            "Dry, solid salt doesn't conduct. It's the dissolved salt that does.",
            "सूखा, ठोस नमक चालन नहीं करता। घुला हुआ नमक करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Ionic compounds: hard but brittle solids, high melting and boiling points, soluble in water but not kerosene, conduct when dissolved or molten but not as solids. Next clue: where metals come from, and how gold is got out of the ground.",
        "**केस नोट्स।** ✓ आयनिक यौगिक: कठोर पर भंगुर ठोस, ऊँचे गलनांक और क्वथनांक, पानी में घुलनशील पर केरोसिन में नहीं, घुलने या पिघलने पर चालन करते हैं पर ठोस में नहीं। अगला सुराग: धातुएँ कहाँ से आती हैं, और सोना धरती से कैसे निकाला जाता है।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(hands.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([
      w.title(t("Wet hands, live switch", "गीले हाथ, चालू स्विच")),
      tester,
      hands,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const element = choiceQuestion(b, {
      name: "element",
      prompt: t(
        "An element reacts with oxygen to give a compound with a high melting point. The compound is also soluble in water. The element is likely to be…",
        "एक तत्व ऑक्सीजन से अभिक्रिया करके ऊँचे गलनांक वाला यौगिक देता है। यह यौगिक पानी में घुलनशील भी है। वह तत्व संभवतः है…",
      ),
      options: [
        { id: "right", label: t("calcium", "कैल्शियम") },
        {
          id: "carbon",
          label: t("carbon", "कार्बन"),
          feedback: t(
            "Carbon is a non-metal: its oxide is a gas, not a high-melting solid.",
            "कार्बन अधातु है: उसका ऑक्साइड एक गैस है, ऊँचे गलनांक वाला ठोस नहीं।",
          ),
        },
        {
          id: "silicon",
          label: t("silicon", "सिलिकन"),
          feedback: t(
            "Silicon is not a metal; its oxide (sand) doesn't dissolve in water.",
            "सिलिकन धातु नहीं है; उसका ऑक्साइड (रेत) पानी में नहीं घुलता।",
          ),
        },
        {
          id: "iron",
          label: t("iron", "लोहा"),
          feedback: t(
            "Iron oxide (rust) doesn't dissolve in water.",
            "आयरन ऑक्साइड (ज़ंग) पानी में नहीं घुलता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Calcium oxide is ionic: high melting point (2850 K), and it dissolves in water. Next clue: getting metals out of the ground.",
        "**केस नोट्स।** ✓ कैल्शियम ऑक्साइड आयनिक है: ऊँचा गलनांक (2850 K), और यह पानी में घुलता है। अगला सुराग: धरती से धातुएँ निकालना।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(element.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), element, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, physical, dissolve, conduct, inLife, yourTurn];
