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
> **This is a seed.** No contracts yet — they **accrete as they're discovered**. Start empty; add the
> first one the first time two seats have to agree on something.

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

## Contract 1 — the `anthill scan` payload (`ScanReport`)

**Owner:** forager · **Pointed at from:** weaver (`skills/bootstrap` consumes it to render candidate seatings)

**The contract, stated once:** `anthill scan` emits `{ ok, data: ScanReport }` where

```ts
interface ScanReport {
  root: string; // absolute repo root: .git / topmost package.json / cwd — resolved BEFORE .anthill exists
  workspace: { manager: "bun" | "pnpm" | "npm" | "yarn" | null; globs: string[] } | null; // null ⇒ single-surface
  units: ScanUnit[]; // workspace members; single-surface ⇒ the ONE root package (len 1, path ".")
  warnings?: string[];
}
interface ScanUnit {
  name: string; // package.json "name", else dir basename
  path: string; // repo-relative POSIX dir; "." for root/single-surface
  kind: "app" | "package"; // position-PRIMARY (apps/*⇒app, packages/*⇒package), manifest signals only tiebreak an ambiguous path (root ".", non-conventional dir)
  stack: string[]; // dep-derived markers, ordered DOMINANT-FIRST (stack[0] = primary framework); marker ⟵ real dep name (e.g. sveltekit ⟵ @sveltejs/kit)
  private: boolean;
  internalDeps: string[]; // names of OTHER units this depends on (prod+dev+peer deps ∩ member names, sorted)
}
```

Two rules ride with the shape: **(a)** two surfaces "share a stack" ⟺ equal `stack[0]` (the fold /
spanning-warning test); **(b)** the shared-contract seat is the `kind:"package"` unit with fan-in
from ≥2 surfaces via `internalDeps` (low fan-in ⇒ config/tooling, excluded).

**As built (v1):** `kind` is **position-primary** — a unit under `apps/*` is always `app`, under
`packages/*` always `package`; the private+framework / publishable+no-framework inference only fires
when the path gives no hint. So on a non-conventional monorepo the consumer overrules `kind` using
the exposed raw signals (`private`, `stack`, `internalDeps`) rather than trusting the hint. **v1
limitation:** pnpm negation globs (`!packages/x`) are parsed-and-dropped, not applied as excludes;
`workspace.manager` is null when no lockfile is committed (a non-load-bearing byproduct).

**Why it bites:** `scan` runs during bootstrap discovery, **before** `.anthill/` is written — so
`root` must NOT resolve from the config walk-up (it would throw). And without `internalDeps`,
"the package both surfaces use" is a fiction on any repo with >1 package: the consumer mints a
contract seat for a config package or picks the wrong one. Both failures were caught at the ratify,
before a line was built.

**Proof:** forager's `scan` unit tests over in-tree fixtures (`scripts/anthill/__fixtures__/`) — a
workspace fixture (2 apps + 1 shared package with a real edge) asserts the full `ScanReport` golden;
a single-surface fixture asserts `workspace: null` + one root unit. _(Tests land with forager's lane;
link the file here when green.)_

## Contract 2 — the `anthill feedback` invocation contract

**Owner:** forager · **Pointed at from:** weaver (the touchpoint prose tells agents how/when/who invokes it)

**The contract, stated once:** `anthill feedback "<msg>" [--category bug|friction|idea|docs] [--skill
<name>] [--submit]`. A **bare call composes + emits, sending nothing** (`{ok,data:{title,body,repo,issueUrl,submitCmd}}`);
`--submit` runs `gh issue create … --label anthill-feedback` and on **any** failure degrades to
`{ok,data:{title,body,issueUrl(prefilled)},warnings:[…]}` exit 0 — **never drops the report, never throws**.
`title` = `[feedback/<category>] ` + first message line (≤~72c); `submitCmd` = the **self-re-invocation**
`anthill feedback "…" --submit` (the string a seat hands the lead — NOT raw `gh`); `label
anthill-feedback` is always applied (provenance, command-controlled); `body` carries the message + only
non-sensitive env (never repo content).

**The framing lives in two disjoint homes** (do not merge them): **command-facing** (what it's for —
upstream, ideas-welcome, categories) is one generative-first sentence in the command `--help`
(forager); **team-routing** (team-local vs. upstream; seats surface, the lead submits; solo = lead) is
canonical in the SOP seed (weaver). The full team-routing framing must NOT be **restated** in `--help`
— but `--help` may carry the same **terse danger-point echo** the skill pointers do ("on a team the
lead submits; see your team SOP"), since `--submit` is read right at the danger moment. Point, don't
restate.

**Why it bites:** two failure modes the ratify caught — a raw-`gh` `submitCmd` is a shell footgun that
bypasses the no-loss guards (→ self-re-invoke instead), and restating the team-routing framing in
`--help` would duplicate a single-source (the command has no team concept — a terse pointer is the most
it should carry). Duplicate issues are prevented by routing the submit through the lead, not the command.

**Proof (green):** `plugin/scripts/anthill/feedback.test.ts` (golden tests for the pure
`composeFeedbackBody`/`feedbackTitle`/`buildIssueUrl`/`interpretGhResult`, incl. a privacy assertion) +
`plugin/scripts/anthill/commands/team-feedback.test.ts` (guard envelopes + stubbed-`gh()` success/failure
branches with a `forbiddenGh` that throws if the default path ever calls it — no real network).
