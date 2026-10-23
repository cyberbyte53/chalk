import type { Localized } from "@chalk/content";

/** Words in both languages: t("Zoom in", "ज़ूम करो"). Every learner-facing string goes through here. */
export function t(en: string, hi: string): Localized {
  return { en, hi };
}
