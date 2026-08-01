# Field notes — ship what we learn, without shipping it as law

**Status:** Draft
**Created:** 2026-08-01
**Author:** maestro

---

## Overview

Ship **`anthill field-notes`** — a command that prints what anthill has observed across teams — and
change `.anthill/principles.md` to arrive **empty, with a header explaining what it is for**, rather
than pre-filled with our findings.

**Small on purpose:** a shipped doc, a command that prints it, an empty template with a good header,
and two pointers. Not a system.

## Problem Statement

Two problems, and the second is the one that matters.

**1. What we learn cannot reach a team that already exists.** `anthill init` creates missing files
and never touches existing ones, so a team receives `principles.md` **once at bootstrap** and
everything learned afterwards never arrives. **Verified by smoke test**, not assumed: an existing
footprint with an outdated `principles.md` is left untouched by `init`. Extracting principles into
their own file fixed _first_ delivery and not _ongoing_ delivery.

**2. Pre-filling their file with our principles is the dictating failure.** anthill's standing rule
is that it supplies the **trigger** and the project supplies the **content**. A `principles.md`
seeded with our entries hands a team conclusions whose scars belong to somebody else, and they arrive
looking like things this team earned. **Every entry's evidence is ours. That should be visible.**

There is a real distinction underneath: **project conventions** (branch policy, naming, formatting)
belong to the host repo and anthill must never dictate them. **How agent teams coordinate** is
anthill's own subject matter, so having an opinion is legitimate — but it is an opinion **offered**,
not installed.

## Proposed Solution

**`.anthill/principles.md` ships empty**, with a header that explains:

- what a principle is here — a claim about **how work goes wrong**, general enough to survive a
  change of tool, stack or team;
- that each one needs **a scar, not a case** — a good argument is a hypothesis, and the retro's Q3
  is where those go;
- when they get added — the retro's **Q4**, never mid-session;
- where to see what other teams found — **`anthill field-notes`**;
- and that **disagreement is a legitimate entry.** _"We tried anthill's X and it did not hold for us,
  here is what happened"_ belongs in this file. Without that, a team that quietly discards our
  guidance teaches us nothing, and we never learn we were wrong.

**`anthill field-notes` prints a shipped document**, framed as observation rather than instruction.
The name is doing work: _field notes_ names **provenance** — captured in the field, evidence
attached — where _principles_ or _guidance_ both carry a faint **should**.

Four sections, because today produced four genres and only one is principles:

| section                                        | what it is                                                                                           | why it is separate                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Principles**                                 | claims about how work goes wrong, each with its scar                                                 | the core                                                                                                        |
| **Conventions teams reinvented independently** | read-watermarks, verdict-first, `→` addressing, announce-before-holding                              | **a stronger evidence class** — two teams converging with no contact means the gap is in the tool, not in taste |
| **Measured NOT to work**                       | mandating cross-lane reading when it is already saturated; a tail filter keyed on addressee or topic | most guidance only says what to do; what was tried and failed is rarer and cheaper to act on                    |
| **What to tool vs what to leave**              | _tool the conventions compensating for missing information; leave the ones expressing judgment_      | meta-guidance about the rest                                                                                    |

## Scope

**In:**

- `anthill field-notes` — prints the shipped doc. Honours `--format`.
- The shipped doc itself, seeded from this week's cross-team material.
- `.anthill/principles.md` + its template: **empty, with the header above.**
- Pointers from **`bootstrap`** (show it once at setup) and **`upgrade`** (name it as a step, since
  a content-only release is exactly the case teams skip).

**Out:**

- **Any version marker or "N new since you looked" state.** See Technical Approach — this is a
  deliberate v1 decision with evidence behind it.
- `convene` — it runs every session and this is occasional. Putting it there makes it noise.
- Any mechanism that writes to a team's `principles.md`. **We never touch their file.**

## Technical Approach

A command that prints a bundled markdown doc. No state, no config schema change, no migration.

**Why stateless, explicitly:** a marker recording "you have reviewed through v3" would let the touch
point say _"two entries added since you last looked."_ Rejected for v1 on two grounds. It needs
somewhere to live, which drags `config.ts`, the design-of-record §5, `migrate.ts`, `bootstrap` and
`upgrade` behind it — a feature's worth of machinery for a doc and a command. **And we have a live
example of that badge failing:** a signal that fires on every release and is usually _"not for us"_
trains its audience to discard the channel it arrives on, which is exactly the heartbeat finding a
peer team reported this week — _"your instrument worked, told the truth, and I learned to ignore it
inside one session."_

**If teams later say they never know when something is new, that is the signal to add the marker** —
and by then we would know what they actually want to be told about.

## Impact & Risks

- **Existing teams keep their `principles.md` untouched.** The empty template only reaches footprints
  that do not have the file.
- **Risk: the doc silts up.** Everything interesting will want to go in it. The
  what-to-tool-vs-leave section is the guard, and it applies to the doc itself.
- **Risk: nobody runs the command.** Mitigated by pointers at bootstrap and upgrade — and honestly,
  partly unmitigated. That is what a stateless v1 buys and costs.

## Open Questions

1. **Does `field-notes` read too cute for a CLI verb?** `guidance` is more legible and less honest.
2. **Does the shipped doc live in `plugin/` as a plain `.md`**, or somewhere a consuming project can
   also read directly without the command?
3. **Should `feedback` cross-reference it** — a team disagreeing with a field note is exactly the
   signal `anthill feedback` exists to carry.

## Success Criteria

- A team can run one command and see what other teams found, with evidence, and be under no
  impression they must adopt it.
- A new team's `principles.md` contains **nothing they did not earn**.
- The next thing we learn is reachable by an existing team **without** them re-bootstrapping.

## Notes

Provenance: a blind cross-team check-in with StoryLoom's lead, where both teams turned out to have
independently invented the same four conventions. Her framing is the reason the "reinvented
independently" section exists as its own class: _"two teams independently inventing read-watermarks
is the strongest evidence either of us has that the gap is in the tool and not in our taste."_

**Related:** `docs/backlog/2026-08-01-read-watermarks-should-be-tooling-not-convention.md`,
`docs/projects/non-dev-seats/proposal.md`.
