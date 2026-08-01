# `finalize-session` step 2.5: two gaps found by running it

**Added:** 2026-08-01 · **Status:** ⚠️ **PARTIAL** — the reconcile beat (a THIRD gap, found later by
StoryLoom) shipped 2026-08-01 (`f5668cb`) as step 3.5; **Gaps 1 and 2 below are still open** ·
**Seat:** weaver · **Found:**
team-comms session 1, by running the drift pass for the first time

Step 2.5 — _"re-read every doc you own as its authority and assume it has drifted"_ — **earned itself
immediately.** Every seat that ran it found drift, matching the evidence already in the skill. Two
gaps in its wording surfaced from the run.

## Gap 1 — it re-verifies claims and proofs, but not **open candidates**

Found by forager, and the generalization is his:

> **A concern you raise and hand off gets silently resolved by someone else, and your doc goes on
> claiming it's open.** 2.5 tells us to re-verify _proofs_; **candidates rot the same way and nobody
> re-reads them.**

**The instance:** his seat doc's Candidates listed _"release-please-config.json's version-marker path
looks stale post-restructure."_ He checked instead of assuming: **already resolved** — the config
points at `plugin/scripts/anthill/cli.ts` and the marker is live at `1.7.0`. Somebody fixed it after
he flagged it, and his doc went on asserting it was open.

**Why this rots worse than a stale proof.** A stale proof points at something that no longer exists,
so the next reader hits a dead end and investigates. **A stale candidate points at a problem that no
longer exists** — and the next reader may act on it, re-opening settled work. Handing a concern off is
precisely what removes your reason to look at it again.

→ **Fix:** 2.5 should read _"re-check your open candidates, **not only** your claims and proofs."_
→ **And keep the correction visible:** forager struck the line with the lesson attached rather than
deleting it. A deletion is silent; the strike teaches.

## Gap 2 — a stale roster propagates into every seat doc, and 2.5 has no owner for it

`.anthill/config.json` carried **pre-restructure scopes in every seat field**: `scripts/anthill/`,
`skills/`, `templates/` — **none of which exist**; all three moved under `plugin/`. weaver's also
omitted the `plan` skill, which has existed for weeks.

**The propagation is the point.** A seat doc's header **mirrors** the roster by design. So each seat
was faithfully reproducing a config that pointed at nothing, and **2.5 as written sends each seat to
check its own doc — where the mirror is, not where the original is.** forager correctly declined to
fork his header and flagged the config instead; a seat that "fixed" its own header would have hidden
the broken source.

→ **Fix:** 2.5 (or step 4, the structure reflection) should name the roster explicitly as the lead's
drift check — _"the lead verifies every `seats[].scope` path still resolves"_ — since it is the one
doc no seat owns and every seat mirrors.
→ Note this is the same shape as the cascade map's existing scar about `plugin.json`'s description
omitting `upgrade`: **a consumer-visible restatement of a list, with nothing pointing at it.**

## Also observed, not a skill defect — recorded so it isn't rediscovered

**Skill resolution is pinned per-session, and a mid-session plugin update does not reach a session
already running.** Established by comparing panes, not inferred:

- The **lead's** session began before the plugin was updated. Its Skill tool resolved anthill `1.5.0`
  **twice** — at convene and again at finalize — while `installed_plugins.json` reported `1.7.0`.
- The **seats'** panes were spawned _after_ the update. sentinel confirmed its own Skill tool resolved
  **`1.7.0`, with step 2.5 present.**

So this is not a broken cache; it is **a session holding the version it started with.** Caught only
because the skill prints its own path at load.

**Consequence, and it is asymmetric in the worst way: the stale session was the LEAD's.** The 1.5.0
finalize skill **has no step 2.5 at all** — so the agent running the ritual for the whole team had the
version missing the step that then found drift in every seat's docs, while the seats it was
instructing had the correct one. The lead pasted 2.5 verbatim onto the vine as a workaround.

→ Not an anthill defect. **But it is worth a line in the release notes**: after updating the plugin,
**restart any session that was already open** — most importantly the lead's, which is the session that
convenes and finalizes. A stale skill is invisible from inside the repo, the failure is silent, and
the seat least likely to notice is the one whose panes are all correct.

_(An earlier draft of this note claimed the seats may also have received the stale join skill. That
was wrong and is retracted — sentinel's pane data disproves it. Recorded rather than deleted, per
Gap 1.)_

## Acceptance Criteria

- [ ] 2.5 names **candidates** alongside claims and proofs.
- [ ] The **roster's scope paths** have a named owner in the drift pass — the lead, not the seats.
- [ ] Guidance to **strike-with-lesson** rather than delete a resolved candidate.

## References

- [Session 1 friction log](../projects/team-comms-spike/session-1-friction.md).
- `plugin/skills/finalize-session/SKILL.md` step 2.5; `.anthill/config.json`.
- `.claude/skills/cascade-check/SKILL.md` — the `plugin.json`-description scar, same shape as Gap 2.
