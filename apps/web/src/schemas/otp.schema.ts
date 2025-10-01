import { REGEXP_ONLY_DIGITS } from "input-otp";
import z from "zod";

export const OTP_SCHEMA = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(new RegExp(REGEXP_ONLY_DIGITS), "OTP must be 6 digits"),
});

export type OTPFormInput = z.infer<typeof OTP_SCHEMA>;
