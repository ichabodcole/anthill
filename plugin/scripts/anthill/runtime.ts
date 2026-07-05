/** Returns milliseconds since an arbitrary start — use for duration timing. */
export function nowMillis(): number {
  return Number(Bun.nanoseconds()) / 1_000_000;
}
