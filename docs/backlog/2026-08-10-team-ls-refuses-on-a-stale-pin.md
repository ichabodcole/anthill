# DECIDE: should `anthill team ls` refuse on a stale pin?

**Added:** 2026-08-10 · **Status:** Open — **a decision, not a defect**
**Surface:** `plugin/scripts/anthill/commands/team-team.ts`

`team ls` resolves softly on ambiguity (renders the list) but **exits 1 on a stale pin**. Deliberate,
and the error names the valid teams, so it is recoverable.

**But it sits against the rule the same branch established three times:** _a command that helps you
resolve ambiguity must not require ambiguity to be already resolved._ A stale pin is precisely the
state where a human reaches for `team ls` to find the valid names.

**The case for keeping it:** a stale pin is a typo to report, not an absence to render, and the same
argument justifies `--team bogus` failing. **The case for changing it:** `ls` answers _"which teams
exist"_, which is well-defined regardless of the pin — it could list, and mark the pin as broken.

Decide it rather than leaving it as a wrinkle. Either answer is defensible; the wrinkle is not.
