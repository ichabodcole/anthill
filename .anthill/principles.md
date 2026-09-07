# Principles

Rules about how work goes wrong, and what to do instead.
They are independent of tool, stack, and team composition.
Read this file at convene and at join.

A principle is added at `anthill:curate`, from a session report.
Do not add one mid-session.
A candidate must cite an incident; the incident is recorded in the curation record, not here.
This file states the rule only.

Format: one principle per bold line, followed by the rule.
One sentence per line.

---

## Evidence

**Verify the real artifact, not a proxy.**
Check the rendered output, the actual file, or the actual command result.
Do not accept a measurement, a stub, or a summary in its place.

**Agreement is not evidence.**
Several agents agreeing on a claim is consensus, not verification.
A claim about an artifact (a file, a test, a command's output) is checked by running the check.
A claim about the team's own behaviour is testimony. Label it as testimony.
Prefer the version of a claim that includes a number, a diff, or a count.

**Check the lead's claims the same way you check anyone else's.**
Do not exempt a claim because of who made it.

**Check a claim that says you were wrong as hard as one that says you were right.**
A correction against you is not pre-verified because it came from a careful colleague.
Do not act on a self-indictment, and do not relay one, until it has been checked.
The same rule covers any claim you would look defensive for checking, including a compliment.

**Read the count, not only the verdict.**
A passing check must show that it processed a non-zero number of the items you meant.
Example: `Checked 0 files. No fixes applied.` exits 0 and checked nothing.
Example: a task runner's `N successful` counts dispositions, and a cache hit counts as success.

**Find the root cause before editing a fix.**
State the cause with evidence first.
Do not assert a cause you have not demonstrated.

**Use an outside reviewer to find defects, not to design fixes.**
A reviewer with no context finds what the team cannot.
It does not know what the code is for, so treat its proposed fix as a guess.
Reproduce a finding before fixing it.
Reproduce a rebuttal before dismissing a finding.
Route findings to the owner of the code. The owner decides whether to accept them.

## Controls

**A control that cannot come out differently is not a control.**
Before relying on a control, name the world in which it fails.
If you cannot name one, the control is decoration.
A control passes in the healthy world and in the broken world alike unless it has been shown to go red.

**Break the guarded thing on purpose and require the guard to go red.**
A guard that has passed many times has only been tested in the world where it does not matter.
Treat every new version of a control as wrong until a mutation test shows otherwise.

**Before accepting a gate as passed, name the result that would have failed it.**
A green you cannot describe the red for is not a reading.
Re-run the command a report printed, not a paraphrase of it. A paraphrase can remove the variable under test.

**Before offering a measurement as evidence, name the value that would have falsified it.**
If you cannot, you have an observation. Say so.

**Do not set aside a control that fired.**
If a control you ran contradicts the tidy explanation, the control governs.
Record the contradiction; do not explain it away.

**Before writing that something cannot be done, spend one command trying it.**
An impossibility claim produces no output, so no control, mutation, or probe can catch it.

**A control set certifies the instrument, not the population.**
Two green controls say nothing if the sample contains no instance of the phenomenon.
Check that the sample contains at least one.

## Instruments

**Verify the instrument registered before trusting what it reports.**
An instrument can answer a different question than the one asked and look correct.
Take a second, differently shaped observation.
Treat suspicious similarity as a signal: identical-sized outputs across cases, or two counts that should differ and do not.

**A count is not a reading.**
A number can be identical on both sides of a change that reversed its meaning.

**Before answering a question posed with a count, state what one unit of the denominator is.**
A ratio can measure the team's process rather than its output.
Re-checking the arithmetic does not find this. Naming the unit does.

**A criterion states a predicate and a domain. Write both.**
State what the criterion ranges over, at what scale, and in whose world.
A criterion missing its domain looks stricter than one that has it.
Re-reading does not find a missing domain. Executing the criterion does.

**A tree-grounded claim travels with its sha.**
Any count or measurement taken from the repository states the commit it was measured at.
Do not re-stamp an inherited number with a newer sha.

**Publish a count of a class with the command that enumerated it and the sha it ran against.**
This applies to every count, including a count against yourself.

**A measurement can be sound and answer the wrong question.**
Before reporting a result, restate the question and confirm the measurement addresses it.

**Run a proposed rule over real data before adopting it.**
Reviewing a rule tests the sentence. Running it tests the rule.
When a rule and its test case disagree, the test case governs.
Do not rename the case to protect the rule.
Before asking what a thing should be called, ask whether it should exist.

## Durability

**Land a decision in an artifact before finalize.**
The channel does not persist. A decision that outlives the session is written to a file before the session closes.

**A deferral names a horizon and a home.**
Every deferred item states when it will be looked at again (a session, or "not scheduled") and the file that will be re-read then.
An item that cannot be given both is being dropped. Say that instead.

**Do not create a store without a named re-read moment.**
Every place knowledge is written has a moment when it is read back.
A store nothing re-reads is a write-only leak.

**A contract spanning two artifacts gets a mechanical trigger.**
Prose does not make anyone notice they moved a boundary.
Add a check (a compiler, a lint, a test) that fails when the contract is broken.

**A mask is not a dependency.**
A side effect that happens to be load-bearing appears in no dependency graph.
Before relying on a guard, and before making a ruling that removes something, ask: what is currently true that nobody decided?

**A situational warning needs a mechanical guard.**
"You are the one who checks" applies always and cannot be missed.
"Watch out for X" fails at the step where the reader must recognise this is an X.
Do not fix a situational warning by rewording it. Add a guard.

**A written principle does not fire on its own author.**
Build the trigger into the moment of publishing (see the falsification rule above), and keep a peer who will check regardless.
Seats are the checking mechanism, not redundancy.

## Enumerations

**Adding a member to a category is a cascade event.**
When you add a member, find every existing enumeration of that category and update it.
Ask "what else lists these?" at the moment you add it.

**A ruling names what it did not rule on.**
A message that silently omits an item is indistinguishable from one that resolved it.

**Do not ask through a channel that blocks you from receiving the answer.**
Asking through two channels is not redundancy. The blocking one wins.

**There is no message budget.**
Do not shorten a message to fit a limit no tool imposes.
State the second-most-important finding as its own message, not as a subordinate clause.

## Talking about failure

**Describe the missing mechanism, not the person who lapsed.**
An engineering account ends in a hypothesis or a touch point.
A personal account ends in an apology and produces nothing.
