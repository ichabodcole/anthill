# seams — the shared inter-seat contracts

> **What this file is.** The single home for the truths that live _between_ seats — the boundaries
> where one seat's work meets another's. A seat doc must **point here, never restate this**. That rule
> is self-referential: a contract copied into three seat docs will drift, violating the very rule it
> states. So: one source.
>
> **What belongs here.** A contract earns a place here when it is **shared truth that more than one
> seat must agree on** and that **drifts if restated** — a data shape passed across a boundary, an
> invariant two seats both rely on, a protocol between slices. Not a seat's private taste (that's the
> seat doc), not a one-off (that's a commit message), not product docs.
>
> **This is a seed.** No contracts yet. Two ways they land here: the **load-bearing** cross-seam
> contracts are **asserted up front and ratified** during the **plan phase** (the lead's skeleton →
> owners ratify the seams they touch — see `anthill:plan`); the rest **accrete as they're
> discovered**. Both/and — assert the load-bearing ones up front, let the long tail accrete. Start
> empty; add the first one the first time two seats have to agree on something.

## Ownership & the maintenance trigger

- **Each contract has ONE owning seat** — the seat that is authoritative for that boundary _in code_.
  The owner keeps the contract's prose true. Other seats **defer** to it.
- **The write-trigger (binds everyone):** _whoever moves a boundary updates this file **and** its
  proof_ — in the same change. A boundary moved in code but not here is a latent drift bug; the next
  agent trusts the trail and the trail lied.
- **Pin to proof where you can.** A contract backed by a test that fails when the boundary breaks
  can't silently rot. Prefer a green test; fall back to a durable concept or a commit; never a
  transient line/file reference.

---

## Contracts

_(none yet — accrete here as boundaries emerge. Suggested shape for each:)_

<!--
## Contract N — <short name>

**Owner:** <handle>   ·   **Pointed at from:** <seats that defer to it>

**The lesson, stated once:** <the invariant / shape / protocol, in prose>.

**Why it bites:** <the failure mode when the mirror lags>.

**Proof:** <the test / fixture that guards it, or the durable concept if none yet>.
-->
