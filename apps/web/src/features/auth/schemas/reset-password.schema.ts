import z from "zod";

import { PASSWORD_SCHEMA } from "@/schemas/password.schema";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(1, "New password is required"),
    confirmNewPassword: PASSWORD_SCHEMA,
  })
  .refine(
    ({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword,
    {
      message: "Passwords mismatch",
      path: ["confirmNewPassword"],
    }
  );

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
