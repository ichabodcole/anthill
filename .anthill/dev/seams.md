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
**Ratified at:** the full `ScanReport` **field set + semantics** — every field's type, its null-meaning, and resolution order. A consumer needing a field not listed here has hit a new seam.

**The contract, stated once:** `anthill scan` emits `{ ok, data: ScanReport }` where

```ts
interface ScanReport {
  root: string; // absolute repo root: .git / topmost package.json / cwd — resolved BEFORE .anthill exists
  workspace: { manager: "bun" | "pnpm" | "npm" | "yarn" | null; globs: string[] } | null; // null ⇒ single-surface
  evidence: "manifest" | "none"; // what the scan had to go on. "manifest" ⇒ a root package.json OR a pnpm-workspace.yaml that yielded globs (so `warnings` may still report no root package.json — consistent, not contradictory). "none" ⇒ units[0] is SYNTHESIZED, stack empty by ABSENCE
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

**AMENDMENT (2026-08-10) — `evidence` added, and this contract's own escape clause is what asked for it.**
Ratified at: the field's two values and their meaning. The clause above says _"a consumer needing a field not listed here has hit a new seam"_ — `skills/bootstrap` had, and had been silently coping.

**The fail-open:** `workspace: null` was true of BOTH a real single-surface app and a repo with no readable manifest at all, and bootstrap picked its archetype from that one boolean — in its own words, _"This one boolean picks the archetype."_ So a novel repo was handed `layered-app`, an engine seat scoped to _"goldens, unit tests"_. **Measured:** a git repo of `README.md` + `chapters/01.md` returned `workspace: null`, `stack: []`, `warnings: ["no package.json at repo root"]` — indistinguishable, on the ratified field set, from a React app.

**Why not have the consumer read `warnings`.** The signal was already there in prose, and grepping it is inferring a verdict from a string — the defect that made `AmbiguousTeamError` a TYPE after a measured reword left the suite green while `anthill team ls` broke. In a SKILL that coupling is worse: nothing there can go red.

**⚠ `evidence: "none"` DOES NOT MEAN "not a software project".** It means this scanner found nothing it can read; a Python or Rust repo is software and answers `"none"` today. A consumer must phrase its response as _"I found no manifest I can read"_ and ask — never as a claim about what the repo is. That distinction is the contract, not a nicety: the first wording invites a human to correct it, the second invites them to argue with it.

**CORRECTION to this amendment (same day, caught in review before merge).** As first written, `"manifest"` was glossed as _"a readable `package.json` was found at the root"_ — **narrower than the code, on a reachable input.** Measured on a repo carrying `pnpm-workspace.yaml` and no root `package.json`: `evidence: "manifest"` **beside** `warnings: ["no package.json at repo root"]`, the field's own documented meaning denied by the same payload. The value is CORRECT — the scan had real members to read and bootstrap correctly reaches §2b — so the code was deliberately **not** narrowed to match: refusing a genuine pnpm workspace for lacking a root manifest would invent a fail-closed defect where none exists. The gloss was widened instead, here and at both consumer sites.

**Worth keeping as the lesson rather than the diff:** this landed in the same commit that re-ratified this contract *because* a consumer was coping with an under-specified field — and the replacement field shipped over-specified in the other direction, in the one artifact whose whole value is being true about what the data supports. **A contract is not made accurate by being rewritten; it is made accurate by being checked against a payload.** One `pnpm-workspace.yaml` fixture found it in seconds.

**Why it bites:** `scan` runs during bootstrap discovery, **before** `.anthill/` is written — so
`root` must NOT resolve from the config walk-up (it would throw). And without `internalDeps`,
"the package both surfaces use" is a fiction on any repo with >1 package: the consumer mints a
contract seat for a config package or picks the wrong one. Both failures were caught at the ratify,
before a line was built.

**Proof (green):** `plugin/scripts/anthill/scan.test.ts` over in-tree fixtures at `plugin/scripts/anthill/__fixtures__/` — the pure detectors (`sniffStack` dominant-first ordering, `classifyUnit` position-primary, `internalDepsOf` fan-in, `parseWorkspaceGlobs`) plus a full `ScanReport` golden.
A `workspace-repo` fixture (2 apps + 1 shared package with a real edge) asserts the full `ScanReport` golden; a `single-surface-repo` fixture asserts `workspace: null` + one root unit.
_(Corrected at a finalize drift-check: the fixture path still read `scripts/anthill/__fixtures__/`, which stopped existing when the shippables moved under `plugin/`, and "link the file here when green" had gone undischarged long after the tests were green.
**Neither failed any gate** — a proof pointing at a directory that no longer exists is invisible to `bun run check`, and an undischarged TODO sitting inside a Proof section reads as a proof to anyone skimming.)_

## Contract 2 — the `anthill feedback` invocation contract

**Owner:** forager · **Pointed at from:** weaver (the touchpoint prose tells agents how/when/who invokes it)
**Ratified at:** the **invocation surface + the degradation guarantee** — flags, envelope shape, and never-drop/never-throw behavior. NOT the issue body's internal layout, which forager may change freely.

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

## Contract 3 — board-binding (every seat verb targets THIS team's board, ambiently)

**Owner:** forager · **Pointed at from:** weaver (`convene` SKILL.md + `.anthill/README.md` SOP say the board is key-bound; they point here, never restate the mechanism)
**Ratified at:** the **binding mechanism** — key identity (`= config.channel`) and the two ambient emitters. NOT spellbook's internal session-storage format, which is upstream's to change.

**The contract, stated once:** the bounty **session key = `config.channel`**.
anthill binds every seat's bounty verbs to this team's board via **two ambient emitters**, and threads `--session` onto **no** individual verb:

1. **`convene` opens the board keyed + pinned + headless + RESTORING** — `bounty open --session-key <channel> --pin --no-open [--restore <id>]` (`bountyOpenArgs`). `--pin` writes `.bounty-session` at the repo root; `--no-open` keeps it browser-free; keyed open is **idempotent** (re-attaches, never hijacks). Convene opens **before** it reads counts so `bounty state` resolves the pinned board.
   - **⚠ AMENDED 2026-08-09 by maestro, and it needs forager's ratification — the amendment is UNRATIFIED until then.** `--restore <id>` is appended whenever the key has a snapshot, where `<id>` is the `key` field of the same `bounty sessions` row the task count is read from. **Without it, a keyed re-open over a DEAD daemon respawns EMPTY over an intact snapshot** — reproduced step-by-step 2026-08-09, and it is what emptied this repo's board twice. **Verified end-to-end against the real board:** the 121-task snapshot came back as `todo 71 · review 9 · done 41` with no shadow warning, where the same command previously produced 0.
   - **Passing it unconditionally is safe in BOTH directions, measured rather than reasoned:** on a **dead** board it restores; on a **live** board `open` attaches and reports `restoreSkipped: {requested:["restore"], reason:"a live board already exists for this key … the running board was left unchanged"}`, with the live cards verified intact. **That is what makes it a default instead of a decision** — and the decision is one we provably cannot make from outside (see `boardShadowWarning`'s two-worlds note).
   - **Within the ratified grain, on the stated reading:** this refines emitter 1's argv, which is the mechanism this contract ratifies. It does **not** touch spellbook's session-storage format, which stays upstream's. **Stated explicitly because the owner is not present to agree, and a lead amending another seat's contract alone is exactly the move that should be visible.**
2. **`spawn` exports the key into each pane** — the launch line is prefixed `BOUNTY_SESSION_KEY=<channel> ` (`buildSeatLaunch`), so a spawned seat's improvised verbs inherit the binding with no flag.

Resolution is **spellbook-side** (v1.16.0): a verb with no `--session` resolves the board by `.bounty-session` walk-up from cwd **or** `$BOUNTY_SESSION_KEY` in the env — so the **lead**, a **hand-started pane**, and a **seat-dispatched subagent** (none carry anthill's exported env) all resolve via the pinned file, while spawned seats also carry the env. **On a SHARED tree, seats and the lead never pass `--session`** — there, the binding is ambient by construction. **That sentence is scoped deliberately and must not be widened back:** under per-seat worktrees it is false (see the session-6 REVISION below), and an explicit id is currently the only reliable binding. State which tree shape you mean; a claim true of one and asserted of both is Contract 5(b)'s failure mode. `init` gitignores `.bounty-session` (per-session/local state, never committed).

**Scope bound (the binding is project-tree-local, not global).** The id spellbook derives is `k-<keyname>-<projecthash>` — **project-path-scoped**. Both the `.bounty-session` walk-up and the `$BOUNTY_SESSION_KEY` env-key derivation resolve **only from within the project tree**; the same key from an unrelated cwd (e.g. `/tmp`) resolves to "no session", never the team board. Correct in practice — seats always run inside the repo — but the guarantee is bounded to the tree, not the machine. (Proof: **UNVERIFIED-BY-CONSTRUCTION** — see the note under Proof below; the observation was an env-decoy bound only from the repo, with `anthill-dev` from `/tmp` resolving to "no session".)

**AMENDMENT (2026-08-10, multi-team) — the derived id now has a SECOND reader, and it is a guard.**
`boardOwnerFromBinding` (`commands/team-support.ts`) reads `.bounty-session` and matches
`k-<channel>-` against every configured team's channel, to answer _which team holds the board_. It is
the only anthill code that parses this file, and it leans on two things stated above: the
`k-<keyname>-<projecthash>` shape, and — new — the config layer's **prefix-free channel** rule, which
is what makes at most one team match. **The reason this is written here rather than only in the code:
if spellbook changes its derivation, the guard does not error, it returns `null` for every binding
and fails OPEN** — restoring the exact convene-rebind hole it was added to close. The tripwire is
`team-support.boardbinding.test.ts`'s round trip: a real `convene`, then assert this reader
recognizes what it wrote. **Do not replace that test with a fixture string** — a fixture agrees with
whatever this file already believes, which is the failure being guarded against.

**REVISION (session 6) — under per-seat worktrees, mechanism 2 does not merely stop working, it BREAKS mechanism 1.**
The clause above is correct, and its reassurance — *"correct in practice — seats always run inside the repo"* — was falsified the first session seats ran inside **different** repos.
`findScopeRoot` walks up to the first `existsSync(dir/.git)`, and **`existsSync` is true for a FILE**; a linked worktree's `.git` is a small `gitdir:` pointer file, so the walk stops at the *worktree* and `k-<key>-<sha256(root)[0:8]>` derives an id no board answers to. (Mechanism from source by steward; the failing cell reproduced independently by four seats.)
The damage is not the failed leg but its **precedence**: resolution runs `--session` > `$BOUNTY_SESSION_KEY` > `$BOUNTY_SESSION` > `.bounty-session` walk-up > `latest`, and `spawn` exports the key into **every** pane — so the exported key **shadows every fallback that would otherwise have worked.** A seat in a worktree is strictly worse off than one whose lead exported nothing, and the lead's own `BOUNTY_SESSION=<id>` remedy was silently shadowed one level above it.
Measured, one variable held: inherited pane env → `no running bounty session`; the same command with `BOUNTY_SESSION_KEY` unset → resolves.
**Open decision, NOT ruled here: `spawn`'s exported key must become worktree-aware or stop being exported.** Until it is, the honest statement is that **the ambient guarantee this contract exists to provide does not hold under worktree isolation**; the working binding is `unset BOUNTY_SESSION_KEY` plus an explicit id.
_Generalisation worth more than the fix: **a bound stated together with a reassurance ages exactly as well as the reassurance, and the reassurance is the half nobody re-reads.** This clause named the precise mechanism that broke and still concluded it was fine._


**The key is shell-safe or it's a hard error.** `config.channel` is interpolated unquoted into a `BOUNTY_SESSION_KEY=<key>` prefix typed into a pane shell — so it is charset-guarded to `[A-Za-z0-9._-]` (`SAFE_SESSION_KEY`); a malformed channel fails clean at a `spawn` preflight (no half-spawn), never as an injection.

**Why it bites:** without the key every un-flagged verb resolves the bounty daemon's global **`latest`** pointer — with two boards live, a seat silently reads/writes a **stranger's** board (anthill #23/#19; it froze live sessions). The failure is silent (`noop:true` the only tell) and hits exactly the **improvised** verbs a seat runs naturally, not just anthill's pre-emitted ones. Binding the _environment_ + the _directory_ (not each call) is what makes correctness require zero agent cognition.

**Proof:** `plugin/scripts/anthill/commands/team-convene.test.ts` (`bountyOpenArgs` golden), `plugin/scripts/anthill/commands/team-spawn.test.ts` (`buildSeatLaunch` env-prefix + the 3 unsafe-key rejections), `plugin/scripts/anthill/commands/team-init.test.ts` (`planGitignore` reuse for `.bounty-session`, incl. the already-present-under-a-comment case). The live two-board hijack proof (a fresh stranger board as `latest`, an improvised `bounty update` from a seat pane STILL hitting ours) is **UNVERIFIED-BY-CONSTRUCTION** — see the note directly below.

**Note on the live proof, added because the pointer it replaces could not be followed.**
This clause used to read *"is sentinel's Phase 5"*, naming a phase of a working session that no longer exists.
**A named assertion is checkable by a stranger; a named phase of a dead session is not** — it cannot be re-run, and a reader cannot even confirm it happened, which is the property a proof pointer exists to provide.
It survived the count→assertion conversion above **because it is not a number**, so nothing in that rule caught it.
Deliberately **not** replaced with a test that would make it look proven: the mechanism these unit seams compose needs two live bounty daemons and cannot be pinned by a unit test, and inventing one would give the appearance of proof for the thing it does not cover — the failure mode Contract 4 already records against itself.
**The honest status is therefore "no automated proof", plus a recipe anyone can run:** open a second, unrelated bounty board so the daemon's global `latest` pointer is the stranger's; confirm from a neutral directory that `latest` resolves to the stranger; then run an un-flagged `bounty` verb from inside this repo and assert it still reaches this team's board. **The confound is the point** — if `latest` already happens to be our board, a green proves nothing, so the stranger-as-`latest` step is what makes the run mean anything.
_Generalisation worth keeping: the failure class is not **counts**, it is **proof pointers whose referent a future reader cannot reach.** A count is the common instance and the milder one, because a number at least announces its own staleness; a dead session does not._

## Contract 4 — team-comms: the emitted incantation + seat-identity resolution

**Owner:** forager · **Pointed at from:** weaver (`skills/join` renders the incantation and writes the usage-altitude prose a consumer repo actually reads)
**Ratified at:** the **emitted incantation's form** and **identity resolution on every path, success included**.
NOT the verb names, the flag surface, the channel-resolution rule, the on-disk log format, or the poll interval — those are the owner's to choose and change freely.
Ratified on the vine (`anthill-dev` #7–#17, three seats, both directions) ahead of any code; maestro's #14 ruled siting (inside `plugin/`) and zero-dep (confirmed) and explicitly declined to touch the seam's contents.

**The contract, stated once.**

**(a) The incantation is a literal, fully-resolved, per-seat command string, composed by the CLI and rendered verbatim.**
The consumer never composes it, never interpolates a handle into it, and never encodes the tool's location.
House precedent is already in the tree: `anthill join` emits `boardTailCommand` fully resolved (handle already substituted), not a template.
_🔴 **This sentence read "`tailCommand` / `boardTailCommand`" until minutes after step 4 landed, and `tailCommand` no longer exists.** Caught by a residual sweep of this file, NOT by the amendment: I amended clause **(b)** — where the field is the subject — and did not re-read **(a)**, where it is only cited as precedent. **That is this contract's OWN authoring note failing on its author: "after strengthening any clause here, re-read the Proof section and ask which assertion would fail if the new words were false."** The note says re-read the PROOF; **the drift was in a SIBLING CLAUSE**, which the note does not name and which nothing else looks at._
_Durable form, and it is the amendment's cost rather than the field's: **a field cited as evidence in one clause and defined in another has two homes, and the definition is the only one anybody remembers to update.**_

**(b) It reaches the consumer as a `comms` block in the join manifest, present in EVERY MANIFEST `join` EMITS**, carrying `{ channel, incantation }` — so the consumer renders it and never probes the filesystem or interprets an exit code to decide what to render.

**AMENDED session 8 (S8-1), and the bound is the amendment: "ALWAYS present" was false, and no amount of code could have made it true.**
`join` exits before building a manifest on three paths. Two of them **must** stay fatal and that is the argument rather than a concession: with an **unknown seat** there is no seat doc to ground in, with **no config** there is no roster and no channel — **there is no manifest to degrade to**, so an unbounded "always" is unsatisfiable by construction. Those are the error surface (Contract 5), not this clause's subject.
**The third was a genuine defect and it is fixed.** `resolveCoordCli` for **spellbook's** grapevine+bounty ran first and `process.exit(1)`, so a **spellbook** absence suppressed the **anthill** comms block — which touches no spellbook — and withheld the grounding list, which needs nothing but the repo. Coord resolution is now non-fatal: the wires become `tailCommand`/`boardTailCommand` **`null`** (TOTAL fields; `null` is a positive observation with its reason in `warnings`, never an unpopulated field), and comms + grounding survive.
_Note this clause's own justification did not cover the case that broke it: **"skill and tool ship in one subtree from one release" is a claim about ANTHILL's release, and spellbook is a separate project on its own cadence.** The clause was true about the skew it considered and silent about the one that happened — which is why the fix is a **bound** and not a rewording. A guarantee stated without its domain will be read as holding everywhere, and this is the second time in this file a clause has failed exactly that way (see Contract 3's session-6 REVISION, and 5(b)'s "a local truth stated as a general one")._
**Proof:** in `commands/team-join.test.ts`, the real-process block *"a missing spellbook must not sink the manifest"* — asserting the comms block and the grounding list both survive a genuinely empty `HOME`, with a **positive control that the fixture really had no spellbook** (otherwise every assertion passes for the wrong reason). **These are the file's only non-pure tests, deliberately: every other test there is pure so it can run in CI where no spellbook cache exists — and this block is the one case that NEEDS the absence, so CI supplies it for free.** Mutation-checked: restoring the `process.exit(1)` fails the block, substitution count asserted before the suite was read.
_🔴 **That sentence read "fails all five" until session 11, and the block had TWELVE tests. Found by scout (`#594`) in a file nobody was editing, on a night everybody was editing.** It is the third numeric citation in this file to rot, **one clause away from the authoring note that forbids exactly this** — see "cite ASSERTIONS, never COUNTS" below, which was written after the previous two and did not protect the paragraph above it._
_**The generalisable half is WHY the note failed where it stood:** a rule against counts cannot fire on a count that was already written. It governs the act of ADDING one, and the file's existing counts were grandfathered by nobody deciding to. **A prohibition adopted mid-file does not retroactively audit the file** — and no gate reads prose, so the only thing that would have caught it is somebody reading for this specific shape, which is what scout did._

**AMENDED session 11 (STEP 4) — `tailCommand` NO LONGER EXISTS, and this clause's own wording is what makes the distinction load-bearing.**
The S8-1 paragraph above says the wires become `tailCommand`/`boardTailCommand` **`null`**. **That is now true of `boardTailCommand` alone.** Step 4 removed the grapevine from `join` entirely: no vine tail is composed, `CoordWires` carries only `bounty`, and **`tailCommand` is absent from the emitted envelope rather than present-and-`null`.**
**The distinction is this contract's own rule applied to its own field, and it runs the opposite way to the S8-1 fix.** S8-1 argued a wire's absence must be a POSITIVE observation carrying its reason — `null`, never a missing key — because a consumer cannot tell *"did not resolve"* from *"nobody populated it"*. **A `null` `tailCommand` would now assert a third thing that is false: that a vine exists and is unavailable.** There is no vine to be unavailable, so the honest emission is no field at all. **`null` is the right answer for a wire that could be there; absence is the right answer for a wire that cannot.**
**`boardTailCommand` KEEPS its `null` branch and that is not an oversight** — bounty is still spellbook's, on its own release cadence, so the exact skew this clause was amended for in session 8 is still live for it. **The wire-unavailable branch is NARROWED from two wires to one, never removed.** _(Falsified into this shape by weaver at `#571` against `team-join.ts:42-43`/`:584-588`; I had written that the branch "no longer exists", which was true of the vine and false of the board, and taken at my stated width he would have deleted a live branch while citing me.)_
**Proof (named, not counted):** in `team-join.test.ts`, *"bounty down: the manifest reports the BOARD gone and invents no other wire"* — which asserts `boardTailCommand` is `null`, the comms incantation survives, **no `grapevine` token appears anywhere in the payload, and `tailCommand` is not among the emitted keys.** That last assertion is the one that fails if anyone restores the field as a `null`, and it is written as a key-set check precisely because a `null` and an absent key are indistinguishable to a value comparison. **It caught two live prose sites when first run** (`coord.ts`'s spellbook-missing error and the catch-up checklist still teaching `grapevine pull` to every consuming project), neither of which was in the diff that motivated it.
**⚠ CONSUMER NOTE, and it is the reason this is an amendment and not a footnote:** a consumer must NOT read the absence of `tailCommand` as *"the vine is unavailable this join"*. **Told-there-is-none and wasn't-told-anything must not look alike** — that is Finding 1's rule in this very contract — and here the honest state is neither: **the concept is gone.** `skills/join`'s prose is weaver's half of this and is step 5's subject.

**RATIFIED by weaver (the consumer), session 8, comms #99 — and the ratify is recorded here because it happened on a wire that does not survive teardown.**
I consume this block in `skills/join`, so the amendment's test is whether the clause is true of the manifest a seat actually receives. **Measured, not accepted:** `HOME=/tmp/empty … anthill join weaver` → **comms block PRESENT** (incantation, 113 chars), `tailCommand` and `boardTailCommand` **`null`**, one `warning`, and the emitted checklist **adapts** — the two arm-a-wire items are replaced by the warning rather than rendering `null`.
**So the bound holds for the consumer and my prose needs no absent branch.** What it DID need is a branch for *wires unavailable*, which my skill had zero of (`grep -ci "unavailable|spellbook" join/SKILL.md` → 0) — **carded `S8-9`, not built, draft gate-ready.** The producer moved to three states while my prose encoded two; **that is not this clause's defect, it is the consumer half of it, and it is the shape a reader should expect whenever a producer's states become partial.**
_Note for whoever builds against this: the sentence below is the ORIGINAL v1 claim and its justification was falsified by the amendment above — "skill and tool ship in one subtree" is a claim about anthill's release, not spellbook's. Read the two together or the older paragraph reads as still-current._

**There is no absent branch in v1, and the consumer must not describe one.** The skill and the tool ship in one subtree from one release (maestro's #14, declining conditional emission), so the block cannot fail to be there. An earlier draft of this clause promised "present-with-an-incantation **or explicitly absent**"; the shipped code has no such branch, and weaver falsified the clause against the code within minutes of it landing. **Prose describing a branch that cannot occur is the same defect this contract exists to prevent, pointed at the contract itself** — a reader would write a handler for a state the system never produces, and could never learn it was dead.

If a skew case ever does become possible (the tool shipping separately from the skill), that is a **revision of this clause, not a latent allowance in it** — and the discipline then is an explicit marker, never absence-by-omission, for the reason Finding 1 gives: *"told there is none"* and *"wasn't told anything"* must not look alike.

**(c) Identity is a seat, and the tool states where identity came from on EVERY path — success as much as failure.**
The resolution outcome (resolved-from-roster · not-a-seat · no-config) is a first-class field in the `agent-layer` envelope, never encoded only in an exit code or in stderr prose.
**There is no free-form-alias fallback:** `--as <handle>` that is not in the roster is an error, `--as` omitted is an error, and neither ever degrades to an ambient or caller-supplied identity.
Failures never exit bare non-zero; a not-a-seat error enumerates the valid seats, as `anthill join <bogus>` already does.

**(c-bis) Identity binds the verbs that ATTRIBUTE, not the verbs that observe.**
`send` and `follow` require a resolved seat; **`read` deliberately does not**, and that is a decision, not an omission.
A send puts a name and a role on a durable artifact, and a follow registers a live participant — both make a claim about who someone is.
A read changes nothing and attributes nothing, so requiring a seat there would buy no integrity and would make the catch-up verb — the one a confused or half-joined agent reaches for first — the hardest one to invoke.
Stated here because sentinel's cold read could not tell this apart from a gap in the contract, which is exactly the failure this file exists to prevent: **an unstated decision and an oversight are indistinguishable from outside.**

**(d) Where a consumer repo cannot see this file, pay the seam in emitted values rather than in words.**
A distributed skill that says _"run the command the CLI printed"_ has no second copy to drift; one that names the invocation does, and the named copy is the one nobody updates.
weaver's formulation, which is the actionable form: **exemplify the dialogue, never the invocation.**
The consequence, from sentinel: the CLI's printed output *becomes* the load-bearing onboarding text, so the incantation is prose the owner is accountable for — not a mechanical string.

**Why it bites.**
**Success is the unfalsifiable case.** A send that resolved from the roster and a send that merely took the string the caller typed emit the same green — so without (c), seat-aware identity, which is the entire wedge of the spike, is unverifiable from outside the process and the spike's own Open Question 2 ("does it change anything on day one, or is it only groundwork?") is unanswerable at finalize.
The field was asked for by the verifier as a confound-killer, withdrawn by him once no-fallback was ruled, and **kept anyway on the consumer's independent argument** — the two reasons are separable, and only one was ever withdrawn.
A bare non-zero is the anthill#54 failure: a usage error and a broken tool are indistinguishable unless the output disambiguates them, which cost a seat an entire session.

**Proof:** four assertions, which convert the claim into observation rather than trust.
The resolution-outcome field is proven as a **discriminator, not a constant** — one field, three distinguishable values, asserted across all four cases; a hardcoded value passes any one of them alone and fails the set.
(1) `--as <handle-not-in-roster>` → structured error **and nothing is sent** (an error envelope that still delivered would be the fallback wearing a hat; this is its own test, never a clause inside the error-shape test);
(2) `.anthill/config.json` absent → structured error naming the path it looked for, run from a real tree with no config, not simulated;
(3) `--as` omitted → error, not an ambient identity;
(4) a **successful** send from a valid seat emits `resolved-from-roster` in the envelope — asserted **positively on the happy path**, never inferred from the absence of an error.
Assertion (4) is the one that proves the headline of clause (c), and it is the one that is easiest to lose: (1)–(3) can all be green while the success field was never implemented or was dropped in a later refactor, and nothing would notice the wedge had disappeared.
**Green in:** `plugin/scripts/anthill/comms.test.ts` (the pure resolver, incl. the three-distinct-outcomes discriminator check) and `plugin/scripts/anthill/commands/team-comms.test.ts` (the real-tree runs: assertion (2) executes from a genuinely config-less tree rather than a simulated `roster: null`, and assertion (1) asserts the log is byte-identical after a rejected send).

**Authoring note — how (4) went missing, because the mechanism recurs.** Assertions (1)–(3) were written in the same vine message that *withdrew* the success-path ask; the clause was then strengthened from two other directions, and the proof list was carried forward unchanged from before the strengthening.
The contract text advanced and its own proof did not — **clause-vs-its-own-proof drift, inside a single file, introduced at authoring time.** Not doc-vs-code drift, and no gate catches it.
The cheap guard: after strengthening any clause here, re-read the Proof section and ask which assertion would fail if the new words were false.

**Second authoring note — cite ASSERTIONS, never COUNTS. Adopted after the counts rotted a third time.**
Every numeric proof citation in this file has been wrong at least once: Contract 1 said 25 tests (actual 20), Contract 4 said 35 and 18 (actual 28 and 28).
The last of those decayed **during the session that found it** — a verifier measured 18→20 in the morning and the owner's own new tests made it 28 by the afternoon, so the correction would have shipped stale.
**A count is a measurement with a shelf life that no gate checks and that every commit invalidates**; re-numbering buys one session of accuracy and re-arms the same trap.
A named assertion ("the three-distinct-outcomes discriminator", "the log is byte-identical after a rejected send") survives adding tests, and a reader can go and check it — which is what a proof pointer is for.
Note the asymmetry this exposes: the parts of these contracts written as **arguments** have aged well, and every part written as a **measurement** has rotted. Prefer the durable form.

## Contract 5 — the CLI failure surface: what the envelope carries, and what our prose may promise about it

**Owner:** forager · **Pointed at from:** weaver (`skills/join` + `skills/comms` make claims about how these tools fail)
**Ratified at:** the **tier rule** (a) and the **two prose constraints** (b), (c). NOT field names, NOT `meta.stack`'s shape, NOT the format-sniffing implementation — those are the owner's to change freely.
Ratified by forager on the wire (comms #27, as of #26), against the code as it stands post-fix rather than as designed — including an explicit ratify of the Proof section's **absence** of a mechanical trigger for (b) and (c) **as a decision, not a gap** (same discipline as Contract 4(c-bis): a cold reader must not be able to mistake *"we couldn't pin this"* for *"nobody thought about pinning it"*).
The owner corrected clause (c)'s evidence at ratify; see the note there.

**Why this is one contract and not two.** forager's rule about the envelope's *shape* and weaver's rule about what prose may *promise* are the same boundary seen from each end.
Splitting them would put the promise and the thing promised in two places, which is the drift this file exists to prevent.

**(a) Top-level envelope fields are TOTAL; `meta` is the variable bag.**
`ErrorEnvelope = {ok:false, error:string, meta:{command}}`.
Every top-level field has the same shape on **every** error path; a value only one path can produce lives on `meta`, which is already optional and already varies (`durationMs` comes and goes).
This is why `validFlags` was declined and why a stack rides on `meta` rather than becoming a top-level field.
The reasoning is Contract 4(b)'s, applied to a new surface: **an optional top-level field populated on one path makes its absence unreadable** — an agent cannot distinguish *"absent because inapplicable"* from *"absent because unpopulated"*.
Doing it honestly would need an error-**kind** discriminator; that door is deliberately left open, and walking through it is a CLI-wide change, not a clause amendment.

**(b) Prose must not state a local truth as a general one — and where a claim keeps needing precision, stop making the claim.**
These tools' failure surfaces genuinely differ, per tool AND per path within a tool, so any sentence summarising them across a boundary is lossy by construction and the loss is where the falsehood lives.
Two paths inside `comms` already carry **different kinds of reason**: a refused arg has an authored *why* (a coherent thing to try, and why this verb won't), an unknown flag has none (**a typo has no why**) and can honestly promise only *"it names what you typed and the flags that exist."*
**Never write one sentence covering both.**
The failure mode is not a wrong sentence — it is a **true sentence read as a general rule**, which is how `join/SKILL.md`'s *"a usage error and a broken tool look identical"* went from true-everywhere to true-of-the-vine-and-board-only.
History: one clause about three sibling wires was wrong **five times, by four authors**, each fix smaller than the last, and convergence never reached zero.
So the remedy is scoping, not rewording: name the tools the claim is about, tell the reader the tools differ, and point at the commands the CLI already resolved rather than teaching anyone to derive their own.

**(c) Prose may not condition a promise about the envelope on a flag the CLI's own emitted commands do not pass.**
The envelope is **not** conditional on `--format json`; it is conditional on **not being a TTY** (`resolveFormat`: an explicit `json`/`text` wins, otherwise `isTTY ? text : json`).
A piped agent that passes no flag already gets JSON, and **the anthill-CLI invocations we emit pass no `--format`** — `comms follow` in the join manifest, and `submitCmd` in `feedback` (Contract 2), which is the stronger case because it is a string we hand a seat to **re-invoke**, so it will actually produce an envelope when run.
The join manifest's other command is **spellbook's** (bounty), not anthill's CLI, so it has no anthill envelope to promise and is not evidence here.
_🔴 **This read "other two commands … (grapevine, bounty)" until step 4 removed the vine, and the correction is pointed: THIS IS THE CLAUSE WHOSE OWN SCAR IS AN INFLATED COUNT.** Its next sentence records an earlier draft "inflating n=1 to n=3" — an overstated claim inside the contract against overstated claims, caught at ratify. **The number then went stale in the opposite direction by a code change**, so the same clause has now carried a wrong count twice, by two different mechanisms: once by miscounting, once by the world moving underneath a correct count._
_**That is the sharper lesson and it belongs here rather than in a seat doc: a count corrected for accuracy is still a count, and correcting it does not stop it rotting.** The clause's own rule — cite what you can point at, not how many — would have produced "the join manifest's OTHER commands are spellbook's", which is true before and after step 4 and needs no maintenance at all._
That exclusion is stated rather than left silent because it is clause (b) applied to this clause's own footnotes: an earlier draft counted all three, **inflating n=1 to n=3** — an overstated claim inside the contract against overstated claims, caught by the owner at ratify.
So prose saying *"pass `--format json` to get an envelope"* would be wrong three ways: false as a condition, contradicted by our own emitted output, and an invocation rather than a dialogue (Contract 4(d)).
**The honest form is format-agnostic: an agent gets a parseable envelope; it does not ask for one.**
This clause was added because the sentence it forbids was one draft away from being written — by the seat that authored 4(d).

**Why it bites.** The class this guards is **prose going quietly false while still reading fine**, which no gate catches and which the fix itself can cause: forager's change makes anthill's CLI disambiguate a failure that its sibling wires still do not, so a sentence true when written becomes a wrong reflex the moment the CLI improves.
Note the direction — **the tool got better and the documentation became wrong**, which is the case nobody watches for.

**Proof — and the honest part is that (b) and (c) have none.**
(a) is pinned by forager's tests, whose load-bearing assertion is sentinel's invariant: **the format decision must not depend on where the error was raised** — better than per-cell goldens because it survives any field names chosen.
(b) and (c) are **prose constraints with no mechanical trigger**, and stating that plainly is the point: this file's own rule is *pin to proof where you can*, and here we cannot.
Per Contract 4's authoring note, the guard is a **named re-read moment** rather than a fake assertion — whoever changes the envelope re-reads the two skills' failure-surface claims in the same change, because that is the only trigger that exists.
Do not later paper this over with an assertion that merely greps the prose for a forbidden string; that would give the appearance of proof for a claim it does not test, which is the failure mode Contract 4 records against itself.

## Contract 7 — the emitted LAND command: what may be in the string, and what prose may promise about it

> **PARTIALLY RATIFIED (session 8).** Authored by the lead at session 7's finalize as a CLAIM, after both owning seats had stood down — found by the seams pass, not by either owner. The lead hosts the interface; he does not decree it.
>
> **weaver (the consumer) — comms #74/#76, as of #74:** **ratifies (a), (b), (c). FALSIFIES (d) as stated.**
> _(d) claimed "`--version` cannot disambiguate two binaries that behave differently." **The version VALUE cannot; the version OUTPUT does, for free, in the same call** — piped, the PATH launcher returns bare `1.7.1` and the repo CLI returns `{"ok":true,"data":{"version":"1.7.1"},…}`. Verified on both, redirected to files with exit codes captured. **The surviving claim is the narrower one, plus the positive half: the not-a-TTY envelope already discriminates, and a launcher not honouring it is Contract 5(c)'s subject.** The clause was wrong in the direction that flatters the tooling — it said we cannot tell, when we can — which is the direction a lone author drifts and the ratify gate's whole justification._
> _Found by scout; I had produced the falsifying output an hour earlier and read it for the version VALUE, so the values agreed and I recorded "identical version, different flags."_
>
> **forager (the owner) — comms #264, as of #262: RATIFIES (a), (b), (c). Concurs on FALSIFYING (d), and replaces it rather than repairing it.**
> _(a) is ratified **extended**, on his own evidence: `98ade49` made the emitted string resolve to the **emitting `cli.ts`** rather than a bare `anthill`, so (a) grows from "no prose in the command" to **"no ambiguity about which binary the command reaches"** — which closed a real failure, since the string was not runnable where PATH resolved to a launcher without `-F`._
> _(b) unchanged, and its proof is the sharpest thing here: **`bash -n` is CLEAN on `bun run check | tail -6`**, so syntax checking is structurally incapable of catching a piped gate and only refusing to compose it can. Two assertions, neither subsuming the other._
> _(c) ratified as a rule; **its open hypothesis is recorded above as CONTESTED and deliberately unscored.**_
>
> **CONTRACT 7 IS NOW RATIFIED BY BOTH OWNING SEATS, PER CLAUSE.** It carried `⚠ UNRATIFIED` for two sessions.
>
> **(d) is superseded — see the replacement at (d) below.** Both seats agree the original clause is false and that its subject is now moot: `5bfd97f` made `--version` emit `source` (the absolute path of the `cli.ts` that answered), so even the narrow surviving claim fails — **the value discriminates now, because it stopped being only a version** — and `98ade49` means the emitted land string no longer goes through PATH at all.
>
> **Why this is written down at all, and it is the session's own lesson:** the ratification HAPPENED — twice, on the wire — and the wire does not survive teardown. **A ratify that lives only in a message is indistinguishable at the next convene from a ratify that never occurred.** This block is the durable record the team spent session 8 arguing it needed; **it is deliberately per-clause, because a per-contract boolean cannot express "ratify (a)–(c), falsify (d)"** — and that split is the only part of a ratify with any value.

**Owner (proposed):** forager (the emitter + `config.gate`) · **Pointed at from:** weaver (the SOP template, this repo's SOP, and `finalize-session` all tell a seat to run the emitted string **verbatim**)

**The contract, stated once (as a claim).**

**(a) The emitted value is a COMMAND or NOTHING. Never a command with prose in it.**
`join` emits a fully-resolved land string — the project's gate and the commit in one, with no pipe and no inline `-m`. When no gate is configured, **the announcement is a SIBLING of the command, not concatenated into it.**
_Scar: it was concatenated. Under a label reading "LAND with this EXACT string" the emitted value failed `bash -n` with exit 2 and carried **backticks** — reintroducing the second of the two failure modes the string exists to prevent. It shipped to **every existing footprint**, because `upgrade`'s living-doc diff cannot reach `config.json`, so no footprint could ever have received `config.gate`._

**(b) `config.gate` has NO DEFAULT, and an unsafe gate is REFUSED rather than composed.**
Hard-coding a gate command would be anthill dictating a host project's convention; a silently gate-less commit is worse than a loud absence. **Announced absence over silent absence.** `&&` is permitted (it preserves failure); `|`, `||`, `;`, lone `&`, backticks and `$(…)` are not.
**One verdict feeds both the command and its notice** — deliberately not two predicates, which would be the *two copies of one verdict* defect deleted from `status`/`down` in the same session.

**(c) Prose may instruct a seat to run the string VERBATIM only because (a) and (b) hold.**
That instruction is the affordance's whole point and it is also its whole risk: **it converts an emitter bug into a team-wide incident**, because a seat told to run something verbatim will run it.
**Open hypothesis, weaver's, with a cheap falsifier:** _the next time the emitted string is wrong, count how many seats run it before anyone objects._ **Falsified if seats decline an obviously-wrong string.** Its prediction is that they will not, because being told to run it verbatim is the affordance.

**7(c) — FIRST DATAPOINT ON THE OPEN HYPOTHESIS, session 8 (sentinel, comms #257). Status: still UNTESTED, and the reason is the useful part.**
The hypothesis: *the next time the emitted string is wrong, count how many seats run it before anyone objects — falsified if seats decline an obviously-wrong string.*
**It was wrong today (bare `anthill` → PATH launcher, no `-F`) and two seats declined it.** That does **not** falsify the hypothesis, and neither seat claimed it did: **both had to LOOK** — the string reads fine — **and both looked only because a peer's earlier finding was in their catch-up. Neither detected it; both remembered it.**
**Decisive against counting it: running it would have been SAFE.** The launcher rejects the unknown flag, the `&&` never fires, nothing commits. **H2 predicts `verbatim` converts an emitter bug into an INCIDENT, which needs a bug that fails silently or destructively** — this one fails loudly.
**Three near-misses now (backtick concatenation, piped gate, missing flag) and every one was caught by a TOOL BEING STRICT, not by a seat being careful.** So the hypothesis still has no test, and **the honest reading is that we have no evidence seats decline anything — we have evidence our tools refuse things.**

**(d) — REPLACED session 8, by agreement of both owning seats. The original claim ("`--version` cannot disambiguate two binaries that behave differently") is FALSE and its subject is moot; what survives is below.**
**A version STRING alone never identifies a binary.** The honest identifiers are the **envelope shape** (piped, a launcher may return bare text where the CLI returns `{ok,data,meta}`) and the emitted **`source`** field, which names the absolute path of the `cli.ts` that actually answered.
**And the clause with teeth, which is the only part that changes behaviour: a load-bearing emitted command must resolve to the EMITTING CLI, never through PATH.** A dogfooding window — a repo running ahead of its own release — is a real and recurring state, and it is exactly when the two diverge.
_Scar, and it is why this is stated positively rather than as a warning: two binaries reported an identical `--version 1.7.1` while differing in two behaviours, and the emitted LAND string was **unrunnable** on the one that PATH resolved. The version string did not merely fail to inform — **it asserted sameness.**_

**(d-original, superseded) The emitted string is only as good as the binary that receives it.**
_Scar, same session, opposite end: the PATH launcher and this repo both reported `--version 1.7.1` while differing in **two** behaviours — the launcher had no `-F`, and piped `--help` returned text where the repo returned JSON (Contract 5(c)'s own subject matter). **The version string did not merely fail to inform; it asserted sameness.** Self-resolves at release, since skill and tool ship in one subtree (Contract 4(b)) — so this is a dogfooding-window hazard. **The defect that is ours is that `--version` cannot disambiguate two binaries that behave differently.**_

**Proof.** `bash -n` on the **emitted artifact**, not `toContain` on the composed pieces — *a substring is not usability*, and the substring assertion passed against a shell syntax error.
**Two assertions are required and neither subsumes the other, proven by mutation:** moving the notice back inside the command fails `bash -n`; **allowing an unsafe gate does NOT — a piped gate parses cleanly.** So `bash -n` structurally cannot catch (b), and only refusing to compose can.
The pipe assertion pins on the **pipe character**, not on `| tail`: injecting `| head -20`, a token no author named, fails it.

**Why it bites.** This is the session's compose/emit pattern stated as a boundary: **the pure functions were right every time and the emission was not.** Four instances — a dead-and-untested branch, this string, a `fresh` projection, a `.map` call site. **Every assertion the team wrote landed on the side that was already correct.**

## Contract 6 — the per-seat position: what `emittedThrough` contains and what it may never claim

**Owner:** forager · **Pointed at from:** weaver (`skills/comms` + `skills/join` tell a consumer-repo seat what a position and a gap MEAN)
**Ratified at:** which tier the value lives in, what it claims, and the three-state distinction below.
**NOT** the storage layout, the file-per-seat choice, the poll interval, or the field names — those are the owner's to change freely.
Ratified on the wire ahead of the code (`#139` brief → `#143` falsification → `#151` ruling), with **two of the lead's stated contents falsified before a line was built** and both corrections adopted.

**The contract, stated once.**

**(a) The tool observes EMITTED. Not delivered, and never read. Three tiers, not two.**
`follow` stamps the position at the moment it writes a message to **its own stdout**. Between that write and the agent sit a pipe buffer, the harness, and its batching — none of which this process can see. So:

- **emitted** — a byte left this process. **Artifact.** This is the only one the tool has.
- **delivered** — it arrived at the consuming agent. **Not observable from inside the tool.** A seat can establish it *about itself* by watching its own send echo back through its own follow; **nobody can establish _positive_ delivery about anyone else.**
  **The negative direction IS establishable about a peer, and it is the direction this primitive exists to serve.** A peer reading your position against the head establishes that messages were **not emitted** to you — and nothing unemitted was ever delivered. That is a fact about someone else, obtained without their cooperation, and it is how a seat's dead wire was actually found this session.
  _Narrowed at weaver's falsification (comms #268), accepted after checking the entailment rather than on sight. The clause originally read "nobody can establish it about anyone else", which is true of positive delivery and false of the negative — **a local truth stated as a general one, which is Contract 5(b)'s exact failure mode occurring inside the contract that cites 5(b).** Left visible rather than silently corrected, because the recurrence is the useful part: the over-wide version would have licensed a future reader to delete the one instrument that caught a real dead wire._
- **read** — the agent took it in before forming a view. **Testimony**, and it stays hand-written (*"reading as of #N"*), which is what `--as-of` mechanises without ever inferring.
  **`--as-of` does arithmetic on that testimony; it does not verify it.** What the check compares is **the number the sender typed**, never the sender's actual state — so a refusal means the log moved past the id you gave, and an acceptance means your number was current, **not that you were**. This is stated here because it is a property of what the value CLAIMS, and leaving it unstated would make an unaudited input look like a checked one. The usage-altitude form for consumer repos is weaver's, in `skills/comms` — **point at it, do not restate it here**; a consumer repo never sees this file, so that copy is the only text those readers get.

The brief proposed naming the artifact tier `deliveredThrough`. That was falsified and the reason is the whole point: **the gap between emitted and delivered is zero in the normal case and unbounded in the dying-follower case** — the one case the primitive exists to detect. A field named for delivery, stamped at emit time, would report a seat as current at the precise instant its wire died.

**(b) `follow` records; `read` records NOTHING, and that is a decision.**
`read` is identity-free under Contract 4(c-bis) — `--as` is declared-and-refused with a teaching error, because `read` is the verb a joining seat runs before it knows its seat. Recording a per-seat position needs a seat, so the proposal's *"read records on exit"* could only be built by either undoing 4(c-bis) or degrading to an ambient identity, which 4(c) forbids outright.
**The accepted cost, stated so it is not rediscovered as a bug:** a seat that only ever reads has **no position at all**.

**(c) THREE states, and they may never be collapsed into a number.**
`never-followed` (**the tool has no idea what this seat has seen**) · `current` (lag 0) · `behind` (lag N). The consumer-facing gap is correspondingly **`null` / `0` / `N`**.
_`never-followed` used to be defined here as "no record". That definition was narrowed to what the state actually CLAIMS when the incoherent case below was added — a record can exist and still leave the tool knowing nothing. The old wording would have made (c-bis) read as a contradiction of (c) rather than an instance of it._
**`null` is not a rounded-down zero.** With no recorded position the tool has no idea what that seat has seen — it may have read the entire log via `read`. Reporting `0` there asserts *"you missed nothing"*, which is the one claim it is not entitled to make, **on the wire whose entire purpose is to stop silence being mistaken for safety**.
This clause exists because the first shipped version got it wrong: the producer was honest and its **consumer flattened two states one file away**, which no type check and no gate could see. Caught by the lead against running code.

**(c-bis) An INCOHERENT record is `never-followed` — and the three states never became four.** _Added session 7 (F1, `1edca84`); ruled a (c) clarification and explicitly NOT a fix for (e)._
A record whose `emittedThrough` is **ahead of the head** cannot describe this log: no live follower can have emitted a message the log does not yet contain.
So the record is not evidence of a position, and the honest classification is the state that means *the tool has no idea what this seat has seen* — which is `never-followed`, exactly as (c) defines it. `gap` is `null` and `emittedThrough` is `null`, because **a row that has already said "no idea" may not also report a number**; a reader would believe the number.
**A fourth state was available and would have been wrong.** Minting `incoherent` as a peer of the other three would make every consumer that switches on `state` handle a case it has no policy for, and the safe fallback a consumer reaches for is the reassuring one — which is the (c) defect arriving by a new road.
**The diagnostic is preserved as a flag, not as a state: `staleRecord`.** It is **TOTAL** — always present — so its `false` reads as an observation rather than as an unpopulated field, per Contract 5(a). It distinguishes *"nobody ever followed"* from *"a record from another log survived here"*, which are the same fact about the tool's KNOWLEDGE and different facts about the WORLD.
**Why it bit:** `gap = head − emittedThrough` went **negative** (0 − 389) and the old `behindBy <= 0` rounded it into `current` — the single most reassuring state, on the wire whose entire purpose is to stop silence being mistaken for safety. Found by the lead as the instrument's **first user at convene**, being told all six seats were current against `head: 0` when five of them did not yet exist.
**The read order is load-bearing and is part of this contract, not an implementation detail:** `comms positions` reads **positions first, head second**. Snapshot the head first and a message appended between the two reads manufactures an ahead-of-head record out of a perfectly healthy follower — the benign race that the pre-F1 test was documenting when it asserted ahead-of-head was `current`. **That test's REASON was right and its TOLERANCE was the defect**; closing the race is what makes a remaining negative genuinely impossible rather than merely unlikely.
**(e) is NOT closed by this and must not be read as closed.** This changes only how an already-recorded value is **classified**; a live follower whose log is swapped underneath it still carries its position across and still reports a false `0`. That repair is a change to what `follow` **records** and therefore a revision of (a) — carried, not built.

**(d) Position is measured as LAG AGAINST THE HEAD, never as freshness of a timestamp.**
`head - emittedThrough`, not `now - at`. A clock measures the **traffic**, not the wire: on a quiet channel no position moves, so every healthy follower looks equally dead — during exactly the silence in which a real drop is hardest to notice.
**Its honest limit, which belongs in the contract rather than in a footnote:** head-lag can only convict a follower **once somebody sends**. A dead wire on a silent channel remains invisible to this and to everything else we have.

**(e) A `0` CAN BE FACTUALLY FALSE, and this primitive cannot tell — added session 6, n=2 observed.**
Clause (c) protects `null` from being flattened into `0`. **Nothing protects `0` from being a lie**, and the session that shipped the consumer found the case:
_Narrowed session 7, and the narrowing is the point: (c-bis) now catches exactly ONE mechanical class of false `0` — a record **ahead** of the head. That is the only lie with a free tell, because it is arithmetically impossible rather than merely suspicious. **Every false `0` where the surviving position is at or BEHIND the head is still undetectable**, and that is the whole of the case below. Read "nothing protects" as scoped to those; a reader who takes F1's fix as having addressed (e) has the reassurance backwards._ when the log a live `follow` is watching is **swapped underneath it** (a symlink repoint, a file replaced), the follower carries its `emittedThrough` across and reports **`current`, gap 0**, having emitted none of the messages in the new log. Two seats measured it on themselves; a third (me) cannot rule it out about his own wire, which is itself the point — **the tier that would settle it is `delivered`, and (a) says we do not have it.**
So the honest statement of what a `0` means is: *"the position record and the head agree"* — **not** *"this seat has seen everything."* Those coincide only while the log's identity is stable, and nothing in the tool observes that identity.
**Not fixed, and deliberately not papered over with a field that would look like a fix.** The plausible repair is that `follow` invalidates its own position when the log identity changes under it (inode/device, or a generation stamp), which is a change to what `follow` RECORDS and therefore a revision of (a) — not something the reader can bolt on. Recorded here rather than in a seat doc because a consumer reading `gap: 0` needs to know its limit, and the consumer is in another file, which is the exact distance at which every other clause here has already failed once.

**(f) `comms positions` is the named cross-seat read, and `followerAlive` is ADVISORY.**
The verb reports every roster seat against one head as `null` / `0` / `N`, and is **identity-free** under 4(c-bis) — it observes and attributes nothing, and it is what a seat reaches for when it suspects its OWN wire, which is precisely when demanding a resolved seat would be worst.
`followerAlive` is the recording follower's pid checked with signal 0. It **never contradicts `state`**: a dead pid means `emittedThrough` is a high-water mark rather than a live reading, and the row reports both rather than resolving them into a single verdict. **`null` means not-checked and must not be read as checked-and-dead** — the same rule as gap `null`-vs-`0`, one field over. Pids are reused, so it narrows a question and never answers one; it is the closest thing we have to a signal for (e) and it does not close it.

**Why it bites.** Every failure this primitive addresses is one where **an absence and a healthy quiet look identical** — a dead follower, a seat that never joined, a message written against a moved view. Every clause above is a place where a plausible simplification would restore exactly that ambiguity, and each would still read as correct: name the field for delivery, let `read` record too, collapse `null` into `0`, measure freshness instead of lag. **Three of those four were proposed in good faith during this feature's own design.**

**Proof — named assertions, never counts** (per Contract 4's second authoring note; every numeric citation in this file has been wrong at least once).
- (a)/(b): the `emittedThrough` field name and `readCommand`'s `refused:` string, both in the tree; and the real-follower test asserting **a live follower records what it emitted while `read` leaves the position byte-identical**.
- (c): the **three-value discriminator** — one function, three inputs, `[null, 0, 1]` asserted **as a set**. Any single case passes against a hardcoded value; the set does not. Plus the never-followed control asserting the position file **does not exist** before the first emit.
- (d): the **quiet-channel control** — a position with an arbitrarily ancient `at` is still `current` when the head has not moved. **This is the assertion that fails if anyone ever "simplifies" this to wall-clock freshness**, and it is the clause most likely to erode, because freshness is the obvious implementation.
- The negative direction end-to-end: a follower **killed by PID** falls behind while the head advances, and the emitted `catchUpWith` command, **run verbatim**, returns exactly the missed messages.
- (c-bis): the **ahead-of-head → never-followed** assertion; the **F1 convene scenario** replayed with the lead's own numbers (a record of 389 against `head: 0`), asserting `state`, `gap`, `emittedThrough` **and** `staleRecord` together — because `gap: null` alone would still pass while the row reported the number that makes a reader believe it; and the **`staleRecord` discriminator**, which asserts the two `never-followed` rows differ **as a pair** (`[never, false]` vs `[stale, true]`), so a flag hardcoded either way fails. Plus the **totality** control: `staleRecord` is `false`, not absent, on healthy rows.
- **⚠ The read-order clause has NO mechanical proof, and it is the load-bearing half.** "Positions first, head second" is what makes *a remaining negative is genuinely impossible* true; it lives in `comms positions` (`team-comms.ts`, the `READ ORDER IS LOAD-BEARING` comment) and **every assertion above takes `head` as a parameter**, so the pure tests cannot see the order the caller read it in. Reverse those two reads and the whole suite stays green **while healthy followers begin classifying as `never-followed` with `staleRecord: true`** — a false alarm on the instrument the team uses to audit the wire, which is the (c) defect pointed the other way. Stated rather than papered over, per Contract 5's precedent and Contract 4's authoring note: **an invented assertion here would give the appearance of proof for the one thing it does not cover.** The honest guard is a named re-read moment — whoever changes how `comms positions` gathers its inputs re-reads this clause in the same change.
**This absence is a DECISION, not a gap** — recorded in those words so a cold reader cannot mistake *"we could not pin this"* for *"nobody thought about pinning it"*, the same discipline as 4(c-bis) and Contract 5's ratified absence.

**(g) What authorises a TEARDOWN — ✅ RATIFIED AS A DESCRIPTION · 🔴 FALSIFIED AS A SAFETY PROPERTY (session 10, per clause).** _Authored session 9 by the lead alone, at teardown, after the owner had already stood down: drafted at comms `#408`, forager's departure record stamped 5m32s EARLIER, so the owner never saw it. That is how Contract 7 also came into existence and it is not a good way — session 10 was named as the ratify, in those words, and this is it._

> **forager (the owner) — comms `#419`, as of `#417`. Verdict per clause, because a per-contract boolean cannot express this one.**
>
> **RATIFIED — the formula is a faithful description of the shipped code.** Every branch traced. The `null` vs `[]` split, the `because` stamping, the refusal to grow the state set, and the non-emptiness conjunct all say what the code does.
>
> **FALSIFIED as a safety property — and the hole is one level BELOW where the author looked.**
> **`departed(s)` was an undefined predicate with no DOMAIN.** It did not mean *"s departed this session"*. It meant **"a file exists at `<teamDir>/comms/<channel>.departures/<s>.json`, written at any point in this channel's entire history"** — `hasDeparted` was a bare `existsSync`, and the record `{handle, channel, at}` carried **nothing to scope by**, so the omission was **absent rather than wrong**.
> **The non-emptiness conjunct was added to kill a vacuous quantifier. The identical hole survived inside the PREDICATE that quantifier ranges over.** `∀ s ∈ spawned` was repaired; `departed(s)` was not.
> _Generalisable, and it is the clause worth carrying to other teams: **when you patch a quantifier for vacuity, check the predicate it quantifies over.** The fix and the surviving hole are one level apart and read as the same sentence._
>
> **This ratify is recorded HERE because it happened on a wire that does not survive teardown**, and because session 8's recorded failure is *"this team ratifies on a wire and stores nothing."* A ratify that lives only in a message is indistinguishable at the next convene from one that never occurred.

**Owner (unconsulted):** forager · **Pointed at from:** weaver (`skills/comms` + `skills/join` tell a consumer-repo seat what presence MEANS and what `down` will do with it)

> **`none` means: a session-open record exists, it names at least one seat, and every seat it names has a departure record.** It does **not** mean *"no position records exist"*.
>
> ```
> none  ⟺  spawned ≠ ∅  ∧  ∀ s ∈ spawned : departed(s)
> ```
>
> **The non-emptiness conjunct IS the safety property** — without it the rule is vacuous exactly when the stakes are highest: a fresh session has no open record, so a universal over the empty set is trivially true and would authorise teardown with panes full of working seats.
>
> **`spawned: string[] | null` — `null` ≠ `[]`, deliberately.** `null` = *no open record exists*; `[]` = *a record exists and names nobody*. The same fact about the world, different facts about our knowledge — **(c)'s "`null` is not a rounded-down zero", one layer out on a new input.** Both land on `unknown` today, so the branches are behaviourally identical and **must stay separate anyway**: collapsing them reintroduces the vacuous case **wearing the shape of a simplification.** _(sentinel measured that no verdict-level test can pin this split — it is defended by the branch-stamped `because` field, not by a state.)_
>
> **The state set does NOT grow**, per (c-bis)'s rejection of a fourth state: the fresh-session world routes onto `unknown`, which every consumer already has a policy for. The diagnostic rides as **total fields** (`spawnedCount`, `departedCount`) per Contract 5(a). **`unknown` here is HONEST, not merely safe** — at a fresh session the tool genuinely does not know. **`none` was the state that was lying.**

**✅ RESOLVED AT `53ecae4` (session 10) — and it was a TRIPLE, not a pair. Read this before the historical record below it.**

**D3, found session 10, is the one the pair never named: `departed(s)` had no session scope.**
Measured on the real tree before a line changed — four session-9 tombstones on disk for exactly the four seats then working. `commsPresence` returned **`none` / `all-spawned-departed`: teardown authorised while four seats worked.** Remove only those files, one variable, and it returns `unknown`.
**Reachable at teardown AND at the fresh-spawn instant** — a seat that has not followed has `hasRecord: false`, so it is filtered out of the follower branches and arrives at the departure check carrying nothing but a stale tombstone. **`anthill down` at the START of a session authorised killing every pane**, which is worse than the teardown case because at teardown you at least intend to.
_Session 9 was masked by an accident (its scout never stood down), exactly as session 9 itself was masked by `spawned: null`. **Twice in a row the guard was saved by incompleteness rather than by correctness.**_
**A mask fails SAFE. A stale departure fails OPEN.** The plan's prose knew only the safe direction.

**The repairs, all three together — `53ecae4`:**
- **D3** — `hasDeparted(teamDir, channel, handle, sessionOpenedAt)`; true only for `record.at >= sessionOpenedAt`. **Nothing is deleted**, so session 9's tombstones survive (they are the only copy of what its retro cites) and simply stop counting. **Rotation therefore stayed a SUCCESSOR, not a precondition** — that was the lead's own strongest counter, offered explicitly, and it was broken rather than conceded.
- **D1** — a **QUALIFIER** on branch 1 (`followerAlive === true && !r.departed`), **not a hoist above it.** Two rival constructions were built and diffed over the reachable cell space; they agree everywhere except `{departed, live, spawned: null | []}`, and **`shouldBlockTeardown` returns the same value for both**, so a verdict-level test certifies either. Ruled on precedent: `{departed, spawned: []}` is an **incoherent record** — a seat cannot depart a session it was never spawned into — and **(c-bis) already routes that class to the state meaning *the tool has no idea*.** The hoist would report `present, because: live-follower`, **naming a seat that filed a departure record as being here.**
- **D2 — RULED BRANCH B: `stand-down` stays ADVISORY. A departed seat may still send.** Decided by measurement, not taste: session 9's `#402` — the report of D1 itself, the teardown's most valuable message — was sent **+71s after its own tombstone** and would have been refused. **A guard that would have deleted the session's central finding needs a better argument than tidiness.**
  **So the conjunct STOPS MEANING "gone".** `departed(s)` is **administrative, not terminal**; session-scoping makes it *sound*, not *terminal*. **D3 delivers the safety property; D1 delivers the liveness qualifier; terminality was never the load-bearing part.** `down` kills PANES, and a pane is not a statement.

**⚠ TWO PROPERTIES A CONSUMER MUST NOT INFER AWAY, both found by execution and neither obvious from the formula:**
1. **Branch 1 ranges over the WHOLE ROSTER; the departure check ranges over `spawned`.** A lead who is in `rows` and not in `spawned` **blocks teardown with his own live follower** until he stands down himself. Not a defect — but the exit criterion is unreachable without an explicit lead stand-down step, and **the discriminator there is the DEPARTURE RECORD, not the pid**: a lead who stands down authorises teardown with his follow still alive.
2. **The tombstone branches are only reachable when NO seat has a live follower.** Every statement of this hazard — the lead's, the owner's, the verifier's — left that condition unstated somewhere, which made a pre/post reading look discriminating when it was not. **State the population, not just the predicate.**

**⏳ SESSION 12 — ROTATION HAS LANDED (`81d3991`) AND THIS CLAUSE IS STILL TRUE. The amendment is NOT YET DUE, and this note is its TRIGGER.** _(Ruled by the owner at the lead's R30 ask, from a measurement rather than from the design, and deliberately not ruled in the direction that would let a release criterion pass.)_

Session 11 carried a prediction that **property 1's lead-veto is false post-rotation** — because rotation empties the positions directory, every row then has `hasRecord: false` ⇒ `followerAlive: null`, branch 1 needs `=== true` and cannot fire, and **the lead's live follower stops blocking teardown.** That reasoning is correct and it is **not yet in force.**

**The distinction that decides it: the veto is falsified by an EXECUTED rotation, never by the mechanism EXISTING.** `81d3991` landed **inert** — no `rotate` verb, nothing in production calls it. With no `CURRENT` pointer the channel resolves the legacy layout, so every position record is exactly where it was.

**Measured at `81d3991`, clean tree, on the live channel rather than a fixture:**

```
readCurrentSession(anthill-dev)  ->  null          (legacy layout, no rotation has occurred)
resolveCommsPosition(forager)    ->  <team>/comms/anthill-dev.positions/forager.json
comms positions                  ->  6 of 6 seats  state=current  followerAlive=TRUE
  => branch 1 fires for maestro, so THE LEAD'S LIVE FOLLOWER STILL BLOCKS TEARDOWN
```

> **⚠ THE TRIGGER, and it is the only part of this note that must survive: THE FIRST EXECUTED ROTATION ON A CHANNEL FALSIFIES PROPERTY 1 FOR THAT CHANNEL. Whoever runs that rotation owes this clause its amendment in the same change — that is the write-trigger, and the debt is theirs, not the next reader's.**

**Why a trigger and not the amendment now:** amending a clause that is still true would make this file describe a world we are not in — the defect Contract 4 records against itself (*prose describing a branch that cannot occur*, so a reader writes a handler for a state the system never produces). **An amendment written tonight would be wrong tonight and right later, which is indistinguishable from wrong.**

**And the second half a reader will otherwise infer wrongly: positions are now PER SESSION (`comms.ts`, `commsPositionPath`'s `sessionId` parameter), which means a rotation does NOT carry a watermark into a log that never contained it.** That is a partial mitigation of **(e)** for the ROTATION path only — **(e) is NOT closed**, and must not be read as closed: a symlink repoint or a file replaced underneath a live follower is untouched by this, because the mitigation lives in *path resolution* and (e)'s repair would have to live in what `follow` **records**, which is a revision of (a). _Pre-registered by steward and reproduced live by sentinel with an inode proof before the code existed; the design is theirs as much as mine._

---

**HISTORICAL — the two defects as recorded at session 9, kept because the reasoning is the record. Both are now fixed; do not read this block as live.**

**Defect 1 — `none` is UNREACHABLE through the intended lifecycle.** Branch 1 (`followerAlive === true` → `present`) fires **before** departure is consulted, so a stood-down seat still reads `present` while its `comms follow` is alive — **and `down` is what kills the follow.** Circular. Found independently by forager and steward (distinct watermarks; counted once).

**Defect 2 — `departed(s)` does not mean the seat has stopped working, and the formula above assumes it does.** Measured on this session's own artifacts, **4 of 4 seats, 7 messages**:

| seat | departure record | messages sent AFTER it |
| --- | --- | --- |
| steward | 03:23:06 | `#401` `#405` |
| weaver | 03:23:20 | `#399` `#406` |
| forager | 03:23:31 | `#402` `#404` |
| sentinel | 03:23:36 | `#397` |

By **03:23:36** every conjunct above was satisfied. **`#402` — forager's report of Defect 1, the most valuable message of the teardown — was sent 71 seconds later.** A guard obeying (g) as written would have authorised teardown before it was written, and the session's central finding would not exist.

**The cause is the lead's, not the seats'.** The ruled teardown sequence (`#399`) was *"1. stand down · 2. post retro answers"* — **seats were ORDERED to send after standing down, and all four complied exactly.** So `stand-down` means *"administratively finished"* in the ritual and *"gone"* in this contract, and **nothing anywhere reconciles the two.** It is not a lapse by any seat; it is two artifacts assigning one word two meanings.

**What actually protected this session was an accident.** `spawned` is `null` (this team was spawned before `spawn` learned to write the open record), so presence was `unknown` and the guard fail-closed. **The seven messages survived because the feature was incomplete, not because the guard was right.**

**Therefore, for session 10:** repairing Defect 1 makes `none` reachable, which makes **Defect 2 live** — a guard that blocks forever becomes a guard that fires too early, and the failure flips from visible to silent. **Either repair them together, or make `stand-down` actually terminal (a departed seat's `send` is refused) and change the ritual's ordering to match.** Tests first, per the tripwire ruling.

> **✅ DISCHARGED at `53ecae4`, and the fork above was resolved the OTHER way — read the resolved block at the top of this defect record, not this paragraph.**
> Session 10 repaired them together **and** declined terminality: `stand-down` stays **advisory** (Branch B), because the measured cost of terminality was the deletion of session 9's own central finding. **The instruction "either together, or terminal" offered two options and the answer was the first WITHOUT the second** — which neither option as written allows, and which is why this note exists rather than a tick.
> _The prediction that survived: **"never Defect 1 alone" was right, and it was righter than its author knew** — D3 makes a D1-only repair *actively wrong* rather than merely incomplete, and the verifier proved the fresh-spawn cell is **identical** on the unrepaired guard and on both rival D1 repairs. A D1-only fix would have hardened branch 1, looked like the hazard was addressed, and left the guard authorising teardown at spawn._

**Proof — NAMED ASSERTIONS, never counts** (per Contract 4's second authoring note: every numeric citation in this file has been wrong at least once, and one rotted during the session that corrected it).

- **D3, as a discriminator rather than a constant:** *"stale / fresh / absent produce three distinct answers"* in `comms.test.ts` — one function, three inputs, `[true, false, false]` asserted **as a set**. Any single row is satisfied by a hardcoded `false`; the set is not. **The positive row is first on purpose** — without it a permanently-false predicate passes everything else here and `none` becomes unreachable, which is always-block, which trains reflexive `--force` and deletes the guard for real.
- **The boundary:** *"a departure stamped AT the session origin counts — the boundary is inclusive."* `>=`, not `>`, pinned by assertion because it is exactly the kind of thing a later tidy flips silently. **Mutation-verified to fail ALONE.**
- **Fail-safe totality:** *"no session origin, or a damaged record, is NOT a departure"* — covering `null` origin, unparseable JSON, and the pre-D3 tombstone shape with no `at`. All return `false`, and `false` BLOCKS. **An unreadable world must never authorise killing a pane.**
- **D1 as a pair:** *"departed is the ONLY difference — the pair discriminates"* asserts `["present", "none"]` as a set, with *"a NON-departed seat with a live follower still reports present"* as the **positive anchor written first** (Contract 4's assertion-(4) shape).
- **The caller invariant, which is what D1's safety is INHERITED from:** *"no-record rows can only carry followerAlive null (the shape production emits)"*. Branch 1 does **not** test `hasRecord`; a never-followed seat is kept out of it only because the production caller derives both fields from ONE `position` lookup. **Nothing asserted that coupling, and D1 edits exactly that branch.** Found by steward against the owner's own claim that no-record rows were filtered from *both* branches — **true of branch 2, false of branch 1.**
- **The "never D1 alone" hold:** *"a spawned seat that never followed reaches none via departure, not liveness."* It must **not** move across the D1 repair — a repair that moved it would mean branch 1 had grown reach it should not have. **The verifier measured this cell identical on the unrepaired guard and on both rival repairs**, which converts *"never D1 alone"* from a constraint we agreed to into an executable fact.

**Mutation-checked, each with its substitution count asserted BEFORE the suite was believed** (the harness is a shell + perl pipeline and has silently failed to substitute three times in this seat's history, always reporting the reassuring direction): removing the D1 qualifier, reverting D3 to the bare `existsSync`, and flipping the inclusive boundary each fail — **a predicted mix every time, never uniform red.** All runs in `git archive` copies **outside the checkout**, so a deliberate breakage never blocked a peer's land.

**Still UNVERIFIED by the owner at the COMMAND boundary.** The above is pure functions plus the gate; the owner did not run `anthill down`. The verifier discharged that boundary separately by deleting the guard call from `down`'s `run()` and observing the suite go red — **that is his measurement and is not restated here as the owner's.**
