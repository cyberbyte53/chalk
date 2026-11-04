# Jugnu's voice: listen and speak

Status: built (2026-11-04), after review.

## From first principles

Voice is two small jobs, each behind an interface the chat uses and nothing else does; text stays
the meeting point (the events, the judge, the teacher's view read words). This is the cascade most
voice agents are built as (speech to text, the model, text to speech, each swappable).

- **Listen**: `listen({ locale, onWords, onEnd })` hears the student, giving the words as they come
  (partial) and the final text; it returns `stop()`.
- **Speak**: `speak({ text, locale, onEnd })` says it, sentence by sentence; it returns `stop()`.
  Listening, or any new message, stops it (interruption).

Streaming and stopping are in the interfaces from the start, so a better voice (a server's speech to
text and text to speech) is another implementation of the same two, and the chat doesn't change. A
true speech-to-speech model would change Jugnu's turn itself (streaming, barge-in): its own step.

## The first implementations: on the device

- **Listen**: the browser's speech recognition (Web Speech API; Chrome on Android, Safari on
  iPhone), `en-IN` or `hi-IN` by the lesson's language. Where there is none, no mic.
- **Speak**: the browser's speech synthesis, a voice for the language if the device has one.
- Note before real students: in Chrome, recognition is Google's servers (a child's voice goes to
  Google): for the privacy wording, or a server's speech to text later.

## In the chat

- The send button is a **mic** while the box is empty, **send** once there is text. Tap the mic,
  speak; the words fill the box as heard; they can fix a word, then send. Tap again to stop.
- **Jugnu speaks his replies** when the voice is on (the app's existing Hear Jugnu / Mute Jugnu;
  muted: text only). His face shows he is speaking. A tap on his face, the mic, or sending stops him.
- Only the live chat speaks; a run seen in the preview doesn't.

### Where (after review: reuse, not new files)

- **Listen** is the player's existing `useSpeech` (`sound/speech.ts`), now with partial words
  (`onWords`), only on a secure page (Chrome gives the mic only on https or this computer: on the
  phone over Wi-Fi, no mic until chalk1), and a refusal or silence resets the mic.
- **Speak** is the board's own voice (`useVoice` in `sound/voice.ts`: `speak` / `hush`), so Jugnu
  and the board's lines never talk over each other; muted (`isMuted.voice`), he isn't spoken at
  all. A better voice replaces what those two use inside; the chat doesn't change.
- Nothing in Jugnu, the server or the events changes.

## Checked

In the browser, with the device's voices stood in: his reply is spoken; muted, nothing; the mic
fills the box as heard (partial, then final), then send; tapping his face mid-line stops him.
Player tests pass. Not yet on a real phone.
