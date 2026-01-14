/**
 * Admin authentication helpers
 * Uses sessionStorage to persist auth token for the browser session only
 */

const ADMIN_TOKEN_KEY = 'adminToken';

export const getAdminToken = (): string | null =>
  sessionStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token: string): void =>
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);

export const clearAdminToken = (): void =>
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);

export const isAuthenticated = (): boolean => !!getAdminToken();
