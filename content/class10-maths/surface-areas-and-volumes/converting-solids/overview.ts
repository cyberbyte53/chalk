import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { RecastAction, RecastKind, SolidsSceneKind } from "@chalk/prop-solids";
import { recastOn, sceneOn } from "../kit";

const r = String.raw;

type Recast = ReturnType<typeof recastOn>;

/** A goal: step the conversion through to its answer. */
function stepGoal(b: Parameters<typeof recastOn>[0], recast: Recast, prompt: ReturnType<typeof t>) {
  return goalQuestion(b, {
    about: recast,
    prompt,
    isMet: recast.field("step").eq(3),
    solve: [0, 1, 2].map(() => recast.learner(RecastAction.Step, {})),
  });
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The kulfi can and the cones. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const can = sceneOn(
    b,
    "can",
    SolidsSceneKind.KulfiCan,
    "the courtyard: a tall cylindrical can of kulfi beside a stand of cones, Kabir filling one while Riya counts",
  );
  return column([
    w.title(t("How many cones from one can?", "एक डिब्बे से कितने कोन?")),
    can,
    w.body(
      t(
        "Kabir and Riya are selling kulfi at the stall. Kabir scoops it from a tall cylindrical can into cones, each topped with a round scoop. The cones cost money: buy too many and they go stale, too few and customers walk away.",
        "कबीर और रिया स्टॉल पर कुल्फ़ी बेच रहे हैं। कबीर उसे एक ऊँचे बेलनाकार डिब्बे से निकालकर कोनों में भरता है, हर एक पर गोल स्कूप। कोन पैसे से आते हैं: ज़्यादा ख़रीदे तो बासी होंगे, कम ख़रीदे तो ग्राहक लौट जाएँगे।",
      ),
    ),
    w.body(
      t(
        "The kulfi changes shape, from one can to many cones. What stays the same while it changes?",
        "कुल्फ़ी का आकार बदलता है, एक डिब्बे से कई कोनों में। बदलते हुए क्या वही रहता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The rule: volume before = volume after. Example 8. */
const same = page(
  "same",
  (b) => {
    const w = wordsOn(b);
    const clay = recastOn(
      b,
      "clay",
      { kind: RecastKind.ClayCone },
      "Example 8: a clay cone 24 cm high and 6 cm in radius reshaped into a sphere, in steps",
    );
    const goal = stepGoal(
      b,
      clay,
      t(
        "Step the clay from cone to sphere, and find the sphere's radius.",
        "मिट्टी को शंकु से गोले तक बदलो, और गोले की त्रिज्या निकालो।",
      ),
    );
    return column([
      w.title(t("Same stuff, new shape", "वही सामग्री, नया आकार")),
      w.body(
        t(
          "To make a candle shaped like a rabbit, you melt a cylindrical candle and pour all the wax into a rabbit-shaped mould. Nothing is added and nothing spills, so the rabbit has exactly as much wax as the cylinder had.",
          "ख़रगोश के आकार की मोमबत्ती बनाने के लिए तुम बेलनाकार मोमबत्ती पिघलाकर सारा मोम ख़रगोश के साँचे में डालते हो। न कुछ जुड़ता है न कुछ गिरता है, इसलिए ख़रगोश में ठीक उतना मोम है जितना बेलन में था।",
        ),
      ),
      w.definition(
        t(
          "**Converting a solid.** When a solid is melted and recast, or a liquid is poured from one container into another, or earth is dug out and spread, the shape changes but the **volume stays the same**: volume before = volume after. That one equation finds the unknown measurement.",
          "**ठोस का रूपांतरण।** जब कोई ठोस पिघलाकर दोबारा ढाला जाता है, या कोई द्रव एक बर्तन से दूसरे में डाला जाता है, या मिट्टी खोदकर फैलाई जाती है, तो आकार बदलता है पर **आयतन वही रहता है**: पहले का आयतन = बाद का आयतन। यही एक समीकरण अज्ञात माप निकालता है।",
        ),
      ),
      clay,
      goal,
      w.body(
        t(
          r`**Example 8.** $$\tfrac{4}{3}\pi r^3 = \tfrac{1}{3}\pi \times 6 \times 6 \times 24$$ $$r^3 = 3 \times 3 \times 24 = 3^3 \times 2^3$$ $$r = 6 \text{ cm}$$`,
          r`**उदाहरण 8।** $$\tfrac{4}{3}\pi r^3 = \tfrac{1}{3}\pi \times 6 \times 6 \times 24$$ $$r^3 = 3 \times 3 \times 24 = 3^3 \times 2^3$$ $$r = 6 \text{ cm}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 9: Selvi's sump and tank. */
const sump = page(
  "sump",
  (b) => {
    const w = wordsOn(b);
    const water = recastOn(
      b,
      "water",
      { kind: RecastKind.Sump },
      "Example 9: water pumped from a full cuboid sump into a cylindrical overhead tank, and the height left in the sump",
    );
    const goal = stepGoal(
      b,
      water,
      t(
        "Pump the tank full, and find the water left in the sump.",
        "टंकी भरो, और हौज़ में बचा पानी निकालो।",
      ),
    );
    return column([
      w.title(t("Example 9: Selvi's sump", "उदाहरण 9: सेल्वी का हौज़")),
      w.body(
        t(
          r`Selvi's sump (an underground tank) is a cuboid 1.57 m × 1.44 m × 95 cm, full of water. It fills a cylindrical overhead tank of radius 60 cm and height 95 cm. The water that leaves the sump is the water in the tank. ($\pi = 3.14$.)`,
          r`सेल्वी का हौज़ (ज़मीन के नीचे की टंकी) 1.57 m × 1.44 m × 95 cm का घनाभ है, पानी से भरा। यह त्रिज्या 60 cm और ऊँचाई 95 cm की बेलनाकार ऊपरी टंकी भरता है। जो पानी हौज़ से निकलता है, वही टंकी में है। ($\pi = 3.14$।)`,
        ),
      ),
      water,
      goal,
      w.body(
        t(
          r`$$\text{left} = 1.57 \times 1.44 \times 0.95$$ $$- 3.14 \times 0.6 \times 0.6 \times 0.95$$ Notice $1.44 = 4 \times 0.36$ and $3.14 = 2 \times 1.57$, so $$\text{left} = 1.57 \times 0.36 \times 0.95 \times (4 - 2)$$ $$= 1.57 \times 0.6 \times 0.6 \times 0.95 \times 2 \text{ m}^3$$ $$\text{height left} = \frac{\text{left}}{1.57 \times 1.44}$$ $$= 0.475 \text{ m} = 47.5 \text{ cm}$$ $$\frac{\text{tank}}{\text{sump}}$$ $$= \frac{3.14 \times 0.6 \times 0.6 \times 0.95}{1.57 \times 1.44 \times 0.95}$$ $$= \frac{1}{2}$$ The tank holds half what the sump holds.`,
          r`$$\text{बचा} = 1.57 \times 1.44 \times 0.95$$ $$- 3.14 \times 0.6 \times 0.6 \times 0.95$$ ध्यान दो $1.44 = 4 \times 0.36$ और $3.14 = 2 \times 1.57$, तो $$\text{बचा} = 1.57 \times 0.36 \times 0.95 \times (4 - 2)$$ $$= 1.57 \times 0.6 \times 0.6 \times 0.95 \times 2 \text{ m}^3$$ $$\text{बची ऊँचाई} = \frac{\text{बचा}}{1.57 \times 1.44}$$ $$= 0.475 \text{ m} = 47.5 \text{ cm}$$ $$\frac{\text{टंकी}}{\text{हौज़}}$$ $$= \frac{3.14 \times 0.6 \times 0.6 \times 0.95}{1.57 \times 1.44 \times 0.95}$$ $$= \frac{1}{2}$$ टंकी में हौज़ का आधा आता है।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 10: a rod drawn into wire. */
const wire = page(
  "wire",
  (b) => {
    const w = wordsOn(b);
    const rod = recastOn(
      b,
      "rod",
      { kind: RecastKind.Wire },
      "Example 10: a copper rod 1 cm across and 8 cm long drawn into a wire 18 m long",
    );
    const goal = stepGoal(
      b,
      rod,
      t(
        "Draw the rod into wire, and find the wire's radius.",
        "छड़ को तार में खींचो, और तार की त्रिज्या निकालो।",
      ),
    );
    const thick = choiceQuestion(b, {
      name: "thick",
      prompt: t(
        r`The wire's radius is $\tfrac{1}{30}$ cm. Its thickness is`,
        r`तार की त्रिज्या $\tfrac{1}{30}$ cm है। उसकी मोटाई है`,
      ),
      options: [
        { id: "right", label: t(r`$\tfrac{1}{15}$ cm`, r`$\tfrac{1}{15}$ cm`) },
        {
          id: "r",
          label: t(r`$\tfrac{1}{30}$ cm`, r`$\tfrac{1}{30}$ cm`),
          feedback: t(
            "That's the radius. The thickness is straight across the wire: the diameter.",
            "यह त्रिज्या है। मोटाई तार के आर-पार है: व्यास।",
          ),
        },
        {
          id: "sq",
          label: t(r`$\tfrac{1}{900}$ cm`, r`$\tfrac{1}{900}$ cm`),
          feedback: t(
            r`That's $r^2$. Take the square root for $r$, then double it.`,
            r`यह $r^2$ है। $r$ के लिए वर्गमूल लो, फिर दोगुना करो।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 10: rod into wire", "उदाहरण 10: छड़ से तार")),
      w.body(
        t(
          "A copper rod, 1 cm across and 8 cm long, is drawn into a wire 18 m long of even thickness. Change everything to one unit first: 18 m = 1800 cm.",
          "1 cm चौड़ी और 8 cm लंबी तांबे की छड़ को 18 m लंबे, एक-सी मोटाई वाले तार में खींचा जाता है। पहले सब एक इकाई में बदलो: 18 m = 1800 cm।",
        ),
      ),
      rod,
      goal,
      w.body(
        t(
          r`$$\pi r^2 \times 1800 = \pi \times \left(\tfrac{1}{2}\right)^2 \times 8 = 2\pi$$ $$r^2 = \tfrac{1}{900}, \quad r = \tfrac{1}{30} \text{ cm}$$`,
          r`$$\pi r^2 \times 1800 = \pi \times \left(\tfrac{1}{2}\right)^2 \times 8 = 2\pi$$ $$r^2 = \tfrac{1}{900}, \quad r = \tfrac{1}{30} \text{ cm}$$`,
        ),
      ),
      thick,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Flow: volume as a length of moving water. Example 11 and Exercise 13.3 Q9. */
const flow = page("flow", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Water on the move", "बहता पानी")),
    w.body(
      t(
        "When water flows into a tank, its volume still doesn't change. A rate tells how much arrives each second, or how fast the water in a pipe moves. Then time = volume ÷ rate.",
        "जब पानी टंकी में बहता है, तब भी उसका आयतन नहीं बदलता। दर बताती है कि हर सेकंड कितना आता है, या पाइप में पानी कितनी तेज़ चलता है। तब समय = आयतन ÷ दर।",
      ),
    ),
    w.body(
      t(
        r`**Example 11.** A hemispherical tank 3 m across, full of water, is emptied by a pipe at $3\tfrac{4}{7}$ litres a second. How long to empty half of it? (1 m³ = 1000 litres.) $$\tfrac{1}{2} \times \tfrac{2}{3} \times \tfrac{22}{7} \times \left(\tfrac{3}{2}\right)^3$$ $$= \tfrac{99}{28} \text{ m}^3 = \tfrac{99000}{28} \text{ litres}$$ $$\text{time} = \tfrac{99000}{28} \times \tfrac{7}{25} = 990 \text{ s}$$ $$= 16.5 \text{ minutes}$$`,
        r`**उदाहरण 11।** पानी से भरी 3 m चौड़ी अर्धगोलाकार टंकी एक पाइप से $3\tfrac{4}{7}$ लीटर प्रति सेकंड की दर से ख़ाली की जाती है। आधी ख़ाली होने में कितना समय? (1 m³ = 1000 लीटर।) $$\tfrac{1}{2} \times \tfrac{2}{3} \times \tfrac{22}{7} \times \left(\tfrac{3}{2}\right)^3$$ $$= \tfrac{99}{28} \text{ m}^3 = \tfrac{99000}{28} \text{ लीटर}$$ $$\text{समय} = \tfrac{99000}{28} \times \tfrac{7}{25} = 990 \text{ s}$$ $$= 16.5 \text{ मिनट}$$`,
      ),
    ),
    space(),
  ]);
});

/** Exercise 13.3 Q9: a pipe at 3 km/h fills a tank. */
const pipeFlow = page(
  "pipe-flow",
  (b) => {
    const w = wordsOn(b);
    const pipe = recastOn(
      b,
      "pipe",
      { kind: RecastKind.Pipe },
      "Exercise 13.3 Q9: a cylindrical tank 10 m across and 2 m deep, and the length of a pipe 20 cm across that holds the same water",
    );
    const goal = stepGoal(
      b,
      pipe,
      t(
        "Find how long a stretch of pipe holds the tank's water.",
        "निकालो कि पाइप का कितना लंबा हिस्सा टंकी जितना पानी रखता है।",
      ),
    );
    return column([
      w.title(t("Water at a speed", "एक चाल से बहता पानी")),
      w.body(
        t(
          "**Exercise 13.3 Q9.** A farmer runs a pipe 20 cm across from a canal into a cylindrical tank 10 m across and 2 m deep. Water flows through the pipe at 3 km/h. How long does the tank take to fill?",
          "**प्रश्नावली 13.3 प्र9।** एक किसान नहर से 20 cm चौड़ा पाइप 10 m चौड़ी और 2 m गहरी बेलनाकार टंकी में लगाता है। पाइप में पानी 3 km/h से बहता है। टंकी भरने में कितना समय लगेगा?",
        ),
      ),
      w.body(
        t(
          "In one hour, a 3 km long cylinder of water comes out of the pipe. So first find how long a cylinder of pipe-water holds the whole tank.",
          "एक घंटे में पाइप से 3 km लंबा पानी का बेलन निकलता है। तो पहले निकालो कि पाइप-पानी का कितना लंबा बेलन पूरी टंकी जितना है।",
        ),
      ),
      pipe,
      goal,
      w.body(
        t(
          r`$$\pi \times 0.1^2 \times L = \pi \times 5^2 \times 2$$ $$\Rightarrow L = 5000 \text{ m} = 5 \text{ km}$$ $$\text{time} = \tfrac{5}{3} \text{ h} = 100 \text{ minutes}$$`,
          r`$$\pi \times 0.1^2 \times L = \pi \times 5^2 \times 2$$ $$\Rightarrow L = 5000 \text{ m} = 5 \text{ km}$$ $$\text{समय} = \tfrac{5}{3} \text{ h} = 100 \text{ मिनट}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Exercise 13.3 Q5: Kabir's kulfi cones. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const kulfi = recastOn(
      b,
      "kulfi",
      { kind: RecastKind.IceCream },
      "Exercise 13.3 Q5: a cylinder of ice cream 12 cm across and 15 cm high filled into cones 12 cm high and 6 cm across, each with a hemisphere on top",
    );
    const goal = stepGoal(
      b,
      kulfi,
      t("Fill the cones from the can, and count them.", "डिब्बे से कोन भरो, और गिनो।"),
    );
    return column([
      w.title(t("Kabir's kulfi cones", "कबीर के कुल्फ़ी कोन")),
      w.body(
        t(
          "The can is a cylinder 12 cm across and 15 cm high. Each cone is 12 cm high and 6 cm across, with a hemisphere of kulfi on top (Exercise 13.3 Q5).",
          "डिब्बा 12 cm चौड़ा और 15 cm ऊँचा बेलन है। हर कोन 12 cm ऊँचा और 6 cm चौड़ा है, ऊपर कुल्फ़ी का अर्धगोला (प्रश्नावली 13.3 प्र5)।",
        ),
      ),
      kulfi,
      goal,
      w.body(
        t(
          r`$$\text{can} = \pi \times 6^2 \times 15 = 540\pi$$ $$\text{one cone} = \tfrac{1}{3}\pi \times 3^2 \times 12 + \tfrac{2}{3}\pi \times 3^3$$ $$= 54\pi$$ $$\text{cones} = \frac{540\pi}{54\pi} = 10$$ One can fills exactly 10 cones, so they buy 10 cones for each can.`,
          r`$$\text{डिब्बा} = \pi \times 6^2 \times 15 = 540\pi$$ $$\text{एक कोन} = \tfrac{1}{3}\pi \times 3^2 \times 12 + \tfrac{2}{3}\pi \times 3^3$$ $$= 54\pi$$ $$\text{कोन} = \frac{540\pi}{54\pi} = 10$$ एक डिब्बा ठीक 10 कोन भरता है, तो वे हर डिब्बे के लिए 10 कोन ख़रीदते हैं।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 13.3 Q1 and Q2, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const melt = choiceQuestion(b, {
      name: "melt",
      prompt: t(
        "Exercise 13.3 Q1. A metal sphere of radius 4.2 cm is recast into a cylinder of radius 6 cm. The cylinder's height is",
        "प्रश्नावली 13.3 प्र1। त्रिज्या 4.2 cm का धातु का गोला त्रिज्या 6 cm के बेलन में ढाला जाता है। बेलन की ऊँचाई है",
      ),
      options: [
        { id: "right", label: t("2.74 cm", "2.74 cm") },
        {
          id: "206",
          label: t("2.06 cm", "2.06 cm"),
          feedback: t(
            r`The sphere's volume is $\tfrac{4}{3}\pi r^3$: the $\tfrac{4}{3}$ was left out.`,
            r`गोले का आयतन $\tfrac{4}{3}\pi r^3$ है: $\tfrac{4}{3}$ छूट गया।`,
          ),
        },
        {
          id: "069",
          label: t("0.69 cm", "0.69 cm"),
          feedback: t(
            "That used 12 as the cylinder's radius. The radius is 6 cm, so divide by 6², not 12².",
            "इसमें बेलन की त्रिज्या 12 ली। त्रिज्या 6 cm है, तो 6² से भाग दो, 12² से नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const three = choiceQuestion(b, {
      name: "three",
      prompt: t(
        "Exercise 13.3 Q2. Metal spheres of radii 6 cm, 8 cm and 10 cm are melted into one sphere. Its radius is",
        "प्रश्नावली 13.3 प्र2। त्रिज्या 6 cm, 8 cm और 10 cm के धातु के गोले पिघलाकर एक गोला बनाया जाता है। उसकी त्रिज्या है",
      ),
      options: [
        { id: "right", label: t("12 cm", "12 cm") },
        {
          id: "24",
          label: t("24 cm", "24 cm"),
          feedback: t(
            "Radii don't add; volumes do. Add 6³ + 8³ + 10³, then take the cube root.",
            "त्रिज्याएँ नहीं जुड़तीं; आयतन जुड़ते हैं। 6³ + 8³ + 10³ जोड़ो, फिर घनमूल लो।",
          ),
        },
        {
          id: "14",
          label: t("14 cm", "14 cm"),
          feedback: t(
            "That's about the square root of 6² + 8² + 10², as if areas were added. Volumes go with cubes.",
            "यह लगभग 6² + 8² + 10² का वर्गमूल है, मानो क्षेत्रफल जोड़े हों। आयतन घनों से चलते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ When a solid changes shape, its volume doesn't: volume before = volume after. ✓ One can of kulfi fills 10 cones. ✗ The village jaggery comes in moulds that are cones with their tops cut off, and we can't measure those yet. Next stop: the frustum.",
        "**मिशन लॉग।** ✓ ठोस का आकार बदलने पर उसका आयतन नहीं बदलता: पहले का आयतन = बाद का आयतन। ✓ कुल्फ़ी का एक डिब्बा 10 कोन भरता है। ✗ गाँव का गुड़ ऐसे साँचों में आता है जो ऊपर से कटे शंकु हैं, और उन्हें हम अभी नाप नहीं सकते। अगला पड़ाव: छिन्नक।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(melt.on(QuestionSignal.Correct), theBoard.show(three));
    b.when(three.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), melt, three, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, same, sump, wire, flow, pipeFlow, inLife, yourTurn];
