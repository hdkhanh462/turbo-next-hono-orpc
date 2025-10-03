"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Loader } from "@workspace/ui/components/loader";

import AvatarCropperInput from "@/components/avatar-cropper-input";
import CountDown, { CountDownRef } from "@/components/count-down";
import apiErrorToast from "@/components/toasts/api-error.toast";
import { ACCOUNT_PATH } from "@/constants/paths";
import {
  PersonalInfoInput,
  personalInfoSchema,
} from "@/features/account/schemas/personal-info.schema";
import useSendEmailCheck from "@/hooks/use-send-email-check";
import { useUploadImageMutation } from "@/hooks/use-upload-image-mutation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@workspace/ui/lib/utils";

type Props = {
  verifyEmailCallbackURL?: string;
};

export default function PersonalInfoForm({
  verifyEmailCallbackURL = ACCOUNT_PATH.PROFILE,
}: Props) {
  const { data: sessionData } = authClient.useSession();

  const { mutate, isPending: isUploadImagePending } = useUploadImageMutation({
    async onSuccess(output) {
      await authClient.updateUser(
        { image: output.fileUrl },
        {
          onSuccess: () => {
            toast.success("Avatar updated successfully");
          },
        }
      );
    },
    onError(error) {
      toast.error("Invalid file upload", {
        description: error.response?.data?.error,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarCropperInput
          className="size-24"
          initialImageUrl={sessionData?.user.image}
          cropOptions={{ outputType: "image/webp" }}
          disabled={isUploadImagePending}
          onImageChange={(image) => image && mutate({ image })}
          onError={(error) => toast.error(error)}
        />
        <UpdateInfoForm verifyEmailCallbackURL={verifyEmailCallbackURL} />
      </CardContent>
    </Card>
  );
}

type UpdateInfoFormProps = {
  verifyEmailCallbackURL?: string;
};

function UpdateInfoForm({ verifyEmailCallbackURL }: UpdateInfoFormProps) {
  const { data: sessionData, isPending } = authClient.useSession();

  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
    },
  });
  async function onSubmit(values: PersonalInfoInput) {
    const { error } = await authClient.updateUser(
      { ...values },
      {
        onSuccess: () => {
          toast.success("Personal information updated successfully");
          form.reset(values);
        },
      }
    );
    if (error) {
      apiErrorToast(error.code);
      throw new Error(error.message);
    }
  }

  useEffect(() => {
    if (sessionData?.user) {
      form.reset({
        name: sessionData.user.name || "",
      });
    }
  }, [sessionData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-2 group">
          <div className="flex gap-2 items-center">
            <Label>Email</Label>
            <Badge
              variant="outline"
              className={cn(
                "leading-none",
                sessionData?.user.emailVerified
                  ? "border-green-500 text-green-500"
                  : "border-destructive text-destructive"
              )}
            >
              {sessionData?.user.emailVerified ? "Verified" : "Unverified"}
            </Badge>
            {!sessionData?.user.emailVerified && (
              <VerifyEmailButton
                className="text-sm ms-auto leading-none font-medium"
                callbackURL={verifyEmailCallbackURL}
              />
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              disabled
              placeholder="Enter your email"
              value={sessionData?.user.email || ""}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              isPending ||
              form.formState.isSubmitting ||
              !form.formState.isDirty
            }
          >
            <Loader isLoading={form.formState.isSubmitting} />
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

type VerifyEmailButtonProps = {
  callbackURL?: string;
  className?: string;
};

function VerifyEmailButton({ callbackURL, className }: VerifyEmailButtonProps) {
  const {
    data: sessionData,
    isPending: isSessionPending,
    refetch,
  } = authClient.useSession();
  const { canSendEmail, sentEmailExp, setCanSendEmail, onSendEmail } =
    useSendEmailCheck();
  const [isPending, startTransition] = useTransition();
  const countDownRef = useRef<CountDownRef>(null);

  const handleResend = () => {
    startTransition(async () => {
      await authClient.sendVerificationEmail(
        {
          email: sessionData?.user.email || "",
          callbackURL: callbackURL
            ? process.env.NEXT_PUBLIC_CLIENT_URL + callbackURL
            : undefined,
        },
        {
          onSuccess: () => {
            onSendEmail();
            toast.success("Verification email sent successfully", {
              description:
                "Please check your inbox and spam folder. The link may take a few minutes to arrive.",
            });
          },
          onError: (error) => {
            refetch();
            apiErrorToast(error.error.code);
          },
        }
      );
    });
  };

  return (
    <button
      type="button"
      className={cn(
        className,
        isSessionPending ||
          sessionData?.user.emailVerified ||
          !canSendEmail ||
          isPending
          ? "hover:cursor-not-allowed"
          : "hover:underline hover:cursor-pointer"
      )}
      disabled={
        isSessionPending ||
        sessionData?.user.emailVerified ||
        !canSendEmail ||
        isPending
      }
      onClick={handleResend}
    >
      Resend{" "}
      {!sessionData?.user.emailVerified && !canSendEmail && sentEmailExp && (
        <span>
          (
          <CountDown
            ref={countDownRef}
            timeEnd={sentEmailExp}
            onComplete={() => {
              setCanSendEmail(true);
            }}
          />
          )
        </span>
      )}
    </button>
  );
}
