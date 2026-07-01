# `anthill:upgrade`: reconcile a stale root AGENTS/CLAUDE pointer post-migration

**Added:** 2026-06-30 · **Status:** Open — from the first real v1→v2 upgrade (media-buffet)

Asymmetric with bootstrap. `anthill:bootstrap` drops a root `AGENTS.md`/`CLAUDE.md` methodology pointer
announcing "this repo uses anthill; team docs live in `<teamDir>`." After a v1→v2 upgrade (especially
with a `docs/team` → `.anthill/` consolidation), a repo that had adopted that pointer is left with a
STALE reference ("team docs live in `docs/team/`") — and `migrate` never scans for or updates it.

(On media-buffet itself no fix was needed — it had no root pointer, only `docs/AGENTS.md` /
`docs/CLAUDE.md` that don't name the team dir. But the general gap is real, and it's the twin of the
bootstrap-pointer work.)

**Fix:** the bootstrap methodology-pointer now ships (AGENTS-primary + CLAUDE-redirect). `anthill:upgrade`
/ `migrate` should **reconcile** it in the same pass — detect a root pointer that names the old
team-docs location and update it to `.anthill/` (or the new `paths`). Idempotent: no pointer, or an
already-correct one, → no-op.

## Acceptance Criteria

- [ ] after a v1→v2 upgrade, a root AGENTS/CLAUDE pointer naming the old team-docs dir is updated to the
      new location, not left stale
- [ ] idempotent — no pointer present, or already correct → no-op

## References

- Field report: grapevine `anthill-feedback` msg 8 (arthur / media-buffet), finding #5
- Twin of the bootstrap pointer: `docs/backlog/_archive/2026-06-30-bootstrap-root-agent-context-pointer.md`
  (bootstrap _drops_ the pointer; upgrade must _reconcile_ it)
- Project: [anthill-footprint-migration](../projects/anthill-footprint-migration/plan.md)
