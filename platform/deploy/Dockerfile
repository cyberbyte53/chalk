# The app and the server in one image, built on the box (x86), from the repo root:
#   docker compose --env-file .env -f platform/deploy/compose.yml build
FROM node:22-slim AS build
# The pnpm that wrote pnpm-lock.yaml (lockfile 6.0); corepack would fetch package.json's pnpm 10,
# which can't read it.
RUN npm install -g pnpm@8.8.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# What the app needs when it is built (Vite reads them; none of them is a secret).
ARG GOOGLE_CLIENT_ID
ARG JUGNU_PROVIDER
ARG JUGNU_MODEL
ARG JUGNU_THINK
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID JUGNU_PROVIDER=$JUGNU_PROVIDER JUGNU_MODEL=$JUGNU_MODEL JUGNU_THINK=$JUGNU_THINK
RUN pnpm build-content && pnpm --filter @chalk/learner-app build

FROM node:22-slim
WORKDIR /repo
COPY --from=build /repo /repo
ENV NODE_ENV=production \
    PORT=8080 \
    STATIC_DIR=/repo/platform/apps/learner/dist \
    CONTENT_INDEX=/repo/build/index.json
WORKDIR /repo/platform/apps/server
EXPOSE 8080
CMD ["node_modules/.bin/tsx", "--tsconfig", "../../../tsconfig.base.json", "src/main.ts"]
