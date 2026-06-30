# Bootstrap note: lead handle vs external (agent-bridge) identity

**Added:** 2026-06-30 · **Status:** Done (`1e42f68`)

On media-buffet the lead's anthill handle (`arthur`) diverged from the project's
agent-bridge identity (`Gandalf`) — separate namespaces, harmless, but a fresh agent
could be briefly confused about "who am I / who's the lead." Add a short bootstrap/convene
note clarifying that an anthill seat handle and any external identity (agent-bridge, etc.)
are distinct namespaces and need not match.

## Acceptance Criteria

- [x] bootstrap or join prose clarifies that the seat handle and external identities are
      separate namespaces

**Resolution (`1e42f68`):** the `anthill:join` skill's "identify your handle" step now notes
that a seat handle and any external identity (agent-bridge name, runtime label) are separate
namespaces and need not match.

## References

- Related: [field report](../lessons-learned/2026-06-30-anthill-first-external-bootstrap.md)
