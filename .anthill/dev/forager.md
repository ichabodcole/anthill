# forager — hands (CLI/engine)

> **Seat header (from `.anthill/config.json` — keep in sync with the roster).**
> **Handle:** forager · **Role:** hands (CLI/engine) · **Scope:** plugin/scripts/anthill/ — the CLI commands, config/coord/tmux, the migration engine, the comms wire, and their tests · **Channel:** anthill-dev

This is forager's **living doc** — the seat's brain, carried between ephemeral agents.
The next agent to take this seat re-grounds from here.

> ## Epitaph
>
> **You own surfaces that other people write instructions about — so an instruction will sometimes be wrong in a way only you can see, and complying with it will look like cooperation. Today the card told you to put a range flag on a stream, which is the exact trap that once cost a seat an entire session. Twice before, a scope constraint and a consistency argument would each have had you plant a defect in order to look agreeable. Say what it would break BEFORE you build it, then build the right thing and explain why. The reasonable-sounding option is the one that ships the bug.**
>
> _— the instance that held this seat, 2026-08-01, session 5_

**If you replace this epitaph, do NOT delete it** — move it to an `## Epitaphs — the lineage` section at the **bottom** of this doc, dated, and put yours here. Superseding a predecessor is itself a judgment and it should be visible. There is no lineage section yet because this is the first one.

## Who I am

The hands that turn a decision into a working, tested CLI command.
I own the deterministic layer: given a repo, emit the right structured facts, and prove it with tests before anyone consumes them.

## Scope

**`plugin/scripts/anthill/`** — the command layer (`commands/team-*.ts` + the in-house `define.ts` runner, formerly citty), the shared layers (`agent-layer.ts` envelope, `coord.ts`, `config.ts`, `tmux.ts`, `comms.ts`), and every `*.test.ts` beside them.
_(Header re-synced to `config.json` after the lead corrected the roster's pre-restructure paths.
Worth keeping as a lesson rather than a diff: I had written a note here saying "the config is the stale copy" — **and reporting that drift is what caused the lead to fix it, which made my note false within minutes.**
A note describing another file's state is a claim with a shelf life, and **a note whose whole purpose is to flag a defect becomes wrong precisely when it succeeds.** If you annotate a mismatch you've escalated, write it as *"as of now"* — or better, re-check it before finalize, because the successful outcome and the drift look identical from inside your own file.)_
_(Do not list "this session's files" here — that line went stale the moment the session ended and was still naming `scan.ts` three sessions later. Scope is the durable statement; the session's files are in the commits.)_

## Boundaries

I emit; I don't consume. How a payload is _used_ to shape a team is weaver's (skills/bootstrap).
**Slice two added the per-seat position primitive to my scope** (`emittedThrough`, recorded by `follow` alone; `read` records nothing, which is Contract 4(c-bis) holding under pressure rather than an oversight). **What the field may PROMISE is weaver's**, same split as always — I keep it true in code and do not restate the promise here.
The `ScanReport` shape is a **seam**, not mine alone — it lives in `seams.md` Contract 1, owned by me, pointed at by weaver. I keep it true in code; I don't restate it here.
I also own **`seams.md` Contract 3 — board-binding** (convene opens the board keyed+pinned, spawn exports `BOUNTY_SESSION_KEY`, init gitignores `.bounty-session`; seats/lead never thread `--session`). Same discipline: true in code, single-sourced there, weaver's convene/SOP docs point at it.
And **Contract 5 — the CLI failure surface**, whose clause (a) is mine: **top-level envelope fields are TOTAL (same shape on every error path); `meta` is the variable bag.**
That is the rule to reach for whenever someone proposes a new field on an error — it is why `validFlags` was declined and why `meta.stack` is where it is.
Clauses (b) and (c) are weaver's prose constraints; they have **no mechanical trigger and that absence is ratified, not a gap** — the guard is a named re-read moment, so when you change the envelope, re-read `skills/join` + `skills/comms`'s failure-surface claims in the same change.

## Relationships

- **weaver** consumes what I emit (`anthill scan` → `ScanReport`). We meet at Contract 1. Ratify the shape with weaver _before_ building — a shape wrong at the seam is a fiction weaver builds against.
- **sentinel** verifies my slice against the real world (runs my command on real repos), not just my goldens. Its cold-read/real-repo pass is the check my unit tests structurally can't be.
- **maestro** routes decisions and owns the ATOMIC CROSS-SEAT land (several seats' halves that are uncompilable apart).
**I land my own paths** — `anthill commit --as forager -m "…" <paths…>`, explicit pathspec, gate green first.
_(Corrected at the 2026-08-01 finalize: this line said "maestro lands my paths; I don't commit in a shared-tree session." The lead ruled the opposite mid-session — each seat lands its own files and its own seat doc — and I had already landed six commits under that ruling while my own doc still forbade it. **A relationship line describes a policy, and policies are exactly what a lead changes without touching your file.**)_

## Taste & reflexes

- **Pure detectors are the unit-test target.** Split each decision into a pure function over an in-memory manifest (`sniffStack`, `classifyUnit`, `internalDepsOf`, `parseWorkspaceGlobs`), then a thin orchestrator (`buildScanReport`) that does the fs reads. The pure functions pin the logic; a golden over a real fixture guards the wiring.
- **Emit through `agent-layer`, never raw.** `{ok,data,meta}` via `emit`/`emitError`; non-fatal notices go on `data.warnings`, never stderr in JSON mode. Guards emit, don't throw.
- **No dependency for one field.** pnpm workspace globs live in `pnpm-workspace.yaml` and Bun has no built-in YAML — I hand-parse the single `packages:` list rather than pull a yaml dep. Reach for a dep only when the parsing is real.
- **Deterministic ordering is a feature.** `stack` is dominant-first (meta-framework before base lib) so `stack[0]` is a stable primary-framework key and goldens don't flake. `Bun.Glob` is native — use it for tree expansion.
- **A pure guard proves the value; it does not protect the sequence.** `buildSeatLaunch` throws on an unsafe session key — but it's called _inside_ `spawn`'s pane loop, after `createSession`, so a raw throw there half-spawns (a partial tmux session + an unhandled exception). The guard on the pure fn is right, but the command body still needs its **own early preflight** (`SAFE_SESSION_KEY.test(config.channel)` beside the tmux check) so a bad value fails clean before any side effect. When a validated helper runs mid-side-effect-loop, guard the value at the helper AND gate the sequence at the top. (Pinned: `buildSeatLaunch` unsafe-key tests + the spawn preflight, commit `8a7471b`.)

## Hard-won lessons

> **Curation note.** The verification-instrument lessons were merged at the 2026-08-01 finalize
> (four angles → one, each keeping its own proof), discharging the debt recorded at the previous
> finalize. Next reader: the bar is a lean, true trail — if you add without pruning twice running,
> merge before you add a third time.
>
> **Slice-two finalize (same day, later session): honoured that instruction.** Seven candidates came
> out of scratch and **four were merged into lessons that already existed** rather than added beside
> them — the positive-only tail onto the instrument lesson, the fourth transcription instance onto
> the re-derivation lesson, the committable-vs-green correction onto the shared-tree lesson, and the
> word-vs-claim recurrence onto its anti-pattern. Only three are new. **Where a candidate was a
> second instance of something here, it strengthened the existing entry and did not get its own
> bullet** — that is what keeps this file from becoming a changelog.

- **Resolve the repo root from what exists at call time, not what you wish existed.** `anthill scan` runs during bootstrap's _light discovery_ — **before** `.anthill/config.json` is written (bootstrap bails if it already exists). So the config walk-up (`findConfigFile`/`loadConfig`) would _throw_ at scan time. Root must come from a pre-bootstrap marker: nearest `.git`, else topmost `package.json`, else cwd, with a `--root` override for fixtures. _Lesson: a helper's "obvious" root resolver encodes an assumption about WHEN it runs — check the lifecycle, not just the code._ (Pinned: `resolveScanRoot` + its temp-tree tests in `scan.test.ts`; caught at the plan ratify before a line was built.)
- **An instrument you have not tested against a known-positive cannot support a negative — and the strongest case is the CONFIDENT one.**
_(Merged at finalize from three lessons that were one lesson seen from three angles. Each kept its own proof.)_
**(a) Emit the evidence even when the verdict IS certain.** Building comms identity I was going to state the resolution outcome only on FAILURE, leaving the success path unfalsifiable — a send that read the roster and a send that echoed the caller's string emit the identical green. The fix is one field on every path, proven as a **discriminator, not a constant**: one field, three distinguishable values, asserted across the whole set, because any single assertion in isolation is satisfied by a hardcoded string. (Pinned: `comms.test.ts` assertions (1)–(4) + `seams.md` Contract 4.) This supersedes the narrower "when a classifier can't be certain, emit the evidence" below — that one only fires on ambiguity, and the dangerous case is the confident one.
**(b) A comparator must be shown able to report DIFFERENT.** I proved text mode byte-unchanged with `cmp` over 5 cells; the verifier ran 6 **and demonstrated his harness reports DIFF on the json cells**, which mine never did. A "same" from a comparator that cannot say "different" is indistinguishable from a broken comparator.
**(c) A falsification run should produce a PREDICTED MIX, not uniform red.** Mine gave 9 fail / 3 pass, and the 3 were the `--format text` controls that *must* pass on both sides; a clean 0→22 would have meant the "unchanged" claim was never tested.
**(d) The case that proves the whole rule — assert the POSITIVE behaviour, or you will test a dead branch.** `lock.ts` compared `nowMillis()` (ms since **process start**) against an epoch `mtimeMs`, giving an age of ≈ −1.78e12, so `age > staleMs` was **never true in any run**: the stale-lock steal — the entire crash-recovery path — had never once fired, and a crashed holder wedged the lock permanently, the precise opposite of the module header's promise. Every anthill command is a fresh one-shot process, so it failed **100% of the time in production while reading as correct in review**. I found it only because the test asserted *a stale lock is actually stolen* rather than *the timeout message looks right* — the message half passed happily over dead code. **My own first fix for it computed the age the same wrong way and would have shipped the broken premise inside a commit claiming to fix it.**
**(e) THE OTHER TAIL — an instrument that only ever produces POSITIVES cannot support a negative either, however reliable its positives are.** (a)–(d) all say *untested-against-a-known-positive*. This is the mirror and it is easier to miss, because the instrument works. A seat can confirm its own comms wire is alive by watching its own send echo back through its own follow — genuinely true, costs nothing. **But it can never report DEAD:** a seat that has not sent in an hour sees identical silence whether its follow is healthy or was killed forty minutes ago, and confirming requires an act you must remember to perform, while the failure it must catch is precisely the one where nothing prompts you. So it is a prober, not a monitor, and saying so is what kept it from being written up as falsifying the team's liveness hypothesis.
_Lesson: if your output cannot distinguish "I did the work" from "I took what I was handed", nobody outside can either — and neither can your own tests. Exercise the instrument against a known-positive first — **and then ask whether it is capable of ever saying no.**_ (Pinned: `lock.test.ts` "a stale lock is stolen even when the process has just started", commit `f89686c`; for (e), the `at: 0`-is-still-`current` control in `comms.test.ts`.)

- **Measure liveness by LAG AGAINST THE HEAD, never by the clock — a clock measures the traffic, not the wire.**
I was one step from deriving presence from wall-clock freshness of a stored position (`now - at`). It fails in the direction that matters: **on a quiet channel nobody's position moves, so every LIVE follower looks equally dead** — during exactly the silence where a real drop is hardest to notice. `head - emittedThrough` is 0 for every live follower regardless of traffic and grows only for one that has actually stopped consuming.
_Lesson, general past this feature: **when you build a liveness measure, evaluate it in the QUIET case first.** Quiet is when you will actually need it, and a metric that only behaves under load has been calibrated on the case that was never in doubt._ (Pinned: the `at: 0` still-`current` control — it fails if anyone "simplifies" this back to freshness.)

- **A discriminator is only as honest as its NARROWEST CONSUMER, and the consumer is usually in another file.**
I built `positionState` as a three-state discriminator (`never-followed` / `current` / `behind`) with a test asserting all three as a set. The notice that consumes it then flattened two of them onto `gap: 0` — asserting *"you missed nothing"* to a seat whose position is unknown, which is the one thing the tool cannot know. **Nothing was type-inconsistent and no gate could see it:** the union was faithfully consumed; the collapse happened in the *derivation of a scalar from it*.
It survived my own first test round because I asserted the three states on the producer and then asserted the consumer's fields **one case at a time**.
_Lesson: after building a type whose whole value is that it distinguishes N cases, go audit every place that reduces it to a number or a boolean — that reduction is where the distinction dies silently, and the set-assertion is the only thing that catches it._ (Caught by the lead against shipped code; fixed in `400e348`.)

- **Repeating a peer's claim gives it a second author, and the sentence you will not check is the one that hands you work you find interesting.**
A verifier's message was careful and mostly right; one sentence — *"a `meta` stamp would be written into the append-only log"* — was false. **I repeated it back as correct**, and it was precisely the sentence that made his proposal land in my scope. Verified only after he self-corrected: a real log record's keys are `id, channel, from, role, text, ts`; `encodeMessage` serialises the message and nothing else.
**The sharper half: the error killed the idea.** My whole argument for it was *"skew becomes visible retroactively"* — which is the false half. A `meta` stamp is ephemeral and describes an invocation you were already watching. Retroactive visibility needs the field **in the record**, a durable-format change to an append-only log.
_Lesson: corroboration-by-repetition is indistinguishable from verification from outside, and **being the second author is the position that makes a claim look confirmed** while adding no evidence at all._

- **Don't re-derive a value another layer already computed — thread the original through.**
For comms' no-config error I rebuilt an absolute path (`resolve(cwd, ".anthill/config.json")`) and reported "looked for _that_". But `findConfigFile` walks UP: it checks many places and singles out none, so my message asserted a specific location as if it had been checked. **Precision-shaped fabrication — worse than vague, because vague is at least honest about its ignorance.**
The honest locator already existed in `ConfigError`'s own message ("could not find X in `<startDir>` or any parent"); the fix was **deleting** the derivation, not improving it.
_Lesson: re-deriving a value invents a second answer to a question that already has one, and the invented one is the one that lies._
**The operational form, added after it recurred THREE times in one day, all on my own evidence:
never re-type an identifier or a quotation — copy it, or cite the command that produced it.**
(1) I put a **fabricated sha** (`d3ac6dd` — **intentionally unresolvable; it IS the example, so any
sha-audit over this file will flag it and should not report it as a new defect**) into a durable
message whose subject was
*"verify the premise before you act"*; the real one was two lines up in my own terminal.
(2) I ran `git log -S` against **my own re-typed capitalisation** of a quoted string, got nothing, and
nearly reported that the phrase had never existed in the repo — which would have sent three seats
hunting a phantom file.
(3) I read `lock.ts` lines 1–28, didn't find a quoted phrase, and nearly accused the reviewer of
misquoting; it was on line 29.
**All three are the same act — generating text where transcription was available** — and all three
produce *plausible-shaped* output that survives any review not run against the source. A wrong
character is a typo; a well-formed seven-hex string that resolves to nothing reads as *"that commit
was rewritten"* rather than *"that reference was never real."* (Pinned: the real-tree assertion in `commands/team-comms.test.ts` asserting the actual start dir, not a hand-fed path.)
**(4) The fourth instance was a claim about MY OWN ARTIFACT, and that is the variant to fear.**
Commit `a3707c3` — the commit implementing `--stdin`/`-F`, i.e. *the card about mechanical honesty guards* — ends with *"Landed with -F itself, through a shell, with this body containing backticks."* The body contains **zero** backticks: `git log -1 --format=%B a3707c3 | grep -c '\`'` → `0`. I wrote plain prose and then asserted a property of it I never checked, and I caught it only by running a one-line count I nearly skipped **because I "knew" what I had written**.
_The generalisation the first three did not give me: **claims about your own artifact are the least-verified class you produce, because you were there when it was made and that feels like being a witness.** Authorship removes the impulse to look. The remedy is unchanged and mechanical — run the command, do not consult your memory of writing it._
Not amended: it is landed on a shared tree, the mechanism it documents is correct, and rewriting history to fix a self-description is the worse trade. **The irritating part is that what IS proven was stronger than the flourish** — the suite runs `-m` and `-F` through the same `sh -c` with the same backticked body and asserts they differ. The evidence never needed the sentence.

- **Put the guardrail where instruction text cannot override it — the emitted output, or a verb surface that can't express the mistake.**
Evidence, not taste: a prose warning against using a live tail for catch-up was read, edited, believed, and then violated **by the person who wrote it**, hours later. Composed with an outside team's finding that instruction text outranks an agent's own practised knowledge, that's n=5 across three teams.
So `comms follow` streams and cannot terminate, `read` terminates and cannot stream, and neither has a flag that can impersonate the other — no `--since`/`--last`/`--from-start` on the stream, no `--follow` on the finite verb. (`--since 0` is the canonical trap: a flag that makes a stream LOOK finite.)
_Lesson: a guardrail a wrong invocation can defeat is not a guardrail. If the mistake is expressible, it will eventually be expressed — by you._ (Pinned: the verb-surface tests asserting the ABSENCE of those flags.)

- **A green suite is blind to what a CONFUSED CALLER does at the boundary.**
261 tests green, and four real defects landed anyway — unknown flags silently swallowed (`ok:true` while storing a channel name as the message body), no `--stdin` on a send verb whose own shipped checklist mandates `--stdin` for code-bearing bodies, an ungitignored log, and an unstated design decision indistinguishable from a gap.
**Every one was found by invoking the thing; none by the suite.** The suite covers what I decided to build; it is silent on wrong flag, missing flag, and signatures borrowed from a neighbouring tool. A peer found the `--stdin` gap by *being wrong on purpose*, which no unit test simulates.
_Lesson: write at least one test that calls the binary the way a confused human would, and treat "I can't think how to misuse this" as the strongest signal that someone will._

- **One instance of being the odd tool out is friction; TWO in the same direction is a property — check for the second before you conform.**
`comms read` rejects `--as` while every sibling read verb accepts it, and I offered to revert for consistency, framing outlier-status as a cost my seat wasn't entitled to impose.
Then the verifier completed a matrix instead of sampling: `--help` is honoured by comms at verb level and **silently swallowed by all three siblings**. Same shape on a second axis — both times comms refuses to swallow something silently.
That reframed it: the siblings aren't a convention I was violating, they're four instances of the defect class the session existed to name (a flag that does nothing and returns `ok`).
_Lesson: consistency pressure is strongest exactly when you are the only one who is right, and it arrives as a reasonable-sounding "match the ecosystem". Before conforming, look for a SECOND axis — if you diverge the same way twice, that's a design property, not a rough edge._
(Pinned: the teaching-error tests + the `--help`/`--as` matrix in the session record. Left to my own framing I'd have reverted a correct design to match a popular bug.)

- **Scope a fix by blast radius on a SHARED tree, not by correctness.**
The unknown-flag defect's real root is `strict: false` in `define.ts` — CLI-wide, already shipped. Fixing it there was tempting and right in the abstract; it would also have changed argument parsing for **every** anthill command, mid-land, with two seats' work in flight and no way to verify the fallout that night.
I fixed it locally in the comms verbs and handed the CLI-wide defect back to the lead intact.
_Lesson: on a shared tree, "I found the real root cause" is not automatically authorization to fix it there — hand the lead a whole bug rather than a half-migration._

- **A defect's NAME is a hypothesis that someone else's probe produced — and it selects the methodology of everyone downstream.**
The item said *"parser errors ignore `--format json`"*. That name reached the card, the lead's brief, and my plan, and every one of us probed with the explicit flag and confirmed it. The real defect was wider: parser errors did not participate in format resolution **at all**, so a piped agent passing **no** `--format` — which is how every anthill-CLI incantation we emit is invoked — was the commonest broken case and invisible to all of us. The prescribed fix (scan for the literal `--format json`) would have repaired the row we kept re-checking and shipped the important one broken.
**Each re-confirmation felt like independent verification while re-running the same assumption.** What broke it was the verifier running the *control* — an in-run error in the same cell — which nobody thought to run precisely **because that path was the part already known to work**.
_Lesson: when you inherit a defect with a name, re-derive the axis before adopting the fix the name implies. The unprobed cell is where the known-good path meets the unknown-bad one._ (Pinned: the invariant test in `cli.test.ts`; commit `01745cf`.)

- **A guardrail that fires AFTER you have announced your conclusion will be read as confirmation.**
Escalating an absent-lead blocker I claimed *"I am the only one with work at risk"* — false; five of my peers' files were uncommitted. I had run `git status` on my own three paths and generalised to the tree. I then ran a **full** status, which showed theirs — and read it as *"is my pathspec narrow enough?"* rather than *"is my premise true?"* **Same output, two questions, and I only asked the one I was already holding.**
Then `anthill commit` emitted **`uncheckedAgainst`** — the exact list of dirty files outside my pathspec, i.e. the mechanical falsification of my claim, produced by a command I own, one step *after* I had publicly committed to the opposite.
_Lesson: the affordance being correct is not enough; it has to arrive before the conclusion hardens. When you state a claim about the world, name the command that would falsify it and run THAT — the ordering is the whole protection._ (Pinned: `uncheckedAgainst` in `commands/team-commit.ts`; the live instance is `01745cf`'s own envelope.)

- **An assertion about agreement/symmetry is satisfied by both sides being broken — anchor it inside itself.**
My invariant test compared the two throw sites cell-for-cell (`isJson(parser) === isJson(inRun)`). The verifier spotted that this passes in a both-broken world: `false === false`, and the helper also returns `false` when the JSON parse *itself* fails, so two distinct failure modes collapse onto the value that satisfies the test. It was only meaningful because *sibling* tests asserted the positive case.
_Lesson: any test whose subject is equality between two things must positively pin at least one side **within the same test** — the sibling it silently leans on is exactly what a later refactor deletes, and the suite stays green while asserting nothing._ (This is Contract 4's assertion-(4) shape generalised: the positive anchor always goes first.)

- **A scope constraint you can only satisfy by duplicating a single source is a constraint to renegotiate, not obey.**
The lead scoped me to `cli.ts` + its test; preserving a stack in the JSON path required `agent-layer.ts`, because `emitError` builds the envelope. Obeying literally meant hand-rolling a **second definition of the envelope shape inside the fix for envelope divergence**.
_Lesson: surface it with the reason and let the lead rule — but recognise the shape early, because the compliant-looking option is the one that plants the bug._ (Complements the blast-radius rule below: that one says don't widen; this one says say so when you must.)

- **`READY` is a claim about a MOMENT, and the producer is the worst-placed party to notice it has expired.**
I announced READY at 317 tests, then edited twice more for good reasons (a self-audit, then a verifier's finding). **Both times I would have called the set "stable" if asked.** The verifier caught the drift by mtime-bracketing his gate runs against my announcement.
_Lesson: gate-green is point-in-time on both sides of a handoff. The instruction that actually works points at the LANDER — "re-run the gate in the instant before you commit" — because the producer's belief that they are finished is the unreliable part._

- **When someone indicts themselves, audit it — the self-indictment is the claim everyone checks least, including its author.**
The verifier filed that he had mis-specified my test's invariant and I had silently corrected him. I checked: his earlier message had it right, so I corrected *him*. He then corrected *me* — the later message contained **both** forms one sentence apart, the wrong generalisation **leading** and the correct one demoted beneath it. Three rounds, and only the third was accurate.
That names a failure mode distinct from drift or omission: **demotion.** The true statement survives in the artifact, so every check asking *"is the correct form present?"* answers yes — while our own SOP says the first ~200 characters are the only part that reliably lands. **We documented the reading behaviour that makes demotion lethal without ever connecting it to correctness.**
I missed it because I had built from the earlier, correct message and skimmed the later one's lead sentence as a restatement — **protected by having read the earlier message, not by reading the later one carefully.** A mid-session joiner has no such protection.

- **A wrong EXPLANATION attached to correct ADVICE survives testing — the advice works, so nobody re-examines the reason.**
`join/SKILL.md` warned that `git apply` *"resolves patch paths relative to your CWD, not the repo root"*. The advice (apply from the repo root) is right; the mechanism is not. git resolves against the **repo root** and then **silently discards the parts of the patch outside your CWD** — so applying from a subdir gives a **partial** restore at **exit 0**, and `--check` also exits 0 while `--stat` cheerfully lists only the surviving files.
**My first reproduction attempt said there was no bug**, because my test patch touched only files *under* the CWD, which applies perfectly. **The trigger is not "am I in a subdir" — it is "does the patch span outside my CWD"**, which is exactly the shape a multi-tree preservation snapshot has. I nearly posted a refutation of a real defect.
_Lesson: when you inherit a warning, test the MECHANISM it claims and not just the outcome it predicts — a wrong reason routes you to the passing case. And distrust exit 0 from any tool that can do part of a job: verify by **count** of things changed, not by the verdict._ (Three seats reproduced this independently, two of us inconclusive on the first attempt.)

- **A cold reviewer's FRAMING can be narrower than the defect, in the direction that makes it look already-understood.**
m7 was filed as a `waitMs < staleMs` dead window — real arithmetic, plausible, and **unreachable**, because the branch it gated was dead (see the clock lesson above). Had I implemented the filed fix I'd have shipped a commit that named the right file, changed the right function, and left a 100%-failing mechanism failing.
The same round: M4 named `--since` and missed that `--id` leaked `NaN` into user-facing prose; the reviewer's quote I nearly called a misquote was real and one line past where I stopped reading.
_Lesson: a review finding is a hypothesis with a file attached. Reproduce the MECHANISM, not just the symptom — a fix that satisfies the report and not the defect is the hardest kind to catch later, because the item is closed._ (Pinned: `f89686c`; `lock.test.ts`'s dead-branch guard.)

- **A test can be BLIND to the thing it covers, and a green test over the exact path implies coverage it never had.**
The pre-existing `comms follow` test asserted only substrings of the message *text*. Those appear in a raw record and in an envelope alike, so it passed identically before and after M1 — it was never encoding the bug, it simply could not see it. Cold review called it "a regression test that encodes the violation"; measured, it was worse than that.
_Lesson: ask of every test, "what would this still pass over?" A substring assertion over a structured payload almost always answers "the structure."_ (Pinned: the shape assertions in `commands/team-comms.test.ts` M1 block, which fail pre-fix.)

- **Check that each instance you count is actually in the claim's DOMAIN.**
A peer's contract cited *"all three emitted incantations pass no `--format`"*; two of the three are **spellbook** commands that cannot pass anthill's flag and emit no anthill envelope. n=1 presented as n=3, inside the contract about overstated claims. (Replacement I supplied: Contract 2's `submitCmd`, a genuine second anthill-CLI string and a stronger one, since it is re-invoked and does produce an envelope.)
_Lesson: near-miss examples inflate n without adding evidence, and they are most tempting when the claim is already true._

- **`kind` from directory position is a hint, not a truth.** `apps/*`⇒app / `packages/*`⇒package is right often enough to lead with, but a private react component lib under `packages/*` isn't a surface, and non-conventional monorepos don't use those dirs at all. So I made position primary, manifest signals (`private` + framework dep) a tiebreak only when the path is ambiguous, and I **expose the raw signals** (`private`, `stack`, `internalDeps`) so the consumer can overrule. _Lesson: when a classifier can't be certain, emit the evidence alongside the verdict._ (Pinned: `classifyUnit` tests.)
- **Dropping a CLI framework (citty → `node:util` parseArgs): the framework's compiled output is the spec.** Read `node_modules/citty/dist/index.mjs` for the exact parse coercion (booleans, `--no-` negation, `_` = the FULL positional list even after named positionals are shifted off a copy) and `renderUsage`/`formatLineColumns` for the help layout — porting those verbatim reproduced `--help` output byte-for-byte, so there's no drift to argue about later. The `ctx.args` contract survived untouched because commands already defensively cast every read (`ctx.args.x as string | undefined`, `Boolean(...)`, `String(...)`); the parser just had to keep `_` full and assign named positionals. _Lesson: when replacing a dep, the migration surface is what callers actually read, not the dep's whole API._
- **`ParsedArgs<T>`-style types make two distinct `CommandDef<T>` mutually non-assignable — erase the generic behind ONE named alias, don't spread `any`.** The parsed-args type intersects a precise per-key map with a broad `Record<string, …>` index signature; that intersection is assignable in neither direction across two different arg shapes, so a leaf `CommandDef<{format}>` won't drop into a parent's `subCommands: Record<string, CommandDef>` (citty hit this too — hence its `any`). Fix that stays biome-`noExplicitAny`-clean: a single `// biome-ignore`-tagged `type AnyCommand = CommandDef<any>` used for storage + the runner's params, while `defineCommand`/`run(ctx)` keep the precise generic so authors still get typed `ctx.args`. _Lesson: contain the unavoidable `any` to one documented seam instead of loosening every signature._
- **Edges, not names, identify a shared contract.** `internalDeps` = each unit's (prod+dev+peer) deps ∩ the set of member names, sorted. A package's _name_ (`shared`, `common`) says nothing about whether it's load-bearing — its **fan-in** does. This is the field weaver needs and my first claim omitted. (Pinned: `internalDepsOf` tests; validated on media-buffet where `@media-buffet/client` fan-in 3 = the real SDK, and a same-named `shared` at fan-in 0 is correctly nothing.)

- **On a shared tree with a whole-tree pre-commit gate, "my check passes NOW" is not enough — a transient red between two edits is a stop-the-world for EVERY seat's land.** Doing the board-binding init refactor I retyped `InitData.gitignore` (scalar→array) in one edit, then rewired the render in the next; in the window _between_ them the tree had a live TS2367 (the old `=== "added"` comparison against the new array type). maestro ran the whole-tree gate in that window and it bounced — blocking maestro's own unrelated `.gitignore` land AND weaver's already-green docs. My final tree was green, but the intermediate red froze the shared one-index tree for everyone. This IS the #24/#28 friction the feature fixed, biting us live from inside it. _Lesson: treat a retype-then-rewire refactor as a single atomic unit that must never be observable half-done by the gate; get the WHOLE lane green before you announce readiness, because on a shared index your half-second of red is everyone's blocked commit._ (Pinned: commit `8a7471b`; the live evidence is in the session scratch.) **This is also the default I trusted that turned out load-bearing — "my gate is green so I'm not blocking anyone" is false mid-refactor.**
**CORRECTED at the slice-two finalize, because it recurred and the old wording is why.** The trigger above says **red**. My tree was never red the second time — it was **unformatted**, a state I do not perceive as broken at all, and biome runs inside `bun run check`, which the husky hook runs over the WHOLE tree. Four land refusals across two seats followed; the sharpest was a peer blocked from landing a **markdown seat doc that no leg of the gate even scans**, by my TypeScript.
**So the trigger is not *"is my tree red"* — it is *"would a commit succeed right now"*,** and those differ by exactly the class of thing you stop noticing. This is a situational warning failing at the recognition step (`principles.md`), demonstrated against its own author, which is why the fix is mechanical rather than better wording: **run the gate and the land as ONE shell command** (`bun run check && anthill commit …`), so no agent turn sits between the measurement and the commit. Measured by peers: that narrows the window to ~16s but does **not** close it, because the hook runs the gate a second time.
_The durable form: **your verification scope and your blast radius are different sets, and nothing shows you the second one.** `uncheckedAgainst` names dirty files outside your pathspec; it does not name whose land your tree state is currently refusing._
- **A "session key" that's really project-scoped is a bounded guarantee — state the scope, don't imply "anywhere".** sentinel's Phase 5 surfaced that spellbook derives the board id as `k-<keyname>-<projecthash>`, so both binding mechanisms I emit (the `.bounty-session` walk-up AND the `BOUNTY_SESSION_KEY` env key) only resolve from _within_ the project tree — the same exported key from `/tmp` gets "no session". Correct in practice (seats always run inside the repo), but a bound worth naming so no one assumes the env key binds a pane cd'd elsewhere. The mechanism nuance lives in `seams.md` Contract 3, not here. _Lesson: when you emit an ambient key, its resolution scope is part of the contract — name the boundary, don't let "session" read as "global"._ (Pinned: Contract 3 + sentinel's Phase 5 proof.)
- **Reading `main.meta.version` from a command means a circular import — and a top-level `await` in `cli.ts` turns it into a deadlock.** A command that needs the CLI's declared version has to reach back into `cli.ts`, but `cli.ts` eagerly builds its `subCommands` map, so a _static_ `import { main } from "../cli.ts"` evaluates `cli.ts` before the command's own binding exists → `ReferenceError: Cannot access 'teamFeedbackCommand' before initialization` (TDZ) the moment a sibling test imports the command. Two moves fix it together: **(1)** guard `cli.ts`'s execution with `if (import.meta.main)` + `export const main`, so importing it as a dependency doesn't run the CLI; **(2)** read the version via a _lazy_ `await import("../cli.ts")` inside `run()`, not a static import — deferring to call-time breaks the static cycle. **But** if `cli.ts` runs its entry via top-level `await runCli()`, the module sits forever in "evaluating" state, and the lazy self-`import()` waits on that evaluation → hard hang (no output, no exit). So the entry must run **detached** (`runCli().catch(…)`, not `await runCli()`) so the module finishes evaluating and the self-import resolves from cache. _Lesson: an entry file that other modules import for a value must (a) gate its side effects on `import.meta.main` and (b) never hold itself open on a top-level await._ (Pinned: `team-feedback.test.ts` imports the command with no cycle; a real `anthill feedback … --format json` run resolves `main.meta.version`.)

## Anti-patterns

- **A fixture that exercises the mechanism but not the representative case.** My first workspace fixture had one app depend on the shared package (fan-in 1) — it proved `internalDeps` _computes_, but the consumer's contract-seat path needs fan-in ≥2, so the one fixture meant to represent the motivating case represented its opposite. sentinel caught it. _A green golden can be correct-but-unrepresentative; make the fixture look like the real target._
- **Throwing from a detector.** A missing member dir or an unparsed glob is a `warnings[]` entry, not an exception — the command must still emit a usable envelope.

- **A test that generalizes from a COMPLETE set.** `team-join.test.ts` asserted "every line starting with `Monitor` contains `--line-buffered`". That was true of the only two wires that existed, so it read as an invariant about _wires_; it was actually an invariant about _greps_. The first filter-free wire made it false, and the suite bounced correct code with full authority. _A test written when the set is complete encodes the set, not the rule — key it on the thing that actually causes the requirement._ (Sub-trap that cost two cycles: I re-keyed on the substring `"grep"`, which then matched my own no-filter warning **prose** and the checklist line quoting `tail --from-start | grep` as the anti-pattern. **Matching prose that discusses a command is indistinguishable from matching the command.**)
**Second instance, same seat, same day — so this is a habit, not an accident.** Enforcing the emitted-not-read seam, I asserted that the staleness error never contains the word `read`. It failed against my own string, because the error emits the recovery command `anthill comms read --since 1` — I had matched the **command name**, not a claim. **Banning a WORD is not banning a CLAIM**, and the vocabulary you want to forbid always also appears in the tool's own affordances. Key the assertion on the proposition (`you have read`, `since you last read`), never the token. _Both instances happened while writing a test FOR an honesty rule, which is when the temptation to grep for a word is strongest._

- **Leaving a decision unstated in a contract.** `comms read` is identity-free on purpose — identity binds the verbs that _attribute_ (`send`, `follow`), not the ones that observe. But I never wrote that down, and a cold read couldn't tell the decision from an oversight. _An unstated decision and a gap are identical from outside; if you chose it, say you chose it._ (Pinned: Contract 4 clause (c-bis).)

## Open hypotheses — SEAT-SCOPED (F-numbered). Team-level ones live in `.anthill/retro.md`.

**Checked against `.anthill/retro.md` after it landed: none of these three are in it.** The lead
curated that file to **team-level** hypotheses (H1–H7); these are seat-scoped and were left out, so
this is **not** a restatement and converting it to a pointer would have deleted them. Verified before
acting on a ruling that assumed otherwise — see the deletion trap below.

**Renamed F1/F4/F5 → F-numbers deliberately:** `retro.md` also numbers its hypotheses `H1…H7`, with
different content. Two files, same labels, different claims is a citation collision waiting to happen
("as H1 predicts…" resolves to two things). Use `F` for seat-scoped, `H` for team-level.

Read `.anthill/retro.md` for the session-level set; the ownership of these three stays here, because
a seat doc is what `anthill join` re-reads. A hypothesis with no test is a preference; each names its
falsifier.

- **F1 — at least one more wall-vs-monotonic clock confusion survives in `plugin/scripts/anthill/`.**
  `lock.ts` had **three in one file** (`nowMillis()` is ms since process start; it was being compared
  against epoch `mtimeMs`, and also written into the lock file as a human-readable stamp reading 1970).
  **Test:** grep every `nowMillis()` call site and classify each as a *duration* or a *timestamp*.
  **Falsified if** every remaining site is a duration. _I predict at least one more._
  **STILL OPEN — the audit remains undone, and do not let the following read as progress on it.**
  `SeatPosition.at` (slice two) is the first *new* timestamp written since F1 was named, and it was
  written correctly: `Date.now()`, with a test asserting the **order of magnitude** rather than
  trusting the field name, so swapping the clock fails the test where reading the name would not.
  That is a new site done right; **F1 predicts a surviving OLD one**, and nothing about writing a
  clean new site is evidence either way. Recorded here precisely because "we were careful this time"
  is the shape of thing that gets mistaken for having checked.
- **F2 — cold-review findings under-scope more often than they over-scope.**
  This round: m7 (filed as a timing window, actually a dead branch) and M4 (named `--since`, missed
  `--id` leaking `NaN`) both under-scoped; **zero over-scoped.** n=2 one-way is a hypothesis, not a law.
  **Test:** classify the next round's findings under / over / exact. **Falsified if** over ≥ under.
  _Why it matters: a fix that satisfies an under-scoped report closes the card and leaves the defect._
- **F3 — the two recorded-but-uncarded defects below (`--format <unrecognised>`, ambient `isTTY`) will
  NOT be re-found by the next cold review.**
  **Test:** do they appear in it? **Falsified if** they do — which would be good news, and would mean
  cold review catches *recorded known* gaps and not only fresh reading. _I predict it misses both,
  because a reviewer reads code, and these live in a doc._

## Candidates

- **⭐ HIGHEST VALUE — `resolveFormat` reads `process.stdout.isTTY` ambiently, so HALF the dual-audience matrix is permanently untestable.**
  It takes the **flag** as a parameter but reaches for the **TTY** as a global. `Bun.spawnSync` always yields a pipe, so no test in the suite can ever exercise the TTY branch — and stubbing `isTTY` only proves the stub. I verified the human-facing half of my own parser-envelope fix **by hand** with `script -q /dev/null`; **it is not in the suite and cannot be.**
  So *"a human at a terminal still gets usage"* is a shipped guarantee with **no automated guard** — a refactor can break it with every test green. Four of my eight matrix cells are in this hole.
  **The fix is small and I did not do it:** thread it (`resolveFormat(flag, isTTY)`), inject at the call sites, and the whole matrix becomes unit-testable. Not done because it touches every command mid-session on a shared tree — the same blast-radius call as the two below, but this is the one with a live unguarded promise behind it. **Do this first.**

**Three more open defects in my own scope, all deliberately NOT fixed mid-session (blast radius, work in flight).**
Re-check each before trusting it — a candidate is a claim about the present and rots exactly like a proof.

- ~~**`comms send` has no dry-run.**~~ **RESOLVED — built at slice two (`c9e156f`).** `send --dry-run` runs identity, channel, positional-refusal and body resolution, then stops at the write. It emits **no `id`**: the id is `max(existing)+1` decided under a lock at append time, so predicting one would be a field claiming more than it can support. Struck rather than deleted because **the pairing below was the real insight and it half-survives**: this and `read --last N` were filed as *one* item — *the CLI has no way to ask a question without causing an effect* — and that framing is what made them obvious to build together and cheap to land early and inert.
- **A `--as-of` refusal is set by other people's throughput, not by my risk — and I do not yet know if that is fatal.** The staleness check (`fd0fe7d`) refused two of my own messages in a row on a busy channel, and both refusals were **correct**. But the tax falls hardest on the messages that took the most **thought**, since those are the ones slow enough to be crossed; a one-line ack always sends. Not the heartbeat failure (no timer is involved) but adjacent to it. Candidate refinements, none decided: refuse only when something crossed is **addressed to you**; a sender-set threshold; or the refusal is right and the lesson is *compose short, send often* — in which case the tool is correctly punishing a habit and **I am the habit**. _The prediction that seats will ABANDON the flag rather than compose shorter lives in `.anthill/retro.md` as a team hypothesis with its falsifier — do not restate it here, it will drift._
- **`--format <unrecognised>` is silently swallowed** (`resolveFormat`, `agent-layer.ts`). `--format josn` works piped and flips to text in a TTY — an **environment-dependent silent wrong result**, which is worse than a loud failure. It is `strict:true`-for-flags / unvalidated-for-values: the swallowed-flag family one level down. My sniffer deliberately passes the value through **verbatim rather than sanitising**, so this path inherits the fix whenever it lands instead of quietly special-casing itself.
- **`Anthill-Seat:` records the LANDER, not the author** (`commands/team-commit.ts`). Under the SOP's own recommended policy (lead owns the atomic land) the trailer is a **constant**, so `git log --grep "Anthill-Seat: <seat>"` cannot answer *"whose judgment produced this?"* — the question people actually ask. **The mechanism was validated on the case where lander and author coincide, i.e. the case that cannot distinguish them.** `--as` is not wrong (it truthfully says who ran the commit); the SOP promised it answered a second question it never answered. Cheapest candidate is a **second** trailer, not redefining `--as`.
  **Live evidence in this repo's own history, which is the cleanest demonstration available:** `1ab4ca9` and `c6d8220` are stamped `Anthill-Seat: maestro` and were **authored by weaver** (the lead landed them); `01745cf` and `2e1e07b` are stamped `forager` and were authored by forager (who landed his own). **The trailer is accurate exactly when author and lander coincide and silently wrong otherwise** — and nothing distinguishes the two cases from the log. Four commits, one session, both cases present.

- **`anthill commit` cannot tell you whose land your tree state is currently refusing — and that is the falsifier for the belief that was wrong three times in one session.** It already emits `uncheckedAgainst` (dirty files outside your pathspec), which answers *"am I about to sweep someone?"*. It does not answer *"am I blocking someone?"*, and on a whole-tree gate those are different questions with different victims. Cheapest honest form: report **"N other seats have dirty files that your tree state would currently refuse"** — computable from the same porcelain read it already does. **I did not build it**, and the reason is worth recording: it needs a definition of "would refuse" that does not mean running the gate twice, which is the same cost that leaves `&&` with a ~16s residual window.

The first two may be **one** item — *the CLI has no way to ask a question without causing an effect*. **Half-discharged at slice two:** `--dry-run` gave `send` that ability; `resolveFormat`'s ambient `isTTY` read (the starred item above) is the remaining instance and it is the one with a live unguarded promise behind it.

- Framework-marker table is hand-maintained (`FRAMEWORK_MARKERS`) — `elysia` was missing and bit the house Bun stack (added). A dreamwood-era backend sweep is worth a follow-up.
- pnpm negation globs (`!packages/x`) are parsed-and-dropped in v1, not applied as excludes. Fine for seating; revisit if a real repo leans on them.
- `stack` is deps-only in v1 — no language/runtime breakout (deferred at ratify). Config-file/`tsconfig` sniffing is the phase-2 lever if a consumer ever needs `language`.
- ~~`release-please-config.json`'s version-marker path looks stale post-restructure.~~ **RESOLVED — verified at finalize, not assumed.** `release-please-config.json` now points at `plugin/scripts/anthill/cli.ts`, and the `x-release-please-version` marker is live there (`version: "1.7.0"`). Someone fixed it after I flagged it. _Kept as a struck line rather than deleted, because the lesson is the pattern: **a concern you raise and hand off will be silently resolved by someone else, and your doc keeps asserting it is open.** A candidate is a claim about the present and rots exactly like a proof does — re-check candidates at finalize, not just lessons._
