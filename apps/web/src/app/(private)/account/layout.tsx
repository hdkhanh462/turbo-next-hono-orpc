import { PropsWithChildren } from "react";

import { AccountSidebar } from "@/features/account/components/sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AccountSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
