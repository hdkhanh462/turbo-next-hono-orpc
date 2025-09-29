"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AUTH_PATH } from "@/constants/paths";
import SocialAuthSelector from "@/features/auth/components/social-auth-seletor";
import VerifyEmailForm from "@/features/auth/components/verify-email-form";
import { LoginInput, loginSchema } from "@/features/auth/schemas/auth.schema";
import { handleResendClick } from "@/features/auth/utils/email";
import {
  authClient,
  getApiErrorDetail,
  isApiErrorCode,
} from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { PasswordInput } from "@workspace/ui/components/password-input";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isEmailVerified, setIsEmailVerified] = useState(true);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        ...values,
      });

      if (isApiErrorCode(error?.code)) {
        form.setValue("password", "");

        if (error.code === "EMAIL_NOT_VERIFIED") {
          await handleResendClick({ email: values.email });
          setIsEmailVerified(false);
        }

        const errorDetail = getApiErrorDetail(error?.code);
        toast.error(errorDetail.title, {
          description: errorDetail.description,
        });
        return;
      }
      router.push(
        nextPath?.startsWith("/") ? nextPath : AUTH_PATH.LOGIN_REDIRECT
      );
      toast("👋 Wellcome back!");
    });
  }

  if (!isEmailVerified) {
    return (
      <VerifyEmailForm
        initialValues={{ email: form.getValues("email"), otp: "" }}
        initialStep={1}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-6">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground text-balance">
              Login to your Next Chat App account
            </p>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="shadcn@example.com"
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href={AUTH_PATH.FORGOT_PASSWORD}
                    className="ml-auto text-sm leading-none font-medium hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Remember Me</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-1 animate-spin" />}
            Login
          </Button>

          <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="relative z-10 px-2 bg-card text-muted-foreground">
              Or continue with
            </span>
          </div>
          <SocialAuthSelector />
          <div className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link href={AUTH_PATH.REGISTER} className="font-medium underline">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
