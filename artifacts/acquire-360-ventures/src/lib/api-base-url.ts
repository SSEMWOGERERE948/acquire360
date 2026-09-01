const rawApiBaseUrl = 'https://api.acquire360ventures.com';

export const apiBaseUrl = rawApiBaseUrl?.replace(/\/+$/, '') ?? null;

export function apiAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  if (!apiBaseUrl || !url.startsWith('/')) {
    return url;
  }

  return `${apiBaseUrl}${url}`;
}
