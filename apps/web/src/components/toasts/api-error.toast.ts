import { toast } from "sonner";

import { getApiErrorDetail, isApiErrorCode } from "@/lib/auth-client";

export default function apiErrorToast(
  code?: string,
  type: "error" | "warning" = "error"
) {
  if (isApiErrorCode(code)) {
    const errorDetail = getApiErrorDetail(code);

    switch (type) {
      case "error":
        toast.error(errorDetail.title, {
          description: errorDetail.description,
        });
        break;
      case "warning":
        toast.warning(errorDetail.title, {
          description: errorDetail.description,
        });
        break;
    }
    return true;
  }
  return false;
}
