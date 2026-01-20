# Music Room Project Makefile
# This Makefile automates the setup and development workflow

.PHONY: help install setup-supabase start-supabase stop-supabase setup-env setup-frontend-env setup-backend-env redocly api setup-prod-env start-app clean reset migrate reset-db

# Shortcuts
COMPOSE_FILE := docker-compose.yml
REACT_APP_DIR := react
SUPABASE_DIR := supabase
WS_SERVER_DIR := ${SUPABASE_DIR}/ws-server
SUPABASE_FUNCTIONS_DIR := ${SUPABASE_DIR}/functions
SUPABASE_SCRIPTS_DIR := ${SUPABASE_DIR}/scripts
OS := $(shell uname)
SUPABASE := supabase@2.67.0 # ~2.72.0 jwtVerify issues in local

ifeq ($(OS), Darwin)
    IP := $(shell ifconfig en0 | grep inet | awk '$$1=="inet" {print $$2}')
else
    IP := $(shell hostname -I | awk '{print $$1}')
endif

# Default target
help:
	@echo "🎵 Music Room Project - Available Commands:"
	@echo ""
	@echo "📦 Setup Commands:"
	@echo "  install          Install all dependencies"
	@echo "  setup-supabase   Initialize and start Supabase locally"
	@echo "  setup-env        Create .env files for frontend and backend"
	@echo "  setup-frontend-env Create frontend .env.dev file"
	@echo "  setup-prod-env   Create production .env files"
	@echo "  setup            Complete project setup (install + setup-supabase + setup-env)"
	@echo ""
	@echo "🚀 Development Commands:"
	@echo "  start-app        Start the Expo development server"
	@echo "  start-supabase   Start local Supabase services and apply migrations"
	@echo "  stop-supabase    Stop local Supabase services"
	@echo "  migrate          Apply database migrations"
	@echo "  dev              Start development server"
	@echo "  dev-tunnel       Start development server with tunnel"
	@echo "  api              Include the last version of the openapi.yml file"

	@echo ""
	@echo "🧹 Maintenance Commands:"
	@echo "  clean            Clean up node_modules and build files"
	@echo "  reset            Reset Supabase database and restart services"
	@echo "  reset-db         Reset database only (keep services running)"
	@echo ""
	@echo "📱 Quick Start:"
	@echo "  make setup       # Complete setup"
	@echo "  make dev         # Complete setup and start development"

# Install all dependencies
install:
	@echo "📦 Installing dependencies..."
	cd ${REACT_APP_DIR} && npx expo install
	@echo "✅ Dependencies installed successfully!"
	cd ${SUPABASE_DIR}/functions/tests && npm install

# Initialize Supabase (run from project root)
setup-supabase:
	@echo "🔧 Setting up Supabase locally..."
	@if [ ! -d "supabase" ]; then \
		echo "Initializing Supabase..."; \
		npx ${SUPABASE} init \
		npx ${SUPABASE} start \
	else \
		echo "Supabase already initialized, skipping..."; \
	fi
	@echo "✅ Supabase initialized!"

# Start local Supabase services and apply migrations
start-supabase: local-migrations
	@echo "🚀 Starting Supabase services..."
	npx ${SUPABASE} start
	@echo "✅ Supabase services started!"


# Stop local Supabase services
stop-supabase:
	@echo "🛑 Stopping Supabase services..."
	npx ${SUPABASE} stop --project-id music-room
	@echo "✅ Supabase services stopped!"

# Apply database migrations
migrate:
	@echo "🔄 Applying database migrations..."
	npx ${SUPABASE} db push
	@echo "✅ Migrations applied!"

# Reset database (keep services running)
reset-db:
	@echo "🔄 Resetting database..."
	npx ${SUPABASE} db reset
	@echo "✅ Database reset complete!"

# Create .env files with local Supabase configuration
.PHONY: setup-env create-env-local setup-frontend-env

setup-env: setup-frontend-env setup-backend-env
	@echo "✅ Environment setup complete!"

setup-frontend-env:
	@echo "⚙️  Setting up frontend environment variables in ${REACT_APP_DIR}/.env.dev..."
	@if [ ! -f "${REACT_APP_DIR}/.env.dev" ]; then \
		echo "Creating frontend .env.dev file..."; \
		cd ${REACT_APP_DIR}; \
		IP=$$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $$1}'); \
		echo "EXPO_PUBLIC_SUPABASE_URL=http://$${IP}:54321" > .env.dev; \
		ANON_KEY=$$(npx ${SUPABASE} status | grep "anon key" | awk -F": " '{print $$2}'); \
		echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$${ANON_KEY}" >> .env.dev; \
		echo "✅ Frontend .env.dev created"; \
		echo "⚠️ Switch EXPO_PUBLIC_SUPABASE_URL to tunnel url if you want to use spotify auth"; \
	else \
		echo "⚠️  Frontend .env.dev file already exists. Skipping..."; \
	fi


# Reset environment file
reset-env:
	@echo "🔄 Resetting environment files..."
	cd ${REACT_APP_DIR} && rm -f .env.dev
	make setup-env
	@echo "✅ Environment files reset. Run 'make setup-env' to recreate them."

# Complete project setup
setup: install setup-env setup-supabase
	@echo ""
	@echo "🎉 Project setup complete!"
	@echo ""
	@echo "📋 What was set up:"
	@echo "  ✅ Dependencies installed"
	@echo "  ✅ Supabase initialized"
	@echo "  ✅ Environment variables configured"
	@echo ""
	@echo "🚀 Next steps:"
	@echo "    Start the app: make dev"

dev:
	@echo "📱 Starting Expo development server..."
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.dev .env
	cd ${REACT_APP_DIR} && cp .env.dev .env
	cd ${REACT_APP_DIR} && npm start

dev-cloud:
	@echo "📱 Starting Expo development server..."
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.prod .env
	cd ${REACT_APP_DIR} && cp .env.prod .env
	cd ${REACT_APP_DIR} && npm start


dev-tunnel:
	@echo "📱 Starting Expo development server..."
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.dev .env
	cd ${REACT_APP_DIR} && cp .env.dev .env
	npx ${SUPABASE} functions serve --no-verify-jwt& \
	cd ${REACT_APP_DIR} && npm start --tunnel

api: redocly
	@echo "🧾 Generating openapi-file.ts from docs/openapi.yml..."
	@cd ${SUPABASE_SCRIPTS_DIR} && node generate-openapi-file.cjs

redocly:
	@echo "🔍 Validating OpenAPI spec with Redocly..."
	@cd ${REACT_APP_DIR} && npx redocly lint ../supabase/docs/openapi.yml

# Clean up build files and node_modules
clean:
	@echo "🧹 Cleaning up build files..."
	cd ${REACT_APP_DIR} && rm -rf node_modules package-lock.json .expo
	cd ${SUPABASE_DIR} && rm -rf .branches .temp
	@echo "✅ Cleanup complete! Run 'make install' to reinstall dependencies."

# Reset Supabase database and restart
reset:
	@echo "🔄 Resetting Supabase database and restarting services..."
	npx ${SUPABASE} stop
	npx ${SUPABASE} start
	@echo "🔄 Applying migrations after reset..."
	npx ${SUPABASE} db push
	@echo "✅ Database reset and migrations applied!"

# Check project status
status:
	@echo "📊 Project Status:"
	@echo ""
	@echo "📁 Project Structure:"
	@if [ -d "supabase" ]; then echo "  ✅ Supabase initialized"; else echo "  ❌ Supabase not initialized"; fi
	@if [ -f "${REACT_APP_DIR}/.env.dev" ]; then echo "  ✅ Frontend environment configured"; else echo "  ❌ Frontend environment not configured"; fi
	@if [ -d "${REACT_APP_DIR}/node_modules" ]; then echo "  ✅ Dependencies installed"; else echo "  ❌ Dependencies not installed"; fi
	@echo ""
	@echo "🔧 Supabase Status:"
	@npx ${SUPABASE} status 2>/dev/null || echo "  ❌ Supabase services not running"
	@echo ""
	@echo "🗄️  Database Migrations:"
	@if [ -d "${SUPABASE_DIR}/migrations" ]; then \
		echo "  ✅ Migrations directory exists"; \
		echo "  📁 Migration files:"; \
		ls -la ${SUPABASE_DIR}/migrations/ 2>/dev/null | grep "\.sql" | wc -l | xargs echo "    - Found"; \
	else \
		echo "  ❌ Migrations directory not found"; \
	fi

lint:
	@echo "🔄 Linting code..."
	cd ${REACT_APP_DIR} && npm run lint
	@echo "🔄 Linting Supabase functions..."
	cd ${SUPABASE_DIR} && npx deno lint --config functions/deno.json functions

format:
	@echo "🔄 Formatting code..."
	cd ${REACT_APP_DIR} && npm run format
	@echo "🔄 Formatting Supabase functions..."
	cd ${SUPABASE_DIR} && npx deno fmt --config functions/deno.json functions

# Quick commands for common tasks
up: start-supabase
down: stop-supabase
restart: stop-supabase start-supabase

android:
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.dev .env
	cd ${REACT_APP_DIR} && cp .env.dev .env
	cd ${REACT_APP_DIR} && npx expo run:android

ios:
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.dev .env
	cd ${REACT_APP_DIR} && cp .env.dev .env
	cd ${REACT_APP_DIR} && npx expo run:ios

prod-android:
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.prod .env
	cd ${REACT_APP_DIR} && cp .env.prod .env
	cd ${REACT_APP_DIR} && npx expo run:android

prod-ios:
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.prod .env
	cd ${REACT_APP_DIR} && cp .env.prod .env
	cd ${REACT_APP_DIR} && npx expo run:ios

test: test-react test-supabase-local test-supabase-sql-local

test-cloud: test-react test-supabase-cloud test-supabase-sql-cloud

test-react:
	cd ${REACT_APP_DIR} && npm test

test-spotify-server:
	@echo "🧪 Running spotify test server..."
	@echo "To get a new token, click on :\n"
	@echo  "http://127.0.0.1:8888/login \n"
	@echo "Then run :\n"
	@echo "make test-spotify\n"
	cd ${SUPABASE_DIR} && node functions/tests/token.js

test-supabase-cloud: 
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.prod .env
	cd ${SUPABASE_DIR} && npx deno test --config functions/deno.json --filter "^(?!spotify integration:)" --allow-env --allow-read --allow-net functions/tests/**/*.test.ts --env-file=functions/.env

test-supabase-local: 
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.dev .env
	cd ${SUPABASE_DIR} && npx deno test --config functions/deno.json --filter "^(?!spotify integration:)" --allow-env --allow-read --allow-net functions/tests/**/*.test.ts --env-file=functions/.env

test-spotify:
	cd ${SUPABASE_FUNCTIONS_DIR} && cp .env.dev .env
	cd ${SUPABASE_DIR} && npx deno test --config functions/deno.json  --allow-env --allow-read --allow-net functions/tests/**/services.integration.test.ts --env-file=functions/.env

test-supabase-sql-local:
	@echo "🧪 Running SQL database tests..."
	cd ${SUPABASE_DIR} && npx ${SUPABASE} test db

test-supabase-sql-cloud:
	@echo "🧪 Running SQL database tests..."
	cd ${SUPABASE_DIR} && npx ${SUPABASE} test db --linked

deploy:
	npx supabase db push
deploy-functions:
	npx supabase functions deploy

local-migrations:
	npx ${SUPABASE} migrations up

load-test:
	cd load-testing && ./run_k6_test.sh profile 25 50 75 100 125 150

load-test-visualize:
	open load-testing/reports/event_create_2025-10-30_13-21-59.html
	open load-testing/reports/me_events_2025-10-29_16-17-20.html
	open load-testing/reports/me_events_2025-10-29_16-17-20.html
	open load-testing/reports/me_playlists_2025-10-29_16-31-00.html
	open load-testing/reports/mixed_workload_2025-10-30_13-17-45.html
	open load-testing/reports/playlist_create_2025-10-30_12-52-31.html
	open load-testing/reports/profile_fetch_2025-10-30_11-47-54.html
	open load-testing/reports/profile_update_2025-10-29_15-50-44.html
