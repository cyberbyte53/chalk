# @chalk/server

The one server: the API the app talks to, Jugnu (each turn thought through here on a copy of the board; the model's key never reaches a phone), and the built app. Hono on Node, Postgres through Drizzle.

May import: `@chalk/api`, `@chalk/content`, Node, `hono`, `@hono/node-server`, `drizzle-orm`, `postgres`, `google-auth-library`, `zod`.

## Routes

| Route | Who | Does |
|---|---|---|
| `POST /api/sign-in/google` | anyone | `{ credential }` from Google's button → checked with Google, account found or added, sign-in cookie set; replies like `/api/me` |
| `POST /api/sign-out` | anyone | ends this device's sign-in |
| `GET /api/me` | signed in | the account, its groups (teaching or joined) |
| `POST /api/me/setup` | signed in, once | `{ name, schoolCode, role }` |
| `POST /api/join` | learner | `{ code }` → in the group (again, if they'd been removed) |
| `POST /api/events` | set up | a batch of events (up to 200); each checked on its own; one sent twice is kept once |
| `GET /api/groups`, `POST /api/groups` | teacher | their groups; a new one for `{ courseId }` (a book id in `build/index.json`) |
| `GET /api/progress` | learner | their progress, from their events (`progressFrom`) |
| `GET /api/groups/:id` | its teacher | the group and its learners: when each was last active, and their progress |
| `POST /api/groups/:id/code` | its teacher | a new join code; the old one stops working |
| `DELETE /api/groups/:id/learners/:id` | its teacher | removes a learner (their history stays) |
| `POST /api/jugnu/turn` | set up | one of Jugnu's turns: the board, its state, the chat, what happened, what the student did → the cues to play and the chat to keep; at most `JUGNU_TURNS_PER_HOUR` per person; each turn's model use (cached tokens included) is logged |
| `POST /api/jugnu/flags` | set up | keeps a chat someone flagged; `pnpm --filter @chalk/server flags [id]` lists them or writes one to a file |
| `GET /api/health` | anyone | the database answers |

Errors are `{ error, message }` with an `ApiErrorCode`. Anything but GET must come from `ORIGIN`. Another teacher's group is simply not found.

## Running it

Settings come from the environment (see `src/config.ts`): `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `ORIGIN`, and optionally `PORT`, `STATIC_DIR`, `CONTENT_INDEX`, `JUGNU_MODEL_SERVER`, `JUGNU_API_KEY`, `JUGNU_MODEL`.

```sh
pnpm --filter @chalk/server dev                       # watches src/
DATABASE_URL=… pnpm --filter @chalk/server add-school "Sunrise Public School"   # prints its code
```

Migrations are applied on start. After changing `src/schema.ts`, run `pnpm --filter @chalk/server migration` and commit what it writes to `drizzle/`.

Tests (`src/app.test.ts`) run every route on PGlite (Postgres in WebAssembly), with Google and the model server faked.
