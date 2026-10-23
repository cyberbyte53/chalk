import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const diameter = t(
  "That uses the diameter where the radius belongs (or the other way round). Radius is half the diameter.",
  "इसमें त्रिज्या की जगह व्यास लिया (या उलटा)। त्रिज्या व्यास की आधी होती है।",
);
const lengthNotArea = t(
  "A boundary, rim or fence is a length: 2πr. πr² is the area inside.",
  "सीमा, किनारा या बाड़ एक लंबाई है: 2πr। πr² अंदर का क्षेत्रफल है।",
);
const areaNotLength = t(
  "Covering, ploughing or painting needs the area, πr², not the circumference.",
  "ढकने, जोतने या रंगने में क्षेत्रफल, πr², चाहिए, परिधि नहीं।",
);

/** Exercise 12.1 Q1, Q2, Q5; Example 1; plain circumference and area. */
const items = {
  q1: numItem(
    t(
      "Circles of radius 19 cm and 9 cm. Find the radius of the circle whose circumference is the sum of theirs.",
      "19 cm और 9 cm त्रिज्या के वृत्त। उस वृत्त की त्रिज्या ज्ञात करो जिसकी परिधि इनकी परिधियों का योग है।",
    ),
    "28 cm",
    [
      [
        "21 cm",
        t(
          r`21 is what you'd get adding areas: $\sqrt{19^2 + 9^2}$ is about 21. For circumferences, $2\pi R = 2\pi(19 + 9)$, so $R = 28$.`,
          r`21 क्षेत्रफल जोड़ने पर आता: $\sqrt{19^2 + 9^2}$ लगभग 21। परिधियों के लिए $2\pi R = 2\pi(19 + 9)$, तो $R = 28$।`,
        ),
      ],
      [
        "14 cm",
        t(
          r`14 is the average of 19 and 9. The circumferences add: $2\pi R = 2\pi \times 19 + 2\pi \times 9$.`,
          r`14, 19 और 9 का औसत है। परिधियाँ जुड़ती हैं: $2\pi R = 2\pi \times 19 + 2\pi \times 9$।`,
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Circles of radius 8 cm and 6 cm. Find the radius of the circle whose area is the sum of their areas.",
      "8 cm और 6 cm त्रिज्या के वृत्त। उस वृत्त की त्रिज्या ज्ञात करो जिसका क्षेत्रफल इनके क्षेत्रफलों का योग है।",
    ),
    "10 cm",
    [
      [
        "14 cm",
        t(
          r`Radii add for circumferences, not areas. $\pi R^2 = 64\pi + 36\pi$, so $R^2 = 100$.`,
          r`परिधियों में त्रिज्याएँ जुड़ती हैं, क्षेत्रफल में नहीं। $\pi R^2 = 64\pi + 36\pi$, तो $R^2 = 100$।`,
        ),
      ],
      [
        "100 cm",
        t(r`100 is $R^2$. Take the square root: $R = 10$.`, r`100, $R^2$ है। वर्गमूल लो: $R = 10$।`),
      ],
    ],
  ),
  q5: numItem(
    t(
      "If a circle's perimeter and area are numerically equal, its radius is:",
      "यदि किसी वृत्त का परिमाप और क्षेत्रफल संख्या में बराबर हों, तो उसकी त्रिज्या है:",
    ),
    "2 units",
    [
      [
        "π units",
        t(
          r`$2\pi r = \pi r^2$; divide by $\pi r$: $r = 2$. π cancels.`,
          r`$2\pi r = \pi r^2$; $\pi r$ से भाग दो: $r = 2$। π कट जाता है।`,
        ),
      ],
      [
        "4 units",
        t("4 is the diameter of that circle, not its radius.", "4 उस वृत्त का व्यास है, त्रिज्या नहीं।"),
      ],
      [
        "7 units",
        t(
          r`7 comes from $\frac{22}{7}$, but π cancels out completely.`,
          r`7, $\frac{22}{7}$ से आता है, पर π पूरी तरह कट जाता है।`,
        ),
      ],
    ],
  ),
  ex1r: numItem(
    t(
      "Fencing a circular field at ₹24 per metre costs ₹5280. What is the field's radius?",
      "एक वृत्ताकार खेत की बाड़ ₹24 प्रति मीटर की दर से ₹5280 में लगती है। खेत की त्रिज्या क्या है?",
    ),
    "35 m",
    [
      ["70 m", diameter],
      [
        "220 m",
        t(
          r`220 m is the fence's length, the circumference. Solve $2\pi r = 220$ for $r$.`,
          r`220 m बाड़ की लंबाई है, परिधि। $2\pi r = 220$ से $r$ निकालो।`,
        ),
      ],
    ],
  ),
  ex1cost: numItem(
    t(
      "That field has radius 35 m. Ploughing costs ₹0.50 per m². What does ploughing cost?",
      "उस खेत की त्रिज्या 35 m है। जुताई ₹0.50 प्रति m² है। जुताई में कितना लगेगा?",
    ),
    "₹1925",
    [
      ["₹110", areaNotLength],
      [
        "₹3850",
        t(
          "3850 m² is the area. Multiply by the rate, ₹0.50, to get the cost.",
          "3850 m² क्षेत्रफल है। ख़र्च के लिए दर, ₹0.50, से गुणा करो।",
        ),
      ],
    ],
  ),
  rim21: numItem(
    t(
      "Find the circumference of a circle of radius 21 cm.",
      "21 cm त्रिज्या वाले वृत्त की परिधि ज्ञात करो।",
    ),
    "132 cm",
    [
      [
        "66 cm",
        t(
          r`That's $\pi r$, half the circumference. Use $2\pi r$.`,
          r`यह $\pi r$ है, आधी परिधि। $2\pi r$ लो।`,
        ),
      ],
      ["1386 cm", lengthNotArea],
    ],
  ),
  area14: numItem(
    t("Find the area of a circle of diameter 28 cm.", "28 cm व्यास वाले वृत्त का क्षेत्रफल ज्ञात करो।"),
    "616 cm²",
    [
      ["2464 cm²", diameter],
      [
        "88 cm²",
        t(
          "88 is the circumference in cm. The area is πr² with r = 14.",
          "88 cm में परिधि है। क्षेत्रफल r = 14 के साथ πr² है।",
        ),
      ],
    ],
  ),
} as const;

export const circleMeasures = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.CircumferenceAndArea],
});
