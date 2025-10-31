export function getApiUrl(): string {
  // Vite exposes env vars under import.meta.env
  const url = (import.meta as ImportMeta).env?.VITE_API_URL || 'http://localhost:3000';
  return url;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('vgms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
}

export function getAuthHeadersForFormData() {
  const token = localStorage.getItem('vgms_token') || localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, { headers: getAuthHeaders() });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('vgms_token');
    localStorage.removeItem('vgms_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GET ${path} failed`);
  }
  return res.json();
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('vgms_token');
    localStorage.removeItem('vgms_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `POST ${path} failed`);
  }
  return res.json();
}

export async function apiPatch<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('vgms_token');
    localStorage.removeItem('vgms_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `PATCH ${path} failed`);
  }
  return res.json();
}

export async function apiPatchStockIn<T = unknown>(path: string, quantity: number): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('vgms_token');
    localStorage.removeItem('vgms_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `PATCH ${path} failed`);
  }
  return res.json();
}

export async function apiPatchStockOut<T = unknown>(path: string, quantity: number): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('vgms_token');
    localStorage.removeItem('vgms_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `PATCH ${path} failed`);
  }
  return res.json();
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('vgms_token');
    localStorage.removeItem('vgms_user');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `DELETE ${path} failed`);
  }
  // Handle 204 No Content
  try {
    return await res.json();
  } catch {
    return {} as T;
  }
}

