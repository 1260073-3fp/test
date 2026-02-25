Overview
- This file provides guidelines for autonomous coding agents operating in this repository.
- It documents common build, lint, test commands and the expected code style rules.
- It also notes any repository-specific cursor or Copilot rules if present.

Build, lint, and test commands
- Use the commands below as the primary way to build, lint, and test the project.
- When running a single test, follow the sections labeled "Single test" and "Test by path".

Common commands (Node/TS front-end or static site projects)
- Build: `npm run build`  // or `yarn build` / `pnpm build` depending on the installer used by the project.
- Lint:  `npm run lint`   // optionally `npm run lint -- --fix` to auto-fix.
- Type check (TypeScript): `npm run typecheck`  // or `tsc -p tsconfig.json` directly.
- Test (unit/integration): `npm test`  // configured by the project (Jest / Vitest / Mocha).
- Local serve (optional): `npm start` or `npm run serve` for preview.
- IDE hints: ensure TypeScript/ESLint/Prettier configs are respected during edits.

Running a single test
- Jest users:
  - Run a single test by name: `npm test -- -t "name of test"`.
  - Run a single test file: `npm test -- path/to/file.test.ts`.
- Vitest users:
  - Run a single test by name: `npm exec vitest run -t "name of test"`.
  - Run by file: `npx vitest path/to/file.test.ts`.
- Mocha users:
  - Run by pattern: `npx mocha -g "pattern"`.
- For CI-enabled projects, prefer local runs with scripts to mirror CI environments.

Test by path or pattern (examples)
- Jest file path: `npm test -- path/to/file.test.ts`.
- Jest pattern: `npm test -- -t "initializes"`.
- Vitest path: `npm run test --path path/to/file.test.ts`.
- Mocha pattern: `npx mocha -R spec -g "User can login"`.

Code style guidelines
- These guidelines assume a JS/TS codebase with ESLint and Prettier.
- They aim to keep code readable, maintainable, and easy for agents to reason about.
- They also help ensure consistent experiences across team members and automated agents.

Imports
- Use explicit and stable import paths.
- Organize imports in this order: built-ins, external modules, internal modules, side-effect imports.
- Sort imports alphabetically within each group, and avoid unnecessary re-exports.
- Use absolute or project-root aliases (e.g. `src/...`) instead of long relative paths when appropriate.
- Avoid importing large default exports unless necessary; prefer named imports when possible.

Formatting
- Use Prettier with a consistent format. Enable auto-format on save in editors if possible.
- Use 2-space indentation for JS/TS files unless project config specifies otherwise.
- Prefer semicolons to terminate statements where the project style requires them; align with existing code.
- Keep lines under 100-120 characters where feasible; break long expressions for readability.

Types and interfaces
- Use TypeScript for public APIs and internal modules where possible.
- Prefer interfaces for public object shapes; use type aliases for union or complex types when appropriate.
- Use precise generics and constrain where helpful: `generic<T extends Foo>`.
- Prefer `readonly` for immutable data structures and parameters when possible.
- Avoid `any`; use `unknown` when you must accept arbitrary input and narrow it safely.
- Use discriminated unions for complex state machines and clear error shapes.

Naming conventions
- Files: kebab-case (e.g., `user-service.ts`).
- Classes/React components: PascalCase (e.g., `UserService`).
- Functions/variables: camelCase (e.g., `calculateTotal`).
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`).
- Types and enums: PascalCase.
- Async functions often end with `Async` suffix if they return a promise for a long-running operation.
- Prefer descriptive names; avoid abbreviations unless they are widely understood.

Error handling
- Do not swallow errors; propagate with context when possible.
- Use try/catch around I/O, network, or parsing code; rethrow with additional information.
- Do not leak internal stack traces to users in production; log them and throw sanitized errors.
- For API clients, normalize error shapes with a consistent error type/interface.
- Prefer result-like return values where applicable (e.g., `{ ok: boolean, error?: string }`).

Testing and test structure
- Tests should be deterministic and fast; mock external systems where possible.
- Name tests clearly: e.g., `shouldCalculateTotalCorrectly` or `LoginComponent_rendersBasics`.
- Use a coverage threshold and fail builds if below threshold per CI policy.
- Isolate unit tests; add integration tests for critical paths.
- Provide tests for edge cases and error handling branches.

Code comments and docs
- Prefer self-describing code; use comments to explain non-obvious intent.
- JSDoc/TSDoc for public functions and APIs; describe parameters, return values, and exceptions.
- Avoid excessive comments for obvious logic; keep comments up-to-date with code.

API design and contracts
- Public module boundaries should have stable, well-defined types.
- Avoid breaking changes; deprecate gradually with clear messages.
- Document any breaking changes in CHANGELOG.md and relevant PRs.

Performance and reliability
- Avoid unnecessary allocations in hot paths.
- Debounce or throttle high-frequency events; use caching where safe.
- Prefer streaming or chunked data when dealing with large payloads.

Editor and tooling configuration
- Ensure ESLint, Prettier, and TypeScript are correctly configured in config files.
- If adding new rules, align with existing conventions unless there is a compelling reason to change.
- Include type-check and lint scripts in package.json to simplify agent workflows.
- Provide a minimal, readable README or docstring for new modules.

Cursor rules
- Cursor rules: Not detected in this repository. If Cursor tooling exists, place rules under
- `.cursor/rules/` or `.cursorrules` and reference them here.

Copilot rules
- Copilot instructions: Not detected in this repository. If present, place guidelines under
- `.github/copilot-instructions.md` and reference them here.

Git, CI, and release notes
- Commit messages should be concise and follow a conventional format: type(scope): subject
- Example: feat(auth): add OAuth2 login flow
- CI should run lint, typecheck, and tests on pull requests; ensure coverage checks pass.
- Update CHANGELOG.md with notable changes; reference issue/PR numbers when possible.

Practical tips for agents
- Prefer short, composable functions; small units are easier to test and reason about.
- When in doubt, draft a small unit to verify a hypothesis before touching complex modules.
- In multi-agent tasks, split work into clearly defined subtasks with acceptance criteria.
- If you need context, you can reference package.json scripts and tsconfig.json for defaults.

Endnotes
- This document should be revisited periodically to align with repo changes.
- If you add new tooling or a new language, update the guidelines accordingly.
