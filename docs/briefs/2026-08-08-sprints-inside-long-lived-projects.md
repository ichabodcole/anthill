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

## Where this actually sits: we are at the edge of `project-docs`, not working around it

**Cole's framing, and it is the right one:** the pain is not that we are doing something wrong. It is
that **we have reached the limit of what `project-docs` was designed for**, and the honest response is
to author the content ourselves and feed the gap back — not to contort the work to fit.

### The gap, stated precisely

`project-docs@3.2.0`'s unit hierarchy is **project → `proposal.md` → `plan.md` → `sessions/`.**
`/usr/bin/grep -rn "sprint" skills/create-project/SKILL.md` returns **nothing**; the word does not
appear.

**`sessions/` is a LOG, not a unit of work.** It records what happened; it does not scope what will
happen. So **`plan.md` is the only mutable doc that spans sessions** — which means every "what's next"
pressure in a multi-session arc lands on it, and it gets rewritten. **That is the whole mechanism, and
it is structural rather than a discipline failure.**

> **The missing unit is a scope for a GROUP of sessions** — ratified up front, closed once, never
> re-opened. Between `plan.md` and `sessions/` there is nothing.

### 🎯 The pattern to follow already exists in that plugin, and it works

**`finalize-branch@3.2.0` does exactly the thing we want, for landing:** it looks for a
`## Branch Landing Policy` heading in `AGENTS.md`/`CLAUDE.md` and **defers to whatever the project
says** — squash, consolidate, or leave history untouched. 3.0.0 hard-coded a squash; 3.2.0 asks.

**That is a touch point with project-supplied content, shipped, and we are already using it** —
`AGENTS.md:57` is the answer it reads. **So the ask for sprints is not novel; it is the same move one
concept over**, and there is a working precedent in the same plugin to point at.

### So the split for us

| layer                                                                                           | who supplies it                                                      |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **The touch point** — _"this arc is at a boundary; does the next chunk need its own plan?"_     | `project-docs` (eventually), `anthill:finalize-session` (for a team) |
| **The content** — sprint folders, the status vocabulary, `CARRY-FORWARD`, the immutability rule | **us, in `AGENTS.md` or a `docs/` convention doc**                   |

**We author it locally now, deliberately, and that is not a stopgap** — it is the same doctrine anthill
already lives by, applied one level up. **What we learn becomes the feedback**, and `project-docs` ships
a [`provide-feedback`](https://github.com/) skill for exactly that.

### What to send back, once we have run it once

Not _"add sprints"_ — that would dictate a shape, which is the mistake we are trying to avoid. Send:

1. **The gap as a mechanism**, not a feature request: _`plan.md` is the only mutable doc spanning
   sessions, so all forward pressure lands there and it gets rewritten._
2. **The evidence** — our `S13-A…N` (sprint numbering with no sprint, plus a recorded ID collision) and
   `comms-as-default/plan.md`'s mutable `NEXT PHASE` section.
3. **The precedent** — the landing-policy touch point in `finalize-branch@3.2.0`, and the suggestion
   that a plan-boundary touch point take the same shape.
4. ⚠ **What we did NOT solve**, honestly: their sprint 03 shipped without an `outcome.md` and their
   README claimed "awaiting ratify" a day later. **A touch point that asks the question does not close
   the sprint.** Whoever designs this needs the close beat, and we will not know if ours works until we
   have run at least two.

**Hold the feedback until we have run it.** A convention proposed from one reading is a rule that has
not met real data — `principles.md`: _a rule is a claim; run it over real data before adopting it._

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
