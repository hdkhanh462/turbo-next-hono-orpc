import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

import { FormControl } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { StepConfig } from "@workspace/ui/components/multiple-step-form";
import { PasswordInput } from "@workspace/ui/components/password-input";

import apiErrorToast from "@/components/toasts/api-error.toast";
import ResendCountdown from "@/features/auth/components/resend-countdown";
import {
  ForgotPasswordInput,
  resetPasswordFormSchema,
  ResetPasswordInput,
} from "@/features/auth/schemas/forgot-password.schema";
import { VerifyEmailInput } from "@/features/auth/schemas/verify-email.schema";
import { authClient } from "@/lib/auth-client";
import { EMAIL_SCHEMA, EmailFormInput } from "@/schemas/email.schema";
import { OTP_SCHEMA, OTPFormInput } from "@/schemas/otp.schema";

export const handleResendClick = async (values: EmailFormInput) => {
  const { error } = await authClient.forgetPassword.emailOtp({
    email: values.email,
  });

  if (error) {
    apiErrorToast(error.code);
  }
};

export const handleVerifiOTP = async (values: VerifyEmailInput) => {
  const { error } = await authClient.emailOtp.checkVerificationOtp({
    type: "forget-password",
    email: values.email,
    otp: values.otp,
  });

  if (error) {
    const isHandled = apiErrorToast(error.code);
    if (!isHandled) {
      toast.error("Verification failed", {
        description:
          "The OTP you entered is incorrect or has expired. Please try again.",
      });
    }
    throw new Error(error.message);
  }
};

export const forgotPasswordEmailStep: StepConfig<EmailFormInput> = {
  title: "Forgot Password",
  description: "Enter your email to receive a verification code",
  schema: EMAIL_SCHEMA,
  async onSubmit(data) {
    await handleResendClick(data);
  },
  fields: [
    {
      key: "email",
      label: "Email",
      description: "We'll send a 6-digit code to this email address",
      render: ({ field }) => (
        <FormControl>
          <Input placeholder="your@email.com" {...field} />
        </FormControl>
      ),
    },
  ],
};

export const forgotPasswordOtpStep: StepConfig<
  OTPFormInput,
  ForgotPasswordInput
> = {
  title: "Enter Verification Code",
  description:
    "Please enter the 6-digit code sent to your email. Check your spam or junk folder if you don't see it",
  schema: OTP_SCHEMA,
  async onSubmit(_, data) {
    await handleVerifiOTP(data);
  },
  fields: [
    {
      key: "otp",
      render: ({ field, formData }) => (
        <FormControl>
          <div className="flex flex-col gap-2">
            <div className="flex justify-center">
              <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="text-end text-sm text-muted-foreground mx-4">
              <ResendCountdown
                onCompleteClick={() =>
                  handleResendClick({ email: formData.email })
                }
              />
            </div>
          </div>
        </FormControl>
      ),
    },
  ],
};

export const forgotPasswordResetPasswordStep: StepConfig<
  ResetPasswordInput,
  ForgotPasswordInput
> = {
  title: "Set New Password",
  description: "Create a new password for your account",
  schema: resetPasswordFormSchema,
  disableBackAction: true,
  fields: [
    {
      key: "newPassword",
      label: "New password",
      render: ({ field }) => (
        <FormControl>
          <PasswordInput
            {...field}
            placeholder="Enter your new password"
            autoComplete="new-password"
          />
        </FormControl>
      ),
    },
    {
      key: "confirmNewPassword",
      label: "Confirm new password",
      render: ({ field }) => (
        <FormControl>
          <PasswordInput
            {...field}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
          />
        </FormControl>
      ),
    },
  ],
};
