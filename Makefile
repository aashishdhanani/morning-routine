.PHONY: setup install test lint format clean help start ios android web

help:
	@echo "Available commands:"
	@echo "  make setup     - Initial project setup (installs deps)"
	@echo "  make install   - Install Node.js dependencies"
	@echo "  make start     - Start Expo development server"
	@echo "  make ios       - Start Expo for iOS"
	@echo "  make android   - Start Expo for Android"
	@echo "  make web       - Start Expo for web"
	@echo "  make test      - Run tests"
	@echo "  make lint      - Run linters"
	@echo "  make format    - Format code"
	@echo "  make type-check - Run TypeScript type checking"
	@echo "  make clean     - Clean build artifacts"

setup:
	@bash setup.sh

install:
	@npm install

start:
	@npm start

ios:
	@npm run ios

android:
	@npm run android

web:
	@npm run web

test:
	@npm test

lint:
	@npm run lint

format:
	@npm run format

type-check:
	@npm run type-check

clean:
	@rm -rf node_modules .expo dist web-build
	@rm -rf build dist *.egg-info .pytest_cache .coverage htmlcov .mypy_cache .ruff_cache
	@find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
