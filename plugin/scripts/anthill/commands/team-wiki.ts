import { defineAnthillCommand } from "../define.ts";
import { teamWikiLintCommand } from "./team-wiki-lint.ts";

/** `anthill wiki` — the team wiki: the project-owned "how" behind each lifecycle touch point. */
export const teamWikiCommand = defineAnthillCommand({
  meta: {
    name: "wiki",
    description: "The team wiki — the project-owned method each lifecycle skill points at",
    scope: "workspace",
  },
  subCommands: {
    lint: teamWikiLintCommand,
  },
});
