import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { detectPlaceholder } from "./placeholder.ts";

describe("detectPlaceholder", () => {
  test("flags an unfilled template — the anthill#56 case", () => {
    const text = `# Project Manifesto

## What Is This?

[Elevator pitch — what this project is, in two sentences.]

## Who Is It For?

[The audience and the problem it solves for them.]

## Core Principles

- [Principle]
- [Principle]
- [Principle]

## What It Does

[Capability]
`;
    const v = detectPlaceholder(text);
    expect(v.isPlaceholder).toBe(true);
    expect(v.placeholderLines).toBeGreaterThanOrEqual(3);
  });

  test("does NOT flag a real doc that happens to use brackets", () => {
    const text = `# Design notes

The parser accepts an array literal like [1, 2, 3] and normalizes it.

We considered three options and picked the second, because it keeps the
hot path allocation-free and matches how the upstream library behaves.

See [the upstream docs](https://example.com/docs) for the full grammar.
`;
    expect(detectPlaceholder(text).isPlaceholder).toBe(false);
  });

  test("does NOT flag a link-heavy index (markdown links are content)", () => {
    const text = `# Index

- [Architecture](./architecture/README.md)
- [Projects](./projects/README.md)
- [Investigations](./investigations/README.md)
- [Backlog](./backlog/README.md)
- [Reports](./reports/README.md)
`;
    expect(detectPlaceholder(text).isPlaceholder).toBe(false);
  });

  test("ignores frontmatter, headings and HTML comments when counting", () => {
    const text = `---
docs_version: "5.0.0"
---

<!--
USAGE: copy this file and fill it in.
Delete this comment when done.
-->

# Title

Real content that says something specific about the system, at length,
with no scaffold whatsoever in it.
`;
    const v = detectPlaceholder(text);
    expect(v.isPlaceholder).toBe(false);
    // frontmatter + comment + heading excluded; only the two prose lines count
    expect(v.contentLines).toBe(2);
  });

  test("an empty or structure-only doc is not flagged (no content to judge)", () => {
    expect(detectPlaceholder("").isPlaceholder).toBe(false);
    expect(detectPlaceholder("# Title\n\n## Section\n").isPlaceholder).toBe(false);
  });

  test("is conservative — two scaffold lines amid real prose is not enough", () => {
    const text = `# Notes

[TODO: fill this in]
[TODO: and this]

The rest of this document is genuine prose describing the actual behavior
of the system, which is what a reader came here for, and it goes on for
several lines of real substance rather than scaffold.
`;
    expect(detectPlaceholder(text).isPlaceholder).toBe(false);
  });

  test("this repo's own filled PROJECT_MANIFESTO is NOT flagged", () => {
    // Regression guard: the doc that motivated the feature is now filled in,
    // and must read as real grounding.
    const p = join(import.meta.dir, "../../../docs/PROJECT_MANIFESTO.md");
    expect(detectPlaceholder(readFileSync(p, "utf8")).isPlaceholder).toBe(false);
  });

  test("this repo's UNFILLED specification template IS flagged", () => {
    const p = join(import.meta.dir, "../../../docs/specifications/TEMPLATE-domain.md");
    expect(detectPlaceholder(readFileSync(p, "utf8")).isPlaceholder).toBe(true);
  });
});
