import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  HeredityScene,
  ShuffleAction,
  ShuffleMode,
  Sperm,
  chromosomeShuffleDef,
  heredityStoryDef,
} from "@chalk/prop-heredity";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** A new cousin on the way, and a family argument about who "decides". */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const album = b.prop(heredityStoryDef, "album", { scene: HeredityScene.FamilyAlbum });
  b.standsFor(album, "the family photo album");
  return column([
    w.title(t("Boy or girl?", "लड़का या लड़की?")),
    album,
    w.body(
      t(
        "**Stop 5.** Last time: a child gets one chromosome of each pair from each parent. That should make Riya and Kabir alike in how they were built. Yet one is a girl and one a boy.",
        "**पड़ाव 5।** पिछली बार: बच्चे को हर जोड़ी का एक गुणसूत्र हर जनक से मिलता है। इस हिसाब से रिया और कबीर की बनावट एक जैसी होनी चाहिए। फिर भी एक लड़की है और एक लड़का।",
      ),
    ),
    w.body(
      t(
        'News arrives: Mom\'s cousin is expecting a baby. An aunt on the phone says, "Let\'s hope she gives them a boy." Riya frowns. "Is it the mother who decides?" This lesson finds out how the sex of a baby is decided, and by whom.',
        'ख़बर आती है: मम्मी की चचेरी बहन माँ बनने वाली हैं। फ़ोन पर एक बुआ कहती हैं, "उम्मीद है वह उन्हें बेटा देगी।" रिया की भौंहें तन जाती हैं। "क्या माँ तय करती है?" यह पाठ पता लगाता है कि बच्चे का लिंग कैसे, और किससे, तय होता है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Different species, different strategies. */
const strategies = page(
  "strategies",
  (b) => {
    const w = wordsOn(b);
    const reptile = choiceQuestion(b, {
      name: "reptile",
      prompt: t(
        "In some reptiles, what decides whether the young are male or female?",
        "कुछ सरीसृपों में क्या तय करता है कि संतान नर होगी या मादा?",
      ),
      options: [
        {
          id: "right",
          label: t("The temperature at which the eggs are kept", "वह तापमान जिस पर अंडे रखे जाते हैं"),
        },
        {
          id: "genes",
          label: t("Only their genes", "केवल उनके जीन"),
          feedback: t(
            "In a few reptiles it's an environmental cue: the temperature of the fertilised eggs.",
            "कुछ सरीसृपों में यह परिवेश का संकेत है: निषेचित अंडों का तापमान।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Different animals, different ways", "अलग जंतु, अलग तरीक़े")),
      w.definition(
        t(
          "**Sex determination** is how the sex (male or female) of a new individual is decided. Different species use very different strategies.",
          "**लिंग निर्धारण** वह तरीक़ा है जिससे नए जीव का लिंग (नर या मादा) तय होता है। अलग स्पीशीज़ बहुत अलग तरीक़े अपनाती हैं।",
        ),
      ),
      w.body(
        t(
          "Some rely entirely on cues from the environment: in a few reptiles, the **temperature** at which the fertilised eggs are kept decides whether the animals in them will be male or female. Some animals, like snails, can even **change sex**, so their sex isn't fixed by genes. In **human beings**, sex is largely decided by **genes**: the ones we inherit from our parents.",
          "कुछ पूरी तरह परिवेश के संकेतों पर निर्भर हैं: कुछ सरीसृपों में निषेचित अंडे जिस **तापमान** पर रखे जाते हैं, वह तय करता है कि उनमें के जंतु नर होंगे या मादा। कुछ जंतु, जैसे घोंघे, **लिंग बदल** भी सकते हैं, इसलिए उनका लिंग जीन से तय नहीं होता। **मनुष्यों** में लिंग मुख्यतः **जीनों** से तय होता है: जो हमें माता-पिता से मिलते हैं।",
        ),
      ),
      reptile,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** 22 pairs + the sex chromosomes; XX and XY. */
const xy = page(
  "xy",
  (b) => {
    const w = wordsOn(b);
    const cells = b.prop(chromosomeShuffleDef, "cells", {
      mode: ShuffleMode.Sex,
      step: 0,
      canStep: false,
      canShuffle: false,
      canPickSperm: false,
      canGrow: false,
    });
    b.standsFor(
      cells,
      "a mother's body cell with XX and a father's with XY, besides 22 matched pairs",
    );
    const man = choiceQuestion(b, {
      name: "man",
      prompt: t("A man's sex chromosomes are…", "पुरुष के लिंग गुणसूत्र हैं…"),
      options: [
        { id: "right", label: t("XY", "XY") },
        {
          id: "xx",
          label: t("XX", "XX"),
          feedback: t(
            "XX is a woman's perfect pair. A man's pair is mismatched: one X and one short Y.",
            "XX स्त्री की पूरी जोड़ी है। पुरुष की जोड़ी बेमेल होती है: एक X और एक छोटा Y।",
          ),
        },
        {
          id: "yy",
          label: t("YY", "YY"),
          feedback: t(
            "Nobody is YY: every person has at least one X, the one that comes from the mother.",
            "कोई भी YY नहीं होता: हर व्यक्ति में कम से कम एक X होता है, जो माँ से आता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The odd pair: X and Y", "अनोखी जोड़ी: X और Y")),
      w.body(
        t(
          "If both parents gave similar sets of genes, how could genes decide sex? The answer is that not all human chromosomes are perfect pairs.",
          "अगर दोनों जनक एक जैसे जीन-सेट देते, तो जीन लिंग कैसे तय करते? उत्तर यह है कि मनुष्य के सारे गुणसूत्र पूरी जोड़ियाँ नहीं होते।",
        ),
      ),
      w.definition(
        t(
          "**Sex chromosomes.** Humans have **22 pairs** of ordinary chromosomes, each with a mother's copy and a father's. One more pair, the **sex chromosomes**, is odd. **Women** have a perfect pair, both called **X**: **XX**. **Men** have a mismatched pair: one normal-sized **X** and one short **Y**: **XY**.",
          "**लिंग गुणसूत्र।** मनुष्यों में साधारण गुणसूत्रों की **22 जोड़ियाँ** होती हैं, हर एक में माँ की और पिता की प्रति। एक और जोड़ी, **लिंग गुणसूत्र**, अनोखी है। **स्त्रियों** में पूरी जोड़ी होती है, दोनों **X** कहलाते हैं: **XX**। **पुरुषों** में बेमेल जोड़ी होती है: एक सामान्य आकार का **X** और एक छोटा **Y**: **XY**।",
        ),
      ),
      cells,
      man,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Egg always X; sperm X or Y; the father's chromosome decides. */
const whoDecides = page(
  "who-decides",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 9.6: every egg carries an X; a sperm carries X or Y. The learner picks which sperm reaches the egg and steps to the baby: X sperm gives a girl (XX), Y sperm a boy (XY).",
    );
    const cells = b.prop(chromosomeShuffleDef, "cells", {
      mode: ShuffleMode.Sex,
      step: 1,
      canStep: true,
      canShuffle: false,
      canPickSperm: true,
      canGrow: false,
    });
    b.standsFor(
      cells,
      "the egg (always X) and two kinds of sperm (X or Y); the learner picks one and steps to the new cell",
    );
    const decides = choiceQuestion(b, {
      name: "decides",
      prompt: t(
        "Pick an X sperm and step to the end, then a Y sperm. Whose chromosome decides whether the baby is a girl or a boy?",
        "X शुक्राणु चुनकर अंत तक जाओ, फिर Y शुक्राणु। किसका गुणसूत्र तय करता है कि बच्चा लड़की होगा या लड़का?",
      ),
      options: [
        { id: "right", label: t("The father's: X or Y in the sperm", "पिता का: शुक्राणु में X या Y") },
        {
          id: "mother",
          label: t("The mother's: X in the egg", "माँ का: अंडाणु में X"),
          feedback: t(
            "Every egg carries an X, whatever happens. The only difference comes from the sperm: X or Y.",
            "हर अंडे में X ही होता है, चाहे कुछ भी हो। फ़र्क केवल शुक्राणु से आता है: X या Y।",
          ),
        },
        {
          id: "both",
          label: t("Both equally, half each", "दोनों बराबर, आधा-आधा"),
          feedback: t(
            "Both give a sex chromosome, but the mother's is always X. Which one the father's sperm carries makes the difference.",
            "दोनों एक लिंग गुणसूत्र देते हैं, पर माँ का हमेशा X होता है। पिता का शुक्राणु कौन सा लिए है, फ़र्क उसी से पड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      cells.learner(ShuffleAction.PickSperm, { sperm: Sperm.Y }),
      cells.learner(ShuffleAction.Next),
      cells.learner(ShuffleAction.Next),
    );
    return column([
      w.title(t("Who decides?", "कौन तय करता है?")),
      w.body(
        t(
          "A mother (XX) can only put an **X** in each egg. A father (XY) puts an X in half his sperm and a **Y** in the other half.",
          "माँ (XX) हर अंडे में केवल **X** डाल सकती है। पिता (XY) अपने आधे शुक्राणुओं में X और बाकी आधों में **Y** डालता है।",
        ),
      ),
      cells,
      decides,
      w.body(
        t(
          r`$$\text{X egg} + \text{X sperm} \rightarrow \text{XX: girl}$$ $$\text{X egg} + \text{Y sperm} \rightarrow \text{XY: boy}$$`,
          r`$$\text{X अंडा} + \text{X शुक्राणु} \rightarrow \text{XX: लड़की}$$ $$\text{X अंडा} + \text{Y शुक्राणु} \rightarrow \text{XY: लड़का}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Half girls, half boys: count 100 babies. */
const half = page(
  "half",
  (b) => {
    const w = wordsOn(b);
    const cells = b.prop(chromosomeShuffleDef, "cells", {
      mode: ShuffleMode.Sex,
      step: 3,
      sperm: Sperm.X,
      canStep: false,
      canShuffle: false,
      canPickSperm: false,
      canGrow: true,
      growCount: 100,
    });
    b.standsFor(
      cells,
      "a counter for 100 babies, each from an X egg and a sperm that is X or Y by chance",
    );
    const share = choiceQuestion(b, {
      name: "share",
      prompt: t(
        "Count 100 babies. About how many are girls?",
        "100 बच्चे गिनो। लगभग कितनी लड़कियाँ हैं?",
      ),
      options: [
        { id: "right", label: t("About 50", "लगभग 50") },
        {
          id: "25",
          label: t("About 25", "लगभग 25"),
          feedback: t(
            "X and Y sperm are made in equal numbers, so each baby has an even chance: about half are girls.",
            "X और Y शुक्राणु बराबर संख्या में बनते हैं, इसलिए हर बच्चे का बराबर मौक़ा है: लगभग आधी लड़कियाँ।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(cells.learner(ShuffleAction.Grow));
    return column([
      w.title(t("Half and half", "आधे-आधे")),
      w.body(
        t(
          "Half the sperm carry X and half carry Y, and which one reaches the egg is a matter of chance. So among many babies, about half are girls and half are boys.",
          "आधे शुक्राणु X और आधे Y लिए होते हैं, और अंडे तक कौन पहुँचता है, यह संयोग की बात है। इसलिए बहुत से बच्चों में लगभग आधी लड़कियाँ और आधे लड़के होते हैं।",
        ),
      ),
      cells,
      share,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the phone call. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const aunt = choiceQuestion(b, {
      name: "aunt",
      prompt: t(
        'So, was the aunt right that the mother "gives" a boy or a girl?',
        'तो, क्या बुआ सही थीं कि माँ लड़का या लड़की "देती" है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: the egg is always X; it depends on whether an X or a Y sperm fertilises it, which is chance",
            "नहीं: अंडा हमेशा X होता है; यह इस पर निर्भर है कि X या Y शुक्राणु उसे निषेचित करता है, जो संयोग है",
          ),
        },
        {
          id: "yes",
          label: t("Yes: it depends on the mother's genes", "हाँ: यह माँ के जीनों पर निर्भर है"),
          feedback: t(
            "Every egg carries the same X. The mother's genes can't make the baby a boy or a girl.",
            "हर अंडे में वही X होता है। माँ के जीन बच्चे को लड़का या लड़की नहीं बना सकते।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 5 done, and the heredity half too.** Riya calls back: \"No one 'gives' a boy or a girl. It's a fifty-fifty chance, and the X or Y comes from the father's side.\" Kabir, meanwhile, has spotted something in Grandpa's bushes: red beetles, and crows. Next, the evolution half: what happens over many generations.",
        "**पड़ाव 5 पूरा, और आनुवंशिकता वाला हिस्सा भी।** रिया वापस फ़ोन करती है: \"कोई लड़का या लड़की 'देता' नहीं। यह पचास-पचास का संयोग है, और X या Y पिता की ओर से आता है।\" इस बीच कबीर ने दादाजी की झाड़ियों में कुछ देखा है: लाल भृंग, और कौए। आगे, जैव विकास वाला हिस्सा: बहुत सी पीढ़ियों में क्या होता है।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(aunt.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([w.title(t("Back to the phone call", "फिर उस फ़ोन पर")), aunt, stop, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q4 and a chance question; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const egg = choiceQuestion(b, {
      name: "egg",
      prompt: t(
        "Which sex chromosome does every child get from the mother?",
        "हर बच्चे को माँ से कौन सा लिंग गुणसूत्र मिलता है?",
      ),
      options: [
        { id: "right", label: t("X", "X") },
        {
          id: "y",
          label: t("Y, for boys", "Y, लड़कों के लिए"),
          feedback: t(
            "The mother has no Y to give. Boys get their Y from the father.",
            "माँ के पास देने को Y नहीं है। लड़कों को Y पिता से मिलता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const chance = choiceQuestion(b, {
      name: "chance",
      prompt: t(
        "A couple already has two boys. What is the chance their next baby is a girl?",
        "एक दंपती के पहले से दो बेटे हैं। अगले बच्चे के बेटी होने का संयोग क्या है?",
      ),
      options: [
        { id: "right", label: t("One half, as always", "आधा, हमेशा की तरह") },
        {
          id: "high",
          label: t('More than half: a girl is "due"', 'आधे से ज़्यादा: अब बेटी की "बारी" है'),
          feedback: t(
            "Each baby is a fresh chance: the sperm doesn't remember the earlier babies. It's still one half.",
            "हर बच्चा नया संयोग है: शुक्राणु को पिछले बच्चे याद नहीं। यह अब भी आधा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Some animals' sex is set by the environment (temperature in some reptiles); snails can change sex. ✓ Humans have 22 pairs plus the sex chromosomes: XX women, XY men. ✓ Every egg is X; the sperm is X or Y, so the father's chromosome decides, by chance. ✓ Heredity half done. Next: the beetles in the bush.",
        "**मिशन लॉग।** ✓ कुछ जंतुओं का लिंग परिवेश तय करता है (कुछ सरीसृपों में तापमान); घोंघे लिंग बदल सकते हैं। ✓ मनुष्यों में 22 जोड़ियाँ और लिंग गुणसूत्र: स्त्री XX, पुरुष XY। ✓ हर अंडा X है; शुक्राणु X या Y, इसलिए पिता का गुणसूत्र, संयोग से, तय करता है। ✓ आनुवंशिकता का हिस्सा पूरा। आगे: झाड़ी के भृंग।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(chance.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), egg, chance, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, strategies, xy, whoDecides, half, inLife, yourTurn];
