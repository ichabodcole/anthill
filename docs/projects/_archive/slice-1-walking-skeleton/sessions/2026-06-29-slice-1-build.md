# Slice 1 build — session note (2026-06-29)

The walking-skeleton build of anthill (the portable team-OS plugin). Ten tasks T1–T10, built
task-by-task over the grapevine + bounty, lead = maestro, implementer = forager. This is the
**finalize synthesis** for the build session — anthill isn't bootstrapped onto itself yet, so the
durable lessons land here instead of a seat doc. Ref: `docs/specs/2026-06-28-anthill-portable-team-os-design.md`,
`docs/plan-slice-1.md`.

## What shipped

| Task | Deliverable                                                              |
| ---- | ------------------------------------------------------------------------ |
| T1   | CLI shell seeded (`scripts/anthill/`, citty, dual-audience output)       |
| T2   | Plugin + marketplace manifests (`.claude-plugin/`)                       |
| T3   | Config layer — `config.ts`, `.team/config.json` root marker              |
| T4   | Coordination facade — `coord.ts` (spellbook grapevine/bounty resolution) |
| T5   | tmux helper — `tmux.ts` (lifted ~as-is from flute)                       |
| T6   | The 8 team commands (convene/join/spawn/attach/down/status/commit/init)  |
| T7   | Scaffold templates (`templates/docs-team/`) + layered-app archetype      |
| T8   | Lifecycle skills (`anthill:convene/join/finalize-session`)               |
| T9   | `anthill:bootstrap` meta-skill                                           |
| T10a | Mechanism proof — full loop end-to-end in a throwaway repo               |

Verification posture: 76 unit tests (Bun), strict typecheck clean, and an end-to-end mechanism proof
(bootstrap → convene → spawn → card lifecycle → down) outside dream-flute. T10b (live claude
boot+join, needs anthill installed as a plugin) is the remaining real-install milestone.

## Durable lessons (the synthesis)

1. **A portable CLI must not do eager root-discovery that throws at import.** The seed's `paths.ts`
   computed `PROJECT_ROOT = findProjectRoot()` at module load and _threw_ when no host `package.json`
   named `anthill` was found above cwd. Because `cli.ts` pulls `paths.ts` in transitively (via the
   `info` command), this crashed the **entire CLI at startup in any consuming repo** — the precise
   opposite of the portability goal. Fix: fall back to cwd, never throw at import. The lesson: a tool
   that runs from a plugin cache in arbitrary repos can't assume its own package context; resolve
   lazily and non-fatally, and key the real logic off an explicit marker (`.team/config.json`), not the
   ambient package name. (`c051d58`; this is also a `seed-project-cli` paper-cut.)

2. **A fresh-context cold-read catches executability gaps that self-review can't.** A blank-slate agent
   read of the three lifecycle skills surfaced 7 real gaps — `spellbook:bounty` named but never shown,
   no cross-pane "everyone synthesize now" broadcast before gating teardown, a subagent-can't-hold-a-tail
   contradiction between two skills — all of which passed my own review. For **agent-facing prose**
   (skills, SOPs), a fresh-context executability pass is worth the round-trip; the writer can't see
   their own assumed context. (`902170b`, `b1bfd16`)

3. **Brain/hands split: the skill composes, the CLI renders (design D5).** `anthill init` is a dumb,
   idempotent template renderer (a pure `renderTemplates` + a documented token scheme); the smart
   judgment — discovery, ratification, writing `.team/config.json` — lives in the `anthill:bootstrap`
   _skill_. Keeping the deciding out of the CLI made the renderer trivially testable and re-runnable
   (skip-existing, never clobber). The lesson: separate the judgment from the mechanism; the agent is
   the smart templating engine, the CLI is the deterministic hand.

4. **Prove a side-effecting seam without triggering the side effect.** `spawn` fires
   `claude "/anthill:join {handle}"` into tmux panes. Proving it for real would boot 4 live claude
   instances that — anthill not being installed — couldn't resolve the skill anyway. Instead: a
   deterministic check that the default launch _substitutes_ to the exact per-handle line, plus a
   sentinel-echo launch whose firing is confirmed by `capturePane`. Every spawn seam (create / label /
   send-keys / substitute) proven cheaply; the live boot deferred to the real-install milestone. The
   lesson: substitute a safe sentinel and check the substitution separately — don't pay the real
   side-effect to prove the wiring.

5. **The dual-audience envelope is the contract — every exit routes through it.** `commit`'s guards
   originally `throw`'d (faithful to the flute source), which in `--format json` leaked a Bun stack
   trace and regressed the stable `{ok,data,meta}` / `{ok:false,error}` envelope the CLI sells. Switched
   to `emitError` + `exit(1)`. The lesson: when a tool's value _is_ a stable machine envelope, fidelity
   to the source loses to the contract — route every error path through the envelope. (`b42cf7c`)

6. **Push decisions into pure functions; keep IO at the edge.** Every testable unit got a pure core
   with an IO wrapper: `resolveConfig` / `loadConfig`, `selectCoordCli` / `resolveCoordCli`,
   `renderTemplates` / `init`, `planGitignore`. The logic unit-tests against fixtures with zero
   filesystem; the wrapper just wires `existsSync`/`readFileSync` in. This is why 76 tests run in ~65ms
   with no temp-dir scaffolding for the pure paths.

## Working model (what worked)

Task-by-task with a hard review gate — each task: move card to Doing → build keeping checks green →
file-scoped commit → move to Review → report on the vine → wait for the lead's ack before the next.
Flagging generalization forks early (the T2 no-skills-field finding, the paths.ts portability catch,
the spawn-proof scoping) let the lead redirect before work compounded. The cold-read loop on T8 is the
clearest proof the methodology earns its keep.
