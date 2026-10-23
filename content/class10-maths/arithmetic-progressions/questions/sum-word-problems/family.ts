import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const oneTerm = t(
  "That's only one term (the last). The question asks for the total.",
  "यह सिर्फ़ एक पद (अंतिम) है। सवाल कुल पूछता है।",
);

/** Example 16 and Exercise 5.3 Q15–Q20: word problems that need a sum. */
const items = {
  ex16: numItem(
    t(
      "A factory made 600 TV sets in year 3 and 700 in year 7, rising evenly. How many in the first 7 years?",
      "एक कारख़ाने ने तीसरे साल 600 और 7वें साल 700 टीवी सेट बनाए, बराबर बढ़ते हुए। पहले 7 सालों में कितने?",
    ),
    "4375",
    [
      [
        "4550",
        t(
          "Find the first year first: a + 2d = 600, a + 6d = 700 give a = 550.",
          "पहले पहला साल निकालो: a + 2d = 600, a + 6d = 700 से a = 550।",
        ),
      ],
      ["700", oneTerm],
    ],
  ),
  q15: numItem(
    t(
      "A penalty is ₹200 for the first day late, ₹250 for the second, ₹300 for the third, …. What is it for 30 days?",
      "एक जुर्माना देरी के पहले दिन ₹200, दूसरे ₹250, तीसरे ₹300, … है। 30 दिनों का कितना?",
    ),
    "₹27750",
    [
      ["₹1650", oneTerm],
      [
        "₹28500",
        t(
          "Use n − 1 = 29 in the bracket: 15[400 + 29 × 50].",
          "कोष्ठक में n − 1 = 29 लो: 15[400 + 29 × 50]।",
        ),
      ],
    ],
  ),
  q16: numItem(
    t(
      "₹700 is shared as 7 prizes, each ₹20 less than the one before. What are the prizes?",
      "₹700 को 7 इनामों में बाँटा गया, हर एक पिछले से ₹20 कम। इनाम क्या हैं?",
    ),
    "₹160, 140, 120, 100, 80, 60, 40",
    [
      [
        "₹100 each",
        t(
          "The prizes fall by ₹20 each time; ₹100 is only the middle one.",
          "इनाम हर बार ₹20 घटते हैं; ₹100 सिर्फ़ बीच वाला है।",
        ),
      ],
      [
        "₹220, 200, 180, 160, 140, 120, 100",
        t(
          "Check the total: these add to ₹1120, not ₹700. 7/2 [2a − 120] = 700 gives a = 160.",
          "कुल जाँचो: इनका योग ₹1120 है, ₹700 नहीं। 7/2 [2a − 120] = 700 से a = 160।",
        ),
      ],
    ],
  ),
  q17: numItem(
    t(
      "Each section of Class I plants 1 tree, Class II 2 trees, …, Class XII 12. There are 3 sections per class. How many trees?",
      "कक्षा I का हर वर्ग 1 पेड़ लगाता है, कक्षा II 2, …, कक्षा XII 12। हर कक्षा के 3 वर्ग हैं। कितने पेड़?",
    ),
    "234",
    [
      [
        "78",
        t("78 is one section per class. Multiply by 3.", "78 हर कक्षा का एक वर्ग है। 3 से गुणा करो।"),
      ],
      ["36", t("36 is the number of sections.", "36 वर्गों की संख्या है।")],
    ],
  ),
  q18: numItem(
    t(
      "A spiral is made of 13 semicircles of radii 0.5, 1.0, 1.5, … cm. How long is it? (Take π = 22/7.)",
      "एक सर्पिल 0.5, 1.0, 1.5, … cm त्रिज्या वाले 13 अर्धवृत्तों से बना है। यह कितना लंबा है? (π = 22/7 लो।)",
    ),
    "143 cm",
    [
      ["286 cm", t("A semicircle is πr long, not 2πr.", "अर्धवृत्त की लंबाई πr है, 2πr नहीं।")],
      ["20.4 cm", oneTerm],
    ],
  ),
  q19: numItem(
    t(
      "200 logs are stacked: 20 in the bottom row, 19 in the next, and so on. How many rows, and how many logs on top?",
      "200 लट्ठे रखे हैं: नीचे की पंक्ति में 20, अगली में 19, और इसी तरह। कितनी पंक्तियाँ, और ऊपर कितने लट्ठे?",
    ),
    "16 rows, 5 on top",
    [
      [
        "25 rows, −4 on top",
        t(
          "n = 25 is a root of n² − 41n + 400 = 0, but a row can't hold −4 logs.",
          "n = 25, n² − 41n + 400 = 0 का मूल है, पर किसी पंक्ति में −4 लट्ठे नहीं हो सकते।",
        ),
      ],
      [
        "10 rows, 11 on top",
        t("Check: 20 + 19 + … + 11 = 155, not 200.", "जाँचो: 20 + 19 + … + 11 = 155, 200 नहीं।"),
      ],
    ],
  ),
  q20: numItem(
    t(
      "In a potato race the bucket is 5 m from the first potato, the potatoes are 3 m apart, and there are 10. How far does a runner run?",
      "आलू दौड़ में बाल्टी पहले आलू से 5 m दूर है, आलू 3 m के अंतर पर हैं, और 10 हैं। धावक कितना दौड़ता है?",
    ),
    "370 m",
    [
      [
        "185 m",
        t(
          "Each potato means running there and back: double it.",
          "हर आलू का मतलब है जाना और लौटना: दुगुना करो।",
        ),
      ],
      ["64 m", oneTerm],
    ],
  ),
} satisfies Record<string, Item>;

/** Word problems that need the sum of an AP. */
export const sumWordProblems = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingTheSum],
});
