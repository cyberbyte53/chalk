import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["copperT", "bacterial", "pill", "barrier", "surgical", "law", "reason"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  copperT: {
    prompt: {
      en: "If a woman is using a copper-T, will it protect her from sexually transmitted diseases?",
      hi: "अगर कोई महिला कॉपर-T का उपयोग कर रही है, तो क्या यह उसे यौन संचारित रोगों से बचाएगा?",
    },
    right: { en: "No", hi: "नहीं" },
    wrong: [{ en: "Yes, completely", hi: "हाँ, पूरी तरह" }],
    why: {
      en: "A copper-T is a device in the uterus that prevents pregnancy; it does not stop infections passing between bodies.",
      hi: "कॉपर-T गर्भाशय में रखी युक्ति है जो गर्भधारण रोकती है; यह शरीरों के बीच संक्रमण फैलना नहीं रोकती।",
    },
  },
  bacterial: {
    prompt: {
      en: "Which pair are bacterial sexually transmitted infections?",
      hi: "कौन-सा जोड़ा जीवाणुजनित यौन संचारित संक्रमण है?",
    },
    right: { en: "Gonorrhoea and syphilis", hi: "गोनोरिया और सिफ़लिस" },
    wrong: [
      { en: "Warts and HIV-AIDS", hi: "मस्से और HIV-AIDS" },
      { en: "Malaria and kala-azar infections", hi: "मलेरिया और काला-अज़ार संक्रमण" },
    ],
    why: {
      en: "The textbook names gonorrhoea and syphilis as bacterial, warts and HIV-AIDS as viral.",
      hi: "पाठ्यपुस्तक गोनोरिया और सिफ़लिस को जीवाणुजनित, मस्से और HIV-AIDS को वायरसजनित बताती है।",
    },
  },
  pill: {
    prompt: {
      en: "Oral contraceptive pills belong to which category?",
      hi: "मुखीय गर्भनिरोधक गोलियाँ किस श्रेणी में आती हैं?",
    },
    right: {
      en: "Hormonal: they stop eggs being released",
      hi: "हॉर्मोनी: ये अंडाणु निकलना रोकती हैं",
    },
    wrong: [
      { en: "Mechanical: they block the sperm's path", hi: "यांत्रिक: ये शुक्राणु का रास्ता रोकती हैं" },
      { en: "Surgical: they block the vas deferens", hi: "शल्य: ये शुक्रवाहिका को बंद करती हैं" },
    ],
    why: {
      en: "Pills change the hormonal balance of the body so that eggs are not released; they can cause side effects.",
      hi: "गोलियाँ शरीर का हॉर्मोन संतुलन बदलती हैं ताकि अंड न निकले; इनके दुष्प्रभाव हो सकते हैं।",
    },
  },
  barrier: {
    prompt: {
      en: "Which contraceptive method also helps to some extent against many sexually transmitted infections?",
      hi: "कौन-सी गर्भनिरोधक विधि कई यौन संचारित संक्रमणों से भी कुछ हद तक बचाती है?",
    },
    right: { en: "Condom", hi: "कंडोम" },
    wrong: [
      { en: "Oral pills", hi: "मुखीय गोलियाँ" },
      { en: "Copper-T", hi: "कॉपर-T" },
      { en: "Surgical blocking", hi: "शल्य अवरोधन" },
    ],
    why: {
      en: "A condom is a mechanical barrier; the textbook says it helps prevent transmission of many infections to some extent.",
      hi: "कंडोम एक यांत्रिक अवरोध है; पाठ्यपुस्तक कहती है यह कई संक्रमणों का फैलाव कुछ हद तक रोकता है।",
    },
  },
  surgical: {
    prompt: {
      en: "In the surgical method, what is blocked in the male so that sperm transfer is prevented?",
      hi: "शल्य विधि में पुरुष में क्या अवरुद्ध किया जाता है ताकि शुक्राणु न पहुँचें?",
    },
    right: { en: "The vas deferens", hi: "शुक्रवाहिका" },
    wrong: [
      { en: "The urethra", hi: "मूत्रमार्ग" },
      { en: "The prostate gland", hi: "प्रोस्टेट ग्रंथि" },
    ],
    why: {
      en: "Blocking the vas deferens prevents sperm transfer; blocking the fallopian tube in the female stops the egg reaching the uterus.",
      hi: "शुक्रवाहिका अवरुद्ध करने से शुक्राणु नहीं पहुँचते; महिला में फ़ैलोपियन नलिका अवरुद्ध करने से अंड गर्भाशय तक नहीं पहुँचता।",
    },
  },
  law: {
    prompt: {
      en: "What does the law say about prenatal sex determination?",
      hi: "प्रसवपूर्व लिंग निर्धारण के बारे में क़ानून क्या कहता है?",
    },
    right: { en: "It is prohibited", hi: "यह प्रतिबंधित है" },
    wrong: [
      { en: "It is allowed if parents ask", hi: "माता-पिता माँगें तो अनुमति है" },
      { en: "The law says nothing about it", hi: "क़ानून इस पर कुछ नहीं कहता" },
    ],
    why: {
      en: "Prenatal sex determination is prohibited by law, because of illegal sex-selective abortion of female foetuses.",
      hi: "मादा भ्रूणों के अवैध लिंग-चयनात्मक गर्भपात के कारण प्रसवपूर्व लिंग निर्धारण क़ानून द्वारा प्रतिबंधित है।",
    },
  },
  reason: {
    prompt: {
      en: "Which is a reason given in the textbook for adopting contraceptive methods?",
      hi: "पाठ्यपुस्तक में गर्भनिरोधक विधियाँ अपनाने का कौन-सा कारण दिया गया है?",
    },
    right: {
      en: "Pregnancy makes major demands on a woman's body and mind",
      hi: "गर्भावस्था स्त्री के शरीर और मन पर बहुत भार डालती है",
    },
    wrong: [
      {
        en: "Contraception helps the body grow taller and stronger",
        hi: "गर्भनिरोध शरीर को लंबा और मज़बूत होने में मदद करता है",
      },
      {
        en: "Contraception is needed for germ cells to be made",
        hi: "जनन कोशिकाएँ बनने के लिए गर्भनिरोध ज़रूरी है",
      },
    ],
    why: {
      en: "The textbook links contraception to the woman's health and readiness; condoms also reduce the spread of some infections.",
      hi: "पाठ्यपुस्तक गर्भनिरोधन को महिला के स्वास्थ्य और तैयारी से जोड़ती है; कंडोम कुछ संक्रमणों का फैलाव भी कम करता है।",
    },
  },
};

/** NCERT 8.3.3(d), in-text question 5 and Exercises 8 and 11: STDs, contraceptive methods and their categories, and prenatal sex determination. */
export const reproductiveHealth = family({
  level: Level.Medium,
  tests: [Concept.ReproductiveHealth],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
