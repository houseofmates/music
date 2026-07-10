# Backend Makefile for development tasks

.PHONY: lint lint-fix type-check format format-check check test clean

# Linting
lint:
	ruff check .

lint-fix:
	ruff check . --fix

# Type checking
type-check:
	mypy . --ignore-missing-imports

# Formatting
format:
	black .

format-check:
	black --check .

# Combined check
check: lint type-check format-check

# Testing
test:
	pytest

# Clean up
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete