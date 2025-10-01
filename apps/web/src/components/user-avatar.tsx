import { UserIcon } from "lucide-react";
import Image from "next/image";
import { ReactNode, Suspense } from "react";

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";

import { User } from "@/lib/auth-client";

type Props = {
  user: User;
  size?: number;
  className?: string;
  fallback?: ReactNode;
};

export default function UserAvatar({
  user,
  size = 32,
  className,
  fallback,
}: Props) {
  return (
    <Avatar className={className}>
      <Suspense
        fallback={
          <AvatarFallback>
            {fallback ? fallback : <UserIcon className="size-4" />}
          </AvatarFallback>
        }
      >
        <Image
          src={user.image || ""}
          alt="User Avatar"
          width={size}
          height={size}
        />
      </Suspense>
    </Avatar>
  );
}
