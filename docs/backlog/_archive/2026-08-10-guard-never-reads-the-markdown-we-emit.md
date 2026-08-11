# The bare-`anthill` guard never reads the markdown we EMIT to agents

**Added:** 2026-08-10 · **Status:** Fixed 2026-08-10 (`fix/guard-reads-emitted-markdown`) · **Shape:** widen one walk, add one classification
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

- [x] The walk reaches `field-notes.md` and `plugin/templates/docs-team/**`
- [x] `principles.md`'s fenced block is fixed at the source, and the fix reaches existing teams
      (`init` skips existing files — say it in the release notes, per the cascade map)
- [x] A positive control injects a defect into the NEW surface, so the widened walk proves it can
      still see — not merely that it ran

## References

- `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts:135` (`sourceFiles()`)
- `plugin/scripts/anthill/commands/team-field-notes.ts:25`
- Found by the guard-coverage audit, 2026-08-10; independently re-verified before filing

---

## Resolution — 2026-08-10

The walk now covers `field-notes.md`, `templates/docs-team/**` **and `skills/**`** — the third route
found by running the cascade check, not by reasoning, and the largest of the three. Markdown gets its
own two rules: a **fence** must be runnable or absent, and **prose** may use the shorthand if its own
document carries the legend. That turns ~25 sites into file-level facts instead of an allow-list.

**The fix for the fence was itself wrong, and a cold read caught it.** `principles.md`'s bare
`anthill field-notes` was first "resolved" to `bun "${CLAUDE_PLUGIN_ROOT}/…"`. But
**`${CLAUDE_PLUGIN_ROOT}` is only set while a plugin skill runs** — verified unset in a plain shell —
so a seat reading its own living doc got a command expanding to `bun "/scripts/anthill/cli.ts"`. One
broken command traded for another, with a guard newly enforcing the trade.

The real constraint is stronger than the original defect: **no static rendered doc can carry a
runnable invocation at all**, because the path depends on where the plugin is installed. That is why
the shorthand exists. So the fence is now prose pointing at `anthill:join`, which emits the resolved
path, and every legend says where to get it. The three fences in `skills/` keep the
`${CLAUDE_PLUGIN_ROOT}` form, because inside a skill it _is_ set — the distinction the first pass
missed.

## Review round 1 — 2026-08-10

**Blocking: the new walk had no scan-set pin for `skills/`.** Deleting `walk("skills")` left the
guard green **and the whole suite green with the branch's own defect put back** — the precise rule
`AGENTS.md` §"How we test" #2 exists to enforce. Worse than the `.ts` half it was written to improve
on: not a weak floor, no floor at all. **And an empty allow-list cannot cover for a walk** — reading
it backwards protects only through the entries it holds. Fixed by naming the skill files that held
defects, plus the portable half and a sub-document; mutation re-run, now RED.

**Six fence evasions**, three now closed by tracking the marker's character and length and stripping
blockquote markers: a fence inside a **blockquote** (the house idiom — every legend is one), a `~~~`
quoted inside a ``` block **inverting parity for the rest of the file**, and a 4-backtick fence
closing on a nested 3-backtick example. Three remain and are now asserted as `KNOWN LIMIT`:
indented blocks, HTML `<pre>`, hand-wrapped lines. **Indentation was measured, not assumed** — it
produces 26 hits across four skills, every one a nested list continuation.

**False prose, all corrected:** a test named "still seen" whose assertion said the reverse; a
rationale citing prettier wrapping when this repo sets `proseWrap: preserve` and prettier never
reflows fenced content; "the eight skills" when there are seven.

**Also:** the legend could be satisfied by text inside a fence — fenced content is now stripped
before the check. A **negated** legend still passes, and that is recorded as needing a reader, not a
pattern. The `comms` fence fix had dropped its trailing instruction; restored. And the legend is
seeded into `retro.md`, `dev/seams.md` and `dev/{{handle}}.md`, which carry no shorthand as
templates and accumulate it as a team writes — our own `.anthill/retro.md` has 15 uses and
`dev/forager.md` 27.

**One reviewer candidate rejected after interpretation:** a fenced `anthill init` in
`.anthill/dev/weaver.md` is a seat's transcript of a run it performed, inside its own historical
record. Rewriting it would falsify the record, and the guard correctly does not scan `.anthill/`.
