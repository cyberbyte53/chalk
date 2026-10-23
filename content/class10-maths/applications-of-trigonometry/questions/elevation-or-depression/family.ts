import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const elev = t("Angle of elevation", "उन्नयन कोण");
const dep = t("Angle of depression", "अवनमन कोण");
const neither = t("Neither of the two", "दोनों में से कोई नहीं");

/** Elevation or depression? Read the situation (NCERT 9.2, Fig 8.3). */
const items = {
  balcony: {
    prompt: t(
      "A girl on a balcony looks down at a flower pot on a temple step. Her line of sight makes which angle with the horizontal?",
      "बालकनी पर एक लड़की मंदिर की सीढ़ी पर रखे गमले को नीचे देखती है। उसकी दृष्टि रेखा क्षैतिज से कौन-सा कोण बनाती है?",
    ),
    right: dep,
    wrong: [
      {
        label: elev,
        why: t(
          "The pot is below her eye, so she lowers her head: depression.",
          "गमला उसकी आँख से नीचे है, तो वह सिर झुकाती है: अवनमन।",
        ),
      },
      {
        label: neither,
        why: t(
          "Any line of sight to a point below the horizontal makes an angle of depression.",
          "क्षैतिज से नीचे के किसी बिंदु तक हर दृष्टि रेखा अवनमन कोण बनाती है।",
        ),
      },
    ],
  },
  minar: {
    prompt: t(
      "A student on the ground looks at the top of a minar. Her line of sight makes which angle with the horizontal?",
      "ज़मीन पर खड़ी एक छात्रा मीनार के शीर्ष को देखती है। उसकी दृष्टि रेखा क्षैतिज से कौन-सा कोण बनाती है?",
    ),
    right: elev,
    wrong: [
      {
        label: dep,
        why: t(
          "The top is above her eye: she raises her head. That is elevation.",
          "शीर्ष उसकी आँख से ऊपर है: वह सिर उठाती है। यह उन्नयन है।",
        ),
      },
      {
        label: neither,
        why: t(
          "Looking up at a point above the horizontal always gives an angle of elevation.",
          "क्षैतिज से ऊपर के बिंदु को देखने पर हमेशा उन्नयन कोण बनता है।",
        ),
      },
    ],
  },
  measured: {
    prompt: t(
      "From which line are both the angle of elevation and the angle of depression measured?",
      "उन्नयन कोण और अवनमन कोण दोनों किस रेखा से नापे जाते हैं?",
    ),
    right: t("The horizontal through the eye", "आँख से होकर जाती क्षैतिज रेखा"),
    wrong: [
      {
        label: t("The vertical wall or tower", "ऊर्ध्वाधर दीवार या मीनार"),
        why: t(
          "The angle with the wall is 90° minus the right one. Both are measured from the horizontal.",
          "दीवार से कोण, सही कोण का 90° से अंतर है। दोनों क्षैतिज से नापे जाते हैं।",
        ),
      },
      {
        label: t("The line of sight to the top", "शीर्ष तक जाती दृष्टि रेखा"),
        why: t(
          "The line of sight is one arm of the angle; the other arm is the horizontal.",
          "दृष्टि रेखा कोण की एक भुजा है; दूसरी भुजा क्षैतिज है।",
        ),
      },
    ],
  },
  same: {
    prompt: t(
      "From the top P of a cliff, a boat B has a depression of 40°. What is the elevation of P from B?",
      "चट्टान के शीर्ष P से एक नाव B का अवनमन कोण 40° है। B से P का उन्नयन कोण कितना है?",
    ),
    right: t("40°, alternate angles", "40°, एकांतर कोण"),
    wrong: [
      {
        label: t("50°, complementary", "50°, पूरक कोण"),
        why: t(
          "50° is the angle between the line of sight and the cliff. The two horizontals are parallel, so it's 40°.",
          "50° दृष्टि रेखा और चट्टान के बीच का कोण है। दोनों क्षैतिज समांतर हैं, इसलिए 40°।",
        ),
      },
      {
        label: t("140°, supplementary", "140°, संपूरक कोण"),
        why: t(
          "Alternate angles between parallel lines are equal, not supplementary.",
          "समांतर रेखाओं के बीच एकांतर कोण बराबर होते हैं, संपूरक नहीं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Tell an angle of elevation from an angle of depression; they are equal as alternate angles. */
export const elevationOrDepression = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.AngleOfDepression],
});
