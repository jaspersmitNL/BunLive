#!/bin/bash
pushd .
cd packages/common
bun run build
cd ../core
bun run build
cd ../elysia-handler
bun run build
popd