import { type At, page, t } from "@chalk/author";
import { choice, wordsOn } from "@chalk/patterns";
import {
  LapRaceAction,
  LapRaceSignal,
  PrimeTowersAction,
  PrimeTowersSignal,
  TowerShow,
  lapRaceDef,
  primeTowersDef,
} from "@chalk/prop-primes";

const r = String.raw;

/**
 * The story: Sonia and Ravi run rounds of 18 and 12 minutes from the same start. The race stops when
 * both are at the start together (36). The learner works out why: Sonia is only there at 18 × k,
 * Ravi at 12 × k, so together means a multiple of both. Played on, every common multiple lights up;
 * the first one is the LCM. Set against the ribbons, where 6 was the biggest number in both.
 */
const story = page("story", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Sonia (18-minute rounds) and Ravi (12-minute rounds) are at the start together only at a minute that is a multiple of both 18 and 12: a common multiple (36, 72, …). The first is the lowest common multiple, LCM(18, 12) = 36. Contrast with HCF(18, 12) = 6 from the ribbons.",
  );
  const race = b.prop(lapRaceDef, "race", {});
  b.standsFor(
    race,
    "Sonia and Ravi on the track; under each, the minutes they are back at the start, as 18 × k and 12 × k",
  );
  b.witness(race.learner(LapRaceAction.Play), race.learner(LapRaceAction.Arrive));
  const must = choice(b, {
    name: "must",
    prompt: t(
      r`Sonia is at the start after 18, 36, 54, … minutes: multiples of 18. Ravi is there after multiples of 12. So a minute when they're there together is…`,
      r`सोनिया 18, 36, 54, … मिनट बाद शुरुआत पर होती है: 18 के गुणज। रवि 12 के गुणजों पर वहाँ होता है। तो जिस मिनट वे साथ हों, वह है…`,
    ),
    right: t("a multiple of both 18 and 12", "18 और 12 दोनों का गुणज"),
    wrong: {
      factor: {
        label: t("a factor of both 18 and 12", "18 और 12 दोनों का गुणनखंड"),
        feedback: t(
          "Their minutes only grow: 18, 36, … and 12, 24, 36, …. Those are multiples, not factors.",
          "उनके मिनट बढ़ते ही जाते हैं: 18, 36, … और 12, 24, 36, …। ये गुणज हैं, गुणनखंड नहीं।",
        ),
      },
      sum: {
        label: t("18 + 12", "18 + 12"),
        feedback: t(
          "At 30 minutes neither is at the start: 30 isn't in either row.",
          "30 मिनट पर कोई भी शुरुआत पर नहीं है: 30 किसी भी पंक्ति में नहीं है।",
        ),
      },
    },
  });
  const playOn = w.body(
    t(
      "So any minute in **both rows** works, and 36 is the first. Tap **Play** again to see the next one.",
      "तो जो भी मिनट **दोनों पंक्तियों** में हो, वह चलेगा, और 36 पहला है। अगला देखने के लिए फिर से **चलाओ** दबाओ।",
    ),
    "playOn",
  );
  b.witness(race.learner(LapRaceAction.Play), race.learner(LapRaceAction.Arrive));
  const lcmIs = w.definition(
    t(
      "Numbers that are multiples of both 18 and 12 are their **common multiples**: 36, 72, 108 and so on. The smallest is the **lowest common multiple**: LCM(18, 12) = 36.",
      "जो संख्याएँ 18 और 12 दोनों की गुणज हैं, वे उनके **सार्व गुणज** हैं: 36, 72, 108 इत्यादि। सबसे छोटा **लघुत्तम समापवर्त्य** है: LCM(18, 12) = 36।",
    ),
    "lcmIs",
  );
  const contrast = w.body(
    t(
      r`Remember the ribbons: the HCF is the **biggest** number that divides both 18 and 12. $$\text{HCF}(18, 12) = 6$$`,
      r`रिबन याद करो: HCF वह **सबसे बड़ी** संख्या है जो 18 और 12 दोनों को भाग दे। $$\text{HCF}(18, 12) = 6$$`,
    ),
    "contrast",
  );
  const contrastLcm = w.body(
    t(
      r`The LCM is the **smallest** number that both 18 and 12 divide. $$\text{LCM}(18, 12) = 36$$`,
      r`LCM वह **सबसे छोटी** संख्या है जिसे 18 और 12 दोनों भाग दें। $$\text{LCM}(18, 12) = 36$$`,
    ),
    "contrastLcm",
  );
  // Past their first meeting: they have met again, at the next common multiple.
  const metAgain = { if: (at: At) => at(race).time > 36 };
  b.after(race.on(LapRaceSignal.Met), must);
  b.after(must, playOn);
  b.after(race.on(LapRaceSignal.Met), [lcmIs, contrast, contrastLcm], metAgain);
  b.passWhen(race.on(LapRaceSignal.Met), metAgain);
  return [
    w.title(t("HCF and LCM", "HCF और LCM")),
    w.body(
      t(
        "Sonia and Ravi run round a field. Sonia takes **18 minutes** for a round, Ravi **12 minutes**. They start together, from the same point.",
        "सोनिया और रवि एक मैदान के चक्कर लगाते हैं। सोनिया एक चक्कर में **18 मिनट** लेती है, रवि **12 मिनट**। वे एक साथ, एक ही जगह से शुरू करते हैं।",
      ),
    ),
    w.body(
      t(
        "When will they next be at the start together? Tap **Play** and watch. Each time one of them crosses the start, that minute is written under their name.",
        "वे अगली बार एक साथ शुरुआत पर कब होंगे? **चलाओ** दबाओ और देखो। जब भी उनमें से कोई शुरुआत की रेखा पार करे, वह मिनट उसके नाम के नीचे लिखा जाता है।",
      ),
    ),
    race,
    must,
    playOn,
    lcmIs,
    contrast,
    contrastLcm,
  ];
});

/** HCF and LCM from primes: each prime's two towers side by side; HCF at the shorter top, LCM at the taller. */
const towers = page("towers", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "See 18 = 2 × 3² and 12 = 2² × 3 as towers, each prime's two side by side. The HCF divides both, so it goes up to the height both towers reach, the shorter top: 2 × 3 = 6. Both numbers divide the LCM, so it goes up to the height that covers both, the taller top: 2² × 3² = 36.",
  );
  const stack = b.prop(primeTowersDef, "towers", {});
  b.standsFor(stack, "for each prime, 18's tower and 12's side by side, as tall as its power");
  b.witness(
    stack.learner(PrimeTowersAction.Show, { show: TowerShow.Hcf }),
    stack.learner(PrimeTowersAction.Show, { show: TowerShow.Lcm }),
  );
  const hcfWhy = w.body(
    t(
      r`**HCF** is the biggest number that fits inside both 18 and 12. For each prime it can go only as high as the **shorter** tower. $$\text{HCF} = 2 \times 3 = 6$$ Now tap **LCM**.`,
      r`**HCF** वह सबसे बड़ी संख्या है जो 18 और 12 दोनों के अंदर समाए। हर अभाज्य के लिए वह केवल **छोटे** स्तंभ जितनी ऊँची जा सकती है। $$\text{HCF} = 2 \times 3 = 6$$ अब **LCM** दबाओ।`,
    ),
    "hcfWhy",
  );
  const lcmWhy = w.body(
    t(
      r`**LCM** is the smallest number that both 18 and 12 fit inside. For each prime it must reach the **taller** tower, and no higher. $$\text{LCM} = 2^2 \times 3^2 = 36$$ The minute Sonia and Ravi met.`,
      r`**LCM** वह सबसे छोटी संख्या है जिसके अंदर 18 और 12 दोनों समाएँ। हर अभाज्य के लिए उसे **ऊँचे** स्तंभ तक पहुँचना है, उससे ऊपर नहीं। $$\text{LCM} = 2^2 \times 3^2 = 36$$ वही मिनट जब सोनिया और रवि मिले।`,
    ),
    "lcmWhy",
  );
  const ask = choice(b, {
    name: "ask",
    prompt: t(
      r`What is the HCF of 12 and 15? $$12 = 2^2 \times 3, \qquad 15 = 3 \times 5$$`,
      r`12 और 15 का HCF क्या है? $$12 = 2^2 \times 3, \qquad 15 = 3 \times 5$$`,
    ),
    right: t("3", "3"),
    wrong: {
      lcm: {
        label: t("60", "60"),
        feedback: t(
          r`That's the LCM: each prime at its taller tower. $$2^2 \times 3 \times 5 = 60$$`,
          r`यह LCM है: हर अभाज्य अपने ऊँचे स्तंभ पर। $$2^2 \times 3 \times 5 = 60$$`,
        ),
      },
      fifteen: {
        label: t("15", "15"),
        feedback: t(
          "12 has no 5-tower, so the shorter top for 5 is 0: no 5 in the HCF.",
          "12 में 5 का स्तंभ नहीं है, इसलिए 5 का छोटा शिखर 0 है: HCF में 5 नहीं।",
        ),
      },
    },
  });
  const rule = w.definition(
    t(
      "**HCF** = product of each common prime at its **smallest** power. **LCM** = product of each prime at its **greatest** power.",
      "**HCF** = हर साझा अभाज्य की **सबसे छोटी** घात का गुणनफल। **LCM** = हर अभाज्य की **सबसे बड़ी** घात का गुणनफल।",
    ),
    "rule",
  );
  b.after(stack.on(PrimeTowersSignal.Shown), hcfWhy, {
    if: (at) => at(stack).show === TowerShow.Hcf,
  });
  b.after(stack.on(PrimeTowersSignal.Shown), [lcmWhy, ask], {
    if: (at) => at(stack).show === TowerShow.Lcm,
  });
  b.after(ask, rule);
  return [
    w.title(t("HCF and LCM from primes", "अभाज्यों से HCF और LCM")),
    w.body(
      t(
        r`**Primes show what divides what:** one number divides another when its towers fit inside. $$18 = 2 \times 3^2, \qquad 12 = 2^2 \times 3$$ For each prime, 18's tower and 12's stand side by side.`,
        r`**अभाज्य दिखाते हैं कौन किसे भाग देता है:** एक संख्या दूसरी को तब भाग देती है जब उसके स्तंभ अंदर समाएँ। $$18 = 2 \times 3^2, \qquad 12 = 2^2 \times 3$$ हर अभाज्य के लिए, 18 और 12 के स्तंभ साथ-साथ खड़े हैं।`,
      ),
    ),
    w.body(t("Tap **HCF**.", "**HCF** दबाओ।")),
    stack,
    hcfWhy,
    lcmWhy,
    ask,
    rule,
  ];
});

/** HCF × LCM = a × b: for each prime, the shorter and taller towers are the two towers. */
const product = page("product", (b) => {
  const w = wordsOn(b);
  const stack = b.prop(primeTowersDef, "towers", { show: TowerShow.Product, choices: [] });
  b.standsFor(stack, "18's and 12's towers; for each prime, shorter + taller = the two heights");
  return [
    w.title(t("HCF × LCM = a × b", "HCF × LCM = a × b")),
    w.body(
      t(
        r`**1.** For each prime, the HCF takes the **shorter** tower and the LCM the **taller**.`,
        r`**1.** हर अभाज्य के लिए, HCF **छोटा** स्तंभ लेता है और LCM **ऊँचा**।`,
      ),
    ),
    stack,
    w.body(
      t(
        r`**2.** The shorter and the taller are just the two towers, so together they make both. If one tower is $m$ high and the other $n$ high, shorter + taller $= m + n$. Here 18 has a 2-tower 1 high and 12 has one 2 high; for 3 it is the other way round: $$\begin{aligned} \text{2-towers:} &\quad \text{shorter } 1 + \text{taller } 2 = 1 + 2 \\ \text{3-towers:} &\quad \text{shorter } 1 + \text{taller } 2 = 2 + 1 \end{aligned}$$`,
        r`**2.** छोटा और ऊँचा बस वही दो स्तंभ हैं, तो मिलकर दोनों बनाते हैं। अगर एक स्तंभ $m$ ऊँचा है और दूसरा $n$, तो छोटा + ऊँचा $= m + n$। यहाँ 18 का 2-स्तंभ 1 ऊँचा है और 12 का 2 ऊँचा; 3 के लिए उल्टा है: $$\begin{aligned} \text{2-स्तंभ:} &\quad \text{छोटा } 1 + \text{ऊँचा } 2 = 1 + 2 \\ \text{3-स्तंभ:} &\quad \text{छोटा } 1 + \text{ऊँचा } 2 = 2 + 1 \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`**3.** Multiplying adds tower heights. So each prime is as tall in HCF × LCM as in $a \times b$: $$\underbrace{6}_{2^1\, 3^1} \times \underbrace{36}_{2^2\, 3^2} = 2^3\, 3^3 = \underbrace{18}_{2^1\, 3^2} \times \underbrace{12}_{2^2\, 3^1}$$`,
        r`**3.** गुणा करने से स्तंभों की ऊँचाई जुड़ती है। तो हर अभाज्य HCF × LCM में उतना ही ऊँचा है जितना $a \times b$ में: $$\underbrace{6}_{2^1\, 3^1} \times \underbrace{36}_{2^2\, 3^2} = 2^3\, 3^3 = \underbrace{18}_{2^1\, 3^2} \times \underbrace{12}_{2^2\, 3^1}$$`,
      ),
    ),
    w.body(
      t(
        r`**4.** Same towers, so the same number (one factorisation for each number):`,
        r`**4.** वही स्तंभ, तो वही संख्या (हर संख्या का गुणनखंडन एक ही):`,
      ),
    ),
    w.definition(
      t(
        r`$$\text{HCF}(a, b) \times \text{LCM}(a, b) = a \times b$$`,
        r`$$\text{HCF}(a, b) \times \text{LCM}(a, b) = a \times b$$`,
      ),
    ),
    w.note(
      t(
        "Only for two numbers. With three towers, the shortest and the tallest don't add up to all three.",
        "केवल दो संख्याओं के लिए। तीन स्तंभों में सबसे छोटा और सबसे बड़ा, तीनों का योग नहीं बनाते।",
      ),
    ),
  ];
});

/** The towers handed over: any two numbers, HCF, LCM and HCF × LCM. */
const play = page("play", (b) => {
  const w = wordsOn(b);
  const stack = b.prop(primeTowersDef, "sandbox", {
    numberA: 24,
    numberB: 90,
    isEditable: true,
    choices: [TowerShow.Hcf, TowerShow.Lcm, TowerShow.Product],
  });
  b.standsFor(stack, "a sandbox: any two numbers as towers, with HCF, LCM and HCF × LCM");
  return [
    w.title(t("Try it yourself", "ख़ुद आज़माओ")),
    w.body(
      t(
        "Type any two numbers, then tap HCF, LCM or HCF × LCM.",
        "कोई भी दो संख्याएँ लिखो, फिर HCF, LCM या HCF × LCM दबाओ।",
      ),
    ),
    stack,
  ];
});

/** Which one a problem wants, and the size check. */
const hcfOrLcm = page("hcf-or-lcm", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("HCF or LCM?", "HCF या LCM?")),
    w.definition(
      t(
        "**HCF** when something is split into equal groups or pieces, as big as possible, with nothing left over: columns, stacks, tiles, the longest ribbon piece.",
        "**HCF** जब किसी चीज़ को बराबर समूहों या टुकड़ों में बाँटना हो, जितने बड़े हो सकें, बिना कुछ बचे: स्तंभ, ढेर, टाइलें, रिबन का सबसे लंबा टुकड़ा।",
      ),
    ),
    w.definition(
      t(
        "**LCM** when things repeat and you want them to happen together again: runners, bells, buses, lights.",
        "**LCM** जब चीज़ें दोहराती हों और उन्हें फिर से एक साथ होना हो: धावक, घंटियाँ, बसें, बत्तियाँ।",
      ),
    ),
    w.body(
      t(
        r`**Check the size.** The HCF is at most the smaller number; the LCM is at least the larger. Pieces are small, meeting again takes long.`,
        r`**आकार जाँचो।** HCF छोटी संख्या से बड़ा नहीं होता; LCM बड़ी संख्या से छोटा नहीं होता। टुकड़े छोटे होते हैं, फिर से मिलने में समय लगता है।`,
      ),
    ),
  ];
});

/** NCERT Example 6: 6 and 20. */
const exampleTwo = page("example-two", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**Q.** Find the HCF and LCM of 6 and 20 by prime factorisation.",
        "**प्र.** अभाज्य गुणनखंडन से 6 और 20 का HCF और LCM ज्ञात करो।",
      ),
    ),
    w.body(
      t(
        r`**A.** Write both as primes: $$6 = 2 \times 3, \qquad 20 = 2^2 \times 5$$ For the HCF, take the shorter towers. Only 2 is in both, and its shorter tower is $2^1$: $$\text{HCF} = 2$$ For the LCM, take the taller towers: $$\text{LCM} = 2^2 \times 3 \times 5 = 60$$`,
        r`**उत्तर।** दोनों को अभाज्यों में लिखो: $$6 = 2 \times 3, \qquad 20 = 2^2 \times 5$$ HCF के लिए छोटे स्तंभ लो। दोनों में केवल 2 है, और उसका छोटा स्तंभ $2^1$ है: $$\text{HCF} = 2$$ LCM के लिए ऊँचे स्तंभ लो: $$\text{LCM} = 2^2 \times 3 \times 5 = 60$$`,
      ),
    ),
    w.body(
      t(
        r`Check: HCF × LCM should equal 6 × 20. $$2 \times 60 = 120 = 6 \times 20$$`,
        r`जाँच: HCF × LCM, 6 × 20 के बराबर होना चाहिए। $$2 \times 60 = 120 = 6 \times 20$$`,
      ),
    ),
  ];
});

/** NCERT Example 7: three numbers, 6, 72 and 120. */
const exampleThree = page("example-three", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**Q.** Find the HCF and LCM of 6, 72 and 120 by prime factorisation.",
        "**प्र.** अभाज्य गुणनखंडन से 6, 72 और 120 का HCF और LCM ज्ञात करो।",
      ),
    ),
    w.body(
      t(
        r`**A.** $$\begin{aligned} 6 &= 2 \times 3 \\ 72 &= 2^3 \times 3^2 \\ 120 &= 2^3 \times 3 \times 5 \end{aligned}$$`,
        r`**उ.** $$\begin{aligned} 6 &= 2 \times 3 \\ 72 &= 2^3 \times 3^2 \\ 120 &= 2^3 \times 3 \times 5 \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`For the HCF, take the shortest towers. Only 2 and 3 are in all three, at $2^1$ and $3^1$: $$\text{HCF} = 2 \times 3 = 6$$ For the LCM, take the tallest towers: $$\text{LCM} = 2^3 \times 3^2 \times 5 = 360$$`,
        r`HCF के लिए सबसे छोटे स्तंभ लो। तीनों में केवल 2 और 3 हैं, $2^1$ और $3^1$ पर: $$\text{HCF} = 2 \times 3 = 6$$ LCM के लिए सबसे ऊँचे स्तंभ लो: $$\text{LCM} = 2^3 \times 3^2 \times 5 = 360$$`,
      ),
    ),
    w.note(
      t(
        r`HCF × LCM = product works only for two numbers. Here it fails: $$6 \times 360 \ne 6 \times 72 \times 120$$`,
        r`HCF × LCM = गुणनफल केवल दो संख्याओं के लिए है। यहाँ यह नहीं चलता: $$6 \times 360 \ne 6 \times 72 \times 120$$`,
      ),
    ),
  ];
});

/** NCERT Ex 1.2: the LCM from the HCF. */
const exampleFromHcf = page("example-from-hcf", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**Q.** Given that HCF(306, 657) = 9, find LCM(306, 657).",
        "**प्र.** दिया है कि HCF(306, 657) = 9, तो LCM(306, 657) ज्ञात करो।",
      ),
    ),
    w.body(
      t(
        r`**A.** For two numbers, HCF × LCM is their product: $$9 \times \text{LCM} = 306 \times 657$$ So $$\text{LCM} = \frac{306 \times 657}{9} = 34 \times 657 = 22338$$`,
        r`**उत्तर।** दो संख्याओं के लिए HCF × LCM उनका गुणनफल है: $$9 \times \text{LCM} = 306 \times 657$$ तो $$\text{LCM} = \frac{306 \times 657}{9} = 34 \times 657 = 22338$$`,
      ),
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [
  story,
  towers,
  product,
  play,
  hcfOrLcm,
  exampleTwo,
  exampleThree,
  exampleFromHcf,
];
