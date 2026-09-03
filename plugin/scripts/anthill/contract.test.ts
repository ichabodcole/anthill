import { describe, expect, test } from "bun:test";
import { main } from "./cli.ts";
import { OUTPUT_KIND } from "./contract.ts";
import { buildManifest, type ManifestCommand } from "./manifest.ts";

/**
 * The hand-declared table and the walked manifest, held to each other. This is
 * the standard's "test that fails when a new command has no entry" — the one
 * thing that keeps a hand-written declaration from going stale the day a verb
 * is added. Both directions: a verb with no entry, and an entry with no verb.
 */
describe("contract.ts — every command path has an output kind, and no entry outlives its command", () => {
  test("OUTPUT_KIND keys == manifest paths (root included)", async () => {
    const manifest = await buildManifest(main);
    const paths = new Set<string>([""]);
    const walk = (cmds: ManifestCommand[]) => {
      for (const c of cmds) {
        paths.add(c.path.join(" "));
        walk(c.subcommands);
      }
    };
    walk(manifest.commands);
    const declared = new Set(Object.keys(OUTPUT_KIND));
    const missing = [...paths].filter((p) => !declared.has(p)).sort();
    const stale = [...declared].filter((p) => !paths.has(p)).sort();
    expect(missing, "commands with no output-kind entry — add one to contract.ts").toEqual([]);
    expect(stale, "output-kind entries for commands that no longer exist").toEqual([]);
  });

  test("a group node is `none` and everything with a run body is not", async () => {
    const manifest = await buildManifest(main);
    const groups = manifest.commands
      .filter((c) => c.subcommands.length > 0)
      .map((c) => c.path.join(" "));
    for (const g of groups) expect(OUTPUT_KIND[g]?.kind, g).toBe("none");
    for (const [path, k] of Object.entries(OUTPUT_KIND)) {
      if (k.kind === "none") expect(groups, `${path} is declared a group`).toContain(path);
    }
  });
});
