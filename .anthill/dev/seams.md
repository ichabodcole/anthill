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

1. **`convene` opens the board keyed + pinned + headless** — `bounty open --session-key <channel> --pin --no-open` (`bountyOpenArgs`). `--pin` writes `.bounty-session` at the repo root; `--no-open` keeps it browser-free; keyed open is **idempotent** (re-attaches, never hijacks). Convene opens **before** it reads counts so `bounty state` resolves the pinned board.
2. **`spawn` exports the key into each pane** — the launch line is prefixed `BOUNTY_SESSION_KEY=<channel> ` (`buildSeatLaunch`), so a spawned seat's improvised verbs inherit the binding with no flag.

Resolution is **spellbook-side** (v1.16.0): a verb with no `--session` resolves the board by `.bounty-session` walk-up from cwd **or** `$BOUNTY_SESSION_KEY` in the env — so the **lead**, a **hand-started pane**, and a **seat-dispatched subagent** (none carry anthill's exported env) all resolve via the pinned file, while spawned seats also carry the env. **Seats and the lead NEVER pass `--session`** — the binding is ambient by construction. `init` gitignores `.bounty-session` (per-session/local state, never committed).

**Scope bound (the binding is project-tree-local, not global).** The id spellbook derives is `k-<keyname>-<projecthash>` — **project-path-scoped**. Both the `.bounty-session` walk-up and the `$BOUNTY_SESSION_KEY` env-key derivation resolve **only from within the project tree**; the same key from an unrelated cwd (e.g. `/tmp`) resolves to "no session", never the team board. Correct in practice — seats always run inside the repo — but the guarantee is bounded to the tree, not the machine. (Proof: sentinel's Phase 5 — the env-decoy bound only from the repo; `anthill-dev` from `/tmp` → "no session".)

**The key is shell-safe or it's a hard error.** `config.channel` is interpolated unquoted into a `BOUNTY_SESSION_KEY=<key>` prefix typed into a pane shell — so it is charset-guarded to `[A-Za-z0-9._-]` (`SAFE_SESSION_KEY`); a malformed channel fails clean at a `spawn` preflight (no half-spawn), never as an injection.

**Why it bites:** without the key every un-flagged verb resolves the bounty daemon's global **`latest`** pointer — with two boards live, a seat silently reads/writes a **stranger's** board (anthill #23/#19; it froze live sessions). The failure is silent (`noop:true` the only tell) and hits exactly the **improvised** verbs a seat runs naturally, not just anthill's pre-emitted ones. Binding the _environment_ + the _directory_ (not each call) is what makes correctness require zero agent cognition.

**Proof:** `plugin/scripts/anthill/commands/team-convene.test.ts` (`bountyOpenArgs` golden), `plugin/scripts/anthill/commands/team-spawn.test.ts` (`buildSeatLaunch` env-prefix + the 3 unsafe-key rejections), `plugin/scripts/anthill/commands/team-init.test.ts` (`planGitignore` reuse for `.bounty-session`, incl. the already-present-under-a-comment case). The live two-board hijack proof (a fresh stranger board as `latest`, an improvised `bounty update` from a seat pane STILL hitting ours) is sentinel's Phase 5 — the mechanism these unit seams compose can't be proven by a unit test.

## Contract 4 — team-comms: the emitted incantation + seat-identity resolution

**Owner:** forager · **Pointed at from:** weaver (`skills/join` renders the incantation and writes the usage-altitude prose a consumer repo actually reads)
**Ratified at:** the **emitted incantation's form** and **identity resolution on every path, success included**.
NOT the verb names, the flag surface, the channel-resolution rule, the on-disk log format, or the poll interval — those are the owner's to choose and change freely.
Ratified on the vine (`anthill-dev` #7–#17, three seats, both directions) ahead of any code; maestro's #14 ruled siting (inside `plugin/`) and zero-dep (confirmed) and explicitly declined to touch the seam's contents.

**The contract, stated once.**

**(a) The incantation is a literal, fully-resolved, per-seat command string, composed by the CLI and rendered verbatim.**
The consumer never composes it, never interpolates a handle into it, and never encodes the tool's location.
House precedent is already in the tree: `anthill join` emits `tailCommand` / `boardTailCommand` fully resolved (handle already substituted), not a template.

**(b) It reaches the consumer as a `comms` block in the join manifest that is ALWAYS present**, carrying `{ channel, incantation }` — so the consumer renders it and never probes the filesystem or interprets an exit code to decide what to render.

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
_(Tests land with forager's lane; link them here when green.)_

**Authoring note — how (4) went missing, because the mechanism recurs.** Assertions (1)–(3) were written in the same vine message that *withdrew* the success-path ask; the clause was then strengthened from two other directions, and the proof list was carried forward unchanged from before the strengthening.
The contract text advanced and its own proof did not — **clause-vs-its-own-proof drift, inside a single file, introduced at authoring time.** Not doc-vs-code drift, and no gate catches it.
The cheap guard: after strengthening any clause here, re-read the Proof section and ask which assertion would fail if the new words were false.
