import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";
import { emit, emitError, resolveFormat } from "../agent-layer.ts";
import { defineCommand } from "../define.ts";
import { parseEnvFile } from "../env-file.ts";
import { PROJECT_ROOT } from "../paths.ts";
import { nowMillis } from "../runtime.ts";

interface InfoEnvEntry {
  key: string;
  value: string | null; // null = present but redacted
}

interface InfoEnvData {
  envFile: string;
  exists: boolean;
  entries: InfoEnvEntry[];
}

export const infoEnvCommand = defineCommand({
  meta: {
    name: "env",
    description: "List keys in the project .env file (values redacted by default)",
  },
  args: {
    format: { type: "string", description: "Output format", valueHint: "text|json" },
    file: {
      type: "string",
      description: "Relative path to the .env file (from project root)",
      default: ".env",
    },
    "show-values": {
      type: "boolean",
      description: "Include raw values in output (default: redacted)",
      default: false,
    },
  },
  async run(ctx) {
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    const envFile = resolve(PROJECT_ROOT, ctx.args.file);
    const showValues = Boolean(ctx.args["show-values"]);

    try {
      const exists = existsSync(envFile);
      const entries: InfoEnvEntry[] = [];
      if (exists) {
        for (const [key, value] of Object.entries(parseEnvFile(envFile))) {
          entries.push({ key, value: showValues ? value : null });
        }
      }

      const data: InfoEnvData = {
        envFile: relative(PROJECT_ROOT, envFile),
        exists,
        entries,
      };

      emit({
        format,
        command: "info env",
        data,
        renderText: (d) => {
          if (!d.exists) return `No .env file at ${d.envFile}`;
          if (d.entries.length === 0) return `${d.envFile} is empty`;
          const pad = d.entries.reduce((m, e) => Math.max(m, e.key.length), 0);
          return [
            `${d.envFile} (${d.entries.length} key${d.entries.length === 1 ? "" : "s"})`,
            ...d.entries.map((e) => {
              const v = e.value === null ? "<redacted>" : e.value;
              return `  ${e.key.padEnd(pad)}  ${v}`;
            }),
          ].join("\n");
        },
        startedAt: started,
      });
    } catch (err) {
      emitError({
        format,
        command: "info env",
        error: err instanceof Error ? err.message : "unknown error",
      });
      process.exit(1);
    }
  },
});
