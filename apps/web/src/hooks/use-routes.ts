import { RouteType } from "@/types/route";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useRoutes() {
  const pathname = usePathname();

  return useMemo<RouteType[]>(() => {
    return [
      {
        title: "Home",
        url: "/",
        isActive: pathname === "/",
      },
      {
        title: "Todos",
        url: "/todos",
        isActive: pathname.startsWith("/todos"),
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
