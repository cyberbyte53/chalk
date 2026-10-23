import { PassOn, after, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { textDef } from "@chalk/prop-basics";
import { GearPairAction, GearPairSignal, gearPairDef, squareCutterDef } from "@chalk/prop-primes";

const r = String.raw;

/** NCERT Ex 1.2 Q7, as gears: when do the painted teeth meet again? LCM. */
const meetAgain = page(
  "meet-again",
  (b) => {
    const w = wordsOn(b);
    const gears = b.prop(gearPairDef, "gears", { teethA: 18, teethB: 12 });
    const reveal = b.prop(
      textDef,
      "after",
      {
        text: t(
          r`They meet after 36 teeth: the big gear has turned twice and the small one three times. 36 is the first number that is a multiple of both 18 and 12: $\text{LCM}(18, 12) = 36$.`,
          r`वे 36 दाँतों के बाद मिलते हैं: बड़ा पहिया दो बार घूमा और छोटा तीन बार। 36 पहली संख्या है जो 18 और 12 दोनों का गुणज है: $\text{LCM}(18, 12) = 36$।`,
        ),
      },
      { isHidden: true },
    );
    b.when(gears.on(GearPairSignal.Met), [theBoard.show(reveal), theBoard.pass()]);
    b.witness(gears.learner(GearPairAction.TurnBy, { teeth: 36 }), after(4));
    return column([
      w.title(t("When do they meet again?", "वे फिर कब मिलेंगे?")),
      w.body(
        t(
          "Sonia takes 18 minutes to go round a field and Ravi 12 minutes. They start together and go the same way. When are they together at the start again?",
          "सोनिया को मैदान का एक चक्कर लगाने में 18 मिनट लगते हैं और रवि को 12 मिनट। वे साथ शुरू करते हैं और एक ही दिशा में चलते हैं। वे फिर कब शुरुआत की जगह पर साथ होंगे?",
        ),
      ),
      w.body(
        t(
          "Think of two gears with 18 and 12 teeth, each with one painted tooth. Turn them until the painted teeth meet again.",
          "18 और 12 दाँतों वाले दो पहियों की सोचो, हर एक का एक दाँत रंगा है। उन्हें तब तक घुमाओ जब तक रंगे दाँत फिर न मिलें।",
        ),
      ),
      gears,
      reveal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Ex 1.1 Q2: 616 and 32 in the same number of columns. HCF. */
const columns = page("columns", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("As many columns as possible", "जितने हो सकें उतने स्तंभ")),
    w.body(
      t(
        "An army group of 616 members marches behind a band of 32 members, both in the same number of columns. What is the most columns they can march in?",
        "सेना की 616 सदस्यों की टुकड़ी 32 सदस्यों वाले बैंड के पीछे मार्च करती है, दोनों बराबर स्तंभों में। वे अधिकतम कितने स्तंभों में मार्च कर सकते हैं?",
      ),
    ),
    w.body(
      t(
        r`The number of columns must divide 616 **and** 32 with nobody left over, and be as big as possible: it is $\text{HCF}(616, 32)$. $$\begin{aligned} 616 &= 32 \times 19 + 8 \\ 32 &= 8 \times 4 + 0 \end{aligned}$$ So 8 columns.`,
        r`स्तंभों की संख्या 616 **और** 32 दोनों को बिना कोई बचे विभाजित करे, और जितनी बड़ी हो सके: यह $\text{HCF}(616, 32)$ है। $$\begin{aligned} 616 &= 32 \times 19 + 8 \\ 32 &= 8 \times 4 + 0 \end{aligned}$$ इसलिए 8 स्तंभ।`,
      ),
    ),
    b.prop(squareCutterDef, "cutter", { sideA: 616, sideB: 32 }),
    space(),
  ]);
});

/** How to tell, and your turn. */
const howToTell = page(
  "how-to-tell",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Two bells ring every 9 minutes and every 12 minutes. They ring together at 8:00. When do they next ring together?",
        "दो घंटियाँ हर 9 मिनट और हर 12 मिनट पर बजती हैं। 8:00 बजे वे साथ बजीं। अगली बार वे साथ कब बजेंगी?",
      ),
      options: [
        {
          id: "hcf",
          label: t("8:03", "8:03"),
          feedback: t(
            r`3 minutes is $\text{HCF}(9, 12)$: after 3 minutes neither bell has rung. They ring together at a common **multiple**: the LCM.`,
            r`3 मिनट $\text{HCF}(9, 12)$ है: 3 मिनट बाद कोई घंटी नहीं बजी। वे किसी साझा **गुणज** पर साथ बजती हैं: LCM पर।`,
          ),
        },
        { id: "right", label: t("8:36", "8:36") },
        {
          id: "product",
          label: t("9:48", "9:48"),
          feedback: t(
            r`$9 \times 12 = 108$ minutes is a common multiple, but not the first: 36 already is.`,
            r`$9 \times 12 = 108$ मिनट एक साझा गुणज है, पर पहला नहीं: 36 पहले ही है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("HCF or LCM?", "HCF या LCM?")),
      w.definition(
        t(
          "**HCF** when something is shared into equal groups, as big as possible, with nothing left over: columns, piles, tiles, the longest rope that measures both.",
          "**HCF** जब किसी चीज़ को बराबर समूहों में बाँटना हो, जितने बड़े हो सकें, बिना कुछ बचे: स्तंभ, ढेर, टाइलें, दोनों को मापने वाली सबसे लंबी रस्सी।",
        ),
      ),
      w.definition(
        t(
          "**LCM** when things repeat and you want them to happen together: bells, runners, buses, lights flashing.",
          "**LCM** जब चीज़ें दोहराती हों और उन्हें एक साथ होना हो: घंटियाँ, धावक, बसें, चमकती बत्तियाँ।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [meetAgain, columns, howToTell];
