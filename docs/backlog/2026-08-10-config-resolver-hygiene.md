# `config.ts` — a dead export and a silently-wrong `paths` type

**Added:** 2026-08-10 · **Status:** Fixed 2026-08-10 (`fix/config-resolver-hygiene`) · **Shape:** two small fixes, same file, same test surface
**Surface:** `plugin/scripts/anthill/config.ts` · test `config.test.ts`

1. **`loadConfig` has no production caller left** — only tests and one convene-test mock. Its doc
   comment still presents it as the fs entrypoint peer of `loadProject`, so a reader takes it for a
   live seam. Either delete it or say what it is for.
2. **A non-object `paths`** (e.g. the string `".anthill"`) is spread character-by-character and
   silently resolves to the default `teamDir` instead of erroring. A config that is wrong in an
   obvious way is accepted and quietly ignored.

---

## Resolution — 2026-08-10

**1. `loadConfig` is deleted, not documented.** The item offered "delete it or say what it is for";
deleting is the stronger answer because the function was not merely unused, it was **wrong for the
config shapes that now exist**. Run against a `teams` map it reaches `resolveConfig` with no
top-level `channel` and reports `config.channel is required (non-empty string)` — a required-field
error for a perfectly valid file. A future caller adopting it would have inherited that. `config.ts`
now says in its header why there is no single-team fs entrypoint, so the absence is a stated
decision rather than a gap someone helpfully fills back in. `resolveConfig` stays public as the pure
one-team resolver. Two test surfaces moved to `loadProject`.

**2. `paths` is validated rather than coerced.** A non-object `paths`, or any knob that is not a
non-empty string, is now a `ConfigError`. The old behaviour discarded the value and used the
defaults, which is indistinguishable downstream from a config that never asked to be relocated.

**Divergence — where this item's description was wrong.** The character-by-character spread is real,
but it is **not** on the path this item names. `resolveConfig` guards with
`isObject(raw.paths) ? raw.paths : {}`, so a flat config's string `paths` was dropped, not splayed.
The spread lives in `resolveProject`'s team-entry default injection
(`{ teamDir: …, ...(merged.paths ?? {}) }`), and it mattered more than the item suggests: spreading
a string yields an object carrying the **default** `teamDir`, which then **validates cleanly** — so
adding the check to `resolveConfig` alone would have left the teams-map path silently accepting.
The rejection has to happen before anything reshapes the value into something well-formed. Both
paths are now pinned, and both mutations were run RED.

**Verified by mutation, not by reading.** Four mutations, each confirmed to turn the suite red and
then restored: same-knob comparison restored; the non-object rejection removed; the per-knob type
rejection removed; the unconditional spread restored. `bun run check` green at 708 pass / 0 fail.

---

## Review round 1 — 2026-08-10

An independent reviewer re-ran all four mutations (all RED as claimed), probed twelve `paths` shapes
against both the flat and teams-entry routes, and — the step this branch's own Resolution did **not**
claim — ran the commands against three fixture repos, confirming the refusals are legible at the CLI
and that the intended team nesting still resolves `ok:true`. Verdict: **with fixes.**

**F1 — a cascade miss, and the one that matters.** `docs/projects/anthill-commit-hardening/plan.md`
instructed a future implementer to call `loadConfig(root)`, at `:123` and again at `:203`. That plan
is **not archived** and its header names its protected-trunk move as still open, tracked live in the
backlog — so whoever picked it up would have followed an API deleted the same day. Corrected to
`loadProject`, with an amendment note recording why the old name is gone, since the plan's blanket
"should be rewritten before anyone picks it up" caveat predates the deletion and does not name it.
_This is the wire-ruling row of the cascade map in a new form: the greps I ran keyed on the concept I
changed, and a still-open plan is not where `git log` or the working tree points you._

**F2 — the design doc over-claimed.** §5a said `loadProject()` is "the only fs entrypoint", which is
false at one level finer: `findConfigFile` discovers on disk, and `migrate` deliberately parses the
raw JSON itself because it operates on footprints too old to resolve. Scoped to "the only fs
entrypoint that RESOLVES a config", and the two exceptions named. `config.ts`'s own header had the
scope right; the shorter restatement dropped it — the promise-granularity rule, caught by a reader
rather than by the author who wrote both.

**F3 — two parallel three-element knob lists.** `PATH_KNOBS` and `LIVING_DOC_PATHS` enumerated the
same three knobs for different purposes with nothing keeping them in sync, so a fourth knob meant
several edits and no failing test. `LIVING_DOC_PATHS` now derives from `PATH_KNOBS` through a
`Record` keyed on its union. **Mutation-verified:** adding a fourth knob without a resolver is
`TS2741` at `config.ts:348`, so the build refuses rather than the collision check quietly falling
behind.

**F4 — a loose assertion.** The teams-entry test matched `/config\.teams\.dev[\s\S]*must be an
object/`, which the unrelated `config.teams.dev must be a JSON object` error also satisfies. It was
not vacuous — it discriminated two of the four mutations — but it did not pin `paths` by name the
way its siblings do. Tightened.

**Carried forward, not fixed here:** the 3×3 compares the three CONFIGURED knobs, and the per-seat
doc is a DERIVED path (`<seatDir>/<handle>.md`) that nothing compares across teams — so one team's
`seams` file can be another team's seat doc, which the refusal text this branch rewrote explicitly
names. Filed separately.

**Noted for the merge body:** this is a behaviour change, not only a hardening. Configs that loaded
on `develop` — `paths` as a string, `null`, or `[]`, or a knob explicitly `null` — now make every
command exit 1. That is the intended fix, but `fix:` is a patch bump under release-please, and the
cascade map asks that a **correction** carry release wording rather than arriving silently.
