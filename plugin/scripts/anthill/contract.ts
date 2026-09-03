/**
 * The hand-declared half of the interface contract — the facts no framework
 * models and no generator can walk (STANDARD.md Part 1 §2: "declare those by
 * hand, adjacent to the code that implements them, with a test that fails when
 * a new command has no entry"). CONTRACT.md is the prose; this is the table.
 *
 * `contract.test.ts` holds this table to the manifest in both directions: a
 * command with no entry fails, and so does an entry for a command that no
 * longer exists. Adding a subcommand is exactly the moment a declaration goes
 * stale and exactly the moment nobody is thinking about it.
 */

/**
 * What a command's stdout IS, in machine mode.
 *
 *   data    exactly one JSON envelope, then exit. `cardinality` says how many
 *           records the envelope's `data` holds: one (`single`), a small closed
 *           or caller-bounded set (`bounded`), or an open-ended collection
 *           (`unbounded` — which is the only case that owes pagination, named
 *           in `pagination` as the flags that bound it).
 *   stream  one JSON envelope PER LINE, flushed as each arrives, and the
 *           process does not exit on its own. A caller that reads this as one
 *           document reads forever.
 *   none    a GROUP node — it holds subcommands and produces no output of its
 *           own; invoking it is a usage error that names them.
 */
export type OutputKind =
  | { kind: "data"; cardinality: "single" | "bounded" }
  | { kind: "data"; cardinality: "unbounded"; pagination: string[] }
  | { kind: "stream"; format: "ndjson-envelopes" }
  | { kind: "none" };

/** Keyed by the space-joined command path; `""` is the root. */
export const OUTPUT_KIND: Record<string, OutputKind> = {
  "": { kind: "data", cardinality: "single" }, // bare `anthill` — the manifest
  help: { kind: "data", cardinality: "single" },
  info: { kind: "none" },
  "info env": { kind: "data", cardinality: "single" },
  "info show": { kind: "data", cardinality: "single" },
  convene: { kind: "data", cardinality: "single" },
  join: { kind: "data", cardinality: "single" },
  comms: { kind: "none" },
  "comms send": { kind: "data", cardinality: "single" },
  "comms read": {
    kind: "data",
    cardinality: "unbounded",
    // The whole channel log without them. `--last` bounds by count, `--since`
    // by anchor id, `--id` selects one; combining them is refused.
    pagination: ["--last", "--since", "--id"],
  },
  "comms follow": { kind: "stream", format: "ndjson-envelopes" },
  "comms positions": { kind: "data", cardinality: "bounded" }, // one per seat
  "comms stand-down": { kind: "data", cardinality: "single" },
  spawn: { kind: "data", cardinality: "single" },
  attach: { kind: "data", cardinality: "single" },
  down: { kind: "data", cardinality: "single" },
  status: { kind: "data", cardinality: "single" },
  team: { kind: "none" },
  "team ls": { kind: "data", cardinality: "bounded" }, // one per configured team
  "team show": { kind: "data", cardinality: "single" },
  "team use": { kind: "data", cardinality: "single" },
  scan: { kind: "data", cardinality: "single" },
  commit: { kind: "data", cardinality: "single" },
  feedback: { kind: "data", cardinality: "single" },
  "field-notes": { kind: "data", cardinality: "single" },
  init: { kind: "data", cardinality: "single" },
  migrate: { kind: "data", cardinality: "single" },
};
