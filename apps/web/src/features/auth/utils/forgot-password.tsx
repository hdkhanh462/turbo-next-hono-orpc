import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

import ResendCountdown from "@/features/auth/components/resend-countdown";
import {
  EmailFormInput,
  emailSchema,
  OTPFormInput,
  otpSchema,
  VerifyEmailInput,
} from "@/features/auth/schemas/email.schema";
import {
  ForgotPasswordInput,
  resetPasswordFormSchema,
  ResetPasswordInput,
} from "@/features/auth/schemas/forgot-password";
import {
  authClient,
  getApiErrorDetail,
  isApiErrorCode,
} from "@/lib/auth-client";
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

export const handleResendClick = async (values: EmailFormInput) => {
  const { error } = await authClient.forgetPassword.emailOtp({
    email: values.email,
  });

  if (error) {
    if (isApiErrorCode(error?.code)) {
      const errorDetail = getApiErrorDetail(error.code);
      toast.error(errorDetail.title, {
        description: errorDetail.description,
      });
    }
    throw new Error(error.message);
  }
};

export const handleVerifiOTP = async (values: VerifyEmailInput) => {
  const { error } = await authClient.emailOtp.checkVerificationOtp({
    type: "forget-password",
    email: values.email,
    otp: values.otp,
  });

  if (error) {
    if (isApiErrorCode(error?.code)) {
      const errorDetail = getApiErrorDetail(error.code);
      toast.error(errorDetail.title, {
        description: errorDetail.description,
      });
    }
    throw new Error(error.message);
  }
};

export const forgotPasswordEmailStep: StepConfig<EmailFormInput> = {
  title: "Forgot Password",
  description: "Enter your email to receive a verification code",
  schema: emailSchema,
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
  schema: otpSchema,
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
