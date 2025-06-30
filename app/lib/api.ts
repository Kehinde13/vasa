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
  user: unknown;
}

const BASE_URL = 'https://vasa-backend-k9op.vercel.app/api/auth';

export async function registerUser(data: UserPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Registration failed');
  return await res.json();
}

export async function loginUser(data: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Login failed');
  return await res.json();
}
