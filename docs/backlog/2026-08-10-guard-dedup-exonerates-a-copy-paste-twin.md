# A verbatim copy-paste is exonerated by its twin — the dedup key still collides

**Added:** 2026-08-10 · **Status:** Open · **Shape:** one function, one control
**Surface:** `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts` (`occurrences()`)

`occurrences()` returns `[...new Set(out)]` (`:193`), keyed on the matched text plus a 28-character
alnum slug of the preceding context. **Two occurrences whose preceding 28 alnum characters are
identical collapse into one** — and a verbatim copy-paste of an allow-listed line reproduces the slug
exactly, so the copy inherits the original's exoneration.

The file's own comment at `:169-179` presents this as the repaired F1 defect. It was **narrowed, not
closed**: keying on context made collision harder, and copy-paste is precisely the case that defeats
it.

**Confirmed by mutation 2026-08-10.** Copying the allow-listed human-facing line at
`commands/team-comms.ts:857-859` into an exported (agent-reachable) string, preceding line intact:

```ts
export const leakedAgentString =
  "This tool cannot tell you what you have already seen, and is not going to guess.\n" +
  `Establish an anchor with: anthill comms read --channel x --last 20\n`;
```

→ **GREEN, 10 pass, 0 fail.** Control: the identical string with one different preceding line →
**RED**. So the exoneration is specifically the slug collision, not general blindness.

**No live collision today** — 14 raw occurrences produce 14 distinct keys against 14 entries. The
hazard is latent and copy-paste-shaped, which is the likeliest way a bare invocation actually
spreads: someone reuses a line that is already allow-listed, into a place where it is not allowed.

## Acceptance Criteria

- [ ] Two identical occurrences in different files (or at different sites) are counted separately
- [ ] A positive control injects a copy-paste twin of an allow-listed line and expects it reported
- [ ] The comment at `:169-179` says what the keying does and does not close

## References

- `plugin/scripts/anthill/commands/bare-anthill.guard.test.ts:169-193`
