export const AUTH_PATH = {
  LOGIN_REDIRECT: "/",
  LOGIN: "/auth/login",
  RESET_PASSWORD_REDIRECT: "/auth/reset-password",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
} as const;

export const ACCOUNT_PATH = {
  PROFILE: "/account",
  DASHBOARD: "/dashboard",
  SECURITY: "/account/security",
  API_KEYS: "/account/api-keys",
  NOTIFICATIONS: "/account/notifications",
  SETTINGS: {
    GENERAL: "/account/settings",
    LANGUAGES: "/account/settings#languages",
    NOTIFICATIONS: "/account/settings#notifications",
    APPEARANCE: "/account/settings#appearance",
  },
} as const;
