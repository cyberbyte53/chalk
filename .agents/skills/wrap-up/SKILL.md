---
name: wrap-up
description: At the end of a working chat on content (or when the person says "wrap up"), find what the person corrected that could happen again, and propose the smallest lasting change to content/taste/ for each. The person approves each line before anything is written. Use whenever a session had corrections, before the chat is closed.
---

# Wrap up a chat

Most corrections are one-offs, already fixed in the files. A few are patterns: the next agent would make the same mistake. Capturing those is how the work gets better without the person repeating themselves. Capturing too much is how the taste files rot, so be strict.

## Steps

1. **List the corrections** from this chat: every place the person said no, changed what you made, or explained what they wanted. Quote each in a few words.
2. **Sort each one.**
   - **One-off:** about this board or this question only. Drop it; the fix is already in the files.
   - **Pattern:** the same mistake could come up on another board, lesson or chapter.
   - **Unsure:** ask the person.
3. **For each pattern, find its smallest home**, in this order. Take the first that works:
   1. a **check** the build or `render_board` can run (write it, or add it to the Proposed table in `content/taste/checks.md`);
   2. an **exemplar**: the board or file you just fixed becomes the example in `content/taste/exemplars.md`;
   3. an **edit to an existing line** in the stage guide for that step (`content/taste/guides/…`);
   4. a **new line** in that guide, one sentence, naming the case it came from;
   5. a **constitution** change, only if it is about why we teach the way we do. It must replace or merge an existing principle; there are always 12.
4. **Check before proposing.** Read the file you would change. If a line already says it, the agent ignored it: make that line sharper or turn it into a check rather than adding another. If it contradicts a line, show both and let the person choose.
5. **Propose, as one short list:** each correction → where it goes → the exact before/after text. Also look at the last few notes in `runs/`: if one of these corrections appeared there before, say so; a repeated correction should become a check.
6. **Write only what the person approves.** Then append `runs/<YYYY-MM-DD-HHMM>-wrap-up.md` to the chapter you worked on: what was captured and where, and what was dropped as a one-off.

## Don't

- Don't turn a remark about one question into a rule for every chapter.
- Don't add a line when a check or an example can carry it.
- Don't save anything without the person's yes.
