/**
 * Application routes – single source of truth for URLs
 */
export const MOBILE_BOTTOM_NAV_HEIGHT = 42;
export const MOBILE_BOTTOM_NAV_LOGO_WIDTH = 58;
export const MOBILE_BOTTOM_NAV_LOGO_HEIGHT = 68;

export const ROUTES = {
  HOME: "/",
  WELCOME: "/welcome",
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
  RECORDS: "/records",
  MEMBER: "/member",
  LAST_MATCHES: "/last-matches",
  TELEGRAM: "https://t.me/gofootballai",
} as const;
