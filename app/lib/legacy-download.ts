// Stored legacy file paths identify a basename, never a destination for credentials.
export function legacyDownloadTarget(
  storedPath: unknown,
  apiBase: string,
  appOrigin: string,
): { url: string; filename: string } | null {
  if (typeof storedPath !== 'string' || !storedPath || storedPath !== storedPath.trim()) return null;
  try {
    const api = new URL(apiBase, appOrigin);
    if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password || api.search || api.hash) return null;
    const privateId = /^private-file:([a-f0-9]{24})$/.exec(storedPath)?.[1];
    if (privateId) return {url: api.href.replace(/\/$/, '') + '/platform/files/' + privateId, filename: 'document-' + privateId};
    if (/^[a-z][a-z\d+.-]*:/i.test(storedPath) || storedPath.startsWith('//') || /[\\?#\x00-\x1f\x7f]/.test(storedPath)) return null;
    const segments = storedPath.split('/');
    if (segments.some(part => part === '..')) return null;
    const filename = segments.at(-1) || '';
    if (!/^[a-zA-Z0-9_.-]+$/.test(filename) || ['.', '..'].includes(filename)) return null;
    return { url: new URL('/uploads/' + encodeURIComponent(filename), api.origin).href, filename };
  } catch { return null; }
}

export function legacyDownloadName(label: unknown, fallback: string): string {
  if (typeof label !== 'string') return fallback;
  const name = label.replace(/[\\/\x00-\x1f\x7f]/g, '_').trim().slice(0, 180);
  return name && !['.', '..'].includes(name) ? name : fallback;
}
