# Music Room Project Makefile
# This Makefile automates the setup and development workflow

.PHONY: help install setup-supabase start-supabase stop-supabase setup-env start-app clean reset migrate reset-db

# Shortcuts
COMPOSE_FILE := docker-compose.yml
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
	cd app && npm install
	@echo "✅ Dependencies installed successfully!"

# Initialize Supabase (run from project root)
setup-supabase:
	@echo "🔧 Setting up Supabase locally..."
	@if [ ! -d "supabase" ]; then \
		echo "Initializing Supabase..."; \
		npx supabase init; \
		supabase start; \
	else \
		echo "Supabase already initialized, skipping..."; \
	fi
	@echo "✅ Supabase initialized!"

# Start local Supabase services and apply migrations
start-supabase:
	@echo "🚀 Starting Supabase services..."
	supabase start
	@echo "✅ Supabase services started!"
	@echo ""
	@echo "🔄 Applying database migrations..."
	@if supabase db push > /dev/null 2>&1; then \
		echo "✅ Migrations applied successfully!"; \
	else \
		echo "⚠️  No new migrations to apply or migration failed"; \
	fi
	@echo ""
	@echo "🌱 Running seed file..."
	@if [ -f "supabase/seed.sql" ]; then \
		echo "✅ Seed file found and will be applied with migrations"; \
	else \
		echo "⚠️  No seed file found"; \
	fi
	@echo ""

# Stop local Supabase services
stop-supabase:
	@echo "🛑 Stopping Supabase services..."
	supabase stop
	@echo "✅ Supabase services stopped!"

# Apply database migrations
migrate:
	@echo "🔄 Applying database migrations..."
	supabase db push
	@echo "✅ Migrations applied!"

# Reset database (keep services running)
reset-db:
	@echo "🔄 Resetting database..."
	supabase db reset
	@echo "✅ Database reset complete!"

# Create .env file with local Supabase configuration
setup-env:
	@echo "⚙️  Setting up environment variables..."
	@if [ ! -f "app/.env" ]; then \
		echo "Creating .env file..."; \
		cd app; \
		echo "EXPO_PUBLIC_SUPABASE_URL=http://$(IP):54321" > .env; \
		echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=$(shell npx supabase start | grep "anon key" | awk -F": " '{print $$2}')" >> .env; \
		echo "⚠️  Check that the following env keys are correct"; \
		cat .env; \
	else \
		echo "⚠️  .env file already exists. Skipping..."; \
		echo "   If you need to update it, run 'make reset-env'"; \
	fi

# Reset environment file
reset-env:
	@echo "🔄 Resetting environment file..."
	cd app && rm -f .env
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
	cd app && npm start

# Clean up build files and node_modules
clean:
	@echo "🧹 Cleaning up build files..."
	cd app && rm -rf node_modules package-lock.json .expo
	cd supabase && rm -rf .branches .temp 
	@echo "✅ Cleanup complete! Run 'make install' to reinstall dependencies."

# Reset Supabase database and restart
reset:
	@echo "🔄 Resetting Supabase database and restarting services..."
	supabase stop
	supabase start
	@echo "🔄 Applying migrations after reset..."
	supabase db push
	@echo "✅ Database reset and migrations applied!"

# Check project status
status:
	@echo "📊 Project Status:"
	@echo ""
	@echo "📁 Project Structure:"
	@if [ -d "supabase" ]; then echo "  ✅ Supabase initialized"; else echo "  ❌ Supabase not initialized"; fi
	@if [ -f "app/.env" ]; then echo "  ✅ Environment configured"; else echo "  ❌ Environment not configured"; fi
	@if [ -d "app/node_modules" ]; then echo "  ✅ Dependencies installed"; else echo "  ❌ Dependencies not installed"; fi
	@echo ""
	@echo "🔧 Supabase Status:"
	@supabase status 2>/dev/null || echo "  ❌ Supabase services not running"
	@echo ""
	@echo "🗄️  Database Migrations:"
	@if [ -d "supabase/migrations" ]; then \
		echo "  ✅ Migrations directory exists"; \
		echo "  📁 Migration files:"; \
		ls -la supabase/migrations/ 2>/dev/null | grep "\.sql" | wc -l | xargs echo "    - Found"; \
	else \
		echo "  ❌ Migrations directory not found"; \
	fi

# Quick commands for common tasks
up: start-supabase
down: stop-supabase
restart: stop-supabase start-supabase

android:
	cd app && npx expo run:android

ios:
	cd app && npx expo run:ios
