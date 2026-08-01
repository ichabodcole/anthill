# Local beta channel — serving `comms` to a real session

**Why this exists:** `comms` lives only on `feat/team-comms-slice-one`. Seats spawned by
`anthill spawn` run `claude "/anthill:join <handle>"`, which resolves the **installed** plugin — and
no released version (1.5.0 → 1.7.1) has the `comms` command, the `comms` block in `join`, or the
`anthill:comms` skill. Without this channel the dual-wired session cannot run: seats would coordinate
entirely on the grapevine and the run would report "the vine carried the substance", which
[the session scope](../session-2-scope.md) defines as the session **not having tested comms**.

This is a **release channel** in the documented sense — two marketplaces, same plugin `name`, serving
different versions. Keeping the plugin named `anthill` is deliberate: every `anthill:convene` /
`anthill:comms` cross-reference and the `config.launch` line keep working untouched.

## ⚠ The marketplace directory lives OUTSIDE this repo

Canonical location: **`~/.claude/anthill-beta-channel/`**. The `marketplace.json` beside this README
is the **template** it was made from, kept here so the setup is reviewable and repeatable — it is not
the one in use.

**It has to live outside, and this was learned the hard way:**

- A plugin `source` must be a **relative path that stays inside the marketplace root**. Escaping with
  `../` is rejected, and so is an **absolute** path — both fail with
  `This plugin uses a source type your Claude Code version does not support`. So serving a tree that
  lives elsewhere requires a **symlink inside the marketplace directory**.
- Put that marketplace directory in the repo and the symlink becomes a **second path to all of
  `plugin/`**. Every tool that walks the repo then sees a duplicate: `bun test` went **22 files → 44**,
  and `prettier --file-info` reported the duplicated copy as **not ignored** — so the same file
  answered differently depending on which path you asked about, which would quietly break the cascade
  check's own template-protection probe. Scoping the test script does **not** fix it (`bun test plugin`
  is a substring filter and matches `…/beta-channel/plugin/…` too).

Outside the repo, the symlink is invisible to `bun test`, `biome`, `prettier`, and `git`.

### ⚠ Correction: the install is NOT a self-contained copy

An earlier commit message on this branch says it is. **It is not.** There is a populated cache dir at
`~/.claude/plugins/cache/anthill-beta/anthill/<version>/`, but the loader **re-resolves the source
path at load time** — delete the symlink and the plugin fails with
`Plugin directory not found at path: …`, while still listing as installed. **The symlink must
persist for as long as the channel is in use.**

The upside of the same fact: because it resolves the live tree, edits to `plugin/` are picked up
without reinstalling. Only the _manifest_ is cached, so a `plugin.json` version change still needs a
`marketplace update`.

## ⚠ `plugin/.claude-plugin/plugin.json` version is hand-edited

Set to **`1.8.0-beta.1`**; the released channel is `1.7.1`.

**Required, not cosmetic.** Claude Code resolves a plugin's version from `plugin.json` **before** the
commit SHA, and per the marketplace docs:

> Each channel must resolve to a different version. […] If two refs resolve to the same version
> string, Claude Code treats them as identical and skips the update.

Left at `1.7.1`, installing the beta would silently serve **the stable plugin under a beta label** —
no `comms`, and no error saying so. A `sha` pin does not rescue it.

**But `plugin.json` is release-please-owned** (it is in `release-please-config.json`'s `extra-files`),
and `.claude/skills/cascade-check` says plainly: _DO NOT bump versions — verify instead._ So:

> **Before this branch merges, reset the version to whatever `main` carries and let release-please own
> it again.** If a release PR ever looks wrong on this branch, check this first.

## Setup

```sh
D=~/.claude/anthill-beta-channel
mkdir -p "$D/.claude-plugin"
cp docs/projects/team-comms-spike/beta-channel/.claude-plugin/marketplace.json "$D/.claude-plugin/"
ln -sfn "$PWD/plugin" "$D/plugin"          # must persist — the loader re-resolves it

claude plugin marketplace add "$D" --scope local
claude plugin install anthill@anthill-beta --scope local
claude plugin disable anthill@anthill-marketplace --scope local
```

**`--scope local` is the whole point.** It writes to `.claude/settings.local.json`, which is
**gitignored** — so none of this touches your user-global config or any other project. Resulting
state:

```json
"enabledPlugins": { "anthill@anthill-beta": true, "anthill@anthill-marketplace": false }
```

Disabling the stable one is not optional: the docs assign channels to _different_ user groups, so
both enabled at once is unsupported and `anthill:*` would be ambiguous.

**Then restart the session.** Plugins load at startup; installing mid-session leaves you on the old
set with no indication. Verify with `claude plugin list` — the beta must read `✔ enabled`, not
`✘ failed to load`.

## Picking up changes to `plugin/`

Skills and scripts resolve live through the symlink, so most edits need nothing. Only a
`plugin.json` change needs:

```sh
# bump plugin.json's version FIRST — same-version installs are skipped, silently
claude plugin marketplace update anthill-beta
claude plugin install anthill@anthill-beta --scope local
```

## Teardown

```sh
claude plugin enable anthill@anthill-marketplace --scope local
claude plugin uninstall anthill@anthill-beta          # NOTE: uninstall takes no --scope
claude plugin marketplace remove anthill-beta --scope local
rm -rf ~/.claude/anthill-beta-channel
```

(`marketplace remove` does take `--scope`; omitting it removes the declaration from **every** scope.)

Then reset `plugin/.claude-plugin/plugin.json`'s version (see above).
