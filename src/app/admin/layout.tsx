import type { Metadata } from "next";
import { ToastProvider } from "@/utils/ToastNotification";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/utils/ProtectedRoute";

export const metadata: Metadata = {
  title: "Caring Sparks – Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ProtectedRoute>
          <ToastProvider>
            <AdminLayout>{children}</AdminLayout>
          </ToastProvider>
        </ProtectedRoute>
      </body>
    </html>
  );
}
