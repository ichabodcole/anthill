/**
 * Minimal, dependency-free ANSI helpers. Honors NO_COLOR + isTTY.
 *
 * NOTE: `COLOR_ENABLED` is evaluated ONCE at module load. That's intentional
 * — consistent within a command's lifetime, and test harnesses that rewrite
 * stdout mid-run should use the explicit override below rather than expect
 * re-detection.
 */

let override: boolean | null = null;

export const COLOR_ENABLED = !process.env.NO_COLOR && process.stdout.isTTY;

/** For tests: force color on/off regardless of TTY state. */
export function setColorOverride(value: boolean | null): void {
  override = value;
}

function enabled(): boolean {
  return override ?? COLOR_ENABLED;
}

function wrap(open: string, close: string): (s: string) => string {
  return (s) => (enabled() ? `${open}${s}${close}` : s);
}

/** Primary brand accent — replace the 256-color code to rebrand. */
export const accent = wrap("\x1b[38;5;214m", "\x1b[39m");
/** Dimmed secondary info — labels, supporting detail. */
export const dim = wrap("\x1b[2m", "\x1b[22m");
/** Bold — section headers. */
export const bold = wrap("\x1b[1m", "\x1b[22m");
/** Muted gray — hints, subtitles. */
export const muted = wrap("\x1b[38;5;245m", "\x1b[39m");
