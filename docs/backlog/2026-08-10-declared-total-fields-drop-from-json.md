# Declared-total fields vanish from the JSON envelope when `undefined`

**Added:** 2026-08-10 · **Status:** Open · **Shape:** repo-wide idiom sweep + a guard
**Surface:** `commands/team-team.ts` (`ShowData.forkedFrom`, `TeamRow.lead`/`forkedFrom`/`forkedAt`, `UseData.previous`) and any peer

Typed `string | undefined`, and `JSON.stringify` drops an `undefined` value entirely. This codebase
argues at length (`agent-layer.ts:25-33`, `team-commit.ts`'s `uncheckedAgainst`) that **a
sometimes-absent field is unreadable** — a consumer cannot tell "inapplicable" from "unpopulated" from
"an older binary that never emitted it". Use `?? null`.

**Do it as one sweep with a guard**, not field by field: the value is the invariant, and a rule
enforced nowhere regrows. Worth deciding whether the guard is a test over emitted envelopes or a
lint — that choice is the only judgement here.
