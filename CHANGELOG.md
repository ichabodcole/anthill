# Changelog

## [1.3.1](https://github.com/ichabodcole/anthill/compare/anthill-v1.3.0...anthill-v1.3.1) (2026-07-06)


### Bug Fixes

* **test:** scrub GIT_* env in git-spawning command tests ([e80e786](https://github.com/ichabodcole/anthill/commit/e80e786f1c2bce15b2c7657db66a1027abc20383))

## [1.3.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.2.0...anthill-v1.3.0) (2026-07-06)


### Features

* attach outside-project fallback + optional human CLI mention ([b8fe79d](https://github.com/ichabodcole/anthill/commit/b8fe79dfa92380959c72a8b3f043beadae9f2f4d))
* **feedback:** anthill feedback — upstream feedback path (bugs AND ideas) ([6cb19c1](https://github.com/ichabodcole/anthill/commit/6cb19c132a38402ed5662abcd441f0f83e3aa320))
* **multi-surface:** anthill scan + by-surface archetype & candidate seatings ([de3aa58](https://github.com/ichabodcole/anthill/commit/de3aa58abdd85b03cd5991bb7f6b621085671409))


### Bug Fixes

* **commit:** stage-verify-then-pathspec-less commit to dodge lint-staged corruption ([ee8b62d](https://github.com/ichabodcole/anthill/commit/ee8b62d94c8c0923650e90e2f3bef2a3b1be91e6))

## [1.2.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.1.0...anthill-v1.2.0) (2026-07-03)


### Features

* **skills:** add anthill:plan — the skeleton→ratify planning phase ([f6b34eb](https://github.com/ichabodcole/anthill/commit/f6b34ebcd09d5fc87de49f553ff4a2c84f4b1254))

## [1.1.0](https://github.com/ichabodcole/anthill/compare/anthill-v1.0.0...anthill-v1.1.0) (2026-07-01)


### Features

* **migrate:** consolidate a redundant-default paths override (fix [#8](https://github.com/ichabodcole/anthill/issues/8).1/[#8](https://github.com/ichabodcole/anthill/issues/8).2) ([fc813fa](https://github.com/ichabodcole/anthill/commit/fc813faa1d803aac55f0ca80357d346f824de876))
* **upgrade:** reconcile the root pointer (fix [#8](https://github.com/ichabodcole/anthill/issues/8).5); archive migration items ([2e4582f](https://github.com/ichabodcole/anthill/commit/2e4582f143d972d067c44d4c0776579abf8e43f4))

## 1.0.0 (2026-06-30)


### Features

* add the anthill migrate CLI (Phase 3) ([af1f29e](https://github.com/ichabodcole/anthill/commit/af1f29e3ebc7efc6d4affd86a2172c5e01f838ee))
* add the anthill:upgrade skill + v1→v2 guide (Phase 4) ([5b42009](https://github.com/ichabodcole/anthill/commit/5b4200997bb085f2bb321933ecd75a1b05863c83))
* add the pure migration planner (Phase 2) ([2db4e12](https://github.com/ichabodcole/anthill/commit/2db4e12b3c6894bda71f7bb295fb149b59488051))
* add the structural re-scope reflection prompt (brief feature 4) ([e97df52](https://github.com/ichabodcole/anthill/commit/e97df52ffbed3a52e8836b2e687df230c9da5960))
* consolidate consumer footprint into .anthill/ (v2 layout) ([bd8d9f0](https://github.com/ichabodcole/anthill/commit/bd8d9f0b677a197c5dedfba3181659a142915618))
* instruct agents to shield living docs from the host formatter ([84dfb12](https://github.com/ichabodcole/anthill/commit/84dfb12ca9947f36b8221d8d6ea32bda22d9bc5c))
* **skills:** pair reactive feedback with a reflective pass ([765994f](https://github.com/ichabodcole/anthill/commit/765994fcc5b82709772972506bd5ce347bfb3a14))


### Bug Fixes

* **grounding:** detect real anchors; warn on dangling grounding paths ([dea05b1](https://github.com/ichabodcole/anthill/commit/dea05b1b402e74ea297b4d0dec495da7d7269f34))
* **status:** label the bounty board by title ([95dfe31](https://github.com/ichabodcole/anthill/commit/95dfe31819de7d152b07f44ee7482edefbe91290))
* **templates:** author living-doc templates one sentence per line (the belt) ([167c996](https://github.com/ichabodcole/anthill/commit/167c996eee92ac8d5be25f7ba335320d4277546b))
