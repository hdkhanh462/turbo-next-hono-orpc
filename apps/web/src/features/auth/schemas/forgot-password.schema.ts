import z from "zod";

import { PASSWORD_SCHEMA } from "@/schemas/password.schema";
import { EMAIL_SCHEMA } from "@/schemas/email.schema";
import { OTP_SCHEMA } from "@/schemas/otp.schema";

export const resetPasswordFormSchema = z.object({
  newPassword: z.string().min(1, "New password is required"),
  confirmNewPassword: PASSWORD_SCHEMA,
});

export const forgotPasswordSchema = z.object({
  ...EMAIL_SCHEMA.shape,
  ...OTP_SCHEMA.shape,
  ...resetPasswordFormSchema.shape,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordFormSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
