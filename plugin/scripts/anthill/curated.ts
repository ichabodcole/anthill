import { relative, resolve, sep } from "node:path";
import type { ResolvedConfig } from "./config.ts";

/**
 * The CURATED set — the durable team docs no seat edits during a working session.
 *
 * anthill-evolution's one rule, made mechanical: a seat doc, `seams.md`,
 * `principles.md` and the team wiki change only at `anthill:curate` (or by the
 * lead landing a ratified seam at plan). Everything a seat learns goes in its
 * session REPORT, which curation reads. The rule was prose for two months —
 * "keep it lean", "capture durable judgments, not a session log" — and both
 * long-running teams grew their seat docs past a thousand lines anyway, because
 * the agent that did the work is the wrong one to decide what a stranger needs.
 *
 * So `anthill commit` refuses a curated path unless `--curated` is passed. The
 * flag exists for the two legitimate writers; it is not a hint, it is the
 * write-permission split the design rests on. PURE: feed it a config and paths.
 */

/** One curated location: a file, or a directory prefix (`kind: "dir"`). Repo-relative, `/`-joined. */
export interface CuratedEntry {
  rel: string;
  kind: "file" | "dir";
  /** What this is, for the refusal message — `seat doc (forager)`, `seams`, … */
  what: string;
}

function toRel(root: string, abs: string): string {
  return relative(root, abs).split(sep).join("/");
}

/** Every curated location for this team, from its resolved paths. */
export function curatedEntries(config: ResolvedConfig): CuratedEntry[] {
  const root = config.projectRoot;
  const teamDir = config.teamDirPath();
  return [
    ...config.roster().map(
      (s): CuratedEntry => ({
        rel: toRel(root, config.seatDocPath(s.handle)),
        kind: "file",
        what: `seat doc (${s.handle})`,
      }),
    ),
    { rel: toRel(root, config.seamsPath()), kind: "file", what: "seams" },
    { rel: toRel(root, resolve(teamDir, "principles.md")), kind: "file", what: "principles" },
    { rel: toRel(root, config.wikiPath()), kind: "dir", what: "the team wiki" },
  ];
}

/** Normalise a caller-supplied path (relative to `cwd`, or absolute) to repo-relative `/`-joined form. */
function normalise(root: string, cwd: string, p: string): string {
  return toRel(root, resolve(cwd, p));
}

/**
 * Which of `paths` fall in the curated set. Repo-relative or absolute; `.`-
 * prefixed and `./`-prefixed forms all resolve the same way. A directory entry
 * matches the directory itself and anything below it.
 */
export function curatedHits(
  paths: string[],
  entries: CuratedEntry[],
  root: string,
  cwd: string = root,
): Array<{ path: string; what: string }> {
  const hits: Array<{ path: string; what: string }> = [];
  for (const p of paths) {
    const rel = normalise(root, cwd, p);
    for (const e of entries) {
      const hit = e.kind === "file" ? rel === e.rel : rel === e.rel || rel.startsWith(`${e.rel}/`);
      if (hit) {
        hits.push({ path: p, what: e.what });
        break;
      }
    }
  }
  return hits;
}
