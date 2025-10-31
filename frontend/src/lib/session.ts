// Initialize global 401/403 handling for all fetch requests
export function installGlobalAuthInterceptor() {
  if (typeof window === 'undefined' || (window as any).__vgmsFetchWrapped) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (async (...args: Parameters<typeof fetch>) => {
    const res = await originalFetch(...args);
    if (res.status === 401 || res.status === 403) {
      try {
        localStorage.removeItem('vgms_token');
        localStorage.removeItem('vgms_user');
      } catch {}
      if (location.pathname !== '/login') {
        location.href = '/login';
      }
    }
    return res;
  }) as typeof fetch;
  (window as any).__vgmsFetchWrapped = true;
}


