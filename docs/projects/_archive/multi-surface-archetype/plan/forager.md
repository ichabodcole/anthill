# forager's lane — the `anthill scan` command + its detectors

**Owner:** forager (hands / CLI + engine) · **Authoritative for:** `ScanReport`
([seams.md Contract 1](../../../../.anthill/dev/seams.md)) · **Consumed by:** weaver.

This lane builds the deterministic reader that turns a repo on disk into the ratified `ScanReport`
envelope that weaver's candidate-seating logic is a pure function of.
The split follows the house dual-audience convention: pure detectors are the unit-test target, and a
thin `team-scan` command emits the `{ ok, data }` envelope through the agent-layer.

## Files

1. `scripts/anthill/scan.ts` — the pure detector module (sibling to `migrate.ts` / `config.ts`).
2. `scripts/anthill/scan.test.ts` — pure-detector unit tests + golden `ScanReport` per fixture.
3. `scripts/anthill/commands/team-scan.ts` — the `scan` command via `defineAnthillCommand`.
4. `scripts/anthill/commands/team-scan.test.ts` — one e2e running the whole CLI over a fixture.
5. `scripts/anthill/__fixtures__/workspace-repo/` — 2 apps + 1 shared package with a real edge.
6. `scripts/anthill/__fixtures__/single-surface-repo/` — one root package, no workspaces.
7. `scripts/anthill/cli.ts` — register `scan` in the sub-command list.

## The detectors (pure, in-memory manifests where possible)

- `resolveScanRoot(startDir)` — walk up from `startDir`; return the first ancestor holding `.git`,
  else the topmost ancestor holding a `package.json`, else `startDir`.
  This resolves BEFORE `.anthill/` exists — it never touches the config walk-up (that would throw
  during bootstrap discovery).
- `detectManager(rootDir)` — lockfile sniff: `bun.lock`/`bun.lockb`→bun, `pnpm-lock.yaml`→pnpm,
  `package-lock.json`→npm, `yarn.lock`→yarn, else null.
- `parseWorkspaceGlobs(rootPkg, pnpmYamlText?)` — `package.json` `workspaces` (array or
  `{ packages }` form) unioned with a hand-parsed pnpm `packages:` list. No YAML dependency.
- `sniffStack(manifest)` — deps ∩ a fixed dominant-first marker table → `stack[]`, so `stack[0]` is
  the primary framework (meta-frameworks rank above their base lib: `next` before `react`, `nuxt`
  before `vue`, `expo` before `react-native`, `sveltekit` before `svelte`).
- `classifyUnit(manifest, relPath)` — glob position first (`apps/*`⇒app, `packages/*`⇒package),
  then manifest signal when position is silent (private + framework⇒app, publishable + no
  framework⇒package), default ⇒ package.
- `internalDepsOf(manifest, memberNames)` — all dep names ∩ member names, minus self, sorted.
- `buildScanReport(rootDir)` — the orchestrator: reads the root manifest, expands member globs via
  `Bun.Glob`, builds each `ScanUnit`, then resolves `internalDeps` against the member-name set.

## Ratified rules I honor

- `stack` is dominant-first and `package.json`-deps only for v1 (no config/language/runtime sniff).
- `internalDeps` = deps ∩ member names — the edges weaver folds fan-in ≥ 2 over.
- Single-surface (no workspace globs) ⇒ `workspace: null` + one root unit at path `"."`.
- Guards emit (never throw) in JSON mode — a malformed root manifest is a warning, not a crash.

## Verification (my slice)

- `bun test scripts/anthill/` green — pure-fn tests + a deep-equal golden `ScanReport` per fixture.
- `bunx biome check --write scripts/anthill/` clean.
- I do NOT run the full `bun run check` — weaver edits the same tree in parallel.
