/**
 * API service module.
 *
 * Provides a fetch wrapper for making authenticated API requests to the
 * Express backend. All requests include credentials (cookies) so the
 * session cookie is automatically sent with each request.
 *
 * In production (e.g. GitHub Pages), the frontend is served from a
 * different origin than the API. Set VITE_API_URL to the backend origin
 * (e.g. https://api.example.com) so fetch calls reach the correct host.
 * In development, the Vite dev server proxies /api to http://localhost:3001.
 *
 * State-changing requests (POST, PUT, DELETE, PATCH) include the CSRF
 * token as an X-CSRF-Token header, which the server validates against
 * the session.
 *
 * CSRF handling:
 * - If a mutation receives 403 (CSRF failure), the client automatically
 *   fetches a fresh anonymous CSRF token from GET /api/auth/csrf-token
 *   and retries the request once. This allows sign-in and sign-up to work
 *   for anonymous clients who have no session token yet.
 *
 * Usage:
 *   import { api } from './api';
 *   const data = await api.get('/api/submissions');
 *   const result = await api.post('/api/auth/sign-in', { email, password });
 */

export const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Creates fetch options with authentication headers.
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH).
 * @param csrfToken - Optional CSRF token for state-changing requests.
 * @param body - Optional request body (serialized as JSON).
 * @returns RequestInit object with headers, credentials, and method.
 */
function getOptions(method: string, csrfToken?: string, body?: any): RequestInit {
  const options: RequestInit = {
    method,
    credentials: 'include', // send cookies with every request
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add CSRF token for state-changing methods.
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    (options.headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
  }

  // Add body for methods that support it.
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }

  return options;
}

/**
 * Fetches a fresh anonymous CSRF token from the server.
 * Required before sign-in/sign-up for anonymous clients.
 *
 * @returns The CSRF token string, or empty string if unavailable.
 */
async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.csrf_token || '';
    }
  } catch {
    // Ignore errors — caller will handle the original failure.
  }
  return '';
}

/**
 * Runs a fetch with automatic CSRF retry on 403.
 * If a state-changing request gets 403, fetches a new CSRF token and retries once.
 *
 * @param fn - Async function that performs the fetch and returns the response.
 * @param csrfToken - Current CSRF token (may be empty for anonymous clients).
 * @returns The Response object.
 */
async function csrfRetryFetch(
  fn: (token: string) => Promise<Response>,
  csrfToken: string
): Promise<Response> {
  let response = await fn(csrfToken);

  if (response.status === 403 && !csrfToken) {
    // No CSRF token yet — fetch one and retry.
    const newToken = await fetchCsrfToken();
    if (newToken) {
      response = await fn(newToken);
    }
  }

  return response;
}

/**
 * API client with methods for each HTTP verb.
 * Each method accepts an optional csrfToken for mutations.
 */
export const api = {
  /**
   * GET request - retrieves data from the server.
   * @param url - API endpoint path (e.g. /api/submissions).
   * @returns Parsed JSON response.
   */
  get: async (url: string) => {
    const response = await fetch(`${API_BASE}${url}`, getOptions('GET'));
    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.status}`);
    }
    return response.json();
  },

  /**
   * POST request - creates or submits data.
   * @param url - API endpoint path.
   * @param body - Request body (serialized as JSON).
   * @param csrfToken - CSRF token for validation.
   * @returns Parsed JSON response.
   */
  post: async (url: string, body: any, csrfToken?: string) => {
    const response = await csrfRetryFetch(
      (token) => fetch(`${API_BASE}${url}`, getOptions('POST', token, body)),
      csrfToken || ''
    );
    if (!response.ok) {
      throw new Error(`POST ${url} failed: ${response.status}`);
    }
    return response.json();
  },

  /**
   * PUT request - updates existing data.
   * @param url - API endpoint path.
   * @param body - Request body (serialized as JSON).
   * @param csrfToken - CSRF token for validation.
   * @returns Parsed JSON response.
   */
  put: async (url: string, body: any, csrfToken?: string) => {
    const response = await csrfRetryFetch(
      (token) => fetch(`${API_BASE}${url}`, getOptions('PUT', token, body)),
      csrfToken || ''
    );
    if (!response.ok) {
      throw new Error(`PUT ${url} failed: ${response.status}`);
    }
    return response.json();
  },

  /**
   * DELETE request - removes data.
   * @param url - API endpoint path.
   * @param csrfToken - CSRF token for validation.
   * @returns Parsed JSON response.
   */
  delete: async (url: string, csrfToken?: string) => {
    const response = await csrfRetryFetch(
      (token) => fetch(`${API_BASE}${url}`, getOptions('DELETE', token)),
      csrfToken || ''
    );
    if (!response.ok) {
      throw new Error(`DELETE ${url} failed: ${response.status}`);
    }
    return response.json();
  },
};
