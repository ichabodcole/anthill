# `config.ts` — a dead export and a silently-wrong `paths` type

**Added:** 2026-08-10 · **Status:** Open · **Shape:** two small fixes, same file, same test surface
**Surface:** `plugin/scripts/anthill/config.ts` · test `config.test.ts`

1. **`loadConfig` has no production caller left** — only tests and one convene-test mock. Its doc
   comment still presents it as the fs entrypoint peer of `loadProject`, so a reader takes it for a
   live seam. Either delete it or say what it is for.
2. **A non-object `paths`** (e.g. the string `".anthill"`) is spread character-by-character and
   silently resolves to the default `teamDir` instead of erroring. A config that is wrong in an
   obvious way is accepted and quietly ignored.
