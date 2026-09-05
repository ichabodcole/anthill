# dev — the development team

The team that builds this project.
Each seat has a seat doc, `<handle>.md`, that states its role and what it owns.
Contracts between seats are in [`seams.md`](./seams.md), stated once.
What a seat learns goes in its session report under `../reports/`. `anthill:curate` decides what comes back.
The SOP is [`../README.md`](../README.md).

`anthill <command>` is shorthand. See the SOP for the real invocation.

## Roster

| Handle   | Role                          | Scope                                                                                                                                                                                 |
| -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| maestro  | lead                          | orchestration, the file-scoped atomic land, human liaison                                                                                                                             |
| forager  | hands (CLI/engine)            | plugin/scripts/anthill/ — the CLI commands, config/coord/tmux, the migration engine, the comms wire, and their tests                                                                  |
| weaver   | brain (skills/methodology)    | plugin/skills/ (the lifecycle skills and the methodology) and plugin/templates/ (scaffold and archetypes)                                                                              |
| sentinel | verify                        | cross-cutting verification: the quality gate (typecheck, biome, bun test), fresh-context cold reads, and real-repo validation                                                          |
| steward  | support (the lead's capacity) | errands the lead would otherwise stop to do: find out whether X is true, read this and return the decision, hold context. Verifies premises, never product code. Checks the lead too. |
| scout    | research (how the team works) | observes the session and reports on how the team behaves, grounded in the tree. Does not rule, assign, or correct mid-session. Reports to the lead and the human.                     |

## How work divides

- Each seat owns a slice. The lead orchestrates and lands cross-seat work.
- Boundaries between slices are the seams, single-sourced in [`seams.md`](./seams.md).
- A feature spanning slices is split into per-seat bounty cards. The seats coordinate on comms. The lead lands the assembled change atomically and file-scoped.
- The verify seat engages at verification points throughout the session, not only at the end.

The roster is a hypothesis.
A lead report's carry-forward can say the shape did not fit. Curation can split, merge, or re-scope a seat.
After a reshape, run `anthill init` to render any new seat docs. Existing docs are not overwritten.
`init` does not rewrite the roster table. Update the row by hand.
