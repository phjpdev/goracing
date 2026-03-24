type ApiSuccess = { success: true };
type ApiError = { error: string };
type AuthResult = ApiSuccess | ApiError;

export async function apiLogin(email: string, password: string): Promise<AuthResult> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function apiSignup(
  email: string,
  password: string,
  confirm_password: string,
  privacy_policy_accepted: boolean,
  referral_source?: string
): Promise<AuthResult> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirm_password, privacy_policy_accepted, referral_source }),
  });
  return res.json();
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
