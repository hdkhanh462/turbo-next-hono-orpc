import { cn } from "@workspace/ui/lib/utils";
import { Loader2Icon } from "lucide-react";

type Props = {
  isLoading: boolean;
  className?: string;
};

export function Loader({ isLoading, className }: Props) {
  return isLoading && <Loader2Icon className={cn("animate-spin", className)} />;
}
