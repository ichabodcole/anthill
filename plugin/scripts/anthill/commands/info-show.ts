import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineCommand } from "../define.ts";
import { PROJECT_PACKAGE_NAME, PROJECT_ROOT } from "../paths.ts";
import { nowMillis } from "../runtime.ts";

interface InfoShowData {
  cli: { name: string; version: string };
  runtime: { name: "bun" | "node"; version: string };
  projectRoot: string;
  projectPackageName: string;
}

export const infoShowCommand = defineCommand({
  meta: {
    name: "show",
    description: "Show resolved paths, runtime, and project info",
  },
  args: {
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    try {
      const pkgRaw = readFileSync(resolve(PROJECT_ROOT, "package.json"), "utf8");
      const pkg = JSON.parse(pkgRaw) as { name?: string };

      const hasBun = typeof (globalThis as { Bun?: { version: string } }).Bun !== "undefined";
      const runtimeName: "bun" | "node" = hasBun ? "bun" : "node";
      const runtimeVersion = hasBun
        ? (globalThis as { Bun: { version: string } }).Bun.version
        : process.versions.node;

      const data: InfoShowData = {
        cli: { name: "anthill", version: "0.1.0" },
        runtime: { name: runtimeName, version: runtimeVersion },
        projectRoot: PROJECT_ROOT,
        projectPackageName: pkg.name ?? PROJECT_PACKAGE_NAME,
      };

      emit({
        format,
        command: "info show",
        data,
        renderText: (d) =>
          [
            `${d.cli.name} v${d.cli.version}`,
            `Runtime:  ${d.runtime.name} ${d.runtime.version}`,
            `Project:  ${d.projectPackageName}`,
            `Root:     ${d.projectRoot}`,
          ].join("\n"),
        startedAt: started,
      });
    } catch (err) {
      emitError({
        format,
        command: "info show",
        error: err instanceof Error ? err.message : "unknown error",
      });
      process.exit(1);
    }
  },
});
