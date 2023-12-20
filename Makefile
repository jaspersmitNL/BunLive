.PHONY: all

all: core common elysia-handler


core:
	cd packages/core && bun run build

common:
	cd packages/common && bun run build

elysia-handler:
	cd packages/elysia-handler && bun run build