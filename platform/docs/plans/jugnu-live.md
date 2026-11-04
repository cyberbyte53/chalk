# Jugnu, live on every board

Status: proposed (2026-11-04), for review.

## The loop

1. **One Jugnu, committed**: `platform/studio/prompts/jugnu.yaml` says which model and which prompt
   is Jugnu. That is what students get and what chalk1 runs. `.env` holds only keys and servers.
2. **Talk to him on any board in the preview**: a question board in the preview plays as a student
   meets it (guided practice), with his figure in the bar; get it wrong, press Get help, or tap him
   and ask anything. It is the real chat (JugnuChat), live.
3. **The sandbox stays the testing ground**: other models and prompts, simulated students, the judge;
   it defaults to the committed Jugnu.
4. **Then chalk1**: the same, behind sign-in, deployed over `ssh chalk1` once it works here.

## How

- **In the browser**: the board records its events as on a phone; the chat is drawn from them
  (chatOf). When it's Jugnu's turn the page sends the server what a phone will: the board's path,
  its state now, what the student did since last time (as steps), and what they said. The page
  records his reply as a `jugnu` event, and the chat's own events (opened, said, closed).
- **On the server**: one endpoint, `POST /jugnu/turn {session, board, state, did, said}`. It keeps each
  session's conversation (in memory, dev), restores the board from its state (as `try` does), builds
  the student's turn (firstTurn / laterTurn), runs `jugnuTurn` (jugnu.ts) with the committed Jugnu,
  and answers his reply. The key never leaves the server.
- **Dev first**: the endpoint in the studio service (as /dev-jugnu is), forwarded by the dev server.
  On chalk1 it moves into the real server behind sign-in, with a per-student limit; a session's
  events are kept as any run.

## Not now

Hindi replies; voice; the teacher's view of chats.

## Built in steps

1. `jugnu.yaml` and the endpoint. Check: a turn sent by hand comes back as his reply.
2. The preview's question boards play live with the chat. Check: on the laptop and on the phone
   (Wi-Fi), a wrong answer, Get help, a reply, a question typed, a hand-back.
3. chalk1. Check: the same on the phone over the internet, signed in.

## Step 3, chalk1 (2026-11-04)

- **Server**: `POST /api/jugnu/turn` in `apps/server` (app.ts), behind `signedIn` and `isSetUp`,
  at most 60 turns an hour per account (`rateLimit`), the same body as the dev endpoint. The
  session is prefixed by the account id (one account can't continue another's). The turn itself is
  injected (`AppDeps.jugnu`, from main.ts: `liveTurn` from `@chalk/studio/jugnu`), so the app's
  tests need no model; unset, the route answers 503.
- **Studio**: `package.json` exports `./jugnu` (live.ts); live.ts reads the repo's `.env` only if
  there is one (on the box the keys come from compose's `env_file`).
- **App**: `askJugnu` posts to `/api/jugnu/turn` when built, `/dev-jugnu/turn` in development;
  `app.tsx`'s LessonPlayer gets `askJugnu` (lessons and practice, as Play does).
- **Keys**: the `JUGNU_*` lines from the Mac's `.env` appended to the box's `.env` over ssh, never
  printed. The image already has the built content and `prompts/`.
- **Check**: tests and typecheck; `pnpm ship`; `/api/health` names the commit; on the phone, signed
  in, a lesson: his reply, spoken; the mic (https).
