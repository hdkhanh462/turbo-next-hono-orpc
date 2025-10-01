import z from "zod";

import { EMAIL_SCHEMA } from "@/schemas/email.schema";
import { OTP_SCHEMA } from "@/schemas/otp.schema";

export const verifyEmailSchema = z.object({
  ...EMAIL_SCHEMA.shape,
  ...OTP_SCHEMA.shape,
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
