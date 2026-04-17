// frontend/src/config/api.config.js

// Backend API base URL
// You can switch between local and production easily
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

/** Same host as the API, without `/api` — static files are mounted at `/uploads` on the server. */
export function getUploadsBaseUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "") || API_BASE_URL.replace(/\/$/, "");
}

/** Full URL for a stored upload filename (e.g. profile image). Not under `/api`. */
export function uploadFileUrl(fileName) {
  if (!fileName || typeof fileName !== "string") return null;
  const trimmed = fileName.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${getUploadsBaseUrl()}/uploads/${encodeURIComponent(trimmed)}`;
}

export default API_BASE_URL;
