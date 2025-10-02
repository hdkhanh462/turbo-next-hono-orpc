import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

import { AUTH_PATH } from "@/constants/paths";
import { authClient } from "@/lib/auth-client";

export default async function Layout({ children }: PropsWithChildren) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data) {
    redirect(AUTH_PATH.LOGIN);
  }

  return children;
}
