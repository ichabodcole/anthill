# The bare-`anthill` guard never reads the markdown we EMIT to agents

**Added:** 2026-08-10 · **Status:** Open · **Shape:** widen one walk, add one classification
**Surface:** `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts` (`sourceFiles()`)

**A live escape, and it only ships to consumers.** `plugin/templates/docs-team/principles.md:29-31`
is a fenced `sh` block whose entire content is:

```sh
anthill field-notes
```

`anthill init` renders that file into every consuming team's `.anthill/principles.md`. A seat reading
its own principles doc sees a fenced shell command and runs it — which is the whole defect class the
guard exists to prevent, since `anthill` is not what a consuming project invokes (`bun
<plugin-root>/scripts/anthill/cli.ts` is).

**Why the guard cannot see it:** `sourceFiles()` walks `*.ts` only. But two commands emit markdown
straight to agents:

- `anthill field-notes` reads `plugin/scripts/anthill/field-notes.md` and prints it verbatim
  (`commands/team-field-notes.ts:25`, `:57`).
- `anthill init` renders `plugin/templates/docs-team/**` into a project's living docs, which every
  seat reads at join.

Neither is scanned. **Confirmed by mutation 2026-08-10:** a runnable, placeholder-free bare
invocation appended to `field-notes.md` left the guard GREEN and the whole suite GREEN at 709.

**It is invisible from inside this repo.** `init` never clobbers, so our own `.anthill/principles.md`
predates the block and does not carry it — the defect is real for new teams and absent from the tree
we test against. This is the cascade map's "template improvements reach new teams only", running in
the direction that hides a defect instead of delaying a fix.

## The part that needs judgement, not just a wider walk

Most bare `anthill …` in these files are legitimate: prose naming the tool (``the wire and a board —
`anthill comms` ``), or instructions carrying a `<handle>` placeholder that nobody can paste. The
guard already classifies; the new surface needs its own reading of what counts. Candidates that are
runnable as written today, for whoever picks this up to classify rather than assume:

- `plugin/templates/docs-team/principles.md:30` — fenced, bare, runnable (the clear defect)
- `plugin/templates/docs-team/README.md:351`, `dev/README.md:24` — `anthill init` in prose, runnable
- `plugin/scripts/anthill/field-notes.md:255` — `anthill feedback "<what happened>"`, placeholder-bearing

## Acceptance Criteria

- [ ] The walk reaches `field-notes.md` and `plugin/templates/docs-team/**`
- [ ] `principles.md`'s fenced block is fixed at the source, and the fix reaches existing teams
      (`init` skips existing files — say it in the release notes, per the cascade map)
- [ ] A positive control injects a defect into the NEW surface, so the widened walk proves it can
      still see — not merely that it ran

## References

- `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts:135` (`sourceFiles()`)
- `plugin/scripts/anthill/commands/team-field-notes.ts:25`
- Found by the guard-coverage audit, 2026-08-10; independently re-verified before filing
