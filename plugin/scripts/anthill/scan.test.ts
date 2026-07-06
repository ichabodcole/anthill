import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  buildScanReport,
  classifyUnit,
  detectManager,
  internalDepsOf,
  type Manifest,
  parsePnpmPackages,
  parseWorkspaceGlobs,
  resolveScanRoot,
  type ScanReport,
  sniffStack,
} from "./scan.ts";

const FIXTURES = resolve(import.meta.dir, "__fixtures__");

// ---- Pure detectors --------------------------------------------------------

describe("sniffStack — dominant-first", () => {
  it("orders the meta-framework before its base lib", () => {
    expect(sniffStack({ dependencies: { react: "18", next: "14" } })).toEqual(["next", "react"]);
    expect(sniffStack({ dependencies: { vue: "3", nuxt: "3" } })).toEqual(["nuxt", "vue"]);
  });

  it("orders expo > react-native > react for a native app", () => {
    expect(
      sniffStack({ dependencies: { react: "18", "react-native": "0.74", expo: "51" } }),
    ).toEqual(["expo", "react-native", "react"]);
  });

  it("detects meta-frameworks by their real package names", () => {
    expect(sniffStack({ dependencies: { "@sveltejs/kit": "2", svelte: "4" } })).toEqual([
      "sveltekit",
      "svelte",
    ]);
    expect(sniffStack({ dependencies: { "@nestjs/core": "10" } })).toEqual(["nest"]);
  });

  it("reads devDependencies and peerDependencies too", () => {
    expect(sniffStack({ devDependencies: { vue: "3" }, peerDependencies: { nuxt: "3" } })).toEqual([
      "nuxt",
      "vue",
    ]);
  });

  it("returns [] when no framework marker is present", () => {
    expect(sniffStack({ dependencies: { zod: "3", lodash: "4" } })).toEqual([]);
  });
});

describe("classifyUnit — hybrid hint", () => {
  it("uses glob position first", () => {
    expect(classifyUnit({}, "apps/web")).toBe("app");
    expect(classifyUnit({ private: false, dependencies: { next: "14" } }, "packages/ui")).toBe(
      "package",
    );
  });

  it("falls back to manifest signal when position is silent", () => {
    // private + framework ⇒ app
    expect(classifyUnit({ private: true, dependencies: { next: "14" } }, ".")).toBe("app");
    // publishable + no framework ⇒ package
    expect(classifyUnit({ private: false, dependencies: { zod: "3" } }, ".")).toBe("package");
    // ambiguous ⇒ package
    expect(classifyUnit({ private: true }, ".")).toBe("package");
  });
});

describe("internalDepsOf", () => {
  const members = ["web", "mobile", "@acme/shared"];
  it("returns deps ∩ member names, minus self, sorted", () => {
    const m: Manifest = {
      name: "web",
      dependencies: { "@acme/shared": "workspace:*", nuxt: "3", web: "self-ref-ignored" },
    };
    expect(internalDepsOf(m, members)).toEqual(["@acme/shared"]);
  });

  it("returns [] when nothing overlaps", () => {
    expect(internalDepsOf({ name: "mobile", dependencies: { expo: "51" } }, members)).toEqual([]);
  });
});

describe("parseWorkspaceGlobs", () => {
  it("reads the package.json array form", () => {
    expect(parseWorkspaceGlobs({ workspaces: ["apps/*", "packages/*"] })).toEqual([
      "apps/*",
      "packages/*",
    ]);
  });

  it("reads the { packages } object form", () => {
    expect(parseWorkspaceGlobs({ workspaces: { packages: ["libs/*"] } })).toEqual(["libs/*"]);
  });

  it("returns [] for a single-surface manifest", () => {
    expect(parseWorkspaceGlobs({ name: "solo" })).toEqual([]);
  });

  it("unions + dedupes pnpm globs and drops negations", () => {
    const yaml = "packages:\n  - 'apps/*'\n  - packages/*\n  - '!packages/excluded'\n";
    expect(parseWorkspaceGlobs({ workspaces: ["apps/*"] }, yaml)).toEqual(["apps/*", "packages/*"]);
  });
});

describe("parsePnpmPackages", () => {
  it("extracts the list under packages:, stripping quotes and comments", () => {
    const yaml = [
      "packages:",
      "  - 'apps/*'",
      '  - "packages/*"',
      "  - components/** # inline comment",
      "",
      "catalog:",
      "  react: ^18",
    ].join("\n");
    expect(parsePnpmPackages(yaml)).toEqual(["apps/*", "packages/*", "components/**"]);
  });
});

// ---- resolveScanRoot (over a real temp tree) -------------------------------

describe("resolveScanRoot", () => {
  it("prefers the nearest ancestor holding .git", () => {
    const root = mkdtempSync(join(tmpdir(), "scan-root-"));
    try {
      mkdirSync(join(root, ".git"));
      mkdirSync(join(root, "apps", "web"), { recursive: true });
      writeFileSync(join(root, "package.json"), "{}");
      writeFileSync(join(root, "apps", "web", "package.json"), "{}");
      expect(resolveScanRoot(join(root, "apps", "web"))).toBe(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("falls back to the topmost package.json when there's no .git", () => {
    const root = mkdtempSync(join(tmpdir(), "scan-nogit-"));
    try {
      mkdirSync(join(root, "pkg", "nested"), { recursive: true });
      writeFileSync(join(root, "pkg", "package.json"), "{}");
      writeFileSync(join(root, "pkg", "nested", "package.json"), "{}");
      // topmost package.json ancestor of nested is pkg/ (root itself has none).
      expect(resolveScanRoot(join(root, "pkg", "nested"))).toBe(join(root, "pkg"));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("detectManager", () => {
  it("reads the bun lockfile in the workspace fixture", () => {
    expect(detectManager(join(FIXTURES, "workspace-repo"))).toBe("bun");
  });
  it("returns null with no lockfile", () => {
    expect(detectManager(join(FIXTURES, "single-surface-repo"))).toBeNull();
  });
});

// ---- Golden ScanReport per fixture ----------------------------------------

describe("buildScanReport — golden", () => {
  it("workspace fixture: 2 apps both depend on the shared package (fan-in 2 — the contract-seat case)", () => {
    const root = join(FIXTURES, "workspace-repo");
    const report = buildScanReport(root);
    const expected: ScanReport = {
      root,
      workspace: { manager: "bun", globs: ["apps/*", "packages/*"] },
      units: [
        {
          name: "mobile",
          path: "apps/mobile",
          kind: "app",
          stack: ["expo", "react-native", "react"],
          private: true,
          internalDeps: ["@acme/shared"],
        },
        {
          name: "web",
          path: "apps/web",
          kind: "app",
          stack: ["nuxt", "vue"],
          private: true,
          internalDeps: ["@acme/shared"],
        },
        {
          name: "@acme/shared",
          path: "packages/shared",
          kind: "package",
          stack: [],
          private: false,
          internalDeps: [],
        },
      ],
    };
    expect(report).toEqual(expected);
  });

  it("single-surface fixture: workspace null + one root unit at path '.'", () => {
    const root = join(FIXTURES, "single-surface-repo");
    const report = buildScanReport(root);
    const expected: ScanReport = {
      root,
      workspace: null,
      units: [
        {
          name: "solo-app",
          path: ".",
          kind: "app",
          stack: ["next", "react"],
          private: true,
          internalDeps: [],
        },
      ],
    };
    expect(report).toEqual(expected);
  });
});
