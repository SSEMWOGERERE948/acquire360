const rawApiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.acquire360ventures.com';

export const apiBaseUrl = rawApiBaseUrl?.replace(/\/+$/, '') ?? null;

export function apiAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (!apiBaseUrl) {
    return url;
  }

  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
}
