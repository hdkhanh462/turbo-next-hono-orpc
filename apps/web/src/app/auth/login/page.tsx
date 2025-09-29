import { Suspense } from "react";

import LoginForm from "@/features/auth/components/login-form";
import { Card, CardContent } from "@workspace/ui/components/card";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <Card className="p-0 overflow-hidden">
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
