import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Colour,
  DataSceneKind,
  Experiment,
  RunAction,
  SpaceAction,
  SpaceDerived,
  cardIds,
  chanceRunDef,
  outcomeSpaceDef,
} from "@chalk/prop-data";
import { sceneOn } from "../kit";

const r = String.raw;

const ACES = cardIds((rank) => rank === "A");

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's card trick and Kabir's marble jar. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const table = sceneOn(
    b,
    "table",
    DataSceneKind.CardTable,
    "Grandpa's card table: a pack of cards laid out in four rows by suit; Grandpa holds up the ace of spades and Riya guesses",
  );
  return column([
    w.title(t("An ace, or a white marble", "इक्का, या सफ़ेद कंचा")),
    table,
    w.body(
      t(
        "Grandpa has volunteered a game of his own. He shuffles a full pack of cards and you pick one: draw an **ace** and you win his famous coconut barfi. Meanwhile Kabir has filled a glass jar with marbles: 3 blue, 2 white and 4 red. Pull out a **white** one, eyes closed, and you win a balloon.",
        "दादाजी ने अपना एक खेल देने की पेशकश की है। वे ताश की पूरी गड्डी फेंटते हैं और तुम एक पत्ता चुनते हो: **इक्का** निकला तो उनकी मशहूर नारियल बर्फ़ी जीतो। इस बीच कबीर ने एक काँच का जार कंचों से भरा है: 3 नीले, 2 सफ़ेद और 4 लाल। आँखें बंद करके **सफ़ेद** निकालो, और गुब्बारा जीतो।",
      ),
    ),
    w.body(
      t(
        "Which game gives away more prizes? Riya needs both probabilities.",
        "कौन-सा खेल ज़्यादा इनाम देता है? रिया को दोनों प्रायिकताएँ चाहिए।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The deck of 52; Example 4: an ace, and not an ace. */
const deck = page(
  "deck",
  (b) => {
    const w = wordsOn(b);
    const pack = b.prop(outcomeSpaceDef, "pack", {
      kind: Experiment.Cards,
      favourable: ACES,
      eventLabel: { en: "an ace", hi: "इक्का" },
      isEventShown: false,
      canPick: true,
    });
    b.studentOnly(pack.action(SpaceAction.Toggle));
    b.studentOnly(pack.action(SpaceAction.Clear));
    b.studentOnly(pack.action(SpaceAction.ShowComplement));
    b.standsFor(
      pack,
      "all 52 cards laid out in four rows by suit (spades, hearts, diamonds, clubs), ace to king; the learner taps the aces",
    );
    const goal = goalQuestion(b, {
      about: pack,
      prompt: t("Tap all the **aces** in the pack.", "गड्डी के सारे **इक्के** टैप करो।"),
      isMet: pack.derived(SpaceDerived.IsMatched).eq(true),
      solve: ACES.map((id) => pack.learner(SpaceAction.Toggle, { id })),
    });
    const worked = w.body(
      t(
        r`Example 4. Four aces out of 52 cards: $P(\text{ace}) = \dfrac{4}{52} = \dfrac{1}{13}$. Every other card is "not an ace", $52 - 4 = 48$ of them: $P(\text{not an ace}) = \dfrac{48}{52} = \dfrac{12}{13}$, which is also $1 - \dfrac{1}{13}$.`,
        r`उदाहरण 4. 52 पत्तों में चार इक्के: $P(\text{इक्का}) = \dfrac{4}{52} = \dfrac{1}{13}$। बाक़ी हर पत्ता "इक्का नहीं" है, ऐसे $52 - 4 = 48$ हैं: $P(\text{इक्का नहीं}) = \dfrac{48}{52} = \dfrac{12}{13}$, जो $1 - \dfrac{1}{13}$ भी है।`,
      ),
      "worked",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(worked));
    return column([
      w.title(t("A pack of 52 cards", "52 पत्तों की गड्डी")),
      w.definition(
        t(
          "**A deck of cards.** A deck has 52 cards in 4 **suits** of 13: spades (♠) and clubs (♣) are black, hearts (♥) and diamonds (♦) are red. Each suit has an ace, 2 to 10, and a jack, queen and king. The kings, queens and jacks are the **face cards**. A well-shuffled deck makes every card equally likely.",
          "**ताश की गड्डी।** गड्डी में 52 पत्ते हैं, 13-13 के 4 **रंगों** (सूट) में: हुकुम (♠) और चिड़ी (♣) काले हैं, पान (♥) और ईंट (♦) लाल। हर रंग में एक इक्का, 2 से 10, और एक ग़ुलाम, बेगम और बादशाह हैं। बादशाह, बेगम और ग़ुलाम **फ़ेस कार्ड** (तस्वीर वाले पत्ते) हैं। अच्छी तरह फेंटी गड्डी में हर पत्ता समप्रायिक होता है।",
        ),
      ),
      pack,
      goal,
      worked,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 7: choosing a class representative, and Example 12: the shirts. */
const choose = page(
  "choose",
  (b) => {
    const w = wordsOn(b);
    const sujatha = choiceQuestion(b, {
      name: "sujatha",
      prompt: t(
        "Example 12. A carton has 100 shirts: 88 good, 8 with minor defects and 4 with major defects. Sujatha rejects only shirts with major defects. What is the probability that a shirt drawn at random is acceptable to her?",
        "उदाहरण 12. एक डिब्बे में 100 कमीज़ें हैं: 88 अच्छी, 8 में छोटे दोष और 4 में बड़े दोष। सुजाता केवल बड़े दोष वाली कमीज़ें लौटाती है। यादृच्छया निकाली कमीज़ उसे स्वीकार होने की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t("0.96", "0.96") },
        {
          id: "jimmy",
          label: t("0.88", "0.88"),
          feedback: t(
            "0.88 counts only the good shirts. Sujatha also accepts the 8 with minor defects: (88 + 8) ÷ 100.",
            "0.88 केवल अच्छी कमीज़ें गिनता है। सुजाता छोटे दोष वाली 8 भी स्वीकार करती है: (88 + 8) ÷ 100।",
          ),
        },
        {
          id: "major",
          label: t("0.04", "0.04"),
          feedback: t(
            "0.04 is the chance she **rejects** it (4 major defects). She accepts the rest: 1 − 0.04 = 0.96.",
            "0.04 उसके **लौटाने** की संभावना है (4 बड़े दोष)। बाक़ी वह स्वीकार करती है: 1 − 0.04 = 0.96।",
          ),
        },
        {
          id: "minor",
          label: t("0.08", "0.08"),
          feedback: t(
            "0.08 counts only the minor defects. She accepts good and minor-defect shirts: 96 of 100.",
            "0.08 केवल छोटे दोष गिनता है। वह अच्छी और छोटे दोष वाली दोनों लेती है: 100 में 96।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Picking one at random", "यादृच्छया एक चुनना")),
      w.definition(
        t(
          "**At random.** Choosing **at random** means choosing so that every item is equally likely, like a name drawn from a box or a shirt pulled from a carton without looking.",
          "**यादृच्छया।** **यादृच्छया** चुनने का मतलब है ऐसे चुनना कि हर चीज़ समप्रायिक हो, जैसे डिब्बे से नाम की पर्ची निकालना या बिना देखे डिब्बे से कमीज़ निकालना।",
        ),
      ),
      w.body(
        t(
          "**Example 7.** A class of 40 students has 25 girls and 15 boys. The teacher picks one name at random as class representative. Each of the 40 students is equally likely, so",
          "**उदाहरण 7।** 40 विद्यार्थियों की कक्षा में 25 लड़कियाँ और 15 लड़के हैं। शिक्षक कक्षा प्रतिनिधि के लिए यादृच्छया एक नाम चुनते हैं। 40 में से हर विद्यार्थी समप्रायिक है, इसलिए",
        ),
      ),
      w.body(
        t(
          r`$$P(\text{a girl}) = \dfrac{25}{40} = \dfrac{5}{8}, \qquad P(\text{a boy}) = \dfrac{15}{40} = \dfrac{3}{8}$$`,
          r`$$P(\text{लड़की}) = \dfrac{25}{40} = \dfrac{5}{8}, \qquad P(\text{लड़का}) = \dfrac{15}{40} = \dfrac{3}{8}$$`,
        ),
      ),
      w.body(
        t(
          "The two add to 1, because the representative must be a girl or a boy.",
          "दोनों का योग 1 है, क्योंकि प्रतिनिधि लड़की या लड़का होगा ही।",
        ),
      ),
      sujatha,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 8: the box of marbles; colours are not equally likely, but marbles are. */
const marbles = page(
  "marbles",
  (b) => {
    const w = wordsOn(b);
    const white = choiceQuestion(b, {
      name: "white",
      prompt: t(
        "Example 8. A box has 3 blue, 2 white and 4 red marbles. One is taken out at random. What is P(white)?",
        "उदाहरण 8. एक डिब्बे में 3 नीले, 2 सफ़ेद और 4 लाल कंचे हैं। यादृच्छया एक निकाला जाता है। P(सफ़ेद) क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{2}{9}$`, r`$\dfrac{2}{9}$`) },
        {
          id: "third",
          label: t(r`$\dfrac{1}{3}$`, r`$\dfrac{1}{3}$`),
          feedback: t(
            "That treats the 3 colours as equally likely. There are 9 marbles, and 2 of them are white: 2/9.",
            "यह 3 रंगों को समप्रायिक मान लेता है। कंचे 9 हैं, और उनमें 2 सफ़ेद हैं: 2/9।",
          ),
        },
        {
          id: "seven",
          label: t(r`$\dfrac{2}{7}$`, r`$\dfrac{2}{7}$`),
          feedback: t(
            "7 is the marbles that are **not** white. Divide by all the marbles: 2/9.",
            "7 तो वे कंचे हैं जो सफ़ेद **नहीं** हैं। सारे कंचों से भाग दो: 2/9।",
          ),
        },
        {
          id: "nine",
          label: t(r`$\dfrac{1}{9}$`, r`$\dfrac{1}{9}$`),
          feedback: t(
            "There are 2 white marbles, so 2 outcomes are favourable, not 1: 2/9.",
            "सफ़ेद कंचे 2 हैं, तो 2 परिणाम अनुकूल हैं, 1 नहीं: 2/9।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Marbles, not colours", "रंग नहीं, कंचे")),
      w.body(
        t(
          "With marbles of different colours, the **colours** are not equally likely, but each **marble** is. So count marbles: there are 3 + 2 + 4 = 9 equally likely outcomes.",
          "अलग-अलग रंग के कंचों में **रंग** समप्रायिक नहीं होते, पर हर **कंचा** होता है। इसलिए कंचे गिनो: 3 + 2 + 4 = 9 समप्रायिक परिणाम हैं।",
        ),
      ),
      white,
      w.body(
        t(
          r`In the same way $P(\text{blue}) = \dfrac{3}{9} = \dfrac{1}{3}$ and $P(\text{red}) = \dfrac{4}{9}$. The three add to 1, as they must: every marble is one of the three colours.`,
          r`इसी तरह $P(\text{नीला}) = \dfrac{3}{9} = \dfrac{1}{3}$ और $P(\text{लाल}) = \dfrac{4}{9}$। तीनों का योग 1 है, जैसा होना चाहिए: हर कंचा तीन में से किसी एक रंग का है।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The marble jar and the card trick compared; Riya checks the jar 1000 times. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const jar = b.prop(chanceRunDef, "jar", {
      kind: Experiment.Bag,
      marbles: [
        { colour: Colour.Blue, count: 3 },
        { colour: Colour.White, count: 2 },
        { colour: Colour.Red, count: 4 },
      ],
      favourable: ["white"],
      eventLabel: { en: "a white marble (a win)", hi: "सफ़ेद कंचा (जीत)" },
      seed: 17,
      batches: [10, 100, 1000],
    });
    b.studentOnly(jar.action(RunAction.Run));
    b.studentOnly(jar.action(RunAction.Reset));
    b.standsFor(
      jar,
      "Kabir's jar of 3 blue, 2 white and 4 red marbles, drawn from in batches; the fraction of white draws graphed beside the theoretical 2/9",
    );
    const goal = goalQuestion(b, {
      about: jar,
      prompt: t(
        "Play the jar game at least 1000 times and compare the fraction of wins with 2/9 (about 0.22).",
        "जार वाला खेल कम से कम 1000 बार खेलो और जीत के भिन्न की तुलना 2/9 (लगभग 0.22) से करो।",
      ),
      isMet: jar.field("trials").ge(1000),
      solve: [jar.learner(RunAction.Run, { times: 1000 })],
    });
    const more = choiceQuestion(b, {
      name: "more",
      prompt: t(
        "Grandpa's ace game wins with probability 1/13; the jar wins with 2/9. Which game hands out more prizes?",
        "दादाजी का इक्के वाला खेल 1/13 प्रायिकता से जीतता है; जार 2/9 से। कौन-सा खेल ज़्यादा इनाम बाँटता है?",
      ),
      options: [
        {
          id: "right",
          label: t("The marble jar: 2/9 is about 0.22", "कंचों का जार: 2/9 लगभग 0.22 है"),
        },
        {
          id: "cards",
          label: t("The ace game: 13 is bigger than 9", "इक्के वाला खेल: 13, 9 से बड़ा है"),
          feedback: t(
            "A bigger bottom number means a smaller fraction. 1/13 is about 0.08, less than 2/9 ≈ 0.22.",
            "नीचे की बड़ी संख्या का मतलब छोटा भिन्न है। 1/13 लगभग 0.08 है, जो 2/9 ≈ 0.22 से कम है।",
          ),
        },
        {
          id: "same",
          label: t("Neither: both are just luck", "कोई नहीं: दोनों बस क़िस्मत हैं"),
          feedback: t(
            "Both are luck for one player, but over a whole day the jar wins about 22 times in 100, the cards about 8.",
            "एक खिलाड़ी के लिए दोनों क़िस्मत हैं, पर पूरे दिन में जार 100 में लगभग 22 बार जीतता है, ताश लगभग 8 बार।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(more));
    return column([
      w.title(t("Check the jar", "जार की जाँच")),
      w.body(
        t(
          "Riya runs the jar game on her tablet. Over many draws, white comes out a little more than 2 times in every 9.",
          "रिया अपने टैबलेट पर जार वाला खेल चलाती है। बहुत सारी बार निकालने पर, सफ़ेद हर 9 में 2 बार से थोड़ा ऊपर-नीचे आता है।",
        ),
      ),
      jar,
      goal,
      more,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Ex 15.1 Q14 (a face card) and Q8 (red ball), then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const face = choiceQuestion(b, {
      name: "face",
      prompt: t(
        "Exercise 15.1 Q14 (ii). One card is drawn from a well-shuffled deck of 52. What is the probability of a face card?",
        "प्रश्नावली 15.1 प्रश्न 14 (ii). अच्छी तरह फेंटी 52 पत्तों की गड्डी से एक पत्ता निकाला जाता है। फ़ेस कार्ड की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{3}{13}$`, r`$\dfrac{3}{13}$`) },
        {
          id: "four",
          label: t(r`$\dfrac{4}{13}$`, r`$\dfrac{4}{13}$`),
          feedback: t(
            "Aces are not face cards. Each suit has 3 (J, Q, K): 12 of 52 = 3/13.",
            "इक्के फ़ेस कार्ड नहीं हैं। हर रंग में 3 हैं (ग़ुलाम, बेगम, बादशाह): 52 में 12 = 3/13।",
          ),
        },
        {
          id: "one",
          label: t(r`$\dfrac{3}{52}$`, r`$\dfrac{3}{52}$`),
          feedback: t(
            "3 face cards is one suit. There are 4 suits: 12 face cards of 52, which is 3/13.",
            "3 फ़ेस कार्ड तो एक रंग के हैं। रंग 4 हैं: 52 में 12 फ़ेस कार्ड, यानी 3/13।",
          ),
        },
        {
          id: "six",
          label: t(r`$\dfrac{3}{26}$`, r`$\dfrac{3}{26}$`),
          feedback: t(
            "That counts only the red face cards (6). All four suits have them: 12 of 52 = 3/13.",
            "यह केवल लाल फ़ेस कार्ड (6) गिनता है। चारों रंगों में होते हैं: 52 में 12 = 3/13।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const red = choiceQuestion(b, {
      name: "red",
      prompt: t(
        "Exercise 15.1 Q8. A bag has 3 red balls and 5 black balls. One is drawn at random. What is P(not red)?",
        "प्रश्नावली 15.1 प्रश्न 8. एक थैले में 3 लाल और 5 काली गेंदें हैं। यादृच्छया एक निकाली जाती है। P(लाल नहीं) क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{5}{8}$`, r`$\dfrac{5}{8}$`) },
        {
          id: "red",
          label: t(r`$\dfrac{3}{8}$`, r`$\dfrac{3}{8}$`),
          feedback: t(
            '3/8 is P(red). "Not red" is its complement: 1 − 3/8 = 5/8.',
            '3/8 तो P(लाल) है। "लाल नहीं" इसकी पूरक है: 1 − 3/8 = 5/8।',
          ),
        },
        {
          id: "ratio",
          label: t(r`$\dfrac{5}{3}$`, r`$\dfrac{5}{3}$`),
          feedback: t(
            "That compares black with red, and it's more than 1. Divide by all 8 balls: 5/8.",
            "यह काली की तुलना लाल से करता है, और 1 से ज़्यादा है। सारी 8 गेंदों से भाग दो: 5/8।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Grandpa's ace game: P(win) = 1/13, so the barfi lasts all day. ✓ The marble jar: P(white) = 2/9, about 22 wins per 100 players, so Kabir buys more balloons. ✓ Count equally likely items (cards, marbles, students), not categories. ✗ The big game uses two dice, and Kabir thinks 8 is a safe bet. Next stop: two coins and two dice.",
        "**मिशन लॉग।** ✓ दादाजी का इक्के वाला खेल: P(जीत) = 1/13, तो बर्फ़ी पूरे दिन चलेगी। ✓ कंचों का जार: P(सफ़ेद) = 2/9, लगभग हर 100 खिलाड़ियों पर 22 जीत, तो कबीर और गुब्बारे ख़रीदता है। ✓ समप्रायिक चीज़ें गिनो (पत्ते, कंचे, विद्यार्थी), श्रेणियाँ नहीं। ✗ बड़ा खेल दो पासों का है, और कबीर को लगता है कि 8 सुरक्षित दाँव है। अगला पड़ाव: दो सिक्के और दो पासे।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(face.on(QuestionSignal.Correct), theBoard.show(red));
    b.when(red.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), face, red, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, deck, choose, marbles, inLife, yourTurn];
