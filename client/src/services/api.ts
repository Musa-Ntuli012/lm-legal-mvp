/// <reference types="vite/client" />
import { z } from 'zod';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

let csrfToken = '';

export function setCsrfToken(token: string) {
  csrfToken = token;
}

export function getCsrfToken(): string {
  return csrfToken;
}

async function request(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  return fetch(`${API_BASE}${path}`, config);
}

export async function apiGet(path: string) {
  const res = await request(path);
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await request(path, {
    method: 'POST',
    body,
  });
  return res.json();
}

export async function apiPut(path: string, body: any) {
  const res = await request(path, {
    method: 'PUT',
    body,
  });
  return res.json();
}

export async function apiDelete(path: string) {
  const res = await request(path, { method: 'DELETE' });
  return res.json();
}

// Auth types
export interface Profile {
  id: string;
  email: string;
  role: string;
  display_name: string;
}

export interface SessionData {
  user: Profile | null;
  csrf_token: string;
}

export async function signIn(email: string, password: string) {
  const res = await apiPost('/auth/sign-in', { email, password, csrf_token: csrfToken });
  if (res.csrf_token) setCsrfToken(res.csrf_token);
  return res;
}

export async function signUp(email: string, password: string, displayName: string) {
  const res = await apiPost('/auth/sign-up', {
    email,
    password,
    display_name: displayName,
    csrf_token: csrfToken,
  });
  if (res.csrf_token) setCsrfToken(res.csrf_token);
  return res;
}

export async function signOut() {
  const res = await apiPost('/auth/sign-out', { csrf_token: csrfToken });
  setCsrfToken('');
  return res;
}

export async function getSession(): Promise<SessionData> {
  const res = await apiGet('/auth/session');
  if (res.csrf_token) setCsrfToken(res.csrf_token);
  return res;
}

export async function acceptInvite(token: string, email: string, password: string, displayName: string) {
  const res = await apiPost('/auth/accept-invite', {
    token,
    email,
    password,
    display_name: displayName,
    csrf_token: csrfToken,
  });
  if (res.csrf_token) setCsrfToken(res.csrf_token);
  return res;
}
