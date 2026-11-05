/**
 * API service module.
 *
 * Provides a fetch wrapper for making authenticated API requests to the
 * Express backend. All requests include credentials (cookies) so the
 * session cookie is automatically sent with each request.
 *
 * State-changing requests (POST, PUT, DELETE, PATCH) include the CSRF
 * token as an X-CSRF-Token header, which the server validates against
 * the session.
 *
 * Usage:
 *   import { api } from './api';
 *   const data = await api.get('/api/submissions');
 *   const result = await api.post('/api/auth/sign-in', { email, password });
 */

interface RequestOptions extends RequestInit {
  /** CSRF token to include in the X-CSRF-Token header (for mutations). */
  csrfToken?: string;
}

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
 * API client with methods for each HTTP verb.
 * Each method accepts an optional csrfToken for mutations.
 */
export const api = {
  /**
   * GET request - retrieves data from the server.
   * @param url - API endpoint path.
   * @returns Parsed JSON response.
   */
  get: async (url: string) => {
    const response = await fetch(url, getOptions('GET'));
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
    const response = await fetch(url, getOptions('POST', csrfToken, body));
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
    const response = await fetch(url, getOptions('PUT', csrfToken, body));
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
    const response = await fetch(url, getOptions('DELETE', csrfToken));
    if (!response.ok) {
      throw new Error(`DELETE ${url} failed: ${response.status}`);
    }
    return response.json();
  },
};
