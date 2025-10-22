# Repository Guidelines

## Project Structure & Module Organization
- `src/` (TypeScript) is the source of truth: `agent/` orchestrates tasks, `context-providers/` wrap DOM/Playwright, `llm/` handles model adapters, `custom-actions/` extends capabilities, and `cli/` powers the CLI.
- `scripts/` hosts `ts-node` utilities and manual smoke checks (`test-*.ts`); treat them as integration probes.
- `examples/`, `docs/`, and `assets/` supply reference flows, migration notes, and media; update when APIs or UX change.
- `dist/` and `cli.sh` are generated; adjust source, then run `yarn build` instead of editing them.

## Build, Test, and Development Commands
- `yarn build` wipes `dist/`, runs `tsc` + `tsc-alias`, and sets executable bits—required before publishing.
- `yarn lint` / `yarn format` apply the flat ESLint config (`@typescript-eslint`, Prettier); fix warnings rather than suppressing rules.
- `yarn test` launches Jest; add `CI=true` for coverage and snapshot stability.
- `yarn cli -c "..." [--debug --hyperbrowser]` starts the local agent; debug mode drops artifacts into `debug/`.
- `yarn build-dom-tree-script` refreshes DOM metadata for context providers.

## Coding Style & Naming Conventions
- Strict TypeScript is enabled; keep explicit return types and narrow unions for agent state.
- Rely on Prettier defaults (2-space indent, double quotes, trailing commas) and ESLint autofix; do not hand-format.
- Classes/interfaces use `PascalCase`, functions and variables use `camelCase`, environment constants use `UPPER_SNAKE_CASE`.
- Import internal modules through `@/*` aliases (`import { createAgent } from "@/agent/factory";`) to avoid brittle relative paths.

## Testing Guidelines
- Author `*.test.ts` files beside the code they cover or under `__tests__/` in `src/`; mock browsers and external APIs unless the test lives in `scripts/`.
- Ensure new behavior has unit coverage plus a smoke scenario if it touches the CLI.
- Run `yarn test` before pushing and capture flaky seeds in the PR description.

## Commit & Pull Request Guidelines
- Follow the existing short imperative subject style (`Fix dom state retrieval`, `Replace LangChain...`) and reference issues as `(#123)`.
- Squash temporary commits prior to merge; leave feature flags or TODOs documented.
- PRs must explain intent, list validation commands, and attach screenshots or terminal captures for user-visible changes.
- Request review from domain owners (agent/context/CLI) and wait for CI green before merging.
