# =============================================================================
# Lumeo Backend — Production Dockerfile (PHP-FPM + Nginx)
# =============================================================================

# ---- Stage 1: Composer dependencies ----
FROM composer:2 AS vendor
WORKDIR /app
COPY back/composer.json back/composer.lock back/symfony.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# ---- Stage 2: Node assets build ----
FROM node:20-alpine AS assets
WORKDIR /app
COPY back/package.json back/package-lock.json ./
# @symfony/ux-turbo references file:vendor/symfony/ux-turbo/assets
COPY --from=vendor /app/vendor/symfony/ux-turbo/assets ./vendor/symfony/ux-turbo/assets
RUN npm ci
COPY back/assets ./assets
COPY back/webpack.config.js back/postcss.config.mjs ./
RUN npm run build

# ---- Stage 3: PHP-FPM runtime ----
FROM php:8.2-fpm-alpine AS php

# System deps
RUN apk add --no-cache \
    icu-dev libpq-dev libzip-dev zip unzip \
    && docker-php-ext-install intl pdo_pgsql opcache zip \
    && docker-php-ext-enable opcache

# PHP production config
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/back/php.ini /usr/local/etc/php/conf.d/99-lumeo.ini

WORKDIR /var/www

# Copy application code
COPY back/ .

# Ensure .env exists (gitignored, but Symfony Dotenv requires it)
RUN touch .env

# Copy vendor from stage 1
COPY --from=vendor /app/vendor ./vendor

# Copy built assets from stage 2
COPY --from=assets /app/public/build ./public/build

# Provide dummy env vars needed by Symfony during cache warmup
ENV APP_ENV=prod \
    APP_SECRET=build-time-secret \
    DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?serverVersion=16" \
    MERCURE_URL="http://localhost/.well-known/mercure" \
    MERCURE_PUBLIC_URL="http://localhost/.well-known/mercure" \
    MERCURE_JWT_SECRET="build-time-mercure-secret" \
    JWT_SECRET_KEY="%kernel.project_dir%/config/jwt/private.pem" \
    JWT_PUBLIC_KEY="%kernel.project_dir%/config/jwt/public.pem" \
    JWT_PASSPHRASE="build-time" \
    MESSENGER_TRANSPORT_DSN="doctrine://default?auto_setup=0" \
    MAILER_DSN="null://null" \
    STRIPE_SECRET_KEY="sk_test_dummy"

# Run Symfony post-install scripts (cache warmup, etc.)
RUN php bin/console cache:clear --env=prod --no-debug \
    && php bin/console assets:install public --env=prod --no-debug \
    && chown -R www-data:www-data var/

EXPOSE 9000

# ---- Stage 4: Nginx sidecar ----
FROM nginx:1.27-alpine AS nginx

COPY docker/back/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=php /var/www/public /var/www/public

EXPOSE 80
