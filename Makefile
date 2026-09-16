SHELL := /bin/bash

.DEFAULT_GOAL := help

.PHONY: \
	help \
	install \
	dev \
	lint \
	lint-fix \
	typecheck \
	test \
	test-unit \
	test-nuxt \
	build \
	check \
	docker-config \
	docker-build \
	docker-up \
	docker-down \
	docker-restart \
	docker-logs \
	docker-ps \
	deploy-prod

help:
	@printf '%s\n' \
		'Commandes gallon :' \
		'' \
		'  make install         Installer les dépendances' \
		'  make dev             Lancer Nuxt en développement' \
		'  make lint            Lancer ESLint' \
		'  make lint-fix        Corriger les erreurs ESLint corrigibles' \
		'  make typecheck       Vérifier TypeScript' \
		'  make test            Lancer tous les tests Vitest' \
		'  make test-unit       Lancer les tests unitaires' \
		'  make test-nuxt       Lancer les tests Nuxt' \
		'  make build           Construire l’application' \
		'  make check           Lint + typecheck + tests + build' \
		'' \
		'  make docker-config   Valider la configuration Docker Compose' \
		'  make docker-build    Construire l’image Docker' \
		'  make docker-up       Construire et démarrer gallon' \
		'  make docker-down     Arrêter gallon' \
		'  make docker-restart  Redémarrer gallon' \
		'  make docker-logs     Suivre les logs' \
		'  make docker-ps       Afficher l’état du conteneur' \
		'  make deploy-prod     Mettre à jour et redéployer la production'

install:
	npm ci

dev:
	npm run dev

lint:
	npm run lint

lint-fix:
	npm run lint:fix

typecheck:
	npm run typecheck

test:
	npm run test

test-unit:
	npm run test:unit

test-nuxt:
	npm run test:nuxt

build:
	npm run build

check: lint typecheck test build

docker-config:
	docker compose config --quiet

docker-build:
	docker compose build

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-restart:
	docker compose restart

docker-logs:
	docker compose logs --follow --tail=200

docker-ps:
	docker compose ps

deploy-prod:
	@test "$$(git branch --show-current)" = "main" || { echo "Erreur : deploy-prod doit être lancé depuis main"; exit 1; }
	@test -z "$$(git status --porcelain)" || { echo "Erreur : le working tree doit être propre"; exit 1; }
	git fetch origin
	git pull --ff-only origin main
	docker compose up -d --build
	@echo "Attente du healthcheck..."
	@for i in $$(seq 1 30); do \
		status=$$(docker inspect --format='{{.State.Health.Status}}' gallon-app-1 2>/dev/null || true); \
		if [ "$$status" = "healthy" ]; then \
			echo "gallon est healthy"; \
			exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo "Erreur : gallon n'est pas devenu healthy"; \
	docker compose ps; \
	exit 1
