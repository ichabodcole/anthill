import { afterAll, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  BOUNTY_SESSION_GITIGNORE_LINE,
  commsGitignoreLine,
  gitignoreLines,
  planGitignore,
  renderTemplates,
  scratchGitignoreLine,
  type TemplateFile,
  templateDestination,
} from "./team-init.ts";

/** What the lines resolve to for a default-`teamDir` project — today's literals. */
const SCRATCH_GITIGNORE_LINE = scratchGitignoreLine(".anthill");
const COMMS_GITIGNORE_LINE = commsGitignoreLine(".anthill");

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

/** Identity destinations: these cases are about token expansion, not placement. */
const AS_IS = (relPath: string): string => relPath;

describe("renderTemplates", () => {
  it("substitutes global tokens in a non-per-seat template", () => {
    const { writes } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      dest: AS_IS,
      exists: () => false,
    });
    const readme = writes.find((w) => w.path === "README.md");
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
      dest: AS_IS,
      exists: () => false,
    });
    const paths = writes.map((w) => w.path).sort();
    expect(paths).toContain("dev/maestro.md");
    expect(paths).toContain("dev/loom.md");
    const loom = writes.find((w) => w.path === "dev/loom.md");
    expect(loom?.content).toBe("# loom\nRole: surface\nScope: UI components\nChannel: myproj");
  });

  it("leaves unknown tokens untouched", () => {
    const { writes } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      dest: AS_IS,
      exists: () => false,
    });
    expect(writes.find((w) => w.path === "paper-cuts.md")?.content).toBe(
      "literal {{unknownToken}} survives",
    );
  });

  it("is idempotent — existing targets are skipped, never written", () => {
    const { writes, skipped } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      dest: AS_IS,
      exists: (path) => path === "dev/loom.md",
    });
    expect(skipped).toEqual(["dev/loom.md"]);
    expect(writes.map((w) => w.path)).not.toContain("dev/loom.md");
    // The other per-seat doc still renders.
    expect(writes.map((w) => w.path)).toContain("dev/maestro.md");
  });

  it("asks `exists` about the DESTINATION, never the template relPath", () => {
    // The scar this guards: the write site was remapped and the idempotency
    // predicate was not, so `init` probed a path where nothing lived any more,
    // found nothing, and overwrote a live seat doc holding that seat's
    // accumulated knowledge. One `dest` for both is what makes that unspellable.
    const asked: string[] = [];
    const { writes, skipped } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      dest: (relPath) => `/somewhere/${relPath}`,
      exists: (path) => {
        asked.push(path);
        return path === "/somewhere/dev/loom.md";
      },
    });
    expect(asked).toContain("/somewhere/dev/loom.md");
    expect(asked.some((p) => !p.startsWith("/somewhere/"))).toBe(false);
    expect(skipped).toEqual(["/somewhere/dev/loom.md"]);
    expect(writes.map((w) => w.path)).toContain("/somewhere/README.md");
  });

  it("total writes = globals + (per-seat × seats) when nothing exists", () => {
    const { writes, skipped } = renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      dest: AS_IS,
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
      dest: AS_IS,
      exists: () => false,
    });
    expect(writes[0]?.content).toBe("lead=[]");
  });
});

describe("templateDestination (the template tree's `dev/` is layout, not a path)", () => {
  const PATHS = {
    teamDir: "/proj/.anthill/teams/dev",
    seatDir: "/proj/.anthill/roles",
    seams: "/proj/.anthill/roles/interfaces.md",
  };

  it("puts team-level docs under teamDir", () => {
    for (const rel of ["README.md", "principles.md", "paper-cuts.md", "retro.md"]) {
      expect(templateDestination(rel, PATHS)).toBe(join(PATHS.teamDir, rel));
    }
  });

  it("puts everything under the template's dev/ into seatDir, dropping the segment", () => {
    expect(templateDestination("dev/loom.md", PATHS)).toBe("/proj/.anthill/roles/loom.md");
    expect(templateDestination("dev/README.md", PATHS)).toBe("/proj/.anthill/roles/README.md");
  });

  it("sends dev/seams.md to the seams resolver, which can be renamed", () => {
    expect(templateDestination("dev/seams.md", PATHS)).toBe("/proj/.anthill/roles/interfaces.md");
  });

  it("is byte-identical to the legacy join(teamDir, relPath) under the defaults", () => {
    // The back-compat guard: an all-defaults project must render file-for-file
    // where it rendered before, because that is where its docs already are.
    const defaults = {
      teamDir: "/proj/.anthill",
      seatDir: "/proj/.anthill/dev",
      seams: "/proj/.anthill/dev/seams.md",
    };
    for (const rel of [
      "README.md",
      "principles.md",
      "paper-cuts.md",
      "dev/README.md",
      "dev/seams.md",
      "dev/loom.md",
    ]) {
      expect(templateDestination(rel, defaults)).toBe(join(defaults.teamDir, rel));
    }
  });
});

describe("the bundled template set", () => {
  const bundled = join(
    new URL("../../../templates/docs-team", import.meta.url).pathname.replace(/\/$/, ""),
  );

  it("ships retro.md, the doc finalize-session tells the lead to write", () => {
    // It had no template, no resolver and no CLI reference — orphaned by
    // construction, at a path only skill prose named.
    expect(existsSync(join(bundled, "retro.md"))).toBe(true);
  });

  it("renders retro.md to teamDir, then skips it once the team has written in it", () => {
    const paths = {
      teamDir: "/proj/.anthill",
      seatDir: "/proj/.anthill/dev",
      seams: "/proj/.anthill/dev/seams.md",
    };
    const templates: TemplateFile[] = [
      { relPath: "retro.md", content: readFileSync(join(bundled, "retro.md"), "utf8") },
    ];
    const fresh = renderTemplates({
      templates,
      config: CONFIG,
      dest: (rel) => templateDestination(rel, paths),
      exists: () => false,
    });
    expect(fresh.writes.map((w) => w.path)).toEqual(["/proj/.anthill/retro.md"]);

    const again = renderTemplates({
      templates,
      config: CONFIG,
      dest: (rel) => templateDestination(rel, paths),
      exists: (p) => p === "/proj/.anthill/retro.md",
    });
    expect(again.writes).toHaveLength(0);
    expect(again.skipped).toEqual(["/proj/.anthill/retro.md"]);
  });
});

describe("init's render is idempotent against the real filesystem", () => {
  const root = mkdtempSync(join(tmpdir(), "anthill-init-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const paths = {
    teamDir: join(root, ".anthill/teams/dev"),
    seatDir: join(root, ".anthill/roles"),
    seams: join(root, ".anthill/roles/seams.md"),
  };
  const render = () =>
    renderTemplates({
      templates: TEMPLATES,
      config: CONFIG,
      dest: (relPath) => templateDestination(relPath, paths),
      exists: existsSync,
    });

  it("writes the seat docs where seatDir says, then SKIPS them on a second run", () => {
    const first = render();
    expect(first.skipped).toHaveLength(0);
    for (const w of first.writes) {
      mkdirSync(dirname(w.path), { recursive: true });
      writeFileSync(w.path, w.content);
    }
    expect(existsSync(join(root, ".anthill/roles/loom.md"))).toBe(true);

    // A seat's doc accumulates knowledge between sessions; a re-run must not
    // touch it. This is the assertion that would have caught the three-site bug.
    writeFileSync(join(root, ".anthill/roles/loom.md"), "hard-won knowledge");
    const second = render();
    expect(second.writes).toHaveLength(0);
    expect(second.skipped).toContain(join(root, ".anthill/roles/loom.md"));
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

describe("the ignore lines derive from teamDir (the paths they guard do)", () => {
  // Asserted on the EMITTED SET, never by grepping the source for `.anthill/`
  // literals: `migrate.ts` interpolates its dir constant, so a grep goes green
  // while the bug lives.
  it("reproduces today's literals for a default-teamDir project", () => {
    expect(gitignoreLines([".anthill"])).toEqual([
      ".anthill/scratch/",
      ".anthill/comms",
      ".bounty-session",
      ".anthill/current-team",
    ]);
  });

  it("moves both lines when teamDir moves — the bug: a tracked comms log", () => {
    // `commsLogPath()` resolves under teamDir and the seat scratch is
    // `<teamDir>/scratch/<handle>`, so a fixed literal here leaves every seat's
    // scratch and the whole message log as TRACKED files.
    expect(gitignoreLines([".anthill/teams/dev"])).toEqual([
      ".anthill/teams/dev/scratch/",
      ".anthill/teams/dev/comms",
      ".bounty-session",
      ".anthill/current-team",
    ]);
  });

  it("emits a pair per configured team — one team's line does not cover another's", () => {
    expect(gitignoreLines([".anthill/teams/dev", ".anthill/teams/dev-lean"])).toEqual([
      ".anthill/teams/dev/scratch/",
      ".anthill/teams/dev/comms",
      ".anthill/teams/dev-lean/scratch/",
      ".anthill/teams/dev-lean/comms",
      ".bounty-session",
      ".anthill/current-team",
    ]);
  });

  it("keeps the board marker at the repo root, undivided by team count", () => {
    // `.bounty-session` is one repo-root file, not a per-team artifact.
    const lines = gitignoreLines([".anthill/teams/a", ".anthill/teams/b"]);
    expect(lines.filter((l) => l === BOUNTY_SESSION_GITIGNORE_LINE)).toHaveLength(1);
  });

  it("tolerates a trailing slash in the authored teamDir", () => {
    expect(scratchGitignoreLine(".anthill/")).toBe(".anthill/scratch/");
    expect(commsGitignoreLine(".anthill/")).toBe(".anthill/comms");
  });

  it("keeps the slash on scratch and withholds it from comms, at any teamDir", () => {
    // Not cosmetic: the comms dir is a SYMLINK in a worktree-sharing team, and a
    // slash-suffixed rule matches directories only.
    expect(scratchGitignoreLine("docs/team").endsWith("/")).toBe(true);
    expect(commsGitignoreLine("docs/team").endsWith("/")).toBe(false);
  });
});

describe("COMMS_GITIGNORE_LINE (the message log is per-session local state)", () => {
  it("is a distinct line from the other two", () => {
    expect(COMMS_GITIGNORE_LINE).not.toBe(SCRATCH_GITIGNORE_LINE);
    expect(COMMS_GITIGNORE_LINE).not.toBe(BOUNTY_SESSION_GITIGNORE_LINE);
  });

  it("covers the comms dir, not just one channel's file", () => {
    // Channels are named per team; ignoring a single filename would leak every
    // other channel's log into the next `git add`.
    // No trailing slash: a slash-suffixed rule matches directories ONLY, so a
    // symlinked `.anthill/comms` (how a multi-worktree team shares one log)
    // stops being ignored and shows up untracked in every seat's tree.
    expect(COMMS_GITIGNORE_LINE).toBe(".anthill/comms");
    expect(COMMS_GITIGNORE_LINE.endsWith("/")).toBe(false);
  });

  it("is NOT covered by the scratch line — that is why it needs its own", () => {
    // `.anthill/scratch/` does not match `.anthill/comms/`; the log sat
    // committable because the two were assumed to be the same kind of thing.
    expect(COMMS_GITIGNORE_LINE.startsWith(SCRATCH_GITIGNORE_LINE)).toBe(false);
  });

  it("chains onto the other two idempotently", () => {
    const a = planGitignore(null, SCRATCH_GITIGNORE_LINE);
    const b = planGitignore(a.content, BOUNTY_SESSION_GITIGNORE_LINE);
    const c = planGitignore(b.content, COMMS_GITIGNORE_LINE);
    expect(c.action).toBe("added");
    expect(planGitignore(c.content, COMMS_GITIGNORE_LINE).action).toBe("present");
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
