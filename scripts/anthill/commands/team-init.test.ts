import { describe, expect, it } from "bun:test";
import { renderTemplates, type TemplateFile } from "./team-init.ts";

const CONFIG = {
  channel: "myproj",
  lead: "maestro" as string | undefined,
  seats: [
    { handle: "maestro", role: "lead", scope: "orchestration" },
    { handle: "loom", role: "surface", scope: "UI components" },
  ],
};

const TEMPLATES: TemplateFile[] = [
  { relPath: "README.md", content: "# {{channel}}\nLead: {{lead}}\n\n{{rosterTable}}" },
  { relPath: "dev/{{handle}}.md", content: "# {{handle}}\nRole: {{role}}\nScope: {{scope}}\nChannel: {{channel}}" },
  { relPath: "paper-cuts.md", content: "literal {{unknownToken}} survives" },
];

describe("renderTemplates", () => {
  it("substitutes global tokens in a non-per-seat template", () => {
    const { writes } = renderTemplates({ templates: TEMPLATES, config: CONFIG, exists: () => false });
    const readme = writes.find((w) => w.relPath === "README.md");
    expect(readme).toBeDefined();
    expect(readme?.content).toContain("# myproj");
    expect(readme?.content).toContain("Lead: maestro");
    // rosterTable lists every seat.
    expect(readme?.content).toContain("| maestro | lead | orchestration |");
    expect(readme?.content).toContain("| loom | surface | UI components |");
  });

  it("fans a {{handle}} template out once per seat, substituting seat tokens", () => {
    const { writes } = renderTemplates({ templates: TEMPLATES, config: CONFIG, exists: () => false });
    const paths = writes.map((w) => w.relPath).sort();
    expect(paths).toContain("dev/maestro.md");
    expect(paths).toContain("dev/loom.md");
    const loom = writes.find((w) => w.relPath === "dev/loom.md");
    expect(loom?.content).toBe("# loom\nRole: surface\nScope: UI components\nChannel: myproj");
  });

  it("leaves unknown tokens untouched", () => {
    const { writes } = renderTemplates({ templates: TEMPLATES, config: CONFIG, exists: () => false });
    expect(writes.find((w) => w.relPath === "paper-cuts.md")?.content).toBe(
      "literal {{unknownToken}} survives",
    );
  });

  it("is idempotent — existing targets are skipped, never written", () => {
    const { writes, skipped } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      exists: (rel) => rel === "dev/loom.md",
    });
    expect(skipped).toEqual(["dev/loom.md"]);
    expect(writes.map((w) => w.relPath)).not.toContain("dev/loom.md");
    // The other per-seat doc still renders.
    expect(writes.map((w) => w.relPath)).toContain("dev/maestro.md");
  });

  it("total writes = globals + (per-seat × seats) when nothing exists", () => {
    const { writes, skipped } = renderTemplates({ templates: TEMPLATES, config: CONFIG, exists: () => false });
    // README + paper-cuts (2 global) + dev/<handle> × 2 seats = 4.
    expect(writes).toHaveLength(4);
    expect(skipped).toHaveLength(0);
  });

  it("handles an undefined lead (renders empty)", () => {
    const { writes } = renderTemplates({
      templates: [{ relPath: "x.md", content: "lead=[{{lead}}]" }],
      config: { ...CONFIG, lead: undefined },
      exists: () => false,
    });
    expect(writes[0]?.content).toBe("lead=[]");
  });
});
