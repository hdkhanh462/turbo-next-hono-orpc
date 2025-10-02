"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import AvatarCropperInput from "@/components/avatar-cropper-input";
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

import apiErrorToast from "@/components/toasts/api-error.toast";
import {
  PersonalInfoInput,
  personalInfoSchema,
} from "@/features/account/schemas/personal-info.schema";
import { useUploadImageMutation } from "@/hooks/use-upload-image-mutation";
import { authClient } from "@/lib/auth-client";
import { Label } from "@workspace/ui/components/label";
import { Loader } from "@workspace/ui/components/loader";

export default function PersonalInfoForm() {
  const { data: sessionData, isPending } = authClient.useSession();

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

  const form = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (sessionData?.user) {
      form.reset({
        name: sessionData.user.name || "",
      });
    }
  }, [sessionData, form]);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label>Email</Label>
              <div className="flex gap-2 items-center">
                <Input
                  disabled
                  placeholder="Enter your email"
                  value={sessionData?.user.email || ""}
                />
                <Button
                  type="button"
                  variant={
                    sessionData?.user.emailVerified ? "outline" : "default"
                  }
                  disabled={isPending || sessionData?.user.emailVerified}
                >
                  {sessionData?.user.emailVerified ? "Verified" : "Verify"}
                </Button>
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
      </CardContent>
    </Card>
  );
}
