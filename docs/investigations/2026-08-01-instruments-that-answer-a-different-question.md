# When the instrument silently answers a different question

**Opened:** 2026-08-01 · **Status:** evidence gathered, remedy proposed, not yet built
**Trigger:** the human asked whether a different terminal or shell would reduce this friction
**Seat:** maestro · **Evidence:** 6 dated instances, 2 sessions, 3 seats + the lead

---

## The question as asked, and the honest answer

> _"We keep hitting issues with zsh — would a better terminal cause fewer problems? It's one thing to
> say 'just try not to do this', but that's hard, you have habits."_

The instinct is right — _"be more careful"_ has now failed publicly — but **the diagnosis of zsh is
about one third correct**, and switching shells would make things worse. Measured, not assumed:

| trap                                | zsh            | bash             | shell-specific? |
| ----------------------------------- | -------------- | ---------------- | --------------- |
| unquoted `$c` word-splits           | **no** — 1 arg | **yes** — 3 args | **YES**         |
| pipeline `$?` is the last command's | 0              | 0                | no              |
| backticks execute inside `"…"`      | EXECUTED       | EXECUTED         | no              |

**Terminal emulator is irrelevant.** iTerm/Ghostty/Alacritty draw characters; they parse nothing.

**Switching to bash would be a downgrade.** It "fixes" the two zsh cases by restoring the classic
footgun — silent whitespace splitting on every unquoted expansion. **zsh's no-split default is the
safer behaviour**; what actually bit us is bash-shaped habits running under zsh. Fish would also kill
backticks-in-quotes, but it is non-POSIX and breaks most snippets, tooling, and anything pasted from
the web.

## The real pattern is bigger than the shell

Reframing from the evidence: every instance is **an instrument silently answering a different
question than the one asked, and returning a confident result.** Only three of six are shell.

| #   | instance                           | seat     | instrument                   | what it answered instead                                |
| --- | ---------------------------------- | -------- | ---------------------------- | ------------------------------------------------------- |
| 1   | revert-check "0 failures"          | maestro  | backticks in a quoted string | the revert never applied; the result was meaningless    |
| 2   | probe sweep, 4 wrong readings      | maestro  | unquoted `$c` in zsh         | one mangled argv → root usage 4×                        |
| 3   | unquoted `$args`, 4 wrong readings | forager  | same                         | same — **inside the file documenting instances 1–2**    |
| 4   | `grapevine` "exits 0"              | weaver   | `cmd \| head`                | the **pipeline's** exit code, not the command's         |
| 5   | commit message lost two terms      | maestro  | backticks in `-m "…"`        | shell executed them; the words vanished from the commit |
| 6   | "`--from-start` not caught"        | sentinel | an injected mutation         | invalid JS, so the mutation never reached the surface   |

**Instance 3 is the one that makes this a design problem.** forager hit it _in the file that
documents it having already happened twice_, and wrote the conclusion himself:

> **A prose warning did not stop the person who had just read it.**
> Put the guardrail where instruction text cannot override it.

**Instance 6 is the one that shows it is not about shells at all.** sentinel's instrument was a code
mutation, not a command line — and it manufactured an answer _inside the task of checking whether
tests manufacture answers._

### Why "be careful" cannot work here

Every one of these **produced a confident, plausible, well-formed result**. None errored. The failure
is indistinguishable from success at the moment it happens, so the vigilance would have to be
continuous and unprompted — which is exactly the thing three capable agents each failed at while
holding the relevant lesson in context.

### What actually caught them

Not care. In every case, a **second, differently-shaped observation**:

- instance 2 → **uniform output sizes** across cases that should differ (forager's tell)
- instance 4 → re-running the command **bare**, without the pipe
- instance 6 → asserting the mutation was **present in the rendered output** before trusting the result
- instances 1, 5 → reading the artifact afterwards rather than the command's exit

**Generalised: verify the instrument registered, before trusting what it reports.** That is a
different act from checking the result, and it is the only thing with a track record here.

## Proposed remedies, by leverage

### 1. Stop establishing facts with ad-hoc probes — write them as tests ⭐

Every instance happened while probing **to establish a fact for a document**. A probe is transient,
unversioned, and re-runnable only by retyping it. A test is none of those and fails loudly.

Note the corroboration: **`cli.ts` had zero tests** before session 4, which is precisely why its
behaviour was being established by hand at all. The moment forager wrote `cli.test.ts`, the cold
reviewer called it _"genuinely strong, no vacuous tests"_ — and the probing stopped.

**This is the structural answer to "you can't just be careful."**

### 2. Make the tool refuse the footgun

`anthill comms send` has `--stdin` **precisely** for bodies with backticks. `anthill commit -m` does
not — which is exactly how instance 5 corrupted a commit message. **Give `commit` the same
`--stdin`/`-F` affordance.** This is forager's remedy in its concrete form: the guardrail sits where
instruction text cannot override it, because there is no unsafe path to take.

### 3. `setopt pipefail`

One line; kills the instance-4 class in any shell. **Changes the human's shell config, so it is his
call.** (`set -u` is worth considering alongside it.)

### 4. Argv arrays, never interpolated command strings

`probe() { cmd "$@"; }` — adopted mid-session-4 and it held. Shell-agnostic; removes the whole
word-split class regardless of shell.

## Recommendation

**Keep zsh.** Do (1) and (2) as real work, (3) if the human wants it, and (4) is already a habit.
That removes four of six structurally rather than by vigilance, and the remaining two die with (4).

**Do not** switch shells or terminals: it addresses a third of the evidence and reintroduces a worse
default.

## Open questions

- **Is there a mechanical form of "verify the instrument registered"?** All four catches above were
  ad-hoc. If this generalises into something runnable, it is worth more than the four remedies above
  combined — but it may not, and asserting it does would be this document committing its own subject.
- **Does (1) hold for claims about _dependencies_?** A test can pin our own CLI. `grapevine`'s
  behaviour is not ours to pin, and session 3 already recorded that nobody on the roster owns claims
  about dependency behaviour — five wrong statements came from exactly that gap.

## References

- [Session 2 friction log](../projects/_archive/team-comms-spike/session-2-friction.md) — §D4, and D1–D5 generally
- [Parser errors bypass the agent envelope](../backlog/2026-07-31-parser-errors-bypass-the-agent-envelope.md)
  — its probe note records instances 1–2; instance 3 happened to a seat reading that note
