import { API_BASE_URL } from "./constants";

/**
 * Build a full URL for media files returned by the API.
 * Accepts absolute URLs as-is, or relative paths like "uploads/..." or "/uploads/...".
 */
export const getMediaUrl = (path?: string): string | undefined => {
  if (!path) return undefined;

  // Already an absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};


