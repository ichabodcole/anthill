import { describe, expect, it } from "bun:test";
import {
  BOUNTY_SESSION_GITIGNORE_LINE,
  planGitignore,
  renderTemplates,
  SCRATCH_GITIGNORE_LINE,
  type TemplateFile,
} from "./team-init.ts";

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
  {
    relPath: "dev/{{handle}}.md",
    content: "# {{handle}}\nRole: {{role}}\nScope: {{scope}}\nChannel: {{channel}}",
  },
  { relPath: "paper-cuts.md", content: "literal {{unknownToken}} survives" },
];

describe("renderTemplates", () => {
  it("substitutes global tokens in a non-per-seat template", () => {
    const { writes } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      exists: () => false,
    });
    const readme = writes.find((w) => w.relPath === "README.md");
    expect(readme).toBeDefined();
    expect(readme?.content).toContain("# myproj");
    expect(readme?.content).toContain("Lead: maestro");
    // rosterTable lists every seat.
    expect(readme?.content).toContain("| maestro | lead | orchestration |");
    expect(readme?.content).toContain("| loom | surface | UI components |");
  });

  it("fans a {{handle}} template out once per seat, substituting seat tokens", () => {
    const { writes } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      exists: () => false,
    });
    const paths = writes.map((w) => w.relPath).sort();
    expect(paths).toContain("dev/maestro.md");
    expect(paths).toContain("dev/loom.md");
    const loom = writes.find((w) => w.relPath === "dev/loom.md");
    expect(loom?.content).toBe("# loom\nRole: surface\nScope: UI components\nChannel: myproj");
  });

  it("leaves unknown tokens untouched", () => {
    const { writes } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      exists: () => false,
    });
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
    const { writes, skipped } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      exists: () => false,
    });
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

describe("planGitignore (idempotent ensure-line)", () => {
  const LINE = SCRATCH_GITIGNORE_LINE;

  it("adds the line to an empty / missing file", () => {
    expect(planGitignore(null, LINE)).toEqual({ action: "added", content: `${LINE}\n` });
    expect(planGitignore("", LINE)).toEqual({ action: "added", content: `${LINE}\n` });
  });

  it("appends with a separating newline when the file lacks a trailing one", () => {
    expect(planGitignore("node_modules", LINE)).toEqual({
      action: "added",
      content: `node_modules\n${LINE}\n`,
    });
  });

  it("appends without doubling the newline when one is already present", () => {
    expect(planGitignore("node_modules\n", LINE)).toEqual({
      action: "added",
      content: `node_modules\n${LINE}\n`,
    });
  });

  it("is a no-op when the line is already present (per-line, trimmed)", () => {
    const existing = `node_modules\n${LINE}\ndist\n`;
    expect(planGitignore(existing, LINE)).toEqual({ action: "present", content: existing });
    // trailing whitespace variant still counts as present (no dupe)
    expect(planGitignore(`${LINE}  \n`, LINE).action).toBe("present");
  });
});

describe("BOUNTY_SESSION_GITIGNORE_LINE (init also ignores the pinned board marker)", () => {
  const BOUNTY = BOUNTY_SESSION_GITIGNORE_LINE;

  it("is the repo-root `.bounty-session` marker (distinct from the scratch line)", () => {
    expect(BOUNTY).toBe(".bounty-session");
    expect(BOUNTY).not.toBe(SCRATCH_GITIGNORE_LINE);
  });

  it("adds the bounty line when absent", () => {
    expect(planGitignore(null, BOUNTY)).toEqual({ action: "added", content: `${BOUNTY}\n` });
  });

  it("is a no-op when already present, even under a comment (the real repo state)", () => {
    const existing = `.anthill/scratch/\n\n# anthill board-session pin (spellbook #69)\n${BOUNTY}\n`;
    expect(planGitignore(existing, BOUNTY)).toEqual({ action: "present", content: existing });
  });

  it("chains after the scratch line so a fresh file ends with BOTH lines present", () => {
    const afterScratch = planGitignore(null, SCRATCH_GITIGNORE_LINE);
    const afterBounty = planGitignore(afterScratch.content, BOUNTY);
    expect(afterScratch.action).toBe("added");
    expect(afterBounty.action).toBe("added");
    expect(afterBounty.content).toBe(`${SCRATCH_GITIGNORE_LINE}\n${BOUNTY}\n`);
    // idempotent: a second pass over the result adds nothing
    expect(planGitignore(afterBounty.content, SCRATCH_GITIGNORE_LINE).action).toBe("present");
    expect(planGitignore(afterBounty.content, BOUNTY).action).toBe("present");
  });
});
