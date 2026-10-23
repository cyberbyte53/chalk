import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  HumanAction,
  HumanMode,
  ReproductionScene,
  humanSystemsDef,
  reproductionSceneDef,
} from "@chalk/prop-reproduction";

/** A human-systems diagram in one mode; the learner can tap organs and step. */
function systemIn(b: Parameters<Parameters<typeof page>[1]>[0], name: string, mode: HumanMode) {
  const d = b.prop(humanSystemsDef, name, {
    mode,
    selected: null,
    step: 0,
    showNames: true,
    canTap: true,
    canStep: true,
  });
  b.studentOnly(d.action(HumanAction.Tap));
  b.studentOnly(d.action(HumanAction.Next));
  b.studentOnly(d.action(HumanAction.Reset));
  return d;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** A neutral frame: the Class 10 health class. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const room = b.prop(reproductionSceneDef, "room", { scene: ReproductionScene.HealthClass });
  b.standsFor(room, "a classroom: a teacher at the blackboard, students seen from behind");
  return column([
    w.title(t("Reproduction in human beings", "मानव में जनन")),
    room,
    w.body(
      t(
        "So far: single cells divide, plants grow from their parts, and flowers make seeds by joining two germ cells. Human beings also reproduce sexually. This lesson and the next are taught the way a school health class would teach them: plainly, with labelled diagrams, using the textbook's own words.",
        "अब तक: एककोशिकीय जीव बँटते हैं, पौधे अपने भागों से उगते हैं, और फूल दो जनन कोशिकाओं को मिलाकर बीज बनाते हैं। मनुष्य भी लैंगिक जनन करते हैं। यह पाठ और अगला वैसे ही पढ़ाए गए हैं जैसे स्कूल की स्वास्थ्य कक्षा में पढ़ाए जाते: सीधे-सादे ढंग से, नामांकित चित्रों के साथ, पाठ्यपुस्तक के अपने शब्दों में।",
      ),
    ),
    w.body(
      t(
        "The question for this lesson: how does the body prepare for reproduction, and how does a new human life begin and grow?",
        "इस पाठ का प्रश्न: शरीर जनन के लिए कैसे तैयार होता है, और एक नया मानव जीवन कैसे शुरू होकर बढ़ता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Growth vs sexual maturation; changes at puberty. */
const puberty = page(
  "puberty",
  (b) => {
    const w = wordsOn(b);
    const common = choiceQuestion(b, {
      name: "common",
      prompt: t(
        "Which of these changes at puberty is common to both boys and girls?",
        "यौवनारंभ के इन बदलावों में से कौन-सा लड़कों और लड़कियों दोनों में होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Thick hair in the armpits; oily skin and pimples",
            "काँख में घने बाल; तैलीय त्वचा और मुँहासे",
          ),
        },
        {
          id: "voice",
          label: t(
            "The voice begins to crack and becomes much deeper",
            "आवाज़ फटने लगती है और बहुत भारी हो जाती है",
          ),
          feedback: t(
            "In the textbook, the voice cracking is a change seen in boys. Hair in new places and oily skin are common to both.",
            "पाठ्यपुस्तक में आवाज़ फटना लड़कों में दिखने वाला बदलाव है। नई जगहों पर बाल और तैलीय त्वचा दोनों में होते हैं।",
          ),
        },
        {
          id: "menstruate",
          label: t("Menstruation begins every month", "हर महीने रजोधर्म शुरू होता है"),
          feedback: t(
            "Menstruation begins in girls at around this time. Hair in new places and oily skin are common to both.",
            "लड़कियों में लगभग इसी समय ऋतुस्राव शुरू होता है। नई जगहों पर बाल और तैलीय त्वचा दोनों में होते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Growing up: puberty", "बड़ा होना: यौवनारंभ")),
      w.body(
        t(
          "Our bodies change as we grow older. Height increases, milk teeth are replaced. These changes are **growth**: the body becomes larger. But in the early teenage years a different set of changes begins: the body's appearance and proportions change, new features appear, and so do new sensations.",
          "उम्र बढ़ने के साथ हमारा शरीर बदलता है। लंबाई बढ़ती है, दूध के दाँत बदलते हैं। ये बदलाव **वृद्धि** हैं: शरीर बड़ा होता है। पर किशोरावस्था के शुरुआती सालों में अलग तरह के बदलाव शुरू होते हैं: शरीर का रूप और अनुपात बदलते हैं, नई विशेषताएँ आती हैं, और नई संवेदनाएँ भी।",
        ),
      ),
      w.definition(
        t(
          "**Changes common to boys and girls.** Thick hair grows in new places such as the armpits and the genital area between the thighs, and can become darker. Thinner hair may appear on the legs, arms and face. The skin often becomes oily and pimples may appear. We become conscious of our own bodies and those of others in new ways.",
          "**लड़कों और लड़कियों में होने वाले साझे बदलाव।** नई जगहों जैसे बग़लों और जाँघों के बीच जननांग क्षेत्र में घने बाल उगते हैं, जो गहरे रंग के हो सकते हैं। पैरों, बाँहों और चेहरे पर पतले बाल आ सकते हैं। त्वचा अक्सर तैलीय हो जाती है और मुँहासे निकल सकते हैं। हम अपने और दूसरों के शरीर के प्रति नए ढंग से सजग होते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Changes that differ.** In girls, breast size begins to increase, with darkening of the skin of the nipples, and girls begin to menstruate. In boys, thick hair grows on the face, the voice begins to crack, and the penis occasionally becomes enlarged and erect, either in daydreams or at night.",
          "**अलग-अलग बदलाव।** लड़कियों में स्तनों का आकार बढ़ने लगता है, चूचुकों की त्वचा गहरी होती है, और ऋतुस्राव शुरू होता है। लड़कों में चेहरे पर घने बाल उगते हैं, आवाज़ फटने लगती है, और शिश्न कभी-कभी बड़ा और उत्तेजित हो जाता है, दिवास्वप्न में या रात में।",
        ),
      ),
      w.body(
        t(
          "These changes happen **slowly, over months and years**, not all at once and not at an exact age. In some people they come early and quickly, in others slowly. And just as noses and fingers differ, so do patterns of hair growth and the size and shape of the breasts or penis. All of these are part of the **sexual maturation** of the body.",
          "ये बदलाव **धीरे-धीरे, महीनों और सालों में** होते हैं, एक साथ नहीं और किसी निश्चित उम्र में नहीं। कुछ लोगों में ये जल्दी और तेज़ी से आते हैं, कुछ में धीरे। और जैसे नाक और उँगलियाँ अलग होती हैं, वैसे ही बालों के उगने का ढंग और स्तनों या शिश्न का आकार भी अलग होता है। ये सब शरीर की **लैंगिक परिपक्वता** का हिस्सा हैं।",
        ),
      ),
      common,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why maturation at this age; puberty defined; signals and special organs. */
const whyNow = page(
  "why-now",
  (b) => {
    const w = wordsOn(b);
    const when = choiceQuestion(b, {
      name: "when",
      prompt: t(
        "According to the textbook, why do reproductive tissues mature only in adolescence?",
        "पाठ्यपुस्तक के अनुसार, जनन ऊतक किशोरावस्था में ही परिपक्व क्यों होते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "While the body is growing, its resources go mainly into growth; as growth slows, reproductive tissues mature",
            "शरीर के बढ़ते समय उसके संसाधन मुख्यतः वृद्धि में लगते हैं; वृद्धि धीमी होने पर जनन ऊतक परिपक्व होते हैं",
          ),
        },
        {
          id: "food",
          label: t("Because teenagers eat more", "क्योंकि किशोर ज़्यादा खाते हैं"),
          feedback: t(
            "The textbook's reason is about priorities: while the body grows to adult size, maturing reproductive tissue isn't a priority. It begins as general growth slows.",
            "पाठ्यपुस्तक का कारण प्राथमिकता का है: जब शरीर वयस्क आकार तक बढ़ रहा होता है, तब जनन ऊतक का परिपक्व होना प्राथमिकता नहीं होती। यह सामान्य वृद्धि धीमी होने पर शुरू होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why at this age?", "इसी उम्र में क्यों?")),
      w.body(
        t(
          "Making germ cells is a specialised job, done by special tissues, as in plants. While the body is growing to adult size, its resources go mainly into that growth, so maturing the reproductive tissue isn't a priority. As general body growth slows down, the reproductive tissues begin to mature.",
          "जनन कोशिकाएँ बनाना एक विशिष्ट काम है, जो पौधों की तरह ख़ास ऊतक करते हैं। जब शरीर वयस्क आकार तक बढ़ रहा होता है, उसके संसाधन मुख्यतः उसी वृद्धि में लगते हैं, इसलिए जनन ऊतक का परिपक्व होना प्राथमिकता नहीं होती। जैसे-जैसे शरीर की सामान्य वृद्धि धीमी होती है, जनन ऊतक परिपक्व होने लगते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Puberty.** The period during adolescence when the reproductive tissues begin to mature is **puberty**.",
          "**यौवनारंभ।** किशोरावस्था का वह समय जब जनन ऊतक परिपक्व होने लगते हैं, **यौवनारंभ** है।",
        ),
      ),
      w.body(
        t(
          "In sexual reproduction, germ cells from two individuals must join. In flowering plants germ cells are released outside the body; in many animals, including humans, they are transferred inside the body, which needs special organs. Many changes at puberty, such as new hair growth, are signals that sexual maturation is taking place. In mammals like humans, the baby is carried in the mother's body for a long time and breast-fed later, so the female reproductive organs and breasts mature to make this possible.",
          "लैंगिक जनन में दो जीवों की जनन कोशिकाओं का मिलना ज़रूरी है। पुष्पी पादपों में जनन कोशिकाएँ शरीर से बाहर छोड़ी जाती हैं; मनुष्यों सहित बहुत से जंतुओं में वे शरीर के अंदर पहुँचाई जाती हैं, जिसके लिए ख़ास अंग चाहिए। यौवनारंभ के कई बदलाव, जैसे नए बाल उगना, संकेत हैं कि लैंगिक परिपक्वता हो रही है। मनुष्य जैसे स्तनधारियों में शिशु लंबे समय तक माँ के शरीर में रहता है और बाद में स्तनपान करता है, इसलिए मादा जनन अंग और स्तन इसके लिए परिपक्व होते हैं।",
        ),
      ),
      when,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The male reproductive system (Fig 8.10). */
const male = page(
  "male",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.3(a), Fig 8.10: testes in the scrotum (lower temperature) make sperms and testosterone; vas deferens joins a tube from the bladder; the urethra is a common passage; seminal vesicles and prostate add fluid for transport and nutrition. Tap each organ.",
    );
    const sys = systemIn(b, "system", HumanMode.Male);
    b.standsFor(
      sys,
      "a simple labelled schematic of the human male reproductive system: tap testis, scrotum, vas deferens, seminal vesicle, prostate gland, urinary bladder, urethra or penis for its job",
    );
    const scrotum = choiceQuestion(b, {
      name: "scrotum",
      prompt: t(
        "Why are the testes located outside the abdominal cavity, in the scrotum?",
        "वृषण उदर गुहा के बाहर, वृषणकोष में क्यों होते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Sperm formation needs a lower temperature than normal body temperature",
            "शुक्राणु बनने के लिए सामान्य शरीर ताप से कम ताप चाहिए",
          ),
        },
        {
          id: "space",
          label: t("There is no room inside", "अंदर जगह नहीं है"),
          feedback: t(
            "The reason is temperature: sperm formation needs it lower than normal body temperature.",
            "कारण ताप है: शुक्राणु बनने के लिए यह सामान्य शरीर ताप से कम होना चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The male reproductive system", "नर जनन तंत्र")),
      w.body(
        t(
          "It has parts that produce the germ cells and parts that deliver them to the site of fertilisation. Tap each organ to read its job.",
          "इसमें कुछ भाग जनन कोशिकाएँ बनाते हैं और कुछ उन्हें निषेचन की जगह तक पहुँचाते हैं। हर अंग पर टैप करके उसका काम पढ़ो।",
        ),
      ),
      sys,
      w.definition(
        t(
          "**Testes and sperms.** The male germ cells, **sperms**, are formed in the **testes**. The testes are in the **scrotum**, outside the abdominal cavity, because sperm formation needs a lower temperature than normal body temperature. The testes also secrete the hormone **testosterone**, which regulates sperm formation and brings about the changes seen in boys at puberty.",
          "**वृषण और शुक्राणु।** नर जनन कोशिकाएँ, **शुक्राणु**, **वृषणों** में बनती हैं। वृषण **वृषणकोष** में, उदर गुहा के बाहर होते हैं, क्योंकि शुक्राणु बनने के लिए सामान्य शरीर ताप से कम ताप चाहिए। वृषण **टेस्टोस्टेरॉन** हॉर्मोन भी स्रावित करते हैं, जो शुक्राणु बनने का नियमन करता है और लड़कों में यौवनारंभ के बदलाव लाता है।",
        ),
      ),
      w.definition(
        t(
          "**The pathway.** Sperms travel through the **vas deferens**, which unites with a tube from the urinary bladder; the **urethra** is thus a common passage for sperms and urine. Along the way, the **seminal vesicles** and the **prostate gland** add their secretions, so the sperms are in a fluid that makes their transport easier and also gives them nutrition. Sperms are tiny: mostly genetic material, with a long tail that helps them move towards the female germ cell.",
          "**रास्ता।** शुक्राणु **शुक्रवाहिका** से होकर जाते हैं, जो मूत्राशय से आने वाली नली से जुड़ जाती है; इस तरह **मूत्रमार्ग** शुक्राणुओं और मूत्र दोनों का साझा रास्ता है। रास्ते में **शुक्राशय** और **प्रोस्टेट ग्रंथि** अपने स्राव मिलाते हैं, जिससे शुक्राणु एक तरल में होते हैं जो उनका परिवहन आसान बनाता है और उन्हें पोषण भी देता है। शुक्राणु बहुत छोटे होते हैं: मुख्यतः आनुवंशिक पदार्थ, और एक लंबी पूँछ जो उन्हें मादा जनन कोशिका की ओर बढ़ने में मदद करती है।",
        ),
      ),
      scrotum,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The female reproductive system (Fig 8.11). */
const female = page(
  "female",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.3(b), Fig 8.11: ovaries make eggs and some hormones; from puberty one egg a month; oviduct (fallopian tube) carries it to the uterus; the uterus opens into the vagina through the cervix. Tap each organ.",
    );
    const sys = systemIn(b, "system", HumanMode.Female);
    b.standsFor(
      sys,
      "a simple labelled schematic of the human female reproductive system: tap ovary, oviduct, uterus, cervix or vagina for its job",
    );
    const vas = choiceQuestion(b, {
      name: "vas",
      prompt: t(
        "Which of the following is not a part of the female reproductive system?",
        "इनमें से कौन मादा जनन तंत्र का भाग नहीं है?",
      ),
      options: [
        { id: "right", label: t("Vas deferens", "शुक्रवाहिका") },
        {
          id: "ovary",
          label: t("Ovary", "अंडाशय"),
          feedback: t(
            "The ovaries make the eggs. The vas deferens is part of the male system.",
            "अंडाशय अंड बनाते हैं। शुक्रवाहिका नर तंत्र का भाग है।",
          ),
        },
        {
          id: "uterus",
          label: t("Uterus", "गर्भाशय"),
          feedback: t(
            "The uterus is where the embryo grows. The vas deferens is part of the male system.",
            "गर्भाशय में भ्रूण बढ़ता है। शुक्रवाहिका नर तंत्र का भाग है।",
          ),
        },
        {
          id: "tube",
          label: t("Fallopian tube", "फ़ैलोपियन नलिका"),
          feedback: t(
            "The fallopian tube (oviduct) carries the egg. The vas deferens is part of the male system.",
            "फ़ैलोपियन नलिका (अंडवाहिनी) अंड को ले जाती है। शुक्रवाहिका नर तंत्र का भाग है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The female reproductive system", "मादा जनन तंत्र")),
      sys,
      w.definition(
        t(
          "**Ovaries and eggs.** The female germ cells, **eggs**, are made in the **ovaries**, which also produce some hormones. At birth a girl's ovaries already contain thousands of immature eggs. From puberty some start maturing, and **one egg is produced every month** by one of the ovaries.",
          "**अंडाशय और अंड।** मादा जनन कोशिकाएँ, **अंड**, **अंडाशयों** में बनती हैं, जो कुछ हॉर्मोन भी बनाते हैं। जन्म के समय ही लड़की के अंडाशयों में हज़ारों अपरिपक्व अंड होते हैं। यौवनारंभ से कुछ परिपक्व होने लगते हैं, और किसी एक अंडाशय से **हर महीने एक अंड** बनता है।",
        ),
      ),
      w.definition(
        t(
          "**The pathway.** The egg is carried from the ovary to the womb through a thin **oviduct**, or **fallopian tube**. The two oviducts unite into an elastic, bag-like structure, the **uterus** (womb). The uterus opens into the **vagina** through the **cervix**.",
          "**रास्ता।** अंड एक पतली **अंडवाहिनी**, या **फ़ैलोपियन नलिका**, से होकर अंडाशय से गर्भ तक जाता है। दोनों अंडवाहिनियाँ मिलकर एक लचीली, थैली जैसी संरचना, **गर्भाशय**, बनाती हैं। गर्भाशय **गर्भाशय ग्रीवा** के ज़रिए **योनि** में खुलता है।",
        ),
      ),
      vas,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fertilisation, the embryo, implantation; the placenta; birth. */
const journey = page(
  "journey",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.3(b): sperms reach the oviduct, where they may meet the egg; the zygote divides into an embryo, which implants in the thickened uterus lining and develops into a foetus. The placenta (villi on the embryo's side, blood spaces on the mother's) passes glucose and oxygen to the embryo and wastes to the mother's blood. About nine months; birth by rhythmic contractions of the uterus.",
    );
    const path = systemIn(b, "path", HumanMode.Journey);
    b.standsFor(
      path,
      "the female system, step by step: an egg released, moving along the oviduct, fertilisation there, the embryo, implantation in the uterus lining",
    );
    const placenta = systemIn(b, "placenta", HumanMode.Placenta);
    b.standsFor(
      placenta,
      "a close-up of the placenta: villi on the embryo's side, blood spaces on the mother's side; glucose and oxygen pass to the embryo, wastes to the mother's blood",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "Step through the first diagram. Where does fertilisation take place?",
        "पहला चित्र क़दम-दर-क़दम देखो। निषेचन कहाँ होता है?",
      ),
      options: [
        { id: "right", label: t("In the oviduct (fallopian tube)", "अंडवाहिनी (फ़ैलोपियन नलिका) में") },
        {
          id: "uterus",
          label: t("In the uterus, on its lining", "गर्भाशय में, उसके अस्तर पर"),
          feedback: t(
            "The uterus is where the embryo later implants and grows. Fertilisation happens earlier, in the oviduct.",
            "गर्भाशय में बाद में भ्रूण रोपित होकर बढ़ता है। निषेचन उससे पहले, अंडवाहिनी में होता है।",
          ),
        },
        {
          id: "ovary",
          label: t("In the ovary, where eggs form", "अंडाशय में, जहाँ अंडाणु बनते हैं"),
          feedback: t(
            "The ovary releases the egg. It meets the sperms further along, in the oviduct.",
            "अंडाशय अंड छोड़ता है। वह आगे, अंडवाहिनी में, शुक्राणुओं से मिलता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("From fertilisation to birth", "निषेचन से जन्म तक")),
      w.body(
        t(
          "During sexual intercourse, sperms enter through the vaginal passage. They travel upwards and reach the oviduct, where they may meet the egg.",
          "लैंगिक संगम के दौरान शुक्राणु योनि मार्ग से प्रवेश करते हैं। वे ऊपर की ओर जाकर अंडवाहिनी तक पहुँचते हैं, जहाँ वे अंड से मिल सकते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Embryo, implantation and foetus.** The fertilised egg (**zygote**) starts dividing into a ball of cells, the **embryo**. The embryo is **implanted** in the lining of the uterus, where it continues to grow and develops organs to become a **foetus**. Every month the uterus prepares for this: its lining thickens and is richly supplied with blood.",
          "**भ्रूण, रोपण और गर्भस्थ शिशु।** निषेचित अंड (**युग्मनज**) बँटकर कोशिकाओं की एक गेंद, **भ्रूण**, बनाता है। भ्रूण गर्भाशय की भित्ति में **रोपित** होता है, जहाँ वह बढ़ता रहता है और अंग विकसित करके **गर्भस्थ शिशु** (भ्रूण) बनता है। हर महीने गर्भाशय इसकी तैयारी करता है: उसकी भित्ति मोटी होती है और उसमें रुधिर की भरपूर आपूर्ति होती है।",
        ),
      ),
      path,
      where,
      w.definition(
        t(
          "**Placenta.** The embryo gets nutrition from the mother's blood through a special tissue, the **placenta**: a disc embedded in the uterine wall. On the embryo's side it has **villi**; on the mother's side are **blood spaces** around the villi. This large surface lets **glucose and oxygen** pass from the mother to the embryo, and the embryo's **wastes** pass into the mother's blood.",
          "**अपरा।** भ्रूण माँ के रुधिर से एक ख़ास ऊतक, **अपरा** (प्लेसेंटा), के ज़रिए पोषण पाता है: गर्भाशय की दीवार में धँसी एक तश्तरी। भ्रूण की ओर इसमें **दीर्घरोम** (विलाई) होते हैं; माँ की ओर दीर्घरोमों के चारों ओर **रुधिर स्थान** होते हैं। यह बड़ी सतह **ग्लूकोज़ और ऑक्सीजन** को माँ से भ्रूण तक जाने देती है, और भ्रूण के **अपशिष्ट** माँ के रुधिर में चले जाते हैं।",
        ),
      ),
      placenta,
      w.body(
        t(
          "The development of the child inside the mother's body takes about **nine months**. The child is born as a result of rhythmic contractions of the muscles in the uterus.",
          "माँ के शरीर के अंदर शिशु के विकास में लगभग **नौ महीने** लगते हैं। गर्भाशय की पेशियों के लयबद्ध संकुचन से शिशु का जन्म होता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Check your understanding (the "see it in life" step, kept neutral)   */
/* ------------------------------------------------------------------ */

/** Linking it back: the same plan as in the flower. */
const connect = page(
  "connect",
  (b) => {
    const w = wordsOn(b);
    const same = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "In a flower, a pollen tube carries the male germ cell to the egg in the ovule. In human beings, where do the male and female germ cells meet?",
        "फूल में पराग नली नर जनन कोशिका को बीजांड के अंड तक ले जाती है। मनुष्यों में नर और मादा जनन कोशिकाएँ कहाँ मिलती हैं?",
      ),
      options: [
        { id: "right", label: t("In the oviduct", "अंडवाहिनी में") },
        {
          id: "placenta",
          label: t("In the placenta", "अपरा में"),
          feedback: t(
            "The placenta forms later, to nourish the embryo. The germ cells meet in the oviduct.",
            "अपरा बाद में, भ्रूण को पोषण देने के लिए बनती है। जनन कोशिकाएँ अंडवाहिनी में मिलती हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 6 done.** At puberty the reproductive tissues mature. The testes make sperms and testosterone; the ovaries release an egg each month. Fertilisation happens in the oviduct; the embryo implants in the uterus and is nourished through the placenta for about nine months. The plan is the same as in a flower: two germ cells, each with half the DNA, fuse to make a zygote.",
        "**पड़ाव 6 पूरा।** यौवनारंभ में जनन ऊतक परिपक्व होते हैं। वृषण शुक्राणु और टेस्टोस्टेरॉन बनाते हैं; अंडाशय हर महीने एक अंड छोड़ते हैं। निषेचन अंडवाहिनी में होता है; भ्रूण गर्भाशय में रोपित होता है और लगभग नौ महीने अपरा से पोषण पाता है। योजना फूल जैसी ही है: दो जनन कोशिकाएँ, हर एक में आधा DNA, मिलकर युग्मनज बनाती हैं।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(same.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("The same plan as a flower", "फूल जैसी ही योजना")),
      w.body(
        t(
          "Put it next to what you learnt in plants. In both, special organs make germ cells with half the DNA, the germ cells are brought together, and their fusion gives a zygote that grows, protected and fed, into a new individual.",
          "इसे पौधों में सीखी बातों के साथ रखो। दोनों में ख़ास अंग आधे DNA वाली जनन कोशिकाएँ बनाते हैं, जनन कोशिकाएँ एक साथ लाई जाती हैं, और उनके मिलने से युग्मनज बनता है जो सुरक्षा और पोषण पाकर नए जीव में बढ़ता है।",
        ),
      ),
      same,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2, Q3, Q4 and Exercise 5. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const glands = choiceQuestion(b, {
      name: "glands",
      prompt: t(
        "What is the role of the seminal vesicles and the prostate gland?",
        "शुक्राशय और प्रोस्टेट ग्रंथि की क्या भूमिका है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Their secretions make a fluid that eases the sperms' transport and nourishes them",
            "उनके स्राव से बना तरल शुक्राणुओं का परिवहन आसान करता है और उन्हें पोषण देता है",
          ),
        },
        {
          id: "make",
          label: t("They make the sperms", "वे शुक्राणु बनाते हैं"),
          feedback: t(
            "Sperms are made in the testes. The seminal vesicles and prostate add fluid for transport and nutrition.",
            "शुक्राणु वृषणों में बनते हैं। शुक्राशय और प्रोस्टेट परिवहन और पोषण के लिए तरल मिलाते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const girls = choiceQuestion(b, {
      name: "girls",
      prompt: t(
        "What are the changes seen in girls at the time of puberty?",
        "यौवनारंभ के समय लड़कियों में कौन-से बदलाव दिखते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Breast size increases, the skin of the nipples darkens, and menstruation begins (along with the common changes)",
            "स्तनों का आकार बढ़ता है, चूचुकों की त्वचा गहरी होती है, और ऋतुस्राव शुरू होता है (साझे बदलावों के साथ)",
          ),
        },
        {
          id: "voice",
          label: t("Facial hair and a cracking voice", "चेहरे पर बाल और फटती आवाज़"),
          feedback: t(
            "Those are changes the textbook describes in boys. In girls, breasts grow, the nipples darken and menstruation begins.",
            "ये बदलाव पाठ्यपुस्तक लड़कों में बताती है। लड़कियों में स्तन बढ़ते हैं, चूचुक गहरे होते हैं और ऋतुस्राव शुरू होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const nourish = choiceQuestion(b, {
      name: "nourish",
      prompt: t(
        "How does the embryo get nourishment inside the mother's body?",
        "माँ के शरीर के अंदर भ्रूण को पोषण कैसे मिलता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Through the placenta, from the mother's blood", "अपरा के ज़रिए, माँ के रुधिर से"),
        },
        {
          id: "egg",
          label: t("Only from food stored in the egg", "केवल अंड में संग्रहित भोजन से"),
          feedback: t(
            "In humans the embryo is nourished for about nine months through the placenta, where glucose and oxygen pass from the mother's blood.",
            "मनुष्यों में भ्रूण लगभग नौ महीने अपरा से पोषण पाता है, जहाँ माँ के रुधिर से ग्लूकोज़ और ऑक्सीजन आते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const testis = choiceQuestion(b, {
      name: "testis",
      prompt: t(
        "What are the functions performed by the testis in human beings?",
        "मनुष्य में वृषण कौन-से कार्य करते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They form sperms and secrete testosterone",
            "वे शुक्राणु बनाते हैं और टेस्टोस्टेरॉन स्रावित करते हैं",
          ),
        },
        {
          id: "urine",
          label: t("They store urine", "वे मूत्र संग्रह करते हैं"),
          feedback: t(
            "Urine is stored in the urinary bladder. The testes form sperms and secrete testosterone.",
            "मूत्र मूत्राशय में संग्रहित होता है। वृषण शुक्राणु बनाते हैं और टेस्टोस्टेरॉन स्रावित करते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Lesson log.** ✓ Puberty: reproductive tissues mature as body growth slows. ✓ Male: testes (sperms, testosterone) in the scrotum, vas deferens, seminal vesicles, prostate, urethra. ✓ Female: ovaries (one egg a month), oviducts, uterus, cervix, vagina. ✓ Fertilisation in the oviduct; implantation in the uterus; nourishment through the placenta; about nine months. Next: what happens when the egg isn't fertilised, and reproductive health.",
        "**पाठ लॉग।** ✓ यौवनारंभ: शरीर की वृद्धि धीमी होने पर जनन ऊतक परिपक्व होते हैं। ✓ नर: वृषणकोष में वृषण (शुक्राणु, टेस्टोस्टेरॉन), शुक्रवाहिका, शुक्राशय, प्रोस्टेट, मूत्रमार्ग। ✓ मादा: अंडाशय (हर महीने एक अंड), अंडवाहिनियाँ, गर्भाशय, गर्भाशय ग्रीवा, योनि। ✓ निषेचन अंडवाहिनी में; रोपण गर्भाशय में; अपरा से पोषण; लगभग नौ महीने। आगे: जब अंड निषेचित नहीं होता तब क्या होता है, और जनन स्वास्थ्य।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(testis.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      glands,
      girls,
      nourish,
      testis,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, check, practice. */
export const overview = [hook, puberty, whyNow, male, female, journey, connect, yourTurn];
