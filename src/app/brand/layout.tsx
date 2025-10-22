import type { Metadata } from "next";
import { ToastProvider } from "@/utils/ToastNotification";
import ProtectedRoute from "@/utils/ProtectedRoute";
import BrandLayout from "@/components/brand/BrandLayout";

export const metadata: Metadata = {
  title: "The•PR•God – Brand",
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
            <BrandLayout>{children}</BrandLayout>
          </ToastProvider>
        </ProtectedRoute>
      </body>
    </html>
  );
}
