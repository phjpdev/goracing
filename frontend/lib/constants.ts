/**
 * Application routes – single source of truth for URLs
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MATCHES: "/matches",
  RACE: (id: string) => `/races/${id}`,
  PRIVACY_POLICY: "/privacy-policy",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin",
  SUBADMIN_LOGIN: "/subadmin/login",
  SUBADMIN_DASHBOARD: "/subadmin",
  ADMIN_RECORDS: "/admin/records",
  LAST_MATCHES: "/last-matches",
} as const;
