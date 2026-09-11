import { appConfig } from "@/lib/config";
import { wait } from "@/lib/utils";

const TOKEN_KEY = "engox.admin.accessToken";
const REFRESH_KEY = "engox.admin.refreshToken";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * Thin fetch wrapper matching NestJS JSON responses.
 * Mock mode never hits the network — services short-circuit first.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (appConfig.useMock) {
    throw new Error(
      `apiRequest called in mock mode for ${path}. Use services.ts mock branches.`,
    );
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function mockLatency<T>(data: T, ms = 320): Promise<T> {
  await wait(ms);
  return structuredClone(data);
}
