# `anthill commit` hardening — Implementation Plan

**Created:** 2026-07-10 · **Revised:** 2026-07-27
**Status:** ⚠️ **Mostly shipped — needs a revision pass to reflect reality.** Intake items 3–6 and
move 2 landed 2026-07-27 (`2170636`, archived as
[`anthill-commit-correctness-batch`](../../backlog/_archive/2026-07-27-anthill-commit-correctness-batch.md)).
Four further field defects landed 2026-08-01 (`f5668cb`) — see
[the session](sessions/2026-08-01-storyloom-field-fixes.md). **Move 1 (protected-trunk guard) is the
only original move still open**, and it is tracked separately as
[`anthill-commit-protected-trunk-guard`](../../backlog/2026-07-10-anthill-commit-protected-trunk-guard.md).
The plan text below still describes the pre-intake world and should be rewritten or retired before
anyone picks it up.
**Shape:** light build — single seat/surface (`plugin/scripts/anthill/`), no owner↔owner seam →
forager implements, sentinel verifies, no full convene / ratify gate.

---

## Intake (2026-07-27) — four more defects arrived from the field

The 2026-07-27 issue triage surfaced **four additional `anthill commit` defects**, all in this same
file, all with named repros and named fixes. They belong in this plan as **moves 3–6**; the plan
below still describes only moves 1–2 and should be extended before anyone picks it up.

See [`backlog/2026-07-27-anthill-commit-correctness-batch.md`](../../backlog/2026-07-27-anthill-commit-correctness-batch.md)
for the full write-ups. In short:

3. **Stage-before-verify strands the index** ([#55](https://github.com/ichabodcole/anthill/issues/55)) —
   a failed commit leaves your paths staged, silently making you the blocker for every other seat.
   **Sharper and more urgent than either currently-planned move.**
4. **Cannot stage deletions** ([#48](https://github.com/ichabodcole/anthill/issues/48)).
5. **Dies on git-mv rename pairs** ([#51](https://github.com/ichabodcole/anthill/issues/51)) — likely
   the same fix as 4; verify before writing two.
6. **No pre-flight warning before the shared gate** ([#50](https://github.com/ichabodcole/anthill/issues/50)) —
   check for overlap with move 2 (foreign-red diagnostic), which covers the _failure_ path where this
   covers the _pre-flight_ path.

**Sequencing note:** move 1 (protected-trunk guard) is the land-time twin of layer 1 in the new
[session-branch-strategy proposal](../session-branch-strategy/proposal.md) — convene _offers_ the
branch, the commit wrapper _refuses_ the protected one. Refusing a commit on a trunk is only humane
if something offered a branch first, so **consider designing move 1 alongside that proposal** even
though moves 3–6 can ship immediately and independently.

---

## Overview

Two small, independent, land-time hardenings of `anthill commit` — the serialized shared-tree land
wrapper (`plugin/scripts/anthill/commands/team-commit.ts`). Both are backstops at the one interception
point every seat's commit already flows through, and both mirror the command's existing pure-helper +
dual-audience-envelope style (`unexpectedStaged`):

1. **Protected-trunk guard** — refuse a direct commit when HEAD is on a **configurable** protected
   branch (unless `--force`). The land-time complement to the convene pre-spawn branch beat (#34): convene
   _prompts_ the branch decision, the commit wrapper _backstops_ it. **The protected set is
   project-configured, never a baked-in `develop`/`main`** — per the `adapt-not-dictate` principle
   (`AGENTS.md`), anthill supplies the mechanism, the project supplies the branches.
2. **Foreign-red diagnostic (shared-tree move C.1)** — when the commit dies on the whole-tree pre-commit
   gate, tell the seat if the red is on paths **outside** the set it committed: _"the gate also sees
   uncommitted changes outside your commit (`<list>`) — if the failure is one of those, it's not your
   commit."_ The proxy-free slice of move C: it runs only on the **failure** path (the gate already ran),
   so it needs no pre-flight proxy.

**Why now / the "why" lives here:** the protected-trunk guard's rationale is in
[`backlog/2026-07-10-anthill-commit-protected-trunk-guard.md`](../../backlog/2026-07-10-anthill-commit-protected-trunk-guard.md);
C.1's is move C in
[`shared-tree-gate-tension`](../shared-tree-gate-tension/proposal.md) (four field reports #14/#16/#24/#28,
a first-party reproduction, and a lead-blocks-seats instance). This plan implements both; it is not a new
proposal.

## Outcome & Success Criteria

**Definition of Done:**

- [ ] `anthill commit` on a branch listed in `guard.protectedBranches` **refuses** (dual-audience
      envelope, exit 1) unless `--force` is passed; the message names the branch and points at the branch
      policy / convene beat.
- [ ] With `guard.protectedBranches` **unset or empty**, the guard is a **no-op** (never surprises a repo
      that didn't opt in) — including when there is **no `.anthill/config.json`** at all.
- [ ] On a commit that fails the whole-tree gate because of files **outside** the committed paths, the
      error surfaces those foreign dirty paths as a **heuristic** hint ("may be…"), alongside the raw gate
      output — so a seat stops reading "my own commit failed."
- [ ] A commit that fails for a reason **inside** its own paths shows **no** misleading foreign-red hint.
- [ ] `bun run check` green; new unit tests cover the two pure helpers.

**Non-Goals:**

- The structural move-C proxy ("can the tree pass _right now_" _before_ the land) — C.1 is failure-path
  only; the pre-flight proxy stays deferred.
- Scoping the husky hook to the committed pathspec (#28's other angle) — separate, larger.
- Inferring the protected set from the remote's branch protection or grounding docs — unset ⇒ off is the
  v1 default (see Open Questions).

## Approach Summary

Two pure, unit-tested helpers keep the side-effectful command body thin, exactly like the existing
`unexpectedStaged`:

1. `protectedTrunkBlock(branch, protectedBranches, force)` → refusal reason `string | null`.
2. `foreignDirtyPaths(porcelain, ourPaths)` → the dirty paths outside `ourPaths` (parsed from
   `git status --porcelain`).

Everything else is wiring them into `team-commit.ts` plus one config-schema addition. The guard runs
**before** the serialize lock (fail fast, no lock churn); the diagnostic runs **on the commit-failure
branch** (after the gate has spoken).

## Phases

### Phase 1: Protected-trunk guard

**Goal:** `anthill commit` refuses a direct land on a project-configured protected branch unless forced.

**Key Changes:**

- **Config schema** (`plugin/scripts/anthill/config.ts`): add optional `guard?: { protectedBranches?:
string[] }` to `RawTeamConfig` and `ResolvedConfig`; in `resolveConfig`, default it to `[]` (unset ⇒
  guard off). Keep it a nested object so future guards (`guard.*`) have a home.
- **Pure helper** (`team-commit.ts`): `export function protectedTrunkBlock(branch: string,
protectedBranches: string[], force: boolean): string | null` — returns a refusal reason when
  `!force && protectedBranches.includes(branch)`, else `null`. No git, no I/O.
- **Arg**: add `force: { type: "boolean", description: "Bypass the protected-branch guard" }` to the
  command's `args`.
- **Wire** (`run()`, after the message/paths guards, **before** `acquireLock`): resolve config via
  `loadProject(root)` wrapped in try/catch — on `ConfigError` (no team config) treat as **guard off**, do
  not fail the command. Read the current branch with `git(["rev-parse", "--abbrev-ref", "HEAD"], root)`
  (a detached HEAD returns `"HEAD"` — harmless, won't be in the set). Call `protectedTrunkBlock`; on a
  non-null reason, `emitError` (message names the branch, cites the branch policy / convene beat, and
  says how to override with `--force`) and `process.exit(1)`.

**Validation:**

- [ ] Unit: `protectedTrunkBlock("develop", ["develop","main"], false)` → non-null; `(…, true)` → null;
      `("feat/x", ["main"], false)` → null; `("main", [], false)` → null.
- [ ] Manual: with `.anthill/config.json` `guard.protectedBranches: ["main"]`, `anthill commit` on `main`
      refuses; `--force` lands; on `develop` (not listed) lands normally; with the key removed, lands on
      any branch.
- [ ] `bun run check` green.

**Dependencies:** none.

---

### Phase 2: Foreign-red diagnostic (move C.1)

**Goal:** a gate failure caused by files outside the committed set says so, instead of reading as the
seat's own fault.

**Key Changes:**

- **Pure helper** (`team-commit.ts`): `export function foreignDirtyPaths(porcelain: string, ourPaths:
string[]): string[]` — split `git status --porcelain` output, strip the two-char `XY ` status prefix,
  handle rename entries (`old -> new` → take `new`), and return the dirty paths **not** in `ourPaths`
  (a `Set`, same namespace as the existing `unexpectedStaged`). Sorted, deduped.
- **Wire** (`run()`, the `git(["commit", …])` failure branch, currently lines ~218–222): instead of
  bare-throwing, compute `foreignDirtyPaths(git(["status","--porcelain"],root).stdout, paths)`. Build the
  error: the raw gate output **plus**, when the foreign set is non-empty, a **heuristic** line —
  _"Note: the whole-tree pre-commit gate also sees uncommitted changes outside your commit (`<list>`). If
  the failure is about one of those, it's not your commit — it's the shared-tree gate seeing another
  lane's file."_ Emit via `emitError` (release the lock first, mirroring the `unexpectedStaged` guard)
  so JSON mode keeps the clean envelope; optionally include `foreignDirty: string[]` on the error data.
- Phrase it as a **possibility, not a verdict** — the correlation (dirty-outside-paths ↔ gate red) is a
  heuristic, not proven causation; over-claiming would mislead as badly as the current silence.

**Validation:**

- [ ] Unit: `foreignDirtyPaths(" M other/file.ts\n M mine.ts\n?? junk.txt", ["mine.ts"])` →
      `["junk.txt","other/file.ts"]`; rename `R  a.ts -> b.ts` with `ourPaths=["b.ts"]` → `[]`; empty
      porcelain → `[]`.
- [ ] Manual: with a broken `.ts` under `plugin/` left **unstaged** by "another lane", `anthill commit`
      of an unrelated clean doc fails the gate and the error lists that foreign `.ts`; committing with no
      foreign dirt shows no hint.
- [ ] `bun run check` green.

**Dependencies:** none (independent of Phase 1; can land in either order).

---

### Phase 3: Docs + trail

**Goal:** the new config knob and the shipped increments are legible in the trail.

**Key Changes:**

- Document `guard.protectedBranches` where the config schema is described (config.ts doc-comment + the
  SOP/`.anthill/README.md` config section if it enumerates keys). State the default (unset ⇒ off) and the
  `adapt-not-dictate` rationale (project supplies the branches).
- Update source docs: mark the
  [protected-trunk-guard backlog item](../../backlog/2026-07-10-anthill-commit-protected-trunk-guard.md)
  as **in progress → shipped** (link the commit), and note in
  [`shared-tree-gate-tension`](../shared-tree-gate-tension/proposal.md) that **C.1 shipped** (full C's
  pre-flight proxy still deferred). Roadmap: move both from "Recently captured" to shipped.
- If the branch-safety pair reads as a durable boundary, add a one-liner to `.anthill/dev/seams.md`
  (only if it's genuinely shared truth — else skip per point-don't-restate).

**Validation:**

- [ ] `bun run check` green (docs are prettier-formatted at pre-commit).
- [ ] Grep: no stale "captured, not built" wording left on the two shipped items.

**Dependencies:** Phases 1–2 landed.

## Key Risks & Mitigations

- **`loadProject` throws where the command used to work config-free** → wrap in try/catch, `ConfigError`
  ⇒ guard off. `anthill commit` must never regress for a non-team or config-less use.

  > **Amended 2026-08-10.** This move originally said `loadConfig`, which was **deleted** that day
  > (`fix/config-resolver-hygiene`) — a single-team fs entrypoint reports `config.channel is required`
  > against a valid `teams` map, so it was wrong for the shapes that now exist, not merely unused.
  > `loadProject` is the resolving fs entrypoint; which team applies is `resolveTeam`'s job
  > (`commands/team-support.ts`), and `requireConfig` is the ready-made wrapper for a command that
  > needs one team. The guard wants the PROJECT here — a protected trunk is a repo-level fact, not a
  > team's.

- **Foreign-red hint over-claims causation** → phrase as a heuristic possibility, always show the raw
  gate output too; the hint augments, never replaces, the real error.
- **`git status --porcelain` path parsing** (renames, quoted paths with spaces/unicode) → the pure helper
  owns this; test the rename + `??` untracked + normal-modify cases. (Core-quotepath edge: acceptable for
  a v1 heuristic; note it, don't gold-plate.)
- **Detached HEAD** (`rev-parse --abbrev-ref HEAD` → `"HEAD"`) → harmless; `"HEAD"` won't be a configured
  protected branch, so the guard no-ops.

## Testing & Validation Strategy

- **Unit (pure seams):** `protectedTrunkBlock` and `foreignDirtyPaths`, alongside the existing
  `unexpectedStaged` tests in `team-commit`'s test file — same pattern, no git, no network.
- **No new tests for the side-effectful body** beyond asserting it calls the helpers; the argv/branch/
  porcelain composition is where correctness lives.
- **Manual** the two scenarios above once by hand (protected-branch refuse/force; foreign-red hint) and
  record in the session doc.

## Assumptions & Constraints

- `anthill commit` stays the single land interception point (the serialize lock + explicit-paths verify
  already there); both additions are siblings of the existing index verification.
- The husky pre-commit gate remains whole-tree (this plan diagnoses that coupling for C.1; it does not
  change the gate — that's #28's scope-hooks angle, out of scope here).

## Open Questions

- **Default for `guard.protectedBranches` when unset** — confirmed **off** (opt-in) for v1. Revisit a
  best-effort inference (remote default-branch protection, or the grounding-doc policy) only if opt-in
  proves too easy to forget.
- **Warn vs. refuse-without-`--force`** — plan takes **refuse + `--force`** (a rule, not a suggestion);
  flag at build if a softer warn is preferred for some branch classes.
- **C.1 hint precision** — the dirty-outside-paths heuristic is intentionally coarse; is that enough, or
  is parsing the gate's own file citations (tsc/biome) worth it later? Lean: coarse-but-honest now.

---

**Related Documents:**

- Sources: [protected-trunk-guard backlog](../../backlog/2026-07-10-anthill-commit-protected-trunk-guard.md) ·
  [shared-tree-gate-tension (move C / C.1)](../shared-tree-gate-tension/proposal.md)
- Principle: `AGENTS.md` "What's not obvious" — adapt-not-dictate (`ff2770e`)
- Complements: convene pre-spawn branch beat — anthill [#34](https://github.com/ichabodcole/anthill/issues/34) (`4770e05`)
- Touch point: `plugin/scripts/anthill/commands/team-commit.ts`, `plugin/scripts/anthill/config.ts`
