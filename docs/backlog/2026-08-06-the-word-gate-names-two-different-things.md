# The word "gate" names two different things, and the implementation's own comments use it for both

**Status:** Backlog — **verified at source; the filed shape is real but narrower than the actual defect**
**Found:** upstream, [anthill#92](https://github.com/ichabodcole/anthill/issues/92) — the `thoth`/Spellbook team, 2026-08-06, against 2.0.0
**Verified:** 2026-08-06 against `develop` @ `932596e`. All three cited files are byte-identical between `main` and `develop`; every line number below is exact on both.

---

## What was filed

Three shipped strings introduce the land command as "gate and commit in one string." All three are
true. None says that **`anthill commit` is not the thing running the gate** — the land string is
`<gate> && anthill commit …`, two processes chained by the shell — and the reporter's argument is
that the absent clause seeds a wrong mechanism into every team that renders the SOP or runs
`anthill join`.

**The three sites are exactly where they said, word for word:**

- `plugin/templates/docs-team/README.md:137` — _"your project's **gate and the commit in one string, with no pipe in it**"_
- `plugin/scripts/anthill/commands/team-join.ts:307` — _"LAND with this EXACT string — gate and commit in one, no pipe, no inline -m"_
- `plugin/scripts/anthill/commands/team-join.ts:134` — _"The LAND command, fully composed — gate and commit in one string, with no pipe…"_

**The composition is exactly as described:** `buildLandCommand` returns
`` `${decision.gate} && ${commit}` `` at `team-join.ts:243`. Two processes, shell `&&`.

**And the literal central claim holds.** `team-commit.ts` never reads `config.gate`. Its only
subprocess helper is `git()` at `:42-49` — the file's sole `spawnSync`, no `Bun.spawn`, no shell.
`requireConfig` is imported at `:8` and used once, at `:295`, purely to validate `--as` against
`config.seats`. Every occurrence of the word "gate" in that file is in a comment.

## Two things the report got wrong, and both change the fix

**1. The three sites are not the surface — there are eight more, and most are already better.**
A sweep of `plugin/` finds the framing at `docs-team/README.md:156-163`, `bootstrap/SKILL.md:177-179`,
`convene/SKILL.md:57-59, :65, :214`, `upgrade/SKILL.md:249`, and `finalize-session/SKILL.md:118-119`.
The skill sites say **"runs the gate _in front of_ the commit"** — which is materially more accurate
than the three cited, because it implies sequence rather than containment. The report picked the
three weakest phrasings and did not notice that the majority surface already carries the clause it
is asking for, in different words.

**So "add one clause at three sites" would leave eleven sites saying two different things.** The unit
of repair is the vocabulary, not the three strings.

**2. On this repo — and on any project whose pre-commit hook runs its check — the commit IS gated.**
`team-commit.ts:457` is a real `git commit`, so git fires `.husky/pre-commit`, which here is
`bunx lint-staged && bun run check`. `.anthill/config.json:43` sets `"gate": "bun run check"`.
**Character-for-character the same command.** The composed land string therefore runs the gate
**twice** — once via the `&&` prefix, once inside the commit.

The report's implied consequence — a reader who models "one command that gates-then-commits" holds a
false model — is **not true in that shape** for these projects. They hold a model that is right about
the outcome and wrong about the machinery.

## The actual defect, which is one layer down

**The implementation's own comments use "the gate" for the husky hook, not for the `&&` prefix:**

- `team-commit.ts:461-466` — _"The gate has already run and failed… on a shared tree the whole-tree
  pre-commit hook fails on a peer's work just as readily as on ours"_ — describing why `git commit`
  at `:457` returned non-zero. Here "the gate" **is** the hook.
- `team-commit.ts:362` — _"we stage BEFORE the gate runs (we must — the gate inspects the index)"_ —
  this can **only** mean the hook. The `&&` prefix gate runs before `anthill commit` is invoked at
  all and cannot see the index this process builds.

So the vocabulary collision the report attributes to three doc strings is **present in the source**,
and the docs inherited it. A clause added to the docs while `team-commit.ts:362` and `:519` keep using
one word for two mechanisms fixes the symptom at the reader and leaves it at the writer.

## What would close it

**Name the two things separately, everywhere, and use the names.** Something like _the land gate_
(the `&&` prefix, from `config.gate`) and _the commit hook_ (whatever git fires). Then:

1. Sweep all eleven doc sites to one vocabulary — preferring the existing **"in front of the commit"**
   phrasing, which seven sites already use and which is correct as it stands.
2. Fix the two comments in `team-commit.ts` (`:362`, `:461-466`) that say "gate" and mean "hook".
3. State once, at the SOP site, that on a project whose pre-commit hook runs the same command, the
   land string runs it twice. That is a real cost on a 106-second gate (see
   [the `uncheckedAgainst` item](2026-08-06-uncheckedagainst-reports-an-endpoint-not-a-delta.md)) and
   nothing anywhere mentions it.

**Do not just add the reporter's clause at the three sites.** It is a true sentence that makes the
docs less consistent than they are now, and it does not touch the source that taught the docs the
ambiguity.

## Note on the report itself

Worth reading the issue for its provenance section. Their v1 asserted `anthill commit` runs the gate;
the author marked it as inference, and reading `team-join.ts:243` falsified it before the report was
sent. **The reporting discipline is the thing to keep** — it is why this arrived as a docs issue with
a correct mechanism rather than a bug report against `commit`.

## References

- `plugin/scripts/anthill/commands/team-join.ts:134`, `:211-244`, `:307`
- `plugin/scripts/anthill/commands/team-commit.ts:42-49`, `:295`, `:362`, `:457`, `:461-466`
- `plugin/templates/docs-team/README.md:137`, `:156-163`
- `plugin/skills/{bootstrap,convene,upgrade,finalize-session}/SKILL.md` — the eight further sites
- Upstream: [anthill#92](https://github.com/ichabodcole/anthill/issues/92)
