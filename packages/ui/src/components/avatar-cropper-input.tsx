"use client";

import {
  ArrowLeftIcon,
  CameraIcon,
  CircleUserRoundIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@workspace/ui/components/cropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Slider } from "@workspace/ui/components/slider";
import {
  FileUploadOptions,
  useFileUpload,
} from "@workspace/ui/hooks/use-file-upload";
import { cn } from "@workspace/ui/lib/utils";

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number };

const DEFAULT_CROP_OPTIONS: CropOptions = {
  outputType: "image/jpeg",
  outputQuality: 0.8,
};

const DEFAULT_INPUT_OPTIONS: Pick<FileUploadOptions, "accept" | "maxSize"> = {
  accept: ".png, .jpg, .jpeg, .webp",
};

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Needed for canvas Tainted check
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  sourceType: string,
  pixelCrop: Area,
  options?: CropOptions
): Promise<Blob | null> {
  const cropOptions = {
    ...DEFAULT_CROP_OPTIONS,
    outputWidth: pixelCrop.width,
    outputHeight: pixelCrop.height,
    ...options,
  };
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    // Set canvas size to desired output size
    canvas.width = cropOptions.outputWidth;
    canvas.height = cropOptions.outputHeight;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      cropOptions.outputWidth, // Draw onto the output size
      cropOptions.outputHeight
    );

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        cropOptions.keepSourceType ? sourceType : cropOptions.outputType,
        cropOptions.keepSourceQuantity ? undefined : cropOptions.outputQuality
      );
    });
  } catch {
    return null;
  }
}

function getImageUrlMeta(url: string) {
  const fileName = url.split("/").pop();
  const extension = fileName?.split(".").pop()?.toLowerCase();
  const name = fileName?.split(".").shift()?.toLowerCase();
  if (!extension || !name) throw new Error("Invalid image URL");
  return {
    name,
    type: "image/" + extension,
  };
}

type CropOptions = {
  /**
   * The width of the cropped output image in pixels.
   */
  outputWidth?: number;
  /**
   * The height of the cropped output image in pixels.
   */
  outputHeight?: number;
  /**
   * The image MIME type for the cropped output (default: "image/jpeg").
   */
  outputType?: string;
  /**
   * The quality of the cropped image (0 to 1, default: 0.80).
   */
  outputQuality?: number;
  /**
   * Whether to keep the original image MIME type (default: false).
   */
  keepSourceType?: boolean;
  /**
   * Whether to keep the original image quantity (default: false).
   */
  keepSourceQuantity?: boolean;
};

type Props = {
  label?: string;
  className?: string;
  initialImageUrl?: string | null;
  cropOptions?: CropOptions;
  inputOptions?: Pick<FileUploadOptions, "accept" | "maxSize">;
  onImageChange?: (image: File | null) => void;
  onError?: (error: string) => void;
};

export default function AvatarCropperInput({
  label,
  className,
  initialImageUrl,
  cropOptions,
  inputOptions,
  onImageChange,
  onError,
}: Props) {
  inputOptions = { ...DEFAULT_INPUT_OPTIONS, ...inputOptions };
  const [
    { files, errors, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      // removeFile,
    },
  ] = useFileUpload({
    ...inputOptions,
    maxFiles: 1,
  });

  const fileId = files.at(0)?.id;
  const file = files.at(0)?.file;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initialCropAreaRef = useRef<Area | null>(null);

  // Ref to track the previous file ID to detect new uploads
  const previousFileIdRef = useRef<string | undefined | null>(null);

  // State to store the desired crop area in pixels
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // State for zoom level
  const [zoom, setZoom] = useState(1);

  // Callback for Cropper to provide crop data - Wrap with useCallback
  const handleCropChange = useCallback((pixels: Area | null) => {
    if (
      pixels?.width !== initialCropAreaRef.current?.width ||
      pixels?.height !== initialCropAreaRef.current?.height
    ) {
      setCroppedAreaPixels(pixels);
    }
  }, []);

  const handleApply = async () => {
    // Check if we have the necessary data
    if (!isCropChanged() || !previewUrl || !croppedAreaPixels) {
      // Remove file if apply is clicked without crop data?
      // if (fileId) {
      // removeFile(fileId);
      // setCroppedAreaPixels(null);
      // }
      return;
    }

    try {
      const { name, type } = file?.type
        ? { name: file.name, type: file.type }
        : getImageUrlMeta(initialImageUrl || "");

      // 1. Get the cropped image blob using the helper
      const croppedBlob = await getCroppedImg(
        previewUrl,
        type,
        croppedAreaPixels,
        cropOptions
      );

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.");
      }

      const newFile = new File([croppedBlob], name, {
        type: croppedBlob.type,
      });
      onImageChange?.(newFile);

      // 2. Create a NEW object URL from the cropped blob
      const newFinalUrl = URL.createObjectURL(croppedBlob);

      // 3. Revoke the OLD finalImageUrl if it exists
      if (finalImageUrl) {
        URL.revokeObjectURL(finalImageUrl);
      }

      // 4. Set the final avatar state to the NEW URL
      setFinalImageUrl(newFinalUrl);

      // 5. Close the dialog (don't remove the file yet)
      setIsDialogOpen(false);
      setCroppedAreaPixels(null);
      setZoom(1);
    } catch {
      // Close the dialog even if cropping fails
      setIsDialogOpen(false);
    }
  };

  const handleRemoveFinalImage = () => {
    if (finalImageUrl) {
      URL.revokeObjectURL(finalImageUrl);
    }
    setFinalImageUrl(null);
    setPreviewUrl(initialImageUrl || null);
    onImageChange?.(null);
  };

  const handleClick = () => {
    if (initialImageUrl) {
      setIsDialogOpen(true);
    } else {
      openFileDialog();
    }
  };

  const isCropChanged = useCallback(() => {
    if (!initialCropAreaRef.current || !croppedAreaPixels) return false;
    return (
      initialCropAreaRef.current.x !== croppedAreaPixels.x ||
      initialCropAreaRef.current.y !== croppedAreaPixels.y ||
      initialCropAreaRef.current.width !== croppedAreaPixels.width ||
      initialCropAreaRef.current.height !== croppedAreaPixels.height
    );
  }, [croppedAreaPixels]);

  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    // Cleanup function
    return () => {
      if (currentFinalUrl && currentFinalUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  // Effect to open dialog when a *new* file is ready
  useEffect(() => {
    // Check if fileId exists and is different from the previous one
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true); // Open dialog for the new file
      setCroppedAreaPixels(null); // Reset crop area for the new file
      setZoom(1); // Reset zoom for the new file
    }
    // Update the ref to the current fileId for the next render
    previousFileIdRef.current = fileId;
  }, [fileId]); // Depend only on fileId

  useEffect(() => {
    if (errors.length > 0) {
      onError?.(errors[0]);
    }
  }, [errors, onError]);

  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
    setFinalImageUrl(null);
  }, [initialImageUrl]);

  useEffect(() => {
    setPreviewUrl(files.at(0)?.preview || null);
  }, [files]);

  useEffect(() => {
    if (isDialogOpen && croppedAreaPixels && !initialCropAreaRef.current) {
      initialCropAreaRef.current = croppedAreaPixels;
    }
    if (!isDialogOpen) {
      initialCropAreaRef.current = null;
    }
  }, [isDialogOpen, croppedAreaPixels, previewUrl]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        {/* Drop area - uses finalImageUrl */}
        <button
          className={cn(
            "hover:cursor-pointer group border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none",
            className
          )}
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={finalImageUrl ? "Change image" : "Upload image"}
        >
          {finalImageUrl ? (
            <img
              className="object-cover size-full"
              src={finalImageUrl}
              alt="User avatar"
              width={64}
              height={64}
              style={{ objectFit: "cover" }}
            />
          ) : initialImageUrl ? (
            <Avatar className="size-full">
              <AvatarImage src={initialImageUrl} alt="Profile image" />
              <AvatarFallback>
                <CircleUserRoundIcon className="size-5" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="size-5" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 translate-y-1/2 rounded-b-full opacity-0 bg-gradient-to-t from-black/80 to-black/0 group-hover:translate-y-0 group-hover:opacity-100">
            <CameraIcon className="size-5" />
          </div>
        </button>
        {/* Remove button - depends on finalImageUrl */}
        {finalImageUrl && (
          <Button
            onClick={handleRemoveFinalImage}
            size="icon"
            className="absolute border-2 rounded-full shadow-none border-background focus-visible:border-background -top-1 -right-1 size-6"
            aria-label="Remove image"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}

        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
        />
      </div>

      {/* Cropper Dialog - Use isDialogOpen for open prop */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="space-y-0 text-left contents">
            <DialogTitle className="flex items-center justify-between p-4 text-base border-b">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Crop image</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={openFileDialog}>
                  Pick
                </Button>
                <Button
                  className="-my-1"
                  onClick={handleApply}
                  disabled={!previewUrl}
                  autoFocus
                >
                  Apply
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Cropper
              className="min-h-96 sm:min-h-120"
              image={previewUrl}
              zoom={zoom}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="px-4 py-6 border-t">
            <div className="flex items-center w-full gap-4 mx-auto max-w-80">
              <ZoomOutIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
              />
              <ZoomInIcon
                className="shrink-0 opacity-60"
                size={16}
                aria-hidden="true"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {label && <p className="mt-2 text-xs text-muted-foreground">{label}</p>}
    </div>
  );
}
