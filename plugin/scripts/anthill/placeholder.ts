/**
 * Placeholder-document detection — is this "grounding doc" actually an unfilled
 * template?
 *
 * Why this exists: a join manifest that lists an unfilled `PROJECT_MANIFESTO.md`
 * as real grounding costs a fresh seat a full read AND hands it a wrong
 * inference — "this project has no articulated principles", when the truth is
 * "nobody filled the template in". A missing doc is already surfaced as a
 * warning; a doc that exists but says nothing is the sneakier failure, because
 * it looks like signal. See anthill#56 (item 1).
 *
 * PURE + no filesystem, so it can be unit-tested against fixture strings and
 * reused by both `anthill join` (flag it) and `anthill:bootstrap` (offer to fill
 * it) — build the heuristic once.
 */

/** A bracketed span sitting alone on a line: `[Elevator pitch...]`, `- [Principle]`. */
const LONE_PLACEHOLDER = /^\s*(?:[-*+>]\s*)?\[[^\]]+\]\s*$/;

/** Any bracketed span. Used to spot placeholder-heavy prose lines. */
const ANY_BRACKET = /\[[^\]]+\]/g;

/** A markdown link/image (`[text](url)`, `[ref][id]`) — real content, never a placeholder. */
const MARKDOWN_LINK = /\[[^\]]*\]\s*[([]/;

export interface PlaceholderVerdict {
  /** True when the doc reads as an unfilled template rather than real content. */
  isPlaceholder: boolean;
  /** Content lines considered (headings/blank/frontmatter/comments excluded). */
  contentLines: number;
  /** Content lines that are placeholder scaffold. */
  placeholderLines: number;
}

/**
 * Is `text` placeholder-dominant?
 *
 * Deliberately conservative: a FALSE POSITIVE is worse than a false negative
 * here, because wrongly flagging a real doc teaches a seat to distrust its own
 * grounding — the exact harm we're trying to prevent. So we require BOTH a
 * meaningful absolute count of scaffold lines AND a high proportion of them.
 *
 * Not counted as content (a template's skeleton is legitimately its own):
 * headings, blank lines, HTML comments, YAML frontmatter, horizontal rules,
 * table pipes. Markdown links are explicitly NOT placeholders.
 */
export function detectPlaceholder(text: string): PlaceholderVerdict {
  const lines = text.split("\n");

  let contentLines = 0;
  let placeholderLines = 0;
  let inFrontmatter = false;
  let inComment = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const line = raw.trim();

    // YAML frontmatter: only when `---` opens the file.
    if (line === "---" && i === 0) {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (line === "---") inFrontmatter = false;
      continue;
    }

    if (inComment) {
      if (line.includes("-->")) inComment = false;
      continue;
    }
    if (line.startsWith("<!--")) {
      if (!line.includes("-->")) inComment = true;
      continue;
    }

    // Structure, not content. Table rows count here too: an unfilled template's
    // empty grid (`|   |   |   |`) is scaffold, and even a filled header row is
    // the table's shape rather than its substance — counting either as "content"
    // dilutes the ratio and lets a fully-blank spec read as written.
    if (line === "" || line.startsWith("#") || line === "---" || line === "***") continue;
    if (line.startsWith("|")) continue;

    contentLines++;

    if (MARKDOWN_LINK.test(line)) continue;

    if (LONE_PLACEHOLDER.test(line)) {
      placeholderLines++;
      continue;
    }

    // A prose line that is mostly bracketed scaffold, e.g.
    // "**Status:** [Draft | Approved]" or "Owner: [Name]".
    const brackets = line.match(ANY_BRACKET);
    if (brackets) {
      const bracketed = brackets.join("").length;
      if (bracketed / line.length >= 0.5) placeholderLines++;
    }
  }

  // Both gates must pass — see the conservatism note above.
  const isPlaceholder =
    placeholderLines >= 3 && contentLines > 0 && placeholderLines / contentLines >= 0.5;

  return { isPlaceholder, contentLines, placeholderLines };
}
