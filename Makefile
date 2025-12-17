.PHONY: up down build logs shell-backend shell-frontend restart clean \
        install setup compile-cpp \
        test test-backend test-backend-all test-backend-rspec \
        lint lint-backend lint-frontend \
        security security-backend audit-backend brakeman-backend \
        dev-backend dev-frontend

# ============================================================================
# Docker Commands
# ============================================================================

up:
	docker compose up

up-d:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

rebuild:
	docker compose build --no-cache

logs:
	docker compose logs -f

restart: down up-d

clean:
	docker compose down -v
	docker system prune -f

# ============================================================================
# Shell Access
# ============================================================================

shell-backend:
	docker compose exec backend bash

shell-frontend:
	docker compose exec frontend sh

# ============================================================================
# Setup & Installation
# ============================================================================

install: install-backend install-frontend

install-backend:
	cd backend && bundle install

install-frontend:
	cd frontend && npm install

setup: install compile-cpp

compile-cpp:
	cd backend/othelloai_logic && g++ -O3 -o othello othello.cpp

# ============================================================================
# Testing Commands
# ============================================================================

test: test-backend test-frontend

test-backend:
	docker compose exec backend bin/rails test

test-backend-all:
	docker compose exec backend bin/rails test

test-backend-rspec:
	docker compose exec backend bundle exec rspec

test-frontend:
	docker compose exec frontend npm run lint

# ============================================================================
# Linting Commands
# ============================================================================

lint: lint-backend lint-frontend

lint-backend:
	docker compose exec backend bin/rubocop

lint-backend-fix:
	docker compose exec backend bin/rubocop -A

lint-frontend:
	docker compose exec frontend npm run lint

# ============================================================================
# Security Commands
# ============================================================================

security: security-backend

security-backend: audit-backend brakeman-backend

audit-backend:
	docker compose exec backend bin/bundler-audit check --update

brakeman-backend:
	docker compose exec backend bin/brakeman -q

# ============================================================================
# Development Commands
# ============================================================================

dev-backend:
	docker compose exec backend bin/rails s -p 3001

dev-frontend:
	docker compose exec frontend npm run dev
