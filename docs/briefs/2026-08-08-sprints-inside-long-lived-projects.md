# Sprints inside long-lived projects — adopt the structure Spellbook built, at the next arc boundary

**Added:** 2026-08-08 · **Status:** proposal, needs Cole's ratification · **Raised by:** Cole
**Studied from:** `Spellbook/docs/projects/spell-hardening/` at 2026-08-08 (four sprints, three
complete)

---

## The problem it solves, in our own words

We do not currently have a unit of work between **"a project"** (months, e.g. the coordination-hardening
arc) and **"a session"** (hours). So a long-lived project gets **one `plan.md` that is continuously
rewritten** to absorb whatever the latest session learned.

**Three of our own recorded failures are that pattern:**

1. **`comms-as-default/plan.md` carries a `§ NEXT PHASE — what session 12 picks up`.** A plan doc with a
   mutable "what's next" section **is** the rewrite-in-place habit. The ROADMAP even warns that the
   branch name `feat/comms-as-default-phase-3` _"misdescribes the remaining work."_
2. **`S13-A … S13-N` is a sprint with no sprint.** Fourteen IDs, no plan doc, no outcome, no close —
   and the ROADMAP already records the collision this causes: _"`S12-1` resolves to a different seat's
   card (the R7 S-number collision — **cite card ids, never S-numbers**)."_ **We invented sprint
   numbering without sprint structure**, and got the ambiguity without the benefit.
3. **`principles.md`: _"A DEFERRAL IS NOT A DECISION UNTIL IT NAMES A HORIZON AND A HOME."_** Sprints
   supply both **by construction** — the horizon is the next sprint, the home is its
   `CARRY-FORWARD` section. We currently satisfy that principle by remembering to.

## What they actually built

```
docs/projects/spell-hardening/
├── README.md          ← the sprint TABLE + status vocabulary + releases
├── proposal.md        ← the arc
├── artifacts/         ← durable measurement products
├── _history/          ← superseded docs, kept
└── sprints/
    ├── 01-drained-exit/            plan.md · outcome.md
    ├── 02-success-shaped-lies/     plan.md · outcome.md · decisions.md · release-note.draft.md
    ├── 03-what-close-takes-with-it/ plan.md · decisions.md
    └── 04-the-shape-of-nothing/    plan.md          ← 🟡 Scaffold
```

### The rule that makes it work, and it is one sentence

> **"Sprint 03 restates each item in its own words with its own references. It does not reach back and
> amend sprint 02."**

**A closed sprint is immutable.** Nothing edits it; the next sprint re-states what it inherits. That is
the whole difference from a rewritten `plan.md`, and it is why the record stays readable.

### Five conventions worth stealing outright

1. **`outcome.md` has a section for what it could NOT classify** — _"What this outcome could not
   confidently classify."_ That is the **"could not determine"** bucket from
   [the no-stake reader](../backlog/2026-08-08-the-no-stake-reader.md), arriving in a completely
   different document. Two independent derivations.
2. **`CARRY-FORWARD` names what is NOT carried**, explicitly, alongside what is. Enumeration
   completeness applied to a handoff — and it is our own
   `principles.md`: _"a ruling must name what it did not rule on."_
3. **"Traps that must survive into sprint 03"** — _"a builder reading only sprint 03 must not walk
   into a trap sprint 02 already paid for."_ **This is the single most valuable section**, and we have
   no equivalent anywhere.
4. **A `Scaffold` status, added because the enumeration was incomplete** — _"the previous four values
   had no way to say 'proposed', so a scaffold would have had to masquerade as `Active` or hide as
   `Not planned`."_ 🟡 Scaffold means _argued but not ratified and not buildable._
5. **`Left for Cole (not the agent's call)`** — a named section for human decisions, so they cannot be
   silently absorbed.

**And they annotate rather than rewrite even when the scope widens** — sprint 03 broadened the project
and the README says so in a box (_"the sentence above no longer covers all of it"_) instead of editing
the sentence. Same house style as ours.

## ⚠ Two honest cautions

**(a) Their own structure caught them out, and the failure is instructive.** Sprint 03 shipped with
**no `outcome.md`**, and the README still said _"scaffolded, awaiting ratify"_ a day later — found by a
fresh agent that _"could not establish from the docs whether the sprint had happened."_ **The structure
does not maintain itself.** It needs a close beat with teeth, or it produces a more confident-looking
staleness than we have now.

**(b) 🔴 ADOPT IT FOR OUR OWN DOCS — DO NOT SHIP IT IN THE TEMPLATES.** anthill's governing doctrine is
_adapts to the host project, does not dictate its conventions._ A sprint folder layout baked into
`plugin/templates/` is **exactly the anti-pattern**: it would impose one project-management shape on
every consuming team.

**What anthill could legitimately ship is the TRIGGER, not the content** — e.g. a finalize beat asking
_"is this arc at a boundary, and does the next chunk need its own plan rather than an edit to this
one?"_ The project supplies the folder shape. **That distinction is the whole doctrine and it is easy
to lose while enthusiastic about a good structure.**

## Recommendation on timing

**Do not retrofit, and do not touch session 13.** Session 13 is scoped to close criterion 7, and
restructuring the docs mid-flight would be the precise behaviour the sprint model exists to prevent.

**Adopt at the boundary instead.** Closing "SHIP THE ONE-WIRE TEAM" _is_ the end of an arc — so the
natural move is:

1. Session 13 closes the scope as planned.
2. Its close **writes the first `outcome.md`** for what is retroactively sprint 01 of that arc.
3. **The next arc starts as sprints from day one**, with `S13-*` retired in favour of card ids.

That gets the structure without a migration, and it tests it on an arc whose shape we already know.

## Open questions for Cole

- ◻ **Which projects get sprints?** All of `docs/projects/`, or only arcs that outlive a session? A
  one-session project with a sprint folder is ceremony.
- ◻ **What is the relationship to `docs/backlog/`?** Right now backlog items are the unit that survives
  between sessions. Sprints could absorb them, sit above them, or leave them alone. **Leaving it
  unstated is how we would end up with two competing homes.**
- ◻ **Does `ROADMAP.md` change?** It is the router. A sprint table per project may make part of it
  redundant — or may make it more useful, as an index of arcs rather than a list of items.
- ◻ **What is the close beat with teeth?** See caution (a) — their gap is the obvious thing to design
  against, and `anthill:finalize-session` is where it would hang.
