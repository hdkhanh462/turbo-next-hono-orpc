import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useState } from "react";

import {
  UploadImageError,
  UploadImageInput,
  UploadImageOutput,
} from "@/schemas/upload.schema";

type Props = {
  signal?: AbortSignal;
  onSuccess?: (data: UploadImageOutput) => void;
  onError?: (error: AxiosError<UploadImageError>) => void;
};

export const useUploadImageMutation = ({
  signal,
  onSuccess,
  onError,
}: Props = {}) => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<
    UploadImageOutput,
    AxiosError<UploadImageError>,
    UploadImageInput
  >({
    mutationKey: ["upload", "image"],
    mutationFn: async (input) => {
      const res = await axios.post<UploadImageOutput>(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/upload/image`,
        { image: input.image },
        {
          signal,
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (ev) =>
            ev.total && setProgress(Math.round((ev.loaded * 100) / ev.total)),
        }
      );
      return res.data;
    },
    onSuccess,
    onError,
  });

  return { ...mutation, progress };
};
