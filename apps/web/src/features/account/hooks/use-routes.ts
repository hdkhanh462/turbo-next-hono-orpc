"use client";

import { LockKeyholeIcon, SettingsIcon, UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { RouteType } from "@/types/route";
import { ACCOUNT_PATH } from "@/constants/paths";

export function useAccountRoutes() {
  const pathname = usePathname();

  return useMemo<RouteType[]>(() => {
    return [
      {
        title: "Profile",
        url: ACCOUNT_PATH.PROFILE,
        icon: UserIcon,
        isActive: pathname === ACCOUNT_PATH.PROFILE,
      },
      {
        title: "Security",
        url: ACCOUNT_PATH.SECURITY,
        icon: LockKeyholeIcon,
        isActive: pathname.startsWith(ACCOUNT_PATH.SECURITY),
      },
      {
        title: "Settings",
        url: ACCOUNT_PATH.SETTINGS.GENERAL,
        icon: SettingsIcon,
        isOpen: true,
        isActive: pathname === ACCOUNT_PATH.SETTINGS.GENERAL,
        items: [
          {
            title: "Languages",
            url: ACCOUNT_PATH.SETTINGS.LANGUAGES,
          },
          {
            title: "Notifications",
            url: ACCOUNT_PATH.SETTINGS.NOTIFICATIONS,
          },
          {
            title: "Appearance",
            url: ACCOUNT_PATH.SETTINGS.APPEARANCE,
          },
        ],
      },
    ];
  }, [pathname]);
}
