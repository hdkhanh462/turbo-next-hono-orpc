"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Loader } from "@workspace/ui/components/loader";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import CountDown from "@/components/count-down";
import apiErrorToast from "@/components/toasts/api-error.toast";
import { AUTH_PATH } from "@/constants/paths";
import useSendEmailCheck from "@/hooks/use-send-email-check";
import { authClient } from "@/lib/auth-client";
import { EMAIL_SCHEMA, EmailFormInput } from "@/schemas/email.schema";

export default function ForgotPasswordForm() {
  const { canSendEmail, sentEmailExp, setCanSendEmail, onSendEmail } =
    useSendEmailCheck({ type: "reset" });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<EmailFormInput>({
    resolver: zodResolver(EMAIL_SCHEMA),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: EmailFormInput) => {
    const { error } = await authClient.requestPasswordReset(
      {
        email: values.email,
        redirectTo:
          process.env.NEXT_PUBLIC_CLIENT_URL +
          AUTH_PATH.RESET_PASSWORD_REDIRECT,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          onSendEmail();
          toast.success("Password reset email sent", {
            description: "Please check your inbox and spam folder.",
          });
        },
      }
    );

    if (error) {
      const isHandled = apiErrorToast(error.code);
      if (!isHandled) {
        toast.error("Failed to send password reset email", {
          description: "Please try again later.",
        });
      }
    }
  };

  if (isSubmitted) {
    return (
      <SentSuccess
        email={form.getValues("email")}
        onBackClick={() => {
          form.reset();
          setIsSubmitted(false);
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address below to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormDescription>
                    We'll send you a link to reset your password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={
                !canSendEmail ||
                form.formState.isSubmitting ||
                !form.formState.isDirty
              }
            >
              <Loader isLoading={form.formState.isSubmitting} />
              Send Reset Link
              {!canSendEmail && sentEmailExp && (
                <span>
                  (
                  <CountDown
                    timeEnd={sentEmailExp}
                    onComplete={() => setCanSendEmail(true)}
                  />
                  )
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

type SentSuccessProps = {
  email: string;
  onBackClick?: () => void;
};

function SentSuccess({ email, onBackClick }: SentSuccessProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Reset Email Sent</CardTitle>
        <CardDescription className="text-balance">
          We've sent a password reset link to{" "}
          <span className="font-medium">{hideEmail(email)}</span>. Please check
          your inbox and spam folder.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between">
        <Button variant="secondary" onClick={onBackClick}>
          <ArrowLeftIcon />
          Not my email
        </Button>
        <Link href={AUTH_PATH.LOGIN} className={buttonVariants({})}>
          Go to Login
          <ArrowRightIcon />
        </Link>
      </CardContent>
    </Card>
  );
}

function hideEmail(email: string) {
  const [localPart, domain] = email.split("@");

  const hideText = (text: string, start: number, end: number) => {
    return text.slice(0, start) + "*".repeat(end - start) + text.slice(end);
  };

  if (localPart.length <= 6) {
    return `${hideText(localPart, 1, localPart.length - 1)}@${domain}`;
  }
  return `${hideText(localPart, 3, localPart.length - 3)}@${domain}`;
}
