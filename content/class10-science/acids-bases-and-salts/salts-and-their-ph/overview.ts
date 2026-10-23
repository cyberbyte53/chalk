import { type BoardKit, PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AcidSceneKind,
  Anion,
  SaltFamilyAction,
  SaltId,
  saltFamilyDef,
} from "@chalk/prop-chemistry";
import { sceneOn } from "../kit";

/** A grid of salts (a few at a time, so it fits a phone). */
function saltsOn(
  b: BoardKit,
  name: string,
  salts: (typeof SaltId)[keyof typeof SaltId][],
  options: { showParents?: boolean; showNature?: boolean } = {},
) {
  const prop = b.prop(saltFamilyDef, name, {
    salts,
    picked: null,
    highlight: null,
    showParents: options.showParents ?? false,
    showNature: options.showNature ?? false,
    canPick: true,
    canHighlight: true,
  });
  b.studentOnly(prop.action(SaltFamilyAction.Pick));
  b.studentOnly(prop.action(SaltFamilyAction.Highlight));
  b.studentOnly(prop.action(SaltFamilyAction.Clear));
  return prop;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Two white powders, both "salts": one soothes a sting, one doesn't. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const sting = sceneOn(
    b,
    "sting",
    AcidSceneKind.BeeSting,
    "Kabir's stung arm with baking soda paste on it, and a salt shaker on the garden table",
  );
  return column([
    w.title(t("Two white powders", "दो सफ़ेद चूर्ण")),
    sting,
    w.body(
      t(
        "Kabir is curious after the bee sting. \"Baking soda is a salt, Grandpa said. Table salt is a salt. So why didn't you just put table salt on my arm?\" Riya opens her mouth to answer, and finds she can't.",
        'डंक के बाद कबीर जिज्ञासु है। "दादाजी ने कहा खाने का सोडा एक लवण है। खाने का नमक भी लवण है। तो तुमने मेरी बाँह पर बस नमक क्यों नहीं लगाया?" रिया उत्तर देने को मुँह खोलती है, और पाती है कि वह दे नहीं सकती।',
      ),
    ),
    w.body(
      t(
        "Stop 7: what is a salt, which families do salts form, and why are some salts acidic or basic?",
        "पड़ाव 7: लवण क्या है, लवण कौन-से कुल बनाते हैं, और कुछ लवण अम्लीय या क्षारकीय क्यों होते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 2.13: families of salts. */
const family = page(
  "family",
  (b) => {
    const w = wordsOn(b);
    const grid = saltsOn(b, "grid", [
      SaltId.SodiumChloride,
      SaltId.SodiumSulphate,
      SaltId.SodiumNitrate,
      SaltId.PotassiumSulphate,
      SaltId.CopperSulphate,
      SaltId.PotassiumChloride,
    ]);
    b.standsFor(
      grid,
      "a grid of salts arranged by their positive part (sodium, potassium, copper) and negative part (chloride, sulphate, nitrate); tapping an ion lights up its family",
    );
    const goal = goalQuestion(b, {
      about: grid,
      prompt: t("Light up the family of sulphate salts.", "सल्फ़ेट लवणों का कुल रोशन करो।"),
      isMet: grid.field("highlight").eq(Anion.Sulphate),
      solve: [grid.learner(SaltFamilyAction.Highlight, { ion: Anion.Sulphate })],
    });
    return column([
      w.title(t("Families of salts", "लवणों के कुल")),
      w.body(
        t(
          "Every salt has a **positive** part (like Na⁺ or Zn²⁺), which could have come from a base, and a **negative** part (like Cl⁻), which came from an acid. These parts are called **radicals**.",
          "हर लवण में एक **धनात्मक** हिस्सा होता है (जैसे Na⁺ या Zn²⁺), जो किसी क्षारक से आ सकता था, और एक **ऋणात्मक** हिस्सा (जैसे Cl⁻), जो किसी अम्ल से आया। इन हिस्सों को **मूलक** कहते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Family of salts.** Salts with the same positive radical, or the same negative radical, belong to one **family**. NaCl and Na₂SO₄ are both **sodium salts**; NaCl and KCl are both **chloride salts**.",
          "**लवणों का कुल।** एक ही धनात्मक मूलक, या एक ही ऋणात्मक मूलक वाले लवण एक **कुल** के हैं। NaCl और Na₂SO₄ दोनों **सोडियम लवण** हैं; NaCl और KCl दोनों **क्लोराइड लवण** हैं।",
        ),
      ),
      grid,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Each salt's parent acid and base. */
const parents = page(
  "parents",
  (b) => {
    const w = wordsOn(b);
    const grid = saltsOn(
      b,
      "grid",
      [
        SaltId.SodiumChloride,
        SaltId.CalciumSulphate,
        SaltId.MagnesiumSulphate,
        SaltId.SodiumCarbonate,
        SaltId.AmmoniumChloride,
      ],
      { showParents: true },
    );
    b.standsFor(
      grid,
      "a grid of salts; tapping one opens a card with the acid and the base it comes from, each marked strong or weak",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Tap ammonium chloride, NH₄Cl. Which acid and base is it made from?",
        "अमोनियम क्लोराइड, NH₄Cl, पर टैप करो। यह किस अम्ल और क्षारक से बना है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Hydrochloric acid and ammonium hydroxide",
            "हाइड्रोक्लोरिक अम्ल और अमोनियम हाइड्रॉक्साइड",
          ),
        },
        {
          id: "naoh",
          label: t(
            "Hydrochloric acid and sodium hydroxide",
            "हाइड्रोक्लोरिक अम्ल और सोडियम हाइड्रॉक्साइड",
          ),
          feedback: t(
            "That pair makes NaCl. NH₄⁺ comes from ammonium hydroxide.",
            "वह जोड़ा NaCl बनाता है। NH₄⁺ अमोनियम हाइड्रॉक्साइड से आता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Where each salt comes from", "हर लवण कहाँ से आता है")),
      w.body(
        t(
          "Read a salt's name backwards to find its parents. The first part (sodium, calcium, ammonium) comes from a **base**; the second part (chloride, sulphate, carbonate) comes from an **acid**: chloride from hydrochloric acid, sulphate from sulphuric acid, nitrate from nitric acid, carbonate from carbonic acid, acetate from acetic acid.",
          "लवण के नाम से उसके जनक खोजो। पहला हिस्सा (सोडियम, कैल्सियम, अमोनियम) **क्षारक** से आता है; दूसरा हिस्सा (क्लोराइड, सल्फ़ेट, कार्बोनेट) **अम्ल** से: क्लोराइड हाइड्रोक्लोरिक अम्ल से, सल्फ़ेट सल्फ़्यूरिक अम्ल से, नाइट्रेट नाइट्रिक अम्ल से, कार्बोनेट कार्बोनिक अम्ल से, ऐसीटेट ऐसीटिक अम्ल से।",
        ),
      ),
      grid,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2.14 / Table 2.4: the pH of a salt depends on its parents' strength. */
const phOfSalts = page(
  "ph-of-salts",
  (b) => {
    const w = wordsOn(b);
    const grid = saltsOn(
      b,
      "grid",
      [
        SaltId.SodiumChloride,
        SaltId.PotassiumNitrate,
        SaltId.CopperSulphate,
        SaltId.AluminiumChloride,
        SaltId.SodiumAcetate,
        SaltId.SodiumCarbonate,
      ],
      { showParents: true, showNature: true },
    );
    b.standsFor(
      grid,
      "a grid of the Activity 2.14 salts; tapping one shows its parent acid and base (strong or weak) and whether its solution is acidic, basic or neutral",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Sodium acetate comes from a strong base (NaOH) and a weak acid (acetic acid). Its solution is:",
        "सोडियम ऐसीटेट एक प्रबल क्षारक (NaOH) और एक दुर्बल अम्ल (ऐसीटिक अम्ल) से बना है। इसका विलयन है:",
      ),
      options: [
        { id: "right", label: t("Basic, pH above 7", "क्षारकीय, pH 7 से ऊपर") },
        {
          id: "neutral",
          label: t("Neutral, pH 7", "उदासीन, pH 7"),
          feedback: t(
            "Neutral needs both parents strong. Here the base wins.",
            "उदासीन के लिए दोनों जनक प्रबल होने चाहिए। यहाँ क्षारक जीतता है।",
          ),
        },
        {
          id: "acidic",
          label: t("Acidic, pH below 7", "अम्लीय, pH 7 से नीचे"),
          feedback: t(
            "The strong parent sets the nature, and here the strong one is the base.",
            "प्रबल जनक प्रकृति तय करता है, और यहाँ प्रबल क्षारक है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Not every salt is neutral", "हर लवण उदासीन नहीं होता")),
      w.body(
        t(
          "NCERT Activity 2.14: dissolve salts in distilled water and test them with litmus and pH paper. Tap each salt.",
          "NCERT क्रियाकलाप 2.14: लवणों को आसुत जल में घोलकर लिटमस और pH पत्र से जाँचो। हर लवण पर टैप करो।",
        ),
      ),
      grid,
      w.definition(
        t(
          "**The pH of a salt (Table 2.4).** A salt of a **strong acid and a strong base** is **neutral**, pH 7. A salt of a **strong acid and a weak base** is **acidic**, pH below 7. A salt of a **strong base and a weak acid** is **basic**, pH above 7.",
          "**लवण का pH (तालिका 2.4)।** **प्रबल अम्ल और प्रबल क्षारक** का लवण **उदासीन** है, pH 7। **प्रबल अम्ल और दुर्बल क्षारक** का लवण **अम्लीय** है, pH 7 से नीचे। **प्रबल क्षारक और दुर्बल अम्ल** का लवण **क्षारकीय** है, pH 7 से ऊपर।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Common salt: from the sea and from rock; the Dandi March. */
const common = page(
  "common-salt",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("How did beds of rock salt form?", "सेंधा नमक की परतें कैसे बनीं?"),
      options: [
        {
          id: "right",
          label: t("Seas of long ago dried up", "बहुत पुराने समुद्र सूख गए"),
        },
        {
          id: "volcano",
          label: t("Volcanoes threw them out", "ज्वालामुखियों ने उन्हें बाहर फेंका"),
          feedback: t(
            "Rock salt is what was left behind when ancient seas dried up.",
            "सेंधा नमक वह है जो प्राचीन समुद्रों के सूखने पर बचा रह गया।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Common salt", "साधारण नमक")),
      w.body(
        t(
          "The salt made from hydrochloric acid and sodium hydroxide is **sodium chloride**, NaCl: the salt in our food. Both its parents are strong, so it is neutral.",
          "हाइड्रोक्लोरिक अम्ल और सोडियम हाइड्रॉक्साइड से बना लवण **सोडियम क्लोराइड**, NaCl, है: हमारे खाने का नमक। इसके दोनों जनक प्रबल हैं, इसलिए यह उदासीन है।",
        ),
      ),
      w.body(
        t(
          "Seawater contains many salts; sodium chloride is separated from them. Large brownish crystals of salt are also found underground: **rock salt**. Beds of rock salt formed when seas of long ago dried up, and rock salt is mined like coal.",
          "समुद्री जल में कई लवण होते हैं; सोडियम क्लोराइड उनसे अलग किया जाता है। ज़मीन के नीचे भी नमक के बड़े भूरे क्रिस्टल मिलते हैं: **सेंधा नमक** (रॉक सॉल्ट)। सेंधा नमक की परतें तब बनीं जब बहुत पुराने समुद्र सूख गए, और इसे कोयले की तरह खोदकर निकाला जाता है।",
        ),
      ),
      w.note(
        t(
          "In 1930, Mahatma Gandhi's Dandi March made sodium chloride a symbol of India's struggle for freedom.",
          "1930 में, महात्मा गांधी की दांडी यात्रा ने सोडियम क्लोराइड को भारत के स्वतंत्रता संग्राम का प्रतीक बना दिया।",
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

/** Kabir's question answered. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "So why does baking soda (NaHCO₃) soothe a sting, but table salt (NaCl) doesn't?",
        "तो खाने का सोडा (NaHCO₃) डंक में आराम क्यों देता है, पर नमक (NaCl) नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Baking soda comes from a strong base and a weak acid, so it's basic; NaCl comes from two strong parents, so it's neutral",
            "खाने का सोडा प्रबल क्षारक और दुर्बल अम्ल से बना है, इसलिए क्षारकीय है; NaCl दो प्रबल जनकों से, इसलिए उदासीन",
          ),
        },
        {
          id: "softer",
          label: t("Baking soda is a softer powder", "खाने का सोडा मुलायम चूर्ण है"),
          feedback: t(
            "Texture doesn't neutralise acid. Only a base does.",
            "बनावट अम्ल को उदासीन नहीं करती। केवल क्षारक करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        "Riya has her answer for Kabir: both are salts, but only one is basic. Salts are as different as their parents.",
        "रिया के पास कबीर का उत्तर है: दोनों लवण हैं, पर केवल एक क्षारकीय है। लवण अपने जनकों जितने ही अलग होते हैं।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("Kabir's question", "कबीर का सवाल")), ask, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Family-spotting and the pH of a salt; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t("Which two salts are in the same family?", "कौन-से दो लवण एक ही कुल के हैं?"),
      options: [
        { id: "right", label: t("K₂SO₄ and CuSO₄", "K₂SO₄ और CuSO₄") },
        {
          id: "nacl",
          label: t("NaCl and K₂SO₄", "NaCl और K₂SO₄"),
          feedback: t(
            "They share no radical: sodium vs potassium, chloride vs sulphate.",
            "इनका कोई मूलक साझा नहीं: सोडियम बनाम पोटैशियम, क्लोराइड बनाम सल्फ़ेट।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "Ammonium chloride comes from a strong acid (HCl) and a weak base (NH₄OH). Its solution is:",
        "अमोनियम क्लोराइड एक प्रबल अम्ल (HCl) और एक दुर्बल क्षारक (NH₄OH) से बना है। इसका विलयन है:",
      ),
      options: [
        { id: "right", label: t("Acidic", "अम्लीय") },
        {
          id: "basic",
          label: t("Basic", "क्षारकीय"),
          feedback: t("The strong parent here is the acid.", "यहाँ प्रबल जनक अम्ल है।"),
        },
        {
          id: "neutral",
          label: t("Neutral", "उदासीन"),
          feedback: t(
            "Neutral needs both parents strong; the base here is weak.",
            "उदासीन के लिए दोनों जनक प्रबल चाहिए; यहाँ क्षारक दुर्बल है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A salt has a positive radical from a base and a negative radical from an acid. ✓ Same radical, same family. ✓ Strong + strong: neutral; strong acid + weak base: acidic; strong base + weak acid: basic. Next: the chemicals made from common salt, including the extinguisher for the finale.",
        "**मिशन लॉग।** ✓ लवण में क्षारक से धनात्मक मूलक और अम्ल से ऋणात्मक मूलक होता है। ✓ एक ही मूलक, एक ही कुल। ✓ प्रबल + प्रबल: उदासीन; प्रबल अम्ल + दुर्बल क्षारक: अम्लीय; प्रबल क्षारक + दुर्बल अम्ल: क्षारकीय। आगे: साधारण नमक से बने रसायन, समापन के लिए अग्निशामक समेत।",
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
export const overview = [hook, family, parents, phOfSalts, common, inLife, yourTurn];
