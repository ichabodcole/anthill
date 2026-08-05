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

### ⚠ The install IS a copy — and the source symlink must ALSO persist

**Both halves are true, and I got this wrong twice before landing on it.** Verified three ways:

```sh
ls -ld ~/.claude/plugins/cache/anthill-beta/anthill/<version>   # a real directory, NOT a symlink
diff <cache>/scripts/anthill/commands/team-comms.ts plugin/scripts/anthill/commands/team-comms.ts
grep -c 'emit(' <cache>/…/team-comms.ts   vs   the same file in plugin/
```

- **The cache is a genuine copy, frozen at install time.** Edits to `plugin/` do **NOT** reach it.
  A running session will happily serve pre-fix code while the working tree is three commits ahead,
  and nothing says so — the two produce identically-plausible output.
- **The source symlink must still exist**, because the loader _validates the source path_ at load
  time even though it serves the copy. Delete it and the plugin fails with
  `Plugin directory not found at path: …` while still listing as installed.

> **Two earlier versions of this file asserted the opposite in each direction** — first "it's a
> self-contained copy, delete the symlink", then "it resolves the live tree, edits are picked up
> live." Each was inferred from a single failure mode rather than measured, and each was written as
> a confident correction of the last. **The measurement that settles it is `diff`, not a story about
> why something broke.**

**To pick up changes you must bump the version and reinstall** (see below) — there is no live path.

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

### ⚠ There is a DIVERGENT on-disk copy at exactly the pinned version (measured 2026-08-01, session 5)

    ~/.claude/plugins/cache/anthill-beta/anthill/1.8.0-beta.1/     a real directory, NOT a symlink

It differs from the working tree on **precisely this spike's surface** — `comms.ts`,
`commands/team-comms.ts`, `cli.ts`, `agent-layer.ts`, `define.ts`, `lock.ts`, and **6 of 6 shipped
`SKILL.md` files** (bootstrap, comms, convene, finalize-session, join, upgrade). Six further historical
copies sit alongside it (1.5.0 → 1.8.0) plus a marketplaces checkout — **nine independent copies of this
CLI on one machine, none of them symlinks.**

**Nothing resolved there during the session, and nothing prevents it either.** The hazard is the
coincidence: the stale copy is parked at the _same version string_ `plugin.json` is hand-pinned to, so
it is a plausible resolution target for exactly as long as the pin exists. **Reset the pin and the
coincidence goes away** — which is one more reason not to leave the teardown undone.

### ⚠ A long-running process is a snapshot of the code as of its own start

The symlink serving the working tree means an _installed_ skew is visible (`cmp` against the tree). **An
in-memory skew is not.** Every seat's `comms follow` was started at join; when the primitive landed
mid-session, all six kept executing pre-primitive code — **same file, same symlink, same everything a
path check measures, and the check was correct when it ran.** The tell was indirect: five seats began
recording positions after restarting and the sixth did not.

**`ps` cannot catch this** — the path is right and the bytes behind it moved. **After any land that
changes a wire, restart the wire**: note the head id, kill your own follower by PID (never by pattern —
`pkill -f "comms follow"` matches every seat on the machine and has taken down three at once), re-arm,
then `read --since <head>` to fill the gap.

## Setup

```sh
D=~/.claude/anthill-beta-channel
mkdir -p "$D/.claude-plugin"
cp docs/projects/_archive/team-comms-spike/beta-channel/.claude-plugin/marketplace.json "$D/.claude-plugin/"
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

**Every change needs a reinstall — nothing is live.** And the version must change first, or the
install is silently skipped:

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
