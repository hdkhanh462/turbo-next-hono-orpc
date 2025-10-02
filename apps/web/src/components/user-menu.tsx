"use client";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";

import UserAvatar from "@/components/user-avatar";
import UserDropdownContent from "@/components/user-dropdown-content";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const { data: sessionData, isPending } = authClient.useSession();

  if (isPending) return <Skeleton className="size-8 rounded-full" />;

  if (!sessionData) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full p-0 hover:bg-transparent"
        >
          <UserAvatar user={sessionData?.user} />
        </Button>
      </DropdownMenuTrigger>
      <UserDropdownContent user={sessionData.user} />
    </DropdownMenu>
  );
}
