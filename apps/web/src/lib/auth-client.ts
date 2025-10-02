import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
export type ErrorDetail = {
  title: string;
  description: string;
};

type ErrorTypes = Partial<
  Record<
    keyof typeof authClient.$ERROR_CODES,
    {
      en: ErrorDetail;
      vi: ErrorDetail;
    }
  >
>;

const errorCodes = {
  USER_ALREADY_EXISTS: {
    en: {
      title: "User Already Exists",
      description: "The email address is already in use.",
    },
    vi: {
      title: "Người dùng đã tồn tại",
      description: "Địa chỉ email đã được sử dụng.",
    },
  },
  INVALID_EMAIL_OR_PASSWORD: {
    en: {
      title: "Invalid email or password",
      description: "Please check your email and password and try again.",
    },
    vi: {
      title: "Email hoặc mật khẩu không chính xác",
      description: "Vui lòng kiểm tra email và mật khẩu của bạn và thử lại.",
    },
  },
  EMAIL_NOT_VERIFIED: {
    en: {
      title: "Email not verified",
      description: "Please verify your email address before signing in.",
    },
    vi: {
      title: "Email chưa được xác minh",
      description:
        "Vui lòng xác minh địa chỉ email của bạn trước khi đăng nhập.",
    },
  },
  INVALID_OTP: {
    en: {
      title: "Invalid OTP",
      description: "The OTP you entered is incorrect. Please try again.",
    },
    vi: {
      title: "Mã OTP không hợp lệ",
      description: "Mã OTP bạn đã nhập không đúng. Vui lòng thử lại.",
    },
  },
  OTP_EXPIRED: {
    en: {
      title: "OTP Expired",
      description: "The OTP has expired. Please request a new one.",
    },
    vi: {
      title: "Mã OTP đã hết hạn",
      description: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
    },
  },
  TOO_MANY_ATTEMPTS: {
    en: {
      title: "Too Many Attempts",
      description:
        "You have made too many unsuccessful attempts. Please try again later.",
    },
    vi: {
      title: "Quá nhiều lần thử",
      description:
        "Bạn đã thực hiện quá nhiều lần thử không thành công. Vui lòng thử lại sau.",
    },
  },
} satisfies ErrorTypes;

type ErrorCode = keyof typeof errorCodes;

type GetErrorDetailOptions = {
  lang: keyof NonNullable<ErrorTypes[ErrorCode]>;
};

type GetErrorDetailFunction = (
  code: ErrorCode,
  options?: GetErrorDetailOptions
) => ErrorDetail;

export const getApiErrorDetail: GetErrorDetailFunction = (code, options) => {
  return errorCodes[code][options?.lang || "en"];
};

export function isApiErrorCode(code?: string | null): code is ErrorCode {
  if (!code) return false;
  return code in errorCodes;
}
