# @chalk/learner-app

The learner app, for now a dev shell: lists every **published** lesson in `content/**/published/`, plays it with `@chalk/player` (with its audio, if published with `--voice`), and shows the events it emits (bottom-right button).

`pnpm dev` from the repo root, then open the printed URL (phone-width works best).

## Jugnu

The "Ask Jugnu" button shows on boards with a question. Jugnu runs on a hosted model that can call tools; DeepSeek Flash by default:

1. Copy `.env.example` to `.env` and put your DeepSeek key in `JUGNU_API_KEY` (or point it at a Microsoft Foundry deployment; the file shows how).
2. `pnpm dev`.

The browser only talks to `/jugnu-model` on the dev server, which passes it on and adds the key, so the key never reaches the browser. `JUGNU_PROVIDER=ollama` runs a local model instead (slow on a laptop); `JUGNU_PROVIDER=off` hides the button.

In the chat he can act on the board, make part of it glow, and hand it back ("your turn"): the chat shrinks to his last words, and when you act on the prop he's watching he looks and goes on by himself.
