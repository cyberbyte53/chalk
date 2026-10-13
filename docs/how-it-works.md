# How it works

The whole loop, end to end, with "Where does √2 live?" as the running example. Parts marked *(later)* aren't built yet.

```text
Author ─▶ Publish ─▶ CDN ─▶ Phone: lesson plays ─▶ events ─▶ Server ─▶ learner model
   ▲                                │  ▲                                    │
   │                                ▼  │                                    ▼
   └──── teacher view & content fixes ◀─── Jugnu (when stuck)      practice the next day
```

## 1. Write the lesson

You make "Where does √2 live?": four boards, Maya and Arjun's lines, the number line, two questions.

The lesson is a JSON file under `content/`. Each board places **props** (words, lines, the number line, a question) and wires them with three kinds of rule: **IS** (always true), **WHEN** (react to a signal) and **THEN** (a script). Boards and props have a **name** you choose (`guess`, `guessRoot`), which the rules use. Prop types come from the library. Studio's GUI comes later; for now an AI assistant can write the file against [board-model.md](./board-model.md).

## 2. Publish

You run `pnpm publish-lesson <file>`.

1. **Check:** the formats, every prop's contract (starting state, actions, arguments) and the wiring (IS, WHEN, scripts).
2. **Assign ids:** new boards and pieces get a permanent number from a counter. Names can change any time; ids never do.
3. **Protect ids:** compared with the last published version, deleted boards and pieces have their ids retired for good; a retired id can never come back.
4. **Version:** if anything changed, the version goes up (`0.1.0` → `0.1.1`), so every event says which version the learner saw. Every version is kept in `published/versions/<lesson>/`, never overwritten.
5. **Audio** (`--voice <provider>`): every line a script tells a prop to `say` is spoken once per language, in the voice set for its speaker in `content/voices.json`. What's shown and what's said can differ: screen text is turned into words by the pronunciation rules in `content/pronunciations.json` ("√2" → "square root of 2", "25°C" → "25 degrees Celsius"), and an author's `speak` line wins when given. The voice only ever gets plain words: any character no rule handles stops publish instead of being read out wrong. Files are named by what was said, so only new or edited lines are spoken again. A manifest maps each line (board id, piece id, language) to its file.
6. *(later)* **Bundle:** everything is packaged and uploaded to the CDN. Jugnu's server gets the prop definitions and a board index.

## 3. The learner opens the app

A new session starts. *(later)* The app reads the chapter manifest, downloads only files that changed (lesson, prop code, audio) and caches them.

The lesson player raises `lesson start`. The event backbone adds the envelope (session, `seq` 0, `producedAt`) and hands the event to its subscribers.

## 4. Board 1: "Where does √2 live?"

The title and Maya's line are read aloud, then Arjun's line appears and is read **while** the line glides from 0–4 down to 1–2. She taps **Continue**.

The runtime starts every prop through the **one door** and raises `board.started`. The board's rule answers it with a script: `board.pass` (Continue shows), `title.say`, `mayaSquares.say`, a short wait, `board.show arjunBetween`, then `arjunBetween.say` **with** `line.zoomTo(1, 2, over 2.5 s)`. Nothing is spoken unless the script says so. If a line's audio can't play, its text stays, a small "tap to try again" appears, and a `line audioFailed` event is raised. **Continue** is a commit: `board continue` with the number line's state at that moment.

## 5. Board 2: a wrong guess

She drags to 1.62 and taps **Check**: "Its square is more than 2. Move left."

Dragging calls the number line's `moveMarker` action and logs nothing. Under the line, a text prop shows "1.62 × 1.62 = 2.6244": its words are an IS rule over `line.marker`. The question's `isMet` is another IS (`1.98 <= line.marker * line.marker <= 2.02`), so **Check** judges on the phone and raises the commit `question check { submitted: the line, marker 1.62 } → { status: wrong, attempts: 1 }`. The question's `wrong` signal meets a WHEN rule (`if line.marker * line.marker > 2.02`) that shows the hint.

## 6. Stuck: Jugnu

*What exists now:* on a board with a question, an "Ask Jugnu" button opens his chat. He is an agent: each step his model (DeepSeek Flash by default; see `apps/learner/.env.example`) gets the whole board as data (every prop's state, the question included, the lesson's IS and WHEN rules, everything that happened) and answers in words or with tools: one of the board's actions (through the same door as the lesson), pointing at a part (it glows), the calculator, or handing the board back. He sees what each tool did and goes on, up to six steps. When he hands back, the chat shrinks and he watches; when she acts on that prop, he looks and goes on. The runtime keeps him from answering the question, passing the board or doing her `studentOnly` actions, and a move of his that would put the board into the answer is put back. Each turn is one event: `jugnu ask { text } → { reply, steps, watching, model }`. Not yet: speech, the Slate, her mastery in his context. The rest of this section is where it's going.

She taps Jugnu and says "why is it wrong, it's between 1 and 2". He highlights 1.4–1.5 on her line and asks what 1.5 × 1.5 is.

- `chat open`. The phone sends the board's live state, her last attempts and her mastery; each prop's menu (generated from its definition) goes once per chat.
- Her voice becomes text (she can fix it before sending): `chat send`.
- On the server, the model gets tools generated from the props' definitions (point at a part, call an action), limited to what is on the board right now; answer-revealing actions are hidden while a question is open. It calls `point(board/line/tick:1.4)`; the phone draws the glow on the overlay layer.
- His reply streams back as text and speech (`chat reply`); his face shows Thinking, then Curious.
- While the chat is open the board is paused; she closes it (`chat close`) and the board is restored and carries on.

## 7. She gets it

She drags to 1.41 and checks: correct. `question check { submitted: 1.41 } → { status: correct, attempts: 2 }`, marked as helped once Jugnu exists.

## 8. Boards 3 and 4, then done

`board continue` after the zoom (the script ends by placing a labelled √2 on the line). On the quiz she picks "√2 = 1.41 exactly": wrong (the option carries the misconception `rootIsFiniteDecimal`), then right on attempt 2. `lesson complete`.

## 9. Upload *(later)*

Every few seconds the uploader (just another subscriber) takes a batch from the queue on the phone, sends shared fields once, gzips it and posts it. The server checks every event's shape, drops duplicates by id, appends to the event table and acknowledges; the phone then clears that batch. Offline, events wait on the phone.

## 10. The learner model *(later)*

On the server, the learner model reads the log and counts only the learner's own first attempts:

- board 2, attempt 1 wrong → `sqrt-estimation` goes down a little;
- board 4, attempt 1 wrong with `rootIsFiniteDecimal` → `irrational-numbers` goes down, and the misconception is noted;
- correct second attempts are practice, not evidence.

The practice queue schedules an irrational-numbers question for two days later.

## 11. Two days later *(later)*

Her Practice tab shows "Is 3.14 exactly π?". Right first time: mastery goes up (it counts as mastered only after correct answers on separate days).

## 12. The teacher *(later)*

The teacher view shows 12 of 30 picked "√2 = 1.41 exactly". You project the zoom board in class. It reads the same event log, grouping `check` events by question and misconception.

## 13. Fixing content

Most kids still guessed wrong on board 2 after the hint, so you rewrite it and publish again (`0.1.2`). Ids stay the same, only the wording changes. Old events say the old version, so you can compare whether the new hint works better.
