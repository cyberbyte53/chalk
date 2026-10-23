import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, wordItem } from "../../kit";

const surfaces = t("Add the surfaces that show", "दिखने वाले पृष्ठ जोड़ो");
const volumes = t("Add the parts' volumes", "भागों के आयतन जोड़ो");
const same = t("Volume before = volume after", "पहले का आयतन = बाद का आयतन");
const frustum = t("Use the frustum formula", "छिन्नक का सूत्र लगाओ");

const notCover = t(
  "This is about the outside, what gets covered: a surface, not a volume.",
  "यह बाहर के बारे में है, जो ढका जाता है: पृष्ठ, आयतन नहीं।",
);
const notChange = t(
  "Nothing changes shape here: just find the space inside the joined solid.",
  "यहाँ कुछ आकार नहीं बदलता: बस जुड़े ठोस के अंदर की जगह निकालो।",
);
const changes = t(
  "The material changes shape, so its volume stays the same: set the two equal.",
  "सामग्री का आकार बदलता है, तो उसका आयतन वही रहता है: दोनों को बराबर रखो।",
);
const notFrustum = t("There's no cone with its top cut off here.", "यहाँ कोई ऊपर से कटा शंकु नहीं है।");
const isFrustum = t(
  "A shape wider at one flat end than the other is a frustum: it has its own formula.",
  "एक सपाट सिरे पर दूसरे से चौड़ा आकार छिन्नक है: उसका अपना सूत्र है।",
);
const inside = t(
  "This asks what fits inside: a volume, not a surface.",
  "यह पूछता है कि अंदर क्या आता है: आयतन, पृष्ठ नहीं।",
);

/** Which of the chapter's four ideas a problem needs. */
const items = {
  paint: wordItem(
    t(
      "Paint for a lattu (a cone on a hemisphere). Which idea?",
      "एक लट्टू (अर्धगोले पर शंकु) का पेंट। कौन-सा विचार?",
    ),
    surfaces,
    [
      [volumes, notCover],
      [same, notCover],
    ],
  ),
  syrup: wordItem(
    t(
      "How much a gulab jamun (a cylinder with rounded ends) holds. Which idea?",
      "एक गुलाब जामुन (गोल सिरों वाला बेलन) में कितना आता है। कौन-सा विचार?",
    ),
    volumes,
    [
      [surfaces, inside],
      [frustum, notFrustum],
    ],
  ),
  kulfi: wordItem(
    t(
      "How many cones one can of kulfi fills. Which idea?",
      "एक डिब्बे की कुल्फ़ी से कितने कोन भरेंगे। कौन-सा विचार?",
    ),
    same,
    [
      [volumes, changes],
      [surfaces, inside],
    ],
  ),
  bucket: wordItem(
    t(
      "How much water a bucket wider at the top holds. Which idea?",
      "ऊपर से चौड़ी बाल्टी में कितना पानी आता है। कौन-सा विचार?",
    ),
    frustum,
    [
      [volumes, isFrustum],
      [same, isFrustum],
    ],
  ),
  rod: wordItem(
    t(
      "How long a wire a copper rod can be drawn into. Which idea?",
      "तांबे की छड़ से कितना लंबा तार खींचा जा सकता है। कौन-सा विचार?",
    ),
    same,
    [
      [surfaces, changes],
      [frustum, notFrustum],
    ],
  ),
  shed: wordItem(
    t(
      "How much air a shed (a cuboid with a half cylinder on top) holds. Which idea?",
      "एक शेड (ऊपर आधे बेलन वाला घनाभ) में कितनी हवा है। कौन-सा विचार?",
    ),
    volumes,
    [
      [same, notChange],
      [surfaces, inside],
    ],
  ),
} satisfies Record<string, Item>;

/** Which idea a problem needs: joined surfaces, joined volumes, conversion or the frustum. */
export const whichStop = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.ChallengeAndFinale],
});
