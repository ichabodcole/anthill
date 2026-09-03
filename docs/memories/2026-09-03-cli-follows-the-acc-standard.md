# The CLI follows the acc standard — census gate, manifest slots, exit 2, contract

**Date:** 2026-09-03

Ran `agent-cli-conformance` 0.1.11 against the CLI and then adopted the standard end to end on
`chore/cli-conformance-run`: a manifest-versus-parser census as a commit gate (26 paths including
the root, 0 disagreements), the manifest's missing slots (`status`, `positionals`, enforced
`values`, the root, `help`), every rejection naming its route forward, usage errors at exit 2 with
`kind`/`exitCode`/`retryable`/`choices` on the envelope, one help document, `help --declaration`
emitting acc v0, and `CONTRACT.md` beside the code. Cole ruled it a minor bump and had `help --json`
enveloped. Three findings went upstream as issues #38–#40.

**Key files:** `plugin/scripts/anthill/CONTRACT.md`, `plugin/scripts/anthill/manifest.census.test.ts`,
`plugin/scripts/anthill/contract.ts`, `scripts/acc-census.sh`, `acc.config.json`

**Docs:** [plan](../projects/cli-declared-surface/plan.md) ·
[session](../projects/cli-declared-surface/sessions/2026-09-03-follow-the-acc-standard.md)
