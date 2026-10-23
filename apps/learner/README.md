# @chalk/learner-app

The app learners and teachers open on their phones: one PWA, served by `@chalk/server` from the same address as the API.

**A learner:** Continue with Google → setup once (name, school code, student) → add a teacher with the class's code (or open a join link, `/join/<code>`) → home (carry on where you were, your courses) → a chapter's path → a concept's pages → its practice → the result → the next concept, and the chapter's end once all are done. **A teacher** (on their phone too): setup as a teacher → their groups → a new group for a course (Chalk makes the join code) → a group: its code, a share button for the join link, a new code, how many finished and haven't started, the weakest concept, and every learner's concepts as squares (most behind first) → one learner: each concept's practice score, and removing them.

- `src/app.tsx`: who's signed in and which screen is showing.
- `src/account-screens.tsx` (welcome, setup, add a teacher), `src/home-screen.tsx`, `src/course-screens.tsx` (a course's chapters, a chapter's path), `src/practice-screens.tsx` (result, chapter's end), `src/teacher-screens.tsx` (groups, new group, a group, a learner; a square's colour is `src/concept-mark.ts`). Their words are in `src/app-text.ts`, in English and Hindi.
- `src/api-client.ts`: the server's routes, every reply parsed with `@chalk/api`'s schemas.
- `src/uploader.ts`: every event goes into the phone's IndexedDB first and is sent in batches (every 30 s, when back online, when the app goes to the background), so nothing is lost offline.
- `src/built-content.ts`: each concept in `build/` as two lessons: its pages (`concept/<id>`) and practice on its questions (`practice/<id>`). Progress is worked out from those lessons' events (`progressFrom` in `@chalk/api`), on the phone and on the server alike.
- `src/google-button.tsx`: Google's own sign-in button (Google Identity Services).

It is a PWA (`vite-plugin-pwa`): it installs to the home screen, and once opened it works offline. The app, its fonts and every concept (bundled in the JS) are cached, the last sign-in and progress are kept on the phone, and events wait in IndexedDB. A new version is fetched in the background and used from the next open. Icons are in `public/`.

Fonts (Baloo 2) are bundled; styles load in order: `@chalk/look`, the player's, the library's, the app's.

## Running it

1. Copy the repo's `.env.example` to `.env` (one file for the app and the server) and fill it in.
2. A local Postgres matching `DATABASE_URL`, and a school: `pnpm --filter @chalk/server add-school "Test School"` prints its code.
3. `pnpm dev` from the repo root runs the server and Vite together; open http://localhost:5173 (phone width works best). Vite passes `/api` and `/jugnu-model` on to the server.

With `DEV_SIGN_IN=on` (localhost only) the welcome screen also signs in by name, without Google. In development, `?dev` opens the old shell (every published lesson, the events as they happen) and `?screens` shows the result and chapter-end screens with made-up scores.

## Jugnu

Jugnu's button sits in every board's footer, left of Continue. He runs on a hosted model that can call tools (DeepSeek Flash by default; `.env` shows Microsoft Foundry and Ollama). The app only ever calls `/jugnu-model` on its own server, which adds the key and the model, so neither reaches a phone. `JUGNU_PROVIDER=off` hides the button.

In the chat he can act on the board, make part of it glow, and hand it back ("your turn"): the chat shrinks to his last words, and when you act on the prop he's watching he looks and goes on by himself.
