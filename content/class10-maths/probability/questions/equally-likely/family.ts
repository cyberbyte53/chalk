import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const yes = t("Yes, equally likely", "हाँ, समप्रायिक");
const no = t("No, not equally likely", "नहीं, समप्रायिक नहीं");
const cantSay = t("Only if it is tried 1000 times", "केवल अगर 1000 बार आज़माया जाए");
const skill = (what: { en: string; hi: string }) =>
  t(
    `It depends on ${what.en}, so one result can be much likelier than the other.`,
    `यह ${what.hi} पर निर्भर है, तो एक परिणाम दूसरे से बहुत ज़्यादा संभव हो सकता है।`,
  );
const trials = t(
  "Equally likely is about the experiment itself, not about how often you try it.",
  "समप्रायिक होना प्रयोग के बारे में है, इस बारे में नहीं कि तुम कितनी बार आज़माते हो।",
);
const ask = (what: { en: string; hi: string }) =>
  t(
    `Exercise 15.1 Q2. ${what.en} Are the two outcomes equally likely?`,
    `प्रश्नावली 15.1 प्रश्न 2. ${what.hi} क्या दोनों परिणाम समप्रायिक हैं?`,
  );

/** Exercise 15.1 Q1 (iv), Q2, Q3 and Q25 (ii): when are outcomes equally likely? */
const items = {
  q2car: {
    prompt: ask({
      en: "A driver tries to start a car: it starts or it doesn't.",
      hi: "एक ड्राइवर कार चालू करने की कोशिश करता है: वह चालू होती है या नहीं।",
    }),
    right: no,
    wrong: [
      { label: yes, why: skill({ en: "the car's condition", hi: "कार की हालत" }) },
      { label: cantSay, why: trials },
    ],
  },
  q2ball: {
    prompt: ask({
      en: "A player shoots a basketball: she scores or misses.",
      hi: "एक खिलाड़ी बास्केटबॉल फेंकती है: वह स्कोर करती है या चूकती है।",
    }),
    right: no,
    wrong: [
      { label: yes, why: skill({ en: "the player's skill", hi: "खिलाड़ी के कौशल" }) },
      { label: cantSay, why: trials },
    ],
  },
  q2quiz: {
    prompt: ask({
      en: "A true-false question is answered: right or wrong.",
      hi: "एक सही-ग़लत प्रश्न का उत्तर दिया जाता है: सही या ग़लत।",
    }),
    right: yes,
    wrong: [
      {
        label: no,
        why: t(
          "With no other information we assume a guess, so right and wrong are equally likely (NCERT's answer).",
          "कोई और जानकारी न हो तो हम अंदाज़ा मानते हैं, तो सही और ग़लत समप्रायिक हैं (NCERT का उत्तर)।",
        ),
      },
      { label: cantSay, why: trials },
    ],
  },
  q2baby: {
    prompt: ask({
      en: "A baby is born: a boy or a girl.",
      hi: "एक बच्चा पैदा होता है: लड़का या लड़की।",
    }),
    right: yes,
    wrong: [
      {
        label: no,
        why: t(
          "Nature gives the two about the same chance; nobody's skill or choice is involved.",
          "प्रकृति दोनों को लगभग बराबर संभावना देती है; किसी का कौशल या चुनाव शामिल नहीं।",
        ),
      },
      { label: cantSay, why: trials },
    ],
  },
  q3: {
    prompt: t(
      "Exercise 15.1 Q3. Why is tossing a coin a fair way to decide which team starts a football match?",
      "प्रश्नावली 15.1 प्रश्न 3. फ़ुटबॉल मैच कौन-सी टीम शुरू करे, यह तय करने के लिए सिक्का उछालना न्यायसंगत क्यों है?",
    ),
    right: t("Head and tail are equally likely", "चित और पट समप्रायिक हैं"),
    wrong: [
      {
        label: t("The captain who calls usually wins", "जो कप्तान बोलता है वह अक्सर जीतता है"),
        why: t(
          "The call can't change the coin: each side has probability 1/2, whoever calls.",
          "बोलने से सिक्का नहीं बदलता: कोई भी बोले, हर पक्ष की प्रायिकता 1/2 है।",
        ),
      },
      {
        label: t("Heads comes up a bit more often", "चित थोड़ा ज़्यादा बार आता है"),
        why: t(
          "For a fair coin neither side is likelier: P(H) = P(T) = 1/2.",
          "न्यायसंगत सिक्के में कोई पक्ष ज़्यादा संभव नहीं: P(H) = P(T) = 1/2।",
        ),
      },
    ],
  },
  q25ii: {
    prompt: t(
      'Exercise 15.1 Q25 (ii). "A die gives an odd or an even number, so P(odd) = 1/2." Is the argument correct?',
      'प्रश्नावली 15.1 प्रश्न 25 (ii). "पासे पर विषम या सम संख्या आती है, इसलिए P(विषम) = 1/2।" क्या तर्क सही है?',
    ),
    right: t("Correct: 3 odd faces of 6", "सही: 6 में 3 विषम फलक"),
    wrong: [
      {
        label: t("Incorrect: 4 odd faces of 6", "ग़लत: 6 में 4 विषम फलक"),
        why: t(
          "The odd faces are 1, 3, 5: three of six, so the two events are equally likely.",
          "विषम फलक 1, 3, 5 हैं: छह में तीन, तो दोनों घटनाएँ समप्रायिक हैं।",
        ),
      },
      {
        label: t("Incorrect: there are 6 outcomes", "ग़लत: परिणाम 6 हैं"),
        why: t(
          "There are 6 outcomes, and 3 of them are odd: 3/6 = 1/2, so the answer is right.",
          "परिणाम 6 हैं, और उनमें 3 विषम: 3/6 = 1/2, तो उत्तर सही है।",
        ),
      },
    ],
  },
  q1iv: {
    prompt: t(
      "Exercise 15.1 Q1 (iv). The probabilities of all the elementary events of an experiment add up to…",
      "प्रश्नावली 15.1 प्रश्न 1 (iv). किसी प्रयोग की सारी प्रारंभिक घटनाओं की प्रायिकताओं का योग होता है…",
    ),
    right: t("1", "1"),
    wrong: [
      {
        label: t("0", "0"),
        why: t(
          "Some outcome always happens, so together they make a sure event: 1.",
          "कोई न कोई परिणाम हमेशा होता है, तो मिलकर वे निश्चित घटना बनाते हैं: 1।",
        ),
      },
      {
        label: t("the number of outcomes", "परिणामों की संख्या"),
        why: t("Each is 1/n, and n of them add to 1.", "हर एक 1/n है, और n का योग 1 है।"),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Decide whether outcomes are equally likely, and why it matters. */
export const equallyLikely = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.ExperimentalAndTheoretical],
});
