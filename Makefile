.PHONY: dev build test lint typecheck format install clean

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

typecheck:
	pnpm typecheck

format:
	pnpm format

clean:
	find . -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null; \
	find . -name ".next" -exec rm -rf {} + 2>/dev/null; \
	echo "Clean done"

db\:generate:
	cd apps/web && pnpm exec prisma generate

db\:push:
	cd apps/web && pnpm exec prisma db push

db\:migrate:
	cd apps/web && pnpm exec prisma migrate dev
