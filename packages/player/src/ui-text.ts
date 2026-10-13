import type { Locale, Localized } from "@chalk/content";

/** App chrome copy. Keys are a closed set; content copy lives in lessons. */
export const UiText = {
  continue: { en: "Continue", hi: "आगे" },
  check: { en: "Check", hi: "जाँचो" },
  tryAgain: { en: "Try again", hi: "फिर से करो" },
  correct: { en: "That's it!", hi: "बिल्कुल सही!" },
  notQuite: { en: "Not quite.", hi: "अभी नहीं।" },
  lessonComplete: { en: "Lesson complete", hi: "पाठ पूरा हुआ" },
  backToLessons: { en: "Back to lessons", hi: "पाठों पर वापस" },
  close: { en: "Close lesson", hi: "पाठ बंद करो" },
  askJugnu: { en: "Ask Jugnu", hi: "जुगनू से पूछो" },
  jugnu: { en: "Jugnu", hi: "जुगनू" },
  jugnuHello: {
    en: "Stuck, or curious? Ask me anything about this board.",
    hi: "अटक गए, या कुछ जानना है? इस बोर्ड के बारे में कुछ भी पूछो।",
  },
  jugnuPlaceholder: { en: "Type your question…", hi: "अपना सवाल लिखो…" },
  jugnuThinking: { en: "Jugnu is thinking…", hi: "जुगनू सोच रहा है…" },
  jugnuUnreachable: {
    en: "Jugnu can't reach his model right now.",
    hi: "जुगनू अभी अपने मॉडल तक नहीं पहुँच पा रहा।",
  },
  jugnuWatching: { en: "Your turn. Jugnu is watching.", hi: "अब तुम्हारी बारी। जुगनू देख रहा है।" },
  send: { en: "Send", hi: "भेजो" },
  closeJugnu: { en: "Close Jugnu", hi: "जुगनू बंद करो" },
  audioUnavailable: {
    en: "Audio unavailable · tap to try again",
    hi: "आवाज़ नहीं चली · फिर से सुनने के लिए दबाओ",
  },
} as const satisfies Record<string, Localized>;
export type UiTextKey = keyof typeof UiText;

export function t(locale: Locale, key: UiTextKey): string {
  return UiText[key][locale];
}
