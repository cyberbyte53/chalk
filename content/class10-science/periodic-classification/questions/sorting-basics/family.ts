import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Why classify elements, and the first attempts. */
export const sortingBasics = factFamily([Concept.WhyClassify], {
  why: {
    prompt: [
      "Why did chemists want to classify the elements?",
      "रसायनज्ञ तत्वों का वर्गीकरण क्यों करना चाहते थे?",
    ],
    right: ["To study many elements through a pattern", "एक पैटर्न से कई तत्वों को पढ़ने के लिए"],
    wrong: [
      [
        "To decide which elements are natural",
        "यह तय करने के लिए कि कौन-से तत्व प्राकृतिक हैं",
        "Classification groups them by properties, not by origin.",
        "वर्गीकरण उन्हें गुणों से समूहबद्ध करता है, उत्पत्ति से नहीं।",
      ],
      [
        "To give every element a new name",
        "हर तत्व को नया नाम देने के लिए",
        "The names stayed. They wanted order in the facts.",
        "नाम वही रहे। उन्हें तथ्यों में क्रम चाहिए था।",
      ],
    ],
  },
  first: {
    prompt: [
      "What was the earliest way of grouping the elements?",
      "तत्वों को समूहबद्ध करने का सबसे पहला तरीक़ा क्या था?",
    ],
    right: ["Into metals and non-metals", "धातुओं और अधातुओं में"],
    wrong: [
      [
        "Into groups of three by mass",
        "द्रव्यमान से तीन-तीन के समूहों में",
        "Triads came later, in 1817.",
        "त्रिक बाद में आए, 1817 में।",
      ],
      [
        "Into rows of seven by mass",
        "द्रव्यमान से सात-सात की पंक्तियों में",
        "That was Newlands, in 1866.",
        "वह न्यूलैंड्स थे, 1866 में।",
      ],
    ],
  },
  count: {
    prompt: [
      "Of the 118 known elements, how many occur naturally?",
      "118 ज्ञात तत्वों में से कितने प्राकृतिक रूप से मिलते हैं?",
    ],
    right: ["94", "94"],
    wrong: [
      ["63", "63", "63 were known in Mendeléev's time.", "63 मेंडेलीफ़ के समय ज्ञात थे।"],
      [
        "56",
        "56",
        "56 was the last element in Newlands' table.",
        "56 न्यूलैंड्स की सारणी का आख़िरी तत्व था।",
      ],
    ],
  },
});
