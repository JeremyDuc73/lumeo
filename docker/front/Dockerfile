# =============================================================================
# Lumeo Frontend — Production Dockerfile (Nuxt 3 SSR)
# =============================================================================

# ---- Stage 1: Build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY front/package.json front/package-lock.json ./
RUN npm ci

COPY front/ .

# Build-time env vars (overridable via --build-arg)
ARG NUXT_PUBLIC_API_BASE=https://api.lumeo.app/api
ARG NUXT_PUBLIC_MERCURE_HUB=https://mercure.lumeo.app/.well-known/mercure
ARG NUXT_PUBLIC_SERVER_BASE=https://api.lumeo.app
ARG NUXT_PUBLIC_STRIPE_PUBLIC_KEY=

ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_MERCURE_HUB=$NUXT_PUBLIC_MERCURE_HUB
ENV NUXT_PUBLIC_SERVER_BASE=$NUXT_PUBLIC_SERVER_BASE
ENV NUXT_PUBLIC_STRIPE_PUBLIC_KEY=$NUXT_PUBLIC_STRIPE_PUBLIC_KEY

RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy only the built output
COPY --from=build /app/.output ./.output

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
