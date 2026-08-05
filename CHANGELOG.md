# Changelog

## [2.0.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.10.0...anthill-v2.0.0) (2026-08-05)


### ⚠ BREAKING CHANGES

* **skills:** guidance that directed agents to a grapevine channel is removed from the shipped skills; teams upgrading should run anthill:upgrade section 4.0 to reconcile their own in-repo references.
* **step4:** anthill convene no longer accepts --fresh or --topic, and the join manifest no longer carries tailCommand.

### Features

* **step4:** convene opens NOTHING and join composes no vine tail -- grapevine leaves the lifecycle ([14cf678](https://github.com/ichabodcole/anthill/commit/14cf67849e5b3bd81005843d5755405d0f795554))


### Documentation

* **skills:** the shipped surface stops pointing at grapevine, and upgrade documents the migration ([cbafb2b](https://github.com/ichabodcole/anthill/commit/cbafb2be48ad44bd8840c212cd6fb7f0bf8d5734))

## [1.10.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.9.0...anthill-v1.10.0) (2026-08-05)


### Features

* **comms:** a teardown may no longer be authorised by an absence of data ([eb7d1fc](https://github.com/ichabodcole/anthill/commit/eb7d1fc01ee1364e35638300875d55e1cf512450))


### Bug Fixes

* **comms:** the tombstone had no session, so last night's departure authorised tonight's teardown ([53ecae4](https://github.com/ichabodcole/anthill/commit/53ecae473e83271e0622fcb09476f144d58fc872))
* **join:** 'scratch is gitignored so it does not survive the session' was false, and shipped ([3b82cef](https://github.com/ichabodcole/anthill/commit/3b82cef26c6024c55360805f910f81ea07c9958a))

## [1.9.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.8.0...anthill-v1.9.0) (2026-08-05)


### Features

* **commit:** --stdin and -F for the commit message (retro H1's test) ([a3707c3](https://github.com/ichabodcole/anthill/commit/a3707c37b860d4e8fac0c64aac28f672205c516a))
* **comms:** add `positions` — the cross-seat read of emittedThrough ([32a9d46](https://github.com/ichabodcole/anthill/commit/32a9d46eac38236486c65a1c36a3cf7f036cf8ce))
* **comms:** follow announces its gap instead of starting silently from now ([1fb02af](https://github.com/ichabodcole/anthill/commit/1fb02aff1a72145653567d48bfbbdf2d77d2b45a))
* **comms:** per-seat emittedThrough position, recorded by follow ([8d4569d](https://github.com/ichabodcole/anthill/commit/8d4569deafa980f0b67b3000091fb72584ad490c))
* **comms:** send --dry-run and read --last N ([c9e156f](https://github.com/ichabodcole/anthill/commit/c9e156fecd55805a06216ade848614a3b6384fc4))
* **comms:** send-time staleness check and the emittedThrough stamp ([fd0fe7d](https://github.com/ichabodcole/anthill/commit/fd0fe7d99dbe1cf2bf255f6e8674851b8c7d6e92))
* **join:** comms leads the manifest, and the catch-up line stops covering one of the two wires it serves ([231d39a](https://github.com/ichabodcole/anthill/commit/231d39a4c47a7db4036bab655b9bcff9f0cd03d4))
* **join:** emit the LAND command composed, so a shell idiom cannot defeat the gate ([451e1aa](https://github.com/ichabodcole/anthill/commit/451e1aa3088692176bbbfd4292f4bd5d2c844414))
* **team:** add steward and scout, and regenerate the roster from config ([6a4fbfe](https://github.com/ichabodcole/anthill/commit/6a4fbfe731731371e4db247dbc577df190fb9d49))


### Bug Fixes

* **agent-layer:** make the TTY half of the dual-audience matrix reachable from a test ([97fbee9](https://github.com/ichabodcole/anthill/commit/97fbee9e87825025b6facf81d4deee9008659228))
* **cli:** --version says WHICH cli.ts answered, not just what it claims ([5bfd97f](https://github.com/ichabodcole/anthill/commit/5bfd97f7244ac68c481050d59189fb6cf58b261c))
* **commit:** make the seat trailer idempotent ([3123bb2](https://github.com/ichabodcole/anthill/commit/3123bb2052572bcdc7635ee5bd48bc23f9ab55be))
* **commit:** resolve the git common dir so anthill commit works in a worktree ([4acba7c](https://github.com/ichabodcole/anthill/commit/4acba7c8384b5734eafb8e061e5b9ae38def6d80))
* **commit:** uncheckedAgainst is TOTAL — ruled at [#112](https://github.com/ichabodcole/anthill/issues/112), built 132 messages later ([7ed0f53](https://github.com/ichabodcole/anthill/commit/7ed0f537f402826927d266c19018553f52e959e0))
* **comms:** an incoherent position is never-followed, not `current` — F1's cheap half ([1edca84](https://github.com/ichabodcole/anthill/commit/1edca8403ce858f908c0c7fbb535eae28f329e3d))
* **comms:** follow-start reports gap null when it cannot be known, never 0 ([400e348](https://github.com/ichabodcole/anthill/commit/400e34837c123da12a305dfadfad18b5eaa0dbf5))
* **convene:** emit the LEAD's own comms incantation ([2563d94](https://github.com/ichabodcole/anthill/commit/2563d943f30d91d60fb24c09a9fd5733ce0e41d5))
* **convene:** report what --fresh DID, not that the flag was forwarded ([73e8fea](https://github.com/ichabodcole/anthill/commit/73e8fea323e33c63bf6a03a93f83fe7c32a010d3))
* **down,join:** the third AND fourth sites of "on the vine" — found by grepping, not by being pointed at ([cc22e0c](https://github.com/ichabodcole/anthill/commit/cc22e0ca295174a1a8b253563e4f42a2ca560eef))
* **down,status:** presence is three states, and an unknown one must not read as empty ([bc14193](https://github.com/ichabodcole/anthill/commit/bc141935f3a8b93c61fa08351fb930fbc1f8ae56))
* **down:** a dead comms follower is UNKNOWN, never absence (F1) ([b28c3b5](https://github.com/ichabodcole/anthill/commit/b28c3b5ecfc594425b7f721da72ece863e3d00e1))
* **down:** presence spans BOTH wires — the teardown guard was fail-open on a comms-only session ([fb85483](https://github.com/ichabodcole/anthill/commit/fb8548385ba8b7fe7a1731a6fe7b736edc7f2002))
* **down:** the teardown refusal no longer names a single wire ([4cbf355](https://github.com/ichabodcole/anthill/commit/4cbf355d4bb0cb02ebb2ca1d9f1903c25ece4bd4))
* **gitignore:** drop the trailing slash so the comms path matches a symlink too ([ab3e66d](https://github.com/ichabodcole/anthill/commit/ab3e66de9b4e24f5d2faca646e23a40e6fb6887f))
* **init:** drop the trailing slash from COMMS_GITIGNORE_LINE ([7b2b4cd](https://github.com/ichabodcole/anthill/commit/7b2b4cd5f064005d3df9df2dffa78d7b4ecfa147))
* **join,down,cli:** four cold-read severes — three tests that passed for the wrong reason, one manifest that lied ([8ba7c8d](https://github.com/ichabodcole/anthill/commit/8ba7c8d599b249ef5c1abec5206273458a2dc8b5))
* **join:** a missing spellbook no longer sinks the whole manifest (S8-1) ([1efc161](https://github.com/ichabodcole/anthill/commit/1efc161e458884226bc034d357ba0db7a2255375))
* **join:** put principles.md in the grounding manifest, and split the missing-doc remedy by origin ([322a48a](https://github.com/ichabodcole/anthill/commit/322a48ad18ebe416b5fcbc24e64577474b3e59eb))
* **join:** repair three guards found by blank-context verify — D1 vacuous, D2 mis-justified, D3 absent ([0c4f3f6](https://github.com/ichabodcole/anthill/commit/0c4f3f6e0c654e190b36fec700fe6d9ba9025259))
* **join:** the emitted LAND string is a command or nothing — never prose (F2/F2b) ([10bae00](https://github.com/ichabodcole/anthill/commit/10bae002ad9dff010d4706d414e149a4539d35cc))
* **join:** the LAND string resolves to the emitting cli.ts, never a bare `anthill` ([98ade49](https://github.com/ichabodcole/anthill/commit/98ade496aafd01c2df62857792ef1b3a93c4f0b4))
* **join:** the TEXT renderer collapsed the partial-wire case — third instance, one diff ([1235955](https://github.com/ichabodcole/anthill/commit/1235955c845e77d67abab088abbddcbd7e6dab7e))
* **status:** fold the SECOND copy of the presence logic into seatPresence ([afb4a02](https://github.com/ichabodcole/anthill/commit/afb4a02bb47bf9d03a381c3f94cbd41a4970a873))

## [1.8.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.7.2...anthill-v1.8.0) (2026-08-01)


### Features

* **field-notes:** ship what we learn as observation, not as law ([95d4ded](https://github.com/ichabodcole/anthill/commit/95d4ded2f471a1cbf349214f8e7392b4f518f7fe))


### Bug Fixes

* **cli:** parser errors reach the agent envelope, not a usage block ([e03ec52](https://github.com/ichabodcole/anthill/commit/e03ec524e9850e0098acc7ec177c3939938fbecd))

## [1.7.2](https://github.com/ichabodcole/anthill/compare/anthill-v1.7.1...anthill-v1.7.2) (2026-08-01)


### Bug Fixes

* **cli:** a value starting with a dash is a value, not a flag ([a13b7f1](https://github.com/ichabodcole/anthill/commit/a13b7f146dcd78595d1a6fd5f21034026ba90cb3))
* **upgrade:** a stale CLAUDE_PLUGIN_ROOT makes the reconcile report clean and skip the release ([32e819a](https://github.com/ichabodcole/anthill/commit/32e819a0324c4715577d8fcd390457135bfab123))

## [1.7.1](https://github.com/ichabodcole/anthill/compare/anthill-v1.7.0...anthill-v1.7.1) (2026-08-01)

### Bug Fixes

- **commit,cli:** StoryLoom's field defects, and the regression review caught ([f5668cb](https://github.com/ichabodcole/anthill/commit/f5668cb34a33726cdb94ce785757d0d03f04a0b8))
- **commit:** stop eating the first character of the first foreign dirty path ([a2bd484](https://github.com/ichabodcole/anthill/commit/a2bd484f9c5c5acb473908b81278bb48dd94a558))
- **join,skills:** tell seats to use --as, or the trailer ships dead ([8908e6a](https://github.com/ichabodcole/anthill/commit/8908e6a81860d71a67bbf144d43beae3fbaed763))

## [1.7.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.6.0...anthill-v1.7.0) (2026-07-31)

### Features

- **internal:** add the cascade-check skill — what else must change when you change something ([1a845b2](https://github.com/ichabodcole/anthill/commit/1a845b2006cbfebb9858043fb8a98767a375b34b))
- **plan:** sharpen the ratify gate — claim shape, ratification grain, runtime repro ([89c8297](https://github.com/ichabodcole/anthill/commit/89c829728b0c097cfbfed8a16294f43529f78f1a))

### Bug Fixes

- **dogfood:** finish syncing our footprint — the previous commit's count was wrong ([2985aab](https://github.com/ichabodcole/anthill/commit/2985aab6a68b059ae26ded530ec32bce1fa70eb1))
- **internal:** cascade-check review fixes — plus the two defects the review found ([daa8ccd](https://github.com/ichabodcole/anthill/commit/daa8ccdbee3641a742800de05cea9418189de20f))
- **skills:** cascade fixes for the language-and-promises pass ([c06d086](https://github.com/ichabodcole/anthill/commit/c06d086ffa18ba749f0094b0ed618547ec4f4ecc))
- **skills:** correct a wrong command, and name what our promises actually cover ([88bc62c](https://github.com/ichabodcole/anthill/commit/88bc62c7de90248ae7e7ebab518d6192d83c471f))
- **skills:** remove the old framing that contradicted the ratify-gate pass ([82de478](https://github.com/ichabodcole/anthill/commit/82de47869b6718e07513df5af177047a443db474))
- **skills:** the granularity audit — two more promises, one of them live ([9f34164](https://github.com/ichabodcole/anthill/commit/9f34164282d26ac092dea1d2ee4a5c4662cfc334))
- **upgrade:** a content-only release still needs an upgrade — route to it ([a4cccb6](https://github.com/ichabodcole/anthill/commit/a4cccb671b1a9580e216af64beddda37c0e4932d))
- **upgrade:** the reconcile can't depend on release notes consumers can't read ([70c4820](https://github.com/ichabodcole/anthill/commit/70c48209a670d42676511879fdb258a08c48241e))

## [1.6.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.5.0...anthill-v1.6.0) (2026-07-30)

### Features

- **convene:** add pre-spawn working-branch confirm beat ([4770e05](https://github.com/ichabodcole/anthill/commit/4770e05cf68ff1e0b2e30ad7c349f500ec9cde65))

### Bug Fixes

- **commit:** stop stranding the team's index; land deletions, renames, and name the foreign red ([2170636](https://github.com/ichabodcole/anthill/commit/2170636c583b69a09a4ef4684b3f08f177679b56))
- **convene,attach:** warn on possible board loss; stop hiding half the team ([3111f28](https://github.com/ichabodcole/anthill/commit/3111f28545e7285af50e0d4c769f2e688dcc6024))
- **join:** repair three silent onboarding failures + flag unfilled grounding ([315fa56](https://github.com/ichabodcole/anthill/commit/315fa56e26e50fb61813c7381ba6991a0ad6eaec))

## [1.5.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.4.0...anthill-v1.5.0) (2026-07-10)

### Features

- **board-binding:** bind every seat verb to the team board via spellbook [#69](https://github.com/ichabodcole/anthill/issues/69) ([8a7471b](https://github.com/ichabodcole/anthill/commit/8a7471b243276a86a0ff637e5c877107b0ab5a35))

## [1.4.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.3.2...anthill-v1.4.0) (2026-07-10)

### Features

- **convene:** --fresh flag to clear a reused channel's prior-session log ([e71e348](https://github.com/ichabodcole/anthill/commit/e71e3480f52175ff59798cd54392bdeef87d957a))
- **convene:** --fresh flag to clear a reused channel's prior-session… ([eb1723d](https://github.com/ichabodcole/anthill/commit/eb1723dc99db19296420f2555cb6bd9653852cf6))

## [1.3.2](https://github.com/ichabodcole/anthill/compare/anthill-v1.3.1...anthill-v1.3.2) (2026-07-09)

### Bug Fixes

- **join:** mandate --stdin/heredoc for code-bearing vine messages ([9527c17](https://github.com/ichabodcole/anthill/commit/9527c170c3d3921e44c42870297dcf6a1493dfc0))
- **shared-tree:** fix-forward review findings on A+B1 ([2fac0d8](https://github.com/ichabodcole/anthill/commit/2fac0d8e1e1d741a59b7a0ecc42d850d4d9da8d9))
- **shared-tree:** red-tree finalize branch, board best-effort, gate-scope scratch ([2df7977](https://github.com/ichabodcole/anthill/commit/2df7977e8279a8040e1ebe9128eccde3a67a009e))

## [1.3.1](https://github.com/ichabodcole/anthill/compare/anthill-v1.3.0...anthill-v1.3.1) (2026-07-06)

### Bug Fixes

- **test:** scrub GIT_* env in git-spawning command tests ([e80e786](https://github.com/ichabodcole/anthill/commit/e80e786f1c2bce15b2c7657db66a1027abc20383))

## [1.3.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.2.0...anthill-v1.3.0) (2026-07-06)

### Features

- attach outside-project fallback + optional human CLI mention ([b8fe79d](https://github.com/ichabodcole/anthill/commit/b8fe79dfa92380959c72a8b3f043beadae9f2f4d))
- **feedback:** anthill feedback — upstream feedback path (bugs AND ideas) ([6cb19c1](https://github.com/ichabodcole/anthill/commit/6cb19c132a38402ed5662abcd441f0f83e3aa320))
- **multi-surface:** anthill scan + by-surface archetype & candidate seatings ([de3aa58](https://github.com/ichabodcole/anthill/commit/de3aa58abdd85b03cd5991bb7f6b621085671409))

### Bug Fixes

- **commit:** stage-verify-then-pathspec-less commit to dodge lint-staged corruption ([ee8b62d](https://github.com/ichabodcole/anthill/commit/ee8b62d94c8c0923650e90e2f3bef2a3b1be91e6))

## [1.2.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.1.0...anthill-v1.2.0) (2026-07-03)

### Features

- **skills:** add anthill:plan — the skeleton→ratify planning phase ([f6b34eb](https://github.com/ichabodcole/anthill/commit/f6b34ebcd09d5fc87de49f553ff4a2c84f4b1254))

## [1.1.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.0.0...anthill-v1.1.0) (2026-07-01)

### Features

- **migrate:** consolidate a redundant-default paths override (fix [#8](https://github.com/ichabodcole/anthill/issues/8).1/[#8](https://github.com/ichabodcole/anthill/issues/8).2) ([fc813fa](https://github.com/ichabodcole/anthill/commit/fc813faa1d803aac55f0ca80357d346f824de876))
- **upgrade:** reconcile the root pointer (fix [#8](https://github.com/ichabodcole/anthill/issues/8).5); archive migration items ([2e4582f](https://github.com/ichabodcole/anthill/commit/2e4582f143d972d067c44d4c0776579abf8e43f4))

## 1.0.0 (2026-06-30)

### Features

- add the anthill migrate CLI (Phase 3) ([af1f29e](https://github.com/ichabodcole/anthill/commit/af1f29e3ebc7efc6d4affd86a2172c5e01f838ee))
- add the anthill:upgrade skill + v1→v2 guide (Phase 4) ([5b42009](https://github.com/ichabodcole/anthill/commit/5b4200997bb085f2bb321933ecd75a1b05863c83))
- add the pure migration planner (Phase 2) ([2db4e12](https://github.com/ichabodcole/anthill/commit/2db4e12b3c6894bda71f7bb295fb149b59488051))
- add the structural re-scope reflection prompt (brief feature 4) ([e97df52](https://github.com/ichabodcole/anthill/commit/e97df52ffbed3a52e8836b2e687df230c9da5960))
- consolidate consumer footprint into .anthill/ (v2 layout) ([bd8d9f0](https://github.com/ichabodcole/anthill/commit/bd8d9f0b677a197c5dedfba3181659a142915618))
- instruct agents to shield living docs from the host formatter ([84dfb12](https://github.com/ichabodcole/anthill/commit/84dfb12ca9947f36b8221d8d6ea32bda22d9bc5c))
- **skills:** pair reactive feedback with a reflective pass ([765994f](https://github.com/ichabodcole/anthill/commit/765994fcc5b82709772972506bd5ce347bfb3a14))

### Bug Fixes

- **grounding:** detect real anchors; warn on dangling grounding paths ([dea05b1](https://github.com/ichabodcole/anthill/commit/dea05b1b402e74ea297b4d0dec495da7d7269f34))
- **status:** label the bounty board by title ([95dfe31](https://github.com/ichabodcole/anthill/commit/95dfe31819de7d152b07f44ee7482edefbe91290))
- **templates:** author living-doc templates one sentence per line (the belt) ([167c996](https://github.com/ichabodcole/anthill/commit/167c996eee92ac8d5be25f7ba335320d4277546b))
