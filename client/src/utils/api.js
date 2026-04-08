const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const errorPayload = contentType.includes('application/json')
      ? await response.json()
      : { message: 'The request failed.' };
    throw new Error(errorPayload.message || 'The request failed.');
  }

  if (contentType.includes('text/csv')) {
    return response.blob();
  }

  return response.json();
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return parseResponse(response);
};

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) =>
    request(endpoint, {
      method: 'POST',
      headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  put: (endpoint, body) =>
    request(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  patch: (endpoint, body) =>
    request(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
  delete: (endpoint) =>
    request(endpoint, {
      method: 'DELETE'
    }),
  download: (endpoint) => request(endpoint)
};

