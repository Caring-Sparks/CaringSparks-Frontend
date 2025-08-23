import { Suspense } from "react";
import ResetPasswordForm from "@/components/home/extras/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
