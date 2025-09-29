import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type Routes = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive: boolean;
};

export function useRoutes(): Routes[] {
  const pathname = usePathname();

  return useMemo(() => {
    return [
      {
        title: "Home",
        url: "/",
        isActive: pathname === "/",
      },
      {
        title: "Features",
        url: "/features",
        isActive: pathname.startsWith("/features"),
      },
      {
        title: "Pricing",
        url: "/pricing",
        isActive: pathname.startsWith("/pricing"),
      },
      {
        title: "About",
        url: "/about",
        isActive: pathname.startsWith("/about"),
      },
    ];
  }, [pathname]);
}
