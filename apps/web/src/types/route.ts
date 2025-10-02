import { LucideIcon } from "lucide-react";

export type RouteType = {
  title: string;
  url: string;
  isActive?: boolean;
  isOpen?: boolean;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
    isActive?: boolean;
  }[];
};
