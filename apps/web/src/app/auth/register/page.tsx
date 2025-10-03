import { RegisterForm } from "@/features/auth/components/register-form";
import { Card, CardContent } from "@workspace/ui/components/card";

export default function Page() {
  return (
    <div className="w-full max-w-md">
      <Card className="p-0 overflow-hidden">
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
