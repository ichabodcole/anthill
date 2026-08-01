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

### 2. `./plugin` is a symlink into the working tree — **created for the install, then deleted**

A relative source that **escapes** the marketplace root is rejected outright
(`This plugin uses a source type your Claude Code version does not support`), and the docs' own local
example keeps plugins inside the marketplace directory. So the symlink is how the path stays inside
while still serving the live tree.

**It is gitignored and must not be left lying around.** It is a second path to the entire `plugin/`
tree, so every tool that walks the repo sees a duplicate: `bun test` went from **22 files to 44** the
moment it landed, and `prettier --file-info` reported the duplicated copy as **not ignored** — which
would break the cascade check's own template-protection probe, since the same file now answers
differently depending on which path you ask about. Scoping the test script does **not** fix it
(`bun test plugin` is a substring filter and matches `…/beta-channel/plugin/…` too).

The install is a **copy**, so the symlink is only needed while `install` runs. Setup creates it,
teardown removes it — see below. `.gitignore` and `.prettierignore` carry entries for it as a guard
for the window when it does exist.

## Setup (already done — recorded so it can be repeated)

Run from the repo root:

```sh
cd docs/projects/team-comms-spike/beta-channel && ln -sfn ../../../../plugin plugin && cd -
claude plugin marketplace add ./docs/projects/team-comms-spike/beta-channel --scope local
claude plugin install anthill@anthill-beta --scope local
claude plugin disable anthill@anthill-marketplace --scope local
rm docs/projects/team-comms-spike/beta-channel/plugin      # REQUIRED — see rule-break 2
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
# 1. bump plugin.json's version first — same-version installs are skipped, SILENTLY
# 2. recreate the symlink, install, then delete it again
cd docs/projects/team-comms-spike/beta-channel && ln -sfn ../../../../plugin plugin && cd -
claude plugin marketplace update anthill-beta
claude plugin install anthill@anthill-beta --scope local
rm docs/projects/team-comms-spike/beta-channel/plugin
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
