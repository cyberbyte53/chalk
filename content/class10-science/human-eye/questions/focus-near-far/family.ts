import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const relax = t("They relax: the lens gets thinner", "वे ढीली होती हैं: लेंस पतला होता है");
const contract = t("They contract: the lens gets thicker", "वे सिकुड़ती हैं: लेंस मोटा होता है");

const facts = {
  musclesNear: {
    prompt: t(
      "You look up from the window to read a book. What do your ciliary muscles do?",
      "तुम खिड़की से नज़र हटाकर किताब पढ़ते हो। तुम्हारी पक्ष्माभी पेशियाँ क्या करती हैं?",
    ),
    right: contract,
    wrong: [
      {
        label: relax,
        feedback: t(
          "Relaxing thins the lens, for far things. A near book needs more bending: a thicker lens.",
          "ढीला होना लेंस को पतला करता है, दूर की चीज़ों के लिए। पास की किताब को ज़्यादा मोड़ चाहिए: मोटा लेंस।",
        ),
      },
    ],
  },
  musclesFar: {
    prompt: t(
      "You look up from your book at a hill far away. What do your ciliary muscles do?",
      "तुम किताब से नज़र उठाकर दूर पहाड़ी को देखते हो। तुम्हारी पक्ष्माभी पेशियाँ क्या करती हैं?",
    ),
    right: relax,
    wrong: [
      {
        label: contract,
        feedback: t(
          "A thicker lens is for near things. For the far hill the muscles relax and the lens thins.",
          "मोटा लेंस पास की चीज़ों के लिए है। दूर पहाड़ी के लिए पेशियाँ ढीली होती हैं और लेंस पतला।",
        ),
      },
    ],
  },
  focalNear: {
    prompt: t(
      "When the eye looks at a near object, what happens to the focal length of the eye lens?",
      "जब आँख पास की वस्तु देखती है, नेत्र लेंस की फ़ोकस दूरी का क्या होता है?",
    ),
    right: t("It decreases, as the lens gets thicker", "घटती है, क्योंकि लेंस मोटा होता है"),
    wrong: [
      {
        label: t("It increases, as the lens gets thinner", "बढ़ती है, क्योंकि लेंस पतला होता है"),
        feedback: t(
          "A longer focal length means less bending: that's for far things. Near things need a shorter one.",
          "लंबी फ़ोकस दूरी का मतलब कम मोड़: यह दूर की चीज़ों के लिए है। पास की चीज़ों को छोटी चाहिए।",
        ),
      },
      {
        label: t("It stays the same, as the lens is rigid", "वही रहती है, क्योंकि लेंस कठोर है"),
        feedback: t(
          "If it couldn't change, the eye could focus at only one distance. Changing it is accommodation.",
          "अगर यह न बदल पाती, तो आँख केवल एक ही दूरी पर फ़ोकस कर पाती। इसे बदलना ही समंजन है।",
        ),
      },
    ],
  },
  focalFar: {
    prompt: t(
      "When the ciliary muscles relax, what happens to the eye lens's focal length?",
      "जब पक्ष्माभी पेशियाँ ढीली होती हैं, नेत्र लेंस की फ़ोकस दूरी का क्या होता है?",
    ),
    right: t("It increases, so far objects are in focus", "बढ़ती है, जिससे दूर की वस्तुएँ फ़ोकस में होती हैं"),
    wrong: [
      {
        label: t(
          "It decreases, so near objects are in focus",
          "घटती है, जिससे पास की वस्तुएँ फ़ोकस में होती हैं",
        ),
        feedback: t(
          "Relaxed muscles leave the lens thin, and a thin lens has a long focal length.",
          "ढीली पेशियाँ लेंस को पतला छोड़ती हैं, और पतले लेंस की फ़ोकस दूरी लंबी होती है।",
        ),
      },
    ],
  },
  imageDistance: {
    prompt: t(
      "An object moves away from the eye. What happens to the image distance inside the eye?",
      "कोई वस्तु आँख से दूर जाती है। आँख के अंदर प्रतिबिंब दूरी का क्या होता है?",
    ),
    right: t("It stays the same; the focal length changes", "वही रहती है; फ़ोकस दूरी बदलती है"),
    wrong: [
      {
        label: t(
          "It increases, as the retina moves further back",
          "बढ़ती है, क्योंकि दृष्टिपटल और पीछे जाता है",
        ),
        feedback: t(
          "The image must stay on the retina, a fixed distance behind the lens.",
          "प्रतिबिंब को दृष्टिपटल पर ही रहना है, जो लेंस के पीछे एक तय दूरी पर है।",
        ),
      },
      {
        label: t("It decreases, as the eyeball shrinks", "घटती है, क्योंकि नेत्र गोलक सिकुड़ता है"),
        feedback: t(
          "The retina doesn't move. The lens adjusts its focal length to keep the image there.",
          "दृष्टिपटल नहीं हिलता। प्रतिबिंब वहीं रखने के लिए लेंस अपनी फ़ोकस दूरी बदलता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** What the ciliary muscles and the lens do for near and far objects (NCERT 11.1.1, Exercise 9). */
export const focusNearFar = family({
  level: Level.Medium,
  tests: [Concept.PowerOfAccommodation],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});
