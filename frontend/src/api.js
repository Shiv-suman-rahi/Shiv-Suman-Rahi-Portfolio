const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiUrl = (path) => `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

export const resolveApiUrl = (url) => (
  typeof url === 'string' && url.startsWith('/api/') ? apiUrl(url) : url
);

export const parseApiResponse = (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `The API returned a non-JSON response (HTTP ${response.status}). Check VITE_API_URL and rebuild the frontend.`
    );
  }

  return response.json();
};