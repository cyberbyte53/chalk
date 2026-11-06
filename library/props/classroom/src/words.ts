import type { Locale, Localized } from "@chalk/content";
import { Attention, StandingKind } from "./classroom";

/** The prop's own words, in both languages. */
export const WORDS = {
  classroom: {
    en: "A classroom: a teacher at the blackboard and his class",
    hi: "एक कक्षा: ब्लैकबोर्ड पर शिक्षक और उनकी कक्षा",
  },
  writing: { en: "writing on the board", hi: "बोर्ड पर लिख रहे हैं" },
  facing: { en: "facing the class", hi: "कक्षा की ओर देख रहे हैं" },
  cleanBoard: { en: "a clean board", hi: "साफ़ बोर्ड" },
  walkingToChild: { en: "walking down to a child", hi: "एक बच्चे के पास जा रहे हैं" },
  besideChild: { en: "crouched beside a child", hi: "एक बच्चे के पास बैठे हैं" },
} satisfies Record<string, Localized>;

/** A child's attention, as the screen says it. */
export const ATTENTION_WORDS: Record<Attention, Localized> = {
  [Attention.Following]: { en: "following", hi: "समझ रहा है" },
  [Attention.Lost]: { en: "lost", hi: "खो गया है" },
  [Attention.Asking]: { en: "hand up, waiting", hi: "हाथ उठाए, इंतज़ार में" },
  [Attention.LitUp]: { en: "lit up, with a slate of their own", hi: "अपनी स्लेट के साथ, जगमग" },
  [Attention.Stuck]: { en: "stuck, over their slate", hi: "अपनी स्लेट पर अटका हुआ" },
  [Attention.Curious]: { en: "curious, a hand up to ask", hi: "जिज्ञासु, पूछने को हाथ उठाए" },
};

/** A standing's kind, as the screen says it when the lesson gives no words. */
export const STANDING_WORDS: Record<StandingKind, Localized> = {
  [StandingKind.NeedsHelp]: { en: "needs help", hi: "मदद चाहिए" },
  [StandingKind.OnTrack]: { en: "on track", hi: "सही राह पर" },
  [StandingKind.Curious]: { en: "curious", hi: "जिज्ञासु" },
};

export const word = (w: Localized, locale: Locale): string => w[locale];
