"use client";

import { UserIcon } from "lucide-react";

import UserDropdownContent from "@/components/user-dropdown-content";
import { authClient } from "@/lib/auth-client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";

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
          <Avatar>
            <AvatarImage
              src={sessionData.user.image || ""}
              alt="Profile image"
            />
            <AvatarFallback>
              <UserIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <UserDropdownContent user={sessionData.user} />
    </DropdownMenu>
  );
}
