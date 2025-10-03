"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Loader } from "@workspace/ui/components/loader";
import { PasswordInput } from "@workspace/ui/components/password-input";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import apiErrorToast from "@/components/toasts/api-error.toast";
import { AUTH_PATH } from "@/constants/paths";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "@/features/auth/schemas/reset-password.schema";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  if (!token) {
    return (
      <div className="text-destructive font-medium">
        Invalid or missing token. Please request a new password reset.
      </div>
    );
  }

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    const { error } = await authClient.resetPassword(
      {
        token: values.token,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password reset successful", {
            description: "You can now log in with your new password.",
          });
          router.push(AUTH_PATH.LOGIN);
        },
      }
    );

    if (error) {
      const isHandled = apiErrorToast(error.code);
      if (!isHandled) {
        toast.error("Failed to reset password", {
          description: "Please try again later.",
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Enter new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Confirm new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={
            !token || form.formState.isSubmitting || !form.formState.isDirty
          }
        >
          <Loader isLoading={form.formState.isSubmitting} />
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
