# Coordinating a shared LIVE SERVICE across seats — the 3-leg lock

**Added:** 2026-07-27 · **Status:** needs a design pass (shape is proposed, not settled) ·
**Seat:** weaver (SOP) — possibly forager if a helper is built

anthill teams share a **machine**, not just a tree. A daemon, dev-server, port, socket, or database
is **machine-global and ignores worktrees entirely** — so every isolation mechanism anthill has or
plans is silently irrelevant to it. There is no SOP pattern for coordinating exclusive access to a
shared live runtime resource, so one team invented one under load — and **it failed four times in
one session**, once by each of three seats and once by the lead, each within an hour of having
enforced it on someone else
([#61](https://github.com/ichabodcole/anthill/issues/61)).

That failure distribution is the finding: **enforcement-by-remembering fails under load, uniformly,
including for the person who just enforced it.**

## The four findings, worth folding into the SOP as a standing tool

1. **Isolation is per-RESOURCE, not per-tree.** A worktree or `--detach` isolates _files_. A
   daemon/port/socket/DB does not care.
2. **"Claiming a sha" names git HEAD, never the running artifacts.** Two seats claimed the same sha
   and got **opposite results** — one had an uncommitted edit HMR'd into a live dev server. They
   were on different systems while both believed they were on one, so the contradiction read as a
   _measurement dispute_ rather than a tree problem. A verdict is tree-bound only if every live
   artifact in the loop is pinned **and re-checked at the END of the run** — a start-only check is
   exactly what passed the contaminated run.
3. **An identity handshake proves CONFORMANCE, not IDENTITY.** The right service from the wrong
   session passes every conformance guard. Only **provenance** — pid + start-time + sha + root,
   asserted as _the pid I spawned_ — makes a service sha-bindable.
4. **The enforceable form is a check the harness runs and that INVALIDATES the run** — never a
   remembered rule and never a warning. A rule you must remember fails under load; a warning gets
   narrated past like everything else. The first working instance was asserting
   `git status <service-path>` clean at **start and finish**.

## Proposed shape

An SOP section (or a small helper) for coordinating a shared live service across seats: the
**3-leg lock** — port free · source committed · running-process provenance == claimed sha (≠ null)
— with the **start-and-finish** harness assert.

**Why this needs a design pass rather than just prose:** finding 4 says prose is precisely the form
that _doesn't_ work. If the conclusion is "only a harness-run check is enforceable," then an SOP
paragraph is the known-failing answer and the real question is what anthill can offer mechanically —
and whether that belongs in anthill at all or in the consuming project's test harness. Resolve that
before writing.

## Acceptance Criteria

- [ ] Decide: SOP guidance, an anthill helper, or a documented pattern the project implements —
      given that finding 4 argues against guidance alone.
- [ ] Whatever ships states the per-resource (not per-tree) framing explicitly, since it bounds what
      the [session-branch-strategy](../projects/session-branch-strategy/proposal.md) isolation layer
      can promise.
- [ ] The start-**and-finish** assert is preserved — a start-only check is documented as the known
      failure.

## References

- [`session-branch-strategy`](../projects/session-branch-strategy/proposal.md) — layer 3 (worktree
  isolation) explicitly does **not** cover this; the two should cross-reference.
- `plugin/templates/docs-team/README.md` — the SOP seed, if it lands as guidance.
- Issue: [#61](https://github.com/ichabodcole/anthill/issues/61)
