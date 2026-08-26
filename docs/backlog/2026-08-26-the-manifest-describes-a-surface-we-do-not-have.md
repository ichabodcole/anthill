# The manifest describes a surface we do not have — four defects, one shape

**Added:** 2026-08-26, from a cold read of
[agent-cli-conformance](https://github.com/ichabodcole/agent-cli-conformance)'s `STANDARD.md`
(on their `develop`), which uses anthill's manifest as its worked drift example.
**Every number below was measured against `develop` on 2026-08-26**, not taken from their report —
their claims are cited where they were the origin, and all of them held.

---

## Why these are one item and not four

Each is the same failure: **the manifest's type has no slot, or the wrong slot, for part of the
surface the CLI actually has.** The generator is not stale — it walks `define.ts` live on every
invocation, and there is no second copy to fall behind. It is _incomplete_, and incompleteness is
invisible from inside the process:

> Checking against behaviour is what makes a dropped field visible. From inside the tool it is an
> absence, and **absences do not fail tests.**

There is no test we could have written against a field our type does not have. That is why our own
gate is green and has always been green on all four.

**Both `acc` trials missed all of this**, because both probe the root only and all four live below
it. This came out of reading, not from the kit.

## The measurements

Manifest as it stands: **25 declared paths**, 15 top-level commands, **91 flag objects**, and
exactly **7 keys** ever emitted on a flag — `alias, default, description, name, required, type,
valueHint`.

### 1. Refused flags are published as valid — the one that costs a caller

`define.ts` has a `refused` property: a flag the command **recognises and deliberately refuses**,
registered with the parser so it never reads as "unknown", and excluded from the advertised valid
set. That machinery is careful and correct.

**The manifest type has no `refused` field, so all 8 are emitted as ordinary valid flags.**

Eight arg definitions carry it: `--team` on `info show`, `info env`, `feedback`, `field-notes`,
`scan`, `migrate`; `--as` on two `comms` verbs.

It is sharper than a missing field, because **the same flag name is valid on some paths and refused
on others, with byte-identical representation**:

```
status    --team nosuchteam  ->  --team names team "nosuchteam", which is not configured.
                                 Configured teams: default.            <- VALID, resolved, rejected on value
info show --team nosuchteam  ->  `--team` is not accepted here. `info` reports on the PLUGIN,
                                 not on a team …                       <- REFUSED outright
```

`--team` is declared on **21 of 25 paths** and refused on 6 of them. Nothing in the document
distinguishes the two. An agent doing exactly what we instruct it to do — read the manifest,
construct the invocation — is walked into an error by a flag its own tool published as valid.

**This is the same class as the stale `join/SKILL.md` prose we fixed on 2026-08-23**, with one
difference that makes it worse: that was prose a seat might skim, and this is machine-generated and
agents follow it literally.

### 2. Positionals are emitted inside the array named `flags` — 7 of 25 paths

```
join    -> handle:positional     comms send -> text:positional      comms follow -> channel:positional
spawn   -> handles:positionals   team use   -> name:positional      commit       -> paths:positionals
feedback-> message:positionals
```

A consumer iterating `flags` builds `--handle foo` where the tool wants `foo`. **Discriminable
only by inspecting `type`** — the values `positional` and `positionals` are emitted, so a careful
reader can tell. A reader iterating the container by its name cannot, and the container is called
`flags`.

### 3. `help --json` is the one command that does not speak the envelope

Every other command returns `{ok, data, meta}`. The manifest is a **bare document** — top-level
`name`, `version`, `description`, `commands`.

So the single machine output whose entire job is to be machine-readable is the one that does not
carry the envelope every other output carries. A consumer cannot use one reader for both, and
cannot check `ok` before trusting the payload.

_This one was not in their trial. It came out of the cold read and they have filed it upstream as a
new finding with attribution._

### 4. The manifest omits its own door, and the whole universal surface

`help` is **not among the 15 declared commands** — and `anthill help --json` is what produces the
manifest. Nor are `--help`, `-h`, `--version`, `-v`, or `--` anywhere in the document.

A caller holding the manifest and nothing else cannot rediscover the invocation it came through.
The human help screen ends by telling the reader to run it; the machine document does not.

The cause is structural rather than careless: these are **interceptors in `cli.ts`, not commands**,
so a generator walking the command table walks straight past them. Anything we add as an
interceptor later will be invisible the same way.

## What to decide

1. **Scope.** Is this one change to the manifest type, or is the manifest type the wrong shape and
   this is a rewrite? Items 1 and 2 are additive. Item 4 needs the emitter to know about a surface
   that lives outside the structure it walks.
2. **Is #3 a breaking change?** Anything already parsing the bare manifest breaks if we wrap it.
   Worth finding out who parses it before deciding — our own skills instruct seats to run it.
3. **Does this ride with the exit-code item
   ([2026-08-21](2026-08-21-usage-errors-and-bugs-share-exit-1.md)) or land before it?** Both are
   "the CLI's machine-facing contract is not what we think it is". The exit-code one has a published
   contract argument; this one does not — a manifest that gains a field is additive in a way an exit
   code is not.
4. **What stops the next one.** All four are absences, and absences do not fail tests. The check
   that would have caught #1 and #2 is cheap and needs no external kit: **diff the parser's own
   `Valid flags: …` rejection string against the manifest's flag list, per command path.** Their
   standard names this as the highest-yield thing to build and says to build it before anything
   else. It is a test we could own — **now run once and scoped in its own item**:
   [own the declared-versus-accepted census as a gate test](2026-08-26-own-the-declared-versus-accepted-census-as-a-gate-test.md).
   It catches #1 and #2 and does **not** catch #3 or #4, so it is a partial answer to this
   question and not the whole one.

## What is NOT claimed here

That the manifest is stale — it is not, and generation already eliminated that class. That any of
this is caught by our gate — none of it is, by construction. That `acc` found it — it did not; two
full trials came back clean on all four because they probe the root and these live below it.
