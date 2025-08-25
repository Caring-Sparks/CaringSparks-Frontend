import type { Metadata } from "next";
import { ToastProvider } from "@/utils/ToastNotification";

export const metadata: Metadata = {
  title: "Caring Sparks – Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ToastProvider>
  );
}
