# Voice off, downloads by lesson, the bar at the bottom

Status: built (2026-11-03). From the person's test on a phone.

Three changes to the player, each a rule that changes, not a fix to a case.

## 1. Voice off: a line is done as soon as it is shown

**Today.** A line takes its clips' length on the board's clock: the board waits for the voice to
say "ended" (`runtime.ts:174-192`), and the next line, a piece shown after it, the lines on
`board.said` and `onSaid` rules wait on that. Muting is only the volume (`engine.ts:127-142`), so
with the voice off the board still waits through silence, and the piece being read still glows
(`is-spoken`, `runtime.speakingAbout`). `sound.md` says so on purpose: "Muted, the board keeps its
pacing."

**The rule.** A line is done when the child has had it: heard, with the voice on; shown, with it
off (they read at their own pace). So **voice off is a voice that ends every line the moment it
starts**, in the same instant (inside `voice.say`, as `board.ts` already allows: a line that ends
there leaves no breath, so a run of lines takes no time; an end sent later would still add the
0.7 s breath between lines). A muted line fetches nothing first (`prepare` is skipped). Then,
with nothing else changed:

- what waits on a line happens at once;
- nothing glows: the glow is only while a line is in progress;
- the voice switched off mid-line ends that line now: the runtime watches the switch, reports the
  line ended, then stops its sound (today a hush makes the line wait out its length);
- switched on, the next line is heard as usual;
- replay stays exact: the record has each "ended" with its board time.

Law tests: a muted session replayed equals the session; a chain of lines that end at once (a line
said again from `onSaid`) stops at the queue's limit and names its path, as any loop does.

**Sounds off** follows the same rule: an in-turn sound (a wrong answer's buzz) that isn't heard
holds nothing (`heldUntil` is set only when sounds are on).

**Docs.** `sound.md` ("Muted is only the volume", "Muted, the board keeps its pacing") and
`one-clock.md` ("who reports ended": a muted phone, at once) say this rule.

## 2. Downloads: the lessons the child opens, in their language, as they use them

**Today.** Opening a chapter fetches its 75 board files (38 KB) and then **every clip in both
languages (650 clips, 32 MB)** before it opens (`content-store.ts:81-131`,
`chapter-gate.tsx:55-73`); the counter counts only the 75. Yet the player already fetches a clip
when its line plays (`engine.prepare`); the download ahead is only for playing offline.

**The rule.** Wait only for what the first board needs; fetch the rest ahead in the order it will be
needed; keep everything fetched.

- **Boards**: a chapter's files, at once, as today (small). The chapter opens when they are in;
  the counter counts what it waits for.
- **Sound**: per lesson (a concept: its pages, practice, bank), in the child's language. Once the
  lesson's first board has started (so its own clips come first), its clips are fetched in the
  background in order of first use, then the next lesson's (the next in `chapter.concepts`). Switching
  language does the same in the new language. A line whose clip isn't in yet is fetched as it
  plays (as now). Downloaded whether the voice is on or off (it can be switched on any time).
- **Offline**: what was fetched is kept (the service worker's cache, as now); a line whose clip was
  never fetched falls back as today (the phone's voice, else the words on screen).

**Build.** The chapter's one sound list (`sound.json`) says, for each clip, the **boards** that use
it (the build lists clips board by board already, `make.ts:100`); the app groups boards into
lessons itself (`conceptLessons`), so the list needn't know what a lesson is. The list still comes
before a board starts (a line's length is read from it), as now. Still one list per chapter: review reads it as before. `sound.md`'s "The chapter is
the unit" becomes this rule.

## 3. The bar at the bottom

**Today.** The board's footer (← back, Check / Try again / Continue, the right/wrong banner) is the
last thing on the page, and the whole page scrolls (`board.css:27-34`, `lesson.css:5-13`), so on a
tall board it is below the fold.

**The rule.** The bar is how a child moves on, so it is always on screen: **pinned to the bottom
while it has something in it** (`position: sticky` on the footer, which stays in the page's flow,
so nothing hides behind it; with its own background; not drawn when it has nothing in it). It
holds ← back, **Check**, Try again, Continue, and Jugnu's button when he comes; the banner rises
from it as now. **Check moves into the bar**: today a question draws its own Check inside the board
(`basics/views.tsx`), where a tall board scrolls it away. A question says it can be checked (its
`canCheck`), and the bar shows Check for it, as it shows Try again and Continue. A prop's own
controls (the bus's ← →, Riya's arrows) are the board's, and scroll with it. Works where the page
scrolls (the app) and where a frame does (the dev phone frame).

**And:** with Continue always in reach, a piece revealed by the child's own act is scrolled into
view when it appears (`block: nearest`, with a margin the bar's height), so a child doesn't press
on past a box shown below the fold; the opening's own reveals don't scroll, so it never fights the
child's scrolling. Where a piece goes from hidden to shown (`layout.tsx`). The banner (about
150 px at 360×640) scrolls the answer just given above itself the same way.

## Checking

- Voice off: a board played to its end takes no longer than its taps (the bus board: its moves
  only); nothing glows; voice switched off mid-line ends it; on again, the next line is heard.
  Law tests in the board for the instant voice; replay of a muted session equals the session.
- Downloads: on the box, a chapter opens in about a second; the first board's lines are heard;
  the network shows one lesson's clips in one language; the next lesson's after; switching
  language fetches the other's; offline, an opened lesson plays.
- The bar: on 360×640 and 390×844, a tall board's bar stays at the bottom while it scrolls; a
  revealed box is scrolled to; a board with nothing in its bar shows none.
- Then the quick set, then the full check, before a commit; then ship and the person's phone.

## Not here

The logo (the learning curve): its own change, after this.
