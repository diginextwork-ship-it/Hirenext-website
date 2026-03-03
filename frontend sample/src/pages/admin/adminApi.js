export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || "admin123";

export const getAdminHeaders = (extraHeaders = {}) => ({
  "x-admin-key": ADMIN_API_KEY,
  ...extraHeaders,
});

export const readJsonResponse = async (response, fallbackMessage) => {
  const rawBody = await response.text();
  if (!rawBody) return {};

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Server returned non-JSON response (${response.status}) for ${response.url}. ${fallbackMessage}`
    );
  }
};
