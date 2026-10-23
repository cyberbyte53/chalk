import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const q = (en: string, hi: string) => t(en, hi);
const quadrantWhy = t(
  "Read the signs: x + is right of the y-axis, y + is above the x-axis. Quadrants go I, II, III, IV anticlockwise from the top right.",
  "चिह्न पढ़ो: x धन मतलब y-अक्ष के दाएँ, y धन मतलब x-अक्ष के ऊपर। चतुर्थांश ऊपर दाएँ से वामावर्त I, II, III, IV हैं।",
);

const items = {
  second: {
    prompt: q("In which quadrant is (−2, 7)?", "(−2, 7) किस चतुर्थांश में है?"),
    right: t("Quadrant II", "चतुर्थांश II"),
    wrong: [
      { label: t("Quadrant I", "चतुर्थांश I"), why: quadrantWhy },
      { label: t("Quadrant IV", "चतुर्थांश IV"), why: quadrantWhy },
    ],
  },
  fourth: {
    prompt: q("In which quadrant is (6, −1)?", "(6, −1) किस चतुर्थांश में है?"),
    right: t("Quadrant IV", "चतुर्थांश IV"),
    wrong: [
      { label: t("Quadrant II", "चतुर्थांश II"), why: quadrantWhy },
      { label: t("Quadrant III", "चतुर्थांश III"), why: quadrantWhy },
    ],
  },
  onY: {
    prompt: q("The point (0, −7) lies…", "बिंदु (0, −7) स्थित है…"),
    right: t("on the y-axis", "y-अक्ष पर"),
    wrong: [
      {
        label: t("on the x-axis", "x-अक्ष पर"),
        why: t(
          "Its x-coordinate is 0, so it is 0 from the y-axis: it sits on the y-axis.",
          "इसका x-निर्देशांक 0 है, तो यह y-अक्ष से 0 दूर है: यह y-अक्ष पर है।",
        ),
      },
      {
        label: t("in quadrant III", "चतुर्थांश III में"),
        why: t(
          "A point in a quadrant has neither coordinate 0. Here x = 0.",
          "किसी चतुर्थांश के बिंदु का कोई भी निर्देशांक 0 नहीं होता। यहाँ x = 0 है।",
        ),
      },
    ],
  },
  abscissa: {
    prompt: q("For the point (−5, 3), what is the abscissa?", "बिंदु (−5, 3) का भुज क्या है?"),
    right: t("−5", "−5"),
    wrong: [
      {
        label: t("3", "3"),
        why: t(
          "3 is the ordinate (y). The abscissa is the x-coordinate, written first.",
          "3 कोटि (y) है। भुज x-निर्देशांक है, जो पहले लिखा जाता है।",
        ),
      },
      {
        label: t("5", "5"),
        why: t(
          "Keep the sign: the point is 5 to the left, so x = −5.",
          "चिह्न रखो: बिंदु 5 बाएँ है, तो x = −5।",
        ),
      },
    ],
  },
  formX: {
    prompt: q("Every point on the x-axis has the form…", "x-अक्ष पर हर बिंदु का रूप है…"),
    right: t("(x, 0)", "(x, 0)"),
    wrong: [
      {
        label: t("(0, y)", "(0, y)"),
        why: t(
          "(0, y) is on the y-axis. On the x-axis the distance from the x-axis, y, is 0.",
          "(0, y), y-अक्ष पर है। x-अक्ष पर, x-अक्ष से दूरी y = 0 है।",
        ),
      },
      {
        label: t("(x, x)", "(x, x)"),
        why: t(
          "(x, x) has equal coordinates, like (2, 2): those points aren't on an axis.",
          "(x, x) के निर्देशांक बराबर हैं, जैसे (2, 2): ये अक्ष पर नहीं हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Reading coordinates: quadrants, points on the axes, abscissa and ordinate (NCERT 7.1 recap). */
export const quadrantsAndAxes = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.PointsOnThePlane],
});
