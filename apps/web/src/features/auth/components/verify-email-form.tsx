"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@workspace/ui/components/button";
import { MultipleStepForm } from "@workspace/ui/components/multiple-step-form";

import apiErrorToast from "@/components/toasts/api-error.toast";
import { AUTH_PATH } from "@/constants/paths";
import {
  VerifyEmailInput,
  verifyEmailSchema,
} from "@/features/auth/schemas/verify-email.schema";
import {
  verifiEmailEmailStep,
  verifiEmailOtpStep,
} from "@/features/auth/utils/email";
import { authClient } from "@/lib/auth-client";

type Props = {
  initialValues?: Partial<VerifyEmailInput>;
  initialStep?: number;
};

export default function VerifyEmailForm({
  initialValues = { email: "", otp: "" },
  initialStep,
}: Props) {
  const handleSubmit = async (values: VerifyEmailInput) => {
    const { error } = await authClient.emailOtp.verifyEmail({
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

  return (
    <MultipleStepForm
      steps={[verifiEmailEmailStep, verifiEmailOtpStep]}
      schema={verifyEmailSchema}
      initialValues={initialValues}
      initialStep={initialStep}
      submitLabel="Verify"
      onSubmit={handleSubmit}
    >
      {/* Completed Placeholder */}
      <div className="text-center space-y-6">
        <div className="bg-primary/10 inline-flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 className="text-primary h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">
          Email Verified Successfully!
        </h2>
        <p className="text-muted-foreground">
          You can now proceed to login with your verified email.
        </p>
        <a href={AUTH_PATH.LOGIN} className={buttonVariants()}>
          Go to Login
          <ArrowRight />
        </a>
      </div>
    </MultipleStepForm>
  );
}
