// Change ONLY this value when your backend URL changes.
// For local phone testing, use your laptop IPv4.
// For web on the same PC, you can use localhost.
// mobile/constants/api.ts
export const API_BASE_URL = 'https://northern-uni-smartcampus-network-system-production.up.railway.app';
export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
