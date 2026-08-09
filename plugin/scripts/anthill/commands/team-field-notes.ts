import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { emit, refuseArg, resolveFormat } from "../agent-layer.ts";
import { CLIError, defineAnthillCommand } from "../define.ts";
import { nowMillis } from "../runtime.ts";

/**
 * `anthill field-notes` — print what anthill has observed across teams.
 *
 * The doc ships beside this file rather than being rendered into a team's
 * footprint, and that is the whole design. `anthill init` creates files that are
 * missing and never touches ones that exist, so anything copied into `.anthill/`
 * reaches a team ONCE and every later revision never arrives. Read from the
 * plugin instead and the notes are current for whoever has the plugin.
 *
 * Deliberately NOT authoritative, and the name carries that: these are captured
 * in the field with their evidence, not decreed. A team's own
 * `.anthill/principles.md` is theirs — nothing here writes to it.
 *
 * `scope: "workspace"` because this needs no `.anthill/config.json`: an agent
 * evaluating anthill, or one on a repo with no team, should still be able to
 * read it.
 */
const DOC_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "field-notes.md");

/** Why this verb refuses `--team`. ONE string, used by the arg def AND the
 * refusal in `run` — two copies of a reason drift, and a refusal that argues
 * with itself teaches worse than the generic "unknown option" it replaced. */
const REFUSED_TEAM =
  "field notes are anthill's cross-team observations, shipped in the plugin — they are the same for every team";

export const fieldNotesCommand = defineAnthillCommand({
  meta: {
    name: "field-notes",
    description: "What anthill has observed across teams — evidence attached, adopt or ignore",
    scope: "workspace",
  },
  args: {
    team: { type: "string", refused: REFUSED_TEAM },
    format: { type: "string", description: "Output format", valueHint: "text|json" },
  },
  async run(ctx) {
    refuseArg({
      format: resolveFormat(ctx.args.format as string | undefined),
      command: "field-notes",
      flag: "--team",
      value: ctx.args.team,
      why: REFUSED_TEAM,
    });
    const started = nowMillis();
    const format = resolveFormat(ctx.args.format);
    // A missing doc means the plugin was packaged or copied incompletely — not
    // anything the caller did. Say that, rather than surfacing a raw ENOENT with
    // an absolute path, which names the symptom and not the cause. This command
    // exists because failure surfaces mislead; its own should not.
    let markdown: string;
    try {
      markdown = readFileSync(DOC_PATH, "utf8");
    } catch {
      throw new CLIError(
        "the field-notes document is missing from this anthill install " +
          "(expected it beside the CLI, at scripts/anthill/field-notes.md). " +
          "The plugin looks incompletely installed — reinstall or update anthill.",
      );
    }

    emit({
      format,
      command: "field-notes",
      // JSON gets the same bytes, not a summary of them. An agent asking for the
      // notes wants the notes; anything less makes it fetch the file itself.
      data: { markdown },
      startedAt: started,
      renderText: () => markdown,
    });
  },
});
