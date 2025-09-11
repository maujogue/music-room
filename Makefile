# Music Room Project Makefile
# This Makefile automates the setup and development workflow

.PHONY: help install setup-supabase start-supabase stop-supabase setup-env start-app clean reset migrate reset-db

# Shortcuts
COMPOSE_FILE := docker-compose.yml
REACT_APP_DIR := react
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
	@echo "  setup-env        Create .env file with local Supabase config"
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
	@echo "✅ Dependencies installed successfully!"

# Initialize Supabase (run from project root)
setup-supabase:
	@echo "🔧 Setting up Supabase locally..."
	@if [ ! -d "supabase" ]; then \
		echo "Initializing Supabase..."; \
		npx supabase init; \
		npx supabase start; \
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

# Create .env file with local Supabase configuration
.PHONY: setup-env create-env-local

setup-env:
	@echo "⚙️  Setting up environment variables in ${REACT_APP_DIR}/.env..."
	@if [ ! -f "${REACT_APP_DIR}/.env" ]; then \
		echo "Creating .env file..."; \
		cd ${REACT_APP_DIR}; \
		IP=$$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $$1}'); \
		echo "EXPO_PUBLIC_SUPABASE_URL=http://$${IP}:54321" > .env; \
		echo "LOCAL_SUPABASE_URL=http://kong:8000" >> .env; \
		ANON_KEY=$$(npx supabase start | grep "anon key" | awk -F": " '{print $$2}'); \
		SECRET_SERVICE_ROLE_KEY=$$(npx supabase status | grep "service_role key" | awk -F": " '{print $$2}'); \
		echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$${ANON_KEY}" >> .env; \
		echo "SECRET_SERVICE_ROLE_KEY=$${SECRET_SERVICE_ROLE_KEY}" >> .env; \
		read -p "SPOTIFY_CLIENT_ID: " spotify_id; echo "SPOTIFY_CLIENT_ID=$$spotify_id" >> .env; \
		read -p "SPOTIFY_CLIENT_SECRET: " spotify_secret; echo "SPOTIFY_CLIENT_SECRET=$$spotify_secret" >> .env; \
		echo "⚠️  Check that the following env keys are correct"; \
		cat .env; \
	else \
		echo "⚠️  .env file already exists. Skipping..."; \
		echo "   If you need to update it, run 'make reset-env'"; \
	fi


# Reset environment file
reset-env:
	@echo "🔄 Resetting environment file..."
	cd ${REACT_APP_DIR} && rm -f .env
	make setup-env
	@echo "✅ .env file removed. Run 'make setup-env' to recreate it."

# Complete project setup
setup: install setup-supabase setup-env
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

# Start the Expo development server
dev:
	@echo "📱 Starting Expo development server..."
	npx supabase functions serve --no-verify-jwt --env-file react/.env & \
	cd ${REACT_APP_DIR} && npm start

dev-tunnel:
	@echo "📱 Starting Expo development server..."
	npx supabase functions serve --no-verify-jwt --env-file react/.env & \
	cd ${REACT_APP_DIR} && npm start --tunnel

# Clean up build files and node_modules
clean:
	@echo "🧹 Cleaning up build files..."
	cd ${REACT_APP_DIR} && rm -rf node_modules package-lock.json .expo
	cd supabase && rm -rf .branches .temp
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
	@if [ -f "${REACT_APP_DIR}/.env" ]; then echo "  ✅ Environment configured"; else echo "  ❌ Environment not configured"; fi
	@if [ -d "${REACT_APP_DIR}/node_modules" ]; then echo "  ✅ Dependencies installed"; else echo "  ❌ Dependencies not installed"; fi
	@echo ""
	@echo "🔧 Supabase Status:"
	@npx supabase status 2>/dev/null || echo "  ❌ Supabase services not running"
	@echo ""
	@echo "🗄️  Database Migrations:"
	@if [ -d "supabase/migrations" ]; then \
		echo "  ✅ Migrations directory exists"; \
		echo "  📁 Migration files:"; \
		ls -la supabase/migrations/ 2>/dev/null | grep "\.sql" | wc -l | xargs echo "    - Found"; \
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
	cd ${REACT_APP_DIR} && npx expo run:android

ios:
	cd ${REACT_APP_DIR} && npx expo run:ios
