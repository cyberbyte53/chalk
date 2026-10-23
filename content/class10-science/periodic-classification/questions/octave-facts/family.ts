import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Newlands' law of octaves. */
export const octaveFacts = factFamily([Concept.NewlandsOctaves], {
  law: {
    prompt: ["What does Newlands' law of octaves say?", "न्यूलैंड्स का अष्टक नियम क्या कहता है?"],
    right: ["Every eighth element by mass is like the first", "द्रव्यमान से हर आठवाँ तत्व पहले जैसा है"],
    wrong: [
      [
        "Every third element by mass is like the first",
        "द्रव्यमान से हर तीसरा तत्व पहले जैसा है",
        "Groups of three were Döbereiner's triads.",
        "तीन के समूह डॉबेराइनर के त्रिक थे।",
      ],
      [
        "Every eighth element by number is like the first",
        "संख्या से हर आठवाँ तत्व पहले जैसा है",
        "Newlands used atomic mass; atomic number came later.",
        "न्यूलैंड्स ने परमाणु द्रव्यमान लिया; परमाणु संख्या बाद में आई।",
      ],
    ],
  },
  "li-na": {
    prompt: [
      "In Newlands' octaves, which element is like lithium?",
      "न्यूलैंड्स के अष्टकों में कौन-सा तत्व लीथियम जैसा है?",
    ],
    right: ["Sodium, the eighth after it", "सोडियम, उसके बाद आठवाँ"],
    wrong: [
      [
        "Beryllium, the next after it",
        "बेरिलियम, उसके ठीक बाद",
        "Neighbours differ. The eighth one matches.",
        "पड़ोसी अलग होते हैं। आठवाँ मिलता है।",
      ],
      [
        "Fluorine, the seventh after it",
        "फ़्लुओरीन, उसके बाद सातवाँ",
        "Fluorine is a non-metal gas, unlike lithium.",
        "फ़्लुओरीन एक अधातु गैस है, लीथियम जैसी नहीं।",
      ],
    ],
  },
  range: {
    prompt: [
      "Newlands' table started with hydrogen. Where did it end?",
      "न्यूलैंड्स की सारणी हाइड्रोजन से शुरू हुई। कहाँ ख़त्म हुई?",
    ],
    right: ["At thorium, the 56th element", "थोरियम पर, 56वाँ तत्व"],
    wrong: [
      [
        "At calcium, the 20th element",
        "कैल्सियम पर, 20वाँ तत्व",
        "Calcium is where the law stopped working, not where the table ended.",
        "कैल्सियम पर नियम काम करना बंद करता है, सारणी वहाँ ख़त्म नहीं होती।",
      ],
      [
        "At uranium, the 92nd element",
        "यूरेनियम पर, 92वाँ तत्व",
        "Newlands assumed only 56 elements existed.",
        "न्यूलैंड्स ने माना कि केवल 56 तत्व हैं।",
      ],
    ],
  },
  notes: {
    prompt: ["Why did Newlands call it the law of octaves?", "न्यूलैंड्स ने इसे अष्टक नियम क्यों कहा?"],
    right: [
      "Like music, the eighth note repeats the first",
      "संगीत की तरह, आठवाँ स्वर पहले को दोहराता है",
    ],
    wrong: [
      [
        "Each row held exactly eight elements",
        "हर पंक्ति में ठीक आठ तत्व थे",
        "His rows had seven; the eighth started the next row.",
        "उनकी पंक्तियों में सात थे; आठवाँ अगली पंक्ति शुरू करता था।",
      ],
      [
        "Each element bonded with eight others",
        "हर तत्व आठ अन्य से जुड़ता था",
        "It's about repeating properties, not bonds.",
        "बात दोहराते गुणों की है, आबंधों की नहीं।",
      ],
    ],
  },
});
