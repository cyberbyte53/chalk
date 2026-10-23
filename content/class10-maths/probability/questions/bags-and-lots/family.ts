import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

const allOf = (sum: string) =>
  t(`Divide by everything in the lot: ${sum}.`, `पूरे ढेर से भाग दो: ${sum}।`);

/** Examples 7, 8 and 12, Exercise 15.1 Q8–Q10, Q16–Q18 and Q21: drawing at random from a lot. */
const items = {
  ex7: numItem(
    t(
      "Example 7. A class has 25 girls and 15 boys. One name is drawn at random. What is P(a boy)?",
      "उदाहरण 7. एक कक्षा में 25 लड़कियाँ और 15 लड़के हैं। एक नाम यादृच्छया निकाला जाता है। P(लड़का) क्या है?",
    ),
    frac(3, 8),
    [
      [frac(3, 5), allOf("15 ÷ 40")],
      [frac(5, 8), t("5/8 is a girl (25 of 40).", "5/8 लड़की है (40 में 25)।")],
    ],
  ),
  ex8: numItem(
    t(
      "Example 8. A box has 3 blue, 2 white and 4 red marbles. One is drawn at random. What is P(white)?",
      "उदाहरण 8. एक डिब्बे में 3 नीले, 2 सफ़ेद और 4 लाल कंचे हैं। एक यादृच्छया निकाला जाता है। P(सफ़ेद) क्या है?",
    ),
    frac(2, 9),
    [
      [frac(2, 7), allOf("3 + 2 + 4 = 9")],
      [frac(1, 3), t("1/3 is blue (3 of 9). White is 2 of 9.", "1/3 नीला है (9 में 3)। सफ़ेद 9 में 2।")],
    ],
  ),
  ex12: numItem(
    t(
      "Example 12. A carton has 88 good shirts, 8 with minor defects and 4 with major defects. Jimmy takes only good ones. What is P(a random shirt is acceptable to Jimmy)?",
      "उदाहरण 12. एक डिब्बे में 88 अच्छी कमीज़ें, 8 छोटे दोष वाली और 4 बड़े दोष वाली हैं। जिमी केवल अच्छी लेता है। P(यादृच्छया कमीज़ जिमी को स्वीकार हो) क्या है?",
    ),
    "0.88",
    [
      [
        "0.96",
        t(
          "0.96 is Sujatha, who also takes minor defects.",
          "0.96 सुजाता है, जो छोटे दोष वाली भी लेती है।",
        ),
      ],
      ["0.12", t("0.12 is the shirts Jimmy rejects.", "0.12 वे कमीज़ें हैं जिन्हें जिमी लौटाता है।")],
    ],
  ),
  q8: numItem(
    t(
      "Exercise 15.1 Q8. A bag has 3 red and 5 black balls. One is drawn at random. What is P(red)?",
      "प्रश्नावली 15.1 प्रश्न 8. एक थैले में 3 लाल और 5 काली गेंदें हैं। एक यादृच्छया निकाली जाती है। P(लाल) क्या है?",
    ),
    frac(3, 8),
    [
      [frac(3, 5), allOf("3 + 5 = 8")],
      [frac(5, 8), t("5/8 is not red.", "5/8 लाल नहीं है।")],
    ],
  ),
  q9i: numItem(
    t(
      "Exercise 15.1 Q9 (i). A box has 5 red, 8 white and 4 green marbles. One is taken out at random. What is P(red)?",
      "प्रश्नावली 15.1 प्रश्न 9 (i). एक डिब्बे में 5 लाल, 8 सफ़ेद और 4 हरे कंचे हैं। एक यादृच्छया निकाला जाता है। P(लाल) क्या है?",
    ),
    frac(5, 17),
    [
      [frac(5, 12), allOf("5 + 8 + 4 = 17")],
      [frac(1, 3), t("The colours aren't equally likely: 5 of 17.", "रंग समप्रायिक नहीं: 17 में 5।")],
    ],
  ),
  q9ii: numItem(
    t(
      "Exercise 15.1 Q9 (ii). The box has 5 red, 8 white and 4 green marbles. What is P(white)?",
      "प्रश्नावली 15.1 प्रश्न 9 (ii). डिब्बे में 5 लाल, 8 सफ़ेद और 4 हरे कंचे हैं। P(सफ़ेद) क्या है?",
    ),
    frac(8, 17),
    [
      [frac(8, 9), allOf("5 + 8 + 4 = 17")],
      [frac(1, 2), t("8 of 17 is a bit under a half: 8/17.", "17 में 8 आधे से थोड़ा कम है: 8/17।")],
    ],
  ),
  q9iii: numItem(
    t(
      "Exercise 15.1 Q9 (iii). The box has 5 red, 8 white and 4 green marbles. What is P(not green)?",
      "प्रश्नावली 15.1 प्रश्न 9 (iii). डिब्बे में 5 लाल, 8 सफ़ेद और 4 हरे कंचे हैं। P(हरा नहीं) क्या है?",
    ),
    frac(13, 17),
    [
      [
        frac(4, 17),
        t("4/17 is green. Not green: 1 − 4/17 = 13/17.", "4/17 हरा है। हरा नहीं: 1 − 4/17 = 13/17।"),
      ],
      [frac(13, 4), t("Upside down, and above 1. 13 of 17.", "उलटा है, और 1 से बड़ा। 17 में 13।")],
    ],
  ),
  q10i: numItem(
    t(
      "Exercise 15.1 Q10 (i). A piggy bank has 100 coins of 50p, 50 of ₹1, 20 of ₹2 and 10 of ₹5. One falls out. What is P(a 50p coin)?",
      "प्रश्नावली 15.1 प्रश्न 10 (i). एक गुल्लक में 50 पैसे के 100, ₹1 के 50, ₹2 के 20 और ₹5 के 10 सिक्के हैं। एक गिरता है। P(50 पैसे का सिक्का) क्या है?",
    ),
    frac(5, 9),
    [
      [frac(1, 4), t("Count coins, not kinds: 100 of 180.", "क़िस्में नहीं, सिक्के गिनो: 180 में 100।")],
      [frac(5, 4), allOf("100 + 50 + 20 + 10 = 180")],
    ],
  ),
  q10ii: numItem(
    t(
      "Exercise 15.1 Q10 (ii). The same piggy bank (180 coins, 10 of them ₹5). What is P(the coin is **not** ₹5)?",
      "प्रश्नावली 15.1 प्रश्न 10 (ii). वही गुल्लक (180 सिक्के, उनमें 10 ₹5 के)। P(सिक्का ₹5 का **नहीं** है) क्या है?",
    ),
    frac(17, 18),
    [
      [
        frac(1, 18),
        t("1/18 is a ₹5 coin. Not ₹5: 170 of 180.", "1/18 ₹5 का सिक्का है। ₹5 नहीं: 180 में 170।"),
      ],
      [frac(3, 4), t("Count coins, not kinds: 170 of 180.", "क़िस्में नहीं, सिक्के गिनो: 180 में 170।")],
    ],
  ),
  q16: numItem(
    t(
      "Exercise 15.1 Q16. 12 defective pens are mixed with 132 good ones. One is taken out at random. What is P(good)?",
      "प्रश्नावली 15.1 प्रश्न 16. 12 ख़राब पेन 132 अच्छे पेनों में मिल गए हैं। एक यादृच्छया निकाला जाता है। P(अच्छा) क्या है?",
    ),
    frac(11, 12),
    [
      [frac(11, 1), allOf("12 + 132 = 144")],
      [frac(1, 12), t("1/12 is a defective pen (12 of 144).", "1/12 ख़राब पेन है (144 में 12)।")],
    ],
  ),
  q17i: numItem(
    t(
      "Exercise 15.1 Q17 (i). A lot of 20 bulbs has 4 defective ones. One is drawn at random. What is P(defective)?",
      "प्रश्नावली 15.1 प्रश्न 17 (i). 20 बल्बों के ढेर में 4 ख़राब हैं। एक यादृच्छया निकाला जाता है। P(ख़राब) क्या है?",
    ),
    frac(1, 5),
    [
      [
        frac(1, 4),
        t("4 of 20, not 4 of 16: divide by all 20.", "20 में 4, 16 में 4 नहीं: सारे 20 से भाग दो।"),
      ],
      [frac(4, 5), t("4/5 is not defective.", "4/5 ख़राब नहीं है।")],
    ],
  ),
  q17ii: numItem(
    t(
      "Exercise 15.1 Q17 (ii). The bulb drawn was good and is not put back. Another is drawn from the rest. What is P(not defective)?",
      "प्रश्नावली 15.1 प्रश्न 17 (ii). निकाला गया बल्ब अच्छा था और वापस नहीं रखा गया। बाक़ी में से एक और निकाला जाता है। P(ख़राब नहीं) क्या है?",
    ),
    frac(15, 19),
    [
      [
        frac(16, 20),
        t("One good bulb is gone: 15 good of 19 left.", "एक अच्छा बल्ब जा चुका: बचे 19 में 15 अच्छे।"),
      ],
      [
        frac(16, 19),
        t("The good bulb left the lot too: 15 good remain.", "अच्छा बल्ब ढेर से गया भी: 15 अच्छे बचे।"),
      ],
    ],
  ),
  q18i: numItem(
    t(
      "Exercise 15.1 Q18 (i). A box has discs numbered 1 to 90. One is drawn at random. What is P(a two-digit number)?",
      "प्रश्नावली 15.1 प्रश्न 18 (i). एक डिब्बे में 1 से 90 तक संख्या वाली डिस्क हैं। एक यादृच्छया निकाली जाती है। P(दो अंकों की संख्या) क्या है?",
    ),
    frac(9, 10),
    [
      [
        frac(8, 9),
        t("10 to 90 is 81 discs, not 80: 81/90.", "10 से 90 तक 81 डिस्क हैं, 80 नहीं: 81/90।"),
      ],
      [frac(1, 10), t("1/10 is a one-digit number (1 to 9).", "1/10 एक अंक की संख्या है (1 से 9)।")],
    ],
  ),
  q18ii: numItem(
    t(
      "Exercise 15.1 Q18 (ii). Discs numbered 1 to 90. What is P(a perfect square)?",
      "प्रश्नावली 15.1 प्रश्न 18 (ii). 1 से 90 तक संख्या वाली डिस्क। P(पूर्ण वर्ग) क्या है?",
    ),
    frac(1, 10),
    [
      [
        frac(1, 9),
        t(
          "1, 4, 9, …, 81 is 9 squares (1 counts). 9 of 90.",
          "1, 4, 9, …, 81 यानी 9 वर्ग (1 भी गिनो)। 90 में 9।",
        ),
      ],
      [frac(4, 45), t("Don't forget 1 = 1²: there are 9 squares.", "1 = 1² मत भूलो: 9 वर्ग हैं।")],
    ],
  ),
  q18iii: numItem(
    t(
      "Exercise 15.1 Q18 (iii). Discs numbered 1 to 90. What is P(a number divisible by 5)?",
      "प्रश्नावली 15.1 प्रश्न 18 (iii). 1 से 90 तक संख्या वाली डिस्क। P(5 से विभाज्य संख्या) क्या है?",
    ),
    frac(1, 5),
    [
      [
        frac(1, 18),
        t("5, 10, …, 90 is 18 numbers: 18 of 90.", "5, 10, …, 90 यानी 18 संख्याएँ: 90 में 18।"),
      ],
      [frac(1, 10), t("Multiples of 5, not of 10: 18 of 90.", "5 के गुणज, 10 के नहीं: 90 में 18।")],
    ],
  ),
  q21i: numItem(
    t(
      "Exercise 15.1 Q21 (i). Of 144 pens, 20 are defective. Nuri buys only a good one. What is P(she buys the pen she is given)?",
      "प्रश्नावली 15.1 प्रश्न 21 (i). 144 पेनों में 20 ख़राब हैं। नूरी केवल अच्छा पेन ख़रीदती है। P(वह दिया गया पेन ख़रीदे) क्या है?",
    ),
    frac(31, 36),
    [
      [
        frac(5, 36),
        t("5/36 is a defective pen: she won't buy it.", "5/36 ख़राब पेन है: वह नहीं ख़रीदेगी।"),
      ],
      [frac(31, 5), allOf("124 good of 144")],
    ],
  ),
  q21ii: numItem(
    t(
      "Exercise 15.1 Q21 (ii). Of 144 pens, 20 are defective. What is P(Nuri will **not** buy the pen)?",
      "प्रश्नावली 15.1 प्रश्न 21 (ii). 144 पेनों में 20 ख़राब हैं। P(नूरी पेन **नहीं** ख़रीदेगी) क्या है?",
    ),
    frac(5, 36),
    [
      [frac(5, 31), allOf("20 ÷ 144")],
      [frac(31, 36), t("31/36 is when she buys it.", "31/36 तब है जब वह ख़रीदती है।")],
    ],
  ),
} satisfies Record<string, Item>;

/** Find probabilities when one thing is drawn at random from a bag, box or lot. */
export const bagsAndLots = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.CardsBagsAndChoosing],
});
