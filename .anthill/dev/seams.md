# seams — the shared inter-seat contracts

**What this file is.** The single home for the truths that live between seats: the boundaries where
one seat's work meets another's. A seat doc must point here, never restate this.

**`anthill <command>` here is shorthand, not a binary on your PATH.** The real invocation is
`bun "${CLAUDE_PLUGIN_ROOT}/scripts/anthill/cli.ts" <command>`. `${CLAUDE_PLUGIN_ROOT}` is only set
while a plugin skill is running. Take the resolved command from `anthill:join`.

**What belongs here.** Apply this admission test when writing a contract. A contract earns a place
here when it is shared truth that more than one seat must rely on and that drifts if restated: a data
shape passed across a boundary, an invariant two seats both rely on, a protocol between slices. A
lesson does not belong here, however important. Lessons go to your report. A lesson that generalises
becomes a principle at curation.

**Who writes here.** The lead lands a contract at `anthill:plan` (ratified up front) or
`anthill:curate` (accreted from reports). A seat proposes a contract: on the wire during plan, in its
report otherwise. A seat never edits this file mid-session.

**Two file rules.** (1) A proof citation names assertions, never counts. (2) State which tree shape a
clause is true of: shared tree or per-seat worktrees.

**History.** The full pre-curation file is `reports/2026-09-03-migration/seams.md`.

## Ownership & the maintenance trigger

- **Each contract has one owning seat**, the seat that is authoritative for that boundary in code.
  The owner keeps the contract's prose true. Other seats defer to it.
- **The write-trigger (binds everyone):** whoever moves a boundary proposes the update and its proof
  in the same change.
- **Pin to proof where you can.** Prefer a green test that fails when the boundary breaks. Fall back
  to a durable concept or a commit. Never cite a transient line or file reference. Where a clause has
  no mechanical proof by decision, say so in those words, and name the re-read moment that guards it
  instead.

---

## Contracts

## Contract 1 — the `anthill scan` payload (`ScanReport`)

**Owner:** forager · **Pointed at from:** weaver (`skills/bootstrap` consumes it to render candidate seatings)
**Ratified at:** the full `ScanReport` field set and semantics: every field's type, its null-meaning,
and resolution order. A consumer needing a field not listed here has hit a new seam.

**The invariant:** `anthill scan` emits `{ ok, data: ScanReport }` where

```ts
interface ScanReport {
  root: string; // absolute repo root: .git / topmost package.json / cwd — resolved BEFORE .anthill exists
  workspace: { manager: "bun" | "pnpm" | "npm" | "yarn" | null; globs: string[] } | null; // null ⇒ single-surface
  evidence: "manifest" | "none"; // "manifest" iff at least one unit was derived from a manifest ACTUALLY READ (root package.json, or members expanded from globs — so `warnings` may still report no root package.json). "none" ⇒ nothing was read: units[0] (if any) is SYNTHESIZED, stack empty by ABSENCE. Globs matching zero members, and a package.json containing `"hello"`, are both "none"
  units: ScanUnit[]; // workspace members; single-surface ⇒ the ONE root package (len 1, path ".")
  warnings?: string[];
}
interface ScanUnit {
  name: string; // package.json "name", else dir basename
  path: string; // repo-relative POSIX dir; "." for root/single-surface
  kind: "app" | "package"; // position-PRIMARY (apps/*⇒app, packages/*⇒package); manifest signals only tiebreak an ambiguous path
  stack: string[]; // dep-derived markers, ordered DOMINANT-FIRST (stack[0] = primary framework)
  private: boolean;
  internalDeps: string[]; // names of OTHER units this depends on (prod+dev+peer deps ∩ member names, sorted)
}
```

Two rules apply to the shape. **(a)** Two surfaces share a stack if and only if their `stack[0]`
values are equal. **(b)** The shared-contract seat is the `kind:"package"` unit with fan-in from ≥2
surfaces via `internalDeps`.

**As built (v1):** `kind` is position-primary, so on a non-conventional monorepo the consumer
overrules it from the raw signals (`private`, `stack`, `internalDeps`). pnpm negation globs are
parsed and dropped. `workspace.manager` is null when no lockfile is committed.

**Consumer constraint:** `evidence: "none"` does not mean "not a software project". A Python or Rust
repo answers `"none"` today. Phrase the response as "I found no manifest I can read" and ask.

**Proof (green):** `plugin/scripts/anthill/scan.test.ts`, covering the pure detectors (`sniffStack`
dominant-first, `classifyUnit` position-primary, `internalDepsOf` fan-in, `parseWorkspaceGlobs`), the
full `ScanReport` golden over `__fixtures__/workspace-repo`, the `single-surface-repo` null-workspace
case, and the `evidence` describe (no-manifest, real-app control, malformed and non-object manifests,
globs matching zero members, a pnpm workspace with no root manifest asserted as `evidence` and
`warnings` together). `commands/team-scan.test.ts` covers the text rendering.

**Mechanism:** `scan` runs before `.anthill/` exists, so `root` must not resolve from the config
walk-up. A consumer that picks its archetype from one boolean hands a novel repo the wrong team.

## Contract 2 — the `anthill feedback` invocation contract

**Owner:** forager · **Pointed at from:** weaver (the touchpoint prose tells agents how/when/who invokes it)
**Ratified at:** the invocation surface and the degradation guarantee: flags, envelope shape, and
never-drop/never-throw behavior. Not the issue body's internal layout, which forager may change
freely.

**The invariant:** `anthill feedback "<msg>" [--category bug|friction|idea|docs] [--skill <name>] [--submit]`.
A bare call composes and emits, sending nothing (`{ok,data:{title,body,repo,issueUrl,submitCmd}}`).
`--submit` runs `gh issue create … --label anthill-feedback` and on any failure degrades to
`{ok,data:{title,body,issueUrl(prefilled)},warnings:[…]}` exit 0. It never drops the report and never
throws. `title` = `[feedback/<category>] ` + first message line (≤~72c). `submitCmd` is the
self-re-invocation `anthill feedback "…" --submit`, never raw `gh`. The `anthill-feedback` label is
always applied. `body` carries the message plus non-sensitive env only, never repo content.

**Two disjoint homes for the framing (do not merge them):** what the command is for lives in its
`--help` (forager). Team routing is canonical in the SOP (weaver): seats surface, the lead submits,
and solo means the lead does both. `--help` may carry a terse pointer to the SOP. It must
not restate the routing.

**Proof (green):** `plugin/scripts/anthill/feedback.test.ts` (goldens for `composeFeedbackBody`,
`feedbackTitle`, `buildIssueUrl` and `interpretGhResult`, including a privacy assertion), plus
`commands/team-feedback.test.ts` (guard envelopes; stubbed-`gh()` success and failure branches with a
`forbiddenGh` that throws if the default path ever calls it, so no real network).

**Mechanism:** a raw-`gh` `submitCmd` bypasses the no-loss guards.

## Contract 3 — board-binding (every seat verb targets THIS team's board, ambiently)

**Owner:** forager · **Pointed at from:** weaver (`convene` SKILL.md + the SOP say the board is key-bound and point here)
**Ratified at:** the binding mechanism: key identity (`= config.channel`) and the two ambient
emitters. Not spellbook's internal session-storage format, which is upstream's to change.

**The invariant:** the bounty session key is `config.channel`, bound by two ambient emitters, and
`--session` is threaded onto no individual verb.

1. **`convene` opens the board keyed, pinned, headless and restoring:** `bounty open --session-key
   <channel> --pin --no-open [--restore <id>]` (`bountyOpenArgs`). `--restore <id>` is appended
   whenever the key has a snapshot (`<id>` is the `key` of the `bounty sessions` row the task count is
   read from). It is safe in both directions: a dead board restores, and a live board attaches and
   reports `restoreSkipped`. The owner's ratification of this clause is not on record. Ratify or
   falsify it at the next plan.
2. **`spawn` exports the key into each pane.** The launch line is prefixed
   `BOUNTY_SESSION_KEY=<channel> ` (`buildSeatLaunch`), so improvised verbs inherit the binding with
   no flag.

Resolution is spellbook-side: `--session` > `$BOUNTY_SESSION_KEY` > `$BOUNTY_SESSION` >
`.bounty-session` walk-up > `latest`. On a shared tree the lead, a hand-started pane and a spawned
seat all resolve this team's board with no flag. `init` gitignores `.bounty-session`.

**Bound, per-seat worktrees.** The ambient guarantee does not hold there. `findScopeRoot` stops at a
linked worktree's `.git` pointer file and derives an id no board answers to, and the exported key
shadows every fallback that would have worked. The working binding is `unset BOUNTY_SESSION_KEY` plus
an explicit id. Open decision, not ruled here: `spawn`'s exported key becomes worktree-aware or stops
being exported.

**Scope bound:** the derived id is `k-<keyname>-<projecthash>`, so both resolvers work only from
inside the project tree, never from an unrelated cwd. **Second reader:** `boardOwnerFromBinding`
(`commands/team-support.ts`) parses `.bounty-session` to answer which team holds the board. If
spellbook changes its derivation the guard returns `null` for every binding and fails open. Its
tripwire is the round trip in `team-support.boardbinding.test.ts`: a real `convene`, then assert the
reader recognizes what it wrote. Do not replace that with a fixture string.

**The key is shell-safe or it is a hard error:** `config.channel` is charset-guarded to
`[A-Za-z0-9._-]` (`SAFE_SESSION_KEY`) at a `spawn` preflight, so a malformed channel fails clean,
never half-spawns.

**Proof:** `commands/team-convene.test.ts` (`bountyOpenArgs` golden), `commands/team-spawn.test.ts`
(`buildSeatLaunch` env prefix; the unsafe-key rejections), `commands/team-init.test.ts`
(`planGitignore` for `.bounty-session`), `team-support.boardbinding.test.ts` (the round trip). The
live two-board proof has no automated form by decision: it needs two daemons. The recipe: open an
unrelated board so `latest` is the stranger's, confirm from a neutral directory, then run an
un-flagged `bounty` verb from inside this repo and assert it still reaches this team's board. Do not
omit the stranger-as-`latest` step.

**Mechanism:** without the key every un-flagged verb resolves the daemon's global `latest`, and with
two boards live a seat silently writes a stranger's board.

## Contract 4 — team-comms: the emitted incantation + seat-identity resolution

**Owner:** forager · **Pointed at from:** weaver (`skills/join` renders the incantation and writes the usage-altitude prose a consumer repo reads)
**Ratified at:** the emitted incantation's form, and identity resolution on every path, success
included. Not the verb names, the flag surface, the channel-resolution rule, the on-disk log format,
or the poll interval.

**(a) The incantation is a literal, fully-resolved, per-seat command string, composed by the CLI and
rendered verbatim.** The consumer never composes it, never interpolates a handle, and never encodes
the tool's location.

**(b) It reaches the consumer as a `comms` block in the join manifest, present in every manifest
`join` emits**, carrying `{ channel, incantation }`. Bound: `join` has no manifest to degrade to with
an unknown seat or no config. Those are Contract 5's error surface. Coord resolution is non-fatal.
`boardTailCommand` is `null` when bounty is unavailable, a positive observation whose reason is in
`warnings`, never an unpopulated field. `tailCommand` is absent, never `null`. `null` is the right
answer for a wire that could be there, and absence is the right answer for a wire that cannot. A
consumer must not read that absence as "unavailable this join".

**(c) Identity is a seat, and the tool states where identity came from on every path, success as much
as failure.** The resolution outcome (resolved-from-roster · not-a-seat · no-config) is a first-class
envelope field. There is no free-form-alias fallback: `--as <not-in-roster>` is an error, `--as`
omitted is an error, and neither degrades to an ambient identity. Failures never exit bare non-zero.
A not-a-seat error enumerates the valid seats.

**(c-bis) Identity binds the verbs that attribute, not the verbs that observe.** `send` and `follow`
require a resolved seat. `read` does not, by decision: it changes nothing, attributes nothing, and is
the verb a half-joined agent reaches for first.

**(d) Where a consumer repo cannot see this file, carry the seam in emitted values rather than in
words.** Exemplify the dialogue, never the invocation. The CLI's printed output is the load-bearing
onboarding text, so the incantation is prose the owner is accountable for.

**Proof (named, not counted):** in `comms.test.ts`, the three-distinct-outcomes discriminator (one
field, three values, asserted as a set). In `commands/team-comms.test.ts`: a rejected `--as` leaves
the log byte-identical. The no-config case runs from a genuinely config-less tree. `--as` omitted
errors. A successful send asserts `resolved-from-roster` positively on the happy path. In
`commands/team-join.test.ts`: "a missing spellbook must not sink the manifest" (comms block and
grounding list survive an empty `HOME`, with a positive control that the fixture had no spellbook) and
"bounty down: the manifest reports the BOARD gone and invents no other wire" (`boardTailCommand`
`null`, no `grapevine` token anywhere, `tailCommand` not among the emitted keys, a key-set check,
because `null` and absent are indistinguishable to a value comparison).

**Mechanism:** a send that resolved from the roster and one that took the caller's string emit the
same green, so without (c) seat-aware identity is unverifiable from outside the process.

## Contract 5 — the CLI failure surface: what the envelope carries, and what our prose may promise about it

**Owner:** forager · **Pointed at from:** weaver (`skills/join` + `skills/comms` make claims about how these tools fail)
**Ratified at:** the tier rule (a) and the prose constraint (c). Not field names, not `meta.stack`'s
shape, not the format-sniffing implementation.

**(a) Top-level envelope fields are total.** `meta` is the variable bag.
`ErrorEnvelope = {ok:false, error:string, meta:{command}}`. Every top-level field has the same shape
on every error path. A value only one path can produce lives on `meta`. An optional top-level field
populated on one path makes its absence unreadable: an agent cannot tell inapplicable from
unpopulated. Doing that honestly needs an error-kind discriminator, which is a CLI-wide change, not a
clause amendment.

Clause (b) was removed. Its rule lives in `principles.md`.

**(c) Prose may not condition a promise about the envelope on a flag the CLI's own emitted commands do
not pass.** The envelope is conditional on not being a TTY, not on `--format json` (`resolveFormat`:
an explicit `json` or `text` wins, otherwise `isTTY ? text : json`). The anthill invocations we emit
pass no `--format`. State it format-agnostically: an agent gets a parseable envelope, and it does not
ask for one. The join manifest's other commands are spellbook's and carry no anthill envelope.

**Proof:** (a) is pinned by the format-decision invariant in forager's tests: the format decision must
not depend on where the error was raised. (c) has no mechanical trigger, by ratified decision. Whoever
changes the envelope re-reads the two skills' failure-surface claims in the same change. Do not
substitute a grep of the prose.

## Contract 6 — the per-seat position: what `emittedThrough` contains and what it may never claim

**Owner:** forager · **Pointed at from:** weaver (`skills/comms` + `skills/join` tell a consumer-repo seat what a position and a gap MEAN)
**Ratified at:** which tier the value lives in, what it claims, and the three-state distinction. Not
the storage layout, the file-per-seat choice, the poll interval, or the field names.

**(a) The tool observes emitted. Not delivered, and never read.** `follow` stamps the position when
it writes a message to its own stdout. Emitted is the only tier the tool has. Delivered is not
observable from inside the tool. A seat can establish delivery about itself by watching its own send
echo back, and a peer can establish the negative direction about another seat: messages not emitted to
you were never delivered. That negative direction is what this primitive serves. Read is testimony and
stays hand-written. `--as-of` does arithmetic on that testimony and does not verify it.

**(b) `follow` records. `read` records nothing, by decision.** (4(c-bis)). A seat that only ever reads
has no position at all.

**(c) Three states, never collapsed into a number.** `never-followed` (the tool has no idea what this
seat has seen) · `current` (lag 0) · `behind` (lag N). The consumer-facing gap is `null` / `0` / `N`. `null`
is not a rounded-down zero.

**(c-bis) An incoherent record is `never-followed`, and the state set does not grow.** A record ahead
of the head cannot describe this log. It classifies as `never-followed` with `gap` and
`emittedThrough` `null`. The diagnostic is the total flag `staleRecord`, per 5(a). The read order is
part of this contract: `comms positions` reads positions first, head second. Reversed, a message
appended between the two reads manufactures an ahead-of-head record from a healthy follower.

**(d) Position is lag against the head, never freshness of a timestamp.** It is `head - emittedThrough`,
not `now - at`. Its limit: head-lag can only detect a stalled follower once somebody
sends, and a dead wire on a silent channel is invisible to this and to everything else we have.

**(e) A `0` can be factually false and this primitive cannot tell.** When the log a live `follow`
watches is swapped underneath it, the follower carries its position across and reports `current`. So
`0` means "the position record and the head agree", not "this seat has seen everything". The repair is
a change to what `follow` records, therefore a revision of (a), carried and not built. Per-session
positions (`commsPositionPath`'s `sessionId`) mitigate the rotation path only.

**(f) `comms positions` is the named cross-seat read, identity-free under 4(c-bis). `followerAlive` is
advisory.** It is the recording follower's pid checked with signal 0. It never contradicts `state`.
`null` means not-checked, never checked-and-dead.

**(g) What authorises a teardown.** `none ⟺ spawned ≠ ∅ ∧ ∀ s ∈ spawned : departed(s)`, where
`departed(s)` is session-scoped: a departure record counts only if `record.at >= sessionOpenedAt`
(inclusive). `spawned: null` (no open record) and `[]` (a record naming nobody) both route to
`unknown` and must stay separate branches. A live follower reports `present` only if the seat has not
departed (`followerAlive === true && !departed`). `stand-down` is administrative, not terminal: a
departed seat may still send. Two properties a consumer must not infer away. Branch 1 ranges over the
whole roster while the departure check ranges over `spawned`, so a lead with a live follower blocks
teardown until he stands down himself. The tombstone branches are reachable only when no seat has a
live follower. Trigger: the first executed rotation on a channel empties its positions and falsifies
the lead-veto property for that channel. Whoever runs it owes this clause its amendment.

**Proof, named assertions:** (a) and (b) the real-follower test, where a live follower records what it
emitted while `read` leaves the position byte-identical. (c) the three-value discriminator
`[null, 0, 1]` asserted as a set, plus the never-followed control that the position file does not
exist before the first emit. (c-bis) ahead-of-head → never-followed, the F1 convene scenario (389
against `head: 0`) asserting `state`, `gap`, `emittedThrough` and `staleRecord` together, the
`staleRecord` discriminator as a pair, and its totality control. (d) the quiet-channel control, where
an ancient `at` is still `current` when the head has not moved, and the negative direction end-to-end,
where a follower killed by pid falls behind and the emitted `catchUpWith`, run verbatim, returns
exactly the missed messages. (g) in `comms.test.ts`: "stale / fresh / absent produce three distinct
answers" `[true, false, false]` as a set, the inclusive boundary `>=` pinned alone, fail-safe totality
(null origin, unparseable JSON, and a tombstone with no `at` all return `false`, and `false` blocks),
"departed is the ONLY difference — the pair discriminates" `["present", "none"]`, the caller invariant
that no-record rows carry `followerAlive: null`, and "a spawned seat that never followed reaches none
via departure, not liveness". The read-order clause in (c-bis) has no mechanical proof, by decision,
because every assertion takes `head` as a parameter. Whoever changes how `comms positions` gathers its
inputs re-reads that clause in the same change.

## Contract 7 — the emitted LAND command: what may be in the string, and what prose may promise about it

**Owner:** forager (the emitter + `config.gate`) · **Pointed at from:** weaver (the SOP template, this repo's SOP, and `finalize-session` all tell a seat to run the emitted string verbatim)
**Ratified at:** per clause, by forager and weaver.

**(a) The emitted value is a command or nothing, never a command with prose in it, and it resolves to
the emitting `cli.ts`, never through PATH.** `join` emits the project's gate and the commit in one,
with no pipe and no inline `-m`. When no gate is configured, the announcement is a sibling of the
command, not concatenated into it.

**(b) `config.gate` has no default, and an unsafe gate is refused rather than composed.** Announce
absence rather than passing over it silently. `&&` is permitted, because it preserves failure. `|`,
`||`, `;`, lone `&`, backticks and `$(…)` are not. One verdict feeds both the command and its notice.

**(c) Prose may instruct a seat to run the string verbatim only because (a) and (b) hold.**

**(d) A version string alone never identifies a binary.** The honest identifiers are the envelope
shape (piped, a launcher may return bare text where the CLI returns `{ok,data,meta}`) and the emitted
`source` field, the absolute path of the `cli.ts` that answered.

**Proof:** `bash -n` on the emitted artifact, not on a substring, plus refusal to compose an unsafe
gate. These are two assertions, neither subsuming the other: a piped gate parses cleanly under
`bash -n`, so only the refusal catches (b). The pipe assertion pins on the pipe character, not on
`| tail`.
