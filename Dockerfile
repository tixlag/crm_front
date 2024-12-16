

ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --link . .
COPY .env.prod ./.env.prod
RUN pnpm run build


# Run
FROM base

ENV PORT=$PORT
ENV NODE_ENV=production

COPY --from=build /app/.output /app/.output
COPY --from=build /app/.env.prod ./app/.env.prod

#FROM base
#COPY --from=prod-deps /app/node_modules /app/node_modules
#COPY --from=build /app/dist /app/dist
EXPOSE 3000
# Optional, only needed if you rely on unbundled dependencies
# COPY --from=build /src/node_modules /src/node_modules

#CMD [ "pnpm", "start" ]
# В продакшене
CMD [ "node", ".output/server/index.mjs" ]
