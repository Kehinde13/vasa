import { User } from "../types"; // Adjust the import path as needed

export interface UserPayload {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
  role: string;
  phone: string;
  timeZone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const BASE_URL = 'http://localhost:5000/api/auth'; 

/**
 * Helper for fetch with AbortController and error handling.
 */
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit,
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Request failed (${res.status}): ${errorText}`);
    }

    return await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw new Error(err.message || "Network error");
  }
}

/**
 * Register a new user.
 */
export async function registerUser(data: UserPayload): Promise<AuthResponse> {
  return fetchWithTimeout<AuthResponse>(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * Log in a user.
 */
export async function loginUser(
  data: LoginPayload,
  options?: { signal?: AbortSignal }
): Promise<AuthResponse> {
  return fetchWithTimeout<AuthResponse>(
    `${BASE_URL}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: options?.signal,
    },
    10000 // 10-second timeout
  );
}
