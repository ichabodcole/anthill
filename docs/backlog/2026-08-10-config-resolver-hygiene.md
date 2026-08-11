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
