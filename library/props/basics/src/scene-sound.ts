import { Effect, type Localized } from "@chalk/content";
import type { SoundView } from "@chalk/player";
import { AnswerStatus } from "@chalk/prop";

/**
 * How the words and questions sound (platform/docs/sound.md), beside how they look: a text says its
 * words, a question its prompt, when it appears, unless the lesson gives other words; a question
 * answered sounds right or wrong.
 */
export const textSound: SoundView = { line: (view) => view.text as Localized };
export const questionSound: SoundView = {
  line: (view) => view.prompt as Localized,
  // At the check itself: right or wrong is heard first, then anything said about it (its note).
  effects: {
    checked: (told) =>
      told.status === AnswerStatus.Correct
        ? Effect.Correct
        : told.status === AnswerStatus.Wrong
          ? Effect.Wrong
          : undefined,
  },
};
