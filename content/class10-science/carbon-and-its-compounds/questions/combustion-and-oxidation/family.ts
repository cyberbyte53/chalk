import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Sections 4.3.1–4.3.2: combustion equations; Activity 4.5, oxidising agents. */
export const combustionAndOxidation = factFamily([Concept.CombustionAndOxidation], {
  products: {
    prompt: [
      "Methane burns completely in oxygen. The products are…",
      "मेथेन ऑक्सीजन में पूरी तरह जलती है। उत्पाद हैं…",
    ],
    right: ["Carbon dioxide and water", "कार्बन डाइऑक्साइड और जल"],
    wrong: [
      [
        "Carbon monoxide only",
        "केवल कार्बन मोनोऑक्साइड",
        "Complete burning gives CO₂.",
        "पूरा दहन CO₂ देता है।",
      ],
      [
        "Hydrogen and carbon",
        "हाइड्रोजन और कार्बन",
        "Burning joins them with oxygen.",
        "दहन उन्हें ऑक्सीजन से जोड़ता है।",
      ],
    ],
  },
  oxidising: {
    prompt: ["Alkaline KMnO₄ turns ethanol into…", "क्षारीय KMnO₄ एथेनॉल को बना देता है…"],
    right: ["Ethanoic acid", "एथेनॉइक अम्ल"],
    wrong: [
      [
        "Ethene",
        "एथीन",
        "Ethene comes from dehydration with conc. H₂SO₄.",
        "एथीन सांद्र H₂SO₄ से निर्जलीकरण से आती है।",
      ],
      [
        "Methanol",
        "मेथेनॉल",
        "Oxidation adds oxygen; it doesn't remove a carbon.",
        "ऑक्सीकरण ऑक्सीजन जोड़ता है; कार्बन नहीं हटाता।",
      ],
    ],
  },
  purple: {
    prompt: [
      "Why does the purple colour of KMnO₄ disappear at first in warm ethanol?",
      "गर्म एथेनॉल में KMnO₄ का बैंगनी रंग पहले क्यों ग़ायब होता है?",
    ],
    right: ["It is used up oxidising the ethanol", "यह एथेनॉल को ऑक्सीकृत करने में ख़र्च हो जाता है"],
    wrong: [
      [
        "Ethanol dissolves the colour",
        "एथेनॉल रंग घोल देता है",
        "The permanganate reacts: it gives its oxygen.",
        "परमैंगनेट अभिक्रिया करता है: अपनी ऑक्सीजन देता है।",
      ],
    ],
  },
  agent: {
    prompt: [
      "A substance that adds oxygen to others is called…",
      "जो पदार्थ दूसरों को ऑक्सीजन दे उसे कहते हैं…",
    ],
    right: ["An oxidising agent", "ऑक्सीकारक"],
    wrong: [
      [
        "A catalyst",
        "उत्प्रेरक",
        "A catalyst isn't used up; an oxidising agent gives its oxygen.",
        "उत्प्रेरक ख़र्च नहीं होता; ऑक्सीकारक अपनी ऑक्सीजन देता है।",
      ],
      ["A dehydrating agent", "निर्जलीकारक", "That removes water.", "वह जल हटाता है।"],
    ],
  },
  coal: {
    prompt: ["How was coal formed?", "कोयला कैसे बना?"],
    right: [
      "From plants buried millions of years ago and compressed",
      "लाखों वर्ष पहले दबे पौधों से, जो दबाव में रहे",
    ],
    wrong: [
      [
        "From tiny sea animals only, never from plants or trees",
        "केवल छोटे समुद्री जीवों से, पौधों या पेड़ों से कभी नहीं",
        "That's oil and gas.",
        "वह तेल और गैस है।",
      ],
      [
        "From volcanic lava that cooled underground",
        "ज़मीन के नीचे ठंडे हुए ज्वालामुखी लावा से",
        "It formed from buried plants.",
        "यह दबे पौधों से बना।",
      ],
    ],
  },
});
