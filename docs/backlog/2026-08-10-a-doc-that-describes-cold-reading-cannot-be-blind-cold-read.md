# A document that describes cold reading cannot be blind cold-read — the instrument names itself

**Added:** 2026-08-10 · **Status:** Open · **Shape:** a caveat in the procedure, not a code change
**Surface:** `plugin/skills/finalize-session/SKILL.md` step 2.6 · `plugin/scripts/anthill/field-notes.md`

**Measured 2026-08-10.** A cold read of `field-notes.md` was designed blind: fresh agent (never a
fork), audience context only, restatement requested rather than a verdict, new material unmarked
among older entries. The reader opened its report with this, unprompted:

> _"The task I was given is, almost step for step, the procedure described in the document's own
> 'cold read' entry — restate it, name what you couldn't interpret, ask blind. I couldn't tell
> whether I was being handed reading material or being used as an instrument. That may color how I
> read; I'm reporting it rather than pretending it didn't happen."_

**The blinding failed, and no prompt could have saved it.** The document contains a description of
the procedure being run on it. Any reader competent enough to give a useful cold read is competent
enough to recognise itself inside the text — which is the observer effect arriving through the
artifact rather than through the framing.

That reader still produced the session's most valuable findings, so this is **a caveat on
interpretation, not a reason to stop.** But two of its softer observations were about the cold-read
entry itself, and those specifically cannot be taken at face value: a reader that knows it is being
measured has a reason to comment on the measurement.

## What to write down

`finalize-session` step 2.6 currently tells an author to get a cold read. It does not say what to do
when **the document describes the procedure**, which is not an edge case for this project — anthill
writes documentation about how agents should work, so its docs will keep describing the instruments
used on them.

Candidate discharges, for whoever picks this up to choose between rather than adopt:

- **Split the read.** Hand the reader the sections under test without the entry describing the
  procedure. Cheap, and costs the whole-document reading that step 2.6 explicitly asks for.
- **Name it and weight it.** Keep the read whole, expect the recognition, and discount only the
  reader's remarks _about_ the procedure. Honest, and leaves the bias unmeasured.
- **Use a reader that cannot generalise from the text** — a much smaller model for the comprehension
  pass. Changes what "a reader" means, which may invalidate the comparison across reads.

## Acceptance Criteria

- [ ] Step 2.6 names the case and says what to do, in one or two lines — this is a caveat, not a
      new procedure
- [ ] The guidance survives leaving this project: any team documenting its own working methods hits
      this, not just us

## References

- `plugin/skills/finalize-session/SKILL.md` step 2.6
- `plugin/scripts/anthill/field-notes.md` — the "get a cold read" entry
- [Observer effect in agent probes] — priming a behavioural question taints it; this is the same
  effect arriving through the artifact instead of the prompt
