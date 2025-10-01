import { REGEXP_ONLY_DIGITS } from "input-otp";

import { FormControl } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import type { StepConfig } from "@workspace/ui/components/multiple-step-form";

import apiErrorToast from "@/components/toasts/api-error.toast";
import ResendCountdown from "@/features/auth/components/resend-countdown";
import { VerifyEmailInput } from "@/features/auth/schemas/verify-email.schema";
import { authClient } from "@/lib/auth-client";
import { EMAIL_SCHEMA, EmailFormInput } from "@/schemas/email.schema";
import { OTP_SCHEMA, OTPFormInput } from "@/schemas/otp.schema";

export const handleResendClick = async (values: EmailFormInput) => {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email: values.email,
    type: "email-verification",
  });

  if (error) {
    apiErrorToast(error.code);
  }
};

export const verifiEmailEmailStep: StepConfig<EmailFormInput> = {
  title: "Verify Email",
  description: "Enter your email to receive the OTP",
  schema: EMAIL_SCHEMA,
  async onSubmit(data) {
    await handleResendClick(data);
  },
  fields: [
    {
      key: "email",
      label: "Email",
      description: "Please enter your email address to receive the OTP",
      render: ({ field }) => (
        <FormControl>
          <Input placeholder="your@email.com" {...field} />
        </FormControl>
      ),
    },
  ],
};

export const verifiEmailOtpStep: StepConfig<OTPFormInput, VerifyEmailInput> = {
  title: "Verify OTP",
  description:
    "Enter the 6-digit OTP sent to your email, check spam folder if not found",
  schema: OTP_SCHEMA,
  disableBackAction: true,
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
