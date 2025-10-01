import z from "zod";

export const EMAIL_SCHEMA = z.object({
  email: z.email("Please enter a valid email address"),
});

export type EmailFormInput = z.infer<typeof EMAIL_SCHEMA>;
