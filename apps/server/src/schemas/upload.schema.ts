import z from "zod";

const VALID_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const MAX_IMAGE_SIZE_MB = 2;

export const UPLOAD_IMAGE_SCHEMA = z.object({
  image: z
    .instanceof(File)
    .refine((file) => VALID_IMAGE_MIME_TYPES.includes(file.type), {
      message: `Invalid file type, only ${VALID_IMAGE_MIME_TYPES.join(
        ", "
      )} are allowed`,
    })
    .refine((file) => file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024, {
      message: `File exceeds the maximum size of ${MAX_IMAGE_SIZE_MB}MB`,
    }),
});

export const UPLOAD_IMAGE_OUTPUT_SCHEMA = z.object({
  originalName: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  size: z.number().min(1),
  fileUrl: z.string().min(1),
});

export type UploadImageInput = z.infer<typeof UPLOAD_IMAGE_SCHEMA>;
export type UploadImageOutput = z.infer<typeof UPLOAD_IMAGE_OUTPUT_SCHEMA>;

export type UploadImageError = {
  code: string;
  message: string;
  error: string;
};
