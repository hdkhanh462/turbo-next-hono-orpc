import { Suspense } from "react";

import LoginForm from "@/features/auth/components/login-form";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <Suspense fallback={<Skeleton className="w-full h-[516px]" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
