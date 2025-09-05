import type { Metadata } from "next";
import { ToastProvider } from "@/utils/ToastNotification";
import ProtectedRoute from "@/utils/ProtectedRoute";
import InfluencerLayout from "@/components/influencer/InfluencerLayout";

export const metadata: Metadata = {
  title: "Caring Sparks – Influencer",
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
            <InfluencerLayout>{children}</InfluencerLayout>
          </ToastProvider>
        </ProtectedRoute>
      </body>
    </html>
  );
}
