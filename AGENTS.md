# Repository Guidelines

## Project Structure & Module Organization
- `src/` (TypeScript) remains the source of truth. `agent/` orchestrates the runtime loop: `actions/` defines the default registry (navigation, extraction, PDF, thinking, etc.), `tools/agent.ts` runs the core planner/executor, `examine-dom/` powers `page.aiAction`, `messages/` builds prompts, `mcp/` holds the Model Context Protocol client, and `error.ts` centralizes agent errors.
- `browser-providers/` implements `LocalBrowserProvider` (patchright chromium) and `HyperbrowserProvider`; extend these instead of launching browsers directly.
- `context-providers/` now splits into `dom/` (visual overlays, numbered screenshots) and `a11y-dom/` (accessibility tree + interaction metadata); keep them aligned when DOM capture changes.
- `llm/` houses native model adapters (`openai`, `anthropic`, `gemini`, `deepseek`) plus schema/message converters—use `createLLMClient` and update `providers/index.ts` for new backends.
- `types/` centralizes configuration, browser provider, agent state, and action definitions. Add new interfaces here before wiring them into features.
- `utils/` aggregates shared helpers such as `ErrorEmitter`, DOM stabilization, retry logic, and schema utilities—reuse before reimplementing.
- `custom-actions/` remains the extension point for domain-specific capabilities; register additions through `HyperAgentConfig`.
- `cli/` powers the CLI entrypoint; `index.ts` is the canonical integration surface.
- `scripts/` hosts `ts-node` utilities, manual smoke probes (`test-*.ts`), and eval harnesses like `run-webvoyager-eval.ts`; treat them as integration tests.
- `examples/`, `docs/`, and `assets/` supply reference flows, migration notes, and media—update when APIs or UX change. `currentState.md` should mirror major architectural shifts.
- `evals/` stores baseline datasets (e.g., WebVoyager); do not hand-edit generated outputs.
- `dist/` and `cli.sh` are generated—modify source, then run `yarn build` rather than editing them directly.

## Build, Test, and Development Commands
- `yarn build` wipes `dist/`, runs `tsc` + `tsc-alias`, and restores executable bits on `dist/cli/index.js` and `cli.sh`; run before publishing or cutting releases.
- `yarn lint` / `yarn format` use the flat ESLint config (`@typescript-eslint`) and Prettier; fix warnings instead of suppressing rules.
- `yarn test` launches Jest; add `CI=true` for coverage and deterministic snapshots.
- `yarn cli -c "..." [--debug --hyperbrowser]` runs the agent; `--hyperbrowser` switches to the remote provider and `--debug` drops artifacts into `debug/`.
- `yarn build-dom-tree-script` refreshes DOM metadata for both visual and accessibility providers.
- `yarn example <path>` (backed by `ts-node -r tsconfig-paths/register`) is the quickest way to execute flows in `examples/` or `scripts/`.
- Use `scripts/run-webvoyager-eval.ts` or other `test-*.ts` probes for regression checks before landing risky agent or DOM changes.

## Agent Runtime & Integrations
- HyperAgent no longer depends on LangChain—configure models via native provider objects or by passing an instance from `createLLMClient`. Extend `llm/providers` when adding backends.
- `BrowserProviders` are typed (`"Local"` | `"Hyperbrowser"`); new providers should implement the base class in `types/browser-providers/types.ts`.
- `page.aiAction` handles granular actions via the accessibility tree; `page.ai` and `executeTask` cover multi-step workflows. Always decide which API to extend before adding features.
- `executeTaskAsync` / `page.aiAsync` provide streaming task control—ensure new code maintains async safety and updates task state transitions in `types`.
- MCP integrations live in `agent/mcp/client.ts`; document new servers in PRs and guard optional dependencies.
- Default actions are defined in `agent/actions/index.ts`. When adding an action, supply validators, update the registry, and cover it with smoke tests.

## Coding Style & Naming Conventions
- Strict TypeScript is enabled; keep explicit return types and narrow unions for agent state.
- Never use the `any` type. Define explicit interfaces or generics in `src/types`, prefer `interface` over inline object literals, and reuse shared types before creating new ones.
- Rely on Prettier defaults (2-space indent, double quotes, trailing commas) and ESLint autofix; do not hand-format.
- Classes/interfaces use `PascalCase`, functions and variables use `camelCase`, environment constants use `UPPER_SNAKE_CASE`.
- Import internal modules through `@/*` aliases (`import { createAgent } from "@/agent/factory";`) to avoid brittle relative paths.
- Use `zod` schemas (see `page.extract` and `llm/utils`) for runtime validation when handling LLM output or user input.

## Testing Guidelines
- Author `*.test.ts` files beside the code they cover or under `__tests__/` in `src/`; mock browsers and external APIs unless the test lives in `scripts/`.
- Ensure new behavior has unit coverage plus a smoke scenario if it touches agent flows, DOM capture, or the CLI.
- Run `yarn test` before pushing and capture flaky seeds in the PR description.
- Leverage the `scripts/test-*.ts` probes and `run-webvoyager-eval.ts` when validating major changes; record the command and seed/output in PR notes.

## Commit & Pull Request Guidelines
- Follow the short imperative subject style (`Fix dom state retrieval`, `Replace LangChain...`) and reference issues as `(#123)`.
- Squash temporary commits prior to merge; leave feature flags or TODOs documented.
- PRs must explain intent, list validation commands, and attach screenshots or terminal captures for user-visible changes.
- Request review from domain owners (agent/context/CLI) and wait for CI green before merging. Call out impacts to browser providers, MCP integrations, or LLM adapters explicitly.
