"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
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

import apiErrorToast from "@/components/toasts/api-error.toast";
import { AUTH_PATH } from "@/constants/paths";
import SocialAuthSelector from "@/features/auth/components/social-auth-seletor";
import {
  RegisterInput,
  registerSchema,
} from "@/features/auth/schemas/auth.schema";
import { authClient } from "@/lib/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      const { error } = await authClient.signUp.email({
        ...values,
      });

      if (error) {
        apiErrorToast(error.code);
        throw new Error(error.message);
      }
      router.push(AUTH_PATH.LOGIN);
      toast.success("Account registed successfully");
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-6">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground text-balance">
              Register for a (App_Name) account
            </p>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-1 animate-spin" />}
            Register
          </Button>
          <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="relative z-10 px-2 bg-card text-muted-foreground">
              Or continue with
            </span>
          </div>
          <SocialAuthSelector />
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link href={AUTH_PATH.LOGIN} className="font-medium underline">
              Login
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
