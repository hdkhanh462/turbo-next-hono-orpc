import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins/email-otp";

import prisma from "../db";
import { sendEmail } from "./email";
import { redis } from "./redis";
import { env } from "../env";

export const auth = betterAuth<BetterAuthOptions>({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in":
            await sendEmail({
              to: email,
              subject: "Sign in to your account",
              text: `Your sign-in code is: ${otp}`,
            });
            break;
          case "email-verification":
            await sendEmail({
              to: email,
              subject: "Verify your email address",
              text: `Your verification code is: ${otp}`,
            });
            break;
          case "forget-password":
            await sendEmail({
              to: email,
              subject: "Reset your password",
              text: `Your password reset code is: ${otp}`,
            });
            break;
        }
      },
    }),
  ],
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, "EX", ttl);
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
});
