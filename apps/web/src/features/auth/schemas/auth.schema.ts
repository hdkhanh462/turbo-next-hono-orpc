import z from "zod";

import { PASSWORD_SCHEMA } from "@/schemas/password.schema";
import { EMAIL_SCHEMA } from "@/schemas/email.schema";

export const loginSchema = z.object({
  ...EMAIL_SCHEMA.shape,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  ...EMAIL_SCHEMA.shape,
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: PASSWORD_SCHEMA,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
