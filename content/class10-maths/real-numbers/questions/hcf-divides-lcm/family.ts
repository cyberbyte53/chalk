import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choice, primesTex } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Can two numbers have this HCF and this LCM? Only if the HCF divides the LCM. */
export const hcfDividesLcm = family({
  level: Level.Hard,
  tests: [Concept.HcfAndLcm],
  params: z.object({ hcf: z.number().int().min(2), lcm: z.number().int().min(2) }).strict(),
  build: ({ hcf, lcm }, b) => {
    const can = lcm % hcf === 0;
    const yes = {
      label: t("Yes", "हाँ"),
      ...(can
        ? {}
        : {
            feedback: t(
              r`The HCF divides both numbers and both divide the LCM, so the HCF must divide the LCM. $${hcf} = ${primesTex(hcf)}$ doesn't divide $${lcm} = ${primesTex(lcm)}$.`,
              r`HCF दोनों संख्याओं को और दोनों संख्याएँ LCM को विभाजित करती हैं, इसलिए HCF को LCM को विभाजित करना ही होगा। $${hcf} = ${primesTex(hcf)}$, $${lcm} = ${primesTex(lcm)}$ को विभाजित नहीं करता।`,
            ),
          }),
    };
    const no = {
      label: t("No", "नहीं"),
      ...(can
        ? {
            feedback: t(
              r`${hcf} divides ${lcm}, so it can happen: for example the numbers ${hcf} and ${lcm} themselves.`,
              r`${hcf}, ${lcm} को विभाजित करता है, इसलिए ऐसा हो सकता है: जैसे स्वयं ${hcf} और ${lcm}।`,
            ),
          }
        : {}),
    };
    const ask = choice(b, {
      prompt: t(
        `Can two numbers have HCF ${hcf} and LCM ${lcm}?`,
        `क्या दो संख्याओं का HCF ${hcf} और LCM ${lcm} हो सकता है?`,
      ),
      right: can ? yes.label : no.label,
      wrong: can ? { no } : { yes },
    });
    return [ask];
  },
});
