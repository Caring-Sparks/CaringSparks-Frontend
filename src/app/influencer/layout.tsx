import type { Metadata } from "next";
import { ToastProvider } from "@/utils/ToastNotification";
import ProtectedRoute from "@/utils/ProtectedRoute";
import InfluencerLayout from "@/components/influencer/InfluencerLayout";

export const metadata: Metadata = {
  title: "The•PR•God – Influencer",
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
