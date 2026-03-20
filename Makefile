# =============================================================================
# Lumeo — Makefile (convenience commands)
# =============================================================================

.DEFAULT_GOAL := help
COMPOSE        = docker compose
COMPOSE_PROD   = docker compose -f docker-compose.prod.yml
EXEC_PHP       = $(COMPOSE) exec back-php
EXEC_FRONT     = $(COMPOSE) exec front

# ---- Colors ----
CYAN  = \033[36m
RESET = \033[0m

## ==================== Dev ====================

.PHONY: up
up: ## Start all services (dev)
	$(COMPOSE) up -d --build

.PHONY: down
down: ## Stop all services
	$(COMPOSE) down

.PHONY: restart
restart: down up ## Restart all services

.PHONY: logs
logs: ## Tail logs
	$(COMPOSE) logs -f

.PHONY: ps
ps: ## Show running containers
	$(COMPOSE) ps

## ==================== Backend ====================

.PHONY: back-sh
back-sh: ## Shell into the PHP container
	$(EXEC_PHP) bash

.PHONY: composer
composer: ## Run composer command (e.g. make composer c="require foo/bar")
	$(EXEC_PHP) composer $(c)

.PHONY: migrate
migrate: ## Run Doctrine migrations
	$(EXEC_PHP) php bin/console doctrine:migrations:migrate --no-interaction

.PHONY: diff
diff: ## Generate a migration diff
	$(EXEC_PHP) php bin/console doctrine:migrations:diff

.PHONY: fixtures
fixtures: ## Load data fixtures
	$(EXEC_PHP) php bin/console doctrine:fixtures:load --no-interaction

.PHONY: cache-clear
cache-clear: ## Clear Symfony cache
	$(EXEC_PHP) php bin/console cache:clear

.PHONY: jwt-keys
jwt-keys: ## Generate JWT key pair
	$(EXEC_PHP) php bin/console lexik:jwt:generate-keypair --skip-if-exists

.PHONY: test-back
test-back: ## Run PHPUnit tests
	$(EXEC_PHP) php bin/phpunit

## ==================== Frontend ====================

.PHONY: front-sh
front-sh: ## Shell into the Node container
	$(EXEC_FRONT) sh

.PHONY: lint
lint: ## Lint frontend
	$(EXEC_FRONT) npm run lint

.PHONY: lint-fix
lint-fix: ## Lint & fix frontend
	$(EXEC_FRONT) npm run lint:fix

.PHONY: typecheck
typecheck: ## TypeScript check
	$(EXEC_FRONT) npm run typecheck

## ==================== Production ====================

.PHONY: prod-up
prod-up: ## Start production stack
	$(COMPOSE_PROD) up -d

.PHONY: prod-down
prod-down: ## Stop production stack
	$(COMPOSE_PROD) down

.PHONY: prod-build
prod-build: ## Build production images
	$(COMPOSE_PROD) build

.PHONY: prod-logs
prod-logs: ## Tail production logs
	$(COMPOSE_PROD) logs -f

.PHONY: prod-migrate
prod-migrate: ## Run migrations in prod
	$(COMPOSE_PROD) exec back-php php bin/console doctrine:migrations:migrate --no-interaction

## ==================== Setup ====================

.PHONY: init
init: ## First-time setup: copy .env, build, start, migrate, generate JWT keys
	@test -f .env || cp .env.example .env
	$(COMPOSE) up -d --build
	@echo "$(CYAN)⏳ Waiting for database...$(RESET)"
	@sleep 5
	$(EXEC_PHP) composer install
	$(MAKE) jwt-keys
	$(MAKE) migrate
	@echo "$(CYAN)✅ Lumeo is ready! Front: http://localhost:11600 | Back: http://localhost:11601$(RESET)"

## ==================== Help ====================

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "$(CYAN)%-15s$(RESET) %s\n", $$1, $$2}'
