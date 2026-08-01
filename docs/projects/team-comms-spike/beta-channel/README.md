# Local beta channel — serving `comms` to a real session

**Why this exists:** `comms` lives only on `feat/team-comms-slice-one`. Seats spawned by
`anthill spawn` run `claude "/anthill:join <handle>"`, which resolves the **installed** plugin — and
no released version (1.5.0 → 1.7.1) has the `comms` command, the `comms` block in `join`, or the
`anthill:comms` skill. Without this channel the dual-wired session cannot run: seats would coordinate
entirely on the grapevine and the run would report "the vine carried the substance", which
[the session scope](../session-2-scope.md) says means the session **did not test comms**.

This is a **release channel** in the documented sense — two marketplaces, same plugin `name`, serving
different versions. Keeping the plugin named `anthill` is deliberate: every `anthill:convene` /
`anthill:comms` cross-reference and the `config.launch` line keep working untouched.

## ⚠ Two things here are deliberate rule-breaks. Undo them.

### 1. `plugin/.claude-plugin/plugin.json` version is hand-edited

Set to **`1.8.0-beta.1`**; the released channel is `1.7.1`.

**This is required, not cosmetic.** Claude Code resolves a plugin's version from `plugin.json`
**before** the commit SHA, and per the marketplace docs:

> Each channel must resolve to a different version. […] If two refs resolve to the same version
> string, Claude Code treats them as identical and skips the update.

Left at `1.7.1`, installing the beta would silently serve **the stable plugin with a beta label** —
no `comms`, and no error saying so. A `sha` pin does not rescue it.

**But `plugin.json` is release-please-owned** (it is in `release-please-config.json`'s `extra-files`),
and `.claude/skills/cascade-check` says plainly: _DO NOT bump versions — verify instead._ So:

> **Before this branch merges, reset the version to whatever `main` carries and let release-please own
> it again.** If a release PR ever looks wrong on this branch, check this first.

### 2. `./plugin` is a symlink into the working tree

`plugin -> ../../../../plugin`. A relative source that **escapes** the marketplace root is rejected
(`This plugin uses a source type your Claude Code version does not support`), and the docs' own local
example keeps plugins inside the marketplace directory — so the symlink is how the path stays inside
while still serving the live tree.

## Setup (already done — recorded so it can be repeated)

```sh
claude plugin marketplace add ./docs/projects/team-comms-spike/beta-channel --scope local
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
both enabled at once is not a supported shape and `anthill:*` would be ambiguous.

## ⚠ The install is a COPY, not a live mount

Cached at `~/.claude/plugins/cache/anthill-beta/anthill/1.8.0-beta.1/`. **Edits to `plugin/` during a
session do not reach running seats.** To pick up changes:

```sh
# bump the beta version first — same-version installs are skipped, silently
claude plugin marketplace update anthill-beta
claude plugin install anthill@anthill-beta --scope local
```

Forgetting the bump is the failure this whole file exists to prevent: it looks like it worked.

## Teardown

```sh
claude plugin enable anthill@anthill-marketplace --scope local
claude plugin uninstall anthill@anthill-beta          # NOTE: uninstall takes no --scope
claude plugin marketplace remove anthill-beta --scope local
```

(`marketplace remove` does take `--scope`; omitting it removes the declaration from **every** scope.)

Then reset `plugin/.claude-plugin/plugin.json`'s version (see above) and delete this directory.
