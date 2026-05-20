export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  clinica_id: string;
}

export interface AuthClinica {
  id: string;
  name: string;
}

export interface AuthSession {
  user: AuthUser;
  clinica: AuthClinica;
  access_token: string;
}

export function setAuth(data: {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  clinica: AuthClinica;
}) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("auth_user", JSON.stringify(data.user));
  localStorage.setItem("auth_clinica", JSON.stringify(data.clinica));
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_clinica");
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  const userRaw = localStorage.getItem("auth_user");
  const clinicaRaw = localStorage.getItem("auth_clinica");
  if (!token || !userRaw || !clinicaRaw) return null;
  try {
    return {
      access_token: token,
      user: JSON.parse(userRaw) as AuthUser,
      clinica: JSON.parse(clinicaRaw) as AuthClinica,
    };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}
