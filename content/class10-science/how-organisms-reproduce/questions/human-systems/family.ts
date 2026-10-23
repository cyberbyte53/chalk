import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["testis", "notFemale", "glands", "scrotum", "ovary", "urethra"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  testis: {
    prompt: {
      en: "What are the functions of the testes in human beings?",
      hi: "मनुष्य में वृषण के क्या कार्य हैं?",
    },
    right: {
      en: "Forming sperms and making testosterone",
      hi: "शुक्राणु बनाना और टेस्टोस्टेरोन बनाना",
    },
    wrong: [
      { en: "Storing urine and filtering blood", hi: "मूत्र संग्रह करना और रक्त छानना" },
      {
        en: "Producing eggs and storing them until puberty",
        hi: "अंडाणु बनाना और यौवनारंभ तक उन्हें संग्रह करना",
      },
    ],
    why: {
      en: "Sperms form in the testes, which also secrete testosterone, regulating sperm formation and the changes in boys at puberty.",
      hi: "शुक्राणु वृषणों में बनते हैं, जो टेस्टोस्टेरॉन भी स्रावित करते हैं; यह शुक्राणु बनने और यौवनारंभ में लड़कों के बदलावों का नियमन करता है।",
    },
  },
  notFemale: {
    prompt: {
      en: "Which of the following is not a part of the female reproductive system?",
      hi: "इनमें से कौन मादा जनन तंत्र का भाग नहीं है?",
    },
    right: { en: "Vas deferens", hi: "शुक्रवाहिका" },
    wrong: [
      { en: "Ovary", hi: "अंडाशय" },
      { en: "Uterus", hi: "गर्भाशय" },
      { en: "Fallopian tube", hi: "फ़ैलोपियन नलिका" },
    ],
    why: {
      en: "The vas deferens carries sperms in the male system.",
      hi: "शुक्रवाहिका नर तंत्र में शुक्राणु ले जाती है।",
    },
  },
  glands: {
    prompt: {
      en: "What do the seminal vesicles and prostate gland do?",
      hi: "शुक्राशय और प्रोस्टेट ग्रंथि क्या करते हैं?",
    },
    right: {
      en: "Add a fluid that eases sperm transport and nourishes them",
      hi: "एक तरल मिलाते हैं जो शुक्राणुओं का परिवहन आसान करता है और उन्हें पोषण देता है",
    },
    wrong: [
      {
        en: "Make sperms and pass them into the vas deferens",
        hi: "शुक्राणु बनाकर उन्हें शुक्रवाहिका में भेजते हैं",
      },
      {
        en: "Store sperms safely until the body is ready to release them",
        hi: "शरीर के तैयार होने तक शुक्राणुओं को सुरक्षित संग्रह करते हैं",
      },
    ],
    why: {
      en: "Along the vas deferens, these glands add secretions; the fluid makes transport easier and provides nutrition.",
      hi: "शुक्रवाहिका के रास्ते में ये ग्रंथियाँ स्राव मिलाती हैं; तरल परिवहन आसान करता है और पोषण देता है।",
    },
  },
  scrotum: {
    prompt: {
      en: "Why are the testes in the scrotum, outside the abdominal cavity?",
      hi: "वृषण उदर गुहा के बाहर, वृषणकोष में क्यों होते हैं?",
    },
    right: {
      en: "Sperms form only below body temperature",
      hi: "शुक्राणु शरीर ताप से कम ताप पर ही बनते हैं",
    },
    wrong: [
      {
        en: "To keep them safe from germs inside the abdomen",
        hi: "उदर के भीतर के रोगाणुओं से सुरक्षित रखने के लिए",
      },
      { en: "To give them more room to grow", hi: "बढ़ने के लिए अधिक जगह देने के लिए" },
    ],
    why: {
      en: "Sperm formation requires a lower temperature than the normal body temperature.",
      hi: "शुक्राणु बनने के लिए सामान्य शरीर ताप से कम ताप चाहिए।",
    },
  },
  ovary: {
    prompt: {
      en: "Where are the female germ cells (eggs) made?",
      hi: "मादा जनन कोशिकाएँ (अंड) कहाँ बनती हैं?",
    },
    right: { en: "In the ovaries", hi: "अंडाशयों में" },
    wrong: [
      { en: "In the uterus, on its lining", hi: "गर्भाशय में, उसके अस्तर पर" },
      { en: "In the cervix", hi: "गर्भाशय ग्रीवा में" },
    ],
    why: {
      en: "Eggs are made in the ovaries, which also produce some hormones; from puberty one egg is produced each month.",
      hi: "अंड अंडाशयों में बनते हैं, जो कुछ हॉर्मोन भी बनाते हैं; यौवनारंभ से हर महीने एक अंड बनता है।",
    },
  },
  urethra: {
    prompt: {
      en: "Which tube is a common passage for both sperms and urine?",
      hi: "कौन-सी नली शुक्राणुओं और मूत्र दोनों का साझा रास्ता है?",
    },
    right: { en: "Urethra", hi: "मूत्रमार्ग" },
    wrong: [
      { en: "Oviduct", hi: "अंडवाहिनी" },
      { en: "Vas deferens alone", hi: "केवल शुक्रवाहिका" },
    ],
    why: {
      en: "The vas deferens unites with a tube from the urinary bladder; the urethra is the common passage.",
      hi: "शुक्रवाहिका मूत्राशय से आने वाली नली से मिलती है; मूत्रमार्ग साझा रास्ता है।",
    },
  },
};

/** NCERT 8.3.3(a), (b) and Exercises 2 and 5: organs of the human male and female reproductive systems and their functions. */
export const humanSystems = family({
  level: Level.Easy,
  tests: [Concept.HumanReproduction],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});
