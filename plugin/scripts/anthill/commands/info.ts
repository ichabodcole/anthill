import { defineAnthillCommand } from "../define.ts";
import { infoEnvCommand } from "./info-env.ts";
import { infoShowCommand } from "./info-show.ts";

export const infoCommand = defineAnthillCommand({
  meta: {
    name: "info",
    description: "Inspect CLI and project state",
    scope: "workspace",
  },
  subCommands: {
    show: infoShowCommand,
    env: infoEnvCommand,
  },
});
