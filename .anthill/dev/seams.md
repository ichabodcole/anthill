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

1. **`convene` opens the board keyed + pinned + headless** — `bounty open --session-key <channel> --pin --no-open` (`bountyOpenArgs`). `--pin` writes `.bounty-session` at the repo root; `--no-open` keeps it browser-free; keyed open is **idempotent** (re-attaches, never hijacks). Convene opens **before** it reads counts so `bounty state` resolves the pinned board.
2. **`spawn` exports the key into each pane** — the launch line is prefixed `BOUNTY_SESSION_KEY=<channel> ` (`buildSeatLaunch`), so a spawned seat's improvised verbs inherit the binding with no flag.

Resolution is **spellbook-side** (v1.16.0): a verb with no `--session` resolves the board by `.bounty-session` walk-up from cwd **or** `$BOUNTY_SESSION_KEY` in the env — so the **lead**, a **hand-started pane**, and a **seat-dispatched subagent** (none carry anthill's exported env) all resolve via the pinned file, while spawned seats also carry the env. **On a SHARED tree, seats and the lead never pass `--session`** — there, the binding is ambient by construction. **That sentence is scoped deliberately and must not be widened back:** under per-seat worktrees it is false (see the session-6 REVISION below), and an explicit id is currently the only reliable binding. State which tree shape you mean; a claim true of one and asserted of both is Contract 5(b)'s failure mode. `init` gitignores `.bounty-session` (per-session/local state, never committed).

**Scope bound (the binding is project-tree-local, not global).** The id spellbook derives is `k-<keyname>-<projecthash>` — **project-path-scoped**. Both the `.bounty-session` walk-up and the `$BOUNTY_SESSION_KEY` env-key derivation resolve **only from within the project tree**; the same key from an unrelated cwd (e.g. `/tmp`) resolves to "no session", never the team board. Correct in practice — seats always run inside the repo — but the guarantee is bounded to the tree, not the machine. (Proof: **UNVERIFIED-BY-CONSTRUCTION** — see the note under Proof below; the observation was an env-decoy bound only from the repo, with `anthill-dev` from `/tmp` resolving to "no session".)

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
The join manifest's other two commands are **spellbook's** (grapevine, bounty), not anthill's CLI, so they have no anthill envelope to promise and are not evidence here.
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
