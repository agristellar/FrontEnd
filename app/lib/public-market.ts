export function publicHttpsUrl(value: unknown): string | undefined {
  try { const url = new URL(String(value)); return url.protocol === 'https:' ? url.href : undefined; }
  catch { return undefined; }
}
