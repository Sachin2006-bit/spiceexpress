// src/lib/auth.ts
export function getUserFromStorage() {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    // If token exists but is expired, clear auth and return null
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length === 3) {
        // Decode base64 payload safely
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload && payload.exp && (payload.exp * 1000) < Date.now()) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          return null;
        }
      }
    } catch (e) {
      // If anything goes wrong decoding the token, clear it for safety
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return null;
    }
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function setUserToStorage(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearUserFromStorage() {
  localStorage.removeItem('user');
}

export function getToken() {
  return localStorage.getItem('auth_token');
}

export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload) return true;
    if (!payload.exp) return false; // no exp claim => treat as non-expiring
    return (payload.exp * 1000) < Date.now();
  } catch (e) {
    return true;
  }
}

export function isAuthed() {
  const token = getToken();
  return Boolean(token) && !isTokenExpired();
}
