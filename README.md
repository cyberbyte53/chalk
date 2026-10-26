# Chalk

Interactive lessons built from props, and Jugnu, an AI tutor (an agent on the board, on a hosted model). First target: NCERT Class 9 Maths, Chapter 1, in Hindi and English.

```bash
pnpm install
pnpm dev        # the learner app at http://localhost:5173 (phone width), already signed in
                # (needs .env from .env.example and Postgres at DATABASE_URL)
pnpm check      # typecheck, tests, validate content, layer boundaries, lint
```

Three layers, importing one way (`pnpm boundaries`):

- `content/` — the books (book → chapter → lesson), [authoring/taste/](authoring/taste/README.md) is the taste
- `library/` — props and board patterns shared across books
- `platform/` — the fixed code: packages, apps, studio tooling, deploy, [docs](platform/docs/README.md)

- The model: [platform/docs/board-model.md](platform/docs/board-model.md)
- Map of the repo: [platform/docs/architecture.md](platform/docs/architecture.md)
- Names: [platform/docs/glossary.md](platform/docs/glossary.md)
- Conventions: [platform/docs/code-conventions.md](platform/docs/code-conventions.md)

The previous codebase is parked in `tmp/old` (not tracked) for reference.
