# Music Room Project Makefile
# This Makefile automates the setup and development workflow

.PHONY: help install setup-supabase start-supabase stop-supabase setup-env setup-frontend-env setup-backend-env setup-prod-env start-app clean reset migrate reset-db

# Shortcuts
COMPOSE_FILE := docker-compose.yml
REACT_APP_DIR := react
SUPABASE_DIR := supabase
WS_SERVER_DIR := ${SUPABASE_DIR}/ws-server
SUPABASE_FUNCTIONS_DIR := ${SUPABASE_DIR}/functions
OS := $(shell uname)
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
	cd ${REACT_APP_DIR} && npm install --save-dev babel-plugin-module-resolver
	@echo "✅ Dependencies installed successfully!"

# Initialize Supabase (run from project root)
setup-supabase:
	@echo "🔧 Setting up Supabase locally..."
	@if [ ! -d "supabase" ]; then \
		echo "Initializing Supabase..."; \
		npx supabase init \
		npx supabase start \
	else \
		echo "Supabase already initialized, skipping..."; \
	fi
	@echo "✅ Supabase initialized!"

# Start local Supabase services and apply migrations
start-supabase:
	@echo "🚀 Starting Supabase services..."
	npx supabase start
	@echo "✅ Supabase services started!"


# Stop local Supabase services
stop-supabase:
	@echo "🛑 Stopping Supabase services..."
	npx supabase stop --project-id music-room
	@echo "✅ Supabase services stopped!"

# Apply database migrations
migrate:
	@echo "🔄 Applying database migrations..."
	npx supabase db push
	@echo "✅ Migrations applied!"

# Reset database (keep services running)
reset-db:
	@echo "🔄 Resetting database..."
	npx supabase db reset
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
		ANON_KEY=$$(npx supabase status | grep "anon key" | awk -F": " '{print $$2}'); \
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
	@echo "🔁 Starting supabase functions in background..."
	cd ${SUPABASE_FUNCTIONS_DIR} && nohup npx supabase functions serve > supabase-functions.log 2>&1 &
	@echo "🔁 Starting Expo (foreground)..."
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
	npx supabase functions serve --no-verify-jwt& \
	cd ${REACT_APP_DIR} && npm start --tunnel

# Clean up build files and node_modules
clean:
	@echo "🧹 Cleaning up build files..."
	cd ${REACT_APP_DIR} && rm -rf node_modules package-lock.json .expo
	cd ${SUPABASE_DIR} && rm -rf .branches .temp
	@echo "✅ Cleanup complete! Run 'make install' to reinstall dependencies."

# Reset Supabase database and restart
reset:
	@echo "🔄 Resetting Supabase database and restarting services..."
	npx supabase stop
	npx supabase start
	@echo "🔄 Applying migrations after reset..."
	npx supabase db push
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
	@npx supabase status 2>/dev/null || echo "  ❌ Supabase services not running"
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

format:
	@echo "🔄 Formatting code..."
	cd ${REACT_APP_DIR} && npm run format

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

test: test-react test-supabase test-supabase-sql

test-react:
	cd ${REACT_APP_DIR} && npm test

test-supabase:
	cd ${SUPABASE_DIR} && npx deno test --allow-env --allow-read --allow-net __tests__/**/*.test.ts __tests__/*.test.ts

test-supabase-sql:
	@echo "🧪 Running SQL database tests..."
	cd ${SUPABASE_DIR} && supabase test db

deploy:
	npx supabase db push
	npx supabase functions deploy
