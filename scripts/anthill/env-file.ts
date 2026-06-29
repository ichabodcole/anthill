/**
 * Minimal .env read/parse/update/write helpers. Preserves surrounding
 * comments + ordering when updating or enabling a key.
 *
 * NOT a general-purpose env parser — no multi-line values, no escaping.
 * Good enough for the keys this CLI manages (connection URL, bearer, etc).
 */

import { readFileSync, writeFileSync } from "node:fs";

/** Parse all `KEY=VALUE` pairs from a .env file into a record. */
export function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Read the file as an array of lines, returning [] if the file doesn't exist. */
export function readEnvLines(path: string): string[] {
  try {
    return readFileSync(path, "utf8").split(/\r?\n/);
  } catch {
    return [];
  }
}

export function writeEnvLines(path: string, lines: string[]): void {
  writeFileSync(path, lines.join("\n"), "utf8");
}

/**
 * Replace a `KEY=...` line (including `#KEY=...` commented-out lines) or
 * append at end if the key isn't present. Returns updated lines and whether
 * anything changed.
 */
export function enableKey(
  lines: string[],
  key: string,
  value: string,
): { lines: string[]; changed: boolean } {
  const pattern = new RegExp(`^#?\\s*${key}\\s*=`);
  let found = false;
  let changed = false;
  const out = lines.map((line) => {
    if (pattern.test(line.trim())) {
      found = true;
      const next = `${key}=${value}`;
      if (line !== next) changed = true;
      return next;
    }
    return line;
  });
  if (!found) {
    out.push(`${key}=${value}`);
    changed = true;
  }
  return { lines: out, changed };
}
