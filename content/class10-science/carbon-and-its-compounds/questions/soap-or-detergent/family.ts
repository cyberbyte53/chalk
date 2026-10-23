import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Activities 4.11–4.12: hard water, scum, detergents. */
export const soapOrDetergent = factFamily([Concept.SoapsAndDetergents], {
  "hard-soap": {
    prompt: [
      "Soap is shaken in hard water. What do you see?",
      "कठोर जल में साबुन हिलाया जाता है। क्या दिखता है?",
    ],
    right: ["Little foam and a white curdy scum", "कम झाग और सफ़ेद दही जैसा मैल"],
    wrong: [
      [
        "Plenty of foam",
        "भरपूर झाग",
        "Calcium and magnesium salts turn soap into scum.",
        "कैल्शियम और मैग्नीशियम लवण साबुन को मैल बना देते हैं।",
      ],
    ],
  },
  "hard-detergent": {
    prompt: [
      "Detergent is shaken in hard water. What do you see?",
      "कठोर जल में अपमार्जक हिलाया जाता है। क्या दिखता है?",
    ],
    right: ["Plenty of foam, no scum", "भरपूर झाग, कोई मैल नहीं"],
    wrong: [
      [
        "Scum",
        "मैल",
        "Detergents don't form precipitates with calcium and magnesium.",
        "अपमार्जक कैल्शियम और मैग्नीशियम के साथ अवक्षेप नहीं बनाते।",
      ],
    ],
  },
  "hard-water": {
    prompt: ["Hard water contains dissolved salts of…", "कठोर जल में किनके घुले लवण होते हैं?"],
    right: ["Calcium and magnesium", "कैल्शियम और मैग्नीशियम"],
    wrong: [
      [
        "Sodium and potassium",
        "सोडियम और पोटैशियम",
        "Those are what soaps are made of.",
        "साबुन उन्हीं से बनते हैं।",
      ],
    ],
  },
  shampoo: {
    prompt: [
      "Shampoos and clothes-washing products are mostly…",
      "शैम्पू और कपड़े धोने के उत्पाद अधिकतर हैं…",
    ],
    right: ["Detergents", "अपमार्जक"],
    wrong: [
      [
        "Soaps",
        "साबुन",
        "Detergents work in hard water too, so they're used widely.",
        "अपमार्जक कठोर जल में भी काम करते हैं, इसलिए बहुत प्रयुक्त होते हैं।",
      ],
    ],
  },
  "detergent-salt": {
    prompt: ["Detergents are generally…", "अपमार्जक सामान्यतः हैं…"],
    right: [
      "Sodium salts of sulphonic acids, or ammonium salts",
      "सल्फ़ोनिक अम्लों के सोडियम लवण, या अमोनियम लवण",
    ],
    wrong: [
      [
        "Sodium salts of long-chain carboxylic acids",
        "लंबी शृंखला वाले कार्बोक्सिलिक अम्लों के सोडियम लवण",
        "That's soap.",
        "वह साबुन है।",
      ],
    ],
  },
});
