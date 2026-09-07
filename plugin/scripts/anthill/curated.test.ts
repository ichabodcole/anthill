/**
 * The curated set, as data — which paths `anthill commit` refuses without
 * `--curated`. Pure: a resolved config in, entries and hits out.
 */
import { describe, expect, test } from "bun:test";
import { resolveConfig } from "./config.ts";
import { curatedEntries, curatedHits } from "./curated.ts";

const config = resolveConfig(
  {
    version: 2,
    channel: "t",
    lead: "maestro",
    seats: [
      { handle: "maestro", role: "lead", scope: "x", spawn: false },
      { handle: "forager", role: "hands", scope: "y", spawn: true },
    ],
  },
  { projectRoot: "/proj" },
);

describe("curatedEntries — every durable team doc, from the resolved paths", () => {
  test("one seat doc per seat, seams, principles, and the wiki as a directory", () => {
    expect(curatedEntries(config)).toEqual([
      { rel: ".anthill/dev/maestro.md", kind: "file", what: "seat doc (maestro)" },
      { rel: ".anthill/dev/forager.md", kind: "file", what: "seat doc (forager)" },
      { rel: ".anthill/dev/seams.md", kind: "file", what: "seams" },
      { rel: ".anthill/principles.md", kind: "file", what: "principles" },
      { rel: ".anthill/wiki", kind: "dir", what: "the team wiki" },
    ]);
  });

  test("follows the path knobs — a relocated team relocates its curated set", () => {
    const moved = resolveConfig(
      {
        version: 2,
        channel: "t",
        seats: [{ handle: "loom", role: "r", scope: "s", spawn: true }],
        paths: { teamDir: "docs/team", seams: "docs/team/interfaces.md" },
      },
      { projectRoot: "/proj" },
    );
    expect(curatedEntries(moved).map((e) => e.rel)).toEqual([
      "docs/team/dev/loom.md",
      "docs/team/interfaces.md",
      "docs/team/principles.md",
      "docs/team/wiki",
    ]);
  });
});

describe("curatedHits — which of the caller's paths are curated", () => {
  const entries = curatedEntries(config);

  test("a seat doc, by relative, ./-prefixed, or absolute path", () => {
    for (const p of [
      ".anthill/dev/forager.md",
      "./.anthill/dev/forager.md",
      "/proj/.anthill/dev/forager.md",
    ]) {
      expect(curatedHits([p], entries, "/proj"), p).toEqual([
        { path: p, what: "seat doc (forager)" },
      ]);
    }
  });

  test("the wiki matches the directory and anything below it; a sibling does not", () => {
    expect(curatedHits([".anthill/wiki/touchpoints/curate.md"], entries, "/proj")).toEqual([
      { path: ".anthill/wiki/touchpoints/curate.md", what: "the team wiki" },
    ]);
    expect(curatedHits([".anthill/wiki"], entries, "/proj")).toHaveLength(1);
    // A prefix match on the STRING would catch this; the match is on the path.
    expect(curatedHits([".anthill/wikipedia.md"], entries, "/proj")).toEqual([]);
  });

  test("a path relative to a subdirectory cwd resolves against the repo root", () => {
    expect(curatedHits(["../dev/seams.md"], entries, "/proj", "/proj/.anthill/wiki")).toEqual([
      { path: "../dev/seams.md", what: "seams" },
    ]);
  });

  test("POSITIVE CONTROL for the negative: reports, scratch, the SOP and product code are not curated", () => {
    expect(
      curatedHits(
        [
          ".anthill/reports/2026-09-03/forager.md",
          ".anthill/scratch/forager/x.md",
          ".anthill/README.md",
          "src/a.ts",
        ],
        entries,
        "/proj",
      ),
    ).toEqual([]);
  });
});
