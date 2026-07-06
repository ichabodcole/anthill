# forager's lane — the `anthill feedback` command + composers + receiving infra

**Owner:** forager (hands / CLI + engine) ·
**Defines:** the `anthill feedback` invocation contract
([seams.md Contract 2](../../../../.anthill/dev/seams.md)) — this lane is its implementation.

This lane builds the **command half** of `anthill feedback`: the pure composers, the command that
wires them, the injectable `gh()` submit seam, the tests, and the repo-side GitHub infra the
`--submit` path files into.
All code lives under `plugin/scripts/anthill/`; the GitHub infra lives at the repo root (not shipped).

## Files I touch (the file-level HOW)

1. **`plugin/scripts/anthill/feedback.ts`** — new pure module, sibling to `scan.ts`.
   Four exported pure functions (env injected as params, never read from globals inside):
   `feedbackTitle(category, message)`, `composeFeedbackBody(params)`, `buildIssueUrl(repo, title,
body, label)`, `interpretGhResult({status, stdout, stderr})`.
   Plus the shared constants `FEEDBACK_REPO = "ichabodcole/anthill"` and `FEEDBACK_LABEL =
"anthill-feedback"` and the `FEEDBACK_CATEGORIES` enum tuple.
   No `node:*` imports — this file is the golden-test target and must stay side-effect-free.

2. **`plugin/scripts/anthill/feedback.test.ts`** — golden tests for the four composers.
   Title collapse + ≤72c truncation; body carries message + non-sensitive env and NEVER a repo path;
   URL round-trips through `encodeURIComponent`; `interpretGhResult` success parses the created URL,
   failure (non-zero / null status / URL-less stdout) returns `issueUrl: null` + a manual-route
   warning.

3. **`plugin/scripts/anthill/commands/team-feedback.ts`** — the command via `defineAnthillCommand`.
   Args: `--category` (default `friction`, enum `bug|friction|idea|docs`), `--skill` (free-form),
   `--submit` (boolean), `--format`; positional `<message>` read from `ctx.args._` (joined, trimmed).
   Guards mirror `team-commit.ts`: empty message and unknown `--category` both `emitError` + exit 1
   (clean `{ok:false}` envelope, never a thrown stack).
   Exposes an injectable **`buildFeedback(input, deps)`** (deps = `{ gh, env }`) so the command test
   stubs `gh()` with no network; `run()` supplies the real env (`main.meta.version`, `os.platform`,
   `os.release`, `Bun.version`) and the real `gh()` seam.
   Default (no `--submit`) emits `{title, body, repo, issueUrl(prefilled), submitCmd}` and sends
   nothing; `--submit` routes `gh issue create … --label anthill-feedback` through `interpretGhResult`
   — success → `{title, body, issueUrl:<created>}`; ANY failure → `{title, body,
issueUrl:<prefilled>, warnings:[…]}` at **exit 0**, never throws, never drops.
   `submitCmd` is the self-re-invocation `anthill feedback "<msg>" --category <cat> [--skill …]
--submit` (via `JSON.stringify` on the message/skill), NOT raw `gh`.

4. **Version source = `main.meta.version`.**
   The command reads it by importing `{ main }` from `cli.ts`.
   To make that safe I wrap `cli.ts`'s top-level execution in `if (import.meta.main) { … }` and
   `export const main` — so importing `cli.ts` as a dependency (from the command / a test) does NOT
   run the CLI.
   The import is circular (cli → command → cli) but access to `main.meta.version` is deferred to
   `run()` (well after both modules finish evaluating), so the ESM live binding is populated by then.

5. **`plugin/scripts/anthill/commands/team-feedback.test.ts`** — the command test.
   Subprocess guard tests (empty message, unknown category → clean `{ok:false}` envelope, exit 1),
   mirroring `team-commit.test.ts`.
   Plus `buildFeedback` branch tests with a stubbed `gh()`: default composes + sends nothing; submit
   success returns the created URL; submit failure returns the prefilled URL + a warning at exit 0.
   No real issues, no network.

6. **`.github/ISSUE_TEMPLATE/anthill-feedback.md`** — repo-root GitHub infra (NOT under `plugin/`).
   A markdown issue template inviting all four categories (what / why + which category), generatively
   framed so ideas are as welcome as bugs, matching the `--submit` body shape.

7. **`cli.ts` registration** — add `feedback: teamFeedbackCommand` to `subCommands` (+ the import).

## The `--help` / `meta.description` sentence (command-facing framing home)

One generative-first sentence, per the two-disjoint-homes ruling (command-facing here; team-routing is
weaver's SOP):

> Send an idea, rough edge, or bug about anthill itself upstream to the anthill project (not your
> team) — on a team the lead submits; see your team SOP.

## One-time repo setup (document, don't run)

The `--submit --label anthill-feedback` needs the label to exist on the repo:

```
gh label create anthill-feedback --description "Filed via anthill feedback"
```

This is a **setup nicety, not a blocker**: an unknown label is just another `gh` failure, and the
command degrades through the same no-loss catch (prefilled URL + body + warning, exit 0).
I do NOT run this — it's an outward `gh` mutation; the maintainer runs it once.

## Boundaries with other seats

- **weaver** consumes this contract (the touchpoint prose points at the `--help` framing); I own the
  command-facing sentence, weaver owns the team-routing SOP. I never put team-routing in `--help`.
- **sentinel** verifies behavior (compose sends nothing; `--submit` files with the provenance label;
  a `gh` failure loses nothing) + a privacy read of the composed body.
- **maestro** lands my paths; I do not commit.

## Verification (my slice)

- `bun run check` green (tsc + biome + `bun test`).
- Privacy: the composed body contains only the message + non-sensitive env — no repo name/paths/code
  (pinned by a `feedback.test.ts` assertion).
- No-loss: the stubbed-`gh` failure branch returns the body + prefilled `issueUrl` + warning at exit 0.
