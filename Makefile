.PHONY: help install dev frontend backend build up down logs clean

help:
	@echo "Portfolio Suite - Makefile"
	@echo ""
	@echo "Development:"
	@echo "  make dev        - Start backend (nodemon)"
	@echo "  make frontend   - Start frontend (Vite dev server)"
	@echo "  make backend    - Start backend only"
	@echo ""
	@echo "Docker:"
	@echo "  make build      - Build Docker images"
	@echo "  make up         - Start stack via docker-compose"
	@echo "  make down       - Stop stack"
	@echo "  make logs       - Follow container logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean      - Remove node_modules and dist folders"

install:
	@echo "Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install
	@echo "✓ Dependencies installed"

backend:
	@echo "Starting backend on http://localhost:3001"
	cd backend && npm run dev

frontend:
	@echo "Starting frontend on http://localhost:5173"
	cd frontend && npm run dev

build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "✓ Build complete"

up:
	@echo "Starting stack..."
	docker-compose up -d --build
	@echo "✓ Running"
	@echo "  Frontend: http://localhost:5173"
	@echo "  API: http://localhost:3001"

backend-dev:
	@$(MAKE) backend

dev:
	@$(MAKE) backend &
	cd frontend && npm run dev

logs:
	@echo "Logs (Ctrl+C para sair)"
	docker-compose logs -f

clean:
	@echo "Cleaning project..."
	rm -rf backend/node_modules frontend/node_modules
	rm -rf backend/dist frontend/dist
	@echo "✓ Cleanup complete"

down:
	@echo "Stopping stack..."
	docker-compose down
	@echo "✓ Stopped"

