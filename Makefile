.PHONY: install dev build test lint typecheck verify format clean smoke e2e \
	db\:generate db\:push db\:migrate db\:deploy \
	docker\:up docker\:down docker\:prod

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm -r test

lint:
	pnpm -r lint

typecheck:
	pnpm -r typecheck

verify:
	pnpm verify

smoke:
	./infra/ci/smoke-test.sh http://localhost:3000

e2e:
	pnpm test:e2e

format:
	pnpm format

clean:
	find . -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null; \
	find . -name ".next" -exec rm -rf {} + 2>/dev/null; \
	echo "Clean completed"

db\:generate:
	cd apps/web && pnpm exec prisma generate

db\:push:
	cd apps/web && pnpm exec prisma db push

db\:migrate:
	cd apps/web && pnpm exec prisma migrate dev

db\:deploy:
	cd apps/web && pnpm exec prisma migrate deploy

docker\:up docker\:prod:
	docker compose -f infra/docker-compose.prod.yml up -d --build

docker\:down:
	docker compose -f infra/docker-compose.prod.yml down
