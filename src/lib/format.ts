/** Keep integer and token arithmetic exact until the explicitly lossy chart boundary. */
export function integer(
  value: string | bigint | number | null | undefined,
): string {
  if (value == null) return "—";
  try {
    return BigInt(value).toLocaleString("en-US");
  } catch {
    return "—";
  }
}
export function token(
  value: string | null | undefined,
  decimals = 18,
  places = 2,
): string {
  if (value == null) return "—";
  const amount = BigInt(value),
    unit = 10n ** BigInt(decimals);
  const whole = amount / unit;
  const fraction = (amount % unit)
    .toString()
    .padStart(decimals, "0")
    .slice(0, places)
    .replace(/0+$/, "");
  return whole.toLocaleString("en-US") + (fraction ? "." + fraction : "");
}
export function compactToken(value: string | undefined, decimals = 18): string {
  if (value == null) return "—";
  const amount = BigInt(value),
    unit = 10n ** BigInt(decimals);
  for (const [threshold, suffix] of [
    [1_000_000_000n, "B"],
    [1_000_000n, "M"],
    [1_000n, "K"],
  ] as const) {
    if (amount >= threshold * unit) {
      const hundredths = (amount * 100n) / (threshold * unit);
      return `${hundredths / 100n}.${(hundredths % 100n).toString().padStart(2, "0")}${suffix}`;
    }
  }
  return token(value, decimals);
}
export function percent(numerator: string, denominator: string): number {
  const d = BigInt(denominator);
  return d === 0n ? 0 : Number((BigInt(numerator) * 10_000n) / d) / 100;
}
export function chartNumber(
  value: string | null | undefined,
  decimals = 0,
): number | null {
  if (value == null) return null;
  const n = BigInt(value),
    unit = 10n ** BigInt(decimals);
  const whole = n / unit;
  if (whole > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return (
    Number(whole) +
    (decimals ? Number(((n % unit) * 1_000_000n) / unit) / 1_000_000 : 0)
  );
}
export function shortHash(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
export function dateTime(value: string): string {
  return (
    new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}
export function reasonText(value: string | null | undefined): string {
  return value ? value.replace(/_/g, " ") : "Source unavailable";
}
