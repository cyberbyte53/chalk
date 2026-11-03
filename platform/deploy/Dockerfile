# The app and the server in one image, built on the box (x86), from the repo root:
#   docker compose --env-file .env -f platform/deploy/compose.yml build
FROM node:22-slim AS build
# The pnpm package.json pins (packageManager), which wrote pnpm-lock.yaml.
RUN npm install -g pnpm@10.28.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# What the app needs when it is built (Vite reads them; none of them is a secret).
ARG GOOGLE_CLIENT_ID
ARG JUGNU_PROVIDER
ARG JUGNU_MODEL
ARG JUGNU_THINK
# The commit being shipped (ship.sh passes it; the image has no .git): written into
# build/index.json, baked into the app, served by /api/health and put on every event.
ARG COMMIT
RUN test -n "$COMMIT" || { echo "build with --build-arg COMMIT=<sha> (pnpm ship does)"; exit 1; }
ENV CHALK_COMMIT=$COMMIT
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID JUGNU_PROVIDER=$JUGNU_PROVIDER JUGNU_MODEL=$JUGNU_MODEL JUGNU_THINK=$JUGNU_THINK
RUN pnpm build-content && pnpm --filter @chalk/learner-app build

FROM node:22-slim
WORKDIR /repo
COPY --from=build /repo /repo
ARG COMMIT
ENV CHALK_COMMIT=$COMMIT \
    NODE_ENV=production \
    PORT=8080 \
    STATIC_DIR=/repo/platform/apps/learner/dist \
    CONTENT_INDEX=/repo/build/index.json
WORKDIR /repo/platform/apps/server
EXPOSE 8080
CMD ["node_modules/.bin/tsx", "--tsconfig", "../../../tsconfig.base.json", "src/main.ts"]
