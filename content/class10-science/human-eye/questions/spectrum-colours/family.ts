import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const c = {
  violet: t("Violet", "बैंगनी"),
  indigo: t("Indigo", "जामुनी"),
  blue: t("Blue", "नीला"),
  green: t("Green", "हरा"),
  yellow: t("Yellow", "पीला"),
  orange: t("Orange", "नारंगी"),
  red: t("Red", "लाल"),
};
const order = t(
  "The order is V I B G Y O R: violet, indigo, blue, green, yellow, orange, red.",
  "क्रम है V I B G Y O R: बैंगनी, जामुनी, नीला, हरा, पीला, नारंगी, लाल।",
);

const facts = {
  most: {
    prompt: t(
      "Which colour of white light is bent the most by a prism?",
      "प्रिज़्म सफ़ेद प्रकाश के किस रंग को सबसे ज़्यादा मोड़ता है?",
    ),
    right: c.violet,
    wrong: [
      { label: c.red, feedback: t("Red is bent the least.", "लाल सबसे कम मुड़ता है।") },
      { label: c.green, feedback: t("Green is in the middle.", "हरा बीच में है।") },
    ],
  },
  least: {
    prompt: t(
      "Which colour of white light is bent the least by a prism?",
      "प्रिज़्म सफ़ेद प्रकाश के किस रंग को सबसे कम मोड़ता है?",
    ),
    right: c.red,
    wrong: [
      { label: c.violet, feedback: t("Violet is bent the most.", "बैंगनी सबसे ज़्यादा मुड़ता है।") },
      { label: c.yellow, feedback: order },
    ],
  },
  betweenGreenOrange: {
    prompt: t(
      "Which colour of the spectrum lies between green and orange?",
      "स्पेक्ट्रम में हरे और नारंगी के बीच कौन-सा रंग है?",
    ),
    right: c.yellow,
    wrong: [
      { label: c.blue, feedback: order },
      { label: c.red, feedback: order },
    ],
  },
  betweenVioletBlue: {
    prompt: t(
      "Which colour of the spectrum lies between violet and blue?",
      "स्पेक्ट्रम में बैंगनी और नीले के बीच कौन-सा रंग है?",
    ),
    right: c.indigo,
    wrong: [
      { label: c.green, feedback: order },
      { label: c.orange, feedback: order },
    ],
  },
  dispersion: {
    prompt: t(
      "The splitting of white light into its colours is called…",
      "सफ़ेद प्रकाश का अपने रंगों में बँटना कहलाता है…",
    ),
    right: t("dispersion", "विक्षेपण"),
    wrong: [
      {
        label: t("scattering", "प्रकीर्णन"),
        feedback: t(
          "Scattering is light sent off in all directions by tiny particles.",
          "प्रकीर्णन नन्हे कणों द्वारा प्रकाश का हर दिशा में भेजा जाना है।",
        ),
      },
      {
        label: t("deviation", "विचलन"),
        feedback: t(
          "Deviation is the turning of a ray by a prism, not its splitting.",
          "विचलन प्रिज़्म द्वारा किरण का मुड़ना है, उसका बँटना नहीं।",
        ),
      },
    ],
  },
  why: {
    prompt: t(
      "Why does a prism split white light into colours?",
      "प्रिज़्म सफ़ेद प्रकाश को रंगों में क्यों बाँटता है?",
    ),
    right: t("Each colour bends through a different angle", "हर रंग अलग कोण से मुड़ता है"),
    wrong: [
      {
        label: t("The glass paints colours on the light", "काँच प्रकाश पर रंग चढ़ा देता है"),
        feedback: t(
          "Newton's second prism turns the colours back into white: they were in the light already.",
          "न्यूटन का दूसरा प्रिज़्म रंगों को फिर सफ़ेद बना देता है: वे पहले से प्रकाश में थे।",
        ),
      },
      {
        label: t("Some colours are absorbed by the glass", "कुछ रंग काँच सोख लेता है"),
        feedback: t(
          "All seven colours come out. They are just separated, by bending differently.",
          "सातों रंग बाहर आते हैं। वे बस अलग-अलग मुड़कर अलग हो जाते हैं।",
        ),
      },
    ],
  },
  newton: {
    prompt: t(
      "Newton placed a second, identical prism upside down after the first. What came out?",
      "न्यूटन ने पहले के बाद एक दूसरा, वैसा ही प्रिज़्म उल्टा रखा। क्या निकला?",
    ),
    right: t("White light", "सफ़ेद प्रकाश"),
    wrong: [
      {
        label: t("A wider spectrum", "ज़्यादा चौड़ा स्पेक्ट्रम"),
        feedback: t(
          "Upside down, the second prism bends the colours back together.",
          "उल्टा रखा दूसरा प्रिज़्म रंगों को वापस मिला देता है।",
        ),
      },
      {
        label: t("Only red light", "केवल लाल प्रकाश"),
        feedback: t("All seven colours recombine: white light.", "सातों रंग फिर मिलते हैं: सफ़ेद प्रकाश।"),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** VIBGYOR, dispersion and Newton's two prisms (NCERT 11.4). */
export const spectrumColours = family({
  level: Level.Easy,
  tests: [Concept.DispersionAndRainbow],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});
