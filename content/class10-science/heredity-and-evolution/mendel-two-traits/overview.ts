import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CrossAction,
  GrowMode,
  HeredityScene,
  Parent,
  Trait,
  crossSimulatorDef,
  heredityStoryDef,
} from "@chalk/prop-heredity";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's seed jar: do two traits travel together? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const garden = b.prop(heredityStoryDef, "garden", { scene: HeredityScene.TerraceGarden });
  b.standsFor(garden, "Grandpa's terrace garden with its row of pea plants");
  return column([
    w.title(t("Two traits at once", "एक साथ दो लक्षण")),
    garden,
    w.body(
      t(
        "**Stop 3.** Last time: each trait is set by a gene with two copies, and a recessive copy can hide for a generation. Now Riya tips out Grandpa's seed jar. Some seeds are round, some wrinkled; some yellow, some green.",
        "**पड़ाव 3।** पिछली बार: हर लक्षण एक जीन तय करता है जिसकी दो प्रतियाँ होती हैं, और अप्रभावी प्रति एक पीढ़ी तक छिप सकती है। अब रिया दादाजी के बीजों का डिब्बा पलटती है। कुछ बीज गोल हैं, कुछ झुर्रीदार; कुछ पीले, कुछ हरे।",
      ),
    ),
    w.body(
      t(
        'Kabir: "Do round seeds always come out yellow? Does shape drag colour along with it?" This lesson follows Mendel as he tracked two traits at the same time.',
        'कबीर: "क्या गोल बीज हमेशा पीले ही निकलते हैं? क्या आकार अपने साथ रंग को भी खींच लाता है?" यह पाठ मेंडल के साथ चलता है जब उन्होंने एक ही समय पर दो लक्षणों का पीछा किया।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** F1 of round green × wrinkled yellow: all round yellow (Fig. 9.5). */
const f1 = page(
  "f1",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 9.5: a round green plant (RRyy) crossed with a wrinkled yellow one (rrYY). Every F1 seed is round and yellow (RrYy), so round and yellow are dominant.",
    );
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.SeedShape, Trait.SeedColour],
      parentA: "RRyy",
      parentB: "rrYY",
      showGametes: true,
      showPunnett: true,
      showGenotypes: true,
      canSelf: false,
      canGrow: false,
    });
    b.standsFor(
      cross,
      "a round green-seeded pea plant (RRyy) and a wrinkled yellow-seeded one (rrYY)",
    );
    const look = choiceQuestion(b, {
      name: "look",
      prompt: t("Cross them. What are all the F₁ seeds like?", "संकरण करो। सारे F₁ बीज कैसे हैं?"),
      options: [
        { id: "right", label: t("Round and yellow", "गोल और पीले") },
        {
          id: "rg",
          label: t("Round and green", "गोल और हरे"),
          feedback: t(
            "Look at the square: every child is RrYy. One Y is enough for yellow, so yellow is dominant over green.",
            "वर्ग देखो: हर बच्चा RrYy है। पीले के लिए एक Y काफ़ी है, इसलिए पीला हरे पर प्रभावी है।",
          ),
        },
        {
          id: "mix",
          label: t("Half round green, half wrinkled yellow", "आधे गोल हरे, आधे झुर्रीदार पीले"),
          feedback: t(
            "Every F₁ child gets R and y from one parent and r and Y from the other: RrYy, round and yellow.",
            "हर F₁ बच्चे को एक जनक से R और y, और दूसरे से r और Y मिलता है: RrYy, गोल और पीला।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(cross.learner(CrossAction.Cross));
    return column([
      w.title(t("Round green × wrinkled yellow", "गोल हरा × झुर्रीदार पीला")),
      w.body(
        t(
          "Two genes now. Seed shape: R (round) and r (wrinkled). Seed colour: Y (yellow) and y (green). Each plant has two copies of each, so we write four letters. One parent is round and green, RRyy; the other is wrinkled and yellow, rrYY. Each germ cell gets one copy of *each* gene: Ry from the first parent, rY from the second.",
          "अब दो जीन। बीज का आकार: R (गोल) और r (झुर्रीदार)। बीज का रंग: Y (पीला) और y (हरा)। हर पौधे में हर जीन की दो प्रतियाँ हैं, इसलिए हम चार अक्षर लिखते हैं। एक जनक गोल और हरा है, RRyy; दूसरा झुर्रीदार और पीला, rrYY। हर जनन कोशिका को *हर* जीन की एक प्रति मिलती है: पहले जनक से Ry, दूसरे से rY।",
        ),
      ),
      cross,
      look,
      w.body(
        t(
          "So **round** and **yellow** are the dominant traits; wrinkled and green are recessive, hidden in F₁. The same happens with a tall round plant crossed with a short wrinkled one: all F₁ are tall with round seeds.",
          "तो **गोल** और **पीला** प्रभावी लक्षण हैं; झुर्रीदार और हरा अप्रभावी हैं, F₁ में छिपे। लंबे गोल पौधे का बौने झुर्रीदार से संकरण करने पर भी यही होता है: सारे F₁ लंबे और गोल बीज वाले।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** F2 of RrYy × RrYy: new combinations, 9:3:3:1. */
const f2 = page(
  "f2",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "The F1 RrYy plants self-pollinated: each makes four kinds of germ cell (RY, Ry, rY, ry), giving a 4×4 square. New combinations appear (round green, wrinkled yellow), about 9:3:3:1.",
    );
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.SeedShape, Trait.SeedColour],
      parentA: "RrYy",
      parentB: "RrYy",
      generation: 1,
      showGametes: true,
      showPunnett: true,
      showGenotypes: true,
      canSelf: false,
      canGrow: true,
      growCount: 556,
      growMode: GrowMode.Chance,
    });
    b.standsFor(
      cross,
      "two round yellow F1 plants (RrYy), their four kinds of germ cell and the 4×4 square",
    );
    const fresh = choiceQuestion(b, {
      name: "fresh",
      prompt: t(
        "Cross them and grow 556 seeds. The grandparents (the P plants) were round green and wrinkled yellow. Which F₂ seeds show a combination neither grandparent had?",
        "संकरण करो और 556 बीज उगाओ। दादा-दादी पौधे (P पौधे) गोल हरे और झुर्रीदार पीले थे। F₂ के कौन से बीज ऐसा मेल दिखाते हैं जो किसी दादा-दादी पौधे में नहीं था?",
      ),
      options: [
        {
          id: "right",
          label: t("Round yellow and wrinkled green", "गोल पीले और झुर्रीदार हरे"),
        },
        {
          id: "old",
          label: t("Round green and wrinkled yellow", "गोल हरे और झुर्रीदार पीले"),
          feedback: t(
            "Those were the grandparents: the P plants were round green and wrinkled yellow. The new mixes are round yellow and wrinkled green.",
            "वे तो दादा-दादी थे: P पौधे गोल हरे और झुर्रीदार पीले थे। नए मेल गोल पीले और झुर्रीदार हरे हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(cross.learner(CrossAction.Cross), cross.learner(CrossAction.Grow));
    return column([
      w.title(t("F₂: new combinations", "F₂: नए मेल")),
      w.body(
        t(
          "Now the F₁ plants (RrYy) self-pollinate. Each makes **four** kinds of germ cell, RY, Ry, rY and ry, in equal numbers, so the square is 4 by 4: 16 boxes.",
          "अब F₁ पौधे (RrYy) स्व-परागण करते हैं। हर एक **चार** तरह की जनन कोशिकाएँ बनाता है, RY, Ry, rY और ry, बराबर संख्या में, इसलिए वर्ग 4 गुणा 4 है: 16 खाने।",
        ),
      ),
      cross,
      fresh,
      w.body(
        t(
          r`Mendel's own count of 556 seeds was 315 round yellow, 108 round green, 101 wrinkled yellow and 32 wrinkled green. That is close to $$9 : 3 : 3 : 1$$ just as the 16 boxes predict.`,
          r`मेंडल की अपनी 556 बीजों की गिनती थी: 315 गोल पीले, 108 गोल हरे, 101 झुर्रीदार पीले और 32 झुर्रीदार हरे। यह लगभग $$9 : 3 : 3 : 1$$ है, ठीक जैसा 16 खाने बताते हैं।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Independent inheritance. */
const independent = page(
  "independent",
  (b) => {
    const w = wordsOn(b);
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "If the shape gene and the colour gene always travelled together, which F₂ seeds could never appear?",
        "अगर आकार का जीन और रंग का जीन हमेशा साथ चलते, तो कौन से F₂ बीज कभी नहीं दिखते?",
      ),
      options: [
        { id: "right", label: t("Wrinkled green", "झुर्रीदार हरे") },
        {
          id: "roundYellow",
          label: t("Round yellow", "गोल पीले"),
          feedback: t(
            "Linked genes would give only Ry and rY germ cells. Ry from one parent plus rY from the other still makes RrYy: round yellow. What could never form is rryy, because no germ cell would carry r together with y.",
            "जुड़े जीन केवल Ry और rY जनन कोशिकाएँ देते। एक जनक का Ry और दूसरे का rY मिलकर फिर भी RrYy बनाते: गोल पीला। जो कभी नहीं बन सकता वह rryy है, क्योंकि कोई जनन कोशिका r को y के साथ नहीं ले जाती।",
          ),
        },
        {
          id: "roundGreen",
          label: t("Round green", "गोल हरे"),
          feedback: t(
            "Ry from both parents gives RRyy: round green. That one could still appear. Only rryy needs a germ cell carrying r with y.",
            "दोनों जनकों से Ry मिलकर RRyy बनता है: गोल हरा। वह तो फिर भी आ सकता था। केवल rryy को ऐसी जनन कोशिका चाहिए जो r को y के साथ ले जाए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Each trait goes its own way", "हर लक्षण अपनी राह चलता है")),
      w.definition(
        t(
          "**Independent inheritance.** The new combinations show that the gene for seed shape and the gene for seed colour are passed on **separately**: which shape copy a germ cell gets doesn't affect which colour copy it gets. The traits are **inherited independently**.",
          "**स्वतंत्र वंशागति।** नए मेल दिखाते हैं कि बीज के आकार का जीन और बीज के रंग का जीन **अलग-अलग** आगे जाते हैं: जनन कोशिका को आकार की कौन सी प्रति मिलती है, इससे उसकी रंग की प्रति पर फ़र्क नहीं पड़ता। लक्षण **स्वतंत्र रूप से वंशानुगत** होते हैं।",
        ),
      ),
      w.body(
        t(
          "In the same way the tall/short trait and the round/wrinkled trait are inherited independently: an F₂ from tall round × short wrinkled includes tall plants with wrinkled seeds and short plants with round seeds.",
          "इसी तरह लंबा/बौना लक्षण और गोल/झुर्रीदार लक्षण स्वतंत्र रूप से वंशानुगत होते हैं: लंबे गोल × बौने झुर्रीदार के F₂ में झुर्रीदार बीजों वाले लंबे पौधे और गोल बीजों वाले बौने पौधे भी होते हैं।",
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the jar: Kabir's question answered. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const jar = choiceQuestion(b, {
      name: "jar",
      prompt: t(
        "So, Kabir's question: does a round seed have to be yellow?",
        "तो, कबीर का सवाल: क्या गोल बीज का पीला होना ज़रूरी है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: shape and colour are inherited independently",
            "नहीं: आकार और रंग स्वतंत्र रूप से वंशानुगत होते हैं",
          ),
        },
        {
          id: "yes",
          label: t("Yes: R and Y always go together", "हाँ: R और Y हमेशा साथ जाते हैं"),
          feedback: t(
            "Round green seeds turn up in every F₂: about 3 in 16. Shape doesn't drag colour along.",
            "हर F₂ में गोल हरे बीज आते हैं: लगभग 16 में 3। आकार रंग को साथ नहीं खींचता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 3 done.** Genes for different traits are shuffled separately, so a family can produce combinations no ancestor had. But *how* does a little letter like T make a plant tall, and how can germ cells keep each gene separate? Next stop: inside the cell.",
        "**पड़ाव 3 पूरा।** अलग-अलग लक्षणों के जीन अलग-अलग फेंटे जाते हैं, इसलिए परिवार में ऐसे मेल बन सकते हैं जो किसी पूर्वज में नहीं थे। पर T जैसा एक छोटा अक्षर पौधे को लंबा *कैसे* बनाता है, और जनन कोशिकाएँ हर जीन को अलग कैसे रखती हैं? अगला पड़ाव: कोशिका के अंदर।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(jar.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to the seed jar", "फिर बीजों के डिब्बे पर")),
      w.body(
        t(
          "Grandpa's jar has all four kinds: round yellow, round green, wrinkled yellow, wrinkled green, with round yellow the most common and wrinkled green the rarest.",
          "दादाजी के डिब्बे में चारों तरह के हैं: गोल पीले, गोल हरे, झुर्रीदार पीले, झुर्रीदार हरे, जिनमें गोल पीले सबसे ज़्यादा और झुर्रीदार हरे सबसे कम।",
        ),
      ),
      jar,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercise 1: tall violet × short white → all violet, half short. */
const example = page(
  "example",
  (b) => {
    const w = wordsOn(b);
    const cross = b.prop(crossSimulatorDef, "cross", {
      traits: [Trait.Height, Trait.FlowerColour],
      parentA: "TtWW",
      parentB: "ttww",
      showGametes: true,
      showPunnett: true,
      showGenotypes: true,
      canSetParents: true,
      canSelf: false,
      canGrow: true,
      growCount: 100,
    });
    b.standsFor(
      cross,
      "a tall violet plant crossed with a short white one (ttww); the learner can change the tall parent's genotype",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Tall violet × short white gives all violet flowers, but almost half the plants are short. The tall parent was…",
        "लंबा बैंगनी × बौना सफ़ेद से सारे फूल बैंगनी आते हैं, पर लगभग आधे पौधे बौने हैं। लंबा जनक था…",
      ),
      options: [
        { id: "right", label: t("TtWW", "TtWW") },
        {
          id: "TTWW",
          label: t("TTWW", "TTWW"),
          feedback: t(
            "With TT, every child gets a T: all tall. Half short means the tall parent carried a t.",
            "TT हो तो हर बच्चे को T मिलता है: सब लंबे। आधे बौने का अर्थ है लंबे जनक में एक t था।",
          ),
        },
        {
          id: "TTww",
          label: t("TTww", "TTww"),
          feedback: t(
            "ww would make the flowers white. The parent was violet, and so were all the children.",
            "ww फूलों को सफ़ेद बनाता। जनक बैंगनी था, और सारे बच्चे भी।",
          ),
        },
        {
          id: "TtWw",
          label: t("TtWw", "TtWw"),
          feedback: t(
            "With Ww, about half the children would get w from both parents and be white. All were violet, so the parent was WW.",
            "Ww हो तो लगभग आधे बच्चों को दोनों जनकों से w मिलता और वे सफ़ेद होते। सब बैंगनी थे, इसलिए जनक WW था।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      cross.learner(CrossAction.SetParent, { which: Parent.A, genotype: "TtWW" }),
      cross.learner(CrossAction.Cross),
    );
    return column([
      w.title(t("A worked example", "एक हल किया उदाहरण")),
      w.body(
        t(
          "NCERT Exercise 1. Think one trait at a time. Flowers: the short white parent is ww and gives only w; all children are violet, so the tall parent must give W every time: WW. Height: the short parent is tt; half the children are short, so the tall parent gives t half the time: Tt. Try other genotypes for the tall parent and cross to check.",
          "NCERT अभ्यास 1। एक बार में एक लक्षण सोचो। फूल: बौना सफ़ेद जनक ww है और केवल w देता है; सारे बच्चे बैंगनी हैं, इसलिए लंबे जनक को हर बार W देना होगा: WW। ऊँचाई: बौना जनक tt है; आधे बच्चे बौने हैं, इसलिए लंबा जनक आधी बार t देता है: Tt। लंबे जनक के दूसरे जीन-प्रारूप आज़माकर संकरण से जाँचो।",
        ),
      ),
      cross,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Your turn: in-text Q1, Q2, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const dominant = choiceQuestion(b, {
      name: "dominant",
      prompt: t(
        "How do Mendel's experiments show that a trait is dominant?",
        "मेंडल के प्रयोग कैसे दिखाते हैं कि कोई लक्षण प्रभावी है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Crossing two pure forms, only that one shows in F₁",
            "दो शुद्ध रूपों के संकरण से F₁ में केवल वही दिखता है",
          ),
        },
        {
          id: "common",
          label: t(
            "It is the more common trait in nature",
            "वह प्रकृति में ज़्यादा पाया जाने वाला लक्षण है",
          ),
          feedback: t(
            "Dominant doesn't mean common. It means it shows when there is just one copy, as in the F₁ of a cross.",
            "प्रभावी का अर्थ आम नहीं है। इसका अर्थ है कि एक प्रति होने पर भी दिखे, जैसे संकरण के F₁ में।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const indep = choiceQuestion(b, {
      name: "indep",
      prompt: t(
        "How do Mendel's experiments show that traits are inherited independently?",
        "मेंडल के प्रयोग कैसे दिखाते हैं कि लक्षण स्वतंत्र रूप से वंशानुगत होते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "F₂ of a two-trait cross has new combinations, like round green",
            "दो लक्षणों वाले संकरण के F₂ में नए मेल आते हैं, जैसे गोल हरा",
          ),
        },
        {
          id: "f1",
          label: t("All F₁ plants look the same", "सारे F₁ पौधे एक जैसे दिखते हैं"),
          feedback: t(
            "That shows dominance. Independence shows up in F₂, where the traits come apart into new mixes.",
            "वह प्रभाविता दिखाता है। स्वतंत्रता F₂ में दिखती है, जहाँ लक्षण अलग होकर नए मेल बनाते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ With two traits, F₁ shows both dominant traits. ✓ F₂ shows new combinations in about 9 : 3 : 3 : 1. ✓ Different traits are inherited independently. ? How a gene works inside a cell: next stop.",
        "**मिशन लॉग।** ✓ दो लक्षणों में F₁ दोनों प्रभावी लक्षण दिखाता है। ✓ F₂ में लगभग 9 : 3 : 3 : 1 में नए मेल आते हैं। ✓ अलग-अलग लक्षण स्वतंत्र रूप से वंशानुगत होते हैं। ? कोशिका के अंदर जीन कैसे काम करता है: अगला पड़ाव।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(indep.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), dominant, indep, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, f1, f2, independent, inLife, example, yourTurn];
