import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Where Newlands' octaves break. */
export const octaveLimits = factFamily([Concept.NewlandsOctaves], {
  calcium: {
    prompt: ["Up to which element did the law of octaves work?", "अष्टक नियम किस तत्व तक चला?"],
    right: ["Calcium", "कैल्सियम"],
    wrong: [
      [
        "Thorium",
        "थोरियम",
        "Thorium was the last in his table, but the law failed long before.",
        "थोरियम उनकी सारणी में आख़िरी था, पर नियम बहुत पहले टूट गया।",
      ],
      [
        "Lithium",
        "लीथियम",
        "Lithium and sodium matched well; it worked further.",
        "लीथियम और सोडियम ठीक मिले; यह आगे तक चला।",
      ],
    ],
  },
  "co-ni": {
    prompt: [
      "What was wrong with cobalt and nickel's place in Newlands' table?",
      "न्यूलैंड्स की सारणी में कोबाल्ट और निकेल की जगह में क्या ग़लत था?",
    ],
    right: ["They shared a slot under unlike halogens", "वे असमान हैलोजनों के नीचे एक खाना बाँटते थे"],
    wrong: [
      [
        "They sat under lithium, a soft metal",
        "वे लीथियम, एक नरम धातु, के नीचे थे",
        "They sat under fluorine, chlorine and bromine.",
        "वे फ़्लुओरीन, क्लोरीन और ब्रोमीन के नीचे थे।",
      ],
      [
        "They were left out of the table",
        "वे सारणी से बाहर छोड़ दिए गए",
        "They were in it, squeezed into one slot.",
        "वे उसमें थे, एक खाने में ठूँसे हुए।",
      ],
    ],
  },
  iron: {
    prompt: [
      "Where did Newlands put iron, which is like cobalt and nickel?",
      "न्यूलैंड्स ने लोहे को, जो कोबाल्ट और निकेल जैसा है, कहाँ रखा?",
    ],
    right: ["Far away from them", "उनसे बहुत दूर"],
    wrong: [
      [
        "In the same slot as them",
        "उनके साथ उसी खाने में",
        "Only Co and Ni shared a slot; iron was placed elsewhere.",
        "केवल Co और Ni ने एक खाना बाँटा; लोहा कहीं और रखा गया।",
      ],
      [
        "Right next to them",
        "ठीक उनके बगल में",
        "He put it under ni, a long way from Co and Ni.",
        "उन्होंने उसे नि के नीचे, Co और Ni से काफ़ी दूर रखा।",
      ],
    ],
  },
  noble: {
    prompt: [
      "Which discovery made the law of octaves irrelevant?",
      "किस खोज ने अष्टक नियम को अप्रासंगिक बना दिया?",
    ],
    right: ["The noble gases", "उत्कृष्ट गैसें"],
    wrong: [
      [
        "The isotopes",
        "समस्थानिक",
        "Isotopes troubled Mendeléev's table, later.",
        "समस्थानिकों ने बाद में मेंडेलीफ़ की सारणी को परेशान किया।",
      ],
      ["The triads", "त्रिक", "Triads came before octaves.", "त्रिक अष्टकों से पहले आए।"],
    ],
  },
});
