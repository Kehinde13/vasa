export function saveAuth(token: string, user: unknown): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getAuth(): { token: string | null; user: unknown} {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return { token, user: user ? JSON.parse(user) : null };
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
