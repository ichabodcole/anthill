# `upgrade`'s Land step only fits a structural migration — the case the skill calls uncommon

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one step, a second branch
**Surface:** `plugin/skills/upgrade/SKILL.md` step 5 (verify and land), and its Output section

**Found by a blind cold read, 2026-08-10.**

The skill states repeatedly that **content-only releases are the common path** and that step 5 still
runs on them. But the Land block is written entirely for a structural migration — _"the `git mv`s are
already staged"_ — and the only commit message offered is:

```sh
git commit -m "chore: migrate anthill footprint to vN"
```

The reader:

> _"Wrong for the common case, and no alternative given. I would have to invent the commit message,
> and I'd also have to decide on my own whether a doc-only reconcile gets committed at all — the Land
> bullet never says so, and only the Output section ('verified and committed') implies it."_

Two separate gaps: the **message** is wrong, and **whether to commit** is left to inference from a
different section.

## The related finding, and it is the sharper one

Under "what would still be wrong after I follow this plan":

> _"There's no post-check that a seat now reads the corrected guidance — verification is `status`
> (config resolves) and `init` (adds files), neither of which knows anything about content. **The
> skill's own complaint about `migrate` — 'it reports on layout and `status` says nothing about
> content' — applies unchanged to its own verify step.** I'd have no evidence of success beyond
> re-running the diffs I just applied."_

That is the skill's central critique of the tooling, turned back on the skill, by a reader who
learned the critique from the skill. Whatever discharges it will be the useful part of this item —
the commit message is trivia by comparison.

## Also flagged as at-risk-of-skipping

The formatter-ignore check in step 5 is _"a trailing sub-bullet in a bullet list of verifications,
easy to read as advisory."_ And `anthill field-notes` in the detect step is _"inside a blockquote,
mid-list, with no output-handling instruction. I would run it, skim it, and not act on it, while
counting it done."_

## Acceptance Criteria

- [ ] The Land step branches on structural vs content-only, with a message for each, and says
      plainly that a content-only reconcile is committed
- [ ] Step 5 gains a verification that speaks to CONTENT, or states in its own voice that it cannot
      and names what the human must check
- [ ] The `field-notes` read has an output instruction, or is moved out of the detect step
- [ ] Re-cold-read blind for the executable plan, and check the at-risk-of-skipping list shrinks

## References

- `plugin/skills/upgrade/SKILL.md` step 5 and the Output section
