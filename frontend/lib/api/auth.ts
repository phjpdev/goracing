type ApiSuccess = { success: true };
type ApiError = { error: string };
type AuthResult = ApiSuccess | ApiError;

export async function apiLogin(username: string, password: string): Promise<AuthResult> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function apiSignup(
  username: string,
  password: string,
  privacy_policy_accepted: boolean
): Promise<AuthResult> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, privacy_policy_accepted }),
  });
  return res.json();
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
