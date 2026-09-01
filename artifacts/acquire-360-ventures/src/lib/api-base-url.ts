const rawApiBaseUrl = import.meta.env.API_BASE_URL as string | undefined;

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
