# seams — the shared inter-seat contracts

> **What this file is.** The single home for the truths that live _between_ seats — the boundaries
> where one seat's work meets another's. A seat doc must **point here, never restate this**. That rule
> is self-referential: a contract copied into three seat docs will drift, violating the very rule it
> states. So: one source.

> **⚠ `anthill <command>` here is SHORTHAND, not a binary on your PATH.** The real invocation is
> `bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`, and `${CLAUDE_PLUGIN_ROOT}` is only
> set while a plugin skill is running — take the resolved command from `anthill:join`. Seeded here
> because this file starts without the shorthand and accumulates it as the team writes.
>
> **What belongs here — the admission test, applied at write time.** A contract earns a place here
> when it is **shared truth that more than one seat must rely on** and that **drifts if restated** —
> a data shape passed across a boundary, an invariant two seats both rely on, a protocol between
> slices. **Not** a lesson, however important: a lesson dressed as a contract is the commonest way
> this file grows into a diary, because a contract confers authority and a lesson does not. Lessons go
> to your report; a lesson that generalises becomes a principle at curation.
>
> **Who writes here.** The **lead** lands a contract at `anthill:plan` (ratified up front) or
> `anthill:curate` (accreted from reports). A seat **proposes** — on the wire during plan, in its
> report otherwise — and never edits this file mid-session. One owner per contract keeps the prose
> true; everyone else defers to it.
>
> **This is a seed.** No contracts yet. Add the first one the first time two seats have to agree on
> something.

## Ownership & the maintenance trigger

- **Each contract has ONE owning seat** — the seat that is authoritative for that boundary _in code_.
  The owner keeps the contract's prose true. Other seats **defer** to it.
- **The write-trigger (binds everyone):** _whoever moves a boundary proposes the update **and** its
  proof_ — in the same change. A boundary moved in code but not here is a latent drift bug; the next
  agent trusts the trail and the trail lied.
- **Pin to proof where you can.** A contract backed by a test that fails when the boundary breaks
  can't silently rot. Prefer a green test; fall back to a durable concept or a commit; never a
  transient line/file reference.

---

## Contracts

_(none yet — accrete here as boundaries emerge. The shape, and it is deliberately short:)_

<!--
## Contract N — <short name>

**Owner:** <handle>   ·   **Pointed at from:** <seats that defer to it>
**Ratified at:** <the grain this was agreed at — envelope / field set / call signature / wire format>

**The invariant:** <what must be TRUE ACROSS the boundary — the guarantee the other side may rely on —
in one to three sentences. Not how the owner satisfies it.>

**Proof:** <the test / fixture that guards it, or the durable concept if none yet>.

(**Why it bites**, if a reader would otherwise loosen it: ONE line. The story of how it was learned
lives in the report that produced it, not here.)
-->

> **Two things that make a contract here trustworthy.**
>
> **Say what it's true ABOUT, not how it's built.** A contract states the guarantee the other side may
> rely on. Implementation belongs to the owning seat; writing it here freezes a choice that wasn't
> yours and invites drift the moment the owner improves it.
>
> **Say where it ENDS — record the grain it was ratified at.** A contract confers confidence, and a
> consumer that builds **past** the agreed grain has silently manufactured a new, unratified seam. One
> team agreed a response _envelope_; a seat built at the _field_ level and got three shapes wrong —
> the contract _felt_ like it covered them. If you need a finer grain than what's recorded, you've
> found a **new seam**: say so rather than assuming.
