# Jugnu's sandbox: runs on a board, with seats

Status: proposed (2026-11-04), reviewed once and revised. Builds on jugnu-agent.md (the loop, the model layer,
the conditions) and its experiments page (`?dev&jugnu`).

## The need

To make Jugnu good we change one thing (his model, his instructions, the student, the board) and
see exactly what happens, on the board it happens on. Today a run's test sits in a separate file
(jugnu-cases.yaml), its models come from `.env`, runs are reached from a separate page, and reading
one well takes me, by hand.

## One idea: a run is a conversation on a board, with seats

- **The board**: where the student is stuck: the board, the steps they took, what they ask.
- **Three seats**, each swappable, each recorded with the run:
  - **student**: who they are (their belief, what else they know) and the model playing them;
  - **tutor**: Jugnu: his model and his instructions (a named version);
  - **judge**: a model that reads the finished run and marks it against the checklist.
- **A run belongs to its board** and is named by when it ran (`<time>`, unique to the second), kept
  under the board: everything in it, to read afterwards. Live watching stays, as a bonus.

Default seats: Claude Haiku 5.5 in all three (testing is meant to be cheap). Any seat can be another
model (DeepSeek Flash, Sonnet) from the same model layer.

## Every seat's instructions, seen

Measurement first: a run is only understood if what each seat was told is seen. Each run keeps,
word for word, every seat's instructions (Jugnu's, the student's, the judge's), its model and
settings, and the lesson Jugnu was given; the run's page shows them above its turns. An instruction
text is named by a short hash of its words, so two runs show at a glance whether a seat was told the
same thing. Each is kept in one place (a file per seat's instructions), so changing a seat's instructions
is one visible edit.

## One Jugnu (the person, 4 Nov: no double coding)

Jugnu is one module, the one production uses: given his conversation so far, the student's board and
their latest turn, it returns his reply (his prompt chosen by name, his tools, his model from
settings, what he sees). It knows nothing of simulations. The sandbox only drives him: the simulated
student in the other seat, the judge reading afterwards, storage and the page. Production's server
calls the same function with a real student's board and words. Today his turn is written inside the
sandbox's dialogue code: step 1 takes it out.

## Prompts are files, chosen by name (the person, 4 Nov)

Tools get better in place (one version); prompts are what we test, so they have versions side by
side. `platform/studio/prompts/<seat>/<name>.md`, a folder per seat (`tutor/`, `student/`, `judge/`),
each version one file with a short name of our choosing (`tutor/ask-first.md`); what varies per run
(the student's belief, what they know, their class) is a slot, `{believes}`. A version is never
edited once a run has used it: a changed prompt is a new file, so a name always means one text (the
hash in the run checks it). Which version a seat uses is configuration: a setting per seat
(`JUGNU_PROMPT`, `JUGNU_STUDENT_PROMPT`, `JUGNU_JUDGE_PROMPT`) for the default and production, and
the page's seat picker for a run. The code holds no prompt text.

## The judge

Reads one finished run (the board, every turn of both sides, the student's hidden belief) and marks:

- each of Jugnu's messages: gives the answer (where things end up, or the steps); reads the board
  for the student; more than one question, or over ~30 words; repeats something he said;
  untrue about the board; glow not about what he says;
- the run: did he find the belief (his note against the hidden one); did he hand back, and when;
  did the student do the next question alone;
- the student: did they act by their one belief and only it (a run where they didn't is marked).

Each mark is short, with the words it is about. It is a highlighter for reading, not a score: its
marks are checked against the person's own reading on a few runs before they are trusted.

## Seeing it, in the editor preview

The preview frames the app's own pages, so this is the same app:

- **A question board's preview** shows its runs (newest first: when, seats, how it ended, the
  judge's marks counted) and a **Run** button: pick the case (her steps and question) and the seats,
  run; it opens as it goes.
- **A run** shows, turn by turn: the board after each move, each message, each side's thinking,
  Jugnu's tries and what they showed, his note, the judge's marks beside the message they are about;
  and above, the seats and instructions it ran with.
- **Two runs side by side**, where one seat differs.

## Cases and students move to the board

A board's cases (the student's steps and question) and its students (belief, knows) are kept with
the board, so its preview finds them. Where: next to the board's source, or one file per chapter
keyed by board (today's jugnu-cases.yaml, its lines found by board): the review decides.

## Not now

The person in the student seat (talking to Jugnu themselves on a board); comments on Jugnu's
messages as review threads; the judge as a gate on changes.

## Reviewed (4 Nov): what changed

- **The judge reads a run; it isn't a seat in it.** A run has two seats (student, tutor); a
  *reading* (the judge's model, its instructions' hash, its marks) is kept beside the run
  (`<run>.reading-<time>.json`), so one run can be read again by another judge or checklist.
- **What code can measure, code measures:** words per message, more than one question, repeats,
  a glow not on the board. The judge model gets only the judgement calls: gives the answer, reads
  the board for the student, found the belief, the student true to their belief. It reads a compact
  transcript (each message, the board as text at each turn, the hidden belief, the case's `about`,
  Jugnu's notes), and every mark quotes words exactly: a quote not found in the message is dropped.
  A different model can take the judge's place (Haiku judging Haiku is a bias risk).
- **A run records the board's build version** (every built item has one); a run whose board has
  been rebuilt since is flagged "board changed since", as its replay would draw wrongly.
- **Where runs live:** `.chalk-runs/<board path>/<time>-<short random>.json` (beside the existing
  `.chalk-seen/`, not committed: generated, large), not under node_modules (a reinstall wiped it).
- **Starting a run:** a POST with the board, case, student and seats returns the run's id at once;
  the page then follows it by id (no holding a request open for minutes, no guessing the new file).
- **Seats from the page carry only safe settings** (provider, model, thinking, effort); servers and
  keys stay on the server, keyed by provider, and the page offers only models the server can run.
- **Instructions:** the full text kept in the run, named by the first 8 characters of its hash;
  two runs compared by their text. No instruction editor.
- **Cases stay authored, one file per chapter** (approved like other planning files), matched by
  board path, found by searching `authoring/books/*/*/jugnu-cases.yaml`. Students (beliefs) belong to
  a concept more than one case: noted, kept per case for now.
- **In the preview:** a runs panel beside a question board (only `questions/` boards, one at a time,
  not with `&play` or `&shot`); no new key shortcuts; a run opens in the existing run view.

## Built in steps (each with its check)

1. Jugnu as one module (the sandbox only drives him); starting a run by POST (id at once);
   prompts as files per seat, chosen by name, hashed. Check: a run opens from its id, and shows all three texts.
2. Runs stored by board path with the board's version; cases found by board path. Check: an old
   case runs; rebuilding its board flags the run.
3. Seats from the page (defaults Haiku). Check: a run records DeepSeek as tutor, Haiku as student.
4. Code's measures, then the judge's reading. Check: every quote is found; marks agree with the
   person's own reading on 3 runs.
5. The preview's runs panel. Check: it shows on a question board, not on lessons.
6. Two runs side by side.
