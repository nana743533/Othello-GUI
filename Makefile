.PHONY: help up down build logs shell-backend shell-frontend restart clean \
        install setup compile-cpp \
        test test-backend test-backend-all test-backend-rspec \
        lint lint-backend lint-frontend lint-backend-fix \
        rebuild

.DEFAULT_GOAL := help

# ============================================================================
# Help
# ============================================================================

help: ## Display this help message
	@echo "Available commands:"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up                  - Start all services"
	@echo "  make up-d                - Start all services in detached mode"
	@echo "  make down                - Stop all services"
	@echo "  make build               - Build all Docker images"
	@echo "  make rebuild             - Rebuild all Docker images without cache"
	@echo "  make restart             - Restart all services"
	@echo "  make clean               - Stop all services and remove volumes"
	@echo "  make logs                - Show logs from all services"
	@echo ""
	@echo "Shell Access:"
	@echo "  make shell-backend       - Open bash in backend container"
	@echo "  make shell-frontend      - Open shell in frontend container"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install             - Install dependencies for backend and frontend"
	@echo "  make install-backend     - Install backend dependencies"
	@echo "  make install-frontend    - Install frontend dependencies"
	@echo "  make setup               - Full setup (install + compile C++)"
	@echo "  make compile-cpp         - Compile C++ AI engine"
	@echo ""
	@echo "Testing:"
	@echo "  make test                - Run all tests"
	@echo "  make test-backend FILES='test/file1.rb test/file2.rb' - Run specific backend test files"
	@echo "  make test-backend-all    - Run all backend tests (minitest + rspec)"
	@echo "  make test-backend-rspec  - Run backend RSpec tests"
	@echo "  make test-frontend       - Run frontend linting"
	@echo ""
	@echo "Linting:"
	@echo "  make lint                - Lint all code"
	@echo "  make lint-backend        - Lint backend code with RuboCop"
	@echo "  make lint-backend-fix    - Auto-fix backend code with RuboCop"
	@echo "  make lint-frontend       - Lint frontend code with ESLint"

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
	docker compose exec backend bin/rails test $(FILES)

test-backend-all:
	docker compose exec backend bin/rails test
	docker compose exec backend bundle exec rspec

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
