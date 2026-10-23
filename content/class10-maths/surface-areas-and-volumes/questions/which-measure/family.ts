import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, wordItem } from "../../kit";

const curved = t("Curved surface area", "वक्र पृष्ठीय क्षेत्रफल");
const total = t("Total surface area", "कुल पृष्ठीय क्षेत्रफल");
const volume = t("Volume", "आयतन");

const notInside = t(
  "Volume is the space inside. This job covers the outside, so it's a surface.",
  "आयतन अंदर की जगह है। यह काम बाहर ढकता है, तो यह पृष्ठ है।",
);
const notSurface = t(
  "This asks how much fits inside, the space a solid takes up: that's volume.",
  "यह पूछता है कि अंदर कितना आता है, ठोस जितनी जगह लेता है: वह आयतन है।",
);
const noEnds = t(
  "The flat ends aren't covered here, so leave them out: only the curved part.",
  "यहाँ सपाट सिरे नहीं ढके जाते, तो उन्हें छोड़ो: केवल वक्र भाग।",
);
const withEnds = t(
  "Every face is covered, the flat ends too: that's the total surface area.",
  "हर फलक ढका जाता है, सपाट सिरे भी: वह कुल पृष्ठीय क्षेत्रफल है।",
);

/** Which measure a real job needs: curved surface, total surface or volume. */
const items = {
  label: wordItem(
    t(
      "A paper label is wrapped round a tin can, top and bottom left bare. Which measure gives the paper?",
      "एक टिन के डिब्बे पर काग़ज़ का लेबल लपेटा जाता है, ऊपर-नीचे खुले छोड़कर। काग़ज़ कौन-सा माप देता है?",
    ),
    curved,
    [
      [total, noEnds],
      [volume, notInside],
    ],
  ),
  tent: wordItem(
    t(
      "A conical tent has no floor. Which measure gives the canvas?",
      "एक शंक्वाकार तंबू में फ़र्श नहीं है। कैनवस कौन-सा माप देता है?",
    ),
    curved,
    [
      [total, noEnds],
      [volume, notInside],
    ],
  ),
  tank: wordItem(
    t(
      "How much water a cylindrical tank can hold is its",
      "एक बेलनाकार टंकी में कितना पानी आ सकता है, यह उसका है",
    ),
    volume,
    [
      [curved, notSurface],
      [total, notSurface],
    ],
  ),
  box: wordItem(
    t(
      "Tin sheet to make a closed box (all six faces) is the box's",
      "एक बंद डिब्बा (सभी छह फलक) बनाने की टिन की चादर डिब्बे का है",
    ),
    total,
    [
      [curved, withEnds],
      [volume, notInside],
    ],
  ),
  log: wordItem(
    t(
      "How much wood there is in a cylindrical log is its",
      "एक बेलनाकार लट्ठे में कितनी लकड़ी है, यह उसका है",
    ),
    volume,
    [
      [curved, notSurface],
      [total, notSurface],
    ],
  ),
  paintSolid: wordItem(
    t(
      "Paint for a solid wooden cylinder, ends and all, is its",
      "एक ठोस लकड़ी के बेलन के पेंट, सिरों समेत, उसका है",
    ),
    total,
    [
      [curved, withEnds],
      [volume, notInside],
    ],
  ),
} satisfies Record<string, Item>;

/** Which measure answers a real job. */
export const whichMeasure = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TheSolidsWeKnow],
});
