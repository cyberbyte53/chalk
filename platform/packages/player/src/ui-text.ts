import type { Locale, Localized } from "@chalk/content";

/** App chrome copy. Keys are a closed set; content copy lives in lessons. */
export const UiText = {
  continue: { en: "Continue", hi: "आगे" },
  back: { en: "Back", hi: "पीछे" },
  check: { en: "Check", hi: "जाँचो" },
  tryAgain: { en: "Try again", hi: "फिर से करो" },
  correct: { en: "That's it!", hi: "बिल्कुल सही!" },
  notQuite: { en: "Not quite.", hi: "अभी नहीं।" },
  incorrect: { en: "Incorrect", hi: "गलत" },
  letsReview: { en: "Let's review.", hi: "चलो देखें।" },
  rightBanner: { en: "Correct!", hi: "सही!" },
  why: { en: "Why?", hi: "क्यों?" },
  whyWrong: { en: "Why was my answer wrong?", hi: "मेरा जवाब गलत क्यों था?" },
  whyRight: { en: "Why is that right?", hi: "यह सही क्यों है?" },
  lessonComplete: { en: "Lesson complete", hi: "पाठ पूरा हुआ" },
  backToLessons: { en: "Back to lessons", hi: "पाठों पर वापस" },
  close: { en: "Close lesson", hi: "पाठ बंद करो" },
  askJugnu: { en: "Ask Jugnu", hi: "जुगनू से पूछो" },
  getHelp: { en: "Get help", hi: "मदद लो" },
  theQuestion: { en: "the question", hi: "सवाल" },
  whatsThis: { en: "What's this?", hi: "यह क्या है?" },
  unpick: { en: "Remove", hi: "हटाओ" },
  jugnu: { en: "Jugnu", hi: "जुगनू" },
  jugnuPlaceholder: { en: "Type your question…", hi: "अपना सवाल लिखो…" },
  jugnuThinking: { en: "Jugnu is thinking…", hi: "जुगनू सोच रहा है…" },
  jugnuDone: { en: "Done", hi: "हो गया" },
  jugnuSend: { en: "Send", hi: "भेजो" },
  jugnuEarlier: { en: "Earlier", hi: "पहले" },
  jugnuReply: { en: "Your answer…", hi: "तुम्हारा जवाब…" },
  jugnuDid: { en: "You did on the board", hi: "तुमने बोर्ड पर किया" },
  jugnuUnreachable: {
    en: "Jugnu can't reach his model right now.",
    hi: "जुगनू अभी अपने मॉडल तक नहीं पहुँच पा रहा।",
  },
  send: { en: "Send", hi: "भेजो" },
  speak: { en: "Speak", hi: "बोलो" },
  voiceOn: { en: "Hear Jugnu", hi: "जुगनू को सुनो" },
  voiceOff: { en: "Mute Jugnu", hi: "जुगनू को चुप करो" },
  jugnuListening: { en: "Listening…", hi: "सुन रहा हूँ…" },
  flagChat: { en: "Not happy with this chat? Flag it", hi: "यह बातचीत ठीक नहीं लगी? बताओ" },
  flagNote: { en: "What went wrong? (optional)", hi: "क्या गड़बड़ हुई? (चाहो तो लिखो)" },
  flagSend: { en: "Flag", hi: "भेजो" },
  flagCancel: { en: "Cancel", hi: "रहने दो" },
  flagged: {
    en: "Thanks, we'll look at this chat.",
    hi: "धन्यवाद, हम यह बातचीत देखेंगे।",
  },
  flagFailed: { en: "Couldn't send the flag. Try again?", hi: "भेज नहीं पाए। फिर से कोशिश करें?" },
  closeJugnu: { en: "Close Jugnu", hi: "जुगनू बंद करो" },
  menu: { en: "Settings", hi: "सेटिंग" },
  hearAgain: { en: "Hear again", hi: "फिर से सुनो" },
  voice: { en: "Voice", hi: "आवाज़" },
  sounds: { en: "Sounds", hi: "ध्वनियाँ" },
  audioUnavailable: {
    en: "Audio unavailable · tap to try again",
    hi: "आवाज़ नहीं चली · फिर से सुनने के लिए दबाओ",
  },
} as const satisfies Record<string, Localized>;
export type UiTextKey = keyof typeof UiText;

export function t(locale: Locale, key: UiTextKey): string {
  return UiText[key][locale];
}
