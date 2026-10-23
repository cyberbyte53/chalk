import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const facts = {
  skyBlue: {
    prompt: t("Why is the clear sky blue?", "साफ़ आसमान नीला क्यों है?"),
    right: t(
      "Air scatters blue far more than red, and that blue reaches our eyes",
      "हवा नीले को लाल से कहीं ज़्यादा बिखेरती है, और वह नीला हमारी आँखों तक आता है",
    ),
    wrong: [
      {
        label: t(
          "The sky is a mirror reflecting the blue of the sea",
          "आसमान एक दर्पण है जो समुद्र का नीला रंग परावर्तित करता है",
        ),
        feedback: t(
          "The sky is blue over deserts too. It's the air scattering sunlight.",
          "रेगिस्तानों के ऊपर भी आसमान नीला है। यह हवा का धूप बिखेरना है।",
        ),
      },
      {
        label: t(
          "The air refracts blue light downwards, so it bends towards our eyes",
          "हवा नीले प्रकाश को नीचे अपवर्तित करती है, इसलिए वह हमारी आँखों की ओर मुड़ता है",
        ),
        feedback: t(
          "Not bending: scattering. Tiny molecules send blue light off in all directions.",
          "मुड़ना नहीं: प्रकीर्णन। नन्हे अणु नीले प्रकाश को हर दिशा में भेजते हैं।",
        ),
      },
    ],
  },
  astronaut: {
    prompt: t(
      "Why does the sky look dark instead of blue to an astronaut?",
      "अंतरिक्ष यात्री को आसमान नीले के बजाय काला क्यों दिखता है?",
    ),
    right: t("There is no air up there to scatter sunlight", "वहाँ धूप बिखेरने के लिए हवा नहीं है"),
    wrong: [
      {
        label: t("The Sun is behind the Earth", "सूरज पृथ्वी के पीछे है"),
        feedback: t(
          "The Sun shines on astronauts. With no air, nothing scatters its light.",
          "सूरज अंतरिक्ष यात्रियों पर चमकता है। हवा न होने पर कुछ भी उसके प्रकाश को नहीं बिखेरता।",
        ),
      },
    ],
  },
  sunrise: {
    prompt: t(
      "Why does the Sun look reddish early in the morning?",
      "सुबह-सुबह सूरज लालिमा लिए क्यों दिखता है?",
    ),
    right: t(
      "Its light crosses more air, so most blue is scattered away",
      "उसका प्रकाश ज़्यादा हवा पार करता है, इसलिए ज़्यादातर नीला बिखर जाता है",
    ),
    wrong: [
      {
        label: t(
          "The morning Sun is cooler, so it gives out mostly red light",
          "सुबह का सूरज ठंडा होता है, इसलिए ज़्यादातर लाल प्रकाश देता है",
        ),
        feedback: t(
          "The Sun is the same all day. Its light's path through the air is what changes.",
          "सूरज दिन भर वैसा ही है। हवा से होकर उसके प्रकाश का रास्ता बदलता है।",
        ),
      },
      {
        label: t(
          "The air bends red light towards us more than blue",
          "हवा लाल प्रकाश को नीले से ज़्यादा हमारी ओर मोड़ती है",
        ),
        feedback: t(
          "It's the blue being taken out by scattering, leaving the red.",
          "प्रकीर्णन से नीला हट जाता है, लाल बच जाता है।",
        ),
      },
    ],
  },
  noon: {
    prompt: t("Why does the Sun look white at noon?", "दोपहर में सूरज सफ़ेद क्यों दिखता है?"),
    right: t(
      "Its light crosses only a short path of air, so little blue is scattered",
      "उसका प्रकाश हवा का छोटा रास्ता ही पार करता है, इसलिए थोड़ा ही नीला बिखरता है",
    ),
    wrong: [
      {
        label: t("It is hotter at noon", "दोपहर में वह ज़्यादा गर्म होता है"),
        feedback: t(
          "The Sun doesn't change through the day. Overhead, its light crosses the least air.",
          "सूरज दिन भर नहीं बदलता। सिर के ऊपर होने पर उसका प्रकाश सबसे कम हवा पार करता है।",
        ),
      },
    ],
  },
  danger: {
    prompt: t("Why are danger signal lights red?", "ख़तरे के संकेत की बत्तियाँ लाल क्यों होती हैं?"),
    right: t(
      "Red is scattered least by fog and smoke, so it is seen far away",
      "कोहरा और धुआँ लाल को सबसे कम बिखेरते हैं, इसलिए वह दूर से दिखता है",
    ),
    wrong: [
      {
        label: t("Red is scattered most, so it glows", "लाल सबसे ज़्यादा बिखरता है, इसलिए चमकता है"),
        feedback: t(
          "It's the other way round: blue scatters most, red least.",
          "उल्टा है: नीला सबसे ज़्यादा बिखरता है, लाल सबसे कम।",
        ),
      },
    ],
  },
  wavelength: {
    prompt: t(
      "Red light's wavelength is about how many times blue light's?",
      "लाल प्रकाश की तरंगदैर्घ्य नीले की लगभग कितनी गुना है?",
    ),
    right: t("About 1.8 times", "लगभग 1.8 गुना"),
    wrong: [
      {
        label: t("About half", "लगभग आधी"),
        feedback: t(
          "Red has the **longer** wavelength: about 1.8 times blue's.",
          "लाल की तरंगदैर्घ्य **लंबी** है: नीले की लगभग 1.8 गुना।",
        ),
      },
      {
        label: t("About 10 times", "लगभग 10 गुना"),
        feedback: t("Much less: about 1.8 times.", "कहीं कम: लगभग 1.8 गुना।"),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** The blue sky, the dark sky in space, red danger lights, and the red or white Sun (NCERT 11.6.2–11.6.3; Exercises 12, 13). */
export const scatteringColours = family({
  level: Level.Medium,
  tests: [Concept.ScatteringOfLight],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});
