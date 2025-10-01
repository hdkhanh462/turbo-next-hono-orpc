"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import AvatarCropperInput from "@workspace/ui/components/avatar-cropper-input";
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

export default function PersonalInfoForm() {
  const { data: sessionData, isPending } = authClient.useSession();

  const { mutate } = useUploadImageMutation({
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
          onImageChange={(image) => image && mutate({ image })}
          onError={(error) => toast.error(error)}
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                placeholder="Enter your email"
                disabled
                value={sessionData?.user.email}
              />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
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
                Save
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
