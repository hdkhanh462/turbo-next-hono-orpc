"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { AUTH_PATH } from "@/constants/paths";
import {
  forgotPasswordEmailStep,
  forgotPasswordOtpStep,
  forgotPasswordResetPasswordStep,
} from "@/features//auth/utils/forgot-password";
import {
  ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/features/auth/schemas/forgot-password";
import {
  authClient,
  getApiErrorDetail,
  isApiErrorCode,
} from "@/lib/auth-client";
import { buttonVariants } from "@workspace/ui/components/button";
import { MultipleStepForm } from "@workspace/ui/components/multiple-step-form";

type Props = {
  initialValues?: Partial<ForgotPasswordInput>;
  initialStep?: number;
};

export default function ForgotPasswordForm({
  initialValues = {
    email: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  },
  initialStep,
}: Props) {
  const handleSubmit = async (values: ForgotPasswordInput) => {
    const { error } = await authClient.emailOtp.resetPassword({
      email: values.email,
      otp: values.otp,
      password: values.newPassword,
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

  return (
    <MultipleStepForm
      steps={[
        forgotPasswordEmailStep,
        forgotPasswordOtpStep,
        forgotPasswordResetPasswordStep,
      ]}
      schema={forgotPasswordSchema}
      initialValues={initialValues}
      initialStep={initialStep}
      submitLabel="Reset password"
      onSubmit={handleSubmit}
    >
      {/* Completed Placeholder */}
      <div className="text-center space-y-6">
        <div className="bg-primary/10 inline-flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 className="text-primary h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">
          Password Reset Successfully!
        </h2>
        <p className="text-muted-foreground">
          Your password has been updated. You can now log in with your new
          password.
        </p>
        <a href={AUTH_PATH.LOGIN} className={buttonVariants()}>
          Go to Login
          <ArrowRight />
        </a>
      </div>
    </MultipleStepForm>
  );
}
