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
	docker-ps

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
		'  make docker-ps       Afficher l’état du conteneur'

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
